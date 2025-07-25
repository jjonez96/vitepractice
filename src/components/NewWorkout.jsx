import { useState } from "react";
import { saveWorkout } from "../utils/workoutUtils";
import { useExerciseDropdown } from "../hooks/useExerciseDropdown";
import { useExerciseInputs } from "../hooks/useExersiceData";
import ExerciseSelector from "./ExerciseSelector";
import NumberInputs from "./NumberInputs";
import NewExercise from "./NewExercise";
import Toast from "./Toast";
import { useToast } from "../hooks/useToast";
import { Save, X } from "lucide-react";
const NewWorkout = ({ onSaved }) => {
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [saving, setSaving] = useState(false);

    // Toast notifications
    const { toast, showToast, hideToast } = useToast();

    // Get exercise data and handlers
    const { data, setData, handleNumberInputs, addExercise, removeSet } = useExerciseInputs();

    const {
        dropdownIdx,
        search,
        exercises,
        handleDropdown,
        handleSelectExercise,
        handleSearchChange,
        inputRefs
    } = useExerciseDropdown(data, setData);

    const handleAddExercise = async () => {
        await addExercise(inputRefs);
    };

    const handleRemoveSet = (idx) => {
        removeSet(idx, inputRefs);
        const updatedData = data.filter((_, i) => i !== idx);
        localStorage.setItem("nw_data", JSON.stringify(updatedData));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true);
        try {
            await saveWorkout({
                date,
                sets: data,
                note: "",
                workoutId: null
            }, false);

            setData([{ exercise: "", reps: "", sets: "", weight: "" }]);
            localStorage.removeItem("nw_data");
            if (onSaved) onSaved();
            showToast("Treeni tallennettu onnistuneesti! 🎉", "success");
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setSaving(false);
        }
    };

    // Check if all required fields are filled for at least one exercise
    const isFormValid = () => {
        return data.some(set =>
            set.exercise && set.exercise.trim() !== "" &&
            set.sets && set.sets.toString().trim() !== "" &&
            set.reps && set.reps.toString().trim() !== ""
        );
    };

    return (
        <div className="w-full md:max-w-2xl md:mx-auto mt-8  p-1 pt-4 pb-4 md:p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl text-white-400 text-center font-bold mb-4">Uusi Treeni</h2>
            <form onSubmit={handleSubmit} className="w-full md:max-w-2xl md:mx-auto space-y-6 bg-black border border-stone-700 p-2 pt-4 pb-4 md:p-6 rounded-xl shadow-lg">
                <div>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border border-stone-700 bg-black text-white rounded px-2 py-1 w-36 focus:outline-none focus:ring-2 focus:ring-green-600" required />
                </div>
                <div>
                    <div className="space-y-4">
                        {data.map((set, idx) => {
                            return (
                                <div key={idx} className="bg-black border border-stone-700 rounded-lg p-4 flex flex-col gap-3 relative shadow">
                                    <ExerciseSelector
                                        idx={idx}
                                        set={set}
                                        inputRefs={inputRefs}
                                        handleSearchChange={handleSearchChange}
                                        handleDropdown={handleDropdown}
                                        dropdownIdx={dropdownIdx}
                                        exercises={exercises}
                                        search={search}
                                        handleSelectExercise={handleSelectExercise}
                                    />
                                    <NumberInputs
                                        idx={idx}
                                        set={set}
                                        handleNumberInputs={handleNumberInputs}
                                    />
                                    {data.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSet(idx)}
                                            className="hover:text-red-700 text-red-600 duration-500   rounded absolute top-1 right-2 z-10 hover:text-red-600"
                                            aria-label="Remove exercise"
                                        >
                                            <X size={25} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="pt-6">
                        <NewExercise addExercise={handleAddExercise} data={data} />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={saving || !isFormValid()}
                    className={`duration-500 border text-sm py-2 rounded-lg font-bold w-full flex items-center justify-center gap-2 ${saving || !isFormValid()
                        ? 'text-stone-500 border-stone-700 cursor-not-allowed'
                        : 'text-green-400 border-green-600 hover:border-green-400'
                        }`}
                >
                    {saving ? (
                        "Ladataan..."
                    ) : (
                        <>
                            <Save size={17} />
                            Tallenna
                        </>
                    )}
                </button>
            </form>
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />
        </div>
    );
};

export default NewWorkout;