import React, { useState, useEffect, useCallback } from 'react';
import { AdminTemple, User, ActivityLogItem, Temple, CrowdLevel, Festival, I18nContent, Pooja, Yatra, Book, Language, MajorEvent, Pandit } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useModal } from '../contexts/ModalContext';
import * as api from '../services/apiService';
import { ActivityLogItem as ActivityLogItemComponent } from './ActivityLogItem';
import { CrowdLevelIndicator } from './CrowdLevelIndicator';
import { PLACEHOLDER_IMAGE_URL } from '../constants';
import { useImageWithFallback } from '../hooks/useImageWithFallback';
import { StatCard } from './StatCard';
import { Icon } from './Icon';

const PendingItemRow = React.memo(({ item, type }: { item: AdminTemple | Pandit; type: 'temple' | 'pandit' }) => {
    const { imgSrc, status, onLoad, onError } = useImageWithFallback(item.imageUrl, PLACEHOLDER_IMAGE_URL);
    return (
        <div className="relative w-full md:w-40 h-40 flex-shrink-0 bg-stone-200 rounded-md border-4 border-white shadow-sm">
            {status !== 'loaded' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {status === 'loading' && <Icon name="lotus" className="w-8 h-8 text-stone-400 animate-spin" />}
                    {status === 'error' && <Icon name="alert-triangle" className="w-8 h-8 text-red-400" />}
                </div>
            )}
            <img 
                src={imgSrc} 
                alt={item.name} 
                crossOrigin="anonymous"
                onLoad={onLoad}
                onError={onError} 
                className={`w-full h-full object-cover rounded-sm transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`} 
            />
        </div>
    );
});
PendingItemRow.displayName = 'PendingItemRow';

const Thumbnail = React.memo(({ src, alt, onClick }: { src: string; alt: string; onClick: () => void }) => {
    const { imgSrc, status, onLoad, onError } = useImageWithFallback(src, PLACEHOLDER_IMAGE_URL);
    return (
        <button onClick={onClick} className="relative w-12 h-12 flex-shrink-0 focus:outline-none focus:ring-2 ring-primary rounded-md bg-stone-200">
             {status !== 'loaded' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {status === 'loading' && <Icon name="lotus" className="w-5 h-5 text-stone-400 animate-spin" />}
                </div>
            )}
            <img 
                src={imgSrc} 
                alt={alt} 
                crossOrigin="anonymous"
                onLoad={onLoad}
                onError={onError} 
                className={`w-full h-full object-cover rounded-md border-2 border-white shadow-sm transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`} 
            />
        </button>
    );
});
Thumbnail.displayName = 'Thumbnail';


interface ManagementTableProps<T> {
    title: string;
    data: T[];
    columns: { header: string; accessor: (item: T) => React.ReactNode }[];
    onAddItem: () => void;
    onEditItem: (item: T) => void;
    onDeleteItem: (item: T) => void;
    onManagePoojas?: (item: T) => void;
    icon: React.ReactNode;
    addItemText: string;
    isLoading: boolean;
}

