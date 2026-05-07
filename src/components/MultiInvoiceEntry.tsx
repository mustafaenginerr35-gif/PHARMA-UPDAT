import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Plus, 
  Trash2, 
  Save, 
  FileUp, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Table as TableIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { Entity, LedgerEntry, Transaction } from '../db';
import { firebaseService } from '../services/firebaseService';
import { formatNumberWithCommas, parseFormattedNumber, toValidDate, safeFormatDate } from '../lib/formatters';

interface MultiInvoiceRow {
  id: string;
  invoiceNumber: string;
  date: string;
  entityName: string;
  totalAmount: string;
  discount: string;
  paidAmount: string;
  bonus: string;
  notes: string;
  isValid: boolean;
  error?: string;
  entityId?: string;
}

interface MultiInvoiceEntryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entities: Entity[];
  currentBranchId?: string;
  appUser?: any;
  onSuccess?: () => void;
  onImportExcel?: () => void;
}

export function MultiInvoiceEntry({ 
  open, 
  onOpenChange, 
  entities, 
  currentBranchId, 
  appUser,
  onSuccess,
  onImportExcel
}: MultiInvoiceEntryProps) {
  const [rows, setRows] = useState<MultiInvoiceRow[]>([createEmptyRow()]);
  const [isSaving, setIsSaving] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);

  function createEmptyRow(): MultiInvoiceRow {
    return {
      id: Math.random().toString(36).substr(2, 9),
      invoiceNumber: '',
      date: safeFormatDate(new Date(), 'yyyy-MM-dd'),
      entityName: '',
      totalAmount: '',
      discount: '0',
      paidAmount: '0',
      bonus: '',
      notes: '',
      isValid: false
    };
  }

  const addRow = () => {
    setRows(prev => [...prev, createEmptyRow()]);
  };

  const removeRow = (id: string) => {
    if (rows.length === 1) {
      setRows([createEmptyRow()]);
      return;
    }
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const updateRow = (id: string, field: keyof MultiInvoiceRow, value: string) => {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      const updatedRow = { ...row, [field]: value };
      
      // Auto-validate and link entity
      const entity = entities.find(e => e.name.trim() === updatedRow.entityName.trim());
      updatedRow.entityId = entity?.id;
      
      const total = parseFormattedNumber(updatedRow.totalAmount);
      const discount = parseFormattedNumber(updatedRow.discount);
      const paid = parseFormattedNumber(updatedRow.paidAmount);
      
      updatedRow.isValid = !!updatedRow.invoiceNumber && 
                           !!updatedRow.date && 
                           !!updatedRow.entityId && 
                           total > 0 && 
                           !isNaN(new Date(updatedRow.date).getTime());
      
      return updatedRow;
    }));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasteData = e.clipboardData.getData('text');
    if (!pasteData.includes('\t') && !pasteData.includes('\n')) return;

    e.preventDefault();
    const spreadsheetRows = pasteData.split(/\r?\n/).filter(line => line.trim() !== '');
    
    const newRows: MultiInvoiceRow[] = spreadsheetRows.map(line => {
      const parts = line.split('\t');
      const row = createEmptyRow();
      
      // Order usually matches: Invoice#, Date, Entity, Amount, Discount, Paid, Bonus, Notes
      if (parts[0]) row.invoiceNumber = parts[0].trim();
      if (parts[1]) row.date = safeFormatDate(toValidDate(parts[1]), 'yyyy-MM-dd');
      if (parts[2]) row.entityName = parts[2].trim();
      if (parts[3]) row.totalAmount = parts[3].trim();
      if (parts[4]) row.discount = parts[4].trim();
      if (parts[5]) row.paidAmount = parts[5].trim();
      if (parts[6]) row.bonus = parts[6].trim();
      if (parts[7]) row.notes = parts[7].trim();

      // Recalculate validity
      const entity = entities.find(e => e.name.trim() === row.entityName);
      row.entityId = entity?.id;
      const total = parseFormattedNumber(row.totalAmount);
      row.isValid = !!row.invoiceNumber && !!row.date && !!row.entityId && total > 0;
      
      return row;
    });

    // If only one row and it's empty, replace it
    if (rows.length === 1 && !rows[0].invoiceNumber && !rows[0].entityName) {
      setRows(newRows);
    } else {
      setRows(prev => [...prev, ...newRows]);
    }
    toast.success(`تم استيراد ${newRows.length} حقل من حافظة النسخ`);
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowId: string, field: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentElement = e.target as HTMLElement;
      const inputs = Array.from(tableRef.current?.querySelectorAll('input') || []);
      const currentIndex = inputs.indexOf(currentElement as HTMLInputElement);
      
      if (currentIndex < inputs.length - 1) {
        (inputs[currentIndex + 1] as HTMLElement).focus();
      } else {
        addRow();
        // Focus the first input of the new row in the next render
        setTimeout(() => {
          const freshInputs = Array.from(tableRef.current?.querySelectorAll('input') || []);
          (freshInputs[currentIndex + 1] as HTMLElement)?.focus();
        }, 10);
      }
    }
  };

  const totals = useMemo(() => {
    return rows.reduce((acc, row) => {
      const total = parseFormattedNumber(row.totalAmount);
      const discount = parseFormattedNumber(row.discount);
      const paid = parseFormattedNumber(row.paidAmount);
      const net = total - discount;
      return {
        count: acc.count + (row.isValid ? 1 : 0),
        total: acc.total + total,
        net: acc.net + net,
        paid: acc.paid + paid,
        remaining: acc.remaining + (net - paid)
      };
    }, { count: 0, total: 0, net: 0, paid: 0, remaining: 0 });
  }, [rows]);

  const handleSaveAll = async () => {
    const validRows = rows.filter(r => r.isValid);
    if (validRows.length === 0) {
      toast.error('يرجى التأكد من صحة البيانات في الصفوف المدخلة (الرقم، التاريخ، المورد، المبلغ)');
      return;
    }

    setIsSaving(true);
    let successCount = 0;
    try {
      const branchId = currentBranchId || 'main';
      const userId = appUser?.userId || 'system';

      for (const row of validRows) {
        const entity = entities.find(e => e.id === row.entityId)!;
        const total = parseFormattedNumber(row.totalAmount);
        const discount = parseFormattedNumber(row.discount);
        const paid = parseFormattedNumber(row.paidAmount);
        const net = total - discount;
        const remaining = net - paid;

        const newEntry: Omit<LedgerEntry, 'id'> = {
          accountId: entity.id!,
          accountName: entity.name,
          accountType: entity.type,
          date: new Date(row.date),
          operationType: 'invoice',
          purchaseType: 'credit',
          invoiceNumber: row.invoiceNumber,
          amount: total,
          discount: discount,
          discountType: 'fixed',
          bonus: row.bonus,
          netAmount: net,
          paidAmount: paid,
          remainingAmount: remaining,
          paymentStatus: remaining === 0 ? 'paid' : (paid > 0 ? 'partially_paid' : 'pending'),
          balanceAfterOperation: (entity.balance || 0) + remaining,
          ownerId: userId,
          branchId: branchId as any,
          notes: row.notes,
          source: 'multi_entry',
          createdAt: new Date(),
          updatedAt: new Date()
        } as any;

        const addedId = await firebaseService.addDocument('ledgerEntries', newEntry as LedgerEntry);
        
        if (addedId) {
          // Add transaction
          await firebaseService.addDocument('transactions', {
            type: 'invoice',
            category: 'invoice',
            amount: net,
            date: new Date(row.date),
            description: `إدخال متعدد: ${entity.name} - ${row.invoiceNumber}`,
            entityId: entity.id!,
            entityName: entity.name,
            invoiceNumber: row.invoiceNumber,
            branchId: branchId as any,
            ownerId: userId,
            source: 'multi_entry',
            createdAt: new Date(),
            updatedAt: new Date()
          } as Transaction);

          // Update entity balance
          await firebaseService.updateDocument('entities', entity.id!, {
            balance: (entity.balance || 0) + remaining,
            totalInvoices: (entity.totalInvoices || 0) + 1,
            updatedAt: new Date()
          });

          successCount++;
        }
      }

      toast.success(`تم حفظ ${successCount} فاتورة بنجاح`);
      onSuccess?.();
      onOpenChange(false);
      setRows([createEmptyRow()]);
    } catch (error) {
      console.error('Bulk save failed:', error);
      toast.error('حدث خطأ أثناء الحفظ بالجملة');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-[95vw] lg:max-w-7xl max-h-[92vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 border-b bg-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
                <TableIcon className="h-6 w-6" />
                إدخال متعدد للقوائم
              </DialogTitle>
              <DialogDescription className="font-bold">
                أدخل البيانات يدوياً، انتقل بـ Enter، أو الصق مباشرة من Excel
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onImportExcel} className="font-bold gap-2">
                <FileUp className="h-4 w-4" />
                استيراد ملف Excel
              </Button>
              <Button disabled={isSaving} onClick={handleSaveAll} className="font-black px-8 gap-2 shadow-lg shadow-primary/20">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ الكل ({totals.count})
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4 bg-muted/20" onPaste={handlePaste}>
          <div className="bg-background rounded-2xl border shadow-xl overflow-hidden min-w-[1200px]">
            <Table ref={tableRef}>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-right font-black w-32">رقم القائمة</TableHead>
                  <TableHead className="text-right font-black w-40">التاريخ</TableHead>
                  <TableHead className="text-right font-black w-60">المورد / الجهة</TableHead>
                  <TableHead className="text-right font-black w-32">المبلغ الكلي</TableHead>
                  <TableHead className="text-right font-black w-24">الخصم</TableHead>
                  <TableHead className="text-right font-black w-32">المسدد</TableHead>
                  <TableHead className="text-right font-black w-32 bg-primary/5">المتبقي</TableHead>
                  <TableHead className="text-right font-black w-24">البونص</TableHead>
                  <TableHead className="text-right font-black">ملاحظات</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => {
                  const total = parseFormattedNumber(row.totalAmount);
                  const discount = parseFormattedNumber(row.discount);
                  const paid = parseFormattedNumber(row.paidAmount);
                  const remaining = Math.max(0, total - discount - paid);
                  
                  return (
                    <TableRow key={row.id} className={`${!row.isValid && row.invoiceNumber ? 'bg-red-50/50' : ''} transition-colors group`}>
                      <TableCell className="p-2">
                        <Input 
                          value={row.invoiceNumber}
                          onChange={e => updateRow(row.id, 'invoiceNumber', e.target.value)}
                          onKeyDown={e => handleKeyDown(e, row.id, 'invoiceNumber')}
                          className="border-none bg-transparent h-9 text-xs font-mono font-bold focus:ring-1 focus:ring-primary/20"
                          placeholder="رقم القائمة"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input 
                          type="date"
                          value={row.date}
                          onChange={e => updateRow(row.id, 'date', e.target.value)}
                          onKeyDown={e => handleKeyDown(e, row.id, 'date')}
                          className="border-none bg-transparent h-9 text-[10px] focus:ring-1 focus:ring-primary/20"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="relative">
                          <Input 
                            value={row.entityName}
                            onChange={e => updateRow(row.id, 'entityName', e.target.value)}
                            onKeyDown={e => handleKeyDown(e, row.id, 'entityName')}
                            className={`border-none bg-transparent h-9 text-xs font-black focus:ring-1 focus:ring-primary/20 ${!row.entityId && row.entityName ? 'text-red-500' : ''}`}
                            placeholder="اسم المورد"
                          />
                          {!row.entityId && row.entityName && (
                            <AlertCircle className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <Input 
                          value={row.totalAmount ? formatNumberWithCommas(parseFormattedNumber(row.totalAmount)) : ''}
                          onChange={e => updateRow(row.id, 'totalAmount', e.target.value)}
                          onKeyDown={e => handleKeyDown(e, row.id, 'totalAmount')}
                          className="border-none bg-transparent h-9 text-xs font-black text-left font-mono focus:ring-1 focus:ring-primary/20"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input 
                          value={row.discount ? formatNumberWithCommas(parseFormattedNumber(row.discount)) : ''}
                          onChange={e => updateRow(row.id, 'discount', e.target.value)}
                          onKeyDown={e => handleKeyDown(e, row.id, 'discount')}
                          className="border-none bg-transparent h-9 text-xs font-bold text-red-600 text-left font-mono focus:ring-1 focus:ring-primary/20"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input 
                          value={row.paidAmount ? formatNumberWithCommas(parseFormattedNumber(row.paidAmount)) : ''}
                          onChange={e => updateRow(row.id, 'paidAmount', e.target.value)}
                          onKeyDown={e => handleKeyDown(e, row.id, 'paidAmount')}
                          className="border-none bg-transparent h-9 text-xs font-black text-emerald-600 text-left font-mono focus:ring-1 focus:ring-primary/20"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className="p-2 bg-primary/5">
                        <div className="h-9 flex items-center justify-end px-3 text-xs font-black text-amber-700 font-mono">
                          {formatNumberWithCommas(remaining)}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <Input 
                          value={row.bonus}
                          onChange={e => updateRow(row.id, 'bonus', e.target.value)}
                          onKeyDown={e => handleKeyDown(e, row.id, 'bonus')}
                          className="border-none bg-transparent h-9 text-[10px] font-bold focus:ring-1 focus:ring-primary/20"
                          placeholder="بونص"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input 
                          value={row.notes}
                          onChange={e => updateRow(row.id, 'notes', e.target.value)}
                          onKeyDown={e => handleKeyDown(e, row.id, 'notes')}
                          className="border-none bg-transparent h-9 text-[10px] focus:ring-1 focus:ring-primary/20"
                          placeholder="ملاحظات..."
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeRow(row.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="p-4 bg-muted/30 border-t flex justify-between items-center">
              <Button variant="ghost" onClick={addRow} className="gap-2 font-black text-primary">
                <Plus className="h-4 w-4" />
                إضافة سطر جديد
              </Button>
              <div className="flex gap-8">
                <div className="flex flex-col items-end">
                   <span className="text-[10px] text-muted-foreground font-bold uppercase">إجمالي المبالغ</span>
                   <span className="text-lg font-black font-mono">{formatNumberWithCommas(totals.total)}</span>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[10px] text-muted-foreground font-bold uppercase">إجمالي المسدد</span>
                   <span className="text-lg font-black font-mono text-emerald-600">{formatNumberWithCommas(totals.paid)}</span>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[10px] text-muted-foreground font-bold uppercase">إجمالي المتبقي</span>
                   <span className="text-lg font-black font-mono text-amber-600">{formatNumberWithCommas(totals.remaining)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
             <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
             <div className="text-xs font-bold text-primary/80 leading-relaxed">
               نصائح للسرعة:
               <ul className="list-disc pr-4 mt-1 space-y-1">
                 <li>استخدم زر Enter للانتقال السريع بين الحقول (سينتقل لسطر جديد تلقائياً).</li>
                 <li>يمكنك نسخ جدول من Excel (أو Google Sheets) ولصقه مباشرة في هذه النافذة (Ctrl+V).</li>
                 <li>سيتم مطابقة اسم المورد تلقائياً، تأكد من صحة الاسم المدخل.</li>
               </ul>
             </div>
          </div>
        </div>

        <DialogFooter className="p-6 border-t bg-card">
           <Button variant="ghost" onClick={() => onOpenChange(false)} className="font-bold">إلغاء</Button>
           <Button disabled={isSaving} onClick={handleSaveAll} className="font-black px-12 h-12 text-lg shadow-xl shadow-primary/20">
             اعتمد وحفظ القوائم ({totals.count})
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
