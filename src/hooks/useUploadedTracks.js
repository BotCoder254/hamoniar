import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase.config';

export const useUploadedTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'music'), orderBy('uploadedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trackList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTracks(trackList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { tracks, loading };
}; 