import { EmergencyRequest, Technician, ServiceType } from '../types';

export const BARCELONA_NEIGHBORHOODS = [
  'Eixample Dreta, Barcelona',
  'Eixample Esquerra, Barcelona',
  'Gràcia, Barcelona',
  'Poblenou, Barcelona',
  'Sants-Montjuïc, Barcelona',
  'Sarrià - Sant Gervasi, Barcelona',
  'Ciutat Vella / Gòtic, Barcelona',
  'Les Corts, Barcelona',
  'Sant Andreu, Barcelona',
  'Horta-Guinardó, Barcelona',
  'L\'Hospitalet de Llobregat',
  'Badalona',
  'Santa Coloma de Gramenet',
  'Sant Cugat del Vallès',
  'Sabadell',
  'Terrassa',
  'Cornellà de Llobregat',
  'Mataró'
];

export const INITIAL_TECHNICIANS: Technician[] = [
  {
    id: 'tech-101',
    fullName: 'Jordi Ferré Miquel',
    phone: '+34 612 849 301',
    email: 'j.ferre@instalbarcelona.com',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    specialties: ['gas', 'electricity', 'plumbing'],
    registrationNumber: 'CAT-GAS-88492 / ELEC-20419',
    status: 'available',
    verificationStatus: 'verified',
    rating: 4.9,
    totalJobs: 142,
    completedJobsCount: 138,
    totalEarningsGross: 18900,
    netEarnings: 13230,
    commissionPaid: 5670,
    vehicleInfo: 'Furgoneta Renault Kangoo 8941-KBL (Taller Móvil)',
    createdAt: '2025-01-15T10:00:00Z',
    currentLocation: {
      lat: 41.38879,
      lng: 2.15899,
      address: 'Carrer de Mallorca 240, Eixample',
      neighborhood: 'Eixample Esquerra, Barcelona'
    },
    documents: [
      {
        id: 'doc-101-1',
        type: 'dni',
        name: 'DNI_Jordi_Ferre.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
        documentNumber: '46382910-X',
        expiryDate: '2029-08-12',
        status: 'verified',
        uploadedAt: '2025-01-15T10:15:00Z'
      },
      {
        id: 'doc-101-2',
        type: 'installer_license',
        name: 'Carnet_Instalador_CatGas_Elect.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
        documentNumber: 'IG-II-BCN-49201',
        expiryDate: '2027-11-30',
        status: 'verified',
        uploadedAt: '2025-01-15T10:20:00Z'
      },
      {
        id: 'doc-101-3',
        type: 'liability_insurance',
        name: 'Poliza_Seguro_RC_Zurich_600k.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&q=80',
        documentNumber: 'POL-RC-99201482',
        expiryDate: '2026-12-31',
        status: 'verified',
        uploadedAt: '2025-01-15T10:25:00Z'
      }
    ]
  },
  {
    id: 'tech-102',
    fullName: 'Marc Soler Pujol',
    phone: '+34 639 201 448',
    email: 'msoler.fontaneria@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    specialties: ['plumbing'],
    registrationNumber: 'FON-BCN-19402',
    status: 'available',
    verificationStatus: 'verified',
    rating: 4.8,
    totalJobs: 89,
    completedJobsCount: 86,
    totalEarningsGross: 11400,
    netEarnings: 7980,
    commissionPaid: 3420,
    vehicleInfo: 'Citroën Berlingo 4102-LMB',
    createdAt: '2025-02-01T09:30:00Z',
    currentLocation: {
      lat: 41.4036,
      lng: 2.1565,
      address: 'Carrer de Astúries 18, Gràcia',
      neighborhood: 'Gràcia, Barcelona'
    },
    documents: [
      {
        id: 'doc-102-1',
        type: 'dni',
        name: 'DNI_Marc_Soler.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
        documentNumber: '39201948-B',
        expiryDate: '2028-04-19',
        status: 'verified',
        uploadedAt: '2025-02-01T09:40:00Z'
      },
      {
        id: 'doc-102-2',
        type: 'installer_license',
        name: 'Carnet_Fontaneria_Gremio.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
        documentNumber: 'FON-CAT-09412',
        expiryDate: '2027-06-15',
        status: 'verified',
        uploadedAt: '2025-02-01T09:45:00Z'
      },
      {
        id: 'doc-102-3',
        type: 'liability_insurance',
        name: 'Seguro_RC_Mapfre_300k.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&q=80',
        documentNumber: 'MAP-8820149',
        expiryDate: '2026-10-01',
        status: 'verified',
        uploadedAt: '2025-02-01T09:50:00Z'
      }
    ]
  },
  {
    id: 'tech-103',
    fullName: 'David Ramos García',
    phone: '+34 608 112 903',
    email: 'electrotech.ramos@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    specialties: ['electricity'],
    registrationNumber: 'ELE-BCN-99412',
    status: 'available',
    verificationStatus: 'verified',
    rating: 4.9,
    totalJobs: 110,
    completedJobsCount: 108,
    totalEarningsGross: 15200,
    netEarnings: 10640,
    commissionPaid: 4560,
    vehicleInfo: 'Peugeot Partner 9021-MKN',
    createdAt: '2025-01-20T11:00:00Z',
    currentLocation: {
      lat: 41.3652,
      lng: 2.1128,
      address: 'Rambla Just Oliveras 45, L\'Hospitalet',
      neighborhood: 'L\'Hospitalet de Llobregat'
    },
    documents: [
      {
        id: 'doc-103-1',
        type: 'dni',
        name: 'DNI_David_Ramos.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
        documentNumber: '48201934-L',
        expiryDate: '2030-01-10',
        status: 'verified',
        uploadedAt: '2025-01-20T11:10:00Z'
      },
      {
        id: 'doc-103-2',
        type: 'installer_license',
        name: 'Carnet_Electricista_Baja_Tension.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
        documentNumber: 'ELE-BT-8841',
        expiryDate: '2028-09-20',
        status: 'verified',
        uploadedAt: '2025-01-20T11:15:00Z'
      },
      {
        id: 'doc-103-3',
        type: 'liability_insurance',
        name: 'Seguro_RC_AXA.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&q=80',
        documentNumber: 'AXA-992140',
        expiryDate: '2027-01-01',
        status: 'verified',
        uploadedAt: '2025-01-20T11:20:00Z'
      }
    ]
  },
  {
    id: 'tech-104',
    fullName: 'Aina Bassets Valls',
    phone: '+34 677 348 109',
    email: 'abassets.gas@hotmail.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    specialties: ['gas', 'plumbing'],
    registrationNumber: 'GAS-CAT-77401',
    status: 'busy',
    verificationStatus: 'verified',
    rating: 4.95,
    totalJobs: 64,
    completedJobsCount: 63,
    totalEarningsGross: 9800,
    netEarnings: 6860,
    commissionPaid: 2940,
    vehicleInfo: 'Nissan NV200 3392-KPX',
    createdAt: '2025-02-10T14:00:00Z',
    currentLocation: {
      lat: 41.4489,
      lng: 2.2472,
      address: 'Avinguda Martí Pujol 112, Badalona',
      neighborhood: 'Badalona'
    },
    documents: [
      {
        id: 'doc-104-1',
        type: 'dni',
        name: 'DNI_Aina_Bassets.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
        documentNumber: '47102938-Z',
        expiryDate: '2029-05-18',
        status: 'verified',
        uploadedAt: '2025-02-10T14:10:00Z'
      },
      {
        id: 'doc-104-2',
        type: 'installer_license',
        name: 'Carnet_Gas_Categoria_A.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
        documentNumber: 'GAS-A-9941',
        expiryDate: '2028-12-01',
        status: 'verified',
        uploadedAt: '2025-02-10T14:15:00Z'
      },
      {
        id: 'doc-104-3',
        type: 'liability_insurance',
        name: 'Seguro_RC_Generali.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&q=80',
        documentNumber: 'GEN-440219',
        expiryDate: '2026-11-15',
        status: 'verified',
        uploadedAt: '2025-02-10T14:20:00Z'
      }
    ]
  },
  {
    id: 'tech-105',
    fullName: 'Carlos Mendoza Ruiz',
    phone: '+34 655 491 202',
    email: 'carlos.mendoza.servicios@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    specialties: ['electricity', 'plumbing'],
    registrationNumber: 'PENDIENTE-REVISION',
    status: 'pending_verification',
    verificationStatus: 'pending_review',
    rating: 0,
    totalJobs: 0,
    completedJobsCount: 0,
    totalEarningsGross: 0,
    netEarnings: 0,
    commissionPaid: 0,
    vehicleInfo: 'Ford Transit Custom 1120-LZZ',
    createdAt: '2026-07-24T18:00:00Z',
    currentLocation: {
      lat: 41.4923,
      lng: 2.1086,
      address: 'Rambla del Celler 30, Sant Cugat',
      neighborhood: 'Sant Cugat del Vallès'
    },
    documents: [
      {
        id: 'doc-105-1',
        type: 'dni',
        name: 'DNI_Carlos_Mendoza_FrontBack.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
        documentNumber: '53910294-K',
        expiryDate: '2031-03-22',
        status: 'pending',
        uploadedAt: '2026-07-24T18:05:00Z'
      },
      {
        id: 'doc-105-2',
        type: 'installer_license',
        name: 'Carnet_Certificado_Instalador_Electricidad.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
        documentNumber: 'ELE-CAT-33920',
        expiryDate: '2028-02-14',
        status: 'pending',
        uploadedAt: '2026-07-24T18:10:00Z'
      },
      {
        id: 'doc-105-3',
        type: 'liability_insurance',
        name: 'Poliza_Seguro_RC_Caser_400k.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&q=80',
        documentNumber: 'CAS-104928',
        expiryDate: '2027-05-10',
        status: 'pending',
        uploadedAt: '2026-07-24T18:12:00Z'
      }
    ]
  }
];

