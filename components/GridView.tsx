import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as api from '../services/apiService';
import { I18nContent, Temple, Pooja, Yatra, Book, MajorEvent, ContentType, ModalType, Language, Pandit } from '../types';
import { useModal } from '../contexts/ModalContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

// Components
import { CardAnimator } from './CardAnimator';
import { TempleCard } from './TempleCard';
import { PoojaCard } from './PoojaCard';
import { YatraCard } from './YatraCard';
import { BookCard } from './BookCard';
import { EventCard } from './EventCard';
import { TempleCardSkeleton } from './TempleCardSkeleton';
import { PoojaCardSkeleton } from './PoojaCardSkeleton';
import { YatraCardSkeleton } from './YatraCardSkeleton';
import { BookCardSkeleton } from './BookCardSkeleton';
import { EventCardSkeleton } from './EventCardSkeleton';
import { Icon } from './Icon';

const typeToTitleMap: Record<ContentType, keyof I18nContent> = {
    temples: 'navTemples',
    poojas: 'navPoojaServices',
    yatras: 'navYatras',
    events: 'navEvents',
};

const templeCategoryGroups = [
    {
        title: "Major Circuits",
        categories: [
            { name: "Adi Shankara's Char Dham", tag: 'char dham' },
            { name: "Himalayan Char Dham", tag: 'himalayan char dham' },
            { name: '12 Jyotirlingas', tag: 'jyotirlinga' },
            { name: 'Panchabhoota Sthalams', tag: 'panchabhoota' },
        ]
    },
    {
        title: "Deity Traditions",
        categories: [
            { name: 'Shaiva Temples', tag: 'shiva' },
            { name: 'Vaishnava Temples', tag: 'vaishnava' },
            { name: 'Shakta Pithas', tag: 'shakta' },
        ]
    },
    {
        title: "Other Sacred Sites",
        categories: [
            { name: 'Shankar Mutts', tag: 'shankar mutt' },
            { name: 'Other Major Shrines', tag: 'other_major' }
        ]
    }
];

const CANONICAL_SORT_TAGS = new Set(['char dham', 'himalayan char dham', 'jyotirlinga', 'panchabhoota']);


export interface GridViewProps {
  t: I18nContent;
  type: ContentType;
  language: Language;
  onDarshanClick: (temple: Temple) => void;
  // Make these optional since they only apply to temples
  yatraPlan?: Temple[];
  isInYatraPlan?: (templeId: number) => boolean;
  onToggleYatraPlan?: (temple: Temple) => void;
}

