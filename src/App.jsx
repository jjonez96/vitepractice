import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Workouts from "./components/Workouts";
import WorkoutForm from "./components/NewWorkout";
import { Dumbbell } from "lucide-react";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Router>
        <nav className="flex items-center gap-4 px-6 py-4 bg-gray-950 shadow mb-8">
          <Dumbbell className="w-7 h-7 text-green-400 mr-2" />

          <Link to="/" className="hover:underline text-gray-100">Treenit</Link>
          <Link to="/workout" className="hover:underline text-gray-100">Uusi Treeni</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Workouts />} />
          <Route path="/workout" element={<WorkoutForm />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;