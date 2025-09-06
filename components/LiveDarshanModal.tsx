
import React, { useRef } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface LiveDarshanModalProps {
    onClose: () => void;
}

export const LiveDarshanModal = ({ onClose }: LiveDarshanModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    return (
        <div 
            className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="live-darshan-title"
                className="bg-stone-900 border-2 border-amber-400/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden p-2 relative flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 flex justify-between items-center">
                     <h2 id="live-darshan-title" className="text-xl font-bold text-amber-300">Live Darshan: Ganga Aarti, Varanasi</h2>
                     <button 
                        onClick={onClose} 
                        aria-label="Close"
                        className="text-white/70 hover:text-white transition-colors text-3xl font-bold"
                     >&times;</button>
                </div>
                <div className="aspect-video w-full">
                    {/* Embed a relevant live stream or video */}
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src="https://www.youtube.com/embed/fORHAO1i2aI?autoplay=1&mute=1&rel=0"
                        title="YouTube video player - Ganga Aarti" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
};
