import React, { useState, useEffect, useCallback, useRef } from 'react';
import { I18nContent, User, Post } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import * as api from '../services/apiService';
import { Icon } from './Icon';
import { useImageWithFallback } from '../hooks/useImageWithFallback';
import { PLACEHOLDER_IMAGE_URL } from '../constants';

interface UserProfileModalProps {
    user: User;
    t: I18nContent;
    onClose: () => void;
}

export const UserProfileModal = ({ user: initialUser, t, onClose }: UserProfileModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);
    
    const [user, setUser] = useState<User>(initialUser);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const { imgSrc } = useImageWithFallback(user.avatarUrl || '', PLACEHOLDER_IMAGE_URL);

    const isCurrentUserProfile = currentUser?.id === user.id;

    const fetchData = useCallback(async () => {
        try {
            const [fullUser, allPosts] = await Promise.all([
                api.getUserById(initialUser.id),
                api.getPosts()
            ]);
            if (fullUser) {
                setUser(fullUser);
                if (currentUser) {
                    setIsFollowing(fullUser.followers.includes(currentUser.id));
                }
            }
            setUserPosts(allPosts.filter(p => p.userId === initialUser.id));
        } catch {
            addToast("Could not load full profile.", 'error');
        }
    }, [initialUser.id, currentUser, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleFollowToggle = async () => {
        if (!currentUser) {
            addToast("You must be logged in to follow users.", 'info');
            return;
        }
        setIsFollowLoading(true);
        try {
            await api.toggleFollowUser(currentUser.id, user.id);
            // Manually update state for immediate feedback
            setUser(prevUser => {
                const isNowFollowing = !isFollowing;
                const newFollowers = isNowFollowing 
                    ? [...prevUser.followers, currentUser.id] 
                    : prevUser.followers.filter(id => id !== currentUser.id);
                return { ...prevUser, followers: newFollowers };
            });
            setIsFollowing(!isFollowing);
        } catch (error) {
            addToast(error instanceof Error ? error.message : "Action failed.", 'error');
        } finally {
            setIsFollowLoading(false);
        }
    };


    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-profile-title"
                className="bg-main rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] flex flex-col" 
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    aria-label="Close"
                    className="absolute top-4 right-4 text-text-muted hover:text-primary transition-colors text-2xl font-bold"
                >&times;</button>
                
                <header className="flex flex-col items-center border-b pb-4">
                    <img src={imgSrc} alt={user.name} className="w-24 h-24 rounded-full mb-3 border-4 border-primary shadow-lg" />
                    <h2 id="user-profile-title" className="text-2xl font-bold text-primary font-heading">{user.name}</h2>
                    <div className="flex items-center gap-4 mt-2 text-center">
                        <div>
                            <p className="font-bold text-lg">{userPosts.length}</p>
                            <p className="text-xs text-text-muted">Posts</p>
                        </div>
                         <div>
                            <p className="font-bold text-lg">{user.followers.length}</p>
                            <p className="text-xs text-text-muted">Followers</p>
                        </div>
                         <div>
                            <p className="font-bold text-lg">{user.following.length}</p>
                            <p className="text-xs text-text-muted">Following</p>
                        </div>
                    </div>
                    {user.bio && <p className="text-sm text-text-muted mt-3 text-center">{user.bio}</p>}
                    
                    {!isCurrentUserProfile && currentUser && (
                        <button 
                            onClick={handleFollowToggle}
                            disabled={isFollowLoading}
                            className={`w-full mt-4 font-bold py-2 rounded-lg transition-colors ${isFollowing ? 'bg-stone-200 text-stone-800' : 'bg-primary text-white'}`}
                        >
                            {isFollowLoading ? '...' : (isFollowing ? 'Following' : 'Follow')}
                        </button>
                    )}
                </header>

                <main className="flex-grow overflow-y-auto mt-4">
                     <h3 className="font-bold text-lg mb-2">Posts</h3>
                     {userPosts.length > 0 ? (
                        <div className="grid grid-cols-3 gap-1">
                            {userPosts.map(post => (
                                <div key={post.id} className="aspect-square bg-stone-200">
                                    <img src={post.imageUrl} alt={post.caption} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                     ) : (
                        <p className="text-center text-text-muted py-8">No posts yet.</p>
                     )}
                </main>
            </div>
        </div>
    );
};