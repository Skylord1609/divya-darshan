
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import * as api from './services/apiService';
import { Language, DarshanBookingDetails, PoojaBookingDetails, DonationOption, Pandit, View, Temple, MajorEvent, TempleSubmissionData, Book, Festival, Pooja, Yatra, User, TaskType, YatraBookingDetails, CustomYatraBookingDetails, YatraQuoteRequest, YatraPlanItem, TravelMode, Task, YatraPlanSettings, FamilyMember, Category } from './types';
import { I18N_DATA } from './constants';
import { useAuth } from './contexts/AuthContext';
import { useToast } from './contexts/ToastContext';
import { LoginModal } from './components/LoginModal';
import { UploadTempleModal } from './components/UploadTempleModal';
import { YatraDetailModal } from './components/YatraDetailModal';
import { LiveDarshanModal } from './components/LiveDarshanModal';
import { VRDarshanModal } from './components/VRDarshanModal';
import { DarshanBookingModal } from './components/DarshanBookingModal';
import { PoojaBookingModal } from './components/PoojaBookingModal';
import { PanditBookingModal } from './components/PanditBookingModal';
import { DonationModal } from './components/DonationModal';
import { CrowdAlertModal } from './components/CrowdAlertModal';
import { PanditModal } from './components/PanditModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { useModal } from './contexts/ModalContext';
import { Sidebar } from './components/Sidebar';
import { useHashRouter } from './hooks/useHashRouter';
import { BookModal } from './components/BookModal';
import { EventModal } from './components/EventModal';
import { FestivalModal } from './components/FestivalModal';
import { SplashScreen } from './components/SplashScreen';
import { ImageDetailModal } from './components/ImageDetailModal';
import { PoojaModal } from './components/PoojaModal';
import { YatraModal } from './components/YatraModal';
import { UserModal } from './components/UserModal';
import { ManageTemplePoojasModal } from './components/ManageTemplePoojasModal';
import { MeditationModal } from './components/MeditationModal';
import { useTheme } from './contexts/ThemeContext';
import { Icon } from './components/Icon';
import { AnimatedBackground } from './components/AnimatedBackground';

// Page Components
import { Home } from './components/Home';
import { GridView } from './components/GridView';
import { TempleDetail } from './components/TempleDetail';
import { EventDetail } from './components/EventDetail';
import { BookReader } from './components/BookReader';
import { AdminDashboard } from './components/AdminDashboard';
import { SearchView } from './components/SearchView';
import { Header } from './components/Header';
import { ChantingZone } from './components/SlokaWidget';
import { SettingsView } from './components/SettingsView';
import { YatraBookingModal } from './components/YatraBookingModal';
import { KnowledgeView } from './components/KnowledgeView';
import { ChakraSanctuary } from './components/ChakraSanctuary';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';
import { YatraPlannerView } from './components/YatraPlannerView';
import { AIGuruModal } from './components/AIGuruModal';
import { YatraQuoteModal } from './components/YatraQuoteModal';
import { SatsangView } from './components/SatsangView';
import { ChatRoom } from './components/ChatRoom';
import { UserProfileModal } from './components/UserProfileModal';
import { YatraPlannerModal } from './components/YatraPlannerModal';
import { PostCreationModal } from './components/PostCreationModal';
import { PanditRegistrationModal } from './components/PanditRegistrationModal';
import { TaskModal } from './components/ReminderModal';
import { NearbyView } from './components/NearbyView';
import { CategoryModal } from './components/CategoryModal';


interface PanditBookingDetails {
  date: Date;
  timeSlot: string;
}

