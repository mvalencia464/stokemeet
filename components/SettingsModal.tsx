import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [filenamePrefix, setFilenamePrefix] = useState('StokeMeet');
    const [autoDownload, setAutoDownload] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const savedPrefix = localStorage.getItem('stoke_filename_prefix');
            const savedAuto = localStorage.getItem('stoke_auto_download');
            if (savedPrefix) setFilenamePrefix(savedPrefix);
            if (savedAuto) setAutoDownload(JSON.parse(savedAuto));
        }
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem('stoke_filename_prefix', filenamePrefix);
        localStorage.setItem('stoke_auto_download', JSON.stringify(autoDownload));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-zinc-100">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Settings</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-50 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-zinc-900">
                            Default Download Filename Prefix
                        </label>
                        <input
                            type="text"
                            value={filenamePrefix}
                            onChange={(e) => setFilenamePrefix(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all font-medium"
                            placeholder="e.g. StokeMeet"
                        />
                        <p className="text-xs text-zinc-500">
                            Files will be saved as <span className="font-mono bg-zinc-100 px-1 py-0.5 rounded text-zinc-700">{filenamePrefix}_MeetingTitle.txt</span>
                        </p>
                    </div>

                    <div className="pt-2">
                        <label className="flex items-start gap-4 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={autoDownload}
                                    onChange={(e) => setAutoDownload(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-zinc-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-900"></div>
                            </div>
                            <div className="flex-1">
                                <span className="block text-sm font-bold text-zinc-900 mb-0.5">Auto-Download Transcripts</span>
                                <span className="text-xs text-zinc-500 leading-relaxed block">
                                    Automatically download the transcript text file when a recording ends.
                                </span>
                            </div>
                        </label>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex gap-3">
                        <svg className="w-5 h-5 text-yellow-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <p className="text-xs text-yellow-800 leading-relaxed">
                            <span className="font-bold">Note on Folders:</span> Browser security prevents us from saving directly to a specific folder. Files will save to your browser's default Downloads location.
                        </p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-zinc-600 font-bold text-sm bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 bg-zinc-900 text-white font-bold text-sm rounded-xl hover:bg-zinc-800 transition-all shadow-lg active:scale-[0.98]"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
