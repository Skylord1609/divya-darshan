import React from 'react';
import { Icon } from './Icon';

interface CustomYatraCardProps {
    onPlanYatra: () => void;
}

export const CustomYatraCard = ({ onPlanYatra }: CustomYatraCardProps) => {
    return (
        <div 
            className="relative bg-stone-800 rounded-2xl shadow-xl overflow-hidden p-8 text-white group"
        >
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                style={{backgroundImage: `url('https://www.transparenttextures.com/patterns/az-subtle.png')`}}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-50"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-shrink-0">
                    <Icon name="compass" className="w-24 h-24 text-primary" />
                </div>
                <div className="flex-grow text-center md:text-left">
                    <h2 className="text-3xl font-bold font-heading mb-2">Plan Your Own Divine Journey</h2>
                    <p className="text-white/80 max-w-2xl">Select multiple temples, customize your transport and stay, and create a personalized pilgrimage for you and your family.</p>
                </div>
                <div className="flex-shrink-0">
                    <button
                        onClick={onPlanYatra}
                        className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-secondary transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Start Planning &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};