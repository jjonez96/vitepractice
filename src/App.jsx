import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import Workouts from "./components/Workouts";
import WorkoutForm from "./components/NewWorkout";
import NotesModal from "./components/modals/NotesModal";
import SettingsModal from "./components/modals/SettingsModal";
import { Dumbbell, FileText, Settings } from "lucide-react";
import "./App.css";

function App() {
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  return (
    <div className="min-h-screen text-gray-100">
      <Router>
        <nav className="flex items-center gap-2 px-3 py-2 bg-black border-b border-stone-700 shadow ">
          <Dumbbell className="w-7 h-7 text-green-500 mr-2" />
          <Link to="/" className="hover:text-slate-100  hover:bg-[#1d1d1d] hover: rounded-md text-stone-300 duration-500 click:text-white p-2 focus:bg-[#1d1d1d] ">Treenit</Link>
          <Link to="/workout" className="hover:text-slate-100  hover:bg-[#1d1d1d] hover: rounded-md text-stone-300 duration-500 click:text-white p-2 focus:bg-[#1d1d1d]">Uusi Treeni</Link>
          <div className="ml-auto flex gap-1">
            <button
              onClick={() => setIsNotesModalOpen(true)}
              className="text-green-500 hover:text-green-300 hover:bg-[#1d1d1d] rounded-md duration-500 p-2 focus:bg-[#1d1d1d]"
              title="Muistiinpanot"
            >
              <FileText className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="text-green-500 hover:text-green-300 hover:bg-[#1d1d1d] rounded-md duration-500 p-2 focus:bg-[#1d1d1d]"
              title="Asetukset"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Workouts />} />
          <Route path="/workout" element={<WorkoutForm />} />
        </Routes>

        {/* Notes Modal */}
        <NotesModal
          isOpen={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
        />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      </Router>
    </div>
  );
}

export default App;