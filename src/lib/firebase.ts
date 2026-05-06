import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA0u_QkjosI-8lbtIclvq_wLtqdSVGARDk",
  authDomain: "my-pharamcy-64f56.firebaseapp.com",
  projectId: "my-pharamcy-64f56",
  storageBucket: "my-pharamcy-64f56.firebasestorage.app",
  messagingSenderId: "531478238964",
  appId: "1:531478238964:web:a70e8fdbfb8332adfbb0a1",
  measurementId: "G-JW67CM6SHB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connectivity check
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Connected to Firebase project: my-pharamcy-64f56");
  }
});

setPersistence(auth, browserLocalPersistence);
