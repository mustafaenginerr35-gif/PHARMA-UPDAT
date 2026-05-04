import { db } from '../db';
import { toast } from 'sonner';

/**
 * DataPersistenceService
 * Handles core data operations for export, import, and health checks
 */
export const DataPersistenceService = {
  /**
   * Export all indexedDB tables to a single JSON file
   */
  async exportToJSON() {
    try {
      const data: Record<string, any[]> = {};
      const tables = db.tables;
      
      for (const table of tables) {
        data[table.name] = await table.toArray();
      }
      
      const exportObj = {
        version: db.verno,
        timestamp: new Date().toISOString(),
        data: data,
        deviceInfo: navigator.userAgent,
        app: 'PharmaSystem'
      };
      
      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `pharma_backup_${new Date().toISOString().split('T')[0]}_${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('تم تصدير نسخة احتياطية من جميع البيانات بنجاح');
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('فشل في تصدير البيانات: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'));
      return false;
    }
  },

  /**
   * Import data from a JSON file into indexedDB
   * WARNING: This replaces current data
   */
  async importFromJSON(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          
          if (!parsed.data || typeof parsed.data !== 'object') {
            throw new Error('ملف النسخة الاحتياطية غير صالح');
          }
          
          const confirmImport = window.confirm('تحذير: سيتم استبدال جميع البيانات الحالية بالبيانات الموجودة في الملف. هل تريد الاستمرار؟');
          if (!confirmImport) {
            resolve(false);
            return;
          }
          
          toast.loading('جاري استيراد البيانات...');
          
          for (const tableName in parsed.data) {
            const table = (db as any)[tableName];
            if (table) {
              await table.clear();
              // Handle potential empty tables in backup
              if (parsed.data[tableName] && parsed.data[tableName].length > 0) {
                await table.bulkAdd(parsed.data[tableName]);
              }
            }
          }
          
          toast.dismiss();
          toast.success('تم استعادة البيانات بنجاح! سيتم إعادة تحميل التطبيق...');
          setTimeout(() => window.location.reload(), 2000);
          resolve(true);
        } catch (error) {
          console.error('Import failed:', error);
          toast.dismiss();
          toast.error('فشل في استيراد البيانات: ' + (error instanceof Error ? error.message : 'تنسيق الملف غير مدعوم'));
          reject(error);
        }
      };
      
      reader.onerror = () => {
        toast.error('فشل في قراءة الملف');
        reject(new Error('File reading failed'));
      };
      
      reader.readAsText(file);
    });
  },

  /**
   * Check database health and item counts
   */
  async getDatabaseStats() {
    try {
      const stats: Record<string, number> = {};
      for (const table of db.tables) {
        stats[table.name] = await table.count();
      }
      return stats;
    } catch (error) {
      console.error('Stats failed:', error);
      return null;
    }
  },

  /**
   * Clear all local storage and indexedDB (Factory Reset)
   */
  async factoryReset() {
    const confirmed = window.confirm('خطر: سيتم حذف جميع البيانات والإعدادات نهائياً. هل أنت متأكد؟');
    if (!confirmed) return;
    
    try {
      localStorage.clear();
      await db.delete();
      toast.success('تم مسح جميع البيانات، جاري إعادة التشغيل...');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error('فشل في مسح البيانات');
    }
  }
};
