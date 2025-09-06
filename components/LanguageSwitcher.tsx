
import React from 'react';
import { Language } from '../types';

interface LanguageSwitcherProps {
    currentLang: Language;
    setLang: (lang: Language) => void;
}

export const LanguageSwitcher = ({ currentLang, setLang }: LanguageSwitcherProps) => {
    const languages = [
        { id: Language.EN, label: 'EN' },
        { id: Language.HI, label: 'HI' },
        { id: Language.TE, label: 'TE' },
    ];

    return (
        <div className="flex items-center bg-primary/10 rounded-full p-1 shadow-inner">
            {languages.map(lang => (
                <button
                    key={lang.id}
                    onClick={() => setLang(lang.id)}
                    className={`px-3 py-1 text-sm font-bold rounded-full transition-colors duration-300 ${
                        currentLang === lang.id
                            ? 'bg-primary text-white shadow'
                            : 'text-primary hover:bg-primary/20'
                    }`}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
};