
export const DATA_UPDATED_EVENT = 'divya-darshan-data-updated';

// In-memory cache to hold the application state.
const cache = new Map<string, any[]>();
// A map to prevent re-initializing the same cache key multiple times concurrently.
const initializationPromises = new Map<string, Promise<any[]>>();

// Helper to fetch static data from public folder.
const getStaticData = async <T>(path: string): Promise<T[]> => {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to fetch static data: ${path} (${response.statusText})`);
        }
        return response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Initializes a cache entry from localStorage or a static JSON file.
 * This function is called only if the data is not already in the in-memory cache.
 */
const initializeCache = <T>(storageKey: string, staticPath: string): Promise<T[]> => {
    if (initializationPromises.has(storageKey)) {
        return initializationPromises.get(storageKey) as Promise<T[]>;
    }

    const promise = new Promise<T[]>(async (resolve, reject) => {
        try {
            // 1. Try to load from localStorage first.
            const storedData = localStorage.getItem(`divya-darshan-${storageKey}`);
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                cache.set(storageKey, parsedData);
                resolve(parsedData);
                return;
            }

            // 2. If not in localStorage, fetch from the static file.
            const staticData = await getStaticData<T>(staticPath);
            localStorage.setItem(`divya-darshan-${storageKey}`, JSON.stringify(staticData));
            cache.set(storageKey, staticData);
            resolve(staticData);
        } catch (error) {
            console.error(`Failed to initialize cache for ${storageKey}`, error);
            reject(error);
        }
    });

    initializationPromises.set(storageKey, promise);
    return promise;
};

const MAX_CHAT_MESSAGES_TO_STORE = 500;
const MAX_AVATAR_SIZE_BYTES = 50000;


/**
 * Prepares data before it's written to localStorage to prevent storage bloat.
 * - For 'users', it strips out large base64 avatar strings.
 * - For 'chat_messages', it truncates the history to the most recent messages.
 * @param key The storage key of the data.
 * @param data The data array to be prepared.
 * @returns The processed data array, safe for storage.
 */
const prepareForStorage = (key: string, data: any[]): any[] => {
    if (key === 'users') {
        return data.map(u => {
            if (u.avatarUrl && u.avatarUrl.startsWith('data:image') && u.avatarUrl.length > MAX_AVATAR_SIZE_BYTES) {
                const { avatarUrl, ...userWithoutAvatar } = u;
                return userWithoutAvatar;
            }
            return u;
        });
    }

    if (key === 'chat_messages') {
        if (data.length > MAX_CHAT_MESSAGES_TO_STORE) {
            return data.slice(data.length - MAX_CHAT_MESSAGES_TO_STORE);
        }
    }
    
    return data;
};


/**
 * A centralized cache service to manage application data.
 * It provides performant in-memory access and atomic writes to localStorage,
 * preventing race conditions and ensuring data integrity.
 */
export const dataCache = {
    /**
     * Retrieves data for a given key. Reads from memory if available,
     * otherwise initializes from localStorage or a static file.
     * @returns A deep copy of the data to prevent direct mutation of the cache.
     */
    async get<T>(storageKey: string, staticPath: string): Promise<T[]> {
        if (!cache.has(storageKey)) {
            await initializeCache<T>(storageKey, staticPath);
        }
        // Return a deep copy to ensure cache immutability from the outside.
        return JSON.parse(JSON.stringify(cache.get(storageKey)));
    },

    /**
     * Overwrites the data for a given key in both memory and localStorage.
     * Dispatches an event to notify the UI of the change.
     */
    set<T>(storageKey: string, data: T[]): void {
        // Keep the full, live data in the in-memory cache for the current session.
        cache.set(storageKey, data);
        try {
            // Prepare a storage-safe version of the data to prevent quota errors.
            const dataForStorage = prepareForStorage(storageKey, data);
            localStorage.setItem(`divya-darshan-${storageKey}`, JSON.stringify(dataForStorage));
            window.dispatchEvent(new CustomEvent(DATA_UPDATED_EVENT, { detail: { key: storageKey } }));
        } catch (error) {
            console.error(`Failed to save ${storageKey} to localStorage`, error);
            if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                throw new Error('Storage limit exceeded. Could not save changes. Please try reducing image sizes or clearing browser data.');
            }
            throw new Error(`An error occurred while saving data: ${(error as Error).message}`);
        }
    },
};
