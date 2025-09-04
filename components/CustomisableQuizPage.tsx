

import React, { useState, useRef } from 'react';
import { generateCustomQuiz } from '../services/geminiService';
import { CustomQuiz, QuizQuestionType } from '../types';
import { LoaderCircle, WandSparkles, Lightbulb, ArrowLeft, CheckSquare } from 'lucide-react';

// --- SETTINGS FORM ---

const QuizSettingsForm = ({ onGenerate, isGenerating }) => {
    const [topic, setTopic] = useState('');
    const [questionCount, setQuestionCount] = useState(10);
    const [difficulty, setDifficulty] = useState('Medium');
    const [outputFormat, setOutputFormat] = useState<'q_and_a' | 'q_only'>('q_and_a');
    const [questionTypes, setQuestionTypes] = useState<QuizQuestionType[]>([QuizQuestionType.MultipleChoice]);

    const handleTypeToggle = (type: QuizQuestionType) => {
        setQuestionTypes(prev => {
            if (prev.includes(type)) {
                if (prev.length === 1) return prev; // Must have at least one type
                return prev.filter(t => t !== type);
            }
            return [...prev, type];
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate({ topic, questionCount, difficulty: difficulty.toLowerCase(), questionTypes }, outputFormat);
    };

    const availableTypes = [
        { id: QuizQuestionType.MultipleChoice, label: "Multiple Choice" },
        { id: QuizQuestionType.ShortAnswer, label: "Short Answer" },
        { id: QuizQuestionType.Matching, label: "Matching" }
    ];

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <CheckSquare className="w-16 h-16 mx-auto text-blue-500 mb-4" strokeWidth={1.5} />
                <h1 className="text-4xl font-extrabold text-white">Customisable Quiz</h1>
                <p className="mt-2 text-lg text-gray-400">Create a tailored quiz to test your knowledge on any topic.</p>
            </div>
            <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 sm:p-8 space-y-6">
                <div>
                    <label htmlFor="topic" className="block text-base font-medium text-gray-300 mb-2">Quiz Topic</label>
                    <input id="topic" type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., Ocular Pharmacology" className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2.5 focus:ring-2 focus:ring-blue-500" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-base font-medium text-gray-300 mb-2">Number of Questions</label>
                        <div className="flex flex-wrap gap-2">
                            {[5, 10, 15].map(num => (
                                <button key={num} type="button" onClick={() => setQuestionCount(num)} className={`px-4 py-2 text-base font-semibold rounded-md transition-colors flex-1 ${num === questionCount ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{num}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-base font-medium text-gray-300 mb-2">Difficulty</label>
                        <div className="flex flex-wrap gap-2">
                            {['Easy', 'Medium', 'Hard'].map(level => (
                                <button key={level} type="button" onClick={() => setDifficulty(level)} className={`px-4 py-2 text-base font-semibold rounded-md transition-colors flex-1 ${level === difficulty ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{level}</button>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-base font-medium text-gray-300 mb-2">Question Types</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                       {availableTypes.map(type => (
                           <label key={type.id} className={`flex items-center space-x-2 text-gray-200 p-2 rounded-lg border-2 cursor-pointer ${questionTypes.includes(type.id) ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'}`}>
                               <input type="checkbox" checked={questionTypes.includes(type.id)} onChange={() => handleTypeToggle(type.id)} className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 shrink-0"/>
                               <span className="text-base font-medium">{type.label}</span>
                           </label>
                       ))}
                    </div>
                </div>
                 <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">Output Format</label>
                  <div className="flex bg-gray-700/80 rounded-lg p-1 space-x-1">
                    <button type="button" onClick={() => setOutputFormat('q_and_a')} className={`w-full text-center px-4 py-2 text-base font-semibold rounded-md transition-colors ${outputFormat === 'q_and_a' ? 'bg-blue-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600/50'}`}>Questions & Answers</button>
                    <button type="button" onClick={() => setOutputFormat('q_only')} className={`w-full text-center px-4 py-2 text-base font-semibold rounded-md transition-colors ${outputFormat === 'q_only' ? 'bg-blue-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600/50'}`}>Questions Only</button>
                  </div>
                </div>

                <button type="submit" disabled={!topic.trim() || isGenerating} className="w-full flex items-center justify-center gap-2 text-white bg-blue-700 hover:bg-blue-600 disabled:bg-gray-600 rounded-lg px-5 py-3 text-base font-bold transition-all">
                    {isGenerating ? <LoaderCircle className="animate-spin" size={20} /> : <WandSparkles size={20} />}
                    {isGenerating ? 'Generating Quiz...' : 'Generate Quiz'}
                </button>
            </form>
        </div>
    );
};

// --- QUIZ DISPLAY ---

const QuizDisplayView = ({ quiz, showAnswers, onBack }) => {
    const getCorrectPairsMap = (question) => {
        if (question.type !== QuizQuestionType.Matching) return new Map();
        const map = new Map();
        for (const pair of question.correctPairs) {
            map.set(pair.premiseId, pair.responseId);
        }
        return map;
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                <div className='flex-1'>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">{quiz.title}</h1>
                    <p className="text-base text-gray-400">{showAnswers ? "Quiz with answers" : "Questions only"}</p>
                </div>
            </div>

            <div className="space-y-8">
                {quiz.questions.map((q, i) => (
                    <div key={i} className="bg-gray-800/50 rounded-lg p-6">
                        <p className="font-semibold text-gray-200 mb-4 text-lg">{i + 1}. {q.question}</p>
                        
                        {q.type === QuizQuestionType.MultipleChoice && (
                            <div className="space-y-3">
                                {(q as any).options.map((option, j) => (
                                    <div key={j} className={`p-3 rounded-lg border-2 text-base ${showAnswers && option === (q as any).correctAnswer ? 'bg-green-500/10 border-green-500' : 'border-gray-700'}`}>
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}

                        {q.type === QuizQuestionType.ShortAnswer && !showAnswers && (
                             <div className="h-32 bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-lg"></div>
                        )}

                        {q.type === QuizQuestionType.Matching && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <div className="space-y-2">
                                    <h4 className="font-bold text-gray-400 text-base uppercase text-center">Premises</h4>
                                    {(q as any).premises.map(p => <div key={p.id} className="p-3 bg-gray-700 rounded-md text-center text-base">{p.value}</div>)}
                                </div>
                                <div className="space-y-2">
                                     <h4 className="font-bold text-gray-400 text-base uppercase text-center">Responses</h4>
                                    {(q as any).responses.map(r => <div key={r.id} className="p-3 bg-gray-700 rounded-md text-center text-base">{r.value}</div>)}
                                </div>
                            </div>
                        )}
                        
                        {showAnswers && (
                             <div className="mt-4 p-3 rounded-md bg-gray-900/50 border-t border-blue-500/30">
                                 <div className="flex items-start gap-2">
                                    <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-base text-gray-300 w-full">
                                        <p className="font-semibold mb-2">Answer & Explanation</p>
                                        
                                        {q.type === QuizQuestionType.MultipleChoice && <p className="italic"><strong>Correct Answer:</strong> {(q as any).correctAnswer}</p>}
                                        {q.type === QuizQuestionType.ShortAnswer && <p className="italic"><strong>Ideal Answer:</strong> {(q as any).correctAnswer}</p>}
                                        
                                        {q.type === QuizQuestionType.Matching && (
                                            <div className="mb-2">
                                                <strong>Correct Pairs:</strong>
                                                <ul className="list-disc pl-5 mt-1">
                                                     {(q as any).premises.map(p => {
                                                        const correctResponseId = getCorrectPairsMap(q).get(p.id);
                                                        const correctResponse = (q as any).responses.find(r => r.id === correctResponseId);
                                                        return <li key={p.id}>{p.value} &rarr; {correctResponse?.value || 'N/A'}</li>
                                                    })}
                                                </ul>
                                            </div>
                                        )}

                                        <p className="mt-2">{(q as any).explanation}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
             <button onClick={onBack} className="mt-8 w-full flex items-center justify-center gap-2 text-white bg-blue-700 hover:bg-blue-600 rounded-lg px-5 py-3 text-base font-bold">
                <ArrowLeft size={20} /> Generate Another Quiz
            </button>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---

const CustomisableQuizPage: React.FC = () => {
    const [pageState, setPageState] = useState<'settings' | 'displaying'>('settings');
    const [quiz, setQuiz] = useState<CustomQuiz | null>(null);
    const [generationType, setGenerationType] = useState<'q_and_a' | 'q_only'>('q_and_a');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const pageRef = useRef<HTMLDivElement>(null);

    const handleGenerate = async (settings, selectedFormat) => {
        setIsLoading(true);
        setError(null);
        setGenerationType(selectedFormat);
        try {
            const generatedQuiz = await generateCustomQuiz(settings);
            setQuiz(generatedQuiz);
            setPageState('displaying');
            pageRef.current?.scrollTo(0, 0);
        } catch (e) {
            setError(e.message || "An unknown error occurred.");
            setPageState('settings');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleBackToSettings = () => {
        setPageState('settings');
        setQuiz(null);
        setError(null);
    }

    const renderContent = () => {
        switch (pageState) {
            case 'settings':
                return <div className="flex-1 flex flex-col items-center justify-center p-4"><QuizSettingsForm onGenerate={handleGenerate} isGenerating={isLoading} /></div>;
            case 'displaying':
                return <QuizDisplayView quiz={quiz!} showAnswers={generationType === 'q_and_a'} onBack={handleBackToSettings} />;
            default: return null;
        }
    };
    
     if (isLoading) return <div className="flex flex-col items-center justify-center h-full text-center text-gray-400"><LoaderCircle className="w-12 h-12 animate-spin text-blue-500" /><h2 className="text-2xl font-bold mt-4">Generating Your Quiz...</h2><p>This may take a moment.</p></div>;
     
     if (error && pageState === 'settings') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                 <div className="w-full max-w-2xl mx-auto">
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg mb-6"><p>{error}</p></div>
                    <QuizSettingsForm onGenerate={handleGenerate} isGenerating={isLoading} />
                 </div>
            </div>
        );
    }

    return <div ref={pageRef} className="overflow-y-auto h-full bg-gray-900 text-white flex flex-col">{renderContent()}</div>;
};

export default CustomisableQuizPage;