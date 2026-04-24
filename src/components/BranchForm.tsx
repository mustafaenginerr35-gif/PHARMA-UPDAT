import React from 'react';
import { Building2, MapPin, Phone, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { PharmacyBranch } from '../db';

interface BranchFormProps {
  onSubmit: (data: Partial<PharmacyBranch>) => void;
  onClose: () => void;
  initialData?: PharmacyBranch;
}

export const BranchForm = ({ onSubmit, onClose, initialData }: BranchFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: Partial<PharmacyBranch> = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      notes: formData.get('notes') as string,
      status: (initialData?.status as any) || 'active',
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2 text-right">
          <Label htmlFor="name" className="text-xs font-black text-muted-foreground mr-1">اسم الصيدلية</Label>
          <div className="relative group">
            <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              id="name"
              name="name"
              defaultValue={initialData?.name}
              required
              className="pr-10 bg-muted/50 border-border rounded-xl h-12 focus:ring-primary focus:border-primary text-right font-bold"
              placeholder="مثلاً: صيدلية المركز"
            />
          </div>
        </div>

        <div className="space-y-2 text-right">
          <Label htmlFor="address" className="text-xs font-black text-muted-foreground mr-1">العنوان</Label>
          <div className="relative group">
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
            <Input
              id="address"
              name="address"
              defaultValue={initialData?.address}
              required
              className="pr-10 bg-muted/50 border-border rounded-xl h-12 focus:ring-blue-500 focus:border-blue-500 text-right font-bold"
              placeholder="الشارع / المنطقة"
            />
          </div>
        </div>

        <div className="space-y-2 text-right">
          <Label htmlFor="phone" className="text-xs font-black text-muted-foreground mr-1">رقم الهاتف</Label>
          <div className="relative group">
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
            <Input
              id="phone"
              name="phone"
              defaultValue={initialData?.phone}
              className="pr-10 bg-muted/50 border-border rounded-xl h-12 focus:ring-emerald-500 focus:border-emerald-500 text-right font-mono"
              placeholder="07XXXXXXXXX"
            />
          </div>
        </div>

        <div className="space-y-2 text-right">
          <Label htmlFor="notes" className="text-xs font-black text-muted-foreground mr-1">ملاحظات</Label>
          <div className="relative group">
            <FileText className="absolute right-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
            <Textarea
              id="notes"
              name="notes"
              defaultValue={initialData?.notes}
              className="pr-10 bg-muted/50 border-border rounded-xl min-h-[100px] focus:ring-amber-500 focus:border-amber-500 text-right font-bold"
              placeholder="أي ملاحظات إضافية..."
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button 
          type="submit" 
          className="flex-1 h-12 rounded-xl font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
        >
          {initialData ? 'حفظ التعديلات' : 'إضافة الصيدلية'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="h-12 px-6 rounded-xl font-black border-border hover:bg-muted"
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
};
