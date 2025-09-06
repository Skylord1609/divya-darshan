import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';

interface SplashScreenProps {
  onFinished: () => void;
}

export const SplashScreen = ({ onFinished }: SplashScreenProps) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const finishTimeoutRef = useRef<number | null>(null);
  
  const finish = () => {
      setIsFadingOut(true);
      setTimeout(onFinished, 700); // Match fade-out duration
  };
  
  const handleInteraction = () => {
    if (hasInteracted) return;

    setHasInteracted(true);
    if (finishTimeoutRef.current) {
        clearTimeout(finishTimeoutRef.current);
    }

    audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
    setShowRipple(true);

    // Give ripple time to expand before finishing
    setTimeout(finish, 800);
  };
  
  useEffect(() => {
    // Fallback to auto-close if user doesn't interact
    finishTimeoutRef.current = window.setTimeout(() => {
        if (!hasInteracted) {
           finish();
        }
    }, 5000); // Auto-close after 5 seconds

    return () => {
        if (finishTimeoutRef.current) {
            clearTimeout(finishTimeoutRef.current);
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onFinished, hasInteracted]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gray-900 ${isFadingOut ? 'animate-fade-out' : 'animate-fade-in'}`}
    >
      <div 
        className="absolute inset-0"
        style={{
            backgroundImage: `url(https://www.transparenttextures.com/patterns/stardust.png)`,
            backgroundRepeat: 'repeat',
            animation: 'starfield-scroll 200s linear infinite',
            opacity: 0.5
        }}
      />
      <div className="relative z-10 flex flex-col items-center justify-center">
        <Icon name="animated-cosmic-logo" className="w-60 h-60 md:w-72 md:h-72" />
        <h1 className="text-5xl font-heading text-white mt-4 tracking-wider animate-glow-white-text">
            Divya Darshan
        </h1>

        {!hasInteracted && (
             <p className="text-amber-200/80 mt-8 text-lg animate-fade-in" style={{animationDelay: '1.5s'}}>
                Tap ॐ to begin your journey
            </p>
        )}

        <button
            onClick={handleInteraction}
            className={`mt-6 text-6xl text-amber-300 transition-opacity duration-500 ${hasInteracted ? 'opacity-0' : 'opacity-100'}`}
            style={{ animation: 'om-pulse 6s infinite ease-in-out', animationDelay: '1.2s' }}
            aria-label="Begin Journey"
        >
            ॐ
        </button>

        {showRipple && <div className="ripple"></div>}
      </div>

       <audio
        ref={audioRef}
        src="https://upload.wikimedia.org/wikipedia/commons/e/e6/Om_chanting.ogg"
        preload="auto"
        className="hidden"
      />
    </div>
  );
};