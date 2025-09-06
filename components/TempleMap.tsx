

import React, { useEffect, useRef } from 'react';
import { Temple } from '../types';

declare var L: any; // Using Leaflet from CDN

interface LeafletMarker {
    getLatLng: () => any;
}

interface TempleMapProps {
    temples: Temple[];
    userLocation?: { lat: number, lng: number };
    onMarkerClick?: (temple: Temple) => void;
    selectedTempleIds?: number[];
}

export const TempleMap = ({ temples, userLocation, onMarkerClick, selectedTempleIds }: TempleMapProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<any>(null);
    const markersLayer = useRef<any>(null);

    // Effect for initializing the map and cleaning it up on unmount
    useEffect(() => {
        if (typeof L === 'undefined' || !mapContainer.current) {
            return;
        }

        if (!map.current) {
            map.current = L.map(mapContainer.current).setView([20.5937, 78.9629], 5); // Centered on India

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map.current);
            
            markersLayer.current = L.layerGroup().addTo(map.current);
        }

        // Cleanup function to remove map on component unmount
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    // Effect for updating markers when temple data changes
    useEffect(() => {
        if (!map.current || !markersLayer.current) {
            return;
        }

        // Clear existing markers
        markersLayer.current.clearLayers();

        if (userLocation) {
            L.circleMarker([userLocation.lat, userLocation.lng], {
                radius: 8,
                color: '#fff',
                weight: 2,
                fillColor: '#3b82f6',
                fillOpacity: 1
            }).addTo(markersLayer.current)
              .bindPopup("Your Location");
        }


        const newMarkers = temples.map(temple => {
            if (temple.lat && temple.lng) {
                 const isSelected = selectedTempleIds?.includes(temple.id);
                 const iconColor = isSelected ? 'rgb(var(--color-primary-val))' : '#6b7280'; // gray-500
                 
                 const templeIcon = L.divIcon({
                    html: `
                        <div style="background-color: ${iconColor}; width: 2rem; height: 2rem; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5); cursor: pointer;">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1" class="w-4 h-4">
                                <path d="M4 22h16"/><path d="M2 10l10-9 10 9"/><path d="M6 10v12h12v-12"/><path d="M10 16h4"/><path d="M12 22V10"/><path d="M18 10l-6-5-6 5"/>
                            </svg>
                        </div>`,
                    className: '',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                });

                const marker = L.marker([temple.lat, temple.lng], { icon: templeIcon })
                    .bindPopup(`<b>${temple.name}</b><br>${temple.location}`);
                
                if (onMarkerClick) {
                    marker.on('click', () => onMarkerClick(temple));
                }

                return marker;
            }
            return null;
        }).filter((m): m is LeafletMarker => m !== null);
        
        if (newMarkers.length > 0 || userLocation) {
             const allPointsForBounds = newMarkers.map(m => m.getLatLng());
             if (userLocation) {
                allPointsForBounds.push(L.latLng(userLocation.lat, userLocation.lng));
             }
             
             newMarkers.forEach(marker => markersLayer.current.addLayer(marker));
             
             if(allPointsForBounds.length > 0 && selectedTempleIds?.length === 0) { // Only auto-zoom if no temples are selected yet
                 const group = L.featureGroup(newMarkers);
                 if (userLocation) {
                     group.addLayer(L.marker([userLocation.lat, userLocation.lng]));
                 }
                map.current.fitBounds(group.getBounds().pad(0.5));
             }
        }

    }, [temples, userLocation, selectedTempleIds, onMarkerClick]);

    return <div ref={mapContainer} className="leaflet-container" />;
};