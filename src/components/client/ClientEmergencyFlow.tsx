import React, { useState } from 'react';
import { Flame, Zap, Droplet, MapPin, Clock, Camera, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Phone, Star, Navigation } from 'lucide-react';
import { EmergencyRequest, ServiceType, UrgencyLevel, Technician } from '../../types';
import { BARCELONA_PRESET_LOCATIONS, BARCELONA_CENTER, rankNearbyTechnicians, formatDistance } from '../../utils/geolocation';
import { SERVICE_METADATA } from '../../data/mockData';
import { MapComponent } from '../MapComponent';
import { ClientRatingModal } from './ClientRatingModal';

interface ClientEmergencyFlowProps {
  requests: EmergencyRequest[];
  technicians: Technician[];
  onSubmitRequest: (newReq: Omit<EmergencyRequest, 'id' | 'createdAt' | 'timeline' | 'status'>) => void;
  onRateRequest: (requestId: string, rating: { stars: number; comment: string; badges: string[] }) => void;
  onCancelRequest?: (requestId: string) => void;
}

export const ClientEmergencyFlow: React.FC<ClientEmergencyFlowProps> = ({
  requests,
  technicians,
  onSubmitRequest,
  onRateRequest,
  onCancelRequest
}) => {
  // Form State
  const [selectedService, setSelectedService] = useState<ServiceType>('gas');
  const [urgency, setUrgency] = useState<UrgencyLevel>('immediate');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(BARCELONA_PRESET_LOCATIONS[0]);
  const [customAddress, setCustomAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [ratingModalReq, setRatingModalReq] = useState<EmergencyRequest | null>(null);

  // Active client emergency tracker state (most recent pending/active request)
  const activeRequest = requests.find(
    (r) => r.status !== 'closed' && r.status !== 'cancelled'
  ) || null;

  // Active assigned technician details
  const assignedTech = activeRequest?.assignedTechId
    ? technicians.find((t) => t.id === activeRequest.assignedTechId)
    : null;

  // Calculate upfront cost estimation
  const meta = SERVICE_METADATA[selectedService];
  const calculatedEstimate = Math.round(
    meta.basePrice * (urgency === 'immediate' ? meta.emergencyMultiplier : 1.0)
  );

  const handleUseGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSelectedLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: customAddress || 'Ubicación actual detectada por GPS',
            neighborhood: 'Barcelona / Área Metropolitana'
          });
        },
        () => {
          alert('No se pudo acceder a la ubicación actual. Utilizando ubicación por defecto en Barcelona.');
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Por favor indica tu nombre y número de teléfono de contacto para que la central te llame.');
      return;
    }

    const finalAddress = customAddress.trim() || selectedLocation.address;

    onSubmitRequest({
      clientName,
      clientPhone,
      serviceType: selectedService,
      urgency,
      title: title.trim() || `Urgencia de ${SERVICE_METADATA[selectedService].title}`,
      description: description.trim() || 'Aviso urgente de reparación inmediata.',
      photoUrl: photoUrl || undefined,
      location: {
        ...selectedLocation,
        address: finalAddress
      },
      estimatedCost: calculatedEstimate
    });

    // Reset form fields
    setTitle('');
    setDescription('');
  };

  // Sample photo options for simulation
  const samplePhotos = [
    { label: 'Caldera de Gas', url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80' },
    { label: 'Fuga en Tubería', url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&auto=format&fit=crop&q=80' },
    { label: 'Cuadro Eléctrico', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* If client has an Active Emergency Request, display the Live Tracker */}
      {activeRequest ? (
        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 font-bold text-xs border border-red-500/30 mb-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  SEGUIMIENTO EN TIEMPO REAL · {activeRequest.id}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {activeRequest.title}
                </h2>
                <p className="text-xs text-white/60 mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  {activeRequest.location.address} ({activeRequest.location.neighborhood})
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-[#050505] px-4 py-2 rounded-xl border border-white/10 text-right">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                    Importe Estimado
                  </div>
                  <div className="text-2xl font-serif italic text-green-400">
                    {activeRequest.estimatedCost}€
                  </div>
                </div>

                <a
                  href="tel:+34930000930"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
                >
                  <Phone className="w-4 h-4" />
                  Central 24h
                </a>
              </div>
            </div>

            {/* Status Progress Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-6">
              <div
                className={`p-4 rounded-xl border transition-all ${
                  activeRequest.status === 'pending_dispatch' || activeRequest.status === 'contacting_techs'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-[#050505] border-white/10 text-white/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-red-400" />
                  <span className="font-bold text-xs uppercase tracking-wider">1. Búsqueda</span>
                </div>
                <p className="text-xs text-white/70">
                  Central contactando técnicos certificados en Barcelona
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border transition-all ${
                  activeRequest.status === 'tech_assigned' || activeRequest.status === 'tech_en_route'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-[#050505] border-white/10 text-white/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Navigation className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs uppercase tracking-wider">2. En Camino</span>
                </div>
                <p className="text-xs text-white/70">
                  {assignedTech ? `${assignedTech.fullName} en desplazamiento` : 'Pendiente de confirmación'}
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border transition-all ${
                  activeRequest.status === 'in_progress'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-[#050505] border-white/10 text-white/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-xs uppercase tracking-wider">3. Ejecución</span>
                </div>
                <p className="text-xs text-white/70">
                  Reparación técnica y pruebas de seguridad en marcha
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border transition-all ${
                  activeRequest.status === 'completed'
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-[#050505] border-white/10 text-white/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-green-400" />
                  <span className="font-bold text-xs uppercase tracking-wider">4. Finalizado</span>
                </div>
                <p className="text-xs text-white/70">
                  {activeRequest.status === 'completed' ? 'Cobrado. ¡Deja tu valoración!' : 'Pendiente de cierre'}
                </p>
              </div>
            </div>

            {/* Assigned Technician Profile Box if assigned */}
            {assignedTech && (
              <div className="mt-2 bg-[#050505] p-5 rounded-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={assignedTech.avatar}
                    alt={assignedTech.fullName}
                    className="w-14 h-14 rounded-lg object-cover border border-white/20"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base">{assignedTech.fullName}</h4>
                      <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20 uppercase tracking-widest">
                        Verificado
                      </span>
                    </div>
                    <p className="text-xs text-white/50 font-medium">
                      Carnet Profesional: {assignedTech.registrationNumber}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-white/70 mt-1">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        ★ {assignedTech.rating} ({assignedTech.totalJobs} trabajos)
                      </span>
                      <span>·</span>
                      <span className="text-white/40">{assignedTech.vehicleInfo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <a
                    href={`tel:${assignedTech.phone}`}
                    className="flex-1 md:flex-initial px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    Llamar al Técnico ({assignedTech.phone})
                  </a>
                </div>
              </div>
            )}

            {/* If job is completed, button to trigger Rating Modal */}
            {activeRequest.status === 'completed' && !activeRequest.rated && (
              <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-amber-400 animate-bounce" />
                  <div>
                    <h4 className="font-bold text-amber-200 text-sm">
                      El servicio ha sido completado por el técnico
                    </h4>
                    <p className="text-xs text-amber-300/80">
                      Ayúdanos a mantener la calidad de la red valorando la puntualidad y limpieza.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setRatingModalReq(activeRequest)}
                  className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
                >
                  Valorar Trabajo
                </button>
              </div>
            )}

            {activeRequest.rated && activeRequest.rating && (
              <div className="mt-4 p-4 rounded-xl bg-[#050505] border border-white/10 text-xs text-white/70 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <span>★ {activeRequest.rating.stars} / 5</span>
                  <span className="text-white/40">· Valoración enviada por cliente</span>
                </div>
                <p className="italic font-serif text-white/80">"{activeRequest.rating.comment}"</p>
              </div>
            )}
          </div>

          {/* Map showing Live Emergency location and nearby techs */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Mapa de Cobertura y Técnico en Servicio</span>
              <span className="text-[10px] text-white/40 font-normal">Actualización en tiempo real BCN</span>
            </h3>
            <MapComponent
              requests={[activeRequest]}
              technicians={technicians}
              selectedRequestId={activeRequest.id}
              selectedTechId={activeRequest.assignedTechId}
              height="420px"
            />
          </div>
        </div>
      ) : (
        /* SOS Request Submission Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Request Form */}
          <div className="lg:col-span-7 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 text-red-400 font-bold text-xs border border-red-500/20 mb-3">
                <Flame className="w-3.5 h-3.5" />
                SOLICITUD DIRECTA DE URGENCIAS · BARCELONA
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                ¿Tienes una urgencia técnica?
              </h1>
              <p className="text-xs text-white/50 mt-1">
                Envía tu solicitud e intervenimos inmediatamente. Gestionamos directamente el envío del instalador verificado más cercano.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Specialty Selection */}
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                  1. Selecciona el Tipo de Urgencia
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedService('gas')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedService === 'gas'
                        ? 'bg-red-500/10 border-red-500 text-white shadow-lg'
                        : 'bg-[#050505] border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center mb-2">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-sm text-white">Gas</div>
                    <div className="text-[10px] text-white/40 mt-0.5 line-clamp-1">Fugas, calderas, revisiones</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedService('electricity')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedService === 'electricity'
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg'
                        : 'bg-[#050505] border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-sm text-white">Electricidad</div>
                    <div className="text-[10px] text-white/40 mt-0.5 line-clamp-1">Cortocircuito, diferencial</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedService('plumbing')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedService === 'plumbing'
                        ? 'bg-blue-500/10 border-blue-500 text-white shadow-lg'
                        : 'bg-[#050505] border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
                      <Droplet className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-sm text-white">Fontanería</div>
                    <div className="text-[10px] text-white/40 mt-0.5 line-clamp-1">Reventones, fugas de agua</div>
                  </button>
                </div>
              </div>

              {/* Step 2: Urgency Level */}
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                  2. Nivel de Urgencia
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setUrgency('immediate')}
                    className={`p-3 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all ${
                      urgency === 'immediate'
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : 'bg-[#050505] border-white/10 text-white/50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    <span>Inmediato (&lt;30 min)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUrgency('within_2h')}
                    className={`p-3 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all ${
                      urgency === 'within_2h'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#050505] border-white/10 text-white/50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>En menos de 2h</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUrgency('today')}
                    className={`p-3 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all ${
                      urgency === 'today'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-[#050505] border-white/10 text-white/50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>A lo largo del día</span>
                  </button>
                </div>
              </div>

              {/* Step 3: Location in Barcelona */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    3. Dirección en Barcelona y Alrededores
                  </label>
                  <button
                    type="button"
                    onClick={handleUseGPS}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Detectar mi GPS
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[10px] text-white/40 mb-1">
                      Zona / Municipio Preset:
                    </label>
                    <select
                      value={selectedLocation.address}
                      onChange={(e) => {
                        const loc = BARCELONA_PRESET_LOCATIONS.find((l) => l.address === e.target.value);
                        if (loc) setSelectedLocation(loc);
                      }}
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      {BARCELONA_PRESET_LOCATIONS.map((loc) => (
                        <option key={loc.address} value={loc.address}>
                          {loc.neighborhood} - {loc.address}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 mb-1">
                      Calle, número y piso exacto:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Carrer Balmes 120, 2º 1ª"
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Issue Title & Description */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                    4. Descripción del Problema
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Fuga de agua en el tubo de debajo del fregadero / Olor a gas"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 mb-2"
                  />
                  <textarea
                    rows={2}
                    placeholder="Escribe detalles adicionales (puerta, acceso, gravedad de la avería)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Photo Simulation */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white/70 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-red-400" /> Adjuntar Foto de la Avería (Opcional)
                    </span>
                    {photoUrl && (
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="text-[11px] text-red-400 hover:underline"
                      >
                        Quitar foto
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {samplePhotos.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPhotoUrl(p.url)}
                        className={`px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                          photoUrl === p.url
                            ? 'bg-red-500/20 border-red-500 text-red-300'
                            : 'bg-[#050505] border-white/10 text-white/50 hover:border-white/20'
                        }`}
                      >
                        📸 {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 5: Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">
                    Tu Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Marta Puig"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">
                    Teléfono Móvil de Contacto *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej: +34 612 345 678"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Submit Button & Cost Box */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#050505] p-4 rounded-xl border border-white/10">
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                    Presupuesto Base Transparente
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-serif italic text-green-400">
                      {calculatedEstimate}€
                    </span>
                    <span className="text-[11px] text-white/40">
                      (Incluye desplazamiento y diagnóstico)
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <span>Solicitar Técnico Ahora</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Sidebar: Coverage Map & Available Techs Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Técnicos Certificados Cercanos</span>
                <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20">
                  En Guardia
                </span>
              </h3>

              <p className="text-xs text-white/50">
                Red privada verificada de instaladores homologados en el área metropolitana de Barcelona.
              </p>

              {/* Map Preview */}
              <MapComponent
                technicians={technicians}
                center={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                height="280px"
              />

              {/* Nearby available techs list */}
              <div className="space-y-2 pt-2">
                {rankNearbyTechnicians(selectedLocation, technicians, selectedService)
                  .slice(0, 3)
                  .map(({ tech, distanceKm, estimatedArrivalMinutes }) => (
                    <div
                      key={tech.id}
                      className="p-3 rounded-xl bg-[#050505] border border-white/10 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={tech.avatar}
                          alt={tech.fullName}
                          className="w-10 h-10 rounded-lg object-cover border border-white/10"
                        />
                        <div>
                          <div className="font-bold text-white">{tech.fullName}</div>
                          <div className="text-[10px] text-white/40">{tech.currentLocation.neighborhood}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-amber-400 font-bold">★ {tech.rating}</div>
                        <div className="text-[10px] text-green-400 font-semibold">
                          ~{estimatedArrivalMinutes} min ({formatDistance(distanceKm)})
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Guarantees Box */}
              <div className="p-4 rounded-xl bg-[#050505] border border-white/10 text-xs text-white/70 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  Garantía Intermediaria Oficial Urgent BCN
                </div>
                <ul className="space-y-1 text-[11px] text-white/50 list-disc list-inside">
                  <li>Documentación obligatoria verificada (DNI, Carnet e Seguro RC).</li>
                  <li>Cobro transparente y factura oficial gestionada directamente.</li>
                  <li>Atención continuada 24/7 sin sorpresas ni sobrecostes no informados.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModalReq && (
        <ClientRatingModal
          request={ratingModalReq}
          onClose={() => setRatingModalReq(null)}
          onSubmit={(stars, comment, badges) => {
            onRateRequest(ratingModalReq.id, { stars, comment, badges });
            setRatingModalReq(null);
          }}
        />
      )}
    </div>
  );
};
