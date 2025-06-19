'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, getDocs, query, where, limit, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Image from 'next/image';
import { MinusIcon, PlusIcon, ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline';
import { useAuthContext } from '@/contexts/AuthContext';

// Slugify utility
const toSlug = (str) =>
  str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function ProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();

  const [product, setProduct] = useState(null);
  const [cartItem, setCartItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');

  // Fetch product by slug
  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        let found = null;
        const q = query(collection(db, 'bakeryItems'), where('slug', '==', slug), limit(1));
        let snap = await getDocs(q);

        if (!snap.empty) {
          found = { id: snap.docs[0].id, ...snap.docs[0].data() };
        } else {
          const all = await getDocs(collection(db, 'bakeryItems'));
          found = all.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .find(item =>
              item.name &&
              toSlug(item.name) === slug
            );
        }
        setProduct(found || null);
      } catch {
        setProduct(null);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [slug]);

  // Fetch cart item from Firestore carts/{userId}/items/{itemId}
  useEffect(() => {
    if (!product || !user?.uid) {
      setCartItem(null);
      setQuantity(1);
      return;
    }
    const fetchCart = async () => {
      setCartLoading(true);
      try {
        setCartError('');
        const cartItemRef = doc(db, 'carts', user.uid, 'items', product.id);
        const cartSnap = await getDoc(cartItemRef);
        if (cartSnap.exists()) {
          const item = cartSnap.data();
          setCartItem(item);
          setQuantity(item.quantity);
        } else {
          setCartItem(null);
          setQuantity(1);
        }
      } catch (e) {
        setCartError('Could not fetch cart. Please try again.');
        setCartItem(null);
        setQuantity(1);
      }
      setCartLoading(false);
    };
    fetchCart();
    // eslint-disable-next-line
  }, [product && product.id, user?.uid]);

  // Add/update item in user's cart
  const updateCart = async (newQty) => {
    setCartError('');
    if (!product) return;
    if (!user?.uid) {
      setCartError('Please login to add to cart.');
      return;
    }
    // Prevent adding to cart if product.quantity is 0
    if (product.quantity === 0) {
      setCartError('This item is out of stock.');
      return;
    }
    if (newQty < 1) return;
    if (newQty > product.quantity) {
      setCartError(`Only ${product.quantity} in stock.`);
      return;
    }

    setCartLoading(true);
    try {
      const cartItemRef = doc(db, 'carts', user.uid, 'items', product.id);
      const cartItemData = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: newQty,
        image: product.imageUrl,
        category: product.category || '',
        addedAt: cartItem?.addedAt || new Date(),
      };
      await setDoc(cartItemRef, {
        ...cartItemData,
        addedAt: cartItem?.addedAt || new Date(),
      });
      setCartItem({ ...cartItemData, addedAt: cartItem?.addedAt || new Date() });
      setQuantity(newQty);
    } catch (err) {
      setCartError('Insufficient permissions or network error. Please check your access or login again.');
      if (!user?.uid) setTimeout(() => router.push('/login'), 1500);
    }
    setCartLoading(false);
  };

  if (loading || authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-100 via-white to-green-100">
        <span className="text-green-700 font-medium animate-pulse text-xl">Loading product...</span>
      </main>
    );
  }
  if (!product) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-100 via-white to-green-100">
        <span className="text-red-700 font-semibold text-xl">Product not found</span>
      </main>
    );
  }

  const outOfStock = product.quantity === 0;

  return (
    <main className="min-h-screen bg-gradient-to-tr from-green-100 via-white to-green-100 pb-20">
      {/* Main Product Section */}
      <section className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-stretch shadow-2xl rounded-3xl overflow-hidden mt-12 mb-12 bg-white/90 border-green-200 border">
        {/* Product Image (left, 60%) */}
        <div className="relative w-full md:w-[60%] min-h-[340px] md:min-h-[75vh] flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-200 p-5 md:p-8">
          <div className="relative w-full h-[320px] md:h-[65vh] rounded-3xl shadow-2xl overflow-hidden border-4 border-green-100 animate-fadeIn">
            <Image
              src={product.imageUrl || '/breads.jpg'}
              alt={product.name}
              fill
              className="object-cover object-center scale-105 hover:scale-110 transition-transform duration-500"
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            {outOfStock && (
              <div className="absolute top-4 left-4 bg-red-600 text-white font-semibold rounded-full px-5 py-2 text-lg shadow-lg animate-fadeInUp z-10">
                Out of Stock
              </div>
            )}
          </div>
        </div>
        {/* Details (right, 40%) */}
        <div className="w-full md:w-[40%] flex flex-col justify-between px-6 md:px-10 py-12 gap-8 relative bg-white/95">
          <div>
            <h1 className="text-4xl md:text-3xl font-extrabold text-green-900 mb-7 animate-fadeInUp">{product.name}</h1>
            <p className="text-gray-700 text-lg leading-7 mb-8 animate-fadeInUp">{product.description}</p>
            <div className="flex flex-wrap gap-3 mb-6 animate-fadeInUp">
              <span className="bg-green-200 text-green-800 font-bold px-6 py-2 rounded-full text-xl shadow-lg">
                ₹{product.price}
              </span>
              {product.category && (
                <span className="bg-green-50 text-green-600 font-medium px-5 py-1 rounded-full text-base shadow">
                  {product.category}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mb-8 flex-wrap animate-fadeInUp">
              <span className="font-semibold text-gray-700">Quantity:</span>
              <button
                className="rounded-full bg-green-100 p-2 hover:bg-green-200 transition disabled:opacity-40 shadow-md"
                onClick={() => updateCart((cartItem ? cartItem.quantity : quantity) - 1)}
                disabled={cartLoading || !user?.uid || (cartItem ? cartItem.quantity <= 1 : quantity <= 1) || outOfStock}
                aria-label="Decrease quantity"
              >
                <MinusIcon className="h-6 w-6 text-green-800" />
              </button>
              <span className="inline-block w-12 text-center text-xl font-bold text-green-900 bg-green-50 rounded-full border-2 border-green-200 shadow-inner">
                {cartItem ? cartItem.quantity : quantity}
              </span>
              <button
                className="rounded-full bg-green-100 p-2 hover:bg-green-200 transition disabled:opacity-40 shadow-md"
                onClick={() => updateCart((cartItem ? cartItem.quantity : quantity) + 1)}
                disabled={cartLoading || !user?.uid || outOfStock || (cartItem ? cartItem.quantity : quantity) >= product.quantity}
                aria-label="Increase quantity"
              >
                <PlusIcon className="h-6 w-6 text-green-800" />
              </button>
            </div>
            <div className="mb-3 animate-fadeInUp">
              {!user ? (
                <span className="inline-block bg-red-100 text-red-700 font-bold px-5 py-2 rounded-full text-lg shadow border border-red-200">
                  Please login to add to cart
                </span>
              ) : cartError ? (
                <span className="inline-block bg-red-100 text-red-700 font-bold px-5 py-2 rounded-full text-lg shadow border border-red-200">
                  {cartError}
                </span>
              ) : outOfStock ? (
                <span className="inline-block bg-red-100 text-red-700 font-bold px-5 py-2 rounded-full text-lg shadow border border-red-200">
                  Out of Stock
                </span>
              ) : !cartItem ? (
                <button
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 via-green-500 to-green-700 hover:from-green-700 hover:to-green-800 text-white w-full justify-center px-8 py-4 rounded-full font-bold text-xl shadow-xl transition disabled:opacity-50 border-2 border-green-700 animate-pulse"
                  onClick={() => updateCart(quantity)}
                  disabled={cartLoading || !user?.uid || outOfStock}
                >
                  <ShoppingCartIcon className="w-7 h-7" />
                  Add to Cart
                </button>
              ) : (
                <span className="inline-block bg-green-100 text-green-700 font-bold px-5 py-2 rounded-full text-lg shadow border border-green-200">
                  In cart: {cartItem.quantity}
                </span>
              )}
            </div>
          </div>
          <div className="border-t pt-6 mt-2">
            <div className="flex items-center gap-2 text-green-700 font-semibold mb-1">
              <span>Freshly Baked</span>
              <span className="inline-block w-1 h-1 bg-green-400 rounded-full"></span>
              <span className="text-gray-500 font-normal">Delivery in select areas</span>
            </div>
            <div className="text-gray-400 text-xs">
              Need help? Call us at <span className="text-green-800 font-semibold">+91 1234567890</span>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="max-w-4xl mx-auto bg-white/95 shadow-2xl rounded-3xl p-10 mb-10 mt-0">
        <h2 className="text-2xl font-bold text-green-800 mb-8">Reviews</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 mt-3">
          {[1, 2].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-gradient-to-br from-green-100 via-white to-green-200 p-8 flex flex-col gap-4 shadow-lg hover:shadow-2xl border border-green-200 hover:border-green-500 transition group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute -top-8 -left-8 opacity-20 group-hover:opacity-40 transition">
                <StarIcon className="w-32 h-32 text-green-300" />
              </div>
              <div className="flex items-center gap-2 z-10">
                {[...Array(5)].map((_, s) => (
                  <StarIcon key={s} className="w-6 h-6 text-green-400 group-hover:text-green-600 transition" />
                ))}
              </div>
              <div className="font-semibold text-green-800 text-lg z-10">Coming Soon</div>
              <div className="text-gray-500 italic text-base z-10">
                Product reviews and customer feedback will be displayed here. Stay tuned!
              </div>
            </div>
          ))}
        </div>
      </section>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fadeIn {
          animation: fadeIn 0.7s cubic-bezier(.4,2,.3,1);
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fadeInUp {
          animation: fadeInUp 1s cubic-bezier(.4,2,.3,1);
        }
      `}</style>
    </main>
  );
}