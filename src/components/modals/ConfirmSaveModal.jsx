
import { Trash2, X, Save, NotebookPen, ChevronUp, ChevronDown } from "lucide-react";

const ConfirmSaveModal = ({ onClose, setShowConfirmClose, handleSave }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
            <div className="bg-black border border-stone-700 rounded-xl shadow-lg p-4 max-w-sm w-full mx-auto flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2">
                    <div className="flex-1 text-lg font-bold text-white text-center">Oletko varma?</div>
                    <button
                        className="text-stone-400 hover:text-white duration-500 p-1 rounded"
                        onClick={() => {
                            setShowConfirmClose(false);
                        }}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-stone-300 mb-6 text-center">Sinulla on tallentamattomia muutoksia. Haluatko varmasti sulkea?</div>
                <div className="flex gap-4">
                    <button
                        className="duration-500 border text-sm py-2 px-2 rounded-lg font-bold flex items-center justify-center gap-1 text-red-500 border-red-600 hover:border-red-400"
                        onClick={() => {
                            setShowConfirmClose(false);
                            onClose();
                        }}
                    >
                        <X size={17} />
                        Älä tallenna
                    </button>
                    <button
                        className="duration-500 border text-sm py-2 px-2 rounded-lg font-bold flex items-center justify-center gap-1 text-green-500 border-green-600 hover:border-green-400"
                        onClick={
                            () => {
                                setShowConfirmClose(false);
                                handleSave();
                            }
                        }
                    >
                        <Save size={17} />
                        Tallenna
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmSaveModal