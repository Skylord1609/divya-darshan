
import React from 'react';
import { ActivityLogItem as ActivityLogItemType } from '../types';
import { Icon } from './Icon';

const getIcon = (type: ActivityLogItemType['type']) => {
    const baseClasses = "w-5 h-5";
    switch(type) {
        case 'login': return { icon: <Icon name="users" className={baseClasses} />, color: 'bg-blue-100 text-blue-600' };
        case 'booking': return { icon: <Icon name="bell" className={baseClasses} />, color: 'bg-purple-100 text-purple-600' };
        case 'submission': return { icon: <Icon name="temple" className={baseClasses} />, color: 'bg-yellow-100 text-yellow-600' };
        case 'approval': return { icon: <Icon name="temple" className={baseClasses} />, color: 'bg-green-100 text-green-600' };
        case 'rejection': return { icon: <Icon name="temple" className={baseClasses} />, color: 'bg-red-100 text-red-600' };
        case 'addition': return { icon: <Icon name="temple" className={baseClasses} />, color: 'bg-indigo-100 text-indigo-600' };
        default: return { icon: <Icon name="users" className={baseClasses} />, color: 'bg-stone-100 text-stone-600' };
    }
}

export const ActivityLogItem = React.memo(({ item }: { item: ActivityLogItemType }) => {
    const { icon, color } = getIcon(item.type);

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

        if (diffSeconds < 60) return `${diffSeconds}s ago`;
        const diffMinutes = Math.round(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        const diffHours = Math.round(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    return (
        <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div className="flex-grow">
                <p className="text-sm text-stone-800">{item.message}</p>
                <p className="text-xs text-stone-500">{formatTime(item.timestamp)}</p>
            </div>
        </div>
    );
});

ActivityLogItem.displayName = 'ActivityLogItem';
