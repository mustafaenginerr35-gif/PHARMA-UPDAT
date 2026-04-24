import Dexie, { type Table } from 'dexie';

export interface Transaction {
  id?: string;
  type: 'income' | 'expense';
  incomeType?: 'cash' | 'credit';
  category: string;
  expenseClassification?: string;
  employeeName?: string;
  customerName?: string;
  amount: number;
  netProfit?: number;
  profitPercentage?: number;
  date: Date;
  description: string;
  notes?: string;
  entityId?: string;
  entityName?: string;
  invoiceNumber?: string;
  invoiceAmount?: number;
  spoiledType?: 'linked' | 'unlinked';
  reason?: string;
  discount?: number;
  refundAmount?: number;
  dueDate?: Date;
  imageUrl?: string;
  branchId?: string;
  createdBy: string;
  username?: string;
  createdAt?: Date;
}

export interface Entity {
  id?: string;
  name: string;
  phone?: string;
  address?: string;
  type: 'office' | 'warehouse';
  balance: number;
  initialBalance: number;
  totalInvoices: number;
  totalPayments: number;
  limit: number;
  dueDate?: Date;
  nextDueDate?: Date;
  lastPaymentDate?: Date;
  notes?: string;
  branchId?: string;
  ownerId: string;
  username?: string;
  createdAt?: Date;
}

export interface LedgerEntry {
  id?: string;
  accountId: string;
  accountName: string;
  accountType: string;
  date: Date;
  operationType: 'invoice' | 'payment' | 'refund';
  purchaseType?: 'cash' | 'credit';
  invoiceNumber?: string;
  linkedInvoiceNumber?: string;
  amount: number;
  discount: number;
  bonus?: number;
  bonusArrivalDate?: Date;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  netAmount: number;
  notes?: string;
  imageUrl?: string;
  receiptImageUrl?: string;
  balanceAfterOperation: number;
  transactionId?: string;
  dueDate?: Date;
  paymentType?: 'cash' | 'deferred';
  paymentStatus?: 'pending' | 'paid' | 'overdue' | 'partial' | 'cancelled';
  paidAmount?: number;
  remainingAmount?: number;
  refundAmount?: number;
  linkedInvoiceId?: string;
  branchId?: string;
  ownerId: string;
  username?: string;
  createdAt: Date;
}

export interface Notification {
  id?: string;
  userId: string;
  username?: string;
  title: string;
  message: string;
  type: string;
  accountId?: string;
  amount?: number;
  invoiceNumber?: string;
  read: boolean;
  branchId?: string;
  createdAt: Date;
}

export interface AppUser {
  userId: string;
  email: string;
  username: string;
  displayName: string;
  password?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  role?: string;
  createdAt: Date;
  isActive: boolean;
  isSetupComplete: boolean;
}

export interface SystemLog {
  id?: string;
  type: 'auto_delete' | 'sync' | 'backup';
  message: string;
  ownerId: string;
  createdAt: Date;
}

export interface CustomerDebt {
  id?: string;
  customerName: string;
  customerPhone?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'unpaid' | 'partial' | 'paid';
  saleDate: Date;
  dueDate: Date;
  notes?: string;
  branchId?: string;
  ownerId: string;
  createdAt: Date;
}

export interface Deadline {
  id?: string;
  accountId: string;
  accountName: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  requiredPayment: number;
  dueDate: Date;
  notes?: string;
  invoiceImageUrl?: string;
  receiptImageUrl?: string;
  status: 'pending' | 'paid' | 'cancelled';
  branchId?: string;
  createdAt: Date;
  ownerId: string;
}

export interface Announcement {
  id?: string;
  title: string;
  message: string;
  type: 'update' | 'feature' | 'bugfix' | 'alert';
  isActive: number; // 0 or 1
  displayType: 'once' | 'permanent';
  createdAt: Date;
  createdBy: string;
}

export interface AnnouncementRead {
  id?: string;
  announcementId: string;
  userId: string;
  readAt: Date;
}

export interface ActivationCode {
  id?: string;
  code: string;
  assignedEmail?: string;
  isUsed: boolean;
  createdAt: Date;
}

export interface ActivationRequest {
  id?: string;
  email: string;
  username: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface RecoveryRequest {
  id?: string;
  email: string;
  status: 'pending' | 'resolved';
  createdAt: Date;
}

export interface Bonus {
  id?: string;
  entityId: string;
  entityName: string;
  invoiceNumber?: string;
  description: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'received' | 'cancelled';
  notes?: string;
  imageUrl?: string;
  branchId?: string;
  createdAt: Date;
  ownerId: string;
}

export interface Employee {
  id?: string;
  name: string;
  phone: string;
  jobTitle: string;
  notes?: string;
  branchId?: string;
  ownerId: string;
  createdAt: Date;
}

export interface EmployeeAttendance {
  id?: string;
  employeeId: string;
  employeeName: string;
  date: Date;
  hoursWork: number;
  hourlyRate: number;
  dailyWage: number;
  notes?: string;
  branchId?: string;
  ownerId: string;
  createdAt: Date;
}

export interface PharmacyBranch {
  id?: string;
  name: string;
  address?: string;
  phone?: string;
  notes?: string;
  status: 'active' | 'archived';
  ownerId: string;
  createdAt: Date;
}

export class PharmacyDatabase extends Dexie {
  transactions!: Table<Transaction>;
  entities!: Table<Entity>;
  ledgerEntries!: Table<LedgerEntry>;
  notifications!: Table<Notification>;
  users!: Table<AppUser>;
  systemLogs!: Table<SystemLog>;
  customerDebts!: Table<CustomerDebt>;
  deadlines!: Table<Deadline>;
  announcements!: Table<Announcement>;
  announcementReads!: Table<AnnouncementRead>;
  activationCodes!: Table<ActivationCode>;
  activationRequests!: Table<ActivationRequest>;
  recoveryRequests!: Table<RecoveryRequest>;
  bonuses!: Table<Bonus>;
  employees!: Table<Employee>;
  employeeAttendance!: Table<EmployeeAttendance>;
  branches!: Table<PharmacyBranch>;

  constructor() {
    super('PharmacyDatabase');
    this.version(13).stores({
      transactions: '++id, type, incomeType, category, date, entityId, branchId, createdBy',
      entities: '++id, name, type, branchId, ownerId',
      ledgerEntries: '++id, accountId, date, operationType, purchaseType, branchId, ownerId',
      notifications: '++id, userId, type, read, branchId, createdAt',
      users: 'userId, email, username',
      systemLogs: '++id, type, ownerId, createdAt',
      customerDebts: '++id, customerName, status, saleDate, dueDate, branchId, ownerId',
      deadlines: '++id, accountId, invoiceId, status, dueDate, branchId, ownerId',
      announcements: '++id, isActive, createdAt',
      announcementReads: '++id, userId, announcementId',
      activationCodes: '++id, code, assignedEmail, isUsed',
      activationRequests: '++id, email, status',
      recoveryRequests: '++id, email, status',
      bonuses: '++id, entityId, status, dueDate, branchId, ownerId',
      employees: '++id, name, phone, branchId, ownerId',
      employeeAttendance: '++id, employeeId, date, branchId, ownerId',
      branches: '++id, name, status, ownerId'
    });
  }
}

export const db = new PharmacyDatabase();
