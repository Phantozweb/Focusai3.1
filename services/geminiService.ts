
import { GoogleGenAI, Chat, GenerateContentResponse, Type, Content } from "@google/genai";
import { GuidedStudySession, CaseStudy, CaseStudyQuestion, CustomQuiz, QuizQuestionType, Flow } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// FIX: Added optional history parameter to allow restoring chat sessions.
export const createChat = (customInstructions?: string, history?: Content[]): Chat => {
  const baseInstruction = `You are Focus.AI, a specialized AI assistant for optometry students. Your responses should be:
    
    1. Accurate and evidence-based, using current optometric knowledge
    2. Educational, explaining concepts clearly with clinical relevance
    3. Organized with clear sections, bullet points, and tables where appropriate
    4. Student-focused, helping with exam preparation and clinical understanding
    5. Ethical, noting when certain questions require professional judgment
    
    You can answer questions about eye anatomy, disease pathology, diagnosis techniques, treatment options, 
    optical principles, contact lenses, and other topics relevant to optometry students.

    Always format your responses using markdown for readability. Include tables when comparing conditions or treatments,
    and use bullet points for lists of symptoms or procedures.
    
    If the user uploads an image, carefully analyze the image and provide detailed explanations about what you see,
    including any relevant clinical findings, measurements, anomalies, or diagnostic features. If the image shows 
    eye conditions, provide detailed assessment of the visible symptoms, potential diagnoses, and relevant treatment
    approaches when appropriate.
    
    IMPORTANT: You must tailor your response length to the user's query to be efficient and educational.
    - For simple definition or identification questions (e.g., "what is retina?", "retinitis"), provide a concise, single-paragraph answer of about 5-6 lines. It should be easy to understand but more than just a one-sentence definition. Include the most critical information a student should know.
    - For explanatory or detailed questions (e.g., "explain retinitis in detail", "tell me more about..."), provide a comprehensive, multi-paragraph response with all relevant details, tables, and lists as per your core instructions.
    - For very specific, short-answer questions (e.g., "what is the diameter of the optic disc?"), provide a direct and brief answer.
    - Your goal is to be helpful and educational without being unnecessarily verbose. Use your judgment to match the response depth to the user's implied need.

    For mathematical formulas, use KaTeX-compatible LaTeX. For inline formulas, use single dollar signs (e.g., $K = (n_{effective} - 1) / r$). For block formulas, use double dollar signs (e.g., $$\\frac{a}{b}$$). This will ensure formulas are rendered correctly.`;

  let finalInstruction = baseInstruction;
  if (customInstructions) {
    finalInstruction += `\n\n---\n\nA user has provided the following custom instructions. Please adhere to them strictly in your responses, prioritizing them over the base instructions if there is a conflict:\n\n${customInstructions}`;
  }

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    // FIX: Pass history to the create method.
    history: history,
    config: {
      systemInstruction: finalInstruction,
    },
  });
};

export const generateContent = async (prompt: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to generate content from AI.");
  }
};

export const generateCanva = async (topic: string): Promise<{ title: string; description: string; content: string; }> => {
    const canvaSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "A concise, engaging title for the canva document based on the topic." },
            description: { type: Type.STRING, description: "A short, one or two-sentence summary of the document's content." },
            content: { 
                type: Type.STRING, 
                description: "The full document content in well-structured markdown format. Use headings (starting with a single H1 '#'), lists, bold text, tables, and blockquotes for a rich, readable document." 
            }
        },
        required: ['title', 'description', 'content']
    };

    const prompt = `You are an expert at creating study materials for optometry students. Your task is to generate a comprehensive, well-structured document on the topic of "${topic}".

Your response must be a single JSON object that strictly adheres to the provided schema. The 'content' field must be a string containing well-formatted markdown.

**Markdown Formatting Rules for the 'content' field:**
- Use a main title (e.g., '# Main Topic'). This is mandatory.
- Use section headings (e.g., '## Section 1', '### Subsection 1.1').
- Use bullet points (\`* \`) or numbered lists (\`1. \`) for key information.
- Use bold text (\`**...**\`) for important keywords and definitions.
- Use blockquotes (\`> \`) for clinical tips or important asides.
- Use tables to compare and contrast concepts where appropriate.
- Use horizontal rules (\`---\`) to create clear visual separation between major sections.
`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: canvaSchema,
            },
        });
        
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }
        
        const canvaData = JSON.parse(jsonStr);
        return canvaData;

    } catch (error) {
        console.error("Error generating canva:", error);
        throw new Error("Failed to generate Canva from AI.");
    }
};

