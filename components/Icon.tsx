
import React from 'react';
import { IconName } from '../types';

interface IconProps {
    name: IconName;
    className?: string;
    style?: React.CSSProperties;
}

export const Icon = ({ name, className, style }: IconProps) => {
    const icons: Record<IconName, React.ReactNode> = {
        'alert-triangle': <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
        'bell': <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
        'book-open': <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>,
        'camera': <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></>,
        'calendar': <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
        'chakra': <><circle cx="12" cy="12" r="2" /><path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 22a10 10 0 1 0-10-10" /><path d="M2 12h20" /><path d="M12 2v20" /><path d="m5 19 2-2" /><path d="m19 5-2 2" /><path d="m5 5 2 2" /><path d="m19 19-2-2" /></>,
        'check-circle': <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
        'chevron-left': <polyline points="15 18 9 12 15 6" />,
        'circle': <circle cx="12" cy="12" r="10" />,
        'clipboard-list': <><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></>,
        'clock': <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
        'compass': <><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></>,
        'conch': <path d="M4.3 12.3c-1-1.5-1-3.6.3-5.5 1.4-2 3.8-3 6.2-3h.2c.4 0 .7.3.7.7v0c0 .4-.3.7-.7.7h-.2c-2 0-4 1-5.2 2.7-1 1.5-1.1 3-.3 4.1.9 1.1 2.3 1.2 3.5 1.2h2.5c.4 0 .7.3.7.7v0c0 .4-.3.7-.7.7H9.3c-1.3 0-2.8.2-4.1.8-1.3.6-2.6 1.7-2.6 3.1 0 1.9 1.6 3.4 3.6 3.4 2 0 3.6-1.5 3.6-3.4 0-.4-.3-.7-.7-.7v0c-.4 0-.7.3-.7.7 0 1.1-.9 2-2.1 2-1.2 0-2.1-1-2.1-2.1 0-.9.6-1.7 1.7-2.1.9-.4 2-.5 3-.5h10.3c.4 0 .7-.3.7-.7v0c0-.4-.3.7-.7-.7H15c-3.1 0-5.7-2.5-5.7-5.7 0-1.6.7-3.2 1.8-4.3" />,
        'cosmic-logo': <g strokeWidth="2.5"><path d="M12 5V19 M5 12H19 M12 5H19 M19 12V19 M12 19H5 M5 12V5" /><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="8.5" cy="15.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" stroke="none"/></g>,
        'animated-cosmic-logo': <g className="animate-om-pulse" style={{ transformOrigin: 'center' }}><g strokeWidth="2.5"><path d="M12 5V19 M5 12H19 M12 5H19 M19 12V19 M12 19H5 M5 12V5" /><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="8.5" cy="15.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" stroke="none"/></g></g>,
        'diya': <><path d="M8.58 2.58A2 2 0 1 1 10 4a2 2 0 0 1-.42-1.42" /><path d="M12 4v4" /><path d="M15.42 2.58A2 2 0 1 0 14 4a2 2 0 0 0 .42-1.42" /><path d="M12 8h.01" /><path d="M3 14h18" /><path d="M5 18h14" /><path d="M12 22V18" /></>,
        'edit': <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
        'facebook': <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
        'flame': <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
        'flower': <><path d="M12 7.5a4.5 4.5 0 1 1-4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 3M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5a4.5 4.5 0 1 0 4.5-4.5" /><circle cx="12" cy="7.5" r="1.5" /></>,
        'gada': <><circle cx="5" cy="19" r="2" /><path d="m6 17 8-8" /><path d="m14 9 4-4" /><circle cx="19" cy="5" r="2" /><path d="M12.5 11.5 17 7" /><path d="M7 12 11.5 7.5" /></>,
        'google': <><path d="M20.94 12.35c0-.82-.07-1.6-.2-2.35H12v4.44h5.02c-.22 1.43-1.09 2.65-2.38 3.48v2.85h3.66c2.14-1.97 3.38-4.88 3.38-8.42z" /><path d="M12 23c3.12 0 5.76-1.04 7.68-2.8l-3.66-2.85c-1.03.7-2.36 1.11-3.92 1.11-3.01 0-5.56-2.03-6.47-4.76H2.17v2.96C4.1 20.45 7.72 23 12 23z" /><path d="M5.53 14.24c-.22-.67-.34-1.37-.34-2.14s.12-1.47.34-2.14V7.02H2.17C1.43 8.45 1 10.15 1 12s.43 3.55 1.17 4.98l3.36-2.74z" /><path d="M12 5.37c1.7 0 3.16.58 4.34 1.7L19.4 4C17.47 2.2 14.97 1 12 1 7.72 1 4.1 3.55 2.17 7.02l3.36 2.74c.91-2.73 3.46-4.76 6.47-4.76z" /></>,
        'gopuram': <><path d="M16 3v2" /><path d="M8 3v2" /><path d="M12 3v2" /><path d="M17.8 21 15 13H9l-2.8 8" /><path d="M21 21H3" /><path d="m7 13 5-8 5 8" /></>,
        'heart-hand': <><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.82 2.94 0l.06-.06L12 11l2.96-2.96.06.06a2.17 2.17 0 0 0 2.94 0v0a2.17 2.17 0 0 0 0-3.08L12 5Z" /></>,
        'home': <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
        'image': <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>,
        'info': <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
        'lotus': <><path d="M8.83 2a2 2 0 0 0-2.66 2.66l.04.12 1.35 4.02a4 4 0 0 0 3.1 2.45l4.01 1.35.12.04a2 2 0 0 0 2.66-2.66L16 8.83a4 4 0 0 0-2.45-3.1L9.53 4.38a2 2 0 0 0-.7-.38Z" /><path d="M22 15.17a2 2 0 0 0-2.66-2.66l-.12-.04-4.02-1.35a4 4 0 0 0-2.45-3.1L8.83 4.38a2 2 0 0 0-.38-.7l-.12-.04a2 2 0 0 0-2.66 2.66l.04.12 1.35 4.02a4 4 0 0 0 3.1 2.45l4.01 1.35.12.04a2 2 0 0 0 2.66-2.66L16 8.83a4 4 0 0 0-2.45-3.1L9.53 4.38a2 2 0 0 0-.7-.38Z" transform="rotate(90 12 12)" /><path d="m12 12-1-1" /></>,
        'map-pin': <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
        'meditate': <><path d="m6 18 6-6 6 6" /><path d="m6 12 6-6 6 6" /></>,
        'menu': <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>,
        'microphone': <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></>,
        'om': <><path d="M9 6a4.33 4.33 0 1 1-1.4 8.52" /><path d="M12 12a4.42 4.42 0 0 0 4-4.5" /><path d="M15.5 6.5a2 2 0 1 1-2-2 2 2 0 0 1 2 2z" /></>,
        'pause': <><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></>,
        'play': <polygon points="5 3 19 12 5 21 5 3" />,
        'plus': <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
        'receipt': <><path d="M2 12V2h10l8 8v10H2Z" /><path d="M11 2v9h8" /><path d="M15 15H8" /><path d="M15 19H8" /></>,
        'rupee': <><path d="M6 3h8" /><path d="M6 8h12" /><path d="M6 13h12" /><path d="M6 18h12" /><path d="M18 3v18" /><path d="M8 3v18" /></>,
        'search': <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
        'settings': <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
        'shopping-bag': <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></>,
        'speaker': <><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><circle cx="12" cy="14" r="4" /><line x1="12" y1="6" x2="12.01" y2="6" /></>,
        'star': <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
        'stop-circle': <><circle cx="12" cy="12" r="10" /><rect x="9" y="9" width="6" height="6" /></>,
        'sudarshana-chakra': <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="2" /><path d="M12 4v2" /><path d="m16.2 6.8-.7.7-1.4-1.4.7-.7" /><path d="M20 12h-2" /><path d="m17.2 16.2-.7-.7-1.4 1.4.7.7" /><path d="M12 20v-2" /><path d="m7.8 17.2-.7.7 1.4 1.4.7-.7" /><path d="M4 12h2" /><path d="m6.8 7.8-.7-.7 1.4-1.4.7.7" /></>,
        'temple': <><path d="M4 22h16"/><path d="M2 10l10-9 10 9"/><path d="M6 10v12h12v-12"/><path d="M10 16h4"/><path d="M12 22V10"/><path d="M18 10l-6-5-6 5"/></>,
        'trash': <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></>,
        'trishul': <><path d="M12 2v20" /><path d="M12 22a2 2 0 1 0 4 0" /><path d="M12 22a2 2 0 1 1-4 0" /><path d="M4 16c0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4" /><path d="M12 12L4 4" /><path d="M12 12l8-8" /></>,
        'upload': <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
        'user-circle': <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></>,
        'user-edit': <><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /><path d="M15 5l4 4" /></>,
        'users': <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
        'users-group': <><path d="M3 14s-1 1.4-1 4 2 2 2 2h12s2 0 2-2-1-4-1-4-1-1-2-1H5s-2 0-2 1z" /><circle cx="12" cy="7" r="4" /><path d="M19 14s1-1.4 1-4-2-2-2-2h-2" /><path d="M3 10s-1-1.4-1-4 2-2 2-2h2" /></>,
        'volume-off': <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></>,
        'volume-on': <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></>,
        'x': <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
        'zoom-in': <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></>,
    };

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
            aria-hidden="true"
        >
            {icons[name]}
        </svg>
    );
};
