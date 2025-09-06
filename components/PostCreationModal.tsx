import React, { useState, useRef } from 'react';
import { I18nContent } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import * as api from '../services/apiService';
import { Icon } from './Icon';
import { ImageUpload } from './ImageUpload';

interface PostCreationModalProps {
    onClose: () => void;
    t: I18nContent;
}

export const PostCreationModal = ({ onClose, t }: PostCreationModalProps) => {
    const [caption, setCaption] = useState('');
    const [imageData, setImageData] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageData) {
            addToast('Please upload an image for your post.', 'error');
            return;
        }
        if (!currentUser) {
            addToast('You must be logged in to post.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await api.createPost(caption, imageData, currentUser);
            addToast('Post shared successfully!', 'success');
            onClose();
        } catch (error) {
            addToast(error instanceof Error ? error.message : "Failed to create post.", 'error');
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
                aria-labelledby="post-creation-title"
                className="bg-main rounded-2xl shadow-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto" 
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between pb-3 border-b mb-4">
                     <button onClick={onClose} aria-label="Close" className="text-text-muted hover:text-primary transition-colors text-2xl font-bold">&times;</button>
                     <h2 id="post-creation-title" className="text-xl font-bold text-primary font-heading">Create New Post</h2>
                     <button form="post-form" type="submit" disabled={isLoading} className="font-bold text-primary hover:text-secondary disabled:text-text-muted">Share</button>
                </header>

                <form id="post-form" onSubmit={handleSubmit} className="space-y-4">
                    <ImageUpload onImageUpload={setImageData} />
                    <textarea 
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Write a caption..."
                        className="w-full p-2 h-24 rounded-lg border-2 border-secondary/50 bg-white focus:ring-primary focus:border-primary"
                        rows={4}
                    />
                </form>
            </div>
        </div>
    );
};