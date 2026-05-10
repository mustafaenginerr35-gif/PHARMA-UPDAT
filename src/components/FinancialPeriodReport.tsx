import React, { useState, useMemo, useRef } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingCart, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpCircle, 
  AlertTriangle, 
  DollarSign,
  Calendar,
  Printer,
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  ArrowRightLeft,
  Building2,
  Package,
  History,
  Layers,
  FileDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  parseISO,
  startOfDay,
  endOfDay
} from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  type Transaction, 
  type Entity, 
  type LedgerEntry, 
  type HistoricalRecord, 
  type ExpiredDamagedLoss,
  type EmployeeAttendance,
  type PharmacyBranch,
  type CustomerDebt
} from '../db';
import { formatIQD, formatNumberWithCommas, toValidDate } from '../lib/formatters';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2pdf from 'html2pdf.js';

interface FinancialPeriodReportProps {
  transactions: Transaction[];
  allLedgerEntries: LedgerEntry[];
  expiredDamagedLosses: ExpiredDamagedLoss[];
  historicalRecords: HistoricalRecord[];
  entities: Entity[];
  branches: PharmacyBranch[];
  employeeAttendance: EmployeeAttendance[];
  openingCash: any[]; // Use any[] for now to avoid import issues or define full type
  customerDebts: CustomerDebt[];
}

type ReportEntry = {
  id: string;
  date: Date;
  type: 'revenue' | 'expense' | 'damaged' | 'expired' | 'payment' | 'purchase' | 'opening_cash';
  description: string;
  amount: number;
  profit: number;
  branchName: string;
  source: 'direct' | 'excel' | 'historical';
};

