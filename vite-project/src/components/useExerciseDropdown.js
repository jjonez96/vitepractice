import { useState } from "react";
const res = await fetch("/exercises.json");
const exercises = await res.json();
export function useExerciseDropdown(sets, setSets) {
    const [dropdownIdx, setDropdownIdx] = useState(null);
    const [search, setSearch] = useState("");

    const handleDropdown = (idx) => {
        setDropdownIdx(idx);
        if (typeof idx === "number" && sets[idx]) {
            setSearch(sets[idx].exercise || "");
        }
    };

    const handleSelectExercise = (idx, name) => {
        setSets(sets => sets.map((set, i) => i === idx ? { ...set, exercise: name } : set));
        setDropdownIdx(null);
    };

    const handleSearchChange = (idx, value) => {
        setSets(sets => sets.map((set, i) => i === idx ? { ...set, exercise: value } : set));
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
