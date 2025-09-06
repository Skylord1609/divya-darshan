import React from 'react';
import { MajorEvent, I18nContent } from '../types';
import { CrowdLevelIndicator } from './CrowdLevelIndicator';
import { Icon } from './Icon';
import { PLACEHOLDER_IMAGE_URL } from '../constants';
import { useImageWithFallback } from '../hooks/useImageWithFallback';
import { useToast } from '../contexts/ToastContext';
import { useModal } from '../contexts/ModalContext';

interface EventCardProps {
    event: MajorEvent;
    t: I18nContent;
    onSelectEvent: () => void;
    isAdmin?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onViewImage: () => void;
}

export const EventCard = ({ event, t, onSelectEvent, isAdmin, onEdit, onDelete, onViewImage }: EventCardProps) => {
    const { imgSrc, status, onLoad, onError } = useImageWithFallback(event.imageUrl, PLACEHOLDER_IMAGE_URL);
    const { addToast } = useToast();
    const { openModal } = useModal();

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

    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onViewImage();
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectEvent();
        }
    }

    const handleSubscribe = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToast(`Subscribed to updates for ${event.name}`, 'success');
    };

    return (
        <div 
            onClick={onSelectEvent}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`View details for ${event.name}`}
            className="bg-white rounded-xl shadow-lg overflow-hidden group border-b-4 border-primary flex flex-col md:flex-row cursor-pointer h-full focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/70 card-interactive"
        >
            <div className="md:w-1/2 relative overflow-hidden h-64 md:h-auto bg-stone-200">
                {status !== 'loaded' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {status === 'loading' && <Icon name="lotus" className="w-8 h-8 text-stone-400 animate-spin" />}
                        {status === 'error' && <Icon name="alert-triangle" className="w-8 h-8 text-red-400" />}
                    </div>
                )}
                <img 
                    src={imgSrc} 
                    alt={event.name} 
                    crossOrigin="anonymous"
                    onLoad={onLoad}
                    onError={onError}
                    onClick={handleImageClick}
                    className={`w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500 ease-out cursor-pointer ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`} 
                />
                <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r"></div>
                    <button
                        onClick={handleImageClick}
                        aria-label={`View image for ${event.name}`}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 pointer-events-auto cursor-pointer">
                        <Icon name="zoom-in" className="w-12 h-12 text-white" />
                    </button>
                    {isAdmin && (
                        <div className="absolute top-3 right-3 flex gap-2 z-10 pointer-events-auto">
                            <button 
                                onClick={handleEdit} 
                                className="bg-blue-600/80 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg" 
                                aria-label={`Edit ${event.name}`}
                            >
                                <Icon name="edit" className="w-4 h-4"/>
                            </button>
                            <button 
                                onClick={handleDelete} 
                                className="bg-red-600/80 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg" 
                                aria-label={`Delete ${event.name}`}
                            >
                                <Icon name="trash" className="w-4 h-4"/>
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="md:w-1/2 p-6 flex flex-col">
                <h3 className="text-2xl font-bold text-text-base mb-2">{event.name}</h3>
                
                <div className="flex items-center text-sm text-text-muted mb-2">
                    <Icon name="calendar" className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                    <span>{event.dates}</span>
                </div>
                <div className="flex items-center text-sm text-text-muted mb-4">
                    <Icon name="map-pin" className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                    <span>{event.location}</span>
                </div>
                
                <p className="text-text-base text-base mb-4 flex-grow line-clamp-4">{event.description}</p>
                
                <div className="mt-auto pt-4 flex items-center justify-between gap-4">
                    <CrowdLevelIndicator level={event.crowdLevel} size="small" />
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); openModal('task', { item: event, itemType: 'Event', t }); }}
                            className="text-primary/80 hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"
                            title={t.setTask}
                            aria-label={t.setTask}
                        >
                            <Icon name="clock" className="w-5 h-5"/>
                        </button>
                        <button
                            onClick={handleSubscribe}
                            className="text-primary/80 hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"
                            title="Subscribe for Updates"
                            aria-label="Subscribe for updates"
                        >
                            <Icon name="bell" className="w-5 h-5"/>
                        </button>
                        <span className="font-bold text-primary group-hover:text-secondary transition-colors self-center whitespace-nowrap">
                            {t.readMore} &rarr;
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
