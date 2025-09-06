import React from 'react';

const PARTICLE_COUNT = 40;

export const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
            {/* Background Image Layer */}
            <div 
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
                style={{ 
                    backgroundImage: `var(--background-image)`,
                    opacity: `var(--background-opacity)` 
                }}
            />
            {/* Particle Layer */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(PARTICLE_COUNT)].map((_, i) => {
                    const size = Math.random() * 5 + 2; // size between 2px and 7px
                    const duration = Math.random() * 20 + 15; // duration between 15s and 35s
                    const delay = Math.random() * duration; // delay up to the duration
                    const left = Math.random() * 100; // horizontal position

                    return (
                        <div
                            key={i}
                            className="particle"
                            style={{
                                width: `${size}px`,
                                height: `${size}px`,
                                left: `${left}%`,
                                animationDuration: `${duration}s`,
                                animationDelay: `-${delay}s`, // Negative delay starts animation partway through
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
};