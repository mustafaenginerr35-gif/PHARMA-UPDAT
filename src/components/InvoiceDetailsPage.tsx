import React from 'react';
import { 
  FileText, 
  Edit, 
  DollarSign, 
  RefreshCcw, 
  Printer, 
  Trash2, 
  ArrowRight,
  Calendar,
  User,
  CreditCard,
  History,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Info,
  ShieldCheck,
  TrendingDown,
  Gift,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { LedgerEntry, Entity } from '../db';
import { motion } from 'framer-motion';

interface InvoiceDetailsPageProps {
  invoice: LedgerEntry;
  entity: Entity | null;
  paymentHistory: LedgerEntry[];
  appMode?: 'laptop' | 'mobile';
  onBack: () => void;
  onEdit: (invoice: LedgerEntry) => void;
  onPayment: (invoice: LedgerEntry) => void;
  onRefund: (invoice: LedgerEntry) => void;
  onDelete: (invoice: LedgerEntry) => void;
  onPrint: (invoice: LedgerEntry) => void;
}

export const InvoiceDetailsPage: React.FC<InvoiceDetailsPageProps> = ({
  invoice,
  entity,
  paymentHistory,
  appMode = 'laptop',
  onBack,
  onEdit,
  onPayment,
  onRefund,
  onDelete,
  onPrint,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-black ring-1 ring-emerald-500/20">مسدد بالكامل</span>;
      case 'partial':
        return <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-black ring-1 ring-blue-500/20">مسدد جزئياً</span>;
      case 'overdue':
        return <span className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-xs font-black ring-1 ring-rose-500/20">متأخر</span>;
      default:
        return <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-black ring-1 ring-amber-500/20">غير مسدد</span>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
      dir="rtl"
    >
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full h-10 w-10 hover:bg-muted">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="h-10 w-px bg-border mx-2" />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-foreground">قائمة رقم: {invoice.invoiceNumber}</h2>
              {getStatusBadge(invoice.paymentStatus || 'pending')}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-muted-foreground font-bold">
              <User className="h-3.5 w-3.5" />
              <span>المورد: {invoice.accountName}</span>
              <span className="mx-2">•</span>
              <Calendar className="h-3.5 w-3.5" />
              <span>بتاريخ: {format(invoice.date, 'yyyy/MM/dd')}</span>
            </div>
          </div>
        </div>

        <div className={`flex items-center gap-2 flex-wrap ${appMode === 'mobile' ? 'w-full grid grid-cols-2 md:flex md:w-auto' : ''}`}>
          <Button variant="outline" className={`gap-2 h-11 px-5 rounded-xl font-bold border-amber-500/20 bg-amber-500/5 text-amber-600 hover:bg-amber-500/10 ${appMode === 'mobile' ? 'flex-1' : ''}`} onClick={() => onEdit(invoice)}>
            <Edit className="h-4 w-4" />
            تعديل
          </Button>
          <Button variant="outline" className={`gap-2 h-11 px-5 rounded-xl font-bold border-emerald-500/20 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-700 hover:text-white transition-all shadow-sm ${appMode === 'mobile' ? 'flex-1' : ''}`} onClick={() => onPayment(invoice)}>
            <DollarSign className="h-4 w-4" />
            تسديد
          </Button>
          <Button variant="outline" className={`gap-2 h-11 px-5 rounded-xl font-bold border-rose-500/20 bg-rose-500/5 text-rose-600 hover:bg-rose-500/10 ${appMode === 'mobile' ? 'flex-1' : ''}`} onClick={() => onRefund(invoice)}>
            <RefreshCcw className="h-4 w-4" />
            مرتجع
          </Button>
          <Button variant="outline" className={`gap-2 h-11 px-5 rounded-xl font-bold border-border bg-muted/50 text-foreground hover:bg-muted ${appMode === 'mobile' ? 'flex-1' : ''}`} onClick={() => onPrint(invoice)}>
            <Printer className="h-4 w-4" />
            طباعة
          </Button>
          <Button variant="ghost" className={`gap-2 h-11 px-5 rounded-xl font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 ${appMode === 'mobile' ? 'col-span-2' : ''}`} onClick={() => onDelete(invoice)}>
            <Trash2 className="h-4 w-4" />
            حذف
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Section 1: Financial Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'المبلغ الكلي', value: invoice.amount, color: 'text-foreground', bg: 'bg-muted/50' },
              { label: 'الخصم', value: invoice.discount || 0, color: 'text-rose-500', bg: 'bg-rose-500/5', prefix: '-' },
              { label: 'البونص', value: invoice.bonus || 0, color: 'text-emerald-500', bg: 'bg-emerald-500/5', icon: Gift },
              { label: 'الصافي المطلوب', value: invoice.netAmount, color: 'text-primary', bg: 'bg-primary/5', emphasize: true },
              { label: 'المدفوع', value: invoice.paidAmount || 0, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
              { label: 'المتبقي', value: invoice.remainingAmount || 0, color: 'text-rose-600', bg: 'bg-rose-500/10 font-bold' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx} className={`border-border ${stat.bg} ${stat.emphasize ? 'ring-2 ring-primary/20 shadow-lg shadow-primary/5' : ''} rounded-2xl overflow-hidden group`}>
                  <CardContent className="p-4 flex flex-col items-center justify-center min-h-[100px] text-center">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      {Icon && <Icon className="h-3 w-3" />}
                      {stat.label}
                    </span>
                    <div className={`text-lg font-black font-mono tracking-tighter ${stat.color}`}>
                    {stat.prefix}{stat.value.toLocaleString()}
                    <span className="text-[9px] mr-1 font-sans">د.ع</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Section 2: Invoice Line Items */}
          <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border py-6 px-8">
              <CardTitle className="text-lg font-black text-foreground flex items-center gap-3">
                <Receipt className="h-5 w-5 text-primary" />
                تفاصيل المواد في القائمة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {appMode === 'laptop' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                   <thead>
                     <tr className="bg-muted/20">
                       <th className="px-8 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider border-b border-border">المادة / البيان</th>
                       <th className="px-8 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider border-b border-border">الكمية</th>
                       <th className="px-8 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider border-b border-border">السعر</th>
                       <th className="px-8 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider border-b border-border text-left">الإجمالي</th>
                     </tr>
                   </thead>
                   <tbody>
                     <tr className="border-b border-border/50 hover:bg-muted/5 transition-colors">
                       <td className="px-8 py-5">
                         <div className="font-black text-foreground">توريد أدوية ومستلزمات طبية متنوعة</div>
                         <div className="text-[10px] text-muted-foreground mt-1 font-bold">حسب القائمة المرفقة</div>
                       </td>
                       <td className="px-8 py-5 font-mono font-bold text-foreground">1</td>
                       <td className="px-8 py-5 font-mono font-bold text-foreground">{invoice.amount.toLocaleString()}</td>
                       <td className="px-8 py-5 font-mono font-black text-primary text-left">{invoice.amount.toLocaleString()}</td>
                     </tr>
                   </tbody>
                   <tfoot>
                     <tr className="bg-muted/10 font-black">
                       <td colSpan={3} className="px-8 py-4 text-muted-foreground text-left italic">المجموع الكلي</td>
                       <td className="px-8 py-4 font-mono text-foreground text-left text-lg">{invoice.amount.toLocaleString()} د.ع</td>
                     </tr>
                   </tfoot>
                </table>
              </div>
              ) : (
                <div className="p-4 space-y-4">
                  <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-3">
                    <div className="font-black text-foreground text-sm">توريد أدوية ومستلزمات طبية متنوعة</div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>الكمية: 1</span>
                      <span>السعر: {invoice.amount.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-border/50 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-muted-foreground">الإجمالي</span>
                      <span className="font-black text-primary font-mono">{invoice.amount.toLocaleString()} د.ع</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Payment History Ledger */}
          <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border py-4 px-6 md:py-6 md:px-8">
              <div className="flex justify-between items-center w-full">
                <CardTitle className="text-base md:text-lg font-black text-foreground flex items-center gap-3">
                  <History className="h-5 w-5 text-emerald-500" />
                  سجل التسديدات والدفعات
                </CardTitle>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full font-black">
                  إجمالي المسدد: {invoice.paidAmount?.toLocaleString()} د.ع
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               {appMode === 'laptop' ? (
               <div className="overflow-x-auto">
                 <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-muted/10">
                        <th className="px-8 py-4 text-xs font-extrabold text-muted-foreground border-b border-border">التاريخ</th>
                        <th className="px-8 py-4 text-xs font-extrabold text-muted-foreground border-b border-border">البيان</th>
                        <th className="px-8 py-4 text-xs font-extrabold text-muted-foreground border-b border-border text-left">المبلغ المسدد</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment) => (
                        <tr key={payment.id} className="border-b border-border/50 hover:bg-muted/5 transition-colors">
                          <td className="px-8 py-4 text-xs font-mono font-bold text-muted-foreground italic">
                            {format(payment.date, 'yyyy/MM/dd HH:mm')}
                          </td>
                          <td className="px-8 py-4">
                            <div className="font-bold text-foreground text-sm flex items-center gap-2">
                              {payment.operationType === 'payment' ? (
                                <ArrowRight className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <RefreshCcw className="h-3 w-3 text-rose-500" />
                              )}
                              {payment.notes || (payment.operationType === 'payment' ? 'دفعة نقدية مسددة' : 'مرتجع فاتورة')}
                            </div>
                          </td>
                          <td className={`px-8 py-4 font-mono font-black text-left ${payment.operationType === 'payment' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {payment.operationType === 'payment' ? '+' : '-'}{payment.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {paymentHistory.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-12 text-center text-muted-foreground font-bold italic text-sm">
                            لا توجد دفعات مسجلة لهذه القائمة بعد
                          </td>
                        </tr>
                      )}
                    </tbody>
                 </table>
               </div>
               ) : (
                <div className="p-4 space-y-3">
                   {paymentHistory.map((payment) => (
                    <div key={payment.id} className="p-4 bg-muted/20 border border-border rounded-xl flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="text-[10px] text-muted-foreground font-mono italic">{format(payment.date, 'yyyy/MM/dd HH:mm')}</div>
                        <div className="font-bold text-foreground text-xs flex items-center gap-2">
                           {payment.operationType === 'payment' ? (
                              <ArrowRight className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <RefreshCcw className="h-3 w-3 text-rose-500" />
                            )}
                            {payment.notes || (payment.operationType === 'payment' ? 'دفعة نقدية مسددة' : 'مرتجع فاتورة')}
                        </div>
                      </div>
                      <div className={`font-black font-mono text-base ${payment.operationType === 'payment' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {payment.operationType === 'payment' ? '+' : '-'}{payment.amount.toLocaleString()}
                      </div>
                    </div>
                   ))}
                   {paymentHistory.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground font-bold italic text-xs">
                      لا توجد دفعات مسجلة بعد
                    </div>
                   )}
                </div>
               )}
            </CardContent>
          </Card>
        </div>

        {/* Section 6 & 4 & 5: Right Sidebar */}
        <div className="space-y-8">
          {/* Quick Actions Sidebar */}
          <Card className="bg-primary/5 border-primary/20 rounded-2xl overflow-hidden">
             <CardHeader className="p-6 pb-4">
                <CardTitle className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  إجراءات سريعة
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 pt-0 space-y-3">
               <Button variant="default" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl h-12 shadow-lg shadow-emerald-600/20 gap-3" onClick={() => onPayment(invoice)}>
                 <DollarSign className="h-4 w-4" />
                 تسديد دفعة جديدة
               </Button>
               <Button variant="outline" className="w-full border-primary/20 bg-white dark:bg-muted/50 text-foreground font-bold rounded-xl h-11 transition-all hover:bg-primary/5 hover:border-primary/50 gap-3" onClick={() => onEdit(invoice)}>
                 <Edit className="h-4 w-4" />
                 تعديل بيانات الفاتورة
               </Button>
               <Button variant="outline" className="w-full border-rose-500/20 bg-white dark:bg-rose-500/5 text-rose-600 font-bold rounded-xl h-11 transition-all hover:bg-rose-500/10 gap-3" onClick={() => onRefund(invoice)}>
                 <RefreshCcw className="h-4 w-4" />
                 إرجاع مادة (مرتجع)
               </Button>
             </CardContent>
          </Card>

          {/* Section 4: Attachments */}
          <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="p-6 pb-2">
               <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                 <ImageIcon className="h-4 w-4" />
                 المرفقات والصور
               </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
               {invoice.imageUrl ? (
                 <div className="group relative rounded-xl overflow-hidden border border-border bg-muted cursor-pointer aspect-[4/3]" onClick={() => window.open(invoice.imageUrl, '_blank')}>
                   <img src={invoice.imageUrl} alt="Invoice" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-sm">
                       <ImageIcon className="h-3.5 w-3.5" />
                       عرض الصورة كاملة
                     </span>
                   </div>
                 </div>
               ) : (
                 <div className="py-8 text-center bg-muted/30 border-2 border-dashed border-border rounded-2xl flex flex-col items-center gap-3">
                   <ImageIcon className="h-8 w-8 text-muted-foreground opacity-20" />
                   <div className="text-[10px] text-muted-foreground font-black uppercase">لا توجد صور مرفقة</div>
                   <Button variant="ghost" size="sm" className="text-[10px] font-black p-0 h-auto text-primary hover:bg-transparent">+ أضف صورة الآن</Button>
                 </div>
               )}
            </CardContent>
          </Card>

          {/* Section 5: Notes & Audit Log */}
          <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="p-6 pb-2">
               <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                 <Info className="h-4 w-4" />
                 ملاحظات وتفاصيل النظام
               </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase italic px-2 bg-muted rounded">ملاحظات المسؤؤل</span>
                <p className="text-sm text-foreground font-bold leading-relaxed pr-2 border-r-2 border-primary/20">
                  {invoice.notes || 'لا توجد ملاحظات إضافية مسجلة لهذه الفاتورة.'}
                </p>
              </div>

              <div className="pt-4 border-t border-border space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground">AD</div>
                   <div>
                     <div className="text-xs font-black text-foreground">تم الإنشاء بواسطة: {invoice.username || 'System'}</div>
                     <div className="text-[9px] text-muted-foreground font-bold">{format(invoice.createdAt, 'yyyy/MM/dd HH:mm')}</div>
                   </div>
                </div>
                {invoice.paymentStatus === 'paid' && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-emerald-600">القائمة مسددة وحالة النظام خضراء</div>
                      <div className="text-[9px] text-muted-foreground font-bold">معالجة التدقيق مكتملة</div>
                    </div>
                  </div>
                )}
                {invoice.paymentStatus === 'pending' && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-amber-600">القائمة بانتظار السداد</div>
                      <div className="text-[9px] text-muted-foreground font-bold">بذمة الصيدلية</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
