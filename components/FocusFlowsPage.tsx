import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateFlows } from '../services/geminiService';
import { Flow, Folder, Note } from '../types';
import { LoaderCircle, WandSparkles, ArrowLeft, ThumbsUp, ThumbsDown, Zap, Save, Trash2, History, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SaveNoteModal from './SaveNoteModal';
import ConfirmationModal from './ConfirmationModal';

// --- TYPES ---

interface FlowSession {
    id: string;
    topic: string;
    createdAt: number;
    flows: Flow[];
}

// --- HOOKS ---
const useIsDesktop = () => {
    const [isDesktop, setIsDesktop] = useState(false);
    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 1024px)');
        const handleResize = () => setIsDesktop(mediaQuery.matches);
        handleResize();
        mediaQuery.addEventListener('change', handleResize);
        return () => mediaQuery.removeEventListener('change', handleResize);
    }, []);
    return isDesktop;
};


// --- SUB-COMPONENTS ---

const DashboardView = ({ onGenerate, isGenerating, history, onOpenSession, onDeleteSession }) => {
    const [topic, setTopic] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(topic);
    };

    return (
        <div className="flex-1 flex flex-col items-center p-4">
            <div className="w-full max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <Zap className="w-16 h-16 mx-auto text-blue-500 mb-4" strokeWidth={1.5} />
                    <h1 className="text-4xl font-extrabold text-white">Flow</h1>
                    <p className="mt-2 text-lg text-gray-400">Swipe through bite-sized study content, personalized for you.</p>
                </div>
                <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 sm:p-8 space-y-6">
                    <div>
                        <label htmlFor="topic" className="block text-base font-medium text-gray-300 mb-2">What topic do you want to flow through?</label>
                        <input
                            id="topic"
                            type="text"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            placeholder="e.g., Retina, Glaucoma Medications, Contact Lenses"
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <button type="submit" disabled={!topic.trim() || isGenerating}
                        className="w-full flex items-center justify-center gap-2 text-white bg-blue-700 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg px-5 py-3 text-base font-bold transition-all">
                        {isGenerating ? <LoaderCircle className="animate-spin" size={20} /> : <WandSparkles size={20} />}
                        {isGenerating ? 'Generating Flows...' : 'Start Flow'}
                    </button>
                </form>

                {history.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                           <History size={24}/> Flow History
                        </h2>
                        <div className="space-y-3">
                            {history.map(session => (
                                <div key={session.id} className="bg-gray-800/60 p-4 rounded-lg flex items-center justify-between group">
                                    <div>
                                        <p className="font-semibold text-gray-200 text-lg">{session.topic}</p>
                                        <p className="text-sm text-gray-400">{new Date(session.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                         <button onClick={() => onOpenSession(session.id)} className="text-base bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                                            Open
                                        </button>
                                        <button onClick={() => onDeleteSession(session.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-full transition-colors">
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


const flowMarkdownComponents = {
    h1: ({node, ...props}) => <h1 className="text-3xl font-bold my-4 text-gray-100" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-2xl font-bold my-3 text-gray-200 border-b border-gray-600 pb-2" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-xl font-semibold my-2 text-gray-200" {...props} />,
    p: ({node, ...props}) => <p className="leading-loose my-4 text-gray-300 text-lg" {...props} />,
    ul: ({node, ...props}) => <ul className="my-4 list-disc pl-6 space-y-3 text-lg" {...props} />,
    ol: ({node, ...props}) => <ol className="my-4 list-decimal pl-6 space-y-3 text-lg" {...props} />,
    li: ({node, ...props}) => <li className="marker:text-blue-500 text-lg" {...props} />,
    strong: ({node, ...props}) => <strong className="font-bold text-sky-400" {...props} />,
    blockquote: ({node, ...props}) => <blockquote className="my-4 border-l-4 border-blue-500 pl-4 py-2 bg-gray-900/50 rounded-r-md italic text-gray-300 text-lg" {...props} />,
    hr: ({node, ...props}) => <hr className="my-5 border-gray-600" {...props} />,
    table: ({node, ...props}) => <div className="my-4 rounded-lg border border-gray-700 overflow-x-auto lg:overflow-visible"><table className="w-full" {...props} /></div>,
    thead: ({node, ...props}) => <thead className="bg-gray-800" {...props} />,
    th: ({node, ...props}) => <th className="px-4 py-2 font-semibold text-blue-300 text-left text-sm uppercase" {...props} />,
    tbody: ({node, ...props}) => <tbody className="divide-y divide-gray-700" {...props} />,
    tr: ({node, ...props}) => <tr className="bg-gray-900/70 hover:bg-gray-800/80" {...props} />,
    td: ({node, ...props}) => <td className="px-4 py-3 align-top text-gray-300 text-base" {...props} />,
};

const FlowCard = ({ flow, onVote, rated, onSave }) => {
    return (
        <div className="w-full h-full p-6 flex flex-col bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
            <div className="flex-1 flex flex-col items-stretch text-left overflow-y-auto pr-2">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4 pb-2 border-b border-gray-700">{flow.title}</h2>
                <div className="max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={flowMarkdownComponents}>{flow.content}</ReactMarkdown>
                </div>
            </div>
            <div className="flex-shrink-0 flex justify-center items-center gap-6 mt-6">
                <button
                    onClick={() => onVote('dislike')}
                    disabled={rated}
                    className={`p-4 rounded-full transition-all duration-200 ${rated && rated !== 'dislike' ? 'opacity-30' : ''} ${rated === 'dislike' ? 'bg-red-500/20 text-red-400 scale-110' : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'}`}
                >
                    <ThumbsDown size={24} />
                </button>
                 <button
                    onClick={onSave}
                    className="p-4 rounded-full transition-all duration-200 bg-gray-700/50 hover:bg-gray-700 text-gray-300"
                >
                    <Save size={24}/>
                </button>
                <button
                    onClick={() => onVote('like')}
                    disabled={rated}
                    className={`p-4 rounded-full transition-all duration-200 ${rated && rated !== 'like' ? 'opacity-30' : ''} ${rated === 'like' ? 'bg-green-500/20 text-green-400 scale-110' : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'}`}
                >
                    <ThumbsUp size={24} />
                </button>
            </div>
        </div>
    );
};

const MotionDiv = motion.div as React.ElementType;

const ViewingView = ({ initialFlows, topic, onBack, onSaveFlow }) => {
    const [flows, setFlows] = useState<Flow[]>(initialFlows);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [preferences, setPreferences] = useState<{ likes: string[], dislikes: string[] }>({ likes: [], dislikes: [] });
    const [ratedStatus, setRatedStatus] = useState<{ [key: string]: 'like' | 'dislike' }>({});
    const isDesktop = useIsDesktop();

    const fetchMoreFlows = async () => {
        if (isFetchingMore) return;
        setIsFetchingMore(true);
        try {
            const newFlows = await generateFlows({ topic, count: 10, likes: preferences.likes, dislikes: preferences.dislikes });
            setFlows(prev => [...prev, ...newFlows.filter(nf => !prev.some(ef => ef.id === nf.id))]); // Avoid duplicates
        } catch (error) {
            console.error("Failed to fetch more flows:", error);
        } finally {
            setIsFetchingMore(false);
        }
    };

    useEffect(() => {
        if (currentIndex > flows.length - 5 && flows.length > 0) {
            fetchMoreFlows();
        }
    }, [currentIndex, flows.length]);

    useEffect(() => {
        if (!isDesktop) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                paginate(-1);
            } else if (e.key === 'ArrowRight') {
                paginate(1);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDesktop, currentIndex, flows, isFetchingMore]);


    const handleVote = (flowId: string, subTopic: string, vote: 'like' | 'dislike') => {
        if (ratedStatus[flowId]) return;

        setRatedStatus(prev => ({ ...prev, [flowId]: vote }));

        if (vote === 'like') {
            setPreferences(prev => ({ ...prev, likes: [...prev.likes, subTopic] }));
        } else {
            setPreferences(prev => ({ ...prev, dislikes: [...prev.dislikes, subTopic] }));
        }
    };
    
    const paginate = (newDirection: number) => {
        const newIndex = currentIndex + newDirection;
        if (newIndex < 0 || (newIndex >= flows.length && !isFetchingMore)) return;
        setDirection(newDirection);
        setCurrentIndex(newIndex);
    };

    const currentFlow = flows[currentIndex];

    if (isDesktop) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-4 relative w-full overflow-hidden">
                <header className="absolute top-0 left-0 w-full p-4 flex items-center justify-between z-20">
                    <button onClick={onBack} className="p-2 bg-gray-700/50 hover:bg-gray-600 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                    <div className="w-full max-w-md mx-auto bg-gray-700/50 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${flows.length > 0 ? ((currentIndex + 1) / flows.length) * 100 : 0}%` }}></div>
                    </div>
                    <div className="w-10"></div>
                </header>

                <div className="w-full flex-1 flex items-center justify-center relative">
                    <AnimatePresence custom={direction}>
                        <MotionDiv
                            key={currentIndex}
                            className="absolute w-full h-full max-w-4xl max-h-[75vh] select-none"
                            custom={direction}
                            variants={{
                                enter: (dir) => ({ x: dir > 0 ? '50%' : '-50%', scale: 0.9, opacity: 0 }),
                                center: { x: 0, scale: 1, opacity: 1, zIndex: 1 },
                                exit: (dir) => ({ x: dir < 0 ? '50%' : '-50%', scale: 0.9, opacity: 0 }),
                            }}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        >
                            {currentFlow && (
                                <FlowCard 
                                    flow={currentFlow} 
                                    onVote={(vote) => handleVote(currentFlow.id, currentFlow.subTopic, vote)} 
                                    rated={ratedStatus[currentFlow.id]}
                                    onSave={() => onSaveFlow(currentFlow)}
                                />
                            )}
                        </MotionDiv>
                        
                        {currentIndex > 0 && (
                            <MotionDiv
                                key={`prev-${currentIndex}`}
                                className="absolute w-full h-full max-w-4xl max-h-[75vh] cursor-pointer select-none"
                                initial={{ x: '-50%', scale: 0.8, opacity: 0 }}
                                animate={{ x: '-60%', scale: 0.8, opacity: 0.7 }}
                                exit={{ x: '-100%', scale: 0.7, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                                onClick={() => paginate(-1)}
                            >
                                <div className="pointer-events-none w-full h-full">
                                    <FlowCard flow={flows[currentIndex - 1]} onVote={()=>{}} rated={null} onSave={()=>{}} />
                                </div>
                            </MotionDiv>
                        )}

                        {currentIndex < flows.length - 1 && (
                            <MotionDiv
                                key={`next-${currentIndex}`}
                                className="absolute w-full h-full max-w-4xl max-h-[75vh] cursor-pointer select-none"
                                initial={{ x: '50%', scale: 0.8, opacity: 0 }}
                                animate={{ x: '60%', scale: 0.8, opacity: 0.7 }}
                                exit={{ x: '100%', scale: 0.7, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                                onClick={() => paginate(1)}
                            >
                                <div className="pointer-events-none w-full h-full">
                                    <FlowCard flow={flows[currentIndex + 1]} onVote={()=>{}} rated={null} onSave={()=>{}} />
                                </div>
                            </MotionDiv>
                        )}
                    </AnimatePresence>
                </div>
                
                <button onClick={() => paginate(-1)} disabled={currentIndex === 0} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-2 bg-gray-700/50 hover:bg-gray-600 rounded-full disabled:opacity-30 transition-opacity">
                    <ArrowLeft size={24}/>
                </button>
                <button onClick={() => paginate(1)} disabled={currentIndex >= flows.length - 1 && !isFetchingMore} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-2 bg-gray-700/50 hover:bg-gray-600 rounded-full disabled:opacity-30 transition-opacity">
                    <ChevronRight size={24}/>
                </button>
            </div>
        );
    }


    // Mobile View
    return (
        <div className="h-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <header className="absolute top-0 left-0 w-full p-4 flex items-center justify-between z-20">
                <button onClick={onBack} className="p-2 bg-gray-700/50 hover:bg-gray-600 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                 <div className="w-full max-w-md mx-auto bg-gray-700/50 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${flows.length > 0 ? ((currentIndex + 1) / flows.length) * 100 : 0}%` }}></div>
                </div>
                <div className="w-10"></div>
            </header>
            
            <AnimatePresence initial={false} custom={direction}>
                <MotionDiv
                    key={currentIndex}
                    custom={direction}
                    variants={{
                        enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0, scale: 0.8, rotate: direction > 0 ? 10 : -10 }),
                        center: { zIndex: 1, x: 0, opacity: 1, scale: 1, rotate: 0 },
                        exit: (direction) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0, scale: 0.8, rotate: direction < 0 ? 10 : -10 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                        scale: { type: "spring", stiffness: 300, damping: 30 },
                        rotate: { type: "spring", stiffness: 300, damping: 30 },
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipe = Math.abs(offset.x) * velocity.x;
                        if (swipe < -10000) {
                            paginate(1);
                        } else if (swipe > 10000) {
                            paginate(-1);
                        }
                    }}
                    className="absolute w-full h-full max-w-2xl max-h-[70vh] my-auto select-none"
                >
                    {currentFlow ? (
                         <FlowCard 
                            flow={currentFlow} 
                            onVote={(vote) => handleVote(currentFlow.id, currentFlow.subTopic, vote)} 
                            rated={ratedStatus[currentFlow.id]}
                            onSave={() => onSaveFlow(currentFlow)}
                         />
                    ) : (
                        isFetchingMore ? <LoaderCircle className="w-12 h-12 animate-spin text-blue-500 m-auto"/> : <p>No more flows.</p>
                    )}
                </MotionDiv>
            </AnimatePresence>
            
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---

const FlowPage: React.FC = () => {
    const [pageState, setPageState] = useState<'dashboard' | 'viewing'>('dashboard');
    const [activeSession, setActiveSession] = useState<FlowSession | null>(null);

    const [history, setHistory] = useState<FlowSession[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [flowToSave, setFlowToSave] = useState<Flow | null>(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    
    const [confirmModalState, setConfirmModalState] = useState<{
        isOpen: boolean;
        title: string;
        message: React.ReactNode;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('flowsHistory');
            if (savedHistory) setHistory(JSON.parse(savedHistory));
            
            const savedFolders = localStorage.getItem('studyFolders');
            const initialFolders = savedFolders ? JSON.parse(savedFolders) : [{ id: 'general', name: 'General' }];
            setFolders(initialFolders);
        } catch (e) {
            console.error("Failed to load data from localStorage", e);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('flowsHistory', JSON.stringify(history));
    }, [history]);

    const handleGenerate = async (selectedTopic: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const flows = await generateFlows({ topic: selectedTopic, count: 15, likes: [], dislikes: [] });
            if (flows.length === 0) throw new Error("No flows were generated. Please try a broader topic.");
            
            const newSession: FlowSession = {
                id: Date.now().toString(),
                topic: selectedTopic,
                createdAt: Date.now(),
                flows: flows,
            };
            
            setHistory(prev => [newSession, ...prev]);
            setActiveSession(newSession);
            setPageState('viewing');
        } catch (e) {
            setError(e.message || "An unknown error occurred.");
            setPageState('dashboard');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleBackToDashboard = () => {
        setPageState('dashboard');
        setActiveSession(null);
        setError(null);
    };
    
    const handleOpenSession = (sessionId: string) => {
        const sessionToOpen = history.find(s => s.id === sessionId);
        if (sessionToOpen) {
            setActiveSession(sessionToOpen);
            setPageState('viewing');
        }
    };

    const handleDeleteSession = (sessionId: string) => {
        const sessionToDelete = history.find(s => s.id === sessionId);
        if (!sessionToDelete) return;

        setConfirmModalState({
            isOpen: true,
            title: "Delete Flow Session",
            message: <>Are you sure you want to delete the session for "<strong>{sessionToDelete.topic}</strong>"?</>,
            onConfirm: () => {
                setHistory(prev => prev.filter(s => s.id !== sessionId));
                setConfirmModalState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };
    
    const handleInitiateSave = (flow: Flow) => {
        setFlowToSave(flow);
        setIsSaveModalOpen(true);
    };

    const handleConfirmSaveNote = (folderId: string | null, newFolderName: string | null) => {
        if (!flowToSave) return;
        
        let finalFolderId = folderId;
        let currentFolders = folders;

        if (newFolderName) {
            const newFolder: Folder = { id: Date.now().toString(), name: newFolderName };
            currentFolders = [...folders, newFolder];
            setFolders(currentFolders);
            finalFolderId = newFolder.id;
        }

        if (!finalFolderId) {
            alert('Error: Could not determine folder to save to.');
            setIsSaveModalOpen(false);
            return;
        }
        
        try {
            const savedNotes: Note[] = JSON.parse(localStorage.getItem('studyNotes') || '[]');
            const newNote: Note = {
                id: Date.now().toString(),
                title: `Flow: ${flowToSave.title}`,
                content: `# ${flowToSave.title}\n\n${flowToSave.content}`,
                createdAt: Date.now(),
                tags: ['flow', flowToSave.subTopic],
                folderId: finalFolderId,
            };
            localStorage.setItem('studyNotes', JSON.stringify([newNote, ...savedNotes]));
            if (newFolderName) {
                localStorage.setItem('studyFolders', JSON.stringify(currentFolders));
            }
            alert(`Flow saved!`);
        } catch (e) {
            console.error("Failed to save note:", e);
        } finally {
            setIsSaveModalOpen(false);
            setFlowToSave(null);
        }
    };

    const renderContent = () => {
        switch(pageState) {
            case 'dashboard':
                return <DashboardView 
                            onGenerate={handleGenerate} 
                            isGenerating={isLoading} 
                            history={history}
                            onOpenSession={handleOpenSession}
                            onDeleteSession={handleDeleteSession}
                        />;
            case 'viewing':
                return <ViewingView 
                            initialFlows={activeSession!.flows} 
                            topic={activeSession!.topic} 
                            onBack={handleBackToDashboard} 
                            onSaveFlow={handleInitiateSave}
                        />;
            default:
                return null;
        }
    };
    
    if (isLoading) return <div className="flex flex-col items-center justify-center h-full text-center text-gray-400"><LoaderCircle className="w-12 h-12 animate-spin text-blue-500" /><h2 className="text-2xl font-bold mt-4">Generating Your First Flows...</h2><p>This may take a moment.</p></div>;
     
    if (error && pageState === 'dashboard') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                 <div className="w-full max-w-2xl mx-auto">
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg mb-6"><p>{error}</p></div>
                    <DashboardView 
                        onGenerate={handleGenerate} 
                        isGenerating={isLoading} 
                        history={history}
                        onOpenSession={handleOpenSession}
                        onDeleteSession={handleDeleteSession}
                    />
                 </div>
            </div>
        );
    }

    return (
        <div className="overflow-y-auto h-full bg-gray-900 text-white flex flex-col">
            <SaveNoteModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} onSave={handleConfirmSaveNote} folders={folders} />
            <ConfirmationModal 
                isOpen={confirmModalState.isOpen}
                onClose={() => setConfirmModalState(prev => ({...prev, isOpen: false}))}
                onConfirm={confirmModalState.onConfirm}
                title={confirmModalState.title}
                message={confirmModalState.message}
                confirmText="Delete"
                confirmVariant="danger"
            />
            {renderContent()}
        </div>
    );
};

export default FlowPage;