import React from 'react';
import type { I18nContent } from '../types';
import { PLACEHOLDER_IMAGE_URL } from '../constants';
import { useImageWithFallback } from '../hooks/useImageWithFallback';

interface VRDarshanProps {
    t: I18nContent;
    onClick: () => void;
}

export const VRDarshan = ({ t, onClick }: VRDarshanProps) => {
    const { imgSrc, onError: handleImageError } = useImageWithFallback("https://upload.wikimedia.org/wikipedia/commons/4/4c/Hoysaleswara_temple_Halebidu_Inner_Sanctum_with_linga.jpg", PLACEHOLDER_IMAGE_URL);

    return (
        <div className="bg-secondary/10 rounded-xl">
            <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 text-center md:text-left">
                    <p className="text-lg text-text-muted mb-8 max-w-xl">{t.vrDarshanDesc}</p>
                    <button onClick={onClick} className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-secondary transition-all duration-300 transform hover:scale-105 shadow-lg">
                        {t.experienceNow}
                    </button>
                </div>
                <div className="md:w-1/2">
                    <div className="aspect-video bg-black rounded-lg shadow-2xl overflow-hidden border-4 border-primary/50">
                        <img src={imgSrc} alt="360 Darshan Preview" loading="lazy" onError={handleImageError} className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        </div>
    );
};
