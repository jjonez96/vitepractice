import { useState, useEffect } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { db } from '../../db/dexie';
import { useToast } from '../../hooks/useToast';
import Toast from '../Toast';

const NotesModal = ({ isOpen, onClose }) => {
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    // Load notes when modal opens
    useEffect(() => {
        if (isOpen) {
            loadNotes();
        }
    }, [isOpen]);

    const loadNotes = async () => {
        try {
            const noteRecord = await db.notes.orderBy('updatedAt').reverse().first();
            if (noteRecord) {
                setNotes(noteRecord.content);
            }
        } catch (error) {
            console.error('Error loading notes:', error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const now = new Date();
            const existingNote = await db.notes.orderBy('updatedAt').reverse().first();

            if (existingNote) {
                await db.notes.update(existingNote.id, {
                    content: notes,
                    updatedAt: now
                });
            } else {
                await db.notes.add({
                    content: notes,
                    createdAt: now,
                    updatedAt: now
                });
            }

            onClose();
        } catch (error) {
            console.error('Error saving notes:', error);
            showToast('Virhe tallennuksessa ❌', 'error');
        } finally {
            setSaving(false);
        }
    };


    if (!isOpen) return null;
    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-black border border-stone-700 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-stone-700">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-green-500" />
                            <h2 className="text-lg font-semibold text-white">Muistiinpanot</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-stone-400 hover:text-white duration-500 p-1 rounded"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 p-4">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Kirjoita muistiinpanojasi tähän..."
                            className="w-full h-full min-h-[300px] p-3 bg-black border border-stone-700 rounded-lg text-white placeholder-stone-400  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex justify-end gap-2 p-4 border-t border-stone-700">
                        <button className='hover:text-red-700 text-red-600 duration-500 border border-red-600 hover:border-red-700 rounded-lg px-2 py-1 text-sm font-bold' onClick={() => setNotes("")}>Tyhjennä</button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="text-green-400 duration-500 border border-green-600 hover:border-green-400 text-sm py-2 rounded-lg font-bold w-full flex items-center justify-center gap-2"
                        >
                            <Save size={17} />
                            {saving ? 'Tallennetaan...' : 'Tallenna'}
                        </button>
                    </div>
                </div>
            </div>
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />
        </>
    );
};

export default NotesModal;
