
import React from 'react';
import { Icon } from './Icon';

interface LiveDarshanCardProps {
    title: string;
    description: string;
    buttonText: string;
    onClick: () => void;
}

export const LiveDarshanCard = ({ title, description, buttonText, onClick }: LiveDarshanCardProps) => {
    return (
        <div className="bg-gradient-to-tr from-stone-900 to-stone-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-400/50 animate-glow-border">
            <div className="p-8 text-white relative">
                <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-600/90 text-white text-xs font-bold uppercase px-3 py-1 rounded-full shadow-lg">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-400"></span>
                    </span>
                    <span>Live</span>
                </div>
                
                <h3 className="text-3xl font-bold mb-3 text-amber-300">{title}</h3>
                <p className="text-amber-100 mb-6">{description}</p>
                <button 
                    onClick={onClick}
                    className="bg-amber-400 text-orange-900 font-bold py-2 px-6 rounded-full hover:bg-amber-300 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center space-x-2"
                >
                    <Icon name="camera" className="w-5 h-5"/>
                    <span>{buttonText}</span>
                </button>
            </div>
        </div>
    );
}
