import React, { useState } from 'react';
import { BarChart3, ShieldCheck, PhoneCall, MapPin, CheckCircle2, XCircle, Clock, Search, Filter, AlertTriangle, ArrowUpRight, DollarSign, Users, Flame, RefreshCw } from 'lucide-react';
import { EmergencyRequest, Technician, VerificationDocument } from '../../types';
import { rankNearbyTechnicians, formatDistance } from '../../utils/geolocation';
import { calculateFinancialSummary } from '../../utils/storage';
import { MapComponent } from '../MapComponent';

interface AdminDashboardProps {
  requests: EmergencyRequest[];
  technicians: Technician[];
  onAssignTechToJob: (requestId: string, techId: string) => void;
  onApproveTechDoc: (techId: string, docId: string, status: 'verified' | 'rejected') => void;
  onVerifyEntireTech: (techId: string, status: 'verified' | 'rejected') => void;
  onResetDemoData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  requests,
  technicians,
  onAssignTechToJob,
  onApproveTechDoc,
  onVerifyEntireTech,
  onResetDemoData
}) => {
  const [adminTab, setAdminTab] = useState<'dispatch' | 'verification' | 'finances' | 'quality'>('dispatch');
  const [selectedReqId, setSelectedReqId] = useState<string | null>(
    requests.find((r) => r.status === 'pending_dispatch')?.id || requests[0]?.id || null
  );
  const [selectedTechIdForDispatch, setSelectedTechIdForDispatch] = useState<string | null>(null);
  const [filterService, setFilterService] = useState<string>('all');

  const financialSummary = calculateFinancialSummary(requests);

  const activeSelectedReq = requests.find((r) => r.id === selectedReqId);

  // Ranked techs for the currently selected request
  const rankedTechs = activeSelectedReq
    ? rankNearbyTechnicians(activeSelectedReq.location, technicians, activeSelectedReq.serviceType)
    : [];

  // Filtered requests list
  const filteredRequests = requests.filter((r) => {
    if (filterService === 'all') return true;
    return r.serviceType === filterService;
  });

  // Pending technician verification queue
  const pendingTechs = technicians.filter(
    (t) => t.verificationStatus === 'pending_review' || t.documents.some((d) => d.status === 'pending')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Top Operations Header Metrics */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 text-red-400 font-bold text-xs border border-red-500/20 mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              CENTRAL DE INTERMEDIACIÓN Y DESPACHO · BARCELONA
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Gestoría Interna y Control de Operaciones</h1>
            <p className="text-xs text-white/50 mt-0.5">
              Red privada de técnicos. Captamos el cliente, negociamos la asignación y cobramos el 30% de comisión.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onResetDemoData}
              className="px-3 py-1.5 rounded-lg bg-[#050505] hover:bg-white/5 text-white/70 font-bold text-xs border border-white/10 flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-red-500" />
              Reiniciar Datos Demo
            </button>
          </div>
        </div>

        {/* 4 Key Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#050505] border border-white/10 space-y-1">
            <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
              Volumen Bruto Total
            </div>
            <div className="text-2xl font-serif italic text-white">{financialSummary.totalGrossVolume}€</div>
            <div className="text-[10px] text-white/40">{financialSummary.completedJobs} trabajos concluidos</div>
          </div>

          <div className="p-4 rounded-xl bg-[#050505] border border-green-500/20 space-y-1">
            <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest">
              Nuestra Comisión 30%
            </div>
            <div className="text-2xl font-serif italic text-green-400">
              +{financialSummary.totalPlatformCommission}€
            </div>
            <div className="text-[10px] text-green-500/80 font-medium">Margen retenido por intermediación</div>
          </div>

          <div className="p-4 rounded-xl bg-[#050505] border border-white/10 space-y-1">
            <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
              Liquidación Técnicos (70%)
            </div>
            <div className="text-2xl font-serif italic text-white/80">{financialSummary.totalTechPayouts}€</div>
            <div className="text-[10px] text-white/40">Neto abonado a instaladores</div>
          </div>

          <div className="p-4 rounded-xl bg-[#050505] border border-amber-500/20 space-y-1">
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
              Revisión Documentos
            </div>
            <div className="text-2xl font-bold text-amber-400">{pendingTechs.length}</div>
            <div className="text-[10px] text-amber-500/80 font-medium">Pendientes de validar DNI/Carnet</div>
          </div>
        </div>

        {/* Internal Admin Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setAdminTab('dispatch')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              adminTab === 'dispatch'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Despacho de Urgencias & Mapa BCN</span>
            {requests.filter((r) => r.status === 'pending_dispatch').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-bold animate-pulse">
                {requests.filter((r) => r.status === 'pending_dispatch').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('verification')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              adminTab === 'verification'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Validación de Carnets y Documentos</span>
            {pendingTechs.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('finances')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              adminTab === 'finances'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Libro de Comisiones del 30%</span>
          </button>

          <button
            onClick={() => setAdminTab('quality')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              adminTab === 'quality'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Red Privada de Técnicos & Reseñas</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DISPATCH & LIVE BARCELONA MAP */}
      {adminTab === 'dispatch' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Incoming Emergency Requests Queue */}
          <div className="lg:col-span-5 bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Avisos de Clientes en Barcelona</h3>
              <div className="flex items-center gap-1">
                {['all', 'gas', 'electricity', 'plumbing'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterService(st)}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      filterService === st
                        ? 'bg-red-600 text-white'
                        : 'bg-[#050505] text-white/50 hover:text-white'
                    }`}
                  >
                    {st === 'all' ? 'Todos' : st.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredRequests.map((req) => {
                const isSelected = req.id === selectedReqId;
                const assignedT = req.assignedTechId ? technicians.find((t) => t.id === req.assignedTechId) : null;

                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedReqId(req.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'bg-red-950/20 border-red-500 shadow-lg ring-1 ring-red-500/30'
                        : 'bg-[#050505] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{req.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              req.serviceType === 'gas'
                                ? 'bg-amber-500/20 text-amber-400'
                                : req.serviceType === 'electricity'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            {req.serviceType}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm mt-1">{req.title}</h4>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-serif italic text-green-400">{req.estimatedCost}€</div>
                        <div className="text-[10px] text-white/40">
                          Comisión 30%: <span className="font-bold text-red-400">{Math.round(req.estimatedCost * 0.3)}€</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-white/50 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      {req.location.address} ({req.location.neighborhood})
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/10">
                      <span className="text-white/40">Cliente: {req.clientName}</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded ${
                          req.status === 'pending_dispatch'
                            ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/30'
                            : req.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {req.status === 'pending_dispatch'
                          ? 'Pendiente Asignar'
                          : req.status === 'completed'
                          ? 'Completado'
                          : assignedT ? `Asignado a ${assignedT.fullName}` : 'En Proceso'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Barcelona Map + Technician Dispatcher Tool */}
          <div className="lg:col-span-7 space-y-6">
            <MapComponent
              requests={requests}
              technicians={technicians}
              selectedRequestId={selectedReqId}
              selectedTechId={selectedTechIdForDispatch}
              height="360px"
            />

            {/* Dispatcher Actions Panel for Selected Emergency */}
            {activeSelectedReq ? (
              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                      Intermediación Activa · {activeSelectedReq.id}
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight">{activeSelectedReq.title}</h3>
                    <p className="text-xs text-white/50 mt-0.5">
                      Cliente: {activeSelectedReq.clientName} ({activeSelectedReq.clientPhone})
                    </p>
                  </div>

                  <div className="bg-[#050505] px-4 py-2 rounded-xl border border-white/10 text-right">
                    <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Cobro 30% Intermediario</div>
                    <div className="text-lg font-serif italic text-green-400">
                      +{Math.round(activeSelectedReq.estimatedCost * 0.3)}€
                    </div>
                  </div>
                </div>

                {/* Ranked Technicians Picker */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Técnicos Certificados Cercanos Disponibles para Contactar:
                  </h4>

                  <div className="space-y-2">
                    {rankedTechs.map(({ tech, distanceKm, estimatedArrivalMinutes }) => {
                      const isAssigned = activeSelectedReq.assignedTechId === tech.id;

                      return (
                        <div
                          key={tech.id}
                          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                            isAssigned
                              ? 'bg-green-950/20 border-green-500'
                              : 'bg-[#050505] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={tech.avatar}
                              alt={tech.fullName}
                              className="w-10 h-10 rounded-lg object-cover border border-white/10"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{tech.fullName}</span>
                                <span className="text-amber-400 font-bold">★ {tech.rating}</span>
                              </div>
                              <div className="text-[11px] text-white/50">
                                {tech.currentLocation.neighborhood} · {formatDistance(distanceKm)} (~{estimatedArrivalMinutes} min)
                              </div>
                              <div className="text-[10px] text-white/30">
                                Carnet: {tech.registrationNumber}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${tech.phone}`}
                              className="p-2 rounded-lg bg-[#0a0a0a] hover:bg-white/5 text-white/70 border border-white/10 font-bold text-[11px] flex items-center gap-1"
                              title="Llamar directamente al técnico"
                            >
                              <PhoneCall className="w-3.5 h-3.5 text-green-400" />
                              <span className="hidden sm:inline">Llamar</span>
                            </a>

                            {isAssigned ? (
                              <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 font-bold text-xs border border-green-500/30 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Asignado
                              </span>
                            ) : (
                              <button
                                onClick={() => onAssignTechToJob(activeSelectedReq.id, tech.id)}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                              >
                                Contactar & Asignar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-white/10 text-center text-white/40 text-xs">
                Selecciona una urgencia de la lista para gestionar el despacho de técnicos.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TECHNICIAN DOCUMENT VERIFICATION CENTER */}
      {adminTab === 'verification' && (
        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white tracking-tight">Cola de Homologación e Inspección de Documentos</h3>
            <p className="text-xs text-white/50">
              Garantía de calidad de la red privada: revisa los carnets de instalador de gas/electricidad/fontanería y pólizas de Seguro RC.
            </p>

            <div className="space-y-4 pt-2">
              {technicians.map((tech) => (
                <div key={tech.id} className="p-5 rounded-xl bg-[#050505] border border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <img
                        src={tech.avatar}
                        alt={tech.fullName}
                        className="w-11 h-11 rounded-lg object-cover border border-white/10"
                      />
                      <div>
                        <h4 className="font-bold text-white text-base">{tech.fullName}</h4>
                        <p className="text-xs text-white/40">
                          {tech.email} · {tech.phone} · Reg: {tech.registrationNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {tech.verificationStatus === 'verified' ? (
                        <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 font-bold text-xs border border-green-500/30">
                          ✓ Técnico Homologado
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onVerifyEntireTech(tech.id, 'verified')}
                            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                          >
                            Aprobar y Homologar
                          </button>
                          <button
                            onClick={() => onVerifyEntireTech(tech.id, 'rejected')}
                            className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold text-xs border border-red-500/30"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documents List */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {tech.documents.map((doc) => (
                      <div key={doc.id} className="p-3 rounded-lg bg-[#0a0a0a] border border-white/10 text-xs space-y-2">
                        <div className="flex items-center justify-between font-bold text-white">
                          <span>{doc.type.toUpperCase()}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              doc.status === 'verified'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-white/60 font-medium truncate">{doc.name}</div>
                        <div className="text-[10px] text-white/30">Nº: {doc.documentNumber}</div>

                        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                          <button
                            onClick={() => onApproveTechDoc(tech.id, doc.id, 'verified')}
                            className="text-[11px] font-bold text-green-400 hover:underline"
                          >
                            Aprobar Documento
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FINANCIAL LEDGER & 30% COMMISSION BREAKDOWN */}
      {adminTab === 'finances' && (
        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Libro Contable de Intermediación (Comisión 30%)</h3>
                <p className="text-xs text-white/50 mt-1">
                  Registro detallado de facturas generadas, comisiones retenidas del 30% e importes liquidados a instaladores.
                </p>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl text-right">
                <div className="text-[10px] text-green-400 uppercase font-bold tracking-widest">Ingresos Limpios Plataforma</div>
                <div className="text-2xl font-serif italic text-green-400">+{financialSummary.totalPlatformCommission}€</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 font-bold uppercase text-[10px] tracking-widest">
                    <th className="py-3 px-4">Referencia</th>
                    <th className="py-3 px-4">Cliente & Servicio</th>
                    <th className="py-3 px-4">Técnico Asignado</th>
                    <th className="py-3 px-4">Importe Total Bruto</th>
                    <th className="py-3 px-4">Nuestra Comisión (30%)</th>
                    <th className="py-3 px-4">Pago Técnico (70%)</th>
                    <th className="py-3 px-4">Estado Cobro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/70">
                  {requests.map((req) => {
                    const tech = req.assignedTechId ? technicians.find((t) => t.id === req.assignedTechId) : null;
                    const gross = req.finalCost || req.estimatedCost;
                    const fee30 = Math.round(gross * 0.3);
                    const net70 = Math.round(gross * 0.7);

                    return (
                      <tr key={req.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-red-400">{req.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{req.title}</div>
                          <div className="text-[10px] text-white/40">{req.clientName} ({req.location.neighborhood})</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-white/70">
                          {tech ? tech.fullName : 'Sin asignar'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">{gross}€</td>
                        <td className="py-3.5 px-4 font-serif italic text-green-400 text-sm">+{fee30}€</td>
                        <td className="py-3.5 px-4 font-bold text-white/50">{net70}€</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              req.status === 'completed' || req.status === 'closed'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {req.status === 'completed' || req.status === 'closed' ? 'Liquidado' : 'En trámite'}
                          </span>
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

      {/* TAB 4: QUALITY & RATINGS AUDIT */}
      {adminTab === 'quality' && (
        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-white tracking-tight">Auditoría de Calidad y Valoraciones de Clientes</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {technicians.map((tech) => (
                <div key={tech.id} className="p-5 rounded-xl bg-[#050505] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={tech.avatar}
                        alt={tech.fullName}
                        className="w-10 h-10 rounded-lg object-cover border border-white/10"
                      />
                      <div>
                        <h4 className="font-bold text-white text-sm">{tech.fullName}</h4>
                        <p className="text-[11px] text-white/40">{tech.registrationNumber}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-amber-400 font-bold text-base">★ {tech.rating || 'N/A'}</div>
                      <div className="text-[10px] text-white/40">{tech.completedJobsCount} trabajos completados</div>
                    </div>
                  </div>

                  {/* Rating history for this tech */}
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    {requests
                      .filter((r) => r.assignedTechId === tech.id && r.rated && r.rating)
                      .map((ratedReq) => (
                        <div key={ratedReq.id} className="p-2.5 rounded-lg bg-[#0a0a0a] border border-white/5 text-xs space-y-1">
                          <div className="flex items-center justify-between text-amber-400 font-bold">
                            <span>★ {ratedReq.rating?.stars} / 5</span>
                            <span className="text-[10px] text-white/40">{ratedReq.clientName}</span>
                          </div>
                          <p className="italic text-white/70 text-[11px]">"{ratedReq.rating?.comment}"</p>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
