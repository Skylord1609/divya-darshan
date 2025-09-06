import { Temple, Pooja, Yatra, User, AdminTemple, Book, NearbyTemple, Testimonial, ActivityLogItem, Booking, DarshanTier, MajorEvent, Pandit, DonationOption, BookContent, CrowdLevel, Festival, TempleSubmissionData, SearchResults, Role, DarshanBookingDetails, PoojaBookingDetails, SpiritualGrowthData, LifetimeStats, DailyTask, TaskType, FeedItem, UserPreferences, YatraTier, YatraBookingDetails, Language, CustomYatraBookingDetails, YatraQuoteRequest, ChatRoom, ChatMessage, SearchFilters, Post } from '../types';
import { TESTIMONIALS_DATA } from '../constants';
import { calculateDistance, fuzzySearch } from '../utils/geolocation';
import { dataCache, DATA_UPDATED_EVENT } from './dataCache';
import { parseDurationToMinutes } from '../utils/bookingUtils';
import { explainScripture as explainScriptureAI } from './aiService';

export { DATA_UPDATED_EVENT }; // Re-export for components that use it


// --- Internationalization Helper ---

/**
 * Fetches base data and merges it with language-specific translations.
 * @param key The base key for the data (e.g., 'temples').
 * @param language The target language.
 * @returns A promise that resolves to the merged, translated data.
 */
async function fetchAndMerge<T extends { id: number }>(
    key: string,
    language: Language
): Promise<T[]> {
    // The base data (English) is fetched through the cache for performance.
    const baseData = await dataCache.get<T>(key, `/data/${key}.json`);

    if (language === Language.EN) {
        return baseData;
    }

    try {
        const response = await fetch(`/data/${key}.${language}.json`);
        if (!response.ok) {
            console.warn(`Translation file for '${key}' in language '${language}' not found. Falling back to English.`);
            return baseData;
        }
        
        const langData = await response.json();
        // Create a map for efficient lookups of translations.
        const langMap = new Map(langData.map((item: T) => [item.id, item]));

        // Merge base data with translations.
        return baseData.map(item => {
            const translation = langMap.get(item.id);
            // Use Object.assign to handle potential generic type issues with spread operator in some compilers
            return translation ? Object.assign({}, item, translation) : item;
        });
    } catch (e) {
        console.warn(`Failed to load or parse translation for '${key}' in '${language}'. Falling back to English.`, e);
        return baseData;
    }
}


// --- API Functions ---

export const getTemples = (language: Language): Promise<Temple[]> => fetchAndMerge<Temple>('temples', language);
export const getPoojas = (language: Language): Promise<Pooja[]> => fetchAndMerge<Pooja>('poojas', language);
export const getYatras = (language: Language): Promise<Yatra[]> => fetchAndMerge<Yatra>('yatras', language);
export const getBooks = (language: Language): Promise<Book[]> => fetchAndMerge<Book>('books', language);
export const getMajorEvents = (language: Language): Promise<MajorEvent[]> => fetchAndMerge<MajorEvent>('events', language);
export const getFestivals = (language: Language): Promise<Festival[]> => fetchAndMerge<Festival>('festivals', language);
export const getPandits = (language: Language, eventId?: number): Promise<Pandit[]> => {
    return fetchAndMerge<Pandit>('pandits', language).then(pandits => {
        if (eventId) {
            return pandits.filter(p => p.eventId === eventId);
        }
        return pandits;
    });
};
export const getPendingTemples = (): Promise<AdminTemple[]> => dataCache.get('pending_temples', '/data/pending_temples.json');
export const getPendingPandits = (): Promise<Pandit[]> => dataCache.get('pending_pandits', '/data/pending_pandits.json');

export const getUsersList = async (): Promise<User[]> => {
    const usersWithHashes = await dataCache.get<any>('users', '/data/users.json');
    // Security Fix: Never send password hashes to the client.
    return usersWithHashes.map((user: any) => {
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    });
};
export const getActivityLog = (): Promise<ActivityLogItem[]> => {
    return dataCache.get<ActivityLogItem>('activity_log', '/data/activity_log.json').then(logs => 
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    );
};
export const getBookings = (): Promise<Booking[]> => dataCache.get('bookings', '/data/bookings.json');

