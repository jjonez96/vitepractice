import { useState, useEffect, useRef } from "react";

export function useExerciseDropdown(data, setData, saveToLocalStorage = true) {
    const [dropdownIdx, setDropdownIdx] = useState(null);
    const [search, setSearch] = useState("");
    const [exercises, setExercises] = useState([]);
    const inputRefs = useRef([]);

    useEffect(() => {
        fetch("/exercises.json")
            .then(res => res.json())
            .then(setExercises)
            .catch(() => setExercises([]));

    }, []);
    const handleDropdown = (idx) => {
        setDropdownIdx(idx);
        if (typeof idx === "number" && data[idx]) {
            setSearch(data[idx].exercise || "");
        }
    };

    const handleSelectExercise = (idx, value) => {
        setData(data => {
            const newData = data.map((set, i) => i === idx ? { ...set, exercise: value } : set);
            if (saveToLocalStorage) {
                localStorage.setItem("nw_data", JSON.stringify(newData));
            }
            return newData;
        });
        setDropdownIdx(null);
    };

    const handleSearchChange = (idx, value) => {
        setData(data => {
            const newData = data.map((set, i) => i === idx ? { ...set, exercise: value } : set);
            if (saveToLocalStorage) {
                localStorage.setItem("nw_data", JSON.stringify(newData));
            }
            return newData;
        });
        setSearch(value);
    };

    useEffect(() => {
        const handleClick = (e) => {
            const input = inputRefs.current[dropdownIdx];
            if (
                input &&
                !input.contains(e.target) &&
                !document.getElementById(`dropdown-${dropdownIdx}`)?.contains(e.target)
            ) {
                handleDropdown(null);
            }
        };
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [dropdownIdx, handleDropdown]);

    return {
        dropdownIdx,
        search,
        exercises,
        handleDropdown,
        handleSelectExercise,
        handleSearchChange,
        inputRefs
    };
}
