import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  History, 
  Bell, 
  Search, 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Printer, 
  Settings, 
  Cloud, 
  LogOut, 
  Camera, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle,
  Clock,
  RefreshCcw,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ShieldCheck,
  Calendar,
  FileText,
  CreditCard,
  DollarSign,
  TrendingDown,
  TrendingUp,
  PieChart,
  CalendarDays,
  Menu,
  X,
  Hash,
  CloudLightning,
  Check,
  FileUp,
  Package,
  PackageSearch,
  Info,
  Sun,
  Moon,
  Monitor,
  Gift,
  ShoppingCart,
  Building2,
  Clock3,
  ScrollText,
  ArrowLeftRight,
  ArrowLeft,
  Upload,
  Smartphone,
  Laptop,
  BarChart3,
  MoreHorizontal,
  PlusCircle,
  Bug,
  Pencil,
  Table as TableIcon
} from 'lucide-react';
import { SupplierHistoricalImportWizard } from './components/SupplierHistoricalImportWizard';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  format, 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  subMonths, 
  isWithinInterval, 
  subDays 
} from 'date-fns';
import { ar } from 'date-fns/locale';
import { useFirebaseQuery } from './hooks/useFirebaseQuery';
import { firebaseService } from './services/firebaseService';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInAnonymously } from 'firebase/auth';
import { query, where, orderBy } from 'firebase/firestore';
import { 
  type Transaction, 
  type Entity, 
  type LedgerEntry, 
  type Notification, 
  type AppUser, 
  type SystemLog, 
  type CustomerDebt,
  type Deadline,
  type Announcement,
  type ActivationCode,
  type ActivationRequest,
  type RecoveryRequest,
  type Bonus,
  type Employee,
  type EmployeeAttendance,
  type PharmacyBranch,
  type AnnouncementRead,
  type HistoricalRecord,
  type MedicineRequest,
  type ExpiredDamagedLoss,
  type EntityActivity
} from './db';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { ImageCapture } from './components/ImageCapture';
import { googleDriveService, type SyncSettings, type ImageManagementSettings, type DriveFile } from './services/googleDriveService';
import { useGoogleAuth } from './components/AuthProvider';
import { cn, fileToBase64 } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { NumericFormat } from 'react-number-format';
import { ExpenseForm } from './components/ExpenseForm';
import { RevenueForm } from './components/RevenueForm';
import { InvoiceForm } from './components/InvoiceForm';
import { EntityForm } from './components/EntityForm';
import { SupplierAccountPage } from './components/SupplierAccountPage';
import { BonusForm } from './components/BonusForm';
import { InvoiceDetailsPage } from './components/InvoiceDetailsPage';
import { FinancialPeriodReport } from './components/FinancialPeriodReport';
import { EmployeesPage } from './components/EmployeesPage';
import { EmployeeForm } from './components/EmployeeForm';
import { AttendanceForm } from './components/AttendanceForm';
import { BranchesPage } from './components/BranchesPage';
import { BranchForm } from './components/BranchForm';
import { HistoricalMigrationPage } from './components/HistoricalMigrationPage';
import { MedicineRequestsPage } from './components/MedicineRequestsPage';
import { ExcelImportWizard } from './components/ExcelImportWizard';
import { MultiInvoiceEntry } from './components/MultiInvoiceEntry';
import { MultiPaymentEntry } from './components/MultiPaymentEntry';
import { DataPersistenceService } from './services/dataPersistenceService';
import { formatIQD, formatNumberWithCommas, parseFormattedNumber, safeFormatDate, toValidDate } from './lib/formatters';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { LossesPage } from './components/LossesPage';
import { LossForm } from './components/LossForm';

// Re-using the Invoice Details Dialog fragment from the corrupted file
type Theme = 'light' | 'dark' | 'system';

