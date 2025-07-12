import Dexie from 'dexie';

export const db = new Dexie("WorkoutTrackerDB");

db.version(1).stores({
    workouts: "++id, date",
    data: "++id, workoutId, exercise, reps, sets, weight"
});

db.version(2).stores({
    workouts: "++id, date",
    data: "++id, workoutId, exercise, reps, sets, weight",
    notes: "++id, content, createdAt, updatedAt"
});

db.version(3).stores({
    workouts: "++id, date",
    data: "++id, workoutId, exercise, reps, sets, weight",
    notes: "++id, content, createdAt, updatedAt",
    settings: "++id, key, value, updatedAt"
});