export const getUserBookings = (userId: number): Promise<Booking[]> => {
    return dataCache.get<Booking>('bookings', '/data/bookings.json').then(bookings =>
        bookings.filter(b => b.userId === userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    );
};

export const getPoojasByTempleId = async (templeId: number, language: Language): Promise<Pooja[]> => {
    const allPoojas = await getPoojas(language);
    return allPoojas.filter(pooja => pooja.templeIds?.includes(templeId));
};

export const getTemplesByPoojaId = async (poojaId: number, language: Language): Promise<Temple[]> => {
    const [allTemples, allPoojas] = await Promise.all([getTemples(language), getPoojas(language)]);
    const pooja = allPoojas.find(p => p.id === poojaId);
    if (!pooja || !pooja.templeIds) return [];
    return allTemples.filter(temple => pooja.templeIds?.includes(temple.id));
};

export const getBookContent = async (contentKey: string): Promise<BookContent> => {
    const response = await fetch(`/data/book-content/${contentKey}.json`);
    if (!response.ok) throw new Error("Failed to fetch book content.");
    return response.json();
};

export const getTempleById = async (id: number, language: Language): Promise<Temple | undefined> => {
    const temples = await getTemples(language);
    return temples.find(t => t.id === id);
};

export const getEventById = async (id: number, language: Language): Promise<MajorEvent | undefined> => {
    const events = await getMajorEvents(language);
    return events.find(e => e.id === id);
};

export const getBookByContentKey = async (contentKey: string, language: Language): Promise<Book | undefined> => {
    const books = await getBooks(language);
    return books.find(b => b.contentKey === contentKey);
};

export const getNearbyTemples = async (templeId: number, userLat: number, userLng: number, language: Language): Promise<Temple[]> => {
    const allTemples = await getTemples(language);
    const otherTemples = allTemples.filter(t => t.id !== templeId);

    return otherTemples
        .map(t => ({
            ...t,
            distance: calculateDistance(userLat, userLng, t.lat, t.lng)
        }))
        .sort((a, b) => a.distance - b.distance);
};

export const getTestimonials = (): Promise<Testimonial[]> => {
    return new Promise(resolve => setTimeout(() => resolve(TESTIMONIALS_DATA), 500));
};

export const searchAll = async (
    query: string, 
    language: Language,
    filters: SearchFilters,
    userLocation: { lat: number, lng: number } | null
): Promise<SearchResults> => {
    const [allTemples, allBooks, allEvents] = await Promise.all([
        getTemples(language), 
        getBooks(language), 
        getMajorEvents(language)
    ]);

    // --- Advanced Temple Search ---
    let templeResults: Temple[];

    if (query) {
        const maxDistance = query.length < 5 ? 1 : 2;
        const fuzzyResults = fuzzySearch(allTemples, query, ['name', 'location'], maxDistance);
        templeResults = fuzzyResults.map(r => r.item);
    } else {
        templeResults = allTemples;
    }
    
    // Apply filters
    if (filters.crowd.length > 0) {
        templeResults = templeResults.filter(t => filters.crowd.includes(t.crowdLevel));
    }
    if (filters.deity.length > 0) {
        templeResults = templeResults.filter(t => filters.deity.includes(t.deity));
    }
    if (userLocation && filters.distance > 0) {
        templeResults = templeResults
            .map(t => ({...t, distance: calculateDistance(userLocation.lat, userLocation.lng, t.lat, t.lng)}))
            .filter(t => t.distance! <= filters.distance)
            .sort((a, b) => a.distance! - b.distance!);
    }

    // --- Standard Search for others ---
    const lowerCaseQuery = query.toLowerCase();
    const filteredBooks = allBooks.filter(b => b.name.toLowerCase().includes(lowerCaseQuery) || b.description.toLowerCase().includes(lowerCaseQuery));
    const filteredEvents = allEvents.filter(e => e.name.toLowerCase().includes(lowerCaseQuery) || e.location.toLowerCase().includes(lowerCaseQuery) || e.description.toLowerCase().includes(lowerCaseQuery));
    
    return { temples: templeResults, books: filteredBooks, events: filteredEvents };
};

export const findClosestAlternative = (userCoords: { latitude: number; longitude: number }, currentTempleId: number, allTemples: Temple[]): Temple | null => {
    const alternatives = allTemples
        .filter(t => t.id !== currentTempleId && (t.crowdLevel === 'Low' || t.crowdLevel === 'Medium'))
        .map(t => ({ ...t, distance: calculateDistance(userCoords.latitude, userCoords.longitude, t.lat, t.lng) }))
        .sort((a, b) => a.distance - b.distance);
    return alternatives.length > 0 ? alternatives[0] : null;
};

// --- SIMULATED DATA FOR CALENDAR ---
export const getTempleAvailability = async (templeId: number): Promise<Map<string, CrowdLevel>> => {
    // This is a simulation. In a real app, this would be a network request.
    return new Promise(resolve => {
        const availability = new Map<string, CrowdLevel>();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 60; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            const dayOfWeek = date.getDay();

            // Simulate higher crowds on weekends
            if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
                 availability.set(dateString, Math.random() > 0.4 ? 'High' : 'Medium');
            } else {
                 const rand = Math.random();
                 if (rand < 0.6) availability.set(dateString, 'Low');
                 else if (rand < 0.9) availability.set(dateString, 'Medium');
                 else availability.set(dateString, 'High');
            }
        }
        // Simulate a very high crowd day for demonstration
        const highCrowdDay = new Date(today);
        highCrowdDay.setDate(today.getDate() + 10);
        availability.set(highCrowdDay.toISOString().split('T')[0], 'Very High');

        setTimeout(() => resolve(availability), 500); // Simulate network latency
    });
};

export const getYatraAvailability = async (yatraId: number): Promise<Date[]> => {
    return new Promise(resolve => {
        const dates: Date[] = [];
        const today = new Date();
        for (let i = 0; i < 3; i++) {
            // First of the month
            dates.push(new Date(today.getFullYear(), today.getMonth() + i + 1, 1));
            // 15th of the month
            dates.push(new Date(today.getFullYear(), today.getMonth() + i + 1, 15));
        }
        setTimeout(() => resolve(dates), 300); // Simulate network
    });
};

// --- Spiritual Growth Tracker ---
const XP_PER_TASK = 50;
const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 4000, 8000, 15000]; // XP required for each level

const getLevelFromXp = (xp: number) => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_THRESHOLDS[i]) {
            return i + 1;
        }
    }
    return 1;
};

const getSpiritualGrowthTemplate = (userId: number): SpiritualGrowthData => ({
    userId,
    xp: 0,
    level: 1,
    xpForNextLevel: LEVEL_THRESHOLDS[1],
    xpForCurrentLevel: LEVEL_THRESHOLDS[0],
    streak: 0,
    dailyTasks: [
        { type: 'meditate', isCompleted: false },
        { type: 'seva', isCompleted: false },
        { type: 'shloka', isCompleted: false },
        { type: 'darshan', isCompleted: false },
        { type: 'chant', isCompleted: false },
    ],
    lastUpdate: new Date().toISOString().split('T')[0],
});

