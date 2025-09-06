
import React from 'react';

export const TempleCardSkeleton = () => {
    return (
        <div role="status" aria-label="Loading temple data" className="bg-white rounded-lg shadow-lg overflow-hidden border-b-4 border-black/10 animate-pulse">
            <div className="w-full h-56 skeleton-bg" />
            <div className="p-6">
                <div className="h-8 skeleton-bg-darker rounded w-3/4 mb-3"></div>
                <div className="h-4 skeleton-bg rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                    <div className="h-4 skeleton-bg rounded"></div>
                    <div className="h-4 skeleton-bg rounded"></div>
                    <div className="h-4 skeleton-bg rounded w-5/6"></div>
                </div>
                <div className="h-10 skeleton-bg-darker rounded-full w-28 mt-4 ml-auto"></div>
            </div>
        </div>
    );
};