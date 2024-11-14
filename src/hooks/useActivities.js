import { useState, useEffect } from 'react';
import { db } from '../config/firebase.config';
import { 
  collection, query, where, orderBy, 
  limit, onSnapshot 
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export const useActivities = (limitCount = 20) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'activities'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newActivities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      setActivities(newActivities);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, limitCount]);

  return { activities, loading };
}; 