
import React, { useState, useRef, useEffect } from 'react';
import { I18nContent, Book } from '../types';
import * as aiService from '../services/aiService';
import { Icon } from './Icon';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useAuth } from '../contexts/AuthContext';

interface ScriptureQueryModalProps {
    book: Book;
    t: I18nContent;
    onClose: () => void;
}

interface Message {
  role: 'user' | 'guru';
  text: string;
}

export const ScriptureQueryModal = ({ book, t, onClose }: ScriptureQueryModalProps) => {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'guru', text: `Namaste! You may ask me any question about the ${book.name}.` }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const modalRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { currentUser } = useAuth();
    useFocusTrap(modalRef);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleQuerySubmit = async (queryString: string) => {
        if (!queryString.trim() || isLoading) return;

        const newUserMessage: Message = { role: 'user', text: queryString };
        
        const historyForApi = messages
            .slice(1) // Always remove the initial static greeting.
            .filter(m => m.text && m.text.trim()) // Ensure no empty messages exist.
            .map((m): { role: 'user' | 'model', parts: { text: string }[] } => {
                // Clean the Guru's response for the history to avoid confusing the AI
                const textForApi = m.role === 'guru' 
                    ? m.text.replace(/\[ACTION:.*?\]/g, '').replace(/\|\| Hari Om \|\|/g, '').trim()
                    : m.text;
                
                return {
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: textForApi }]
                };
            }).filter(m => m.parts[0].text); // Final check to remove messages that became empty after cleaning
            
        setMessages(prev => [...prev, newUserMessage, { role: 'guru', text: '' }]);
        setQuery('');
        setError('');
        setIsLoading(true);

        try {
            await aiService.askAboutScripture(
                book,
                queryString,
                historyForApi,
                currentUser,
                (chunk) => {
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage && lastMessage.role === 'guru') {
                            lastMessage.text = (lastMessage.text || '') + chunk;
                        }
                        return newMessages;
                    });
                },
                () => { // onComplete
                    setIsLoading(false);
                }
            );
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
                setMessages(prev => {
                    const newMessages = [...prev];
                    const last = newMessages[newMessages.length - 1];
                    if (last && last.role === 'guru' && !last.text) {
                        return newMessages.slice(0, -1);
                    }
                    return newMessages;
                });
            }
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleQuerySubmit(query);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="scripture-modal-title"
                className="bg-main rounded-2xl shadow-2xl w-full max-w-lg p-6 relative flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    aria-label="Close"
                    className="absolute top-4 right-4 text-text-muted hover:text-primary transition-colors text-2xl font-bold"
                >&times;</button>
                <div className="text-center mb-4 flex-shrink-0">
                    <Icon name="cosmic-logo" className="h-10 w-10 text-primary mx-auto mb-2" />
                    <h2 id="scripture-modal-title" className="text-2xl font-bold text-primary font-heading">
                        Ask about {book.name}
                    </h2>
                </div>

                <div className="flex-grow overflow-y-auto mb-4 pr-2 -mr-2">
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
                    <div ref={messagesEndRef} />
                    {error && <div className="text-center text-red-600 p-2 bg-red-100 rounded-lg">{error}</div>}
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
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="ai-guru-submit-button text-white font-bold py-3 px-6 rounded-full transition-colors duration-300 shadow-md"
                    >
                        {t.askGuru}
                    </button>
                </form>
            </div>
        </div>
    );
};
