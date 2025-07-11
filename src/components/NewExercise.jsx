const NewExercise = ({ addExercise }) => {
    return (
        <button
            className="text-green-500 underline text-sm pt-3  "
            type="button"
            onClick={addExercise}
        >+ Uusi liike
        </button>
    )
}

export default NewExercise