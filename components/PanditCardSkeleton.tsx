
import React from 'react';

export const PanditCardSkeleton = () => {
    return (
        <div role="status" aria-label="Loading pandit data" className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col border-b-4 border-black/10 w-full animate-pulse">
            <div className="w-full h-56 skeleton-bg" />
            <div className="p-4 flex flex-col flex-grow">
                <div className="h-6 skeleton-bg-darker rounded w-3/4 mb-2"></div>
                <div className="h-4 skeleton-bg rounded w-1/2 mb-2"></div>
                <div className="h-4 skeleton-bg rounded w-1/3 mb-4"></div>
                <div className="mt-auto">
                    <div className="h-8 skeleton-bg-darker rounded w-1/3 mb-4"></div>
                    <div className="h-10 skeleton-bg-darker rounded-full w-full"></div>
                </div>
            </div>
        </div>
    );
};