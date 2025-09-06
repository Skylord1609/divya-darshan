
import React from 'react';

export const YatraCardSkeleton = () => {
    return (
        <div role="status" aria-label="Loading yatra data" className="bg-white rounded-xl shadow-lg overflow-hidden border-b-4 border-black/10 flex flex-col h-full animate-pulse">
            <div className="w-full h-56 skeleton-bg" />
            <div className="p-6 flex flex-col flex-grow">
                <div className="h-8 skeleton-bg-darker rounded w-3/4 mb-3"></div>
                <div className="flex-grow space-y-2 mb-4">
                    <div className="h-4 skeleton-bg rounded"></div>
                    <div className="h-4 skeleton-bg rounded"></div>
                    <div className="h-4 skeleton-bg rounded w-5/6"></div>
                </div>
                <div className="flex items-center space-x-4 mb-4">
                    <div className="h-5 skeleton-bg rounded w-1/4"></div>
                    <div className="h-5 skeleton-bg rounded w-1/4"></div>
                </div>
                <div className="mt-auto pt-2 flex items-center justify-between gap-4">
                    <div className="w-1/3">
                        <div className="h-8 skeleton-bg-darker rounded w-full mb-1"></div>
                        <div className="h-3 skeleton-bg rounded w-1/2"></div>
                    </div>
                    <div className="h-10 skeleton-bg-darker rounded-full w-1/2"></div>
                </div>
            </div>
        </div>
    );
};