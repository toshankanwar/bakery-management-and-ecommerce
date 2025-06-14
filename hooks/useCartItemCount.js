import { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { collection, query, getDocs, onSnapshot } from 'firebase/firestore';
import { useAuthContext } from '@/contexts/AuthContext';

const useCartItemCount = () => {
  const [itemCount, setItemCount] = useState(0);
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) {
      setItemCount(0);
      return;
    }

    // Set up real-time listener for cart changes
    const cartRef = collection(db, 'carts', user.uid, 'items');
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      setItemCount(snapshot.docs.length);
    }, (error) => {
      console.error('Error fetching cart count:', {
        error: error.message,
        timestamp: '2025-06-14 02:00:16',
        user: 'Kala-bot-apk'
      });
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [user]);

  return itemCount;
};

export default useCartItemCount;