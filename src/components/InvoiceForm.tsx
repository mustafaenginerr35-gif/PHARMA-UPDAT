import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  DollarSign, 
  FileText, 
  Clock3,
  Gift,
  Upload,
  Image as ImageIcon,
  AlertCircle
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
import { Entity } from '../db';

interface InvoiceFormProps {
  entities: Entity[];
  selectedEntity: Entity | null;
  onSubmit: (data: any) => void;
  onClose: () => void;
  onImageChange: (file: File | null) => void;
}

export const InvoiceForm = ({ entities, selectedEntity: initialEntity, onSubmit, onClose, onImageChange }: InvoiceFormProps) => {
  const [purchaseType, setPurchaseType] = useState<'cash' | 'credit'>('credit');
  const [bonusLater, setBonusLater] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string>(initialEntity?.id || '');
  const [amount, setAmount] = useState<string>('');
  const [discount, setDiscount] = useState<string>('0');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const currentEntity = entities.find(e => e.id === selectedEntityId) || initialEntity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    
    onSubmit({
      ...data,
      accountId: selectedEntityId,
      purchaseType,
      bonusLater,
      amount: Number(amount),
      discount: Number(discount),
      date: new Date(data.date as string),
      dueDate: purchaseType === 'credit' && data.dueDate ? new Date(data.dueDate as string) : undefined,
      bonusArrivalDate: bonusLater && data.bonusArrivalDate ? new Date(data.bonusArrivalDate as string) : undefined,
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onImageChange(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Supplier Selection */}
        <div className="space-y-2">
          <Label className="text-muted-foreground font-bold">المورد / المذخر</Label>
          {initialEntity ? (
            <div className="bg-muted p-4 rounded-xl border border-border flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-black text-foreground">{initialEntity.name}</span>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">محدد مسبقاً</span>
            </div>
          ) : (
            <Select value={selectedEntityId} onValueChange={setSelectedEntityId} required name="entityId">
              <SelectTrigger className="bg-muted border-border text-foreground h-12 rounded-xl font-bold">
                <SelectValue placeholder="اختر المورد" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {entities.map(e => (
                  <SelectItem key={e.id} value={e.id!}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Purchase Type */}
        <div className="space-y-2">
          <Label className="text-muted-foreground font-bold text-xs uppercase tracking-wider">نوع الشراء</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPurchaseType('cash')}
              className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                purchaseType === 'cash' 
                ? 'border-emerald-600 bg-emerald-500/10 text-emerald-600 shadow-sm' 
                : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80'
              }`}
            >
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-bold">نقدي (واصـل)</span>
            </button>
            <button
              type="button"
              onClick={() => setPurchaseType('credit')}
              className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                purchaseType === 'credit' 
                ? 'border-amber-500 bg-amber-500/10 text-amber-600 shadow-sm' 
                : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80'
              }`}
            >
              <Clock3 className="h-4 w-4" />
              <span className="text-xs font-bold">آجل (برسم السداد)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground font-bold text-xs uppercase">رقم القائمة</Label>
            <div className="relative">
              <Input name="invoiceNumber" required placeholder="0000" className="bg-muted border-border text-foreground h-11 rounded-xl pr-10" />
              <FileText className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground font-bold text-xs uppercase">تاريخ القائمة</Label>
            <div className="relative">
              <Input name="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} required className="bg-muted border-border text-foreground h-11 rounded-xl pr-10" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground font-bold text-xs uppercase">المبلغ الكلي</Label>
            <Input 
              name="amount" 
              type="number" 
              required 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.000" 
              className="bg-muted border-border text-foreground h-11 rounded-xl font-mono" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-rose-500 font-bold text-xs uppercase">الخصم</Label>
            <Input 
              name="discount" 
              type="number" 
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="bg-muted border-rose-500/10 text-rose-500 h-11 rounded-xl font-mono" 
            />
          </div>
        </div>

        <AnimatePresence>
          {purchaseType === 'credit' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 mt-2">
                <Label className="text-amber-700 font-bold text-xs flex items-center gap-2">
                  <AlertCircle className="h-3 w-3" />
                  موعد استحقاق الدين (سداد المورد)
                </Label>
                <Input name="dueDate" type="date" className="bg-background border-amber-500/20 text-foreground h-10 rounded-lg" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bonus Section */}
        <div className="space-y-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
          <div className="flex items-center justify-between">
            <Label className="text-blue-700 dark:text-blue-400 font-bold text-xs uppercase tracking-widest">البونص والهدايا</Label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground">انتظار وصول البونص؟</span>
              <button
                type="button"
                onClick={() => setBonusLater(!bonusLater)}
                className={`w-10 h-5 rounded-full transition-all relative ${bonusLater ? 'bg-blue-500' : 'bg-muted'}`}
              >
                <div className={`absolute top-0.5 h-4 w-4 bg-white rounded-full shadow-sm transition-all ${bonusLater ? 'right-5.5' : 'right-0.5'}`} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">قيمة البونص (د.ع)</Label>
              <Input name="bonus" type="number" defaultValue="0" className="bg-background border-blue-500/20 text-blue-500 font-bold font-mono h-10 rounded-lg" />
            </div>
            {bonusLater ? (
              <div className="space-y-1 animate-in slide-in-from-right-2">
                <Label className="text-[10px] text-muted-foreground">موعد الوصول المتوقع</Label>
                <Input name="bonusArrivalDate" type="date" className="bg-background border-blue-500/20 text-foreground h-10 rounded-lg" />
              </div>
            ) : (
              <div className="space-y-1 flex flex-col justify-end">
                <div className="h-10 flex items-center gap-2 text-emerald-500 text-[10px] font-bold bg-emerald-500/5 px-3 rounded-lg border border-emerald-500/10">
                   <Gift className="h-3 w-3" />
                   تم استلام البونص مع القائمة
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground font-bold">صور القائمة</Label>
          <div 
            className="group relative border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-muted/50 transition-all overflow-hidden aspect-video flex flex-col items-center justify-center"
            onClick={() => document.getElementById('inv-image-input-new')?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>
                <Upload className="h-8 w-8 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground font-bold">اضغط أو اسحب صورة الفاتورة هنا</span>
              </>
            )}
            <input 
              id="inv-image-input-new"
              type="file" 
              className="hidden" 
              onChange={handleImageSelect}
              accept="image/*"
            />
            {imagePreview && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <ImageIcon className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground font-bold text-xs uppercase">ملاحظات إضافية</Label>
          <Input name="notes" placeholder="ملاحظات على هذه القائمة..." className="bg-muted border-border text-foreground rounded-xl h-11" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button 
          type="submit" 
          className="flex-1 font-black text-xl h-14 rounded-2xl shadow-xl transition-all bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
        >
          حفظ الفاتورة
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="px-8 font-bold h-14 rounded-2xl border-border hover:bg-muted"
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
};