export const App = () => {
  const [language, setLanguage] = React.useState<Language>(Language.EN);
  const { currentUser, userLoading, logout } = useAuth();
  const { modalType, modalProps, openModal, closeModal } = useModal();
  const { addToast } = useToast();
  const { view, id } = useHashRouter();
  const [showSplash, setShowSplash] = React.useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme } = useTheme();

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
        const saved = localStorage.getItem('divya-darshan-tasks');
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
  });
  
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
        const saved = localStorage.getItem('divya-darshan-categories');
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
  });

  const [notificationPermission, setNotificationPermission] = useState<'granted' | 'denied' | 'default'>('default');

  useEffect(() => {
    if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('divya-darshan-tasks', JSON.stringify(tasks));
    } catch (error) {
        addToast("Could not save tasks.", "error");
    }
  }, [tasks, addToast]);
  
  useEffect(() => {
    try {
        localStorage.setItem('divya-darshan-categories', JSON.stringify(categories));
    } catch (error) {
        addToast("Could not save categories.", "error");
    }
  }, [categories, addToast]);

  const requestNotificationPermission = async () => {
      if (!('Notification' in window)) {
          addToast("This browser does not support desktop notifications.", "info");
          return 'denied';
      }
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
          addToast("Notification permission granted!", "success");
      } else {
          addToast("Notification permission denied.", "info");
      }
      return permission;
  };

  const handleSetTask = async (taskData: Omit<Task, 'id'>) => {
      let permission = notificationPermission;
      if (permission === 'default') {
          permission = await requestNotificationPermission();
      }
      if (permission !== 'granted') {
          addToast("Please enable notifications in your browser settings to receive alerts.", "info");
      }
      const newTask: Task = { ...taskData, id: Date.now() };
      setTasks(prev => [...prev, newTask]);
      addToast(`Task set for ${taskData.itemName}.`, 'success');
  };

  const handleDeleteTask = (id: number) => {
      setTasks(prev => prev.filter(r => r.id !== id));
      addToast("Task deleted.", "info");
  };

  useEffect(() => {
    const interval = setInterval(() => {
        const now = new Date().getTime();
        const dueTasks = tasks.filter(r => new Date(r.dateTime).getTime() <= now);

        if (dueTasks.length > 0 && notificationPermission === 'granted') {
            dueTasks.forEach(task => {
                new Notification(`Task Due: ${task.itemName}`, {
                    body: task.note || `It's time for your scheduled event.`,
                    icon: '/favicon.svg',
                    tag: String(task.id) // Use a tag to prevent duplicate notifications if checker runs fast
                });
            });
            // Remove triggered tasks
            setTasks(currentTasks => currentTasks.filter(r => !dueTasks.some(due => due.id === r.id)));
        }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [tasks, notificationPermission]);

  const addCategory = (category: Omit<Category, 'id'>) => {
      const newCategory = { ...category, id: Date.now() };
      setCategories(prev => [...prev, newCategory]);
      addToast(`Category "${category.name}" created.`, 'success');
      closeModal();
  };

  const updateCategory = (category: Category) => {
      setCategories(prev => prev.map(c => c.id === category.id ? category : c));
      addToast(`Category "${category.name}" updated.`, 'success');
      closeModal();
  };

  const deleteCategory = (id: number) => {
      setTasks(prev => prev.map(task => task.categoryId === id ? { ...task, categoryId: undefined } : task));
      setCategories(prev => prev.filter(c => c.id !== id));
      addToast("Category deleted.", "info");
  };

  const [yatraPlan, setYatraPlan] = React.useState<YatraPlanItem[]>(() => {
    try {
        const savedPlan = localStorage.getItem('yatraPlan');
        if (!savedPlan) return [];
        let parsedPlan = JSON.parse(savedPlan);
        // Migration logic: check if it's the old Temple[] format
        if (parsedPlan.length > 0 && parsedPlan[0].temple === undefined && parsedPlan[0].name !== undefined) {
             parsedPlan = parsedPlan.map((temple: Temple) => ({ // Don't return here, just transform
                temple: temple,
                visitDate: new Date().toISOString().split('T')[0],
                travelMode: 'Car' as TravelMode
            }));
        }
        
        // Ensure all items have a priority property for backward compatibility
        return parsedPlan.map((item: any) => ({
            ...item,
            priority: item.priority || 'Medium',
        }));

    } catch {
        return [];
    }
  });

   const [yatraPlanSettings, setYatraPlanSettings] = useState<YatraPlanSettings>(() => {
    try {
        const saved = localStorage.getItem('divya-darshan-yatra-settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (typeof parsed.startDate !== 'string') {
                 parsed.startDate = new Date().toISOString().split('T')[0];
            }
            return parsed;
        }
    } catch {}
    return {
        numberOfPersons: 1,
        familyMembers: [],
        accommodationTier: 'Comfort (3-star Hotels)',
        foodPreference: 'Satvik',
        transportMode: 'Shared AC Coach',
        startDate: new Date().toISOString().split('T')[0],
        budget: 50000,
    };
   });


  useEffect(() => {
    try {
        localStorage.setItem('yatraPlan', JSON.stringify(yatraPlan));
    } catch (error) {
        console.error("Failed to save yatra plan to localStorage", error);
        addToast("Could not save your Yatra plan. Your browser storage might be full.", "error");
    }
  }, [yatraPlan, addToast]);
  
  useEffect(() => {
    try {
        localStorage.setItem('divya-darshan-yatra-settings', JSON.stringify(yatraPlanSettings));
    } catch (error) {
        addToast("Could not save your Yatra settings.", "error");
    }
}, [yatraPlanSettings, addToast]);

  const t = useMemo(() => I18N_DATA[language], [language]);

  const setView = (newView: View, newId?: string | number) => {
    window.location.hash = newId ? `${newView}/${newId}` : newView;
  };
  
  useEffect(() => {
    if (view === 'profile') {
        setView('settings');
    }
  }, [view]);
  
  useEffect(() => {
    if (view === 'satsang' && !currentUser && !userLoading) {
      addToast("Please log in to join the Satsang.", "info");
    }
  }, [view, currentUser, userLoading, addToast]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
      logout();
      setView('home');
      addToast("You've been logged out.", 'info');
  };

  // --- Yatra Plan Handlers ---
  const toggleInYatraPlan = useCallback((temple: Temple) => {
      setYatraPlan(prevPlan => {
          const isInPlan = prevPlan.some(item => item.temple.id === temple.id);
          if (isInPlan) {
              addToast(`${temple.name} removed from your Yatra.`, 'info');
              return prevPlan.filter(item => item.temple.id !== temple.id);
          } else {
              addToast(`${temple.name} added to your Yatra!`, 'success');
              const newItem: YatraPlanItem = {
                  temple,
                  visitDate: new Date().toISOString().split('T')[0],
                  travelMode: 'Car',
                  priority: 'Medium'
              };
              return [...prevPlan, newItem];
          }
      });
  }, [addToast]);

  const removeFromYatraPlan = useCallback((templeId: number) => {
      setYatraPlan(prevPlan => prevPlan.filter(item => item.temple.id !== templeId));
  }, []);
  
  const updateYatraPlanItem = useCallback((templeId: number, updates: Partial<Omit<YatraPlanItem, 'temple'>>) => {
      setYatraPlan(prevPlan => 
          prevPlan.map(item => 
              item.temple.id === templeId ? { ...item, ...updates } : item
          )
      );
  }, []);

  const isInYatraPlan = useCallback((templeId: number): boolean => {
      return yatraPlan.some(item => item.temple.id === templeId);
  }, [yatraPlan]);

  // --- Modal Handlers ---
  const handleDarshanBooking = async (details: DarshanBookingDetails) => {
      if (!currentUser || !modalProps.temple) return;
      try {
        const result = await api.bookDarshan(modalProps.temple, details, currentUser);
        addToast(result.message, 'success');
        await api.completeSpiritualTask(currentUser.id, 'darshan');
        addToast("You've completed the 'Visit a Temple' task!", 'success');
        closeModal();
        openModal('bookingConfirmation', { type: 'Darshan', itemName: modalProps.temple.name, details, temple: modalProps.temple });
      } catch(err) {
        if(err instanceof Error) addToast(err.message, 'error');
      }
  };

  const handlePoojaBooking = async (details: PoojaBookingDetails) => {
    if (!currentUser) return;
    try {
      const result = await api.bookPooja(details, currentUser);
      addToast(result.message, 'success');
      closeModal();
      openModal('bookingConfirmation', { type: 'Pooja', itemName: details.pooja.name, details, temple: details.temple });
    } catch(err) {
      if(err instanceof Error) addToast(err.message, 'error');
    }
  };

  const handleYatraBooking = async (details: YatraBookingDetails) => {
    if (!currentUser) return;
    try {
      const result = await api.bookYatra(details, currentUser);
      addToast(result.message, 'success');
      closeModal();
      openModal('bookingConfirmation', { type: 'Yatra', itemName: details.yatra.name, details });
    } catch (err) {
      if (err instanceof Error) addToast(err.message, 'error');
    }
  };
  
  const handleYatraQuoteRequest = async (details: YatraQuoteRequest) => {
    if (!currentUser) return;
    try {
        const result = await api.submitYatraQuoteRequest(details, currentUser);
        addToast(result.message, 'success');
        closeModal();
    } catch (err) {
        if (err instanceof Error) addToast(err.message, 'error');
    }
  };
  
  const handlePanditBooking = async (details: { date: Date, timeSlot: string }) => {
      if (!currentUser || !modalProps.pandit || !modalProps.event) return;
      try {
          const result = await api.bookPandit(modalProps.pandit, modalProps.event, currentUser, details);
          addToast(result.message, 'success');
          closeModal();
      } catch (err) {
          if (err instanceof Error) addToast(err.message, 'error');
      }
  };

  const handleDonation = async (amount: number, purpose: DonationOption) => {
      if (!currentUser) return;
      try {
          const result = await api.makeDonation(amount, purpose, currentUser, modalProps.temple);
          addToast(result.message, 'success');
          await api.completeSpiritualTask(currentUser.id, 'seva');
          addToast("You've completed the 'Offer Seva' task!", 'success');
          closeModal();
      } catch (err) {
          if (err instanceof Error) addToast(err.message, 'error');
      }
  };

  const handleTempleSubmission = async (templeData: TempleSubmissionData) => {
    if (!currentUser) return;
    try {
        const result = await api.submitTemple(templeData, currentUser);
        addToast(result.message, 'success');
        closeModal();
    } catch(err) {
        if (err instanceof Error) addToast(err.message, 'error');
    }
  };

  const handleUpdatePoojaAssociations = async (templeId: number, selectedPoojaIds: number[]) => {
    if (!currentUser?.token) return;
    try {
        const result = await api.updatePoojaAssociationsForTemple(templeId, selectedPoojaIds, currentUser.token);
        addToast(result.message, 'success');
        closeModal();
    } catch(err) {
        if(err instanceof Error) addToast(err.message, 'error');
    }
  };

   const handleCompleteMeditation = async () => {
    if (!currentUser) return;
    try {
      await api.completeSpiritualTask(currentUser.id, 'meditate');
      addToast(t.meditationComplete, 'success');
      closeModal();
    } catch (err) {
      if (err instanceof Error) addToast(err.message, 'error');
    }
  };
  
  const handleSevaClick = () => {
    if (currentUser) {
        openModal('donation');
    } else {
        openModal('login');
    }
  };
  
  const getUserLocation = (): Promise<{latitude: number, longitude: number}> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            return reject(new Error("Geolocation is not supported by your browser."));
        }
        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position.coords),
            (error) => reject(error),
            { timeout: 10000 }
        );
    });
  };

  const handleDarshanClick = async (temple: Temple) => {
    if (!currentUser) {
        openModal('login');
        return;
    }

    const highCrowd = temple.crowdLevel === 'High' || temple.crowdLevel === 'Very High';

    if (highCrowd) {
        addToast("High crowd detected, searching for a nearby alternative...", 'info');
        const allTemples = await api.getTemples(language);
        let alternativeTemple: Temple | null = null;
        
        try {
            const userCoords = await getUserLocation();
            alternativeTemple = api.findClosestAlternative(userCoords, temple.id, allTemples);
        } catch (error) {
            addToast("Could not get location. Finding best available alternative.", 'info');
            const originalCity = temple.location.split(',')[0].trim();
            const alternativeInCity = allTemples.find(t => 
                t.id !== temple.id && 
                (t.crowdLevel === 'Low' || t.crowdLevel === 'Medium') &&
                t.location.includes(originalCity)
            );
            alternativeTemple = alternativeInCity || allTemples.find(t => 
                t.id !== temple.id && (t.crowdLevel === 'Low' || t.crowdLevel === 'Medium')
            );
        }
        
        if (alternativeTemple) {
             openModal('crowdAlert', {
                originalTemple: temple,
                alternativeTemple: alternativeTemple,
                onProceed: () => { closeModal(); openModal('darshanBooking', { temple }); },
                onExploreAlternative: () => { closeModal(); setView('templeDetail', alternativeTemple.id); }
            });
        } else {
            openModal('darshanBooking', { temple });
        }
    } else {
        openModal('darshanBooking', { temple });
    }
  };


  const renderView = () => {
    const yatraPlanProps = { yatraPlan: yatraPlan.map(item => item.temple), isInYatraPlan, onToggleYatraPlan: toggleInYatraPlan };
    switch(view) {
      case 'home':
        return <Home t={t} language={language} onDarshanClick={handleDarshanClick} {...yatraPlanProps} />;
      case 'temples':
      case 'poojas':
      case 'yatras':
      case 'events':
        return <GridView type={view} t={t} onDarshanClick={handleDarshanClick} language={language} {...yatraPlanProps} />;
      case 'knowledge':
        return <KnowledgeView t={t} language={language} />;
      case 'chantingZone':
        return <ChantingZone t={t} />;
      case 'chakraSanctuary':
        return <ChakraSanctuary user={currentUser} t={t} />;
      case 'yatraPlanner':
        return <YatraPlannerView 
            t={t} 
            language={language}
            yatraPlan={yatraPlan}
            setYatraPlan={setYatraPlan}
            toggleInYatraPlan={toggleInYatraPlan}
            settings={yatraPlanSettings}
            setSettings={setYatraPlanSettings}
        />;
      case 'satsang':
        if (!currentUser) {
            return <Home t={t} language={language} onDarshanClick={handleDarshanClick} {...yatraPlanProps} />;
        }
        if (id) {
            const roomId = parseInt(id, 10);
            return !isNaN(roomId) ? <ChatRoom roomId={roomId} t={t} /> : <SatsangView t={t} />;
        }
        return <SatsangView t={t} />;
      case 'search':
        return <SearchView query={id!} t={t} language={language} {...yatraPlanProps} />;
      case 'templeDetail':
        return <TempleDetail templeId={id!} t={t} language={language} onDarshanClick={handleDarshanClick} {...yatraPlanProps} />;
      case 'eventDetail':
        return <EventDetail eventId={id!} t={t} language={language} />;
      case 'bookReader':
        return <BookReader bookId={id!} t={t} language={language} />;
      case 'settings':
        return currentUser ? <SettingsView user={currentUser} t={t} setLang={setLanguage} currentLang={language} tasks={tasks} deleteTask={handleDeleteTask} categories={categories} addCategory={addCategory} updateCategory={updateCategory} deleteCategory={deleteCategory} notificationPermission={notificationPermission} requestNotificationPermission={requestNotificationPermission} /> : <Home t={t} language={language} onDarshanClick={handleDarshanClick} {...yatraPlanProps} />;
      case 'dashboard':
        return currentUser?.role === 'admin' ? <AdminDashboard t={t} /> : <Home t={t} language={language} onDarshanClick={handleDarshanClick} {...yatraPlanProps} />;
      default:
        return <Home t={t} language={language} onDarshanClick={handleDarshanClick} {...yatraPlanProps} />;
    }
  };

  if (showSplash) {
    return <SplashScreen onFinished={() => setShowSplash(false)} />;
  }

  return (
    <div className={`relative h-screen md:flex ${theme.className}`}>
      <AnimatedBackground />
      <Sidebar
        currentLang={language}
        setLang={setLanguage}
        t={t}
        currentUser={currentUser}
        currentView={view}
        onSetView={setView}
        onLoginClick={() => openModal('login')}
        onSevaClick={handleSevaClick}
        logout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      {isSidebarOpen && (
          <div 
              onClick={() => setIsSidebarOpen(false)} 
              className="fixed inset-0 bg-black/60 z-30 md:hidden animate-fade-in"
              aria-hidden="true"
          />
      )}

      <div className="relative z-1 flex-1 flex flex-col h-screen overflow-hidden">
        <Header
            currentUser={currentUser}
            t={t}
            onMenuClick={() => setIsSidebarOpen(true)}
            onUserClick={() => setView('settings')}
            onLoginClick={() => openModal('login')}
        />
        <main id="main-content" className="flex-1 overflow-y-auto bg-main transition-colors duration-500" aria-live="polite" aria-busy={userLoading}>
            {userLoading ? (
            <div role="status" className="flex justify-center items-center h-full" aria-label={t.festivalsLoading}>
                <Icon name="lotus" className="h-16 w-16 text-primary animate-spin" />
            </div>
            ) : renderView() }
        </main>
      </div>
      
      {/* Floating Yatra Plan Button */}
      {yatraPlan.length > 0 && view !== 'satsang' && (
          <button
              onClick={() => openModal('yatraPlan', { 
                plan: yatraPlan, 
                settings: yatraPlanSettings,
                onRemove: removeFromYatraPlan, 
                onUpdate: updateYatraPlanItem,
                onOpenPlanner: () => {
                    closeModal();
                    setView('yatraPlanner');
                }
               })}
              className="fixed bottom-6 right-6 z-20 w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform animate-fade-in-up"
              aria-label={`View Yatra Plan with ${yatraPlan.length} temples`}
          >
              <Icon name="compass" className="w-8 h-8"/>
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                  {yatraPlan.length}
              </span>
          </button>
      )}

      {/* MODAL RENDERER */}
      {modalType === 'login' && <LoginModal onClose={closeModal} t={t} />}
      {modalType === 'uploadTemple' && <UploadTempleModal {...modalProps} onClose={closeModal} onSubmit={modalProps.onSubmit || handleTempleSubmission} />}
      {modalType === 'yatraDetail' && modalProps.yatra && <YatraDetailModal yatra={modalProps.yatra} t={t} onClose={closeModal} onBook={() => openModal('yatraBooking', { yatra: modalProps.yatra })} />}
      {modalType === 'liveDarshan' && <LiveDarshanModal onClose={closeModal} />}
      {modalType === 'vrDarshan' && <VRDarshanModal onClose={closeModal} />}
      {modalType === 'darshanBooking' && modalProps.temple && <DarshanBookingModal temple={modalProps.temple} t={t} onClose={closeModal} onConfirm={handleDarshanBooking} />}
      {modalType === 'poojaBooking' && modalProps.pooja && <PoojaBookingModal pooja={modalProps.pooja} temple={modalProps.temple} t={t} onClose={closeModal} onConfirm={handlePoojaBooking} />}
      {modalType === 'yatraBooking' && modalProps.yatra && <YatraBookingModal yatra={modalProps.yatra} t={t} onClose={closeModal} onConfirm={handleYatraBooking} />}
      {modalType === 'panditBooking' && modalProps.pandit && modalProps.event && <PanditBookingModal pandit={modalProps.pandit} event={modalProps.event} t={t} onClose={closeModal} onConfirm={handlePanditBooking} />}
      {modalType === 'donation' && <DonationModal temple={modalProps.temple} t={t} onClose={closeModal} onConfirm={handleDonation} />}
      {modalType === 'crowdAlert' && modalProps.originalTemple && modalProps.alternativeTemple && <CrowdAlertModal {...modalProps} t={t} isOpen={modalType === 'crowdAlert'} onClose={closeModal} />}
      {modalType === 'panditAdmin' && <PanditModal {...modalProps} t={t} onClose={closeModal} />}
      {modalType === 'bookAdmin' && <BookModal {...modalProps} onClose={closeModal} t={t} />}
      {modalType === 'eventAdmin' && <EventModal {...modalProps} onClose={closeModal} t={t} />}
      {modalType === 'festivalAdmin' && <FestivalModal {...modalProps} onClose={closeModal} t={t} />}
      {modalType === 'poojaAdmin' && <PoojaModal {...modalProps} onClose={closeModal} t={t} />}
      {modalType === 'yatraAdmin' && <YatraModal {...modalProps} onClose={closeModal} t={t} />}
      {modalType === 'userAdmin' && modalProps.initialData && <UserModal {...modalProps} onClose={closeModal} t={t} />}
      {modalType === 'confirmation' && modalProps.onConfirm && <ConfirmationModal {...modalProps} isOpen={modalType === 'confirmation'} onClose={closeModal} />}
      {modalType === 'imageDetail' && modalProps.imageUrl && <ImageDetailModal imageUrl={modalProps.imageUrl} altText={modalProps.altText || 'Image'} onClose={closeModal} />}
      {modalType === 'manageTemplePoojas' && modalProps.temple && <ManageTemplePoojasModal temple={modalProps.temple} t={t} onClose={closeModal} onConfirm={handleUpdatePoojaAssociations} />}
      {modalType === 'meditation' && <MeditationModal t={t} onClose={closeModal} onComplete={handleCompleteMeditation} />}
      {modalType === 'bookingConfirmation' && modalProps.details && <BookingConfirmationModal {...modalProps} onClose={closeModal} t={t} />}
      {modalType === 'aiGuruChat' && <AIGuruModal {...modalProps} onClose={closeModal} t={t} />}
      {modalType === 'yatraQuote' && modalProps.details && <YatraQuoteModal {...modalProps} onClose={closeModal} onSubmit={handleYatraQuoteRequest} t={t} />}
      {modalType === 'userProfile' && modalProps.user && <UserProfileModal user={modalProps.user} onClose={closeModal} t={t} />}
      {modalType === 'yatraPlan' && modalProps.plan && <YatraPlannerModal {...modalProps} onClose={closeModal} t={t} />}
      {modalType === 'postCreation' && <PostCreationModal onClose={closeModal} t={t} />}
      {modalType === 'panditRegistration' && <PanditRegistrationModal onClose={closeModal} t={t} />}
      {modalType === 'task' && modalProps.item && <TaskModal {...modalProps} categories={categories} onClose={closeModal} onConfirm={handleSetTask} />}
      {modalType === 'category' && <CategoryModal {...modalProps} onClose={closeModal} onSubmit={'id' in (modalProps.initialData || {}) ? updateCategory : addCategory} />}

    </div>
  );
};
