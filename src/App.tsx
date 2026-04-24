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
  Clock,
  ChevronRight,
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
  RefreshCcw,
  CloudLightning,
  Check,
  Package,
  Info,
  Sun,
  Moon,
  Monitor,
  Gift,
  Building2,
  Clock3,
  ScrollText,
  ArrowLeftRight,
  ArrowLeft,
  Upload,
  Smartphone,
  Laptop,
  BarChart3
} from 'lucide-react';
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
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  db as localDb, 
  type Transaction, 
  type Entity, 
  type LedgerEntry, 
  type Notification, 
  type AppUser, 
  type SystemLog, 
  type CustomerDebt,
  type Deadline,
  type Announcement,
  type ActivationRequest,
  type Bonus,
  type Employee,
  type EmployeeAttendance,
  type PharmacyBranch
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
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { NumericFormat } from 'react-number-format';
import { ExpenseForm } from './components/ExpenseForm';
import { RevenueForm } from './components/RevenueForm';
import { InvoiceForm } from './components/InvoiceForm';
import { EntityForm } from './components/EntityForm';
import { BonusForm } from './components/BonusForm';
import { InvoiceDetailsPage } from './components/InvoiceDetailsPage';
import { EmployeesPage } from './components/EmployeesPage';
import { EmployeeForm } from './components/EmployeeForm';
import { AttendanceForm } from './components/AttendanceForm';
import { BranchesPage } from './components/BranchesPage';
import { BranchForm } from './components/BranchForm';

// Re-using the Invoice Details Dialog fragment from the corrupted file
type Theme = 'light' | 'dark' | 'system';

