import React from 'react';
import type { Pooja, I18nContent } from '../types';
import { PLACEHOLDER_IMAGE_URL } from '../constants';
import { useImageWithFallback } from '../hooks/useImageWithFallback';
import { Icon } from './Icon';
import { useModal } from '../contexts/ModalContext';


interface PoojaCardProps {
    pooja: Pooja;
    t: I18nContent;
    onBook: (pooja: Pooja) => void;
    onViewImage: () => void;
    onAskGuru: (pooja: Pooja) => void;
    isAdmin?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    panditCount?: number;
}

export const PoojaCard = ({ pooja, t, onBook, onViewImage, onAskGuru, isAdmin, onEdit, onDelete, panditCount }: PoojaCardProps) => {
    const { imgSrc, status, onLoad, onError } = useImageWithFallback(pooja.imageUrl, PLACEHOLDER_IMAGE_URL);
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
    
    const handleSetTask = (e: React.MouseEvent) => {
        e.stopPropagation();
        openModal('task', { item: pooja, itemType: 'Pooja', t });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group border-b-4 border-primary h-full relative card-interactive">
             {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                    <button 
                        onClick={handleEdit} 
                        className="bg-blue-600/80 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg" 
                        aria-label={`Edit ${pooja.name}`}
                    >
                        <Icon name="edit" className="w-4 h-4"/>
                    </button>
                    <button 
                        onClick={handleDelete} 
                        className="bg-red-600/80 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg" 
                        aria-label={`Delete ${pooja.name}`}
                    >
                        <Icon name="trash" className="w-4 h-4"/>
                    </button>
                </div>
            )}
            <div className="relative h-48 bg-stone-200">
                {status !== 'loaded' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {status === 'loading' && <Icon name="lotus" className="w-8 h-8 text-stone-400 animate-spin" />}
                        {status === 'error' && <Icon name="alert-triangle" className="w-8 h-8 text-red-400" />}
                    </div>
                )}
                <img 
                    src={imgSrc} 
                    alt={pooja.name} 
                    crossOrigin="anonymous"
                    onLoad={onLoad}
                    onError={onError} 
                    onClick={onViewImage}
                    className={`w-full h-full object-cover transition-opacity duration-300 cursor-pointer ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`} 
                />
                 <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <button
                        onClick={onViewImage}
                        aria-label={`View image of ${pooja.name}`}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 pointer-events-auto cursor-pointer">
                        <Icon name="zoom-in" className="w-12 h-12 text-white" />
                    </button>
                    <div className="absolute bottom-0 left-0 p-4 pointer-events-auto">
                        <h3 className="text-xl font-bold text-white drop-shadow-md">{pooja.name}</h3>
                        <p className="text-secondary/90 text-sm">{pooja.duration}</p>
                    </div>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <p className="text-text-base text-sm mb-4 line-clamp-3 flex-grow">{pooja.description}</p>
                <div className="mt-auto">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-2xl font-bold text-primary">₹{pooja.cost}</p>
                        {panditCount !== undefined && panditCount > 0 && (
                            <div className="text-sm font-semibold text-green-800 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1.5" title={`${panditCount} Pandits available for this pooja`}>
                                <Icon name="users" className="w-4 h-4" />
                                <span>{panditCount} Pandits</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button 
                            onClick={() => onBook(pooja)}
                            className="flex-1 bg-primary text-white font-bold py-2 px-4 rounded-full hover:bg-secondary transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                            <Icon name="bell" className="w-4 h-4"/>
                            {t.bookNow}
                        </button>
                        <button
                            onClick={handleSetTask}
                            className="flex-1 bg-primary/10 text-primary font-bold py-2 px-4 rounded-full hover:bg-primary/20 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                            title={t.setTask}
                        >
                            <Icon name="clock" className="w-4 h-4"/>
                            {t.setTask}
                        </button>
                        <button
                            onClick={() => onAskGuru(pooja)}
                            className="flex-1 bg-primary/10 text-primary font-bold py-2 px-4 rounded-full hover:bg-primary/20 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                            title={`Ask Guru about ${pooja.name}`}
                        >
                            <Icon name="cosmic-logo" className="w-4 h-4"/>
                            Ask Guru
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};