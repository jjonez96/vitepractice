import { useSettings } from '../hooks/useSettings';

const ExerciseSelector = ({
    idx,
    set,
    inputRefs,
    handleSearchChange,
    handleDropdown,
    dropdownIdx,
    exercises,
    search,
    handleSelectExercise
}) => {
    const { settings } = useSettings();

    // Safety check to prevent errors when set is undefined
    if (!set) return null;

    const filtered = exercises.filter(e =>
        (e.name + " " + (e.name_en || "") + " " + (e.muscle || "")).toLowerCase().includes((dropdownIdx === idx ? search : set.exercise).toLowerCase())
    );

    // Function to get the display name based on user preference
    const getDisplayName = (exercise) => {
        return settings.useEnglishNames ? exercise.name_en : exercise.name;
    };

    // Function to get the secondary name (opposite of preference)
    const getSecondaryName = (exercise) => {
        return settings.useEnglishNames ? exercise.name : exercise.name_en;
    };

    return (
        <div className="flex-1 w-full mb-2 relative">
            <label className="block text-sm mb-1">Liike</label>
            <input
                ref={el => (inputRefs.current[idx] = el)}
                type="text"
                value={set.exercise}
                onChange={e => handleSearchChange(idx, e.target.value)}
                onFocus={() => handleDropdown(idx)}
                className="border border-stone-700 bg-black rounded px-2 py-1 w-full text-gray-100"
                required
            />
            {dropdownIdx === idx && filtered.length > 0 && (
                <div
                    id={`dropdown-${idx}`}
                    className="absolute z-20 bg-black border border-stone-700 rounded shadow w-full max-h-48 overflow-y-auto mt-1 left-1/2 transform -translate-x-1/2"
                >
                    {filtered.map((ex, i) => (
                        <div
                            key={ex.name}
                            onClick={() => handleSelectExercise(idx, getDisplayName(ex))}
                            className="p-2 hover:bg-green-900 cursor-pointer flex-col transition-colors duration-200"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-semibold text-white">
                                    {getDisplayName(ex)} <span className="text-sm text-stone-300">{`(${getSecondaryName(ex)}), ${ex.muscle}`}</span>
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExerciseSelector;
