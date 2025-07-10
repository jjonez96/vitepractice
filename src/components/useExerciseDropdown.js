import { useState } from "react";
const res = await fetch("/exercises.json");
const exercises = await res.json();
export function useExerciseDropdown(data, setData) {
    const [dropdownIdx, setDropdownIdx] = useState(null);
    const [search, setSearch] = useState("");

    const handleDropdown = (idx) => {
        setDropdownIdx(idx);
        if (typeof idx === "number" && data[idx]) {
            setSearch(data[idx].exercise || "");
        }
    };

    const handleSelectExercise = (idx, name) => {
        setData(data => data.map((set, i) => i === idx ? { ...set, exercise: name } : set));
        setDropdownIdx(null);
    };

    const handleSearchChange = (idx, value) => {
        setData(data => {
            const newData = data.map((set, i) => i === idx ? { ...set, exercise: value } : set);
            localStorage.setItem("nw_data", JSON.stringify(newData)); // <-- add this line
            return newData;
        });
        setSearch(value);
    };
    return {
        dropdownIdx,
        search,
        exercises,
        handleDropdown,
        handleSelectExercise,
        handleSearchChange
    };
}
