import { useEffect, useState } from "react";
import { db } from "../db/dexie";

const Workouts = () => {
    const [workouts, setWorkouts] = useState([]);
    const [setsByWorkout, setSetsByWorkout] = useState({});
    const [loading, setLoading] = useState(true);
    const [editingWorkoutId, setEditingWorkoutId] = useState(null);
    const [editSets, setEditSets] = useState([]);
    const [noteByWorkout, setNoteByWorkout] = useState({});
    const [showNote, setShowNote] = useState({});
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
        setShowNote(prev => ({ ...prev, [workoutId]: true }));
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
        // Save note and update date to today automatically
        if (editingWorkoutId) {
            await db.workouts.update(editingWorkoutId, {
                note: noteByWorkout[editingWorkoutId],
                date: new Date().toISOString().slice(0, 10)
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
        setShowNote({});
        setEditDate("");
    };

    if (loading) return <div className="text-gray-300">Loading...</div>;
    if (!workouts.length) return <div className="text-gray-500"><h2 className="text-2xl text-green-400 text-center font-bold mb-4">No Workouts</h2></div>;

    // Helper to format yyyy-mm-dd to dd.mm.yyyy
    const formatFinnishDate = (isoDate) => {
        if (!isoDate) return "";
        const [year, month, day] = isoDate.split("-");
        return `${day}.${month}.${year}`;
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-green-400 text-center">Workout History</h2>
            {workouts.map(w => (
                <div key={w.id} className="bg-gray-900 rounded-xl shadow p-4 border border-gray-700 mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <button
                            className="bg-red-600 hover:bg-red-500 text-white rounded px-2 py-1 text-xs shadow"
                            onClick={() => setConfirmDeleteId(w.id)}
                            type="button"
                        >Delete</button>
                        {confirmDeleteId && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                                <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-600 max-w-xs w-full text-center">
                                    <h3 className="text-lg font-bold text-red-400 mb-4">Are you sure you want to delete this workout?</h3>
                                    <div className="flex justify-center gap-4 mt-2">
                                        <button
                                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded shadow"
                                            onClick={() => handleDeleteWorkout(confirmDeleteId)}
                                        >Yes, Delete</button>
                                        <button
                                            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded shadow"
                                            onClick={() => setConfirmDeleteId(null)}
                                        >Cancel</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="font-bold text-green-400 text-lg">{formatFinnishDate(w.date)} </div>

                        {editingWorkoutId === w.id ? null : (
                            <div className="text-gray-500 text-sm flex gap-2">
                                <button
                                    className="text-xs px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded shadow"
                                    onClick={() => handleEdit(w.id)}
                                >Edit</button>

                            </div>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-separate border-spacing-y-2">
                            <thead>
                                <tr className="bg-gray-800 text-green-300">
                                    <th className="px-3 py-2 rounded-tl-lg">Exercise</th>
                                    <th className="px-3 py-2">Sets</th>
                                    <th className="px-3 py-2">Reps</th>
                                    <th className="px-3 py-2">Weight</th>
                                    {editingWorkoutId === w.id && <th className="px-3 py-2 rounded-tr-lg">Delete</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {editingWorkoutId === w.id
                                    ? editSets.map((s, i) => (
                                        <tr key={s.id ? `id-${s.id}` : `new-${i}`} className="bg-gray-700 hover:bg-gray-600 transition-colors">
                                            <td className="px-3 py-2 text-center align-middle">
                                                <input
                                                    className={`bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 ${focusedExerciseIdx === i ? 'w-44 md:w-56' : 'w-full md:w-32'}`}
                                                    value={s.exercise}
                                                    onChange={e => handleInputChange(i, 'exercise', e.target.value)}
                                                    onFocus={() => setFocusedExerciseIdx(i)}
                                                    onBlur={() => setFocusedExerciseIdx(null)}
                                                    required
                                                />
                                            </td>
                                            <td className="px-1 py-2 text-center align-middle">
                                                <input
                                                    className="bg-gray-800 border border-gray-600 rounded px-1 py-1 text-white w-8 md:w-11 focus:outline-none focus:ring-2 focus:ring-green-400 text-center"
                                                    type="number"
                                                    min="0"
                                                    value={s.sets}
                                                    onChange={e => handleInputChange(i, 'sets', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td className="px-1 py-2 text-center align-middle">
                                                <input
                                                    className="bg-gray-800 border border-gray-600 rounded px-1 py-1 text-white w-8 md:w-11 focus:outline-none focus:ring-2 focus:ring-green-400 text-center"
                                                    type="number"
                                                    min="0"
                                                    value={s.reps}
                                                    onChange={e => handleInputChange(i, 'reps', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td className="px-1 py-2 text-center align-middle">
                                                <input
                                                    className="bg-gray-800 border border-gray-600 rounded px-1 py-1 text-white w-8 md:w-11 focus:outline-none focus:ring-2 focus:ring-green-400 text-center"
                                                    type="number"
                                                    min="0"
                                                    value={s.weight}
                                                    onChange={e => handleInputChange(i, 'weight', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-1 py-2 text-center align-middle">
                                                <button
                                                    className="bg-red-600 hover:bg-red-500 text-white rounded px-1 py-1 text-xs shadow w-6 md:w-8"
                                                    type="button"
                                                    onClick={() => handleDeleteSet(s.id)}
                                                >X</button>
                                            </td>
                                        </tr>
                                    ))
                                    : setsByWorkout[w.id]?.map((s, i) => (
                                        <tr key={s.id ? `id-${s.id}` : `new-${i}`} className="bg-gray-800 hover:bg-gray-700 transition-colors">
                                            <td className="px-3 py-2 text-center">{s.exercise}</td>
                                            <td className="px-3 py-2 text-center">{s.sets}</td>
                                            <td className="px-3 py-2 text-center">{s.reps}</td>
                                            <td className="px-3 py-2 text-center">{s.weight}</td>

                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                    {(showNote[w.id] || (!!workouts.find(wo => wo.id === w.id)?.note && editingWorkoutId !== w.id)) && (
                        <div className="mt-2">
                            {editingWorkoutId === w.id ? (
                                <textarea
                                    className="w-full min-h-[60px] bg-gray-800 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    placeholder="Add a note for this workout..."
                                    value={noteByWorkout[w.id] || ""}
                                    onChange={e => setNoteByWorkout(prev => ({ ...prev, [w.id]: e.target.value }))}
                                />
                            ) : (
                                <div className="w-full min-h-[60px] bg-gray-800 border border-gray-600 rounded p-2 text-white text-left whitespace-pre-wrap">
                                    {workouts.find(wo => wo.id === w.id)?.note || <span className="text-gray-400 italic">No note for this workout.</span>}
                                </div>
                            )}
                        </div>
                    )}
                    {editingWorkoutId === w.id ? (
                        <div className="flex flex-col gap-2 mt-4 text-center">
                            <div className="flex flex-wrap justify-center gap-2">
                                <button
                                    className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded shadow"
                                    onClick={handleSave}
                                >Save</button>
                                <button
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded shadow"
                                    onClick={handleCancel}
                                >Cancel</button>
                                <button
                                    className="px-2 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded shadow"
                                    type="button"
                                    onClick={handleAddRow}
                                >Add Row</button>
                                <button
                                    className="px-2 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded shadow"
                                    type="button"
                                    onClick={() => setShowNote(prev => ({ ...prev, [w.id]: !showNote[w.id] }))}
                                >{showNote[w.id] ? 'Hide Note' : 'Add Note'}</button>
                            </div>
                        </div>
                    ) : null}

                </div>
            ))}
        </div>
    );
};

export default Workouts;