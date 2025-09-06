
import React from 'react';
import { FeedItem, I18nContent } from '../types';
import { useImageWithFallback } from '../hooks/useImageWithFallback';
import { PLACEHOLDER_IMAGE_URL } from '../constants';
import { useModal } from '../contexts/ModalContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Icon } from './Icon';

interface RecommendationCardProps {
    feedItem: FeedItem;
    t: I18nContent;
    onViewImage: () => void;
}

const typeConfig = {
    temple: { label: 'Temple', icon: <Icon name="temple" className="w-3 h-3" />, view: 'templeDetail' },
    pooja: { label: 'Pooja', icon: <Icon name="bell" className="w-3 h-3" />, view: 'poojas' },
    book: { label: 'Knowledge', icon: <Icon name="book-open" className="w-3 h-3" />, view: 'bookReader' },
    event: { label: 'Event', icon: <Icon name="calendar" className="w-3 h-3" />, view: 'eventDetail' },
}

export const RecommendationCard = ({ feedItem, t, onViewImage }: RecommendationCardProps) => {
    const { item, reason, type } = feedItem;
    const { imgSrc, status, onLoad, onError } = useImageWithFallback(item.imageUrl || '', PLACEHOLDER_IMAGE_URL);
    const config = typeConfig[type];

    const { openModal } = useModal();
    const { currentUser } = useAuth();
    const { addToast } = useToast();

    const handleClick = () => {
         const navigateTo = (path: string) => { window.location.hash = path; };
        
        switch(type) {
            case 'temple':
                navigateTo(`/templeDetail/${item.id}`);
                break;
            case 'pooja':
                 if (!currentUser) openModal('login');
                 else openModal('poojaBooking', { pooja: item });
                break;
            case 'book':
                 if ('contentKey' in item && item.contentKey) navigateTo(`/bookReader/${item.contentKey}`);
                 else addToast(t.bookNotAvailable, 'info');
                break;
            case 'event':
                 navigateTo(`/eventDetail/${item.id}`);
                break;
        }
    }

    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onViewImage();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    }
    
    const description = 'history' in item ? item.history : item.description;

    return (
        <div 
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`Recommendation for ${item.name}`}
            className="w-64 flex-shrink-0 bg-white rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group"
        >
            <div className="relative h-32 bg-stone-200">
                {status !== 'loaded' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {status === 'loading' && <Icon name="lotus" className="w-6 h-6 text-stone-400 animate-spin" />}
                        {status === 'error' && <Icon name="alert-triangle" className="w-6 h-6 text-red-400" />}
                    </div>
                )}
                <img 
                    src={imgSrc} 
                    alt={item.name} 
                    crossOrigin="anonymous"
                    onLoad={onLoad}
                    onError={onError}
                    className={`w-full h-full object-cover rounded-t-lg transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                />
                 <button
                    onClick={handleImageClick}
                    aria-label={`View image of ${item.name}`}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 cursor-pointer">
                    <Icon name="zoom-in" className="w-10 h-10 text-white" />
                </button>
                 <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full pointer-events-none">
                    {config.icon}
                    <span>{config.label}</span>
                </div>
            </div>
            <div className="p-3">
                <p className="text-xs text-primary font-semibold mb-1 truncate">{reason}</p>
                <h4 className="font-bold text-stone-800 truncate" title={item.name}>{item.name}</h4>
                <p className="text-xs text-stone-600 line-clamp-2 mt-1">{description}</p>
            </div>
        </div>
    );
};
