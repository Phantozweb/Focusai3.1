
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, WandSparkles, LoaderCircle, Save, Bold, Italic, Heading2, List, ListOrdered, Quote, LayoutTemplate, Eye, Code, FileDown, Search as SearchIcon, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateContent } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AI_ACTIONS = ["Simplify", "Elaborate", "Add Clinical Examples", "Format as Table"];

interface CanvaEditorProps {
    topic: string;
    initialContent: string;
    onClose: () => void;
    onSave: (title: string, content: string) => void;
    onContentChange: (newContent: string) => void;
}

const slugify = (text: string) => {
    if (!text) return '';
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

const getHeadingText = (children: React.ReactNode): string => {
    let text = '';
    React.Children.forEach(children, child => {
        if (typeof child === 'string' || typeof child === 'number') {
            text += child;
        } else if (React.isValidElement(child)) {
            const props = child.props as { children?: React.ReactNode };
            if (props.children) {
                text += getHeadingText(props.children);
            }
        }
    });
    return text;
};

const customMarkdownComponents = {
    h1: (props: { node?: any; children?: React.ReactNode; [key: string]: any; }) => {
        const { node, children, ...rest } = props;
        const text = getHeadingText(children);
        const id = slugify(text);
        return <h1 id={id} className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-8 pb-4 border-b border-gray-700" {...rest}>{children}</h1>
    },
    h2: (props: { node?: any; children?: React.ReactNode; [key: string]: any; }) => {
        const { node, children, ...rest } = props;
        const text = getHeadingText(children);
        const id = slugify(text);
        return <h2 id={id} className="text-3xl font-bold text-blue-300 mt-16 mb-8 pb-3 border-b border-gray-700/60" {...rest}>{children}</h2>
    },
    h3: (props: { node?: any; children?: React.ReactNode; [key: string]: any; }) => {
        const { node, children, ...rest } = props;
        const text = getHeadingText(children);
        const id = slugify(text);
        return <h3 id={id} className="text-2xl font-semibold text-cyan-300 mt-12 mb-5" {...rest}>{children}</h3>
    },
    p: ({node, ...props}) => <p className="leading-relaxed my-3 text-gray-300 text-base" {...props} />,
    ul: ({node, ...props}) => <ul className="my-5 list-disc pl-6 space-y-2" {...props} />,
    ol: ({node, ...props}) => <ol className="my-5 list-decimal pl-6 space-y-2" {...props} />,
    strong: ({node, ...props}) => <strong className="font-bold text-sky-400" {...props} />,
    blockquote: ({node, ...props}) => <blockquote className="my-6 border-l-4 border-blue-500 pl-6 pr-4 py-2 bg-gray-800/60 rounded-r-lg italic text-gray-300" {...props} />,
    table: ({node, ...props}) => <div className="my-8 rounded-xl border border-gray-700 overflow-hidden shadow-lg shadow-black/20"><table className="w-full text-base" {...props} /></div>,
    thead: ({node, ...props}) => <thead className="bg-gray-800" {...props} />,
    th: ({node, ...props}) => <th className="px-6 py-3 font-bold text-blue-300 text-left tracking-wider uppercase text-sm" {...props} />,
    tbody: ({node, ...props}) => <tbody className="divide-y divide-gray-700" {...props} />,
    tr: ({node, ...props}) => <tr className="bg-gray-900/50 even:bg-gray-900/80 hover:bg-gray-800/70 transition-colors" {...props} />,
    td: ({node, ...props}) => <td className="px-6 py-4 align-top text-gray-300" {...props} />,
};

const CanvaEditor: React.FC<CanvaEditorProps> = ({ topic, initialContent, onClose, onSave, onContentChange }) => {
    const [content, setContent] = useState(initialContent);
    const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
    const [isNavOpen, setIsNavOpen] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        onContentChange(content);
    }, [content, onContentChange]);
    
    const title = useMemo(() => {
        const match = content.match(/^#\s*(.*)/);
        return match ? match[1] : topic;
    }, [content, topic]);

    const headings = useMemo(() => {
        const regex = /^(#{1,3})\s+(.*)/gm;
        const matches = [...content.matchAll(regex)];
        return matches.map(match => ({
            level: match[1].length,
            text: match[2].trim()
        }));
    }, [content]);

    const filteredHeadings = headings.filter(h => h.text.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleScrollToHeading = (headingText: string) => {
        if (viewMode !== 'preview' || !previewRef.current) {
            setViewMode('preview'); // Switch to preview mode to scroll
        }
        
        const id = slugify(headingText);
        // Use a timeout to ensure the previewRef is visible after state change
        setTimeout(() => {
             if (!previewRef.current) return;
             const headingElement = previewRef.current.querySelector(`#${CSS.escape(id)}`);
             if (headingElement) {
                headingElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
             }
        }, 50);
    };

    const applyMarkdown = (prefix: string, suffix: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        let newText;
        if (prefix.endsWith(' ')) { // For lists
             const lines = selectedText.split('\n').map(line => line.trim() ? `${prefix}${line}` : line);
             newText = lines.join('\n');
        } else {
             newText = `${prefix}${selectedText}${suffix || prefix}`;
        }
        
        const updatedContent = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
        setContent(updatedContent);
        
        textarea.focus();
    };

    const handleAiAction = async (action: string) => {
        if (!textareaRef.current) return;
        
        const textarea = textareaRef.current;
        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;
        const selectedText = textarea.value.substring(selectionStart, selectionEnd);

        if (!selectedText) {
            alert("Please select some text to edit with AI.");
            return;
        }

        setIsProcessing(true);
        try {
            const prompt = `You are an AI text editor. A user has selected a piece of text and wants you to perform an action on it.
Action: "${action}"
Text:
---
${selectedText}
---
Return ONLY the modified text, ready to be pasted back in place. Maintain markdown formatting if appropriate.`;

            const editedText = await generateContent(prompt);
            
            const newContent = content.substring(0, selectionStart) + editedText + content.substring(selectionEnd);
            setContent(newContent);
            
            textarea.focus();
            setTimeout(() => {
                if(textareaRef.current) {
                    textareaRef.current.selectionStart = selectionStart;
                    textareaRef.current.selectionEnd = selectionStart + editedText.length;
                }
            }, 0);

        } catch (e) {
            console.error("AI Edit failed:", e);
            alert("Failed to edit the text. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

     const handleExport = () => {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(/\s+/g, '_')}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleSaveClick = () => {
        onSave(title, content);
        setSaveState('saved');
    };
    
    return (
        <div className="h-full flex flex-col bg-gray-800 text-white">
            <header className="p-4 border-b border-gray-700/50 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3 overflow-hidden">
                    <LayoutTemplate className="text-blue-400 w-6 h-6 flex-shrink-0" />
                    <h2 className="text-lg font-bold truncate">{title} (Canvas)</h2>
                </div>
                 <div className="flex items-center gap-2">
                    <button 
                        onClick={handleSaveClick} 
                        className={`p-2 rounded-md transition-all duration-300 flex items-center gap-2 px-3 text-sm font-semibold ${
                            saveState === 'saved'
                                ? 'bg-green-600 text-white cursor-default'
                                : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                        disabled={saveState === 'saved'}
                    >
                        {saveState === 'saved' ? <Check size={16} /> : <Save size={16} />} 
                        {saveState === 'saved' ? 'Saved!' : 'Save to Notes'}
                    </button>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                 </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <aside className={`flex-shrink-0 transition-all duration-300 ease-in-out bg-gray-800 border-r border-gray-700/50 ${isNavOpen ? 'w-64' : 'w-0 border-r-0'}`}>
                    <div className={`p-4 h-full flex flex-col gap-3 overflow-hidden whitespace-nowrap transition-opacity ${isNavOpen ? 'opacity-100' : 'opacity-0'}`}>
                        <h3 className="font-semibold text-gray-300">Navigation</h3>
                        <div className="relative">
                            <SearchIcon size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input type="text" placeholder="Search sections..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md pl-8 pr-2 py-1.5 text-sm"/>
                        </div>
                        <nav className="flex-1 overflow-y-auto">
                            <ul>
                                {filteredHeadings.map((h, index) => (
                                    <li key={`${h.text}-${index}`}>
                                        <button 
                                            onClick={() => handleScrollToHeading(h.text)}
                                            className={`w-full text-left p-2 rounded-md text-base text-gray-400 hover:bg-gray-700 hover:text-white truncate ${
                                                h.level === 1 ? 'font-bold text-gray-200' : h.level === 2 ? 'pl-4' : 'pl-8'
                                            }`}
                                        >
                                           {h.text}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                         <button onClick={handleExport} className="w-full mt-auto flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-md transition-colors">
                            <FileDown size={16} />
                            Export as MD
                        </button>
                    </div>
                </aside>

                <div className="flex-1 flex overflow-hidden relative">
                    <button
                        onClick={() => setIsNavOpen(!isNavOpen)}
                        className="absolute top-1/2 -translate-y-1/2 -left-4 z-20 p-1.5 bg-gray-600 hover:bg-gray-500 rounded-full text-white border-2 border-gray-800"
                        title={isNavOpen ? "Collapse Navigation" : "Expand Navigation"}
                    >
                        {isNavOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </button>
                    <main className="flex-1 p-4 flex flex-col gap-2 relative">
                        <div className="flex-shrink-0 bg-gray-900/50 p-2 rounded-md border border-gray-700/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button onClick={() => applyMarkdown('## ')} title="Heading" className="p-2 hover:bg-gray-700 rounded-md"><Heading2 size={18}/></button>
                                <button onClick={() => applyMarkdown('**')} title="Bold" className="p-2 hover:bg-gray-700 rounded-md"><Bold size={18}/></button>
                                <button onClick={() => applyMarkdown('*', '*')} title="Italic" className="p-2 hover:bg-gray-700 rounded-md"><Italic size={18}/></button>
                                <button onClick={() => applyMarkdown('* ')} title="Bulleted List" className="p-2 hover:bg-gray-700 rounded-md"><List size={18}/></button>
                                <button onClick={() => applyMarkdown('1. ')} title="Numbered List" className="p-2 hover:bg-gray-700 rounded-md"><ListOrdered size={18}/></button>
                                <button onClick={() => applyMarkdown('> ')} title="Blockquote" className="p-2 hover:bg-gray-700 rounded-md"><Quote size={18}/></button>
                            </div>
                            <div className="flex bg-gray-700 rounded-lg p-1">
                                <button onClick={() => setViewMode('preview')} className={`px-3 py-1 text-sm rounded-md flex items-center gap-1.5 ${viewMode === 'preview' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}><Eye size={16}/> Preview</button>
                                <button onClick={() => setViewMode('edit')} className={`px-3 py-1 text-sm rounded-md flex items-center gap-1.5 ${viewMode === 'edit' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}><Code size={16}/> Edit</button>
                            </div>
                        </div>
                        {isProcessing && (
                             <div className="absolute inset-4 bg-black/50 rounded-md z-10 flex flex-col items-center justify-center text-center">
                                <LoaderCircle className="animate-spin w-8 h-8 text-white"/>
                                <p className="mt-2 text-sm font-semibold">AI is editing...</p>
                            </div>
                        )}
                        
                        <div className="flex-1 overflow-hidden relative">
                        {viewMode === 'edit' ? (
                            <textarea 
                                ref={textareaRef}
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                className="w-full h-full bg-gray-900/50 p-4 rounded-md resize-none border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed font-mono text-base"
                                placeholder="Edit your canvas here..."
                            />
                         ) : (
                             <article ref={previewRef} className="max-w-none h-full overflow-y-auto p-4 bg-gray-900/50 rounded-md">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={customMarkdownComponents}>
                                    {content}
                                </ReactMarkdown>
                             </article>
                         )}
                        </div>
                    </main>

                    <aside className="w-56 border-l border-gray-700/50 p-4 flex flex-col gap-3 flex-shrink-0">
                        <h3 className="font-semibold text-gray-300">AI Actions</h3>
                        <p className="text-xs text-gray-400 -mt-2">Select text in the editor and choose an action.</p>
                        {AI_ACTIONS.map(action => (
                            <button 
                                key={action}
                                onClick={() => handleAiAction(action)}
                                disabled={isProcessing || viewMode === 'preview'}
                                className="w-full text-left bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/50 disabled:cursor-not-allowed disabled:text-gray-500 text-white text-base px-3 py-2 rounded-md transition-colors"
                            >
                                {action}
                            </button>
                        ))}
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default CanvaEditor;
