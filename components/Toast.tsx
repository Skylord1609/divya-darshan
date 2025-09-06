import React from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
    const baseClasses = "flex items-center w-full p-4 text-white rounded-lg shadow-lg transform transition-all duration-300 animate-fade-in-right";
    const typeClasses = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600',
    };
    
    const Icon = () => {
        switch (type) {
            case 'success': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
            case 'error': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
            case 'info': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
            default: return null;
        }
    }

  return (
      <div className={`${baseClasses} ${typeClasses[type]}`}>
          <div className="mr-3"><Icon /></div>
          <div className="flex-grow text-sm font-medium">{message}</div>
          <button onClick={onClose} className="ml-4 -mr-2 p-1.5 text-white/80 hover:text-white rounded-lg focus:ring-2 focus:ring-white/50">
              &times;
          </button>
      </div>
  );
};
