import { ListPlus, Check } from "lucide-react";

const NewExercise = ({ addExercise, data, editingRowIdx, setEditingRowIdx }) => {
    // Check if the last exercise has required fields filled
    const isLastExerciseFilled = () => {
        if (!data || data.length === 0) return true; // Allow first exercise

        const lastExercise = data[data.length - 1];
        return lastExercise.exercise && lastExercise.exercise.trim() !== "" &&
            lastExercise.sets && lastExercise.sets.toString().trim() !== "" &&
            lastExercise.reps && lastExercise.reps.toString().trim() !== "";
    };

    // Check if the currently editing exercise has required fields filled
    const isCurrentExerciseFilled = () => {
        if (editingRowIdx === null || !data || !data[editingRowIdx]) return false;

        const currentExercise = data[editingRowIdx];
        return currentExercise.exercise && currentExercise.exercise.trim() !== "" &&
            currentExercise.sets && currentExercise.sets.toString().trim() !== "" &&
            currentExercise.reps && currentExercise.reps.toString().trim() !== "";
    };

    const isEditing = editingRowIdx !== null && editingRowIdx < data.length;
    const isDisabled = isEditing ? !isCurrentExerciseFilled() : !isLastExerciseFilled();

    const handleClick = () => {
        if (isEditing) {
            // If editing any exercise, close the editing form
            setEditingRowIdx(null);
        } else {
            // If not editing, add new exercise
            addExercise();
        }
    };

    return (
        <button
            className={`duration-500 text-sm ${isDisabled
                ? 'text-stone-500 cursor-not-allowed'
                : 'text-green-500 hover:text-green-300'
                }`}
            type="button"
            onClick={handleClick}
            disabled={isDisabled}
        >
            {isEditing ? <Check size={25} /> : <ListPlus size={25} />}
        </button>
    )
}

export default NewExercise