export type WorkerStatus = 'ACTIVE' | 'INACTIVE';
export type BiometricStatus = 'REGISTERED' | 'PENDING' | 'FAILED';

export interface RateHistoryEntry {
  id: string;
  dailyRate: number;
  effectiveFrom: string;
  setBy: string;
  createdAt: string;
}

export interface ProductivityBenchmark {
  id: string;
  taskType: string;
  unit: string;
  targetOutputPerHour: number;
  configuredBy: string;
  updatedAt: string;
}

export interface SessionSummary {
  id: string;
  date: string;
  project: string;
  wbsNode: string;
  regularHours: number;
  otHours: number;
  totalHours: number;
  flag: 'GREEN' | 'YELLOW' | 'RED';
}

export interface PayslipRecord {
  id: string;
  weekStart: string;
  weekEnd: string;
  netPay: number;
  grossPay: number;
  status: 'PAID' | 'APPROVED' | 'PENDING';
  pdfUrl: string | null;
}

export interface WorkerProfile {
  id: string;
  name: string;
  phone: string;
  trade: string;
  crewId: string;
  crewName: string;
  dailyRate: number;
  bankLast4: string;
  biometricStatus: BiometricStatus;
  faceRegisteredAt: string | null;
  status: WorkerStatus;
  project: string;
  projectId: string;
  joinedAt: string;
  avatarInitials: string;
  avatarColor: string;
  totalHoursThisWeek: number;
  totalOTHoursThisWeek: number;
  scanCompletionRate: number;
  rateHistory: RateHistoryEntry[];
  benchmarks: ProductivityBenchmark[];
  recentSessions: SessionSummary[];
  payslips: PayslipRecord[];
}

