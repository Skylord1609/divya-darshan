export enum Language {
    EN = 'en',
    HI = 'hi',
    TE = 'te'
}

export type Role = 'devotee' | 'admin';
export type CrowdLevel = 'Low' | 'Medium' | 'High' | 'Very High';

export interface Comment {
    id: number;
    userId: number;
    userName: string;
    text: string;
    timestamp: string;
}

export interface Post {
    id: number;
    userId: number;
    imageUrl: string;
    caption: string;
    timestamp: string;
    likes: number[]; // Array of user IDs
    comments: Comment[];
}

export interface User {
    id: number;
    email: string;
    name: string;
    role: Role;
    token?: string; // For simulating authenticated requests
    avatarUrl?: string;
    bio?: string;
    followers: number[]; // Array of user IDs
    following: number[]; // Array of user IDs
}

export interface UserPreferences {
    userId: number;
    preferences: {
        chantImages?: Record<number, string>;
    };
}

export interface Temple {
    id: number;
    name:string;
    location: string;
    history: string;
    imageUrl: string;
    lat: number;
    lng: number;
    crowdLevel: CrowdLevel;
    darshanTimings: string;
    deity: string;
    distance?: number;
    tags?: string[];
    estimatedCost: number;
    estimatedDays: number;
    circuitOrder?: {
        [key: string]: number;
    };
    featuredOrder?: number;
}

