
import React from 'react';
import { Achievement, I18nContent } from '../types';
import { Icon } from './Icon';

interface AchievementCardProps {
    achievement: Achievement;
    unlocked: boolean;
    t: I18nContent;
}

export const AchievementCard = ({ achievement, unlocked, t }: AchievementCardProps) => {
    const name = t[achievement.nameKey];
    const description = t[achievement.descriptionKey];

    return (
        <div 
            className={`p-4 rounded-lg text-center transition-all duration-300 ${unlocked ? 'bg-amber-100 border-2 border-amber-400 shadow-lg' : 'bg-stone-100'}`}
            title={`${name}: ${description}`}
        >
            <div className={`relative w-20 h-20 mx-auto transition-all duration-300 ${!unlocked ? 'grayscale opacity-60' : ''}`}>
                <div className={`absolute inset-0 rounded-full flex items-center justify-center ${unlocked ? 'bg-amber-200' : 'bg-stone-200'}`}>
                    <Icon name={achievement.icon} className={`w-12 h-12 ${unlocked ? 'text-amber-600' : 'text-stone-500'}`} />
                </div>
            </div>
            <h3 className={`mt-2 font-bold text-sm ${unlocked ? 'text-amber-900' : 'text-stone-600'}`}>
                {name}
            </h3>
        </div>
    );
};
