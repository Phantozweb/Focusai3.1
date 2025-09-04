
export enum MessageAuthor {
  USER = "user",
  AI = "ai",
}

export interface CanvaData {
  state: 'generating' | 'ready';
  topic: string;
  title?: string;
  description?: string;
  content?: string;
  // FIX: Added messageId to associate Canva data with a specific chat message.
  messageId?: string;
}

export interface ChatMessage {
  id: string;
  author: MessageAuthor;
  text: string;
  imageUrl?: string;
  canvaData?: CanvaData;
  suggestedQuestions?: string[];
  generatingSuggestions?: boolean;
}

export enum HistoryItemType {
  Chat = 'chat',
  CaseStudy = 'case-study',
}

export interface HistoryItem {
  id: string;
  type: HistoryItemType;
  title: string;
  createdAt: number;
}

export interface ChatSession extends HistoryItem {
  type: HistoryItemType.Chat;
  messages: ChatMessage[];
}

export interface Note {
  id:string;
  title: string;
  content: string;
  createdAt: number;
  lastEditedAt?: number;
  tags: string[];
  folderId: string;
}

export interface Folder {
  id: string;
  name: string;
}

export interface User {
  username: string;
  tier: 'pro' | 'trial';
  trialStartDate?: number; // Unix timestamp
}


// --- Study Session Types ---

export interface MultipleChoiceQuestion {
  type: 'multiple-choice';
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface SessionSection {
    subTopicTitle: string;
    content: string; // markdown notes for the sub-topic
    question: MultipleChoiceQuestion;
}

export interface GuidedStudySession {
    title: string;
    sections: SessionSection[];
}

// --- Case Study Types ---

export interface CaseStudyQuestion {
    type: 'multiple-choice' | 'short-answer';
    questionText: string;
    options?: string[]; // Only for multiple-choice
    correctAnswer: string;
    explanation: string;
}

export interface CaseStudySection {
    sectionTitle: string; // e.g., 'Patient History', 'Examination Findings'
    content: string; // Markdown content for the section
    question?: CaseStudyQuestion;
}

export interface CaseStudy {
    caseTitle: string;
    patientSummary: string; // A brief overview of the patient
    sections: CaseStudySection[];
}

export interface CaseChatMessage {
  id: string;
  author: MessageAuthor;
  text: string;
}

export interface CaseStudyHistoryItem extends HistoryItem {
  type: HistoryItemType.CaseStudy;
  caseData: CaseStudy;
}

// Union type for the history log
export type HistoryLog = ChatSession | CaseStudyHistoryItem;


// --- Customisable Quiz Types ---

export enum QuizQuestionType {
    MultipleChoice = 'multiple-choice',
    ShortAnswer = 'short-answer',
    Matching = 'matching',
}

export interface MultipleChoiceQuizQuestion {
    type: QuizQuestionType.MultipleChoice;
    question: string;
    options: string[];
    correctAnswer: string; // The text of the correct option
    explanation: string;
}

export interface ShortAnswerQuizQuestion {
    type: QuizQuestionType.ShortAnswer;
    question: string;
    correctAnswer: string; // The ideal answer for self-assessment
    explanation: string;
}

export interface MatchingItem {
    id: string; // e.g. "premise_1"
    value: string; // e.g. "Keratoconus"
}

export interface MatchingQuizQuestion {
    type: QuizQuestionType.Matching;
    question: string; // e.g. "Match the condition to the primary finding."
    premises: MatchingItem[]; // The items to be matched (e.g., conditions)
    responses: MatchingItem[]; // The options to match from (e.g., findings)
    correctPairs: { premiseId: string; responseId: string; }[];
    explanation: string;
}

export type QuizQuestion = MultipleChoiceQuizQuestion | ShortAnswerQuizQuestion | MatchingQuizQuestion;

export interface CustomQuiz {
    title: string;
    questions: QuizQuestion[];
}

// --- Flow Types ---

export interface Flow {
  id: string;
  title: string;
  content: string; // Markdown content
  subTopic: string;
}