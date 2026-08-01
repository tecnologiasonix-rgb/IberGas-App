export type ServiceType = 'gas' | 'electricity' | 'plumbing';

export type UrgencyLevel = 'immediate' | 'within_2h' | 'today';

export type RequestStatus = 
  | 'pending_dispatch'   // Solicitada, la central está buscando/contactando técnico
  | 'contacting_techs'   // Central contactando a técnicos cercanos
  | 'tech_assigned'      // Técnico aceptó el servicio
  | 'tech_en_route'      // Técnico en camino
  | 'in_progress'        // Trabajo en ejecución
  | 'completed'          // Trabajo finalizado, pendiente pago/valoración
  | 'closed'             // Concluido y valorado
  | 'cancelled';         // Cancelado

export type TechStatus = 'available' | 'busy' | 'offline' | 'pending_verification' | 'suspended';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address: string;
  neighborhood: string; // e.g. Eixample, Gràcia, L'Hospitalet, Badalona, Sabadell
  floorDetails?: string;
}

export interface VerificationDocument {
  id: string;
  type: 'dni' | 'installer_license' | 'liability_insurance' | 'autonomo_receipt';
  name: string;
  fileUrl: string;
  documentNumber?: string;
  expiryDate?: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  uploadedAt: string;
}

export interface Technician {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  avatar: string;
  specialties: ServiceType[];
  registrationNumber: string; // Número de Carnet Profesional / Colegiado
  status: TechStatus;
  verificationStatus: 'unverified' | 'pending_review' | 'verified' | 'rejected';
  documents: VerificationDocument[];
  currentLocation: LocationCoordinates;
  rating: number;
  totalJobs: number;
  completedJobsCount: number;
  totalEarningsGross: number; // Facturación total bruta
  netEarnings: number;        // 70% para el técnico
  commissionPaid: number;     // 30% cobrado por la intermediaria
  vehicleInfo?: string;
  createdAt: string;
}

export interface EmergencyRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceType: ServiceType;
  urgency: UrgencyLevel;
  title: string;
  description: string;
  photoUrl?: string;
  location: LocationCoordinates;
  status: RequestStatus;
  assignedTechId?: string;
  createdAt: string;
  estimatedCost: number; // Importe estimado total
  finalCost?: number;    // Importe final cobrado
  commissionAmount?: number; // 30% del total
  techPayoutAmount?: number; // 70% del total
  dispatchNotes?: string;
  rated?: boolean;
  rating?: {
    stars: number;
    comment: string;
    badges: string[];
    createdAt: string;
  };
  timeline: {
    status: RequestStatus;
    timestamp: string;
    note: string;
  }[];
}

export interface DispatchOpportunity {
  id: string;
  requestId: string;
  techId: string;
  offeredAt: string;
  status: 'offered' | 'accepted' | 'declined' | 'expired';
  grossAmount: number;
  techShare: number; // 70%
  platformFee: number; // 30%
}

export interface FinancialSummary {
  totalGrossVolume: number;
  totalPlatformCommission: number; // 30%
  totalTechPayouts: number;        // 70%
  completedJobs: number;
  pendingPayouts: number;
}