export const generateSuggestedQuestions = async (userQuery: string, aiResponse: string): Promise<string[]> => {
  try {
    const prompt = `Based on the following user query and AI response, generate 3 short and concise follow-up questions an optometry student might ask to learn more. Each question should be no more than 10-12 words. The questions should probe for deeper understanding, clinical relevance, or alternative perspectives, and be directly related to the user's last query.

Return ONLY a JSON array of strings in your response, like this: \`["Short question 1?", "Short question 2?", "Short question 3?"]\`

---
USER QUERY: ${userQuery}
---
AI RESPONSE: ${aiResponse}
---`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const questions = JSON.parse(jsonStr);
    if (Array.isArray(questions) && questions.every(q => typeof q === 'string')) {
        return questions.slice(0, 3);
    }
    return [];

  } catch (error) {
    console.error("Error generating suggested questions:", error);
    return [];
  }
};

export const generateStudySession = async (settings: {
    topic: string;
    numSections: number;
    difficulty: string;
}): Promise<GuidedStudySession> => {
    const { topic, numSections, difficulty } = settings;

    const sessionQuestionSchema = {
        type: Type.OBJECT,
        properties: {
            type: { type: Type.STRING, enum: ['multiple-choice'] },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, description: "An array of 4 potential answers.", items: { type: Type.STRING } },
            answer: { type: Type.STRING, description: "The correct answer text. Must exactly match one of the options." },
            explanation: { type: Type.STRING, description: "A brief explanation for why the answer is correct." }
        },
        required: ['type', 'question', 'options', 'answer', 'explanation']
    };

    const sessionSectionSchema = {
        type: Type.OBJECT,
        properties: {
            subTopicTitle: { type: Type.STRING, description: "A clear title for this section/sub-topic." },
            content: { type: Type.STRING, description: "Detailed study notes in markdown format for the sub-topic. This should be comprehensive and use markdown for formatting." },
            question: sessionQuestionSchema
        },
        required: ['subTopicTitle', 'content', 'question']
    };

    const studySessionSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "A fitting title for the entire study session based on the main topic." },
            sections: {
                type: Type.ARRAY,
                description: `An array of exactly ${numSections} section objects.`,
                items: sessionSectionSchema
            }
        },
        required: ['title', 'sections']
    };
    
    const prompt = `You are an expert in optometry education. Your task is to create a study session for an optometry student.

**Session Parameters:**
- **Main Topic:** ${topic}
- **Number of Sub-topics/Sections:** ${numSections}
- **Difficulty:** ${difficulty}.
  - Easy: Foundational knowledge, definitions.
  - Medium: Clinical application, diagnosis.
  - Hard: Complex cases, differential diagnosis, advanced concepts.

**Instructions:**
1.  Create a study session based on the parameters above. Break the main topic into ${numSections} logical sub-topics.
2.  For each sub-topic, provide:
    a.  **subTopicTitle**: A clear and concise title for the sub-topic.
    b.  **content**: Detailed study notes in markdown format. Explain the concepts clearly. Use headings, lists, and bold text for readability. This content should provide enough information to answer the question that follows it.
    c.  **question**: A relevant multiple-choice question that tests the material from the 'content' you just provided. The question must have 4 string options, a correct 'answer' that exactly matches one of the options, and a brief 'explanation' for why that answer is correct.
3.  Your entire response MUST be a single JSON object that strictly adheres to the provided schema. Do NOT include any text or markdown formatting before or after the JSON object.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: studySessionSchema,
            },
        });
        
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }
        
        const sessionData = JSON.parse(jsonStr);
        return sessionData as GuidedStudySession;

    } catch (error) {
        console.error("Error generating study session:", error);
        throw new Error("Failed to generate study session from AI.");
    }
};

export const generateCaseStudy = async (topic: string): Promise<CaseStudy> => {
    const caseStudyQuestionSchema = {
        type: Type.OBJECT,
        properties: {
            type: { type: Type.STRING, enum: ['multiple-choice', 'short-answer'], description: "The type of question." },
            questionText: { type: Type.STRING, description: "The question to ask the student." },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 4-5 options for multiple-choice questions. Omit for short-answer." },
            correctAnswer: { type: Type.STRING, description: "The correct answer. For multiple-choice, it must match an option. For short-answer, it's the ideal answer." },
            explanation: { type: Type.STRING, description: "A detailed explanation of why the answer is correct, providing clinical context." }
        },
        required: ['type', 'questionText', 'correctAnswer', 'explanation']
    };

    const caseStudySectionSchema = {
        type: Type.OBJECT,
        properties: {
            sectionTitle: { type: Type.STRING, description: "Title for the case section (e.g., 'Chief Complaint', 'Slit Lamp Examination', 'Fundus Photography', 'Differential Diagnosis')." },
            content: { type: Type.STRING, description: "Detailed clinical information for this section in markdown format. This should be realistic and detailed." },
            question: { ...caseStudyQuestionSchema, description: "An optional question to test the student's understanding of this section." }
        },
        required: ['sectionTitle', 'content']
    };

    const caseStudySchema = {
        type: Type.OBJECT,
        properties: {
            caseTitle: { type: Type.STRING, description: "A concise, engaging title for the case study." },
            patientSummary: { type: Type.STRING, description: "A brief one-sentence summary of the patient (e.g., 'A 65-year-old male presents with sudden, painless vision loss in the right eye.')." },
            sections: {
                type: Type.ARRAY,
                description: "An array of 5-7 logical sections that walk through the case from presentation to conclusion. The final section should be titled 'Final Diagnosis and Management' and should not have a question.",
                items: caseStudySectionSchema
            }
        },
        required: ['caseTitle', 'patientSummary', 'sections']
    };

    const prompt = `You are a clinical optometry professor. Your task is to create a case study for a student based on the following topic: "${topic}".

