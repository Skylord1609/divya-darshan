



import React, { useState, useEffect, useCallback } from 'react';
import { I18nContent, SearchResults, Temple, Book, MajorEvent, Language, SearchFilters, CrowdLevel } from '../types';
import * as api from '../services/apiService';
import { CardAnimator } from './CardAnimator';
import { TempleCard } from './TempleCard';
import { BookCard } from './BookCard';
import { EventCard } from './EventCard';
import { useModal } from '../contexts/ModalContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Icon } from './Icon';

interface SearchViewProps {
    query: string;
    t: I18nContent;
    language: Language;
    yatraPlan: Temple[];
    isInYatraPlan: (templeId: number) => boolean;
    onToggleYatraPlan: (temple: Temple) => void;
}

const SearchFilterPanel = ({ t, allDeities, filters, onFilterChange, onClearFilters, requestLocation, locationPermission }: { 
    t: I18nContent,
    allDeities: string[],
    filters: SearchFilters,
    onFilterChange: <K extends keyof SearchFilters>(filterType: K, value: SearchFilters[K]) => void,
    onClearFilters: () => void,
    requestLocation: () => void,
    locationPermission: 'idle' | 'loading' | 'granted' | 'denied',
}) => {
    const crowdLevels: CrowdLevel[] = ['Low', 'Medium', 'High', 'Very High'];
    const distanceOptions = [
        { label: 'Any', value: 0 },
        { label: '< 10 km', value: 10 },
        { label: '< 50 km', value: 50 },
        { label: '< 200 km', value: 200 },
    ];

    const handleCrowdChange = (level: CrowdLevel) => {
        const newCrowd = filters.crowd.includes(level)
            ? filters.crowd.filter(c => c !== level)
            : [...filters.crowd, level];
        onFilterChange('crowd', newCrowd);
    };

    const handleDistanceChange = (value: number) => {
        if (value > 0 && locationPermission !== 'granted') {
            requestLocation();
        }
        onFilterChange('distance', value);
    };

    return (
        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg shadow-md mb-8 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Crowd Level */}
                <div>
                    <h4 className="font-bold mb-2 text-primary">Crowd Level</h4>
                    <div className="flex flex-wrap gap-2">
                        {crowdLevels.map(level => (
                            <button key={level} onClick={() => handleCrowdChange(level)} className={`px-3 py-1 text-sm rounded-full border-2 transition-colors ${filters.crowd.includes(level) ? 'bg-primary text-white border-primary' : 'bg-white text-stone-700 border-stone-300'}`}>
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Deity */}
                <div>
                    <h4 className="font-bold mb-2 text-primary">Deity</h4>
                    <select onChange={e => onFilterChange('deity', e.target.value ? [e.target.value] : [])} value={filters.deity[0] || ''} className="w-full p-2 rounded-lg border-2 border-stone-300 bg-white focus:ring-2 ring-primary">
                        <option value="">All Deities</option>
                        {allDeities.map(deity => <option key={deity} value={deity}>{deity}</option>)}
                    </select>
                </div>
                {/* Distance */}
                <div>
                    <h4 className="font-bold mb-2 text-primary">Distance from me</h4>
                    <div className="flex flex-wrap gap-2">
                        {distanceOptions.map(opt => (
                            <button key={opt.value} onClick={() => handleDistanceChange(opt.value)} className={`px-3 py-1 text-sm rounded-full border-2 transition-colors ${filters.distance === opt.value ? 'bg-primary text-white border-primary' : 'bg-white text-stone-700 border-stone-300'}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    {filters.distance > 0 && locationPermission === 'denied' && <p className="text-xs text-red-600 mt-1">Location permission needed.</p>}
                </div>
            </div>
            <button onClick={onClearFilters} className="text-sm text-primary hover:underline mt-4">Clear All Filters</button>
        </div>
    );
};


export const SearchView = ({ query, t, language, yatraPlan, isInYatraPlan, onToggleYatraPlan }: SearchViewProps) => {
    const [results, setResults] = useState<SearchResults | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openModal } = useModal();
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    
    const [filters, setFilters] = useState<SearchFilters>({ crowd: [], deity: [], distance: 0 });
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationPermission, setLocationPermission] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
    const [allDeities, setAllDeities] = useState<string[]>([]);
    const [areFiltersVisible, setAreFiltersVisible] = useState(false);

    useEffect(() => {
        api.getTemples(language).then(temples => {
            const deities = [...new Set(temples.map(t => t.deity))].filter(Boolean).sort();
            setAllDeities(deities);
        });
    }, [language]);

    const requestUserLocation = useCallback(() => {
        setLocationPermission('loading');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                setLocationPermission('granted');
            },
            () => {
                setLocationPermission('denied');
                addToast("Location permission was denied.", "error");
            }
        );
    }, [addToast]);

    useEffect(() => {
        let isCancelled = false;
        const performSearch = async () => {
            if (!isCancelled) setIsLoading(true);
            if (!isCancelled) setError(null);
            try {
                const searchResults = await api.searchAll(query, language, filters, userLocation);
                if (!isCancelled) {
                    setResults(searchResults);
                }
            } catch (err) {
                if (!isCancelled) {
                    const message = err instanceof Error ? err.message : "An error occurred during search.";
                    setError(message);
                    addToast(message, 'error');
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };
        performSearch();
        return () => { isCancelled = true; };
    }, [query, language, filters, userLocation, addToast]);

    
    const navigateTo = (path: string) => { window.location.hash = path; };
    const handleLoginOrAction = (action: () => void) => {
        if (!currentUser) openModal('login');
        else action();
    };
    
    const handleFilterChange = <K extends keyof SearchFilters>(filterType: K, value: SearchFilters[K]) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const handleClearFilters = () => {
        setFilters({ crowd: [], deity: [], distance: 0 });
    };

    const renderResults = () => {
        if (!results) return null;

        const totalResults = results.temples.length + results.books.length + results.events.length;
        if (totalResults === 0) {
            return (
                <div className="text-center py-16 text-stone-600">
                    <h3 className="text-2xl font-semibold mb-2">{t.noResultsForQuery.replace('{query}', query)}</h3>
                    <p>Try searching for a different keyword or adjusting your filters.</p>
                </div>
            )
        }
        
        return (
            <div className="space-y-12">
                {results.temples.length > 0 && (
                    <div id="search-temples">
                        <h2 className="text-3xl font-bold mb-6">{t.templesFound}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {results.temples.map(temple => (
                                <CardAnimator key={`temple-${temple.id}`}>
                                    <TempleCard 
                                        temple={temple} 
                                        t={t} 
                                        onSelectTemple={() => navigateTo(`/templeDetail/${temple.id}`)}
                                        onBookDarshan={() => handleLoginOrAction(() => openModal('darshanBooking', { temple }))}
                                        onVirtualDarshan={() => openModal('vrDarshan')}
                                        onViewImage={() => openModal('imageDetail', { imageUrl: temple.imageUrl, altText: temple.name })}
                                        onAskGuru={() => openModal('aiGuruChat', { temple })}
                                        isInYatraPlan={isInYatraPlan(temple.id)}
                                        onToggleYatraPlan={onToggleYatraPlan}
                                    />
                                </CardAnimator>
                            ))}
                        </div>
                    </div>
                )}
                 {results.books.length > 0 && (
                    <div id="search-books">
                        <h2 className="text-3xl font-bold mb-6">{t.knowledgeFound}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {results.books.map(book => (
                                <CardAnimator key={`book-${book.id}`}>
                                    <BookCard 
                                        book={book} 
                                        t={t} 
                                        onSelectBook={() => book.contentKey ? navigateTo(`/bookReader/${book.contentKey}`) : addToast(t.bookNotAvailable, 'info')}
                                        onViewImage={() => openModal('imageDetail', { imageUrl: book.imageUrl, altText: book.name })}
                                    />
                                </CardAnimator>
                            ))}
                        </div>
                    </div>
                )}
                {results.events.length > 0 && (
                     <div id="search-events">
                        <h2 className="text-3xl font-bold mb-6">{t.eventsFound}</h2>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {results.events.map(event => (
                                <CardAnimator key={`event-${event.id}`}>
                                    <EventCard 
                                        event={event} 
                                        t={t} 
                                        onSelectEvent={() => navigateTo(`/eventDetail/${event.id}`)} 
                                        onViewImage={() => openModal('imageDetail', { imageUrl: event.imageUrl, altText: event.name })}
                                    />
                                </CardAnimator>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    };

    return (
        <div className="animate-fade-in py-8 min-h-screen">
            <div className="container mx-auto px-4">
                 <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="text-primary">
                            <Icon name="search" className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold font-heading">{t.searchResultsFor}</h1>
                            <p className="text-lg text-text-muted">"{query}"</p>
                        </div>
                    </div>
                     <button onClick={() => setAreFiltersVisible(!areFiltersVisible)} className="flex-shrink-0 bg-white text-primary font-bold py-2 px-4 rounded-full flex items-center gap-2 shadow-sm border-2 border-primary/20">
                        <Icon name="settings" className="w-5 h-5" />
                        <span>{areFiltersVisible ? 'Hide' : 'Show'} Filters</span>
                    </button>
                 </div>
                 {areFiltersVisible && (
                    <SearchFilterPanel 
                        t={t} 
                        allDeities={allDeities} 
                        filters={filters} 
                        onFilterChange={handleFilterChange} 
                        onClearFilters={handleClearFilters}
                        requestLocation={requestUserLocation}
                        locationPermission={locationPermission}
                    />
                 )}
                 {isLoading ? (
                     <div className="flex justify-center items-center py-20">
                        <Icon name="lotus" className="w-12 h-12 text-primary animate-spin" />
                    </div>
                 ) : error ? (
                    <div className="text-center py-20 text-red-600">
                        <h2>{error}</h2>
                    </div>
                 ) : (
                    renderResults()
                 )}
            </div>
        </div>
    )
}