export interface AdminTemple extends Temple {
    submittedBy: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface Sloka {
    text: string;
    translation: string;
    meaning: string;
}

export interface Pooja {
    id: number;
    name: string;
    description: string;
    cost: number;
    duration: string;
    imageUrl: string;
    serviceType: 'General' | 'Temple';
    templeIds?: number[];
    deity?: string;
    benefits?: string;
    samagri?: string;
    procedure?: string;
    isOnline?: boolean;
}

export interface YatraTier {
    name: string;
    cost: number;
    description: string;
}

export interface Yatra {
    id: number;
    name: string;
    description: string;
    itinerary?: string[];
    imageUrl: string;
    tiers: YatraTier[];
    durationDays: number;
    groupSize: number;
    carbonFootprint?: number; // in kg CO2
    inclusions?: string[];
    exclusions?: string[];
    thingsToCarry?: string[];
}

export interface MajorEvent {
    id: number;
    name: string;
    description: string;
    dates: string;
    location: string;
    imageUrl: string;
    crowdLevel: CrowdLevel;
}

export interface PanditAvailability {
  days: number[]; // 0 for Sunday, 6 for Saturday
  hours: { start: string; end: string; }[]; // "HH:MM" - Array for split shifts
  offDates?: string[]; // "YYYY-MM-DD"
}


export interface Pandit {
    id: number;
    name: string;
    location: string;
    specialization: string;
    specialties: string[];
    services: ('Online' | 'Offline')[];
    experience: number;
    rating: number;
    cost: number;
    imageUrl: string;
    availability: PanditAvailability;
    status: 'pending' | 'verified';
    eventId?: number;
}

export interface Festival {
    id: number;
    name: string;
    date: string;
    description: string;
    nextOccurrence?: Date;
}

export interface Book {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    contentKey?: string;
    tags?: string[];
}

export interface BookContent {
    title: string;
    chapters: BookChapter[];
}
  
export interface BookChapter {
    chapter: number;
    title: string;
    verses: BookVerse[];
}
  
export interface BookVerse {
    verse: number;
    sanskrit: string;
    translation: string;
}

export interface Testimonial {
    id: number;
    name: string;
    location: string;
    quote: string;
    avatarUrl: string;
}

export interface NearbyTemple {
    name: string;
    distance: string;
}

export interface DarshanTier {
    name: string;
    cost: number;
    description: string;
}

export interface DarshanBookingDetails {
    tier: DarshanTier;
    date: Date;
    timeSlot: string;
}

export interface PoojaBookingDetails {
    pooja: Pooja;
    temple?: Temple;
    date: Date;
    timeSlot: string;
    pandit?: Pandit;
    serviceType: 'Online' | 'Offline';
    address?: string;
}

export interface FamilyMember {
    id: number;
    name: string;
    idProof: string;
}

export interface YatraBookingDetails {
    yatra: Yatra;
    tier: YatraTier;
    date: Date;
    numberOfPersons: number;
    accommodationTier: 'Standard' | 'Comfort' | 'Luxury';
    foodPreference: 'Satvik' | 'Jain' | 'Regular';
    transportMode: 'Shared AC Coach' | 'EV';
    familyMembers: FamilyMember[];
}

export interface CustomYatraBookingDetails {
    itinerary: Temple[];
    numberOfPersons: number;
    familyMembers: FamilyMember[];
    accommodationTier: 'Standard (Dharamshalas)' | 'Comfort (3-star Hotels)' | 'Luxury (5-star Hotels)';
    foodPreference: 'Satvik' | 'Jain' | 'Regular';
    transportMode: 'Own Car' | 'Shared AC Coach' | 'EV' | 'Private SUV';
    startDate: Date;
}

export interface YatraPlanSettings {
    numberOfPersons: number;
    familyMembers: FamilyMember[];
    accommodationTier: 'Standard (Dharamshalas)' | 'Comfort (3-star Hotels)' | 'Luxury (5-star Hotels)';
    foodPreference: 'Satvik' | 'Jain' | 'Regular';
    transportMode: 'Own Car' | 'Shared AC Coach' | 'EV' | 'Private SUV';
    startDate: string; // ISO date string e.g. "2024-08-15"
    budget: number;
}


export interface YatraQuoteRequest extends CustomYatraBookingDetails {
    userName: string;
    userEmail: string;
    userPhone: string;
    totalCost: number;
    carbonFootprint: number;
}

export interface DonationOption {
    id: string;
    title: string;
    description: string;
}

export interface Booking {
    id: number;
    type: 'pooja' | 'darshan' | 'pandit' | 'donation' | 'yatra' | 'custom_yatra';
    userId: number;
    itemId: number | string; // pooja.id, temple.id, pandit.id or donation purpose id
    itemName: string; // pooja.name, temple.name, pandit.name, or donation purpose title
    itemContext?: string; // e.g., Event name for pandit booking, Temple name for donation/pooja
    cost: number;
    timestamp: string;
    bookingDate?: string;
    timeSlot?: string;
    numberOfPersons?: number;
    panditId?: number;
    panditName?: string;
    address?: string;
    durationMinutes?: number;
}

export interface Category {
    id: number;
    name: string;
    color: string;
}

export interface Task {
    id: number;
    itemId: number;
    itemType: 'Pooja' | 'Event';
    itemName: string;
    dateTime: string; // ISO string for datetime-local
    note?: string;
    categoryId?: number;
}

export type View = 'home' | 'dashboard' | 'templeDetail' | 'temples' | 'poojas' | 'yatras' | 'knowledge' | 'events' | 'eventDetail' | 'profile' | 'bookReader' | 'search' | 'chantingZone' | 'settings' | 'chakraSanctuary' | 'yatraPlanner' | 'satsang';
export type ContentType = 'temples' | 'poojas' | 'yatras' | 'events';
export type ModalType = 'login' | 'uploadTemple' | 'yatraDetail' | 'liveDarshan' | 'vrDarshan' | 'darshanBooking' | 'poojaBooking' | 'panditBooking' | 'donation' | 'crowdAlert' | 'panditAdmin' | 'confirmation' | 'bookAdmin' | 'eventAdmin' | 'festivalAdmin' | 'imageDetail' | 'poojaAdmin' | 'yatraAdmin' | 'userAdmin' | 'manageTemplePoojas' | 'meditation' | 'yatraBooking' | 'bookingConfirmation' | 'aiGuruChat' | 'yatraQuote' | 'userProfile' | 'yatraPlan' | 'postCreation' | 'panditRegistration' | 'task' | 'category';

export type TaskType = 'meditate' | 'seva' | 'shloka' | 'darshan' | 'chant';

export interface DailyTask {
    type: TaskType;
    isCompleted: boolean;
}

export interface SpiritualGrowthData {
    userId: number;
    xp: number;
    level: number;
    xpForNextLevel: number;
    xpForCurrentLevel: number;
    streak: number;
    dailyTasks: DailyTask[];
    lastUpdate?: string; // YYYY-MM-DD
}

export interface LifetimeStats {
    templesVisited: number;
    poojasBooked: number;
    sevaOffered: number;
    knowledgeRead: number;
}

export interface Achievement {
    id: string;
    nameKey: keyof I18nContent;
    descriptionKey: keyof I18nContent;
    icon: IconName;
    condition: (stats: LifetimeStats, growth: SpiritualGrowthData) => boolean;
}

export type TempleSubmissionData = Pick<Temple, 'name' | 'location' | 'history' | 'imageUrl' | 'darshanTimings'>;

export interface ActivityLogItem {
  id: number;
  type: 'login' | 'booking' | 'submission' | 'approval' | 'rejection' | 'addition' | 'donation' | 'update' | 'deletion';
  message: string;
  user: {
    id: number;
    name: string;
  } | null;
  timestamp: string;
}

export interface ModalContextType {
    modalType: ModalType | null;
    modalProps: any;
    openModal: (type: ModalType, props?: any) => void;
    closeModal: () => void;
}

export interface SearchResults {
    temples: Temple[];
    books: Book[];
    events: MajorEvent[];
}

export interface SearchFilters {
    crowd: CrowdLevel[];
    deity: string[];
    distance: number; // 0 for any, others in km
}

export type FeedItem = {
    type: 'temple';
    reason: string;
    item: Temple;
} | {
    type: 'pooja';
    reason: string;
    item: Pooja;
} | {
    type: 'book';
    reason: string;
    item: Book;
} | {
    type: 'event';
    reason: string;
    item: MajorEvent;
};

// Chanting Zone Types
export interface Chant {
  id: number;
  title: string;
  deity: string;
  category: 'Krishna' | 'Shiva' | 'Ganesha' | 'Devi' | 'Universal';
  mantra: string[];
  story: string;
  deityImage: string;
  sanskrit: string;
}

export interface Badge {
    id: string;
    nameKey: keyof I18nContent;
    descriptionKey: keyof I18nContent;
    icon: IconName;
    chantCount: number;
}

// Chakra Mood Types
export type ChakraName = 'Sahasrara' | 'Ajna' | 'Vishuddha' | 'Anahata' | 'Manipura' | 'Swadhisthana' | 'Muladhara';

export interface ChakraTheme {
    id: number;
    name: ChakraName;
    color: string;
    descriptionKey: keyof I18nContent;
    detailedInfoKey: keyof I18nContent;
    className: string;
}

// AI Personal Shopper Types
export interface ShoppingRecommendation {
  itemName: string;
  description: string;
  imageUrl: string;
  estimatedPrice: string;
  purchaseUrl?: string;
  internalPoojaId?: number;
}

// Satsang Community Hub Types
export interface ChatRoom {
  id: number;
  name: keyof I18nContent;
  description: keyof I18nContent;
  icon: IconName;
}

export interface ChatMessage {
  id: number;
  roomId: number;
  userId: number;
  userName: string;
  timestamp: string;
  text: string;
}

export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type TravelMode = 'Flight' | 'Train' | 'Bus' | 'Car';

export interface YatraPlanItem {
    temple: Temple;
    visitDate: string; // ISO string for date e.g. "2024-08-15"
    travelMode: TravelMode;
    priority: PriorityLevel;
}

// Unified Icon Component Type
export type IconName = 
  'alert-triangle' | 'bell' | 'book-open' | 'camera' 
  | 'calendar' | 'chakra' | 'check-circle' | 'chevron-left' | 'circle' | 'clipboard-list' 
  | 'clock' | 'compass' | 'conch' | 'cosmic-logo' | 'animated-cosmic-logo'
  | 'diya' | 'edit' | 'facebook' | 'flame' | 'flower' | 'gada' | 'google' | 'gopuram'
  | 'heart-hand' | 'home' | 'image' | 'info' | 'lotus' | 'map-pin' 
  | 'meditate' | 'menu' | 'microphone' | 'om' | 'pause' | 'play' 
  | 'plus' | 'receipt' | 'rupee' | 'search' | 'settings' | 'shopping-bag' | 'speaker' | 'star' 
  | 'stop-circle' | 'sudarshana-chakra' | 'temple' | 'trash' | 'trishul' | 'upload' | 'user-circle' 
  | 'user-edit' | 'users' | 'users-group' | 'volume-off' | 'volume-on' 
  | 'x' | 'zoom-in';

export interface I18nContent {
    navHome: string;
    navTemples: string;
    navDarshan: string;
    navPoojaServices: string;
    navYatras: string;
    navKnowledge: string;
    navEvents: string;
    navDashboard: string;
    navSeva: string;
    navSettings: string;
    bookingHistory: string;
    noBookings: string;
    heroTitle: string;
    heroSubtitle: string;
    heroSearchPlaceholder: string;
    noResultsFound: string;
    noResultsForQuery: string;
    searchResult: string;
    searchResults: string;
    searchResultsFor: string;
    templesFound: string;
    knowledgeFound: string;
    eventsFound: string;
    dailySloka: string;
    translation: string;
    meaning: string;
    listen: string;
    featuredTemples: string;
    readMore: string;
    explorePoojas: string;
    addPooja: string;
    addNewPooja: string;
    editPooja: string;
    addYatra: string;
    editYatra: string;
    bookNow: string;
    bookDarshan: string;
    bookPooja: string;
    bookYatra: string;
    poojaBookingTitle: string;
    poojaBookingDesc: string;
    darshanBookingTitle: string;
    darshanBookingDesc: string;
    selectTier: string;
    selectTemple: string;
    confirmBooking: string;
    yatraPackages: string;
    viewItinerary: string;
    selectPackage: string;
    numberOfTravellers: string;
    adults: string;
    selectDepartureDate: string;
    totalCost: string;
    persons: string;
    forgottenTempleTitle: string;
    forgottenTempleDesc: string;
    uploadTemple: string;
    addTemple: string;
    editTemple: string;
    editUser: string;
    saveChanges: string;
    footerText: string;
    vrDarshanTitle: string;
    vrDarshanDesc: string;
    experienceNow: string;
    aiGuruTitle: string;
    aiGuruDesc: string;
    aiGuruPlaceholder: string;
    aiGuruSuggestionsTitle: string;
    askGuru: string;
    guruThinking: string;
    login: string;
    logout: string;
    signup: string;
    loginWithGoogle: string;
    loginWithFacebook: string;
    loginOrContinue: string;
    welcome: string;
    templeMap: string;
    backToTemples: string;
    festivalsTitle: string;
    festivalsLoading: string;
    festivalsError: string;
    gatewayToKnowledge: string;
    theVedas: string;
    learnMore: string;
    readBook: string;
    addBook: string;
    editBook: string;
    bookNotAvailable: string;
    liveDarshanTitle: string;
    liveDarshanButton: string;
    nearbyTemplesTitle: string;
    nearbyTemplesPageTitle: string;
    loadMore: string;
    showingTemples: string;
    viewAll: string;
    exploreAll: string;
    majorEvents: string;
    addEvent: string;
    editEvent: string;
    bookPandit: string;
    panditBookingTitle: string;
    panditBookingDesc: string;
    availablePandits: string;
    availablePoojas: string;
    noPanditsAvailable: string;
    noPoojasAvailable: string;
    addPandit: string;
    editPandit: string;
    delete: string;
    confirmDeleteTitle: string;
    confirmDeleteMessage: string;
    sevaTitle: string;
    sevaDesc: string;
    donateNow: string;
    donateToTemple: string;
    makeDonation: string;
    donationAmount: string;
    donationPurpose: string;
    donationSuccess: string;
    donationFailed: string;
    generalDonation: string;
    foodDonation: string;
    templeMaintenance: string;
    locationPermissionDenied: string;
    findingYourLocation: string;
    locationError: string;
    away: string;
    crowdAlertTitle: string;
    crowdAlertInfo: string;
    proceedAnyway: string;
    exploreAlternative: string;
    festivalManagement: string;
    addFestival: string;
    editFestival: string;
    managePoojas: string;
    saveAssociations: string;
    showPoojaDetails: string;
    hidePoojaDetails: string;
    setTask: string;
    taskFor: string;
    taskDateTime: string;
    taskNote: string;
    taskNotePlaceholder: string;
    confirmTask: string;
    myTasks: string;
    noTasksSet: string;
    deleteTask: string;
    notificationPermissionRequest: string;
    grantPermission: string;
    notificationsBlocked: string;
    manageCategories: string;
    addCategory: string;
    editCategory: string;
    deleteCategory: string;
    noCategories: string;
    categoryName: string;
    categoryColor: string;
    confirmDeleteCategoryMessage: string;
    uncategorized: string;
    filterAll: string;

