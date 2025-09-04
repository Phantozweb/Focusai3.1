

import React, { useState, useRef, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import { generateStudySession } from '../services/geminiService';
import { GuidedStudySession, MultipleChoiceQuestion, Folder, Note } from '../types';
import { LoaderCircle, WandSparkles, BrainCircuit, Lightbulb, Check, X, ArrowLeft, Send, CheckCircle2, XCircle, ChevronRight, FileText, Save, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SaveNoteModal from './SaveNoteModal';

// --- SETTINGS FORM ---

const sessionSettingsOptions = {
    numSections: [3, 5, 7],
    difficulty: ['Easy', 'Medium', 'Hard'],
};

const SessionSettingsForm = ({ onGenerate, isGenerating }) => {
    const [topic, setTopic] = useState('');
    const [numSections, setNumSections] = useState(5);
    const [difficulty, setDifficulty] = useState('Medium');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate({ topic, numSections, difficulty: difficulty.toLowerCase() });
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <BrainCircuit className="w-16 h-16 mx-auto text-blue-500 mb-4" strokeWidth={1.5} />
                <h1 className="text-4xl font-extrabold text-white">Study Session</h1>
                <p className="mt-2 text-lg text-gray-400">Learn actively with AI-curated notes and questions, one step at a time.</p>
            </div>
            <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 sm:p-8 space-y-6">
                <div>
                    <label htmlFor="topic" className="block text-base font-medium text-gray-300 mb-2">What do you want to study?</label>
                    <input
                        id="topic"
                        type="text"
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        placeholder="e.g., The Crystalline Lens, Binocular Vision Anomalies"
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-base font-medium text-gray-300 mb-2">Session Length</label>
                        <div className="flex flex-wrap gap-2">
                            {sessionSettingsOptions.numSections.map((num, i) => (
                                <button key={num} type="button" onClick={() => setNumSections(num)}
                                    className={`px-4 py-2 text-base font-semibold rounded-md transition-colors flex-1 ${num === numSections ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                    {['Short', 'Medium', 'Long'][i]} ({num})
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-base font-medium text-gray-300 mb-2">Difficulty Level</label>
                        <div className="flex flex-wrap gap-2">
                            {sessionSettingsOptions.difficulty.map(level => (
                                <button key={level} type="button" onClick={() => setDifficulty(level)}
                                    className={`px-4 py-2 text-base font-semibold rounded-md transition-colors flex-1 ${level === difficulty ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={!topic.trim() || isGenerating}
                    className="w-full flex items-center justify-center gap-2 text-white bg-blue-700 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg px-5 py-3 text-base font-bold transition-all duration-300 ease-in-out">
                    {isGenerating ? <LoaderCircle className="animate-spin" size={20} /> : <WandSparkles size={20} />}
                    {isGenerating ? 'Building Your Session...' : 'Start Study Session'}
                </button>
            </form>
        </div>
    );
};

// --- CERTIFICATE & MODAL ---

const CertificateModal = ({ isOpen, onClose, onGenerate }) => {
    const [name, setName] = useState('');
    if (!isOpen) return null;

    const handleSubmit = () => {
        if (name.trim()) {
            onGenerate(name.trim());
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Download className="text-blue-400" /> Download Certificate</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                <p className="text-gray-400 mb-4">Please enter your full name to be printed on the certificate.</p>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., John Doe"
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    autoFocus
                />
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={!name.trim()} className="py-2 px-4 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors disabled:bg-gray-500">Generate & Download</button>
                </div>
            </div>
        </div>
    );
};

const Certificate = React.forwardRef<HTMLDivElement, { session: GuidedStudySession; score: { correct: number; total: number }; name: string }>(
    ({ session, score, name }, ref) => {
        const scorePercentage = Math.round((score.correct / score.total) * 100);
        const completionDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        return (
            <div ref={ref} className="w-[1000px] h-[700px] bg-gray-100 p-8 flex flex-col border-8 border-blue-800 font-serif text-gray-800" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                <div className="text-center mb-6">
                    <h1 className="text-5xl font-bold text-blue-900">Certificate of Completion</h1>
                    <p className="text-xl mt-2">This certificate is proudly presented to</p>
                </div>

                <div className="text-center my-8">
                    <h2 className="text-6xl font-extrabold tracking-wider border-b-2 border-t-2 border-yellow-600 inline-block px-8 py-2">{name}</h2>
                </div>

                <div className="text-center text-xl flex-grow">
                    <p>for successfully completing the Study Session on</p>
                    <h3 className="text-3xl font-semibold my-4 text-blue-800">"{session.title}"</h3>
                    <p>with a score of <span className="font-bold">{scorePercentage}%</span> on <span className="font-bold">{completionDate}</span>.</p>
                </div>
                
                <div className="flex justify-between items-end mt-auto text-sm">
                    <div className="text-center">
                        <p className="font-bold border-t-2 border-gray-600 pt-2 px-8">Focus.AI</p>
                        <p>AI Study Platform</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <BrainCircuit className="w-12 h-12 text-blue-800" />
                        <span className="text-lg font-bold text-blue-900">Focus.AI</span>
                    </div>
                    <div className="text-center">
                        <p className="font-bold border-t-2 border-gray-600 pt-2 px-8">{completionDate}</p>
                        <p>Date</p>
                    </div>
                </div>
            </div>
        );
    }
);


// --- STUDY SESSION COMPONENTS ---

const customNoteComponents = {
    h1: ({node, ...props}) => <h1 className="text-3xl font-bold my-4 text-gray-100" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-2xl font-bold my-3 text-gray-200" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-xl font-semibold my-2 text-gray-200" {...props} />,
    p: ({node, ...props}) => <p className="leading-relaxed my-2 text-gray-300 text-base" {...props} />,
    ul: ({node, ...props}) => <ul className="my-2 list-disc pl-5 space-y-1" {...props} />,
    ol: ({node, ...props}) => <ol className="my-2 list-decimal pl-5 space-y-1" {...props} />,
    li: ({node, ...props}) => <li className="marker:text-blue-500 text-base" {...props} />,
    strong: ({node, ...props}) => <strong className="font-bold text-sky-400" {...props} />,
    blockquote: ({node, ...props}) => <blockquote className="my-2 border-l-4 border-blue-500 pl-4 py-1 bg-gray-800/50 rounded-r-md italic text-gray-300" {...props} />,
    table: ({node, ...props}) => <div className="my-4 rounded-lg border border-gray-700 overflow-hidden"><table className="w-full text-sm" {...props} /></div>,
    thead: ({node, ...props}) => <thead className="bg-gray-800" {...props} />,
    th: ({node, ...props}) => <th className="px-4 py-2 font-semibold text-blue-300 text-left text-xs uppercase" {...props} />,
    tbody: ({node, ...props}) => <tbody className="divide-y divide-gray-700" {...props} />,
    tr: ({node, ...props}) => <tr className="bg-gray-900/70 hover:bg-gray-800/80" {...props} />,
    td: ({node, ...props}) => <td className="px-4 py-2 align-top text-gray-300 text-base" {...props} />,
};

const QuestionComponent = ({ question, qIndex, userAnswer, onAnswerChange }) => {
    return (
        <div className="mt-8 bg-gray-900/40 border-t-2 border-blue-800/50 rounded-lg p-6">
            <p className="font-semibold text-xl text-gray-200 mb-4">Check your understanding:</p>
            <p className="font-medium text-gray-100 mb-4 text-lg">{question.question}</p>
            <div className="space-y-3">
                {question.options.map((option, i) => (
                    <button key={i} onClick={() => onAnswerChange(qIndex, option)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${userAnswer === option ? 'bg-blue-600/30 border-blue-500' : 'bg-gray-700/50 border-gray-600 hover:border-blue-700'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${userAnswer === option ? 'border-blue-400 bg-blue-500' : 'border-gray-500'}`}>
                            {userAnswer === option && <Check size={12} className="text-white"/>}
                        </div>
                        <span className="text-base">{option}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const StudyInProgressView = ({ session, onBack, onNext, userAnswers, onAnswerChange, currentSectionIndex }) => {
    const section = session.sections[currentSectionIndex];
    const isLastSection = currentSectionIndex === session.sections.length - 1;

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
            <div className="flex items-center gap-4 mb-4">
                <button onClick={onBack} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                <div className='flex-1'>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">{session.title}</h1>
                    <p className="text-sm text-gray-400">Section {currentSectionIndex + 1} of {session.sections.length}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-8">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${((currentSectionIndex + 1) / session.sections.length) * 100}%` }}></div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-blue-300 mb-4">{section.subTopicTitle}</h2>
                <div className="prose prose-invert max-w-none text-gray-300">
                   <ReactMarkdown remarkPlugins={[remarkGfm]} components={customNoteComponents}>
                        {section.content}
                   </ReactMarkdown>
                </div>
                <QuestionComponent
                    question={section.question}
                    qIndex={currentSectionIndex}
                    userAnswer={userAnswers[currentSectionIndex]}
                    onAnswerChange={onAnswerChange}
                />
            </div>
            
            <button onClick={onNext} className="mt-8 w-full flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-500 rounded-lg px-5 py-3 text-base font-bold transition-all">
                {isLastSection ? 'Finish & See Results' : 'Next Section'}
                {!isLastSection && <ChevronRight size={20} />}
            </button>
        </div>
    );
}

const ResultsView = ({ session, userAnswers, score, onRestart, onSave, onDownloadCertificate }) => {
    const scorePercentage = Math.round((score.correct / score.total) * 100);

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
            <div className="flex items-center justify-between mb-8">
                <div className="w-12"></div>
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-white">Session Results</h1>
                    <p className="mt-2 text-lg text-gray-400">{session.title}</p>
                </div>
                <div className="w-auto flex justify-end gap-2">
                    <button onClick={onSave} className="p-2 text-gray-300 hover:text-white bg-gray-700/60 hover:bg-gray-600 rounded-full transition-colors" title="Save Session to Notes">
                        <Save size={20} />
                    </button>
                    <button onClick={onDownloadCertificate} className="p-2 text-gray-300 hover:text-white bg-gray-700/60 hover:bg-gray-600 rounded-full transition-colors" title="Download Certificate">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-6 mb-8 text-center flex flex-col items-center">
                <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path className="text-gray-700" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-blue-500" strokeWidth="3" fill="none" strokeDasharray={`${scorePercentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-white">{scorePercentage}%</span>
                        <span className="text-base text-gray-400">{score.correct}/{score.total}</span>
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white mt-4">Well Done!</h2>
            </div>
            
            <div className="space-y-4">
                {session.sections.map((section, index) => {
                    const userAnswer = userAnswers[index];
                    const correctAnswer = section.question.answer;
                    const isCorrect = userAnswer === correctAnswer;
                    return (
                        <div key={index} className={`border-l-4 p-4 rounded-r-lg ${isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                            <p className="font-semibold text-gray-200 text-lg">{index + 1}. {section.question.question}</p>
                            <div className="text-base mt-2 space-y-2 text-gray-300">
                                <div className="flex items-center gap-2">
                                    {isCorrect 
                                        ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                                        : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                    }
                                    <span>Your answer: {userAnswer || 'Not answered'}</span>
                                </div>
                                {!isCorrect && (
                                     <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                                        <span>Correct answer: {correctAnswer}</span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-2 p-3 bg-gray-800/50 rounded-md">
                                <div className="flex items-start gap-2">
                                    <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-base text-gray-300">{section.question.explanation}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button onClick={onRestart} className="mt-8 w-full flex items-center justify-center gap-2 text-white bg-blue-700 hover:bg-blue-600 rounded-lg px-5 py-3 text-base font-bold transition-all">
                <ArrowLeft size={20} />
                Start a New Session
            </button>
        </div>
    )
}

// --- MAIN PAGE COMPONENT ---

const GuidedStudySessionsPage: React.FC = () => {
    const [sessionState, setSessionState] = useState<'settings' | 'studying' | 'results'>('settings');
    const [session, setSession] = useState<GuidedStudySession | null>(null);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [score, setScore] = useState<{correct: number, total: number} | null>(null);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const pageRef = useRef<HTMLDivElement>(null);

    const [folders, setFolders] = useState<Folder[]>([]);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    
    const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
    const [certificateName, setCertificateName] = useState('');
    const certificateRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (certificateName && certificateRef.current && session) {
            const timer = setTimeout(() => {
                if (!certificateRef.current) return;
                htmlToImage.toPng(certificateRef.current, { cacheBust: true, pixelRatio: 2 })
                    .then((dataUrl) => {
                        const link = document.createElement('a');
                        link.download = `FocusAI_Certificate_${session.title.replace(/\s/g, '_')}.png`;
                        link.href = dataUrl;
                        link.click();
                        setCertificateName(''); // Reset
                    })
                    .catch((err) => {
                        console.error('Failed to generate certificate:', err);
                        alert('Could not generate certificate. Please try again.');
                        setCertificateName(''); // Reset on error
                    });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [certificateName, session]);


    const handleGenerateSession = async (settings) => {
        setIsLoading(true);
        setSession(null);
        setError(null);
        try {
            const generatedSession = await generateStudySession(settings);
            if (!generatedSession || !generatedSession.sections || generatedSession.sections.length === 0) {
                throw new Error("Generated session is empty or invalid.");
            }
            setSession(generatedSession);
            setUserAnswers(new Array(generatedSession.sections.length).fill(null));
            setCurrentSectionIndex(0);
            setSessionState('studying');
        } catch (e) {
            console.error(e);
            setError("Failed to generate session. The AI might be too busy or the topic is too specific. Please try again.");
            setSessionState('settings');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAnswerChange = (questionIndex: number, answer: string) => {
        setUserAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[questionIndex] = answer;
            return newAnswers;
        });
    };

    const handleNext = () => {
        if (!session) return;
        const isLastSection = currentSectionIndex === session.sections.length - 1;

        if (isLastSection) {
            // Finish session and calculate score
            let correctCount = 0;
            session.sections.forEach((section, index) => {
                if (userAnswers[index] === section.question.answer) {
                    correctCount++;
                }
            });
            setScore({ correct: correctCount, total: session.sections.length });
            setSessionState('results');
        } else {
            // Move to next section
            setCurrentSectionIndex(prev => prev + 1);
        }
        pageRef.current?.scrollTo(0, 0);
    };

    const handleBackToSettings = () => {
        setSession(null);
        setError(null);
        setIsLoading(false);
        setSessionState('settings');
        setCurrentSectionIndex(0);
        setUserAnswers([]);
        setScore(null);
    };
    
    const handleInitiateSave = () => {
        setIsSaveModalOpen(true);
    };
    
    const handleInitiateDownload = () => {
        setIsCertificateModalOpen(true);
    };
    
    const handleGenerateCertificate = (name: string) => {
        setCertificateName(name);
        setIsCertificateModalOpen(false);
    };

    const handleConfirmSaveSession = (folderId: string | null, newFolderName: string | null) => {
        if (!session) return;

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
# Study Session: ${session.title}

${session.sections.map((section, index) => `
## ${section.subTopicTitle}

${section.content}

---

### Question & Review

**Question:** ${section.question.question}

*   **Your Answer:** ${userAnswers[index] || 'Not Answered'}
*   **Correct Answer:** ${section.question.answer}
*   **Explanation:** ${section.question.explanation}
`).join('\n---\n')}
        `.trim();

        try {
            const savedNotes: Note[] = JSON.parse(localStorage.getItem('studyNotes') || '[]');
            const newNote: Note = {
                id: Date.now().toString(),
                title: `Session: ${session.title}`,
                content: markdownContent,
                createdAt: Date.now(),
                tags: ['study-session'],
                folderId: finalFolderId,
            };
            localStorage.setItem('studyNotes', JSON.stringify([newNote, ...savedNotes]));
            if (newFolderName) {
                localStorage.setItem('studyFolders', JSON.stringify(currentFolders));
            }
            alert(`Study Session saved!`);
        } catch (e) {
             console.error("Failed to save note:", e);
             alert("Could not save note.");
        } finally {
            setIsSaveModalOpen(false);
        }
    };


    const renderContent = () => {
        if (sessionState === 'settings') {
             return (
                 <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
                    <SessionSettingsForm onGenerate={handleGenerateSession} isGenerating={isLoading} />
                 </div>
            );
        }
        if (session && sessionState === 'studying') {
            return (
                <StudyInProgressView
                    session={session}
                    onBack={handleBackToSettings}
                    onNext={handleNext}
                    userAnswers={userAnswers}
                    onAnswerChange={handleAnswerChange}
                    currentSectionIndex={currentSectionIndex}
                />
            );
        }
        if (session && score && sessionState === 'results') {
            return (
                 <ResultsView
                    session={session}
                    userAnswers={userAnswers}
                    score={score}
                    onRestart={handleBackToSettings}
                    onSave={handleInitiateSave}
                    onDownloadCertificate={handleInitiateDownload}
                />
            );
        }
        return null;
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                <LoaderCircle className="w-12 h-12 animate-spin text-blue-500" />
                <h2 className="text-2xl font-bold mt-4">Building Your Study Session...</h2>
                <p>The AI is curating notes and questions. This may take a moment.</p>
            </div>
        );
    }

    if (error && sessionState === 'settings') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                 <div className="w-full max-w-2xl mx-auto">
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg mb-6">
                        <p>{error}</p>
                    </div>
                    <SessionSettingsForm onGenerate={handleGenerateSession} isGenerating={isLoading} />
                 </div>
            </div>
        );
    }
    
    return (
        <div ref={pageRef} className="overflow-y-auto h-full bg-gray-900 text-white">
            <SaveNoteModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} onSave={handleConfirmSaveSession} folders={folders} />
            <CertificateModal isOpen={isCertificateModalOpen} onClose={() => setIsCertificateModalOpen(false)} onGenerate={handleGenerateCertificate} />
            {session && score && certificateName && (
                <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                    <Certificate ref={certificateRef} session={session} score={score} name={certificateName} />
                </div>
            )}
            {renderContent()}
        </div>
    );
};

export default GuidedStudySessionsPage;