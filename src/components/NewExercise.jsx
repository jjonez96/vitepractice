import { ListPlus } from "lucide-react";

const NewExercise = ({ addExercise }) => {
    return (
        <button
            className="text-green-500 duration-500 hover:text-green-300 text-sm pt-3"
            type="button"
            onClick={addExercise}
        >
            <ListPlus size={25} />
        </button>
    )
}

export default NewExercise