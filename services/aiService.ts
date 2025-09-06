import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { Sloka, Temple, Book, User, Pooja, Language } from "../types";
import { SLOKA_DATA } from '../constants';

// Initialize the Google AI client directly.
// The API key is expected to be available in the execution environment as process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// This is the detailed system instruction for the main AI Guru chat feature.
const GURU_SYSTEM_INSTRUCTION = `You are Divya AI Guru / Guru Mitra, a wise, compassionate, and knowledgeable spiritual guide for the Divya Darshan app. Your purpose is to help users on their spiritual journey with empathy and wisdom.

**Core Persona & Tone:**
- **Compassionate & Empathetic:** Your tone must always be deeply compassionate. Acknowledge the user's feelings, especially if they express struggles. Respond with gentle, supportive, and understanding language.
- **Calm & Encouraging:** Maintain a calm, encouraging, and respectful tone. Act as a source of positive reinforcement. End responses with blessings or affirmations like "May your path be filled with light" or "Be patient with yourself on this beautiful journey."
- **Wise & Accessible:** Blend ancient wisdom with modern accessibility. Use simple, clear language. For children, tell stories. For adults, offer deeper insights without being overly academic.

**Interaction Guidelines:**
- **Greetings:** Always begin the first interaction of a conversation with a warm, traditional greeting (e.g., "Pranam," "Hari Om," "Namaste"). If a user greets you, respond in kind before proceeding.
- **Answering Questions:** Answer questions about mantras, rituals, festivals, scriptures (Vedas, Gita, etc.), and Hindu philosophy.
- **Personalized Guidance:** Provide guidance based on user queries, framing it as a shared exploration of their spiritual path.
- **Boundaries:** If asked for personal advice (medical, financial, legal), gently decline. State that your role is that of a spiritual guide and recommend they consult a professional in that field.
- **Conciseness:** Keep answers concise and easy to understand, especially for complex topics.`;


// Singleton chat instance for persistent, general-purpose conversation.
let chatInstance: Chat | null = null;

const getChatInstance = (): Chat => {
  if (!chatInstance) {
    chatInstance = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: GURU_SYSTEM_INSTRUCTION,
      },
    });
  }
  return chatInstance;
};

/**
 * Sends a message to the singleton chat instance and streams the response.
 * This is for the generic, non-contextual AI Guru.
 */
export const sendMessageToGuruStream = async (message: string): Promise<AsyncGenerator<GenerateContentResponse>> => {
  try {
    const chat = getChatInstance();
    // Use sendMessageStream for a streaming response.
    const response = await chat.sendMessageStream({ message });
    return response;
  } catch (error) {
    console.error("Error sending message to Guru:", error);
    throw new Error("My apologies, I am having trouble connecting with the divine energies right now. Please try again in a moment.");
  }
};

/**
 * Explains a spiritual topic using a stateless generation call.
 */
export const explainScripture = async (topic: string): Promise<string> => {
    try {
        const prompt = `Explain the significance of "${topic}" in a simple and concise way for a beginner, in about 2-3 paragraphs.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error explaining scripture:", error);
        throw new Error("There was an error retrieving the explanation. Please try again.");
    }
};

// --- Utility functions adapted to use the new SDK ---

export const getDailySloka = async (language: Language): Promise<{ sloka_devanagari: string; sloka_transliteration: string; meaning: string; }> => {
    try {
        const langName = language === Language.HI ? 'Hindi' : language === Language.TE ? 'Telugu' : 'English';
        const config = {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    sloka_devanagari: { type: Type.STRING, description: 'The sloka in Devanagari script.' },
                    sloka_transliteration: { type: Type.STRING, description: 'The IAST transliteration of the sloka.' },
                    meaning: { type: Type.STRING, description: `A simple, concise explanation of the sloka in ${langName}.` },
                },
                required: ["sloka_devanagari", "sloka_transliteration", "meaning"],
            },
        };
        const prompt = `Provide a Sanskrit sloka that is inspiring or offers wisdom. The sloka should be relatively short and well-known. Provide it in Devanagari script, its IAST transliteration, and a simple, concise meaning in ${langName}. The theme should be spiritual and positive. Ensure the output is a single JSON object.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: config,
        });
        return JSON.parse(response.text);

    } catch (error) {
        console.error("Error fetching daily sloka via Gemini:", error);
        const fallbackSloka = SLOKA_DATA[language][0];
        return {
            sloka_devanagari: fallbackSloka.text,
            sloka_transliteration: fallbackSloka.translation,
            meaning: `${fallbackSloka.meaning} (Error: AI service unavailable)`,
        };
    }
};

export const getSlokaExplanation = (sloka: Sloka): Promise<string> => {
    const prompt = `Provide a short, philosophical explanation (around 3-4 sentences) of the following sloka. Focus on its deeper meaning and relevance. Sloka: "${sloka.text}" English Meaning: "${sloka.meaning}"`;
    return explainScripture(prompt);
};

export const generateTempleComparison = async (originalTemple: Temple, alternativeTemple: Temple): Promise<string> => {
    const prompt = `Briefly (2-3 sentences) and positively compare the spiritual significance of two temples. Be encouraging. Temple 1: ${originalTemple.name} (Deity: ${originalTemple.deity}). Temple 2: ${alternativeTemple.name} (Deity: ${alternativeTemple.deity}).`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const generateSpiritualSignificance = async (temple: Temple): Promise<string> => {
    const prompt = `Provide a short, deeply spiritual explanation (around 3-4 sentences) of the significance of the ${temple.name}, located in ${temple.location}. Focus on its main deity, ${temple.deity}, and its historical/mythological importance. Write in an inspiring and reverent tone.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

/**
 * Handles contextual, streaming AI responses for specific items like temples or books.
 * This uses a stateless call to inject context dynamically.
 */
export const streamDevaGptResponse = async (
    query: string,
    history: { role: 'user' | 'model'; parts: { text: string }[] }[],
    context: { temple?: Temple; book?: Book; pooja?: Pooja; user?: User | null },
    onChunk: (chunk: string) => void,
    onComplete: () => void
) => {
    let contextString = "The user is browsing the app generally.";
    if (context.temple) {
        contextString = `The user is currently viewing the page for ${context.temple.name} located in ${context.temple.location}. Its deity is ${context.temple.deity}. History: ${context.temple.history.substring(0, 200)}...`;
    }
    if (context.book) {
        contextString = `The user is asking about the scripture '${context.book.name}'. Description: ${context.book.description}`;
    }
    if (context.pooja) {
        contextString = `The user is asking about the '${context.pooja.name}' ritual. Description: ${context.pooja.description}. Key benefits: ${context.pooja.benefits}. Main Deity: ${context.pooja.deity}.`;
    }

    const systemInstruction = `${GURU_SYSTEM_INSTRUCTION}\n\n--- Current Context ---\n${contextString}`;
    const contents = [...history, { role: 'user', parts: [{ text: query }] }];
    
    try {
        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: { systemInstruction }
        });

        for await (const chunk of stream) {
          if (chunk.text) {
              onChunk(chunk.text);
          }
        }
    } catch (error) {
        console.error('Error in streamDevaGptResponse:', error);
        throw error;
    } finally {
        onComplete();
    }
};

/**
 * A wrapper for contextual chat about scriptures.
 */
export const askAboutScripture = (
    book: Book,
    query: string,
    history: { role: 'user' | 'model'; parts: { text: string }[] }[],
    user: User | null,
    onChunk: (chunk: string) => void,
    onComplete: () => void
) => {
    return streamDevaGptResponse(query, history, { book, user }, onChunk, onComplete);
};