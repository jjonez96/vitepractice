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

    // Initialize data asynchronously
    useEffect(() => {
        const initializeData = async () => {
            const initialData = await getInitialData();
            setData(initialData);
        };
        initializeData();
    }, []);

    const handleSetChange = (idx, field, value) => {
        setData(data => {
            const newData = data.map((set, i) => i === idx ? { ...set, [field]: value } : set);
            localStorage.setItem("nw_data", JSON.stringify(newData));
            return newData;
        });
    };

    const addExercise = async () => {
        const defaultExercise = await getDefaultExercise();
        setData(prev => {
            const newData = [...prev, defaultExercise];
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

    const resetData = async () => {
        const defaultExercise = await getDefaultExercise();
        setData([defaultExercise]);
        localStorage.removeItem("nw_data");
    };

    return {
        data,
        setData,
        handleSetChange,
        addExercise,
        removeSet,
        resetData
    };
}