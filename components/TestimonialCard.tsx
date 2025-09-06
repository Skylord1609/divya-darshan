
import React from 'react';
import { Testimonial } from '../types';
import { PLACEHOLDER_IMAGE_URL } from '../constants';
import { useImageWithFallback } from '../hooks/useImageWithFallback';
import { Icon } from './Icon';

interface TestimonialCardProps {
    testimonial: Testimonial;
}

export const TestimonialCard = React.memo(({ testimonial }: TestimonialCardProps) => {
    const { imgSrc, status, onLoad, onError } = useImageWithFallback(testimonial.avatarUrl, PLACEHOLDER_IMAGE_URL);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-primary flex flex-col items-center text-center card-interactive">
             <div className="relative w-20 h-20 mb-4">
                 <div className="absolute inset-0 bg-secondary/20 rounded-full flex items-center justify-center">
                    {status !== 'loaded' && <Icon name="lotus" className="w-6 h-6 text-secondary animate-spin" />}
                </div>
                <img 
                    src={imgSrc} 
                    alt={testimonial.name} 
                    crossOrigin="anonymous"
                    onLoad={onLoad}
                    onError={onError}
                    className={`w-20 h-20 rounded-full border-4 border-secondary shadow-md transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                />
            </div>
            <p className="text-text-base italic flex-grow">"{testimonial.quote}"</p>
            <div className="mt-4">
                <p className="font-bold text-text-base">{testimonial.name}</p>
                <p className="text-sm text-text-muted">{testimonial.location}</p>
            </div>
        </div>
    );
});

TestimonialCard.displayName = 'TestimonialCard';