const ThemeToggle = ({ theme, setTheme }: { theme: Theme, setTheme: (t: Theme) => void }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-foreground hover:bg-slate-800 rounded-xl">
          {theme === 'light' && <Sun className="h-5 w-5" />}
          {theme === 'dark' && <Moon className="h-5 w-5" />}
          {theme === 'system' && <Monitor className="h-5 w-5" />}
        </Button>
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
  invAmount,
  setInvAmount,
  invDiscount,
  setInvDiscount,
  invBonus,
  setInvBonus
}: { 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void; 
  onSubmit: (e: React.FormEvent) => void;
  invoice: LedgerEntry | null;
  invAmount: string;
  setInvAmount: (v: string) => void;
  invDiscount: string;
  setInvDiscount: (v: string) => void;
  invBonus: string;
  setInvBonus: (v: string) => void;
}) => {
  if (!invoice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="bg-card border-border text-foreground max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-black">تعديل فاتورة مشتريات</DialogTitle>
          <DialogDescription className="text-muted-foreground">تعديل بيانات الفاتورة رقم {invoice.invoiceNumber}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_invoiceNumber" className="text-muted-foreground font-bold">رقم القائمة</Label>
                <Input id="edit_invoiceNumber" name="invoiceNumber" defaultValue={invoice.invoiceNumber} required className="bg-muted border-border text-foreground h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_date" className="text-muted-foreground font-bold">تاريخ القائمة</Label>
                <Input id="edit_date" name="date" type="date" defaultValue={format(invoice.date, 'yyyy-MM-dd')} required className="bg-muted border-border text-foreground h-11 rounded-xl" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground font-bold text-xs uppercase tracking-wider">نوع الشراء</Label>
              <Select name="purchaseType" defaultValue={invoice.purchaseType}>
                <SelectTrigger className="bg-muted border-border text-foreground h-11 rounded-xl font-bold">
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="cash">نقدي (واصل)</SelectItem>
                  <SelectItem value="credit">آجل (برسم السداد)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_amount" className="text-muted-foreground font-bold">المبلغ الصافي</Label>
                <Input 
                  id="edit_amount" 
                  name="amount" 
                  type="number" 
                  required 
                  defaultValue={invoice.amount}
                  className="bg-muted border-border text-foreground h-11 rounded-xl font-mono" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_discount" className="text-muted-foreground font-bold text-rose-500">الخصم</Label>
                <Input 
                  id="edit_discount" 
                  name="discount" 
                  type="number" 
                  defaultValue={invoice.discount}
                  className="bg-muted border-border text-rose-500 h-11 rounded-xl font-mono" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
              <div className="space-y-2">
                <Label className="text-blue-700 dark:text-blue-400 font-bold text-xs uppercase">البونص</Label>
                <Input name="bonus" type="number" defaultValue={invoice.bonus} className="bg-background border-blue-500/20 text-blue-500 font-bold font-mono h-10 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-700 dark:text-blue-400 font-bold text-xs uppercase">وصول البونص</Label>
                <Input name="bonusArrivalDate" type="date" defaultValue={invoice.bonusArrivalDate ? format(invoice.bonusArrivalDate, 'yyyy-MM-dd') : ''} className="bg-background border-blue-500/20 text-foreground h-10 rounded-lg" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_dueDate" className="text-amber-600 font-bold">موعد الاستحقاق</Label>
              <Input id="edit_dueDate" name="dueDate" type="date" defaultValue={invoice.dueDate ? format(invoice.dueDate, 'yyyy-MM-dd') : ''} className="bg-muted border-amber-500/20 text-foreground h-11 rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_notes" className="text-muted-foreground font-bold">ملاحظات</Label>
              <Input id="edit_notes" name="notes" defaultValue={invoice.notes} className="bg-muted border-border text-foreground rounded-xl" />
            </div>
          </div>
          <DialogFooter className="pt-4 gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl h-12 border-border font-bold">إلغاء</Button>
            <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-black h-12 rounded-xl shadow-lg shadow-amber-500/20">تحديث البيانات</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const SupplierAccountPage = ({
  entity, 
  onBack, 
  ledgerEntries,
  bonuses,
  onAddInvoice,
  onAddPayment,
  onAddBonus,
  onEditEntity,
  onViewInvoice,
  onEditInvoice,
  onDeleteInvoice,
  onRefundInvoice,
  onPartialPayment,
  onFullPayment,
  appMode = 'laptop'
}: { 
  entity: Entity; 
  onBack: () => void;
  ledgerEntries: LedgerEntry[];
  bonuses: Bonus[];
  onAddInvoice: () => void;
  onAddPayment: () => void;
  onAddBonus: () => void;
  onEditEntity: () => void;
  onViewInvoice: (invoice: LedgerEntry) => void;
  onEditInvoice: (invoice: LedgerEntry) => void;
  onDeleteInvoice: (invoice: LedgerEntry) => void;
  onRefundInvoice: (invoice: LedgerEntry) => void;
  onPartialPayment: (invoice: LedgerEntry) => void;
  onFullPayment: (invoice: LedgerEntry) => void;
  appMode?: 'laptop' | 'mobile';
}) => {
  const stats = useMemo(() => {
    const invoices = ledgerEntries.filter(e => e.operationType === 'invoice');
    const payments = ledgerEntries.filter(e => e.operationType === 'payment');
    
    return {
      totalPurchases: invoices.reduce((acc, i) => acc + i.netAmount, 0),
      totalPayments: payments.reduce((acc, p) => acc + p.amount, 0),
      openInvoices: invoices.filter(i => i.paymentStatus !== 'paid').length,
      overdueInvoices: invoices.filter(i => i.paymentStatus === 'overdue').length,
      pendingBonuses: bonuses.filter(b => b.status === 'pending').length
    };
  }, [ledgerEntries, bonuses]);

  return (
    <div className="space-y-6 animate-in slide-in-from-left duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-muted shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl md:text-2xl font-black text-foreground truncate">{entity.name}</h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                entity.type === 'office' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
              }`}>
                {entity.type === 'office' ? 'مكتب علمي' : 'مذخر/مستودع'}
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground truncate">{entity.phone || 'لا يوجد رقم هاتف'} • آخر تعامل: {ledgerEntries.length > 0 ? format(ledgerEntries[ledgerEntries.length -1].date, 'yyyy/MM/dd') : 'لا يوجد'}</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Button onClick={onEditEntity} variant="outline" size="sm" className="gap-2 border-border text-foreground hover:bg-muted whitespace-nowrap">
            <Edit className="h-4 w-4" />
            تعديل
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-2 text-white shadow-lg shadow-emerald-600/20 whitespace-nowrap flex-1 md:flex-none">
                <Plus className="h-4 w-4" />
                إجراء سريع
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border text-foreground w-48 p-2 rounded-xl">
              <DropdownMenuItem className="gap-2 p-3 cursor-pointer rounded-lg hover:bg-muted" onClick={onAddInvoice}>
                <FileText className="h-4 w-4 text-blue-500" />
                <span>إضافة فاتورة</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 p-3 cursor-pointer rounded-lg hover:bg-muted" onClick={onAddPayment}>
                <Receipt className="h-4 w-4 text-emerald-500" />
                <span>تسديد دفعة</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 p-3 cursor-pointer rounded-lg hover:bg-muted" onClick={onAddBonus}>
                <Gift className="h-4 w-4 text-amber-500" />
                <span>إضافة بونص</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className={`grid gap-4 ${appMode === 'laptop' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2'}`}>
        {[
          { label: 'الرصيد الحالي', value: entity.balance, color: 'text-rose-600', border: 'border-r-rose-500' },
          { label: 'إجمالي المشتريات', value: stats.totalPurchases, color: 'text-foreground', border: 'border-r-primary' },
          { label: 'إجمالي التسديدات', value: stats.totalPayments, color: 'text-emerald-600', border: 'border-r-emerald-500' },
          { label: 'الفواتير المفتوحة', value: stats.openInvoices, color: 'text-foreground', border: 'border-r-blue-500', isCount: true },
          { label: 'الفواتير المتأخرة', value: stats.overdueInvoices, color: 'text-rose-600', border: 'border-r-rose-500', isCount: true },
          { label: 'البونصات المنتظرة', value: stats.pendingBonuses, color: 'text-primary', border: 'border-r-primary', isCount: true },
        ].map((stat, idx) => (
          <Card key={idx} className={`bg-card border-border border-r-4 ${stat.border} group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl`}>
            <CardContent className="p-4 md:p-6 text-center">
              <div className="text-[10px] font-black text-muted-foreground uppercase mb-2 tracking-widest leading-tight">{stat.label}</div>
              <div className={`text-lg md:text-xl font-black ${stat.color} font-mono tracking-tighter`}>
                {stat.isCount ? stat.value : stat.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-muted p-1 border border-border w-full justify-start overflow-x-auto rounded-xl h-auto flex flex-nowrap scrollbar-none">
          <TabsTrigger value="overview" className="gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap">
            <LayoutDashboard className="h-4 w-4" />
            الحساب العام
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap">
            <FileText className="h-4 w-4" />
            الفواتير
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap">
            <Receipt className="h-4 w-4" />
            التسديدات
          </TabsTrigger>
          <TabsTrigger value="bonuses" className="gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap">
            <Gift className="h-4 w-4" />
            البونصات
          </TabsTrigger>
          <TabsTrigger value="attachments" className="gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap">
            <ImageIcon className="h-4 w-4" />
            المرفقات
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap">
            <History className="h-4 w-4" />
            السجل
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 font-sans">
          <TabsContent value="overview" className="animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">معلومات المورد</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">الرصيد الابتدائي</div>
                      <div className="font-bold text-foreground font-mono">{entity.initialBalance.toLocaleString()} د.ع</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">تاريخ الإنشاء</div>
                      <div className="font-bold text-foreground">{entity.createdAt ? format(entity.createdAt, 'yyyy/MM/dd') : '-'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">السقف المالي</div>
                      <div className="font-bold text-rose-500 font-mono">{entity.limit?.toLocaleString() || 0} د.ع</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">حالة الحساب</div>
                      <div className="flex items-center gap-1 text-emerald-500 font-bold">
                        <CheckCircle2 className="h-3 w-3" />
                        نشط
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 border-t border-border pt-4">
                    <div className="text-xs text-muted-foreground">ملاحظات</div>
                    <p className="text-sm text-foreground italic">{entity.notes || 'لا توجد ملاحظات إضافية'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">الكشف السريع</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {ledgerEntries.slice(-5).reverse().map((entry) => (
                      <div key={entry.id} className="p-4 flex justify-between items-center hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            entry.operationType === 'invoice' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {entry.operationType === 'invoice' ? <FileText className="h-4 w-4" /> : <Receipt className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-foreground">
                              {entry.operationType === 'invoice' ? `فاتورة رقم ${entry.invoiceNumber}` : 'دفعة سداد'}
                            </div>
                            <div className="text-[10px] text-muted-foreground">{format(entry.date, 'yyyy/MM/dd HH:mm')}</div>
                          </div>
                        </div>
                        <div className={`font-bold font-mono text-sm ${entry.operationType === 'invoice' ? 'text-blue-500' : 'text-emerald-500'}`}>
                          {entry.operationType === 'invoice' ? '+' : '-'}{entry.netAmount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                    {ledgerEntries.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground text-sm italic">لا يوجد سجل عمليات لهذا المورد حتى الآن</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="invoices" className="animate-in fade-in zoom-in-95 duration-300">
            <Card className="bg-card border-border overflow-hidden">
               {appMode === 'laptop' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-muted/50 border-b border-border text-[10px] font-bold text-muted-foreground uppercase">
                      <tr>
                        <th className="px-6 py-4">رقم القائمة</th>
                        <th className="px-6 py-4 text-center">التاريخ</th>
                        <th className="px-6 py-4">المبلغ الكلي</th>
                        <th className="px-6 py-4">المتبقي</th>
                        <th className="px-6 py-4">الخصم</th>
                        <th className="px-6 py-4 text-center">الاستحقاق</th>
                        <th className="px-6 py-4 text-center">الحالة</th>
                        <th className="px-6 py-4 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {ledgerEntries.filter(e => e.operationType === 'invoice').reverse().map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-muted/30 transition-colors group">
                          <td className="px-6 py-4 font-bold text-foreground">{invoice.invoiceNumber}</td>
                          <td className="px-6 py-4 text-center font-mono text-muted-foreground text-xs">{format(invoice.date, 'yyyy/MM/dd')}</td>
                          <td className="px-6 py-4 font-bold font-mono">{invoice.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 font-bold font-mono text-amber-500">{(invoice.remainingAmount || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 font-bold font-mono text-emerald-500">{invoice.discount?.toLocaleString() || 0}</td>
                          <td className="px-6 py-4 text-center font-mono text-muted-foreground text-xs">{invoice.dueDate ? format(invoice.dueDate, 'yyyy/MM/dd') : '-'}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                              invoice.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-500' :
                              invoice.paymentStatus === 'partial' ? 'bg-blue-500/10 text-blue-500' :
                              invoice.paymentStatus === 'overdue' ? 'bg-rose-500/10 text-rose-500' :
                              'bg-amber-500/10 text-amber-500'
                            }`}>
                              {invoice.paymentStatus === 'paid' ? 'مسدد' :
                               invoice.paymentStatus === 'partial' ? 'جزئي' :
                               invoice.paymentStatus === 'overdue' ? 'متأخر' : 'غير مسدد'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card border-border text-foreground w-48 p-2 rounded-xl">
                                <DropdownMenuItem className="gap-2 p-3 cursor-pointer rounded-lg hover:bg-muted" onClick={() => onViewInvoice(invoice)}>
                                  <Eye className="h-4 w-4 text-blue-500" />
                                  <span>عرض القائمة</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 p-3 cursor-pointer rounded-lg hover:bg-muted" onClick={() => onEditInvoice(invoice)}>
                                  <Edit className="h-4 w-4 text-amber-500" />
                                  <span>تعديل القائمة</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 p-3 cursor-pointer rounded-lg hover:bg-muted" onClick={() => onAddPayment()}>
                                  <DollarSign className="h-4 w-4 text-emerald-500" />
                                  <span>تسديد</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 p-3 cursor-pointer rounded-lg hover:bg-muted" onClick={() => onPartialPayment(invoice)}>
                                  <Clock className="h-4 w-4 text-blue-400" />
                                  <span>تسديد جزئي</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 p-3 cursor-pointer rounded-lg hover:bg-muted" onClick={() => onFullPayment(invoice)}>
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                  <span>تسديد كلي</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 p-3 cursor-pointer rounded-lg hover:bg-muted" onClick={() => onRefundInvoice(invoice)}>
                                  <RefreshCcw className="h-4 w-4 text-rose-500" />
                                  <span>استرجاع (مرتجع)</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuItem className="gap-2 p-3 cursor-pointer rounded-lg hover:bg-muted text-rose-500" onClick={() => onDeleteInvoice(invoice)}>
                                  <Trash2 className="h-4 w-4" />
                                  <span>حذف القائمة</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                      {ledgerEntries.filter(e => e.operationType === 'invoice').length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-20 text-center text-muted-foreground">لا توجد فواتير مسجلة</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
               ) : (
                 <div className="divide-y divide-border">
                    {ledgerEntries.filter(e => e.operationType === 'invoice').reverse().map((invoice) => (
                      <div key={invoice.id} className="p-4 space-y-4 hover:bg-muted/30 transition-colors">
                        <div className="flex justify-between items-start">
                          <div onClick={() => onViewInvoice(invoice)} className="cursor-pointer">
                            <div className="font-black text-foreground">قائمة رقم: {invoice.invoiceNumber}</div>
                            <div className="text-[10px] text-muted-foreground font-bold">{format(invoice.date, 'yyyy/MM/dd')}</div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border text-foreground w-48 p-2 rounded-xl">
                              <DropdownMenuItem className="gap-2 p-3 cursor-pointer rounded-lg hover:bg-muted" onClick={() => onViewInvoice(invoice)}>
                                <Eye className="h-4 w-4 text-blue-500" />
                                <span>عرض القائمة</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 p-3 cursor-pointer rounded-lg hover:bg-muted" onClick={() => onEditInvoice(invoice)}>
                                <Edit className="h-4 w-4 text-amber-500" />
                                <span>تعديل</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 p-3 cursor-pointer rounded-lg hover:bg-muted" onClick={() => onFullPayment(invoice)}>
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                <span>تسديد كلي</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 p-3 cursor-pointer rounded-lg hover:bg-muted text-rose-500" onClick={() => onDeleteInvoice(invoice)}>
                                <Trash2 className="h-4 w-4" />
                                <span>حذف</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                           <div className="p-2 bg-muted rounded-lg flex justify-between">
                              <span className="text-muted-foreground">الصافي:</span>
                              <span className="font-mono text-foreground">{invoice.amount.toLocaleString()}</span>
                           </div>
                           <div className={`p-2 rounded-lg flex justify-between ${invoice.remainingAmount && invoice.remainingAmount > 0 ? 'bg-amber-500/5 text-amber-600' : 'bg-emerald-500/5 text-emerald-600'}`}>
                              <span className="opacity-70">المتبقي:</span>
                              <span className="font-mono">{invoice.remainingAmount?.toLocaleString() || 0}</span>
                           </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            invoice.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-500' :
                            invoice.paymentStatus === 'partial' ? 'bg-blue-500/10 text-blue-500' :
                            invoice.paymentStatus === 'overdue' ? 'bg-rose-500/10 text-rose-500' :
                            'bg-amber-500/10 text-amber-500'
                          }`}>
                            {invoice.paymentStatus === 'paid' ? 'تم التسديد' : 
                             invoice.paymentStatus === 'overdue' ? 'متأخرة السداد' : 'قيد الانتظار'}
                          </span>
                          {invoice.dueDate && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>الاستحقاق: {format(invoice.dueDate, 'MM/dd')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {ledgerEntries.filter(e => e.operationType === 'invoice').length === 0 && (
                      <div className="py-20 text-center text-muted-foreground">لا تنوجد فواتير مسجلة</div>
                    )}
                 </div>
               )}
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="animate-in fade-in zoom-in-95 duration-300">
             <div className="space-y-6 relative before:absolute before:right-6 before:top-4 before:bottom-4 before:w-px before:bg-border">
                {ledgerEntries.filter(e => e.operationType === 'payment').reverse().map((payment, idx) => (
                  <div key={payment.id} className="relative pr-12">
                    <div className="absolute right-[21px] top-1 w-2 h-2 rounded-full bg-emerald-500 border-2 border-background z-10" />
                    <Card className="bg-card border-border overflow-hidden">
                       <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Receipt className="h-5 w-5 text-emerald-500" />
                             </div>
                             <div>
                                <CardTitle className="text-sm font-bold">تسديد دفعة مالية</CardTitle>
                                <div className="text-[10px] text-muted-foreground">{format(payment.date, 'yyyy/MM/dd HH:mm')}</div>
                             </div>
                          </div>
                          <div className="text-lg font-black text-emerald-500 font-mono">-{payment.amount.toLocaleString()}</div>
                       </CardHeader>
                       <CardContent className="p-4 pt-0">
                          <p className="text-xs text-muted-foreground mb-4">{payment.notes || 'لا يوجد ملاحظات على هذه الدفعة'}</p>
                          {payment.imageUrl && (
                             <div className="w-32 h-32 rounded-lg border border-border overflow-hidden cursor-zoom-in" onClick={() => window.open(payment.imageUrl, '_blank')}>
                                <img src={payment.imageUrl} alt="Bond" className="w-full h-full object-cover" />
                             </div>
                          )}
                       </CardContent>
                    </Card>
                  </div>
                ))}
                {ledgerEntries.filter(e => e.operationType === 'payment').length === 0 && (
                  <div className="py-20 text-center text-muted-foreground">لا توجد سجلات دفع لهذا المورد</div>
                )}
             </div>
          </TabsContent>

          <TabsContent value="bonuses" className="animate-in fade-in zoom-in-95 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bonuses.reverse().map((bonus) => (
                  <Card key={bonus.id} className="bg-card border-border overflow-hidden">
                    <div className={`h-1.5 w-full ${bonus.status === 'received' ? 'bg-emerald-500' : bonus.status === 'pending' ? 'bg-amber-500' : 'bg-slate-500'}`} />
                    <CardHeader className="p-4">
                       <div className="flex justify-between items-start">
                          <div>
                             <CardTitle className="text-base font-bold">{bonus.description}</CardTitle>
                             <div className="text-xs text-muted-foreground mt-1">تاريخ الاستحقاق: {format(bonus.dueDate, 'yyyy/MM/dd')}</div>
                          </div>
                          <Gift className={`h-5 w-5 ${bonus.status === 'received' ? 'text-emerald-500' : 'text-amber-500'}`} />
                       </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                       <div className="flex justify-between items-center">
                          <div className="text-xl font-black text-foreground font-mono">{bonus.amount?.toLocaleString() || 0}</div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                             bonus.status === 'received' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {bonus.status === 'received' ? 'تم الاستلام' : 'قيد الانتظار'}
                          </span>
                       </div>
                       {bonus.notes && <p className="text-xs text-muted-foreground italic border-t border-border pt-4">{bonus.notes}</p>}
                    </CardContent>
                  </Card>
                ))}
                {bonuses.length === 0 && (
                  <div className="col-span-full py-20 text-center text-muted-foreground">لا توجد بونصات مسجلة حالياً</div>
                )}
             </div>
          </TabsContent>

          <TabsContent value="attachments" className="animate-in fade-in zoom-in-95 duration-300">
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {ledgerEntries.filter(e => e.imageUrl || e.receiptImageUrl).map((e) => (
                  <Card key={e.id} className="group relative aspect-square overflow-hidden border-border bg-muted cursor-zoom-in hover:border-emerald-500 transition-all" onClick={() => window.open(e.imageUrl || e.receiptImageUrl, '_blank')}>
                    <img src={e.imageUrl || e.receiptImageUrl} alt="Attachment" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                       <span className="text-[10px] text-white font-bold">{e.operationType === 'invoice' ? 'صورة فاتورة' : 'صورة وصل'}</span>
                       <span className="text-[8px] text-white/60 font-mono mt-1">{format(e.date, 'yyyy/MM/dd')}</span>
                    </div>
                  </Card>
                ))}
                {ledgerEntries.filter(e => e.imageUrl || e.receiptImageUrl).length === 0 && (
                  <div className="col-span-full py-20 text-center text-muted-foreground italic">لا توجد مرفقات صور لهذا الحساب</div>
                )}
             </div>
          </TabsContent>

          <TabsContent value="timeline" className="animate-in fade-in zoom-in-95 duration-300">
             <div className="space-y-4">
                {[...ledgerEntries, ...bonuses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((item: any, idx) => (
                   <div key={item.id} className="flex gap-4 items-start border-r-2 border-border pr-2 pb-4">
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                         item.operationType === 'invoice' ? 'bg-blue-500/10 text-blue-500' :
                         item.operationType === 'payment' ? 'bg-emerald-500/10 text-emerald-500' :
                         'bg-purple-500/10 text-purple-500'
                      }`}>
                         {item.operationType === 'invoice' ? <FileText className="h-4 w-4" /> :
                          item.operationType === 'payment' ? <Receipt className="h-4 w-4" /> :
                          <Gift className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-center">
                            <h4 className="text-sm font-bold text-foreground">
                               {item.operationType === 'invoice' ? `أضافة فاتورة جديدة رقم ${item.invoiceNumber}` :
                                item.operationType === 'payment' ? `تسديد دفعة مالية بمبلغ ${item.amount.toLocaleString()}` :
                                `تسجيل بونص جديد: ${item.description}`}
                            </h4>
                            <span className="text-[10px] text-muted-foreground font-mono">{format(item.createdAt, 'yyyy/MM/dd HH:mm')}</span>
                         </div>
                         <p className="text-xs text-muted-foreground mt-1">{item.notes || 'تمت العملية بنجاح بواسطة النظام'}</p>
                      </div>
                   </div>
                ))}
             </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default function App() {
  const { user, isDriveLinked, loading: authLoading } = useGoogleAuth();
  
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
  const [activeTab, setActiveTab] = useState('finance');
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
    
    // Auto mode breakpoints: Mobile < 768px, Tablet/Desktop >= 768px
    return windowWidth < 768 ? 'mobile' : 'laptop';
  }, [appModeSetting, windowWidth]);

  // Persist preference
  useEffect(() => {
    localStorage.setItem('pharma-app-mode-setting', appModeSetting);
  }, [appModeSetting]);

  const [currentBranchId, setCurrentBranchId] = useState<string | null>(localStorage.getItem('pharma-current-branch-id'));

  const handleSelectBranch = (id: string | null) => {
    setCurrentBranchId(id);
    if (id) {
      localStorage.setItem('pharma-current-branch-id', id);
    } else {
      localStorage.removeItem('pharma-current-branch-id');
    }
    toast.success(id ? 'تم التبديل لمكان العمل المختار' : 'تم تفعيل العرض الموحد');
  };

  const branches = useLiveQuery(() => localDb.branches.toArray()) || [];

  const transactions = useLiveQuery(() => {
    let query = localDb.transactions.orderBy('date').reverse();
    if (currentBranchId) {
      return localDb.transactions.where('branchId').equals(currentBranchId).reverse().sortBy('date');
    }
    return query.toArray();
  }, [currentBranchId]) || [];

  const entities = useLiveQuery(() => {
    if (currentBranchId) return localDb.entities.where('branchId').equals(currentBranchId).toArray();
    return localDb.entities.toArray();
  }, [currentBranchId]) || [];

  const notifications = useLiveQuery(() => {
    if (currentBranchId) return localDb.notifications.where('branchId').equals(currentBranchId).reverse().sortBy('createdAt');
    return localDb.notifications.orderBy('createdAt').reverse().toArray();
  }, [currentBranchId]) || [];

  const bonuses = useLiveQuery(() => {
    if (currentBranchId) return localDb.bonuses.where('branchId').equals(currentBranchId).toArray();
    return localDb.bonuses.toArray();
  }, [currentBranchId]) || [];

  const employees = useLiveQuery(() => {
    if (currentBranchId) return localDb.employees.where('branchId').equals(currentBranchId).toArray();
    return localDb.employees.toArray();
  }, [currentBranchId]) || [];

  const employeeAttendance = useLiveQuery(() => {
    if (currentBranchId) return localDb.employeeAttendance.where('branchId').equals(currentBranchId).toArray();
    return localDb.employeeAttendance.toArray();
  }, [currentBranchId]) || [];

  const allLedgerEntries = useLiveQuery(() => {
    if (currentBranchId) return localDb.ledgerEntries.where('branchId').equals(currentBranchId).toArray();
    return localDb.ledgerEntries.toArray();
  }, [currentBranchId]) || [];

  const customerDebts = useLiveQuery(() => {
    if (currentBranchId) return localDb.customerDebts.where('branchId').equals(currentBranchId).toArray();
    return localDb.customerDebts.toArray();
  }, [currentBranchId]) || [];

  const [appUser, setAppUser] = useState<AppUser | null>(null);
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
    { id: 'revenues', label: 'الإيرادات', icon: CreditCard },
    { id: 'entities', label: 'الموردون والمذاخر', icon: Building2 },
    { id: 'employees', label: 'الموظفون', icon: Users },
    { id: 'invoices', label: 'الفواتير', icon: FileText },
    { id: 'payments', label: 'التسديدات', icon: Receipt },
    { id: 'transactions', label: 'المصاريف العامة', icon: ArrowUpCircle },
    { id: 'notifications', label: 'الإشعارات', icon: Bell, badge: (notifications || []).filter(n => !n.read).length },
    { id: 'reports', label: 'التقارير', icon: PieChart },
    { id: 'branches', label: 'إدارة الصيدليات', icon: Building2 },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ].filter(item => {
    if (item.id === 'branches') return userPermissions.canManageBranches;
    if (item.id === 'reports') return userPermissions.canViewReports;
    return true;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [entitySearch, setEntitySearch] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [viewingEntityDetail, setViewingEntityDetail] = useState<Entity | null>(null);
  
  const ledgerEntries = useLiveQuery(() => {
    if (!selectedEntity?.id) return Promise.resolve([]);
    return localDb.ledgerEntries.where('accountId').equals(selectedEntity.id).sortBy('date');
  }, [selectedEntity?.id]);

  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isEditEntityOpen, setIsEditEntityOpen] = useState(false);
  const [isEditTransactionOpen, setIsEditTransactionOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isEditLedgerEntryOpen, setIsEditLedgerEntryOpen] = useState(false);
  const [selectedLedgerEntry, setSelectedLedgerEntry] = useState<LedgerEntry | null>(null);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);
  const [selectedDeadline, setSelectedDeadline] = useState<LedgerEntry | null>(null);
  const [deadlineFilter, setDeadlineFilter] = useState<'all' | 'today' | 'week' | 'month' | 'overdue'>('all');
  const [deadlineSearch, setDeadlineSearch] = useState('');
  const [isBulkEntryOpen, setIsBulkEntryOpen] = useState(false);
  const [bulkEntries, setBulkEntries] = useState<any[]>([]);
  
  const [isAddRevenueOpen, setIsAddRevenueOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddBonusOpen, setIsAddBonusOpen] = useState(false);
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
  
  const [payAmount, setPayAmount] = useState<string>('');
  const [payDiscount, setPayDiscount] = useState<string>('0');
  const [payRefund, setPayRefund] = useState<string>('0');
  const [payLinkedInvoice, setPayLinkedInvoice] = useState<string>('');

  const [deadlineAmount, setDeadlineAmount] = useState<string>('');
  const [deadlineDiscount, setDeadlineDiscount] = useState<string>('0');
  const [deadlineRefund, setDeadlineRefund] = useState<string>('0');
  const [deadlineRequiredPayment, setDeadlineRequiredPayment] = useState<string>('');

  const [txImageFile, setTxImageFile] = useState<File | null>(null);
  const [invImageFile, setInvImageFile] = useState<File | null>(null);
  const [payImageFile, setPayImageFile] = useState<File | null>(null);
  const [dlInvImageFile, setDlInvImageFile] = useState<File | null>(null);
  const [dlRecImageFile, setDlRecImageFile] = useState<File | null>(null);
  const [editLeImageFile, setEditLeImageFile] = useState<File | null>(null);

  const [isAppAuthenticated, setIsAppAuthenticated] = useState(false);
  const [authStatusLoading, setAuthStatusLoading] = useState(true);
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authResetCode, setAuthResetCode] = useState('');
  const [authSecurityQuestion, setAuthSecurityQuestion] = useState('');
  const [authSecurityAnswer, setAuthSecurityAnswer] = useState('');
  const [authStep, setAuthStep] = useState<'register' | 'waiting' | 'setup-password' | 'login-password' | 'forgot-password' | 'security-reset' | 'recovery-request' | 'authenticated'>('login-password');

  const activationCodes = useLiveQuery(() => localDb.activationCodes.toArray()) || [];
  const activationRequests = useLiveQuery(() => localDb.activationRequests.toArray()) || [];
  const recoveryRequests = useLiveQuery(() => localDb.recoveryRequests.toArray()) || [];
  const deadlines = useLiveQuery(() => localDb.deadlines.toArray()) || [];

  const [isEditInvoiceOpen, setIsEditInvoiceOpen] = useState(false);
  const [isDeleteInvoiceConfirmOpen, setIsDeleteInvoiceConfirmOpen] = useState(false);
  const [isRefundInvoiceOpen, setIsRefundInvoiceOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<LedgerEntry | null>(null);
  const [paymentMode, setPaymentMode] = useState<'normal' | 'partial' | 'full'>('normal');

  const [isAddCodeOpen, setIsAddCodeOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  
  const announcements = useLiveQuery(() => localDb.announcements.where('isActive').equals(1).toArray()) || [];
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementType, setAnnouncementType] = useState<'update' | 'feature' | 'bugfix' | 'alert'>('update');
  const [announcementDisplayType, setAnnouncementDisplayType] = useState<'once' | 'permanent'>('once');
  const [sendEmailAlso, setSendEmailAlso] = useState(false);
  const readAnnouncementsData = useLiveQuery(() => user ? localDb.announcementReads.where('userId').equals(user.uid).toArray() : Promise.resolve([]), [user?.uid]) || [];

  const [isPublishingAnnouncement, setIsPublishingAnnouncement] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  
  const [syncSettings, setSyncSettings] = useState<SyncSettings>(() => {
    const saved = localStorage.getItem('pharmacy_sync_settings');
    return saved ? JSON.parse(saved) : { enabled: false, interval: 30, lastSync: null };
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [imageSettings, setImageSettings] = useState<ImageManagementSettings>(() => {
    const saved = localStorage.getItem('pharmacy_image_settings');
    return saved ? JSON.parse(saved) : { retentionYears: 3, autoDelete: false, lastCleanup: null };
  });

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
      await localDb.announcementReads.add({
        announcementId: activeAnnouncement.id,
        userId: user.uid,
        readAt: new Date()
      });
      setIsAnnouncementOpen(false);
      setActiveAnnouncement(null);
    }
  };

  // Stats logic
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const monthStart = startOfMonth(new Date());
    
    // Daily revenue (Income today)
    const dailyRevenue = transactions
      .filter(tx => tx.type === 'income' && startOfDay(new Date(tx.date)).getTime() === today.getTime())
      .reduce((acc, tx) => acc + tx.amount, 0);

    // Monthly revenue (Income this month)
    const monthlyRevenue = transactions
      .filter(tx => tx.type === 'income' && new Date(tx.date) >= monthStart)
      .reduce((acc, tx) => acc + tx.amount, 0);

    const monthlySalary = employeeAttendance
      .filter(record => new Date(record.date) >= monthStart)
      .reduce((acc, record) => acc + record.dailyWage, 0);

    // Monthly Expense
    const monthlyExpense = transactions
      .filter(tx => tx.type === 'expense' && new Date(tx.date) >= monthStart)
      .reduce((acc, tx) => acc + tx.amount, 0) + monthlySalary;

    // Net Profit & Percentage (This Month)
    const netProfit = monthlyRevenue - monthlyExpense;
    const profitPercentage = monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0;

    // Supplier Dues
    const supplierDues = entities.reduce((acc, e) => acc + e.balance, 0);

    // Due InvoicesCount
    const dueInvoicesCount = (allLedgerEntries || []).filter(e => 
      e.operationType === 'invoice' && 
      e.paymentStatus !== 'paid'
    ).length;

    const bTx = transactions;
    const bEntities = entities;
    
    // Total Revenue (All time or monthly? User usually means monthly for current performance)
    const totalRevenue = bTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = bTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0) + 
      employeeAttendance.reduce((acc, record) => acc + record.dailyWage, 0);
    
    return {
      dailyRevenue,
      monthlyRevenue,
      monthlyExpense,
      netProfit,
      profitPercentage,
      supplierDues,
      dueInvoices: dueInvoicesCount,
      totalRevenue,
      totalExpense,
      totalNetProfit: totalRevenue - totalExpense
    };
  }, [transactions, entities, allLedgerEntries, employeeAttendance]);

  const branchComparison = useMemo(() => {
    if (branches.length === 0) return [];
    
    return branches.map(branch => {
      // In master mode, transactions/entities contain everything but with branchId
      // In branch mode, they are already filtered but we still group to be consistent
      const bTx = transactions.filter(t => t.branchId === branch.id);
      const bEntities = entities.filter(e => e.branchId === branch.id);
      
      const revenue = bTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const expense = bTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      const dues = bEntities.reduce((acc, e) => acc + e.balance, 0);
      
      return {
        id: branch.id,
        name: branch.name,
        revenue,
        expense,
        profit: revenue - expense,
        dues
      };
    });
  }, [branches, transactions, entities]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return format(d, 'yyyy-MM-dd');
    });

    return last7Days.map(dateStr => {
      const dayIncome = transactions
        .filter(tx => tx.type === 'income' && format(new Date(tx.date), 'yyyy-MM-dd') === dateStr)
        .reduce((acc, tx) => acc + tx.amount, 0);
      
      const daySalary = employeeAttendance
        .filter(record => format(new Date(record.date), 'yyyy-MM-dd') === dateStr)
        .reduce((acc, record) => acc + record.dailyWage, 0);
      
      const dayExpense = transactions
        .filter(tx => tx.type === 'expense' && format(new Date(tx.date), 'yyyy-MM-dd') === dateStr)
        .reduce((acc, tx) => acc + tx.amount, 0) + daySalary;

      return {
        name: format(new Date(dateStr), 'EEE', { locale: ar }),
        income: dayIncome,
        expense: dayExpense,
        profit: dayIncome - dayExpense
      };
    });
  }, [transactions, employeeAttendance]);

  // Handlers
  const handleViewInvoice = (invoice: LedgerEntry) => {
    setViewingInvoice(invoice);
    setActiveTab('invoice-details');
  };

  const handleEntityClick = (entity: Entity) => {
    setViewingEntityDetail(entity);
  };

  const handleAddEntity = async (data: any) => {
    const initialBalance = Number(data.initialBalance) || 0;
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
      branchId: currentBranchId || undefined,
      ownerId: user?.uid || 'guest',
      createdAt: new Date()
    };
    
    try {
      await localDb.entities.add(newEntity as Entity);
      setIsAddEntityOpen(false);
      toast.success('تم إضافة المورد بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء إضافة المورد');
    }
  };

  const handleAddEmployee = async (data: Partial<Employee>) => {
    if (!appUser) return;
    try {
      await localDb.employees.add({
        ...data as Employee,
        branchId: currentBranchId || undefined,
        ownerId: appUser.userId,
        createdAt: new Date(),
      });
      toast.success('تم إضافة الموظف بنجاح');
    } catch (error) {
      console.error(error);
      toast.error('فشل في إضافة الموظف');
    }
  };

  const handleUpdateEmployee = async (id: string, data: Partial<Employee>) => {
    try {
      await localDb.employees.update(id, data);
      toast.success('تم تحديث بيانات الموظف');
    } catch (error) {
      console.error(error);
      toast.error('فشل في تحديث البيانات');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await localDb.employees.delete(id);
      // Delete their attendance too
      const relatedAttendance = await localDb.employeeAttendance.where('employeeId').equals(id).toArray();
      await localDb.employeeAttendance.bulkDelete(relatedAttendance.map(a => a.id!));
      toast.success('تم حذف الموظف وسجلاته');
    } catch (error) {
      console.error(error);
      toast.error('فشل في الحذف');
    }
  };

  const handleAddAttendance = async (data: Partial<EmployeeAttendance>) => {
    if (!appUser) return;
    try {
      await localDb.employeeAttendance.add({
        ...data as EmployeeAttendance,
        branchId: currentBranchId || undefined,
        ownerId: appUser.userId,
        createdAt: new Date(),
      });
      toast.success('تم تسجيل الحضور بنجاح');
    } catch (error) {
      console.error(error);
      toast.error('فشل في تسجيل الحضور');
    }
  };

  const handleUpdateAttendance = async (id: string, data: Partial<EmployeeAttendance>) => {
    try {
      await localDb.employeeAttendance.update(id, data);
      toast.success('تم تحديث سجل الحضور');
    } catch (error) {
      console.error(error);
      toast.error('فشل في التحديث');
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    try {
      await localDb.employeeAttendance.delete(id);
      toast.success('تم حذف سجل الحضور');
    } catch (error) {
      console.error(error);
      toast.error('فشل في الحذف');
    }
  };

  const handleAddBranch = async (data: Partial<PharmacyBranch>) => {
    if (!appUser) return;
    try {
      await localDb.branches.add({
        ...data as PharmacyBranch,
        ownerId: appUser.userId,
        createdAt: new Date(),
        status: 'active'
      });
      toast.success('تم إضافة الصيدلية/الفرع بنجاح');
    } catch (error) {
      console.error(error);
      toast.error('فشل في الإضافة');
    }
  };

  const handleUpdateBranch = async (id: string, data: Partial<PharmacyBranch>) => {
    try {
      await localDb.branches.update(id, data);
      toast.success('تم تحديث بيانات الفرع');
    } catch (error) {
      console.error(error);
      toast.error('فشل في التحديث');
    }
  };

  const handleArchiveBranch = async (id: string) => {
    try {
      await localDb.branches.update(id, { status: 'archived' });
      if (currentBranchId === id) setCurrentBranchId(null);
      toast.success('تم أرشفة الفرع');
    } catch (error) {
      console.error(error);
      toast.error('فشل في الأرشفة');
    }
  };

  const handleDeleteBranch = async (id: string) => {
    try {
      await localDb.branches.delete(id);
      // Optional: Cascade delete or leave orphaned (local DB usually safe to leave but better to clean)
      if (currentBranchId === id) setCurrentBranchId(null);
      toast.success('تم حذف الفرع نهائياً');
    } catch (error) {
      console.error(error);
      toast.error('فشل في الحذف');
    }
  };

  const handleAddInvoice = async (data: any) => {
    const entityToInvoice = entities.find(e => e.id === data.accountId) || selectedEntity;
    if (!entityToInvoice?.id) return;
    
    const amount = Number(data.amount);
    const discount = Number(data.discount) || 0;
    const bonus = Number(data.bonus) || 0;
    const netAmount = amount - discount;
    const purchaseType = data.purchaseType;
    
    let imageUrl = '';
    if (invImageFile) {
      imageUrl = URL.createObjectURL(invImageFile);
    }

    const newEntry: Omit<LedgerEntry, 'id'> = {
      accountId: entityToInvoice.id,
      accountName: entityToInvoice.name,
      accountType: entityToInvoice.type,
      date: data.date,
      operationType: 'invoice',
      purchaseType: purchaseType,
      invoiceNumber: data.invoiceNumber as string,
      amount,
      discount,
      bonus,
      bonusArrivalDate: data.bonusArrivalDate,
      dueDate: data.dueDate,
      netAmount,
      paidAmount: purchaseType === 'cash' ? netAmount : 0,
      remainingAmount: purchaseType === 'cash' ? 0 : netAmount,
      paymentStatus: purchaseType === 'cash' ? 'paid' : 'pending',
      balanceAfterOperation: entityToInvoice.balance + netAmount,
      imageUrl,
      notes: data.notes as string,
      ownerId: user?.uid || 'guest',
      branchId: currentBranchId || undefined,
      createdAt: new Date()
    };
    
    try {
      await localDb.ledgerEntries.add(newEntry as LedgerEntry);
      await localDb.entities.update(entityToInvoice.id, {
        balance: entityToInvoice.balance + netAmount,
        totalInvoices: entityToInvoice.totalInvoices + 1
      });

      if (newEntry.dueDate) {
        await localDb.deadlines.add({
          accountId: entityToInvoice.id,
          accountName: entityToInvoice.name,
          invoiceId: '', 
          invoiceNumber: newEntry.invoiceNumber || '',
          amount: newEntry.amount,
          requiredPayment: newEntry.netAmount,
          dueDate: newEntry.dueDate,
          status: 'pending',
          ownerId: user?.uid || 'guest',
          branchId: currentBranchId || undefined,
          createdAt: new Date()
        });
      }

      setIsAddInvoiceOpen(false);
      setInvAmount('');
      setInvDiscount('0');
      setInvBonus('0');
      setInvImageFile(null);
      toast.success('تم إضافة الفاتورة بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء إضافة الفاتورة');
    }
  };

  const handleAddDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Find the entity for this deadline
    const entityId = formData.get('entityId') as string;
    const targetEntity = entities.find(e => e.id === entityId);
    
    if (!targetEntity) {
      toast.error('لم يتم العثور على المورد');
      return;
    }

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
      ownerId: user?.uid || 'guest',
      branchId: currentBranchId || undefined,
      createdAt: new Date()
    };
    
    try {
      await localDb.deadlines.add(newDeadline as Deadline);
      setIsAddDeadlineOpen(false);
      toast.success('تم إضافة موعد السداد بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء إضافة موعد السداد');
    }
  };

  const handleAddBonus = async (data: any) => {
    const bonusEntity = entities.find(e => e.id === data.entityId) || viewingEntityDetail || selectedEntity;
    if (!bonusEntity?.id) return;
    
    const newBonus: Omit<Bonus, 'id'> = {
      entityId: bonusEntity.id,
      entityName: bonusEntity.name,
      description: data.description as string,
      amount: Number(data.amount) || 0,
      dueDate: data.dueDate,
      status: data.status,
      notes: data.notes as string,
      ownerId: user?.uid || 'guest',
      branchId: currentBranchId || undefined,
      createdAt: new Date()
    };
    
    try {
      await localDb.bonuses.add(newBonus as Bonus);
      setIsAddBonusOpen(false);
      toast.success('تم إضافة البونص بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء إضافة البونص');
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntity?.id) return;
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const amount = Number(formData.get('amount'));
    const discount = Number(formData.get('discount')) || 0;
    const refund = Number(formData.get('refund')) || 0;
    const totalEffect = amount + discount - refund;
    
    let receiptImageUrl = '';
    if (payImageFile) {
      receiptImageUrl = URL.createObjectURL(payImageFile);
    }

    const newEntry: Omit<LedgerEntry, 'id'> = {
      accountId: selectedEntity.id,
      accountName: selectedEntity.name,
      accountType: selectedEntity.type,
      date: new Date(formData.get('date') as string),
      operationType: 'payment',
      amount,
      discount,
      refundAmount: refund,
      netAmount: amount,
      linkedInvoiceNumber: formData.get('linkedInvoice') as string,
      linkedInvoiceId: viewingInvoice?.id,
      balanceAfterOperation: selectedEntity.balance - totalEffect,
      receiptImageUrl,
      notes: formData.get('notes') as string,
      ownerId: user?.uid || 'guest',
      branchId: currentBranchId || undefined,
      createdAt: new Date()
    };
    
    try {
      await localDb.ledgerEntries.add(newEntry as LedgerEntry);
      
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

        await localDb.ledgerEntries.update(viewingInvoice.id, {
          paidAmount: currentPaid,
          remainingAmount: currentRemaining,
          paymentStatus: status
        });
      }

      await localDb.entities.update(selectedEntity.id, {
        balance: selectedEntity.balance - totalEffect,
        totalPayments: selectedEntity.totalPayments + 1
      });

      setIsAddPaymentOpen(false);
      setViewingInvoice(null);
      setPaymentMode('normal');
      setPayAmount('');
      setPayDiscount('0');
      setPayRefund('0');
      setPayImageFile(null);
      toast.success('تم إضافة الدفعة بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء إضافة الدفعة');
    }
  };

  const handleEditInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingInvoice?.id || !selectedEntity?.id) return;
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const amount = Number(formData.get('amount'));
    const discount = Number(formData.get('discount')) || 0;
    const netAmount = amount - discount;
    
    const oldNetAmount = viewingInvoice.netAmount;
    const balanceDiff = netAmount - oldNetAmount;

    const updatedInvoice: LedgerEntry = {
      ...viewingInvoice,
      date: new Date(formData.get('date') as string),
      invoiceNumber: formData.get('invoiceNumber') as string,
      amount,
      discount,
      netAmount,
      bonus: Number(formData.get('bonus')) || 0,
      bonusArrivalDate: formData.get('bonusArrivalDate') ? new Date(formData.get('bonusArrivalDate') as string) : undefined,
      dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : undefined,
      purchaseType: formData.get('purchaseType') as 'cash' | 'credit',
      notes: formData.get('notes') as string,
      // Status update logic below
    };

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
      await localDb.ledgerEntries.update(viewingInvoice.id, updatedInvoice);
      await localDb.entities.update(selectedEntity.id, {
        balance: selectedEntity.balance + balanceDiff
      });
      
      setIsEditInvoiceOpen(false);
      setViewingInvoice(null);
      toast.success('تم تحديث الفاتورة بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء تحديث الفاتورة');
    }
  };

  const handleDeleteInvoice = async () => {
    if (!viewingInvoice?.id || !selectedEntity?.id) return;
    
    try {
      // Find all payments linked to this invoice to handle balance correctly?
      // For simplicity, we just adjust the balance by the netAmount
      // But wait, if some was already paid, the balance was already reduced by payments.
      // So delete the invoice increases balance by its netAmount.
      // BUT we should also warn it has payments.
      const netAmount = viewingInvoice.netAmount;
      await localDb.ledgerEntries.delete(viewingInvoice.id);
      await localDb.entities.update(selectedEntity.id, {
        balance: selectedEntity.balance - netAmount,
        totalInvoices: Math.max(0, selectedEntity.totalInvoices - 1)
      });
      
      setIsDeleteInvoiceConfirmOpen(false);
      setViewingInvoice(null);
      toast.success('تم حذف الفاتورة بنجاح');
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء حذف الفاتورة');
    }
  };

  const handleAddRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingInvoice?.id || !selectedEntity?.id) return;
    
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
      branchId: currentBranchId || undefined,
      createdAt: new Date()
    };

    try {
      await localDb.ledgerEntries.add(newRefundEntry as LedgerEntry);
      
      const newRefundTotal = (viewingInvoice.refundAmount || 0) + refundAmount;
      const newPaid = (viewingInvoice.paidAmount || 0) + refundAmount; // Refund acts as reducing balance/paid? 
      // Actually refund reduces the total amount of the invoice? No, it reduces what we OWE.
      // So it's effectively a payment.
      
      const currentPaid = (viewingInvoice.paidAmount || 0) + refundAmount;
      const currentRemaining = Math.max(0, viewingInvoice.netAmount - currentPaid);
      let status: 'paid' | 'partial' | 'pending' | 'overdue' = 'partial';
      if (currentRemaining <= 0) status = 'paid';
      else if (currentPaid === 0) status = 'pending';
      
      if (status !== 'paid' && viewingInvoice.dueDate && new Date(viewingInvoice.dueDate) < new Date()) {
        status = 'overdue';
      }

      await localDb.ledgerEntries.update(viewingInvoice.id, {
        paidAmount: currentPaid,
        remainingAmount: currentRemaining,
        paymentStatus: status,
        refundAmount: newRefundTotal
      });
      
      await localDb.entities.update(selectedEntity.id, {
        balance: selectedEntity.balance - refundAmount
      });
      
      setIsRefundInvoiceOpen(false);
      setViewingInvoice(null);
      toast.success('تم تسجيل المرتجع بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء تسجيل المرتجع');
    }
  };

  const handleAddRevenue = async (data: any) => {
    const newTx: Omit<Transaction, 'id'> = {
      type: 'income',
      incomeType: data.incomeType,
      category: 'revenue',
      amount: Number(data.amount),
      netProfit: Number(data.netProfit) || 0,
      profitPercentage: Number(data.profitPercentage) || 0,
      customerName: data.customerName as string || '',
      dueDate: data.dueDate,
      date: data.date,
      description: data.incomeType === 'cash' ? 'وارد نقدي' : 'وارد دين (آجل)',
      notes: data.notes as string,
      branchId: currentBranchId || undefined,
      createdBy: user?.uid || 'guest',
      createdAt: new Date()
    };
    
    try {
      await localDb.transactions.add(newTx as Transaction);
      setIsAddRevenueOpen(false);
      // Reset form states
      setSaleAmount('');
      setSaleNetProfit('');
      setSaleProfitPercentage('');
      toast.success('تم إضافة الوارد بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء إضافة الوارد');
    }
  };

  const handleAddExpense = async (data: any) => {
    // Generate a detailed description based on category and additional fields
    let detailedDescription = data.description;
    if (data.category === 'rent') {
      detailedDescription = `إيجار (${data.rentType}) - ${data.period}: ${data.description}`;
    } else if (data.category === 'salaries') {
      detailedDescription = `راتب الموظف ${data.employeeName} (${data.jobTitle}) - ${data.period} - ${data.salaryPaymentType === 'full' ? 'كامل' : data.salaryPaymentType === 'advance' ? 'سلفة' : 'مكافأة'}`;
    } else if (data.category === 'electricity') {
      detailedDescription = `${data.serviceType === 'national' ? 'كهرباء وطنية' : data.serviceType === 'generator' ? 'مولدة' : 'اشتراك'} - ${data.reading}: ${data.description}`;
    }

    const newTx: Omit<Transaction, 'id'> = {
      type: 'expense',
      category: data.category as string,
      amount: Number(data.amount),
      date: data.date,
      description: detailedDescription,
      notes: data.notes as string,
      branchId: currentBranchId || undefined,
      createdBy: user?.uid || 'guest',
      createdAt: new Date()
    };
    
    try {
      await localDb.transactions.add(newTx as Transaction);
      setIsAddExpenseOpen(false);
      toast.success('تم إضافة المصروف بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء إضافة المصروف');
    }
  };

  const handleEditTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaction?.id) return;
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const updatedTx: Partial<Transaction> = {
      category: formData.get('category') as string,
      amount: Number(formData.get('amount')),
      date: new Date(formData.get('date') as string),
      description: formData.get('description') as string,
      notes: formData.get('notes') as string,
    };
    
    try {
      await localDb.transactions.update(selectedTransaction.id, updatedTx);
      setIsEditTransactionOpen(false);
      toast.success('تم تحديث الحركة بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء تحديث الحركة');
    }
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction?.id) return;
    try {
      await localDb.transactions.delete(selectedTransaction.id);
      setIsEditTransactionOpen(false);
      toast.success('تم حذف الحركة بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء حذف الحركة');
    }
  };

  // Auth Logic
  useEffect(() => {
    const checkAuth = async () => {
      const users = await localDb.users.toArray();
      if (users.length > 0) {
        setAppUser(users[0]);
        setAuthStep('login-password');
      } else {
        setAuthStep('register');
      }
      setAuthStatusLoading(false);
    };
    checkAuth();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authPassword !== authConfirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }
    const newUser: AppUser = {
      userId: crypto.randomUUID(),
      username: authUsername,
      displayName: authUsername,
      email: user?.email || '',
      password: authPassword,
      isActive: true,
      isSetupComplete: false,
      role: 'admin',
      createdAt: new Date()
    };
    await localDb.users.add(newUser);
    setAppUser(newUser);
    setAuthStep('login-password');
    toast.success('تم إنشاء الحساب بنجاح');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (appUser && appUser.password === authPassword) {
      setAuthStep('authenticated');
      setIsAppAuthenticated(true);
      toast.success('مرحباً بك مجدداً');
    } else {
      toast.error('كلمة المرور غير صحيحة');
    }
  };

  if (authLoading || authStatusLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-background" dir="rtl">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          <RefreshCcw className="h-10 w-10 text-primary" />
        </motion.div>
        <p className="text-muted-foreground font-medium">جاري التجهيز...</p>
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
              <div className="text-center mb-4">
                <p className="font-bold text-muted-foreground">مرحباً {appUser?.username}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">كلمة المرور</Label>
                <Input className="bg-muted border-border text-foreground h-12 rounded-xl" type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required autoFocus />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl text-lg font-bold">دخول</Button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans overflow-hidden" dir="rtl">
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
            onClick={() => setIsAppAuthenticated(false)}
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
      <div className={`flex-1 flex flex-col transition-all duration-300 ${effectiveAppMode === 'laptop' ? (isSidebarCollapsed ? 'mr-20' : 'mr-64') : 'mr-0 pb-16 md:pb-0'}`}>
        <header className="sticky top-0 z-40 h-20 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-8 flex items-center justify-between gap-4 md:gap-8">
          <div className="flex items-center gap-2 md:gap-6 flex-1 max-w-xl">
            {effectiveAppMode === 'mobile' && (
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="relative flex-1 group">
               <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input 
                 placeholder={effectiveAppMode === 'mobile' ? "بحث..." : "ابحث عن مورد، فاتورة، أو عملية..."} 
                 className="w-full bg-muted/50 border-border pr-12 h-11 rounded-xl text-sm focus:ring-primary/20 focus:border-primary/50 transition-all text-foreground"
                 value={globalSearch}
                 onChange={(e) => setGlobalSearch(e.target.value)}
               />
             </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden lg:flex flex-col items-start gap-1">
              <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">مكان العمل الحالي</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 group outline-none">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                      {branches.find(b => b.id === currentBranchId)?.name || 'العرض الموحد'}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-all" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-card border-border text-foreground w-64 p-2 rounded-xl shadow-2xl z-50">
                   <DropdownMenuItem 
                     className={`p-3 cursor-pointer rounded-lg gap-3 ${!currentBranchId ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                     onClick={() => handleSelectBranch(null)}
                   >
                     <LayoutDashboard className="h-4 w-4" />
                     <div className="flex flex-col text-right">
                        <span className="font-black text-sm">العرض الموحد</span>
                        <span className="text-[10px] font-bold text-muted-foreground">إحصائيات كل الفروع مجمعة</span>
                     </div>
                   </DropdownMenuItem>
                   <DropdownMenuSeparator className="bg-border" />
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
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 font-bold h-11 px-6 rounded-xl">
                     <Plus className="h-4 w-4" />
                     إجراء سريع
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border text-foreground w-56 p-2 rounded-xl">
                  <DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-lg gap-3" onClick={() => setIsAddInvoiceOpen(true)}>
                    <Receipt className="h-4 w-4 text-blue-500" />
                    <span>فاتورة شراء جديدة</span>
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

        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* TabsList removed as navigation is now in the sidebar */}

          <TabsContent value="finance" className="space-y-8">
            {/* Conditional Stats: Branch specific vs Unified */}
            <div className={`grid gap-6 ${effectiveAppMode === 'laptop' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'}`}>
              {currentBranchId ? (
                // Branch Specific Stats
                [
                  { label: 'دخل اليوم', value: stats.dailyRevenue, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                  { label: 'دخل الشهر', value: stats.monthlyRevenue, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-500/10' },
                  { label: 'ديون الموردين', value: stats.supplierDues, icon: Users, color: 'text-emerald-900 dark:text-emerald-400', bg: 'bg-emerald-900/10' },
                  { label: 'فواتير مستحقة', value: stats.dueInvoices, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-500/10', isCount: true },
                ].map((stat, idx) => (
                  <Card key={idx} className="bg-card border-border overflow-hidden relative group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 rounded-2xl">
                    <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-3xl -mr-16 -mt-16 opacity-30 group-hover:opacity-50 transition-opacity`} />
                    <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between relative z-10">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="text-3xl font-black text-foreground font-mono tracking-tighter">
                        {stat.isCount ? stat.value : stat.value.toLocaleString()}
                        {!stat.isCount && <span className="text-[10px] text-muted-foreground mr-2 font-sans font-bold">د.ع</span>}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                         <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                         <span className="text-[10px] text-muted-foreground font-bold">تحديث تلقائي</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                // Unified Master Stats
                [
                  { label: 'إجمالي الوارد مجمع', value: stats.totalRevenue, icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                  { label: 'إجمالي المصروف مجمع', value: stats.totalExpense, icon: ArrowDownCircle, color: 'text-rose-600', bg: 'bg-rose-500/10' },
                  { label: 'صافي الربح الكلي', value: stats.totalNetProfit, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-500/10' },
                  { label: 'ديون الموردين المجمعة', value: stats.supplierDues, icon: Users, color: 'text-amber-900 dark:text-amber-400', bg: 'bg-amber-900/10' },
                ].map((stat, idx) => (
                  <Card key={idx} className="bg-card border-border overflow-hidden relative group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 rounded-2xl">
                    <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-3xl -mr-16 -mt-16 opacity-30 group-hover:opacity-50 transition-opacity`} />
                    <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between relative z-10">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="text-3xl font-black text-foreground font-mono tracking-tighter">
                        {stat.value.toLocaleString()}
                        <span className="text-[10px] text-muted-foreground mr-2 font-sans font-bold">د.ع</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                         <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                         <span className="text-[10px] text-muted-foreground font-bold">عرض موحد للفروع</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className={`${!currentBranchId && branches.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'} bg-card border-border p-8 rounded-2xl`}>
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <CardTitle className="text-xl font-black text-foreground">
                      {currentBranchId ? 'التحليل المالي للفرع' : 'التحليل المالي الموحد'}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground font-bold font-sans">
                      {currentBranchId ? 'حركة الإيرادات والمصاريف لآخر 7 أيام' : 'مقارنة الأداء المالي لكل الفروع مجمعة'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-4 p-1.5 bg-muted/30 border border-border rounded-xl">
                    <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-primary font-black">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      الدخل
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-rose-500 font-black">
                      <div className="h-2 w-2 rounded-full bg-rose-500" />
                      المصاريف
                    </div>
                  </div>
                </div>
                <div className="h-[320px] w-full">
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
                             <span className="text-[10px] font-mono font-bold text-muted-foreground">{branch.revenue.toLocaleString()} د.ع</span>
                          </div>
                          <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-border/50">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${Math.min(100, (branch.revenue / (Math.max(...branchComparison.map(b => b.revenue)) || 1)) * 100)}%` }}
                               className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]"
                             />
                          </div>
                          <div className="flex justify-between items-center px-1">
                             <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">صافي الربح: {branch.profit.toLocaleString()}</span>
                             <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">الديون: {branch.dues.toLocaleString()}</span>
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
                      {chartData.reduce((acc, d) => acc + d.profit, 0).toLocaleString()}
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
                          <div className="text-[10px] text-muted-foreground font-bold">متبقي: {d.requiredPayment.toLocaleString()} د.ع</div>
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
                            <td className="px-8 py-5 text-xs text-muted-foreground font-mono font-bold">{format(tx.date, 'yyyy/MM/dd')}</td>
                            <td className="px-8 py-5">
                              <div className="font-black text-foreground group-hover:text-primary transition-colors">{tx.description}</div>
                              {tx.entityName && <div className="text-[10px] text-muted-foreground font-bold mt-1">{tx.entityName}</div>}
                            </td>
                            <td className={`px-8 py-5 text-left font-black font-mono text-base ${tx.type === 'income' ? 'text-primary' : 'text-rose-500'}`}>
                              {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
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
                        className="p-4 flex flex-col gap-2 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedTransaction(tx);
                          setIsEditTransactionOpen(true);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-black text-sm text-foreground">{tx.description}</div>
                            {tx.entityName && <div className="text-[10px] text-muted-foreground font-bold">{tx.entityName}</div>}
                          </div>
                          <div className={`font-black font-mono ${tx.type === 'income' ? 'text-primary' : 'text-rose-500'}`}>
                            {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                          <span>{format(tx.date, 'yyyy/MM/dd')}</span>
                          <span className={`px-2 py-0.5 rounded ${tx.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-rose-500/10 text-rose-500'}`}>
                            {tx.type === 'income' ? 'دخل' : 'مصروف'}
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
                      {allLedgerEntries.filter(e => e.operationType === 'payment').reduce((acc, e) => acc + e.amount, 0).toLocaleString()}
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
                      {allLedgerEntries.filter(e => e.operationType === 'payment' && new Date(e.date) >= startOfMonth(new Date())).reduce((acc, e) => acc + e.amount, 0).toLocaleString()}
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
                    <div className="relative w-full md:w-96 group">
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        placeholder="ابحث عن وصل أو مورد..." 
                        className="bg-background border-border pr-12 h-12 rounded-xl text-foreground focus:ring-primary/20 placeholder:font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
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
                             <td className="px-8 py-6 text-xs text-muted-foreground font-mono font-bold">{format(entry.date, 'yyyy/MM/dd')}</td>
                             <td className="px-8 py-6">
                               <div className="font-black text-foreground group-hover:text-primary transition-colors">{entry.accountName}</div>
                               <div className="text-[10px] text-muted-foreground font-bold mt-1 px-2.5 py-0.5 bg-muted rounded-full inline-block">سيد قيد مباشر</div>
                             </td>
                             <td className="px-8 py-6 font-mono text-muted-foreground font-bold">{entry.invoiceNumber || '---'}</td>
                             <td className="px-8 py-6 text-left font-black text-emerald-600 font-mono text-lg tracking-tighter">
                               {entry.amount.toLocaleString()}
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
                                {entry.amount.toLocaleString()}
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                              <span>{format(entry.date, 'yyyy/MM/dd')}</span>
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

          <TabsContent value="revenues" className="space-y-6 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'إجمالي المبيعات الآجلة', value: customerDebts.reduce((acc, d) => acc + d.totalAmount, 0), icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'الديون المتبقية', value: customerDebts.reduce((acc, d) => acc + d.remainingAmount, 0), icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-500/10' },
                { label: 'عدد المدينين', value: customerDebts.filter(d => d.status !== 'paid').length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10', isCount: true },
              ].map((stat, idx) => (
                <Card key={idx} className="bg-card border-border p-8 relative group overflow-hidden rounded-2xl shadow-sm">
                  <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-2xl -mr-12 -mt-12 group-hover:bg-primary/20 transition-colors`} />
                  <div className="relative z-10 flex flex-col items-center">
                    <stat.icon className={`h-6 w-6 ${stat.color} mb-4`} />
                    <span className="text-[10px] font-black text-muted-foreground mb-1 tracking-widest uppercase text-center">{stat.label}</span>
                    <span className="text-3xl font-black text-foreground font-mono tracking-tighter">
                      {stat.value.toLocaleString()}
                      {!stat.isCount && <span className="text-[10px] text-muted-foreground mr-2 font-sans font-bold italic tracking-normal">د.ع</span>}
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
                    <div className="relative w-full md:w-96 group">
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        placeholder="ابحث باسم الزبون..." 
                        className="bg-background border-border pr-12 h-12 rounded-xl text-foreground focus:ring-primary/20 placeholder:font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  {effectiveAppMode === 'laptop' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr>
                          <th className="px-8 !text-right">الزبون / الحالة</th>
                          <th className="px-8 !text-right">المبلغ الكلي</th>
                          <th className="px-8 !text-right">المسدد</th>
                          <th className="px-8 !text-left">المتبقي التحصيلي</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerDebts
                          .filter(d => d.customerName.includes(searchTerm))
                          .map((debt) => (
                            <tr key={debt.id} className="group hover:bg-primary/5 transition-colors">
                              <td className="px-8 py-6">
                                <div className="font-black text-foreground group-hover:text-primary transition-colors">{debt.customerName}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-muted-foreground font-bold">{format(debt.saleDate, 'yyyy/MM/dd')}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                    debt.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600' :
                                    debt.status === 'partial' ? 'bg-amber-500/10 text-amber-600' :
                                    'bg-rose-500/10 text-rose-600'
                                  }`}>
                                    {debt.status === 'paid' ? 'تم التحصيل' : debt.status === 'partial' ? 'تحصيل جزئي' : 'بذمة الزبون'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-8 py-6 font-mono font-bold text-muted-foreground">{debt.totalAmount.toLocaleString()}</td>
                              <td className="px-8 py-6 font-mono font-bold text-emerald-600">{debt.paidAmount.toLocaleString()}</td>
                              <td className="px-8 py-6 text-left font-black text-rose-600 font-mono text-lg tracking-tighter">{debt.remainingAmount.toLocaleString()}</td>
                            </tr>
                          ))}
                        {customerDebts.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-20 text-center text-muted-foreground italic font-bold">لا توجد سجلات مبيعات آجلة حالياً</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  ) : (
                    <div className="p-4 space-y-4">
                      {customerDebts
                        .filter(d => d.customerName.includes(searchTerm))
                        .map((debt) => (
                          <div key={debt.id} className="p-4 bg-muted/20 border border-border rounded-2xl space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="font-black text-foreground">{debt.customerName}</div>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                debt.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600' :
                                debt.status === 'partial' ? 'bg-amber-500/10 text-amber-600' :
                                'bg-rose-500/10 text-rose-600'
                              }`}>
                                {debt.status === 'paid' ? 'تحصيل' : debt.status === 'partial' ? 'جزئي' : 'ذمة'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-muted-foreground">
                               <div className="bg-muted p-2 rounded-lg">إجمالي: {debt.totalAmount.toLocaleString()}</div>
                               <div className="bg-emerald-500/5 text-emerald-600 p-2 rounded-lg">مسدد: {debt.paidAmount.toLocaleString()}</div>
                            </div>
                            <div className="pt-2 border-t border-border/50 flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase text-muted-foreground">المتبقي</span>
                              <span className="font-black text-rose-600 font-mono text-lg">{debt.remainingAmount.toLocaleString()} د.ع</span>
                            </div>
                          </div>
                        ))}
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
                onAddInvoice={() => { setSelectedEntity(viewingEntityDetail); setIsAddInvoiceOpen(true); }}
                onAddPayment={() => { setSelectedEntity(viewingEntityDetail); setViewingInvoice(null); setPaymentMode('normal'); setIsAddPaymentOpen(true); }}
                onAddBonus={() => setIsAddBonusOpen(true)}
                onEditEntity={() => { setSelectedEntity(viewingEntityDetail); setIsEditEntityOpen(true); }}
                onViewInvoice={handleViewInvoice}
                onEditInvoice={(invoice) => { setViewingInvoice(invoice); setIsEditInvoiceOpen(true); }}
                onDeleteInvoice={(invoice) => { setViewingInvoice(invoice); setIsDeleteInvoiceConfirmOpen(true); }}
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
                appMode={effectiveAppMode}
              />
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-foreground">إدارة الموردين والمذاخر</h2>
                  <Button onClick={() => setIsAddEntityOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-2 text-white shadow-lg shadow-emerald-500/20">
                    <Plus className="h-4 w-4" />
                    مورد جديد
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {entities.map((entity) => (
                    <Card key={entity.id} className="group cursor-pointer bg-card border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-xl hover:shadow-primary/5 rounded-2xl overflow-hidden relative" onClick={() => handleEntityClick(entity)}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
                      <CardHeader className="p-6 pb-4 relative z-10">
                        <div className="flex justify-between items-start">
                           <div className="flex-1 overflow-hidden">
                              <CardTitle className="text-xl text-foreground font-black tracking-tight truncate group-hover:text-primary transition-colors">{entity.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                  entity.type === 'office' ? 'bg-blue-500/10 text-blue-600' : 'bg-primary/10 text-primary'
                                }`}>
                                  {entity.type === 'office' ? 'مكتب علمي' : 'مذخر مركزي'}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-bold">#{String(entity.id).padStart(4, '0')}</span>
                              </div>
                           </div>
                           <div className={`text-sm font-black px-4 py-2 rounded-xl font-mono tracking-tighter shadow-sm border-2 ${entity.balance > 0 ? 'bg-rose-500/5 text-rose-600 border-rose-500/10' : 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10'}`}>
                             {entity.balance.toLocaleString()}
                           </div>
                        </div>
                      </CardHeader>
                      <CardFooter className="p-6 pt-0 border-t border-border/50 bg-muted/20 relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-black text-primary">
                           <Eye className="h-3.5 w-3.5" />
                           كشف حساب كامل
                        </div>
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                      </CardFooter>
                    </Card>
                  ))}
                  {entities.length === 0 && (
                    <div className="col-span-full py-24 text-center text-muted-foreground bg-muted/10 rounded-3xl border-2 border-dashed border-border/50 flex flex-col items-center">
                       <div className="bg-muted p-6 rounded-full mb-4">
                         <Users className="h-12 w-12 opacity-20" />
                       </div>
                       <p className="font-black text-lg text-foreground/50">لا يوجد موردين مسجلين</p>
                       <p className="text-sm font-bold mt-2">ابدأ بإضافة أول مورد للصيدلية الآن</p>
                       <Button onClick={() => setIsAddEntityOpen(true)} className="mt-8 bg-primary hover:bg-primary/90 h-11 px-8 rounded-xl font-black">
                         + إضافة مورد جديد
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
                    <div className="relative w-full md:w-96 group">
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder="بحث برقم الفاتورة أو المورد..."
                        className="bg-background border-border pr-12 h-12 rounded-xl text-foreground focus:ring-primary/20 placeholder:font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
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
                              <td className="px-8 py-6 text-xs text-muted-foreground font-mono font-bold">{format(entry.date, 'yyyy/MM/dd')}</td>
                              <td className="px-8 py-6 text-left">
                                <div className="text-lg font-black text-emerald-600 font-mono tracking-tighter">{entry.netAmount.toLocaleString()}</div>
                              </td>
                            </tr>
                          ))}
                        {allLedgerEntries.filter(e => e.operationType === 'invoice').length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-20 text-center text-muted-foreground italic font-bold">لا توجد فواتير مسجلة بعد</td>
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
                                {entry.netAmount.toLocaleString()}
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                              <span>{format(entry.date, 'yyyy/MM/dd')}</span>
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
                           <span className="text-[10px] text-amber-600 font-black uppercase tracking-widest">موعد الاستحقاق: {format(deadline.dueDate, 'yyyy/MM/dd')}</span>
                        </div>
                      </div>
                      <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 relative z-10">
                    <div className="text-2xl font-black text-amber-600 font-mono tracking-tighter">
                      {deadline.requiredPayment.toLocaleString()}
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
                          <th className="px-8 text-center">الإجراء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions
                          .filter(tx => 
                            tx.description.includes(searchTerm) || 
                            (tx.entityName && tx.entityName.includes(searchTerm))
                          )
                          .slice(0, 50)
                          .map((tx) => (
                            <tr key={tx.id} className="group hover:bg-primary/5 transition-colors">
                              <td className="px-8 py-6 text-xs text-muted-foreground font-mono font-bold tracking-tight">
                                {format(tx.date, 'yyyy/MM/dd HH:mm')}
                              </td>
                              <td className="px-8 py-6">
                                <div className="font-black text-foreground group-hover:text-primary transition-colors">{tx.description}</div>
                                {tx.entityName && <div className="text-[10px] text-muted-foreground font-bold mt-1 px-2.5 py-0.5 bg-muted rounded-full inline-block">{tx.entityName}</div>}
                              </td>
                              <td className={`px-8 py-6 font-black font-mono text-lg tracking-tighter ${tx.type === 'income' ? 'text-primary' : 'text-rose-600'}`}>
                                {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                              </td>
                              <td className="px-8 py-6 text-center">
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" onClick={() => {
                                  setSelectedTransaction(tx);
                                  setIsEditTransactionOpen(true);
                                }}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  ) : (
                    <div className="p-4 space-y-4">
                      {transactions
                        .filter(tx => 
                          tx.description.includes(searchTerm) || 
                          (tx.entityName && tx.entityName.includes(searchTerm))
                        )
                        .slice(0, 50)
                        .map((tx) => (
                          <div key={tx.id} className="p-4 bg-muted/30 border border-border rounded-2xl space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="text-[10px] text-muted-foreground font-mono">{format(tx.date, 'yyyy/MM/dd HH:mm')}</div>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => {
                                setSelectedTransaction(tx);
                                setIsEditTransactionOpen(true);
                              }}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                            <div>
                              <div className="font-black text-foreground">{tx.description}</div>
                              {tx.entityName && <div className="text-[9px] text-muted-foreground mt-1">{tx.entityName}</div>}
                            </div>
                            <div className={`text-xl font-black font-mono tracking-tighter ${tx.type === 'income' ? 'text-primary' : 'text-rose-600'}`}>
                              {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
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
                         { icon: RefreshCcw, label: 'إعادة تعيين الترخيص', desc: 'مسح بيانات الجلسة الحالية', color: 'text-blue-500', onClick: async () => { if(appUser) { await localDb.users.update(appUser.userId, { isActive: false }); window.location.reload(); } } },
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

          <TabsContent value="reports" className="space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
            <div className="space-y-8">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                   <h2 className="text-xl md:text-2xl font-black text-foreground">التقارير التحليلية</h2>
                   <p className="text-muted-foreground text-xs md:text-sm">نظرة شاملة على الأداء المالي والنشاط العام</p>
                 </div>
                 <div className="flex gap-2">
                   <Button variant="outline" className="border-border bg-card hover:bg-muted text-foreground gap-2 h-10 px-4 rounded-xl whitespace-nowrap text-xs">
                     <Download className="h-4 w-4" />
                     Excel
                   </Button>
                   <Button variant="outline" className="border-border bg-card hover:bg-muted text-foreground gap-2 h-10 px-4 rounded-xl whitespace-nowrap text-xs">
                     <Printer className="h-4 w-4" />
                     طباعة
                   </Button>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                 {[
                   { label: 'إجمالي الأرباح', value: stats.netProfit, icon: TrendingUp, color: 'text-emerald-500', border: 'border-t-emerald-500', trend: `+${stats.profitPercentage.toFixed(1)}%` },
                   { label: 'إجمالي المصروفات', value: transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0), icon: ArrowUpCircle, color: 'text-rose-500', border: 'border-t-rose-500', sub: 'خلال الفترة' },
                   { label: 'مستحقات الموردين', value: stats.supplierDues, icon: Building2, color: 'text-blue-500', border: 'border-t-blue-500', sub: `${entities.length} مورد نشط` },
                 ].map((card, i) => (
                   <Card key={i} className={`bg-card border-border border-t-4 ${card.border} shadow-xl p-6 md:p-8 flex flex-col items-center text-center group hover:scale-[1.02] transition-transform`}>
                     <div className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-2 group-hover:text-foreground transition-colors">
                        <card.icon className="h-4 w-4" />
                        {card.label}
                     </div>
                     <div className="text-2xl md:text-3xl font-black text-foreground font-mono tracking-tighter mb-4">{card.value.toLocaleString()}</div>
                     {card.trend ? (
                        <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded-full font-bold">
                           <TrendingUp className="h-3 w-3" />
                           {card.trend} زيادة
                        </div>
                     ) : card.sub && (
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">{card.sub}</div>
                     )}
                   </Card>
                 ))}
               </div>

               {currentBranchId === null && branches.length > 1 && (
                  <Card className="bg-primary/5 border-primary/10 rounded-3xl overflow-hidden relative group p-4 md:p-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -mr-32 -mt-32" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 relative z-10 gap-4">
                       <div className="flex items-center gap-3">
                          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                             <Building2 className="h-6 w-6" />
                          </div>
                          <h3 className="text-xl md:text-2xl font-black text-foreground">مقارنة أداء الفروع</h3>
                       </div>
                    </div>
                    <div className="relative z-10 overflow-x-auto">
                        {effectiveAppMode === 'laptop' ? (
                        <table className="w-full text-right">
                           <thead className="text-[10px] font-black text-muted-foreground uppercase border-b border-border/50">
                              <tr>
                                 <th className="px-6 py-4 text-right">الفرع</th>
                                 <th className="px-6 py-4 text-right">الإيراد</th>
                                 <th className="px-6 py-4 text-right">المصروف</th>
                                 <th className="px-6 py-4 text-left">صافي الربح</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-border/30">
                              {branchComparison.map(branch => (
                                <tr key={branch.id} className="hover:bg-primary/5 transition-colors group">
                                   <td className="px-6 py-5 font-black text-foreground group-hover:text-primary transition-colors">{branch.name}</td>
                                   <td className="px-6 py-5 font-mono font-bold text-emerald-600">{branch.revenue.toLocaleString()}</td>
                                   <td className="px-6 py-5 font-mono font-bold text-rose-600">{branch.expense.toLocaleString()}</td>
                                   <td className="px-6 py-5 text-left font-mono font-black text-lg">{branch.profit.toLocaleString()}</td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                        ) : (
                          <div className="space-y-4">
                             {branchComparison.map(branch => (
                               <div key={branch.id} className="p-4 bg-background/50 rounded-2xl border border-border/50 space-y-3 text-right">
                                 <div className="flex justify-between items-center">
                                   <div className="font-black text-foreground text-sm">{branch.name}</div>
                                   <div className="text-base font-black font-mono">{branch.profit.toLocaleString()}</div>
                                 </div>
                               </div>
                             ))}
                          </div>
                        )}
                    </div>
                  </Card>
               )}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
               <div className="flex items-center justify-between gap-4">
                 <div className="min-w-0">
                   <h2 className="text-xl md:text-2xl font-black text-foreground truncate">الإشعارات</h2>
                   <p className="text-muted-foreground text-xs md:text-sm truncate">تنبيهات النظام ومواعيد السداد</p>
                 </div>
                 <Button variant="ghost" className="text-emerald-500 hover:bg-emerald-500/10 font-bold text-xs shrink-0" onClick={async () => {
                    for (const n of notifications) {
                      if (!n.read) await localDb.notifications.update(n.id!, { read: true });
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
                              <span className="text-[9px] md:text-xs text-muted-foreground font-mono shrink-0">{format(n.createdAt, 'MM/dd HH:mm')}</span>
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2">{n.message}</p>
                            {!n.read && (
                               <Button variant="link" className="p-0 h-auto text-[10px] md:text-xs text-emerald-500 font-bold hover:text-emerald-400" onClick={() => localDb.notifications.update(n.id!, { read: true })}>
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
                         <Button variant={isDriveLinked ? "outline" : "default"} className={isDriveLinked ? "border-border text-foreground size-sm" : "bg-emerald-600 hover:bg-emerald-700 size-sm"}>
                           {isDriveLinked ? 'إلغاء الربط' : 'ربط الحساب'}
                         </Button>
                       </div>
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
                       <Button variant="outline" className="w-full justify-between h-12 border-border hover:bg-muted text-rose-500 rounded-xl px-4 font-black" onClick={() => setIsAppAuthenticated(false)}>
                         <span>تسجيل الخروج</span>
                         <LogOut className="h-4 w-4" />
                       </Button>
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

      {/* Add Entity Dialog */}
      <Dialog open={isAddEntityOpen} onOpenChange={setIsAddEntityOpen}>
        <DialogContent dir="rtl" className="bg-card border-border text-foreground sm:max-w-xl lg:max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-black">إضافة مورد جديد</DialogTitle>
          </DialogHeader>
          <EntityForm 
            onSubmit={handleAddEntity} 
            onClose={() => setIsAddEntityOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      {/* Add Invoice Dialog */}
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
            onImageChange={setInvImageFile}
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
                <Input id="amount" name="amount" type="number" required className="bg-muted border-border text-foreground h-12 rounded-xl font-mono" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requiredPayment" className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">المبلغ المطلوب سداده</Label>
                <Input id="requiredPayment" name="requiredPayment" type="number" required className="bg-muted border-border text-foreground h-12 rounded-xl font-mono text-emerald-500 font-black" />
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
                    <Input 
                      id="pay_amount" 
                      name="amount" 
                      type="number" 
                      required 
                      value={payAmount}
                      readOnly={paymentMode === 'full'}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className={`bg-muted border-border text-foreground h-14 rounded-xl font-mono text-2xl font-black pr-12 ${paymentMode === 'full' ? 'opacity-50' : 'focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                    />
                    <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-emerald-500" />
                  </div>
                  {paymentMode !== 'normal' && viewingInvoice && (
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] text-muted-foreground font-bold italic">إجمالي القائمة: {viewingInvoice.netAmount.toLocaleString()}</span>
                      <span className="text-[10px] text-amber-500 font-black">المتبقي: {viewingInvoice.remainingAmount?.toLocaleString()} د.ع</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pay_date" className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">تاريخ الوصول / الصرف</Label>
                  <div className="relative">
                    <Input id="pay_date" name="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} required className="bg-muted border-border text-foreground h-14 rounded-xl pr-10 font-bold" />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {paymentMode === 'normal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-card border border-border rounded-2xl shadow-inner">
                  <div className="space-y-2">
                    <Label htmlFor="pay_discount" className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">قيمة الخصم الممنوح</Label>
                    <Input 
                      id="pay_discount" 
                      name="discount" 
                      type="number" 
                      value={payDiscount}
                      onChange={(e) => setPayDiscount(e.target.value)}
                      className="bg-muted border-emerald-500/10 text-emerald-600 h-14 rounded-xl font-mono text-xl font-black" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pay_refund" className="text-rose-500 font-black text-[10px] uppercase tracking-widest">قيمة المرتجع النقدي</Label>
                    <Input 
                      id="pay_refund" 
                      name="refund" 
                      type="number" 
                      value={payRefund}
                      onChange={(e) => setPayRefund(e.target.value)}
                      className="bg-muted border-rose-500/10 text-rose-500 h-14 rounded-xl font-mono text-xl font-black" 
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
                <div className="text-2xl font-black text-foreground font-mono">{viewingInvoice?.netAmount.toLocaleString()} د.ع</div>
                <div className="text-[10px] text-muted-foreground mt-1">المتبقي حالياً: {viewingInvoice?.remainingAmount?.toLocaleString()} د.ع</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="refund_amount" className="text-muted-foreground font-bold">قيمة المرتجع</Label>
                  <Input 
                    id="refund_amount" 
                    name="refundAmount" 
                    type="number" 
                    required 
                    placeholder="0.000"
                    className="bg-muted border-border text-foreground h-11 rounded-xl font-mono text-lg" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refund_date" className="text-muted-foreground font-bold">تاريخ الإرجاع</Label>
                  <Input id="refund_date" name="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} required className="bg-muted border-border text-foreground h-11 rounded-xl" />
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

      {/* Entity Ledger Dialog (Transactions for specific entity) */}
      <Dialog open={isLedgerOpen} onOpenChange={setIsLedgerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col bg-card border-border text-foreground" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-foreground">كشف حساب: {selectedEntity?.name}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              عرض كافة الفواتير والدفعات المسجلة لهذا الحساب.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto py-4">
            <div className="bg-muted p-4 rounded-lg flex justify-between items-center mb-4 border border-border">
              <div className="text-sm font-medium text-muted-foreground">الرصيد الكلي:</div>
              <div className={`text-xl font-bold font-mono ${selectedEntity?.balance! > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {selectedEntity?.balance.toLocaleString()} د.ع
              </div>
            </div>

            <table className="w-full text-right">
              <thead className="sticky top-0 bg-muted border-b border-border text-xs font-bold text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">التاريخ</th>
                  <th className="px-4 py-2">العملية</th>
                  <th className="px-4 py-2">رقم الفاتورة</th>
                  <th className="px-4 py-2">المبلغ</th>
                  <th className="px-4 py-2">الرصيد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {(ledgerEntries || []).map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-2 font-mono text-muted-foreground">{format(entry.date, 'yyyy/MM/dd')}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        entry.operationType === 'invoice' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {entry.operationType === 'invoice' ? 'فاتورة' : 'دفعة'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground font-mono">{entry.invoiceNumber || '-'}</td>
                    <td className={`px-4 py-2 font-bold font-mono ${entry.operationType === 'invoice' ? 'text-blue-500' : 'text-emerald-500'}`}>
                      {entry.operationType === 'invoice' ? '+' : '-'}{entry.netAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 font-bold text-foreground font-mono">{entry.balanceAfterOperation.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <DialogFooter className="border-t border-border pt-4 gap-2">
            <Button variant="outline" className="border-border text-muted-foreground hover:bg-muted" onClick={() => setIsLedgerOpen(false)}>إغلاق</Button>
            <Button variant="outline" className="gap-2 border-border text-muted-foreground hover:bg-muted">
              <Printer className="h-4 w-4" />
              طباعة الكشف
            </Button>
            <Button variant="secondary" onClick={() => setIsAddPaymentOpen(true)} className="gap-2 bg-secondary hover:bg-secondary/80 text-emerald-500 border border-border font-bold">
              <LogOut className="h-4 w-4 rotate-90" />
              دفعة جديدة
            </Button>
            <Button onClick={() => setIsAddInvoiceOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6 rounded-xl">
              <Plus className="h-4 w-4" />
              فاتورة جديدة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Revenue Dialog */}
      <Dialog open={isAddRevenueOpen} onOpenChange={setIsAddRevenueOpen}>
        <DialogContent dir="rtl" className="bg-card border-border text-foreground sm:max-w-xl lg:max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-black">إضافة وارد (دخل جديد)</DialogTitle>
          </DialogHeader>
          <RevenueForm 
            onSubmit={handleAddRevenue} 
            onClose={() => setIsAddRevenueOpen(false)} 
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
        <DialogContent dir="rtl" className="bg-card border-border text-foreground sm:max-w-xl lg:max-w-3xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">تعديل حركة مالية</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditTransaction} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground font-bold">المبلغ</Label>
                  <Input name="amount" type="number" defaultValue={selectedTransaction?.amount} required className="bg-muted border-border text-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground font-bold">التاريخ</Label>
                  <Input 
                    name="date" 
                    type="date" 
                    defaultValue={selectedTransaction ? format(selectedTransaction.date, 'yyyy-MM-dd') : ''} 
                    required 
                    className="bg-muted border-border text-foreground"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground font-bold">الفئة</Label>
                <Select name="category" defaultValue={selectedTransaction?.category}>
                  <SelectTrigger className="bg-muted border-border text-foreground">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="sales">مبيعات</SelectItem>
                    <SelectItem value="purchases">مشتريات</SelectItem>
                    <SelectItem value="rent">إيجار</SelectItem>
                    <SelectItem value="salaries">رواتب</SelectItem>
                    <SelectItem value="electricity">كهرباء</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground font-bold">البيان</Label>
                <Input name="description" defaultValue={selectedTransaction?.description} required className="bg-muted border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground font-bold">ملاحظات</Label>
                <Input name="notes" defaultValue={selectedTransaction?.notes} className="bg-muted border-border text-foreground" />
              </div>
            </div>
            <DialogFooter className="flex justify-between gap-2">
              <Button type="button" variant="destructive" onClick={handleDeleteTransaction} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold h-11 px-6 rounded-xl">حذف</Button>
              <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6 rounded-xl border-none">تحديث</Button>
            </DialogFooter>
          </form>
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
        invAmount={invAmount}
        setInvAmount={setInvAmount}
        invDiscount={invDiscount}
        setInvDiscount={setInvDiscount}
        invBonus={invBonus}
        setInvBonus={setInvBonus}
      />

      <DeleteInvoiceConfirmDialog
        isOpen={isDeleteInvoiceConfirmOpen}
        onOpenChange={setIsDeleteInvoiceConfirmOpen}
        onConfirm={handleDeleteInvoice}
        invoice={viewingInvoice}
      />

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

      {/* More dialogs will be added as we go... */}
      </div>
    </div>
  );
}