    // Settings
    settingsTitle: string;
    profileSettings: string;
    appearanceSettings: string;
    languageSettings: string;
    accountSettings: string;
    deleteAccount: string;
    confirmDeleteAccountMessage: string;

    // Spiritual Growth Tracker
    spiritualLevel: string;
    experiencePoints: string;
    xp: string;
    dailyStreak: string;
    days: string;
    lifetimeStats: string;
    templesVisited: string;
    poojasBooked: string;
    sevaOffered: string;
    knowledgeRead: string;
    dailySadhana: string;
    taskMeditate: string;
    taskSeva: string;
    taskShloka: string;
    taskDarshan: string;
    taskChant: string;
    startMeditation: string;
    meditationComplete: string;
    achievements: string;
    achievementUnlocked: string;
    achievement_first_step_name: string;
    achievement_first_step_desc: string;
    achievement_pilgrim_name: string;
    achievement_pilgrim_desc: string;
    achievement_devotee_name: string;
    achievement_devotee_desc: string;
    achievement_sevak_name: string;
    achievement_sevak_desc: string;
    achievement_streak_7_name: string;
    achievement_streak_7_desc: string;
    achievement_enlightened_name: string;
    achievement_enlightened_desc: string;

    // Pilgrimage of the Month
    pilgrimageOfMonthTitle: string;
    pilgrimageOfMonthDesc: string;
    pilgrimageOfMonthCta: string;

