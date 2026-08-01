import React, { useState } from 'react';
import { Wrench, Power, ShieldCheck, DollarSign, CheckCircle2, Clock, AlertTriangle, Navigation, MapPin, Phone, Star, FileText, ArrowUpRight } from 'lucide-react';
import { Technician, EmergencyRequest, TechStatus, VerificationDocument } from '../../types';
import { DocUploadForm } from './DocUploadForm';
import { MapComponent } from '../MapComponent';

interface TechnicianPortalProps {
  technicians: Technician[];
  requests: EmergencyRequest[];
  onUpdateTechStatus: (techId: string, status: TechStatus) => void;
  onAcceptJob: (requestId: string, techId: string) => void;
  onUpdateJobStatus: (requestId: string, newStatus: EmergencyRequest['status']) => void;
  onAddTechDocument: (techId: string, doc: Omit<VerificationDocument, 'id' | 'status' | 'uploadedAt'>) => void;
  onRegisterNewTech: (newTech: Omit<Technician, 'id' | 'createdAt' | 'rating' | 'totalJobs' | 'completedJobsCount' | 'totalEarningsGross' | 'netEarnings' | 'commissionPaid'>) => void;
}

export const TechnicianPortal: React.FC<TechnicianPortalProps> = ({
  technicians,
  requests,
  onUpdateTechStatus,
  onAcceptJob,
  onUpdateJobStatus,
  onAddTechDocument,
  onRegisterNewTech
}) => {
  // Selected active technician in portal
  const [activeTechId, setActiveTechId] = useState<string>(technicians[0]?.id || 'tech-101');
  const [activeTab, setActiveTab] = useState<'jobs' | 'docs' | 'earnings' | 'register'>('jobs');

  const currentTech = technicians.find((t) => t.id === activeTechId) || technicians[0];

  // Assigned active request for this technician
  const assignedActiveJob = requests.find(
    (r) => r.assignedTechId === activeTechId && r.status !== 'completed' && r.status !== 'closed' && r.status !== 'cancelled'
  );

  // Unassigned pending requests matching technician specialties
  const availableJobOffers = requests.filter(
    (r) =>
      r.status === 'pending_dispatch' &&
      r.assignedTechId === undefined &&
      currentTech.specialties.includes(r.serviceType) &&
      currentTech.verificationStatus === 'verified'
  );

  // Completed jobs history for this technician
  const completedJobs = requests.filter(
    (r) => r.assignedTechId === activeTechId && (r.status === 'completed' || r.status === 'closed')
  );

  // Registration state for new technician
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRegNumber, setNewRegNumber] = useState('');
  const [newSpecialties, setNewSpecialties] = useState<Array<'gas' | 'electricity' | 'plumbing'>>(['gas']);
  const [newVehicle, setNewVehicle] = useState('Furgoneta Taller Móvil');

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newPhone || !newRegNumber) {
      alert('Por favor completa el nombre, teléfono y número de carnet/colegiado.');
      return;
    }

    onRegisterNewTech({
      fullName: newFullName,
      phone: newPhone,
      email: newEmail || `${newFullName.toLowerCase().replace(/\s+/g, '.')}@instal.com`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      specialties: newSpecialties,
      registrationNumber: newRegNumber,
      status: 'pending_verification',
      verificationStatus: 'pending_review',
      documents: [],
      currentLocation: {
        lat: 41.38879,
        lng: 2.15899,
        address: 'Carrer de Mallorca 200',
        neighborhood: 'Eixample Esquerra, Barcelona'
      },
      vehicleInfo: newVehicle
    });

    alert('¡Registro enviado! Ahora debes subir tu DNI, Carnet de Instalador y Seguro RC para ser verificado.');
    setActiveTab('docs');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Top Technician Profile Selector & Status Bar */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            {/* Tech Selector Dropdown */}
            <img
              src={currentTech.avatar}
              alt={currentTech.fullName}
              className="w-14 h-14 rounded-lg object-cover border border-white/20 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2">
                <select
                  value={activeTechId}
                  onChange={(e) => setActiveTechId(e.target.value)}
                  className="bg-[#050505] border border-white/10 text-white font-bold text-base rounded-lg px-3 py-1 focus:outline-none focus:border-red-500"
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.verificationStatus === 'verified' ? 'Verificado' : 'Pendiente'})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setActiveTab('register')}
                  className="text-[11px] text-amber-400 hover:underline font-bold px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20"
                >
                  + Registrar Nuevo Técnico
                </button>
              </div>

              <p className="text-xs text-white/50 mt-1 flex items-center gap-2">
                <span>Carnet Oficial: {currentTech.registrationNumber}</span>
                <span>·</span>
                <span className="text-amber-400 font-bold">★ {currentTech.rating || 'Nuevo'}</span>
                <span>·</span>
                <span className="text-white/70">{currentTech.currentLocation.neighborhood}</span>
              </p>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#050505] px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Estado Guardia 24h:
              </span>
              <button
                onClick={() =>
                  onUpdateTechStatus(
                    currentTech.id,
                    currentTech.status === 'available' ? 'busy' : 'available'
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  currentTech.status === 'available'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-white/40 border border-white/10'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{currentTech.status === 'available' ? 'DISPONIBLE' : 'EN PAUSA'}</span>
              </button>
            </div>

            <div className="bg-[#050505] px-4 py-2 rounded-xl border border-white/10 text-right">
              <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                Facturación Neta (70%)
              </div>
              <div className="text-xl font-serif italic text-green-400">
                {currentTech.netEarnings}€
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'jobs'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Trabajos y Ofertas ({availableJobOffers.length})</span>
            {assignedActiveJob && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'docs'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Documentación Obligatoria</span>
            {currentTech.verificationStatus !== 'verified' && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                Requerida
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'earnings'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <DollarSign className="w-4 h-4 text-green-400" />
            <span>Facturación & Comisión 30%</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: JOBS & ACTIVE ASSIGNMENT */}
      {activeTab === 'jobs' && (
        <div className="space-y-8">
          {/* Unverified Warning Banner if pending */}
          {currentTech.verificationStatus !== 'verified' && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-amber-200 text-sm">
                    Cuenta Pendiente de Verificación de Documentos
                  </h4>
                  <p className="text-xs text-amber-300/80">
                    Sube tu DNI, Carnet de Instalador y Seguro de RC para empezar a recibir avisos urgentes en la zona de Barcelona.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('docs')}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider shrink-0"
              >
                Subir Documentos
              </button>
            </div>
          )}

          {/* Active Job Tracker for this Technician */}
          {assignedActiveJob && (
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 font-bold text-xs border border-red-500/30 mb-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    TRABAJO EN CURSO ASIGNADO · {assignedActiveJob.id}
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{assignedActiveJob.title}</h2>
                  <p className="text-xs text-white/60 mt-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    {assignedActiveJob.location.address} ({assignedActiveJob.location.neighborhood})
                  </p>
                </div>

                {/* Earnings breakdown for this job */}
                <div className="bg-[#050505] p-4 rounded-xl border border-white/10 space-y-1 text-right">
                  <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">
                    Tarifa Bruta Total: <span className="text-white font-bold">{assignedActiveJob.estimatedCost}€</span>
                  </div>
                  <div className="text-xs text-red-400 font-bold">
                    - Comisión Intermediario (30%): {Math.round(assignedActiveJob.estimatedCost * 0.3)}€
                  </div>
                  <div className="text-lg font-serif italic text-green-400">
                    Neto para ti (70%): {Math.round(assignedActiveJob.estimatedCost * 0.7)}€
                  </div>
                </div>
              </div>

              {/* Client Info & Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#050505] border border-white/10 space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Datos del Cliente
                  </h4>
                  <div className="font-bold text-white text-sm">{assignedActiveJob.clientName}</div>
                  <div className="text-xs text-white/70 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-green-400" />
                    <a href={`tel:${assignedActiveJob.clientPhone}`} className="hover:underline font-bold text-green-400">
                      {assignedActiveJob.clientPhone}
                    </a>
                  </div>
                  {assignedActiveJob.location.floorDetails && (
                    <div className="text-xs text-white/40">
                      Detalles acceso: {assignedActiveJob.location.floorDetails}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-[#050505] border border-white/10 space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Descripción del Problema
                  </h4>
                  <p className="text-xs text-white/80">{assignedActiveJob.description}</p>
                </div>
              </div>

              {/* Action Progress buttons for Technician */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {assignedActiveJob.status === 'tech_assigned' && (
                  <button
                    onClick={() => onUpdateJobStatus(assignedActiveJob.id, 'tech_en_route')}
                    className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Iniciar Ruta ('En Camino')</span>
                  </button>
                )}

                {assignedActiveJob.status === 'tech_en_route' && (
                  <button
                    onClick={() => onUpdateJobStatus(assignedActiveJob.id, 'in_progress')}
                    className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Llegada al Domicilio (Iniciar Trabajo)</span>
                  </button>
                )}

                {assignedActiveJob.status === 'in_progress' && (
                  <button
                    onClick={() => onUpdateJobStatus(assignedActiveJob.id, 'completed')}
                    className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Trabajo Finalizado & Registrar Cobro</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Incoming Available Job Offers */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Ofertas de Servicios Cercanas en Barcelona</span>
              <span className="text-xs text-white/40 font-normal">
                Comisión Fija del 30% retenida por plataforma
              </span>
            </h3>

            {availableJobOffers.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-white/10 text-center space-y-2">
                <Clock className="w-8 h-8 text-white/20 mx-auto" />
                <h4 className="text-sm font-bold text-white/70">Sin nuevos avisos pendientes</h4>
                <p className="text-xs text-white/40">
                  Mantén tu estado en 'DISPONIBLE' para recibir nuevos avisos urgentes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableJobOffers.map((offer) => {
                  const gross = offer.estimatedCost;
                  const fee30 = Math.round(gross * 0.3);
                  const net70 = Math.round(gross * 0.7);

                  return (
                    <div
                      key={offer.id}
                      className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/10 hover:border-white/20 transition-all space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-600/20 text-red-400 border border-red-500/30 mb-2">
                            Urgencia {offer.serviceType.toUpperCase()}
                          </span>
                          <h4 className="font-bold text-white text-base">{offer.title}</h4>
                          <p className="text-xs text-white/50 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-red-500" />
                            {offer.location.address} ({offer.location.neighborhood})
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-white/70 line-clamp-2">{offer.description}</p>

                      {/* 30% Fee Breakdown box */}
                      <div className="p-3 rounded-xl bg-[#050505] border border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Total Bruto</div>
                          <div className="font-bold text-white">{gross}€</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-red-400 uppercase font-bold tracking-widest">Comisión 30%</div>
                          <div className="font-bold text-red-400">-{fee30}€</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-green-400 uppercase font-bold tracking-widest">Tu Neto (70%)</div>
                          <div className="font-serif italic text-green-400 text-sm">{net70}€</div>
                        </div>
                      </div>

                      <button
                        onClick={() => onAcceptJob(offer.id, currentTech.id)}
                        className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
                      >
                        Aceptar Trabajo e Iniciar Servicio
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: DOCUMENTS */}
      {activeTab === 'docs' && (
        <DocUploadForm
          documents={currentTech.documents}
          verificationStatus={currentTech.verificationStatus}
          onUploadDoc={(doc) => onAddTechDocument(currentTech.id, doc)}
        />
      )}

      {/* TAB CONTENT 3: EARNINGS & 30% COMMISSION LEDGER */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 space-y-1">
              <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Facturación Total Bruta</div>
              <div className="text-3xl font-serif italic text-white">{currentTech.totalEarningsGross}€</div>
              <p className="text-[11px] text-white/40">Servicios realizados en la plataforma</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 space-y-1">
              <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Comisión Plataforma (30%)</div>
              <div className="text-3xl font-serif italic text-red-400">{currentTech.commissionPaid}€</div>
              <p className="text-[11px] text-white/40">Gestión de intermediación y captación</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 space-y-1">
              <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Ganancias Netas (70%)</div>
              <div className="text-3xl font-serif italic text-green-400">{currentTech.netEarnings}€</div>
              <p className="text-[11px] text-white/40">Total acumulado en tu cuenta</p>
            </div>
          </div>

          {/* Completed Jobs History Table */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Historial de Trabajos Realizados</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 font-bold uppercase text-[10px] tracking-widest">
                    <th className="py-3 px-4">ID Servicio</th>
                    <th className="py-3 px-4">Especialidad & Cliente</th>
                    <th className="py-3 px-4">Ubicación</th>
                    <th className="py-3 px-4">Total Bruto</th>
                    <th className="py-3 px-4">Comisión 30%</th>
                    <th className="py-3 px-4">Neto Técnico</th>
                    <th className="py-3 px-4">Valoración</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/70">
                  {completedJobs.map((job) => {
                    const gross = job.finalCost || job.estimatedCost;
                    const fee30 = job.commissionAmount || Math.round(gross * 0.3);
                    const net70 = job.techPayoutAmount || Math.round(gross * 0.7);

                    return (
                      <tr key={job.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-red-400">{job.id}</td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <div>{job.title}</div>
                          <div className="text-[10px] text-white/40">{job.clientName}</div>
                        </td>
                        <td className="py-3.5 px-4 text-white/50">{job.location.neighborhood}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{gross}€</td>
                        <td className="py-3.5 px-4 font-bold text-red-400">-{fee30}€</td>
                        <td className="py-3.5 px-4 font-serif italic text-green-400 text-sm">{net70}€</td>
                        <td className="py-3.5 px-4">
                          {job.rating ? (
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              ★ {job.rating.stars}
                            </span>
                          ) : (
                            <span className="text-white/30 text-[10px]">Pendiente cliente</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: REGISTER NEW TECHNICIAN */}
      {activeTab === 'register' && (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Alta de Nuevo Técnico Instalador</h3>
            <p className="text-xs text-white/50 mt-1">
              Únete a la red privada de intermediación de Urgent BCN. Recibe avisos en Barcelona y alrededores con cobro garantizado.
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sergi Puigdemont"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">Teléfono Móvil *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ej: +34 622 110 994"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">Email Profesional</label>
                <input
                  type="email"
                  placeholder="Ej: sergi.instal@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">Nº Carnet Colegiado / Licencia *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: CAT-GAS-2094"
                  value={newRegNumber}
                  onChange={(e) => setNewRegNumber(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/70 mb-2">Especialidades Certificadas</label>
              <div className="flex gap-4">
                {(['gas', 'electricity', 'plumbing'] as const).map((spec) => (
                  <label key={spec} className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSpecialties.includes(spec)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewSpecialties([...newSpecialties, spec]);
                        } else {
                          setNewSpecialties(newSpecialties.filter((s) => s !== spec));
                        }
                      }}
                      className="rounded bg-[#050505] border-white/20 text-red-600 focus:ring-red-500"
                    />
                    <span className="capitalize">{spec === 'electricity' ? 'electricidad' : spec === 'plumbing' ? 'fontanería' : spec}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
            >
              Completar Registro e Ir a Documentación
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