export const getSpiritualGrowth = async (userId: number): Promise<SpiritualGrowthData> => {
    const allGrowthData = await dataCache.get<any>('spiritual_growth', '/data/spiritual_growth.json');
    let userData = allGrowthData.find(d => d.userId === userId);

    if (!userData) {
        return getSpiritualGrowthTemplate(userId);
    }
    
    const todayStr = new Date().toISOString().split('T')[0];
    
    // If last update was not today, reset daily tasks.
    if (userData.lastUpdate !== todayStr) {
        userData.dailyTasks = getSpiritualGrowthTemplate(userId).dailyTasks;
        userData.lastUpdate = todayStr;
        dataCache.set('spiritual_growth', allGrowthData); // Persist the reset
    }
    
    // Ensure dailyTasks array exists for backward compatibility
    if (!userData.dailyTasks) {
        userData.dailyTasks = getSpiritualGrowthTemplate(userId).dailyTasks;
    }
    
    const level = getLevelFromXp(userData.xp);
    return {
        userId: userData.userId,
        xp: userData.xp,
        streak: userData.streak,
        level,
        xpForCurrentLevel: LEVEL_THRESHOLDS[level - 1],
        xpForNextLevel: LEVEL_THRESHOLDS[level] || userData.xp,
        dailyTasks: userData.dailyTasks,
    };
};

export const logActivity = async (
    type: ActivityLogItem['type'],
    message: string,
    user: User | null
): Promise<void> => {
    const activityLog = await dataCache.get<ActivityLogItem>('activity_log', '/data/activity_log.json');
    const newLog: ActivityLogItem = {
        id: Date.now(),
        type,
        message,
        user: user ? { id: user.id, name: user.name } : null,
        timestamp: new Date().toISOString()
    };
    activityLog.unshift(newLog); // Add to the beginning
    dataCache.set('activity_log', activityLog.slice(0, 100)); // Keep last 100 entries
};

// --- MOCK USER ACTIONS (Implementations for App.tsx) ---

const createBooking = (
    type: Booking['type'],
    user: User,
    itemId: number | string,
    itemName: string,
    cost: number,
    details: any,
    itemContext?: string,
    durationMinutes?: number,
): Booking => ({
    id: Date.now(),
    type,
    userId: user.id,
    itemId,
    itemName,
    itemContext,
    cost,
    timestamp: new Date().toISOString(),
    bookingDate: details.date?.toISOString().split('T')[0],
    timeSlot: details.timeSlot,
    numberOfPersons: details.numberOfPersons,
    durationMinutes
});

export const bookDarshan = async (temple: Temple, details: DarshanBookingDetails, user: User): Promise<{ message: string }> => {
    const bookings = await dataCache.get<Booking>('bookings', '/data/bookings.json');
    const newBooking = createBooking('darshan', user, temple.id, temple.name, details.tier.cost, details);
    bookings.push(newBooking);
    dataCache.set('bookings', bookings);
    await logActivity('booking', `Booked ${details.tier.name} at ${temple.name} for ₹${details.tier.cost}.`, user);
    return { message: `Darshan at ${temple.name} booked successfully!` };
};

export const bookPooja = async (details: PoojaBookingDetails, user: User): Promise<{ message: string }> => {
    const bookings = await dataCache.get<Booking>('bookings', '/data/bookings.json');
    const totalCost = details.pooja.cost + (details.pandit?.cost || 0);
    const durationMinutes = parseDurationToMinutes(details.pooja.duration);
    const newBooking = createBooking('pooja', user, details.pooja.id, details.pooja.name, totalCost, details, details.temple?.name, durationMinutes);
    
    if (details.address) {
        newBooking.address = details.address;
    }

    if (details.pandit) {
        newBooking.panditId = details.pandit.id;
        newBooking.panditName = details.pandit.name;
    }

    bookings.push(newBooking);
    dataCache.set('bookings', bookings);

    let logMessage = `Booked ${details.pooja.name}`;
    if (details.serviceType === 'Offline' && details.address) {
        logMessage += ` at user's location`;
    } else if (details.temple) {
        logMessage += ` at ${details.temple.name}`;
    }
    logMessage += ` for ₹${totalCost}.`;

    if (details.pandit) {
        logMessage += ` with Pandit ${details.pandit.name}.`;
    }
    
    await logActivity('booking', logMessage, user);
    
    return { message: `Pooja '${details.pooja.name}' booked successfully!` };
};


export const bookYatra = async (details: YatraBookingDetails, user: User): Promise<{ message: string }> => {
    const bookings = await dataCache.get<Booking>('bookings', '/data/bookings.json');
    const cost = details.tier.cost * details.numberOfPersons;
    const newBooking = createBooking('yatra', user, details.yatra.id, details.yatra.name, cost, details, details.tier.name);
    bookings.push(newBooking);
    dataCache.set('bookings', bookings);
    await logActivity('booking', `Booked ${details.yatra.name} (${details.tier.name}) for ${details.numberOfPersons} person(s).`, user);
    return { message: `Yatra '${details.yatra.name}' booked successfully!` };
};

export const submitYatraQuoteRequest = async (details: YatraQuoteRequest, user: User): Promise<{ message: string }> => {
    const quotes = await dataCache.get<YatraQuoteRequest>('yatra_quotes', '/data/yatra_quotes.json');
    quotes.push(details);
    dataCache.set('yatra_quotes', quotes);
    await logActivity('submission', `Submitted a custom yatra quote request.`, user);
    return { message: 'Your custom yatra plan has been submitted! Our partners will contact you shortly.' };
};

