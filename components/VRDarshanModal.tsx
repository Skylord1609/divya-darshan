

import React, { useRef, useState } from 'react';
import './VRDarshanModal.css';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface VRDarshanModalProps {
    onClose: () => void;
}

export const VRDarshanModal = ({ onClose }: VRDarshanModalProps) => {
    const panoramicImage = "https://images.unsplash.com/photo-1628178952395-35072719c417?q=80&w=2400&auto=format&fit=crop";
    const modalRef = useRef<HTMLDivElement>(null);
    const panoRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, left: 0 });
    const [panoLeft, setPanoLeft] = useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!panoRef.current) return;
        e.preventDefault();
        setIsDragging(true);
        // Stop CSS animation on drag to give user control
        panoRef.current.style.animation = 'none';
        panoRef.current.style.transition = 'none';
        dragStartRef.current = {
            x: e.clientX,
            left: panoLeft,
        };
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (panoRef.current) {
            panoRef.current.style.transition = 'transform 0.2s ease-out';
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !panoRef.current) return;
        const dx = e.clientX - dragStartRef.current.x;
        let newLeft = dragStartRef.current.left + dx;

        // Clamp values to prevent panning out of bounds
        const containerWidth = panoRef.current.parentElement!.clientWidth;
        const imageWidth = panoRef.current.clientWidth;
        const maxTranslate = 0;
        const minTranslate = containerWidth - imageWidth;
        newLeft = Math.max(minTranslate, Math.min(maxTranslate, newLeft));

        setPanoLeft(newLeft);
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
                aria-labelledby="vr-darshan-title"
                className="bg-stone-900 border-2 border-amber-400/50 rounded-2xl shadow-2xl w-full max-w-5xl h-[60vh] overflow-hidden p-2 relative flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                 <div className="absolute top-2 right-4 z-20">
                     <button 
                        onClick={onClose} 
                        aria-label="Close"
                        className="text-white/70 hover:text-white transition-colors text-4xl font-bold drop-shadow-lg"
                     >&times;</button>
                </div>
                 <div className="absolute top-4 left-4 z-20 text-white">
                    <h2 id="vr-darshan-title" className="text-xl font-bold drop-shadow-md">Ramanathaswamy Temple Corridor</h2>
                    <p className="text-sm drop-shadow-sm">Drag to look around</p>
                 </div>

                <div 
                    className={`w-full h-full vr-pano-container ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseUp}
                >
                    <div 
                        ref={panoRef}
                        className="vr-pano-image"
                        style={{ 
                            backgroundImage: `url(${panoramicImage})`,
                            transform: `translateX(${panoLeft}px)`,
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
};