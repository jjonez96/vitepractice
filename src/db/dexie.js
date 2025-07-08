import Dexie from 'dexie';

export const db = new Dexie("WorkoutTrackerDB");

db.version(1).stores({
    workouts: "++id, date",
    data: "++id, workoutId, exercise, reps, sets, weight"
});