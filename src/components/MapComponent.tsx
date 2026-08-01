import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { EmergencyRequest, Technician } from '../types';

interface MapComponentProps {
  requests?: EmergencyRequest[];
  technicians?: Technician[];
  selectedRequestId?: string | null;
  selectedTechId?: string | null;
  onSelectRequest?: (req: EmergencyRequest) => void;
  onSelectTech?: (tech: Technician) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  showRouteLine?: boolean;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  requests = [],
  technicians = [],
  selectedRequestId,
  selectedTechId,
  onSelectRequest,
  onSelectTech,
  center = { lat: 41.38879, lng: 2.15899 }, // Barcelona central
  zoom = 12,
  height = '450px',
  showRouteLine = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map instance
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        zoomControl: false
      });

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Custom Zoom control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
      markersRef.current = L.layerGroup().addTo(map);
    } else {
      mapInstanceRef.current.setView([center.lat, center.lng], zoom);
    }

    return () => {
      // Cleanup on unmount if needed
    };
  }, [center.lat, center.lng, zoom]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // Render Request Markers
    requests.forEach((req) => {
      const isSelected = req.id === selectedRequestId;
      const serviceColor =
        req.serviceType === 'gas'
          ? '#f59e0b'
          : req.serviceType === 'electricity'
          ? '#eab308'
          : '#3b82f6';

      const iconHtml = `
        <div class="relative flex items-center justify-center">
          ${isSelected ? '<div class="absolute -inset-2 rounded-full bg-rose-500/40 animate-ping"></div>' : ''}
          <div class="w-10 h-10 rounded-full bg-slate-900 border-2 ${
            isSelected ? 'border-rose-500 scale-110 shadow-lg shadow-rose-500/50' : 'border-rose-400/80'
          } flex items-center justify-center text-white shadow-md cursor-pointer transition-all">
            <span class="text-xs font-bold" style="color: ${serviceColor};">
              ${req.serviceType === 'gas' ? '🔥' : req.serviceType === 'electricity' ? '⚡' : '💧'}
            </span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-emergency-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([req.location.lat, req.location.lng], { icon: customIcon });

      const popupContent = `
        <div class="p-2 min-w-[200px] text-slate-800 font-sans">
          <div class="inline-block px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-rose-100 text-rose-800 mb-1">
            Urgencia ${req.serviceType.toUpperCase()}
          </div>
          <h4 class="font-bold text-sm text-slate-900 line-clamp-1">${req.title}</h4>
          <p class="text-xs text-slate-600 mb-1">${req.location.address}</p>
          <div class="text-[11px] text-slate-500 font-semibold mb-2">Cliente: ${req.clientName}</div>
          <div class="text-xs font-bold text-emerald-700">Estimado: ${req.estimatedCost}€</div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectRequest) onSelectRequest(req);
      });

      markersGroup.addLayer(marker);
    });

    // Render Technician Markers
    technicians.forEach((tech) => {
      const isSelected = tech.id === selectedTechId;
      const isAvailable = tech.status === 'available';
      const isBusy = tech.status === 'busy';

      const statusBg = isAvailable ? '#10b981' : isBusy ? '#f59e0b' : '#64748b';

      const iconHtml = `
        <div class="relative flex items-center justify-center group">
          <div class="w-11 h-11 rounded-full p-0.5 bg-slate-900 border-2 ${
            isSelected ? 'border-emerald-400 scale-110 shadow-lg shadow-emerald-500/50 ring-4 ring-emerald-500/20' : 'border-slate-700'
          } shadow-md cursor-pointer transition-all">
            <img src="${tech.avatar}" alt="${tech.fullName}" class="w-full h-full rounded-full object-cover" />
            <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900" style="background-color: ${statusBg};"></span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-tech-marker',
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const marker = L.marker([tech.currentLocation.lat, tech.currentLocation.lng], { icon: customIcon });

      const popupContent = `
        <div class="p-2 min-w-[210px] text-slate-800 font-sans">
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2 h-2 rounded-full" style="background-color: ${statusBg};"></span>
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              ${isAvailable ? 'Disponible' : isBusy ? 'En Servicio' : 'Sin Servicio'}
            </span>
            <span class="ml-auto text-xs font-bold text-amber-500 flex items-center gap-0.5">★ ${tech.rating || 'Nuevo'}</span>
          </div>
          <h4 class="font-bold text-sm text-slate-900">${tech.fullName}</h4>
          <p class="text-xs text-slate-600">${tech.currentLocation.neighborhood}</p>
          <div class="mt-1 pt-1 border-t border-slate-200 text-[11px] text-slate-500">
            <strong>Matrícula/Carnet:</strong> ${tech.registrationNumber}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectTech) onSelectTech(tech);
      });

      markersGroup.addLayer(marker);
    });

    // Draw route polyline if an assigned request & tech are active
    if (showRouteLine && selectedRequestId) {
      const activeReq = requests.find((r) => r.id === selectedRequestId);
      if (activeReq && activeReq.assignedTechId) {
        const assignedTech = technicians.find((t) => t.id === activeReq.assignedTechId);
        if (assignedTech) {
          const latlngs: L.LatLngExpression[] = [
            [assignedTech.currentLocation.lat, assignedTech.currentLocation.lng],
            [activeReq.location.lat, activeReq.location.lng]
          ];

          const polyline = L.polyline(latlngs, {
            color: '#10b981',
            weight: 4,
            opacity: 0.8,
            dashArray: '8, 8'
          });

          markersGroup.addLayer(polyline);
        }
      }
    }
  }, [requests, technicians, selectedRequestId, selectedTechId, showRouteLine, onSelectRequest, onSelectTech]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
      <div ref={mapContainerRef} style={{ height: height }} className="w-full z-0" />
      
      {/* Map Overlay Legend */}
      <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 shadow-lg text-xs text-slate-300 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span className="font-medium">Urgencia Cliente</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="font-medium">Técnico Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="font-medium">En Trabajo</span>
        </div>
      </div>
    </div>
  );
};