export const mockWorkerProfiles: WorkerProfile[] = [
  {
    id: 'worker-001',
    name: 'Dara Chanthou',
    phone: '+855 12 345 678',
    trade: 'Rebar',
    crewId: 'crew-alpha-1',
    crewName: 'Alpha Crew 1',
    dailyRate: 80,
    bankLast4: '4821',
    biometricStatus: 'REGISTERED',
    faceRegisteredAt: '2026-01-15 08:30',
    status: 'ACTIVE',
    project: 'Tower A',
    projectId: 'proj-001',
    joinedAt: '2026-01-10',
    avatarInitials: 'DC',
    avatarColor: '#7c3aed',
    totalHoursThisWeek: 48,
    totalOTHoursThisWeek: 12.5,
    scanCompletionRate: 97,
    rateHistory: [
      { id: 'rh-001a', dailyRate: 70, effectiveFrom: '2026-01-10', setBy: 'Admin Priya', createdAt: '2026-01-10 09:00' },
      { id: 'rh-001b', dailyRate: 75, effectiveFrom: '2026-02-01', setBy: 'Admin Priya', createdAt: '2026-02-01 10:00' },
      { id: 'rh-001c', dailyRate: 80, effectiveFrom: '2026-04-01', setBy: 'Rajan Mehta', createdAt: '2026-04-01 08:15' },
    ],
    benchmarks: [
      { id: 'bm-001a', taskType: 'Rebar Tying', unit: 'kg', targetOutputPerHour: 120, configuredBy: 'Rajan Mehta', updatedAt: '2026-03-15' },
      { id: 'bm-001b', taskType: 'Bar Cutting', unit: 'pcs', targetOutputPerHour: 45, configuredBy: 'Rajan Mehta', updatedAt: '2026-03-15' },
    ],
    recentSessions: [
      { id: 'sess-001a', date: '2026-05-01', project: 'Tower A', wbsNode: 'L03 · Rebar', regularHours: 9, otHours: 2.5, totalHours: 11.5, flag: 'GREEN' },
      { id: 'sess-001b', date: '2026-04-30', project: 'Tower A', wbsNode: 'L03 · Rebar', regularHours: 9, otHours: 3, totalHours: 12, flag: 'GREEN' },
      { id: 'sess-001c', date: '2026-04-29', project: 'Tower A', wbsNode: 'L02 · Rebar', regularHours: 9, otHours: 0, totalHours: 9, flag: 'GREEN' },
      { id: 'sess-001d', date: '2026-04-28', project: 'Tower A', wbsNode: 'L02 · Rebar', regularHours: 9, otHours: 2, totalHours: 11, flag: 'YELLOW' },
      { id: 'sess-001e', date: '2026-04-27', project: 'Tower A', wbsNode: 'L02 · Rebar', regularHours: 9, otHours: 3, totalHours: 12, flag: 'GREEN' },
      { id: 'sess-001f', date: '2026-04-26', project: 'Tower A', wbsNode: 'L01 · Rebar', regularHours: 8, otHours: 2, totalHours: 10, flag: 'GREEN' },
    ],
    payslips: [
      { id: 'ps-001a', weekStart: '2026-04-28', weekEnd: '2026-05-03', netPay: 815, grossPay: 865, status: 'PENDING', pdfUrl: null },
      { id: 'ps-001b', weekStart: '2026-04-21', weekEnd: '2026-04-27', netPay: 820, grossPay: 870, status: 'PAID', pdfUrl: 's3://payslips/ps-001b.pdf' },
      { id: 'ps-001c', weekStart: '2026-04-14', weekEnd: '2026-04-20', netPay: 790, grossPay: 840, status: 'PAID', pdfUrl: 's3://payslips/ps-001c.pdf' },
      { id: 'ps-001d', weekStart: '2026-04-07', weekEnd: '2026-04-13', netPay: 760, grossPay: 800, status: 'PAID', pdfUrl: 's3://payslips/ps-001d.pdf' },
    ],
  },
  {
    id: 'worker-002',
    name: 'Sokha Vann',
    phone: '+855 17 234 567',
    trade: 'Formwork',
    crewId: 'crew-alpha-1',
    crewName: 'Alpha Crew 1',
    dailyRate: 75,
    bankLast4: '3302',
    biometricStatus: 'REGISTERED',
    faceRegisteredAt: '2026-01-20 09:00',
    status: 'ACTIVE',
    project: 'Tower A',
    projectId: 'proj-001',
    joinedAt: '2026-01-18',
    avatarInitials: 'SV',
    avatarColor: '#0891b2',
    totalHoursThisWeek: 44,
    totalOTHoursThisWeek: 6,
    scanCompletionRate: 88,
    rateHistory: [
      { id: 'rh-002a', dailyRate: 65, effectiveFrom: '2026-01-18', setBy: 'Admin Priya', createdAt: '2026-01-18 09:00' },
      { id: 'rh-002b', dailyRate: 75, effectiveFrom: '2026-03-01', setBy: 'Rajan Mehta', createdAt: '2026-03-01 10:30' },
    ],
    benchmarks: [
      { id: 'bm-002a', taskType: 'Panel Assembly', unit: 'm²', targetOutputPerHour: 8, configuredBy: 'Rajan Mehta', updatedAt: '2026-03-20' },
    ],
    recentSessions: [
      { id: 'sess-002a', date: '2026-05-01', project: 'Tower A', wbsNode: 'L03 · Formwork', regularHours: 5, otHours: 0, totalHours: 5, flag: 'RED' },
      { id: 'sess-002b', date: '2026-04-30', project: 'Tower A', wbsNode: 'L03 · Formwork', regularHours: 9, otHours: 2, totalHours: 11, flag: 'GREEN' },
      { id: 'sess-002c', date: '2026-04-29', project: 'Tower A', wbsNode: 'L03 · Formwork', regularHours: 9, otHours: 0, totalHours: 9, flag: 'YELLOW' },
      { id: 'sess-002d', date: '2026-04-28', project: 'Tower A', wbsNode: 'L02 · Formwork', regularHours: 9, otHours: 2, totalHours: 11, flag: 'GREEN' },
      { id: 'sess-002e', date: '2026-04-27', project: 'Tower A', wbsNode: 'L02 · Formwork', regularHours: 9, otHours: 2, totalHours: 11, flag: 'GREEN' },
    ],
    payslips: [
      { id: 'ps-002a', weekStart: '2026-04-28', weekEnd: '2026-05-03', netPay: 628, grossPay: 708, status: 'PENDING', pdfUrl: null },
      { id: 'ps-002b', weekStart: '2026-04-21', weekEnd: '2026-04-27', netPay: 700, grossPay: 750, status: 'PAID', pdfUrl: 's3://payslips/ps-002b.pdf' },
    ],
  },
  {
    id: 'worker-003',
    name: 'Pita Ramirez',
    phone: '+855 96 345 123',
    trade: 'Concrete',
    crewId: 'crew-beta-2',
    crewName: 'Beta Crew 2',
    dailyRate: 85,
    bankLast4: '7741',
    biometricStatus: 'REGISTERED',
    faceRegisteredAt: '2026-02-01 07:45',
    status: 'ACTIVE',
    project: 'Tower B',
    projectId: 'proj-002',
    joinedAt: '2026-01-28',
    avatarInitials: 'PR',
    avatarColor: '#16a34a',
    totalHoursThisWeek: 48,
    totalOTHoursThisWeek: 18,
    scanCompletionRate: 99,
    rateHistory: [
      { id: 'rh-003a', dailyRate: 80, effectiveFrom: '2026-01-28', setBy: 'Admin Priya', createdAt: '2026-01-28 09:00' },
      { id: 'rh-003b', dailyRate: 85, effectiveFrom: '2026-04-01', setBy: 'Rajan Mehta', createdAt: '2026-04-01 08:30' },
    ],
    benchmarks: [
      { id: 'bm-003a', taskType: 'Concrete Pour', unit: 'm³', targetOutputPerHour: 2.5, configuredBy: 'Rajan Mehta', updatedAt: '2026-03-10' },
      { id: 'bm-003b', taskType: 'Vibration Work', unit: 'm³', targetOutputPerHour: 3.0, configuredBy: 'Rajan Mehta', updatedAt: '2026-03-10' },
    ],
    recentSessions: [
      { id: 'sess-003a', date: '2026-05-01', project: 'Tower B', wbsNode: 'L04 · Concrete', regularHours: 9, otHours: 3, totalHours: 12, flag: 'GREEN' },
      { id: 'sess-003b', date: '2026-04-30', project: 'Tower B', wbsNode: 'L04 · Concrete', regularHours: 9, otHours: 4, totalHours: 13, flag: 'GREEN' },
      { id: 'sess-003c', date: '2026-04-29', project: 'Tower B', wbsNode: 'L03 · Concrete', regularHours: 9, otHours: 2, totalHours: 11, flag: 'GREEN' },
    ],
    payslips: [
      { id: 'ps-003a', weekStart: '2026-04-28', weekEnd: '2026-05-03', netPay: 964, grossPay: 964, status: 'APPROVED', pdfUrl: 's3://payslips/ps-003a.pdf' },
      { id: 'ps-003b', weekStart: '2026-04-21', weekEnd: '2026-04-27', netPay: 940, grossPay: 940, status: 'PAID', pdfUrl: 's3://payslips/ps-003b.pdf' },
    ],
  },
  {
    id: 'worker-004',
    name: 'Narin Sopheap',
    phone: '+855 11 456 789',
    trade: 'Steel Fix',
    crewId: 'crew-alpha-2',
    crewName: 'Alpha Crew 2',
    dailyRate: 78,
    bankLast4: '5519',
    biometricStatus: 'PENDING',
    faceRegisteredAt: null,
    status: 'ACTIVE',
    project: 'Tower A',
    projectId: 'proj-001',
    joinedAt: '2026-02-10',
    avatarInitials: 'NS',
    avatarColor: '#b45309',
    totalHoursThisWeek: 40,
    totalOTHoursThisWeek: 4,
    scanCompletionRate: 72,
    rateHistory: [
      { id: 'rh-004a', dailyRate: 78, effectiveFrom: '2026-02-10', setBy: 'Admin Priya', createdAt: '2026-02-10 09:00' },
    ],
    benchmarks: [],
    recentSessions: [
      { id: 'sess-004a', date: '2026-05-01', project: 'Tower A', wbsNode: 'L03 · Steel Fix', regularHours: 7, otHours: 0, totalHours: 7, flag: 'YELLOW' },
      { id: 'sess-004b', date: '2026-04-30', project: 'Tower A', wbsNode: 'L03 · Steel Fix', regularHours: 9, otHours: 1, totalHours: 10, flag: 'GREEN' },
    ],
    payslips: [
      { id: 'ps-004a', weekStart: '2026-04-28', weekEnd: '2026-05-03', netPay: 452, grossPay: 472, status: 'PENDING', pdfUrl: null },
    ],
  },
  {
    id: 'worker-005',
    name: 'Ahmad Fadli',
    phone: '+855 78 567 890',
    trade: 'Masonry',
    crewId: 'crew-gamma-1',
    crewName: 'Gamma Crew 1',
    dailyRate: 82,
    bankLast4: '9934',
    biometricStatus: 'REGISTERED',
    faceRegisteredAt: '2026-01-25 08:00',
    status: 'ACTIVE',
    project: 'Podium C',
    projectId: 'proj-003',
    joinedAt: '2026-01-22',
    avatarInitials: 'AF',
    avatarColor: '#dc2626',
    totalHoursThisWeek: 48,
    totalOTHoursThisWeek: 21,
    scanCompletionRate: 100,
    rateHistory: [
      { id: 'rh-005a', dailyRate: 75, effectiveFrom: '2026-01-22', setBy: 'Admin Priya', createdAt: '2026-01-22 09:00' },
      { id: 'rh-005b', dailyRate: 82, effectiveFrom: '2026-03-15', setBy: 'Rajan Mehta', createdAt: '2026-03-15 11:00' },
    ],
    benchmarks: [
      { id: 'bm-005a', taskType: 'Block Laying', unit: 'blocks', targetOutputPerHour: 35, configuredBy: 'Rajan Mehta', updatedAt: '2026-02-28' },
    ],
    recentSessions: [
      { id: 'sess-005a', date: '2026-05-01', project: 'Podium C', wbsNode: 'GF · Masonry', regularHours: 9, otHours: 2.5, totalHours: 11.5, flag: 'GREEN' },
      { id: 'sess-005b', date: '2026-04-30', project: 'Podium C', wbsNode: 'GF · Masonry', regularHours: 9, otHours: 3, totalHours: 12, flag: 'GREEN' },
    ],
    payslips: [
      { id: 'ps-005a', weekStart: '2026-04-28', weekEnd: '2026-05-03', netPay: 1018, grossPay: 1018, status: 'PAID', pdfUrl: 's3://payslips/ps-005a.pdf' },
      { id: 'ps-005b', weekStart: '2026-04-21', weekEnd: '2026-04-27', netPay: 980, grossPay: 980, status: 'PAID', pdfUrl: 's3://payslips/ps-005b.pdf' },
    ],
  },
  {
    id: 'worker-006',
    name: 'Ratha Kimheng',
    phone: '+855 15 678 901',
    trade: 'Rebar',
    crewId: 'crew-alpha-1',
    crewName: 'Alpha Crew 1',
    dailyRate: 80,
    bankLast4: '2287',
    biometricStatus: 'FAILED',
    faceRegisteredAt: '2026-02-05 07:30',
    status: 'ACTIVE',
    project: 'Tower A',
    projectId: 'proj-001',
    joinedAt: '2026-02-03',
    avatarInitials: 'RK',
    avatarColor: '#7c3aed',
    totalHoursThisWeek: 32,
    totalOTHoursThisWeek: 0,
    scanCompletionRate: 55,
    rateHistory: [
      { id: 'rh-006a', dailyRate: 80, effectiveFrom: '2026-02-03', setBy: 'Admin Priya', createdAt: '2026-02-03 09:00' },
    ],
    benchmarks: [
      { id: 'bm-006a', taskType: 'Rebar Tying', unit: 'kg', targetOutputPerHour: 110, configuredBy: 'Rajan Mehta', updatedAt: '2026-03-01' },
    ],
    recentSessions: [
      { id: 'sess-006a', date: '2026-05-01', project: 'Tower A', wbsNode: 'L03 · Rebar', regularHours: 0, otHours: 0, totalHours: 0, flag: 'RED' },
      { id: 'sess-006b', date: '2026-04-30', project: 'Tower A', wbsNode: 'L03 · Rebar', regularHours: 8, otHours: 0, totalHours: 8, flag: 'YELLOW' },
    ],
    payslips: [
      { id: 'ps-006a', weekStart: '2026-04-28', weekEnd: '2026-05-03', netPay: 160, grossPay: 320, status: 'DRAFT', pdfUrl: null },
    ],
  },
  {
    id: 'worker-007',
    name: 'Thy Borey',
    phone: '+855 92 789 012',
    trade: 'Concrete',
    crewId: 'crew-beta-2',
    crewName: 'Beta Crew 2',
    dailyRate: 80,
    bankLast4: '6612',
    biometricStatus: 'REGISTERED',
    faceRegisteredAt: '2026-01-30 08:15',
    status: 'ACTIVE',
    project: 'Tower B',
    projectId: 'proj-002',
    joinedAt: '2026-01-28',
    avatarInitials: 'TB',
    avatarColor: '#16a34a',
    totalHoursThisWeek: 48,
    totalOTHoursThisWeek: 8,
    scanCompletionRate: 95,
    rateHistory: [
      { id: 'rh-007a', dailyRate: 75, effectiveFrom: '2026-01-28', setBy: 'Admin Priya', createdAt: '2026-01-28 09:00' },
      { id: 'rh-007b', dailyRate: 80, effectiveFrom: '2026-04-01', setBy: 'Rajan Mehta', createdAt: '2026-04-01 08:45' },
    ],
    benchmarks: [
      { id: 'bm-007a', taskType: 'Concrete Pour', unit: 'm³', targetOutputPerHour: 2.2, configuredBy: 'Rajan Mehta', updatedAt: '2026-03-12' },
    ],
    recentSessions: [
      { id: 'sess-007a', date: '2026-05-01', project: 'Tower B', wbsNode: 'L04 · Concrete', regularHours: 9, otHours: 0, totalHours: 9, flag: 'GREEN' },
      { id: 'sess-007b', date: '2026-04-30', project: 'Tower B', wbsNode: 'L04 · Concrete', regularHours: 9, otHours: 2, totalHours: 11, flag: 'GREEN' },
    ],
    payslips: [
      { id: 'ps-007a', weekStart: '2026-04-28', weekEnd: '2026-05-03', netPay: 784, grossPay: 784, status: 'PENDING', pdfUrl: null },
      { id: 'ps-007b', weekStart: '2026-04-21', weekEnd: '2026-04-27', netPay: 760, grossPay: 760, status: 'PAID', pdfUrl: 's3://payslips/ps-007b.pdf' },
    ],
  },
  {
    id: 'worker-008',
    name: 'Meas Chanthy',
    phone: '+855 16 890 123',
    trade: 'Formwork',
    crewId: 'crew-alpha-2',
    crewName: 'Alpha Crew 2',
    dailyRate: 75,
    bankLast4: '1155',
    biometricStatus: 'REGISTERED',
    faceRegisteredAt: '2026-02-08 09:30',
    status: 'ACTIVE',
    project: 'Tower A',
    projectId: 'proj-001',
    joinedAt: '2026-02-06',
    avatarInitials: 'MC',
    avatarColor: '#b45309',
    totalHoursThisWeek: 46,
    totalOTHoursThisWeek: 5,
    scanCompletionRate: 90,
    rateHistory: [
      { id: 'rh-008a', dailyRate: 70, effectiveFrom: '2026-02-06', setBy: 'Admin Priya', createdAt: '2026-02-06 09:00' },
      { id: 'rh-008b', dailyRate: 75, effectiveFrom: '2026-04-01', setBy: 'Rajan Mehta', createdAt: '2026-04-01 09:00' },
    ],
    benchmarks: [
      { id: 'bm-008a', taskType: 'Panel Assembly', unit: 'm²', targetOutputPerHour: 7.5, configuredBy: 'Rajan Mehta', updatedAt: '2026-03-22' },
    ],
    recentSessions: [
      { id: 'sess-008a', date: '2026-05-01', project: 'Tower A', wbsNode: 'L03 · Formwork', regularHours: 9, otHours: 0, totalHours: 9, flag: 'YELLOW' },
      { id: 'sess-008b', date: '2026-04-30', project: 'Tower A', wbsNode: 'L03 · Formwork', regularHours: 9, otHours: 1, totalHours: 10, flag: 'GREEN' },
    ],
    payslips: [
      { id: 'ps-008a', weekStart: '2026-04-28', weekEnd: '2026-05-03', netPay: 710, grossPay: 710, status: 'APPROVED', pdfUrl: 's3://payslips/ps-008a.pdf' },
      { id: 'ps-008b', weekStart: '2026-04-21', weekEnd: '2026-04-27', netPay: 690, grossPay: 690, status: 'PAID', pdfUrl: 's3://payslips/ps-008b.pdf' },
    ],
  },
];