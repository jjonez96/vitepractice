import { ListPlus } from "lucide-react";

const NewExercise = ({ addExercise, data }) => {
    // Check if the last exercise has required fields filled
    const isLastExerciseFilled = () => {
        if (!data || data.length === 0) return true; // Allow first exercise

        const lastExercise = data[data.length - 1];
        return lastExercise.exercise && lastExercise.exercise.trim() !== "" &&
            lastExercise.sets && lastExercise.sets.toString().trim() !== "" &&
            lastExercise.reps && lastExercise.reps.toString().trim() !== "";
    };

    const isDisabled = !isLastExerciseFilled();

    return (
        <button
            className={`duration-500 text-sm ${isDisabled
                ? 'text-stone-500 cursor-not-allowed'
                : 'text-green-500 hover:text-green-300'
                }`}
            type="button"
            onClick={addExercise}
            disabled={isDisabled}
        >
            <ListPlus size={25} />
        </button>
    )
}

export default NewExercise