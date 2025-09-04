
import React, { useState, useRef, useEffect } from 'react';
import { generateCaseStudy, createCaseChat, generateQuizFromCase } from '../services/geminiService';
import { CaseStudy, CaseStudyQuestion, CaseChatMessage, MessageAuthor, Folder, Note, CaseStudyHistoryItem } from '../types';
import { LoaderCircle, WandSparkles, ArrowLeft, ChevronRight, CheckCircle2, XCircle, Lightbulb, BookUser, Send, MessageSquare, ListChecks, Check, Bot, User as UserIcon, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Chat } from '@google/genai';
import SaveNoteModal from './SaveNoteModal';

// --- STYLING & MARKDOWN ---

const caseMarkdownComponents = {
    h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-blue-300 my-4 border-b border-gray-700 pb-2" {...props} />,
    p: ({node, ...props}) => <p className="leading-relaxed my-2 text-gray-300" {...props} />,
    ul: ({node, ...props}) => <ul className="my-2 list-disc pl-5 space-y-1" {...props} />,
    ol: ({node, ...props}) => <ol className="my-2 list-decimal pl-5 space-y-1" {...props} />,
    li: ({node, ...props}) => <li className="marker:text-blue-500" {...props} />,
    strong: ({node, ...props}) => <strong className="font-bold text-sky-400" {...props} />,
    table: ({node, ...props}) => <div className="my-4 rounded-lg border border-gray-700 overflow-hidden"><table className="w-full text-sm" {...props} /></div>,
    thead: ({node, ...props}) => <thead className="bg-gray-800" {...props} />,
    th: ({node, ...props}) => <th className="px-4 py-2 font-semibold text-blue-300 text-left text-xs uppercase" {...props} />,
    tbody: ({node, ...props}) => <tbody className="divide-y divide-gray-700" {...props} />,
    tr: ({node, ...props}) => <tr className="bg-gray-900/70 hover:bg-gray-800/80" {...props} />,
    td: ({node, ...props}) => <td className="px-4 py-2 align-top text-gray-300" {...props} />,
};

// --- SUB-COMPONENTS ---

const SettingsForm = ({ onGenerate, isGenerating }) => {
    const [topic, setTopic] = useState('');
    const [mode, setMode] = useState<'full' | 'interactive'>('full');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(topic, mode);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <BookUser className="w-16 h-16 mx-auto text-blue-500 mb-4" strokeWidth={1.5} />
                <h1 className="text-4xl font-extrabold text-white">Case Studies</h1>
                <p className="mt-2 text-lg text-gray-400">Sharpen your clinical skills by working through realistic patient cases.</p>
            </div>
            <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 sm:p-8 space-y-6">
                <div>
                    <label htmlFor="topic" className="block text-base font-medium text-gray-300 mb-2">Describe the case you want to study</label>
                    <input
                        id="topic"
                        type="text"
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        placeholder="e.g., A young adult with intermittent diplopia"
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">Study Mode</label>
                  <div className="flex bg-gray-700/80 rounded-lg p-1 space-x-1">
                    <button type="button" onClick={() => setMode('full')} className={`w-full text-center px-4 py-2 text-base font-semibold rounded-md transition-colors ${mode === 'full' ? 'bg-blue-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600/50'}`}>
                      Full Case <span className="text-xs text-blue-200">(Recommended)</span>
                    </button>
                    <button type="button" onClick={() => setMode('interactive')} className={`w-full text-center px-4 py-2 text-base font-semibold rounded-md transition-colors ${mode === 'interactive' ? 'bg-blue-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600/50'}`}>
                      Interactive
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={!topic.trim() || isGenerating}
                    className="w-full flex items-center justify-center gap-2 text-white bg-blue-700 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg px-5 py-3 text-base font-bold transition-all">
                    {isGenerating ? <LoaderCircle className="animate-spin" size={20} /> : <WandSparkles size={20} />}
                    {isGenerating ? 'Generating Case...' : 'Generate Case Study'}
                </button>
            </form>
        </div>
    );
};

