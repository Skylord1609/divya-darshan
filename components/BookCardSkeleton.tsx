
import React from 'react';

export const BookCardSkeleton = () => {
    return (
        <div role="status" aria-label="Loading book data" className="bg-white rounded-lg shadow-lg overflow-hidden border-b-4 border-black/10 w-full animate-pulse">
            <div className="w-full h-56 skeleton-bg" />
            <div className="p-6 flex flex-col flex-grow">
                <div className="h-8 skeleton-bg-darker rounded w-3/4 mb-3"></div>
                <div className="flex-grow space-y-2">
                    <div className="h-4 skeleton-bg rounded"></div>
                    <div className="h-4 skeleton-bg rounded"></div>
                    <div className="h-4 skeleton-bg rounded"></div>
                    <div className="h-4 skeleton-bg rounded w-5/6"></div>
                </div>
                <div className="h-6 skeleton-bg-darker rounded w-24 mt-4 self-start"></div>
            </div>
        </div>
    );
};