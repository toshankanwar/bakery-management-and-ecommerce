import { NextResponse } from 'next/server';
import { db } from '@/firebase/firebaseAdmin';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received body:', body);
    console.log("PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
    console.log("CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
    console.log("PRIVATE_KEY length:", process.env.FIREBASE_PRIVATE_KEY?.length);

    const { orderDocId, paymentStatus, orderItems } = body;

    // Validate orderDocId
    if (!orderDocId) {
      console.error('Validation failed: Missing orderDocId');
      return NextResponse.json({ error: 'Missing orderDocId' }, { status: 400 });
    }

    // Validate paymentStatus
    if (!paymentStatus || typeof paymentStatus !== 'string') {
      console.error('Validation failed: Invalid or missing paymentStatus');
      return NextResponse.json({ error: 'Invalid or missing paymentStatus' }, { status: 400 });
    }

    // Validate orderItems
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      console.error('Validation failed: orderItems missing or not a non-empty array');
      return NextResponse.json({ error: 'orderItems missing or invalid' }, { status: 400 });
    }

    // Validate each order item before proceeding
    for (const [index, item] of orderItems.entries()) {
      if (!item) {
        console.error(`Validation failed: orderItems[${index}] is undefined or null`);
        return NextResponse.json({ error: `orderItems[${index}] is invalid` }, { status: 400 });
      }
      const itemId = item.id;
      const qtyToDecrement = item.quantity;

      if (!itemId || typeof itemId !== 'string' || itemId.trim() === '') {
        console.error(`Validation failed: orderItems[${index}] itemId missing or not a valid string`);
        return NextResponse.json({ error: `Invalid itemId for orderItems[${index}]` }, { status: 400 });
      }
      if (typeof qtyToDecrement !== 'number' || qtyToDecrement <= 0) {
        console.error(`Validation failed: orderItems[${index}] quantity invalid: ${qtyToDecrement}`);
        return NextResponse.json({ error: `Invalid quantity for orderItems[${index}]` }, { status: 400 });
      }
    }

    console.log('Input validation passed');

    // Run transaction to atomically check stock, update order status & decrement stock
    const result = await db.runTransaction(async (transaction) => {
      const orderRef = db.collection('orders').doc(orderDocId);
      const orderSnap = await transaction.get(orderRef);

      if (!orderSnap.exists) {
        throw new Error('Order not found');
      }

      // 1. Read all bakeryItems documents first (all reads before writes)
      const itemDocs = [];
      for (const item of orderItems) {
        const itemId = item.id;
        const itemRef = db.collection('bakeryItems').doc(itemId);

        const itemSnap = await transaction.get(itemRef);
        if (!itemSnap.exists) {
          throw new Error(`Bakery item ${itemId} does not exist`);
        }

        itemDocs.push({ ref: itemRef, snap: itemSnap, qtyToDecrement: item.quantity });
      }

      // 2. Check stock availability for all items before writing
      for (const { snap, qtyToDecrement } of itemDocs) {
        const currentQty = snap.data().quantity ?? 0;
        if (currentQty < qtyToDecrement) {
          console.error(`Insufficient stock for bakery item ${snap.id}: current ${currentQty}, requested ${qtyToDecrement}`);
          return { success: false, insufficientItemId: snap.id };
        }
      }

      // 3. All stock sufficient - update order and decrement stock in one transaction
      transaction.update(orderRef, {
        orderStatus: 'confirmed',
        paymentStatus: paymentStatus,
        updatedAt: new Date().toISOString(),
      });

      for (const { ref, snap, qtyToDecrement } of itemDocs) {
        const currentQty = snap.data().quantity ?? 0;
        const newQty = currentQty - qtyToDecrement;

        transaction.update(ref, { quantity: newQty });
        console.log(`Bakery item ${ref.id} stock decremented from ${currentQty} to ${newQty}`);
      }

      return { success: true };
    });

    // If stock insufficient, revert or handle accordingly after transaction
    if (!result.success) {
      // Optionally, revert order status to 'pending' if previously updated (if you update elsewhere)
      // In this code, order status is updated only inside transaction if successful, so no revert needed
      return NextResponse.json({
        error: `Insufficient stock for bakery item ${result.insufficientItemId}`,
      }, { status: 400 });
    }

    console.log('Order confirmed and stock decremented successfully');
    return NextResponse.json({ message: 'Order confirmed and stock decremented' }, { status: 200 });

  } catch (error) {
    console.error('Error confirming order and decrementing stock:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
