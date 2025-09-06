
import React from 'react';
import { ShoppingRecommendation, Pooja, I18nContent } from '../types';
import { useImageWithFallback } from '../hooks/useImageWithFallback';
import { PLACEHOLDER_IMAGE_URL } from '../constants';
import { Icon } from './Icon';

interface ProductRecommendationCardProps {
    recommendation: ShoppingRecommendation;
    allPoojas: Pooja[];
    t: I18nContent;
    onBookPooja: (pooja: Pooja) => void;
    onViewImage: () => void;
}

export const ProductRecommendationCard = ({ recommendation, allPoojas, t, onBookPooja, onViewImage }: ProductRecommendationCardProps) => {
    const { imgSrc, status, onLoad, onError } = useImageWithFallback(recommendation.imageUrl, PLACEHOLDER_IMAGE_URL);

    const handleBookClick = () => {
        if (recommendation.internalPoojaId) {
            const poojaToBook = allPoojas.find(p => p.id === recommendation.internalPoojaId);
            if (poojaToBook) {
                onBookPooja(poojaToBook);
            }
        }
    };

    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onViewImage();
    };

    const renderButton = () => {
        if (recommendation.internalPoojaId) {
            return (
                <button
                    onClick={handleBookClick}
                    className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-secondary transition-colors flex items-center gap-2"
                >
                    <Icon name="bell" className="w-4 h-4" />
                    {t.bookPooja}
                </button>
            );
        }
        if (recommendation.purchaseUrl) {
            return (
                 <a
                    href={recommendation.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                    <Icon name="shopping-bag" className="w-4 h-4" />
                    Buy Now
                </a>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col w-64 flex-shrink-0 border border-amber-200 group">
            <div className="h-40 bg-gray-100 relative">
                {status !== 'loaded' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {status === 'loading' && <Icon name="lotus" className="w-6 h-6 text-gray-400 animate-spin" />}
                        {status === 'error' && <Icon name="alert-triangle" className="w-6 h-6 text-red-400" />}
                    </div>
                )}
                <img 
                    src={imgSrc} 
                    alt={recommendation.itemName} 
                    crossOrigin="anonymous"
                    onLoad={onLoad}
                    onError={onError} 
                    className={`w-full h-full object-contain p-2 transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                />
                 <button
                    onClick={handleImageClick}
                    aria-label={`View image of ${recommendation.itemName}`}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 cursor-pointer">
                    <Icon name="zoom-in" className="w-10 h-10 text-white" />
                </button>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-stone-800">{recommendation.itemName}</h3>
                <p className="text-sm text-stone-600 mt-1 flex-grow line-clamp-3">{recommendation.description}</p>
                <div className="mt-4 flex justify-between items-center">
                    <p className="font-semibold text-primary">{recommendation.estimatedPrice}</p>
                    {renderButton()}
                </div>
            </div>
        </div>
    );
};
