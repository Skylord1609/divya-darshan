
import React from 'react';
import { User, I18nContent } from '../types';
import { Icon } from './Icon';
import { useTheme } from '../contexts/ThemeContext';

export interface HeaderProps {
    currentUser: User | null;
    t: I18nContent;
    onMenuClick: () => void;
    onUserClick: () => void;
    onLoginClick: () => void;
}

export const Header = ({ currentUser, t, onMenuClick, onUserClick, onLoginClick }: HeaderProps) => {
    const { theme } = useTheme();

    return (
        <header 
            className="md:hidden flex items-center justify-between p-4 bg-main text-text-base shadow-sm sticky top-0 z-20 border-b transition-colors duration-500"
            style={{ borderColor: `rgb(var(--color-secondary-val) / 0.6)` }}
        >
            <button onClick={onMenuClick} className="p-2 text-text-base" aria-label="Open menu">
                <Icon name="menu" className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
                <Icon name="cosmic-logo" className="w-8 h-8 text-primary" />
                <span className="font-heading font-bold text-xl text-primary">{t.heroTitle}</span>
            </div>
            {currentUser ? (
                <button onClick={onUserClick} className="p-1" aria-label="View profile">
                    <Icon name="user-circle" className="w-8 h-8 text-primary" />
                </button>
            ) : (
                 <button onClick={onLoginClick} className="text-sm font-bold bg-primary px-3 py-1 rounded-full text-white transform transition-transform hover:scale-105">
                    {t.login}
                </button>
            )}
        </header>
    );
};