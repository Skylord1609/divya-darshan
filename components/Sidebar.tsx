



import React, { useState, useEffect } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Language, type I18nContent, type User, type View, type IconName, type Temple } from '../types';
import { Icon } from './Icon';
import * as api from '../services/apiService';
import { fuzzySearch } from '../utils/geolocation';


interface SidebarProps {
  currentLang: Language;
  setLang: (lang: Language) => void;
  t: I18nContent;
  onLoginClick: () => void;
  onSetView: (view: View, id?: string | number) => void;
  onSevaClick: () => void;
  currentView: View;
  currentUser: User | null;
  logout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavLink = React.memo(({ 
    icon, 
    label, 
    isActive, 
    onClick 
}: { 
    icon: React.ReactNode; 
    label: string; 
    isActive: boolean; 
    onClick: () => void;
}) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center space-x-4 px-4 py-3 rounded-lg text-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 ring-primary ${
            isActive 
                ? 'bg-sidebar-active text-sidebar-active font-bold shadow-inner' 
                : 'text-sidebar text-sidebar-hover'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
));
NavLink.displayName = 'NavLink';

const SearchInput = ({ t, onSearch }: { t: I18nContent; onSearch: (query: string) => void }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Temple[]>([]);
    const [allTemples, setAllTemples] = useState<Temple[]>([]);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        api.getTemples(Language.EN).then(setAllTemples);
    }, []);
    
    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setQuery(newQuery);

        if (newQuery.length > 2) {
            const maxDistance = newQuery.length < 5 ? 1 : 2;
            const results = fuzzySearch(allTemples, newQuery.toLowerCase(), ['name', 'location'], maxDistance);
            setSuggestions(results.map(r => r.item as Temple).slice(0, 5));
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (templeName: string) => {
        setQuery(templeName);
        setSuggestions([]);
        onSearch(templeName);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
            setSuggestions([]);
            (document.activeElement as HTMLElement)?.blur();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative mb-4">
            <input
                type="search"
                value={query}
                onChange={handleQueryChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                placeholder={t.heroSearchPlaceholder}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-[rgba(0,0,0,0.2)] text-white border-2 border-[rgba(255,255,255,0.2)] focus:border-primary focus:ring-primary focus:outline-none"
                autoComplete="off"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Icon name="search" className="w-5 h-5 text-sidebar" />
            </div>
             {isFocused && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-white text-stone-800 rounded-md shadow-lg overflow-hidden animate-fade-in">
                    {suggestions.map(temple => (
                        <li key={temple.id}>
                            <button
                                type="button"
                                onMouseDown={() => handleSuggestionClick(temple.name)}
                                className="w-full text-left px-4 py-2 hover:bg-stone-100"
                            >
                                {temple.name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </form>
    );
};


export const Sidebar = ({ currentLang, setLang, t, onLoginClick, onSetView, currentView, currentUser, logout, onSevaClick, isOpen, setIsOpen }: SidebarProps) => {

    const handleLinkClick = (view: View, id?: string | number) => {
        onSetView(view, id);
        setIsOpen(false); // Close sidebar on navigation
    };

    const mainNavLinks: { view: View; label: string; icon: IconName }[] = [
        { view: 'home', label: t.navHome, icon: 'home' },
        { view: 'chakraSanctuary', label: t.navChakraSanctuary, icon: 'chakra' },
        { view: 'temples', label: t.navTemples, icon: 'temple' },
        { view: 'events', label: t.navEvents, icon: 'users-group' },
        { view: 'poojas', label: t.navPoojaServices, icon: 'bell' },
        { view: 'yatraPlanner', label: t.navYatras, icon: 'compass' },
        { view: 'knowledge', label: t.navKnowledge, icon: 'book-open' },
        { view: 'chantingZone', label: t.navChantingZone, icon: 'om' },
        { view: 'satsang', label: t.navSatsang, icon: 'users' },
    ];
    
    return (
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-sidebar text-white flex flex-col p-6 shadow-2xl h-full overflow-y-auto transition-all duration-500 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => handleLinkClick('home')} className="flex items-center space-x-3 text-left">
                    <Icon name="cosmic-logo" className="h-10 w-10 text-primary" />
                    <span className="text-2xl font-bold text-white font-heading">{t.heroTitle}</span>
                </button>
                <button onClick={() => setIsOpen(false)} className="md:hidden p-2" aria-label="Close menu">
                    <Icon name="x" className="w-6 h-6" />
                </button>
            </div>

            <SearchInput t={t} onSearch={(query) => handleLinkClick('search', query)} />

            <nav className="flex-grow space-y-3 mt-4">
                {mainNavLinks.map(link => (
                     <NavLink
                        key={link.view}
                        onClick={() => handleLinkClick(link.view)}
                        isActive={currentView === link.view}
                        label={link.label}
                        icon={<Icon name={link.icon} className="w-6 h-6" />}
                    />
                ))}
                
                <NavLink
                    key="seva"
                    onClick={() => {
                        onSevaClick();
                        setIsOpen(false);
                    }}
                    isActive={false} // Seva is an action, not a view
                    label={t.navSeva}
                    icon={<Icon name="heart-hand" className="w-6 h-6" />}
                />

                {currentUser?.role === 'admin' && (
                    <NavLink
                        onClick={() => handleLinkClick('dashboard')}
                        isActive={currentView === 'dashboard'}
                        label={t.navDashboard}
                        icon={<Icon name="clipboard-list" className="w-6 h-6" />}
                    />
                )}
            </nav>

            <div className="mt-auto flex-shrink-0 space-y-4 pt-4">
                 <LanguageSwitcher currentLang={currentLang} setLang={setLang} />
                 <hr className="border-[rgba(255,255,255,0.1)]"/>
                 {currentUser ? (
                    <div>
                        <button
                            onClick={() => handleLinkClick('settings')}
                            className={`w-full flex items-center gap-3 text-left p-2 rounded-lg transition-colors ${currentView === 'settings' ? 'bg-sidebar-active' : 'hover:bg-[rgba(255,255,255,0.1)]'}`}
                        >
                            <Icon name="user-circle" className="w-10 h-10 text-primary flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-base leading-tight text-white">{currentUser.name}</p>
                                <p className="text-xs text-sidebar">{t.navSettings}</p>
                            </div>
                        </button>
                        <button 
                            onClick={() => {
                                logout();
                                setIsOpen(false);
                            }}
                            className="w-full mt-3 bg-primary/20 text-primary font-bold px-4 py-2 rounded-full text-sm hover:bg-primary/50 hover:text-white transition-all transform hover:scale-105"
                        >
                            {t.logout}
                        </button>
                    </div>
                ) : (
                     <div className="flex flex-col space-y-2">
                        <button onClick={() => { onLoginClick(); setIsOpen(false); }} className="w-full bg-primary text-white font-bold px-4 py-2 rounded-full text-sm hover:bg-secondary transition-all transform hover:scale-105">{t.login}</button>
                        <button onClick={() => { onLoginClick(); setIsOpen(false); }} className="w-full bg-transparent text-primary font-semibold px-4 py-2 rounded-full text-sm hover:bg-[rgba(255,255,255,0.1)] transition-all transform hover:scale-105">{t.signup}</button>
                     </div>
                )}
            </div>
        </aside>
    );
};