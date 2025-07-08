import { useState, useRef, useEffect } from "react";
import { db } from "../db/dexie";
import { useExerciseDropdown } from "./useExerciseDropdown";

const NewWorkout = ({ onSaved }) => {
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [data, setData] = useState([
        { exercise: "", reps: 8, sets: 2, weight: "" }
    ]);
    const [saving, setSaving] = useState(false);
    const [showWeight, setShowWeight] = useState(data.map(() => false));
    const [focusedField, setFocusedField] = useState({ index: null, field: null });

    const {
        dropdownIdx,
        search,
        exercises,
        handleDropdown,
        handleSelectExercise,
        handleSearchChange
    } = useExerciseDropdown(data, setData);

    // Refs for each set's input
    const inputRefs = useRef([]);

    useEffect(() => {
        const handleClick = (e) => {
            // Dropdown close logic
            const input = inputRefs.current[dropdownIdx];
            if (
                input &&
                !input.contains(e.target) &&
                !document.getElementById(`dropdown-${dropdownIdx}`)?.contains(e.target)
            ) {
                handleDropdown(null);
            }
            // FocusedField clear logic
            // Find if click is inside any number input
            let clickedInput = false;
            inputRefs.current.forEach(ref => {
                if (ref && ref.contains && ref.contains(e.target)) clickedInput = true;
            });
            // Also check number inputs for reps/sets/weight
            if (
                e.target &&
                (
                    (e.target.tagName === 'BUTTON') ||
                    (e.target.tagName === 'INPUT' && e.target.type === 'number')
                )
            ) {
                clickedInput = true;
            }
            if (!clickedInput) {
                setFocusedField({ index: null, field: null });
            }
        };
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [dropdownIdx]);

    const handleSetChange = (idx, field, value) => {
        setData(data => data.map((set, i) => i === idx ? { ...set, [field]: value } : set));
    };

    // Show weight input for calisthenics if toggled
    const handleAddWeight = (idx) => {
        setShowWeight(sw => sw.map((v, i) => i === idx ? true : v));
    };

    const addExercise = () => {
        setData([...data, { exercise: "", reps: "", sets: "", weight: "" }]);
        setShowWeight(sw => [...sw, false]);
    };

    const removeSet = idx => {
        setData(data => data.filter((_, i) => i !== idx));
        setShowWeight(sw => sw.filter((_, i) => i !== idx));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        e.preventDefault();
        for (const s of data) {
            if (Number(s.reps) < 0 || Number(s.sets) < 0 || Number(s.weight) < 0) {
                alert("Negative numbers are not allowed.");
                return;
            }
        }
        setSaving(true);
        try {
            const workoutId = await db.workouts.add({ date });
            await db.data.bulkAdd(
                data.filter(s => s.exercise && s.reps && s.sets)
                    .map(s => ({ ...s, reps: Number(s.reps), sets: Number(s.sets), weight: Number(s.weight) || 0, workoutId }))
            );
            setData([{ exercise: "", reps: "", sets: "", weight: "" }]);
            if (onSaved) onSaved();
            alert("Workout saved!");
        } catch (err) {
            alert("Error saving workout: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 bg-gray-800 text-gray-100 p-6 rounded-xl shadow-lg">
                <div>
                    <h2 className="text-2xl text-green-400 text-center font-bold mb-4">New Workout</h2>
                    <label className="block font-bold mb-1">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border border-gray-700 bg-gray-900 rounded px-2 py-1 w-48" required />
                </div>
                <div>
                    <label className="block font-bold mb-2 text-lg">Exercises</label>
                    <div className="space-y-4">
                        {data.map((set, idx) => {
                            // Filter exercises for dropdown
                            const filtered = exercises.filter(e =>
                                e.name.toLowerCase().includes((dropdownIdx === idx ? search : set.exercise).toLowerCase())
                            );
                            const exerciseObj = exercises.find(e => e.name === set.exercise);
                            const isCalisthenics = exerciseObj?.type === "Calisthenics";
                            return (
                                <div key={idx} className="bg-gray-900 rounded-lg p-4 flex flex-col gap-3 relative shadow border border-gray-700">
                                    <div className="flex-1 w-full mb-2">
                                        <label className="block text-sm mb-1">Exercise</label>
                                        <input
                                            ref={el => (inputRefs.current[idx] = el)}
                                            type="text"
                                            value={set.exercise}
                                            onChange={e => handleSearchChange(idx, e.target.value)}
                                            onFocus={() => handleDropdown(idx)}
                                            className="border border-gray-700 bg-gray-800 rounded px-2 py-1 w-full text-gray-100"
                                            required
                                        />
                                        {dropdownIdx === idx && filtered.length > 0 && (
                                            <div
                                                id={`dropdown-${idx}`}
                                                className="absolute z-20 bg-gray-950 border border-gray-700 rounded shadow w-full max-h-48 overflow-y-auto mt-1"
                                            >
                                                {filtered.map((ex, i) => (
                                                    <div
                                                        key={ex.name}
                                                        className="px-2 py-1 hover:bg-green-900 cursor-pointer flex items-center gap-2"
                                                        onClick={() => handleSelectExercise(idx, ex.name)}
                                                    >
                                                        <span>{ex.name}</span>
                                                        <span className="text-xs text-gray-400 ml-2">{ex.type}</span>
                                                        <a
                                                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name)}+technique`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-green-400 text-xs underline ml-2 z-10"
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            Video
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-row gap-3 flex-wrap">

                                        <div className="flex flex-col w-1/3 min-w-[90px] flex-1">
                                            <label className="block text-sm mb-1">Sets</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={set.sets}
                                                onChange={e => handleSetChange(idx, "sets", e.target.value)}
                                                onFocus={() => setFocusedField({ index: idx, field: "sets" })}
                                                className="border border-gray-700 bg-gray-800 text-gray-100 px-2 py-1 w-full text-center rounded"
                                                required
                                            />
                                        </div>
                                        <div className="flex flex-col w-1/3 min-w-[90px] flex-1">
                                            <label className="block text-sm mb-1">Reps</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={set.reps}
                                                onChange={e => handleSetChange(idx, "reps", e.target.value)}
                                                onFocus={() => setFocusedField({ index: idx, field: "reps" })}
                                                className="border border-gray-700 bg-gray-800 text-gray-100 px-2 py-1 w-full text-center rounded"
                                            />
                                        </div>
                                        <div className="flex flex-col w-1/3 min-w-[90px] flex-1">
                                            <label className="block text-sm mb-1">Weight</label>
                                            {isCalisthenics && !showWeight[idx] ? (
                                                <button
                                                    type="button"
                                                    className="bg-gray-700 text-green-400 rounded px-2 py-1 border border-gray-600 hover:bg-green-900"
                                                    onClick={() => handleAddWeight(idx)}
                                                >
                                                    + Add
                                                </button>
                                            ) : (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={set.weight}
                                                    onChange={e => handleSetChange(idx, "weight", e.target.value)}
                                                    onFocus={() => setFocusedField({ index: idx, field: "weight" })}
                                                    className="border border-gray-700 bg-gray-800 text-gray-100 px-2 py-1 w-full text-center rounded"
                                                />
                                            )}
                                        </div>
                                        {focusedField.index === idx && ["reps", "sets", "weight"].includes(focusedField.field) && (
                                            <div className="flex justify-center gap-4 mt-2 w-full col-span-3">
                                                <button
                                                    type="button"
                                                    className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
                                                    onClick={() => {
                                                        const field = focusedField.field;
                                                        const val = Number(set[field] || 0);
                                                        handleSetChange(idx, field, Math.max(0, val - 1));
                                                    }}
                                                    disabled={Number(set[focusedField.field] || 0) <= 0}
                                                >-</button>
                                                <span className="px-4 py-1 text-lg text-white font-mono">{set[focusedField.field] || 0}</span>
                                                <button
                                                    type="button"
                                                    className="px-3 py-1 bg-gray-700 text-white rounded"
                                                    onClick={() => {
                                                        const field = focusedField.field;
                                                        const val = Number(set[field] || 0);
                                                        handleSetChange(idx, field, val + 1);
                                                    }}
                                                >+</button>
                                            </div>
                                        )}

                                        {data.length > 1 && (
                                            <button type="button" onClick={() => removeSet(idx)} className="text-red-400 font-bold text-2xl ml-2 self-end">×</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <button type="button" onClick={addExercise} className="text-green-400 underline mt-2">+ Add New Exercise</button>
                </div>
                <button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold w-full">
                    {saving ? "Saving..." : "Save Workout"}
                </button>
            </form>
        </div>
    );
};

export default NewWorkout;