    // Personalized Feed
    feedForYou: string;
    feedDiscover: string;
    reasonVisited: string;
    reasonPooja: string;
    reasonDeity: string;
    reasonPopular: string;
    reasonEvent: string;

    // Chanting Zone
    navChantingZone: string;
    chantingZoneTitle: string;
    chantingZoneForKids: string;
    chantingZoneKidsMode: string;
    chantingZoneSadhanaMode: string;
    chantingZoneSubtitle: string;
    chantAlongMode: string;
    repeatLearnMode: string;
    badgeCollection: string;
    chantNow: string;
    chantCountLabel: string;
    recordYourVoice: string;
    stopRecording: string;
    playYourChant: string;
    recording: string;
    getReady: string;
    yourTurn: string;
    greatJob: string;
    storyMode: string;
    bedtimeMantras: string;
    sadhanaModeTitle: string;
    sadhanaModeSubtitle: string;
    japaMalaProgress: string;
    completeMala: string;
    malaCompletedMessage: string;
    badge_bhakti_beginner_name: string;
    badge_bhakti_beginner_desc: string;
    badge_chant_champion_name: string;
    badge_chant_champion_desc: string;
    badge_mantra_master_name: string;
    badge_mantra_master_desc: string;


    // Chakra
    navChakraSanctuary: string;
    chakraSanctuaryTitle: string;
    chakraSahasrara: string;
    chakraSahasraraDesc: string;
    chakraSahasraraInfo: string;
    chakraAjna: string;
    chakraAjnaDesc: string;
    chakraAjnaInfo: string;
    chakraVishuddha: string;
    chakraVishuddhaDesc: string;
    chakraVishuddhaInfo: string;
    chakraAnahata: string;
    chakraAnahataDesc: string;
    chakraAnahataInfo: string;
    chakraManipura: string;
    chakraManipuraDesc: string;
    chakraManipuraInfo: string;
    chakraSwadhisthana: string;
    chakraSwadhisthanaDesc: string;
    chakraSwadhisthanaInfo: string;
    chakraMuladhara: string;
    chakraMuladharaDesc: string;
    chakraMuladharaInfo: string;
    
