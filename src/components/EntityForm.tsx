import React from 'react';
import { 
  Building2, 
  Phone, 
  MapPin, 
  Info,
  DollarSign
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
import { format } from 'date-fns';

interface EntityFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
  entity?: any;
}

export const EntityForm = ({ onSubmit, onClose, entity }: EntityFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    onSubmit({
      ...data,
      initialBalance: Number(data.initialBalance || 0),
      limit: Number(data.limit || 0),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        {/* Name: Full Width on top */}
        <div className="space-y-2 p-5 bg-muted/20 border border-border rounded-2xl">
          <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest block mb-2">اسم المورد أو المكتب العلمي الكامل</Label>
          <div className="relative group">
             <div className="absolute inset-0 bg-primary/5 blur-xl group-hover:blur-2xl transition-all rounded-full opacity-0 group-hover:opacity-100" />
            <Input 
              name="name" 
              required 
              defaultValue={entity?.name}
              placeholder="مثلاً: شركة التفاح لتجارة الأدوية" 
              className="bg-muted border-border text-foreground h-16 rounded-2xl pr-12 font-black text-xl relative z-10 shadow-sm transition-all focus:h-18" 
            />
            <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-primary relative z-20" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">تصنيف المنشأ (النوع)</Label>
            <Select name="type" defaultValue={entity?.type || "office"}>
              <SelectTrigger className="bg-muted border-border text-foreground h-14 rounded-xl font-black text-lg shadow-sm">
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="office" className="py-3 font-bold">مكتب علمي / مذخر</SelectItem>
                <SelectItem value="warehouse" className="py-3 font-bold">مستودع / مخزن توزيع</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Phone className="h-3 w-3" />
              أرقام التواصل والتلفون
            </Label>
            <Input 
              name="phone" 
              defaultValue={entity?.phone}
              placeholder="07xx xxx xxxx" 
              className="bg-muted border-border text-foreground h-14 rounded-xl font-mono text-lg font-bold shadow-sm" 
            />
          </div>
        </div>

        {!entity && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-card border border-border rounded-2xl shadow-inner group">
            <div className="space-y-2">
              <Label className="text-emerald-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="h-3 w-3" />
                رصيد الافتتاح (المبلغ المطلوب حالياً)
              </Label>
              <Input 
                name="initialBalance" 
                type="number" 
                defaultValue="0" 
                className="bg-muted border-emerald-500/20 text-emerald-600 h-14 rounded-xl font-mono text-xl font-black shadow-sm" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-rose-500 font-black text-[10px] uppercase tracking-widest">تحذير سقف الدين (الحد الائتماني)</Label>
              <Input 
                name="limit" 
                type="number" 
                defaultValue={entity?.limit || "0"} 
                className="bg-muted border-rose-500/20 text-rose-500 h-14 rounded-xl font-mono text-xl font-black shadow-sm" 
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              الموقع الجغرافي / العنوان
            </Label>
            <Input 
              name="address" 
              defaultValue={entity?.address}
              placeholder="مثلاً: بغداد - المشتل - مجمع الأدوية" 
              className="bg-muted border-border text-foreground h-14 rounded-xl font-bold font-sm shadow-sm" 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Info className="h-4 w-4" />
              معلومات إضافية ونبذة
            </Label>
            <Input 
              name="notes" 
              defaultValue={entity?.notes}
              placeholder="ملاحظات حول التعامل أو وقت التجهيز..." 
              className="bg-muted border-border text-foreground rounded-xl h-14 font-bold shadow-sm" 
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-border">
        <Button 
          type="submit" 
          className="flex-3 font-black text-2xl h-16 rounded-3xl shadow-2xl transition-all scale-100 hover:scale-[1.02] active:scale-[0.98] bg-purple-600 hover:bg-purple-700 shadow-purple-500/30"
        >
          {entity ? 'تحديث السجل المالي' : 'تأسيس حساب مورد جديد'}
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
