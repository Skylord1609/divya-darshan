import React from 'react';
import type { I18nContent } from '../types';
import { useImageWithFallback } from '../hooks/useImageWithFallback';
import { PLACEHOLDER_IMAGE_URL } from '../constants';

interface FeaturedYatraProps {
    t: I18nContent;
    onExplore: () => void;
}

const FEATURED_YATRA_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/d/d6/Amarnath_cave_as_seen_from_the_valley.jpg";

export const FeaturedYatra = ({ t, onExplore }: FeaturedYatraProps) => {
    const { imgSrc, status, onLoad, onError } = useImageWithFallback(FEATURED_YATRA_IMAGE, PLACEHOLDER_IMAGE_URL);

    return (
        <div className="relative bg-black rounded-2xl shadow-xl overflow-hidden my-16 border-4 border-primary">
            <img 
                src={imgSrc} 
                alt="Amarnath Yatra" 
                loading="lazy"
                onLoad={onLoad}
                onError={onError}
                className={`absolute inset-0 w-full h-full object-cover opacity-50 transition-all duration-500 ${status === 'loaded' ? 'animate-kenburns' : ''}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30"></div>
            <div className="relative z-10 p-8 md:p-16 text-center text-white flex flex-col items-center">
                <h3 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {t.pilgrimageOfMonthTitle}
                </h3>
                <p className="max-w-3xl text-lg md:text-xl text-white/90 mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    {t.pilgrimageOfMonthDesc}
                </p>
                <button 
                    onClick={onExplore}
                    className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-secondary transition-all duration-300 transform hover:scale-105 shadow-lg animate-fade-in-up"
                    style={{ animationDelay: '0.6s' }}
                >
                    {t.pilgrimageOfMonthCta}
                </button>
            </div>
        </div>
    );
};