    // Vedas View
    vedasTitle: string;
    vedasSubtitle: string;
    rigvedaTitle: string;
    rigvedaSubtitle: string;
    rigvedaDesc: string;
    rigvedaKidDesc: string;
    samavedaTitle: string;
    samavedaSubtitle: string;
    samavedaDesc: string;
    samavedaKidDesc: string;
    yajurvedaTitle: string;
    yajurvedaSubtitle: string;
    yajurvedaDesc: string;
    yajurvedaKidDesc: string;
    atharvavedaTitle: string;
    atharvavedaSubtitle: string;
    atharvavedaDesc: string;
    atharvavedaKidDesc: string;
    keyTopics: string;
    rigvedaTopics: string;
    samavedaTopics: string;
    yajurvedaTopics: string;
    atharvavedaTopics: string;
    kidFriendlyMode: string;
    readNow: string;
    listenMantra: string;
    explore: string;
    spiritualTriviaTitle: string;
    spiritualTriviaContent: string;

    // Knowledge
    knowledgeHubTitle: string;
    dailyWisdom: string;
    categoryVeda: string;
    categoryGita: string;
    categoryUpanishad: string;
    categoryPurana: string;
    categoryItihasa: string;
    categorySmriti: string;
    categoryDarsana: string;
    categoryAgama: string;
    categoryOtherSastra: string;

    // Satsang
    navSatsang: string;
    satsangTitle: string;
    satsangDesc: string;
    satsang_general_dharma_name: string;
    satsang_general_dharma_desc: string;
    satsang_yoga_meditation_name: string;
    satsang_yoga_meditation_desc: string;
    satsang_bhakti_sangeet_name: string;
    satsang_bhakti_sangeet_desc: string;
    satsang_scripture_study_name: string;
    satsang_scripture_study_desc: string;
    satsangJoinCircle: string;
    satsangSendMessage: string;
    satsangTypeMessage: string;
    satsangCommunityGuidelines: string;
    satsangGuidelinesContent: string;
    viewProfile: string;
    updateProfilePicture: string;
    profileOf: string;
}
