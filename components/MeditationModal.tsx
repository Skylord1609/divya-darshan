import React, { useState, useEffect, useRef } from 'react';
import { I18nContent } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { Icon } from './Icon';

interface MeditationModalProps {
    onClose: () => void;
    onComplete: () => void;
    t: I18nContent;
}

const MEDITATION_DURATION_SECONDS = 300; // 5 minutes

export const MeditationModal = ({ onClose, onComplete, t }: MeditationModalProps) => {
    const [timeRemaining, setTimeRemaining] = useState(MEDITATION_DURATION_SECONDS);
    const [isActive, setIsActive] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    useEffect(() => {
        let interval: number | null = null;
        if (isActive && timeRemaining > 0) {
            interval = window.setInterval(() => {
                setTimeRemaining(time => time - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            onComplete();
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeRemaining, onComplete]);

    const toggleTimer = () => setIsActive(!isActive);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    const progress = ((MEDITATION_DURATION_SECONDS - timeRemaining) / MEDITATION_DURATION_SECONDS) * 100;

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="meditation-title"
                className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl shadow-2xl w-full max-w-md p-8 relative flex flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    aria-label="Close"
                    className="absolute top-4 right-4 text-stone-500 hover:text-indigo-600 transition-colors text-2xl font-bold z-10"
                >&times;</button>
                
                <Icon name="lotus" className="w-16 h-16 text-indigo-400 mb-4" />
                <h2 id="meditation-title" className="text-3xl font-bold text-indigo-900 font-serif">A Moment of Peace</h2>
                <p className="text-stone-600 mb-8">Close your eyes, breathe deeply.</p>

                <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                    <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-indigo-200" strokeWidth="5" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                        <circle 
                            className="text-indigo-500" 
                            strokeWidth="5" 
                            strokeDasharray={2 * Math.PI * 45}
                            strokeDashoffset={(2 * Math.PI * 45) * (1 - progress / 100)}
                            strokeLinecap="round" 
                            stroke="currentColor" 
                            fill="transparent" 
                            r="45" 
                            cx="50" 
                            cy="50"
                            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s linear' }}
                        />
                    </svg>
                    <span className="text-5xl font-mono font-bold text-indigo-900">{formatTime(timeRemaining)}</span>
                </div>

                {!isActive && timeRemaining === MEDITATION_DURATION_SECONDS && (
                     <button
                        onClick={toggleTimer}
                        className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:bg-indigo-700 transition-colors shadow-lg"
                    >
                        {t.startMeditation}
                    </button>
                )}
            </div>
        </div>
    );
};