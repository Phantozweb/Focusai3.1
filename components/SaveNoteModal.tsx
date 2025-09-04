
import React, { useState, useEffect } from 'react';
import { Folder } from '../types';
import { Save, X, FolderPlus, BookOpen } from 'lucide-react';

interface SaveNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (folderId: string | null, newFolderName: string | null) => void;
    folders: Folder[];
}

const SaveNoteModal: React.FC<SaveNoteModalProps> = ({ isOpen, onClose, onSave, folders }) => {
    const [selectedFolderId, setSelectedFolderId] = useState('');
    const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    useEffect(() => {
        if(isOpen) {
            // Reset state when modal opens
            const generalFolder = folders.find(f => f.id === 'general');
            setSelectedFolderId(generalFolder ? generalFolder.id : (folders.length > 0 ? folders[0].id : ''));
            setIsCreatingNewFolder(false);
            setNewFolderName('');
        }
    }, [isOpen, folders]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (isCreatingNewFolder) {
            if (newFolderName.trim()) {
                onSave(null, newFolderName.trim());
            } else {
                alert('Please enter a folder name.');
            }
        } else {
            if (!selectedFolderId && folders.length > 0) {
                 // Fallback if somehow no folder is selected
                onSave(folders[0].id, null);
            } else {
                onSave(selectedFolderId, null);
            }
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Save className="text-blue-400" /> Save to Notes</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>

                <div className="space-y-4">
                    {isCreatingNewFolder ? (
                        <div>
                             <label htmlFor="new-folder-name" className="block text-sm font-medium text-gray-300 mb-2">New Folder Name</label>
                             <input 
                                id="new-folder-name" 
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="e.g., Clinical Cases"
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                autoFocus
                             />
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="folder-select" className="block text-sm font-medium text-gray-300 mb-2">Select Folder</label>
                            <select
                                id="folder-select"
                                value={selectedFolderId}
                                onChange={(e) => setSelectedFolderId(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
                            </select>
                        </div>
                    )}

                    <button onClick={() => setIsCreatingNewFolder(!isCreatingNewFolder)} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2">
                        {isCreatingNewFolder ? <BookOpen size={16}/> : <FolderPlus size={16} />}
                        {isCreatingNewFolder ? 'Select existing folder' : 'Create new folder'}
                    </button>
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors">Cancel</button>
                    <button onClick={handleSave} className="py-2 px-4 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors flex items-center gap-2">Save Note</button>
                </div>
            </div>
        </div>
    );
};

export default SaveNoteModal;