export const FinancialPeriodReport: React.FC<FinancialPeriodReportProps> = ({
  transactions,
  allLedgerEntries,
  expiredDamagedLosses,
  historicalRecords,
  entities,
  branches,
  employeeAttendance,
  openingCash,
  customerDebts
}) => {
  const [fromDate, setFromDate] = useState<string>(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState<string>(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [branchId, setBranchId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
  const [tableFilter, setTableFilter] = useState<'all' | 'revenue' | 'expense' | 'damaged' | 'payment' | 'purchase'>('all');

  const reportRef = useRef<HTMLDivElement>(null);

  const reportData = useMemo(() => {
    const start = startOfDay(parseISO(fromDate));
    const end = endOfDay(parseISO(toDate));

    const checkInterval = (date: Date | string | undefined) => {
      if (!date) return false;
      const d = toValidDate(date);
      return d >= start && d <= end;
    };

    const checkBranch = (bId: string | null | undefined) => {
      if (branchId === 'all') return true;
      return bId === branchId;
    };

    // 1. Revenues
    const revenueEntries: ReportEntry[] = [
      ...transactions
        .filter(t => (t.type === 'revenue' || t.type === 'income') && checkInterval(t.date) && checkBranch(t.branchId))
        .map(t => ({
          id: t.id || Math.random().toString(),
          date: toValidDate(t.date),
          type: 'revenue' as const,
          description: t.description || t.customerName || 'وارد نقدي',
          amount: Number(t.saleAmount || t.amount || 0),
          profit: Number(t.profitAmount || t.netProfit || 0),
          branchName: branches.find(b => b.id === t.branchId)?.name || 'غير محدد',
          source: t.source === 'excel_import' ? 'excel' : t.isHistorical ? 'historical' : 'direct' as const
        })),
      ...historicalRecords
        .filter(r => r.entryType === 'revenue' && checkInterval(r.date) && checkBranch(r.branchId))
        .map(r => ({
          id: r.id || Math.random().toString(),
          date: toValidDate(r.date!),
          type: 'revenue' as const,
          description: r.notes || 'وارد (تاريخي)',
          amount: Number(r.amount || 0),
          profit: Number(r.totalProfits || 0),
          branchName: branches.find(b => b.id === r.branchId)?.name || 'غير محدد',
          source: 'historical' as const
        }))
    ];

    // 2. Expenses
    const expenseEntries: ReportEntry[] = [
      ...transactions
        .filter(t => t.type === 'expense' && checkInterval(t.date) && checkBranch(t.branchId))
        .map(t => ({
          id: t.id || Math.random().toString(),
          date: toValidDate(t.date),
          type: 'expense' as const,
          description: t.description || t.expenseClassification || 'مصروف عام',
          amount: Number(t.amount || 0),
          profit: 0,
          branchName: branches.find(b => b.id === t.branchId)?.name || 'غير محدد',
          source: t.source === 'excel_import' ? 'excel' : t.isHistorical ? 'historical' : 'direct' as const
        })),
      ...employeeAttendance
        .filter(a => checkInterval(a.date) && checkBranch(a.branchId))
        .map(a => ({
          id: a.id || Math.random().toString(),
          date: toValidDate(a.date),
          type: 'expense' as const,
          description: `راتب موظف: ${a.employeeName}`,
          amount: Number(a.dailyWage || 0),
          profit: 0,
          branchName: branches.find(b => b.id === a.branchId)?.name || 'غير محدد',
          source: 'direct' as const
        })),
      ...historicalRecords
        .filter(r => r.entryType === 'expense' && checkInterval(r.date) && checkBranch(r.branchId))
        .map(r => ({
          id: r.id || Math.random().toString(),
          date: toValidDate(r.date!),
          type: 'expense' as const,
          description: r.notes || 'مصروف (تاريخي)',
          amount: Number(r.amount || 0),
          profit: 0,
          branchName: branches.find(b => b.id === r.branchId)?.name || 'غير محدد',
          source: 'historical' as const
        }))
    ];

    // 3. Damaged/Expired
    const lossEntries: ReportEntry[] = [
      ...expiredDamagedLosses
        .filter(l => checkInterval(l.date) && checkBranch(l.branchId))
        .map(l => ({
          id: l.id || Math.random().toString(),
          date: toValidDate(l.date),
          type: (l.lossType === 'damaged' ? 'damaged' : 'expired') as any,
          description: `${l.lossType === 'damaged' ? 'تالف' : 'اكسباير'}: ${l.itemName}`,
          amount: Number(l.totalLoss || 0),
          profit: 0,
          branchName: branches.find(b => b.id === l.branchId)?.name || 'غير محدد',
          source: 'direct' as const
        }))
    ];

    // 4. Purchases
    const purchaseEntries: ReportEntry[] = [
      ...allLedgerEntries
        .filter(e => e.operationType === 'invoice' && checkInterval(e.date) && checkBranch(e.branchId))
        .map(e => ({
          id: e.id || Math.random().toString(),
          date: toValidDate(e.date),
          type: 'purchase' as const,
          description: `فاتورة شراء: ${e.accountName} (#${e.invoiceNumber})`,
          amount: Number(e.amount || 0),
          profit: 0,
          branchName: branches.find(b => b.id === e.branchId)?.name || 'غير محدد',
          source: e.source === 'excel_import' ? 'excel' : e.isHistorical ? 'historical' : 'direct' as const
        })),
      ...historicalRecords
        .filter(r => r.entryType === 'invoice' && checkInterval(r.date) && checkBranch(r.branchId))
        .map(r => ({
          id: r.id || Math.random().toString(),
          date: toValidDate(r.date!),
          type: 'purchase' as const,
          description: `شراء (تاريخي): ${r.entityName || ''} (#${r.invoiceNumber || ''})`,
          amount: Number(r.amount || 0),
          profit: 0,
          branchName: branches.find(b => b.id === r.branchId)?.name || 'غير محدد',
          source: 'historical' as const
        }))
    ];

    // 5. Payments
    const paymentEntries: ReportEntry[] = [
      ...allLedgerEntries
        .filter(e => e.operationType === 'payment' && checkInterval(e.date) && checkBranch(e.branchId))
        .map(e => ({
          id: e.id || Math.random().toString(),
          date: toValidDate(e.date),
          type: 'payment' as const,
          description: `تسديد للمورد: ${e.accountName}`,
          amount: Number(e.amount || 0),
          profit: 0,
          branchName: branches.find(b => b.id === e.branchId)?.name || 'غير محدد',
          source: e.source === 'excel_import' ? 'excel' : e.isHistorical ? 'historical' : 'direct' as const
        })),
      ...historicalRecords
        .filter(r => r.entryType === 'payment' && checkInterval(r.date) && checkBranch(r.branchId))
        .map(r => ({
          id: r.id || Math.random().toString(),
          date: toValidDate(r.date!),
          type: 'payment' as const,
          description: `تسديد (تاريخي): ${r.entityName || ''}`,
          amount: Number(r.amount || 0),
          profit: 0,
          branchName: branches.find(b => b.id === r.branchId)?.name || 'غير محدد',
          source: 'historical' as const
        }))
    ];

    // 6. Opening Cash
    const openingCashEntries: ReportEntry[] = [
      ...openingCash
        .filter(o => checkInterval(o.date) && checkBranch(o.branchId))
        .map(o => ({
          id: o.id || Math.random().toString(),
          date: toValidDate(o.date),
          type: 'opening_cash' as const,
          description: `رصيد افتتاحي: ${o.source || 'كاش مرحّل'}`,
          amount: Number(o.amount || 0),
          profit: 0,
          branchName: branches.find(b => b.id === o.branchId)?.name || 'غير محدد',
          source: 'direct' as const
        })),
      // Legacy support if they are in ledger
      ...allLedgerEntries
        .filter(e => e.sourceType === 'opening_cash' && checkInterval(e.date) && checkBranch(e.branchId))
        .map(e => ({
          id: e.id || Math.random().toString(),
          date: toValidDate(e.date),
          type: 'opening_cash' as const,
          description: e.notes || 'رصيد افتتاحي (سجل)',
          amount: Number(e.amount || 0),
          profit: 0,
          branchName: branches.find(b => b.id === e.branchId)?.name || 'غير محدد',
          source: 'direct' as const
        }))
    ];

    const allEntries = [
      ...revenueEntries,
      ...expenseEntries,
      ...lossEntries,
      ...purchaseEntries,
      ...paymentEntries,
      ...openingCashEntries
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    const stats = {
      openingCash: openingCashEntries.reduce((sum, e) => sum + e.amount, 0),
      totalRevenue: revenueEntries.reduce((sum, e) => sum + e.amount, 0),
      totalProfit: revenueEntries.reduce((sum, e) => sum + e.profit, 0),
      totalExpenses: expenseEntries.reduce((sum, e) => sum + e.amount, 0),
      totalLosses: lossEntries.reduce((sum, e) => sum + e.amount, 0),
      totalPayments: paymentEntries.reduce((sum, e) => sum + e.amount, 0),
      totalPurchases: purchaseEntries.reduce((sum, e) => sum + e.amount, 0),
      supplierDebt: entities
        .filter(e => (e.type === 'office' || e.type === 'warehouse') && checkBranch(e.branchId))
        .reduce((sum, e) => sum + Number(e.balance || 0), 0),
      customerDebt: customerDebts
        .filter(d => checkBranch(d.branchId) && d.status !== 'paid')
        .reduce((sum, d) => sum + Number(d.remainingAmount || 0), 0)
    };

    const cashAvailable = stats.openingCash + stats.totalRevenue;
    const remainingCash = cashAvailable - stats.totalExpenses - stats.totalPayments;
    const netResult = stats.totalProfit - stats.totalExpenses - stats.totalLosses;

    return { allEntries, stats, netResult, cashAvailable, remainingCash };
  }, [fromDate, toDate, branchId, transactions, allLedgerEntries, expiredDamagedLosses, historicalRecords, entities, branches, employeeAttendance, customerDebts, openingCash]);

  const filteredEntries = useMemo(() => {
    if (tableFilter === 'all') return reportData.allEntries;
    return reportData.allEntries.filter(e => {
      if (tableFilter === 'revenue') return e.type === 'revenue';
      if (tableFilter === 'expense') return e.type === 'expense';
      if (tableFilter === 'damaged') return e.type === 'damaged' || e.type === 'expired';
      if (tableFilter === 'payment') return e.type === 'payment';
      if (tableFilter === 'purchase') return e.type === 'purchase';
      if (tableFilter === 'opening_cash') return e.type === 'opening_cash';
      return true;
    });
  }, [reportData.allEntries, tableFilter]);

  const chartData = useMemo(() => {
    // Group by date for chart
    const groups: Record<string, any> = {};
    const sorted = [...reportData.allEntries].sort((a,b) => a.date.getTime() - b.date.getTime());
    
    sorted.forEach(e => {
      const d = format(e.date, 'yyyy-MM-dd');
      if (!groups[d]) {
        groups[d] = { name: format(e.date, 'MM/dd'), revenue: 0, profit: 0, expense: 0, payment: 0 };
      }
      if (e.type === 'revenue') {
        groups[d].revenue += e.amount;
        groups[d].profit += e.profit;
      } else if (e.type === 'expense' || e.type === 'damaged' || e.type === 'expired') {
        groups[d].expense += e.amount;
      } else if (e.type === 'payment') {
        groups[d].payment += e.amount;
      }
    });

    return Object.values(groups);
  }, [reportData.allEntries]);

  const exportToExcel = () => {
    const wsData = [
      ["تقرير الفترة المالية"],
      [`من: ${fromDate}`, `إلى: ${toDate}`],
      [""],
      ["ملخص مالي"],
      ["الرصيد الافتتاحي", reportData.stats.openingCash],
      ["إجمالي الوارد", reportData.stats.totalRevenue],
      ["إجمالي الكاش المتاح", reportData.cashAvailable],
      ["إجمالي الأرباح", reportData.stats.totalProfit],
      ["إجمالي المصاريف", reportData.stats.totalExpenses],
      ["إجمالي التالف/الاكسباير", reportData.stats.totalLosses],
      ["إجمالي التسديدات", reportData.stats.totalPayments],
      ["الرصيد المتبقي (كاش)", reportData.remainingCash],
      ["إجمالي المشتريات", reportData.stats.totalPurchases],
      ["ديون الموردين", reportData.stats.supplierDebt],
      ["ديون الزبائن", reportData.stats.customerDebt],
      ["صافي النتيجة", reportData.netResult],
      [""],
      ["التاريخ", "النوع", "البيان", "المبلغ", "الربح", "الفرع", "المصدر"]
    ];

    reportData.allEntries.forEach(e => {
      wsData.push([
        format(e.date, 'yyyy-MM-dd'),
        e.type === 'revenue' ? 'وارد' : 
        e.type === 'expense' ? 'مصروف' : 
        e.type === 'purchase' ? 'شراء' : 
        e.type === 'payment' ? 'تسديد' : 
        e.type === 'opening_cash' ? 'رصيد افتتاحي' : 'تالف/اكسباير',
        e.description,
        e.amount,
        e.profit,
        e.branchName,
        e.source === 'direct' ? 'مباشر' : e.source === 'historical' ? 'تاريخي' : 'اكسل'
      ] as any);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Financial Report");
    XLSX.writeFile(wb, `Financial_Report_${fromDate}_to_${toDate}.xlsx`);
  };

  const exportToPDF = () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    
    const opt = {
      margin: 10,
      filename: `Financial_Report_${fromDate}_to_${toDate}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' as const }
    };

    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Filters Bar */}
      <Card className="bg-card border-border border-t-4 border-t-primary shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground pr-2">من تاريخ</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="date" 
                  value={fromDate} 
                  onChange={(e) => setFromDate(e.target.value)}
                  className="pr-10 h-12 bg-muted/50 border-border rounded-xl font-bold font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground pr-2">إلى تاريخ</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="date" 
                  value={toDate} 
                  onChange={(e) => setToDate(e.target.value)}
                  className="pr-10 h-12 bg-muted/50 border-border rounded-xl font-bold font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground pr-2">الفرع</label>
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger className="h-12 bg-muted/50 border-border rounded-xl font-bold">
                  <SelectValue placeholder="اختر الفرع" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">كل الفروع</SelectItem>
                  {branches.map(b => (
                    <SelectItem key={b.id} value={b.id!}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground pr-2">نوع التقرير</label>
              <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                <SelectTrigger className="h-12 bg-muted/50 border-border rounded-xl font-bold">
                   <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="summary">مختصر (بطاقات ورسم بیاني)</SelectItem>
                  <SelectItem value="detailed">تفصيلي (جدول كامل)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 h-12">
               <Button onClick={exportToExcel} variant="outline" className="flex-1 h-full rounded-xl border-border hover:bg-muted text-emerald-600 font-bold gap-2">
                 <FileSpreadsheet className="h-4 w-4" />
                 Excel
               </Button>
               <Button onClick={exportToPDF} variant="outline" className="flex-1 h-full rounded-xl border-border hover:bg-muted text-rose-500 font-bold gap-2">
                 <FileDown className="h-4 w-4" />
                 PDF
               </Button>
               <Button onClick={() => window.print()} variant="outline" className="h-full rounded-xl border-border hover:bg-muted text-primary font-bold px-4">
                 <Printer className="h-4 w-4" />
               </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div id="report-content" className="space-y-6">
        {/* Summary Header for Export */}
        <div className="hidden print:block text-center space-y-2 mb-8">
           <h1 className="text-3xl font-black">{branches.find(b => b.id === branchId)?.name || 'كل الفروع'}</h1>
           <h2 className="text-xl font-bold">تقرير الفترة المالية</h2>
           <p className="text-sm font-bold text-muted-foreground">من {fromDate} إلى {toDate}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { label: 'الرصيد الافتتاحي', value: reportData.stats.openingCash, icon: History, color: 'text-amber-500', bg: 'bg-amber-500/5' },
            { label: 'واردات الفترة', value: reportData.stats.totalRevenue, icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-500/5' },
            { label: 'الكاش المتاح', value: reportData.cashAvailable, icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-500/5' },
            { label: 'المصروفات العامة', value: reportData.stats.totalExpenses, icon: ArrowUpCircle, color: 'text-rose-500', bg: 'bg-rose-500/5' },
            { label: 'إجمالي التسديدات', value: reportData.stats.totalPayments, icon: CheckCircle2, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
            { label: 'الرصيد المتبقي', value: reportData.remainingCash, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'صافي الأرباح', value: reportData.stats.totalProfit, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
            { label: 'تالف واكسباير', value: reportData.stats.totalLosses, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/5' },
            { label: 'إجمالي المشتريات', value: reportData.stats.totalPurchases, icon: ShoppingCart, color: 'text-violet-500', bg: 'bg-violet-500/5' },
            { label: 'ديون الموردين', value: reportData.stats.supplierDebt, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-600/5' },
            { label: 'ديون الزبائن', value: reportData.stats.customerDebt, icon: History, color: 'text-amber-600', bg: 'bg-amber-600/5' },
            { label: 'صافي النتيجة', value: reportData.netResult, icon: DollarSign, color: reportData.netResult >= 0 ? 'text-emerald-600' : 'text-rose-600', bg: reportData.netResult >= 0 ? 'bg-emerald-600/5' : 'bg-rose-600/5' },
          ].map((stat, i) => (
            <Card key={i} className={`border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-muted-foreground uppercase">{stat.label}</span>
                  <div className={`text-2xl font-black font-mono tracking-tighter ${stat.color}`}>
                    {formatNumberWithCommas(stat.value)}
                  </div>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bg}`}>
                  <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart View */}
        <Card className="bg-card border-border rounded-3xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 px-8 py-6">
            <CardTitle className="text-xl font-black">تحليل التدفق النقدي للفترة</CardTitle>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase text-muted-foreground">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> وارد</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> أرباح</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> مصاريف</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> تسديدات</div>
            </div>
          </CardHeader>
          <CardContent className="p-8 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: 'currentColor' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: 'currentColor' }}
                  tickFormatter={(v) => `${v/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', fontSize: '10px', fontWeight: 900 }}
                  itemStyle={{ padding: '2px 0' }}
                />
                <Area type="monotone" dataKey="revenue" name="الوارد" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                <Area type="monotone" dataKey="profit" name="الأرباح" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={3} />
                <Area type="monotone" dataKey="expense" name="المصاريف" stroke="#ef4444" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                <Area type="monotone" dataKey="payment" name="التسديدات" stroke="#6366f1" fillOpacity={0} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Table */}
        <Card className="bg-card border-border rounded-3xl shadow-sm overflow-hidden">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border/50 px-8 py-6 gap-4">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-black">السجل التفصيلي للفترة</CardTitle>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'revenue', label: 'وارد' },
                { id: 'opening_cash', label: 'رصيد افتتاحي' },
                { id: 'payment', label: 'تسديد' },
                { id: 'purchase', label: 'شراء' },
                { id: 'expense', label: 'مصروف' },
                { id: 'damaged', label: 'تالف/اكسباير' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setTableFilter(f.id as any)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                    tableFilter === f.id 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="font-black text-muted-foreground w-[120px] text-right">التاريخ</TableHead>
                    <TableHead className="font-black text-muted-foreground w-[100px] text-right">النوع</TableHead>
                    <TableHead className="font-black text-muted-foreground text-right">البيان</TableHead>
                    <TableHead className="font-black text-muted-foreground text-right">المبلغ</TableHead>
                    <TableHead className="font-black text-muted-foreground text-right">الربح</TableHead>
                    <TableHead className="font-black text-muted-foreground text-right">الفرع</TableHead>
                    <TableHead className="font-black text-muted-foreground text-left">المصدر</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-bold">لا توجد بيانات للفترة المحددة</TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries.map((e, i) => (
                      <TableRow key={e.id} className="border-border/40 hover:bg-muted/20 transition-colors group">
                        <TableCell className="font-mono font-bold text-xs">{format(e.date, 'yyyy-MM-dd')}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${
                            e.type === 'revenue' ? 'bg-blue-500/10 text-blue-500' :
                            e.type === 'opening_cash' ? 'bg-amber-500/10 text-amber-500' :
                            e.type === 'expense' ? 'bg-rose-500/10 text-rose-500' :
                            e.type === 'purchase' ? 'bg-violet-500/10 text-violet-500' :
                            e.type === 'payment' ? 'bg-indigo-500/10 text-indigo-500' :
                            'bg-amber-500/10 text-amber-500'
                          }`}>
                            {e.type === 'revenue' ? 'وارد' : e.type === 'opening_cash' ? 'رصيد افتتاحي' : e.type === 'expense' ? 'مصروف' : e.type === 'purchase' ? 'شراء' : e.type === 'payment' ? 'تسديد' : 'خسارة'}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-xs text-foreground/80 group-hover:text-foreground">{e.description}</TableCell>
                        <TableCell className="font-mono font-black text-foreground">{formatNumberWithCommas(e.amount)}</TableCell>
                        <TableCell className="font-mono font-bold text-emerald-600">{e.profit > 0 ? formatNumberWithCommas(e.profit) : '-'}</TableCell>
                        <TableCell className="text-xs font-bold text-muted-foreground">{e.branchName}</TableCell>
                        <TableCell>
                           <div className="flex items-center gap-1">
                             {e.source === 'historical' ? (
                               <div className="flex items-center gap-1 text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full text-[9px] font-black">
                                 <History className="h-3 w-3" />
                                 تاريخي
                               </div>
                             ) : e.source === 'excel' ? (
                               <div className="flex items-center gap-1 text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[9px] font-black">
                                 <FileSpreadsheet className="h-3 w-3" />
                                 اكسل
                               </div>
                             ) : (
                               <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-full text-[9px] font-black">
                                 <Building2 className="h-3 w-3" />
                                 مباشر
                               </div>
                             )}
                           </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
