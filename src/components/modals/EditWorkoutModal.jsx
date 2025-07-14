import { useRef, useEffect } from "react";
import { Trash2, X, Save, NotebookPen, GripVertical } from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ExerciseSelector from "../ExerciseSelector";
import NumberInputs from "../NumberInputs";
import NewExercise from "../NewExercise";

// Sortable table row component
const SortableTableRow = ({ exercise, index, handleRowClick, isLast }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: exercise.id || `exercise-${index}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className={`bg-black hover:bg-stone-900 transition-colors cursor-pointer ${!isLast ? 'border-b border-stone-700' : ''
                }`}
            onClick={() => handleRowClick(index)}
        >
            <td className="px-2 py-3 text-center">
                <div
                    className="flex justify-center cursor-grab active:cursor-grabbing touch-manipulation p-2 -m-2"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical size={20} className="text-stone-500" />
                </div>
            </td>
            <td className="px-4 py-3 text-center">{exercise.exercise}</td>
            <td className="px-4 py-3 text-center">{exercise.sets}</td>
            <td className="px-4 py-3 text-center">{exercise.reps}</td>
            <td className="px-4 py-3 text-center">
                {!exercise.weight || exercise.weight === 0 || exercise.weight === "0" || exercise.weight === "" ? '-' : exercise.weight}
            </td>
        </tr>
    );
};

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
    setData,
    originalData,
    originalDate,
    originalNote,
    handleRowClick,
    editingRowIdx,
    setEditingRowIdx,
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

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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

            if (!original) return true;

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

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = data.findIndex((item) => (item.id || `exercise-${data.indexOf(item)}`) === active.id);
            const newIndex = data.findIndex((item) => (item.id || `exercise-${data.indexOf(item)}`) === over.id);

            const newData = arrayMove(data, oldIndex, newIndex);
            setData(newData);

            // Update editing index if needed
            if (editingRowIdx === oldIndex) {
                setEditingRowIdx(newIndex);
            } else if (editingRowIdx > oldIndex && editingRowIdx <= newIndex) {
                setEditingRowIdx(editingRowIdx - 1);
            } else if (editingRowIdx < oldIndex && editingRowIdx >= newIndex) {
                setEditingRowIdx(editingRowIdx + 1);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
            <div className="bg-black border border-stone-700 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-auto">
                <div className="p-4">

                    <div className="mb-4 flex justify-between items-center">
                        <button
                            className="hover:text-red-700 text-red-600 duration-500 py-1 flex items-center "
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
                            className="hover:text-white text-stone-300 duration-500"
                            onClick={onClose}
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <div className="border border-stone-700 rounded-lg overflow-x-auto mb-6">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <table className="w-full text-xs table-auto">
                                <thead>
                                    <tr className="bg-black text-stone-100 border-b border-green-600">
                                        <th className="py-2 w-8"></th>
                                        <th className="py-2 rounded-tl-lg">Liike</th>
                                        <th className="py-2">Sarjat</th>
                                        <th className="py-2">Toistot</th>
                                        <th className="py-2 rounded-tr-lg">Paino</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <SortableContext
                                        items={data.map((item, index) => item.id || `exercise-${index}`)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {data.map((exercise, index) => (
                                            <SortableTableRow
                                                key={exercise.id || `exercise-${index}`}
                                                exercise={exercise}
                                                index={index}
                                                handleRowClick={handleRowClick}
                                                isLast={index === data.length - 1}
                                            />
                                        ))}
                                    </SortableContext>
                                </tbody>
                            </table>
                        </DndContext>
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
                        <NewExercise
                            addExercise={handleAddExercise}
                            data={data}
                            editingRowIdx={editingRowIdx}
                            setEditingRowIdx={setEditingRowIdx}
                        />
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
