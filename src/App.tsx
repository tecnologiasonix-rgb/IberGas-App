import React, { useState, useEffect } from 'react';
import { Navbar, UserRoleView } from './components/Navbar';
import { ClientEmergencyFlow } from './components/client/ClientEmergencyFlow';
import { TechnicianPortal } from './components/technician/TechnicianPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EmergencyRequest, Technician, TechStatus, VerificationDocument } from './types';
import { getStoredRequests, saveRequests, getStoredTechnicians, saveTechnicians, calculateFinancialSummary, resetToDemoData } from './utils/storage';
import { Flame, ShieldCheck, PhoneCall, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRoleView>('client');
  const [requests, setRequests] = useState<EmergencyRequest[]>(() => getStoredRequests());
  const [technicians, setTechnicians] = useState<Technician[]>(() => getStoredTechnicians());

  // Listen to storage synchronization events
  useEffect(() => {
    const handleStorageUpdate = () => {
      setRequests(getStoredRequests());
      setTechnicians(getStoredTechnicians());
    };

    window.addEventListener('urgencias_data_updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('urgencias_data_updated', handleStorageUpdate);
    };
  }, []);

  // 1. Submit new Client Emergency Request
  const handleSubmitNewRequest = (
    newReqData: Omit<EmergencyRequest, 'id' | 'createdAt' | 'timeline' | 'status'>
  ) => {
    const newId = `URG-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRequest: EmergencyRequest = {
      ...newReqData,
      id: newId,
      status: 'pending_dispatch',
      createdAt: new Date().toISOString(),
      timeline: [
        {
          status: 'pending_dispatch',
          timestamp: new Date().toISOString(),
          note: 'Solicitud urgente recibida en la central de Urgencias BCN'
        }
      ]
    };

    const updated = [newRequest, ...requests];
    setRequests(updated);
    saveRequests(updated);
  };

  // 2. Client Rates Completed Request
  const handleRateRequest = (
    requestId: string,
    ratingData: { stars: number; comment: string; badges: string[] }
  ) => {
    const updated = requests.map((req) => {
      if (req.id === requestId) {
        const ratedReq: EmergencyRequest = {
          ...req,
          status: 'closed',
          rated: true,
          rating: {
            ...ratingData,
            createdAt: new Date().toISOString()
          },
          timeline: [
            ...req.timeline,
            {
              status: 'closed',
              timestamp: new Date().toISOString(),
              note: `Cliente valoró el servicio con ${ratingData.stars} estrellas`
            }
          ]
        };

        // Update assigned technician's average rating
        if (req.assignedTechId) {
          const techToUpdate = technicians.find((t) => t.id === req.assignedTechId);
          if (techToUpdate) {
            const updatedTechs = technicians.map((t) => {
              if (t.id === req.assignedTechId) {
                const newTotalJobs = t.completedJobsCount + 1;
                const newRating = Math.round(((t.rating * t.completedJobsCount + ratingData.stars) / newTotalJobs) * 10) / 10;
                return {
                  ...t,
                  rating: newRating,
                  completedJobsCount: newTotalJobs
                };
              }
              return t;
            });
            setTechnicians(updatedTechs);
            saveTechnicians(updatedTechs);
          }
        }

        return ratedReq;
      }
      return req;
    });

    setRequests(updated);
    saveRequests(updated);
  };

  // 3. Technician Status Toggle
  const handleUpdateTechStatus = (techId: string, status: TechStatus) => {
    const updated = technicians.map((t) => (t.id === techId ? { ...t, status } : t));
    setTechnicians(updated);
    saveTechnicians(updated);
  };

  // 4. Accept Job Offer (Technician or Admin Dispatch)
  const handleAcceptJob = (requestId: string, techId: string) => {
    const assignedTech = technicians.find((t) => t.id === techId);
    if (!assignedTech) return;

    const updated = requests.map((req) => {
      if (req.id === requestId) {
        const gross = req.estimatedCost;
        const fee30 = Math.round(gross * 0.3);
        const net70 = Math.round(gross * 0.7);

        return {
          ...req,
          status: 'tech_assigned' as const,
          assignedTechId: techId,
          finalCost: gross,
          commissionAmount: fee30,
          techPayoutAmount: net70,
          dispatchNotes: `Asignado a ${assignedTech.fullName}`,
          timeline: [
            ...req.timeline,
            {
              status: 'tech_assigned' as const,
              timestamp: new Date().toISOString(),
              note: `Técnico ${assignedTech.fullName} asignado y en preparación.`
            }
          ]
        };
      }
      return req;
    });

    setRequests(updated);
    saveRequests(updated);
  };

  // 5. Update Job Progress Status (En camino -> In progress -> Completed)
  const handleUpdateJobStatus = (requestId: string, newStatus: EmergencyRequest['status']) => {
    const updated = requests.map((req) => {
      if (req.id === requestId) {
        const isCompleting = newStatus === 'completed';
        const updatedReq = {
          ...req,
          status: newStatus,
          timeline: [
            ...req.timeline,
            {
              status: newStatus,
              timestamp: new Date().toISOString(),
              note:
                newStatus === 'tech_en_route'
                  ? 'Técnico en camino al domicilio'
                  : newStatus === 'in_progress'
                  ? 'Técnico ejecutando reparación en el domicilio'
                  : 'Trabajo finalizado y cobro registrado'
            }
          ]
        };

        // If job completed, update technician financial ledger
        if (isCompleting && req.assignedTechId) {
          const gross = req.finalCost || req.estimatedCost;
          const fee30 = Math.round(gross * 0.3);
          const net70 = Math.round(gross * 0.7);

          const updatedTechs = technicians.map((t) => {
            if (t.id === req.assignedTechId) {
              return {
                ...t,
                status: 'available' as const,
                totalEarningsGross: t.totalEarningsGross + gross,
                netEarnings: t.netEarnings + net70,
                commissionPaid: t.commissionPaid + fee30,
                completedJobsCount: t.completedJobsCount + 1,
                totalJobs: t.totalJobs + 1
              };
            }
            return t;
          });
          setTechnicians(updatedTechs);
          saveTechnicians(updatedTechs);
        }

        return updatedReq;
      }
      return req;
    });

    setRequests(updated);
    saveRequests(updated);
  };

  // 6. Technician Document Upload
  const handleAddTechDocument = (
    techId: string,
    docData: Omit<VerificationDocument, 'id' | 'status' | 'uploadedAt'>
  ) => {
    const newDoc: VerificationDocument = {
      ...docData,
      id: `doc-${Date.now()}`,
      status: 'pending',
      uploadedAt: new Date().toISOString()
    };

    const updatedTechs = technicians.map((t) => {
      if (t.id === techId) {
        return {
          ...t,
          verificationStatus: 'pending_review' as const,
          documents: [...t.documents, newDoc]
        };
      }
      return t;
    });

    setTechnicians(updatedTechs);
    saveTechnicians(updatedTechs);
  };

  // 7. Register New Technician
  const handleRegisterNewTech = (
    newTechData: Omit<Technician, 'id' | 'createdAt' | 'rating' | 'totalJobs' | 'completedJobsCount' | 'totalEarningsGross' | 'netEarnings' | 'commissionPaid'>
  ) => {
    const newTech: Technician = {
      ...newTechData,
      id: `tech-${Date.now()}`,
      rating: 5.0,
      totalJobs: 0,
      completedJobsCount: 0,
      totalEarningsGross: 0,
      netEarnings: 0,
      commissionPaid: 0,
      createdAt: new Date().toISOString()
    };

    const updatedTechs = [newTech, ...technicians];
    setTechnicians(updatedTechs);
    saveTechnicians(updatedTechs);
  };

  // 8. Admin Verification Actions
  const handleApproveTechDoc = (techId: string, docId: string, status: 'verified' | 'rejected') => {
    const updatedTechs = technicians.map((t) => {
      if (t.id === techId) {
        const updatedDocs = t.documents.map((d) => (d.id === docId ? { ...d, status } : d));
        const allVerified = updatedDocs.every((d) => d.status === 'verified');
        return {
          ...t,
          documents: updatedDocs,
          verificationStatus: allVerified ? ('verified' as const) : t.verificationStatus
        };
      }
      return t;
    });

    setTechnicians(updatedTechs);
    saveTechnicians(updatedTechs);
  };

  const handleVerifyEntireTech = (techId: string, status: 'verified' | 'rejected') => {
    const updatedTechs = technicians.map((t) => {
      if (t.id === techId) {
        const updatedDocs = t.documents.map((d) => ({ ...d, status }));
        return {
          ...t,
          status: status === 'verified' ? ('available' as const) : t.status,
          verificationStatus: status,
          documents: updatedDocs
        };
      }
      return t;
    });

    setTechnicians(updatedTechs);
    saveTechnicians(updatedTechs);
  };

  const financialSummary = calculateFinancialSummary(requests);
  const activeRequestsCount = requests.filter((r) => r.status !== 'closed' && r.status !== 'cancelled').length;
  const pendingDocsCount = technicians.filter((t) => t.verificationStatus === 'pending_review').length;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* App Header Bar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activeRequestsCount={activeRequestsCount}
        pendingDocsCount={pendingDocsCount}
        totalCommission={financialSummary.totalPlatformCommission}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {currentRole === 'client' && (
          <ClientEmergencyFlow
            requests={requests}
            technicians={technicians}
            onSubmitRequest={handleSubmitNewRequest}
            onRateRequest={handleRateRequest}
          />
        )}

        {currentRole === 'technician' && (
          <TechnicianPortal
            technicians={technicians}
            requests={requests}
            onUpdateTechStatus={handleUpdateTechStatus}
            onAcceptJob={handleAcceptJob}
            onUpdateJobStatus={handleUpdateJobStatus}
            onAddTechDocument={handleAddTechDocument}
            onRegisterNewTech={handleRegisterNewTech}
          />
        )}

        {currentRole === 'admin' && (
          <AdminDashboard
            requests={requests}
            technicians={technicians}
            onAssignTechToJob={handleAcceptJob}
            onApproveTechDoc={handleApproveTechDoc}
            onVerifyEntireTech={handleVerifyEntireTech}
            onResetDemoData={() => {
              resetToDemoData();
              setRequests(getStoredRequests());
              setTechnicians(getStoredTechnicians());
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#080808] py-8 px-4 text-xs text-white/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600/10 text-red-500 flex items-center justify-center border border-red-500/20 font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-white text-sm tracking-tight">URGENT<span className="text-red-500">BCN</span> · Central de Intermediación</div>
              <div className="text-[11px] text-white/40">
                Cobertura 24h en Barcelona, L'Hospitalet, Badalona, Sabadell, Terrassa y Sant Cugat.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px] text-white/60">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              Técnicos Verificados con Seguro RC
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              Comisión fija del 30% por gestión
            </span>
            <a href="tel:+34930000930" className="font-bold text-white hover:text-red-400 transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              Atención 24h: 930 000 930
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
