import { useAuthContext } from '@/contexts/AuthContext';
import { doc, setDoc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// Custom hook to manage cart operations
const useCart = () => {
  const { user } = useAuthContext();
  const router = useRouter();

  const handleAddToCart = async (product) => {
    // Check if user is authenticated
    if (!user) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    try {
      // Reference to the specific cart item
      const cartItemRef = doc(db, 'carts', user.uid, 'items', product.id);
      
      // Check if item already exists in cart
      const cartItemSnap = await getDoc(cartItemRef);
      
      if (cartItemSnap.exists()) {
        // Update quantity if item exists
        await updateDoc(cartItemRef, {
          quantity: increment(1),
          updatedAt: new Date()
        });
        
        toast.success('Item quantity updated in cart!');
      } else {
        // Add new item to cart
        await setDoc(cartItemRef, {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.imageUrl,
          category: product.category,
          quantity: 1,
          addedAt: new Date()
        });
        
        toast.success('Item added to cart!');
      }
    } catch (error) {
      console.error('Error adding to cart:', {
        error: error.message,
        timestamp: '2025-06-13 16:29:39',
        user: 'Kala-bot-apk'
      });
      toast.error('Failed to add item to cart');
    }
  };

  const handleUpdateCartItem = async (productId, newQuantity) => {
    if (!user) {
      toast.error('Please login to update cart');
      router.push('/login');
      return;
    }

    try {
      if (newQuantity <= 0) {
        // Remove item if quantity is 0 or less
        await handleRemoveFromCart(productId);
        return;
      }

      if (newQuantity > 50) {
        toast.error('Maximum quantity limit is 50');
        return;
      }

      const cartItemRef = doc(db, 'carts', user.uid, 'items', productId);
      await updateDoc(cartItemRef, {
        quantity: newQuantity,
        updatedAt: new Date()
      });

      toast.success('Cart updated!');
    } catch (error) {
      console.error('Error updating cart:', {
        error: error.message,
        timestamp: '2025-06-13 16:29:39',
        user: 'Kala-bot-apk'
      });
      toast.error('Failed to update cart');
    }
  };

  const handleRemoveFromCart = async (productId) => {
    if (!user) {
      toast.error('Please login to remove items');
      router.push('/login');
      return;
    }

    try {
      const cartItemRef = doc(db, 'carts', user.uid, 'items', productId);
      await deleteDoc(cartItemRef);
      toast.success('Item removed from cart!');
    } catch (error) {
      console.error('Error removing from cart:', {
        error: error.message,
        timestamp: '2025-06-13 16:29:39',
        user: 'Kala-bot-apk'
      });
      toast.error('Failed to remove item');
    }
  };

  return {
    handleAddToCart,
    handleUpdateCartItem,
    handleRemoveFromCart
  };
};

export default useCart;