const ChatPanel = ({ caseData }) => {
    const [messages, setMessages] = useState<CaseChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: CaseChatMessage = {
            id: Date.now().toString(),
            author: MessageAuthor.USER,
            text: input,
        };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        if (!chatRef.current) {
            const caseContent = caseData.sections.map(s => `## ${s.sectionTitle}\n${s.content}`).join('\n\n');
            chatRef.current = createCaseChat(caseContent);
        }

        const aiMessageId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: aiMessageId, author: MessageAuthor.AI, text: '' }]);
        
        try {
            const stream = await chatRef.current.sendMessageStream({ message: currentInput });
            let currentText = '';
            for await (const chunk of stream) {
                currentText += chunk.text;
                setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, text: currentText } : msg));
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, text: "Sorry, I encountered an error." } : msg));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-800/50 rounded-lg">
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 h-full flex flex-col justify-center items-center p-4">
                         <MessageSquare size={32} className="mb-2"/>
                         <p className="font-semibold text-lg">Ask about this case</p>
                         <p className="text-base">The AI will only use the case details to answer.</p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} className={`flex items-start gap-2.5 ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.author === 'ai' && <div className="w-7 h-7 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center"><Bot size={16}/></div>}
                            <div className={`p-3 rounded-lg max-w-xs ${msg.author === 'user' ? 'bg-blue-800/80 rounded-br-none' : 'bg-gray-700/60 rounded-bl-none'}`}>
                                <p className="text-base text-gray-200 whitespace-pre-wrap">{msg.text || <span className="blinking-cursor">▍</span>}</p>
                            </div>
                             {msg.author === 'user' && <div className="w-7 h-7 flex-shrink-0 bg-gray-600 rounded-full flex items-center justify-center"><UserIcon size={16}/></div>}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-2 border-t border-gray-700/50">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Ask a question..."
                        className="flex-1 bg-gray-700 border-none text-white rounded-md p-2.5 text-base focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 disabled:bg-gray-600 transition-colors">
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const QuizPanel = ({ caseData }) => {
    const [quiz, setQuiz] = useState<CaseStudyQuestion[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleGenerateQuiz = async () => {
        setIsLoading(true);
        setError('');
        try {
            const caseContent = caseData.sections.map(s => `## ${s.sectionTitle}\n${s.content}`).join('\n\n');
            const questions = await generateQuizFromCase(caseContent);
            setQuiz(questions);
            setIsModalOpen(true);
        } catch (e) {
            setError(e.message || "Failed to generate quiz.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full items-center justify-center bg-gray-800/50 rounded-lg p-6 text-center">
            <ListChecks size={40} className="text-blue-400 mb-4"/>
            <h3 className="text-lg font-semibold text-white">Practice Quiz</h3>
            <p className="text-base text-gray-400 mb-4">Test your knowledge of this specific case with a short quiz.</p>
            <button onClick={handleGenerateQuiz} disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-500 disabled:bg-gray-500 transition-colors">
                {isLoading ? <LoaderCircle className="animate-spin" size={20}/> : 'Generate Quiz'}
            </button>
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            {quiz && <CaseQuizModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} quizData={quiz} />}
        </div>
    );
};

