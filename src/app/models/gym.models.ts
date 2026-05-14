export type UserRole = 'admin' | 'trainer' | 'member';

export type PaymentMethod = 'UPI' | 'Cash' | 'Card';

export type CheckInMethod = 'QR' | 'Phone' | 'RFID' | 'Manual';

export interface Member {
  id: string;
  name: string;
  age: number;
  gender: string;
  weightKg: number;
  phone: string;
  joinDate: string;
  membershipType: string;
  planId: string;
  expiryDate: string;
  photoUrl: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  trainerId?: string;
  rfidTag?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  ptIncluded: boolean;
  freezeAllowed: boolean;
}

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  invoiceNo: string;
  note?: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  checkIn: string;
  method: CheckInMethod;
}

export interface Trainer {
  id: string;
  name: string;
  phone: string;
  specialty: string;
  salaryMonthly: number;
  scheduleNotes: string;
  memberIds: string[];
}

export interface WorkoutPlan {
  id: string;
  memberId: string;
  title: string;
  notes: string;
  dietNotes?: string;
  lastWeightKg?: number;
  updatedAt: string;
}

export interface DashboardStats {
  totalMembers: number;
  activeMemberships: number;
  expiringSoon: number;
  todayAttendance: number;
  monthlyRevenue: number;
  pendingPayments: number;
}
