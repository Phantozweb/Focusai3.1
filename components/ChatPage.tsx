
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChatMessage, MessageAuthor, Note, Folder, CanvaData, ChatSession, User, HistoryLog, HistoryItemType, CaseStudy, CaseStudyHistoryItem, HistoryItem } from '../types';
import { createChat, generateContent, generateSuggestedQuestions, generateCanva, generateChatTitle } from '../services/geminiService';
import { SendIcon } from './icons/SendIcon';
import { MenuIcon } from './icons/MenuIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { QuestionMarkCircleIcon } from './icons/QuestionMarkCircleIcon';
import { PaperClipIcon } from './icons/PaperClipIcon';
import StudyNotesPage from './StudyNotesPage';
import GuidedStudySessionsPage from './GuidedStudySessionsPage';
import CaseStudiesPage from './CaseStudiesPage';
import CustomisableQuizPage from './CustomisableQuizPage';
import FlowPage from './FocusFlowsPage';
import SaveNoteModal from './SaveNoteModal';
import CanvaEditor from './CanvaEditor';
import TrialEndModal from './TrialEndModal';
import ConfirmationModal from './ConfirmationModal';
import HistoryPage from './HistoryPage';

import type { Chat, Part, Content } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Bot, Save, WandSparkles, Copy, Check, LoaderCircle, Trash2, BookOpen, BrainCircuit, BookUser, LogOut, LayoutTemplate, Zap, ChevronLeft, ChevronRight, Plus, MessageSquare, Clock, History, User as UserIcon, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HISTORY_KEY = 'focus-ai-history';
const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const tools = [
  { id: 'ai-assistant', icon: <WandSparkles className="w-5 h-5" />, title: 'AI Assistant' },
  { id: 'study-notes', icon: <DocumentTextIcon className="w-5 h-5" />, title: 'Study Notes' },
  { id: 'guided-study-sessions', icon: <BrainCircuit className="w-5 h-5" />, title: 'Study Session' },
  { id: 'case-studies', icon: <BookUser className="w-5 h-5" />, title: 'Case Studies' },
  { id: 'flow', icon: <Zap className="w-5 h-5" />, title: 'Flow' },
  { id: 'custom-quiz', icon: <QuestionMarkCircleIcon className="w-5 h-5" />, title: 'Customisable Quiz' },
  { id: 'history', icon: <History className="w-5 h-5" />, title: 'History' }
];