const ThemeToggle = ({ theme, setTheme }: { theme: Theme, setTheme: (t: Theme) => void }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="size-8 flex items-center justify-center text-slate-400 hover:text-foreground hover:bg-slate-800 rounded-xl outline-none transition-colors">
        {theme === 'light' && <Sun className="h-5 w-5" />}
        {theme === 'dark' && <Moon className="h-5 w-5" />}
        {theme === 'system' && <Monitor className="h-5 w-5" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border text-foreground p-2 rounded-xl">
        <DropdownMenuItem className="gap-3 p-3 cursor-pointer hover:bg-muted rounded-lg" onClick={() => setTheme('light')}>
          <Sun className="h-4 w-4" />
          <span>الوضع النهاري</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-3 p-3 cursor-pointer hover:bg-muted rounded-lg" onClick={() => setTheme('dark')}>
          <Moon className="h-4 w-4" />
          <span>الوضع الليلي</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-3 p-3 cursor-pointer hover:bg-muted rounded-lg" onClick={() => setTheme('system')}>
          <Monitor className="h-4 w-4" />
          <span>تلقائي (حسب النظام)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ViewRevenueDialog = ({ 
  isOpen, 
  onOpenChange, 
  revenue,
  branches
}: { 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void; 
  revenue: Transaction | null;
  branches: PharmacyBranch[];
}) => {
  if (!revenue) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="bg-card border-border text-foreground sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-0">
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <Label className="text-emerald-500 font-black text-[10px] uppercase tracking-widest block mb-2">تفاصيل الوارد</Label>
              <h2 className="text-3xl font-black text-foreground">{revenue.customerName || revenue.description}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full uppercase">
                  {branches.find(b => b.id === revenue.branchId)?.name || 'فرع غير معروف'}
                </span>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                  revenue.incomeType === 'cash' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {revenue.incomeType === 'cash' ? 'نقدي' : 'آجل'}
                </span>
              </div>
            </div>
            <div className="text-left">
              <div className="text-[10px] text-muted-foreground font-black mb-1 uppercase tracking-widest">التاريخ</div>
              <div className="font-mono font-bold text-lg">{safeFormatDate(revenue.date, 'yyyy/MM/dd')}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 bg-muted/30 rounded-2xl border border-border group hover:border-emerald-500/30 transition-colors">
              <div className="text-[10px] text-muted-foreground font-black mb-2 uppercase">إجمالي الوارد</div>
              <div className="text-xl font-black text-foreground font-mono">{formatNumberWithCommas(revenue.saleAmount || revenue.amount)}</div>
            </div>
            <div className="p-5 bg-muted/30 rounded-2xl border border-border group hover:border-emerald-500/30 transition-colors">
              <div className="text-[10px] text-muted-foreground font-black mb-2 uppercase">نسبة الربح</div>
              <div className="text-xl font-black text-blue-600 font-mono">%{revenue.profitPercent || 0}</div>
            </div>
            <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 group hover:bg-emerald-500/10 transition-colors">
              <div className="text-[10px] text-emerald-700 font-black mb-2 uppercase">صافي الربح</div>
              <div className="text-xl font-black text-emerald-600 font-mono">{formatNumberWithCommas(revenue.profitAmount || revenue.netProfit || 0)}</div>
            </div>
            <div className="p-5 bg-rose-500/5 rounded-2xl border border-rose-500/10 group hover:bg-rose-500/10 transition-colors">
              <div className="text-[10px] text-rose-700 font-black mb-2 uppercase">المتبقي</div>
              <div className="text-xl font-black text-rose-600 font-mono">{formatNumberWithCommas(revenue.remainingAmount ?? (revenue.incomeType === 'cash' ? 0 : revenue.amount))}</div>
            </div>
          </div>

          {revenue.notes && (
            <div className="space-y-3">
              <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest block">ملاحظات</Label>
              <div className="p-6 bg-muted/30 rounded-2xl border border-border italic text-foreground font-bold leading-relaxed">
                {revenue.notes}
              </div>
            </div>
          )}

          {((revenue.imageUrls && revenue.imageUrls.length > 0) || revenue.imageUrl) && (
            <div className="space-y-4">
              <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest block">المرفقات والصور</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {(revenue.imageUrls || (revenue.imageUrl ? [revenue.imageUrl] : [])).map((url: string, idx: number) => (
                  <div key={idx} className="aspect-square rounded-2xl border-2 border-border overflow-hidden bg-muted group cursor-zoom-in shadow-xl hover:shadow-primary/5 transition-all">
                    <img src={url} alt={`Revenue Image ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {revenue.updatedAt && (
             <div className="pt-6 border-t border-border flex justify-between items-center text-[9px] font-bold text-muted-foreground uppercase opacity-50">
                <span>آخر تحديث: {safeFormatDate(revenue.updatedAt, 'yyyy/MM/dd HH:mm')}</span>
                <span>ID: {revenue.id}</span>
             </div>
          )}
        </div>
        <div className="p-6 bg-muted/20 border-t border-border flex justify-end">
           <Button onClick={() => onOpenChange(false)} className="rounded-xl h-12 px-8 font-black">إغلاق</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DeleteInvoiceConfirmDialog = ({ 
  isOpen, 
  onOpenChange, 
  onConfirm,
  invoice 
}: { 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void; 
  onConfirm: () => void;
  invoice: LedgerEntry | null;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="bg-card border-border text-foreground max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-rose-500 text-xl font-black">حذف القائمة</DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
             هل أنت متأكد من حذف الفاتورة رقم <span className="font-bold text-foreground">{invoice?.invoiceNumber}</span>؟ سيتم حذف العملية وتعديل الرصيد تلقائياً.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl h-12 border-border font-bold">تراجع</Button>
          <Button variant="destructive" onClick={onConfirm} className="flex-1 bg-rose-500 hover:bg-rose-600 rounded-xl h-12 font-black shadow-lg shadow-rose-500/20">نعم، حذف</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditInvoiceDialog = ({ 
  isOpen, 
  onOpenChange, 
  onSubmit,
  invoice,
  entities,
  selectedEntity,
  onImagesChange
}: { 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void; 
  onSubmit: (data: any) => void;
  invoice: LedgerEntry | null;
  entities: Entity[];
  selectedEntity: Entity | null;
  onImagesChange?: (files: File[]) => void;
}) => {
  if (!invoice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="bg-card border-border text-foreground sm:max-w-2xl lg:max-w-[85vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-black">تعديل فاتورة مشتريات</DialogTitle>
          <DialogDescription className="text-muted-foreground font-bold italic">
            تعديل بيانات القائمة رقم {invoice.invoiceNumber} للمورد {invoice.accountName}
          </DialogDescription>
        </DialogHeader>
        <InvoiceForm 
          entities={entities}
          selectedEntity={selectedEntity}
          initialData={invoice}
          onSubmit={onSubmit}
          onClose={() => onOpenChange(false)}
          onImagesChange={onImagesChange}
        />
      </DialogContent>
    </Dialog>
  );
};






















export default function App() {
  const { user: googleUser, isDriveLinked, loading: googleAuthLoading, linkDrive, unlinkDrive } = useGoogleAuth();
  const [user, setUser] = useState(auth.currentUser);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (t: Theme) => {
      root.classList.remove('light', 'dark');
      if (t === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(t);
      }
      localStorage.setItem('theme', t);
    };

    applyTheme(theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);
  
  // States from hooks.txt
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('pharma-active-tab') || 'finance');
  const [isHistoricalWizardOpen, setIsHistoricalWizardOpen] = useState(false);
  
  // Firebase connection check
  useEffect(() => {
    const testFirebase = async () => {
      try {
        console.log("Firebase initialized and ready");
      } catch (err) {
        console.error("Firebase connection failed:", err);
        toast.error('حدث خطأ في الاتصال بالسيرفر السحابي');
      }
    };
    testFirebase();
  }, []);

  useEffect(() => {
    localStorage.setItem('pharma-active-tab', activeTab);
  }, [activeTab]);

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appModeSetting, setAppModeSetting] = useState<'auto' | 'laptop' | 'mobile'>(() => {
    const saved = localStorage.getItem('pharma-app-mode-setting');
    return (saved as 'auto' | 'laptop' | 'mobile') || 'auto';
  });

  // Track window size for auto-responsive logic
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine effective mode based on setting and width
  const effectiveAppMode = useMemo(() => {
    if (appModeSetting === 'laptop') return 'laptop';
    if (appModeSetting === 'mobile') return 'mobile';
    
    // Auto mode breakpoints: Mobile < 640px, Tablet/Desktop >= 640px
    return windowWidth < 640 ? 'mobile' : 'laptop';
  }, [appModeSetting, windowWidth]);

  // Persist preference
  useEffect(() => {
    localStorage.setItem('pharma-app-mode-setting', appModeSetting);
  }, [appModeSetting]);

  const [currentBranchId, setCurrentBranchId] = useState<string | null>(localStorage.getItem('pharma-current-branch-id'));

  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    isLoading?: boolean;
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    isLoading: false
  });

  const triggerDelete = (title: string, description: string, onConfirm: () => void, confirmText = 'نعم، حذف', cancelText = 'إلغاء') => {
    console.log("Delete triggered:", title);
    setDeleteConfirmState({
      isOpen: true,
      title,
      description,
      onConfirm,
      confirmText,
      cancelText,
      isLoading: false
    });
  };

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [reportTypeFilter, setReportTypeFilter] = useState<'all' | 'current' | 'historical'>(() => 
    (localStorage.getItem('pharma-report-filter') as 'all' | 'current' | 'historical') || 'all'
  );
  useEffect(() => {
    localStorage.setItem('pharma-report-filter', reportTypeFilter);
  }, [reportTypeFilter]);

  const handleUpdateInvoiceImageUrls = async (invoice: LedgerEntry, imageUrls: string[]) => {
    if (!invoice.id) return;
    const safeImageUrls = Array.isArray(imageUrls) ? imageUrls : [];
    try {
      await firebaseService.updateDocument('ledgerEntries', invoice.id, { 
        imageUrls: safeImageUrls,
        imageUrl: safeImageUrls.length > 0 ? safeImageUrls[0] : '' 
      });
      setViewingInvoice(prev => prev ? { ...prev, imageUrls: safeImageUrls, imageUrl: safeImageUrls.length > 0 ? safeImageUrls[0] : '' } : null);
      toast.success('تم تحديث الصور بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء تحديث الصور');
    }
  };

  const handleSelectBranch = (id: string | null) => {
    console.log("Setting selected branch:", id);
    setCurrentBranchId(id);
    if (id) {
      localStorage.setItem('pharma-current-branch-id', id);
    } else {
      localStorage.removeItem('pharma-current-branch-id');
    }
    toast.success(id ? 'تم التبديل لمكان العمل المختار' : 'تم تفعيل العرض الموحد');
  };

  // Persist selected branch
  useEffect(() => {
    if (currentBranchId) {
      localStorage.setItem('pharma-current-branch-id', currentBranchId);
    } else {
      localStorage.removeItem('pharma-current-branch-id');
    }
  }, [currentBranchId]);

  const [entitySearch, setEntitySearch] = useState('');
  const [entityStatusFilter, setEntityStatusFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');

  const branchesQuery = useMemo(() => [], []);
  const transactionsQuery = useMemo(() => [], []);
  const entitiesQuery = useMemo(() => [], []);
  const customerDebtsQuery = useMemo(() => [], []);
  const notificationsQuery = useMemo(() => [], []);
  const bonusesQuery = useMemo(() => [], []);
  const employeesQuery = useMemo(() => [], []);
  const attendanceQuery = useMemo(() => [], []);
  const ledgerEntriesQuery = useMemo(() => [], []);
  const historicalQuery = useMemo(() => [], []);
  const entityActivitiesQuery = useMemo(() => [], []);

  // Firebase Real-time Queries
  const { data: expiredDamagedLosses = [] } = useFirebaseQuery<ExpiredDamagedLoss>('expiredDamagedLosses');
  const { data: rawBranches = [] } = useFirebaseQuery<PharmacyBranch>('branches', branchesQuery);
  const { data: rawTransactions = [] } = useFirebaseQuery<Transaction>('transactions', transactionsQuery);
  const { data: rawEntities = [] } = useFirebaseQuery<Entity>('entities', entitiesQuery);
  const { data: rawCustomerDebts = [] } = useFirebaseQuery<CustomerDebt>('customerDebts', customerDebtsQuery);
  const { data: rawNotifications = [] } = useFirebaseQuery<Notification>('notifications', notificationsQuery);
  const { data: rawBonuses = [] } = useFirebaseQuery<Bonus>('bonuses', bonusesQuery);
  const { data: rawEmployees = [] } = useFirebaseQuery<Employee>('employees', employeesQuery);
  const { data: rawEmployeeAttendance = [] } = useFirebaseQuery<EmployeeAttendance>('employeeAttendance', attendanceQuery);
  const { data: rawAllLedgerEntries = [] } = useFirebaseQuery<LedgerEntry>('ledgerEntries', ledgerEntriesQuery);
  const { data: rawHistoricalRecords = [] } = useFirebaseQuery<HistoricalRecord>('historicalRecords', historicalQuery);
  const { data: rawEntityActivities = [] } = useFirebaseQuery<EntityActivity>('entityActivities', entityActivitiesQuery);
  const { data: deadlines = [] } = useFirebaseQuery<Deadline>('deadlines');
  const { data: activationCodes = [] } = useFirebaseQuery<ActivationCode>('activationCodes');
  const { data: activationRequests = [] } = useFirebaseQuery<ActivationRequest>('activationRequests');
  const { data: recoveryRequests = [] } = useFirebaseQuery<RecoveryRequest>('recoveryRequests');
  
  const announcementsConstraints = useMemo(() => [where('isActive', '==', 1)], []);
  const readAnnouncementsConstraints = useMemo(() => [where('userId', '==', user?.uid || 'none')], [user?.uid]);

  const { data: announcements = [] } = useFirebaseQuery<Announcement>('announcements', announcementsConstraints);
  const { data: readAnnouncementsData = [] } = useFirebaseQuery<AnnouncementRead>('announcementReads', readAnnouncementsConstraints);

  // Client-side sorting to avoid Firestore Index requirements
  const branches = useMemo(() => {
    return [...rawBranches].sort((a, b) => {
      const da = toValidDate(a.createdAt || Date.now());
      const db = toValidDate(b.createdAt || Date.now());
      const ta = isNaN(da.getTime()) ? 0 : da.getTime();
      const tb = isNaN(db.getTime()) ? 0 : db.getTime();
      return tb - ta;
    });
  }, [rawBranches]);

  const transactions = useMemo(() => {
    return [...rawTransactions]
      .filter(tx => !tx.isDeleted && !tx.deletedAt)
      .sort((a, b) => {
        const da = toValidDate(a.date || a.createdAt || Date.now());
        const db = toValidDate(b.date || b.createdAt || Date.now());
        const ta = isNaN(da.getTime()) ? 0 : da.getTime();
        const tb = isNaN(db.getTime()) ? 0 : db.getTime();
        return tb - ta;
      });
  }, [rawTransactions]);
  const entities = useMemo(() => [...rawEntities].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ar')), [rawEntities]);
  const entityActivities = useMemo(() => {
    return [...rawEntityActivities].sort((a, b) => {
      const da = toValidDate(a.createdAt || Date.now());
      const db = toValidDate(b.createdAt || Date.now());
      return db.getTime() - da.getTime();
    });
  }, [rawEntityActivities]);

  const filteredEntities = useMemo(() => {
    let filtered = [...entities];
    
    // Status Filter
    if (entityStatusFilter === 'active') {
      filtered = filtered.filter(e => (!e.status || e.status === 'نشط') && !e.deletedAt);
    } else if (entityStatusFilter === 'archived') {
      filtered = filtered.filter(e => e.status === 'مؤرشف' && !e.deletedAt);
    } else {
      filtered = filtered.filter(e => !e.deletedAt);
    }

    // Search Filter
    if (entitySearch) {
      const s = entitySearch.toLowerCase();
      filtered = filtered.filter(e => e.name.toLowerCase().includes(s) || (e.phone && e.phone.toLowerCase().includes(s)));
    }

    return filtered;
  }, [entities, entityStatusFilter, entitySearch]);
  const customerDebts = useMemo(() => {
    return [...rawCustomerDebts].sort((a, b) => {
      const da = toValidDate(a.createdAt || Date.now());
      const db = toValidDate(b.createdAt || Date.now());
      const ta = isNaN(da.getTime()) ? 0 : da.getTime();
      const tb = isNaN(db.getTime()) ? 0 : db.getTime();
      return tb - ta;
    });
  }, [rawCustomerDebts]);

  const notifications = useMemo(() => {
    return [...rawNotifications].sort((a, b) => {
      const da = toValidDate(a.createdAt || Date.now());
      const db = toValidDate(b.createdAt || Date.now());
      const ta = isNaN(da.getTime()) ? 0 : da.getTime();
      const tb = isNaN(db.getTime()) ? 0 : db.getTime();
      return tb - ta;
    });
  }, [rawNotifications]);

  const bonuses = useMemo(() => {
    return [...rawBonuses].sort((a, b) => {
      const da = toValidDate(a.createdAt || Date.now());
      const db = toValidDate(b.createdAt || Date.now());
      const ta = isNaN(da.getTime()) ? 0 : da.getTime();
      const tb = isNaN(db.getTime()) ? 0 : db.getTime();
      return tb - ta;
    });
  }, [rawBonuses]);

  const employees = useMemo(() => [...rawEmployees].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ar')), [rawEmployees]);
  
  const employeeAttendance = useMemo(() => {
    return [...rawEmployeeAttendance].sort((a, b) => {
      const da = toValidDate(a.date || a.createdAt || Date.now());
      const db = toValidDate(b.date || b.createdAt || Date.now());
      const ta = isNaN(da.getTime()) ? 0 : da.getTime();
      const tb = isNaN(db.getTime()) ? 0 : db.getTime();
      return tb - ta;
    });
  }, [rawEmployeeAttendance]);

  const allLedgerEntries = useMemo(() => {
    return [...rawAllLedgerEntries].sort((a, b) => {
      const da = toValidDate(a.date || a.createdAt || Date.now());
      const db = toValidDate(b.date || b.createdAt || Date.now());
      const ta = isNaN(da.getTime()) ? 0 : da.getTime();
      const tb = isNaN(db.getTime()) ? 0 : db.getTime();
      return tb - ta;
    });
  }, [rawAllLedgerEntries]);

  const historicalRecords = useMemo(() => {
    return [...rawHistoricalRecords].sort((a, b) => {
      const da = toValidDate(a.createdAt || Date.now());
      const db = toValidDate(b.createdAt || Date.now());
      const ta = isNaN(da.getTime()) ? 0 : da.getTime();
      const tb = isNaN(db.getTime()) ? 0 : db.getTime();
      return tb - ta;
    });
  }, [rawHistoricalRecords]);

  useEffect(() => {
    // Check local auth for demo mode first
    const isDocAuth = localStorage.getItem('pharma-is-authenticated') === 'true';
    if (isDocAuth && !auth.currentUser) {
      const demoAppUser: AppUser = {
        userId: 'demo-user',
        email: 'demo@pharma.local',
        username: 'Demo User',
        displayName: 'Demo User',
        isActive: true,
        isSetupComplete: true,
        createdAt: new Date(),
        role: 'admin'
      };
      setAppUser(demoAppUser);
      setAuthStep('authenticated');
      setIsAppAuthenticated(true);
      setAuthStatusLoading(false);
    }

    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setIsAppAuthenticated(true);
        // Map Firebase user to AppUser format
        const mockAppUser: AppUser = {
          userId: u.uid,
          email: u.email || '',
          username: u.displayName || u.email?.split('@')[0] || 'User',
          displayName: u.displayName || 'User',
          isActive: true,
          isSetupComplete: true,
          createdAt: new Date(),
          role: u.email === 'mustafaenginerr35@gmail.com' ? 'admin' : 'manager'
        };
        setAppUser(mockAppUser);
        setAuthStatusLoading(false);
        setAuthStep('authenticated');
        localStorage.setItem('pharma-is-authenticated', 'true');
      } else if (!isDocAuth) {
        setIsAppAuthenticated(false);
        setAuthStatusLoading(false);
        localStorage.removeItem('pharma-is-authenticated');
      } else {
        setAuthStatusLoading(false);
      }
    });
  }, []);

  // Migration logic simplified for Firebase
  useEffect(() => {
    // We rely on Firestore source of truth now. 
    // Orphaned records from local storage are ignored for now to ensure data integrity in the cloud.
  }, [currentBranchId, branches.length]);
  // Debug logs for collections
  useEffect(() => {
    const collections = {
      transactions: transactions.length,
      entities: entities.length,
      ledgerEntries: allLedgerEntries.length,
      historicalRecords: historicalRecords.length,
      customerDebts: customerDebts.length,
      employees: employees.length,
      attendance: employeeAttendance.length,
      expiredLosses: expiredDamagedLosses.length,
      branches: branches.length
    };
    
    console.log("[DataSync] Collection counts:", collections);
    
    Object.entries(collections).forEach(([name, count]) => {
      if (count === 0) {
        console.warn(`[DataSync] Collection '${name}' is empty. Check if Firestore has data or if rules allow reading.`);
      }
    });
  }, [transactions.length, entities.length, allLedgerEntries.length, historicalRecords.length, customerDebts.length, employees.length, employeeAttendance.length, expiredDamagedLosses.length, branches.length]);

  const userPermissions = useMemo(() => {
    if (!appUser) return { canManageBranches: false, canViewReports: false, canEditTransactions: false };
    const isAdmin = appUser.role === 'admin';
    return {
      canManageBranches: isAdmin,
      canViewReports: true,
      canEditTransactions: isAdmin || appUser.role === 'manager',
    };
  }, [appUser]);

  const navItems = [
    { id: 'finance', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'daily-entry', label: 'الإدخال اليومي', icon: PlusCircle },
    { id: 'revenues', label: 'الإيرادات', icon: CreditCard },
    { id: 'entities', label: 'الموردون والمذاخر', icon: Building2 },
    { id: 'employees', label: 'الموظفون', icon: Users },
    { id: 'invoices', label: 'الفواتير', icon: FileText },
    { id: 'payments', label: 'التسديدات', icon: Receipt },
    { id: 'losses', label: 'التالف والإكسباير', icon: AlertTriangle },
    { id: 'transactions', label: 'المصاريف العامة', icon: ArrowUpCircle },
    { id: 'notifications', label: 'الإشعارات', icon: Bell, badge: (notifications || []).filter(n => !n.read).length },
    { id: 'reports', label: 'التقارير', icon: PieChart },
    { id: 'medicine-requests', label: 'طلبات الأدوية', icon: PackageSearch },
    { id: 'branches', label: 'إدارة الصيدليات', icon: Building2 },
    { id: 'historical', label: 'الأرصدة والترحيل التاريخي', icon: History },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ].filter(item => {
    if (item.id === 'branches') return userPermissions.canManageBranches;
    if (item.id === 'reports') return userPermissions.canViewReports;
    return true;
  });
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [viewingEntityDetail, setViewingEntityDetail] = useState<Entity | null>(null);
  
  const ledgerConstraints = useMemo(() => [
    where('accountId', '==', selectedEntity?.id || 'none')
  ], [selectedEntity?.id]);

  const { data: rawLedgerEntries = [] } = useFirebaseQuery<LedgerEntry>('ledgerEntries', ledgerConstraints);
  const ledgerEntries = useMemo(() => [...rawLedgerEntries].sort((a, b) => toValidDate(a.date).getTime() - toValidDate(b.date).getTime()), [rawLedgerEntries]);

  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [isMultiEntryOpen, setIsMultiEntryOpen] = useState(false);
  const [isMultiPaymentOpen, setIsMultiPaymentOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isEditEntityOpen, setIsEditEntityOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [isEditTransactionOpen, setIsEditTransactionOpen] = useState(false);
  const [isViewRevenueOpen, setIsViewRevenueOpen] = useState(false);
  const [viewingRevenue, setViewingRevenue] = useState<Transaction | null>(null);
  const [revenueImageFiles, setRevenueImageFiles] = useState<File[]>([]);
  const [entityImageFiles, setEntityImageFiles] = useState<File[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleteTransactionConfirmOpen, setIsDeleteTransactionConfirmOpen] = useState(false);
  const [isEditLedgerEntryOpen, setIsEditLedgerEntryOpen] = useState(false);
  const [selectedLedgerEntry, setSelectedLedgerEntry] = useState<LedgerEntry | null>(null);
  
  const [isEditLossOpen, setIsEditLossOpen] = useState(false);
  const [selectedLoss, setSelectedLoss] = useState<ExpiredDamagedLoss | null>(null);
  const [isEditBonusOpen, setIsEditBonusOpen] = useState(false);
  const [editingBonus, setEditingBonus] = useState<Bonus | null>(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isEntityDeleteOptionsOpen, setIsEntityDeleteOptionsOpen] = useState(false);
  const [deletingEntityData, setDeletingEntityData] = useState<Entity | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ id: string, collection: string, label: string } | null>(null);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);
  const [selectedDeadline, setSelectedDeadline] = useState<LedgerEntry | null>(null);
  const [deadlineFilter, setDeadlineFilter] = useState<'all' | 'today' | 'week' | 'month' | 'overdue'>('all');
  const [deadlineSearch, setDeadlineSearch] = useState('');
  const [isBulkEntryOpen, setIsBulkEntryOpen] = useState(false);
  const [bulkEntries, setBulkEntries] = useState<any[]>([]);
  
  const [isAddRevenueOpen, setIsAddRevenueOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddBonusOpen, setIsAddBonusOpen] = useState(false);
  const [isAddLossOpen, setIsAddLossOpen] = useState(false);
  const [incomeType, setIncomeType] = useState<'cash' | 'credit'>('cash');
  const [expenseType, setExpenseType] = useState<'fixed_expense' | 'variable_expense' | 'spoiled_expiration'>('fixed_expense');
  const [spoiledType, setSpoiledType] = useState<'linked' | 'unlinked'>('unlinked');
  const [isAddEntityOpen, setIsAddEntityOpen] = useState(false);
  const [isAddDeadlineOpen, setIsAddDeadlineOpen] = useState(false);
  const [deadlineFormEntityId, setDeadlineFormEntityId] = useState<string>('');
  const [dashboardPeriod, setDashboardPeriod] = useState<'day' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date }>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });

  const [saleAmount, setSaleAmount] = useState<string>('');
  const [saleNetProfit, setSaleNetProfit] = useState<string>('');
  const [saleProfitPercentage, setSaleProfitPercentage] = useState<string>('');
  
  const [invAmount, setInvAmount] = useState<string>('');
  const [invDiscount, setInvDiscount] = useState<string>('0');
  const [invPurchaseType, setInvPurchaseType] = useState<'cash' | 'credit'>('credit');
  const [invBonus, setInvBonus] = useState<string>('0');
  
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payDiscount, setPayDiscount] = useState<number>(0);
  const [payDiscountType, setPayDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [payDiscountPercentage, setPayDiscountPercentage] = useState<number>(0);
  const [payRefund, setPayRefund] = useState<string>('0');
  const [payLinkedInvoice, setPayLinkedInvoice] = useState<string>('');

  const [deadlineAmount, setDeadlineAmount] = useState<string>('');
  const [deadlineDiscount, setDeadlineDiscount] = useState<string>('0');
  const [deadlineRefund, setDeadlineRefund] = useState<string>('0');
  const [deadlineRequiredPayment, setDeadlineRequiredPayment] = useState<string>('');

  const [txImageFile, setTxImageFile] = useState<File | null>(null);
  const [invImageFiles, setInvImageFiles] = useState<File[]>([]);
  const [payImageFile, setPayImageFile] = useState<File | null>(null);
  const [dlInvImageFile, setDlInvImageFile] = useState<File | null>(null);
  const [dlRecImageFile, setDlRecImageFile] = useState<File | null>(null);
  const [editLeImageFile, setEditLeImageFile] = useState<File | null>(null);

  const [isAppAuthenticated, setIsAppAuthenticated] = useState(() => localStorage.getItem('pharma-is-authenticated') === 'true');
  const [authStatusLoading, setAuthStatusLoading] = useState(true);
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authResetCode, setAuthResetCode] = useState('');
  const [authSecurityQuestion, setAuthSecurityQuestion] = useState('');
  const [authSecurityAnswer, setAuthSecurityAnswer] = useState('');
  const [authAccessCode, setAuthAccessCode] = useState('');
  const [authStep, setAuthStep] = useState<'register' | 'waiting' | 'setup-password' | 'login-password' | 'forgot-password' | 'security-reset' | 'recovery-request' | 'access-code' | 'authenticated'>('access-code');

  const [isEditInvoiceOpen, setIsEditInvoiceOpen] = useState(false);
  const [isDeleteInvoiceConfirmOpen, setIsDeleteInvoiceConfirmOpen] = useState(false);
  const [isRefundInvoiceOpen, setIsRefundInvoiceOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<LedgerEntry | null>(null);
  const [paymentMode, setPaymentMode] = useState<'normal' | 'partial' | 'full'>('normal');

  const [isAddCodeOpen, setIsAddCodeOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  
  const [isPublishingAnnouncement, setIsPublishingAnnouncement] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  
  const [syncSettings, setSyncSettings] = useState<SyncSettings>({ enabled: false, interval: 30, lastSync: null });
  const [imageSettings, setImageSettings] = useState<ImageManagementSettings>({ retentionYears: 3, autoDelete: false, lastCleanup: null });

  // Sync settings with Firestore
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = firebaseService.listenDocument('settings', user.uid, (data) => {
      if (data) {
        if (data.syncSettings) setSyncSettings(data.syncSettings);
        if (data.imageSettings) setImageSettings(data.imageSettings);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const updateSyncSettings = async (newSettings: SyncSettings) => {
    setSyncSettings(newSettings);
    if (user) {
      await firebaseService.setDocument('settings', user.uid, { syncSettings: newSettings }, { merge: true });
    }
  };

  const updateImageSettings = async (newSettings: ImageManagementSettings) => {
    setImageSettings(newSettings);
    if (user) {
      await firebaseService.setDocument('settings', user.uid, { imageSettings: newSettings }, { merge: true });
    }
  };

  const [isSyncing, setIsSyncing] = useState(false);

  const [oldImages, setOldImages] = useState<DriveFile[]>([]);
  const [isCheckingImages, setIsCheckingImages] = useState(false);

  // Announcements effects
  useEffect(() => {
    if (announcements.length > 0 && user) {
      const unread = announcements.filter(a => !readAnnouncementsData.some(r => r.announcementId === a.id));
      if (unread.length > 0) {
        setActiveAnnouncement(unread[0]);
        setIsAnnouncementOpen(true);
      }
    }
  }, [announcements, readAnnouncementsData, user]);

  const handleReadAnnouncement = async () => {
    if (activeAnnouncement?.id && user) {
      await firebaseService.addDocument('announcementReads', {
        announcementId: activeAnnouncement.id,
        userId: user.uid,
        readAt: new Date()
      });
      setIsAnnouncementOpen(false);
      setActiveAnnouncement(null);
    }
  };

  // Requirement: Auto-create default branch if none exist
  useEffect(() => {
    const initDefaultBranch = async () => {
      if (branches.length === 0 && authStep === 'authenticated') {
        process.env.NODE_ENV !== 'production' && console.log("No branches found, creating default branch...");
        
        const defaultBranch = {
          id: 'main',
          name: 'الفرع الرئيسي',
          code: 'MAIN01',
          ownerId: user?.uid || 'guest',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        } as any;
        
        try {
          // In Firestore we can just try to add, or check if any exists
          const existingMain = branches.find(b => b.id === 'main');
          if (!existingMain) {
            await firebaseService.addDocument('branches', defaultBranch);
            console.log("Default branch 'main' created successfully");
          }
        } catch (err) {
          console.error("Failed to create default branch:", err);
        }
      }
    };
    initDefaultBranch();
  }, [branches.length, authStep, appUser?.userId, user?.uid]);

  // Requirement: Auto-select first branch if none selected and branches exist
  useEffect(() => {
    if (!currentBranchId && branches.length > 0) {
      const savedBranchId = localStorage.getItem('pharma-current-branch-id');
      if (savedBranchId && branches.some(b => b.id === savedBranchId)) {
        console.log("Restoring selected branch from localStorage:", savedBranchId);
        setCurrentBranchId(savedBranchId);
      } else {
        const firstActive = branches.find(b => b.status === 'active') || branches[0];
        console.log("Auto-selecting first active branch:", firstActive.name);
        setCurrentBranchId(firstActive.id || null);
        localStorage.setItem('pharma-current-branch-id', firstActive.id || '');
      }
    }
  }, [branches.length, currentBranchId]);

  // Stats logic
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const monthStart = startOfMonth(new Date());
    
    // Helper to safely get date
    const getDate = (d: any) => toValidDate(d);

    // Daily revenue (Income today)
    const dailyRevenue = transactions
      .filter(tx => (tx.type === 'income' || tx.type === 'revenue') && (!currentBranchId || tx.branchId === currentBranchId) && startOfDay(getDate(tx.date)).getTime() === today.getTime())
      .reduce((acc, tx) => acc + Number(tx.saleAmount || tx.amount || 0), 0);

    // Monthly stats
    const monthlyRevenue = transactions
      .filter(tx => (tx.type === 'income' || tx.type === 'revenue') && (!currentBranchId || tx.branchId === currentBranchId) && getDate(tx.date) >= monthStart)
      .reduce((acc, tx) => acc + Number(tx.saleAmount || tx.amount || 0), 0);

    // GROSS Profit from sales this month
    const monthlyGrossProfit = transactions
      .filter(tx => (tx.type === 'income' || tx.type === 'revenue') && (!currentBranchId || tx.branchId === currentBranchId) && getDate(tx.date) >= monthStart)
      .reduce((acc, tx) => acc + Number(tx.profitAmount || tx.netProfit || 0), 0);

    const monthlySalary = employeeAttendance
      .filter(record => (!currentBranchId || record.branchId === currentBranchId) && getDate(record.date) >= monthStart)
      .reduce((acc, record) => acc + Number(record.dailyWage || 0), 0);

    // Monthly Expense
    const monthlyExpense = transactions
      .filter(tx => tx.type === 'expense' && (!currentBranchId || tx.branchId === currentBranchId) && getDate(tx.date) >= monthStart)
      .reduce((acc, tx) => acc + Number(tx.amount || 0), 0) + monthlySalary;

    // Net Profit (Monthly) = Gross Profit from Sales - Expenses
    const netProfit = monthlyGrossProfit - monthlyExpense;
    const profitPercentage = monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0;

    // Supplier Dues
    const supplierDues = entities
      .filter(e => !currentBranchId || e.branchId === currentBranchId)
      .reduce((acc, e) => acc + Number(e.balance || 0), 0);

    // Due InvoicesCount
    const dueInvoicesCount = (allLedgerEntries || [])
      .filter(e => (!currentBranchId || e.branchId === currentBranchId) && e.operationType === 'invoice' && e.paymentStatus !== 'paid')
      .length;

    const bTx = currentBranchId ? transactions.filter(t => t.branchId === currentBranchId) : transactions;
    
    // Total Revenue (All time)
    const showHistorical = reportTypeFilter === 'all' || reportTypeFilter === 'historical';
    const showCurrent = reportTypeFilter === 'all' || reportTypeFilter === 'current';

    const histSales = showHistorical ? historicalRecords.filter(r => !currentBranchId || r.branchId === currentBranchId).reduce((acc, r) => acc + Number(r.totalSales || 0), 0) : 0;
    const histProfits = showHistorical ? historicalRecords.filter(r => !currentBranchId || r.branchId === currentBranchId).reduce((acc, r) => acc + Number(r.totalProfits || 0) + Number(r.retainedEarnings || 0), 0) : 0;
    const histExpenses = showHistorical ? historicalRecords.filter(r => !currentBranchId || r.branchId === currentBranchId).reduce((acc, r) => acc + Number(r.totalExpenses || 0) + Number(r.accumulatedExpenses || 0), 0) : 0;
    const histDues = showHistorical ? historicalRecords.filter(r => !currentBranchId || r.branchId === currentBranchId).reduce((acc, r) => acc + Number(r.totalDebtOwed || 0) + Number(r.officeDebts || 0) + Number(r.warehouseDebts || 0), 0) : 0;

    const currentRevenue = showCurrent ? bTx.filter(t => t.type === 'income' || t.type === 'revenue').reduce((acc, t) => acc + Number(t.saleAmount || t.amount || 0), 0) : 0;
    const totalRevenue = currentRevenue + histSales;
    
    // Calculate total losses from expired/damaged items
    const totalLossesAmount = showCurrent ? expiredDamagedLosses
      .filter(l => !currentBranchId || l.branchId === currentBranchId)
      .reduce((acc, l) => acc + Number(l.totalLoss || 0), 0) : 0;

    const currentExpense = showCurrent ? (bTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount || 0), 0) + 
      employeeAttendance.filter(record => !currentBranchId || record.branchId === currentBranchId).reduce((acc, record) => acc + Number(record.dailyWage || 0), 0) + totalLossesAmount) : 0;
    
    const totalExpense = currentExpense + histExpenses;
    
    // Total Gross Profit from transactions
    const currentGrossProfit = showCurrent ? bTx.filter(t => t.type === 'income' || t.type === 'revenue').reduce((acc, t) => acc + Number(t.profitAmount || t.netProfit || 0), 0) : 0;
    const totalGrossProfit = currentGrossProfit + histProfits;
    
    // TOTAL Net Profit = Total Gross Profit - Total Expenses
    const totalNetProfit = totalGrossProfit - totalExpense;
    
    const totals = {
      dailyRevenue,
      monthlyRevenue,
      monthlyExpense,
      netProfit,
      profitPercentage,
      supplierDues: (showCurrent ? supplierDues : 0) + histDues,
      dueInvoices: showCurrent ? dueInvoicesCount : 0,
      totalRevenue,
      totalExpense,
      totalNetProfit,
      totalLosses: totalLossesAmount
    };

    console.log("Dashboard totals:", totals);
    return totals;
  }, [transactions, entities, allLedgerEntries, employeeAttendance, historicalRecords, expiredDamagedLosses, reportTypeFilter, currentBranchId]);

  const [reportsMonth, setReportsMonth] = useState(new Date().getMonth());
  const [reportsYear, setReportsYear] = useState(new Date().getFullYear());
  const [reportsSupplierId, setReportsSupplierId] = useState<string>('all');
  const [reportsSupplierType, setReportsSupplierType] = useState<'all' | 'office' | 'warehouse'>('all');
  const [reportSubTab, setReportSubTab] = useState<'monthly' | 'period'>('monthly');

  // Aggregate stats for ALL months in the selected year for the table and charts
  const monthlyTimelineData = useMemo(() => {
    const data = [];
    const showHistorical = reportTypeFilter === 'all' || reportTypeFilter === 'historical';
    const showCurrent = reportTypeFilter === 'all' || reportTypeFilter === 'current';

    for (let m = 0; m < 12; m++) {
      const mStart = startOfMonth(new Date(reportsYear, m));
      const mEnd = endOfMonth(mStart);
      
      // Current data
      const mTx = showCurrent ? transactions.filter(t => (!currentBranchId || t.branchId === currentBranchId) && toValidDate(t.date) >= mStart && toValidDate(t.date) <= mEnd) : [];
      const mLosses = showCurrent ? expiredDamagedLosses.filter(l => (!currentBranchId || l.branchId === currentBranchId) && toValidDate(l.date) >= mStart && toValidDate(l.date) <= mEnd) : [];
      const mInvoices = showCurrent ? (allLedgerEntries?.filter(e => (!currentBranchId || e.branchId === currentBranchId) && e.operationType === 'invoice' && toValidDate(e.date) >= mStart && toValidDate(e.date) <= mEnd) || []) : [];
      
      // Filter invoices by supplier type and supplier ID if needed
      const filteredMInvoices = mInvoices.filter(inv => {
        if (reportsSupplierId !== 'all' && inv.accountId !== reportsSupplierId) return false;
        if (reportsSupplierType !== 'all') {
            const entity = entities.find(e => e.id === inv.accountId);
            if (reportsSupplierType === 'office' && entity?.type !== 'office') return false;
            if (reportsSupplierType === 'warehouse' && entity?.type !== 'warehouse') return false;
        }
        return true;
      });

      const mPayments = showCurrent ? (allLedgerEntries?.filter(e => (!currentBranchId || e.branchId === currentBranchId) && e.operationType === 'payment' && toValidDate(e.date) >= mStart && toValidDate(e.date) <= mEnd) || []) : [];
      const mSalaries = showCurrent ? (employeeAttendance.filter(r => (!currentBranchId || r.branchId === currentBranchId) && toValidDate(r.date) >= mStart && toValidDate(r.date) <= mEnd).reduce((acc, r) => acc + Number(r.dailyWage || 0), 0)) : 0;

      // Historical data (Monthly summaries matching this year and month)
      const hSummaries = showHistorical ? historicalRecords.filter(r => 
        (!currentBranchId || r.branchId === currentBranchId) && 
        r.type === 'monthly_summary' && 
        r.year === reportsYear && 
        r.month === (m + 1)
      ) : [];

      // Historical data (Single entries matching this timeframe)
      const hSingleEntries = showHistorical ? historicalRecords.filter(r => 
        (!currentBranchId || r.branchId === currentBranchId) && 
        r.type === 'single_entry' && 
        r.date && toValidDate(r.date) >= mStart && toValidDate(r.date) <= mEnd
      ) : [];

      const currentRevenue = mTx.filter(t => t.type === 'income' || t.type === 'revenue').reduce((acc, t) => acc + Number(t.saleAmount || t.amount || 0), 0);
      const histMonthlyRevenue = hSummaries.reduce((acc, h) => acc + Number(h.totalRevenueCash || 0) + Number(h.totalRevenueCredit || 0), 0);
      const histSingleRevenue = hSingleEntries.filter(e => e.entryType === 'revenue').reduce((acc, e) => acc + Number(e.amount || 0), 0);

      const currentProfit = mTx.filter(t => t.type === 'income' || t.type === 'revenue').reduce((acc, t) => acc + Number(t.profitAmount || t.netProfit || 0), 0);
      const histMonthlyProfit = hSummaries.reduce((acc, h) => acc + Number(h.totalProfits || 0), 0);
      const histSingleProfit = histSingleRevenue; // Simplified

      const currentLossAmount = mLosses.reduce((acc, l) => acc + Number(l.totalLoss || 0), 0);
      const currentExpenses = mTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount || 0), 0) + mSalaries + currentLossAmount;
      const histMonthlyExpenses = hSummaries.reduce((acc, h) => acc + Number(h.totalExpenses || 0), 0);
      const histSingleExpenses = hSingleEntries.filter(e => e.entryType === 'expense').reduce((acc, e) => acc + Number(e.amount || 0), 0);

      const invoiceTotal = filteredMInvoices.reduce((acc, i) => acc + Number(i.amount || 0), 0) + hSummaries.reduce((acc, h) => acc + Number(h.totalPurchases || 0), 0);
      const paymentTotal = mPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0) + hSummaries.reduce((acc, h) => acc + Number(h.totalPaidDebt || 0), 0);
      const remainingDebt = mTx.filter(t => t.type === 'income' || t.type === 'revenue').reduce((acc, t) => acc + Number(t.remainingAmount || 0), 0) + hSummaries.reduce((acc, h) => acc + Number(h.totalRevenueCredit || 0), 0);

      data.push({
        month: m + 1,
        monthName: safeFormatDate(mStart, 'MMMM'),
        revenue: currentRevenue + histMonthlyRevenue + histSingleRevenue,
        profit: currentProfit + histMonthlyProfit + histSingleProfit,
        expenses: currentExpenses + histMonthlyExpenses + histSingleExpenses,
        losses: currentLossAmount,
        invoices: invoiceTotal,
        payments: paymentTotal,
        remaining: remainingDebt,
        net: (currentProfit + histMonthlyProfit + histSingleProfit) - (currentExpenses + histMonthlyExpenses + histSingleExpenses),
        hasHistorical: hSummaries.length > 0 || hSingleEntries.length > 0
      });
    }
    return data;
  }, [transactions, entities, allLedgerEntries, employeeAttendance, historicalRecords, expiredDamagedLosses, reportTypeFilter, reportsYear, reportsSupplierId, reportsSupplierType, currentBranchId]);

  // Selected month vs Previous month comparison
  const monthlyComparison = useMemo(() => {
    const current = monthlyTimelineData[reportsMonth];
    const prevMonthIdx = reportsMonth === 0 ? 11 : reportsMonth - 1;
    const prevYear = reportsMonth === 0 ? reportsYear - 1 : reportsYear;
    
    // If we need data from prev year, we might need to fetch/calculate it. 
    // For now, let's assume we use the current year's indices if possible, or dummy zero if not available in current view.
    const previous = monthlyTimelineData[prevMonthIdx];

    const calcChange = (cur: number, prev: number) => {
      if (prev === 0) return cur > 0 ? 100 : 0;
      return ((cur - prev) / prev) * 100;
    };

    return {
      current,
      previous,
      changes: {
        revenue: calcChange(current.revenue, previous.revenue),
        profit: calcChange(current.profit, previous.profit),
        invoices: calcChange(current.invoices, previous.invoices),
        payments: calcChange(current.payments, previous.payments),
        remaining: calcChange(current.remaining, previous.remaining),
        losses: calcChange(current.losses, previous.losses),
        net: calcChange(current.net, previous.net)
      }
    };
  }, [monthlyTimelineData, reportsMonth, reportsYear]);
  
  const supplierPurchaseStats = useMemo(() => {
    if (reportsSupplierId === 'all') return null;
    
    const mStart = startOfMonth(new Date(reportsYear, reportsMonth));
    const mEnd = endOfMonth(mStart);
    
    const mInvoices = allLedgerEntries?.filter(e => 
      e.accountId === reportsSupplierId && 
      e.operationType === 'invoice' && 
      toValidDate(e.date) >= mStart && 
      toValidDate(e.date) <= mEnd
    ) || [];
    
    // For payments, we might want to check payments linked to these invoices or just payments to this supplier in this month
    const mPayments = allLedgerEntries?.filter(e => 
      e.accountId === reportsSupplierId && 
      e.operationType === 'payment' && 
      toValidDate(e.date) >= mStart && 
      toValidDate(e.date) <= mEnd
    ) || [];

    const totalPurchases = mInvoices.reduce((acc, i) => acc + Number(i.amount || 0), 0);
    const totalPaid = mPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const count = mInvoices.length;
    
    const highestInvoice = mInvoices.length > 0 ? Math.max(...mInvoices.map(i => Number(i.amount || 0))) : 0;
    const lastInvoice = mInvoices.length > 0 ? mInvoices.sort((a,b) => toValidDate(b.date).getTime() - toValidDate(a.date).getTime())[0] : null;
    
    const entity = entities.find(e => e.id === reportsSupplierId);
    
    return {
      totalPurchases,
      totalPaid,
      totalRemaining: totalPurchases - totalPaid,
      count,
      highestInvoice,
      lastInvoice,
      entity,
      invoices: mInvoices
    };
  }, [allLedgerEntries, reportsSupplierId, reportsMonth, reportsYear, entities]);

  const branchComparison = useMemo(() => {
    if (branches.length === 0) return [];
    
    return branches.map(branch => {
      const bTx = transactions.filter(t => t.branchId === branch.id);
      const bEntities = entities.filter(e => e.branchId === branch.id);
      
      const revenue = bTx.filter(t => t.type === 'income' || t.type === 'revenue').reduce((acc, t) => acc + Number(t.saleAmount || t.amount || 0), 0);
      const grossProfit = bTx.filter(t => t.type === 'income' || t.type === 'revenue').reduce((acc, t) => acc + Number(t.profitAmount || t.netProfit || 0), 0);
      const expense = bTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount || 0), 0);
      const dues = bEntities.reduce((acc, e) => acc + Number(e.balance || 0), 0);
      
      return {
        id: branch.id,
        name: branch.name,
        revenue,
        expense,
        profit: grossProfit - expense,
        dues
      };
    });
  }, [branches, transactions, entities]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return safeFormatDate(d, 'yyyy-MM-dd');
    });

    return last7Days.map(dateStr => {
      const dayIncome = transactions
        .filter(tx => (tx.type === 'income' || tx.type === 'revenue') && (!currentBranchId || tx.branchId === currentBranchId) && safeFormatDate(toValidDate(tx.date), 'yyyy-MM-dd') === dateStr)
        .reduce((acc, tx) => acc + Number(tx.saleAmount || tx.amount || 0), 0);
      
      const dayGrossProfit = transactions
        .filter(tx => (tx.type === 'income' || tx.type === 'revenue') && (!currentBranchId || tx.branchId === currentBranchId) && safeFormatDate(toValidDate(tx.date), 'yyyy-MM-dd') === dateStr)
        .reduce((acc, tx) => acc + Number(tx.profitAmount || tx.netProfit || 0), 0);
      
      const daySalary = employeeAttendance
        .filter(record => (!currentBranchId || record.branchId === currentBranchId) && safeFormatDate(toValidDate(record.date), 'yyyy-MM-dd') === dateStr)
        .reduce((acc, record) => acc + Number(record.dailyWage || 0), 0);
      
      const dayExpense = transactions
        .filter(tx => tx.type === 'expense' && (!currentBranchId || tx.branchId === currentBranchId) && safeFormatDate(toValidDate(tx.date), 'yyyy-MM-dd') === dateStr)
        .reduce((acc, tx) => acc + Number(tx.amount || 0), 0) + daySalary;

      return {
        name: safeFormatDate(new Date(dateStr), 'EEE'),
        income: dayIncome,
        expense: dayExpense,
        profit: dayGrossProfit - dayExpense
      };
    });
  }, [transactions, employeeAttendance, currentBranchId]);

  // Handlers
  const handleViewInvoice = (invoice: LedgerEntry) => {
    setViewingInvoice(invoice);
    setActiveTab('invoice-details');
  };

  const handleEntityClick = (entity: Entity) => {
    setViewingEntityDetail(entity);
  };

  const handleAddEntity = async (data: any) => {
    console.log("Adding entity...");
    const targetBranchId = currentBranchId || (branches.length > 0 ? branches[0].id : 'main');
    const initialBalance = Number(data.initialBalance) || 0;

    let imageUrl = '';
    const imageUrls: string[] = [];
    if (entityImageFiles && entityImageFiles.length > 0) {
      try {
        for (const file of entityImageFiles) {
          const b64 = await fileToBase64(file);
          imageUrls.push(b64);
        }
        imageUrl = imageUrls[0];
      } catch (e) {
        console.error('Error converting images to base64', e);
      }
    }

    const newEntity: Omit<Entity, 'id'> = {
      name: data.name as string,
      type: data.type as 'office' | 'warehouse',
      phone: data.phone as string,
      address: data.address as string,
      balance: initialBalance,
      initialBalance: initialBalance,
      totalInvoices: 0,
      totalPayments: 0,
      limit: Number(data.limit) || 0,
      branchId: (targetBranchId as string) || undefined,
      ownerId: appUser?.userId || 'demo-user',
      status: data.status || 'نشط',
      notes: data.notes as string,
      imageUrl,
      imageUrls,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;
    
    try {
      const docRef = await firebaseService.addDocument('entities', newEntity as Entity);
      
      // Activity
      await firebaseService.addDocument('entityActivities', {
        entityId: (docRef as any).id,
        type: 'add_invoice',
        action: 'تأسيس حساب جديد',
        details: `تم إنشاء حساب مورد جديد: ${data.name}`,
        performedBy: appUser?.username || 'user',
        createdAt: new Date(),
        ownerId: appUser?.userId || 'demo-user',
        branchId: targetBranchId as string || undefined
      });

      setIsAddEntityOpen(false);
      setEntityImageFiles([]);
      toast.success('تم إضافة المورد بنجاح');
    } catch (err) {
      console.error("[App] Error adding entity:", err);
      toast.error('حدث خطأ أثناء إضافة المورد');
    }
  };

  const handleUpdateEntity = async (id: string, data: any) => {
    console.log("Updating entity...", id);
    const prevEntity = entities.find(e => e.id === id);
    const nameChanged = prevEntity && prevEntity.name !== data.name;

    let imageUrl = prevEntity?.imageUrl || '';
    const imageUrls = [...(prevEntity?.imageUrls || [])];

    if (entityImageFiles && entityImageFiles.length > 0) {
      try {
        const newImageUrls: string[] = [];
        for (const file of entityImageFiles) {
          const b64 = await fileToBase64(file);
          newImageUrls.push(b64);
        }
        imageUrls.push(...newImageUrls);
        imageUrl = imageUrls[0];
      } catch (e) {
        console.error('Error converting images to base64', e);
      }
    }

    try {
      await firebaseService.updateDocument('entities', id, {
        name: data.name,
        type: data.type,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
        limit: Number(data.limit) || 0,
        status: data.status,
        initialBalance: Number(data.initialBalance) || 0,
        imageUrl,
        imageUrls,
        isArchived: data.status === 'مؤرشف',
        updatedAt: new Date()
      });

      // Propagate name change to ledger entries if name changed
      if (nameChanged) {
        const relatedEntries = rawAllLedgerEntries.filter(e => e.accountId === id);
        for (const entry of relatedEntries) {
          if (entry.id) await firebaseService.updateDocument('ledgerEntries', entry.id, { accountName: data.name });
        }
      }

      // Add Activity
      await firebaseService.addDocument('entityActivities', {
        entityId: id,
        type: 'update_entity',
        action: 'تعديل بيانات الحساب',
        details: `تعديل بيانات المورد: ${data.name}`,
        performedBy: appUser?.username || 'user',
        createdAt: new Date(),
        ownerId: appUser?.userId || 'demo-user',
        branchId: currentBranchId || undefined
      });

      setIsEditEntityOpen(false);
      setEditingEntity(null);
      toast.success('تم تحديث بيانات المورد بنجاح');
    } catch (err) {
      console.error("[App] Error updating entity:", err);
      toast.error('حدث خطأ أثناء تحديث المورد');
    }
  };

  const handleArchiveEntity = async (id: string) => {
    try {
      await firebaseService.updateDocument('entities', id, { 
        status: 'مؤرشف',
        isArchived: true,
        updatedAt: new Date()
      });

      await firebaseService.addDocument('entityActivities', {
        entityId: id,
        type: 'archive_entity',
        action: 'أرشفة المورد',
        details: 'تم نقل المورد إلى الأرشيف',
        performedBy: appUser?.username || 'user',
        createdAt: new Date(),
        ownerId: appUser?.userId || 'demo-user',
        branchId: currentBranchId || undefined
      });

      setIsEntityDeleteOptionsOpen(false);
      setDeletingEntityData(null);
      toast.success('تم أرشفة المورد بنجاح (مع الاحتفاظ ببياناته)');
    } catch (error) {
      console.error(error);
      toast.error('فشل في عملية الأرشفة');
    }
  };

  const handleSoftDeleteEntity = async (id: string) => {
    try {
      await firebaseService.updateDocument('entities', id, { 
        status: 'محذوف',
        deletedAt: new Date(),
        updatedAt: new Date()
      });

      await firebaseService.addDocument('entityActivities', {
        entityId: id,
        type: 'delete_entity',
        action: 'حذف (Soft Delete)',
        details: 'تم وسم المورد كمحذوف',
        performedBy: appUser?.username || 'user',
        createdAt: new Date(),
        ownerId: appUser?.userId || 'demo-user',
        branchId: currentBranchId || undefined
      });

      setIsDeleteConfirmOpen(false);
      toast.success('تم حذف المورد بنجاح');
    } catch (error) {
      console.error(error);
      toast.error('فشل في عملية الحذف');
    }
  };

  const handleFullDeleteEntity = async (id: string) => {
    try {
      // 1. Delete entity
      await firebaseService.deleteDocument('entities', id);
      
      const relatedEntries = rawAllLedgerEntries.filter(e => e.accountId === id);
      for (const entry of relatedEntries) {
        if (entry.id) await firebaseService.deleteDocument('ledgerEntries', entry.id);
      }

      // Also delete activities
      const relatedActivities = rawEntityActivities.filter(a => a.entityId === id);
      for (const act of relatedActivities) {
        if (act.id) await firebaseService.deleteDocument('entityActivities', act.id);
      }

      setIsEntityDeleteOptionsOpen(false);
      setDeletingEntityData(null);
      toast.success('تم حذف المورد وكافة بياناته المرتبطة نهائياً');
    } catch (error) {
      console.error(error);
      toast.error('فشل في عملية الحذف الكامل');
    }
  };

  const handleAddEmployee = async (data: Partial<Employee>) => {
    console.log("[App] Adding employee...");
    if (!appUser) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    const targetBranchId = currentBranchId || (branches.length > 0 ? branches[0].id : 'main');

    try {
      await firebaseService.addDocument('employees', {
        ...data as Employee,
        branchId: (targetBranchId as string) || undefined,
        ownerId: appUser.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);
      console.log("[App] Employee added successfully");
      toast.success('تم إضافة الموظف بنجاح');
    } catch (error) {
      console.error("[App] Failed to add employee:", error);
      toast.error('حدث خطأ أثناء إضافة الموظف');
    }
  };

  const handleUpdateEmployee = async (id: string, data: Partial<Employee>) => {
    console.log("Updating record... (Employee)");
    try {
      await firebaseService.updateDocument('employees', id, {
        ...data,
        updatedAt: new Date()
      } as any);
      console.log("Updated successfully (Employee)");
      toast.success('تم تحديث بيانات الموظف');
    } catch (error) {
      console.error("Failed to update employee:", error);
      toast.error('فشل في تحديث البيانات');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    const employee = employees.find(e => e.id === id);
    const attendanceCount = rawEmployeeAttendance.filter(a => a.employeeId === id).length;
    
    if (attendanceCount > 0) {
      triggerDelete(
        `حذف موظف: ${employee?.name}`,
        `هذا الموظف لديه ${attendanceCount} سجل حضور. هل تريد حذفه نهائياً مع كافة سجلاته؟ لا يمكن التراجع.`,
        async () => {
          setDeleteConfirmState(prev => ({ ...prev, isLoading: true }));
          try {
            console.log("Deleting employee and attendance:", id);
            await firebaseService.deleteDocument('employees', id);
            const attendance = rawEmployeeAttendance.filter(a => a.employeeId === id);
            for (const att of attendance) {
              if (att.id) await firebaseService.deleteDocument('employeeAttendance', att.id);
            }
            console.log("Deleted successfully: employee", id);
            setDeleteConfirmState(prev => ({ ...prev, isOpen: false, isLoading: false }));
            toast.success('تم حذف الموظف وسجلاته بنجاح');
          } catch (error) {
            console.error(error);
            setDeleteConfirmState(prev => ({ ...prev, isLoading: false }));
            toast.error('فشل في الحذف');
          }
        }
      );
    } else {
      triggerDelete(
        'تأكيد الحذف',
        `هل أنت متأكد من حذف الموظف ${employee?.name}؟`,
        async () => {
          setDeleteConfirmState(prev => ({ ...prev, isLoading: true }));
          try {
            console.log("Deleting employee:", id);
            await firebaseService.deleteDocument('employees', id);
            console.log("Deleted successfully: employee", id);
            setDeleteConfirmState(prev => ({ ...prev, isOpen: false, isLoading: false }));
            toast.success('تم حذف الموظف');
          } catch (error) {
            console.error(error);
            setDeleteConfirmState(prev => ({ ...prev, isLoading: false }));
            toast.error('فشل في الحذف');
          }
        }
      );
    }
  };

  const handleAddAttendance = async (data: Partial<EmployeeAttendance>) => {
    console.log("Saving record... (Attendance)");
    if (!appUser) return;
    const targetBranchId = currentBranchId || (branches.length > 0 ? branches[0].id : 'main');
    
    try {
      await firebaseService.addDocument('employeeAttendance', {
        ...data as EmployeeAttendance,
        branchId: targetBranchId as string | undefined,
        ownerId: appUser.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      console.log("Saved successfully (Attendance)");
      toast.success('تم تسجيل الحضور بنجاح');
    } catch (error) {
      console.error("Failed to save attendance:", error);
      toast.error('فشل في تسجيل الحضور');
    }
  };

  const handleUpdateAttendance = async (id: string, data: Partial<EmployeeAttendance>) => {
    try {
      await firebaseService.updateDocument('employeeAttendance', id, data);
      toast.success('تم تحديث سجل الحضور');
    } catch (error) {
      console.error(error);
      toast.error('فشل في التحديث');
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    triggerDelete(
      'حذف سجل الحضور',
      'هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذه العملية.',
      async () => {
        setDeleteConfirmState(prev => ({ ...prev, isLoading: true }));
        try {
          console.log("Deleting attendance:", id);
          await firebaseService.deleteDocument('employeeAttendance', id);
          console.log("Deleted successfully: attendance", id);
          setDeleteConfirmState(prev => ({ ...prev, isOpen: false, isLoading: false }));
          toast.success('تم حذف سجل الحضور');
        } catch (error) {
          console.error(error);
          setDeleteConfirmState(prev => ({ ...prev, isLoading: false }));
          toast.error('فشل في الحذف');
        }
      }
    );
  };

  const handleAddBranch = async (data: Partial<PharmacyBranch>) => {
    console.log("[App] Adding branch...");
    if (!appUser) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    try {
      const allBranches = branches;
      const nextNum = (allBranches.length > 0) 
        ? Math.max(...allBranches.map(b => {
             const num = parseInt(b.code?.split('-')[1] || '0');
             return isNaN(num) ? 0 : num;
          })) + 1 
        : 1;
      const code = `BR-${nextNum.toString().padStart(4, '0')}`;
      
      const newBranch: PharmacyBranch = {
        ...data as any,
        code,
        ownerId: appUser.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: data.activationCode ? 'active' : 'pending' 
      } as any;

      await firebaseService.addDocument('branches', newBranch);
      console.log("[App] Branch added successfully");
      toast.success(newBranch.status === 'active' ? 'تم تفعيل وربط الفرع الجديد بنجاح' : 'تم تسجيل الفرع. بانتظار التفعيل الإداري');
    } catch (error) {
      console.error("[App] Failed to add branch:", error);
      toast.error('فشل في عملية تسجيل الفرع');
    }
  };

  const handleUpdateBranch = async (id: string, data: Partial<PharmacyBranch>) => {
    try {
      await firebaseService.updateDocument('branches', id, data);
      toast.success('تم تحديث بيانات الفرع');
    } catch (error) {
      console.error(error);
      toast.error('فشل في التحديث');
    }
  };

  const handleArchiveBranch = async (id: string) => {
    try {
      await firebaseService.updateDocument('branches', id, { status: 'archived' });
      if (currentBranchId === id) setCurrentBranchId(null);
      toast.success('تم أرشفة الفرع');
    } catch (error) {
      console.error(error);
      toast.error('فشل في الأرشفة');
    }
  };

  const handleDeleteBranch = async (id: string) => {
    const branch = rawBranches.find(b => b.id === id);
    triggerDelete(
      'حذف فرع',
      `هل أنت متأكد من حذف فرع ${branch?.name || id}؟ سيتم حذف كافة البيانات المرتبطة به نهائياً.`,
      async () => {
        setDeleteConfirmState(prev => ({ ...prev, isLoading: true }));
        try {
          console.log("Deleting branch:", id);
          await firebaseService.deleteDocument('branches', id);
          if (currentBranchId === id) setCurrentBranchId(null);
          console.log("Deleted successfully: branch", id);
          setDeleteConfirmState(prev => ({ ...prev, isOpen: false, isLoading: false }));
          toast.success('تم حذف الفرع نهائياً');
        } catch (error) {
          console.error("Error deleting branch:", error);
          setDeleteConfirmState(prev => ({ ...prev, isLoading: false }));
          toast.error('فشل في الحذف');
        }
      }
    );
  };

  const handleAddInvoice = async (data: any) => {
    console.log("Saving operation (Invoice):", data);
    const targetBranchId = currentBranchId || (branches.length > 0 ? branches[0].id : 'main');

    const entityToInvoice = entities.find(e => e.id === data.accountId) || selectedEntity;
    if (!entityToInvoice?.id) return;
    
    const amount = Number(data.amount);
    const discount = Number(data.discount) || 0;
    const bonus = Number(data.bonus) || 0;
    const netAmount = amount - discount;
    const purchaseType = data.purchaseType;
    
    let imageUrl = '';
    const imageUrls: string[] = [];
    if (invImageFiles && invImageFiles.length > 0) {
      try {
        imageUrl = await fileToBase64(invImageFiles[0]);
        for (const file of invImageFiles) {
          const b64 = await fileToBase64(file);
          imageUrls.push(b64);
        }
      } catch (e) {
        console.error('Error converting images to base64', e);
      }
    }

    const newEntry: Omit<LedgerEntry, 'id'> = {
      accountId: entityToInvoice.id,
      accountName: entityToInvoice.name,
      accountType: entityToInvoice.type,
      date: data.date ? new Date(data.date) : new Date(),
      operationType: 'invoice',
      purchaseType: purchaseType,
      invoiceNumber: data.invoiceNumber as string,
      amount,
      discount,
      discountType: data.discountType,
      discountValue: data.discountPercentage,
      bonus,
      bonusArrivalDate: data.bonusArrivalDate,
      dueDate: data.dueDate,
      netAmount,
      paidAmount: purchaseType === 'cash' ? netAmount : 0,
      remainingAmount: purchaseType === 'cash' ? 0 : netAmount,
      paymentStatus: purchaseType === 'cash' ? 'paid' : 'pending',
      balanceAfterOperation: entityToInvoice.balance + netAmount,
      imageUrl,
      imageUrls,
      notes: data.notes as string,
      ownerId: appUser?.userId || 'demo-user',
      branchId: (targetBranchId as string) || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;
    
    // Add updatedAt
    (newEntry as any).updatedAt = new Date();

    // Unified Transaction entry
    const newTx: Omit<Transaction, 'id'> = {
      type: 'invoice',
      category: 'invoice',
      amount: netAmount,
      date: data.date ? new Date(data.date) : new Date(),
      description: `فاتورة شراء: ${entityToInvoice.name} - ${data.invoiceNumber || ''}`,
      entityId: entityToInvoice.id,
      entityName: entityToInvoice.name,
      invoiceNumber: data.invoiceNumber as string,
      branchId: targetBranchId as string | undefined,
      createdBy: appUser?.userId || 'demo-user',
      ownerId: appUser?.userId || 'demo-user',
      userId: appUser?.userId || 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;

    try {
      const addedId = await firebaseService.addDocument('ledgerEntries', newEntry as LedgerEntry);
      await firebaseService.addDocument('transactions', newTx as Transaction);
      console.log("Operations after save:", transactions);

      await firebaseService.updateDocument('entities', entityToInvoice.id, {
        balance: entityToInvoice.balance + netAmount,
        totalInvoices: entityToInvoice.totalInvoices + 1,
        updatedAt: new Date()
      } as any);

      if (newEntry.dueDate && addedId) {
        await firebaseService.addDocument('deadlines', {
          accountId: entityToInvoice.id,
          accountName: entityToInvoice.name,
          invoiceId: addedId, 
          invoiceNumber: newEntry.invoiceNumber || '',
          amount: newEntry.amount,
          requiredPayment: newEntry.netAmount,
          dueDate: newEntry.dueDate,
          status: 'pending',
          ownerId: user?.uid || 'guest',
          branchId: targetBranchId as string | undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any);
      }

      setIsAddInvoiceOpen(false);
      setInvAmount('');
      setInvDiscount('0');
      setInvBonus('0');
      setInvImageFiles([]);
      toast.success('تم إضافة الفاتورة بنجاح');
    } catch (err) {
      console.error("Failed to save invoice:", err);
      // Fallback
      try {
        const localOps = JSON.parse(localStorage.getItem('pharma-offline-ops') || '[]');
        localOps.push({ ...newTx, id: 'local-' + Date.now(), isOffline: true });
        localStorage.setItem('pharma-offline-ops', JSON.stringify(localOps));
        toast.info('تم الحفظ محلياً لعدم توفر الاتصال');
        setIsAddInvoiceOpen(false);
      } catch (lsErr) {
        toast.error('حدث خطأ أثناء إضافة الفاتورة');
      }
    }
  };

  const handleAddDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[App] Adding deadline...");
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const entityId = formData.get('entityId') as string;
    const targetEntity = entities.find(e => e.id === entityId);
    
    if (!targetEntity) {
      toast.error('لم يتم العثور على المورد');
      return;
    }

    const targetBranchId = currentBranchId || (branches.length > 0 ? branches[0].id : undefined);

    const newDeadline: Omit<Deadline, 'id'> = {
      accountId: entityId,
      accountName: targetEntity.name,
      invoiceId: formData.get('invoiceId') as string || '',
      invoiceNumber: formData.get('invoiceNumber') as string,
      amount: Number(formData.get('amount')),
      requiredPayment: Number(formData.get('requiredPayment')),
      dueDate: new Date(formData.get('dueDate') as string),
      notes: formData.get('notes') as string,
      status: 'pending',
      ownerId: appUser?.userId || 'demo-user',
      branchId: (targetBranchId as string) || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;
    
    try {
      await firebaseService.addDocument('deadlines', newDeadline as Deadline);
      console.log("[App] Deadline added successfully");
      setIsAddDeadlineOpen(false);
      toast.success('تم إضافة موعد السداد بنجاح');
    } catch (err) {
      console.error("[App] Failed to add deadline:", err);
      toast.error('حدث خطأ أثناء إضافة موعد السداد');
    }
  };

  const handleAddBonus = async (data: any) => {
    console.log("[App] Adding bonus...");
    const bonusEntity = entities.find(e => e.id === data.entityId) || viewingEntityDetail || selectedEntity;
    if (!bonusEntity?.id) {
      toast.error('يرجى اختيار المورد أولاً');
      return;
    }
    
    const targetBranchId = currentBranchId || (branches.length > 0 ? branches[0].id : 'main');

    const newBonus: Omit<Bonus, 'id'> = {
      entityId: bonusEntity.id,
      entityName: bonusEntity.name,
      description: data.description as string,
      amount: Number(data.amount) || 0,
      dueDate: data.dueDate,
      status: data.status,
      notes: data.notes as string,
      ownerId: appUser?.userId || 'demo-user',
      branchId: (targetBranchId as string) || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;
    
    try {
      await firebaseService.addDocument('bonuses', newBonus as Bonus);
      console.log("[App] Bonus added successfully");
      setIsAddBonusOpen(false);
      toast.success('تم إضافة البونص بنجاح');
    } catch (err) {
      console.error("[App] Failed to add bonus:", err);
      toast.error('حدث خطأ أثناء إضافة البونص');
    }
  };

  const handlePayAmountChange = (val: number) => {
    setPayAmount(val);
    if (payDiscountType === 'percentage') {
      const newDiscount = (val * payDiscountPercentage) / 100;
      setPayDiscount(newDiscount);
    }
  };

  const handlePayDiscountChange = (val: number) => {
    setPayDiscount(val);
    if (payAmount > 0) {
      setPayDiscountPercentage((val / payAmount) * 100);
    }
  };

  const handlePayPercentageChange = (val: number) => {
    setPayDiscountPercentage(val);
    const newDiscount = (payAmount * val) / 100;
    setPayDiscount(newDiscount);
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving record... (Payment)");
    if (!selectedEntity?.id) return;
    
    const targetBranchId = currentBranchId || (branches.length > 0 ? branches[0].id : 'main');

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const amount = payAmount;
    const discount = payDiscount;
    const refund = Number(formData.get('refund')) || 0;
    const totalEffect = amount + discount - refund;
    
    let receiptImageUrl = '';
    if (payImageFile) {
      try {
        receiptImageUrl = await fileToBase64(payImageFile);
      } catch (e) {
        console.error('Error converting receipt image to base64', e);
      }
    }

    const newEntry: Omit<LedgerEntry, 'id'> = {
      accountId: selectedEntity.id,
      accountName: selectedEntity.name,
      accountType: selectedEntity.type,
      date: new Date(formData.get('date') as string),
      operationType: 'payment',
      amount,
      discount,
      discountType: payDiscountType,
      discountValue: payDiscountPercentage,
      refundAmount: refund,
      netAmount: amount,
      linkedInvoiceNumber: formData.get('linkedInvoice') as string,
      linkedInvoiceId: viewingInvoice?.id,
      balanceAfterOperation: selectedEntity.balance - totalEffect,
      receiptImageUrl,
      notes: formData.get('notes') as string,
      ownerId: appUser?.userId || 'demo-user',
      branchId: (targetBranchId as string) || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;
    
    // Unified Transaction entry
    const newTx: Omit<Transaction, 'id'> = {
      type: 'payment',
      category: 'payment',
      amount: totalEffect,
      date: new Date(formData.get('date') as string),
      description: `تسديد دفعى: ${selectedEntity.name} - ${formData.get('linkedInvoice') || ''}`,
      entityId: selectedEntity.id,
      entityName: selectedEntity.name,
      invoiceNumber: formData.get('linkedInvoice') as string,
      branchId: targetBranchId as string | undefined,
      createdBy: appUser?.userId || 'demo-user',
      ownerId: appUser?.userId || 'demo-user',
      userId: appUser?.userId || 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;

    try {
      await firebaseService.addDocument('ledgerEntries', newEntry as LedgerEntry);
      await firebaseService.addDocument('transactions', newTx as Transaction);
      console.log("Operations after save:", transactions);
      
      // Update linked invoice status if applicable
      if (viewingInvoice?.id) {
        const currentPaid = (viewingInvoice.paidAmount || 0) + amount + discount;
        const currentRemaining = Math.max(0, viewingInvoice.netAmount - currentPaid);
        let status: 'paid' | 'partial' | 'pending' | 'overdue' = 'partial';
        if (currentRemaining <= 0) status = 'paid';
        else if (currentPaid === 0) status = 'pending';
        // Check if it's already overdue (simplified check for now)
        if (status !== 'paid' && viewingInvoice.dueDate && new Date(viewingInvoice.dueDate) < new Date()) {
          status = 'overdue';
        }

        await firebaseService.updateDocument('ledgerEntries', viewingInvoice.id, {
          paidAmount: currentPaid,
          remainingAmount: currentRemaining,
          paymentStatus: status,
          updatedAt: new Date()
        } as any);
      }

      await firebaseService.updateDocument('entities', selectedEntity.id, {
        balance: selectedEntity.balance - totalEffect,
        totalPayments: selectedEntity.totalPayments + 1,
        updatedAt: new Date()
      } as any);

      setIsAddPaymentOpen(false);
      setViewingInvoice(null);
      setPaymentMode('normal');
      setPayAmount(0);
      setPayDiscount(0);
      setPayDiscountPercentage(0);
      setPayDiscountType('fixed');
      setPayRefund('0');
      setPayImageFile(null);
      toast.success('تم إضافة الدفعة بنجاح');
    } catch (err) {
      console.error("Failed to save payment:", err);
      // Fallback
      try {
        const localOps = JSON.parse(localStorage.getItem('pharma-offline-ops') || '[]');
        localOps.push({ ...newTx, id: 'local-' + Date.now(), isOffline: true });
        localStorage.setItem('pharma-offline-ops', JSON.stringify(localOps));
        toast.info('تم الحفظ محلياً لعدم توفر الاتصال');
        setIsAddPaymentOpen(false);
      } catch (lsErr) {
        toast.error('حدث خطأ أثناء إضافة الدفعة');
      }
    }
  };

  const handleEditInvoice = async (data: any) => {
    console.log("Updating record... (Invoice)");
    if (!viewingInvoice?.id || !selectedEntity?.id) return;
    
    const amount = Number(data.amount);
    const discount = Number(data.discount) || 0;
    const netAmount = amount - discount;
    
    const oldNetAmount = viewingInvoice.netAmount || (viewingInvoice.amount - (viewingInvoice.discount || 0));
    const balanceDiff = netAmount - oldNetAmount;

    const updatedInvoice: LedgerEntry = {
      ...viewingInvoice,
      date: data.date instanceof Date ? data.date : new Date(data.date),
      invoiceNumber: data.invoiceNumber as string,
      amount,
      discount,
      discountType: data.discountType,
      discountValue: data.discountPercentage,
      netAmount,
      bonus: Number(data.bonus) || 0,
      bonusArrivalDate: data.bonusArrivalDate ? (data.bonusArrivalDate instanceof Date ? data.bonusArrivalDate : new Date(data.bonusArrivalDate)) : undefined,
      dueDate: data.dueDate ? (data.dueDate instanceof Date ? data.dueDate : new Date(data.dueDate)) : undefined,
      purchaseType: data.purchaseType as 'cash' | 'credit',
      notes: data.notes as string,
      updatedAt: new Date()
    } as any;

    // Correctly update paid and remaining based on edits
    updatedInvoice.remainingAmount = Math.max(0, netAmount - (updatedInvoice.paidAmount || 0));
    
    if (updatedInvoice.remainingAmount <= 0) {
      updatedInvoice.paymentStatus = 'paid';
      updatedInvoice.remainingAmount = 0;
    } else if (updatedInvoice.paidAmount && updatedInvoice.paidAmount > 0) {
      updatedInvoice.paymentStatus = 'partial';
    } else {
      updatedInvoice.paymentStatus = 'pending';
    }
    
    // Check overdue
    if (updatedInvoice.paymentStatus !== 'paid' && updatedInvoice.dueDate && new Date(updatedInvoice.dueDate) < new Date()) {
      updatedInvoice.paymentStatus = 'overdue';
    }

    try {
      await firebaseService.updateDocument('ledgerEntries', viewingInvoice.id, updatedInvoice as any);
      await firebaseService.updateDocument('entities', selectedEntity.id, {
        balance: selectedEntity.balance + balanceDiff,
        updatedAt: new Date()
      } as any);
      
      console.log("Updated successfully (Invoice)");
      setIsEditInvoiceOpen(false);
      setViewingInvoice(null);
      toast.success('تم تحديث الفاتورة والميزانية بنجاح');
    } catch (err) {
      console.error("Failed to update invoice:", err);
      toast.error('حدث خطأ أثناء تحديث الفاتورة');
    }
  };

  const handleDeleteInvoice = async (invoiceToDel?: LedgerEntry) => {
    const inv = invoiceToDel || viewingInvoice;
    if (!inv?.id || !selectedEntity?.id) return;
    
    const isInvoice = inv.operationType === 'invoice';
    const amountLabel = isInvoice ? inv.netAmount : inv.paidAmount;

    triggerDelete(
      `حذف ${isInvoice ? 'الفاتورة' : 'العملية'}`,
      `هل أنت متأكد من حذف ${isInvoice ? 'الفاتورة رقم ' + inv.invoiceNumber : 'هذا الوصل'}؟ بمبلغ ${formatIQD(amountLabel)}. سيتم تعديل رصيد المورد تلقائياً.`,
      async () => {
        setDeleteConfirmState(prev => ({ ...prev, isLoading: true }));
        try {
          console.log("Deleting ledger entry:", inv.id);
          const netAmount = inv.netAmount;
          const paidAmount = inv.paidAmount;
          const remaining = inv.remainingAmount;

          await firebaseService.deleteDocument('ledgerEntries', inv.id!);
          
          // Also delete associated images from storage
          if (inv.imageUrls && Array.isArray(inv.imageUrls)) {
            for (const url of inv.imageUrls) {
              if (url.startsWith('http')) {
                try {
                  await firebaseService.deleteImage(url);
                } catch (e) {
                  console.warn('Failed to delete image from storage:', url, e);
                }
              }
            }
          }
          if (inv.imageUrl && typeof inv.imageUrl === 'string' && inv.imageUrl.startsWith('http')) {
            try {
              await firebaseService.deleteImage(inv.imageUrl);
            } catch (e) {
              console.warn('Failed to delete single image from storage:', inv.imageUrl, e);
            }
          }
          
          // Update entity balance logic
          // If invoice deleted: balance decreases by remaining amount (debt removed)
          // If payment deleted: balance increases by paid amount (payment reversed)
          const balanceAdjustment = isInvoice ? -remaining : paidAmount;
          
          await firebaseService.updateDocument('entities', selectedEntity.id!, {
            balance: (selectedEntity.balance || 0) + balanceAdjustment,
            totalInvoices: isInvoice ? Math.max(0, (selectedEntity.totalInvoices || 0) - 1) : (selectedEntity.totalInvoices || 0)
          });
          
          // Add activity
          await firebaseService.addDocument('entityActivities', {
            entityId: selectedEntity.id!,
            type: isInvoice ? 'delete_invoice' : 'delete_payment',
            action: `حذف ${isInvoice ? 'فاتورة' : 'وصل تسديد'}`,
            details: `المبلغ: ${formatIQD(isInvoice ? netAmount : paidAmount)}`,
            performedBy: appUser?.username || 'user',
            createdAt: new Date(),
            ownerId: appUser?.userId || 'demo-user',
            branchId: currentBranchId || undefined
          });

          console.log("Deleted successfully: ledgerEntry", inv.id);
          setDeleteConfirmState(prev => ({ ...prev, isOpen: false, isLoading: false }));
          setIsDeleteInvoiceConfirmOpen(false);
          setViewingInvoice(null);
          toast.success('تم الحذف وتحديث الرصيد بنجاح');
        } catch (err) {
          console.error("Error deleting ledger entry:", err);
          setDeleteConfirmState(prev => ({ ...prev, isLoading: false }));
          toast.error('حدث خطأ أثناء الحذف');
        }
      }
    );
  };

  const handleDeleteTransaction = async (tx: Transaction) => {
    const isExpense = tx.type === 'expense';
    const label = tx.type === 'income' ? (tx.customerName || tx.description || 'إيراد') : (tx.description || tx.category || 'مصروف');
    
    console.log(`[DeleteAudit] Attempting to delete ${isExpense ? 'expense' : 'income'}:`, tx.id);
    
    triggerDelete(
      `حذف ${isExpense ? 'المصروف' : 'الإيراد'}`,
      `هل أنت متأكد من حذف العملية: ${label}؟ بمبلغ ${formatIQD(tx.amount)}`,
      async () => {
        setDeleteConfirmState(prev => ({ ...prev, isLoading: true }));
        try {
          console.log(`[DeleteAudit] Confirming deletion of ID: ${tx.id}`);
          if (!tx.id) throw new Error("ID السجل غير موجود");
          
          await firebaseService.deleteDocument('transactions', tx.id);
          
          console.log(`[DeleteAudit] Deleted successfully: ${tx.id}`);
          setDeleteConfirmState(prev => ({ ...prev, isOpen: false, isLoading: false }));
          setIsEditTransactionOpen(false);
          toast.success(`تم حذف ${isExpense ? 'المصروف' : 'الإيراد'} بنجاح`);
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'خطأ غير معروف';
          console.error(`[DeleteAudit] Delete failed for ID ${tx.id}:`, errMsg);
          setDeleteConfirmState(prev => ({ ...prev, isLoading: false }));
          toast.error(`فشل حذف ${isExpense ? 'المصروف' : 'الإيراد'}: ${errMsg}`);
        }
      }
    );
  };

  const handleDeleteHistoricalRecord = async (id: string) => {
    const record = rawHistoricalRecords.find(r => r.id === id);
    triggerDelete(
      'حذف سجل تاريخي',
      `هل أنت متأكد من حذف السجل التاريخي: ${record?.title || id}؟ لا يمكن التراجع.`,
      async () => {
        setDeleteConfirmState(prev => ({ ...prev, isLoading: true }));
        try {
          console.log("Deleting historical record:", id);
          await firebaseService.deleteDocument('historicalRecords', id);
          console.log("Deleted successfully: historicalRecord", id);
          setDeleteConfirmState(prev => ({ ...prev, isOpen: false, isLoading: false }));
          toast.success('تم حذف السجل التاريخي بنجاح');
        } catch (err) {
          console.error("Error deleting historical record:", err);
          setDeleteConfirmState(prev => ({ ...prev, isLoading: false }));
          toast.error('حدث خطأ أثناء الحذف');
        }
      }
    );
  };

  const handleDeleteBonus = async (id: string | undefined) => {
    if (!id) return;
    const b = bonuses.find(item => item.id === id);
    triggerDelete(
      'حذف البونص',
      `هل أنت متأكد من حذف البونص بقيمة ${formatIQD(b?.amount || 0)}؟ لا يمكن التراجع.`,
      async () => {
        setDeleteConfirmState(prev => ({ ...prev, isLoading: true }));
        try {
          console.log("Deleting bonus:", id);
          await firebaseService.deleteDocument('bonuses', id);
          console.log("Deleted successfully: bonus", id);
          setDeleteConfirmState(prev => ({ ...prev, isOpen: false, isLoading: false }));
          toast.success('تم حذف البونص بنجاح');
        } catch (err) {
          console.error("Error deleting bonus:", err);
          setDeleteConfirmState(prev => ({ ...prev, isLoading: false }));
          toast.error('حدث خطأ أثناء الحذف');
        }
      }
    );
  };

  const handleDeleteAttachment = async (ledgerId: string, url: string) => {
    const entry = ledgerEntries.find(e => e.id === ledgerId);
    if (!entry) return;

    triggerDelete(
      'حذف المرفق',
      'هل أنت متأكد من حذف هذه الصورة؟ سيتم حذفها من سجلات النظام نهائياً.',
      async () => {
        setDeleteConfirmState(prev => ({ ...prev, isLoading: true }));
        try {
          console.log("Deleting attachment:", url, "from entry:", ledgerId);
          let updateData: any = {};
          if (entry.imageUrl === url) updateData.imageUrl = null;
          if (entry.receiptImageUrl === url) updateData.receiptImageUrl = null;
          if (entry.imageUrls?.includes(url)) {
            updateData.imageUrls = entry.imageUrls.filter(u => u !== url);
          }
          
          await firebaseService.updateDocument('ledgerEntries', ledgerId, updateData);
          console.log("Deleted successfully: attachment from", ledgerId);
          setDeleteConfirmState(prev => ({ ...prev, isOpen: false, isLoading: false }));
          toast.success('تم حذف الصورة بنجاح');
        } catch (err) {
          console.error("Error deleting attachment:", err);
          setDeleteConfirmState(prev => ({ ...prev, isLoading: false }));
          toast.error('فشل في حذف الصورة');
        }
      }
    );
  };

  const handleAddRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving record... (Refund)");
    if (!viewingInvoice?.id || !selectedEntity?.id) return;
    
    const targetBranchId = currentBranchId || (branches.length > 0 ? branches[0].id : undefined);
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const refundAmount = Number(formData.get('refundAmount'));
    const reason = formData.get('reason') as string;
    const date = new Date(formData.get('date') as string);
    
    const newRefundEntry: Omit<LedgerEntry, 'id'> = {
      accountId: selectedEntity.id,
      accountName: selectedEntity.name,
      accountType: selectedEntity.type,
      date,
      operationType: 'refund',
      amount: 0,
      discount: 0,
      refundAmount: refundAmount,
      netAmount: 0,
      linkedInvoiceId: viewingInvoice.id,
      linkedInvoiceNumber: viewingInvoice.invoiceNumber,
      notes: reason,
      balanceAfterOperation: selectedEntity.balance - refundAmount,
      ownerId: user?.uid || 'guest',
      branchId: (targetBranchId as string) || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;

    try {
      await firebaseService.addDocument('ledgerEntries', newRefundEntry as LedgerEntry);
      console.log("Saved successfully (Refund)");
      
      const newRefundTotal = (viewingInvoice.refundAmount || 0) + refundAmount;
      const newPaid = (viewingInvoice.paidAmount || 0) + refundAmount; 
      
      const currentPaid = (viewingInvoice.paidAmount || 0) + refundAmount;
      const currentRemaining = Math.max(0, viewingInvoice.netAmount - currentPaid);
      let status: 'paid' | 'partial' | 'pending' | 'overdue' = 'partial';
      if (currentRemaining <= 0) status = 'paid';
      else if (currentPaid === 0) status = 'pending';
      
      if (status !== 'paid' && viewingInvoice.dueDate && new Date(viewingInvoice.dueDate) < new Date()) {
        status = 'overdue';
      }

      await firebaseService.updateDocument('ledgerEntries', viewingInvoice.id, {
        paidAmount: currentPaid,
        remainingAmount: currentRemaining,
        paymentStatus: status,
        refundAmount: newRefundTotal,
        updatedAt: new Date()
      } as any);
      
      await firebaseService.updateDocument('entities', selectedEntity.id, {
        balance: selectedEntity.balance - refundAmount,
        updatedAt: new Date()
      } as any);
      
      setIsRefundInvoiceOpen(false);
      setViewingInvoice(null);
      toast.success('تم تسجيل المرتجع بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء تسجيل المرتجع');
    }
  };

  const handleAddRevenue = async (data: any) => {
    console.log("Saving operation:", data);
    const targetBranchId = currentBranchId || (branches.length > 0 ? branches[0].id : 'main');

    let imageUrl = '';
    const imageUrls: string[] = [];
    if (revenueImageFiles && revenueImageFiles.length > 0) {
      try {
        for (const file of revenueImageFiles) {
          const b64 = await fileToBase64(file);
          imageUrls.push(b64);
        }
        imageUrl = imageUrls[0];
      } catch (e) {
        console.error('Error converting images to base64', e);
      }
    }

    const newTx: Omit<Transaction, 'id'> = {
      ...data,
      type: 'revenue',
      category: 'revenue',
      description: `${data.incomeTypeCustom || 'مبيعات'} - ${data.incomeType === 'cash' ? 'نقدي' : 'دين'}`,
      amount: Number(data.saleAmount || data.amount || 0),
      saleAmount: Number(data.saleAmount || data.amount || 0),
      profitAmount: Number(data.profitAmount || data.netProfit || 0),
      branchId: targetBranchId as string | undefined,
      createdBy: appUser?.userId || 'demo-user',
      ownerId: appUser?.userId || 'demo-user',
      userId: appUser?.userId || 'demo-user',
      imageUrl,
      imageUrls,
      createdAt: new Date(),
      updatedAt: new Date(),
      date: data.date ? new Date(data.date) : new Date()
    } as any;
    
    try {
      const savedDoc = await firebaseService.addDocument('transactions', newTx as Transaction);
      console.log("Revenue saved:", { ...newTx, id: (savedDoc as any).id });
      console.log("Revenue records loaded:", transactions);
      setIsAddRevenueOpen(false);
      setRevenueImageFiles([]);
      
      if (typeof setSaleAmount === 'function') setSaleAmount('');
      
      toast.success('تم إضافة الوارد بنجاح');
    } catch (err) {
      console.error("[App] Failed to add revenue:", err);
      // Fallback to localStorage
      try {
        const localOps = JSON.parse(localStorage.getItem('pharma-offline-ops') || '[]');
        localOps.push({ ...newTx, id: 'local-' + Date.now(), isOffline: true });
        localStorage.setItem('pharma-offline-ops', JSON.stringify(localOps));
        toast.info('تم الحفظ محلياً لعدم توفر الاتصال');
        setIsAddRevenueOpen(false);
      } catch (lsErr) {
        toast.error('حدث خطأ أثناء إضافة الوارد');
      }
    }
  };

  const getExpenseStatement = (tx: Transaction) => {
    if (!tx) return "غير معروف";
    if (tx.type !== 'expense') return tx.customerName || (tx as any).accountName || tx.description || "عملية مالية";

    const categoryLabels: Record<string, string> = {
      'rent_pharmacy': 'إيجار صيدلية',
      'rent': 'إيجار',
      'electricity': 'كهرباء / مولد',
      'rent_license': 'إيجار إجازة',
      'internet': 'إنترنت واشتراكات',
      'service_worker': 'عامل خدمة',
      'salaries': 'رواتب ومكافآت',
      'transport': 'نقل وتوصيل أدوية',
      'marketing': 'تسويق وإعلان',
      'repairs': 'صيانة معدات أو مكان',
      'materials': 'مواد تشغيلية',
      'damaged_expired': 'تلف واكسباير',
      'other': 'مصاريف أخرى'
    };

    const category = tx.category ? (categoryLabels[tx.category] || tx.category) : "مصروف عام";
    const statement = tx.statement || category || "مصروف عام";
    
    const partyDisplay = tx.partyName || tx.entityName || "";
    if (partyDisplay) return `${statement} - ${partyDisplay}`;
    return statement;
  };

  const handleAddExpense = async (data: any) => {
    console.log("Saving expense operation:", data);
    const targetBranchId = currentBranchId || (branches.length > 0 ? branches[0].id : 'main');

    let detailedDescription = data.description;
    if (data.category === 'rent' || data.category === 'rent_pharmacy') {
      detailedDescription = `إيجار (${data.rentType || 'عام'}) - ${data.period || ''}: ${data.description || ''}`;
    } else if (data.category === 'salaries') {
      detailedDescription = `راتب الموظف ${data.employeeName || ''} (${data.jobTitle || ''}) - ${data.period || ''} - ${data.salaryPaymentType === 'full' ? 'كامل' : data.salaryPaymentType === 'advance' ? 'سلفة' : 'مكافأة'}`;
    } else if (data.category === 'electricity') {
      detailedDescription = `${data.serviceType === 'national' ? 'كهرباء وطنية' : data.serviceType === 'generator' ? 'مولدة' : 'اشتراك'} - ${data.reading || ''}: ${data.description || ''}`;
    }

    // Auto statement from category if empty as per requirements
    const categoryLabels: Record<string, string> = {
      'rent_pharmacy': 'إيجار صيدلية',
      'rent': 'إيجار',
      'electricity': 'كهرباء / مولد',
      'rent_license': 'إيجار إجازة',
      'internet': 'إنترنت واشتراكات',
      'service_worker': 'عامل خدمة',
      'salaries': 'رواتب ومكافآت',
      'transport': 'نقل وتوصيل أدوية',
      'marketing': 'تسويق وإعلان',
      'repairs': 'صيانة معدات أو مكان',
      'materials': 'مواد تشغيلية',
      'damaged_expired': 'تلف واكسباير',
      'other': 'مصاريف أخرى'
    };
    
    const categoryLabel = data.category ? (categoryLabels[data.category] || data.category) : "مصروف عام";

    const newTx: Omit<Transaction, 'id'> = {
      type: 'expense',
      category: data.category as string,
      amount: Number(data.amount),
      date: data.date ? new Date(data.date) : new Date(),
      description: detailedDescription || categoryLabel,
      statement: data.statement || categoryLabel,
      partyName: data.partyName || "",
      notes: data.notes as string,
      branchId: targetBranchId as string | undefined,
      createdBy: appUser?.userId || 'demo-user',
      ownerId: appUser?.userId || 'demo-user',
      userId: appUser?.userId || 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;
    
    try {
      await firebaseService.addDocument('transactions', newTx as Transaction);
      setIsAddExpenseOpen(false);
      toast.success('تم إضافة المصروف بنجاح');
    } catch (err) {
      console.error("[App] Failed to add expense:", err);
      try {
        const localOps = JSON.parse(localStorage.getItem('pharma-offline-ops') || '[]');
        localOps.push({ ...newTx, id: 'local-' + Date.now(), isOffline: true });
        localStorage.setItem('pharma-offline-ops', JSON.stringify(localOps));
        toast.info('تم الحفظ محلياً لعدم توفر الاتصال');
        setIsAddExpenseOpen(false);
      } catch (lsErr) {
        toast.error('حدث خطأ أثناء إضافة المصروف');
      }
    }
  };

  const handleAddLoss = async (data: any) => {
    try {
      // 1. Add to Firestore
      await firebaseService.addDocument('expiredDamagedLosses', {
        ...data,
        ownerId: appUser?.userId || 'demo-user',
        branchId: currentBranchId || 'main'
      });

      // 2. If linked to invoice, update invoice remaining amount
      if (data.invoiceId && data.invoiceId !== 'none') {
         const invoice = (allLedgerEntries || []).find(i => i.id === data.invoiceId);
         if (invoice) {
            const currentRemaining = Number(invoice.remainingAmount || 0);
            const lossAmount = Number(data.totalLoss || 0);
            const newRemaining = Math.max(0, currentRemaining - lossAmount);
            
            await firebaseService.updateDocument('ledgerEntries', data.invoiceId, {
              remainingAmount: newRemaining,
              notes: `${invoice.notes || ''}\n[خسارة تالف/اكسباير مرتبطة: -${formatIQD(lossAmount)}]`,
              updatedAt: new Date()
            } as any);

            // Also update entity balance
            const entity = entities.find(e => e.id === invoice.accountId);
            if (entity) {
               const currentBalance = Number(entity.balance || 0);
               await firebaseService.updateDocument('entities', entity.id!, {
                 balance: currentBalance - lossAmount,
                 updatedAt: new Date()
               } as any);
            }
         }
      }

      setIsAddLossOpen(false);
      toast.success('تم تسجيل الخسارة وتحديث الحسابات بنجاح');
    } catch (err) {
      console.error(err);
      toast.error('فشل في تسجيل الخسارة');
    }
  };

  const handleUpdateLoss = async (data: Partial<ExpiredDamagedLoss>) => {
    if (!selectedLoss?.id) return;
    try {
      await firebaseService.updateDocument('expiredDamagedLosses', selectedLoss.id, {
        ...data,
        updatedAt: new Date()
      });
      setIsEditLossOpen(false);
      setSelectedLoss(null);
      toast.success('تم تحديث سجل الخسارة بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء تحديث السجل');
    }
  };

  const handleUpdateBonus = async (data: Partial<Bonus>) => {
    if (!editingBonus?.id) return;
    try {
      await firebaseService.updateDocument('bonuses', editingBonus.id, {
        ...data,
        updatedAt: new Date()
      });
      setIsEditBonusOpen(false);
      setEditingBonus(null);
      toast.success('تم تحديث سجل البونص بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء تحديث السجل');
    }
  };

  const handleGenericDelete = async () => {
    if (!deletingItem) return;
    try {
      await firebaseService.deleteDocument(deletingItem.collection as any, deletingItem.id);
      setIsDeleteConfirmOpen(false);
      setDeletingItem(null);
      toast.success('تم الحذف بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleUpdateTransaction = async (data: any) => {
    console.log("Updating record... (Transaction)");
    if (!selectedTransaction?.id) return;
    
    let imageUrl = selectedTransaction.imageUrl || '';
    const imageUrls: string[] = selectedTransaction.imageUrls || (imageUrl ? [imageUrl] : []);
    
    if (revenueImageFiles && revenueImageFiles.length > 0) {
      try {
        // Convert all new images to base64
        for (const file of revenueImageFiles) {
          const b64 = await fileToBase64(file);
          imageUrls.push(b64);
        }
        // Use first available image for backward compatibility imageUrl field
        imageUrl = imageUrls[0];
      } catch (e) {
        console.error('Error converting images to base64', e);
      }
    }

    const updatedTx = {
      ...selectedTransaction,
      ...data,
      imageUrl,
      imageUrls,
      updatedAt: new Date()
    };
    
    try {
      await firebaseService.updateDocument('transactions', selectedTransaction.id, updatedTx);
      setIsEditTransactionOpen(false);
      setRevenueImageFiles([]);
      toast.success('تم تحديث البيانات بنجاح');
    } catch (err) {
      console.error("Failed to update transaction:", err);
      toast.error('حدث خطأ أثناء التحديث');
    }
  };

  const handleDeleteLoss = async (loss: ExpiredDamagedLoss) => {
    triggerDelete(
      'حذف سجل التالف/المنتهي',
      `هل أنت متأكد من حذف السجل الخاص بـ: ${loss.itemName}؟ لا يمكن التراجع عن هذه العملية.`,
      async () => {
        setDeleteConfirmState(prev => ({ ...prev, isLoading: true }));
        try {
          console.log("Deleting loss record:", loss.id);
          await firebaseService.deleteDocument('expiredDamagedLosses', loss.id!);
          console.log("Deleted successfully: loss record", loss.id);
          setDeleteConfirmState(prev => ({ ...prev, isOpen: false, isLoading: false }));
          toast.success('تم حذف السجل بنجاح');
        } catch (err) {
          console.error("Failed to delete loss:", err);
          setDeleteConfirmState(prev => ({ ...prev, isLoading: false }));
          toast.error('حدث خطأ أثناء الحذف');
        }
      }
    );
  };

  // Auth UI logic handled by onAuthStateChanged

  const handleDeleteMedicineRequest = async (id: string) => {
    triggerDelete(
      'حذف طلب توفير دواء',
      'هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذه العملية.',
      async () => {
        setDeleteConfirmState(prev => ({ ...prev, isLoading: true }));
        try {
          console.log("Deleting medicine request:", id);
          await firebaseService.deleteDocument('medicineRequests', id);
          console.log("Deleted successfully: medicineRequest", id);
          setDeleteConfirmState(prev => ({ ...prev, isOpen: false, isLoading: false }));
          toast.success('تم حذف الطلب بنجاح');
        } catch (err) {
          console.error("Error deleting medicine request:", err);
          setDeleteConfirmState(prev => ({ ...prev, isLoading: false }));
          toast.error('حدث خطأ أثناء الحذف');
        }
      }
    );
  };

  const handleDeleteRequestImage = async (id: string) => {
    triggerDelete(
      'حذف صورة الطلب',
      'هل أنت متأكد من حذف الصورة المرفقة؟',
      async () => {
        setDeleteConfirmState(prev => ({ ...prev, isLoading: true }));
        try {
          console.log("Deleting medicine request image:", id);
          await firebaseService.updateDocument('medicineRequests', id, { imageUrl: null });
          console.log("Deleted successfully: image from medicineRequest", id);
          setDeleteConfirmState(prev => ({ ...prev, isOpen: false, isLoading: false }));
          toast.success('تم حذف الصورة');
        } catch (err) {
          console.error("Error deleting image:", err);
          setDeleteConfirmState(prev => ({ ...prev, isLoading: false }));
          toast.error('فشل في الحدث');
        }
      }
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authPassword !== authConfirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }
    
    try {
      // Use fake email if user doesn't provide one for initial setup
      const email = authUsername.includes('@') ? authUsername : `${authUsername}@pharma.local`;
      await createUserWithEmailAndPassword(auth, email, authPassword);
      toast.success('تم إنشاء الحساب بنجاح، جاري الدخول...');
    } catch (error: any) {
      toast.error(`خطأ في التسجيل: ${error.message}`);
    }
  };

  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authAccessCode === '123456') {
      setIsAppAuthenticated(true);
      localStorage.setItem('pharma-is-authenticated', 'true');
      setAuthStep('authenticated');
      toast.success('تم الدخول بنجاح (وضع العرض التجريبي)');
    } else {
      toast.error('رمز الدخول غير صحيح، يرجى المحاولة مرة أخرى');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const email = authUsername.includes('@') ? authUsername : `${authUsername}@pharma.local`;
      await signInWithEmailAndPassword(auth, email, authPassword);
      toast.success('مرحباً بك مجدداً');
    } catch (error: any) {
      toast.error('خطأ في الدخول: تأكد من اسم المستخدم وكلمة المرور');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('pharma-is-authenticated');
    setIsAppAuthenticated(false);
    setAuthStep('access-code');
    setAuthAccessCode('');
    toast.success('تم تسجيل الخروج بنجاح');
  };

  if (googleAuthLoading || authStatusLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-background" dir="rtl">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <Package className="h-12 w-12 text-primary relative z-10" />
        </motion.div>
        <div className="flex flex-col items-center">
          <p className="text-foreground font-black text-lg">صيدليتي</p>
          <p className="text-muted-foreground font-bold text-sm">جاري تحميل بياناتك بأمان...</p>
        </div>
      </div>
    );
  }

  if (!isAppAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6" dir="rtl">
        <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-8 space-y-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16" />
          <div className="text-center space-y-2 relative z-10">
            <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-black text-foreground">صيدليتي</h1>
            <p className="text-muted-foreground text-sm">نظام الحسابات الذكية للصيدليات</p>
          </div>

          {authStep === 'access-code' && (
            <form onSubmit={handleAccessCodeSubmit} className="space-y-4 relative z-10">
              <div className="space-y-2">
                <Label className="text-muted-foreground">رمز الدخول (تجريبي)</Label>
                <div className="relative">
                  <Hash className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    className="bg-muted border-border text-foreground h-12 rounded-xl pr-10 text-center tracking-[0.5em] font-black text-xl" 
                    placeholder="000000"
                    value={authAccessCode} 
                    onChange={e => setAuthAccessCode(e.target.value)} 
                    maxLength={6}
                    required 
                    autoFocus 
                  />
                </div>
                <p className="text-[10px] text-muted-foreground text-center">أدخل الرمز 123456 للدخول المباشر</p>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                دخول النظام
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="pt-4 border-t border-border/50 text-center">
                <button 
                  type="button" 
                  onClick={() => setAuthStep('login-password')}
                  className="text-xs text-primary/70 hover:text-primary font-bold transition-colors"
                >
                  أو الدخول بواسطة حساب مسجل
                </button>
              </div>
            </form>
          )}

          {authStep === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 relative z-10">
              <div className="space-y-2">
                <Label className="text-muted-foreground">اسم المستخدم</Label>
                <Input className="bg-muted border-border text-foreground h-12 rounded-xl" value={authUsername} onChange={e => setAuthUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">كلمة المرور</Label>
                <Input className="bg-muted border-border text-foreground h-12 rounded-xl" type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">تأكيد كلمة المرور</Label>
                <Input className="bg-muted border-border text-foreground h-12 rounded-xl" type="password" value={authConfirmPassword} onChange={e => setAuthConfirmPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl text-lg font-bold">إنشاء حساب</Button>
            </form>
          )}

          {authStep === 'login-password' && (
            <form onSubmit={handleLogin} className="space-y-4 relative z-10">
              <div className="space-y-2">
                <Label className="text-muted-foreground">البريد الإلكتروني أو اسم المستخدم</Label>
                <Input 
                  className="bg-muted border-border text-foreground h-12 rounded-xl" 
                  value={authUsername} 
                  onChange={e => setAuthUsername(e.target.value)} 
                  placeholder="example@pharma.com"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">كلمة المرور</Label>
                <Input 
                  className="bg-muted border-border text-foreground h-12 rounded-xl" 
                  type="password" 
                  value={authPassword} 
                  onChange={e => setAuthPassword(e.target.value)} 
                  required 
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl text-lg font-bold">دخول</Button>
              
              <div className="pt-4 border-t border-border/50 flex flex-col gap-2 text-center">
                <button 
                  type="button" 
                  onClick={() => setAuthStep('access-code')}
                  className="text-xs text-primary/70 hover:text-primary font-bold transition-colors"
                >
                  العودة لإدخال رمز الدخول
                </button>
                <button 
                  type="button" 
                  onClick={() => setAuthStep('register')}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  ليس لديك حساب؟ إنشاء حساب جديد
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans overflow-x-hidden w-full" dir="rtl">
      {/* Sidebar Navigation */}
      <aside 
        className={`fixed top-0 right-0 z-50 h-screen bg-sidebar border-l border-border transition-all duration-300 flex flex-col ${
          effectiveAppMode === 'laptop' 
            ? (isSidebarCollapsed ? 'w-20' : 'w-64') 
            : (isMobileMenuOpen ? 'w-64' : 'w-0 -mr-64')
        }`}
      >
        <div className="flex h-16 items-center px-6 gap-3 border-b border-sidebar-border shrink-0">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shrink-0 overflow-hidden">
            <Package className="h-5 w-5" />
          </div>
          {(effectiveAppMode === 'mobile' || !isSidebarCollapsed) && (
            <h1 className="text-lg font-black tracking-tight text-foreground whitespace-nowrap overflow-hidden">صيدليتي</h1>
          )}
          {effectiveAppMode === 'mobile' && (
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="mr-auto">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'invoices' && activeTab === 'invoice-details');
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (effectiveAppMode === 'mobile') setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative ${
                  isActive 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' 
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-sidebar-primary' : 'group-hover:text-sidebar-primary/80'}`} />
                {(effectiveAppMode === 'mobile' || !isSidebarCollapsed) && (
                  <span className="font-bold text-sm whitespace-nowrap">{item.label}</span>
                )}
                {item.badge > 0 && (effectiveAppMode === 'mobile' || !isSidebarCollapsed) && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
                {item.badge > 0 && effectiveAppMode === 'laptop' && isSidebarCollapsed && (
                   <span className="absolute top-2 left-2 block h-2 w-2 rounded-full bg-rose-600 border border-background" />
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-sidebar-primary rounded-r-full" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <button
            onClick={() => {
              setActiveTab('settings');
              if (effectiveAppMode === 'mobile') setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
              activeTab === 'settings' 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' 
                : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <Settings className={`h-5 w-5 shrink-0 ${activeTab === 'settings' ? 'text-sidebar-primary' : ''}`} />
            {(effectiveAppMode === 'mobile' || !isSidebarCollapsed) && <span className="font-bold text-sm">الإعدادات</span>}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-all font-bold text-sm"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {(effectiveAppMode === 'mobile' || !isSidebarCollapsed) && <span>تسجيل الخروج</span>}
          </button>

          {effectiveAppMode === 'laptop' && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full justify-center mt-2 hover:bg-muted"
            >
              <Menu className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </aside>

      {/* Backdrop for mobile menu */}
      {effectiveAppMode === 'mobile' && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Bottom Navigation for Mobile */}
      {effectiveAppMode === 'mobile' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex items-center justify-around h-16 px-2 md:hidden">
          {[
            { id: 'finance', label: 'الرئيسية', icon: LayoutDashboard },
            { id: 'revenues', label: 'الإيرادات', icon: CreditCard },
            { id: 'invoices', label: 'الفواتير', icon: FileText },
            { id: 'reports', label: 'التقارير', icon: PieChart },
            { id: 'more', label: 'المزيد', icon: MoreHorizontal },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = item.id === 'more' 
              ? !['finance', 'revenues', 'invoices', 'reports'].includes(activeTab)
              : activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'more') {
                    setIsMobileMenuOpen(true);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-black">{item.label}</span>
                {isActive && (
                  <motion.div layoutId="bottom-nav-indicator" className="h-1 w-4 bg-primary rounded-full mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 w-full min-w-0 ${effectiveAppMode === 'laptop' ? (isSidebarCollapsed ? 'mr-20' : 'mr-64') : 'mr-0 pb-20 md:pb-0'}`}>
        <header className="sticky top-0 z-40 h-16 md:h-20 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-8 flex items-center justify-between gap-3 md:gap-8">
          <div className="flex items-center gap-2 md:gap-6 flex-1 max-w-xl min-w-0">
            {effectiveAppMode === 'mobile' && (
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="relative flex-1 group min-w-0">
               <Search className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input 
                 placeholder={effectiveAppMode === 'mobile' ? "بحث..." : "ابحث عن مورد، فاتورة، أو عملية..."} 
                 className="w-full bg-muted/50 border-border pr-10 md:pr-12 h-10 md:h-11 rounded-xl text-xs md:text-sm focus:ring-primary/20 focus:border-primary/50 transition-all text-foreground"
                 value={globalSearch}
                 onChange={(e) => setGlobalSearch(e.target.value)}
               />
             </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <div className="hidden lg:flex flex-col items-start gap-1">
              <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">مكان العمل الحالي</span>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 group outline-none">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                    {branches.find(b => b.id === currentBranchId)?.name || 'جميع الفروع'}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-all" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-card border-border text-foreground w-64 p-2 rounded-xl shadow-2xl z-50">
                   <DropdownMenuItem 
                     className={`p-3 cursor-pointer rounded-lg gap-3 ${!currentBranchId ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                     onClick={() => handleSelectBranch(null)}
                   >
                     <LayoutDashboard className="h-4 w-4" />
                     <div className="flex flex-col text-right">
                        <span className="font-black text-sm">جميع الفروع</span>
                        <span className="text-[10px] font-bold text-muted-foreground">إحصائيات المؤسسة بالكامل</span>
                     </div>
                   </DropdownMenuItem>
                   <DropdownMenuSeparator className="bg-border" />
                   <DropdownMenuGroup>
                     <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground px-3 py-2 uppercase">هذا الفرع (تبديل النطاق)</DropdownMenuLabel>
                    {branches.filter(b => b.status === 'active').map(branch => (
                     <DropdownMenuItem 
                        key={branch.id}
                        className={`p-3 cursor-pointer rounded-lg gap-3 ${currentBranchId === branch.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                        onClick={() => handleSelectBranch(branch.id!)}
                     >
                        <Building2 className="h-4 w-4" />
                        <div className="flex flex-col text-right">
                           <span className="font-bold text-sm">{branch.name}</span>
                        </div>
                     </DropdownMenuItem>
                   ))}
                   {branches.length === 0 && (
                     <div className="p-4 text-center text-xs text-muted-foreground italic">لا توجد فروع مضافة بعد</div>
                   )}
                   </DropdownMenuGroup>
                   <DropdownMenuSeparator className="bg-border" />
                   <DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-lg gap-3 text-primary" onClick={() => setActiveTab('branches')}>
                      <Plus className="h-4 w-4" />
                      <span className="font-black text-sm">إدارة الصيدليات</span>
                   </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="h-8 w-px bg-border hidden lg:block mx-2" />

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger className={`${effectiveAppMode === 'mobile' ? 'size-10' : 'h-11 px-6'} flex items-center justify-center gap-2 border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 font-bold rounded-xl outline-none transition-all`}>
                   <Plus className="h-4 w-4" />
                   {effectiveAppMode !== 'mobile' && "إجراء سريع"}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border text-foreground w-56 p-2 rounded-xl">
                  <DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-lg gap-3" onClick={() => setIsAddInvoiceOpen(true)}>
                    <Receipt className="h-4 w-4 text-blue-500" />
                    <span>فاتورة شراء جديدة</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-lg gap-3" onClick={() => setIsMultiEntryOpen(true)}>
                    <TableIcon className="h-4 w-4 text-primary" />
                    <span>إدخال متعدد للقوائم</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-lg gap-3" onClick={() => setIsExcelImportOpen(true)}>
                    <FileUp className="h-4 w-4 text-emerald-500" />
                    <span>استيراد من Excel</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-lg gap-3" onClick={() => setIsAddRevenueOpen(true)}>
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <span>تسجيل دخل جديد</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-lg gap-3" onClick={() => setIsAddEntityOpen(true)}>
                    <Users className="h-4 w-4 text-purple-500" />
                    <span>إضافة مورد جديد</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-lg gap-3 text-rose-500" onClick={() => setIsAddExpenseOpen(true)}>
                    <ArrowDownCircle className="h-4 w-4" />
                    <span>تسجيل مصروف</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-lg gap-3" onClick={() => setIsAddBonusOpen(true)}>
                    <Gift className="h-4 w-4 text-amber-500" />
                    <span>إضافة بونص جديد</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <ThemeToggle theme={theme} setTheme={setTheme} />
              
              <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border">
                {[
                  { id: 'auto', icon: Monitor, label: 'تلقائي' },
                  { id: 'laptop', icon: Laptop, label: 'لابتوب' },
                  { id: 'mobile', icon: Smartphone, label: 'موبايل' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setAppModeSetting(mode.id as any)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                      appModeSetting === mode.id 
                        ? 'bg-background text-primary shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <mode.icon className="h-4 w-4" />
                    <span className="hidden xl:block">{mode.label}</span>
                  </button>
                ))}
              </div>

              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl" onClick={() => setActiveTab('notifications')}>
                <Bell className="h-5 w-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-600 ring-2 ring-background" />
                )}
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 w-full">
            {/* TabsList removed as navigation is now in the sidebar */}

          <TabsContent value="finance" className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <History className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-black text-foreground">عرض البيانات التاريخية</h3>
                    <p className="text-xs text-muted-foreground font-bold">تضمين أرصدة الترحيل والأرصدة الافتتاحية في الإحصائيات العامة</p>
                  </div>
                </div>
                <Select value={reportTypeFilter} onValueChange={(v: any) => setReportTypeFilter(v)}>
                  <SelectTrigger className="w-[200px] h-11 bg-card border-border rounded-xl font-black text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">كل البيانات (حالي+قديم)</SelectItem>
                    <SelectItem value="current">البيانات الحالية فقط</SelectItem>
                    <SelectItem value="historical">البيانات القديمة فقط</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            {/* Conditional Stats: Branch specific vs Unified */}
            <div className={`grid gap-4 md:gap-6 ${effectiveAppMode === 'laptop' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
              {currentBranchId ? (
                // Branch Specific Stats
                [
                  { label: 'دخل اليوم', value: stats.dailyRevenue, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                  { label: 'دخل الشهر', value: stats.monthlyRevenue, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-500/10' },
                  { label: 'ديون الموردين', value: stats.supplierDues, icon: Users, color: 'text-emerald-900 dark:text-emerald-400', bg: 'bg-emerald-900/10' },
                  { label: 'فواتير مستحقة', value: stats.dueInvoices, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-500/10', isCount: true },
                ].map((stat, idx) => (
                  <Card key={idx} className="bg-card border-border overflow-hidden relative group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 rounded-2xl w-full">
                    <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-3xl -mr-16 -mt-16 opacity-30 group-hover:opacity-50 transition-opacity`} />
                    <CardHeader className="pb-1 md:pb-2 space-y-0 flex flex-row items-center justify-between relative z-10">
                      <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
                      <CardTitle className="text-[10px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 pb-4 md:pb-6">
                      <div className="text-2xl md:text-3xl font-black text-foreground font-mono tracking-tighter">
                        {stat.isCount ? stat.value : formatIQD(stat.value)}
                      </div>
                      <div className="mt-1 md:mt-2 flex items-center gap-1.5">
                         <div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-primary animate-pulse" />
                         <span className="text-[9px] md:text-[10px] text-muted-foreground font-bold">تحديث تلقائي</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                // Unified Master Stats
                [
                  { label: 'إجمالي الوارد', value: stats.totalRevenue, icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                  { label: 'إجمالي المصروفات', value: stats.totalExpense, icon: ArrowDownCircle, color: 'text-rose-600', bg: 'bg-rose-500/10' },
                  { label: 'إجمالي الأرباح', value: stats.totalNetProfit, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-500/10' },
                  { label: 'ديون الموردين المجمعة', value: stats.supplierDues, icon: Users, color: 'text-amber-900 dark:text-amber-400', bg: 'bg-amber-900/10' },
                ].map((stat, idx) => (
                  <Card key={idx} className="bg-card border-border overflow-hidden relative group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 rounded-2xl w-full">
                    <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-3xl -mr-16 -mt-16 opacity-30 group-hover:opacity-50 transition-opacity`} />
                    <CardHeader className="pb-1 md:pb-2 space-y-0 flex flex-row items-center justify-between relative z-10">
                      <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
                      <CardTitle className="text-[10px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 pb-4 md:pb-6">
                      <div className="text-2xl md:text-3xl font-black text-foreground font-mono tracking-tighter">
                        {formatIQD(stat.value)}
                      </div>
                      <div className="mt-1 md:mt-2 flex items-center gap-1.5">
                         <div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-primary animate-pulse" />
                         <span className="text-[9px] md:text-[10px] text-muted-foreground font-bold">عرض موحد للفروع</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className={`${!currentBranchId && branches.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'} bg-card border-border p-4 md:p-8 rounded-2xl overflow-hidden w-full`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-10 gap-4">
                  <div>
                    <CardTitle className="text-lg md:text-xl font-black text-foreground">
                      {currentBranchId ? 'التحليل المالي للفرع' : 'التحليل المالي الموحد'}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground font-bold font-sans">
                      {currentBranchId ? 'حركة الإيرادات والمصاريف لآخر 7 أيام' : 'مقارنة الأداء المالي لكل الفروع مجمعة'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 md:gap-4 p-1 md:p-1.5 bg-muted/30 border border-border rounded-xl w-fit">
                    <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs text-primary font-black">
                      <div className="h-1.5 md:h-2 w-1.5 md:w-2 rounded-full bg-primary" />
                      الدخل
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs text-rose-500 font-black">
                      <div className="h-1.5 md:h-2 w-1.5 md:w-2 rounded-full bg-rose-500" />
                      المصاريف
                    </div>
                  </div>
                </div>
                <div className="h-[240px] md:h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? 'hsla(var(--border), 0.5)' : '#f1f5f9'} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 700 }}
                        dy={15}
                      />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                        contentStyle={{ 
                          backgroundColor: 'var(--card)', 
                          border: '1px solid var(--border)', 
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }}
                        itemStyle={{ fontSize: '12px', fontWeight: '900' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="income" 
                        stroke="var(--primary)" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorIncome)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expense" 
                        stroke="#ef4444" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorExpense)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Sidebar Content (Comparison + Standard Stats) */}
              <div className="space-y-8 lg:col-span-1">
                {!currentBranchId && branches.length > 0 && (
                  <Card className="bg-card border-border p-6 rounded-2xl flex flex-col shadow-lg shadow-primary/5">
                    <div className="mb-6">
                      <CardTitle className="text-lg font-black text-foreground">مقارنة أداء الفروع</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground font-bold">بناءً على الإيرادات والأرباح الحالية</CardDescription>
                    </div>
                    
                    <div className="flex-1 space-y-6">
                      {branchComparison.sort((a,b) => b.revenue - a.revenue).map((branch) => (
                        <div key={branch.id} className="space-y-2 group">
                          <div className="flex justify-between items-end">
                             <span className="text-xs font-black text-foreground group-hover:text-primary transition-colors">{branch.name}</span>
                             <span className="text-[10px] font-mono font-bold text-muted-foreground">{formatIQD(branch.revenue)}</span>
                          </div>
                          <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-border/50">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${Math.min(100, (branch.revenue / (Math.max(...branchComparison.map(b => b.revenue)) || 1)) * 100)}%` }}
                               className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]"
                             />
                          </div>
                          <div className="flex justify-between items-center px-1">
                             <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">صافي الربح: {formatIQD(branch.profit)}</span>
                             <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">الديون: {formatIQD(branch.dues)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button 
                      variant="ghost" 
                      className="mt-6 w-full text-xs font-black text-primary hover:bg-primary/5 gap-2 border border-primary/10 rounded-xl py-5"
                      onClick={() => setActiveTab('branches')}
                    >
                      إدارة بيانات الفروع
                      <Building2 className="h-4 w-4" />
                    </Button>
                  </Card>
                )}

                <Card className="bg-card border-border p-8 rounded-2xl">
                  <CardTitle className="text-sm font-black text-foreground mb-6 uppercase tracking-widest">توزيع الأرباح</CardTitle>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" hide />
                        <Tooltip 
                          cursor={{ fill: 'hsla(var(--primary), 0.05)' }}
                          contentStyle={{ 
                            backgroundColor: 'var(--card)', 
                            border: '1px solid var(--border)', 
                            borderRadius: '12px' 
                          }}
                        />
                        <Bar dataKey="profit" radius={[6, 6, 0, 0]} fill="var(--primary)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-6 border-t border-border">
                    <span className="text-xs text-muted-foreground font-bold">إجمالي أرباح الأسبوع</span>
                    <span className="text-xl font-black text-primary font-mono tracking-tighter">
                      {formatNumberWithCommas(chartData.reduce((acc, d) => acc + d.profit, 0))}
                    </span>
                  </div>
                </Card>

                <Card className="bg-card border-border p-8 rounded-2xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-2xl -mr-12 -mt-12" />
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <CardTitle className="text-sm font-black text-foreground uppercase tracking-widest">تنبيهات السداد</CardTitle>
                    <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-full font-black">بانتظار الإجراء</span>
                  </div>
                  <div className="space-y-4 relative z-10">
                    {deadlines.filter(d => d.status === 'pending').slice(0, 3).map((d) => (
                      <div key={d.id} className="p-4 bg-muted/30 border border-border rounded-xl flex items-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="text-xs font-black text-foreground truncate">{d.accountName}</div>
                          <div className="text-[10px] text-muted-foreground font-bold">متبقي: {formatIQD(d.requiredPayment)}</div>
                        </div>
                      </div>
                    ))}
                    {deadlines.filter(d => d.status === 'pending').length === 0 && (
                      <div className="text-center py-8 text-xs text-muted-foreground italic font-bold">لا توجد تنبيهات سداد حالياً</div>
                    )}
                  </div>
                </Card>
              </div>
            </div>

            <Card className="bg-card border-border overflow-hidden rounded-2xl shadow-sm">
              <CardHeader className="border-b border-border px-8 py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black text-foreground">النشاطات الأخيرة</CardTitle>
                    <CardDescription className="text-muted-foreground font-bold">متابعة فورية لكافة العمليات المالية</CardDescription>
                  </div>
                  <Button variant="outline" className="text-xs text-primary font-black gap-2 border-primary/20 hover:bg-primary/5 px-6 h-11 rounded-xl" onClick={() => setActiveTab('transactions')}>
                    عرض السجل الكامل
                    <ArrowLeft className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {effectiveAppMode === 'laptop' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                      <thead>
                        <tr>
                          <th className="px-8 !text-right">التاريخ</th>
                          <th className="px-8 !text-right">البيان والجهة</th>
                          <th className="px-8 !text-left">المبلغ الصافي</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.slice(0, 8).map((tx) => (
                          <tr key={tx.id} className="group cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
                            setSelectedTransaction(tx);
                            setIsEditTransactionOpen(true);
                          }}>
                            <td className="px-8 py-5 text-xs text-muted-foreground font-mono font-bold tracking-tight">{safeFormatDate(tx.date, 'yyyy/MM/dd')}</td>
                            <td className="px-8 py-5">
                              <div className="font-black text-foreground group-hover:text-primary transition-colors">
                                {getExpenseStatement(tx)}
                              </div>
                              {tx.type === 'expense' && tx.description && tx.description !== tx.statement && (
                                <div className="text-[10px] text-muted-foreground font-bold mt-1 px-2 py-0.5 bg-muted rounded-md inline-block">
                                  {tx.description}
                                </div>
                              )}
                            </td>
                            <td className={`px-8 py-5 text-left font-black font-mono text-base ${(tx.type === 'income' || tx.type === 'revenue') ? 'text-primary' : 'text-rose-500'}`}>
                              {(tx.type === 'income' || tx.type === 'revenue') ? '+' : '-'}{formatNumberWithCommas(tx.amount)}
                            </td>
                            <td className="px-8 py-5 text-left">
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 className="opacity-0 group-hover:opacity-100 h-8 w-8 text-rose-500 hover:bg-rose-500/10 transition-all rounded-lg" 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleDeleteTransaction(tx);
                                 }}
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {transactions.slice(0, 8).map((tx) => (
                      <div 
                        key={tx.id} 
                        className="p-5 flex flex-col gap-3 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border last:border-0"
                        onClick={() => {
                          setSelectedTransaction(tx);
                          setIsEditTransactionOpen(true);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="font-black text-sm text-foreground truncate">
                              {getExpenseStatement(tx)}
                            </div>
                            {tx.type === 'expense' && tx.description && tx.description !== tx.statement && (
                              <div className="text-[9px] text-muted-foreground mt-1 truncate">{tx.description}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`font-black font-mono text-lg ${(tx.type === 'income' || tx.type === 'revenue') ? 'text-primary' : 'text-rose-500'}`}>
                              {(tx.type === 'income' || tx.type === 'revenue') ? '+' : '-'}{formatNumberWithCommas(tx.amount)}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-xl" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTransaction(tx);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                          <div className="flex items-center gap-2 font-mono">
                             <span>{safeFormatDate(tx.date, 'yyyy/MM/dd')}</span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg font-black ${
                            (tx.type === 'income' || tx.type === 'revenue') 
                              ? 'bg-emerald-500/10 text-emerald-600' 
                              : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {(tx.type === 'income' || tx.type === 'revenue') ? 'دخل / وارد' : 'مصروفات'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card className="bg-card border-border p-8 rounded-2xl relative group overflow-hidden shadow-sm">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl -mr-12 -mt-12 group-hover:bg-emerald-500/20 transition-colors" />
                 <div className="relative z-10 flex flex-col items-center">
                    <Receipt className="h-6 w-6 text-emerald-600 mb-4" />
                    <div className="text-[10px] font-black text-muted-foreground mb-1 tracking-widest uppercase text-center">إجمالي التسديدات</div>
                    <div className="text-3xl font-black text-emerald-600 font-mono tracking-tighter">
                      {formatNumberWithCommas(allLedgerEntries.filter(e => e.operationType === 'payment').reduce((acc, e) => acc + e.amount, 0))}
                      <span className="text-[10px] text-muted-foreground mr-2 font-sans font-bold italic tracking-normal">د.ع</span>
                    </div>
                 </div>
               </Card>
               <Card className="bg-card border-border p-8 rounded-2xl relative group overflow-hidden shadow-sm">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl -mr-12 -mt-12 group-hover:bg-primary/20 transition-colors" />
                 <div className="relative z-10 flex flex-col items-center">
                    <Calendar className="h-6 w-6 text-primary mb-4" />
                    <div className="text-[10px] font-black text-muted-foreground mb-1 tracking-widest uppercase text-center">تسديدات الشهر</div>
                    <div className="text-3xl font-black text-foreground font-mono tracking-tighter">
                      {formatNumberWithCommas(allLedgerEntries.filter(e => e.operationType === 'payment' && new Date(e.date) >= startOfMonth(new Date())).reduce((acc, e) => acc + e.amount, 0))}
                      <span className="text-[10px] text-muted-foreground mr-2 font-sans font-bold italic tracking-normal">د.ع</span>
                    </div>
                 </div>
               </Card>
               <Card className="bg-card border-border p-8 rounded-2xl relative group overflow-hidden shadow-sm">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-2xl -mr-12 -mt-12 group-hover:bg-blue-500/20 transition-colors" />
                 <div className="relative z-10 flex flex-col items-center">
                    <Hash className="h-6 w-6 text-blue-600 mb-4" />
                    <div className="text-[10px] font-black text-muted-foreground mb-1 tracking-widest uppercase text-center">عدد العمليات</div>
                    <div className="text-3xl font-black text-blue-600 font-mono tracking-tighter">
                      {allLedgerEntries.filter(e => e.operationType === 'payment').length}
                    </div>
                 </div>
               </Card>
            </div>

            <Card className="bg-card border-border overflow-hidden rounded-2xl shadow-sm">
               <CardHeader className="border-b border-border px-8 py-10 bg-muted/20">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <h2 className="text-2xl font-black text-foreground mb-1">سجل المدفوعات</h2>
                      <p className="text-muted-foreground font-bold">كافة التسديدات والمصاريف الصادرة</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="relative flex-1 md:w-96 group">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          placeholder="ابحث عن وصل أو مورد..." 
                          className="bg-background border-border pr-12 h-12 rounded-xl text-foreground focus:ring-primary/20 placeholder:font-bold"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={() => setIsMultiPaymentOpen(true)} 
                        variant="outline"
                        className="gap-2 border-primary/20 text-primary font-black h-12 px-6 rounded-xl hover:bg-primary/10"
                      >
                        <Plus className="h-4 w-4" />
                        إدخال متعدد
                      </Button>
                    </div>
                  </div>
               </CardHeader>
                <CardContent className="p-0">
                   {effectiveAppMode === 'laptop' ? (
                   <table className="w-full text-right text-sm">
                     <thead>
                       <tr>
                         <th className="px-8 !text-right">التاريخ</th>
                         <th className="px-8 !text-right">المورد / الجهة</th>
                         <th className="px-8 !text-right">رقم الوصل</th>
                         <th className="px-8 !text-left">المبلغ</th>
                       </tr>
                     </thead>
                     <tbody>
                       {allLedgerEntries
                         .filter(e => e.operationType === 'payment')
                         .filter(e => e.accountName.toLowerCase().includes(searchTerm.toLowerCase()) || (e.invoiceNumber || '').includes(searchTerm))
                         .slice(0, 50)
                         .map((entry) => (
                           <tr key={entry.id} className="group cursor-pointer hover:bg-primary/5 transition-colors" onClick={() => handleViewInvoice(entry)}>
                             <td className="px-8 py-6 text-xs text-muted-foreground font-mono font-bold">{safeFormatDate(entry.date, 'yyyy/MM/dd')}</td>
                             <td className="px-8 py-6">
                               <div className="font-black text-foreground group-hover:text-primary transition-colors">{entry.accountName}</div>
                               <div className="text-[10px] text-muted-foreground font-bold mt-1 px-2.5 py-0.5 bg-muted rounded-full inline-block">سيد قيد مباشر</div>
                             </td>
                             <td className="px-8 py-6 font-mono text-muted-foreground font-bold">{entry.invoiceNumber || '---'}</td>
                             <td className="px-8 py-6 text-left font-black text-emerald-600 font-mono text-lg tracking-tighter">
                               {formatNumberWithCommas(entry.amount)}
                             </td>
                           </tr>
                         ))}
                       {allLedgerEntries.filter(e => e.operationType === 'payment').length === 0 && (
                         <tr>
                           <td colSpan={4} className="py-20 text-center text-muted-foreground italic font-bold">لا توجد تسديدات مسجلة</td>
                         </tr>
                       )}
                     </tbody>
                   </table>
                   ) : (
                     <div className="divide-y divide-border">
                       {allLedgerEntries
                        .filter(e => e.operationType === 'payment')
                        .filter(e => e.accountName.toLowerCase().includes(searchTerm.toLowerCase()) || (e.invoiceNumber || '').includes(searchTerm))
                        .slice(0, 50)
                        .map((entry) => (
                          <div 
                            key={entry.id} 
                            className="p-4 flex flex-col gap-3 hover:bg-primary/5 transition-colors cursor-pointer" 
                            onClick={() => handleViewInvoice(entry)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-black text-foreground">{entry.accountName}</div>
                                <div className="text-[10px] text-muted-foreground font-bold mt-0.5">رقم الوصل: {entry.invoiceNumber || '---'}</div>
                              </div>
                              <div className="text-lg font-black text-emerald-600 font-mono tracking-tighter">
                                {formatNumberWithCommas(entry.amount)}
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                              <span>{safeFormatDate(entry.date, 'yyyy/MM/dd')}</span>
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded">مدفوعات</span>
                            </div>
                          </div>
                        ))}
                      {allLedgerEntries.filter(e => e.operationType === 'payment').length === 0 && (
                        <div className="py-20 text-center text-muted-foreground italic font-bold">لا توجد تسديدات مسجلة</div>
                      )}
                     </div>
                   )}
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily-entry" className="space-y-6 animate-in fade-in duration-700">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-card border-border rounded-3xl shadow-2xl overflow-hidden border-t-8 border-t-emerald-600">
                <CardHeader className="px-8 py-10 bg-muted/20 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-600/20">
                      <PlusCircle className="h-8 w-8" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black text-foreground">الإدخال اليومي للإيرادات</CardTitle>
                      <CardDescription className="text-muted-foreground font-bold">سجل مبيعاتك وخدماتك اليومية لضمان دقة التقارير المالية</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <RevenueForm 
                    onSubmit={(data) => {
                      handleAddRevenue(data);
                      setActiveTab('revenues');
                    }} 
                    onClose={() => setActiveTab('finance')} 
                    onImagesChange={setRevenueImageFiles}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenues" className="space-y-6 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  label: 'إجمالي الوارد', 
                  value: transactions
                    .filter(tx => (tx.type === 'income' || tx.type === 'revenue') && (!currentBranchId || tx.branchId === currentBranchId))
                    .reduce((acc, tx) => acc + (tx.saleAmount || tx.amount || 0), 0), 
                  icon: TrendingUp, 
                  color: 'text-primary', 
                  bg: 'bg-primary/10' 
                },
                { 
                  label: 'إجمالي الأرباح', 
                  value: transactions
                    .filter(tx => (tx.type === 'income' || tx.type === 'revenue') && (!currentBranchId || tx.branchId === currentBranchId))
                    .reduce((acc, tx) => acc + (tx.profitAmount || tx.netProfit || 0), 0), 
                  icon: DollarSign, 
                  color: 'text-emerald-600', 
                  bg: 'bg-emerald-500/10' 
                },
                { 
                  label: 'الديون (المتبقي)', 
                  value: transactions
                    .filter(tx => (tx.type === 'income' || tx.type === 'revenue') && (!currentBranchId || tx.branchId === currentBranchId))
                    .reduce((acc, tx) => acc + (tx.remainingAmount ?? (tx.incomeType === 'cash' ? 0 : tx.amount)), 0), 
                  icon: AlertCircle, 
                  color: 'text-rose-600', 
                  bg: 'bg-rose-500/10' 
                },
              ].map((stat, idx) => (
                <Card key={idx} className="bg-card border-border p-8 relative group overflow-hidden rounded-2xl shadow-sm">
                  <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-2xl -mr-12 -mt-12 group-hover:bg-primary/20 transition-colors`} />
                  <div className="relative z-10 flex flex-col items-center">
                    <stat.icon className={`h-6 w-6 ${stat.color} mb-4`} />
                    <span className="text-[10px] font-black text-muted-foreground mb-1 tracking-widest uppercase text-center">{stat.label}</span>
                    <span className="text-3xl font-black text-foreground font-mono tracking-tighter">
                      {formatIQD(stat.value)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="bg-card border-border rounded-2xl shadow-sm overflow-hidden">
               <CardHeader className="px-8 py-10 border-b border-border bg-muted/20">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <h2 className="text-2xl font-black text-foreground mb-1">سجل الإيرادات والديون</h2>
                      <p className="text-muted-foreground font-bold">متابعة تحصيلات الصيدلية الخارجية</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <Button onClick={() => setActiveTab('daily-entry')} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 px-6 rounded-xl shadow-lg shadow-emerald-600/10 whitespace-nowrap">
                        <Plus className="h-4 w-4" />
                        إضافة إيراد يومي
                      </Button>
                      <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          placeholder="ابحث باسم الزبون..." 
                          className="bg-background border-border pr-12 h-12 rounded-xl text-foreground focus:ring-primary/20 placeholder:font-bold"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  {effectiveAppMode === 'laptop' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr>
                          <th className="px-8 !text-right">الفرع / التفاصيل</th>
                          <th className="px-8 !text-right">إجمالي الوارد</th>
                          <th className="px-8 !text-right text-center">نسبة الربح %</th>
                          <th className="px-8 !text-right">صافي الربح</th>
                          <th className="px-8 !text-right">التاريخ</th>
                          <th className="px-8 !text-right text-center">نوع العملية (نقد / آجل)</th>
                          <th className="px-8 !text-right">المتبقي (للآجل فقط)</th>
                          <th className="px-8 !text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                           const visibleRevenues = transactions.filter(tx => {
                             const isRevenue = tx.type === 'income' || tx.type === 'revenue' || tx.category === 'revenue';
                             const mainBranchId = branches.length > 0 ? branches[0].id : 'main';
                             const txBranchId = tx.branchId || mainBranchId;
                             
                             const matchesBranch = !currentBranchId || txBranchId === currentBranchId;
                             const matchesSearch = (tx.description || '').includes(searchTerm) || 
                                                 (tx.customerName && tx.customerName.includes(searchTerm));
                             
                             return isRevenue && matchesBranch && matchesSearch;
                           });
                           
                           if (visibleRevenues.length > 0) {
                             console.log("Visible revenue records:", visibleRevenues);
                           }
                           
                           return visibleRevenues.map((tx) => (
                             <tr key={tx.id} className="group hover:bg-primary/5 transition-colors">
                               <td className="px-8 py-6 text-right">
                                 <div className="font-black text-foreground group-hover:text-primary transition-colors">{tx.customerName || tx.description}</div>
                                 <div className="flex items-center gap-2 mt-1">
                                   <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                     {branches.find(b => b.id === (tx.branchId || (branches.length > 0 ? branches[0].id : 'main')))?.name || 'الفرع الرئيسي'}
                                   </span>
                                 </div>
                               </td>
                              <td className="px-8 py-6 font-mono font-bold text-muted-foreground text-lg">{formatNumberWithCommas(tx.saleAmount || tx.amount)}</td>
                              <td className="px-8 py-6 font-mono font-bold text-slate-500 text-center">%{tx.profitPercent || 0}</td>
                              <td className="px-8 py-6 font-mono font-bold text-emerald-600 text-lg">{formatNumberWithCommas(tx.profitAmount || tx.netProfit || 0)}</td>
                              <td className="px-8 py-6">
                                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-tight">{safeFormatDate(tx.date, 'yyyy/MM/dd')}</div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                  tx.incomeType === 'cash' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                                }`}>
                                  {tx.incomeType === 'cash' ? 'نقدي' : 'آجل'}
                                </span>
                              </td>
                              <td className="px-8 py-6 font-black text-rose-600 font-mono text-lg tracking-tighter text-right">
                                {tx.incomeType === 'cash' ? '0' : formatNumberWithCommas(tx.remainingAmount ?? tx.amount)}
                              </td>
                              <td className="px-8 py-6 text-center">
                                <DropdownMenu>
                                  <DropdownMenuTrigger className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted/50 outline-none transition-colors">
                                    <div className="flex flex-col gap-0.5">
                                      <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                      <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                      <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                    </div>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-40 bg-card border-border text-foreground rounded-xl shadow-xl" dir="rtl">
                                    <DropdownMenuItem onClick={() => {
                                      setViewingRevenue(tx);
                                      setIsViewRevenueOpen(true);
                                    }} className="flex items-center gap-2 p-2.5 cursor-pointer hover:bg-muted/50 rounded-lg">
                                      <Eye className="h-4 w-4 text-blue-500" />
                                      <span className="font-bold">عرض التفاصيل</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedTransaction(tx);
                                      setIsEditTransactionOpen(true);
                                    }} className="flex items-center gap-2 p-2.5 cursor-pointer hover:bg-muted/50 rounded-lg text-amber-500">
                                      <Edit className="h-4 w-4" />
                                      <span className="font-bold">تعديل</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-border/50" />
                                    <DropdownMenuItem onClick={() => {
                                      handleDeleteTransaction(tx);
                                    }} className="flex items-center gap-2 p-2.5 cursor-pointer hover:bg-rose-500/10 text-rose-500 rounded-lg text-rose-500">
                                      <Trash2 className="h-4 w-4" />
                                      <span className="font-bold">حذف</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))
                        })()}
                        {(() => {
                           const visibleCount = transactions.filter(tx => {
                             const isRevenue = tx.type === 'income' || tx.type === 'revenue' || tx.category === 'revenue';
                             const mainBranchId = branches.length > 0 ? branches[0].id : 'main';
                             const txBranchId = tx.branchId || mainBranchId;
                             return isRevenue && (!currentBranchId || txBranchId === currentBranchId);
                           }).length;
                           return visibleCount === 0 && (
                             <tr>
                               <td colSpan={8} className="py-20 text-center text-muted-foreground italic font-bold">لا توجد سجلات إيرادات حالياً</td>
                             </tr>
                           )
                        })()}
                      </tbody>
                    </table>
                  </div>
                  ) : (
                     <div className="p-4 space-y-4">
                       {(() => {
                          const visibleRevenues = transactions.filter(tx => {
                            const isRevenue = tx.type === 'income' || tx.type === 'revenue' || tx.category === 'revenue';
                            const mainBranchId = branches.length > 0 ? branches[0].id : 'main';
                            const txBranchId = tx.branchId || mainBranchId;
                            return isRevenue && (!currentBranchId || txBranchId === currentBranchId) && 
                                   ((tx.description || '').includes(searchTerm) || (tx.customerName && tx.customerName.includes(searchTerm)));
                          });
                          return visibleRevenues.map((tx) => (
                          <div key={tx.id} className="p-4 bg-muted/20 border border-border rounded-2xl space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-black text-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => {
                                  setViewingRevenue(tx);
                                  setIsViewRevenueOpen(true);
                                }}>{tx.customerName || tx.description}</div>
                                <div className="text-[10px] text-muted-foreground font-bold">{safeFormatDate(tx.date, 'yyyy/MM/dd')}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                  tx.incomeType === 'cash' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                                }`}>
                                  {tx.incomeType === 'cash' ? 'نقدي' : 'آجل'}
                                </span>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-muted/50 outline-none transition-colors">
                                    <div className="flex flex-col gap-0.5">
                                      <div className="w-0.5 h-0.5 bg-muted-foreground rounded-full" />
                                      <div className="w-0.5 h-0.5 bg-muted-foreground rounded-full" />
                                      <div className="w-0.5 h-0.5 bg-muted-foreground rounded-full" />
                                    </div>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-32 bg-card border-border text-foreground rounded-xl" dir="rtl">
                                    <DropdownMenuItem onClick={() => {
                                      setViewingRevenue(tx);
                                      setIsViewRevenueOpen(true);
                                    }} className="text-[10px] p-2 font-bold cursor-pointer hover:bg-muted font-bold">عرض</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedTransaction(tx);
                                      setIsEditTransactionOpen(true);
                                    }} className="text-[10px] p-2 font-bold cursor-pointer hover:bg-muted text-amber-500 font-bold">تعديل</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      handleDeleteTransaction(tx);
                                    }} className="text-[10px] p-2 font-bold cursor-pointer hover:bg-rose-500/10 text-rose-500 font-bold">حذف</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-muted-foreground">
                               <div className="bg-muted p-2 rounded-lg">الوارد: {formatNumberWithCommas(tx.saleAmount || tx.amount)}</div>
                               <div className="bg-emerald-500/5 text-emerald-600 p-2 rounded-lg">الربح: {formatNumberWithCommas(tx.profitAmount || tx.netProfit || 0)}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-muted-foreground">
                               <div className="bg-blue-500/5 text-blue-600 p-2 rounded-lg">المسدد: {formatNumberWithCommas(tx.paidAmount || (tx.incomeType === 'cash' ? tx.amount : 0))}</div>
                               <div className="bg-rose-500/5 text-rose-600 p-2 rounded-lg">المتبقي: {formatNumberWithCommas(tx.remainingAmount ?? (tx.incomeType === 'cash' ? 0 : tx.amount))}</div>
                            </div>
                            {tx.notes && (
                              <div className="text-[10px] font-bold text-muted-foreground border-t border-border/50 pt-2 bg-muted/30 p-2 rounded-xl">
                                {tx.notes}
                              </div>
                            )}
                          </div>
                        ))
                      })()}
                      {(() => {
                         const visibleCount = transactions.filter(tx => {
                            const isRevenue = tx.type === 'income' || tx.type === 'revenue' || tx.category === 'revenue';
                            const mainBranchId = branches.length > 0 ? branches[0].id : 'main';
                            const txBranchId = tx.branchId || mainBranchId;
                            return isRevenue && (!currentBranchId || txBranchId === currentBranchId) && 
                                   ((tx.description || '').includes(searchTerm) || (tx.customerName && tx.customerName.includes(searchTerm)));
                         }).length;
                         return visibleCount === 0 && (
                            <div className="py-20 text-center text-muted-foreground italic font-bold">لا توجد سجلات إيرادات حالياً</div>
                         )
                      })()}
                    </div>
                  )}
               </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="entities" className="space-y-4 animate-in fade-in duration-500">
            {viewingEntityDetail ? (
              <SupplierAccountPage 
                entity={viewingEntityDetail}
                onBack={() => setViewingEntityDetail(null)}
                ledgerEntries={allLedgerEntries.filter(e => e.accountId === viewingEntityDetail.id)}
                bonuses={bonuses.filter(b => b.entityId === viewingEntityDetail.id)}
                activities={entityActivities.filter(a => a.entityId === viewingEntityDetail.id)}
                onAddInvoice={() => { setSelectedEntity(viewingEntityDetail); setIsAddInvoiceOpen(true); }}
                onAddPayment={() => { setSelectedEntity(viewingEntityDetail); setViewingInvoice(null); setPaymentMode('normal'); setIsAddPaymentOpen(true); }}
                onAddBonus={() => setIsAddBonusOpen(true)}
                onEditEntity={() => { setSelectedEntity(viewingEntityDetail); setIsEditEntityOpen(true); }}
                onViewInvoice={handleViewInvoice}
                onEditInvoice={(invoice) => { setViewingInvoice(invoice); setIsEditInvoiceOpen(true); }}
                onDeleteInvoice={(invoice) => { 
                  setSelectedEntity(viewingEntityDetail);
                  handleDeleteInvoice(invoice); 
                }}
                onRefundInvoice={(invoice) => { setViewingInvoice(invoice); setIsRefundInvoiceOpen(true); }}
                onPartialPayment={(invoice) => { 
                  setViewingInvoice(invoice); 
                  setPaymentMode('partial'); 
                  setPayAmount(invoice.remainingAmount?.toString() || '0');
                  setSelectedEntity(viewingEntityDetail); 
                  setIsAddPaymentOpen(true); 
                }}
                onFullPayment={(invoice) => { 
                  setViewingInvoice(invoice); 
                  setPaymentMode('full'); 
                  setPayAmount(invoice.remainingAmount?.toString() || '0');
                  setSelectedEntity(viewingEntityDetail); 
                  setIsAddPaymentOpen(true); 
                }}
                onEditPayment={(payment) => {
                  setViewingInvoice(payment);
                  setPaymentMode('normal');
                  setPayAmount(payment.amount);
                  setSelectedEntity(viewingEntityDetail);
                  setIsAddPaymentOpen(true);
                }}
                onDeletePayment={(id) => {
                  const payment = allLedgerEntries.find(e => e.id === id);
                  setSelectedEntity(viewingEntityDetail);
                  if (payment) handleDeleteInvoice(payment);
                }}
                onEditBonus={(bonus) => {
                  setEditingBonus(bonus);
                  setIsEditBonusOpen(true);
                }}
                onDeleteBonus={handleDeleteBonus}
                onDeleteAttachment={handleDeleteAttachment}
                onShowImage={setLightboxImage}
                onImportHistorical={() => setIsHistoricalWizardOpen(true)}
                onImportExcel={() => setIsExcelImportOpen(true)}
                appMode={effectiveAppMode}
              />
            ) : (
              <>
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-foreground">إدارة الموردين والمذاخر</h2>
                    <p className="text-muted-foreground font-bold text-sm mt-1">تنسيق التعامل المالي مع مكاتب الأدوية والمذاخر العلمية</p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="بحث عن مورد..." 
                        value={entitySearch}
                        onChange={e => setEntitySearch(e.target.value)}
                        className="bg-card border-border pr-10 rounded-xl h-11"
                      />
                    </div>
                    <Select value={entityStatusFilter} onValueChange={(v: any) => setEntityStatusFilter(v)}>
                       <SelectTrigger className="w-[140px] h-11 rounded-xl bg-card border-border font-bold">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="bg-card border-border">
                          <SelectItem value="active">النشطون</SelectItem>
                          <SelectItem value="archived">المؤرشفون</SelectItem>
                          <SelectItem value="all">كل الموردين</SelectItem>
                       </SelectContent>
                    </Select>
                    <Button onClick={() => setIsAddEntityOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-2 h-11 px-6 text-white shadow-lg shadow-emerald-500/20 rounded-xl font-black">
                      <Plus className="h-4 w-4" />
                      مورد جديد
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEntities.map((entity) => (
                    <Card key={entity.id} className="group cursor-pointer bg-card border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-xl hover:shadow-primary/5 rounded-2xl overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
                      <CardHeader className="p-6 pb-4 relative z-10" onClick={() => handleEntityClick(entity)}>
                        <div className="flex justify-between items-start">
                           <div className="flex-1 overflow-hidden">
                              <CardTitle className="text-xl text-foreground font-black tracking-tight truncate group-hover:text-primary transition-colors">{entity.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                  entity.type === 'office' ? 'bg-blue-500/10 text-blue-600' : 
                                  entity.type === 'scientific_office' ? 'bg-purple-500/10 text-purple-600' :
                                  'bg-amber-500/10 text-amber-600'
                                }`}>
                                  {entity.type === 'office' ? 'مكتب' : 
                                   entity.type === 'scientific_office' ? 'مذخر' : 
                                   'شخصي'}
                                </span>
                                {entity.status === 'مؤرشف' && (
                                  <span className="bg-slate-500/10 text-slate-500 px-2.5 py-0.5 rounded-full text-[9px] font-black">مؤرشف</span>
                                )}
                                <span className="text-[10px] text-muted-foreground font-bold">#{String(entity.id).slice(-4)}</span>
                              </div>
                           </div>
                           <div className="flex flex-col items-end gap-2">
                              <div className={`text-sm font-black px-4 py-2 rounded-xl font-mono tracking-tighter shadow-sm border-2 ${entity.balance > 0 ? 'bg-rose-500/5 text-rose-600 border-rose-500/10' : 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10'}`}>
                                {formatNumberWithCommas(entity.balance)}
                              </div>
                           </div>
                        </div>
                      </CardHeader>
                      <CardFooter className="p-4 pt-0 bg-muted/20 relative z-10 flex items-center justify-between gap-2 border-t border-border/50">
                        <Button 
                          variant="ghost" 
                          className="flex-1 h-10 rounded-xl font-black text-primary hover:bg-primary/5 gap-2" 
                          onClick={() => handleEntityClick(entity)}
                        >
                           <Eye className="h-3.5 w-3.5" />
                           عرض
                        </Button>
                        <div className="w-px h-5 bg-border/50 mx-1" />
                        <Button 
                          variant="ghost" 
                          className="flex-1 h-10 rounded-xl font-black text-amber-600 hover:bg-amber-500/5 gap-2" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingEntity(entity);
                            setIsEditEntityOpen(true);
                          }}
                        >
                           <Edit className="h-3.5 w-3.5" />
                           تعديل
                        </Button>
                        <div className="w-px h-5 bg-border/50 mx-1" />
                        <Button 
                          variant="ghost" 
                          className="flex-1 h-10 rounded-xl font-black text-rose-600 hover:bg-rose-500/5 gap-2" 
                          onClick={(e) => {
                            e.stopPropagation();
                            const hasHistory = (allLedgerEntries || []).some(entry => entry.accountId === entity.id);
                            if (hasHistory) {
                              setDeletingEntityData(entity);
                              setIsEntityDeleteOptionsOpen(true);
                            } else {
                              setDeletingItem({ id: entity.id!, collection: 'entities', label: entity.name });
                              setIsDeleteConfirmOpen(true);
                            }
                          }}
                        >
                           <Trash2 className="h-3.5 w-3.5" />
                           حذف
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                  {filteredEntities.length === 0 && (
                    <div className="col-span-full py-24 text-center text-muted-foreground bg-muted/10 rounded-3xl border-2 border-dashed border-border/50 flex flex-col items-center">
                       <div className="bg-muted p-6 rounded-full mb-4">
                         <Users className="h-12 w-12 opacity-20" />
                       </div>
                       <p className="font-black text-lg text-foreground/50">لا يوجد موردين مطابقة للفلاتر</p>
                       {entityStatusFilter !== 'all' && <p className="text-sm font-bold mt-2">جرب تغيير حالة الفلتر أو البحث</p>}
                       <Button onClick={() => setIsAddEntityOpen(true)} className="mt-8 bg-primary hover:bg-primary/90 h-11 px-8 rounded-xl font-black">
                          إضافة مورد جديد
                       </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="employees" className="space-y-6 animate-in fade-in duration-700">
            <EmployeesPage
              employees={employees}
              attendance={employeeAttendance}
              appMode={effectiveAppMode}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onAddAttendance={handleAddAttendance}
              onUpdateAttendance={handleUpdateAttendance}
              onDeleteAttendance={handleDeleteAttendance}
            />
          </TabsContent>

            <TabsContent value="invoices" className="space-y-6 animate-in fade-in duration-700">
              <Card className="bg-card border-border rounded-2xl shadow-sm overflow-hidden">
                <CardHeader className="px-8 py-10 border-b border-border bg-muted/20">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <h2 className="text-2xl font-black text-foreground mb-1">فواتير المشتريات</h2>
                      <p className="text-muted-foreground font-bold">كافة التوريدات والطلبيات المسجلة</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          placeholder="بحث برقم الفاتورة أو المورد..."
                          className="bg-background border-border pr-12 h-12 rounded-xl text-foreground focus:ring-primary/20 placeholder:font-bold"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsMultiEntryOpen(true)} 
                        className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 gap-2 h-12 px-6 rounded-xl font-black shrink-0"
                      >
                        <PlusCircle className="h-4 w-4" />
                        إدخال متعدد
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsExcelImportOpen(true)} 
                        className="bg-emerald-600 hover:bg-emerald-700 gap-2 h-12 px-6 text-white shadow-lg shadow-emerald-500/20 rounded-xl font-black shrink-0"
                      >
                        <FileUp className="h-4 w-4" />
                        استيراد من Excel
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {effectiveAppMode === 'laptop' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr>
                          <th className="px-8 !text-right">رقم الفاتورة</th>
                          <th className="px-8 !text-right">المورد</th>
                          <th className="px-8 !text-right">التاريخ</th>
                          <th className="px-8 !text-left">المبلغ الصافي</th>
                          <th className="px-8 text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allLedgerEntries
                          .filter(e => e.operationType === 'invoice' && (e.invoiceNumber?.includes(searchTerm) || e.accountName.includes(searchTerm)))
                          .slice(0, 50)
                          .map((entry) => (
                            <tr key={entry.id} className="group hover:bg-primary/5 cursor-pointer transition-colors" onClick={() => handleViewInvoice(entry)}>
                              <td className="px-8 py-6 font-mono font-black text-foreground">{entry.invoiceNumber}</td>
                              <td className="px-8 py-6">
                                <div className="font-black text-foreground group-hover:text-primary transition-colors">{entry.accountName}</div>
                                <div className="text-[10px] text-muted-foreground font-bold mt-1">سجل توريد آجل</div>
                              </td>
                              <td className="px-8 py-6 text-xs text-muted-foreground font-mono font-bold">{safeFormatDate(entry.date, 'yyyy/MM/dd')}</td>
                              <td className="px-8 py-6 text-left">
                                <div className="text-lg font-black text-emerald-600 font-mono tracking-tighter">{formatNumberWithCommas(entry.netAmount)}</div>
                              </td>
                              <td className="px-8 py-6 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-2">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => {
                                    setViewingInvoice(entry);
                                    setIsEditInvoiceOpen(true);
                                  }}>
                                    <Edit className="h-4 w-4 text-amber-500" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => {
                                    setViewingInvoice(entry);
                                    setIsDeleteInvoiceConfirmOpen(true);
                                  }}>
                                    <Trash2 className="h-4 w-4 text-rose-500" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        {allLedgerEntries.filter(e => e.operationType === 'invoice').length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-20 text-center text-muted-foreground italic font-bold">لا توجد فواتير مسجلة بعد</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {allLedgerEntries
                        .filter(e => e.operationType === 'invoice' && (e.invoiceNumber?.includes(searchTerm) || e.accountName.includes(searchTerm)))
                        .slice(0, 50)
                        .map((entry) => (
                          <div 
                            key={entry.id} 
                            className="p-4 flex flex-col gap-2 hover:bg-primary/5 cursor-pointer"
                            onClick={() => handleViewInvoice(entry)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-black text-foreground">قائمة: {entry.invoiceNumber}</div>
                                <div className="text-[10px] text-muted-foreground font-bold">{entry.accountName}</div>
                              </div>
                              <div className="text-lg font-black text-emerald-600 font-mono tracking-tighter">
                                {formatNumberWithCommas(entry.netAmount)}
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                              <span>{safeFormatDate(entry.date, 'yyyy/MM/dd')}</span>
                              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary">توريد مشتريات</span>
                            </div>
                          </div>
                        ))}
                      {allLedgerEntries.filter(e => e.operationType === 'invoice').length === 0 && (
                        <div className="py-20 text-center text-muted-foreground italic font-bold">لا توجد فواتير مسجلة بعد</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deadlines" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
              {deadlines.map(deadline => (
                <Card key={deadline.id} className="bg-card border-border border-r-4 border-r-amber-500 relative group overflow-hidden rounded-2xl shadow-sm hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl -mr-12 -mt-12 group-hover:bg-amber-500/10 transition-colors" />
                  <CardHeader className="p-6 pb-2 relative z-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-foreground font-black tracking-tight">{deadline.accountName}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                           <Clock className="h-3 w-3 text-amber-600" />
                           <span className="text-[10px] text-amber-600 font-black uppercase tracking-widest">موعد الاستحقاق: {safeFormatDate(deadline.dueDate, 'yyyy/MM/dd')}</span>
                        </div>
                      </div>
                      <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 relative z-10">
                    <div className="text-2xl font-black text-amber-600 font-mono tracking-tighter">
                      {formatNumberWithCommas(deadline.requiredPayment)}
                      <span className="text-[10px] text-muted-foreground mr-2 font-sans font-bold italic tracking-normal">د.ع</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                       <span className="text-[10px] text-muted-foreground font-bold">بذمة الصيدلية حالياً</span>
                       <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {deadlines.length === 0 && (
                <div className="col-span-full py-24 text-center text-muted-foreground bg-muted/10 rounded-3xl border-2 border-dashed border-border/50 flex flex-col items-center">
                   <Clock className="h-12 w-12 opacity-20 mb-4" />
                   <p className="font-black text-lg text-foreground/50">لا توجد مواعيد سداد قريبة</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6 animate-in fade-in duration-700">
              <Card className="bg-card border-border rounded-2xl shadow-sm overflow-hidden">
                <CardHeader className="px-8 py-10 border-b border-border bg-muted/20">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <h2 className="text-2xl font-black text-foreground mb-1">سجل العمليات الكامل</h2>
                      <p className="text-muted-foreground font-bold">كافة الحركات المالية والإيرادات والمصاريف</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          placeholder="ابحث في السجل..."
                          className="bg-background border-border pr-12 h-12 rounded-xl text-foreground focus:ring-primary/20 placeholder:font-bold"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button onClick={() => setIsAddExpenseOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 text-white font-black h-12 px-6 rounded-xl shadow-lg shadow-primary/10">
                        <Plus className="h-4 w-4" />
                        إضافة مصروف
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {effectiveAppMode === 'laptop' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr>
                          <th className="px-8 !text-right">التاريخ</th>
                          <th className="px-8 !text-right">البيان والجهة</th>
                          <th className="px-8 !text-right">المبلغ</th>
                          <th className="px-8 text-center">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions
                          .filter(tx => tx.type === 'expense')
                          .filter(tx => 
                            (tx.description || "").includes(searchTerm) || 
                            (tx.entityName && tx.entityName.includes(searchTerm)) ||
                            (tx.category && tx.category.includes(searchTerm)) ||
                            (tx.statement && tx.statement.includes(searchTerm)) ||
                            (tx.partyName && tx.partyName.includes(searchTerm))
                          )
                          .slice(0, 50)
                          .map((tx) => (
                            <tr key={tx.id} className="group hover:bg-primary/5 transition-colors">
                              <td className="px-8 py-6 text-xs text-muted-foreground font-mono font-bold tracking-tight">
                                {safeFormatDate(tx.date, 'yyyy/MM/dd HH:mm')}
                              </td>
                              <td className="px-8 py-6">
                                <div className="font-black text-foreground group-hover:text-primary transition-colors">
                                  {getExpenseStatement(tx)}
                                </div>
                                {tx.type === 'expense' && tx.description && tx.description !== tx.statement && (
                                  <div className="text-[10px] text-muted-foreground font-bold mt-1 px-2 py-0.5 bg-muted rounded-md inline-block">
                                    {tx.description}
                                  </div>
                                )}
                              </td>
                              <td className={`px-8 py-6 font-black font-mono text-lg tracking-tighter ${(tx.type === 'income' || tx.type === 'revenue') ? 'text-primary' : 'text-rose-600'}`}>
                                {(tx.type === 'income' || tx.type === 'revenue') ? '+' : '-'}{formatNumberWithCommas(tx.amount)}
                              </td>
                              <td className="px-8 py-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" onClick={() => {
                                    setSelectedTransaction(tx);
                                    setIsEditTransactionOpen(true);
                                  }}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all" onClick={() => handleDeleteTransaction(tx)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  ) : (
                    <div className="p-4 space-y-4">
                      {transactions
                        .filter(tx => tx.type === 'expense')
                        .filter(tx => 
                          (tx.description || "").includes(searchTerm) || 
                          (tx.entityName && tx.entityName.includes(searchTerm)) ||
                          (tx.category && tx.category.includes(searchTerm)) ||
                          (tx.statement && tx.statement.includes(searchTerm)) ||
                          (tx.partyName && tx.partyName.includes(searchTerm))
                        )
                        .slice(0, 50)
                        .map((tx) => (
                          <div key={tx.id} className="p-4 bg-muted/30 border border-border rounded-2xl space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="text-[10px] text-muted-foreground font-mono">{safeFormatDate(tx.date, 'yyyy/MM/dd HH:mm')}</div>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary transition-all" onClick={() => {
                                  setSelectedTransaction(tx);
                                  setIsEditTransactionOpen(true);
                                }}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all" onClick={() => handleDeleteTransaction(tx)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <div className="font-black text-foreground">{getExpenseStatement(tx)}</div>
                              {tx.type === 'expense' && tx.description && tx.description !== tx.statement && (
                                <div className="text-[9px] text-muted-foreground mt-1">{tx.description}</div>
                              )}
                            </div>
                            <div className={`text-xl font-black font-mono tracking-tighter ${(tx.type === 'income' || tx.type === 'revenue') ? 'text-primary' : 'text-rose-600'}`}>
                              {(tx.type === 'income' || tx.type === 'revenue') ? '+' : '-'}{formatNumberWithCommas(tx.amount)}
                              <span className="text-[10px] mr-1 font-sans">د.ع</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-8 animate-in fade-in duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-card border-border rounded-2xl overflow-hidden relative shadow-sm">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -mr-32 -mt-32" />
                  <CardHeader className="px-8 py-10 relative z-10 border-b border-border/50">
                    <CardTitle className="text-2xl font-black text-foreground">الملف التعريفي للصيدلية</CardTitle>
                    <CardDescription className="text-muted-foreground font-bold">إدارة معلومات الحساب والترخيص</CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 py-10 relative z-10 items-start space-y-8">
                    <div className="flex items-center gap-6 p-6 bg-muted/30 rounded-3xl border border-border shadow-inner">
                      <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/20 shadow-xl shadow-primary/5">
                        <Users className="h-10 w-10 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-black text-2xl text-foreground tracking-tight">{appUser?.displayName || appUser?.username}</h3>
                        <div className="flex items-center gap-2 mt-1 text-muted-foreground font-bold">
                           <ShieldCheck className="h-4 w-4 text-primary" />
                           {appUser?.email}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {[
                         { icon: ShieldCheck, label: 'تغيير كلمة المرور', desc: 'تأمين الحساب بكلمة مرور جديدة', color: 'text-primary', onClick: () => {} },
                         { icon: Monitor, label: 'وضع التشغيل', desc: `الضبط الحقيقي: ${appModeSetting === 'auto' ? 'تلقائي' : appModeSetting === 'laptop' ? 'لابتوب (ثابت)' : 'موبايل (ثابت)'}`, color: 'text-emerald-500', onClick: () => setAppModeSetting(prev => prev === 'auto' ? 'laptop' : prev === 'laptop' ? 'mobile' : 'auto') },
                         { icon: RefreshCcw, label: 'إعادة تعيين الترخيص', desc: 'مسح بيانات الجلسة الحالية', color: 'text-blue-500', onClick: async () => { if(user) { await firebaseService.deleteDocument('users', user.uid); window.location.reload(); } } },
                         { icon: LayoutDashboard, label: 'تخصيص الواجهة', desc: 'تبديل المظهر والألوان', color: 'text-amber-500', onClick: () => {} },
                       ].map((item, idx) => (
                         <Button key={idx} variant="outline" className="h-auto p-6 justify-start gap-4 bg-muted/20 border-border rounded-2xl hover:bg-muted transition-all group" onClick={item.onClick}>
                           <div className={`p-3 rounded-xl bg-muted border border-border group-hover:scale-110 transition-transform ${item.color}`}>
                             <item.icon className="h-5 w-5" />
                           </div>
                           <div className="text-right">
                             <div className="font-black text-foreground">{item.label}</div>
                             <div className="text-[10px] text-muted-foreground font-bold mt-0.5">{item.desc}</div>
                           </div>
                         </Button>
                       ))}
                    </div>

                    <div className="pt-8 border-t border-border flex justify-between items-center">
                       <Button variant="outline" className="border-rose-500/50 text-rose-600 hover:bg-rose-500/10 h-12 px-8 rounded-xl font-black gap-2 transition-all" onClick={() => setIsAppAuthenticated(false)}>
                         <LogOut className="h-4 w-4" />
                         تسجيل الخروج الآمن
                       </Button>
                       <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest italic opacity-50">v2.4.0 • Enterprise Edition</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-8">
                   <Card className="bg-muted/10 border-border rounded-2xl p-8 shadow-sm">
                      <CardTitle className="text-sm font-black text-foreground mb-4 uppercase tracking-widest flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        إدارة الفروع
                      </CardTitle>
                      <p className="text-xs font-bold text-muted-foreground mb-6 leading-relaxed">
                         أضف صيدليات جديدة أو فروعاً أخرى لمؤسستك. يمكنك متابعة كل فرع بشكل مستقل أو مجمع.
                      </p>
                      <Button onClick={() => setActiveTab('branches')} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl h-12 shadow-lg shadow-primary/20 transition-all">
                         دخول مركز إدارة الفروع
                      </Button>
                   </Card>

                   <Card className="bg-primary/5 border-primary/10 rounded-2xl p-8 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform" />
                      <CardTitle className="text-sm font-black text-primary mb-6 uppercase tracking-widest relative z-10">حالة الربط السحابي</CardTitle>
                      <div className="space-y-4 relative z-10">
                        <div className="flex items-center justify-between p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-primary/10">
                           <span className="text-xs font-bold text-muted-foreground">Google Drive</span>
                           <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">متصل الآن</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-primary/10">
                           <span className="text-xs font-bold text-muted-foreground">التزامن التلقائي</span>
                           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                      </div>
                   </Card>

                   <Card className="bg-muted/10 border-border rounded-2xl p-8 shadow-sm">
                      <CardTitle className="text-sm font-black text-foreground mb-6 uppercase tracking-widest">تلميحات النظام</CardTitle>
                      <div className="space-y-4 text-xs font-bold text-muted-foreground leading-relaxed">
                         <p>• استخدم <kbd className="bg-muted px-1.5 py-0.5 rounded border border-border">Ctrl + F</kbd> للبحث السريع في أي صفحة.</p>
                         <p>• يمكنك تصدير التقارير بصيغة PDF من خلال صفحة التقارير المركزية.</p>
                         <p>• اضغط مرتين على أي فاتورة لاستعراض التفاصيل الكاملة وصورة الوصل.</p>
                      </div>
                   </Card>
                </div>
              </div>
             </TabsContent>

            <TabsContent value="branches" className="space-y-4 outline-none">
            <BranchesPage 
              branches={branches}
              currentBranchId={currentBranchId}
              onSelectBranch={handleSelectBranch}
              onAddBranch={handleAddBranch}
              onUpdateBranch={handleUpdateBranch}
              onDeleteBranch={handleDeleteBranch}
              onArchiveBranch={handleArchiveBranch}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-8 animate-in fade-in duration-700">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div className="space-y-1">
                 <h2 className="text-2xl font-black text-foreground">التقارير المالية والتحليلية</h2>
                 <p className="text-muted-foreground text-sm font-bold">مقارنة الأداء الشهري وتتبع التدفق النقدي</p>
               </div>

               <div className="flex bg-muted/30 p-1.5 rounded-2xl border border-border">
                  <button 
                    onClick={() => setReportSubTab('monthly')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${reportSubTab === 'monthly' ? 'bg-card text-primary shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    التحليل الشهري
                  </button>
                  <button 
                    onClick={() => setReportSubTab('period')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${reportSubTab === 'period' ? 'bg-card text-primary shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    تقرير الفترة المالية
                  </button>
               </div>
               
               {reportSubTab === 'monthly' && (
                 <div className="flex flex-wrap items-center gap-3 bg-muted/20 p-2 rounded-2xl border border-border">
                    <div className="flex items-center gap-2 px-3">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span className="text-xs font-black text-muted-foreground uppercase">الفترة:</span>
                    </div>
                    <Select value={reportsMonth.toString()} onValueChange={(v) => setReportsMonth(parseInt(v))}>
                    <SelectTrigger className="w-[140px] h-10 bg-card border-border rounded-xl font-bold">
                      <SelectValue placeholder="الشهر" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <SelectItem key={i} value={i.toString()}>{safeFormatDate(new Date(2024, i), 'MMMM')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={reportsYear.toString()} onValueChange={(v) => setReportsYear(parseInt(v))}>
                    <SelectTrigger className="w-[100px] h-10 bg-card border-border rounded-xl font-bold">
                      <SelectValue placeholder="السنة" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {[2023, 2024, 2025, 2026].map(y => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="h-6 w-px bg-border mx-1" />

                  <Select value={reportsSupplierType} onValueChange={(v: any) => setReportsSupplierType(v)}>
                    <SelectTrigger className="w-[120px] h-10 bg-card border-border rounded-xl font-bold text-xs">
                      <SelectValue placeholder="نوع المورد" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                       <SelectItem value="all">كل الموردين</SelectItem>
                       <SelectItem value="office">مكاتب</SelectItem>
                       <SelectItem value="warehouse">مذاخر</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={reportsSupplierId} onValueChange={setReportsSupplierId}>
                    <SelectTrigger className="w-[200px] h-10 bg-card border-border rounded-xl font-bold text-xs">
                      <SelectValue placeholder="اختيار المورد" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                       <SelectItem value="all">كل الموردين (إجمالي)</SelectItem>
                       {entities.filter(e => e.type === 'office' || e.type === 'warehouse').map(e => (
                         <SelectItem key={e.id} value={e.id!}>{e.name}</SelectItem>
                       ))}
                    </SelectContent>
                  </Select>

                  <div className="h-6 w-px bg-border mx-1" />

                  <Select value={reportTypeFilter} onValueChange={(v: any) => setReportTypeFilter(v)}>
                    <SelectTrigger className="w-[160px] h-10 bg-card border-border rounded-xl font-bold text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                       <SelectItem value="all">كل البيانات (حالي+قديم)</SelectItem>
                       <SelectItem value="current">البيانات الحالية فقط</SelectItem>
                       <SelectItem value="historical">البيانات القديمة فقط</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="h-6 w-px bg-border mx-1" />

                  <Button variant="outline" className="border-border bg-card hover:bg-muted text-foreground gap-2 h-10 px-4 rounded-xl whitespace-nowrap text-xs font-bold" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" />
                    طباعة التقرير
                  </Button>
               </div>
               )}
             </div>

             {reportSubTab === 'monthly' ? (
               <>
                 {/* Supplier Specific Detailed Report */}
             {supplierPurchaseStats && (
               <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-in slide-in-from-top duration-500">
                  <Card className="bg-primary/5 border-primary/20 p-5 rounded-2xl flex flex-col justify-center">
                     <span className="text-[9px] font-black text-primary/60 uppercase mb-1">المورد المختار</span>
                     <span className="text-sm font-black text-foreground truncate">{supplierPurchaseStats.entity?.name}</span>
                     <span className="text-[10px] font-bold text-muted-foreground">{supplierPurchaseStats.entity?.type === 'office' ? 'مكتب' : 'مذخر'}</span>
                  </Card>
                  <Card className="bg-card border-border p-5 rounded-2xl">
                     <span className="text-[9px] font-black text-muted-foreground uppercase mb-1">إجمالي المشتريات</span>
                     <div className="text-xl font-black text-foreground font-mono">{formatNumberWithCommas(supplierPurchaseStats.totalPurchases)}</div>
                     <span className="text-[10px] font-bold text-muted-foreground">{supplierPurchaseStats.count} فاتورة</span>
                  </Card>
                  <Card className="bg-card border-border p-5 rounded-2xl">
                     <span className="text-[9px] font-black text-muted-foreground uppercase mb-1">المسدد</span>
                     <div className="text-xl font-black text-emerald-600 font-mono">{formatNumberWithCommas(supplierPurchaseStats.totalPaid)}</div>
                  </Card>
                  <Card className="bg-card border-border p-5 rounded-2xl">
                     <span className="text-[9px] font-black text-muted-foreground uppercase mb-1">المتبقي</span>
                     <div className="text-xl font-black text-rose-500 font-mono">{formatNumberWithCommas(supplierPurchaseStats.totalRemaining)}</div>
                  </Card>
                  <Card className="bg-card border-border p-5 rounded-2xl">
                     <span className="text-[9px] font-black text-muted-foreground uppercase mb-1">أعلى فاتورة</span>
                     <div className="text-xl font-black text-indigo-600 font-mono">{formatNumberWithCommas(supplierPurchaseStats.highestInvoice)}</div>
                  </Card>
                  <Card className="bg-card border-border p-5 rounded-2xl">
                     <span className="text-[9px] font-black text-muted-foreground uppercase mb-1">حالة الدين</span>
                     <div className={`text-xs font-black p-1 rounded text-center mt-2 ${Number(supplierPurchaseStats.entity?.balance || 0) > 0 ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                        {Number(supplierPurchaseStats.entity?.balance || 0) > 0 ? 'يوجد ديون مستحقة' : 'لا يوجد ديون'}
                     </div>
                  </Card>
               </div>
             )}

             {/* Comparative Stats Cards */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'إجمالي الوارد', value: monthlyComparison.current.revenue, change: monthlyComparison.changes.revenue, icon: BarChart3, color: 'blue' },
                  { label: 'صافي الربح', value: monthlyComparison.current.profit, change: monthlyComparison.changes.profit, icon: TrendingUp, color: 'emerald' },
                  { label: 'إجمالي المشتريات للشهر', value: monthlyComparison.current.invoices, change: monthlyComparison.changes.invoices, icon: ShoppingCart, color: 'indigo' },
                  { label: 'إجمالي المسدد', value: monthlyComparison.current.payments, change: monthlyComparison.changes.payments, icon: CheckCircle2, color: 'blue' },
                  { label: 'الديون المتبقية', value: monthlyComparison.current.remaining, change: monthlyComparison.changes.remaining, icon: AlertCircle, color: 'rose' },
                  { label: 'المصروفات العامة', value: monthlyComparison.current.expenses - monthlyComparison.current.losses, change: 0, icon: ArrowUpCircle, color: 'rose' },
                  { label: 'خسائر (تالف/اكسباير)', value: monthlyComparison.current.losses, change: 0, icon: AlertTriangle, color: 'rose' },
                  { label: 'صافي النتيجة', value: monthlyComparison.current.net, change: monthlyComparison.changes.net, icon: DollarSign, color: 'emerald' },
                ].map((stat, i) => (
                  <Card key={i} className="bg-card border-border p-6 rounded-2xl shadow-sm relative group overflow-hidden border-t-2 border-t-primary/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <stat.icon className="h-5 w-5 opacity-70" />
                      </div>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">{stat.label}</span>
                    </div>
                    <div className="text-2xl font-black text-foreground font-mono tracking-tighter mb-2">
                       {formatNumberWithCommas(stat.value)}
                    </div>
                    {stat.label !== 'المصروفات العامة' && (
                      <div className={`text-[10px] font-black flex items-center gap-1 ${stat.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {stat.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(stat.change).toFixed(1)}% {stat.change >= 0 ? 'زيادة' : 'انخفاض'}
                      </div>
                    )}
                  </Card>
                ))}
             </div>

             {/* Charts Section */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-card border-border p-8 rounded-3xl overflow-hidden shadow-sm">
                   <div className="flex justify-between items-center mb-8">
                      <div>
                        <h3 className="text-lg font-black text-foreground">مشتريات الأشهر</h3>
                        <p className="text-xs text-muted-foreground font-bold">تحليل المشتريات خلال السنة</p>
                      </div>
                   </div>
                   <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={monthlyTimelineData}>
                            <defs>
                               <linearGradient id="colorPurch" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                            <XAxis dataKey="monthName" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)'}} />
                            <YAxis fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)'}} />
                            <Tooltip contentStyle={{backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'right'}} itemStyle={{fontWeight: '900', fontSize: '11px'}} />
                            <Area type="monotone" dataKey="invoices" name="إجمالي المشتريات" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPurch)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </Card>
                <Card className="bg-card border-border p-8 rounded-3xl overflow-hidden shadow-sm">
                   <div className="flex justify-between items-center mb-8">
                      <div>
                        <h3 className="text-lg font-black text-foreground">أداء الوارد والأرباح</h3>
                        <p className="text-xs text-muted-foreground font-bold">تتبع النمو المالي خلال السنة</p>
                      </div>
                   </div>
                   <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={monthlyTimelineData}>
                            <defs>
                               <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                               </linearGradient>
                               <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                            <XAxis dataKey="monthName" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)'}} />
                            <YAxis fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)'}} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : `${v/1000}k`} />
                            <Tooltip contentStyle={{backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'right'}} itemStyle={{fontWeight: '900', fontSize: '11px'}} />
                            <Area type="monotone" dataKey="revenue" name="إجمالي الوارد" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            <Area type="monotone" dataKey="profit" name="صافي الربح" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProf)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </Card>

                <Card className="bg-card border-border p-8 rounded-3xl overflow-hidden shadow-sm">
                   <div className="flex justify-between items-center mb-8">
                      <div>
                         <h3 className="text-lg font-black text-foreground">الفواتير والتسديدات</h3>
                         <p className="text-xs text-muted-foreground font-bold">مقارنة المصوبات مع المبالغ المدفوعة</p>
                      </div>
                   </div>
                   <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={monthlyTimelineData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                            <XAxis dataKey="monthName" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)'}} />
                            <YAxis fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)'}} />
                            <Tooltip contentStyle={{backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'right'}} itemStyle={{fontWeight: '900', fontSize: '11px'}} />
                            <Legend />
                            <Bar dataKey="invoices" name="الفواتير" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="payments" name="التسديدات" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </Card>
             </div>

             {supplierPurchaseStats && supplierPurchaseStats.invoices.length > 0 && (
               <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-sm mt-8 mb-8">
                  <div className="p-8 border-b border-border bg-indigo-500/5 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-indigo-600" />
                        <h3 className="text-xl font-black text-foreground">تفاصيل مشتريات الشهر ({supplierPurchaseStats.entity?.name})</h3>
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-right border-collapse">
                        <thead className="bg-muted/30 text-[10px] font-black text-muted-foreground uppercase border-b border-border">
                           <tr>
                              <th className="px-8 py-6">رقم الفاتورة</th>
                              <th className="px-8 py-6">التاريخ</th>
                              <th className="px-8 py-6">المبلغ</th>
                              <th className="px-8 py-6">المسدد</th>
                              <th className="px-8 py-6">المتبقي</th>
                              <th className="px-8 py-6">الحالة</th>
                              <th className="px-8 py-6 text-left">الإجراء</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                           {supplierPurchaseStats.invoices.sort((a,b) => toValidDate(b.date).getTime() - toValidDate(a.date).getTime()).map((inv, idx) => (
                             <tr key={idx} className="group hover:bg-indigo-50/30 transition-colors">
                               <td className="px-8 py-6 font-bold text-foreground">#{inv.invoiceNumber || idx + 1}</td>
                               <td className="px-8 py-6 text-sm text-muted-foreground font-bold">{safeFormatDate(toValidDate(inv.date), 'yyyy/MM/dd')}</td>
                               <td className="px-8 py-6 font-mono font-black text-foreground">{formatNumberWithCommas(inv.amount)}</td>
                               <td className="px-8 py-6 font-mono font-bold text-emerald-600">{formatNumberWithCommas(inv.paidAmount || 0)}</td>
                               <td className="px-8 py-6 font-mono font-bold text-rose-500">{formatNumberWithCommas(inv.remainingAmount || 0)}</td>
                               <td className="px-8 py-6">
                                  <span className={`text-[10px] font-black px-2 py-1 rounded-full ${Number(inv.remainingAmount || 0) <= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                     {Number(inv.remainingAmount || 0) <= 0 ? 'مسدد بالكامل' : 'يوجد متبقي'}
                                  </span>
                               </td>
                               <td className="px-8 py-6 text-left">
                                  <Button 
                                     variant="ghost" 
                                     size="sm" 
                                     className="h-8 px-3 gap-2 text-primary font-black hover:bg-primary/10 rounded-lg"
                                     onClick={() => {
                                       setViewingInvoice(inv);
                                       setActiveTab('invoice-details');
                                     }}
                                  >
                                     <Eye className="h-4 w-4" />
                                     عرض
                                  </Button>
                               </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </Card>
             )}

             <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="p-8 border-b border-border bg-muted/10 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <ScrollText className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-black text-foreground">سجل الأداء الشهري الشامل</h3>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-right border-collapse">
                      <thead className="bg-muted/30 text-[10px] font-black text-muted-foreground uppercase border-b border-border">
                         <tr>
                            <th className="px-8 py-6">الشهر</th>
                            <th className="px-8 py-6">الوارد</th>
                            <th className="px-8 py-6">الربح</th>
                            <th className="px-8 py-6">الفواتير</th>
                            <th className="px-8 py-6">التسديدات</th>
                            <th className="px-8 py-6">المصاريف</th>
                            <th className="px-8 py-6">الديون المتبقية</th>
                            <th className="px-8 py-6 text-left">صافي النتيجة</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                         {monthlyTimelineData.map((data, idx) => (
                           <tr key={idx} className={`group hover:bg-primary/5 transition-colors ${idx === reportsMonth ? 'bg-primary/5' : ''}`}>
                             <td className="px-8 py-6">
                               <div className="flex flex-col">
                                 <span className="font-black text-foreground">{data.monthName}</span>
                                 {(data as any).hasHistorical && (
                                   <span className="text-[9px] font-black text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded mt-0.5 w-fit">قديمة/مرحّلة</span>
                                 )}
                               </div>
                             </td>
                             <td className="px-8 py-6 font-mono font-bold text-slate-600">{formatNumberWithCommas(data.revenue)}</td>
                             <td className="px-8 py-6 font-mono font-bold text-emerald-600">{formatNumberWithCommas(data.profit)}</td>
                             <td className="px-8 py-6 font-mono font-bold text-indigo-600">{formatNumberWithCommas(data.invoices)}</td>
                             <td className="px-8 py-6 font-mono font-bold text-blue-600">{formatNumberWithCommas(data.payments)}</td>
                             <td className="px-8 py-6 font-mono font-bold text-rose-500">{formatNumberWithCommas(data.expenses)}</td>
                             <td className="px-8 py-6 font-mono font-bold text-amber-500">{formatNumberWithCommas(data.remaining)}</td>
                             <td className="px-8 py-6 text-left">
                                <span className={`text-lg font-black font-mono tracking-tighter ${data.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {formatNumberWithCommas(data.net)}
                                </span>
                             </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </Card>

             {currentBranchId === null && branches.length > 1 && (
                <Card className="bg-primary/5 border-primary/10 rounded-3xl overflow-hidden p-8 mb-20">
                  <div className="flex items-center gap-3 mb-8 relative z-10">
                     <Building2 className="h-6 w-6 text-primary" />
                     <h3 className="text-2xl font-black text-foreground">أداء الفروع المجمع ({safeFormatDate(new Date(reportsYear, reportsMonth), 'MMMM')})</h3>
                  </div>
                  <div className="overflow-x-auto relative z-10">
                      <table className="w-full text-right">
                         <thead className="text-[10px] font-black text-muted-foreground uppercase border-b border-border/50">
                            <tr>
                               <th className="px-8 py-4 text-right">الفرع</th>
                               <th className="px-8 py-4 text-right">الوارد</th>
                               <th className="px-8 py-4 text-right">المصاريف</th>
                               <th className="px-8 py-4 text-left">صافي الربح</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-border/30">
                            {branches.map(branch => {
                              const bTx = transactions.filter(t => t.branchId === branch.id && new Date(t.date) >= startOfMonth(new Date(reportsYear, reportsMonth)) && new Date(t.date) <= endOfMonth(new Date(reportsYear, reportsMonth)));
                              const bSalaries = employeeAttendance.filter(r => r.branchId === branch.id && new Date(r.date) >= startOfMonth(new Date(reportsYear, reportsMonth)) && new Date(r.date) <= endOfMonth(new Date(reportsYear, reportsMonth))).reduce((acc, r) => acc + r.dailyWage, 0);
                              const bRevenue = bTx.filter(t => t.type === 'income').reduce((acc, t) => acc + (t.saleAmount || t.amount), 0);
                              const bProfit = bTx.filter(t => t.type === 'income').reduce((acc, t) => acc + (t.profitAmount || t.netProfit || 0), 0);
                              const bExpense = bTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0) + bSalaries;
                              return (
                                <tr key={branch.id} className="hover:bg-primary/5 transition-colors">
                                   <td className="px-8 py-5 font-black text-foreground">{branch.name}</td>
                                   <td className="px-8 py-5 font-mono font-bold text-emerald-600">{formatIQD(bRevenue)}</td>
                                   <td className="px-8 py-5 font-mono font-bold text-rose-600">{formatIQD(bExpense)}</td>
                                   <td className="px-8 py-5 text-left font-mono font-black text-lg">{formatIQD(bProfit - bExpense)}</td>
                                </tr>
                              );
                            })}
                         </tbody>
                      </table>
                  </div>
                </Card>
             )}
               </>
             ) : (
               <FinancialPeriodReport 
                  transactions={transactions}
                  allLedgerEntries={allLedgerEntries}
                  expiredDamagedLosses={expiredDamagedLosses}
                  historicalRecords={historicalRecords}
                  entities={entities}
                  branches={branches}
                  employeeAttendance={employeeAttendance}
                  customerDebts={customerDebts}
               />
             )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
               <div className="flex items-center justify-between gap-4">
                 <div className="min-w-0">
                   <h2 className="text-xl md:text-2xl font-black text-foreground truncate">الإشعارات</h2>
                   <p className="text-muted-foreground text-xs md:text-sm truncate">تنبيهات النظام ومواعيد السداد</p>
                 </div>
                 <Button variant="ghost" className="text-emerald-500 hover:bg-emerald-500/10 font-bold text-xs shrink-0" onClick={async () => {
                    for (const n of notifications) {
                      if (!n.read) await firebaseService.updateDocument('notifications', n.id!, { read: true });
                    }
                  }}>
                    تمييز الكل
                 </Button>
               </div>

               <Card className="bg-card border-border overflow-hidden rounded-2xl">
                 <div className="divide-y divide-border">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-4 md:p-6 flex gap-4 md:gap-6 transition-all ${n.read ? 'opacity-50' : 'bg-emerald-500/5 border-r-4 border-r-emerald-500'}`}>
                          <div className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center ${
                            n.type === 'deadline' ? 'bg-amber-500/10 text-amber-500' : 
                            n.type === 'invoice' ? 'bg-blue-500/10 text-blue-500' :
                            'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            <Bell className="h-5 w-5 md:h-6 md:w-6" />
                          </div>
                          <div className="flex-1 space-y-1.5 md:space-y-2 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-black text-foreground text-sm md:text-base truncate">{n.title}</h4>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[9px] md:text-xs text-muted-foreground font-mono">{safeFormatDate(n.createdAt, 'MM/dd HH:mm')}</span>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 rounded-lg" onClick={() => firebaseService.deleteDocument('notifications', n.id!)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2">{n.message}</p>
                            {!n.read && (
                               <Button variant="link" className="p-0 h-auto text-[10px] md:text-xs text-emerald-500 font-bold hover:text-emerald-400" onClick={() => firebaseService.updateDocument('notifications', n.id!, { read: true })}>
                                 تمييز كمقروء
                               </Button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-24 text-center">
                        <div className="bg-muted w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 opacity-40">
                          <Bell className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-bold">لا توجد إشعارات حالياً</p>
                      </div>
                    )}
                 </div>
               </Card>
            </TabsContent>

            <TabsContent value="historical" className="animate-in fade-in zoom-in-95 duration-300 pb-20 md:pb-0">
               <HistoricalMigrationPage 
                 branchId={currentBranchId} 
                 ownerId={user?.uid || ''} 
                 onImportExcel={() => setIsExcelImportOpen(true)}
                 onMultiEntry={() => setIsMultiEntryOpen(true)}
               />
            </TabsContent>

            <TabsContent value="medicine-requests" className="animate-in fade-in zoom-in-95 duration-300 pb-20 md:pb-0">
               <MedicineRequestsPage 
                 branchId={currentBranchId} 
                 ownerId={user?.uid || ''} 
                 onDeleteRequest={handleDeleteMedicineRequest}
                 onDeleteImage={handleDeleteRequestImage}
               />
            </TabsContent>

            <TabsContent value="losses" className="animate-in fade-in slide-in-from-left-4 duration-500 pb-20 md:pb-0">
                <LossesPage 
                  losses={expiredDamagedLosses.filter(l => !currentBranchId || l.branchId === currentBranchId)} 
                  onAdd={() => setIsAddLossOpen(true)}
                  onEdit={(loss) => {
                    setSelectedLoss(loss);
                    setIsEditLossOpen(true);
                  }}
                  onDelete={handleDeleteLoss}
                  onViewInvoice={(invoiceId) => {
                     const invoice = (allLedgerEntries || []).find(i => i.id === invoiceId);
                     if (invoice) {
                        setViewingInvoice(invoice);
                        setActiveTab('invoice-details');
                     }
                  }}
                />
            </TabsContent>

            <TabsContent value="settings" className="space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
               <div>
                 <h2 className="text-2xl font-black text-foreground">إعدادات النظام</h2>
                 <p className="text-muted-foreground text-sm">تخصيص الصيدلية، الأمان، وخيارات المزامنة</p>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                  <Card className="bg-card border-border p-6 md:p-8 space-y-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                        <Cloud className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-foreground">المزامنة الاحتياطية</h3>
                        <p className="text-xs text-muted-foreground">Google Drive Sync</p>
                      </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-border">
                       <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl">
                         <div className="min-w-0">
                           <div className="text-sm font-bold text-foreground">حالة الربط</div>
                           <div className="text-[10px] text-muted-foreground truncate">{user?.email || 'غير متصل'}</div>
                         </div>
                         <Button 
                            variant={isDriveLinked ? "outline" : "default"} 
                            className={isDriveLinked ? "border-border text-foreground h-10 px-4" : "bg-emerald-600 hover:bg-emerald-700 h-10 px-6"}
                            onClick={isDriveLinked ? unlinkDrive : linkDrive}
                         >
                           {isDriveLinked ? 'إلغاء الربط' : 'ربط الحساب'}
                         </Button>
                       </div>
                    </div>
                  </Card>

                  <Card className="bg-card border-border p-6 md:p-8 space-y-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                        <History className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-foreground">النسخ الاحتياطي JSON</h3>
                        <p className="text-xs text-muted-foreground">تصدير واستيراد البيانات يدوياً</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                       <Button 
                         variant="outline" 
                         className="h-11 border-border hover:bg-muted text-foreground/80 rounded-xl px-4 gap-2 font-bold"
                         onClick={() => DataPersistenceService.exportToJSON()}
                       >
                         <Download className="h-4 w-4 text-emerald-500" />
                         <span>تصدير</span>
                       </Button>
                       
                       <div className="relative">
                         <input 
                           type="file" 
                           id="import-backup-json" 
                           className="hidden" 
                           accept=".json" 
                           onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file) DataPersistenceService.importFromJSON(file);
                           }}
                         />
                         <Button 
                           variant="outline" 
                           className="w-full h-11 border-border hover:bg-muted text-foreground/80 rounded-xl px-4 gap-2 font-bold"
                           onClick={() => document.getElementById('import-backup-json')?.click()}
                         >
                           <Upload className="h-4 w-4 text-blue-500" />
                           <span>استيراد</span>
                         </Button>
                       </div>

                       <Button 
                         variant="ghost" 
                         className="col-span-2 h-11 text-rose-500 hover:bg-rose-500/10 rounded-xl font-bold border border-rose-500/10"
                         onClick={() => DataPersistenceService.factoryReset()}
                       >
                         <Trash2 className="h-4 w-4" />
                         مسح كافة البيانات
                       </Button>
                    </div>
                  </Card>

                  <Card className="bg-card border-border p-6 md:p-8 space-y-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-foreground">الأمان والحساب</h3>
                        <p className="text-xs text-muted-foreground">إدارة الجلسات وكلمة المرور</p>
                      </div>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-border">
                       <Button variant="outline" className="w-full justify-between h-12 border-border hover:bg-muted text-foreground/80 rounded-xl px-4">
                         <span className="text-sm font-bold">تغيير كلمة المرور</span>
                         <ChevronRight className="h-4 w-4 text-muted-foreground" />
                       </Button>
                       <Button variant="outline" className="w-full justify-between h-12 border-border hover:bg-muted text-rose-500 rounded-xl px-4 font-black" onClick={() => {
                          localStorage.removeItem('pharma-is-authenticated');
                          setIsAppAuthenticated(false);
                       }}>
                         <span>تسجيل الخروج</span>
                         <LogOut className="h-4 w-4" />
                       </Button>
                    </div>
                  </Card>

                  {/* Debug Panel as requested */}
                  <Card className="bg-card border-border p-6 md:p-8 space-y-4 rounded-2xl border-dashed border-primary/30">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
                        <Bug className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-foreground">لوحة المطور (Debug)</h3>
                        <p className="text-xs text-muted-foreground">تشخيص حالة النظام والربط</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border text-[10px] font-mono">
                       <div className="space-y-1">
                         <div className="text-muted-foreground uppercase">Number of Branches</div>
                         <div className="font-bold text-foreground">{branches.length}</div>
                       </div>
                       <div className="space-y-1">
                         <div className="text-muted-foreground uppercase">Selected Branch ID</div>
                         <div className="font-bold text-primary truncate max-w-[100px]">{currentBranchId || 'NULL (Unified)'}</div>
                       </div>
                       <div className="space-y-1">
                         <div className="text-muted-foreground uppercase">Selected Name</div>
                         <div className="font-bold text-foreground">{branches.find(b => b.id === currentBranchId)?.name || 'N/A'}</div>
                       </div>
                       <div className="space-y-1">
                         <div className="text-muted-foreground uppercase">Active Branches</div>
                         <div className="font-bold text-emerald-500">{branches.filter(b => b.status === 'active').length}</div>
                       </div>
                       <div className="col-span-2 space-y-1 overflow-hidden">
                         <div className="text-muted-foreground uppercase">LocalStorage Key</div>
                         <div className="font-bold text-foreground break-all">{localStorage.getItem('pharma-current-branch-id') || 'EMPTY'}</div>
                       </div>
                    </div>
                  </Card>
               </div>
            </TabsContent>
            <TabsContent value="invoice-details" className="animate-in fade-in slide-in-from-left-4 duration-500">
            {viewingInvoice && (
              <InvoiceDetailsPage 
                invoice={viewingInvoice}
                entity={entities.find(e => e.id === viewingInvoice.accountId) || null}
                paymentHistory={allLedgerEntries.filter(e => e.linkedInvoiceId === viewingInvoice.id)}
                appMode={effectiveAppMode}
                onBack={() => {
                  setViewingInvoice(null);
                  setActiveTab('invoices');
                }}
                onEdit={(invoice) => { setViewingInvoice(invoice); setIsEditInvoiceOpen(true); }}
                onPayment={(invoice) => { 
                  setViewingInvoice(invoice); 
                  setPaymentMode('full'); 
                  setPayAmount(invoice.remainingAmount?.toString() || '0');
                  setSelectedEntity(entities.find(e => e.id === invoice.accountId) || null);
                  setIsAddPaymentOpen(true); 
                }}
                onRefund={(invoice) => { setViewingInvoice(invoice); setIsRefundInvoiceOpen(true); }}
                onDelete={(invoice) => { setViewingInvoice(invoice); setIsDeleteInvoiceConfirmOpen(true); }}
                onPrint={() => window.print()}
                onUpdateImageUrls={handleUpdateInvoiceImageUrls}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Reconstructed Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4">
        <Button onClick={() => setIsAddRevenueOpen(true)} size="lg" className="rounded-full h-14 w-14 shadow-2xl bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-500/20">
          <TrendingUp className="h-6 w-6" />
        </Button>
      </div>

      {/* Reconstructed Dialogs */}
      <Dialog open={!!lightboxImage} onOpenChange={(open) => !open && setLightboxImage(null)}>
        <DialogContent className="max-w-4xl bg-slate-950 border-white/5 p-2" dir="rtl">
          <DialogHeader className="sr-only">
             <DialogTitle>معاينة المرفق</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-auto max-h-[85vh] overflow-hidden rounded-lg">
            {lightboxImage ? (
              <img 
                src={lightboxImage} 
                alt="Enlarged view" 
                className="w-full h-full object-contain mx-auto"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-20 text-muted-foreground gap-4">
                <AlertTriangle className="h-12 w-12 text-amber-500" />
                <span className="font-bold text-lg">الصورة غير متوفرة أو تم حذفها</span>
              </div>
            )}
            <button 
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 left-4 h-10 w-10 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Loss Dialog */}
      <Dialog open={isAddLossOpen} onOpenChange={setIsAddLossOpen}>
        <DialogContent dir="rtl" className="bg-card border-border text-foreground sm:max-w-xl lg:max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-black">تسجيل خسارة مادة (تالف / إكسباير)</DialogTitle>
          </DialogHeader>
          <LossForm 
            invoices={allLedgerEntries}
            onSubmit={handleAddLoss}
            onClose={() => setIsAddLossOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Add Entity Dialog */}
      <Dialog open={isAddEntityOpen} onOpenChange={setIsAddEntityOpen}>
        <DialogContent dir="rtl" className="bg-card border-border text-foreground sm:max-w-xl lg:max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-black">إضافة مورد جديد</DialogTitle>
          </DialogHeader>
          <EntityForm 
            onSubmit={handleAddEntity} 
            onClose={() => setIsAddEntityOpen(false)} 
            onImagesChange={setEntityImageFiles}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Entity Dialog */}
      <Dialog open={isEditEntityOpen} onOpenChange={setIsEditEntityOpen}>
        <DialogContent dir="rtl" className="bg-card border-border text-foreground sm:max-w-xl lg:max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-black">تعديل بيانات المورد</DialogTitle>
          </DialogHeader>
          {editingEntity && (
            <EntityForm 
              entity={editingEntity}
              onSubmit={(data) => handleUpdateEntity(editingEntity.id!, data)} 
              onClose={() => setIsEditEntityOpen(false)} 
              onImagesChange={setEntityImageFiles}
            />
          )}
        </DialogContent>
      </Dialog>
      {/* Add Invoice Dialog */}
      <ExcelImportWizard 
        open={isExcelImportOpen} 
        onOpenChange={setIsExcelImportOpen} 
        entities={entities} 
        currentBranchId={currentBranchId || undefined}
        appUser={appUser}
      />

      <MultiInvoiceEntry
        open={isMultiEntryOpen}
        onOpenChange={setIsMultiEntryOpen}
        entities={entities}
        currentBranchId={currentBranchId || 'main'}
        appUser={appUser}
        onImportExcel={() => {
          setIsMultiEntryOpen(false);
          setIsExcelImportOpen(true);
        }}
      />

      {isMultiPaymentOpen && (
        <MultiPaymentEntry 
          entities={entities}
          userId={appUser?.userId || 'guest'}
          branchId={currentBranchId}
          onRefresh={() => {}}
          onClose={() => setIsMultiPaymentOpen(false)}
        />
      )}

      <Dialog open={isAddInvoiceOpen} onOpenChange={setIsAddInvoiceOpen}>
        <DialogContent dir="rtl" className="bg-card border-border text-foreground sm:max-w-2xl lg:max-w-[85vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-black">فاتورة مشتريات جديدة</DialogTitle>
          </DialogHeader>
          <InvoiceForm 
            entities={entities}
            selectedEntity={selectedEntity}
            onSubmit={handleAddInvoice}
            onClose={() => setIsAddInvoiceOpen(false)}
            onImagesChange={setInvImageFiles}
          />
        </DialogContent>
      </Dialog>
      {/* Add Deadline Dialog */}
      <Dialog open={isAddDeadlineOpen} onOpenChange={setIsAddDeadlineOpen}>
        <DialogContent dir="rtl" className="bg-card border-border text-foreground sm:max-w-xl lg:max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-black">إضافة موعد سداد جديد</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDeadline} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">المورد</Label>
                <Select name="entityId">
                  <SelectTrigger className="bg-muted border-border text-foreground h-12 rounded-xl">
                    <SelectValue placeholder="اختر المورد" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    {entities.map(e => <SelectItem key={e.id} value={e.id!}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber" className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">رقم الفاتورة</Label>
                <Input id="invoiceNumber" name="invoiceNumber" required className="bg-muted border-border text-foreground h-12 rounded-xl font-bold" placeholder="مثلاً: 1254" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">مبلغ الفاتورة الكلي</Label>
                <CurrencyInput id="amount" name="amount" required className="bg-muted border-border text-foreground h-12 rounded-xl font-mono" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requiredPayment" className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">المبلغ المطلوب سداده</Label>
                <CurrencyInput id="requiredPayment" name="requiredPayment" required className="bg-muted border-border text-foreground h-12 rounded-xl font-mono text-emerald-500 font-black" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">موعد الاستحقاق</Label>
                <Input id="dueDate" name="dueDate" type="date" required className="bg-muted border-border text-foreground h-12 rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">ملاحظات</Label>
                <Input id="notes" name="notes" className="bg-muted border-border text-foreground h-12 rounded-xl" placeholder="مثلاً: بانتظام سداد الأسبوع المقبل" />
              </div>
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-14 rounded-2xl shadow-lg">حفظ الموعد الجديد</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent dir="rtl" className="bg-card border-border text-foreground sm:max-w-xl lg:max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-black">
              {paymentMode === 'partial' ? 'تسديد جزئي للقائمة' : paymentMode === 'full' ? 'تسديد كلي للقائمة' : 'وصل دفعة سداد'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {paymentMode !== 'normal' ? `تسديد للفاتورة رقم ${viewingInvoice?.invoiceNumber}` : 'تسجيل دفعة نقدية مسددة للمورد'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPayment} className="space-y-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">المورد / الجهة المستلمة</Label>
                  <div className="bg-muted p-4 rounded-xl border border-border font-black text-foreground text-lg shadow-inner">
                    {selectedEntity?.name}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedInvoice" className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">ارتباط برقم قائمة</Label>
                  <div className="relative group">
                    <Input 
                      id="linkedInvoice" 
                      name="linkedInvoice" 
                      defaultValue={viewingInvoice?.invoiceNumber || ''} 
                      readOnly={!!viewingInvoice} 
                      placeholder="رقم القائمة (اختياري)" 
                      className={`bg-muted border-border text-foreground h-14 rounded-xl pr-10 font-bold ${!!viewingInvoice ? 'opacity-70 cursor-not-allowed' : 'focus:ring-2'}`} 
                    />
                    <FileText className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pay_amount" className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">المبلغ المسدد نقداً</Label>
                  <div className="relative group">
                    <CurrencyInput 
                      id="pay_amount" 
                      name="amount" 
                      required 
                      value={payAmount}
                      readOnly={paymentMode === 'full'}
                      onChange={handlePayAmountChange}
                      className={`bg-muted border-border text-foreground h-14 rounded-xl font-mono text-2xl font-black pr-12 ${paymentMode === 'full' ? 'opacity-50' : 'focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                    />
                    <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-emerald-500" />
                  </div>
                  {paymentMode !== 'normal' && viewingInvoice && (
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] text-muted-foreground font-bold italic">إجمالي القائمة: {formatIQD(viewingInvoice.netAmount)}</span>
                      <span className="text-[10px] text-amber-500 font-black">المتبقي: {formatIQD(viewingInvoice.remainingAmount || 0)}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pay_date" className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">تاريخ الوصول / الصرف</Label>
                  <div className="relative">
                    <Input id="pay_date" name="date" type="date" defaultValue={safeFormatDate(new Date(), 'yyyy-MM-dd')} required className="bg-muted border-border text-foreground h-14 rounded-xl pr-10 font-bold" />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {paymentMode === 'normal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-muted/30 border border-border rounded-2xl">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="pay_discount" className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">الخصم المكتسب (تعجيل دفع)</Label>
                      <div className="flex bg-muted p-1 rounded-lg scale-90 origin-right">
                        <button
                          type="button"
                          onClick={() => setPayDiscountType('fixed')}
                          className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${payDiscountType === 'fixed' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >د.ع</button>
                        <button
                          type="button"
                          onClick={() => setPayDiscountType('percentage')}
                          className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${payDiscountType === 'percentage' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >%</button>
                      </div>
                    </div>
                    {payDiscountType === 'percentage' ? (
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          value={payDiscountPercentage}
                          onChange={(e) => handlePayPercentageChange(parseFloat(e.target.value) || 0)}
                          className="bg-card border-emerald-500/20 text-emerald-600 h-14 rounded-xl font-mono text-xl font-black pl-10 text-left"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">%</span>
                      </div>
                    ) : (
                      <CurrencyInput 
                        id="pay_discount" 
                        name="discount" 
                        value={payDiscount}
                        onChange={handlePayDiscountChange}
                        className="bg-card border-emerald-500/20 text-emerald-600 h-14 rounded-xl font-mono text-xl font-black" 
                      />
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="pay_refund" className="text-rose-500 font-black text-[10px] uppercase tracking-widest">قيمة المرتجع النقدي</Label>
                    <CurrencyInput 
                      id="pay_refund" 
                      name="refund" 
                      value={Number(payRefund)}
                      onChange={(val) => setPayRefund(val.toString())}
                      className="bg-card border-rose-500/10 text-rose-500 h-14 rounded-xl font-mono text-xl font-black" 
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">مستند الوصل (اختياري)</Label>
                  <div 
                    className="border-2 border-dashed border-border rounded-2xl p-6 text-center cursor-pointer hover:bg-muted/50 transition-all font-black bg-muted/20 hover:border-primary/50 relative overflow-hidden group"
                    onClick={() => document.getElementById('pay-image-input')?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs text-muted-foreground block">ارفق صورة الوصل الورقي لتوثيق التسديد</span>
                    <input 
                      id="pay-image-input"
                      type="file" 
                      className="hidden" 
                      onChange={(e) => setPayImageFile(e.target.files ? e.target.files[0] : null)}
                      accept="image/*"
                    />
                    {payImageFile && (
                      <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-in fade-in zoom-in-95">
                        <div className="text-[10px] text-emerald-600 font-black truncate">{payImageFile.name}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pay_notes" className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">ملاحظات توضيحية</Label>
                  <Textarea 
                    id="pay_notes" 
                    name="notes" 
                    placeholder="اكتب أي ملاحظات إضافية حول مبلغ السداد أو طريقة التحصيل..." 
                    className="bg-muted border-border text-foreground rounded-2xl min-h-[6rem] font-bold text-sm leading-relaxed" 
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4 mt-2">
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-2xl h-18 rounded-3xl shadow-2xl transition-all scale-100 hover:scale-[1.01] active:scale-[0.98] shadow-emerald-500/30 ring-4 ring-emerald-500/10">
                تسجيل وتأكيد عملية السداد
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Refund Invoice Dialog */}
      <Dialog open={isRefundInvoiceOpen} onOpenChange={setIsRefundInvoiceOpen}>
        <DialogContent dir="rtl" className="bg-card border-border text-foreground sm:max-w-xl lg:max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-black text-rose-500">إرجاع مواد (مرتجع قائمة)</DialogTitle>
            <DialogDescription className="text-muted-foreground">تسجيل مرتجع للفاتورة رقم {viewingInvoice?.invoiceNumber}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddRefund} className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2 p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                <div className="text-xs text-rose-500 font-bold mb-1">صافي الفاتورة الأصلية</div>
                <div className="text-2xl font-black text-foreground font-mono">{formatIQD(viewingInvoice?.netAmount)}</div>
                <div className="text-[10px] text-muted-foreground mt-1">المتبقي حالياً: {formatIQD(viewingInvoice?.remainingAmount || 0)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="refund_amount" className="text-muted-foreground font-bold">قيمة المرتجع</Label>
                  <CurrencyInput 
                    id="refund_amount" 
                    name="refundAmount" 
                    required 
                    placeholder="0,000"
                    className="bg-muted border-border text-foreground h-11 rounded-xl font-mono text-lg" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refund_date" className="text-muted-foreground font-bold">تاريخ الإرجاع</Label>
                  <Input id="refund_date" name="date" type="date" defaultValue={safeFormatDate(new Date(), 'yyyy-MM-dd')} required className="bg-muted border-border text-foreground h-11 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refund_reason" className="text-muted-foreground font-bold">سبب الإرجاع / الملاحظات</Label>
                <Input id="refund_reason" name="reason" required placeholder="تلف، انتهاء صلاحية، خطأ بالطلب..." className="bg-muted border-border text-foreground rounded-xl" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black h-14 rounded-2xl shadow-lg shadow-rose-500/20">تأكيد المرتجع وخصمه من الحساب</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>



      <ViewRevenueDialog 
        isOpen={isViewRevenueOpen} 
        onOpenChange={setIsViewRevenueOpen} 
        revenue={viewingRevenue}
        branches={branches}
      />

      {/* Add Revenue Dialog */}
      <Dialog open={isAddRevenueOpen} onOpenChange={setIsAddRevenueOpen}>
        <DialogContent dir="rtl" className="bg-card border-border text-foreground sm:max-w-xl lg:max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-black">إضافة وارد (دخل جديد)</DialogTitle>
          </DialogHeader>
          <RevenueForm 
            onSubmit={handleAddRevenue} 
            onClose={() => setIsAddRevenueOpen(false)} 
            onImagesChange={setRevenueImageFiles}
          />
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent dir="rtl" className="bg-card border-border text-foreground sm:max-w-xl lg:max-w-[80vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-black">إضافة مصروف جديد</DialogTitle>
          </DialogHeader>
          <ExpenseForm 
            onSubmit={handleAddExpense} 
            onClose={() => setIsAddExpenseOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditTransactionOpen} onOpenChange={setIsEditTransactionOpen}>
        <DialogContent dir="rtl" className="bg-card border-border text-foreground sm:max-w-xl max-h-[95vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-right">تعديل عملية مالية</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedTransaction?.type === 'income' ? (
              <RevenueForm 
                initialData={selectedTransaction}
                onSubmit={handleUpdateTransaction}
                onDelete={() => handleDeleteTransaction(selectedTransaction)}
                onClose={() => setIsEditTransactionOpen(false)}
                onImagesChange={setRevenueImageFiles}
              />
            ) : (
              <ExpenseForm 
                initialData={selectedTransaction}
                onSubmit={handleUpdateTransaction}
                onDelete={() => handleDeleteTransaction(selectedTransaction)}
                onClose={() => setIsEditTransactionOpen(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Announcement Dialog */}
      <Dialog open={isAnnouncementOpen} onOpenChange={setIsAnnouncementOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground" dir="rtl">
          <DialogHeader>
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
              activeAnnouncement?.type === 'alert' ? 'bg-rose-500/10 text-rose-500' :
              activeAnnouncement?.type === 'feature' ? 'bg-blue-500/10 text-blue-500' :
              'bg-emerald-500/10 text-emerald-500'
            }`}>
              {activeAnnouncement?.type === 'alert' ? <AlertCircle className="h-6 w-6" /> : 
               activeAnnouncement?.type === 'feature' ? <CloudLightning className="h-6 w-6" /> : 
               <Info className="h-6 w-6" />}
            </div>
            <DialogTitle className="text-center text-xl text-foreground">{activeAnnouncement?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-muted-foreground whitespace-pre-wrap">{activeAnnouncement?.message}</p>
          </div>
          <DialogFooter>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6 rounded-xl" onClick={handleReadAnnouncement}>فهمت ذلك</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditInvoiceDialog
        isOpen={isEditInvoiceOpen}
        onOpenChange={setIsEditInvoiceOpen}
        onSubmit={handleEditInvoice}
        invoice={viewingInvoice}
        entities={entities}
        selectedEntity={selectedEntity}
        onImagesChange={setInvImageFiles}
      />

      <Dialog open={deleteConfirmState.isOpen} onOpenChange={(open) => setDeleteConfirmState(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent dir="rtl" className="bg-card border-border text-foreground sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-rose-500">{deleteConfirmState.title}</DialogTitle>
            <DialogDescription className="text-muted-foreground font-bold">
              {deleteConfirmState.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">لا يمكن التراجع عن هذه العملية بعد تأكيد الحذف.</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleteConfirmState(prev => ({ ...prev, isOpen: false }))} className="rounded-xl font-bold h-12 flex-1">
              {deleteConfirmState.cancelText || 'إلغاء'}
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteConfirmState.onConfirm} 
              disabled={deleteConfirmState.isLoading}
              className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black h-12 flex-1"
            >
              {deleteConfirmState.isLoading ? 'جاري الحذف...' : (deleteConfirmState.confirmText || 'تأكيد الحذف')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent dir="rtl" className="bg-card border-border text-foreground sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-rose-500">تأكيد الحذف</DialogTitle>
            <DialogDescription className="text-muted-foreground font-bold">
              هل أنت متأكد من حذف المورد: {deletingItem?.label}؟
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">سيتم نقل المورد إلى قائمة المحذوفات. يمكنك استعادته لاحقاً أو أرشفته.</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsDeleteConfirmOpen(false)} className="rounded-xl font-bold">إلغاء</Button>
            <Button 
              variant="destructive" 
              onClick={() => deletingItem?.id && handleSoftDeleteEntity(deletingItem.id)} 
              className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black"
            >
              تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bonus Dialog */}
      <Dialog open={isAddBonusOpen} onOpenChange={setIsAddBonusOpen}>
        <DialogContent dir="rtl" className="bg-card border-border text-foreground sm:max-w-xl lg:max-w-3xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-black">إضافة بونص جديد</DialogTitle>
          </DialogHeader>
          <BonusForm 
            entities={entities}
            selectedEntity={viewingEntityDetail || selectedEntity}
            onSubmit={handleAddBonus}
            onClose={() => setIsAddBonusOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Entity Delete Options Dialog */}
      <Dialog open={isEntityDeleteOptionsOpen} onOpenChange={setIsEntityDeleteOptionsOpen}>
        <DialogContent dir="rtl" className="bg-card border-border text-foreground sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-rose-500">حذف المورد: {deletingEntityData?.name}</DialogTitle>
            <DialogDescription className="text-muted-foreground font-bold">
              هذا المورد لديه سجلات فواتير أو دفعات سابقة. ماذا تريد أن تفعل؟
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
             <div className="bg-muted p-4 rounded-2xl border border-border flex gap-4 items-start">
                <div className="bg-amber-500/10 p-2 rounded-full">
                   <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                   <h4 className="font-black text-sm">مكافحة فقدان البيانات</h4>
                   <p className="text-xs text-muted-foreground mt-1">يحتوي سجل هذا المورد على تفاصيل مالية تؤثر على تقارير الصيدلية السابقة.</p>
                </div>
             </div>

             <div className="grid gap-3">
               <Button 
                 variant="outline" 
                 className="h-16 justify-start px-6 rounded-2xl border-border hover:bg-primary/5 hover:border-primary/30 group"
                 onClick={() => deletingEntityData?.id && handleArchiveEntity(deletingEntityData.id)}
               >
                 <div className="flex flex-col items-start">
                   <span className="font-black text-primary group-hover:translate-x-1 transition-transform">أرشفة المورد</span>
                   <span className="text-[10px] text-muted-foreground">(الاحتفاظ بالفواتير والتقارير - إخفاء من القائمة)</span>
                 </div>
               </Button>

               <Button 
                 variant="destructive" 
                 className="h-16 justify-start px-6 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/20 group"
                 onClick={() => {
                   if (window.confirm('هل أنت متأكد من المسح الكامل؟ سيتم حذف جميع الفواتير والدفعات المرتبطة وسيتم تعديل التقارير التاريخية.')) {
                     deletingEntityData?.id && handleFullDeleteEntity(deletingEntityData.id);
                   }
                 }}
               >
                 <div className="flex flex-col items-start">
                   <span className="font-black group-hover:translate-x-1 transition-transform">حذف المورد وكل بياناته</span>
                   <span className="text-[10px] opacity-70">(مسح نهائي للفواتير والوصلات والمرفقات)</span>
                 </div>
               </Button>
             </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEntityDeleteOptionsOpen(false)} className="w-full h-11 rounded-xl font-bold">إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Historical Import Wizard for Suppliers */}
      {viewingEntityDetail && (
        <SupplierHistoricalImportWizard 
          entity={viewingEntityDetail}
          branchId={currentBranchId}
          ledgerEntries={allLedgerEntries.filter(e => e.accountId === viewingEntityDetail.id)}
          isOpen={isHistoricalWizardOpen}
          onOpenChange={setIsHistoricalWizardOpen}
          onComplete={() => {
            setIsHistoricalWizardOpen(false);
          }}
        />
      )}

      {/* More dialogs will be added as we go... */}
      </div>
    </div>
  );
}
