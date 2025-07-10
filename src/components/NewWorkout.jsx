import { useState, useRef, useEffect } from "react";
import { db } from "../db/dexie";
import { useExerciseDropdown } from "./useExerciseDropdown";

const NewWorkout = ({ onSaved }) => {
    const getInitialData = () => {
        const saved = localStorage.getItem("nw_data");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return [{ exercise: "", reps: 8, sets: 2, weight: "" }];
            }
        }
        return [{ exercise: "", reps: 8, sets: 2, weight: "" }];
    };
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [data, setData] = useState(getInitialData);
    const [saving, setSaving] = useState(false);

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
                    (e.target.tagName === 'INPUT' && e.target.type === 'number')
                )
            ) {
                clickedInput = true;
            }

        };
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [dropdownIdx]);

    const handleSetChange = (idx, field, value) => {
        setData(data => {
            const newData = data.map((set, i) => i === idx ? { ...set, [field]: value } : set);
            localStorage.setItem("nw_data", JSON.stringify(newData));
            return newData;
        });
    };

    const addExercise = () => {
        setData(prev => {
            const newData = [...prev, { exercise: "", reps: 8, sets: 2, weight: "" }];
            localStorage.setItem("nw_data", JSON.stringify(newData));
            return newData;
        });
    };

    const removeSet = idx => {
        setData(data => {
            const newData = data.filter((_, i) => i !== idx);
            localStorage.setItem("nw_data", JSON.stringify(newData));
            return newData;
        });
    };

    const handleSubmit = async e => {
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
            setData([{ exercise: "", reps: 8, sets: 2, weight: "" }]);
            localStorage.removeItem("nw_data");
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
                    <h2 className="text-2xl text-green-400 text-center font-bold mb-4">Uusi Treeni</h2>
                    <label className="block font-bold mb-1">Päiväys</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border border-gray-700 bg-gray-900 rounded px-2 py-1 w-48" required />
                </div>
                <div>
                    <div className="space-y-4">
                        {data.map((set, idx) => {
                            // Filter exercises for dropdown
                            const filtered = exercises.filter(e =>
                                e.name.toLowerCase().includes((dropdownIdx === idx ? search : set.exercise).toLowerCase())
                            );
                            return (
                                <div key={idx} className="bg-gray-900 rounded-lg p-4 flex flex-col gap-3 relative shadow border border-gray-700">
                                    <div className="flex-1 w-full mb-2">
                                        <label className="block text-sm mb-1">Liike</label>
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
                                                        <span>{ex.muscles} </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-row gap-3 flex-wrap">
                                        <div className="flex flex-col  min-w-[20px] flex-1">
                                            <label className="block text-sm mb-1">Sarjat</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={set.sets}
                                                onChange={e => handleSetChange(idx, "sets", e.target.value)}
                                                className="border border-gray-700 bg-gray-800 text-gray-100 px-2 py-1 w-full text-center rounded"
                                                required
                                            />
                                        </div>
                                        <div className="flex flex-col  min-w-[20px] flex-1">
                                            <label className="block text-sm mb-1">Toistot</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={set.reps}
                                                onChange={e => handleSetChange(idx, "reps", e.target.value)}
                                                className="border border-gray-700 bg-gray-800 text-gray-100 px-2 py-1 w-full text-center rounded"
                                            />
                                        </div>
                                        <div className="flex flex-col  min-w-[20px] flex-1">
                                            <label className="block text-sm mb-1">Paino(kg)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={set.weight}
                                                onChange={e => handleSetChange(idx, "weight", e.target.value)}
                                                className="border border-gray-700 bg-gray-800 text-gray-100 px-2 py-1 w-full text-center rounded"
                                            />
                                        </div>
                                    </div>
                                    {data.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeSet(idx)}
                                            className="text-red-400 font-bold text-2xl absolute top-0 right-2 z-10 hover:text-red-600"
                                            aria-label="Remove exercise"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <button type="button" onClick={addExercise} className="text-green-400 underline mt-3">+ Lisää liike</button>
                </div>
                <button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg font-bold w-full">
                    {saving ? "Ladataan..." : "Tallenna treeni"}
                </button>
            </form>
        </div>
    );
};

export default NewWorkout;