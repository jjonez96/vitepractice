import { useState, useEffect } from "react";
import { db } from "../db/dexie";

const getDefaultExercise = async () => {
    try {
        const defaultRepsRecord = await db.settings.where('key').equals('defaultReps').first();
        const defaultSetsRecord = await db.settings.where('key').equals('defaultSets').first();
        const defaultWeightRecord = await db.settings.where('key').equals('defaultWeight').first();

        return {
            exercise: "",
            reps: defaultRepsRecord?.value || "",
            sets: defaultSetsRecord?.value || "",
            weight: defaultWeightRecord?.value || ""
        };
    } catch (error) {
        console.error('Error loading settings for default exercise:', error);
        return { exercise: "", reps: "", sets: "", weight: "" };
    }
};

const getInitialData = async () => {
    const saved = localStorage.getItem("nw_data");
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch {
            return [await getDefaultExercise()];
        }
    }
    return [await getDefaultExercise()];
};

export function useExerciseInputs() {
    const [data, setData] = useState([{ exercise: "", reps: "", sets: "", weight: "" }]);
    const [editingRowIdx, setEditingRowIdx] = useState(null); // Track which row is being edited

    // Initialize data asynchronously
    useEffect(() => {
        const initializeData = async () => {
            const initialData = await getInitialData();
            setData(initialData);
        };
        initializeData();
    }, []);

    const handleNumberInputs = (idx, field, value) => {
        setData(data => {
            const newData = data.map((set, i) => i === idx ? { ...set, [field]: value } : set);
            return newData;
        });
    };

    const addExercise = async (inputRefs) => {
        const defaultExercise = await getDefaultExercise();
        setData(prev => {
            const newData = [...prev, defaultExercise];
            return newData;
        });
        const newIndex = data.length;
        setEditingRowIdx(newIndex - 0);

        setTimeout(() => {
            if (inputRefs.current[newIndex]) {
                inputRefs.current[newIndex].focus();

            }
        }, 100);
    };

    const removeSet = (idx, inputRefs) => {
        setData(data => {
            const newData = data.filter((_, i) => i !== idx);
            return newData;
        });
        // After removal, check if there are any empty rows to focus on
        setTimeout(() => {
            const updatedData = data.filter((_, i) => i !== idx);

            // Find the first empty row (exercise field is empty)
            const emptyRowIndex = updatedData.findIndex(set => !set.exercise || set.exercise.trim() === '');

            if (emptyRowIndex !== -1) {
                // Focus on the first empty row found
                setEditingRowIdx(emptyRowIndex);
                setTimeout(() => {
                    if (inputRefs.current[emptyRowIndex]) {
                        inputRefs.current[emptyRowIndex].focus();
                    }
                }, 50);
            } else {
                // No empty rows, don't focus on any row
                setEditingRowIdx(null);
            }
        }, 50);
    };

    return {
        data,
        editingRowIdx,
        setData,
        handleNumberInputs,
        addExercise,
        removeSet,
        setEditingRowIdx,
    };
}