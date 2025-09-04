

import React, { useState, useEffect, useMemo } from 'react';
import { Note, Folder } from '../types';
import { generateContent } from '../services/geminiService';
import { Search, Folder as FolderIcon, Tag, Plus, Trash2, FileText, Pencil, Save, X, BookOpen, WandSparkles, FolderPlus, FolderOpen, Maximize, Minimize, Menu, MoreHorizontal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ConfirmationModal from './ConfirmationModal';

const GenerateNoteModal = ({ isOpen, onClose, onGenerate, isGenerating }) => {
    const [keywords, setKeywords] = useState('');
    const [options, setOptions] = useState({
        tables: true,
        mnemonics: true,
        analogies: false,
        caseExamples: false,
        style: 'Detailed',
        level: 'Average (Intermediate)',
    });

    if (!isOpen) return null;

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setOptions(prev => ({ ...prev, [name]: checked }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setOptions(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = () => {
        if (keywords.trim()) {
            onGenerate(keywords, options);
        } else {
            alert("Please enter keywords for your study notes.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 border border-gray-700 flex flex-col max-h-[90vh]">
                <div className="flex-shrink-0 flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><WandSparkles className="text-blue-400" />Generate Notes with AI</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    <p className="text-gray-400">Enter a topic and select options to generate structured study notes.</p>
                    <div>
                        <label htmlFor="keywords" className="block text-base font-medium text-gray-300 mb-2">Topic/Keywords</label>
                        <input
                            id="keywords"
                            type="text"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            placeholder="e.g., Complications of contact lens wear"
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <fieldset>
                        <legend className="text-base font-medium text-gray-300 mb-2">Content Options</legend>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {Object.entries({tables: 'Tables', mnemonics: 'Mnemonics', analogies: 'Analogies', caseExamples: 'Case Examples'}).map(([key, label]) => (
                                <label key={key} className="flex items-center space-x-2 text-gray-200">
                                    <input
                                        type="checkbox"
                                        name={key}
                                        checked={options[key]}
                                        onChange={handleCheckboxChange}
                                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>{label}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <div>
                        <label htmlFor="style" className="block text-base font-medium text-gray-300 mb-2">Note Style</label>
                        <select
                            id="style"
                            name="style"
                            value={options.style}
                            onChange={handleSelectChange}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option>Detailed</option>
                            <option>Clinical Focus</option>
                            <option>Student Friendly</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="level" className="block text-base font-medium text-gray-300 mb-2">Student Level</label>
                        <select
                            id="level"
                            name="level"
                            value={options.level}
                            onChange={handleSelectChange}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option>Beginner</option>
                            <option>Average (Intermediate)</option>
                            <option>Advanced (Topper)</option>
                        </select>
                    </div>
                </div>
                <div className="flex-shrink-0 mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors">Cancel</button>
                    <button onClick={handleGenerate} disabled={isGenerating || !keywords.trim()} className="py-2 px-4 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2">
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const customNoteComponents = {
    h1: ({node, ...props}) => <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-12 pb-6 border-b-2 border-blue-500/30 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-3xl md:text-4xl font-bold text-blue-300 mt-16 mb-8 pb-4 border-b border-gray-700" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-2xl md:text-3xl font-semibold text-cyan-300 mt-12 mb-6" {...props} />,
    h4: ({node, ...props}) => <h4 className="text-xl md:text-2xl font-semibold text-gray-200 mt-10 mb-4" {...props} />,
    p: ({node, ...props}) => <p className="leading-relaxed my-5 text-gray-300 text-base" {...props} />,
    a: ({node, ...props}) => <a className="text-cyan-400 font-medium hover:text-cyan-300 underline" {...props} />,
    strong: ({node, ...props}) => <strong className="text-sky-400 font-bold" {...props} />,
    ul: ({node, ...props}) => <ul className="my-5 list-disc pl-6 space-y-3" {...props} />,
    ol: ({node, ...props}) => <ol className="my-5 list-decimal pl-6 space-y-3" {...props} />,
    li: ({node, ...props}) => <li className="marker:text-blue-500 text-base" {...props} />,
    blockquote: ({node, ...props}) => <blockquote className="my-8 border-l-4 border-blue-500 pl-6 pr-4 py-2 bg-gray-800/50 rounded-r-md italic text-gray-300" {...props} />,
    code: ({node, ...props}) => <code className="bg-gray-700/70 rounded px-2 py-1 font-mono text-sm text-cyan-300" {...props} />,
    pre: ({node, ...props}) => <pre className="bg-black/30 border border-gray-700/50 p-4 my-8 rounded-lg overflow-x-auto" {...props} />,
    hr: ({node, ...props}) => <hr className="my-16 border-t-2 border-gray-700/80" {...props} />,
    table: ({node, ...props}) => (
        <div className="my-10 rounded-xl border border-gray-700 overflow-hidden shadow-lg shadow-black/30">
            <div className="overflow-x-auto">
                <table className="w-full text-base" {...props} />
            </div>
        </div>
    ),
    thead: ({node, ...props}) => <thead className="bg-gray-800" {...props} />,
    th: ({node, ...props}) => <th className="px-6 py-4 font-bold text-blue-300 text-left tracking-wider uppercase text-sm" {...props} />,
    tbody: ({node, ...props}) => <tbody className="divide-y divide-gray-700" {...props} />,
    tr: ({node, ...props}) => <tr className="bg-gray-900/70 hover:bg-gray-800/80 transition-colors duration-150" {...props} />,
    td: ({node, ...props}) => <td className="px-6 py-4 align-top text-gray-300 text-base" {...props} />,
    img: ({node, ...props}) => <img className="rounded-lg shadow-lg my-6 mx-auto" {...props} />
};


const StudyNotesPage: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [activeFolderId, setActiveFolderId] = useState<string>('all');
    
    const [isEditing, setIsEditing] = useState(false);
    const [editableContent, setEditableContent] = useState('');
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    const [openFolderMenuId, setOpenFolderMenuId] = useState<string | null>(null);
    const [renamingFolder, setRenamingFolder] = useState<Folder | null>(null);
    const [newTag, setNewTag] = useState('');

    const [confirmModalState, setConfirmModalState] = useState<{
        isOpen: boolean;
        title: string;
        message: React.ReactNode;
        onConfirm: () => void;
        confirmText?: string;
        confirmVariant?: 'danger' | 'primary';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    useEffect(() => {
        try {
            const savedNotes = localStorage.getItem('studyNotes');
            if (savedNotes) setNotes(JSON.parse(savedNotes));

            const savedFolders = localStorage.getItem('studyFolders');
            if (savedFolders) {
                const parsedFolders = JSON.parse(savedFolders);
                if (parsedFolders.length > 0) {
                   setFolders(parsedFolders);
                } else {
                   const defaultFolders = [{ id: 'general', name: 'General' }];
                   setFolders(defaultFolders);
                }
            } else {
                const defaultFolders = [{ id: 'general', name: 'General' }];
                setFolders(defaultFolders);
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('studyNotes', JSON.stringify(notes));
    }, [notes]);

    useEffect(() => {
        localStorage.setItem('studyFolders', JSON.stringify(folders));
    }, [folders]);

    const allTags = useMemo(() => Array.from(new Set(notes.flatMap(note => note.tags))), [notes]);
    const currentNote = useMemo(() => notes.find(n => n.id === currentNoteId), [notes, currentNoteId]);

    const filteredNotes = useMemo(() => {
        return notes.filter(note => {
            const matchesFolder = activeFolderId === 'all' || note.folderId === activeFolderId;
            const matchesTag = activeTag === null || note.tags.includes(activeTag);
            const matchesSearch = searchQuery === '' ||
                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.content.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFolder && matchesTag && matchesSearch;
        }).sort((a, b) => b.createdAt - a.createdAt);
    }, [notes, activeFolderId, activeTag, searchQuery]);

    const closeConfirmModal = () => {
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
    };

    const initiateDeleteNote = (noteId: string) => {
        const noteToDelete = notes.find(n => n.id === noteId);
        if (!noteToDelete) return;
        setConfirmModalState({
            isOpen: true,
            title: "Delete Note",
            message: <>Are you sure you want to permanently delete the note "<strong>{noteToDelete.title}</strong>"? This action cannot be undone.</>,
            onConfirm: () => {
                setNotes(prevNotes => prevNotes.filter(n => n.id !== noteId));
                if (currentNoteId === noteId) {
                    setCurrentNoteId(null);
                    setIsEditing(false);
                }
                closeConfirmModal();
            },
            confirmText: "Delete",
            confirmVariant: "danger",
        });
    };

    const initiateDeleteFolder = (folderId: string) => {
        const folderToDelete = folders.find(f => f.id === folderId);
        if (!folderToDelete) return;
        setConfirmModalState({
            isOpen: true,
            title: "Delete Folder",
            message: <>Are you sure you want to delete the folder "<strong>{folderToDelete.name}</strong>"? All notes inside will be moved to the "General" folder.</>,
            onConfirm: () => {
                setFolders(folders.filter(f => f.id !== folderId));
                setNotes(notes.map(n => n.folderId === folderId ? { ...n, folderId: 'general' } : n));
                if (activeFolderId === folderId) {
                    setActiveFolderId('general');
                }
                setOpenFolderMenuId(null);
                closeConfirmModal();
            },
            confirmText: "Delete",
            confirmVariant: "danger",
        });
    };

    const handleCreateNewNote = () => {
        const defaultFolderId = (activeFolderId !== 'all' && activeFolderId) || 'general';
        const newNote: Note = {
            id: Date.now().toString(),
            title: 'Untitled Note',
            content: '# New Note\n\nStart writing here...',
            createdAt: Date.now(),
            tags: [],
            folderId: folders.find(f => f.id === defaultFolderId) ? defaultFolderId : 'general',
        };
        setNotes(prev => [newNote, ...prev]);
        setCurrentNoteId(newNote.id);
        setIsEditing(true);
        setEditableContent(newNote.content);
        setIsMobileNavOpen(false);
    };

    const handleGenerateNote = async (keywords: string, options: any) => {
        setIsGenerating(true);
        const prompt = `You are an expert at creating study materials for optometry students. Your task is to generate comprehensive, well-structured study notes on the topic of "${keywords}".

The output MUST be in markdown format.

**Note Style:** ${options.style}
**Student Level:** ${options.level}

**Required Elements (include where relevant):**
${options.tables ? "- Tables: To compare and contrast concepts.\n" : ""}
${options.mnemonics ? "- Mnemonics: To aid in memorization.\n" : ""}
${options.analogies ? "- Analogies: To explain complex ideas simply.\n" : ""}
${options.caseExamples ? "- Case Examples: To provide clinical context.\n" : ""}

**Formatting Rules:**
- Use a main title (e.g., '# Main Topic').
- Use section headings (e.g., '## Section 1', '### Subsection 1.1').
- Use bullet points (\`*\`) or numbered lists (\`1.\`) for key information, symptoms, or steps.
- Use bold text (\`**...**\`) for important keywords and definitions.
- Use blockquotes (\`>\`) for clinical tips or important asides.
- Use tables to compare and contrast different conditions, medications, or techniques.
- Use horizontal rules (\`---\`) to create clear visual separation between major sections.

IMPORTANT: Your response MUST contain ONLY the raw markdown content for the notes. Do not include any introductory sentences, conversational text, or summaries before or after the markdown content.`;
        try {
            const content = await generateContent(prompt);
            const defaultFolderId = (activeFolderId !== 'all' && activeFolderId) || 'general';
            const newNote: Note = {
                id: Date.now().toString(),
                title: keywords,
                content,
                createdAt: Date.now(),
                tags: [],
                folderId: folders.find(f => f.id === defaultFolderId) ? defaultFolderId : 'general',
            };
            setNotes(prev => [newNote, ...prev]);
            setCurrentNoteId(newNote.id);
            setShowGenerateModal(false);
            setIsMobileNavOpen(false);
        } catch (error) {
            alert('Failed to generate notes. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSaveEdit = () => {
        if (!currentNote) return;
        const updatedNote = { ...currentNote, content: editableContent, lastEditedAt: Date.now() };
        setNotes(prev => prev.map(n => n.id === currentNoteId ? updatedNote : n));
        setIsEditing(false);
    };
    
    useEffect(() => {
        if (currentNote && isEditing) {
            setEditableContent(currentNote.content);
        }
    }, [currentNote, isEditing]);

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return;
        const newFolder = { id: Date.now().toString(), name: newFolderName.trim() };
        setFolders(prev => [...prev, newFolder]);
        setNewFolderName('');
        setIsCreatingFolder(false);
    };

    const handleSelectNote = (noteId: string) => {
        setCurrentNoteId(noteId);
        setIsEditing(false);
        setIsMobileNavOpen(false);
    };
    
    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && currentNote && newTag.trim()) {
            e.preventDefault();
            const tagToAdd = newTag.trim().toLowerCase();
            if (!currentNote.tags.includes(tagToAdd)) {
                const updatedNote = { ...currentNote, tags: [...currentNote.tags, tagToAdd] };
                setNotes(notes.map(n => n.id === currentNote.id ? updatedNote : n));
            }
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        if (!currentNote) return;
        const updatedTags = currentNote.tags.filter(t => t !== tagToRemove);
        const updatedNote = { ...currentNote, tags: updatedTags };
        setNotes(notes.map(n => n.id === currentNote.id ? updatedNote : n));
    };
    
    const handleMoveNote = (folderId: string) => {
        if (!currentNote) return;
        setNotes(notes.map(n => n.id === currentNote.id ? { ...n, folderId } : n));
    };

    const handleStartRenameFolder = (folder: Folder) => {
        setRenamingFolder(folder);
        setOpenFolderMenuId(null);
    };

    const handleConfirmRenameFolder = () => {
        if (!renamingFolder || !renamingFolder.name.trim()) {
            setRenamingFolder(null);
            return;
        }
        setFolders(folders.map(f => f.id === renamingFolder.id ? { ...f, name: renamingFolder.name.trim() } : f));
        setRenamingFolder(null);
    };
    
    return (
        <div className="flex h-full w-full bg-gray-900 text-gray-300 relative overflow-hidden">
            <ConfirmationModal 
                isOpen={confirmModalState.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModalState.onConfirm}
                title={confirmModalState.title}
                message={confirmModalState.message}
                confirmText={confirmModalState.confirmText}
                confirmVariant={confirmModalState.confirmVariant}
            />
            <GenerateNoteModal isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} onGenerate={handleGenerateNote} isGenerating={isGenerating} />
            
            {isMobileNavOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-30" 
                    onClick={() => setIsMobileNavOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div className={`
                absolute top-0 left-0 h-full z-40
                flex w-[calc(100%-3rem)] max-w-lg bg-gray-900
                transition-transform duration-300 ease-in-out
                ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'}
                ${isFullScreen ? 'hidden' : 'flex'}
            `}>
                <div className="w-64 border-r border-gray-700/50 p-4 flex-col gap-6 flex overflow-y-auto">
                    <div className="flex flex-col gap-2">
                        <button onClick={() => setShowGenerateModal(true)} className="w-full flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-500 rounded-md px-3 py-2 text-sm font-semibold transition-colors">
                            <WandSparkles size={16}/> Generate Notes
                        </button>
                    </div>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search notes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-md pl-9 pr-3 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-400 mb-2 px-1 flex items-center gap-2"><FolderIcon size={16} />Folders</h3>
                        <div className="flex flex-col gap-1">
                            <button onClick={() => setActiveFolderId('all')} className={`w-full text-left px-3 py-2 text-base rounded-md flex items-center gap-2 ${activeFolderId === 'all' ? 'bg-blue-600/30 text-white' : 'hover:bg-gray-700/50'}`}>
                                <BookOpen size={16} /> All Notes
                            </button>
                            {folders.map(folder => (
                                <div key={folder.id} className="relative group">
                                {renamingFolder?.id === folder.id ? (
                                    <input
                                        type="text"
                                        value={renamingFolder.name}
                                        onChange={e => setRenamingFolder({...renamingFolder, name: e.target.value})}
                                        onBlur={handleConfirmRenameFolder}
                                        onKeyDown={e => e.key === 'Enter' && handleConfirmRenameFolder()}
                                        className="w-full bg-gray-700 border-gray-600 rounded-md px-2 py-1.5 text-sm"
                                        autoFocus
                                    />
                                ) : (
                                    <button onClick={() => setActiveFolderId(folder.id)} className={`w-full text-left px-3 py-2 text-base rounded-md flex items-center gap-2 truncate ${activeFolderId === folder.id ? 'bg-blue-600/30 text-white' : 'hover:bg-gray-700/50'}`}>
                                        <FolderOpen size={16} /> {folder.name}
                                    </button>
                                )}
                                {folder.id !== 'general' && !renamingFolder && (
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setOpenFolderMenuId(openFolderMenuId === folder.id ? null : folder.id)} className="p-1 rounded-md hover:bg-gray-600"><MoreHorizontal size={16}/></button>
                                    </div>
                                )}
                                {openFolderMenuId === folder.id && (
                                    <div className="absolute z-10 right-0 mt-1 w-32 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1">
                                        <button onClick={() => handleStartRenameFolder(folder)} className="w-full text-left px-3 py-1 text-sm hover:bg-gray-700">Rename</button>
                                        <button onClick={() => initiateDeleteFolder(folder.id)} className="w-full text-left px-3 py-1 text-sm text-red-400 hover:bg-gray-700">Delete</button>
                                    </div>
                                )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-2">
                            {isCreatingFolder ? (
                                <div className="flex gap-1">
                                    <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="New folder name" className="w-full bg-gray-800 border-gray-700 rounded-md px-2 py-1 text-sm" autoFocus onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}/>
                                    <button onClick={() => setIsCreatingFolder(false)} className="p-1 hover:bg-gray-700 rounded-md"><X size={16}/></button>
                                </div>
                            ) : (
                                <button onClick={() => setIsCreatingFolder(true)} className="w-full text-left px-3 py-2 text-base rounded-md hover:bg-gray-700/50 flex items-center gap-2 text-gray-400">
                                    <FolderPlus size={16} /> New Folder
                                </button>
                            )}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-400 mb-2 px-1 flex items-center gap-2"><Tag size={16} />Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setActiveTag(null)} className={`px-3 py-1 text-sm rounded-full ${activeTag === null ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>All</button>
                            {allTags.map(tag => (
                                <button key={tag} onClick={() => setActiveTag(tag)} className={`px-3 py-1 text-sm rounded-full ${activeTag === tag ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{tag}</button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="w-80 border-r border-gray-700/50 p-4 flex-col flex">
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <h2 className="text-lg font-bold text-white truncate pr-2">{(folders.find(f => f.id === activeFolderId)?.name || 'All')} Notes</h2>
                        <button onClick={handleCreateNewNote} className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"><Plus size={18} /></button>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {filteredNotes.map(note => (
                             <div key={note.id} className={`relative group w-full rounded-lg mb-2 transition-colors ${currentNoteId === note.id ? 'bg-blue-900/50' : 'hover:bg-gray-800/80'}`}>
                                <div onClick={() => handleSelectNote(note.id)} className="p-3 cursor-pointer">
                                    <h4 className="font-semibold text-gray-100 truncate pr-8 text-base">{note.title}</h4>
                                    <p className="text-sm text-gray-400 mt-1">{new Date(note.createdAt).toLocaleDateString()}</p>
                                    <div className="flex gap-2 mt-2">
                                        {note.tags.slice(0, 3).map(tag => <span key={tag} className="px-1.5 py-0.5 text-sm bg-gray-700 rounded-full">{tag}</span>)}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        initiateDeleteNote(note.id);
                                    }}
                                    className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-gray-700/50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                    aria-label={`Delete note: ${note.title}`}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <main className="flex-1 p-0 flex flex-col overflow-y-auto relative">
                <div className="absolute top-4 left-4 z-20">
                    <button 
                        onClick={() => setIsMobileNavOpen(true)} 
                        className="text-gray-300 hover:text-white bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 p-2 rounded-md shadow-lg"
                        aria-label="Open notes navigation"
                    >
                        <BookOpen size={22} />
                    </button>
                </div>
                {currentNote ? (
                    <div className={`w-full flex-1 flex flex-col ${isFullScreen ? '' : 'max-w-4xl mx-auto'}`}>
                        <div className="flex-shrink-0 p-4 lg:px-8 border-b border-gray-700/50 space-y-4">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-3 flex-1 overflow-hidden pl-14">
                                    <h1 className="text-xl lg:text-2xl font-bold text-white truncate">{currentNote.title}</h1>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {isEditing ? (
                                        <>
                                            <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded-md text-sm font-semibold"><X size={16} /> Cancel</button>
                                            <button onClick={handleSaveEdit} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-semibold"><Save size={16} /> Save</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md">
                                                {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
                                            </button>
                                            <button onClick={() => initiateDeleteNote(currentNote.id)} className="p-2 text-red-400 hover:text-white hover:bg-red-500/80 rounded-md"><Trash2 size={18} /></button>
                                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-semibold"><Pencil size={16} /> Edit</button>
                                        </>
                                    )}
                                </div>
                            </div>
                             <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                     <FolderIcon size={16} className="text-gray-400"/>
                                     <select value={currentNote.folderId} onChange={(e) => handleMoveNote(e.target.value)} className="bg-gray-700/80 border-none rounded-md py-1 pl-2 pr-8 text-sm focus:ring-1 focus:ring-blue-500">
                                        {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                     </select>
                                </div>
                                <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                     <Tag size={16} className="text-gray-400 flex-shrink-0"/>
                                     <div className="flex items-center gap-2 overflow-x-auto py-1">
                                        {currentNote.tags.map(tag => (
                                            <span key={tag} className="flex-shrink-0 flex items-center gap-1.5 bg-gray-700 text-gray-200 px-2 py-0.5 rounded-full">
                                                {tag}
                                                <button onClick={() => handleRemoveTag(tag)} className="text-gray-400 hover:text-white"><X size={12}/></button>
                                            </span>
                                        ))}
                                        <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={handleAddTag} placeholder="+ Add tag" className="bg-transparent focus:outline-none w-24"/>
                                     </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 lg:px-8">
                             {isEditing ? (
                                <textarea value={editableContent} onChange={e => setEditableContent(e.target.value)} className="w-full h-full bg-transparent border-none rounded-md p-0 my-6 text-gray-200 focus:ring-0 focus:outline-none leading-relaxed text-base"></textarea>
                            ) : (
                                <article className="w-full py-6">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={customNoteComponents}>
                                    {currentNote.content}
                                    </ReactMarkdown>
                                </article>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
                        <FileText size={48} className="mb-4" />
                        <h2 className="text-2xl font-bold text-gray-400">No Note Selected</h2>
                        <p className="mt-2 max-w-sm">Select a note from the list to view it, or create a new one to get started.</p>
                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                            <button onClick={() => setShowGenerateModal(true)} className="flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-500 rounded-md px-4 py-2 font-semibold transition-colors">
                                <WandSparkles size={16}/> Generate with AI
                            </button>
                            <button onClick={handleCreateNewNote} className="flex items-center justify-center gap-2 text-white bg-gray-700 hover:bg-gray-600 rounded-md px-4 py-2 font-semibold transition-colors">
                                <Plus size={16}/> Create New Note
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default StudyNotesPage;