import { useEffect, useState } from "react";
import { db } from "../db/dexie";
import { saveWorkout, refreshWorkoutData } from "../utils/workoutUtils";
import ExerciseSelector from "./ExerciseSelector";
import ExerciseInputs from "./ExerciseInputs";
import NewExercise from "./NewExercise";
import Toast from "./Toast";
import { useToast } from "../hooks/useToast";
import { useExerciseDropdown } from "../hooks/useExerciseDropdown";
import { Trash2, Edit3, X, Save, CalendarArrowUp, CalendarArrowDown, NotebookPen } from "lucide-react";

const Workouts = () => {
    const [workouts, setWorkouts] = useState([]);
    const [setsByWorkout, setSetsByWorkout] = useState({});
    const [loading, setLoading] = useState(true);
    const [editingWorkoutId, setEditingWorkoutId] = useState(null);
    const [editSets, setEditSets] = useState([]);
    const [editingRowIdx, setEditingRowIdx] = useState(null); // Track which row is being edited
    const [noteByWorkout, setNoteByWorkout] = useState({});
    const [editDate, setEditDate] = useState("");
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for newest first, 'asc' for oldest first
    const [showNoteForWorkout, setShowNoteForWorkout] = useState(null); // Track which workout has note visible

    // Toast notifications
    const { toast, showToast, hideToast } = useToast();

    // Use the dropdown hook for exercise selection in edit mode
    const {
        dropdownIdx,
        search,
        exercises,
        handleDropdown,
        handleSelectExercise,
        handleSearchChange,
        inputRefs
    } = useExerciseDropdown(editSets, setEditSets, false); // Don't save to localStorage when editing

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { workouts: ws, setsByWorkout: setsMap } = await refreshWorkoutData();
            setWorkouts(ws);
            setSetsByWorkout(setsMap);
            setLoading(false);
        };
        fetchData();
    }, []);

    // Start editing a workout
    const handleEdit = (workoutId) => {
        setEditingWorkoutId(workoutId);
        const currentSets = setsByWorkout[workoutId]?.map(s => ({ ...s })) || [];
        // If no sets exist, add an empty one to start with
        if (currentSets.length === 0) {
            currentSets.push({ exercise: "", reps: 8, sets: 2, weight: "" });
        }
        setEditSets(currentSets);
        setEditingRowIdx(null); // Reset row editing when starting workout edit
        // Load note for this workout (date will be set automatically on save)
        const workout = workouts.find(w => w.id === workoutId);
        setNoteByWorkout(prev => ({ ...prev, [workoutId]: workout?.note || "" }));
        setEditDate(workout?.date || "");

        // If note has content, keep it open when editing
        if (workout?.note && workout.note.trim() !== "") {
            setShowNoteForWorkout(workoutId);
        }
    };

    // Handle clicking on a table row to edit that specific exercise
    const handleRowClick = (rowIdx) => {
        if (editingWorkoutId) {
            setEditingRowIdx(editingRowIdx === rowIdx ? null : rowIdx);
        }
    };

    // Cancel editing
    const handleCancel = () => {
        setEditingWorkoutId(null);
        setEditSets([]);
        setEditingRowIdx(null);
        setEditDate("");
        setShowNoteForWorkout(null);
    };

    // Toggle note visibility
    const toggleNote = (workoutId) => {
        setShowNoteForWorkout(prev => prev === workoutId ? null : workoutId);
    };

    // Handle input change
    const handleSetChange = (idx, field, value) => {
        setEditSets(prev => {
            const newData = prev.map((s, i) => i === idx ? { ...s, [field]: value } : s);
            return newData;
        });
    };

    // Delete a set from editSets
    const handleDeleteSet = (idx) => {
        setEditSets(prev => {
            const newSets = prev.filter((_, i) => i !== idx);
            // If no sets remain, add an empty one to continue editing
            if (newSets.length === 0) {
                newSets.push({ exercise: "", reps: 8, sets: 2, weight: "" });
                // Auto-select the newly created empty row
                setTimeout(() => setEditingRowIdx(0), 0);
            } else {
                // Look for the first empty row (no exercise name) and auto-select it
                const emptyRowIdx = newSets.findIndex(set => !set.exercise || set.exercise.trim() === "");
                if (emptyRowIdx !== -1) {
                    setTimeout(() => setEditingRowIdx(emptyRowIdx), 0);
                } else {
                    setEditingRowIdx(null); // No empty rows, close editing
                }
            }
            return newSets;
        });
    };

    // Add a new row to editSets
    const handleAddRow = () => {
        setEditSets(prev => {
            const newSets = [...prev, { exercise: "", reps: 8, sets: 2, weight: "" }];
            setEditingRowIdx(newSets.length - 1); // Automatically select the new row for editing
            return newSets;
        });
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
        const { workouts: ws, setsByWorkout: setsMap } = await refreshWorkoutData();
        setWorkouts(ws);
        setSetsByWorkout(setsMap);
        setEditingWorkoutId(null);
        setEditSets([]);
        setEditingRowIdx(null);
        setConfirmDeleteId(null);
    };

    const handleSave = async () => {
        try {
            await saveWorkout({
                date: editDate,
                sets: editSets,
                note: noteByWorkout[editingWorkoutId],
                workoutId: editingWorkoutId
            }, true);

            const { workouts: ws, setsByWorkout: setsMap } = await refreshWorkoutData();
            setWorkouts(ws);
            setSetsByWorkout(setsMap);
            setEditingWorkoutId(null);
            setEditSets([]);
            setEditingRowIdx(null);
            setNoteByWorkout({});
            setEditDate("");

            showToast("Treeni tallennettu onnistuneesti! 🎉", "success");
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    // <CalendarArrowUp workouts by date
    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    };

    // <CalendarArrowUp workouts based on current sort order
    const sortedWorkouts = [...workouts].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    if (loading) return <div className="text-stone-300 text-center">Ladataan...</div>;
    if (!workouts.length) return <div className="text-stone-300"><h2 className="text-2xl text-white text-center font-bold pt-20">Ei merkattuja treenejä</h2></div>;

    // Helper to format yyyy-mm-dd to dd.mm.yyyy
    const formatFinnishDate = (isoDate) => {
        if (!isoDate) return "";
        const [year, month, day] = isoDate.split("-");
        return `${day}.${month}.${year}`;
    };
    return (
        <div className="w-full md:max-w-2xl md:mx-auto mt-8  p-1 pt-4 pb-4 md:p-6 rounded-xl shadow-lg">
            <div className="">
                <h2 className="text-2xl font-bold text-white-400 text-center">Treenit</h2>
                <button
                    onClick={toggleSortOrder}
                    className="text-green-500 hover:text-green-300 duration-500 px-5 py-2"
                >
                    {sortOrder === 'desc' ? <CalendarArrowDown size={25} /> : <CalendarArrowUp size={25} />}
                </button>
            </div>
            {sortedWorkouts.map(w => (
                <div key={w.id} className="bg-black border border-stone-700 rounded-xl shadow p-3 mb-6">
                    <div className="flex justify-between items-center mb-3">
                        {editingWorkoutId !== w.id ? null :
                            <button
                                className="hover:text-red-700 text-red-600 duration-500 border border-red-600 hover:border-red-700 rounded px-2 py-1 text-xs shadow flex items-center gap-1"
                                onClick={() => setConfirmDeleteId(w.id)}
                                type="button"
                            >
                                <Trash2 size={20} />
                            </button>}
                        {confirmDeleteId && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                                <div className="bg-black border border-stone-700 p-3 rounded-xl shadow-lg max-w-xs w-full text-center">
                                    <h3 className="text-lg font-bold mb-2 text-white">Haluatko poistaa tämän treenin?</h3>
                                    <div className="flex justify-center gap-4 mt-2">
                                        <button
                                            className="hover:text-red-700 text-red-600 duration-500 border border-red-600 hover:border-red-700 rounded px-4 py-2 text-sm shadow flex items-center justify-center gap-1"
                                            onClick={() => handleDeleteWorkout(confirmDeleteId)}
                                        >
                                            <Trash2 size={15} />
                                            Kyllä
                                        </button>
                                        <button
                                            className="px-4 py-2 hover:text-white text-stone-400 duration-500 border border-stone-400 hover:border-white rounded shadow text-sm flex items-center justify-center gap-1"
                                            onClick={() => setConfirmDeleteId(null)}
                                        >
                                            <X size={15} />
                                            Peruuta
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {editingWorkoutId === w.id ? (
                            <>
                                <input
                                    type="date"
                                    className="font-bold text-white-400 bg-black border border-stone-700 rounded px-2 py-1 text-center text-sm w-36 focus:outline-none focus:ring-2 focus:ring-green-600"
                                    value={editDate}
                                    onChange={e => setEditDate(e.target.value)}
                                    style={{ minWidth: 120 }}
                                />

                            </>
                        ) : (
                            <div className="font-bold text-white-400 flex items-center justify-center text-center text-sm">{formatFinnishDate(w.date)} </div>
                        )}
                        {editingWorkoutId === w.id ?

                            <button
                                className="hover:text-white text-stone-400 duration-500 border border-stone-400 hover:border-white text-xs px-2 py-1 rounded shadow flex items-center gap-1"
                                onClick={handleCancel}
                            >
                                <X size={20} />
                            </button>

                            : (
                                <button
                                    className="hover:text-white text-stone-400 duration-500 border border-stone-400 hover:border-white text-xs px-2 py-1 rounded shadow flex items-center gap-1"
                                    onClick={() => handleEdit(w.id)}
                                >
                                    <Edit3 size={20} />
                                </button>
                            )}
                    </div>
                    <div className="border border-stone-700 rounded-lg overflow-x-auto">
                        <table className="w-full text-xs table-auto  ">
                            <thead>
                                <tr className="bg-black text-stone-100 border-b border-green-600 ">
                                    <th className="py-2 rounded-tl-lg">Liike</th>
                                    <th className="py-2">Sarjat</th>
                                    <th className="py-2">Toistot</th>
                                    <th className="py-2 rounded-tr-lg">Paino</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(editingWorkoutId === w.id ? editSets : setsByWorkout[w.id] || []).map((s, i, arr) => (
                                    <tr
                                        key={s.id ? `id-${s.id}` : `new-${i}`}
                                        className={`bg-black hover:bg-stone-900 transition-colors ${i < arr.length - 1 ? 'border-b border-stone-700' : ''} ${editingWorkoutId === w.id ? 'cursor-pointer' : ''}`}
                                        onClick={() => editingWorkoutId === w.id && handleRowClick(i)}
                                    >
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
                        <div className="mt-6 space-y-4">
                            {editingRowIdx !== null && editSets[editingRowIdx] ? (
                                <div className="bg-black border border-green-900 rounded-lg p-4 flex flex-col relative shadow ">
                                    <ExerciseSelector
                                        idx={editingRowIdx}
                                        set={editSets[editingRowIdx]}
                                        inputRefs={inputRefs}
                                        handleSearchChange={handleSearchChange}
                                        handleDropdown={handleDropdown}
                                        dropdownIdx={dropdownIdx}
                                        exercises={exercises}
                                        search={search}
                                        handleSelectExercise={handleSelectExercise}
                                    />
                                    <ExerciseInputs
                                        idx={editingRowIdx}
                                        set={editSets[editingRowIdx]}
                                        handleSetChange={handleSetChange}
                                    />
                                    {editSets.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteSet(editingRowIdx)}
                                            className="hover:text-red-700 text-red-600 duration-500   rounded absolute top-1 right-2 z-10 hover:text-red-600"
                                            aria-label="Remove exercise"
                                        >
                                            <X size={25} />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                null
                            )
                            }
                            <div className="pb-2 flex justify-between items-center">
                                <NewExercise addExercise={handleAddRow} />
                                <button
                                    onClick={() => toggleNote(w.id)}
                                    className="hover:text-green-300 text-green-500 duration-500 hover:border-white text-xs"
                                >
                                    <NotebookPen size={25} />
                                </button>
                            </div>
                        </div>
                    )}
                    {editingWorkoutId !== w.id && (w.note) && (
                        <div className="mt-2">
                            <div className="w-full min-h-[60px] bg-black border border-stone-700 rounded p-2 text-sm text-white text-left whitespace-pre-wrap">
                                {w.note}
                            </div>
                        </div>
                    )}
                    {editingWorkoutId === w.id && showNoteForWorkout === w.id && (
                        <div className="mt-2 ">
                            <textarea
                                className="w-full min-h-[60px] bg-black border border-stone-700 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                                placeholder="Lisää muistiinpano tähän..."
                                value={noteByWorkout[w.id]}
                                onChange={e => setNoteByWorkout(prev => ({ ...prev, [w.id]: e.target.value }))}
                            />
                        </div>
                    )}
                    {editingWorkoutId === w.id ? (
                        <div className="mt-2">
                            <div className="flex-1 flex justify-center ">
                                <button
                                    className="text-green-400 duration-500 border border-green-600 hover:border-green-400 text-sm py-2 rounded-lg font-bold w-full flex items-center justify-center gap-2"
                                    onClick={handleSave}
                                >
                                    <Save size={17} />
                                    Tallenna
                                </button>
                            </div>
                        </div>
                    ) : null}

                </div>
            ))}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />
        </div>
    );
};

export default Workouts;