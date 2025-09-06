import { useState, useEffect } from 'react';
import { View } from '../types';

interface Route {
    view: View;
    id: string | null;
}

export const useHashRouter = (): Route => {
    const [currentHash, setCurrentHash] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => {
            setCurrentHash(window.location.hash);
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);
    
    const hash = currentHash.replace(/^#\/?|\/$/g, ''); // Clean the hash
    const parts = hash.split('/');

    const view = (parts[0] || 'home') as View;
    const id = parts[1] || null;

    return { view, id };
};