export const INITIAL_REQUESTS: EmergencyRequest[] = [
  {
    id: 'URG-9021',
    clientName: 'Elena Roca Pastells',
    clientPhone: '+34 689 402 119',
    serviceType: 'gas',
    urgency: 'immediate',
    title: 'Olor fuerte a gas cerca de la caldera de cocina',
    description: 'Hemos detectado olor a gas al encender el agua caliente. Hemos cerrado la llave de paso de la cocina por precaución.',
    photoUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80',
    location: {
      lat: 41.3925,
      lng: 2.1642,
      address: 'Carrer de Valencia 312, 3º 2ª',
      neighborhood: 'Eixample Dreta, Barcelona',
      floorDetails: 'Piso 3, Puerta 2 (Hay ascensor)'
    },
    status: 'pending_dispatch',
    createdAt: '2026-07-24T22:35:00Z',
    estimatedCost: 160,
    timeline: [
      {
        status: 'pending_dispatch',
        timestamp: '2026-07-24T22:35:00Z',
        note: 'Solicitud de urgencia de gas registrada en la plataforma'
      }
    ]
  },
  {
    id: 'URG-9022',
    clientName: 'Miquel Anglada Clavé',
    clientPhone: '+34 611 902 443',
    serviceType: 'plumbing',
    urgency: 'immediate',
    title: 'Rotura de tubería de agua en baño principal',
    description: 'Agua saliendo con fuerza tras el inodoro. Afecta al suelo de parquet. Necesitamos fontanero urgente en menos de 30 min.',
    photoUrl: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&auto=format&fit=crop&q=80',
    location: {
      lat: 41.4051,
      lng: 2.1580,
      address: 'Carrer de Verdi 84, Principal 1ª',
      neighborhood: 'Gràcia, Barcelona'
    },
    status: 'tech_assigned',
    assignedTechId: 'tech-102',
    createdAt: '2026-07-24T22:15:00Z',
    estimatedCost: 140,
    finalCost: 140,
    commissionAmount: 42, // 30% de 140
    techPayoutAmount: 98,  // 70% de 140
    dispatchNotes: 'Asignado a Marc Soler Pujol (Fontanero Certificado Gràcia)',
    timeline: [
      {
        status: 'pending_dispatch',
        timestamp: '2026-07-24T22:15:00Z',
        note: 'Solicitud urgente recibida'
      },
      {
        status: 'contacting_techs',
        timestamp: '2026-07-24T22:17:00Z',
        note: 'Central contactó con Marc Soler (+34 639 201 448)'
      },
      {
        status: 'tech_assigned',
        timestamp: '2026-07-24T22:19:00Z',
        note: 'Marc Soler ha aceptado el trabajo. En camino.'
      }
    ]
  },
  {
    id: 'URG-9020',
    clientName: 'Carme Miró Serra',
    clientPhone: '+34 633 109 882',
    serviceType: 'electricity',
    urgency: 'within_2h',
    title: 'Corte general de luz en vivienda con chispas en cuadro',
    description: 'Saltó el diferencial tras un chasquido. No se puede rearmar el magneto térmico principal.',
    photoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
    location: {
      lat: 41.3688,
      lng: 2.1189,
      address: 'Avinguda Isabel la Catòlica 22',
      neighborhood: 'L\'Hospitalet de Llobregat'
    },
    status: 'completed',
    assignedTechId: 'tech-103',
    createdAt: '2026-07-24T19:00:00Z',
    estimatedCost: 130,
    finalCost: 130,
    commissionAmount: 39,
    techPayoutAmount: 91,
    rated: true,
    rating: {
      stars: 5,
      comment: 'David llegó en 20 minutos. Diagnosticó un cortocircuito en el horno, aisló la línea dañada y devolvió la luz a la casa rápidamente. Excelente trato.',
      badges: ['Llegada Puntual', 'Diagnóstico Certero', 'Trabajo Impecable'],
      createdAt: '2026-07-24T21:10:00Z'
    },
    timeline: [
      {
        status: 'pending_dispatch',
        timestamp: '2026-07-24T19:00:00Z',
        note: 'Aviso urgente de electricidad'
      },
      {
        status: 'tech_assigned',
        timestamp: '2026-07-24T19:05:00Z',
        note: 'Asignado a David Ramos García'
      },
      {
        status: 'completed',
        timestamp: '2026-07-24T20:30:00Z',
        note: 'Servicio completado e informado por el técnico'
      },
      {
        status: 'closed',
        timestamp: '2026-07-24T21:10:00Z',
        note: 'Cliente completó valoración de 5 estrellas'
      }
    ]
  }
];

export const SERVICE_METADATA = {
  gas: {
    title: 'Urgencias de Gas',
    color: 'amber',
    bgBadge: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    badgeText: 'Certificado IG-II / Categ. A',
    iconName: 'Flame',
    basePrice: 150,
    emergencyMultiplier: 1.2,
    description: 'Fugas de gas, fallos de caldera, revisiones de urgencia, monóxido de carbono.'
  },
  electricity: {
    title: 'Electricidad de Urgencia',
    color: 'yellow',
    bgBadge: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    badgeText: 'Instalador Autorizado BT',
    iconName: 'Zap',
    basePrice: 120,
    emergencyMultiplier: 1.15,
    description: 'Cortocircuitos, cuadro eléctrico, apagones, derivaciones a tierra, diferenciales.'
  },
  plumbing: {
    title: 'Fontanería Urgente',
    color: 'blue',
    bgBadge: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    badgeText: 'Fontanería y Saneamiento',
    iconName: 'Droplet',
    basePrice: 130,
    emergencyMultiplier: 1.15,
    description: 'Inundaciones, reventón de tuberías, desatascos urgentes, bajantes, goteos masivos.'
  }
};
