import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}

export const StatCard = React.memo(({ title, value, icon }: StatCardProps) => (
    <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4 border-l-4 border-orange-500">
        <div className="text-orange-500 bg-orange-100 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-stone-600 font-medium">{title}</p>
            <p className="text-xl lg:text-2xl font-bold text-orange-900">{value}</p>
        </div>
    </div>
));

StatCard.displayName = 'StatCard';