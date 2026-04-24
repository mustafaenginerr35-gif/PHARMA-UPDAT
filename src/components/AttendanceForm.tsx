import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Employee, EmployeeAttendance } from '../db';
import { format } from 'date-fns';

interface AttendanceFormProps {
  onSubmit: (data: Partial<EmployeeAttendance>) => void;
  onClose: () => void;
  employees: Employee[];
  initialData?: EmployeeAttendance;
}

export const AttendanceForm = ({ onSubmit, onClose, employees, initialData }: AttendanceFormProps) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(initialData?.employeeId || '');
  const [hours, setHours] = useState<number>(initialData?.hoursWork || 0);
  const [rate, setRate] = useState<number>(initialData?.hourlyRate || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const employee = employees.find(emp => emp.id === selectedEmployeeId);
    
    if (!employee) return;

    const data: Partial<EmployeeAttendance> = {
      employeeId: selectedEmployeeId,
      employeeName: employee.name,
      date: new Date(formData.get('date') as string),
      hoursWork: Number(formData.get('hoursWork')),
      hourlyRate: Number(formData.get('hourlyRate')),
      dailyWage: Number(formData.get('hoursWork')) * Number(formData.get('hourlyRate')),
      notes: formData.get('notes') as string,
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2 text-right">
          <Label className="text-xs font-black text-muted-foreground mr-1">الموظف</Label>
          <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId} disabled={!!initialData}>
            <SelectTrigger className="bg-muted/50 border-border rounded-xl h-12 text-right font-black">
              <div className="flex items-center gap-2 pr-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="اختر الموظف" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              {employees.map(emp => (
                <SelectItem key={emp.id} value={emp.id!} className="text-right flex-row-reverse">
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 text-right">
            <Label htmlFor="date" className="text-xs font-black text-muted-foreground mr-1">التاريخ</Label>
            <div className="relative group">
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={initialData ? format(initialData.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                required
                className="pr-10 bg-muted/50 border-border rounded-xl h-12 focus:ring-primary focus:border-primary text-right font-bold"
              />
            </div>
          </div>

          <div className="space-y-2 text-right">
            <Label htmlFor="hoursWork" className="text-xs font-black text-muted-foreground mr-1">عدد ساعات العمل</Label>
            <div className="relative group">
              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
              <Input
                id="hoursWork"
                name="hoursWork"
                type="number"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                required
                className="pr-10 bg-muted/50 border-border rounded-xl h-12 focus:ring-blue-500 focus:border-blue-500 text-right font-mono"
                placeholder="0.0"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 text-right">
            <Label htmlFor="hourlyRate" className="text-xs font-black text-muted-foreground mr-1">أجر الساعة (د.ع)</Label>
            <div className="relative group">
              <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
              <Input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                required
                className="pr-10 bg-muted/50 border-border rounded-xl h-12 focus:ring-emerald-500 focus:border-emerald-500 text-right font-mono"
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2 text-right">
            <Label className="text-xs font-black text-muted-foreground mr-1">أجر اليوم الإجمالي</Label>
            <div className="h-12 bg-muted/30 border border-border rounded-xl flex items-center justify-center font-black text-primary text-lg">
              {(hours * rate).toLocaleString()} <span className="text-[10px] mr-1 font-sans">د.ع</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-right">
          <Label htmlFor="notes" className="text-xs font-black text-muted-foreground mr-1">ملاحظات</Label>
          <div className="relative group">
            <FileText className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
            <Input
              id="notes"
              name="notes"
              defaultValue={initialData?.notes}
              className="pr-10 bg-muted/50 border-border rounded-xl h-12 focus:ring-amber-500 focus:border-amber-500 text-right font-bold"
              placeholder="وصف إضافي..."
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button 
          type="submit" 
          disabled={!selectedEmployeeId}
          className="flex-1 h-12 rounded-xl font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
        >
          {initialData ? 'حفظ التعديلات' : 'تسجيل الحضور'}
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
