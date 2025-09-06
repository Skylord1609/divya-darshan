
import React from 'react';
import type { Book, I18nContent } from '../types';
import { Icon } from './Icon';
import { PLACEHOLDER_IMAGE_URL } from '../constants';
import { useImageWithFallback } from '../hooks/useImageWithFallback';

interface BookCardProps {
    book: Book;
    t: I18nContent;
    onSelectBook: () => void;
    isAdmin?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onViewImage: () => void;
}

export const BookCard = ({ book, t, onSelectBook, isAdmin, onEdit, onDelete, onViewImage }: BookCardProps) => {
    const { imgSrc, status, onLoad, onError } = useImageWithFallback(book.imageUrl, PLACEHOLDER_IMAGE_URL);
    
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
            onSelectBook();
        }
    }

    return (
        <div 
            onClick={onSelectBook}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`Read ${book.name}`}
            className="bg-white rounded-lg shadow-lg overflow-hidden border-b-4 border-primary flex flex-col h-full cursor-pointer relative group focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/70 card-interactive"
        >
            
            {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                    <button 
                        onClick={handleEdit} 
                        className="bg-blue-600/80 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg" 
                        aria-label={`Edit ${book.name}`}
                    >
                        <Icon name="edit" className="w-4 h-4"/>
                    </button>
                    <button 
                        onClick={handleDelete} 
                        className="bg-red-600/80 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg" 
                        aria-label={`Delete ${book.name}`}
                    >
                        <Icon name="trash" className="w-4 h-4"/>
                    </button>
                </div>
            )}

            <div className="relative h-56 bg-stone-200">
                 {status !== 'loaded' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {status === 'loading' && <Icon name="lotus" className="w-8 h-8 text-stone-400 animate-spin" />}
                        {status === 'error' && <Icon name="alert-triangle" className="w-8 h-8 text-red-400" />}
                    </div>
                )}
                <img 
                    src={imgSrc} 
                    alt={book.name} 
                    crossOrigin="anonymous"
                    onLoad={onLoad}
                    onError={onError} 
                    onClick={handleImageClick}
                    className={`w-full h-full object-cover transition-opacity duration-300 cursor-pointer ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`} 
                />
                 <button
                    onClick={handleImageClick}
                    aria-label={`View image of ${book.name}`}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 cursor-pointer">
                    <Icon name="zoom-in" className="w-12 h-12 text-white" />
                </button>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-text-base mb-2">{book.name}</h3>
                <p className="text-text-base text-base mb-4 line-clamp-4 flex-grow">{book.description}</p>
                 <div className="mt-auto pt-4">
                     <span className="font-bold text-primary group-hover:text-secondary transition-colors">
                        {t.readBook} &rarr;
                    </span>
                </div>
            </div>
        </div>
    );
};
