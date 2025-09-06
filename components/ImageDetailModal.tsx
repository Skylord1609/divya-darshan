import React, { useRef, useState, useEffect } from 'react';
import { PLACEHOLDER_IMAGE_URL } from '../constants';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { Icon } from './Icon';
import { useImageWithFallback } from '../hooks/useImageWithFallback';

interface ImageDetailModalProps {
    imageUrl: string;
    altText: string;
    onClose: () => void;
}

export const ImageDetailModal = ({ imageUrl, altText, onClose }: ImageDetailModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);
    
    const { imgSrc, status, onLoad, onError } = useImageWithFallback(imageUrl, PLACEHOLDER_IMAGE_URL);
    
    const [isZoomed, setIsZoomed] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [wasDragged, setWasDragged] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    useEffect(() => {
        setIsZoomed(false);
        setIsDragging(false);
        setWasDragged(false);
    }, [imageUrl]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (status !== 'loaded' || e.button !== 0) return;
        e.preventDefault();
        
        setIsDragging(true);
        setWasDragged(false);
        
        if (imageContainerRef.current) {
            dragStartRef.current = {
                x: e.clientX,
                y: e.clientY,
                scrollLeft: imageContainerRef.current.scrollLeft,
                scrollTop: imageContainerRef.current.scrollTop,
            };
        }
    };

    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!isDragging || !imageContainerRef.current) return;
            
            const dx = Math.abs(e.clientX - dragStartRef.current.x);
            const dy = Math.abs(e.clientY - dragStartRef.current.y);
            if (dx > 5 || dy > 5) {
                setWasDragged(true);
            }
            
            if (isZoomed) {
                const deltaX = e.clientX - dragStartRef.current.x;
                const deltaY = e.clientY - dragStartRef.current.y;
                imageContainerRef.current.scrollLeft = dragStartRef.current.scrollLeft - deltaX;
                imageContainerRef.current.scrollTop = dragStartRef.current.scrollTop - deltaY;
            }
        };

        const handleGlobalMouseUp = () => {
            if (!isDragging) return;

            if (status === 'loaded' && !wasDragged) {
                setIsZoomed(prev => !prev);
            }
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleGlobalMouseMove);
            window.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging, status, isZoomed, wasDragged]);

    const getCursorClass = () => {
        if (status !== 'loaded') return 'cursor-default';
        if (isDragging) return 'cursor-grabbing';
        return isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in';
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-label={altText}
                className="bg-stone-900 border-2 border-amber-400/50 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden p-2 relative flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    aria-label="Close"
                    className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-3xl font-bold z-20"
                >&times;</button>
                <div 
                    ref={imageContainerRef}
                    className={`flex-grow flex items-center justify-center p-4 overflow-auto ${getCursorClass()}`}
                    onMouseDown={handleMouseDown}
                >
                    {status !== 'loaded' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            {status === 'loading' && <Icon name="lotus" className="w-16 h-16 text-amber-400 animate-spin"/>}
                            {status === 'error' && <Icon name="alert-triangle" className="w-16 h-16 text-red-500"/>}
                        </div>
                    )}
                    <img 
                        src={imgSrc} 
                        alt={altText}
                        onLoad={onLoad}
                        onError={onError} 
                        className={`
                            max-w-none max-h-none object-contain rounded-lg transition-all duration-300 ease-in-out pointer-events-none
                            ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}
                            ${isZoomed ? 'scale-150' : 'max-w-full max-h-full'}
                        `}
                        draggable="false"
                    />
                </div>
                 <div className="p-2 text-center text-white/80 z-10 bg-stone-900/50">
                    <p>{altText}</p>
                 </div>
            </div>
        </div>
    );
};
