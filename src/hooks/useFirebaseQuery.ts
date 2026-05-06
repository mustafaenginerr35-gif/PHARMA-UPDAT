import { useState, useEffect } from 'react';
import { firebaseService } from '../services/firebaseService';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { QueryConstraint } from 'firebase/firestore';

const DEFAULT_CONSTRAINTS: QueryConstraint[] = [];

export function useFirebaseQuery<T>(collectionName: string, constraints: QueryConstraint[] = DEFAULT_CONSTRAINTS) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
  }, []);

  const isLocallyAuth = localStorage.getItem('pharma-is-authenticated') === 'true';

  useEffect(() => {
    if (!user && !isLocallyAuth) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = firebaseService.listenCollection(
      collectionName, 
      (newData) => {
        setData(newData);
        setLoading(false);
      },
      constraints
    );

    return () => unsubscribe();
  }, [collectionName, user, isLocallyAuth, constraints]);

  return { data, loading };
}
