import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import { ChakraTheme } from '../types';
import { CHAKRA_DATA } from '../constants';

interface ThemeContextType {
  theme: ChakraTheme;
  setTheme: (themeName: string) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultTheme = CHAKRA_DATA.find(c => c.name === 'Sahasrara')!;

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ChakraTheme>(() => {
    try {
        const savedThemeName = localStorage.getItem('divya-darshan-theme');
        const savedTheme = CHAKRA_DATA.find(c => c.name === savedThemeName);
        return savedTheme || defaultTheme;
    } catch (error) {
        console.error("Could not load theme from localStorage", error);
        return defaultTheme;
    }
  });

  useEffect(() => {
    try {
        localStorage.setItem('divya-darshan-theme', theme.name);
    } catch (error) {
        console.error("Could not save theme to localStorage", error);
    }
  }, [theme]);
  
  const setTheme = (themeName: string) => {
    const newTheme = CHAKRA_DATA.find(c => c.name === themeName);
    if (newTheme) {
      setThemeState(newTheme);
    }
  };

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
