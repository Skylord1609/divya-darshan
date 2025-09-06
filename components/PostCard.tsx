import React from 'react';
import { Post, User, I18nContent } from '../types';
import { useImageWithFallback } from '../hooks/useImageWithFallback';
import { PLACEHOLDER_IMAGE_URL } from '../constants';
import { Icon } from './Icon';

interface PostCardProps {
    post: Post;
    author: User | undefined;
    currentUser: User | null;
    onToggleLike: (postId: number) => void;
    onViewProfile: (user: User) => void;
    onViewImage: (imageUrl: string, altText: string) => void;
}

export const PostCard = ({ post, author, currentUser, onToggleLike, onViewProfile, onViewImage }: PostCardProps) => {
    const { imgSrc, status } = useImageWithFallback(post.imageUrl, PLACEHOLDER_IMAGE_URL);
    const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;

    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";
        return Math.floor(seconds) + "s";
    }

    if (!author) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-stone-200/80 max-w-xl mx-auto">
            <header className="flex items-center p-3 gap-3">
                <button onClick={() => onViewProfile(author)} className="focus:outline-none focus:ring-2 ring-primary rounded-full">
                    <img src={author.avatarUrl || PLACEHOLDER_IMAGE_URL} alt={author.name} className="w-10 h-10 rounded-full object-cover" />
                </button>
                <button onClick={() => onViewProfile(author)} className="hover:underline">
                    <p className="font-bold text-text-base">{author.name}</p>
                </button>
            </header>

            <div className="relative aspect-square bg-stone-100 group">
                <img src={imgSrc} alt={post.caption} className="w-full h-full object-cover" />
                 <button
                    onClick={() => onViewImage(post.imageUrl, post.caption)}
                    aria-label={`View image: ${post.caption}`}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 cursor-pointer">
                    <Icon name="zoom-in" className="w-12 h-12 text-white" />
                </button>
            </div>

            <footer className="p-3">
                <div className="flex items-center gap-4 mb-2">
                    <button onClick={() => onToggleLike(post.id)} disabled={!currentUser} className="flex items-center gap-1.5 group disabled:cursor-not-allowed">
                        <Icon name="heart-hand" className={`w-7 h-7 transition-colors ${isLiked ? 'text-red-600 fill-red-200' : 'text-text-muted group-hover:text-text-base'}`} />
                    </button>
                     <button className="flex items-center gap-1.5 group">
                        <Icon name="book-open" className="w-7 h-7 text-text-muted group-hover:text-text-base" />
                    </button>
                </div>
                {post.likes.length > 0 && <p className="font-bold text-sm">{post.likes.length} like{post.likes.length > 1 ? 's' : ''}</p>}
                
                <p className="text-text-base mt-1">
                    <button onClick={() => onViewProfile(author)} className="font-bold mr-2 hover:underline">{author.name}</button>
                    {post.caption}
                </p>
                
                {post.comments.length > 0 && (
                     <div className="mt-2 text-sm text-text-muted">
                        {post.comments.slice(0, 2).map(comment => (
                             <p key={comment.id} className="truncate">
                                <span className="font-semibold mr-1">{comment.userName}</span>{comment.text}
                            </p>
                        ))}
                    </div>
                )}
                
                <p className="text-xs text-stone-400 uppercase mt-2">{timeAgo(post.timestamp)} ago</p>
            </footer>
        </div>
    );
};