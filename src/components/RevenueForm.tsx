import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Clock3, 
  TrendingUp,
  User,
  Phone,
  CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface RevenueFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export const RevenueForm = ({ onSubmit, onClose }: RevenueFormProps) => {
  const [incomeType, setIncomeType] = useState<'cash' | 'credit'>('cash');
  const [saleAmount, setSaleAmount] = useState<string>('');
  const [saleNetProfit, setSaleNetProfit] = useState<string>('');
  const [saleProfitPercentage, setSaleProfitPercentage] = useState<string>('15');

  // Sync profit when amount or percentage changes
  useEffect(() => {
    const amountNum = parseFloat(saleAmount) || 0;
    const percentNum = parseFloat(saleProfitPercentage) || 0;
    setSaleNetProfit(((amountNum * percentNum) / 100).toFixed(0));
  }, [saleAmount, saleProfitPercentage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    onSubmit({
      ...data,
      incomeType,
      amount: Number(saleAmount),
      netProfit: Number(saleNetProfit),
      profitPercentage: Number(saleProfitPercentage),
      date: new Date(data.date as string),
      dueDate: data.dueDate ? new Date(data.dueDate as string) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        {/* Income Type Selection (Wide/Responsive) */}
        <div className="space-y-3 p-5 bg-muted/10 border border-border rounded-2xl">
          <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest block">طبيعة العملية وتصنيف الوارد</Label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setIncomeType('cash')}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                incomeType === 'cash' 
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 shadow-lg shadow-emerald-500/5' 
                : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80'
              }`}
            >
              <div className={`p-3 rounded-full ${incomeType === 'cash' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-muted text-muted-foreground'}`}>
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="text-center">
                <div className="text-sm font-black uppercase">وارد نقدي مباشر</div>
                <div className="text-[10px] font-bold opacity-60">صندوق الكاش (الصيدلية)</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setIncomeType('credit')}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                incomeType === 'credit' 
                ? 'border-amber-500 bg-amber-500/10 text-amber-600 shadow-lg shadow-amber-500/5' 
                : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80'
              }`}
            >
              <div className={`p-3 rounded-full ${incomeType === 'credit' ? 'bg-amber-500 text-white shadow-lg' : 'bg-muted text-muted-foreground'}`}>
                <Clock3 className="h-6 w-6" />
              </div>
              <div className="text-center">
                <div className="text-sm font-black uppercase">بيع بالدين (آجل)</div>
                <div className="text-[10px] font-bold opacity-60">بذمة زبون أو جهة</div>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Financials */}
          <div className="space-y-6">
            <div className="space-y-2 p-5 bg-card/40 border border-border rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />
              <Label className="text-primary font-black text-[10px] uppercase tracking-widest block mb-2">القيمة الإجمالية للمبيعات</Label>
              <div className="relative">
                <Input 
                  name="amount" 
                  type="number" 
                  required 
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(e.target.value)}
                  placeholder="0.000" 
                  className="bg-muted border-primary/20 text-foreground h-14 rounded-xl font-mono text-2xl font-black pr-12" 
                />
                <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 shadow-sm">
              <div className="space-y-2">
                <Label className="text-emerald-700 font-black text-[10px] uppercase tracking-widest">صافي الربح المتحقق</Label>
                <div className="relative">
                  <Input 
                    name="netProfit" 
                    type="number" 
                    value={saleNetProfit}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSaleNetProfit(val);
                      const num = parseFloat(val) || 0;
                      const sAmount = parseFloat(saleAmount) || 0;
                      if (sAmount > 0) {
                        setSaleProfitPercentage(((num / sAmount) * 100).toFixed(1));
                      }
                    }}
                    className="bg-background border-emerald-500/20 text-emerald-600 font-black font-mono h-12 rounded-xl text-lg shadow-inner" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-emerald-700 font-black text-[10px] uppercase tracking-widest text-left">النسبة المئوية %</Label>
                <div className="relative">
                  <Input 
                    name="profitPercentage" 
                    type="number" 
                    value={saleProfitPercentage}
                    onChange={(e) => setSaleProfitPercentage(e.target.value)}
                    className="bg-background border-emerald-500/20 text-emerald-600 font-black font-mono h-12 rounded-xl pl-10 text-lg shadow-inner" 
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-sm">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Date & Notes */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">تاريخ التسجيل</Label>
              <div className="relative">
                <Input 
                  name="date" 
                  type="date" 
                  defaultValue={format(new Date(), 'yyyy-MM-dd')} 
                  required 
                  className="bg-muted border-border text-foreground h-14 rounded-xl pr-10 font-black" 
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">ملاحظات وشهادات</Label>
              <textarea 
                name="notes" 
                placeholder="اكتب ملاحظات حول هذه العملية، مثلاً: مبيعات علاج مزمن..." 
                className="w-full bg-muted border border-border text-foreground rounded-2xl p-4 h-[7.5rem] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold resize-none" 
              />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {incomeType === 'credit' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 p-5 bg-amber-500/5 rounded-3xl border border-amber-500/10 shadow-sm relative">
                <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 blur-3xl -ml-16 -mt-16" />
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1 space-y-2">
                    <Label className="text-amber-700 font-black text-[10px] flex items-center gap-2 uppercase tracking-wide">
                      <User className="h-3 w-3" />
                      اسم الزبون (المدين)
                    </Label>
                    <Input name="customerName" placeholder="الاسم الكامل للزبون" className="bg-background border-amber-500/20 text-foreground h-12 rounded-xl font-bold" />
                  </div>
                  <div className="space-y-2">
                      <Label className="text-amber-700 font-black text-[10px] flex items-center gap-2 uppercase tracking-wide">
                        <Phone className="h-3 w-3" />
                        رقم التواصل
                      </Label>
                      <Input name="customerPhone" placeholder="07xx xxx xxxx" className="bg-background border-amber-500/10 text-foreground h-12 rounded-xl font-mono font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-amber-700 font-black text-[10px] flex items-center gap-2 uppercase tracking-wide">
                      <CalendarDays className="h-3 w-3" />
                      موعد الاستحقاق المتوقع
                    </Label>
                    <Input name="dueDate" type="date" className="bg-background border-amber-500/20 text-foreground h-12 rounded-xl font-bold" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
        <Button 
          type="submit" 
          className="flex-3 font-black text-2xl h-16 rounded-3xl shadow-2xl transition-all scale-100 hover:scale-[1.02] active:scale-[0.98] bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30"
        >
          حفظ عملية البيع والتنزيل من الجرد
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
