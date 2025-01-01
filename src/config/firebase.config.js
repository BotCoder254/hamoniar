import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDo7VNF957GGOigX21RI8cr9gSPaK_-r0Y",
  authDomain: "community-hub-be1a3.firebaseapp.com",
  databaseURL: "https://community-hub-be1a3-default-rtdb.firebaseio.com",
  projectId: "community-hub-be1a3",
  storageBucket: "community-hub-be1a3.appspot.com",
  messagingSenderId: "140658585413",
  appId: "1:140658585413:web:0377c49b2dedd1b6b4d82c",
  measurementId: "G-HBPEQJBRL8"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const database = getDatabase(app); 