import { useState } from "react";

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

export function useExerciseInputs() {
    const [data, setData] = useState(getInitialData);

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

    const resetData = () => {
        setData([{ exercise: "", reps: 8, sets: 2, weight: "" }]);
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