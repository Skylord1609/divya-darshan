import React, { useState, useEffect } from 'react';
import { Temple, I18nContent, Language } from '../types';
import * as api from '../services/apiService';
import { TempleMap } from './TempleMap';
import { Icon } from './Icon';
import { CardAnimator } from './CardAnimator';
import { useImageWithFallback } from '../hooks/useImageWithFallback';
import { PLACEHOLDER_IMAGE_URL } from '../constants';


const JyotirlingaCard = ({ temple }: { temple: Temple }) => {
    const navigateTo = (path: string) => { window.location.hash = path; };
    const { imgSrc, status, onLoad, onError } = useImageWithFallback(temple.imageUrl, PLACEHOLDER_IMAGE_URL);
    
    return (
        <div 
            onClick={() => navigateTo(`/templeDetail/${temple.id}`)}
            className="bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-md flex items-center gap-4 cursor-pointer hover:bg-white transition-colors border-l-4 border-secondary"
        >
            <div className="w-20 h-20 bg-stone-200 rounded-md flex-shrink-0 relative">
                {status !== 'loaded' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Icon name="lotus" className="w-6 h-6 text-stone-400 animate-spin" />
                    </div>
                )}
                <img 
                    src={imgSrc} 
                    alt={temple.name} 
                    onLoad={onLoad}
                    onError={onError}
                    className={`w-full h-full object-cover rounded-md transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`} />
            </div>
            <div>
                <h3 className="font-bold text-lg text-text-base">{temple.name}</h3>
                <p className="text-sm text-text-muted">{temple.location}</p>
            </div>
        </div>
    );
};


export const JyotirlingaView = ({ t, language }: { t: I18nContent, language: Language }) => {
    const [jyotirlingas, setJyotirlingas] = useState<Temple[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isCancelled = false;
        const fetchJyotirlingas = async () => {
            setIsLoading(true);
            try {
                const temples = await api.getTemples(language);
                if (!isCancelled) {
                    const filtered = temples.filter(t => t.tags?.includes('jyotirlinga')).sort((a,b) => a.id - b.id);
                    setJyotirlingas(filtered);
                }
            } catch (error) {
                console.error("Failed to load Jyotirlingas", error);
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };
        fetchJyotirlingas();
        return () => { isCancelled = true; };
    }, [language]);
    
    return (
        <div className="bg-main min-h-full p-4 sm:p-8 animate-fade-in">
            <header className="text-center mb-8">
                <Icon name="trishul" className="w-16 h-16 text-primary mx-auto mb-4" />
                <h1 className="text-4xl md:text-5xl font-bold font-heading text-text-base">The Twelve Jyotirlingas</h1>
                <p className="mt-2 text-lg max-w-3xl mx-auto text-text-muted">
                    Journey to the twelve sacred shrines where Lord Shiva manifested as a radiant pillar of light.
                </p>
            </header>

            <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
                {isLoading ? (
                    <div className="h-[400px] w-full bg-stone-200 rounded-lg animate-pulse flex items-center justify-center">
                        <p>Loading Map...</p>
                    </div>
                ) : (
                    <TempleMap temples={jyotirlingas} />
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {isLoading ? (
                    [...Array(12)].map((_, i) => <div key={i} className="h-28 bg-white/50 rounded-lg animate-pulse"></div>)
                 ) : (
                    jyotirlingas.map((temple) => (
                        <CardAnimator key={temple.id}>
                            <JyotirlingaCard temple={temple} />
                        </CardAnimator>
                    ))
                 )}
            </div>
        </div>
    );
};
