import { useState, useEffect } from 'react';
import { db } from '../db/dexie';

export const useSettings = () => {
    const [settings, setSettings] = useState({
        useEnglishNames: false,
        defaultReps: "",
        defaultSets: "",
        defaultWeight: ''
    });

    useEffect(() => {
        loadSettings();

        // Listen for settings changes from other components
        const handleSettingsChange = (event) => {
            setSettings(event.detail);
        };

        window.addEventListener('settingsChanged', handleSettingsChange);

        return () => {
            window.removeEventListener('settingsChanged', handleSettingsChange);
        };
    }, []);

    const loadSettings = async () => {
        try {
            const useEnglishRecord = await db.settings.where('key').equals('useEnglishNames').first();
            const defaultRepsRecord = await db.settings.where('key').equals('defaultReps').first();
            const defaultSetsRecord = await db.settings.where('key').equals('defaultSets').first();
            const defaultWeightRecord = await db.settings.where('key').equals('defaultWeight').first();

            setSettings({
                useEnglishNames: useEnglishRecord?.value || false,
                defaultReps: defaultRepsRecord?.value || "",
                defaultSets: defaultSetsRecord?.value || "",
                defaultWeight: defaultWeightRecord?.value || ''
            });
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const updateSettings = async (newSettings) => {
        try {
            const now = new Date();

            const settingsToSave = [
                { key: 'useEnglishNames', value: newSettings.useEnglishNames },
                { key: 'defaultReps', value: newSettings.defaultReps },
                { key: 'defaultSets', value: newSettings.defaultSets },
                { key: 'defaultWeight', value: newSettings.defaultWeight }
            ];

            for (const setting of settingsToSave) {
                const existingRecord = await db.settings.where('key').equals(setting.key).first();

                if (existingRecord) {
                    await db.settings.update(existingRecord.id, {
                        value: setting.value,
                        updatedAt: now
                    });
                } else {
                    await db.settings.add({
                        key: setting.key,
                        value: setting.value,
                        updatedAt: now
                    });
                }
            }

            setSettings(newSettings);
            window.dispatchEvent(new CustomEvent('settingsChanged', { detail: newSettings }));
        } catch (error) {
            console.error('Error updating settings:', error);
        }
    };

    return { settings, updateSettings, loadSettings };
};
