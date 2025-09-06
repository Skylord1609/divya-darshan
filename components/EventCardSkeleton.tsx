
import React from 'react';

export const EventCardSkeleton = () => {
    return (
        <div role="status" aria-label="Loading event data" className="bg-white rounded-xl shadow-lg overflow-hidden border-b-4 border-black/10 flex flex-col md:flex-row h-full animate-pulse">
            <div className="md:w-1/2 h-64 md:h-auto skeleton-bg" />
            <div className="md:w-1/2 p-6 flex flex-col">
                <div className="h-8 skeleton-bg-darker rounded w-3/4 mb-3"></div>
                <div className="h-4 skeleton-bg rounded w-1/2 mb-2"></div>
                <div className="h-4 skeleton-bg rounded w-1/3 mb-4"></div>
                <div className="flex-grow space-y-2 mb-4">
                    <div className="h-4 skeleton-bg rounded"></div>
                    <div className="h-4 skeleton-bg rounded"></div>
                    <div className="h-4 skeleton-bg rounded w-5/6"></div>
                </div>
                <div className="mt-auto pt-4 flex items-center justify-between gap-4">
                    <div className="h-6 skeleton-bg rounded-full w-24"></div>
                    <div className="h-6 skeleton-bg-darker rounded w-20"></div>
                </div>
            </div>
        </div>
    );
};