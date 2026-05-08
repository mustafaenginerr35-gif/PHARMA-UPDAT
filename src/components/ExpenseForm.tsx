import React, { useState } from 'react';
import { safeFormatDate } from '../lib/formatters';
import { 
  ArrowDownCircle, 
  Calendar, 
  DollarSign, 
  FileText, 
  HelpCircle, 
  Lightbulb, 
  Truck, 
  Users, 
  Wrench, 
  Target,
  Wifi,
  UserCheck,
  Trash2,
  Package,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { CurrencyInput } from '@/components/ui/CurrencyInput';

interface ExpenseFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
  onDelete?: () => void;
  initialData?: any;
}

export const ExpenseForm = ({ onSubmit, onClose, onDelete, initialData }: ExpenseFormProps) => {
  const [category, setCategory] = useState<string>(initialData?.category || 'rent_pharmacy');
  const [expenseType, setExpenseType] = useState<'fixed' | 'variable'>(initialData?.expenseType || 'fixed');
  const [amount, setAmount] = useState<number>(initialData?.amount || 0);

  const handleTypeChange = (type: 'fixed' | 'variable') => {
    setExpenseType(type);
    if (!initialData) {
      setCategory(type === 'fixed' ? 'rent_pharmacy' : 'salaries');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    
    // Extract partyName based on category
    let partyName = "";
    switch(category) {
      case 'internet': partyName = data.provider as string; break;
      case 'service_worker': partyName = data.workerName as string; break;
      case 'salaries': partyName = data.employeeName as string; break;
      case 'transport': partyName = data.handler as string; break;
      case 'marketing': partyName = data.channel as string; break;
      case 'repairs': partyName = data.target as string; break;
      case 'materials': partyName = data.supplier as string; break;
      case 'damaged_expired': partyName = data.itemName as string; break;
      case 'other': partyName = data.expenseName as string; break;
      case 'electricity': partyName = (data.serviceType === 'national' ? 'وطنية' : 'مولدة'); break;
    }

    const description = (data.description as string) || "";
    // If description is empty, statement = category (human readable)
    const categoryLabels: Record<string, string> = {
      rent_pharmacy: 'إيجار صيدلية',
      electricity: 'كهرباء / مولد',
      rent_license: 'إيجار إجازة',
      internet: 'إنترنت واشتراكات',
      service_worker: 'عامل خدمة',
      salaries: 'رواتب ومكافآت',
      transport: 'نقل وتوصيل أدوية',
      marketing: 'تسويق وإعلان',
      repairs: 'صيانة معدات أو مكان',
      materials: 'مواد تشغيلية',
      damaged_expired: 'تلف واكسباير',
      other: 'مصروف عام'
    };

    const catLabel = categoryLabels[category] || category;
    const statement = description || catLabel;

    onSubmit({
      ...data,
      category,
      partyName,
      statement,
      expenseType,
      amount: amount,
      date: (data.date && !isNaN(new Date(data.date as string).getTime())) ? new Date(data.date as string) : new Date(),
      updatedAt: new Date()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        {/* Toggle between Fixed and Variable */}
        <div className="p-1.5 bg-muted rounded-2xl border border-border shadow-inner flex gap-1.5">
          <button
            type="button"
            onClick={() => handleTypeChange('fixed')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-black transition-all ${
              expenseType === 'fixed' 
              ? 'bg-card text-foreground shadow-lg border border-border/50' 
              : 'text-muted-foreground hover:bg-card/50'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${expenseType === 'fixed' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <Target className="h-4 w-4" />
            </div>
            <span>مصروفات تشغيلية ثابتة</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('variable')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-black transition-all ${
              expenseType === 'variable' 
              ? 'bg-card text-foreground shadow-lg border border-border/50' 
              : 'text-muted-foreground hover:bg-card/50'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${expenseType === 'variable' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <ArrowDownCircle className="h-4 w-4" />
            </div>
            <span>مصروفات دورية متغيرة</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Info Column */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">قيمة المصروف</Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-rose-500/5 blur-xl group-hover:blur-2xl transition-all rounded-full opacity-0 group-hover:opacity-100" />
                  <CurrencyInput 
                    name="amount"
                    value={amount}
                    onChange={(val) => setAmount(val)}
                    required 
                    placeholder="0" 
                    className="bg-muted border-border text-foreground h-14 rounded-xl font-black text-xl pr-12 pl-14 text-right relative z-10 shadow-sm" 
                  />
                  <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-rose-500 relative z-20" />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground z-20">د.ع</div>
                </div>
                <p className="text-[10px] text-rose-500 font-bold mr-1 italic">أدخل المبلغ بالدينار العراقي</p>
              </div>
                  <div className="space-y-2">
                <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">تاريخ الصرف</Label>
                <div className="relative">
                  <Input 
                    name="date" 
                    type="date" 
                    defaultValue={initialData?.date ? safeFormatDate(initialData.date, 'yyyy-MM-dd', { useAr: false }) : safeFormatDate(new Date(), 'yyyy-MM-dd', { useAr: false })} 
                    required 
                    className="bg-muted border-border text-foreground h-14 rounded-xl pr-10 font-bold shadow-sm" 
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-2 p-5 bg-card/40 border border-border rounded-2xl">
              <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest block mb-2">تصنيف المصروف (الفئة)</Label>
              <Select 
                value={category} 
                onValueChange={setCategory}
                name="category"
              >
                <SelectTrigger className="bg-muted border-border text-foreground h-14 rounded-xl font-black text-lg">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground max-h-80">
                  {expenseType === 'fixed' ? (
                    <>
                      <SelectItem value="rent_pharmacy" className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg"><FileText className="h-5 w-5 text-blue-500" /></div>
                          <span className="font-bold">إيجار صيدلية</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="electricity" className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-500/10 rounded-lg"><Lightbulb className="h-5 w-5 text-amber-500" /></div>
                          <span className="font-bold">كهرباء / مولد</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="rent_license" className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-500/10 rounded-lg"><UserCheck className="h-5 w-5 text-emerald-500" /></div>
                          <span className="font-bold">إيجار إجازة</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="internet" className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-400/10 rounded-lg"><Wifi className="h-5 w-5 text-blue-400" /></div>
                          <span className="font-bold">إنترنت واشتراكات</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="service_worker" className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-500/10 rounded-lg"><Users className="h-5 w-5 text-indigo-500" /></div>
                          <span className="font-bold">عامل خدمة</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="other" className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg"><HelpCircle className="h-5 w-5 text-muted-foreground" /></div>
                          <span className="font-bold">أخرى</span>
                        </div>
                      </SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="salaries" className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-500/10 rounded-lg"><Users className="h-5 w-5 text-emerald-500" /></div>
                          <span className="font-bold">رواتب ومكافآت</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="transport" className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-500/10 rounded-lg"><Truck className="h-5 w-5 text-purple-500" /></div>
                          <span className="font-bold">نقل وتوصيل أدوية</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="marketing" className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-rose-500/10 rounded-lg"><Target className="h-5 w-5 text-rose-500" /></div>
                          <span className="font-bold">تسويق وإعلان</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="repairs" className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-500/10 rounded-lg"><Wrench className="h-5 w-5 text-slate-500" /></div>
                          <span className="font-bold">صيانة معدات أو مكان</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="materials" className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-500/10 rounded-lg"><Package className="h-5 w-5 text-amber-500" /></div>
                          <span className="font-bold">مواد تشغيلية</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="damaged_expired" className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-rose-500/10 rounded-lg"><AlertTriangle className="h-5 w-5 text-rose-500" /></div>
                          <span className="font-bold">تلف واكسباير</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="other" className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg"><HelpCircle className="h-5 w-5 text-muted-foreground" /></div>
                          <span className="font-bold">أخرى متغيرة</span>
                        </div>
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dynamic Details Column */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4 p-5 bg-primary/5 border border-primary/10 rounded-2xl min-h-[14rem] flex flex-col justify-center shadow-sm"
              >
                {category === 'rent_pharmacy' && (
                  <div className="text-center space-y-2">
                    <FileText className="h-10 w-10 text-blue-500 mx-auto" />
                    <h4 className="font-black text-foreground">معلومات الإيجار</h4>
                    <p className="text-xs text-muted-foreground font-bold">لا توجد حقول إضافية مطلوبة، سيتم تسجيل الإيجار الشهري للصيدلية.</p>
                  </div>
                )}

                {category === 'materials' && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase">المجهز أو المحل</Label>
                    <Input name="supplier" defaultValue={initialData?.partyName || ''} placeholder="اسم المجهز للفواتير التشغيلية" className="bg-background border-border text-foreground h-12 rounded-xl font-bold" />
                  </div>
                )}

                {category === 'damaged_expired' && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase">اسم المادة التالفة</Label>
                    <Input name="itemName" defaultValue={initialData?.partyName || ''} placeholder="اسم المادة أو المنتج" className="bg-background border-border text-foreground h-12 rounded-xl font-bold" />
                  </div>
                )}

                {category === 'internet' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase">الشركة المزودة</Label>
                      <Input name="provider" defaultValue={initialData?.provider || ''} placeholder="إيرث لنك / غيرها" className="bg-background border-border text-foreground h-11 rounded-xl font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase">نوع الاشتراك</Label>
                      <Input name="subscriptionType" defaultValue={initialData?.subscriptionType || ''} placeholder="منزلي / تجاري" className="bg-background border-border text-foreground h-11 rounded-xl font-bold" />
                    </div>
                  </div>
                )}

                {category === 'service_worker' && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase">اسم العامل المستلم</Label>
                    <Input name="workerName" defaultValue={initialData?.workerName || ''} placeholder="الاسم الكامل" className="bg-background border-border text-foreground h-12 rounded-xl font-bold" />
                  </div>
                )}

                {category === 'salaries' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase">اسم الموظف</Label>
                        <Input name="employeeName" defaultValue={initialData?.employeeName || ''} placeholder="الاسم الكامل" className="bg-background border-border text-foreground h-11 rounded-xl font-bold" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase">المسمى الوظيفي</Label>
                        <Input name="jobTitle" defaultValue={initialData?.jobTitle || ''} placeholder="مثلاً: صيدلي" className="bg-background border-border text-foreground h-11 rounded-xl font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase">نوع الدفع</Label>
                        <Select name="salaryPaymentType" defaultValue={initialData?.salaryPaymentType || 'full'}>
                          <SelectTrigger className="bg-background border-border text-foreground h-11 rounded-xl font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full" className="font-bold">راتب كامل</SelectItem>
                            <SelectItem value="advance" className="font-bold">سلفة</SelectItem>
                            <SelectItem value="bonus" className="font-bold">مكافأة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {category === 'electricity' && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase">نوع الخدمة</Label>
                      <Select name="serviceType" defaultValue={initialData?.serviceType || 'generator'}>
                        <SelectTrigger className="bg-background border-border text-foreground h-11 rounded-xl font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="national" className="font-bold">كهرباء وطنية</SelectItem>
                          <SelectItem value="generator" className="font-bold">مولدة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {category === 'transport' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase">جهة النقل / السائق</Label>
                      <Input name="handler" defaultValue={initialData?.handler || ''} placeholder="اسم الشركة" className="bg-background border-border text-foreground h-11 rounded-xl font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase">نوع الإرسالية</Label>
                      <Input name="transportType" defaultValue={initialData?.transportType || ''} placeholder="توصيل أدوية" className="bg-background border-border text-foreground h-11 rounded-xl font-bold" />
                    </div>
                  </div>
                )}

                {category === 'marketing' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase">المنصة / القناة</Label>
                      <Input name="channel" defaultValue={initialData?.channel || ''} placeholder="فيسبوك / انستغرام" className="bg-background border-border text-foreground h-11 rounded-xl font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase">الحملة الإعلانية</Label>
                      <Input name="campaign" defaultValue={initialData?.campaign || ''} placeholder="عروض العيد" className="bg-background border-border text-foreground h-11 rounded-xl font-bold" />
                    </div>
                  </div>
                )}

                {category === 'repairs' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase">طبيعة العطل / الصيانة</Label>
                      <Input name="repairType" defaultValue={initialData?.repairType || ''} placeholder="تصليح تكييف" className="bg-background border-border text-foreground h-11 rounded-xl font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase">الجهاز أو القسم</Label>
                      <Input name="target" defaultValue={initialData?.target || ''} placeholder="جهاز التبريد" className="bg-background border-border text-foreground h-11 rounded-xl font-bold" />
                    </div>
                  </div>
                )}

                {category === 'other' && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase">عنوان المصروف</Label>
                    <Input name="expenseName" defaultValue={initialData?.expenseName || ''} placeholder="وصف موجز للمصروف" className="bg-background border-border text-foreground h-12 rounded-xl font-bold" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-muted/20 border border-border rounded-2xl">
          <div className="space-y-2">
            <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">{category === 'other' ? 'التفاصيل الكاملة' : 'بيان المصروف (اختياري)'}</Label>
            <Input 
              name="description" 
              defaultValue={initialData?.description || ''}
              placeholder="مثلاً: سداد فاتورة الكهرباء..." 
              className="bg-muted border-border text-foreground h-12 rounded-xl font-bold" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">أي ملاحظات أخرى</Label>
            <Input 
              name="notes" 
              defaultValue={initialData?.notes || ''}
              placeholder="ملاحظات اختيارية..." 
              className="bg-muted border-border text-foreground h-12 rounded-xl font-bold" 
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
        {initialData && onDelete && (
          <Button 
            type="button" 
            variant="destructive"
            onClick={onDelete}
            className="flex-1 font-black h-16 rounded-3xl bg-rose-500 hover:bg-rose-600 text-white text-lg"
          >
            <Trash2 className="h-5 w-5 mr-2" />
            حذف المصروف
          </Button>
        )}
        <Button 
          type="submit" 
          className="flex-3 font-black text-2xl h-16 rounded-3xl shadow-2xl transition-all scale-100 hover:scale-[1.02] active:scale-[0.98] bg-rose-600 hover:bg-rose-700 shadow-rose-500/30"
        >
          {initialData ? 'حفظ التعديلات' : 'تأكيد عملية الصرف والخصم'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="flex-1 font-black h-16 rounded-3xl border-border hover:bg-muted text-lg"
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
};