export const GridView = ({ t, type, language, onDarshanClick, yatraPlan, isInYatraPlan, onToggleYatraPlan }: GridViewProps) => {
  const [allItems, setAllItems] = useState<any[]>([]);
  const [allPandits, setAllPandits] = useState<Pandit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { openModal, closeModal } = useModal();
  const { currentUser } = useAuth();
  const { addToast } = useToast();


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      let data;
      switch (type) {
        case 'temples': data = await api.getTemples(language); break;
        case 'poojas': {
            const [poojaData, panditData] = await Promise.all([
                api.getPoojas(language),
                api.getPandits(language)
            ]);
            data = poojaData.filter(pooja => pooja.serviceType === 'General');
            setAllPandits(panditData);
            break;
        }
        case 'yatras': data = await api.getYatras(language); break;
        case 'events': data = await api.getMajorEvents(language); break;
        default: data = [];
      }
      setAllItems(data);
    } catch (error) {
      addToast(`Failed to load ${type}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [type, addToast, language]);

  useEffect(() => {
    fetchData();

    const handleDataUpdate = (e: Event) => {
        const customEvent = e as CustomEvent;
        const keyMap: Record<ContentType, string> = {
            temples: 'temples',
            poojas: 'poojas',
            yatras: 'yatras',
            events: 'events',
        };
        if (customEvent.detail?.key === keyMap[type] || (type === 'poojas' && customEvent.detail?.key === 'pandits')) {
            fetchData();
        }
    };

    window.addEventListener(api.DATA_UPDATED_EVENT, handleDataUpdate);
    
    return () => {
        window.removeEventListener(api.DATA_UPDATED_EVENT, handleDataUpdate);
    };
  }, [type, fetchData]);

  const handleCategoryClick = (tag: string) => {
    setActiveCategory(tag);
  };
  
  const navigateTo = (path: string) => { window.location.hash = path; };
  const handleLoginOrAction = (action: () => void) => {
        if (!currentUser) openModal('login');
        else action();
  };
  
  const handlePoojaBooking = (pooja: Pooja) => {
      handleLoginOrAction(() => {
          openModal('poojaBooking', { pooja });
      });
  };

  const handleAskGuru = (pooja: Pooja) => {
      openModal('aiGuruChat', { pooja: pooja });
  };

  // --- Generic Content Handlers ---
  const handleSubmit = async (itemData: any) => {
    if (!currentUser?.token) return;
    try {
        let result;
        const isUpdate = !!itemData.id;
        
        switch(type) {
            case 'events':
                result = isUpdate ? await api.updateEvent(itemData, currentUser.token) : await api.addEvent(itemData, currentUser.token);
                break;
            case 'poojas':
                result = isUpdate ? await api.updatePooja(itemData, currentUser.token) : await api.addPooja(itemData, currentUser.token);
                break;
            case 'yatras':
                 result = isUpdate ? await api.updateYatra(itemData, currentUser.token) : await api.addYatra(itemData, currentUser.token);
                break;
            default:
                throw new Error("Unsupported type for submission");
        }
        
        addToast(result.message, 'success');
        closeModal();
        if (!isUpdate) {
            document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (err) {
        if (err instanceof Error) addToast(err.message, 'error');
    }
  };

  const handleDelete = async (itemId: number, itemName: string) => {
    if (!currentUser?.token) return;

    const onConfirmDelete = async () => {
        if (!currentUser?.token) return;

        const originalItems = allItems;
        setAllItems(currentItems => currentItems.filter(item => item.id !== itemId));
        closeModal();

        try {
            let result;
            switch(type) {
                case 'events': result = await api.deleteEvent(itemId, currentUser.token); break;
                case 'poojas': result = await api.deletePooja(itemId, currentUser.token); break;
                case 'yatras': result = await api.deleteYatra(itemId, currentUser.token); break;
                default: throw new Error("Unsupported type for deletion");
            }
            addToast(result.message, 'success');
        } catch (err) {
            if (err instanceof Error) addToast(err.message, 'error');
            addToast(`Failed to delete '${itemName}'. Reverting change.`, 'error');
            setAllItems(originalItems);
        }
    };

    let confirmationMessage = `${t.confirmDeleteMessage.replace('this item', `"${itemName}"`)}`;
    
    openModal('confirmation', {
        title: t.confirmDeleteTitle,
        message: confirmationMessage,
        onConfirm: onConfirmDelete
    });
  };

  const title = t[typeToTitleMap[type]];
  const modalType: ModalType = `${type.slice(0, -1)}Admin` as ModalType;
  const addItemTextKey = `add${type.charAt(0).toUpperCase() + type.slice(1, -1)}` as keyof I18nContent;

  const filteredItems = useMemo(() => {
    let items = [...allItems];

    if (type === 'temples') {
        // Category filtering
        if (activeCategory !== 'All') {
            items = items.filter(item => (item as Temple).tags?.includes(activeCategory.toLowerCase()));
        }

        // Search query filtering
        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            items = items.filter(item =>
                (item as Temple).name.toLowerCase().includes(lowerCaseQuery) ||
                (item as Temple).location.toLowerCase().includes(lowerCaseQuery)
            );
        }

        // Custom sorting for specific circuits
        if (CANONICAL_SORT_TAGS.has(activeCategory.toLowerCase())) {
            const circuitKey = activeCategory.toLowerCase().replace(/ /g, '_');
            items.sort((a: Temple, b: Temple) => {
                const orderA = a.circuitOrder?.[circuitKey] ?? Infinity;
                const orderB = b.circuitOrder?.[circuitKey] ?? Infinity;
                return orderA - orderB;
            });
        } else {
            // Default sort alphabetically by name for other categories
            items.sort((a, b) => a.name.localeCompare(b.name));
        }
    } else {
        // For non-temple views, just sort alphabetically
        items.sort((a, b) => a.name.localeCompare(b.name));
    }

    return items;
  }, [allItems, activeCategory, type, searchQuery]);

  const renderCard = (item: any) => {
    switch (type) {
      case 'temples':
        return (
          <TempleCard
            temple={item}
            t={t}
            onSelectTemple={() => navigateTo(`/templeDetail/${item.id}`)}
            onBookDarshan={() => onDarshanClick(item)}
            onVirtualDarshan={() => openModal('vrDarshan')}
            onViewImage={() => openModal('imageDetail', {imageUrl: item.imageUrl, altText: item.name})}
            onAskGuru={() => openModal('aiGuruChat', { temple: item })}
            isInYatraPlan={isInYatraPlan ? isInYatraPlan(item.id) : false}
            onToggleYatraPlan={onToggleYatraPlan!}
          />
        );
      case 'poojas': {
        const panditCount = allPandits.filter(p => p.specialties.some(s => s.toLowerCase() === item.name.toLowerCase())).length;
        return (
          <PoojaCard
            pooja={item}
            t={t}
            panditCount={panditCount}
            onBook={handlePoojaBooking}
            onAskGuru={handleAskGuru}
            isAdmin={currentUser?.role === 'admin'}
            onEdit={() => openModal('poojaAdmin', { initialData: item, onSubmit: handleSubmit, t })}
            onDelete={() => handleDelete(item.id, item.name)}
            onViewImage={() => openModal('imageDetail', {imageUrl: item.imageUrl, altText: item.name})}
          />
        );
      }
      case 'yatras':
        return (
          <YatraCard
            yatra={item}
            t={t}
            onViewItinerary={() => openModal('yatraDetail', { yatra: item, t })}
            isAdmin={currentUser?.role === 'admin'}
            onEdit={() => openModal('yatraAdmin', { initialData: item, onSubmit: handleSubmit, t })}
            onDelete={() => handleDelete(item.id, item.name)}
            onViewImage={() => openModal('imageDetail', {imageUrl: item.imageUrl, altText: item.name})}
          />
        );
      case 'events':
        return (
          <EventCard
            event={item}
            t={t}
            onSelectEvent={() => navigateTo(`/eventDetail/${item.id}`)}
            isAdmin={currentUser?.role === 'admin'}
            onEdit={() => openModal('eventAdmin', { initialData: item, onSubmit: handleSubmit, t })}
            onDelete={() => handleDelete(item.id, item.name)}
            onViewImage={() => openModal('imageDetail', {imageUrl: item.imageUrl, altText: item.name})}
          />
        );
      default:
        return null;
    }
  };

  const getSkeleton = (index: number) => {
    switch(type) {
        case 'temples': return <TempleCardSkeleton key={index} />;
        case 'poojas': return <PoojaCardSkeleton key={index} />;
        case 'yatras': return <YatraCardSkeleton key={index} />;
        case 'events': return <EventCardSkeleton key={index} />;
        default: return null;
    }
  };

  const gridClass = useMemo(() => {
    switch (type) {
        case 'events': return "grid grid-cols-1 lg:grid-cols-2 gap-8";
        case 'temples':
            return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";
        case 'poojas':
        case 'yatras':
            return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6";
        default:
            return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";
    }
  }, [type]);

  const canAdd = currentUser?.role === 'admin' && type !== 'temples';

  return (
    <div className="animate-fade-in py-8 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h1 className="text-4xl md:text-5xl font-bold font-heading">{title}</h1>
                {type === 'poojas' && <p className="text-text-muted mt-1">Book experienced pandits for sacred rituals, homas, and ceremonies at your home or online.</p>}
            </div>
            <div className="flex flex-col items-end gap-2">
                {canAdd && (
                     <button
                        onClick={() => openModal(modalType, { onSubmit: handleSubmit, t })}
                        className="bg-green-600 text-white font-bold py-2 px-6 rounded-full hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
                    >
                        <Icon name="plus" className="w-5 h-5" />
                        <span>{t[addItemTextKey]}</span>
                    </button>
                )}
                 {type === 'poojas' && (
                     <button
                        onClick={() => openModal('panditRegistration')}
                        className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
                    >
                        <Icon name="user-edit" className="w-5 h-5" />
                        <span>Join as a Pandit</span>
                    </button>
                )}
            </div>
        </div>
        
        {type === 'temples' && (
            <div className="mb-8 space-y-6">
                 {/* Search Bar */}
                <div className="relative">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by temple name or location..."
                        className="w-full pl-12 pr-4 py-3 text-lg rounded-full bg-white shadow-md border-2 border-transparent focus:border-primary focus:ring-primary focus:outline-none"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Icon name="search" className="w-6 h-6 text-text-muted" />
                    </div>
                </div>

                {/* Category Filters */}
                <div className="bg-white/50 p-4 rounded-xl shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => handleCategoryClick('All')}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 flex items-center gap-2 ${
                                activeCategory === 'All'
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-white/60 text-primary hover:bg-white'
                            }`}
                        >
                            All Temples
                        </button>
                        <div className="h-6 w-px bg-stone-300 hidden sm:block"></div>
                        {templeCategoryGroups.map(group => (
                            <React.Fragment key={group.title}>
                                {group.categories.map(category => (
                                    <button
                                        key={category.name}
                                        onClick={() => handleCategoryClick(category.tag)}
                                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 flex items-center gap-2 ${
                                            activeCategory === category.tag
                                                ? 'bg-primary text-white shadow-md'
                                                : 'bg-white/60 text-primary hover:bg-white'
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {isLoading ? (
            <div className={gridClass}>
                {[...Array(type === 'events' ? 2 : (type === 'poojas' || type === 'yatras' ? 4 : 3))].map((_, i) => getSkeleton(i))}
            </div>
        ) : filteredItems.length > 0 ? (
            <div className={gridClass}>
                {filteredItems.map(item => (
                    <CardAnimator key={item.id}>
                        {renderCard(item)}
                    </CardAnimator>
                ))}
            </div>
        ) : (
            <div className="text-center py-16 text-stone-600">
                 <h3 className="text-2xl font-semibold mb-2">No {type} found.</h3>
                {searchQuery ? (
                    <p>Your search for "{searchQuery}" did not match any temples in the "{activeCategory}" category.</p>
                ) : canAdd ? (
                    <p>You can add one using the button above.</p>
                ) : (
                    <p>No temples match the selected category.</p>
                )}
            </div>
        )}
      </div>
    </div>
  );
};