export const bookPandit = async (pandit: Pandit, contextItem: { name: string }, user: User, details: { date: Date, timeSlot: string }): Promise<{ message: string }> => {
    const bookings = await dataCache.get<Booking>('bookings', '/data/bookings.json');
    const newBooking = createBooking('pandit', user, pandit.id, pandit.name, pandit.cost, details, contextItem.name, 60); // Assume 1 hour for misc pandit booking
    bookings.push(newBooking);
    dataCache.set('bookings', bookings);
    await logActivity('booking', `Booked Pandit ${pandit.name} for ${contextItem.name}.`, user);
    return { message: `Pandit ${pandit.name} booked successfully for ${contextItem.name}!` };
};

export const makeDonation = async (amount: number, purpose: DonationOption, user: User, temple?: Temple): Promise<{ message: string }> => {
    const bookings = await dataCache.get<Booking>('bookings', '/data/bookings.json');
    const newDonation = createBooking('donation', user, purpose.id, purpose.title, amount, {}, temple?.name);
    bookings.push(newDonation);
    dataCache.set('bookings', bookings);
    const logMessage = temple
        ? `Donated ₹${amount} to ${temple.name} for '${purpose.title}'.`
        : `Donated ₹${amount} for '${purpose.title}'.`;
    await logActivity('donation', logMessage, user);
    return { message: 'Thank you for your generous donation!' };
};

export const submitTemple = async (templeData: TempleSubmissionData, user: User): Promise<{ message: string }> => {
    const pendingTemples = await dataCache.get<AdminTemple>('pending_temples', '/data/pending_temples.json');
    const newSubmission: AdminTemple = {
        ...templeData,
        id: Date.now(),
        lat: 0,
        lng: 0,
        crowdLevel: 'Medium',
        deity: 'Unknown',
        submittedBy: user.email,
        status: 'pending',
        estimatedCost: 0,
        estimatedDays: 0,
    };
    pendingTemples.push(newSubmission);
    dataCache.set('pending_temples', pendingTemples);
    await logActivity('submission', `Submitted new temple for review: ${templeData.name}.`, user);
    return { message: 'Temple submitted for review. Thank you for your contribution!' };
};

export const updatePoojaAssociationsForTemple = async (templeId: number, selectedPoojaIds: number[], token: string): Promise<{ message: string }> => {
    // This is a complex operation in a real DB. Here we simulate it.
    const poojas = await dataCache.get<Pooja>('poojas', '/data/poojas.json');
    poojas.forEach(pooja => {
        const isSelected = selectedPoojaIds.includes(pooja.id);
        const isAssociated = pooja.templeIds?.includes(templeId);

        if (isSelected && !isAssociated) {
            pooja.templeIds = [...(pooja.templeIds || []), templeId];
        } else if (!isSelected && isAssociated) {
            pooja.templeIds = pooja.templeIds?.filter(id => id !== templeId);
        }
    });
    dataCache.set('poojas', poojas);
    await logActivity('update', `Updated pooja associations for temple ID ${templeId}.`, null);
    return { message: 'Pooja associations updated successfully!' };
};

export const checkAndResetStreak = async (userId: number): Promise<SpiritualGrowthData> => {
    // Simplified: In a real app, this would be more robust.
    return getSpiritualGrowth(userId);
};

export const completeSpiritualTask = async (userId: number, taskType: TaskType): Promise<SpiritualGrowthData> => {
    const allGrowthData = await dataCache.get<any>('spiritual_growth', '/data/spiritual_growth.json');
    let userData = allGrowthData.find(d => d.userId === userId);

    if (!userData) {
        userData = getSpiritualGrowthTemplate(userId);
        allGrowthData.push(userData);
    }

    // Ensure data is fresh (tasks reset for new day)
    const freshGrowthData = await getSpiritualGrowth(userId);
    userData = allGrowthData.find(d => d.userId === userId)!; // Re-find after getSpiritualGrowth might have mutated it
    
    const task = userData.dailyTasks.find((t: DailyTask) => t.type === taskType);

    if (task && !task.isCompleted) {
        task.isCompleted = true;
        const xpGain = taskType === 'chant' ? 108 : XP_PER_TASK;
        userData.xp += xpGain;
        dataCache.set('spiritual_growth', allGrowthData);
    }
    
    return getSpiritualGrowth(userId);
};

export const loginUser = async (email: string, pass: string): Promise<{ user: User }> => {
    const users = await dataCache.get<any>('users', '/data/users.json');
    const user = users.find(u => u.email === email && u.passwordHash === `hashed_${pass}`);
    if (!user) {
        throw new Error("Invalid credentials");
    }
    const { passwordHash, ...userClientData } = user;
    const userWithToken = { ...userClientData, token: `mock-token-${Date.now()}` };
    await logActivity('login', `User '${user.name}' logged in.`, userWithToken);
    return { user: userWithToken };
};

export const registerUser = async (name: string, email: string, pass: string): Promise<{ user: User }> => {
    const users = await dataCache.get<any>('users', '/data/users.json');
    if (users.some(u => u.email === email)) {
        throw new Error("User with this email already exists");
    }
    const newUser: User = {
        id: Date.now(),
        email,
        name,
        role: 'devotee',
        avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
        bio: 'A new seeker on the path of Dharma.',
        followers: [],
        following: []
    };
    const newUserWithPass = { ...newUser, passwordHash: `hashed_${pass}`};
    
    users.push(newUserWithPass);
    dataCache.set('users', users);
    
    const userWithToken = { ...newUser, token: `mock-token-${Date.now()}` };
    await logActivity('addition', `New user registered: ${name}.`, userWithToken);
    return { user: userWithToken };
};

