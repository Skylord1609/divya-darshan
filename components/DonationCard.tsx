
import React from 'react';
import type { I18nContent } from '../types';
import { Icon } from './Icon';

interface DonationCardProps {
    t: I18nContent;
    onDonate: () => void;
}

export const DonationCard = ({ t, onDonate }: DonationCardProps) => {
    return (
        <div 
            className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-xl text-white p-8 flex flex-col md:flex-row items-center justify-between gap-8"
        >
            <div className="flex-shrink-0 text-amber-300">
                <Icon name="heart-hand" className="w-24 h-24" />
            </div>
            <div className="text-center md:text-left">
                <h3 className="text-3xl font-bold mb-2">{t.sevaTitle}</h3>
                <p className="text-amber-100 max-w-2xl mb-6">{t.sevaDesc}</p>
                <button 
                    onClick={onDonate}
                    className="bg-white text-orange-700 font-bold py-3 px-8 rounded-full hover:bg-amber-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                    {t.donateNow}
                </button>
            </div>
        </div>
    );
};