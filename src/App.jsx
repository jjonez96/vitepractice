import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Workouts from "./components/Workouts";
import WorkoutForm from "./components/NewWorkout";
import { Dumbbell } from "lucide-react";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen text-gray-100">
      <Router>
        <nav className="flex items-center gap-2 px-3 py-2 bg-black border-b border-stone-700 shadow ">
          <Dumbbell className="w-7 h-7 text-green-500 mr-2" />
          <Link to="/" className="hover:text-slate-100  hover:bg-[#1d1d1d] hover: rounded-md text-stone-300 duration-500 click:text-white p-2 focus:bg-[#1d1d1d] ">Treenit</Link>
          <Link to="/workout" className="hover:text-slate-100  hover:bg-[#1d1d1d] hover: rounded-md text-stone-300 duration-500 click:text-white p-2 focus:bg-[#1d1d1d]">Uusi Treeni</Link>
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