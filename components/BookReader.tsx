import React, { useState, useEffect } from 'react';
import { Book, I18nContent, BookContent, BookVerse, Language } from '../types';
import * as api from '../services/apiService';
import { useToast } from '../contexts/ToastContext';
import { Icon } from './Icon';

interface BookReaderProps {
    bookId: string;
    t: I18nContent;
    language: Language;
}

type Tab = 'sanskrit' | 'english';

export const BookReader = ({ bookId, t, language }: BookReaderProps) => {
    const [book, setBook] = useState<Book | null>(null);
    const [content, setContent] = useState<BookContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('sanskrit');
    const { addToast } = useToast();

    useEffect(() => {
        let isCancelled = false;
        
        const loadContent = async () => {
            if (!bookId) {
                if (!isCancelled) setError("No book specified.");
                if (!isCancelled) setIsLoading(false);
                return;
            }
            if (!isCancelled) setIsLoading(true);
            if (!isCancelled) setError(null);

            try {
                const bookMeta = await api.getBookByContentKey(bookId, language);
                if (isCancelled) return;
                
                if (!bookMeta) {
                    throw new Error("Book metadata not found.");
                }
                setBook(bookMeta);

                if (!bookMeta.contentKey) {
                    throw new Error("This book does not have readable content.");
                }
                
                const bookContent = await api.getBookContent(bookMeta.contentKey);
                if (isCancelled) return;
                
                setContent(bookContent);
            } catch (err) {
                if (isCancelled) return;
                const msg = err instanceof Error ? err.message : "Failed to load book content.";
                setError(msg);
                addToast(msg, 'error');
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        loadContent();

        return () => {
            isCancelled = true;
        };
    }, [bookId, addToast, language]);

    const onBack = () => window.history.back();
    
    const comingSoonToast = () => addToast("This feature is coming soon!", 'info');

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Icon name="lotus" className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-600">
                <h2 className="text-2xl font-bold">Error</h2>
                <p>{error || 'Book not found'}</p>
                <button onClick={onBack} className="mt-4 bg-primary text-white font-bold py-2 px-6 rounded-full hover:bg-secondary transition-colors">
                    Back
                </button>
            </div>
        );
    }

    const renderVerse = (verse: BookVerse) => (
        <div key={verse.verse} className="py-4 border-b border-amber-200/80">
            <p className={`mb-3 ${activeTab === 'sanskrit' ? 'font-noto-serif text-lg text-amber-800' : 'text-stone-700 italic'}`}>
                <span className="font-sans text-xs text-stone-500 mr-2">{verse.verse}</span>
                {activeTab === 'sanskrit' ? verse.sanskrit : verse.translation}
            </p>
            <div className="flex items-center gap-4 text-stone-500">
                 <button onClick={comingSoonToast} className="hover:text-primary transition-colors" aria-label="Bookmark verse"><Icon name="book-open" className="w-5 h-5"/></button>
                 <button onClick={comingSoonToast} className="hover:text-primary transition-colors" aria-label="Add note to verse"><Icon name="edit" className="w-5 h-5"/></button>
                 <button onClick={comingSoonToast} className="hover:text-primary transition-colors" aria-label="Ask AI Guru"><Icon name="cosmic-logo" className="w-5 h-5"/></button>
            </div>
        </div>
    );

    const renderChapterContent = () => {
        if (!content) {
            return <div className="text-center py-10 text-stone-600">{t.bookNotAvailable}</div>;
        }
        return (
            <div className="space-y-8">
                {content.chapters.map(chapter => (
                    <div key={chapter.chapter}>
                        <h2 className="text-2xl font-bold text-orange-800 border-b-2 border-orange-200 pb-2 mb-4">
                            Chapter {chapter.chapter}: {chapter.title}
                        </h2>
                        <div className="space-y-2">
                            {chapter.verses.map(verse => renderVerse(verse))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-amber-50 animate-fade-in py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <button onClick={onBack} className="mb-6 inline-flex items-center text-primary hover:text-secondary font-bold transition-colors">
                        <Icon name="chevron-left" className="h-5 w-5 mr-2" />
                        Back
                    </button>
                    <div className="flex items-start gap-4 mb-6 bg-white p-6 rounded-xl shadow-md border border-amber-200">
                        <Icon name="book-open" className="w-16 h-16 text-primary flex-shrink-0 mt-1"/>
                        <div>
                            <h1 className="text-4xl font-bold text-orange-900">{book.name}</h1>
                            <p className="text-stone-600 mt-2">{book.description}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-amber-200">
                         <div className="mb-6 sticky top-0 bg-white/80 backdrop-blur-sm py-3 border-b border-amber-200">
                            <div className="flex justify-center items-center bg-stone-100 rounded-full p-1 max-w-xs mx-auto">
                                <button onClick={() => setActiveTab('sanskrit')} className={`w-1/2 py-2 px-4 rounded-full font-semibold transition-colors ${activeTab === 'sanskrit' ? 'bg-primary text-white shadow' : 'text-stone-700'}`}>Sanskrit</button>
                                <button onClick={() => setActiveTab('english')} className={`w-1/2 py-2 px-4 rounded-full font-semibold transition-colors ${activeTab === 'english' ? 'bg-primary text-white shadow' : 'text-stone-700'}`}>English</button>
                            </div>
                        </div>
                        {renderChapterContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};