export const loginWithProvider = async (provider: 'google' | 'facebook'): Promise<{ user: User }> => {
    // This is a simulation
    const mockEmail = `${provider}user@darshan.com`;
    const users = await dataCache.get<any>('users', '/data/users.json');
    let user = users.find(u => u.email === mockEmail);
    if (!user) {
        user = {
            id: Date.now(),
            email: mockEmail,
            name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
            role: 'devotee',
            passwordHash: 'social_login',
            avatarUrl: `https://i.pravatar.cc/150?u=${mockEmail}`,
            bio: 'A new seeker on the path of Dharma.',
            followers: [],
            following: []
        };
        users.push(user);
        dataCache.set('users', users);
    }
    const { passwordHash, ...userClientData } = user;
    const userWithToken = { ...userClientData, token: `mock-token-${Date.now()}` };
    await logActivity('login', `User '${user.name}' logged in via ${provider}.`, userWithToken);
    return { user: userWithToken };
};

export const updateUserProfile = async (userId: number, updates: Partial<User>, token: string): Promise<{ user: User }> => {
    const users = await dataCache.get<User>('users', '/data/users.json');
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");
    
    users[userIndex] = { ...users[userIndex], ...updates };
    dataCache.set('users', users);
    
    await logActivity('update', `User profile updated for ${users[userIndex].name}.`, users[userIndex]);
    const { token: oldToken, ...userWithoutToken } = users[userIndex];
    const userWithNewToken = { ...userWithoutToken, token };
    return { user: userWithNewToken };
};

const cascadeDeleteUserData = async (userId: number) => {
    // 1. Delete posts
    let posts = await dataCache.get<Post>('posts', '/data/posts.json');
    posts = posts.filter(p => p.userId !== userId);
    dataCache.set('posts', posts);
    
    // 2. Delete chat messages
    let messages = await dataCache.get<ChatMessage>('chat_messages', '/data/chat_messages.json');
    messages = messages.filter(m => m.userId !== userId);
    dataCache.set('chat_messages', messages);
    
    // 3. Delete user preferences
    let prefs = await dataCache.get<UserPreferences>('user_preferences', '/data/user_preferences.json');
    prefs = prefs.filter(p => p.userId !== userId);
    dataCache.set('user_preferences', prefs);

    // 4. Delete bookings
    let bookings = await dataCache.get<Booking>('bookings', '/data/bookings.json');
    bookings = bookings.filter(b => b.userId !== userId);
    dataCache.set('bookings', bookings);

    // 5. Remove from other users' follower/following lists
    let users = await dataCache.get<User>('users', '/data/users.json');
    users.forEach(user => {
        user.followers = user.followers.filter(id => id !== userId);
        user.following = user.following.filter(id => id !== userId);
    });
    // The user list will be updated and saved by the calling function.
    return users;
};

export const deleteUser = async (userId: number, token: string): Promise<{ message: string }> => {
    let users = await dataCache.get<User>('users', '/data/users.json');
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) throw new Error("User not found");
    
    users = await cascadeDeleteUserData(userId);

    // Finally, delete the user themselves
    users = users.filter(u => u.id !== userId);
    dataCache.set('users', users);

    await logActivity('deletion', `User account deleted for ${userToDelete.name}.`, userToDelete);
    return { message: "Account deleted successfully." };
};

export const getLifetimeStats = async (userId: number): Promise<LifetimeStats> => {
    const bookings = await getUserBookings(userId);
    const growthData = await getSpiritualGrowth(userId); 
    const completedTasks = growthData.dailyTasks.filter(t => t.isCompleted).length;
    return {
        templesVisited: new Set(bookings.filter(b => b.type === 'darshan' || b.type === 'yatra').map(b => b.itemId)).size,
        poojasBooked: bookings.filter(b => b.type === 'pooja').length,
        sevaOffered: bookings.filter(b => b.type === 'donation').length,
        knowledgeRead: Math.floor((growthData.xp - (completedTasks * XP_PER_TASK)) / 10) // Mock logic: XP from non-task sources
    };
};

// --- Personalized Feed ---

export const getDiscoverFeed = async (language: Language): Promise<FeedItem[]> => {
    const [temples, poojas, books, events] = await Promise.all([
        getTemples(language),
        getPoojas(language),
        getBooks(language),
        getMajorEvents(language),
    ]);
    const feed: FeedItem[] = [];
    if (temples.length > 0) feed.push({ type: 'temple', reason: "Popular Temple", item: temples[0] });
    if (poojas.length > 0) feed.push({ type: 'pooja', reason: "Recommended Pooja", item: poojas[0] });
    const gita = books.find(b => b.contentKey === 'bhagavad_gita');
    if (gita) feed.push({ type: 'book', reason: "Featured Scripture", item: gita });
    if (events.length > 0) feed.push({ type: 'event', reason: "Upcoming Festival", item: events[0] });
    return feed.slice(0, 5);
};

