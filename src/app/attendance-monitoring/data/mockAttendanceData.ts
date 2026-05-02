export type ScanType = 'MORNING_IN' | 'MORNING_OUT' | 'AFTERNOON_IN' | 'AFTERNOON_OUT' | 'OT_IN' | 'OT_OUT';
export type ScanStatus = 'SYNCED' | 'PENDING' | 'FLAGGED' | 'MISSING' | 'NA';

export interface ScanEvent {
  type: ScanType;
  status: ScanStatus;
  time: string | null;
  localScore: number | null;
  serverScore: number | null;
  lat: number | null;
  lng: number | null;
}

export interface WorkerScanRow {
  id: string;
  name: string;
  trade: string;
  crewId: string;
  project: string;
  photoInitials: string;
  avatarColor: string;
  scans: Record<ScanType, ScanEvent>;
  totalHours: number | null;
  flag: 'GREEN' | 'YELLOW' | 'RED' | 'NONE';
  hasOverride: boolean;
}

export interface FlaggedScan {
  id: string;
  workerId: string;
  workerName: string;
  trade: string;
  scanType: ScanType;
  scannedAt: string;
  localScore: number;
  serverScore: number;
  referencePhotoUrl: string;
  scanPhotoUrl: string;
  project: string;
  reviewedBy: string | null;
}

const makeScan = (
  type: ScanType,
  status: ScanStatus,
  time: string | null,
  local: number | null,
  server: number | null,
  lat?: number,
  lng?: number
): ScanEvent => ({
  type,
  status,
  time,
  localScore: local,
  serverScore: server,
  lat: lat ?? null,
  lng: lng ?? null,
});