const CaseQuizModal = ({ isOpen, onClose, quizData }) => {
    const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setUserAnswers(new Array(quizData.length).fill(null));
            setIsSubmitted(false);
        }
    }, [isOpen, quizData]);

    if (!isOpen) return null;

    const handleAnswer = (qIndex, answer) => {
        if (isSubmitted) return;
        const newAnswers = [...userAnswers];
        newAnswers[qIndex] = answer;
        setUserAnswers(newAnswers);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">Case Quiz</h2>
                </div>
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    {quizData.map((q, qIndex) => {
                        const isCorrect = userAnswers[qIndex] === q.correctAnswer;
                        return (
                            <div key={qIndex}>
                                <p className="font-semibold text-gray-200 mb-3">{qIndex + 1}. {q.questionText}</p>
                                <div className="space-y-2">
                                    {q.options?.map((opt, oIndex) => {
                                        let buttonClass = 'bg-gray-700/70 hover:bg-gray-700';
                                        if (isSubmitted) {
                                            if (opt === q.correctAnswer) buttonClass = 'bg-green-500/20 border-green-500';
                                            else if (userAnswers[qIndex] === opt) buttonClass = 'bg-red-500/20 border-red-500';
                                            else buttonClass = 'bg-gray-700/50 opacity-60';
                                        } else if (userAnswers[qIndex] === opt) {
                                            buttonClass = 'bg-blue-600/40 border-blue-500';
                                        }

                                        return (
                                            <button key={oIndex} onClick={() => handleAnswer(qIndex, opt)} disabled={isSubmitted}
                                                className={`w-full text-left p-3 text-base rounded-lg border transition-all ${buttonClass}`}>
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                                {isSubmitted && (
                                     <div className="mt-3 p-3 bg-gray-900/50 rounded-md">
                                        <div className="flex items-start gap-2">
                                            {isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-400 mt-0.5" />}
                                            <p className="text-base text-gray-300">{q.explanation}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="p-4 border-t border-gray-700 flex-shrink-0 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-sm font-semibold rounded-md">Close</button>
                    {!isSubmitted ? (
                        <button onClick={() => setIsSubmitted(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-semibold rounded-md">Submit</button>
                    ) : (
                        <button onClick={() => { setIsSubmitted(false); setUserAnswers(new Array(quizData.length).fill(null)); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-semibold rounded-md">Retake</button>
                    )}
                </div>
            </div>
        </div>
    );
};

const FullCaseView = ({ caseData, onBack, onSave, isFromHistory, onStartNew }) => {
    const [activeTool, setActiveTool] = useState<'chat' | 'quiz'>('chat');

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b border-gray-700/50 flex-shrink-0">
                <div className="flex items-center gap-4 max-w-7xl mx-auto">
                    <button onClick={onBack} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                    <div className="flex-1 overflow-hidden">
                        <h1 className="text-xl font-bold text-white truncate">{caseData.caseTitle}</h1>
                        <p className="text-base text-gray-400 truncate">{caseData.patientSummary}</p>
                    </div>
                    {isFromHistory ? (
                         <button onClick={onStartNew} className="text-sm bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">Start New Case</button>
                    ) : (
                        <button onClick={onSave} className="p-2 text-gray-300 hover:text-white bg-gray-700/60 hover:bg-gray-600 rounded-full transition-colors">
                            <Save size={20} />
                        </button>
                    )}
                </div>
            </header>
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-5 gap-4 p-4 max-w-7xl mx-auto w-full">
                <main className="lg:col-span-3 h-full overflow-y-auto bg-gray-800/50 rounded-lg p-6">
                    <article className="prose prose-invert max-w-none">
                        {caseData.sections.map((section, index) => (
                            <section key={index} className="mb-6">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={caseMarkdownComponents}>{`## ${section.sectionTitle}\n${section.content}`}</ReactMarkdown>
                            </section>
                        ))}
                    </article>
                </main>
                <aside className="lg:col-span-2 h-full flex flex-col gap-2">
                    <div className="flex bg-gray-700/80 rounded-lg p-1 space-x-1 flex-shrink-0">
                        <button onClick={() => setActiveTool('chat')} className={`w-full flex items-center justify-center gap-2 text-center px-3 py-1.5 text-base font-semibold rounded-md transition-colors ${activeTool === 'chat' ? 'bg-blue-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600/50'}`}>
                            <MessageSquare size={16}/> Ask a Question
                        </button>
                        <button onClick={() => setActiveTool('quiz')} className={`w-full flex items-center justify-center gap-2 text-center px-3 py-1.5 text-base font-semibold rounded-md transition-colors ${activeTool === 'quiz' ? 'bg-blue-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600/50'}`}>
                           <ListChecks size={16}/> Practice Quiz
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        {activeTool === 'chat' ? <ChatPanel caseData={caseData} /> : <QuizPanel caseData={caseData} />}
                    </div>
                </aside>
            </div>
        </div>
    );
};

const InteractiveCaseView = ({ caseData, onBack, onNext, userAnswers, onAnswerChange, currentSectionIndex }) => {
    const section = caseData.sections[currentSectionIndex];
    const isLastSection = currentSectionIndex === caseData.sections.length - 1;
    const currentQuestion = section.question;
    const answerForCurrentQuestion = userAnswers[currentSectionIndex];

    const CaseQuestion = ({ question, onAnswer, userAnswer }) => {
        const [shortAnswerInput, setShortAnswerInput] = useState('');
        if (!question) return null;
        
        return (
            <div className="mt-8 bg-gray-900/40 border-t-2 border-blue-800/50 rounded-lg p-6">
                <p className="font-semibold text-xl text-gray-200 mb-4">{question.questionText}</p>
                {question.type === 'multiple-choice' && (
                    <div className="space-y-3">
                        {question.options?.map((option, i) => (
                            <button key={i} onClick={() => onAnswer(option)} className={`w-full text-left p-3 rounded-lg border-2 transition-all text-base ${userAnswer === option ? 'bg-blue-600/30 border-blue-500' : 'bg-gray-700/50 border-gray-600 hover:border-blue-700'}`}>
                                {option}
                            </button>
                        ))}
                    </div>
                )}
                {question.type === 'short-answer' && ( <div className="flex gap-2"> <input type="text" value={shortAnswerInput} onChange={(e) => setShortAnswerInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onAnswer(shortAnswerInput)} placeholder="Type your answer..." className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500"/> <button onClick={() => onAnswer(shortAnswerInput)} className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-500"><Send size={20} /></button> </div>)}
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
             <div className="flex items-center gap-4 mb-4">
                <button onClick={onBack} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full"><ArrowLeft size={20} /></button>
                <div className='flex-1'>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white truncate">{caseData.caseTitle}</h1>
                    <p className="text-sm text-gray-400">{caseData.patientSummary}</p>
                </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-8"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${((currentSectionIndex + 1) / caseData.sections.length) * 100}%` }}></div></div>
            <div className="bg-gray-800/50 rounded-lg p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-blue-300 mb-4">{section.sectionTitle}</h2>
                <div className="prose prose-invert max-w-none text-gray-300"><ReactMarkdown remarkPlugins={[remarkGfm]} components={caseMarkdownComponents}>{section.content}</ReactMarkdown></div>
                {currentQuestion && <CaseQuestion question={currentQuestion} userAnswer={answerForCurrentQuestion} onAnswer={(answer) => onAnswerChange(currentSectionIndex, answer)} />}
            </div>
            <button onClick={onNext} disabled={currentQuestion && !answerForCurrentQuestion} className="mt-8 w-full flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-500 rounded-lg px-5 py-3 text-base font-bold transition-all disabled:bg-gray-600">
                {isLastSection ? 'Finish & Review Case' : 'Next Section'} {!isLastSection && <ChevronRight size={20} />}
            </button>
        </div>
    );
};

const CaseReviewView = ({ caseData, userAnswers, onRestart }) => {
    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-white">Case Review</h1>
                <p className="mt-2 text-lg text-gray-400">{caseData.caseTitle}</p>
            </div>
             <div className="space-y-6">
                {caseData.sections.map((section, index) => {
                    const question = section.question;
                    const userAnswer = userAnswers[index];
                    if (!question) {
                        return (
                            <div key={index} className="bg-gray-800/50 rounded-lg p-6">
                                <h2 className="text-2xl font-bold text-blue-300 mb-4">{section.sectionTitle}</h2>
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={caseMarkdownComponents}>{section.content}</ReactMarkdown>
                            </div>
                        )
                    }
                    const isCorrect = userAnswer?.toLowerCase() === question.correctAnswer.toLowerCase();
                    return (
                        <div key={index}>
                             <h3 className="text-lg font-semibold text-gray-400 mb-2">{section.sectionTitle}</h3>
                             <div className={`border-l-4 p-4 rounded-r-lg ${isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                                <p className="font-semibold text-gray-200">{question.questionText}</p>
                                <div className="text-base mt-2 space-y-1 text-gray-300">
                                    <div className="flex items-center gap-2">{isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}<span>Your answer: {userAnswer || 'Not answered'}</span></div>
                                    {!isCorrect && (<div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /><span>Correct answer: {question.correctAnswer}</span></div>)}
                                </div>
                                <div className="mt-3 p-3 bg-gray-800/50 rounded-md"><div className="flex items-start gap-2"><Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5" /><p className="text-base text-gray-300">{question.explanation}</p></div></div>
                             </div>
                        </div>
                    );
                })}
             </div>
             <button onClick={onRestart} className="mt-8 w-full flex items-center justify-center gap-2 text-white bg-blue-700 hover:bg-blue-600 rounded-lg px-5 py-3 text-base font-bold">
                <ArrowLeft size={20} /> Start a New Case Study
            </button>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---

interface CaseStudiesPageProps {
  initialCase?: CaseStudy;
  onSaveCaseToHistory: (caseData: CaseStudy) => void;
  onStartNew: () => void;
}

const CaseStudiesPage: React.FC<CaseStudiesPageProps> = ({ initialCase, onSaveCaseToHistory, onStartNew }) => {
    const [pageState, setPageState] = useState<'settings' | 'studying' | 'review'>('settings');
    const [caseData, setCaseData] = useState<CaseStudy | null>(null);
    const [mode, setMode] = useState<'full' | 'interactive'>('full');
    const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const pageRef = useRef<HTMLDivElement>(null);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    useEffect(() => {
        if (initialCase) {
            setCaseData(initialCase);
            setMode('full');
            setPageState('studying');
        } else {
            setPageState('settings');
            setCaseData(null);
        }
    }, [initialCase]);

    useEffect(() => {
        try {
            const savedFolders = localStorage.getItem('studyFolders');
            const initialFolders = savedFolders ? JSON.parse(savedFolders) : [{ id: 'general', name: 'General' }];
            setFolders(initialFolders);
        } catch (e) {
            console.error("Failed to load folders", e);
            setFolders([{ id: 'general', name: 'General' }]);
        }
    }, []);
    
    const handleGenerateCase = async (topic: string, selectedMode: 'full' | 'interactive') => {
        setIsLoading(true);
        setError(null);
        try {
            const generatedCase = await generateCaseStudy(topic);
            if (!generatedCase || !generatedCase.sections || generatedCase.sections.length === 0) throw new Error("Generated case is empty or invalid.");
            setCaseData(generatedCase);
            setMode(selectedMode);
            setUserAnswers(new Array(generatedCase.sections.length).fill(null));
            setCurrentSectionIndex(0);
            setPageState('studying');
            onSaveCaseToHistory(generatedCase);
        } catch (e) {
            setError(e.message || "An unknown error occurred.");
            setPageState('settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (sectionIndex: number, answer: string) => {
        setUserAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[sectionIndex] = answer;
            return newAnswers;
        });
    };

    const handleNextInteractive = () => {
        if (!caseData) return;
        if (currentSectionIndex === caseData.sections.length - 1) setPageState('review');
        else setCurrentSectionIndex(prev => prev + 1);
        pageRef.current?.scrollTo(0, 0);
    };

    const handleBackToSettings = () => {
        setCaseData(null);
        setError(null);
        setPageState('settings');
        if (initialCase) {
            onStartNew();
        }
    };

    const handleInitiateSave = () => {
        setIsSaveModalOpen(true);
    };

    const handleConfirmSaveCase = (folderId: string | null, newFolderName: string | null) => {
        if (!caseData) return;

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

        const markdownContent = `
# Case Study: ${caseData.caseTitle}

**Patient Summary:** ${caseData.patientSummary}

---

${caseData.sections.map(section => `
## ${section.sectionTitle}

${section.content}

${section.question ? `
### Question
**${section.question.questionText}**
`: ''}
`).join('\n---\n')}
        `.trim();

        try {
            const savedNotes: Note[] = JSON.parse(localStorage.getItem('studyNotes') || '[]');
            const newNote: Note = {
                id: Date.now().toString(),
                title: `Case: ${caseData.caseTitle}`,
                content: markdownContent,
                createdAt: Date.now(),
                tags: ['case-study'],
                folderId: finalFolderId,
            };
            localStorage.setItem('studyNotes', JSON.stringify([newNote, ...savedNotes]));
            if (newFolderName) {
                 localStorage.setItem('studyFolders', JSON.stringify(currentFolders));
            }
            alert(`Case Study saved!`);
        } catch (e) {
            console.error("Failed to save note:", e);
            alert("Could not save note.");
        } finally {
            setIsSaveModalOpen(false);
        }
    };

    const renderContent = () => {
        switch(pageState) {
            case 'settings':
                return <div className="flex-1 flex flex-col items-center justify-center p-4"><SettingsForm onGenerate={handleGenerateCase} isGenerating={isLoading} /></div>;
            case 'studying':
                if (caseData) {
                    if (mode === 'full') return <FullCaseView caseData={caseData} onBack={handleBackToSettings} onSave={handleInitiateSave} isFromHistory={!!initialCase} onStartNew={onStartNew} />;
                    return <InteractiveCaseView caseData={caseData} onBack={handleBackToSettings} onNext={handleNextInteractive} userAnswers={userAnswers} onAnswerChange={handleAnswerChange} currentSectionIndex={currentSectionIndex}/>;
                }
                return null;
            case 'review':
                if (caseData) return <CaseReviewView caseData={caseData} userAnswers={userAnswers} onRestart={handleBackToSettings} />;
                return null;
            default: return null;
        }
    }

    if (isLoading) return <div className="flex flex-col items-center justify-center h-full text-center text-gray-400"><LoaderCircle className="w-12 h-12 animate-spin text-blue-500" /><h2 className="text-2xl font-bold mt-4">Generating Your Case Study...</h2><p>This might take a moment.</p></div>;

    if (error && pageState === 'settings') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                 <div className="w-full max-w-2xl mx-auto">
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg mb-6"><p>{error}</p></div>
                    <SettingsForm onGenerate={handleGenerateCase} isGenerating={isLoading} />
                 </div>
            </div>
        );
    }
    
    return (
        <div ref={pageRef} className="overflow-y-auto h-full bg-gray-900 text-white flex flex-col">
            <SaveNoteModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} onSave={handleConfirmSaveCase} folders={folders} />
            {renderContent()}
        </div>
    );
};

export default CaseStudiesPage;
