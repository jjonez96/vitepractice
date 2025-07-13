import { useRef, useEffect } from "react";
import { Trash2, X, Save, NotebookPen } from "lucide-react";
import ExerciseSelector from "../ExerciseSelector";
import NumberInputs from "../NumberInputs";
import NewExercise from "../NewExercise";

const EditWorkoutModal = ({
    isOpen,
    onClose,
    editDate,
    setEditDate,
    noteByWorkout,
    setNoteByWorkout,
    editingWorkoutId,
    showNoteForWorkout,
    toggleNote,
    data,
    originalData,
    originalDate,
    originalNote,
    handleRowClick,
    editingRowIdx,
    inputRefs,
    handleSearchChange,
    handleDropdown,
    dropdownIdx,
    exercises,
    search,
    handleSelectExercise,
    handleNumberInputs,
    handleRemoveSet,
    handleAddExercise,
    handleSave,
    setConfirmDeleteId
}) => {
    const textareaRef = useRef(null);

    // Focus textarea when note becomes visible
    useEffect(() => {
        if (showNoteForWorkout === editingWorkoutId && textareaRef.current) {
            // Small delay to ensure the textarea is rendered
            setTimeout(() => {
                textareaRef.current?.focus();
            }, 100);
        }
    }, [showNoteForWorkout, editingWorkoutId]);

    if (!isOpen) return null;

    // Check if any changes have been made
    const hasChanges = () => {
        // Check if date has changed
        if (editDate !== originalDate) return true;

        // Check if note has changed
        const currentNote = noteByWorkout[editingWorkoutId] || "";
        if (currentNote !== (originalNote || "")) return true;

        // Check if data has changed
        if (data.length !== originalData.length) return true;

        // Check each exercise for changes
        for (let i = 0; i < data.length; i++) {
            const current = data[i];
            const original = originalData[i];

            if (!original) return true; // New exercise added

            if (current.exercise !== original.exercise ||
                current.sets !== original.sets ||
                current.reps !== original.reps ||
                current.weight !== original.weight) {
                return true;
            }
        }

        return false;
    };

    const isDisabled = !hasChanges();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-black border border-stone-700 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-auto">
                <div className="p-4">

                    <div className="mb-4 flex justify-between items-center">
                        <button
                            className="hover:text-red-700 text-red-600 duration-500 px-2 py-1 flex items-center gap-1"
                            onClick={() => setConfirmDeleteId(editingWorkoutId)}
                            type="button"
                        >
                            <Trash2 size={22} />
                        </button>
                        <input
                            type="date"
                            className="font-bold text-white-400 bg-black border border-stone-700 rounded px-2 py-1 text-center text-sm w-36 focus:outline-none focus:ring-2 focus:ring-green-600"
                            value={editDate}
                            onChange={e => setEditDate(e.target.value)}
                        />
                        <button
                            className="hover:text-white text-stone-400 duration-500"
                            onClick={onClose}
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <div className="border border-stone-700 rounded-lg overflow-x-auto mb-6">
                        <table className="w-full text-xs table-auto">
                            <thead>
                                <tr className="bg-black text-stone-100 border-b border-green-600">
                                    <th className="py-2 rounded-tl-lg">Liike</th>
                                    <th className="py-2">Sarjat</th>
                                    <th className="py-2">Toistot</th>
                                    <th className="py-2 rounded-tr-lg">Paino</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((s, i, arr) => (
                                    <tr
                                        key={s.id ? `id-${s.id}` : `new-${i}`}
                                        className={`bg-black hover:bg-stone-900 transition-colors cursor-pointer ${i < arr.length - 1 ? 'border-b border-stone-700' : ''}`}
                                        onClick={() => handleRowClick(i)}
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

                    {editingRowIdx !== null && data[editingRowIdx] ? (
                        <div className="bg-black border border-green-900 rounded-lg p-4 flex flex-col relative shadow mb-4">
                            <ExerciseSelector
                                idx={editingRowIdx}
                                set={data[editingRowIdx]}
                                inputRefs={inputRefs}
                                handleSearchChange={handleSearchChange}
                                handleDropdown={handleDropdown}
                                dropdownIdx={dropdownIdx}
                                exercises={exercises}
                                search={search}
                                handleSelectExercise={handleSelectExercise}
                            />
                            <NumberInputs
                                idx={editingRowIdx}
                                set={data[editingRowIdx]}
                                handleNumberInputs={handleNumberInputs}
                            />
                            {data.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSet(editingRowIdx)}
                                    className="hover:text-red-700 text-red-600 duration-500 rounded absolute top-1 right-2 z-10"
                                    aria-label="Remove exercise"
                                >
                                    <X size={25} />
                                </button>
                            )}
                        </div>
                    ) : null}

                    <div className="mb-4 flex justify-between items-center">
                        <NewExercise addExercise={handleAddExercise} />
                        <button
                            onClick={() => toggleNote(editingWorkoutId)}
                            className="hover:text-green-300 text-green-500 duration-500 hover:border-white text-xs"
                        >
                            <NotebookPen size={22} />
                        </button>

                    </div>
                    {showNoteForWorkout === editingWorkoutId && (
                        <div className="mb-4">
                            <textarea
                                ref={textareaRef}
                                className="w-full min-h-[60px] bg-black border border-stone-700 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                                placeholder="Lisää muistiinpano tähän..."
                                value={noteByWorkout[editingWorkoutId]}
                                onChange={e => setNoteByWorkout(prev => ({ ...prev, [editingWorkoutId]: e.target.value }))}
                            />
                        </div>
                    )}
                    <div className="flex justify-center">
                        <button
                            className={`duration-500 border text-sm py-2 rounded-lg font-bold w-full flex items-center justify-center gap-2 ${isDisabled
                                ? 'text-stone-500 border-stone-700 cursor-not-allowed'
                                : 'text-green-400 border-green-600 hover:border-green-400'
                                }`}
                            onClick={handleSave}
                            disabled={isDisabled}
                        >
                            <Save size={17} />
                            Tallenna
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditWorkoutModal;
