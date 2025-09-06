
import React from 'react';
import type { Pandit, I18nContent } from '../types';
import { PLACEHOLDER_IMAGE_URL } from '../constants';
import { useImageWithFallback } from '../hooks/useImageWithFallback';
import { Icon } from './Icon';

interface PanditCardProps {
    pandit: Pandit;
    t: I18nContent;
    onBook: (pandit: Pandit) => void;
    isAdmin: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

export const PanditCard = ({ pandit, t, onBook, isAdmin, onEdit, onDelete }: PanditCardProps) => {
    const { imgSrc, status, onLoad, onError } = useImageWithFallback(pandit.imageUrl, PLACEHOLDER_IMAGE_URL);
    
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group border-b-4 border-primary h-full card-interactive">
            <div className="relative h-56 bg-stone-200">
                {status !== 'loaded' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {status === 'loading' && <Icon name="lotus" className="w-8 h-8 text-stone-400 animate-spin" />}
                        {status === 'error' && <Icon name="alert-triangle" className="w-8 h-8 text-red-400" />}
                    </div>
                )}
                <img 
                    src={imgSrc} 
                    alt={pandit.name} 
                    loading="lazy" 
                    onLoad={onLoad}
                    onError={onError} 
                    className={`w-full h-full object-cover transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`} 
                />
                <div className={`absolute top-3 right-3 bg-secondary text-white px-3 py-1 text-sm font-bold rounded-full shadow-md flex items-center transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}>
                    <Icon name="star" className="w-4 h-4 mr-1.5" />
                    {pandit.rating.toFixed(1)}
                </div>
                 {isAdmin && (
                    <div className="absolute top-3 left-3 flex gap-2">
                        <button onClick={onEdit} className="bg-blue-600/80 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg">
                            <Icon name="edit" className="w-4 h-4"/>
                        </button>
                        <button onClick={onDelete} className="bg-red-600/80 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg">
                            <Icon name="trash" className="w-4 h-4"/>
                        </button>
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                 <h3 className="text-xl font-bold text-text-base">{pandit.name}</h3>
                 <p className="text-sm text-text-muted mb-2">{pandit.specialization}</p>
                 <p className="text-sm font-semibold text-primary mb-4">{pandit.experience} years of experience</p>
                
                <div className="mt-auto">
                    <p className="text-2xl font-bold text-primary mb-4">₹{pandit.cost}</p>
                    <button 
                        onClick={() => onBook(pandit)}
                        className="w-full bg-primary text-white font-bold py-2 px-6 rounded-full hover:bg-secondary transition-all duration-300 transform hover:scale-105"
                    >
                        {t.bookPandit}
                    </button>
                </div>
            </div>
        </div>
    );
};