import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  type DocumentData,
  type QueryConstraint
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject, uploadBytesResumable } from 'firebase/storage';
import { db, auth, storage } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function getEffectiveUserInfo() {
  const user = auth.currentUser;
  if (user) return { uid: user.uid, authenticated: true };
  
  const isLocallyAuth = localStorage.getItem('pharma-is-authenticated') === 'true';
  if (isLocallyAuth) {
    return { uid: 'demo-user', authenticated: true };
  }
  
  return { uid: null, authenticated: false };
}

function cleanData(data: any) {
  if (data === null || typeof data !== 'object') return data;
  
  const cleaned: any = {};
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
        cleaned[key] = cleanData(value);
      } else {
        cleaned[key] = value;
      }
    }
  });
  return cleaned;
}

export const firebaseService = {
  // Generic collection operations
  async addDocument(collectionName: string, data: any) {
    const { uid, authenticated } = getEffectiveUserInfo();
    if (!authenticated) throw new Error('يرجى تسجيل الدخول أولاً');
    
    const docRef = doc(collection(db, collectionName));
    const now = new Date();
    
    const preparedData = cleanData({
      ...data,
      id: docRef.id,
      ownerId: uid,
      createdAt: now,
      updatedAt: now,
    });

    try {
      await setDoc(docRef, preparedData);
      console.log(`[Firebase] Successfully added to ${collectionName}:`, docRef.id);
      return docRef.id;
    } catch (error) {
      console.error(`[Firebase] Error adding to ${collectionName}:`, error);
      handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docRef.id}`);
    }
  },

  async updateDocument(collectionName: string, id: string, data: any) {
    const { authenticated } = getEffectiveUserInfo();
    if (!authenticated) throw new Error('يرجى تسجيل الدخول أولاً');

    const docRef = doc(db, collectionName, id);
    try {
      await updateDoc(docRef, cleanData({
        ...data,
        updatedAt: new Date()
      }));
      console.log(`[Firebase] Successfully updated ${collectionName}/${id}`);
    } catch (error) {
      console.error(`[Firebase] Error updating ${collectionName}/${id}:`, error);
      handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${id}`);
    }
  },

  async deleteDocument(collectionName: string, id: string) {
    const { authenticated, uid } = getEffectiveUserInfo();
    if (!authenticated) throw new Error('يرجى تسجيل الدخول أولاً');

    try {
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      
      // 1. Reference original document
      const docRef = doc(db, collectionName, id);
      const snapshot = await getDoc(docRef);
      const data = snapshot.data();

      // Add to batch
      batch.delete(docRef);
      
      // 2. Cascade delete related records with this as sourceId
      const relatedCols = ['ledgerEntries', 'transactions', 'entityActivities', 'notifications', 'historicalRecords'];
      for (const col of relatedCols) {
        try {
          const related = await this.queryDocuments(col, [
            { field: 'sourceId', operator: '==', value: id }
          ]);
          if (related && related.length > 0) {
            for (const item of related) {
              batch.delete(doc(db, col, item.id!));
            }
          }
        } catch (relatedErr) {
          console.warn(`[Firebase] Could not find related ${col} for ${id} for batch:`, relatedErr);
        }
      }

      // If it's an entity, delete related by accountId or entityId too
      if (collectionName === 'entities' || collectionName === 'suppliers' || collectionName === 'customers') {
        const entityRelatedWays = [
          { col: 'ledgerEntries', field: 'accountId' },
          { col: 'entityActivities', field: 'entityId' },
          { col: 'transactions', field: 'entityId' }
        ];
        for (const way of entityRelatedWays) {
          try {
            const related = await this.queryDocuments(way.col, [
              { field: way.field, operator: '==', value: id }
            ]);
            if (related && related.length > 0) {
              for (const item of related) {
                batch.delete(doc(db, way.col, item.id!));
              }
            }
          } catch (e) {}
        }
      }

      // 3. Commit batch
      await batch.commit();
      console.log(`[Firebase] Atomically deleted ${collectionName}/${id} and related data`);

      // 4. Clean up storage (cannot be part of Firestore batch)
      if (data && data.imageUrl) {
        try {
          await this.deleteImage(data.imageUrl);
        } catch (storageErr) {
          console.warn(`[Firebase] Storage cleanup failed for ${id}:`, storageErr);
        }
      }
      
      if (data && data.attachments && Array.isArray(data.attachments)) {
        for (const attachment of data.attachments) {
          if (attachment.url) {
            try {
              await this.deleteImage(attachment.url);
            } catch (storageErr) {
              console.warn(`[Firebase] Attachment cleanup failed for ${id}:`, storageErr);
            }
          }
        }
      }

    } catch (error) {
      console.error(`[Firebase] Error deleting ${collectionName}/${id}:`, error);
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
    }
  },

  async syncLedger(data: any) {
    const { uid, authenticated } = getEffectiveUserInfo();
    if (!authenticated) return;

    if (!data.sourceId || !data.sourceType) {
      console.error("[LedgerSync] Missing sourceId or sourceType", data);
      return;
    }

    try {
      const q = query(
        collection(db, 'ledgerEntries'),
        where('ownerId', '==', uid),
        where('sourceId', '==', data.sourceId)
      );
      const snapshot = await getDocs(q);
      
      const ledgerData = {
        ...data,
        ownerId: uid,
        updatedAt: new Date()
      };

      if (!snapshot.empty) {
        const docId = snapshot.docs[0].id;
        await updateDoc(doc(db, 'ledgerEntries', docId), cleanData(ledgerData));
        console.log(`[LedgerSync] Updated ledger for ${data.sourceType}/${data.sourceId}`);
        return docId;
      } else {
        const docRef = doc(collection(db, 'ledgerEntries'));
        const now = new Date();
        await setDoc(docRef, cleanData({
          ...ledgerData,
          id: docRef.id,
          createdAt: now,
          updatedAt: now
        }));
        console.log(`[LedgerSync] Created new ledger for ${data.sourceType}/${data.sourceId}`);
        return docRef.id;
      }
    } catch (error) {
      console.error("[LedgerSync] Error syncing ledger:", error);
    }
  },

  async syncTransaction(data: any) {
    const { uid, authenticated } = getEffectiveUserInfo();
    if (!authenticated) return;
    if (!data.sourceId) {
      console.error("[TransactionSync] Missing sourceId", data);
      return;
    }

    try {
      const q = query(
        collection(db, 'transactions'),
        where('ownerId', '==', uid),
        where('sourceId', '==', data.sourceId)
      );
      const snapshot = await getDocs(q);
      const txData = { 
        ...data, 
        ownerId: uid, 
        updatedAt: new Date() 
      };

      if (!snapshot.empty) {
        const docId = snapshot.docs[0].id;
        await updateDoc(doc(db, 'transactions', docId), cleanData(txData));
        console.log(`[TransactionSync] Updated transaction for ${data.sourceId}`);
        return docId;
      } else {
        return await this.addDocument('transactions', txData);
      }
    } catch (error) {
      console.error("[TransactionSync] Error:", error);
    }
  },

  async setDocument(collectionName: string, id: string, data: any, options: { merge?: boolean } = {}) {
    const { authenticated } = getEffectiveUserInfo();
    if (!authenticated) throw new Error('يرجى تسجيل الدخول أولاً');

    const docRef = doc(db, collectionName, id);
    try {
      await setDoc(docRef, cleanData({ ...data, updatedAt: new Date() }), options);
      console.log(`[Firebase] Successfully set ${collectionName}/${id}`);
    } catch (error) {
      console.error(`[Firebase] Error setting ${collectionName}/${id}:`, error);
      handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${id}`);
    }
  },

  listenDocument(collectionName: string, id: string, callback: (data: any) => void) {
    const { authenticated } = getEffectiveUserInfo();
    if (!authenticated) {
      callback(null);
      return () => {};
    }

    const docRef = doc(db, collectionName, id);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ ...doc.data(), id: doc.id });
      } else {
        callback(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `${collectionName}/${id}`);
    });
  },

  listenCollection(collectionName: string, callback: (data: any[]) => void, constraints: QueryConstraint[] = []) {
    const { uid, authenticated } = getEffectiveUserInfo();
    if (!authenticated) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, collectionName),
      where('ownerId', '==', uid),
      ...constraints
    );

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      callback(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, collectionName);
    });
  },
  
  async queryDocuments(collectionName: string, filters: { field: string, operator: any, value: any }[] = []) {
    const { uid, authenticated } = getEffectiveUserInfo();
    if (!authenticated) throw new Error('يرجى تسجيل الدخول أولاً');

    try {
      const constraints = filters.map(f => where(f.field, f.operator, f.value));
      const q = query(
        collection(db, collectionName),
        where('ownerId', '==', uid),
        ...constraints
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
    } catch (error) {
      console.error(`[Firebase] Error querying ${collectionName}:`, error);
      handleFirestoreError(error, OperationType.LIST, collectionName);
    }
  },

  async uploadImage(path: string, base64String: string) {
    const { uid, authenticated } = getEffectiveUserInfo();
    if (!authenticated) throw new Error('يرجى تسجيل الدخول أولاً');
    
    try {
      const storageRef = ref(storage, `${path}/${uid}_${Date.now()}_${Math.random().toString(36).substring(7)}`);
      // Clean base64 string (remove data:image/png;base64, if present)
      const cleanBase64 = base64String.includes(',') ? base64String.split(',')[1] : base64String;
      
      const snapshot = await uploadString(storageRef, cleanBase64, 'base64');
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('[Firebase] Error uploading image:', error);
      throw error;
    }
  },

  async uploadFileWithProgress(path: string, file: File, onProgress?: (percent: number) => void) {
    console.log(`[Firebase Storage] Starting upload to ${path}/${file.name}`);
    console.log(`[Firebase Storage] File type: ${file.type}, size: ${file.size} bytes`);
    
    const { uid, authenticated } = getEffectiveUserInfo();
    if (!authenticated) {
      console.error('[Firebase Storage] Upload failed: User not authenticated');
      throw new Error('يرجى تسجيل الدخول أولاً');
    }

    try {
      const fullPath = `${path}/${uid}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      console.log(`[Firebase Storage] Full storage path: ${fullPath}`);
      
      const storageRef = ref(storage, fullPath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise<string>((resolve, reject) => {
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`[Firebase Storage] Upload progress: ${progress.toFixed(2)}%`);
            onProgress?.(progress);
          }, 
          (error) => {
            console.error('[Firebase Storage] Upload task error:', error);
            reject(error);
          }, 
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log(`[Firebase Storage] Upload complete. Download URL: ${downloadURL}`);
              resolve(downloadURL);
            } catch (urlError) {
              console.error('[Firebase Storage] Error getting download URL:', urlError);
              reject(urlError);
            }
          }
        );
      });
    } catch (err) {
      console.error('[Firebase Storage] Error initializing upload:', err);
      throw err;
    }
  },

  async deleteImage(url: string) {
    try {
      const imageRef = ref(storage, url);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('[Firebase] Error deleting image:', error);
    }
  }
};
