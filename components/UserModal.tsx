import React, { useState, useRef } from 'react';
import { Icon } from './Icon';
import { useToast } from '../contexts/ToastContext';
import { User, I18nContent, Role } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';

export interface UserModalProps {
    onSubmit: (data: Partial<User>) => Promise<void>;
    initialData: User;
    t: I18nContent;
    onClose: () => void;
    currentUser?: User | null;
}

export const UserModal = ({ onClose, onSubmit, initialData, t, currentUser }: UserModalProps) => {
    const [role, setRole] = useState<Role>(initialData.role);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    const isSelfEdit = currentUser?.id === initialData.id;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const userPayload = {
                id: initialData.id,
                role,
            };
            await onSubmit(userPayload);
            
        } catch (err) {
            if (err instanceof Error) addToast(err.message, 'error');
            else addToast('An unknown error occurred.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-modal-title"
                className="bg-amber-50 rounded-2xl shadow-2xl w-full max-w-md p-8 relative" 
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    aria-label="Close"
                    className="absolute top-4 right-4 text-stone-500 hover:text-orange-600 transition-colors text-2xl font-bold"
                >&times;</button>
                <div className="text-center mb-6">
                    <Icon name="cosmic-logo" className="h-12 w-12 text-amber-600 mx-auto mb-3" />
                    <h2 id="user-modal-title" className="text-3xl font-bold text-orange-900 font-serif">{t.editUser}</h2>
                    <p className="text-stone-600">{initialData.name} ({initialData.email})</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="role-select" className="block text-sm font-bold text-orange-800 mb-1">User Role</label>
                        <select 
                            id="role-select"
                            value={role} 
                            onChange={(e) => setRole(e.target.value as Role)}
                            className="w-full p-3 rounded-lg border-2 border-orange-200 bg-white disabled:bg-stone-100 disabled:cursor-not-allowed"
                            required
                            disabled={isSelfEdit}
                        >
                            <option value="devotee">Devotee</option>
                            <option value="admin">Admin</option>
                        </select>
                        {isSelfEdit && <p className="text-xs text-stone-500 mt-1">Admins cannot change their own role.</p>}
                    </div>

                    <button type="submit" disabled={isLoading || isSelfEdit} className="w-full bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors disabled:bg-orange-400 disabled:cursor-not-allowed">
                        {isLoading ? 'Saving...' : t.saveChanges}
                    </button>
                </form>
            </div>
        </div>
    );
};