export const mockWorkerScans: WorkerScanRow[] = [
  {
    id: 'worker-001',
    name: 'Dara Chanthou',
    trade: 'Rebar',
    crewId: 'crew-alpha-1',
    project: 'Tower A',
    photoInitials: 'DC',
    avatarColor: '#7c3aed',
    scans: {
      MORNING_IN: makeScan('MORNING_IN', 'SYNCED', '06:52', 0.91, 0.93, 11.5564, 104.9282),
      MORNING_OUT: makeScan('MORNING_OUT', 'SYNCED', '12:05', 0.88, 0.90, 11.5564, 104.9282),
      AFTERNOON_IN: makeScan('AFTERNOON_IN', 'SYNCED', '13:02', 0.90, 0.92, 11.5568, 104.9285),
      AFTERNOON_OUT: makeScan('AFTERNOON_OUT', 'SYNCED', '17:31', 0.87, 0.89, 11.5568, 104.9285),
      OT_IN: makeScan('OT_IN', 'SYNCED', '17:45', 0.89, 0.91, 11.5568, 104.9285),
      OT_OUT: makeScan('OT_OUT', 'SYNCED', '20:12', 0.88, 0.90, 11.5568, 104.9285),
    },
    totalHours: 11.5,
    flag: 'GREEN',
    hasOverride: false,
  },
  {
    id: 'worker-002',
    name: 'Sokha Vann',
    trade: 'Formwork',
    crewId: 'crew-alpha-1',
    project: 'Tower A',
    photoInitials: 'SV',
    avatarColor: '#0891b2',
    scans: {
      MORNING_IN: makeScan('MORNING_IN', 'SYNCED', '07:08', 0.85, 0.87, 11.5565, 104.9281),
      MORNING_OUT: makeScan('MORNING_OUT', 'SYNCED', '12:01', 0.83, 0.85, 11.5565, 104.9281),
      AFTERNOON_IN: makeScan('AFTERNOON_IN', 'FLAGGED', '13:11', 0.62, 0.58, 11.5565, 104.9281),
      AFTERNOON_OUT: makeScan('AFTERNOON_OUT', 'MISSING', null, null, null),
      OT_IN: makeScan('OT_IN', 'NA', null, null, null),
      OT_OUT: makeScan('OT_OUT', 'NA', null, null, null),
    },
    totalHours: 5.0,
    flag: 'RED',
    hasOverride: false,
  },
  {
    id: 'worker-003',
    name: 'Pita Ramirez',
    trade: 'Concrete',
    crewId: 'crew-beta-2',
    project: 'Tower B',
    photoInitials: 'PR',
    avatarColor: '#16a34a',
    scans: {
      MORNING_IN: makeScan('MORNING_IN', 'SYNCED', '06:45', 0.93, 0.95, 11.5570, 104.9290),
      MORNING_OUT: makeScan('MORNING_OUT', 'SYNCED', '12:10', 0.91, 0.93, 11.5570, 104.9290),
      AFTERNOON_IN: makeScan('AFTERNOON_IN', 'SYNCED', '13:05', 0.92, 0.94, 11.5572, 104.9291),
      AFTERNOON_OUT: makeScan('AFTERNOON_OUT', 'SYNCED', '17:28', 0.90, 0.92, 11.5572, 104.9291),
      OT_IN: makeScan('OT_IN', 'NA', null, null, null),
      OT_OUT: makeScan('OT_OUT', 'NA', null, null, null),
    },
    totalHours: 9.8,
    flag: 'GREEN',
    hasOverride: false,
  },
  {
    id: 'worker-004',
    name: 'Narin Sopheap',
    trade: 'Steel Fix',
    crewId: 'crew-alpha-2',
    project: 'Tower A',
    photoInitials: 'NS',
    avatarColor: '#b45309',
    scans: {
      MORNING_IN: makeScan('MORNING_IN', 'PENDING', '07:15', 0.77, null, 11.5563, 104.9280),
      MORNING_OUT: makeScan('MORNING_OUT', 'PENDING', '12:08', 0.79, null, 11.5563, 104.9280),
      AFTERNOON_IN: makeScan('AFTERNOON_IN', 'PENDING', '13:20', 0.76, null, 11.5563, 104.9280),
      AFTERNOON_OUT: makeScan('AFTERNOON_OUT', 'MISSING', null, null, null),
      OT_IN: makeScan('OT_IN', 'NA', null, null, null),
      OT_OUT: makeScan('OT_OUT', 'NA', null, null, null),
    },
    totalHours: null,
    flag: 'YELLOW',
    hasOverride: false,
  },
  {
    id: 'worker-005',
    name: 'Ahmad Fadli',
    trade: 'Masonry',
    crewId: 'crew-gamma-1',
    project: 'Podium C',
    photoInitials: 'AF',
    avatarColor: '#dc2626',
    scans: {
      MORNING_IN: makeScan('MORNING_IN', 'SYNCED', '06:58', 0.88, 0.91, 11.5555, 104.9275),
      MORNING_OUT: makeScan('MORNING_OUT', 'SYNCED', '12:03', 0.86, 0.88, 11.5555, 104.9275),
      AFTERNOON_IN: makeScan('AFTERNOON_IN', 'SYNCED', '13:08', 0.89, 0.91, 11.5556, 104.9276),
      AFTERNOON_OUT: makeScan('AFTERNOON_OUT', 'SYNCED', '17:35', 0.87, 0.90, 11.5556, 104.9276),
      OT_IN: makeScan('OT_IN', 'SYNCED', '18:00', 0.85, 0.88, 11.5556, 104.9276),
      OT_OUT: makeScan('OT_OUT', 'PENDING', '20:45', 0.82, null, 11.5556, 104.9276),
    },
    totalHours: 12.1,
    flag: 'GREEN',
    hasOverride: false,
  },
  {
    id: 'worker-006',
    name: 'Ratha Kimheng',
    trade: 'Rebar',
    crewId: 'crew-alpha-1',
    project: 'Tower A',
    photoInitials: 'RK',
    avatarColor: '#7c3aed',
    scans: {
      MORNING_IN: makeScan('MORNING_IN', 'MISSING', null, null, null),
      MORNING_OUT: makeScan('MORNING_OUT', 'MISSING', null, null, null),
      AFTERNOON_IN: makeScan('AFTERNOON_IN', 'MISSING', null, null, null),
      AFTERNOON_OUT: makeScan('AFTERNOON_OUT', 'MISSING', null, null, null),
      OT_IN: makeScan('OT_IN', 'NA', null, null, null),
      OT_OUT: makeScan('OT_OUT', 'NA', null, null, null),
    },
    totalHours: 0,
    flag: 'RED',
    hasOverride: false,
  },
  {
    id: 'worker-007',
    name: 'Thy Borey',
    trade: 'Concrete',
    crewId: 'crew-beta-2',
    project: 'Tower B',
    photoInitials: 'TB',
    avatarColor: '#16a34a',
    scans: {
      MORNING_IN: makeScan('MORNING_IN', 'SYNCED', '07:00', 0.90, 0.92, 11.5571, 104.9289),
      MORNING_OUT: makeScan('MORNING_OUT', 'SYNCED', '12:00', 0.89, 0.91, 11.5571, 104.9289),
      AFTERNOON_IN: makeScan('AFTERNOON_IN', 'SYNCED', '13:00', 0.91, 0.93, 11.5571, 104.9289),
      AFTERNOON_OUT: makeScan('AFTERNOON_OUT', 'SYNCED', '17:30', 0.88, 0.90, 11.5571, 104.9289),
      OT_IN: makeScan('OT_IN', 'NA', null, null, null),
      OT_OUT: makeScan('OT_OUT', 'NA', null, null, null),
    },
    totalHours: 9.5,
    flag: 'GREEN',
    hasOverride: false,
  },
  {
    id: 'worker-008',
    name: 'Meas Chanthy',
    trade: 'Formwork',
    crewId: 'crew-alpha-2',
    project: 'Tower A',
    photoInitials: 'MC',
    avatarColor: '#b45309',
    scans: {
      MORNING_IN: makeScan('MORNING_IN', 'SYNCED', '06:55', 0.86, 0.88, 11.5564, 104.9283),
      MORNING_OUT: makeScan('MORNING_OUT', 'FLAGGED', '12:07', 0.61, 0.55, 11.5564, 104.9283),
      AFTERNOON_IN: makeScan('AFTERNOON_IN', 'SYNCED', '13:15', 0.87, 0.89, 11.5564, 104.9283),
      AFTERNOON_OUT: makeScan('AFTERNOON_OUT', 'SYNCED', '17:29', 0.85, 0.87, 11.5564, 104.9283),
      OT_IN: makeScan('OT_IN', 'NA', null, null, null),
      OT_OUT: makeScan('OT_OUT', 'NA', null, null, null),
    },
    totalHours: 9.4,
    flag: 'YELLOW',
    hasOverride: false,
  },
  {
    id: 'worker-009',
    name: 'Kosal Phirun',
    trade: 'Steel Fix',
    crewId: 'crew-gamma-1',
    project: 'Podium C',
    photoInitials: 'KP',
    avatarColor: '#dc2626',
    scans: {
      MORNING_IN: makeScan('MORNING_IN', 'SYNCED', '07:02', 0.92, 0.94, 11.5554, 104.9274),
      MORNING_OUT: makeScan('MORNING_OUT', 'SYNCED', '12:04', 0.90, 0.92, 11.5554, 104.9274),
      AFTERNOON_IN: makeScan('AFTERNOON_IN', 'SYNCED', '13:03', 0.91, 0.93, 11.5554, 104.9274),
      AFTERNOON_OUT: makeScan('AFTERNOON_OUT', 'SYNCED', '17:32', 0.89, 0.91, 11.5554, 104.9274),
      OT_IN: makeScan('OT_IN', 'SYNCED', '17:50', 0.88, 0.90, 11.5554, 104.9274),
      OT_OUT: makeScan('OT_OUT', 'SYNCED', '21:00', 0.87, 0.89, 11.5554, 104.9274),
    },
    totalHours: 12.5,
    flag: 'GREEN',
    hasOverride: false,
  },
  {
    id: 'worker-010',
    name: 'Heng Vibol',
    trade: 'Masonry',
    crewId: 'crew-beta-2',
    project: 'Tower B',
    photoInitials: 'HV',
    avatarColor: '#0891b2',
    scans: {
      MORNING_IN: makeScan('MORNING_IN', 'SYNCED', '06:50', 0.87, 0.89, 11.5569, 104.9288),
      MORNING_OUT: makeScan('MORNING_OUT', 'SYNCED', '12:06', 0.85, 0.87, 11.5569, 104.9288),
      AFTERNOON_IN: makeScan('AFTERNOON_IN', 'SYNCED', '13:07', 0.88, 0.90, 11.5569, 104.9288),
      AFTERNOON_OUT: makeScan('AFTERNOON_OUT', 'PENDING', '17:27', 0.80, null, 11.5569, 104.9288),
      OT_IN: makeScan('OT_IN', 'NA', null, null, null),
      OT_OUT: makeScan('OT_OUT', 'NA', null, null, null),
    },
    totalHours: 9.6,
    flag: 'GREEN',
    hasOverride: false,
  },
  {
    id: 'worker-011',
    name: 'Srey Leak',
    trade: 'Rebar',
    crewId: 'crew-alpha-2',
    project: 'Tower A',
    photoInitials: 'SL',
    avatarColor: '#7c3aed',
    scans: {
      MORNING_IN: makeScan('MORNING_IN', 'SYNCED', '07:05', 0.89, 0.91, 11.5562, 104.9279),
      MORNING_OUT: makeScan('MORNING_OUT', 'SYNCED', '12:02', 0.87, 0.89, 11.5562, 104.9279),
      AFTERNOON_IN: makeScan('AFTERNOON_IN', 'SYNCED', '13:06', 0.90, 0.92, 11.5562, 104.9279),
      AFTERNOON_OUT: makeScan('AFTERNOON_OUT', 'SYNCED', '17:33', 0.88, 0.90, 11.5562, 104.9279),
      OT_IN: makeScan('OT_IN', 'NA', null, null, null),
      OT_OUT: makeScan('OT_OUT', 'NA', null, null, null),
    },
    totalHours: 9.5,
    flag: 'GREEN',
    hasOverride: false,
  },
  {
    id: 'worker-012',
    name: 'Bunna Chea',
    trade: 'Concrete',
    crewId: 'crew-gamma-1',
    project: 'Podium C',
    photoInitials: 'BC',
    avatarColor: '#16a34a',
    scans: {
      MORNING_IN: makeScan('MORNING_IN', 'SYNCED', '06:48', 0.93, 0.95, 11.5553, 104.9273),
      MORNING_OUT: makeScan('MORNING_OUT', 'SYNCED', '12:09', 0.91, 0.93, 11.5553, 104.9273),
      AFTERNOON_IN: makeScan('AFTERNOON_IN', 'FLAGGED', '13:14', 0.60, 0.52, 11.5553, 104.9273),
      AFTERNOON_OUT: makeScan('AFTERNOON_OUT', 'MISSING', null, null, null),
      OT_IN: makeScan('OT_IN', 'NA', null, null, null),
      OT_OUT: makeScan('OT_OUT', 'NA', null, null, null),
    },
    totalHours: 5.3,
    flag: 'RED',
    hasOverride: false,
  },
];

