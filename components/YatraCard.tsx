
import React, { useMemo } from 'react';
import type { Yatra, I18nContent } from '../types';
import { PLACEHOLDER_IMAGE_URL } from '../constants';
import { useImageWithFallback } from '../hooks/useImageWithFallback';
import { Icon } from './Icon';

interface YatraCardProps {
    yatra: Yatra;
    t: I18nContent;
    onViewItinerary: () => void;
    onViewImage: () => void;
    isAdmin?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

export const YatraCard = ({ yatra, t, onViewItinerary, onViewImage, isAdmin, onEdit, onDelete }: YatraCardProps) => {
    const { imgSrc, status, onLoad, onError } = useImageWithFallback(yatra.imageUrl, PLACEHOLDER_IMAGE_URL);
    
    const startingPrice = useMemo(() => {
        if (!yatra.tiers || yatra.tiers.length === 0) {
            return null;
        }
        return Math.min(...yatra.tiers.map(tier => tier.cost));
    }, [yatra.tiers]);

    const handleCardClick = () => {
        onViewItinerary();
    };

    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onViewImage();
    };

    const handleItineraryClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onViewItinerary();
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onEdit?.();
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onDelete?.();
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
        }
    }

    return (
        <div 
            onClick={handleCardClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`View itinerary for ${yatra.name}`}
            className="bg-white rounded-xl shadow-lg overflow-hidden group border-b-4 border-primary flex flex-col h-full cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/70 relative card-interactive"
        >
             {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                    <button 
                        onClick={handleEdit} 
                        className="bg-blue-600/80 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg" 
                        aria-label={`Edit ${yatra.name}`}
                    >
                        <Icon name="edit" className="w-4 h-4"/>
                    </button>
                    <button 
                        onClick={handleDelete} 
                        className="bg-red-600/80 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg" 
                        aria-label={`Delete ${yatra.name}`}
                    >
                        <Icon name="trash" className="w-4 h-4"/>
                    </button>
                </div>
            )}
            <div className="relative overflow-hidden h-56 bg-stone-200">
                 {status !== 'loaded' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {status === 'loading' && <Icon name="lotus" className="w-8 h-8 text-stone-400 animate-spin" />}
                        {status === 'error' && <Icon name="alert-triangle" className="w-8 h-8 text-red-400" />}
                    </div>
                )}
                <img 
                    src={imgSrc} 
                    alt={yatra.name} 
                    crossOrigin="anonymous"
                    onLoad={onLoad}
                    onError={onError}
                    onClick={handleImageClick}
                    className={`w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500 ease-out cursor-pointer ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`} 
                />
                 <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <button
                        onClick={handleImageClick}
                        aria-label={`View image for ${yatra.name}`}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 pointer-events-auto cursor-pointer">
                        <Icon name="zoom-in" className="w-12 h-12 text-white" />
                    </button>
                </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-text-base mb-2">{yatra.name}</h3>
                <p className="text-text-base text-sm mb-4 flex-grow line-clamp-3">{yatra.description}</p>
                
                <div className="flex items-center text-sm text-text-muted mb-4 space-x-4">
                    <span className="flex items-center gap-1.5">
                        <Icon name="clock" className="w-4 h-4 text-primary" />
                        <span>{yatra.durationDays ?? 'N/A'} Days</span>
                    </span>
                     <span className="flex items-center gap-1.5">
                        <Icon name="users" className="w-4 h-4 text-primary" />
                        <span>Up to {yatra.groupSize ?? 'N/A'}</span>
                    </span>
                </div>

                <div className="mt-auto pt-2 flex items-center justify-between gap-4">
                    <div>
                         {startingPrice !== null ? (
                            <>
                                <p className="text-xs text-text-muted">Starts from</p>
                                <p className="text-2xl font-bold text-primary">₹{startingPrice.toLocaleString('en-IN')}</p>
                            </>
                        ) : (
                            <p className="text-lg font-bold text-primary">Check Details</p>
                        )}
                    </div>
                    <button 
                        onClick={handleItineraryClick}
                        className="bg-primary/10 text-primary font-semibold py-2 px-4 rounded-full hover:bg-primary/20 transition-all shadow-sm whitespace-nowrap transform hover:scale-105"
                    >
                        {t.viewItinerary}
                    </button>
                </div>
            </div>
        </div>
    );
};