export const getPersonalizedFeed = async (user: User, language: Language): Promise<FeedItem[]> => {
    const bookings = await getUserBookings(user.id);
    const lastPoojaBooking = bookings.find(b => b.type === 'pooja');
    const lastTempleVisit = bookings.find(b => b.type === 'darshan');
    
    const [allTemples, allPoojas] = await Promise.all([
        getTemples(language),
        getPoojas(language),
    ]);

    const feed: FeedItem[] = [];
    
    if (lastPoojaBooking) {
        const poojaDetails = allPoojas.find(p => p.id === lastPoojaBooking.itemId);
        if(poojaDetails) {
            const relatedTempleId = poojaDetails.templeIds?.[0];
            const relatedTemple = allTemples.find(t => t.id === relatedTempleId && t.id !== lastTempleVisit?.itemId);
            if(relatedTemple) feed.push({ type: 'temple', reason: `Because you performed ${poojaDetails.name}`, item: relatedTemple });
        }
    }

    if (lastTempleVisit) {
        const templeDetails = allTemples.find(t => t.id === lastTempleVisit.itemId);
        if (templeDetails) {
             const relatedPooja = allPoojas.find(p => p.templeIds?.includes(templeDetails.id) && p.id !== lastPoojaBooking?.itemId);
             if(relatedPooja) feed.push({ type: 'pooja', reason: `Because you visited ${templeDetails.name}`, item: relatedPooja });
        }
    }
    
    const discoverFeed = await getDiscoverFeed(language);
    
    return [...feed, ...discoverFeed].filter((item, index, self) => 
        index === self.findIndex((t) => (t.item.id === item.item.id && t.type === item.type))
    ).slice(0, 5);
};


// --- User Preferences ---
export const getUserPreferences = async (userId: number): Promise<UserPreferences['preferences']> => {
    const allPrefs = await dataCache.get<UserPreferences>('user_preferences', '/data/user_preferences.json');
    const userPrefs = allPrefs.find(p => p.userId === userId);
    return userPrefs ? userPrefs.preferences : {};
};

export const updateUserChantImage = async (userId: number, chantId: number, imageData: string): Promise<UserPreferences> => {
    const allPrefs = await dataCache.get<UserPreferences>('user_preferences', '/data/user_preferences.json');
    let userPrefs = allPrefs.find(p => p.userId === userId);
    if (!userPrefs) {
        userPrefs = { userId, preferences: {} };
        allPrefs.push(userPrefs);
    }
    if (!userPrefs.preferences.chantImages) {
        userPrefs.preferences.chantImages = {};
    }
    userPrefs.preferences.chantImages[chantId] = imageData;
    dataCache.set('user_preferences', allPrefs);
    return userPrefs;
};

// --- MOCK ADMIN ACTIONS ---
const genericAddItem = async <T extends {id: number, name: string}>(key: string, path: string, itemData: Partial<T>, user: User | null, logMessage: string): Promise<{ message: string }> => {
    const items = await dataCache.get<T>(key, path);
    const newItem = { ...itemData, id: Date.now() } as T;
    items.push(newItem);
    dataCache.set(key, items);
    await logActivity('addition', `${logMessage} added: "${itemData.name}".`, user);
    return { message: `${logMessage} added successfully.` };
};

const genericUpdateItem = async <T extends {id: number, name: string}>(key: string, path: string, itemData: Partial<T> & {id: number}, user: User | null, logMessage: string): Promise<{ message: string }> => {
    const items = await dataCache.get<T>(key, path);
    const index = items.findIndex(i => i.id === itemData.id);
    if (index === -1) throw new Error("Item not found");
    items[index] = { ...items[index], ...itemData };
    dataCache.set(key, items);
    await logActivity('update', `${logMessage} updated: "${itemData.name}".`, user);
    return { message: `${logMessage} updated successfully.` };
};

const genericDeleteItem = async <T extends {id: number}>(key: string, path: string, itemId: number, user: User | null, logMessage: string): Promise<{ message: string }> => {
    let items = await dataCache.get<T>(key, path);
    const itemToDelete = items.find(i => i.id === itemId);
    if (!itemToDelete) throw new Error("Item not found to delete");
    items = items.filter(i => i.id !== itemId);
    dataCache.set(key, items);
    await logActivity('deletion', `${logMessage} deleted (ID: ${itemId}).`, user);
    return { message: `${logMessage} deleted successfully.` };
};

// Pooja CRUD
export const addPooja = (data: Partial<Pooja>, token: string) => genericAddItem('poojas', '/data/poojas.json', data, null, 'Pooja');
export const updatePooja = (data: Partial<Pooja> & {id: number}, token: string) => genericUpdateItem('poojas', '/data/poojas.json', data, null, 'Pooja');
export const deletePooja = (id: number, token: string) => genericDeleteItem('poojas', '/data/poojas.json', id, null, 'Pooja');

// Yatra CRUD
export const addYatra = (data: Partial<Yatra>, token: string) => genericAddItem('yatras', '/data/yatras.json', data, null, 'Yatra');
export const updateYatra = (data: Partial<Yatra> & {id: number}, token: string) => genericUpdateItem('yatras', '/data/yatras.json', data, null, 'Yatra');
export const deleteYatra = (id: number, token: string) => genericDeleteItem('yatras', '/data/yatras.json', id, null, 'Yatra');

// Book CRUD
export const addBook = (data: Partial<Book>, token: string) => genericAddItem('books', '/data/books.json', data, null, 'Book');
export const updateBook = (data: Partial<Book> & {id: number}, token: string) => genericUpdateItem('books', '/data/books.json', data, null, 'Book');
export const deleteBook = (id: number, token: string) => genericDeleteItem('books', '/data/books.json', id, null, 'Book');

// Festival CRUD
export const addFestival = (data: Partial<Festival>, token: string) => genericAddItem('festivals', '/data/festivals.json', data, null, 'Festival');
export const updateFestival = (data: Partial<Festival> & {id: number}, token: string) => genericUpdateItem('festivals', '/data/festivals.json', data, null, 'Festival');
export const deleteFestival = (id: number, token: string) => genericDeleteItem('festivals', '/data/festivals.json', id, null, 'Festival');