const ManagementTable = <T extends { id: number, name: string, imageUrl?: string }>({ title, data, columns, onAddItem, onEditItem, onDeleteItem, onManagePoojas, icon, addItemText, isLoading }: ManagementTableProps<T>) => {
    const { openModal } = useModal();
    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-heading flex items-center">{icon} {title}</h2>
                <button 
                    onClick={onAddItem} 
                    className="bg-green-600 text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-green-700 transition flex items-center gap-2"
                >
                    <Icon name="plus" className="w-4 h-4"/>{addItemText}
                </button>
            </div>
            <div className="overflow-x-auto relative shadow-md sm:rounded-lg max-h-[400px]">
                <table className="w-full text-sm text-left text-stone-600">
                    <thead className="text-xs text-stone-700 uppercase bg-stone-100 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">Image</th>
                            {columns.map(col => <th key={col.header} scope="col" className="px-6 py-3">{col.header}</th>)}
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? [...Array(3)].map((_, i) => (
                            <tr key={i} className="bg-white border-b animate-pulse">
                                <td className="px-6 py-4"><div className="h-12 w-12 skeleton-bg rounded-md"></div></td>
                                {columns.map(col => <td key={col.header} className="px-6 py-4"><div className="h-5 skeleton-bg rounded w-full"></div></td>)}
                                <td className="px-6 py-4"><div className="h-5 skeleton-bg rounded w-3/4"></div></td>
                            </tr>
                        )) : data.length > 0 ? data.map(item => (
                            <tr key={item.id} className="bg-white border-b hover:bg-stone-50 align-middle">
                                <td className="px-6 py-4">
                                    <Thumbnail src={item.imageUrl || ''} alt={item.name} onClick={() => openModal('imageDetail', { imageUrl: item.imageUrl, altText: item.name })} />
                                </td>
                                {columns.map(col => <td key={col.header} className="px-6 py-4">{col.accessor(item)}</td>)}
                                <td className="px-6 py-4 flex gap-2">
                                    <button onClick={() => onEditItem(item)} className="p-2 text-blue-600 hover:text-blue-800" title="Edit"><Icon name="edit" className="w-5 h-5"/></button>
                                    <button onClick={() => onDeleteItem(item)} className="p-2 text-red-600 hover:text-red-800" title="Delete"><Icon name="trash" className="w-5 h-5"/></button>
                                    {onManagePoojas && <button onClick={() => onManagePoojas(item)} className="p-2 text-purple-600 hover:text-purple-800" title="Manage Poojas"><Icon name="bell" className="w-5 h-5"/></button>}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={columns.length + 2} className="px-6 py-10 text-center text-stone-500">No items found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

interface AdminDashboardProps {
    t: I18nContent;
}

const CROWD_LEVELS: CrowdLevel[] = ['Low', 'Medium', 'High', 'Very High'];

interface AdminStats {
    users: number;
    poojas: number;
    bookings: number;
    festivals: number;
    yatras: number;
    books: number;
    pandits: number;
    events: number;
}

export const AdminDashboard = ({ t }: AdminDashboardProps) => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const { openModal, closeModal } = useModal();

    const [pendingTemples, setPendingTemples] = useState<AdminTemple[]>([]);
    const [pendingPandits, setPendingPandits] = useState<Pandit[]>([]);
    const [allTemples, setAllTemples] = useState<Temple[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
    const [festivals, setFestivals] = useState<Festival[]>([]);
    const [poojas, setPoojas] = useState<Pooja[]>([]);
    const [yatras, setYatras] = useState<Yatra[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [pandits, setPandits] = useState<Pandit[]>([]);
    const [events, setEvents] = useState<MajorEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const fetchData = useCallback(async (key: string, fetcher: () => Promise<any>, setter: (data: any) => void) => {
        try {
            const data = await fetcher();
            setter(data);
        } catch (err) {
            const message = `Failed to load ${key}: ${err instanceof Error ? err.message : 'Unknown error'}`;
            console.error(message);
            addToast(message, 'error');
        }
    }, [addToast]);
    
    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            const dataFetchers = {
                pending_temples: () => fetchData('pending temples', api.getPendingTemples, setPendingTemples),
                pending_pandits: () => fetchData('pending pandits', api.getPendingPandits, setPendingPandits),
                stats: () => fetchData('stats', () => api.getAdminStats(currentUser!.token!), setStats),
                users: () => fetchData('users', api.getUsersList, setUsers),
                activity_log: () => fetchData('activity log', api.getActivityLog, setActivityLog),
                temples: () => fetchData('temples', () => api.getTemples(Language.EN), (data) => setAllTemples(data.sort((a,b) => a.name.localeCompare(b.name)))),
                festivals: () => fetchData('festivals', () => api.getFestivals(Language.EN), (data) => setFestivals(data.sort((a,b) => a.name.localeCompare(b.name)))),
                poojas: () => fetchData('poojas', () => api.getPoojas(Language.EN), (data) => setPoojas(data.sort((a,b) => a.name.localeCompare(b.name)))),
                yatras: () => fetchData('yatras', () => api.getYatras(Language.EN), (data) => setYatras(data.sort((a,b) => a.name.localeCompare(b.name)))),
                books: () => fetchData('books', () => api.getBooks(Language.EN), (data) => setBooks(data.sort((a,b) => a.name.localeCompare(b.name)))),
                pandits: () => fetchData('pandits', () => api.getPandits(Language.EN), (data) => setPandits(data.sort((a,b) => a.name.localeCompare(b.name)))),
                events: () => fetchData('events', () => api.getMajorEvents(Language.EN), (data) => setEvents(data.sort((a,b) => a.name.localeCompare(b.name)))),
            };
            await Promise.all(Object.values(dataFetchers).map(fn => fn()));
        } finally {
            setIsLoading(false);
        }
    }, [fetchData, currentUser]);

    useEffect(() => {
        if(currentUser?.token) {
            fetchAllData();
        }

        const handleDataUpdate = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail?.key) {
               fetchAllData();
            }
        };

        window.addEventListener(api.DATA_UPDATED_EVENT, handleDataUpdate);
        
        return () => {
            window.removeEventListener(api.DATA_UPDATED_EVENT, handleDataUpdate);
        };
    }, [currentUser, fetchAllData]);

    const handleApproval = async (templeId: number, status: 'approved' | 'rejected') => {
        if (!currentUser?.token) return;
        setProcessingId(templeId);
        try {
            const result = await api.processTempleSubmission(templeId, status, currentUser.token);
            addToast(result.message, 'success');
        } catch (err) {
             if(err instanceof Error) addToast(`Error: ${err.message}`, 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handlePanditApproval = async (panditId: number, status: 'approved' | 'rejected') => {
        if (!currentUser?.token) return;
        setProcessingId(panditId);
        try {
            const result = status === 'approved' 
                ? await api.approvePandit(panditId, currentUser.token)
                : await api.rejectPandit(panditId, currentUser.token);
            addToast(result.message, 'success');
        } catch (err) {
            if (err instanceof Error) addToast(`Error: ${err.message}`, 'error');
        } finally {
            setProcessingId(null);
        }
    };
    
    // --- Generic Item Handlers ---
    const handleItemSubmit = (type: 'pooja' | 'yatra' | 'book' | 'festival' | 'pandit' | 'event' | 'temple') => async (itemData: any) => {
        if (!currentUser?.token) return;
        try {
            let result;
            const isUpdate = !!itemData.id;
            
            switch(type) {
                case 'pooja': result = isUpdate ? await api.updatePooja(itemData, currentUser.token) : await api.addPooja(itemData, currentUser.token); break;
                case 'yatra': result = isUpdate ? await api.updateYatra(itemData, currentUser.token) : await api.addYatra(itemData, currentUser.token); break;
                case 'book': result = isUpdate ? await api.updateBook(itemData, currentUser.token) : await api.addBook(itemData, currentUser.token); break;
                case 'festival': result = isUpdate ? await api.updateFestival(itemData, currentUser.token) : await api.addFestival(itemData, currentUser.token); break;
                case 'pandit': result = isUpdate ? await api.updatePandit(itemData, currentUser.token) : await api.addPandit(itemData, currentUser.token); break;
                case 'event': result = isUpdate ? await api.updateEvent(itemData, currentUser.token) : await api.addEvent(itemData, currentUser.token); break;
                case 'temple': result = isUpdate ? await api.updateTemple(itemData.id, itemData, currentUser.token) : await api.addTempleDirectly(itemData, currentUser.token); break;
            }
            
            addToast(result.message, 'success');
            closeModal();
        } catch (err) {
            if (err instanceof Error) addToast(err.message, 'error');
        }
    };

    const handleItemDelete = (type: 'pooja' | 'yatra' | 'book' | 'festival' | 'pandit' | 'event' | 'temple') => async (item: {id: number, name: string}) => {
        if (!currentUser?.token) return;
        openModal('confirmation', {
            title: t.confirmDeleteTitle,
            message: `${t.confirmDeleteMessage.replace('this item', `"${item.name}"`)}`,
            onConfirm: async () => {
                try {
                     switch(type) {
                        case 'pooja': await api.deletePooja(item.id, currentUser.token); break;
                        case 'yatra': await api.deleteYatra(item.id, currentUser.token); break;
                        case 'book': await api.deleteBook(item.id, currentUser.token); break;
                        case 'festival': await api.deleteFestival(item.id, currentUser.token); break;
                        case 'pandit': await api.deletePandit(item.id, currentUser.token); break;
                        case 'event': await api.deleteEvent(item.id, currentUser.token); break;
                        case 'temple': await api.deleteTemple(item.id, currentUser.token); break;
                    }
                    addToast(`'${item.name}' deleted.`, 'success');
                    closeModal();
                } catch(err) {
                    if(err instanceof Error) addToast(err.message, 'error');
                }
            }
        });
    };

    const handleUserRoleUpdate = async (userData: Partial<User>) => {
        if (!currentUser?.token || !userData.id || !userData.role) return;
        try {
            const result = await api.updateUserRole(userData.id, userData.role, currentUser.token);
            addToast(result.message, 'success');
            closeModal();
        } catch (err) {
            if (err instanceof Error) addToast(err.message, 'error');
        }
    };

    const handleUserDelete = (userToDelete: User) => {
        if (!currentUser?.token) return;
        openModal('confirmation', {
            title: `Delete User`,
            message: `Are you sure you want to delete the user "${userToDelete.name}"? This action cannot be undone.`,
            onConfirm: async () => {
                try {
                    const result = await api.deleteUserByAdmin(userToDelete.id, currentUser.token);
                    addToast(result.message, 'success');
                    closeModal();
                } catch(err) {
                    if(err instanceof Error) addToast(err.message, 'error');
                }
            }
        });
    };


    if (!currentUser) return null;

    return (
        <div className="py-12 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold font-heading">Admin Dashboard</h1>
                    <p className="text-text-muted">Welcome, {currentUser.name}. Manage the platform here.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
                   <StatCard title="Pending" value={pendingTemples.length + pendingPandits.length} icon={<Icon name="temple" className="h-6 w-6" />} />
                   <StatCard title="Users" value={stats?.users ?? '...'} icon={<Icon name="users" className="h-6 w-6" />} />
                   <StatCard title="Bookings" value={stats?.bookings ?? '...'} icon={<Icon name="clipboard-list" className="h-6 w-6" />} />
                   <StatCard title="Temples" value={allTemples.length} icon={<Icon name="temple" className="h-6 w-6" />} />
                   <StatCard title="Poojas" value={stats?.poojas ?? '...'} icon={<Icon name="bell" className="h-6 w-6" />} />
                   <StatCard title="Yatras" value={stats?.yatras ?? '...'} icon={<Icon name="compass" className="h-6 w-6" />} />
                   <StatCard title="Events" value={stats?.events ?? '...'} icon={<Icon name="users-group" className="h-6 w-6" />} />
                   <StatCard title="Pandits" value={stats?.pandits ?? '...'} icon={<Icon name="user-circle" className="h-6 w-6" />} />
                   <StatCard title="Books" value={stats?.books ?? '...'} icon={<Icon name="book-open" className="h-6 w-6" />} />
                   <StatCard title="Festivals" value={stats?.festivals ?? '...'} icon={<Icon name="calendar" className="h-6 w-6" />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        {/* Pending Items */}
                        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold font-heading mb-6 flex items-center"><Icon name="clock" className="w-7 h-7 mr-3"/>Pending Approvals</h2>
                            {pendingPandits.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="font-semibold text-lg mb-2">Pandit Registrations ({pendingPandits.length})</h3>
                                    {pendingPandits.map(pandit => (
                                         <div key={pandit.id} className="flex flex-col md:flex-row items-start md:items-center gap-6 p-4 border rounded-lg bg-stone-50 transition-shadow hover:shadow-md">
                                            <PendingItemRow item={pandit} type="pandit" />
                                            <div className="flex-grow">
                                                <h3 className="text-xl font-bold text-stone-800">{pandit.name}</h3>
                                                <p className="text-sm text-stone-500 mb-2">{pandit.location} | {pandit.experience} years exp.</p>
                                                <p className="text-sm text-stone-700"><b>Specialties:</b> {pandit.specialties.join(', ')}</p>
                                            </div>
                                            <div className="flex-shrink-0 flex items-center gap-2 self-end md:self-center">
                                                <button onClick={() => handlePanditApproval(pandit.id, 'approved')} disabled={processingId === pandit.id} className="bg-green-600 text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-green-700 transition disabled:bg-green-400">Approve</button>
                                                <button onClick={() => handlePanditApproval(pandit.id, 'rejected')} disabled={processingId === pandit.id} className="bg-red-600 text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-red-700 transition disabled:bg-red-400">Reject</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                             {pendingTemples.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Temple Submissions ({pendingTemples.length})</h3>
                                    {pendingTemples.map(temple => (
                                         <div key={temple.id} className="flex flex-col md:flex-row items-start md:items-center gap-6 p-4 border rounded-lg bg-stone-50 transition-shadow hover:shadow-md">
                                            <PendingItemRow item={temple} type="temple" />
                                            <div className="flex-grow">
                                                <h3 className="text-xl font-bold text-stone-800">{temple.name}</h3>
                                                <p className="text-sm text-stone-500 mb-2">{temple.location} | Submitted by: <span className="font-semibold">{temple.submittedBy}</span></p>
                                                <p className="text-sm text-stone-700 line-clamp-3">{temple.history}</p>
                                            </div>
                                            <div className="flex-shrink-0 flex items-center gap-2 self-end md:self-center">
                                                <button onClick={() => handleApproval(temple.id, 'approved')} disabled={processingId === temple.id} className="bg-green-600 text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-green-700 transition disabled:bg-green-400 disabled:cursor-wait">{processingId === temple.id ? '...' : 'Approve'}</button>
                                                <button onClick={() => handleApproval(temple.id, 'rejected')} disabled={processingId === temple.id} className="bg-red-600 text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-red-700 transition disabled:bg-red-400 disabled:cursor-wait">{processingId === temple.id ? '...' : 'Reject'}</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {isLoading ? <p>Loading...</p> : pendingPandits.length === 0 && pendingTemples.length === 0 && <p className="text-center py-8 text-stone-600">No pending items. Well done!</p>}
                        </div>

                        {/* Content Management Tables */}
                        <ManagementTable<Temple> title="Temple Management" icon={<Icon name="temple" className="w-7 h-7 mr-3"/>} data={allTemples} isLoading={isLoading} columns={[{ header: 'Name', accessor: (i) => i.name }, { header: 'Location', accessor: (i) => i.location }, { header: 'Deity', accessor: (i) => i.deity }]} onAddItem={() => openModal('uploadTemple', { onSubmit: handleItemSubmit('temple'), t, title: t.addTemple, buttonText: t.addTemple })} onEditItem={(item) => openModal('uploadTemple', { initialData: item, onSubmit: handleItemSubmit('temple'), t, title: t.editTemple, buttonText: t.saveChanges })} onDeleteItem={handleItemDelete('temple')} onManagePoojas={(item) => openModal('manageTemplePoojas', { temple: item })} addItemText={t.addTemple} />
                        <ManagementTable<Pooja> title="Pooja Management" icon={<Icon name="bell" className="w-7 h-7 mr-3"/>} data={poojas} isLoading={isLoading} columns={[{ header: 'Name', accessor: (i) => i.name }, { header: 'Cost', accessor: (i) => `₹${i.cost}` }, { header: 'Duration', accessor: (i) => i.duration }]} onAddItem={() => openModal('poojaAdmin', { onSubmit: handleItemSubmit('pooja'), t })} onEditItem={(item) => openModal('poojaAdmin', { initialData: item, onSubmit: handleItemSubmit('pooja'), t })} onDeleteItem={handleItemDelete('pooja')} addItemText={t.addPooja} />
                        <ManagementTable<Yatra> title="Yatra Management" icon={<Icon name="compass" className="w-7 h-7 mr-3"/>} data={yatras} isLoading={isLoading} columns={[{ header: 'Name', accessor: (i) => i.name }, { header: 'Duration', accessor: (i) => `${i.durationDays} Days` }, { header: 'Group Size', accessor: (i) => i.groupSize }]} onAddItem={() => openModal('yatraAdmin', { onSubmit: handleItemSubmit('yatra'), t })} onEditItem={(item) => openModal('yatraAdmin', { initialData: item, onSubmit: handleItemSubmit('yatra'), t })} onDeleteItem={handleItemDelete('yatra')} addItemText={t.addYatra} />
                        <ManagementTable<MajorEvent> title="Event Management" icon={<Icon name="users-group" className="w-7 h-7 mr-3"/>} data={events} isLoading={isLoading} columns={[{ header: 'Name', accessor: (i) => i.name }, { header: 'Dates', accessor: (i) => i.dates }, { header: 'Location', accessor: (i) => i.location }]} onAddItem={() => openModal('eventAdmin', { onSubmit: handleItemSubmit('event'), t })} onEditItem={(item) => openModal('eventAdmin', { initialData: item, onSubmit: handleItemSubmit('event'), t })} onDeleteItem={handleItemDelete('event')} addItemText={t.addEvent} />
                        <ManagementTable<Pandit> title="Pandit Management" icon={<Icon name="user-circle" className="w-7 h-7 mr-3"/>} data={pandits} isLoading={isLoading} columns={[{ header: 'Name', accessor: (i) => i.name }, { header: 'Location', accessor: (i) => i.location }, { header: 'Specialization', accessor: (i) => i.specialization }]} onAddItem={() => openModal('panditAdmin', { onSubmit: handleItemSubmit('pandit'), events, t })} onEditItem={(item) => openModal('panditAdmin', { initialData: item, onSubmit: handleItemSubmit('pandit'), events, t })} onDeleteItem={handleItemDelete('pandit')} addItemText={t.addPandit} />
                        <ManagementTable<Book> title="Book Management" icon={<Icon name="book-open" className="w-7 h-7 mr-3"/>} data={books} isLoading={isLoading} columns={[{ header: 'Name', accessor: (i) => i.name }, { header: 'Description', accessor: (i) => <p className="line-clamp-2">{i.description}</p> }]} onAddItem={() => openModal('bookAdmin', { onSubmit: handleItemSubmit('book'), t })} onEditItem={(item) => openModal('bookAdmin', { initialData: item, onSubmit: handleItemSubmit('book'), t })} onDeleteItem={handleItemDelete('book')} addItemText={t.addBook} />
                        <ManagementTable<Festival> title="Festival Management" icon={<Icon name="calendar" className="w-7 h-7 mr-3"/>} data={festivals} isLoading={isLoading} columns={[{ header: 'Name', accessor: (i) => i.name }, { header: 'Date', accessor: (i) => i.date }]} onAddItem={() => openModal('festivalAdmin', { onSubmit: handleItemSubmit('festival'), t })} onEditItem={(item) => openModal('festivalAdmin', { initialData: item, onSubmit: handleItemSubmit('festival'), t })} onDeleteItem={handleItemDelete('festival')} addItemText={t.addFestival} />

                    </div>

                    <div className="lg:col-span-1 space-y-12">
                        {/* User Management */}
                        <div className="bg-white p-8 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold font-heading mb-6 flex items-center"><Icon name="users" className="w-7 h-7 mr-3"/>User Management</h2>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                               {isLoading ? [...Array(5)].map((_, i) => (
                                   <div key={i} className="flex items-center space-x-4 p-2 animate-pulse">
                                       <div className="w-10 h-10 skeleton-bg rounded-full"></div>
                                       <div className="flex-1 space-y-2">
                                           <div className="h-4 skeleton-bg-darker rounded w-3/4"></div>
                                           <div className="h-3 skeleton-bg rounded w-1/2"></div>
                                       </div>
                                   </div>
                               )) : users.map(user => (
                                    <div key={user.id} className="flex items-center space-x-4 p-2 hover:bg-stone-50 rounded-lg">
                                        <Icon name="user-circle" className="w-10 h-10 text-primary flex-shrink-0" />
                                        <div className="flex-grow">
                                            <p className="font-bold text-stone-800">{user.name}</p>
                                            <p className="text-sm text-stone-500">{user.email} - <span className="capitalize font-semibold">{user.role}</span></p>
                                        </div>
                                        <button onClick={() => openModal('userAdmin', { initialData: user, onSubmit: handleUserRoleUpdate, t, currentUser })} className="text-blue-600 hover:text-blue-800 p-2">
                                            <Icon name="edit" className="w-5 h-5"/>
                                        </button>
                                        <button
                                            onClick={() => handleUserDelete(user)}
                                            disabled={user.id === currentUser.id}
                                            className="text-red-600 hover:text-red-800 p-2 disabled:text-stone-400 disabled:cursor-not-allowed"
                                            aria-label={`Delete ${user.name}`}
                                            title={user.id === currentUser.id ? "Cannot delete yourself" : `Delete ${user.name}`}
                                        >
                                            <Icon name="trash" className="w-5 h-5"/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Activity Log */}
                        <div className="bg-white p-8 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold font-heading mb-6 flex items-center"><Icon name="clipboard-list" className="w-7 h-7 mr-3"/>Recent Activity</h2>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                               {isLoading ? [...Array(6)].map((_, i) => (
                                   <div key={i} className="flex items-start space-x-3 animate-pulse">
                                       <div className="w-8 h-8 skeleton-bg rounded-full"></div>
                                       <div className="flex-1 space-y-2">
                                           <div className="h-4 skeleton-bg-darker rounded w-full"></div>
                                           <div className="h-3 skeleton-bg rounded w-1/3"></div>
                                       </div>
                                   </div>
                               )) : activityLog.map(item => <ActivityLogItemComponent key={item.id} item={item} />)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};