export const mockFlaggedScans: FlaggedScan[] = [
  {
    id: 'flag-001',
    workerId: 'worker-002',
    workerName: 'Sokha Vann',
    trade: 'Formwork',
    scanType: 'AFTERNOON_IN',
    scannedAt: '2026-05-01 13:11',
    localScore: 0.62,
    serverScore: 0.58,
    referencePhotoUrl: 'https://i.pravatar.cc/200?u=sokha-ref',
    scanPhotoUrl: 'https://i.pravatar.cc/200?u=sokha-scan',
    project: 'Tower A',
    reviewedBy: null,
  },
  {
    id: 'flag-002',
    workerId: 'worker-008',
    workerName: 'Meas Chanthy',
    trade: 'Formwork',
    scanType: 'MORNING_OUT',
    scannedAt: '2026-05-01 12:07',
    localScore: 0.61,
    serverScore: 0.55,
    referencePhotoUrl: 'https://i.pravatar.cc/200?u=meas-ref',
    scanPhotoUrl: 'https://i.pravatar.cc/200?u=meas-scan',
    project: 'Tower A',
    reviewedBy: null,
  },
  {
    id: 'flag-003',
    workerId: 'worker-012',
    workerName: 'Bunna Chea',
    trade: 'Concrete',
    scanType: 'AFTERNOON_IN',
    scannedAt: '2026-05-01 13:14',
    localScore: 0.60,
    serverScore: 0.52,
    referencePhotoUrl: 'https://i.pravatar.cc/200?u=bunna-ref',
    scanPhotoUrl: 'https://i.pravatar.cc/200?u=bunna-scan',
    project: 'Podium C',
    reviewedBy: null,
  },
];

export const scanCompletionHistory = [
  { date: 'Apr 18', rate: 96, target: 95 },
  { date: 'Apr 19', rate: 91, target: 95 },
  { date: 'Apr 20', rate: 88, target: 95 },
  { date: 'Apr 21', rate: 94, target: 95 },
  { date: 'Apr 22', rate: 97, target: 95 },
  { date: 'Apr 23', rate: 99, target: 95 },
  { date: 'Apr 24', rate: 95, target: 95 },
  { date: 'Apr 25', rate: 93, target: 95 },
  { date: 'Apr 26', rate: 90, target: 95 },
  { date: 'Apr 27', rate: 97, target: 95 },
  { date: 'Apr 28', rate: 98, target: 95 },
  { date: 'Apr 29', rate: 96, target: 95 },
  { date: 'Apr 30', rate: 94, target: 95 },
  { date: 'May 01', rate: 82, target: 95 },
];