// Event CRUD
export const addEvent = (data: Partial<MajorEvent>, token: string) => genericAddItem('events', '/data/events.json', data, null, 'Event');
export const updateEvent = (data: Partial<MajorEvent> & {id: number}, token: string) => genericUpdateItem('events', '/data/events.json', data, null, 'Event');
export const deleteEvent = async (id: number, token: string) => {
    // Cascade delete: remove pandits associated with this event
    let pandits = await dataCache.get<Pandit>('pandits', '/data/pandits.json');
    pandits = pandits.filter(p => p.eventId !== id);
    dataCache.set('pandits', pandits);
    return genericDeleteItem('events', '/data/events.json', id, null, 'Event');
}

// Pandit CRUD
export const addPandit = (data: Partial<Pandit>, token: string) => genericAddItem('pandits', '/data/pandits.json', data, null, 'Pandit');
export const updatePandit = (data: Partial<Pandit> & {id: number}, token: string) => genericUpdateItem('pandits', '/data/pandits.json', data, null, 'Pandit');
export const deletePandit = (id: number, token: string) => genericDeleteItem('pandits', '/data/pandits.json', id, null, 'Pandit');
export const getPanditCountForEvent = async (eventId: number): Promise<number> => {
    const pandits = await getPandits(Language.EN, eventId);
    return pandits.length;
}

// Temple Actions
export const updateTemple = (id: number, data: Partial<Temple>, token: string) => genericUpdateItem('temples', '/data/temples.json', {...data, id}, null, 'Temple');
export const addTempleDirectly = (data: Partial<Temple>, token: string) => genericAddItem('temples', '/data/temples.json', data, null, 'Temple');
export const deleteTemple = (id: number, token: string) => genericDeleteItem('temples', '/data/temples.json', id, null, 'Temple');

// Other Admin Actions
export const processTempleSubmission = async (templeId: number, status: 'approved' | 'rejected', token: string): Promise<{ message: string }> => {
    let pending = await dataCache.get<AdminTemple>('pending_temples', '/data/pending_temples.json');
    const submission = pending.find(t => t.id === templeId);
    if (!submission) throw new Error("Submission not found");

    pending = pending.filter(t => t.id !== templeId);
    dataCache.set('pending_temples', pending);

    if (status === 'approved') {
        const temples = await dataCache.get<Temple>('temples', '/data/temples.json');
        const { submittedBy, status, ...newTemple } = submission;
        temples.push(newTemple as Temple);
        dataCache.set('temples', temples);
        await logActivity('approval', `Temple submission '${submission.name}' approved.`, null);
        return { message: "Temple approved and added to the list." };
    } else {
        await logActivity('rejection', `Temple submission '${submission.name}' rejected.`, null);
        return { message: "Temple submission rejected." };
    }
};

export const updateTempleCrowdLevel = async (templeId: number, newLevel: CrowdLevel, token: string): Promise<{ message: string }> => {
    const temples = await dataCache.get<Temple>('temples', '/data/temples.json');
    const index = temples.findIndex(t => t.id === templeId);
    if (index === -1) throw new Error("Temple not found");
    temples[index].crowdLevel = newLevel;
    dataCache.set('temples', temples);
    await logActivity('update', `Crowd level for ${temples[index].name} set to ${newLevel}.`, null);
    return { message: `Crowd level for ${temples[index].name} updated.` };
};

export const getAdminStats = async (token: string): Promise<any> => {
    const [users, poojas, bookings, festivals, yatras, books, pandits, events] = await Promise.all([
        getUsersList(),
        getPoojas(Language.EN),
        dataCache.get('bookings', '/data/bookings.json'),
        getFestivals(Language.EN),
        getYatras(Language.EN),
        getBooks(Language.EN),
        getPandits(Language.EN),
        getMajorEvents(Language.EN)
    ]);
    return {
        users: users.length,
        poojas: poojas.length,
        bookings: bookings.length,
        festivals: festivals.length,
        yatras: yatras.length,
        books: books.length,
        pandits: pandits.length,
        events: events.length
    };
};

export const updateUserRole = async (userId: number, role: Role, token: string): Promise<{ message: string }> => {
    const users = await dataCache.get<User>('users', '/data/users.json');
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error("User not found");
    users[index].role = role;
    dataCache.set('users', users);
    await logActivity('update', `Role for ${users[index].name} updated to ${role}.`, null);
    return { message: "User role updated." };
};

export const deleteUserByAdmin = async (userId: number, token: string): Promise<{ message: string }> => {
    let users = await dataCache.get<User>('users', '/data/users.json');
    const user = users.find(u => u.id === userId);
    if(!user) throw new Error("User not found");
    
    users = await cascadeDeleteUserData(userId);
    
    // Finally, delete the user themselves
    users = users.filter(u => u.id !== userId);
    dataCache.set('users', users);

    await logActivity('deletion', `Admin deleted user: ${user.name}.`, null);
    return { message: `User ${user.name} deleted.` };
};

// Satsang / Community Hub
export const getChatRooms = (): Promise<ChatRoom[]> => dataCache.get('chat_rooms', '/data/chat_rooms.json');
export const getChatMessages = async (roomId: number): Promise<ChatMessage[]> => {
    const allMessages = await dataCache.get<ChatMessage>('chat_messages', '/data/chat_messages.json');
    return allMessages.filter(m => m.roomId === roomId);
};