const AiMessageCodeBlock = ({ node, ...props }) => {
    const [isCopied, setIsCopied] = useState(false);
    const codeElement = node?.children?.[0];
    const language = codeElement?.properties?.className?.[0]?.replace('language-', '') || 'text';
    const codeString = String(codeElement?.children?.[0]?.value || '').trim();

    const handleCopy = () => {
        if (codeString) {
            navigator.clipboard.writeText(codeString);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <div className="bg-black/50 border border-gray-700/50 my-4 rounded-xl shadow-lg overflow-hidden font-mono">
            <div className="flex items-center justify-between px-4 py-1.5 bg-gray-800/60 border-b border-gray-700/50">
                <span className="text-xs font-sans text-gray-400 font-medium capitalize">{language}</span>
                <button onClick={handleCopy} className="text-xs flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                    {isCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    {isCopied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm" {...props} />
        </div>
    );
};


const customChatMarkdownComponents = {
    h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-4 text-gray-100" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-xl font-bold my-3 text-gray-200" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-lg font-semibold my-2 text-gray-200" {...props} />,
    p: ({node, ...props}) => <p className="leading-loose my-4 text-gray-300" {...props} />,
    a: ({node, ...props}) => <a className="text-cyan-400 font-medium hover:text-cyan-300 underline" {...props} />,
    strong: ({node, ...props}) => <strong className="font-bold text-sky-400" {...props} />,
    ul: ({node, ...props}) => <ul className="my-4 list-disc pl-6 space-y-2" {...props} />,
    ol: ({node, ...props}) => <ol className="my-4 list-decimal pl-6 space-y-2" {...props} />,
    li: ({node, ...props}) => <li className="marker:text-blue-500" {...props} />,
    blockquote: ({node, ...props}) => <blockquote className="my-4 border-l-4 border-blue-500 pl-6 pr-4 py-2 bg-gray-800/60 rounded-r-lg italic text-gray-300" {...props} />,
    code: ({node, inline, ...props}) => <code className={`font-mono text-sm ${inline ? 'bg-gray-700/70 rounded px-2 py-1 text-cyan-300' : 'text-gray-200'}`} {...props} />,
    pre: AiMessageCodeBlock,
    hr: ({node, ...props}) => <hr className="my-6 border-gray-700" {...props} />,
    table: ({node, ...props}) => <div className="my-6 rounded-xl border border-gray-700 overflow-hidden shadow-lg shadow-black/30"><table className="w-full text-base" {...props} /></div>,
    thead: ({node, ...props}) => <thead className="bg-gray-800" {...props} />,
    th: ({node, ...props}) => <th className="px-6 py-3 font-bold text-blue-300 text-left tracking-wider uppercase text-sm" {...props} />,
    tbody: ({node, ...props}) => <tbody className="divide-y divide-gray-700/50" {...props} />,
    tr: ({node, ...props}) => <tr className="bg-gray-900/50 even:bg-gray-900/80 hover:bg-gray-800/70 transition-colors" {...props} />,
    td: ({node, ...props}) => <td className="px-6 py-4 align-top text-gray-300" {...props} />,
    img: ({node, ...props}) => <img className="rounded-lg shadow-lg my-4 mx-auto max-w-full" {...props} />
};

const SuggestedQuestionsCarousel = ({ questions, onQuestionClick }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const paginate = (newDirection: number) => {
        let nextIndex = currentIndex + newDirection;
        if (nextIndex < 0) {
            nextIndex = questions.length - 1;
        } else if (nextIndex >= questions.length) {
            nextIndex = 0;
        }
        setDirection(newDirection);
        setCurrentIndex(nextIndex);
    };
    
    const variants = {
      enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
      center: { zIndex: 1, x: 0, opacity: 1 },
      exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
    };

    return (
        <div className="relative h-20 flex items-center w-full">
            <button onClick={() => paginate(-1)} className="absolute left-0 z-10 p-1 bg-gray-700/50 hover:bg-gray-700 rounded-full text-white transition-colors" aria-label="Previous question"><ChevronLeft size={20} /></button>
            <div className="flex-1 overflow-hidden relative h-full mx-8">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.button key={currentIndex} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={(e, { offset, velocity }) => { const swipe = Math.abs(offset.x) * velocity.x; if (swipe < -10000) { paginate(1); } else if (swipe > 10000) { paginate(-1); } }} onClick={() => onQuestionClick(questions[currentIndex])} className="w-full h-full absolute flex items-center justify-center text-left bg-gray-700/80 hover:bg-gray-700 text-gray-200 text-sm px-4 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {questions[currentIndex]}
                    </motion.button>
                </AnimatePresence>
            </div>
            <button onClick={() => paginate(1)} className="absolute right-0 z-10 p-1 bg-gray-700/50 hover:bg-gray-700 rounded-full text-white transition-colors" aria-label="Next question"><ChevronRight size={20} /></button>
        </div>
    );
};

const AiEditMenu = ({ onSelect, onClose }) => {
    const menuRef = useRef(null);
    const actions = ["Simplify", "Elaborate", "Add Clinical Examples", "Clinical Focus", "Student Friendly"];

    useEffect(() => {
        const handleClickOutside = (event) => { if (menuRef.current && !menuRef.current.contains(event.target)) { onClose(); } };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div ref={menuRef} className="absolute z-10 bottom-full mb-2 right-0 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1">
            {actions.map(action => (<button key={action} onClick={() => { onSelect(action); onClose(); }} className="w-full text-left px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-700">{action}</button>))}
        </div>
    );
};

const TooltipButton = ({ tooltip, children, ...props }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    return (
        <div className="relative" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
            <button {...props}>{children}</button>
            {showTooltip && (<div className="absolute bottom-full mb-2 -translate-x-1/2 left-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-20 shadow-lg">{tooltip}</div>)}
        </div>
    );
};

const ChatInput = ({ onSendMessage, onImageUpload, isProcessing, isTrialExpired }) => {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        adjustTextareaHeight();
    };

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };
    
    const handleSend = () => {
        if (input.trim() && !isProcessing) {
            onSendMessage(input, null, null);
            setInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) onImageUpload(file);
    };

    useEffect(() => {
        if (!input && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }, [input]);

    return (
        <div className="flex-shrink-0 w-full max-w-3xl mx-auto px-4 pb-4">
             <div className={`relative bg-gray-800 border-2 border-gray-700/80 rounded-2xl shadow-lg flex items-end p-2 transition-all focus-within:border-blue-500 ${isTrialExpired ? 'opacity-60' : ''}`}>
                <button onClick={() => fileInputRef.current?.click()} disabled={isTrialExpired} className="p-2 text-gray-400 hover:text-white disabled:cursor-not-allowed" aria-label="Attach file">
                    <PaperClipIcon className="w-6 h-6" />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={isTrialExpired ? "Your trial has ended. Please subscribe." : "Ask a question or upload an image..."}
                    className="flex-1 bg-transparent p-2 text-base text-gray-200 placeholder-gray-500 resize-none focus:outline-none overflow-y-auto max-h-48 disabled:cursor-not-allowed"
                    rows={1}
                    disabled={isTrialExpired}
                />
                <button
                    onClick={handleSend}
                    disabled={isProcessing || !input.trim() || isTrialExpired}
                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send message"
                >
                    {isProcessing ? <LoaderCircle className="w-6 h-6 animate-spin"/> : <SendIcon className="w-6 h-6"/>}
                </button>
             </div>
        </div>
    );
};

export const ChatPage: React.FC<{ user: User; onLogout: () => void; onSubscribe: () => void; }> = ({ user, onLogout, onSubscribe }) => {
    const [activeTool, setActiveTool] = useState('ai-assistant');
    const [history, setHistory] = useState<HistoryLog[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryLog | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [saveModalMessage, setSaveModalMessage] = useState<ChatMessage | null>(null);
    const [canvaData, setCanvaData] = useState<CanvaData | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [aiEditTargetId, setAiEditTargetId] = useState<string | null>(null);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

    const [isTrialEndModalOpen, setIsTrialEndModalOpen] = useState(false);

    const [confirmDeleteState, setConfirmDeleteState] = useState<{
        isOpen: boolean;
        itemId: string | null;
        itemTitle: string | null;
    }>({ isOpen: false, itemId: null, itemTitle: null });

    const isTrialExpired = useMemo(() => {
        if (user.tier !== 'trial' || !user.trialStartDate) {
            return false;
        }
        const expirationTime = user.trialStartDate + TRIAL_DURATION_MS;
        return Date.now() > expirationTime;
    }, [user]);

    const trialDaysRemaining = useMemo(() => {
        if (user.tier !== 'trial' || !user.trialStartDate) {
            return null;
        }
        const expirationTime = user.trialStartDate + TRIAL_DURATION_MS;
        const remainingTime = expirationTime - Date.now();

        if (remainingTime <= 0) {
            return 0;
        }
        return Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
    }, [user]);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<Chat | null>(null);

    const currentSession = useMemo(() => {
        const item = history.find(s => s.id === currentSessionId);
        if (item?.type === HistoryItemType.Chat) {
            return item as ChatSession;
        }
        return null;
    }, [history, currentSessionId]);

    const messages = useMemo(() => currentSession?.messages || [], [currentSession]);

    const recentHistory = useMemo(() => history.slice(0, 5), [history]);

    const scrollToBottom = () => {
        chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    };

    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem(HISTORY_KEY);
            if (savedHistory) {
                const parsedHistory: HistoryLog[] = JSON.parse(savedHistory);
                setHistory(parsedHistory);
                const lastChatItem = parsedHistory.find(h => h.type === HistoryItemType.Chat);
                if (lastChatItem) {
                    setCurrentSessionId(lastChatItem.id);
                } else {
                    createNewChatItem();
                }
            } else {
                 createNewChatItem();
            }

             const savedFolders = localStorage.getItem('studyFolders');
             const savedNotes = localStorage.getItem('studyNotes');
             setFolders(savedFolders ? JSON.parse(savedFolders) : [{id: 'general', name: 'General'}]);
             setNotes(savedNotes ? JSON.parse(savedNotes) : []);

        } catch (error) {
             console.error("Failed to load data from localStorage", error);
             createNewChatItem();
        }
    }, []);

    useEffect(() => {
        if(history.length > 0) {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        } else {
            localStorage.removeItem(HISTORY_KEY);
        }
    }, [history]);

    useEffect(() => {
        if (currentSessionId && history.length > 0) {
             const session = history.find(s => s.id === currentSessionId && s.type === HistoryItemType.Chat) as ChatSession;
             if (session) {
                const historyContent: Content[] = session.messages.flatMap(msg => [
                    { role: msg.author === MessageAuthor.USER ? 'user' : 'model', parts: [{ text: msg.text }] }
                ]);
                 chatRef.current = createChat(undefined, historyContent);
             }
        }
    }, [currentSessionId, history]);
    
    useEffect(scrollToBottom, [messages]);

    const updateHistoryItem = (itemId: string, updates: Partial<HistoryItem>) => {
        setHistory(prevHistory =>
            prevHistory.map(item => {
                if (item.id === itemId) {
                    // FIX: Ensure discriminated union is preserved when spreading updates
                    switch (item.type) {
                        case HistoryItemType.Chat:
                            return { ...item, ...updates, type: HistoryItemType.Chat };
                        case HistoryItemType.CaseStudy:
                            return { ...item, ...updates, type: HistoryItemType.CaseStudy };
                        default:
                          return item;
                    }
                }
                return item;
            })
        );
    };
    
    const updateMessage = (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => {
        setHistory(prevHistory =>
            prevHistory.map(item => {
                if (item.id === sessionId && item.type === HistoryItemType.Chat) {
                    const updatedItem: ChatSession = {
                        ...item,
                        messages: item.messages.map(msg =>
                            msg.id === messageId ? { ...msg, ...updates } : msg
                        ),
                    };
                    return updatedItem;
                }
                return item;
            })
        );
    };

    const addMessage = (sessionId: string, message: ChatMessage) => {
        setHistory(prevHistory =>
            prevHistory.map(item => {
                if (item.id === sessionId && item.type === HistoryItemType.Chat) {
                    // FIX: Preserve discriminated union type
                    const updatedItem: ChatSession = { ...item, messages: [...item.messages, message] };
                    return updatedItem;
                }
                return item;
            })
        );
    };
    
    const handleSendMessage = useCallback(async (input: string, aiEditAction: string | null, imageUrl: string | null) => {
        if (user.tier === 'trial' && isTrialExpired) {
            setIsTrialEndModalOpen(true);
            return;
        }

        if (!currentSessionId) return;

        const userMessageId = Date.now().toString();
        const aiMessageId = (Date.now() + 1).toString();
        const fullInput = aiEditAction ? `${aiEditAction}: "${input}"` : input;
        
        if (!aiEditAction) {
            const userMessage: ChatMessage = {
                id: userMessageId,
                author: MessageAuthor.USER,
                text: input,
                imageUrl: imageUrl,
            };
            addMessage(currentSessionId, userMessage);
        }

        const aiMessage: ChatMessage = { id: aiMessageId, author: MessageAuthor.AI, text: '' };
        addMessage(currentSessionId, aiMessage);
        setIsProcessing(true);

        try {
            if (!chatRef.current) chatRef.current = createChat();
            
            const parts: Part[] = [{ text: fullInput }];
            if (imageUrl) {
                const base64Data = imageUrl.split(',')[1];
                const mimeType = imageUrl.split(':')[1].split(';')[0];
                parts.unshift({ inlineData: { data: base64Data, mimeType } });
            }

            const stream = await chatRef.current.sendMessageStream({ message: parts });
            let currentText = '';
            for await (const chunk of stream) {
                currentText += chunk.text;
                updateMessage(currentSessionId, aiMessageId, { text: currentText });
            }

            updateMessage(currentSessionId, aiMessageId, { generatingSuggestions: true });
            const questions = await generateSuggestedQuestions(input, currentText);
            updateMessage(currentSessionId, aiMessageId, { suggestedQuestions: questions, generatingSuggestions: false });
            
            const session = history.find(s => s.id === currentSessionId);
            if (session?.type === HistoryItemType.Chat && session.title === 'New Chat' && !aiEditAction) {
                const newTitle = await generateChatTitle(input);
                updateHistoryItem(currentSessionId, { title: newTitle });
            }
            
        } catch (error) {
            console.error(error);
            updateMessage(currentSessionId, aiMessageId, { text: "Sorry, I encountered an error. Please try again." });
        } finally {
            setIsProcessing(false);
        }
    }, [currentSessionId, history, user, isTrialExpired]);
    
    const handleImageUpload = (file: File) => {
        if (user.tier === 'trial' && isTrialExpired) {
            setIsTrialEndModalOpen(true);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target?.result as string;
            handleSendMessage(`Analyze this image.`, null, imageUrl);
        };
        reader.readAsDataURL(file);
    };
    
    const createNewChatItem = () => {
        const newSession: ChatSession = {
            id: Date.now().toString(),
            type: HistoryItemType.Chat,
            title: 'New Chat',
            messages: [],
            createdAt: Date.now(),
        };
        setHistory(prev => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        setSelectedHistoryItem(newSession);
        setActiveTool('ai-assistant');
        chatRef.current = createChat();
    };

    const initiateDeleteHistoryItem = (itemId: string, itemTitle: string) => {
        setConfirmDeleteState({ isOpen: true, itemId, itemTitle });
    };

    const handleConfirmDelete = () => {
        if (!confirmDeleteState.itemId) return;
        const itemIdToDelete = confirmDeleteState.itemId;
        
        const remainingHistory = history.filter(h => h.id !== itemIdToDelete);
        setHistory(remainingHistory);

        if (selectedHistoryItem?.id === itemIdToDelete) {
            setSelectedHistoryItem(null);
            const lastChatItem = remainingHistory.find(h => h.type === HistoryItemType.Chat);
            if (lastChatItem) {
                setCurrentSessionId(lastChatItem.id);
                setActiveTool('ai-assistant');
            } else {
                createNewChatItem();
            }
        }
        setConfirmDeleteState({ isOpen: false, itemId: null, itemTitle: null });
    };
    
    const handleSaveNote = (message: ChatMessage) => {
        if (message.canvaData) {
            const canvaContent = `# ${message.canvaData.title}\n\n${message.canvaData.content}`;
            const newNote: Note = {
                id: Date.now().toString(),
                title: `${message.canvaData.title} (Canvas)`,
                content: canvaContent,
                createdAt: Date.now(),
                tags: ['canvas'],
                folderId: 'general',
            };
            const updatedNotes = [newNote, ...notes];
            setNotes(updatedNotes);
            localStorage.setItem('studyNotes', JSON.stringify(updatedNotes));
            alert('Canvas saved to notes!');
        } else {
            setSaveModalMessage(message);
        }
    };

    const confirmSaveNote = (folderId: string | null, newFolderName: string | null) => {
        if (!saveModalMessage) return;
        let finalFolderId = folderId;
        let currentFolders = folders;
        if (newFolderName) {
            const newFolder = { id: Date.now().toString(), name: newFolderName };
            currentFolders = [...folders, newFolder];
            setFolders(currentFolders);
            finalFolderId = newFolder.id;
        }
        const titleMatch = saveModalMessage.text.match(/^#\s*(.*)/);
        const title = titleMatch ? titleMatch[1] : 'AI Generated Note';
        const newNote: Note = {
            id: Date.now().toString(), title, content: saveModalMessage.text,
            createdAt: Date.now(), tags: [], folderId: finalFolderId || 'general'
        };
        const updatedNotes = [newNote, ...notes];
        setNotes(updatedNotes);
        localStorage.setItem('studyNotes', JSON.stringify(updatedNotes));
        if(newFolderName) localStorage.setItem('studyFolders', JSON.stringify(currentFolders));
        setSaveModalMessage(null);
    };
    
    const handleCreateCanva = (topic: string) => {
        if (user.tier === 'trial' && isTrialExpired) {
            setIsTrialEndModalOpen(true);
            return;
        }
        if (!currentSessionId) return;

        const canvaMessageId = Date.now().toString();
        const newMessage: ChatMessage = {
            id: canvaMessageId, author: MessageAuthor.AI,
            text: `Generating a Canvas on "${topic}"...`,
            canvaData: { state: 'generating', topic },
        };
        addMessage(currentSessionId, newMessage);

        generateCanva(topic).then(({ title, description, content }) => {
            const updatedCanvaData = { state: 'ready' as 'ready', topic, title, description, content };
            updateMessage(currentSessionId, canvaMessageId, { text: content, canvaData: updatedCanvaData });
        }).catch(e => {
            updateMessage(currentSessionId, canvaMessageId, { text: "Failed to generate Canvas. Please try again." });
        });
    };
    
    const handleCanvaContentChange = (newContent: string) => {
        if (canvaData) {
            const updatedCanvaData = { ...canvaData, content: newContent };
            setCanvaData(updatedCanvaData);
            const canvaMessage = messages.find(m => m.canvaData && m.canvaData.topic === canvaData.topic);
            if (canvaMessage && currentSessionId) {
                updateMessage(currentSessionId, canvaMessage.id, { text: newContent, canvaData: updatedCanvaData });
            }
        }
    };
    
    const handleSaveCanvaToNotes = (title: string, content: string) => {
        const newNote: Note = {
            id: Date.now().toString(), title: `${title} (Canvas)`, content,
            createdAt: Date.now(), tags: ['canvas'], folderId: 'general',
        };
        const updatedNotes = [newNote, ...notes];
        setNotes(updatedNotes);
        localStorage.setItem('studyNotes', JSON.stringify(updatedNotes));
    };

    const handleSaveCaseToHistory = (caseData: CaseStudy) => {
        const newHistoryItem: CaseStudyHistoryItem = {
            id: Date.now().toString(),
            type: HistoryItemType.CaseStudy,
            title: caseData.caseTitle,
            createdAt: Date.now(),
            caseData: caseData,
        };
        setHistory(prev => [newHistoryItem, ...prev]);
        setSelectedHistoryItem(newHistoryItem);
        setActiveTool('case-studies');
    };

    const handleHistoryItemSelect = (item: HistoryLog) => {
        setSelectedHistoryItem(item);
        if (item.type === HistoryItemType.Chat) {
            setActiveTool('ai-assistant');
            setCurrentSessionId(item.id);
        } else if (item.type === HistoryItemType.CaseStudy) {
            setActiveTool('case-studies');
        } else {
             setActiveTool('history');
        }
        setIsMobileSidebarOpen(false);
    };

    const handleToolSelect = (toolId: string) => {
        setActiveTool(toolId);
        if (toolId !== 'ai-assistant' && toolId !== 'case-studies') {
            setSelectedHistoryItem(null);
        }
        if (toolId === 'ai-assistant') {
            const lastChat = history.find(h => h.type === HistoryItemType.Chat) as ChatSession;
            if (lastChat) setCurrentSessionId(lastChat.id);
            else createNewChatItem();
        }
        setIsMobileSidebarOpen(false);
    };

    const renderActiveTool = () => {
        switch (activeTool) {
            case 'study-notes': return <StudyNotesPage />;
            case 'guided-study-sessions': return <GuidedStudySessionsPage />;
            case 'case-studies': 
                return <CaseStudiesPage 
                           initialCase={selectedHistoryItem?.type === HistoryItemType.CaseStudy ? (selectedHistoryItem as CaseStudyHistoryItem).caseData : undefined}
                           onSaveCaseToHistory={handleSaveCaseToHistory} 
                           onStartNew={() => setSelectedHistoryItem(null)}
                       />;
            case 'custom-quiz': return <CustomisableQuizPage />;
            case 'flow': return <FlowPage />;
            case 'history': return <HistoryPage history={history} onItemSelect={handleHistoryItemSelect} onItemDelete={initiateDeleteHistoryItem} />;
            default: return null;
        }
    };

    const handleCopy = (text: string, messageId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
    };

    const handleAiEditSelect = (action: string) => {
        if (!aiEditTargetId || !currentSessionId) return;
        const session = history.find(s => s.id === currentSessionId);
        if (session?.type !== HistoryItemType.Chat) return;
        const targetMessage = session.messages.find(m => m.id === aiEditTargetId);
        if (targetMessage) handleSendMessage(targetMessage.text, action, null);
        setAiEditTargetId(null);
    };

    const pageTitle = selectedHistoryItem?.title || tools.find(t => t.id === activeTool)?.title || 'Focus.AI';

    return (
        <div className="flex h-screen w-full bg-gray-900 text-gray-300 relative">
            <ConfirmationModal
                isOpen={confirmDeleteState.isOpen}
                onClose={() => setConfirmDeleteState({ isOpen: false, itemId: null, itemTitle: null })}
                onConfirm={handleConfirmDelete}
                title="Delete Item"
                message={<>Are you sure you want to permanently delete "<strong>{confirmDeleteState.itemTitle}</strong>"? This action cannot be undone.</>}
                confirmText="Delete"
                confirmVariant="danger"
            />
            <TrialEndModal 
                isOpen={isTrialEndModalOpen} 
                onClose={() => setIsTrialEndModalOpen(false)} 
                onSubscribe={() => { setIsTrialEndModalOpen(false); onSubscribe(); }}
            />
            {saveModalMessage && <SaveNoteModal isOpen={true} onClose={() => setSaveModalMessage(null)} onSave={confirmSaveNote} folders={folders} />}
            {canvaData && (
                 <div className="absolute inset-0 bg-black/70 z-30 animate-slide-in-from-right">
                    <CanvaEditor 
                        topic={canvaData.topic} 
                        initialContent={messages.find(m => m.id === canvaData.messageId)?.text || canvaData.content || ''}
                        onClose={() => setCanvaData(null)} 
                        onSave={handleSaveCanvaToNotes}
                        onContentChange={handleCanvaContentChange}
                    />
                </div>
            )}
             <div 
                className={`absolute md:hidden inset-0 bg-black/60 z-40 transition-opacity ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileSidebarOpen(false)}
             />
             <div className={`
                ${isSidebarOpen ? 'w-64' : 'w-20'}
                ${isMobileSidebarOpen ? 'fixed inset-y-0 left-0 z-50 w-64' : 'hidden md:flex'}
                flex-col bg-gray-950 transition-all duration-300 ease-in-out border-r border-gray-800
             `}>
                <div className="p-4 border-b border-gray-800 flex items-center">
                    {isSidebarOpen && (
                        <div className="flex-1 flex items-center gap-2 overflow-hidden">
                            <Bot className="w-8 h-8 text-blue-400 flex-shrink-0" strokeWidth={1.5} />
                            <span className="text-xl font-bold whitespace-nowrap">Focus.AI</span>
                        </div>
                    )}
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                        className={`p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md hidden md:block ${isSidebarOpen ? '' : 'mx-auto'}`}
                    >
                        {isSidebarOpen ? <ChevronLeft size={20}/> : <ChevronRight size={20}/>}
                    </button>
                </div>

                <nav className={`p-4 space-y-2 flex-1 overflow-y-auto`}>
                    {tools.map(tool => (
                        <button key={tool.id} onClick={() => handleToolSelect(tool.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-semibold transition-colors ${!isSidebarOpen && 'justify-center'} ${activeTool === tool.id ? 'bg-blue-600/30 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'}`}>
                            {tool.icon}
                            {isSidebarOpen && <span>{tool.title}</span>}
                        </button>
                    ))}
                    {isSidebarOpen && <div className="pt-2 border-t border-gray-800">
                        <div className="flex items-center justify-between mt-2 mb-2">
                            <h3 className="text-base font-semibold text-gray-400 flex items-center gap-2"><History size={16}/> Recent</h3>
                            <TooltipButton tooltip="New Chat"><button onClick={createNewChatItem} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"><Plus size={18}/></button></TooltipButton>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto -mr-4 pr-3 space-y-1">
                             {recentHistory.length > 0 ? (
                                recentHistory.map(item => (
                                    <div key={item.id} className={`relative group w-full rounded-lg transition-colors ${selectedHistoryItem?.id === item.id ? 'bg-blue-900/50' : 'hover:bg-gray-800/80'}`}>
                                        <button onClick={() => handleHistoryItemSelect(item)} className="w-full text-left p-2.5 flex items-start gap-3">
                                            {item.type === HistoryItemType.Chat ? <MessageSquare size={16} className="mt-1 flex-shrink-0"/> : <BookUser size={16} className="mt-1 flex-shrink-0"/>}
                                            <div className="flex-1 overflow-hidden">
                                                <h3 className="font-semibold text-gray-200 truncate pr-8 text-base">{item.title}</h3>
                                                <p className="text-sm text-gray-500 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </button>
                                        <button onClick={() => initiateDeleteHistoryItem(item.id, item.title)} className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 rounded-full text-gray-500 hover:text-red-400 hover:bg-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                    </div>
                                ))
                             ) : (
                                <p className="text-sm text-gray-500 px-2 py-4 text-center">No recent activity.</p>
                             )}
                        </div>
                         <button onClick={() => handleToolSelect('history')} className="w-full mt-2 flex items-center justify-center gap-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md py-2 transition-colors">
                            View All History <ChevronRight size={16} />
                        </button>
                    </div>}
                </nav>

                <div className="mt-auto p-4 border-t border-gray-800 space-y-2">
                    {user.tier === 'trial' && (
                        <div className={`px-3 py-2 text-sm rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 transition-all`} title={!isSidebarOpen && trialDaysRemaining !== null ? (trialDaysRemaining > 0 ? `${trialDaysRemaining} day${trialDaysRemaining !== 1 ? 's' : ''} left` : 'Trial Expired') : undefined}>
                            <div className={`flex items-center gap-2 ${!isSidebarOpen && 'justify-center'}`}><Clock size={16} />{isSidebarOpen && (trialDaysRemaining !== null && trialDaysRemaining > 0 ? (<p><span className="font-bold">{trialDaysRemaining}</span> day{trialDaysRemaining !== 1 ? 's' : ''} left</p>) : (<p className="font-bold">Trial Expired</p>))}</div>
                        </div>
                    )}
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-500/20 hover:text-red-300 text-gray-400 transition-colors"><LogOut className="w-5 h-5" />{isSidebarOpen && <span className="font-semibold">Logout</span>}</button>
                </div>
            </div>

            <main className="flex-1 flex flex-col overflow-hidden">
                 <header className="p-4 flex items-center justify-between border-b border-gray-800">
                    <div className="flex items-center gap-2">
                         <button onClick={() => setIsMobileSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white"><MenuIcon className="w-6 h-6"/></button>
                         <h1 className="text-xl font-bold text-white truncate">{pageTitle}</h1>
                    </div>
                 </header>

                <div className="flex-1 overflow-hidden relative">
                    {activeTool !== 'ai-assistant' ? (<div className="h-full overflow-y-auto">{renderActiveTool()}</div>) : (
                        <div className="flex-1 flex flex-col bg-gray-900/50 h-full">
                            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
                                <div className="max-w-3xl mx-auto w-full h-full">
                                    {messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                                            <MessageSquare size={48} className="mb-4" /><h2 className="text-2xl font-bold text-gray-400">AI Assistant</h2>
                                            <p className="mt-2 max-w-sm">Ask a question, upload an image, or request a Canvas to get started.</p>
                                            <div className="flex gap-4 mt-6">
                                                <button onClick={() => handleSendMessage("Explain the basics of retinoscopy.", null, null)} disabled={isTrialExpired} className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Explain retinoscopy</button>
                                                <button onClick={() => handleCreateCanva("Diabetic Retinopathy")} disabled={isTrialExpired} className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Create Canvas on DR</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {messages.map((message) => {
                                                const isAiLoading = message.author === MessageAuthor.AI && !message.text && isProcessing;
                                                return (
                                                <div key={message.id} className={`flex items-start gap-4 ${message.author === MessageAuthor.USER ? 'justify-end' : 'justify-start'}`}>
                                                    {message.author === MessageAuthor.AI && (<div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0"><Bot size={18} className="text-blue-400"/></div>)}
                                                    <div className={`p-4 rounded-2xl max-w-2xl ${message.author === MessageAuthor.USER ? 'bg-blue-800/80 rounded-br-none' : 'bg-gray-800 rounded-bl-none'} ${isAiLoading ? 'animate-pulse' : ''}`}>
                                                        {message.imageUrl && <img src={message.imageUrl} alt="Uploaded content" className="rounded-lg mb-2 max-w-sm" />}
                                                        
                                                        {message.canvaData?.state === 'generating' ? (
                                                            <div className="flex items-center gap-2 text-gray-300"><LoaderCircle className="animate-spin w-5 h-5"/><span>Generating a Canvas on "{message.canvaData.topic}"...</span></div>
                                                        ) : message.canvaData?.state === 'ready' ? (
                                                            <div className="space-y-3">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="p-2 bg-blue-600/20 rounded-lg mt-1"><LayoutTemplate className="w-6 h-6 text-blue-400" /></div>
                                                                    <div>
                                                                        <h3 className="font-bold text-white">{message.canvaData.title || 'Canvas Ready'}</h3>
                                                                        <p className="text-sm text-gray-400 mt-1">{message.canvaData.description || 'Your generated canvas is ready to view and edit.'}</p>
                                                                    </div>
                                                                </div>
                                                                <button 
                                                                    onClick={() => setCanvaData({ ...message.canvaData!, messageId: message.id })} 
                                                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                                                >
                                                                    <Eye size={16}/> View Canvas
                                                                </button>
                                                            </div>
                                                        ) : message.text ? (
                                                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={customChatMarkdownComponents}>{message.text}</ReactMarkdown>
                                                        ) : (message.author === MessageAuthor.AI && isProcessing && <span className="blinking-cursor">{"▍"}</span>)}

                                                        {message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
                                                            <div className="mt-4 pt-4 border-t border-gray-700/50"><SuggestedQuestionsCarousel questions={message.suggestedQuestions} onQuestionClick={(q) => handleSendMessage(q, null, null)} /></div>
                                                        )}
                                                        {message.author === MessageAuthor.AI && message.text && !message.canvaData && (
                                                            <div className="mt-4 pt-3 border-t border-gray-700/50 flex items-center gap-4 text-sm text-gray-400 flex-wrap">
                                                                <button onClick={() => handleSaveNote(message)} className="flex items-center gap-1.5 hover:text-white transition-colors"><Save size={16}/> Save</button>
                                                                <div className="relative">
                                                                    <button onClick={() => setAiEditTargetId(aiEditTargetId === message.id ? null : message.id)} className="flex items-center gap-1.5 hover:text-white transition-colors"><WandSparkles size={16}/> AI Edit</button>
                                                                    {aiEditTargetId === message.id && (<AiEditMenu onSelect={handleAiEditSelect} onClose={() => setAiEditTargetId(null)} />)}
                                                                </div>
                                                                <button onClick={() => handleCopy(message.text, message.id)} className="flex items-center gap-1.5 hover:text-white transition-colors" disabled={copiedMessageId === message.id}>{copiedMessageId === message.id ? <Check size={16} className="text-green-400"/> : <Copy size={16}/>}{copiedMessageId === message.id ? 'Copied!' : 'Copy'}</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {message.author === MessageAuthor.USER && (<div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0"><UserIcon size={18} /></div>)}
                                                </div>
                                            )})}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <ChatInput onSendMessage={handleSendMessage} onImageUpload={handleImageUpload} isProcessing={isProcessing} isTrialExpired={isTrialExpired} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
