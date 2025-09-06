
import React, { useState, useRef, useEffect } from 'react';
import { I18nContent, Temple, Book, Pooja } from '../types';
import { streamDevaGptResponse, sendMessageToGuruStream } from '../services/aiService';
import { Icon } from './Icon';
import { useAuth } from '../contexts/AuthContext';

interface AIGuruProps {
    t: I18nContent;
    temple?: Temple;
    book?: Book;
    pooja?: Pooja;
}

interface Message {
  role: 'user' | 'guru';
  text: string;
}

const CHAT_HISTORY_KEY = 'divya-darshan-chat-history';

export const AIGuru = ({ t, temple, book, pooja }: AIGuruProps) => {
    const { currentUser } = useAuth();
    
    const getGreeting = () => {
        const name = currentUser?.name.split(' ')[0] || 'Bhakta';
        if (temple) {
            return `🙏 Swagatam! I am Deva-GPT, your digital sevak. Ask me anything about ${temple.name}.`;
        }
        if (book) {
            return `🙏 Swagatam, ${name}ji! I am Deva-GPT. How may I assist you with your reading of ${book.name}?`;
        }
        if (pooja) {
            return `🙏 Pranam! I can provide more details about the ${pooja.name} ritual. What would you like to know?`;
        }
        return `🙏 Swagatam! I am Deva-GPT, your digital sevak. Ask me any question about dharma, philosophy, or rituals.`;
    };

    const [messages, setMessages] = useState<Message[]>(() => {
        try {
            if (temple || book || pooja) { // Contextual chats are not persisted
                return [{ role: 'guru', text: getGreeting() }];
            }
            const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
            return savedMessages ? JSON.parse(savedMessages) : [{ role: 'guru', text: getGreeting() }];
        } catch (error) {
            console.error("Failed to parse chat history", error);
            return [{ role: 'guru', text: getGreeting() }];
        }
    });

    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const container = chatContainerRef.current;
        if (container) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    useEffect(() => {
        // Only save history for the general, non-contextual chat
        if (!temple && !book && !pooja) {
            try {
                localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
            } catch (error) {
                console.error("Failed to save chat history", error);
            }
        }
    }, [messages, temple, book, pooja]);
    
    const handleQuerySubmit = async (queryString: string) => {
        if (!queryString.trim() || isLoading) return;

        const newUserMessage: Message = { role: 'user', text: queryString };
        
        const historyForApi = messages
            .slice(1) // Remove initial greeting
            .map((m): { role: 'user' | 'model', parts: { text: string }[] } => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));

        setMessages(prev => [...prev, newUserMessage, { role: 'guru', text: '' }]);
        setQuery('');
        setError('');
        setIsLoading(true);

        try {
            // Use contextual streaming if temple or book is provided
            if (temple || book || pooja) {
                await streamDevaGptResponse(
                    queryString,
                    historyForApi,
                    { temple, book, pooja, user: currentUser },
                    (chunk) => {
                        setMessages(prev => {
                            const newMessages = [...prev];
                            const lastMessage = newMessages[newMessages.length - 1];
                            if (lastMessage && lastMessage.role === 'guru') {
                                lastMessage.text += chunk;
                            }
                            return newMessages;
                        });
                    },
                    () => setIsLoading(false)
                );
            } else {
                // Use the persistent chat instance for general queries
                const stream = await sendMessageToGuruStream(queryString);
                for await (const chunk of stream) {
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage && lastMessage.role === 'guru') {
                            lastMessage.text += chunk.text;
                        }
                        return newMessages;
                    });
                }
                setIsLoading(false);
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
                const errorMessage: Message = { role: 'guru', text: err.message };
                setMessages(prev => [...prev.slice(0, -1), errorMessage]);
            }
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleQuerySubmit(query);
    };

    return (
        <div className="flex flex-col h-full">
             <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-4 pr-2 -mr-2">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 my-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'guru' && <Icon name="cosmic-logo" className="w-8 h-8 text-primary flex-shrink-0 mt-1" />}
                        <div className={`max-w-md ${msg.role === 'user' ? 'order-2' : ''}`}>
                            <div className={`p-3 rounded-2xl shadow-sm animate-fade-in ${msg.role === 'user' ? 'ai-guru-chat-bubble-user rounded-br-none' : 'ai-guru-chat-bubble-guru rounded-bl-none'}`}>
                                <p className="whitespace-pre-wrap text-base">
                                    {msg.text}
                                    {isLoading && msg.role === 'guru' && index === messages.length - 1 && <span className="blinking-cursor">▍</span>}
                                </p>
                            </div>
                        </div>
                        {msg.role === 'user' && <Icon name="user-circle" className="w-8 h-8 text-primary flex-shrink-0" />}
                    </div>
                ))}
                {isLoading && messages[messages.length-1].role === 'user' && (
                    <div className="flex justify-start">
                      <div className="max-w-sm p-3 rounded-lg mb-2 bg-white text-orange-900 border border-orange-200">
                        <Icon name="lotus" className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    </div>
                )}
                {error && <div className="text-center text-red-600 p-2 bg-red-100 rounded-lg">{error}</div>}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleFormSubmit} className="flex items-center gap-2 flex-shrink-0">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t.aiGuruPlaceholder}
                        className="w-full p-3 pl-4 pr-12 rounded-full border-2 ai-guru-input focus:ring-2 focus:outline-none"
                        disabled={isLoading}
                    />
                </div>
                <button
                    id="ai-guru-submit"
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="ai-guru-submit-button text-white font-bold py-3 px-6 rounded-full transition-colors duration-300 shadow-md"
                >
                    {t.askGuru}
                </button>
            </form>
        </div>
    );
};