export const postChatMessage = async (roomId: number, text: string, user: User): Promise<ChatMessage> => {
    const allMessages = await dataCache.get<ChatMessage>('chat_messages', '/data/chat_messages.json');
    const newMessage: ChatMessage = {
        id: Date.now(),
        roomId,
        userId: user.id,
        userName: user.name,
        timestamp: new Date().toISOString(),
        text,
    };
    allMessages.push(newMessage);
    dataCache.set('chat_messages', allMessages);
    return newMessage;
};

interface OnlineUsersMapping {
  roomId: number;
  userIds: number[];
}

export const getOnlineUsers = async (roomId: number): Promise<User[]> => {
    const [onlineUsersMappings, allUsers] = await Promise.all([
        dataCache.get<OnlineUsersMapping>('online_users', '/data/online_users.json'),
        getUsersList()
    ]);
    const mapping = onlineUsersMappings.find(m => m.roomId === roomId);
    const onlineUserIds = mapping ? mapping.userIds : [];
    return allUsers.filter(user => onlineUserIds.includes(user.id));
};

// --- Satsang Social Feed ---

export const getPosts = (): Promise<Post[]> => {
    return dataCache.get<Post>('posts', '/data/posts.json').then(posts => 
        posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    );
};

export const getUserById = async (userId: number): Promise<User | undefined> => {
    const users = await getUsersList();
    return users.find(u => u.id === userId);
};

export const createPost = async (caption: string, imageUrl: string, user: User): Promise<{ message: string }> => {
    const posts = await dataCache.get<Post>('posts', '/data/posts.json');
    const newPost: Post = {
        id: Date.now(),
        userId: user.id,
        imageUrl,
        caption,
        timestamp: new Date().toISOString(),
        likes: [],
        comments: [],
    };
    posts.unshift(newPost);
    dataCache.set('posts', posts);
    await logActivity('addition', `User '${user.name}' created a new post.`, user);
    return { message: "Post created successfully!" };
};

export const toggleLikePost = async (postId: number, userId: number): Promise<{ message: string }> => {
    const posts = await dataCache.get<Post>('posts', '/data/posts.json');
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) throw new Error("Post not found");

    const liked = posts[postIndex].likes.includes(userId);
    if (liked) {
        posts[postIndex].likes = posts[postIndex].likes.filter(id => id !== userId);
    } else {
        posts[postIndex].likes.push(userId);
    }
    dataCache.set('posts', posts);
    return { message: liked ? "Post unliked" : "Post liked" };
};

export const toggleFollowUser = async (currentUserId: number, targetUserId: number): Promise<{ message: string }> => {
    if (currentUserId === targetUserId) throw new Error("You cannot follow yourself.");

    const users = await dataCache.get<User>('users', '/data/users.json');
    const currentUserIndex = users.findIndex(u => u.id === currentUserId);
    const targetUserIndex = users.findIndex(u => u.id === targetUserId);

    if (currentUserIndex === -1 || targetUserIndex === -1) throw new Error("User not found.");
    
    const currentUser = users[currentUserIndex];
    const targetUser = users[targetUserIndex];

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
        currentUser.following = currentUser.following.filter(id => id !== targetUserId);
        targetUser.followers = targetUser.followers.filter(id => id !== currentUserId);
    } else {
        currentUser.following.push(targetUserId);
        targetUser.followers.push(currentUserId);
    }

    dataCache.set('users', users);
    await logActivity('update', `${currentUser.name} ${isFollowing ? 'unfollowed' : 'followed'} ${targetUser.name}`, currentUser);
    return { message: isFollowing ? `Unfollowed ${targetUser.name}` : `Followed ${targetUser.name}` };
};

// Pandit Registration
export const submitPanditRegistration = async (data: Omit<Pandit, 'id' | 'status' | 'rating'>): Promise<{ message: string }> => {
    const pending = await dataCache.get<Pandit>('pending_pandits', '/data/pending_pandits.json');
    const newSubmission: Pandit = {
        ...data,
        id: Date.now(),
        status: 'pending',
        rating: 0,
    };
    pending.push(newSubmission);
    dataCache.set('pending_pandits', pending);
    await logActivity('submission', `New pandit registration from ${data.name}.`, null);
    return { message: "Your application has been submitted for review. We will contact you shortly." };
};

export const approvePandit = async (panditId: number, token: string): Promise<{ message: string }> => {
    const pending = await dataCache.get<Pandit>('pending_pandits', '/data/pending_pandits.json');
    const panditToApprove = pending.find(p => p.id === panditId);
    if (!panditToApprove) throw new Error("Pending pandit not found.");
    
    const newPending = pending.filter(p => p.id !== panditId);
    dataCache.set('pending_pandits', newPending);
    
    const verified = await dataCache.get<Pandit>('pandits', '/data/pandits.json');
    panditToApprove.status = 'verified';
    panditToApprove.rating = 4.5; // Default rating
    verified.push(panditToApprove);
    dataCache.set('pandits', verified);

    await logActivity('approval', `Pandit registration approved for ${panditToApprove.name}.`, null);
    return { message: "Pandit approved and added to the list." };
};

export const rejectPandit = async (panditId: number, token: string): Promise<{ message: string }> => {
    const pending = await dataCache.get<Pandit>('pending_pandits', '/data/pending_pandits.json');
    const panditToReject = pending.find(p => p.id === panditId);
    if (!panditToReject) throw new Error("Pending pandit not found.");
    
    const newPending = pending.filter(p => p.id !== panditId);
    dataCache.set('pending_pandits', newPending);

    await logActivity('rejection', `Pandit registration rejected for ${panditToReject.name}.`, null);
    return { message: "Pandit registration rejected." };
};

export const explainScripture = (topic: string): Promise<string> => {
    return explainScriptureAI(topic);
};
