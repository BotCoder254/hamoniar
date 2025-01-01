// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.log('The current browser does not support persistence.');
    }
  });

export { app, auth, db, storage, database };

// Export common Firestore functions
export {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  serverTimestamp,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot
} from 'firebase/firestore';

// Export common Storage functions
export {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

// Export common Auth functions
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';

// Export common Realtime Database functions
export {
  ref as dbRef,
  set,
  get,
  update,
  remove,
  onValue,
  push,
  child
} from 'firebase/database';
