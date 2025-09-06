

import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { I18nContent } from '../types';

interface LoginModalProps {
    onClose: () => void;
    t: I18nContent;
}

export const LoginModal = ({ onClose, t }: LoginModalProps) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const { login, signup, isLoading, loginWithProvider } = useAuth();
    const { addToast } = useToast();
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isSignUp) {
                await signup(name, email, password);
                addToast("Registration successful! Welcome.", 'success');
            } else {
                await login(email, password, rememberMe);
                addToast("Login successful!", 'success');
            }
            onClose();
        } catch (error) {
            if (error instanceof Error) {
                addToast(error.message, 'error');
            } else {
                addToast('An unknown error occurred.', 'error');
            }
        }
    };
    
    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        try {
            await loginWithProvider(provider);
            addToast(`Logged in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}!`, 'success');
            onClose();
        } catch (error) {
             if (error instanceof Error) {
                addToast(error.message, 'error');
            } else {
                addToast('An unknown error occurred.', 'error');
            }
        }
    };

    const setCredentials = (userType: 'admin' | 'devotee') => {
        setIsSignUp(false); // Ensure it's in login mode
        setEmail(userType === 'admin' ? 'admin@darshan.com' : 'devotee@darshan.com');
        setPassword('password123'); // dummy password
    };
    
    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setName('');
        setEmail('');
        setPassword('');
    }

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="login-modal-title"
                className="bg-main rounded-2xl shadow-2xl w-full max-w-md p-8 relative transform transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    aria-label="Close"
                    className="absolute top-4 right-4 text-text-muted hover:text-primary transition-colors text-2xl font-bold"
                >&times;</button>
                <div className="text-center mb-6">
                    <Icon name="cosmic-logo" className="h-12 w-12 text-primary mx-auto mb-3" />
                    <h2 id="login-modal-title" className="text-3xl font-bold text-primary font-heading">
                        {isSignUp ? 'Create an Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-text-muted">{isSignUp ? 'Join us to start your spiritual journey.' : 'Log in to continue your journey.'}</p>
                </div>

                <div className="space-y-4">
                    <button onClick={() => handleSocialLogin('google')} disabled={isLoading} className="w-full flex items-center justify-center gap-3 bg-white border-2 border-secondary/50 text-text-base font-bold py-3 px-4 rounded-full hover:bg-secondary/10 transition-colors disabled:opacity-50">
                        <Icon name="google" className="w-6 h-6" />
                        {t.loginWithGoogle}
                    </button>
                    <button onClick={() => handleSocialLogin('facebook')} disabled={isLoading} className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white font-bold py-3 px-4 rounded-full hover:bg-[#166eab] transition-colors disabled:opacity-50">
                        <Icon name="facebook" className="w-6 h-6" />
                        {t.loginWithFacebook}
                    </button>
                </div>
                
                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-secondary/30"></div>
                    <span className="flex-shrink mx-4 text-xs text-text-muted">{t.loginOrContinue}</span>
                    <div className="flex-grow border-t border-secondary/30"></div>
                </div>

                <form onSubmit={handleSubmit}>
                    {isSignUp && (
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-primary mb-1" htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 rounded-lg border-2 border-secondary bg-white focus:ring-2 ring-primary focus:outline-none shadow-sm"
                                required
                            />
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-primary mb-1" htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded-lg border-2 border-secondary bg-white focus:ring-2 ring-primary focus:outline-none shadow-sm"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-primary mb-1" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded-lg border-2 border-secondary bg-white focus:ring-2 ring-primary focus:outline-none shadow-sm"
                            required
                        />
                    </div>
                    
                    {!isSignUp && (
                        <div className="mb-6 flex items-center justify-between">
                            <label className="flex items-center text-sm text-text-muted cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 rounded border-secondary text-primary focus:ring-primary"
                                />
                                <span className="ml-2">Remember Me</span>
                            </label>
                            <a href="#" onClick={(e) => { e.preventDefault(); addToast("Forgot Password functionality is not yet implemented.", 'info'); }} className="text-sm text-primary hover:underline">Forgot Password?</a>
                        </div>
                    )}

                    <button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-secondary transition-colors duration-300 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait">
                        {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
                    </button>
                </form>

                <div className="mt-4 text-center text-sm">
                    <button onClick={toggleMode} className="text-primary hover:underline">
                        {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
                    </button>
                    {!isSignUp && (
                        <div className="mt-2 text-xs text-text-muted">
                            <p>For Demo:</p>
                            <button onClick={() => setCredentials('admin')} className="text-primary hover:underline">Login as Admin</button> | <button onClick={() => setCredentials('devotee')} className="text-primary hover:underline">Login as Devotee</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};