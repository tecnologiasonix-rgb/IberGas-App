import { EmergencyRequest, Technician, FinancialSummary } from '../types';
import { INITIAL_REQUESTS, INITIAL_TECHNICIANS } from '../data/mockData';

const STORAGE_KEYS = {
  REQUESTS: 'urgencias_bcn_requests_v1',
  TECHNICIANS: 'urgencias_bcn_techs_v1',
  COMMISSION_RATE: 'urgencias_bcn_commission_v1' // Default 30%
};

export function getStoredRequests(): EmergencyRequest[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
      return INITIAL_REQUESTS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading requests from localStorage:', err);
    return INITIAL_REQUESTS;
  }
}

export function saveRequests(requests: EmergencyRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    window.dispatchEvent(new CustomEvent('urgencias_data_updated'));
  } catch (err) {
    console.error('Error saving requests:', err);
  }
}

export function getStoredTechnicians(): Technician[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TECHNICIANS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(INITIAL_TECHNICIANS));
      return INITIAL_TECHNICIANS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading technicians from localStorage:', err);
    return INITIAL_TECHNICIANS;
  }
}

export function saveTechnicians(techs: Technician[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(techs));
    window.dispatchEvent(new CustomEvent('urgencias_data_updated'));
  } catch (err) {
    console.error('Error saving technicians:', err);
  }
}

export function getCommissionRate(): number {
  return 0.30; // Fixed 30% intermediary fee as required by user prompt
}

export function calculateFinancialSummary(requests: EmergencyRequest[]): FinancialSummary {
  const completed = requests.filter((r) => r.status === 'completed' || r.status === 'closed');
  
  const totalGrossVolume = completed.reduce((acc, curr) => acc + (curr.finalCost || curr.estimatedCost || 0), 0);
  const totalPlatformCommission = Math.round(totalGrossVolume * 0.30 * 100) / 100;
  const totalTechPayouts = Math.round(totalGrossVolume * 0.70 * 100) / 100;

  return {
    totalGrossVolume,
    totalPlatformCommission,
    totalTechPayouts,
    completedJobs: completed.length,
    pendingPayouts: requests.filter((r) => r.status === 'completed' && !r.rated).length
  };
}

export function resetToDemoData(): void {
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(INITIAL_TECHNICIANS));
  window.dispatchEvent(new CustomEvent('urgencias_data_updated'));
}
