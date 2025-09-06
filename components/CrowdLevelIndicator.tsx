
import React from 'react';
import { CrowdLevel } from '../types';
import { Icon } from './Icon';

interface CrowdLevelIndicatorProps {
    level: CrowdLevel;
    size: 'small' | 'large';
}

const levelConfig: Record<CrowdLevel, { 
    text: string; 
    badgeColor: string; 
    dotColor: string;
    panelColor: string;
    icon: React.ReactNode;
}> = {
    Low: { 
        text: 'Low', 
        badgeColor: 'bg-green-100 text-green-800', 
        dotColor: 'bg-green-500',
        panelColor: 'bg-green-100 text-green-800 border-green-500',
        icon: <Icon name="users" className="w-6 h-6" /> 
    },
    Medium: { 
        text: 'Medium', 
        badgeColor: 'bg-yellow-100 text-yellow-800', 
        dotColor: 'bg-yellow-500',
        panelColor: 'bg-yellow-100 text-yellow-800 border-yellow-500',
        icon: <Icon name="users" className="w-6 h-6" />
    },
    High: { 
        text: 'High', 
        badgeColor: 'bg-orange-100 text-orange-800', 
        dotColor: 'bg-orange-500',
        panelColor: 'bg-orange-100 text-orange-800 border-orange-500',
        icon: <Icon name="users" className="w-6 h-6" /> 
    },
    'Very High': { 
        text: 'Very High', 
        badgeColor: 'bg-red-100 text-red-800', 
        dotColor: 'bg-red-500',
        panelColor: 'bg-red-100 text-red-800 border-red-500',
        icon: <Icon name="users" className="w-6 h-6" /> 
    },
};

export const CrowdLevelIndicator = ({ level, size }: CrowdLevelIndicatorProps) => {
    const config = levelConfig[level] || levelConfig.Low;
    
    if (size === 'small') {
        return (
            <div className={`px-3 py-1 text-xs font-bold rounded-full shadow-md flex items-center space-x-1.5 ${config.badgeColor} backdrop-blur-sm bg-opacity-90`}>
                <div className={`w-2 h-2 rounded-full ${config.dotColor}`}></div>
                <span>{config.text}</span>
            </div>
        );
    }
    
    const advisory: Record<CrowdLevel, string> = {
        Low: "It's a great time for a peaceful visit.",
        Medium: "Expect a moderate number of devotees.",
        High: "The temple is busy. Please plan accordingly.",
        'Very High': "Extreme crowding. Plan your visit carefully.",
    };

    return (
        <div className={`p-4 rounded-lg flex items-center space-x-4 border-l-4 ${config.panelColor}`}>
            <div className="flex-shrink-0">{config.icon}</div>
            <div>
                <p className="font-bold text-lg">Crowd Level: {config.text}</p>
                <p className="text-sm">{advisory[level]}</p>
            </div>
        </div>
    );
};