**Instructions:**
1.  Generate a realistic and educational clinical case study that unfolds logically.
2.  The case must have between 5 and 7 sections.
3.  Typical sections include: 'Patient History', 'Initial Examination', 'Specific Test Results' (e.g., 'OCT Scan'), 'Differential Diagnoses', 'Further Testing', and finally 'Final Diagnosis and Management'.
4.  Each section should contain detailed clinical information in markdown format.
5.  Most sections (except the final one) should end with a challenging question (either multiple-choice or short-answer) to test the student's clinical reasoning based on the information provided up to that point.
6.  The very last section must be titled "Final Diagnosis and Management" and should provide a comprehensive conclusion to the case, summarizing the findings, diagnosis, treatment plan, and patient education. It must not contain a question.
7.  Your entire response must be a single JSON object that strictly adheres to the provided schema. Do not include any text before or after the JSON.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: caseStudySchema,
            },
        });
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }
        const caseData = JSON.parse(jsonStr);
        return caseData as CaseStudy;
    } catch (error) {
        console.error("Error generating case study:", error);
        throw new Error("Failed to generate case study from AI. The topic might be too complex or the AI is currently busy. Please try another topic or try again later.");
    }
};

export const createCaseChat = (caseContent: string): Chat => {
    const systemInstruction = `You are a clinical tutor AI. Your knowledge is strictly limited to the following case study text. You must answer the user's questions based ONLY on the information provided in the case study. Do not infer information that is not explicitly stated. Do not use any external medical or optometric knowledge. If the answer to a question cannot be found in the case study text, you must state that the information is not available in the case file.

--- CASE STUDY ---
${caseContent}
--- END CASE STUDY ---`;

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
    });
};

