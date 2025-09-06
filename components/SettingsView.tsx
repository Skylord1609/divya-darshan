import React, { useState, useMemo } from 'react';
import { User, I18nContent, Language, Task, Category } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Icon } from './Icon';
import { useTheme } from '../contexts/ThemeContext';
import { CHAKRA_DATA } from '../constants';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useModal } from '../contexts/ModalContext';
import { ImageUpload } from './ImageUpload';

interface SettingsViewProps {
    user: User;
    t: I18nContent;
    currentLang: Language;
    setLang: (lang: Language) => void;
    tasks: Task[];
    deleteTask: (id: number) => void;
    categories: Category[];
    addCategory: (category: Omit<Category, 'id'>) => void;
    updateCategory: (category: Category) => void;
    deleteCategory: (id: number) => void;
    notificationPermission: 'granted' | 'denied' | 'default';
    requestNotificationPermission: () => void;
}

const SettingsCard = ({ title, icon, children, actionButton }: { title: string, icon: React.ReactNode, children: React.ReactNode, actionButton?: React.ReactNode }) => (
    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold font-heading flex items-center gap-3">
                {icon} {title}
            </h2>
            {actionButton}
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

export const SettingsView = ({ user, t, currentLang, setLang, tasks, deleteTask, categories, addCategory, updateCategory, deleteCategory, notificationPermission, requestNotificationPermission }: SettingsViewProps) => {
    const { updateUser, logout, deleteAccount, isLoading } = useAuth();
    const { addToast } = useToast();
    const { theme, setTheme } = useTheme();
    const { openModal, closeModal } = useModal();
    const [name, setName] = useState(user.name);
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
    const [activeCategoryFilter, setActiveCategoryFilter] = useState<number | 'all' | 'uncategorized'>('all');

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const hasNameChanged = name !== user.name;
        const hasAvatarChanged = avatarUrl !== (user.avatarUrl || '');
        if (!hasNameChanged && !hasAvatarChanged) return;

        try {
            const updates: { name?: string; avatarUrl?: string } = {};
            if (hasNameChanged) updates.name = name;
            if (hasAvatarChanged) updates.avatarUrl = avatarUrl;
            
            await updateUser(updates);
            addToast("Profile updated successfully!", 'success');
        } catch (error) {
            if (error instanceof Error) addToast(error.message, 'error');
        }
    };
    
    const handleDeleteAccount = () => {
        openModal('confirmation', {
            title: t.deleteAccount,
            message: t.confirmDeleteAccountMessage,
            onConfirm: async () => {
                try {
                    await deleteAccount();
                    addToast("Account deleted successfully.", 'success');
                } catch (error) {
                    if (error instanceof Error) addToast(error.message, 'error');
                }
            }
        });
    };

    const handleCategorySubmit = (categoryData: Omit<Category, 'id'> | Category) => {
        if ('id' in categoryData) {
            updateCategory(categoryData as Category);
        } else {
            addCategory(categoryData);
        }
    };

    const handleDeleteCategory = (category: Category) => {
        openModal('confirmation', {
            title: t.deleteCategory,
            message: t.confirmDeleteCategoryMessage.replace('{categoryName}', category.name),
            onConfirm: () => {
                deleteCategory(category.id);
                closeModal();
            }
        });
    };

    const hasChanges = name !== user.name || avatarUrl !== (user.avatarUrl || '');

    const filteredTasks = useMemo(() => {
        if (activeCategoryFilter === 'all') return tasks;
        if (activeCategoryFilter === 'uncategorized') return tasks.filter(task => !task.categoryId);
        return tasks.filter(task => task.categoryId === activeCategoryFilter);
    }, [tasks, activeCategoryFilter]);

    const getCategoryById = (id: number) => categories.find(c => c.id === id);

    return (
        <div className="animate-fade-in py-8">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-4 mb-8">
                    <Icon name="settings" className="w-12 h-12 text-primary" />
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold font-heading">{t.settingsTitle}</h1>
                        <p className="text-lg text-text-muted">Manage your profile and preferences</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Column 1 */}
                    <div className="space-y-8">
                        <SettingsCard title={t.profileSettings} icon={<Icon name="user-circle" className="w-7 h-7 text-primary" />}>
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-primary mb-1">{t.updateProfilePicture}</label>
                                    <ImageUpload initialImage={avatarUrl} onImageUpload={setAvatarUrl} />
                                </div>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-bold text-primary mb-1">Full Name</label>
                                    <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 rounded-lg border-2 border-secondary/50 bg-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-primary mb-1">Email</label>
                                    <p className="text-text-muted p-2 bg-stone-100 rounded-lg">{user.email}</p>
                                </div>
                                <button type="submit" disabled={isLoading || !hasChanges} className="w-full bg-primary text-white font-bold py-2 px-4 rounded-full hover:bg-secondary transition-all transform hover:scale-105 disabled:opacity-50">
                                    {isLoading ? 'Saving...' : t.saveChanges}
                                </button>
                            </form>
                        </SettingsCard>

                        <SettingsCard title={t.languageSettings} icon={<Icon name="om" className="w-7 h-7 text-primary" />}>
                           <LanguageSwitcher currentLang={currentLang} setLang={setLang} />
                        </SettingsCard>
                        
                        <SettingsCard title="Danger Zone" icon={<Icon name="alert-triangle" className="w-7 h-7 text-red-600" />}>
                           <p className="text-sm text-text-muted">Once you delete your account, there is no going back. Please be certain.</p>
                             <button onClick={handleDeleteAccount} className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-full hover:bg-red-700 transition-all transform hover:scale-105">
                                {t.deleteAccount}
                            </button>
                        </SettingsCard>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-8">
                        <SettingsCard title={t.appearanceSettings} icon={<Icon name="chakra" className="w-7 h-7 text-primary" />}>
                            <div className="grid grid-cols-3 gap-3">
                                {CHAKRA_DATA.map(chakra => (
                                    <button key={chakra.id} onClick={() => setTheme(chakra.name)} className={`p-3 rounded-lg text-center transition-all ${theme.id === chakra.id ? 'ring-2 ring-offset-2 ring-primary' : ''}`}>
                                        <div className="w-10 h-10 rounded-full mx-auto mb-1" style={{ backgroundColor: chakra.color }}></div>
                                        <span className="text-xs font-semibold">{chakra.name}</span>
                                    </button>
                                ))}
                            </div>
                        </SettingsCard>

                         <SettingsCard title={t.manageCategories} icon={<Icon name="edit" className="w-7 h-7 text-primary" />} actionButton={
                            <button onClick={() => openModal('category', { onSubmit: handleCategorySubmit, t })} className="bg-primary/10 text-primary p-2 rounded-full hover:bg-primary/20"><Icon name="plus" className="w-5 h-5"/></button>
                         }>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {categories.length > 0 ? categories.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-2 bg-stone-50 rounded-md">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full" style={{backgroundColor: cat.color}}></div>
                                            <span className="font-semibold">{cat.name}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openModal('category', { initialData: cat, onSubmit: handleCategorySubmit, t })} className="text-blue-600 hover:text-blue-800"><Icon name="edit" className="w-4 h-4"/></button>
                                            <button onClick={() => handleDeleteCategory(cat)} className="text-red-600 hover:text-red-800"><Icon name="trash" className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                )) : <p className="text-text-muted text-center text-sm py-2">{t.noCategories}</p>}
                            </div>
                        </SettingsCard>
                    </div>
                    
                    {/* Column 3 */}
                    <div className="md:col-span-2 lg:col-span-1">
                        <SettingsCard title={t.myTasks} icon={<Icon name="bell" className="w-7 h-7 text-primary" />}>
                            {notificationPermission !== 'granted' && (
                                <div className={`p-3 rounded-lg mb-4 text-sm ${notificationPermission === 'denied' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                    <p>{notificationPermission === 'denied' ? t.notificationsBlocked : t.notificationPermissionRequest}</p>
                                    {notificationPermission !== 'denied' && <button onClick={requestNotificationPermission} className="mt-2 font-bold hover:underline">{t.grantPermission}</button>}
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <button onClick={() => setActiveCategoryFilter('all')} className={`px-3 py-1 text-sm rounded-full ${activeCategoryFilter === 'all' ? 'bg-primary text-white' : 'bg-stone-200'}`}>{t.filterAll}</button>
                                {categories.map(cat => (
                                    <button key={cat.id} onClick={() => setActiveCategoryFilter(cat.id)} className={`px-3 py-1 text-sm rounded-full text-white ${activeCategoryFilter === cat.id ? 'ring-2 ring-offset-1 ring-primary' : ''}`} style={{backgroundColor: cat.color}}>{cat.name}</button>
                                ))}
                                 <button onClick={() => setActiveCategoryFilter('uncategorized')} className={`px-3 py-1 text-sm rounded-full ${activeCategoryFilter === 'uncategorized' ? 'bg-primary text-white' : 'bg-stone-200'}`}>{t.uncategorized}</button>
                            </div>
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {filteredTasks.length > 0 ? [...filteredTasks].sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()).map(task => {
                                    const category = task.categoryId ? getCategoryById(task.categoryId) : null;
                                    return (
                                        <div key={task.id} className="bg-stone-50 p-3 rounded-md">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-text-base">{task.itemName}</p>
                                                    <p className="text-sm text-text-muted">{new Date(task.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                                </div>
                                                <button onClick={() => deleteTask(task.id)} title={t.deleteTask} className="p-1 text-red-500 hover:bg-red-100 rounded-full flex-shrink-0 ml-2">
                                                    <Icon name="trash" className="w-5 h-5" />
                                                </button>
                                            </div>
                                            {task.note && <p className="text-sm italic text-stone-600 mt-1">"{task.note}"</p>}
                                            {category && <div className="mt-2 inline-flex items-center gap-2 text-xs font-semibold px-2 py-0.5 rounded-full" style={{backgroundColor: `${category.color}33`, color: category.color}}><div className="w-2 h-2 rounded-full" style={{backgroundColor: category.color}}></div>{category.name}</div>}
                                        </div>
                                    );
                                }) : (
                                    <p className="text-text-muted text-center py-4">{t.noTasksSet}</p>
                                )}
                            </div>
                        </SettingsCard>
                    </div>
                </div>
            </div>
        </div>
    );
};