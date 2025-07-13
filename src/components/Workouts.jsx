import { useEffect, useState } from "react";
import { Edit3, CalendarArrowUp, CalendarArrowDown } from "lucide-react";
import { db } from "../db/dexie";
import { saveWorkout, refreshWorkoutData, formatFinnishDate } from "../utils/workoutUtils";
import EditWorkoutModal from "./modals/EditWorkoutModal";
import DeleteConfirmationModal from "./modals/DeleteConfirmationModal";
import Toast from "./Toast";
import { useToast } from "../hooks/useToast";
import { useExerciseDropdown } from "../hooks/useExerciseDropdown";
import { useExerciseInputs } from "../hooks/useExersiceData";

const Workouts = () => {
    const [workouts, setWorkouts] = useState([]);
    const [setsByWorkout, setSetsByWorkout] = useState({});
    const [loading, setLoading] = useState(true);
    const [editingWorkoutId, setEditingWorkoutId] = useState(null);
    const [noteByWorkout, setNoteByWorkout] = useState({});
    const [editDate, setEditDate] = useState("");
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [sortOrder, setSortOrder] = useState(localStorage.getItem("sortOrder"));
    const [showNoteForWorkout, setShowNoteForWorkout] = useState(null);
    const [originalData, setOriginalData] = useState([]);
    const [originalDate, setOriginalDate] = useState("");
    const [originalNote, setOriginalNote] = useState("");



    const { toast, showToast, hideToast } = useToast();
    const { data, setData, handleNumberInputs, addExercise, removeSet, editingRowIdx, setEditingRowIdx } = useExerciseInputs();
    const {
        dropdownIdx,
        search,
        exercises,
        handleDropdown,
        handleSelectExercise,
        handleSearchChange,
        inputRefs
    } = useExerciseDropdown(data, setData, false);

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

        setData(currentSets);
        setOriginalData([...currentSets]); // Store original data for comparison
        setEditingRowIdx(null); // Reset row editing when starting workout edit
        // Load note for this workout (date will be set automatically on save)
        const workout = workouts.find(w => w.id === workoutId);
        const workoutNote = workout?.note || "";
        const workoutDate = workout?.date || "";

        setNoteByWorkout(prev => ({ ...prev, [workoutId]: workoutNote }));
        setEditDate(workoutDate);
        setOriginalDate(workoutDate);
        setOriginalNote(workoutNote);
    };

    const handleRowClick = (rowIdx) => {
        if (editingWorkoutId) {
            setEditingRowIdx(editingRowIdx === rowIdx ? null : rowIdx);
        }
    };

    const handleEditCancel = () => {
        setEditingWorkoutId(null);
        setData([]);
        setEditingRowIdx(null);
        setEditDate("");
        setShowNoteForWorkout(null);
        setOriginalData([]);
        setOriginalDate("");
        setOriginalNote("");
    };

    // Toggle note visibility
    const toggleNote = (workoutId) => {
        setShowNoteForWorkout(prev => prev === workoutId ? null : workoutId);
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
        setData([]);
        setEditingRowIdx(null);
        setConfirmDeleteId(null);
    };

    const handleSave = async () => {
        try {
            await saveWorkout({
                date: editDate,
                sets: data,
                note: noteByWorkout[editingWorkoutId],
                workoutId: editingWorkoutId
            }, true);

            const { workouts: ws, setsByWorkout: setsMap } = await refreshWorkoutData();
            setWorkouts(ws);
            setSetsByWorkout(setsMap);
            setEditingWorkoutId(null);
            setData([]);
            setEditingRowIdx(null);
            setNoteByWorkout({});
            setShowNoteForWorkout(null);
            setEditDate("");
            showToast("Treeni tallennettu onnistuneesti!", "success");
        } catch (err) {
            showToast(err.message, "error");
        }
    };
    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    };
    const handleAddExercise = async () => {
        await addExercise(inputRefs);
    };
    const handleRemoveSet = (idx) => {
        removeSet(idx, inputRefs);
    }
    // <CalendarArrowUp workouts based on current sort order
    const sortedWorkouts = [...workouts].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        localStorage.setItem("sortOrder", sortOrder);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    if (loading) return <div className="text-stone-300 text-center">Ladataan...</div>;
    if (!workouts.length) return <div className="text-stone-300"><h2 className="text-2xl text-white text-center font-bold pt-20">Ei merkattuja treenejä</h2></div>;

    return (
        <div className="w-full md:max-w-2xl md:mx-auto mt-8  p-1 pt-4 pb-4 md:p-6 rounded-xl shadow-lg">
            <div className="">
                <h2 className="text-2xl font-bold text-white-400 text-center">Treenit</h2>
                <button
                    onClick={toggleSortOrder}
                    className="text-green-500 hover:text-green-300 duration-500 px-5 py-2"
                >
                    {sortOrder === 'desc' ? <CalendarArrowDown size={22} /> : <CalendarArrowUp size={22} />}
                </button>
            </div>
            {sortedWorkouts.map((w, index) => (
                <div key={w.id}>
                    <div className="bg-black border border-stone-700 rounded-xl shadow p-3 mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <div className="font-bold text-white-400 flex items-center justify-center text-center text-sm">{formatFinnishDate(w.date)}</div>
                            <button
                                className="text-green-500 hover:text-green-300 duration-500 text-xs px-2 py-1 rounded shadow flex items-center gap-1"
                                onClick={() => handleEdit(w.id)}
                            >
                                <Edit3 size={22} />
                            </button>
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
                                    {(setsByWorkout[w.id] || []).map((s, i, arr) => (
                                        <tr
                                            key={s.id ? `id-${s.id}` : `new-${i}`}
                                            className={`bg-black hover:bg-stone-900 transition-colors ${i < arr.length - 1 ? 'border-b border-stone-700' : ''}`}
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
                        {(w.note) && (
                            <div className="mt-2">
                                <div className="w-full min-h-[60px] bg-black border border-stone-700 rounded p-2 text-sm text-white text-left whitespace-pre-wrap">
                                    {w.note}
                                </div>
                            </div>
                        )}
                    </div>
                    {index < sortedWorkouts.length - 1 && (
                        <div className="flex justify-center mb-6">
                            <div className="w-2/3 h-px bg-stone-700  shadow"></div>
                        </div>
                    )}
                </div>
            ))}

            <EditWorkoutModal
                isOpen={!!editingWorkoutId}
                onClose={handleEditCancel}
                editDate={editDate}
                setEditDate={setEditDate}
                noteByWorkout={noteByWorkout}
                setNoteByWorkout={setNoteByWorkout}
                editingWorkoutId={editingWorkoutId}
                showNoteForWorkout={showNoteForWorkout}
                toggleNote={toggleNote}
                data={data}
                originalData={originalData}
                originalDate={originalDate}
                originalNote={originalNote}
                handleRowClick={handleRowClick}
                editingRowIdx={editingRowIdx}
                inputRefs={inputRefs}
                handleSearchChange={handleSearchChange}
                handleDropdown={handleDropdown}
                dropdownIdx={dropdownIdx}
                exercises={exercises}
                search={search}
                handleSelectExercise={handleSelectExercise}
                handleNumberInputs={handleNumberInputs}
                handleRemoveSet={handleRemoveSet}
                handleAddExercise={handleAddExercise}
                handleSave={handleSave}
                setConfirmDeleteId={setConfirmDeleteId}
            />

            <DeleteConfirmationModal
                isOpen={!!confirmDeleteId}
                onConfirm={() => handleDeleteWorkout(confirmDeleteId)}
                onCancel={() => setConfirmDeleteId(null)}
            />

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