export const generateQuizFromCase = async (caseContent: string): Promise<CaseStudyQuestion[]> => {
    const quizQuestionSchema = {
        type: Type.OBJECT,
        properties: {
            type: { type: Type.STRING, enum: ['multiple-choice'] },
            questionText: { type: Type.STRING, description: "The quiz question." },
            options: { type: Type.ARRAY, description: "An array of 4 distinct options for the question.", items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING, description: "The correct answer, which must exactly match one of the options." },
            explanation: { type: Type.STRING, description: "A brief explanation for why the answer is correct." }
        },
        required: ['type', 'questionText', 'options', 'correctAnswer', 'explanation']
    };

    const quizSchema = {
        type: Type.OBJECT,
        properties: {
            questions: {
                type: Type.ARRAY,
                description: "An array of exactly 5 multiple-choice questions.",
                items: quizQuestionSchema
            }
        },
        required: ['questions']
    };

    const prompt = `Based on the following optometry case study, generate a 5-question multiple-choice quiz. This quiz should test comprehension of key clinical findings, patient history, and diagnostic reasoning presented in the text. Your entire response must be a single JSON object that strictly adheres to the provided schema. Do not include any text before or after the JSON.

--- CASE STUDY ---
${caseContent}
--- END CASE STUDY ---`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
            },
        });
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }
        const quizData = JSON.parse(jsonStr);
        return (quizData.questions || []) as CaseStudyQuestion[];
    } catch (error) {
        console.error("Error generating quiz from case:", error);
        throw new Error("Failed to generate a quiz for this case study.");
    }
};

export const generateCustomQuiz = async (settings: {
  topic: string;
  questionCount: number;
  difficulty: string;
  questionTypes: QuizQuestionType[];
}): Promise<CustomQuiz> => {
  const { topic, questionCount, difficulty, questionTypes } = settings;

  const matchingItemSchema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: "A unique identifier, e.g., 'p1' or 'r1'." },
      value: { type: Type.STRING, description: "The text content of the item." },
    },
    required: ["id", "value"],
  };

  const correctPairSchema = {
    type: Type.OBJECT,
    properties: {
      premiseId: { type: Type.STRING },
      responseId: { type: Type.STRING },
    },
    required: ["premiseId", "responseId"],
  };

  // A flexible schema to accommodate all question types.
  // We make fields optional and the prompt will guide the model to fill the right ones.
  const questionSchema = {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING, enum: Object.values(QuizQuestionType) },
      question: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "For multiple-choice: an array of 4-5 string options." },
      correctAnswer: { type: Type.STRING, description: "For multiple-choice/short-answer: the correct answer text." },
      premises: { type: Type.ARRAY, items: matchingItemSchema, description: "For matching: the items to be matched." },
      responses: { type: Type.ARRAY, items: matchingItemSchema, description: "For matching: the options to match from." },
      correctPairs: { type: Type.ARRAY, items: correctPairSchema, description: "For matching: an array of correct premise-response ID pairs." },
      explanation: { type: Type.STRING, description: "A brief, clear explanation for the correct answer." },
    },
    required: ["type", "question", "explanation"],
  };

  const quizSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: `A quiz title based on the topic: ${topic}.` },
      questions: {
        type: Type.ARRAY,
        description: `An array of exactly ${questionCount} question objects.`,
        items: questionSchema,
      },
    },
    required: ["title", "questions"],
  };

  const prompt = `You are an expert optometry quiz creator. Generate a custom quiz based on the following specifications.

**Quiz Parameters:**
- **Topic:** ${topic}
- **Total Questions:** ${questionCount}
- **Difficulty:** ${difficulty}
- **Requested Question Types:** ${questionTypes.join(", ")}. Distribute the questions among these types.

**Instructions:**
1.  Create a quiz that strictly adheres to the parameters.
2.  For each question, provide the necessary fields based on its type:
    - **multiple-choice:** requires \`options\` and \`correctAnswer\` (which must match an option).
    - **short-answer:** requires \`correctAnswer\` (the ideal text answer).
    - **matching:** requires \`premises\`, \`responses\`, and \`correctPairs\`. Ensure IDs are unique within the question.
3.  Your entire response MUST be a single JSON object that adheres to the provided schema. Do not include any text before or after the JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    const quizData = JSON.parse(jsonStr);
    return quizData as CustomQuiz;
  } catch (error) {
    console.error("Error generating custom quiz:", error);
    throw new Error("Failed to generate custom quiz from AI. The topic might be too complex or the AI is currently busy. Please try another topic or try again later.");
  }
};

export const generateFlows = async (settings: {
  topic: string;
  count: number;
  likes: string[]; // subTopics the user liked
  dislikes: string[]; // subTopics the user disliked
}): Promise<Flow[]> => {
    const { topic, count, likes, dislikes } = settings;

    const flowSchema = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING, description: "A unique slug-like identifier for this flow." },
            title: { type: Type.STRING, description: "A very short, catchy, title for the content (max 5 words)." },
            content: { type: Type.STRING, description: "A concise, engaging piece of optometry study material in markdown format. Should be easily digestible in under 30 seconds. Use headings, bold text, bullet points, and especially tables for comparisons." },
            subTopic: { type: Type.STRING, description: "A specific sub-topic this content relates to (e.g., 'Angle Closure Glaucoma', 'Accommodative Esotropia')." }
        },
        required: ['id', 'title', 'content', 'subTopic']
    };

    const flowsSchema = {
        type: Type.OBJECT,
        properties: {
            flows: {
                type: Type.ARRAY,
                description: `An array of exactly ${count} unique flow objects.`,
                items: flowSchema
            }
        },
        required: ['flows']
    };
    
    let personalizationPrompt = '';
    if (likes.length > 0) {
        personalizationPrompt += `\n- Prioritize generating content related to these liked sub-topics: ${likes.join(', ')}.`;
    }
    if (dislikes.length > 0) {
        personalizationPrompt += `\n- Avoid generating content related to these disliked sub-topics: ${dislikes.join(', ')}.`;
    }

    const prompt = `You are an AI that creates "Flows" - short, engaging, vertical-scroll-style educational content for optometry students.

