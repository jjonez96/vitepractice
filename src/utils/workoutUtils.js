import { db } from "../db/dexie";

export const saveWorkout = async (workoutData, isEditing = false) => {
    const { date, sets, note, workoutId } = workoutData;

    // Validate data with more specific error messages
    const emptySets = sets.filter(s => !s.exercise || s.reps === "" || s.sets === "");
    if (emptySets.length > 0) {
        throw new Error("Täytä kaikki kentät ennen tallentamista 📝");
    }

    const negativeSets = sets.filter(s => Number(s.reps) < 0 || Number(s.sets) < 0 || Number(s.weight) < 0);
    if (negativeSets.length > 0) {
        throw new Error("Negatiiviset arvot eivät ole sallittuja ❌");
    }

    const invalidNumbers = sets.filter(s =>
        isNaN(Number(s.reps)) || isNaN(Number(s.sets)) ||
        (s.weight !== "" && isNaN(Number(s.weight)))
    );
    if (invalidNumbers.length > 0) {
        throw new Error("Syötä kelvollisia numeroita 🔢");
    }

    if (isEditing) {
        // Editing existing workout
        const originalSets = await db.data.where('workoutId').equals(workoutId).toArray();
        const editSetIds = sets.filter(s => s.id).map(s => s.id);

        // Delete sets that were removed
        for (const originalSet of originalSets) {
            if (!editSetIds.includes(originalSet.id)) {
                await db.data.delete(originalSet.id);
            }
        }

        // Update or add sets
        for (const s of sets) {
            if (s.id) {
                await db.data.update(s.id, {
                    exercise: s.exercise,
                    reps: Number(s.reps),
                    sets: Number(s.sets),
                    weight: Number(s.weight)
                });
            } else {
                // New row, add to DB
                await db.data.add({
                    exercise: s.exercise,
                    reps: Number(s.reps),
                    sets: Number(s.sets),
                    weight: Number(s.weight),
                    workoutId: workoutId
                });
            }
        }

        // Update workout with note and date
        await db.workouts.update(workoutId, {
            note: note || "",
            date: date || new Date().toISOString().slice(0, 10)
        });

        return workoutId;
    } else {
        // Creating new workout
        const newWorkoutId = await db.workouts.add({ date, note: note || "" });

        // Add sets one by one to avoid bulk errors
        for (const s of sets.filter(s => s.exercise && s.reps && s.sets)) {
            await db.data.add({
                exercise: s.exercise,
                reps: Number(s.reps),
                sets: Number(s.sets),
                weight: Number(s.weight) || 0,
                workoutId: newWorkoutId
            });
        }

        return newWorkoutId;
    }
};

export const refreshWorkoutData = async () => {
    const workouts = await db.workouts.orderBy('date').reverse().toArray();
    const data = await db.data.toArray();
    const setsByWorkout = {};
    workouts.forEach(w => {
        setsByWorkout[w.id] = data.filter(s => s.workoutId === w.id);
    });
    return { workouts, setsByWorkout };
};
