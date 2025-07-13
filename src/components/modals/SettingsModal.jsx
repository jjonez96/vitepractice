import { useState, useEffect } from 'react';
import { X, Save, Settings } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

const SettingsModal = ({ isOpen, onClose }) => {
    const { settings, updateSettings } = useSettings();
    const [useEnglishNames, setUseEnglishNames] = useState(false);
    const [defaultReps, setDefaultReps] = useState('');
    const [defaultSets, setDefaultSets] = useState('');
    const [defaultWeight, setDefaultWeight] = useState('');
    const [saving, setSaving] = useState(false);

    // Load settings when modal opens or settings change
    useEffect(() => {
        if (isOpen) {
            setUseEnglishNames(settings.useEnglishNames || false);
            setDefaultReps(settings.defaultReps || '');
            setDefaultSets(settings.defaultSets || '');
            setDefaultWeight(settings.defaultWeight || '');
        }
    }, [isOpen, settings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Use the updateSettings method from the hook
            await updateSettings({
                useEnglishNames,
                defaultSets: Number(defaultSets) || '',
                defaultReps: Number(defaultReps) || '',
                defaultWeight
            });

            onClose();
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-black border border-stone-700 rounded-xl shadow-xl w-full max-w-md flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-stone-700">
                        <div className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-green-500" />
                            <h2 className="text-lg font-semibold text-white">Asetukset</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-stone-400 hover:text-white duration-500 p-1 rounded"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-4 space-y-4 ">
                        <div className="space-y-2 border-b border-stone-700 pb-5">
                            <h3 className="text-sm font-medium text-white">Liikkeiden kielet</h3>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="language"
                                        checked={!useEnglishNames}
                                        onChange={() => setUseEnglishNames(false)}
                                        className="w-4 h-4 text-green-500"
                                    />
                                    <span className="text-stone-300">Suomi (Penkkipunnerrus)</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="language"
                                        checked={useEnglishNames}
                                        onChange={() => setUseEnglishNames(true)}
                                        className="w-4 h-4 text-green-500"
                                    />
                                    <span className="text-stone-300">English (Bench press)</span>
                                </label>
                            </div>
                        </div>
                        <div className="space-y-3 ">
                            <h3 className="text-sm font-medium text-white">Liikkeiden oletusarvot</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs text-stone-400 mb-1">Sarjat</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={defaultSets}
                                        onChange={(e) => setDefaultSets(e.target.value)}
                                        className="w-full px-2 py-1 bg-black border border-stone-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-stone-400 mb-1">Toistot</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={defaultReps}
                                        onChange={(e) => setDefaultReps(e.target.value)}
                                        className="w-full px-2 py-1 bg-black border border-stone-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-stone-400 mb-1">Paino (kg)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={defaultWeight}
                                        onChange={(e) => setDefaultWeight(e.target.value)}
                                        className="w-full px-2 py-1 bg-black border border-stone-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 p-4 border-t border-stone-700">

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
        </>
    );
};

export default SettingsModal;
