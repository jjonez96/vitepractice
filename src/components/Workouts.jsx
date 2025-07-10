import { useEffect, useState } from "react";
import { db } from "../db/dexie";

const Workouts = () => {
    const [workouts, setWorkouts] = useState([]);
    const [setsByWorkout, setSetsByWorkout] = useState({});
    const [loading, setLoading] = useState(true);
    const [editingWorkoutId, setEditingWorkoutId] = useState(null);
    const [editSets, setEditSets] = useState([]);
    const [noteByWorkout, setNoteByWorkout] = useState({});
    const [editDate, setEditDate] = useState("");
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const ws = await db.workouts.orderBy('date').reverse().toArray();
            const data = await db.data.toArray();
            const setsMap = {};
            ws.forEach(w => {
                setsMap[w.id] = data.filter(s => s.workoutId === w.id);
            });
            setWorkouts(ws);
            setSetsByWorkout(setsMap);
            setLoading(false);
        };
        fetchData();
    }, []);

    // Start editing a workout
    const handleEdit = (workoutId) => {
        setEditingWorkoutId(workoutId);
        setEditSets(setsByWorkout[workoutId]?.map(s => ({ ...s })) || []);
        // Load note for this workout (date will be set automatically on save)
        const workout = workouts.find(w => w.id === workoutId);
        setNoteByWorkout(prev => ({ ...prev, [workoutId]: workout?.note || "" }));
        setEditDate(workout?.date || "");
    };

    // Cancel editing
    const handleCancel = () => {
        setEditingWorkoutId(null);
        setEditSets([]);
        setEditDate("");
    };

    // Track which exercise input is focused
    const [focusedExerciseIdx, setFocusedExerciseIdx] = useState(null);

    // Handle input change
    const handleInputChange = (idx, field, value) => {
        setEditSets(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
    };

    // Delete a set from editSets
    const handleDeleteSet = (setId) => {
        setEditSets(prev => prev.filter(s => s.id !== setId));
    };

    // Add a new row to editSets
    const handleAddRow = () => {
        setEditSets(prev => ([...prev, { exercise: "", reps: "", sets: "", weight: "" }]));
    };

    // Delete a whole workout (all sets and the workout entry)
    const handleDeleteWorkout = async (workoutId) => {
        // Delete all sets for this workout
        const setsToDelete = setsByWorkout[workoutId] || [];
        for (const s of setsToDelete) {
            await db.data.delete(s.id);
        }
        // Delete the workout itself
        await db.workouts.delete(workoutId);
        // Refresh data
        const ws = await db.workouts.orderBy('date').reverse().toArray();
        const data = await db.data.toArray();
        const setsMap = {};
        ws.forEach(w => {
            setsMap[w.id] = data.filter(s => s.workoutId === w.id);
        });
        setWorkouts(ws);
        setSetsByWorkout(setsMap);
        setEditingWorkoutId(null);
        setEditSets([]);
        setConfirmDeleteId(null);
    };

    const handleSave = async () => {
        for (const s of editSets) {
            if (!s.exercise || s.reps === "" || s.sets === "" || s.weight === "") {
                alert("All fields must be filled in.");
                return;
            }
            if (Number(s.reps) < 0 || Number(s.sets) < 0 || Number(s.weight) < 0) {
                alert("Negative numbers are not allowed.");
                return;
            }
        }
        for (const s of editSets) {
            if (s.id) {
                await db.data.update(s.id, {
                    exercise: s.exercise,
                    reps: Number(s.reps),
                    sets: Number(s.sets),
                    weight: Number(s.weight)
                });
            } else {
                // New row, add to DB
                await db.data.add({
                    exercise: s.exercise,
                    reps: Number(s.reps),
                    sets: Number(s.sets),
                    weight: Number(s.weight),
                    workoutId: editingWorkoutId
                });
            }
        }
        // Save note and update date to the selected value
        if (editingWorkoutId) {
            await db.workouts.update(editingWorkoutId, {
                note: noteByWorkout[editingWorkoutId],
                date: editDate || new Date().toISOString().slice(0, 10)
            });
        }
        const ws = await db.workouts.orderBy('date').reverse().toArray();
        const data = await db.data.toArray();
        const setsMap = {};
        ws.forEach(w => {
            setsMap[w.id] = data.filter(s => s.workoutId === w.id);
        });
        setWorkouts(ws);
        setSetsByWorkout(setsMap);
        setEditingWorkoutId(null);
        setEditSets([]);
        setNoteByWorkout({});
        setEditDate("");
    };

    if (loading) return <div className="text-gray-300 text-center">Ladataan...</div>;
    if (!workouts.length) return <div className="text-gray-500"><h2 className="text-2xl text-green-400 text-center font-bold mb-4">Ei merkattuja treenejä</h2></div>;

    // Helper to format yyyy-mm-dd to dd.mm.yyyy
    const formatFinnishDate = (isoDate) => {
        if (!isoDate) return "";
        const [year, month, day] = isoDate.split("-");
        return `${day}.${month}.${year}`;
    };
    return (
        <div className="max-w-2xl mx-auto mt-8 bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-green-400 text-center">Treenit</h2>
            {workouts.map(w => (
                <div key={w.id} className="bg-gray-900 rounded-xl shadow p-3 border border-gray-700 mb-6">
                    <div className="flex justify-between items-center mb-3">
                        {editingWorkoutId !== w.id ? null :
                            <button
                                className="bg-red-600 hover:bg-red-500 text-white rounded px-2 py-1 text-xs shadow"
                                onClick={() => setConfirmDeleteId(w.id)}
                                type="button"
                            >Poista</button>}
                        {confirmDeleteId && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                                <div className="bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-600 max-w-xs w-full text-center">
                                    <h3 className="text-lg font-bold  mb-2">Haluatko poistaa tämän treenin?</h3>
                                    <div className="flex justify-center gap-4 mt-2">
                                        <button
                                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded shadow text-sm"
                                            onClick={() => handleDeleteWorkout(confirmDeleteId)}
                                        >Kyllä</button>
                                        <button
                                            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded shadow text-sm"
                                            onClick={() => setConfirmDeleteId(null)}
                                        >Peruuta</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {editingWorkoutId === w.id ? (
                            <>
                                <input
                                    type="date"
                                    className="font-bold text-green-400 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-center text-sm w-36 focus:outline-none focus:ring-2 focus:ring-green-400"
                                    value={editDate}
                                    onChange={e => setEditDate(e.target.value)}
                                    style={{ minWidth: 120 }}
                                />

                            </>
                        ) : (
                            <div className="font-bold text-green-400 flex items-center justify-center text-center text-sm">{formatFinnishDate(w.date)} </div>
                        )}
                        {editingWorkoutId === w.id ?
                            <button
                                className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded shadow"
                                onClick={handleCancel}
                            >Peruuta
                            </button>
                            : (
                                <div className="text-gray-500 text-sm flex gap-2">
                                    <button
                                        className="text-xs px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded shadow"
                                        onClick={() => handleEdit(w.id)}
                                    >Muokkaa</button>
                                </div>
                            )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs table-auto ">
                            <thead>
                                <tr className="bg-gray-800 text-green-300 border-b border-gray-700">
                                    <th className="py-2 rounded-tl-lg">Liike</th>
                                    <th className="py-2">Sarjat</th>
                                    <th className="py-2">Toistot</th>
                                    {editingWorkoutId === w.id ? <th className="py-2">Paino</th> : <th className="py-2 rounded-tr-lg">Paino</th>}
                                    {editingWorkoutId === w.id && <th className="py-2 rounded-tr-lg"></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {editingWorkoutId === w.id
                                    ? editSets.map((s, i) => (
                                        <tr key={s.id ? `id-${s.id}` : `new-${i}`} className="bg-gray-700 hover:bg-gray-600 transition-colors border-b border-gray-700">
                                            <td className="px-2 py-1 text-center align-middle">
                                                <input
                                                    className={`bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 ${focusedExerciseIdx === i ? 'w-44 md:w-56' : 'w-full md:w-32'}`}
                                                    value={s.exercise}
                                                    onChange={e => handleInputChange(i, 'exercise', e.target.value)}
                                                    onFocus={() => setFocusedExerciseIdx(i)}
                                                    onBlur={() => setFocusedExerciseIdx(null)}
                                                    required
                                                />
                                            </td>
                                            <td className="py-1 text-center align-middle">
                                                <input
                                                    className="bg-gray-800 border border-gray-600 rounded  py-1 text-white w-9 md:w-11 focus:outline-none focus:ring-2 focus:ring-green-400 text-center"
                                                    type="number"
                                                    min="0"
                                                    value={s.sets}
                                                    onChange={e => handleInputChange(i, 'sets', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td className="py-1 text-center align-middle">
                                                <input
                                                    className="bg-gray-800 border border-gray-600 rounded  py-1 text-white w-9 md:w-11 focus:outline-none focus:ring-2 focus:ring-green-400 text-center"
                                                    type="number"
                                                    min="0"
                                                    value={s.reps}
                                                    onChange={e => handleInputChange(i, 'reps', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td className="py-1 text-center align-middle">
                                                <input
                                                    className="bg-gray-800 border border-gray-600 rounded  py-1 text-white w-9 md:w-11 focus:outline-none focus:ring-2 focus:ring-green-400 text-center"
                                                    type="number"
                                                    min="0"
                                                    value={s.weight}
                                                    onChange={e => handleInputChange(i, 'weight', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-1 py-1 text-center align-middle">
                                                <button
                                                    className="text-red-400 font-bold rounded px-1 py-1 w-4 md:w-8"
                                                    type="button"
                                                    onClick={() => handleDeleteSet(s.id)}
                                                >X</button>
                                            </td>
                                        </tr>
                                    ))
                                    : setsByWorkout[w.id]?.map((s, i) => (
                                        <tr key={s.id ? `id-${s.id}` : `new-${i}`} className="bg-gray-800 hover:bg-gray-700 transition-colors border-b border-gray-700">
                                            <td className="px-4 py-3 text-center">{s.exercise}</td>
                                            <td className="px-4 py-3 text-center">{s.sets}</td>
                                            <td className="px-4 py-3 text-center">{s.reps}</td>
                                            <td className="px-4 py-3 text-center">{s.weight === 0 ? '-' : s.weight}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                    {editingWorkoutId === w.id && (
                        <div className="flex justify-start">
                            <button
                                className="text-green-400 underline mt-2 mb-1 text-sm"
                                type="button"
                                onClick={handleAddRow}
                            >Lisää liike+
                            </button>
                        </div>
                    )}
                    {editingWorkoutId !== w.id && (w.note) && (
                        <div className="mt-2">
                            <div className="w-full min-h-[60px] bg-gray-800 border border-gray-600 rounded p-2 text-sm text-white text-left whitespace-pre-wrap">
                                {w.note}
                            </div>
                        </div>
                    )}
                    {editingWorkoutId === w.id && (
                        <div className="mt-2">
                            <textarea
                                className="w-full min-h-[60px] bg-gray-800 border border-gray-600 rounded p-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                placeholder="Lisää muistiinpano tähän..."
                                value={noteByWorkout[w.id]}
                                onChange={e => setNoteByWorkout(prev => ({ ...prev, [w.id]: e.target.value }))}
                            />
                        </div>
                    )}
                    {editingWorkoutId === w.id ? (
                        <div className="mt-2">
                            <div className="flex-1 flex justify-center">
                                <button
                                    className="bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg font-bold w-full"
                                    onClick={handleSave}
                                >Tallenna
                                </button>
                            </div>
                        </div>
                    ) : null}

                </div>
            ))}
        </div>
    );
};

export default Workouts;