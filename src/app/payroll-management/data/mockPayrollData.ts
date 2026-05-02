export type TimesheetStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'PAID';
export type DeductionType = 'ABSENCE' | 'ADVANCE' | 'PENALTY' | 'OTHER';

export interface PayrollDeduction {
  id: string;
  type: DeductionType;
  amount: number;
  note: string;
}

export interface TimesheetRow {
  id: string;
  workerId: string;
  workerName: string;
  trade: string;
  project: string;
  avatarInitials: string;
  avatarColor: string;
  regularHours: number;
  otHours: number;
  sundayHours: number;
  holidayHours: number;
  grossRegular: number;
  grossOT: number;
  grossSunday: number;
  grossHoliday: number;
  totalGross: number;
  deductions: PayrollDeduction[];
  totalDeductions: number;
  netPay: number;
  status: TimesheetStatus;
  pdfUrl: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
}

export const mockTimesheets: TimesheetRow[] = [
  {
    id: 'ts-001', workerId: 'worker-001', workerName: 'Dara Chanthou', trade: 'Rebar', project: 'Tower A',
    avatarInitials: 'DC', avatarColor: '#7c3aed',
    regularHours: 48, otHours: 12.5, sundayHours: 8, holidayHours: 0,
    grossRegular: 480, grossOT: 225, grossSunday: 160, grossHoliday: 0,
    totalGross: 865, deductions: [{ id: 'ded-001a', type: 'ADVANCE', amount: 50, note: 'Cash advance Apr 28' }],
    totalDeductions: 50, netPay: 815, status: 'PENDING', pdfUrl: null, approvedBy: null, approvedAt: null,
  },
  {
    id: 'ts-002', workerId: 'worker-002', workerName: 'Sokha Vann', trade: 'Formwork', project: 'Tower A',
    avatarInitials: 'SV', avatarColor: '#0891b2',
    regularHours: 44, otHours: 6, sundayHours: 8, holidayHours: 0,
    grossRegular: 440, grossOT: 108, grossSunday: 160, grossHoliday: 0,
    totalGross: 708, deductions: [{ id: 'ded-002a', type: 'ABSENCE', amount: 80, note: 'Absent Thursday AM' }],
    totalDeductions: 80, netPay: 628, status: 'DRAFT', pdfUrl: null, approvedBy: null, approvedAt: null,
  },
  {
    id: 'ts-003', workerId: 'worker-003', workerName: 'Pita Ramirez', trade: 'Concrete', project: 'Tower B',
    avatarInitials: 'PR', avatarColor: '#16a34a',
    regularHours: 48, otHours: 18, sundayHours: 8, holidayHours: 0,
    grossRegular: 480, grossOT: 324, grossSunday: 160, grossHoliday: 0,
    totalGross: 964, deductions: [],
    totalDeductions: 0, netPay: 964, status: 'APPROVED', pdfUrl: 's3://payslips/ts-003.pdf', approvedBy: 'Rajan Mehta', approvedAt: '2026-04-28 09:15',
  },
  {
    id: 'ts-004', workerId: 'worker-004', workerName: 'Narin Sopheap', trade: 'Steel Fix', project: 'Tower A',
    avatarInitials: 'NS', avatarColor: '#b45309',
    regularHours: 40, otHours: 4, sundayHours: 0, holidayHours: 0,
    grossRegular: 400, grossOT: 72, grossSunday: 0, grossHoliday: 0,
    totalGross: 472, deductions: [{ id: 'ded-004a', type: 'PENALTY', amount: 20, note: 'Late start Mon/Tue' }],
    totalDeductions: 20, netPay: 452, status: 'DRAFT', pdfUrl: null, approvedBy: null, approvedAt: null,
  },
  {
    id: 'ts-005', workerId: 'worker-005', workerName: 'Ahmad Fadli', trade: 'Masonry', project: 'Podium C',
    avatarInitials: 'AF', avatarColor: '#dc2626',
    regularHours: 48, otHours: 21, sundayHours: 8, holidayHours: 0,
    grossRegular: 480, grossOT: 378, grossSunday: 160, grossHoliday: 0,
    totalGross: 1018, deductions: [],
    totalDeductions: 0, netPay: 1018, status: 'PAID', pdfUrl: 's3://payslips/ts-005.pdf', approvedBy: 'Rajan Mehta', approvedAt: '2026-04-28 09:20',
  },
  {
    id: 'ts-006', workerId: 'worker-006', workerName: 'Ratha Kimheng', trade: 'Rebar', project: 'Tower A',
    avatarInitials: 'RK', avatarColor: '#7c3aed',
    regularHours: 32, otHours: 0, sundayHours: 0, holidayHours: 0,
    grossRegular: 320, grossOT: 0, grossSunday: 0, grossHoliday: 0,
    totalGross: 320, deductions: [{ id: 'ded-006a', type: 'ABSENCE', amount: 160, note: 'Absent Mon-Tue' }],
    totalDeductions: 160, netPay: 160, status: 'DRAFT', pdfUrl: null, approvedBy: null, approvedAt: null,
  },
  {
    id: 'ts-007', workerId: 'worker-007', workerName: 'Thy Borey', trade: 'Concrete', project: 'Tower B',
    avatarInitials: 'TB', avatarColor: '#16a34a',
    regularHours: 48, otHours: 8, sundayHours: 8, holidayHours: 0,
    grossRegular: 480, grossOT: 144, grossSunday: 160, grossHoliday: 0,
    totalGross: 784, deductions: [],
    totalDeductions: 0, netPay: 784, status: 'PENDING', pdfUrl: null, approvedBy: null, approvedAt: null,
  },
  {
    id: 'ts-008', workerId: 'worker-008', workerName: 'Meas Chanthy', trade: 'Formwork', project: 'Tower A',
    avatarInitials: 'MC', avatarColor: '#b45309',
    regularHours: 46, otHours: 5, sundayHours: 8, holidayHours: 0,
    grossRegular: 460, grossOT: 90, grossSunday: 160, grossHoliday: 0,
    totalGross: 710, deductions: [],
    totalDeductions: 0, netPay: 710, status: 'APPROVED', pdfUrl: 's3://payslips/ts-008.pdf', approvedBy: 'Rajan Mehta', approvedAt: '2026-04-28 09:30',
  },
  {
    id: 'ts-009', workerId: 'worker-009', workerName: 'Kosal Phirun', trade: 'Steel Fix', project: 'Podium C',
    avatarInitials: 'KP', avatarColor: '#dc2626',
    regularHours: 48, otHours: 16, sundayHours: 8, holidayHours: 0,
    grossRegular: 480, grossOT: 288, grossSunday: 160, grossHoliday: 0,
    totalGross: 928, deductions: [{ id: 'ded-009a', type: 'ADVANCE', amount: 100, note: 'Cash advance Apr 25' }],
    totalDeductions: 100, netPay: 828, status: 'PAID', pdfUrl: 's3://payslips/ts-009.pdf', approvedBy: 'Rajan Mehta', approvedAt: '2026-04-28 09:35',
  },
  {
    id: 'ts-010', workerId: 'worker-010', workerName: 'Heng Vibol', trade: 'Masonry', project: 'Tower B',
    avatarInitials: 'HV', avatarColor: '#0891b2',
    regularHours: 48, otHours: 10, sundayHours: 8, holidayHours: 0,
    grossRegular: 480, grossOT: 180, grossSunday: 160, grossHoliday: 0,
    totalGross: 820, deductions: [],
    totalDeductions: 0, netPay: 820, status: 'PENDING', pdfUrl: null, approvedBy: null, approvedAt: null,
  },
  {
    id: 'ts-011', workerId: 'worker-011', workerName: 'Srey Leak', trade: 'Rebar', project: 'Tower A',
    avatarInitials: 'SL', avatarColor: '#7c3aed',
    regularHours: 48, otHours: 7, sundayHours: 8, holidayHours: 0,
    grossRegular: 480, grossOT: 126, grossSunday: 160, grossHoliday: 0,
    totalGross: 766, deductions: [],
    totalDeductions: 0, netPay: 766, status: 'DRAFT', pdfUrl: null, approvedBy: null, approvedAt: null,
  },
  {
    id: 'ts-012', workerId: 'worker-012', workerName: 'Bunna Chea', trade: 'Concrete', project: 'Podium C',
    avatarInitials: 'BC', avatarColor: '#16a34a',
    regularHours: 44, otHours: 9, sundayHours: 8, holidayHours: 0,
    grossRegular: 440, grossOT: 162, grossSunday: 160, grossHoliday: 0,
    totalGross: 762, deductions: [{ id: 'ded-012a', type: 'OTHER', amount: 30, note: 'PPE replacement' }],
    totalDeductions: 30, netPay: 732, status: 'PENDING', pdfUrl: null, approvedBy: null, approvedAt: null,
  },
];

export const weeklyOTData = [
  { worker: 'A. Fadli', ot: 21 },
  { worker: 'P. Ramirez', ot: 18 },
  { worker: 'K. Phirun', ot: 16 },
  { worker: 'H. Vibol', ot: 10 },
  { worker: 'D. Chanthou', ot: 12.5 },
  { worker: 'T. Borey', ot: 8 },
  { worker: 'M. Chanthy', ot: 5 },
  { worker: 'S. Vann', ot: 6 },
];