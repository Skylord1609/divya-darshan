

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as api from '../services/apiService';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  userLoading: boolean;
  login: (email: string, pass: string, rememberMe: boolean) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'facebook') => Promise<void>;
  updateUser: (updates: Partial<Pick<User, 'name' | 'avatarUrl'>>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const saveUserToStorage = (user: User, storage: Storage) => {
    const userToStore = { ...user };
    // If avatar is a large base64 string (>50KB), don't save it to prevent storage bloat.
    // The full user data is re-validated on app load from the "DB" anyway.
    if (userToStore.avatarUrl && userToStore.avatarUrl.startsWith('data:image') && userToStore.avatarUrl.length > 50000) {
        delete userToStore.avatarUrl;
    }
    storage.setItem('divya-darshan-user', JSON.stringify(userToStore));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true); // For initial load

  useEffect(() => {
    // Check for saved user in localStorage or sessionStorage on initial load
    const validateAndSetUser = async () => {
        try {
            let savedUserString = localStorage.getItem('divya-darshan-user');
            if (!savedUserString) {
                savedUserString = sessionStorage.getItem('divya-darshan-user');
            }
            
            if (savedUserString) {
                const savedUser = JSON.parse(savedUserString) as User;
                // Ethical Hacker Fix: Re-validate user role from a "source of truth" to prevent tampering
                const allUsers = await api.getUsersList();
                const trueUser = allUsers.find(u => u.id === savedUser.id);
                
                if (trueUser) {
                    // Important: use the validated user data, not the one from storage which could be tampered with.
                    // Keep the token from the saved session.
                    setCurrentUser({ ...trueUser, token: savedUser.token });
                } else {
                    // The user ID from storage doesn't exist anymore. Log them out.
                    localStorage.removeItem('divya-darshan-user');
                    sessionStorage.removeItem('divya-darshan-user');
                    setCurrentUser(null);
                }
            }
        } catch (error) {
            console.error("Failed to parse or validate user from storage:", error);
            // If parsing fails, remove the corrupted item
            localStorage.removeItem('divya-darshan-user');
            sessionStorage.removeItem('divya-darshan-user');
            setCurrentUser(null);
        } finally {
            setUserLoading(false);
        }
    }
    
    validateAndSetUser();
  }, []);

  const login = async (email: string, pass: string, rememberMe: boolean) => {
    setIsLoading(true);
    try {
      const { user } = await api.loginUser(email, pass);
      setCurrentUser(user);

      // Clear both storages before setting to prevent conflicts
      localStorage.removeItem('divya-darshan-user');
      sessionStorage.removeItem('divya-darshan-user');
      
      if (rememberMe) {
        saveUserToStorage(user, localStorage);
      } else {
        saveUserToStorage(user, sessionStorage);
      }

    } catch (error) {
      // Re-throw the error to be caught in the component
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
        const { user } = await api.registerUser(name, email, pass);
        setCurrentUser(user);
        // Signup defaults to "remember me" for a better first-time experience
        saveUserToStorage(user, localStorage);
    } catch (error) {
        throw error;
    } finally {
        setIsLoading(false);
    }
  };
  
  const loginWithProvider = async (provider: 'google' | 'facebook') => {
      setIsLoading(true);
      try {
          const { user } = await api.loginWithProvider(provider);
          setCurrentUser(user);
          // Social login also defaults to "remember me"
          saveUserToStorage(user, localStorage);
      } catch (error) {
          throw error;
      } finally {
          setIsLoading(false);
      }
  };
  
  const updateUser = async (updates: Partial<Pick<User, 'name' | 'avatarUrl'>>) => {
      if (!currentUser?.token) throw new Error("Not authenticated");
      setIsLoading(true);
      try {
        const { user: updatedUser } = await api.updateUserProfile(currentUser.id, updates, currentUser.token);
        setCurrentUser(updatedUser);
        
        // Check which storage was used to persist the update
        if (localStorage.getItem('divya-darshan-user')) {
            saveUserToStorage(updatedUser, localStorage);
        } else if (sessionStorage.getItem('divya-darshan-user')) {
            saveUserToStorage(updatedUser, sessionStorage);
        }

      } catch (error) {
          throw error;
      } finally {
          setIsLoading(false);
      }
  };
  
  const deleteAccount = async () => {
    if (!currentUser?.token) throw new Error("Not authenticated");
    setIsLoading(true);
    try {
        await api.deleteUser(currentUser.id, currentUser.token);
        logout(); // Clear session after successful deletion
    } catch (error) {
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
    if (currentUser) {
        api.logActivity('login', `User '${currentUser.name}' logged out.`, currentUser);
    }
    setCurrentUser(null);
    localStorage.removeItem('divya-darshan-user');
    sessionStorage.removeItem('divya-darshan-user');
  };

  const value = {
    currentUser,
    isLoading,
    userLoading,
    login,
    signup,
    logout,
    loginWithProvider,
    updateUser,
    deleteAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};