**Main Topic:** ${topic}

**Instructions:**
1.  Generate ${count} unique "Flows" related to the main topic.
2.  Each flow should be extremely concise and easy to understand quickly. Think of them as study flashcards or reels.
3.  The 'content' field must be well-structured markdown. Use headings, bold text, lists, and tables.
4.  When comparing two or more items (e.g., conditions, drugs), ALWAYS use a markdown table for clarity.
5.  Vary the format. Use things like:
    - Quick Facts tables
    - Mnemonics
    - "Myth vs. Fact"
    - "Clinical Pearl" (using blockquotes)
    - A quick case vignette with a "What's the diagnosis?" question.
6.  Each flow must have a unique ID, a very short title, the markdown content, and a specific sub-topic.
${personalizationPrompt ? `\n**Personalization Guidelines:**\n${personalizationPrompt}` : ''}
7.  Your entire response must be a single JSON object that strictly adheres to the provided schema. Do not include any text before or after the JSON.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: flowsSchema,
            },
        });
        
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }
        
        const flowsData = JSON.parse(jsonStr);
        return (flowsData.flows || []) as Flow[];

    } catch (error) {
        console.error("Error generating flows:", error);
        throw new Error("Failed to generate Flows from AI. The topic might be too complex or the AI is currently busy. Please try another topic or try again later.");
    }
};

export const generateChatTitle = async (firstMessage: string): Promise<string> => {
  try {
    const prompt = `Generate a concise, 3-5 word title for a chat conversation that starts with the following message. Respond with ONLY the title text, nothing else.\n\nMESSAGE: "${firstMessage}"`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    // Clean up potential quotes and leading/trailing whitespace
    return response.text.trim().replace(/^"|"$/g, '');
  } catch (error) {
    console.error("Error generating chat title:", error);
    return "New Chat"; // Fallback title
  }
};