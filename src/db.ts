import Dexie, { type Table } from 'dexie';

export interface Transaction {
  id?: string;
  type: 'revenue' | 'expense' | 'invoice' | 'payment' | 'income'; // added income for legacy support if needed
  incomeType?: 'cash' | 'credit';
  incomeClassification?: string;
  category: string;
  expenseClassification?: string;
  employeeName?: string;
  customerName?: string;
  amount: number;
  saleAmount?: number;
  costAmount?: number;
  profitAmount?: number;
  profitPercent?: number;
  paidAmount?: number;
  remainingAmount?: number;
  netProfit?: number;
  profitPercentage?: number;
  date: Date;
  description: string;
  statement?: string;
  partyName?: string;
  notes?: string;
  entityId?: string;
  entityName?: string;
  invoiceNumber?: string;
  invoiceAmount?: number;
  spoiledType?: 'linked' | 'unlinked';
  reason?: string;
  discount?: number;
  refundAmount?: number;
  invoiceDate?: Date;
  dueDate?: Date;
  imageUrl?: string;
  imageUrls?: string[];
  branchId?: string;
  createdBy: string;
  ownerId: string; // added ownerId explicitly
  userId?: string; // user convenience field requested
  username?: string;
  source?: string;
  isHistorical?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Entity {
  id?: string;
  name: string;
  phone?: string;
  address?: string;
  type: 'office' | 'scientific_office' | 'personal' | 'warehouse';
  balance: number;
  initialBalance: number;
  totalInvoices: number;
  totalPayments: number;
  limit: number;
  dueDate?: Date;
  nextDueDate?: Date;
  lastPaymentDate?: Date;
  lastInvoiceDate?: Date;
  totalPaidAmount?: number;
  notes?: string;
  branchId?: string;
  ownerId: string;
  username?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  isArchived?: boolean;
  status? : 'نشط' | 'مؤرشف' | 'محذوف';
  imageUrl?: string;
  imageUrls?: string[];
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
  invoiceDate?: Date;
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
  imageUrls?: string[];
  balanceAfterOperation: number;
  transactionId?: string;
  dueDate?: Date;
  paymentType?: 'cash' | 'deferred';
  paymentStatus?: 'pending' | 'paid' | 'overdue' | 'partial' | 'cancelled';
  paidAmount?: number;
  remainingAmount?: number;
  refundAmount?: number;
  linkedInvoiceId?: string;
  isHistorical?: boolean;
  branchId?: string;
  ownerId: string;
  username?: string;
  source?: string;
  createdAt: Date;
  updatedAt?: Date;
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
  updatedAt?: Date;
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
  updatedAt?: Date;
  isActive: boolean;
  isSetupComplete: boolean;
}

export interface SystemLog {
  id?: string;
  type: 'auto_delete' | 'sync' | 'backup';
  message: string;
  ownerId: string;
  createdAt: Date;
  updatedAt?: Date;
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
  updatedAt?: Date;
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
  updatedAt?: Date;
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
  updatedAt?: Date;
  createdBy: string;
}

export interface AnnouncementRead {
  id?: string;
  announcementId: string;
  userId: string;
  readAt: Date;
  updatedAt?: Date;
}

export interface ActivationCode {
  id?: string;
  code: string;
  assignedEmail?: string;
  isUsed: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ActivationRequest {
  id?: string;
  email: string;
  username: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt?: Date;
}

export interface RecoveryRequest {
  id?: string;
  email: string;
  status: 'pending' | 'resolved';
  createdAt: Date;
  updatedAt?: Date;
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
  updatedAt?: Date;
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
  updatedAt?: Date;
}

export interface EmployeeAttendance {
  id?: string;
  employeeId: string;
  employeeName: string;
  date: Date; // Keep for legacy and sorting
  month: number;
  year: number;
  attendanceDays: number;
  hoursWork: number; // Total monthly hours
  hourlyRate: number;
  dailyWage: number; // For monthly it will be the total pay
  notes?: string;
  branchId?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface PharmacyBranch {
  id?: string;
  code: string; // BR-0001
  name: string; // Branch Name
  pharmacyName: string; 
  managerName: string;
  phone: string;
  city: string;
  email?: string;
  notes?: string;
  status: 'active' | 'pending' | 'inactive' | 'archived';
  activationCode?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface HistoricalRecord {
  id?: string;
  type: 'opening_balance' | 'batch_period' | 'single_entry' | 'monthly_summary' | 'yearly_summary';
  
  // For opening balances
  cashHand?: number;
  inventoryValue?: number;
  customerDebts?: number;
  officeDebts?: number;
  warehouseDebts?: number;
  accumulatedExpenses?: number;
  retainedEarnings?: number;
  
  // For summaries (Monthly/Yearly/Batch)
  year?: number;
  month?: number;
  startDate?: Date;
  endDate?: Date;
  totalSales?: number;
  totalRevenueCash?: number;
  totalRevenueCredit?: number;
  totalPurchases?: number;
  totalExpenses?: number;
  totalProfits?: number;
  totalDebtOwed?: number;
  totalPaidDebt?: number;
  estimatedInventory?: number;
  officeDebtPeriod?: number;
  warehouseDebtPeriod?: number;

  // For single entries
  entryType?: 'revenue' | 'expense' | 'invoice' | 'payment' | 'customer_debt' | 'supplier_debt';
  amount?: number;
  date?: Date;
  entityId?: string;
  entityName?: string;
  invoiceNumber?: string;
  discount?: number;
  bonus?: number;
  paidAmount?: number;
  remainingAmount?: number;
  paymentStatus?: string;
  category?: string;

  notes?: string;
  isHistorical: boolean;
  branchId?: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface MedicineRequest {
  id?: string;
  patientName: string;
  phone: string;
  medicineName: string;
  quantity: string;
  status: 'waiting' | 'provided' | 'notified';
  notes?: string;
  imageUrl?: string;
  branchId?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ExpiredDamagedLoss {
  id?: string;
  date: Date;
  lossType: 'expired' | 'damaged';
  itemName: string;
  quantity: number;
  purchasePrice: number;
  totalLoss: number;
  invoiceId?: string | null;
  notes?: string;
  branchId?: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EntityActivity {
  id?: string;
  entityId: string;
  type: 'add_invoice' | 'update_invoice' | 'delete_invoice' | 'payment' | 'update_entity' | 'archive_entity' | 'delete_entity';
  action: string;
  details?: string;
  performedBy: string;
  createdAt: Date;
  updatedAt?: Date;
  ownerId: string;
  branchId?: string;
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
  historicalRecords!: Table<HistoricalRecord>;
  medicineRequests!: Table<MedicineRequest>;
  expiredDamagedLosses!: Table<ExpiredDamagedLoss>;
  entityActivities!: Table<EntityActivity>;

  constructor() {
    super('PharmacyDatabase');
    this.version(18).stores({
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
      branches: '++id, name, status, ownerId',
      historicalRecords: '++id, type, startDate, endDate, branchId, ownerId',
      medicineRequests: '++id, patientName, phone, medicineName, status, branchId, ownerId',
      expiredDamagedLosses: '++id, date, lossType, invoiceId, branchId, ownerId',
      entityActivities: '++id, entityId, type, createdAt, performedBy, branchId, ownerId'
    });
  }
}

export const db = new PharmacyDatabase();
