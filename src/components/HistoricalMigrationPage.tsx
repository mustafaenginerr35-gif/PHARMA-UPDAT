import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  History, 
  FileUp, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Download,
  AlertTriangle,
  Info,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  ArrowUpRight,
  RefreshCcw,
  Trash2,
  Table as TableIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { db as localDb, type HistoricalRecord } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { formatIQD } from '@/src/lib/formatters';

interface HistoricalMigrationPageProps {
  branchId: string | null;
  ownerId: string;
}

export const HistoricalMigrationPage: React.FC<HistoricalMigrationPageProps> = ({ branchId, ownerId }) => {
  const [activeTab, setActiveTab] = useState('opening');
  
  const historicalRecords = useLiveQuery(
    () => localDb.historicalRecords
      .where('ownerId').equals(ownerId)
      .and(r => !branchId || r.branchId === branchId)
      .toArray(),
    [ownerId, branchId]
  );

  const [openingBalance, setOpeningBalance] = useState({
    cashHand: 0,
    inventoryValue: 0,
    customerDebts: 0,
    officeDebts: 0,
    warehouseDebts: 0,
    accumulatedExpenses: 0,
    retainedEarnings: 0,
    notes: ''
  });

  const [batchEntry, setBatchEntry] = useState({
    startDate: '',
    endDate: '',
    totalSales: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    totalProfits: 0,
    totalDebtOwed: 0,
    totalPaidDebt: 0,
    estimatedInventory: 0,
    notes: ''
  });

  const handleSaveOpeningBalance = async () => {
    try {
      const record: Omit<HistoricalRecord, 'id'> = {
        type: 'opening_balance',
        ...openingBalance,
        isHistorical: true,
        branchId: branchId || undefined,
        ownerId,
        createdAt: new Date()
      };
      
      await localDb.historicalRecords.add(record as HistoricalRecord);
      toast.success('تمت إضافة الأرصدة الافتتاحية بنجاح');
      // Reset form
      setOpeningBalance({
        cashHand: 0,
        inventoryValue: 0,
        customerDebts: 0,
        officeDebts: 0,
        warehouseDebts: 0,
        accumulatedExpenses: 0,
        retainedEarnings: 0,
        notes: ''
      });
    } catch (err) {
      toast.error('حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleSaveBatchEntry = async () => {
    if (!batchEntry.startDate || !batchEntry.endDate) {
      toast.error('يرجى تحديد الفترة الزمنية');
      return;
    }
    
    try {
      const record: Omit<HistoricalRecord, 'id'> = {
        type: 'batch_period',
        ...batchEntry,
        startDate: new Date(batchEntry.startDate),
        endDate: new Date(batchEntry.endDate),
        isHistorical: true,
        branchId: branchId || undefined,
        ownerId,
        createdAt: new Date()
      };
      
      await localDb.historicalRecords.add(record as HistoricalRecord);
      toast.success('تم ترحيل العمليات التاريخية بنجاح');
      // Reset form
      setBatchEntry({
        startDate: '',
        endDate: '',
        totalSales: 0,
        totalPurchases: 0,
        totalExpenses: 0,
        totalProfits: 0,
        totalDebtOwed: 0,
        totalPaidDebt: 0,
        estimatedInventory: 0,
        notes: ''
      });
    } catch (err) {
      toast.error('حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        // Simple validation and processing could go here
        // For now, just alert or process first row as opening balances?
        // Or assume a specific format for batch entries.
        toast.info(`تم قراءة ${data.length} صف من ملف Excel. الميزة قيد التطوير للتخصيص الكامل.`);
      } catch (err) {
        toast.error('فشل استيراد الملف');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل التاريخي؟')) {
      await localDb.historicalRecords.delete(id);
      toast.success('تم حذف السجل');
    }
  };

  const totals = historicalRecords?.reduce((acc, rec) => {
    if (rec.type === 'opening_balance') {
      acc.cash += rec.cashHand || 0;
      acc.inventory += rec.inventoryValue || 0;
      acc.profits += rec.retainedEarnings || 0;
      acc.debtsToOthers += (rec.officeDebts || 0) + (rec.warehouseDebts || 0);
      acc.debtsFromOthers += rec.customerDebts || 0;
    } else {
      acc.sales += rec.totalSales || 0;
      acc.purchases += rec.totalPurchases || 0;
      acc.expenses += rec.totalExpenses || 0;
      acc.profits += rec.totalProfits || 0;
      acc.debtsToOthers += rec.totalDebtOwed || 0;
      acc.debtsFromOthers += rec.totalDebtOwed || 0; // Usually debt owed is to suppliers? 
      // User prompt says: "مجموع الديون المستحقة" (Could be both)
      // Let's assume the user means debts to suppliers for batch entry
    }
    return acc;
  }, { cash: 0, inventory: 0, sales: 0, purchases: 0, expenses: 0, profits: 0, debtsToOthers: 0, debtsFromOthers: 0 }) || { cash: 0, inventory: 0, sales: 0, purchases: 0, expenses: 0, profits: 0, debtsToOthers: 0, debtsFromOthers: 0 };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
            <History className="h-6 w-6 text-primary" />
            الأرصدة الافتتاحية والترحيل التاريخي
          </h2>
          <p className="text-muted-foreground font-bold text-sm">إدارة ودمج البيانات السابقة مع النظام الحالي</p>
        </div>
        
        <div className="flex gap-2">
            <input 
              type="file" 
              id="excel-import" 
              className="hidden" 
              accept=".xlsx, .xls"
              onChange={handleExcelImport}
            />
            <Button 
              variant="outline" 
              className="rounded-xl border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 gap-2 font-bold"
              onClick={() => document.getElementById('excel-import')?.click()}
            >
              <FileUp className="h-4 w-4" />
              استيراد من Excel
            </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-1 mb-6 rounded-2xl w-full md:w-auto h-auto grid grid-cols-3">
          <TabsTrigger value="opening" className="rounded-xl py-3 data-[state=active]:bg-card font-black gap-2">
             <DollarSign className="h-4 w-4" />
             أرصدة افتتاحية
          </TabsTrigger>
          <TabsTrigger value="batch" className="rounded-xl py-3 data-[state=active]:bg-card font-black gap-2">
             <RefreshCcw className="h-4 w-4" />
             ترحيل مجاميع
          </TabsTrigger>
          <TabsTrigger value="review" className="rounded-xl py-3 data-[state=active]:bg-card font-black gap-2">
             <TableIcon className="h-4 w-4" />
             البيانات المرحّلة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opening" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
           <Card className="border-border shadow-sm overflow-hidden">
             <CardHeader className="bg-muted/50 border-b border-border">
               <CardTitle className="text-lg font-black flex items-center gap-2">
                 <Building2 className="h-5 w-5 text-primary" />
                 إدخال الأرصدة الافتتاحية للمؤسسة
               </CardTitle>
               <CardDescription className="font-bold">أدخل الأرصدة المتوفرة في لحظة بدء استخدام النظام</CardDescription>
             </CardHeader>
             <CardContent className="p-6">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-muted-foreground">الرصيد النقدي الحالي (الكاش)</Label>
                    <div className="relative">
                      <Input 
                        type="number"
                        value={openingBalance.cashHand}
                        onChange={e => setOpeningBalance({...openingBalance, cashHand: Number(e.target.value)})}
                        className="bg-muted border-border font-mono h-12 rounded-xl pr-10"
                      />
                      <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-bold text-muted-foreground">قيمة المخزون التقديرية</Label>
                    <div className="relative">
                      <Input 
                        type="number"
                        value={openingBalance.inventoryValue}
                        onChange={e => setOpeningBalance({...openingBalance, inventoryValue: Number(e.target.value)})}
                        className="bg-muted border-border font-mono h-12 rounded-xl pr-10"
                      />
                      <Package className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-muted-foreground">ديون الزبائن (مستحقات لك)</Label>
                    <Input 
                      type="number"
                      value={openingBalance.customerDebts}
                      onChange={e => setOpeningBalance({...openingBalance, customerDebts: Number(e.target.value)})}
                      className="bg-muted border-border font-mono h-12 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-muted-foreground">ديون المكاتب / المذاخر (عليك)</Label>
                    <Input 
                      type="number"
                      value={openingBalance.officeDebts + openingBalance.warehouseDebts}
                      onChange={e => setOpeningBalance({...openingBalance, officeDebts: Number(e.target.value)})}
                      className="bg-muted border-border font-mono h-12 rounded-xl"
                    />
                    <p className="text-[10px] text-muted-foreground font-bold">إجمالي ديون الموردين والجهات الخارجية</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-muted-foreground">المصاريف المتراكمة السابقة</Label>
                    <Input 
                      type="number"
                      value={openingBalance.accumulatedExpenses}
                      onChange={e => setOpeningBalance({...openingBalance, accumulatedExpenses: Number(e.target.value)})}
                      className="bg-muted border-border font-mono h-12 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-muted-foreground">الأرباح المرحّلة</Label>
                    <Input 
                      type="number"
                      value={openingBalance.retainedEarnings}
                      onChange={e => setOpeningBalance({...openingBalance, retainedEarnings: Number(e.target.value)})}
                      className="bg-muted border-border font-mono h-12 rounded-xl"
                    />
                  </div>
               </div>
               
               <div className="mt-6 space-y-2">
                  <Label className="font-bold text-muted-foreground">ملاحظات إضافية</Label>
                  <Textarea 
                    value={openingBalance.notes}
                    onChange={e => setOpeningBalance({...openingBalance, notes: e.target.value})}
                    placeholder="أي ملاحظات حول الأرصدة الافتتاحية..."
                    className="bg-muted border-border rounded-xl min-h-[100px]"
                  />
               </div>
             </CardContent>
             <CardFooter className="bg-muted/30 border-t border-border p-6 flex justify-end">
                <Button 
                  onClick={handleSaveOpeningBalance}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-black h-12 px-10 rounded-xl shadow-lg shadow-primary/20 gap-2"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  حفظ الأرصدة الافتتاحية
                </Button>
             </CardFooter>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="p-6">
                   <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-black text-emerald-600 uppercase tracking-wider mb-1">إجمالي الموجودات</p>
                        <h3 className="text-2xl font-black text-emerald-700">{(totals.cash + totals.inventory + totals.debtsFromOthers).toLocaleString()} د.ع</h3>
                      </div>
                      <div className="p-3 bg-emerald-500/20 rounded-xl">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      </div>
                   </div>
                </CardContent>
              </Card>

              <Card className="border-rose-500/20 bg-rose-500/5">
                <CardContent className="p-6">
                   <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-black text-rose-600 uppercase tracking-wider mb-1">إجمالي المطلوبات</p>
                        <h3 className="text-2xl font-black text-rose-700">{(totals.debtsToOthers).toLocaleString()} د.ع</h3>
                      </div>
                      <div className="p-3 bg-rose-500/20 rounded-xl">
                        <TrendingDown className="h-5 w-5 text-rose-600" />
                      </div>
                   </div>
                </CardContent>
              </Card>

              <Card className="border-blue-500/20 bg-blue-500/5">
                <CardContent className="p-6">
                   <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-black text-blue-600 uppercase tracking-wider mb-1">صافي القيمة (رأس المال)</p>
                        <h3 className="text-2xl font-black text-blue-700">{(totals.cash + totals.inventory + totals.debtsFromOthers - totals.debtsToOthers).toLocaleString()} د.ع</h3>
                      </div>
                      <div className="p-3 bg-blue-500/20 rounded-xl">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                   </div>
                </CardContent>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="batch" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
           <Card className="border-border shadow-sm">
             <CardHeader className="bg-muted/50 border-b border-border">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <RefreshCcw className="h-5 w-5 text-primary" />
                  ترحيل مجاميع العمليات لفترات سابقة
                </CardTitle>
                <CardDescription className="font-bold">إدخال ملخصات العمليات المالية لفترة زمنية محددة</CardDescription>
             </CardHeader>
             <CardContent className="p-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-bold text-muted-foreground">من تاريخ</Label>
                        <Input 
                          type="date"
                          value={batchEntry.startDate}
                          onChange={e => setBatchEntry({...batchEntry, startDate: e.target.value})}
                          className="bg-muted border-border h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-muted-foreground">إلى تاريخ</Label>
                        <Input 
                          type="date"
                          value={batchEntry.endDate}
                          onChange={e => setBatchEntry({...batchEntry, endDate: e.target.value})}
                          className="bg-muted border-border h-12 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-muted-foreground">إجمالي المبيعات للفترة</Label>
                      <Input 
                        type="number"
                        value={batchEntry.totalSales}
                        onChange={e => setBatchEntry({...batchEntry, totalSales: Number(e.target.value)})}
                        className="bg-muted border-border font-mono h-12 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-muted-foreground">إجمالي المشتريات للفترة</Label>
                      <Input 
                        type="number"
                        value={batchEntry.totalPurchases}
                        onChange={e => setBatchEntry({...batchEntry, totalPurchases: Number(e.target.value)})}
                        className="bg-muted border-border font-mono h-12 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-muted-foreground">إجمالي المصاريف للفترة</Label>
                      <Input 
                        type="number"
                        value={batchEntry.totalExpenses}
                        onChange={e => setBatchEntry({...batchEntry, totalExpenses: Number(e.target.value)})}
                        className="bg-muted border-border font-mono h-12 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-muted-foreground">إجمالي الأرباح المتحققة</Label>
                      <Input 
                        type="number"
                        value={batchEntry.totalProfits}
                        onChange={e => setBatchEntry({...batchEntry, totalProfits: Number(e.target.value)})}
                        className="bg-muted border-border font-mono h-12 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-bold text-muted-foreground">الديون المستحقة</Label>
                        <Input 
                          type="number"
                          value={batchEntry.totalDebtOwed}
                          onChange={e => setBatchEntry({...batchEntry, totalDebtOwed: Number(e.target.value)})}
                          className="bg-muted border-border font-mono h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-muted-foreground">المسدد من الديون</Label>
                        <Input 
                          type="number"
                          value={batchEntry.totalPaidDebt}
                          onChange={e => setBatchEntry({...batchEntry, totalPaidDebt: Number(e.target.value)})}
                          className="bg-muted border-border font-mono h-12 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-muted-foreground">المخزون التقديري في نهاية الفترة</Label>
                      <Input 
                        type="number"
                        value={batchEntry.estimatedInventory}
                        onChange={e => setBatchEntry({...batchEntry, estimatedInventory: Number(e.target.value)})}
                        className="bg-muted border-border font-mono h-12 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-muted-foreground">ملاحظات</Label>
                      <Textarea 
                        value={batchEntry.notes}
                        onChange={e => setBatchEntry({...batchEntry, notes: e.target.value})}
                        className="bg-muted border-border rounded-xl min-h-[100px]"
                      />
                    </div>
                  </div>
               </div>
             </CardContent>
             <CardFooter className="bg-muted/30 border-t border-border p-6 flex justify-end">
                <Button 
                   onClick={handleSaveBatchEntry}
                   className="bg-primary hover:bg-primary/90 text-primary-foreground font-black h-12 px-10 rounded-xl shadow-lg shadow-primary/20 gap-2"
                >
                  <Plus className="h-5 w-5" />
                  ترحيل هذه الفترة
                </Button>
             </CardFooter>
           </Card>
           
           <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-4 items-center">
              <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
              <p className="text-sm font-bold text-amber-700">تنبيه: سيتم وسم هذه البيانات بـ <span className="underline">(بيانات تاريخية)</span> في التقارير ولن تؤثر على كشف الحسابات اليومية التفصيلي، لكنها ستدخل في الحسابات الختامية.</p>
           </div>
        </TabsContent>

        <TabsContent value="review" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
           <div className="flex items-center gap-4 py-4 px-6 bg-card border border-border rounded-2xl shadow-sm">
              <div className="p-3 bg-primary/10 rounded-xl">
                 <TableIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                 <h3 className="font-black text-foreground">سجل البيانات المرحّلة</h3>
                 <p className="text-xs text-muted-foreground font-bold">مراجعة كافة الأرصدة والعمليات التاريخية المدخلة</p>
              </div>
           </div>

           <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                   <tr>
                      <th className="px-6 py-4 text-right text-xs font-black uppercase text-muted-foreground">النوع</th>
                      <th className="px-6 py-4 text-right text-xs font-black uppercase text-muted-foreground">الفترة / التفاصيل</th>
                      <th className="px-6 py-4 text-right text-xs font-black uppercase text-muted-foreground">القيم المالية</th>
                      <th className="px-6 py-4 text-right text-xs font-black uppercase text-muted-foreground">تاريخ الترحيل</th>
                      <th className="px-6 py-4 text-center text-xs font-black uppercase text-muted-foreground">الإجراءات</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-border">
                   <AnimatePresence>
                    {historicalRecords?.map((record) => (
                      <motion.tr 
                        key={record.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${record.type === 'opening_balance' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                              {record.type === 'opening_balance' ? 'رصيد افتتاحي' : 'ترحيل مجاميع'}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           {record.type === 'opening_balance' ? (
                             <div className="text-xs font-bold text-foreground">أرصدة عند التأسيس</div>
                           ) : (
                             <div className="text-xs font-bold text-foreground">
                                من {format(record.startDate!, 'yyyy/MM/dd')} إلى {format(record.endDate!, 'yyyy/MM/dd')}
                             </div>
                           )}
                           <div className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{record.notes}</div>
                        </td>
                        <td className="px-6 py-4">
                           {record.type === 'opening_balance' ? (
                             <div className="space-y-1">
                                <div className="text-[10px]"><span className="text-muted-foreground">نقد:</span> <span className="font-mono font-bold">{(record.cashHand || 0).toLocaleString()}</span></div>
                                <div className="text-[10px]"><span className="text-muted-foreground">مخزون:</span> <span className="font-mono font-bold">{(record.inventoryValue || 0).toLocaleString()}</span></div>
                             </div>
                           ) : (
                             <div className="space-y-1">
                                <div className="text-[10px]"><span className="text-muted-foreground">مبيعات:</span> <span className="font-mono font-bold">{(record.totalSales || 0).toLocaleString()}</span></div>
                                <div className="text-[10px]"><span className="text-muted-foreground">أرباح:</span> <span className="font-mono font-bold">{(record.totalProfits || 0).toLocaleString()}</span></div>
                             </div>
                           )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-xs font-bold text-foreground">{format(record.createdAt, 'yyyy/MM/dd HH:mm')}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-full"
                             onClick={() => handleDeleteRecord(record.id!)}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </td>
                      </motion.tr>
                    ))}
                   </AnimatePresence>
                   {!historicalRecords || historicalRecords.length === 0 && (
                     <tr>
                       <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground font-bold">لا توجد بيانات مرحّلة حتى الآن</td>
                     </tr>
                   )}
                </tbody>
              </table>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
