import { Trash2, X } from "lucide-react";

const DeleteConfirmationModal = ({
    isOpen,
    onConfirm,
    onCancel,
    title = "Haluatko varmasti poistaa tämän sisällön?"
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-black border border-stone-700 p-3 rounded-xl shadow-lg max-w-xs w-full text-center mx-4">
                <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
                <div className="flex justify-center gap-4 mt-2">
                    <button
                        className="hover:text-red-700 text-red-600 duration-500 border border-red-600 hover:border-red-700 rounded px-2 py-1 text-sm shadow flex items-center justify-center gap-1"
                        onClick={onConfirm}
                    >
                        <Trash2 size={15} />
                        Kyllä
                    </button>
                    <button
                        className="px-2 hover:text-white text-stone-400 duration-500 border border-stone-400 hover:border-white rounded shadow text-sm flex items-center justify-center gap-1"
                        onClick={onCancel}
                    >
                        <X size={15} />
                        Peruuta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
