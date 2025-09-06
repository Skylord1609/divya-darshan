
import React from 'react';
import type { Temple, I18nContent } from '../types';
import { CrowdLevelIndicator } from './CrowdLevelIndicator';
import { PLACEHOLDER_IMAGE_URL } from '../constants';
import { useImageWithFallback } from '../hooks/useImageWithFallback';
import { Icon } from './Icon';

interface TempleCardProps {
    temple: Temple;
    t: I18nContent;
    onSelectTemple: () => void;
    onBookDarshan: () => void;
    onVirtualDarshan: () => void;
    onViewImage: () => void;
    onAskGuru: () => void;
    // FIX: Make Yatra plan props optional so TempleCard can be used in views without Yatra context.
    onToggleYatraPlan?: (temple: Temple) => void;
    isInYatraPlan?: boolean;
}

export const TempleCard = ({ temple, t, onSelectTemple, onBookDarshan, onVirtualDarshan, onViewImage, onAskGuru, onToggleYatraPlan, isInYatraPlan }: TempleCardProps) => {
    const { imgSrc, status, onLoad, onError } = useImageWithFallback(temple.imageUrl, PLACEHOLDER_IMAGE_URL);

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        e.preventDefault();
        action();
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectTemple();
        }
    }

    return (
        <div 
            onClick={onSelectTemple}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`Explore details for ${temple.name}`}
            className="bg-white rounded-xl shadow-lg overflow-hidden group border-b-4 border-primary flex flex-col cursor-pointer h-full focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/70 card-interactive"
        >
            <div className="relative overflow-hidden h-56 bg-stone-200">
                {status !== 'loaded' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {status === 'loading' && <Icon name="lotus" className="w-8 h-8 text-stone-400 animate-spin" />}
                        {status === 'error' && <Icon name="alert-triangle" className="w-8 h-8 text-red-400" />}
                    </div>
                )}
                <img 
                    src={imgSrc} 
                    alt={temple.name} 
                    crossOrigin="anonymous"
                    onLoad={onLoad}
                    onError={onError}
                    onClick={(e) => handleActionClick(e, onViewImage)}
                    className={`w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500 ease-out cursor-pointer ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`} 
                />
                 <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <button
                        onClick={(e) => handleActionClick(e, onViewImage)}
                        aria-label={`View image of ${temple.name}`}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 pointer-events-auto cursor-pointer">
                        <Icon name="zoom-in" className="w-12 h-12 text-white" />
                    </button>
                    <div className="absolute top-3 right-3 pointer-events-auto">
                        <CrowdLevelIndicator level={temple.crowdLevel} size="small" />
                    </div>
                    {temple.distance !== undefined && (
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1 pointer-events-auto">
                            <Icon name="map-pin" className="w-3 h-3" />
                            <span>{temple.distance.toFixed(1)} km away</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-text-base mb-2">{temple.name}</h3>
                <div className="flex items-center text-sm text-text-muted mb-4">
                    <Icon name="map-pin" className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                    <span>{temple.location}</span>
                </div>
                <p className="text-text-base text-base mb-4 flex-grow line-clamp-2">{temple.history}</p>
                <div className="mt-auto pt-4 flex flex-col items-center justify-between gap-3">
                    <button onClick={onSelectTemple} className="font-bold text-sm text-primary group-hover:text-secondary transition-colors self-center mb-2">
                        {t.readMore} &rarr;
                    </button>
                     <div className="grid grid-cols-2 gap-2 text-xs w-full">
                        <button onClick={(e) => handleActionClick(e, onBookDarshan)} className="text-center bg-primary/10 text-primary font-semibold px-2 py-2 rounded-full hover:bg-primary/20 transition-all shadow-sm transform hover:scale-105">
                            Darshan Ticket
                        </button>
                         <button onClick={(e) => handleActionClick(e, onVirtualDarshan)} className="text-center bg-primary/10 text-primary font-semibold px-2 py-2 rounded-full hover:bg-primary/20 transition-all shadow-sm transform hover:scale-105">
                            Virtual Darshan
                        </button>
                         <button onClick={(e) => handleActionClick(e, onAskGuru)} className="text-center bg-primary/10 text-primary font-semibold px-2 py-2 rounded-full hover:bg-primary/20 transition-all shadow-sm transform hover:scale-105 flex items-center justify-center gap-1">
                            <Icon name="cosmic-logo" className="w-4 h-4" />
                            Ask Guru
                        </button>
                    </div>
                    {/* FIX: Conditionally render Yatra plan button only if handlers are provided. */}
                    {onToggleYatraPlan && isInYatraPlan !== undefined && (
                        <div className="w-full mt-2">
                            <button
                                onClick={(e) => handleActionClick(e, () => onToggleYatraPlan(temple))}
                                className={`w-full py-2 px-4 rounded-full font-bold text-sm transition-all shadow-md transform hover:scale-105 ${
                                    isInYatraPlan
                                        ? 'bg-green-600 text-white flex items-center justify-center gap-2 hover:bg-green-700'
                                        : 'bg-secondary text-primary hover:bg-amber-400'
                                }`}
                            >
                                {isInYatraPlan ? (
                                    <>
                                        Added to Yatra <Icon name="check-circle" className="w-4 h-4" />
                                    </>
                                ) : (
                                    'Add to Yatra'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};