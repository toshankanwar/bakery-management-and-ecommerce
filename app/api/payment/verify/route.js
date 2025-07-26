import crypto from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/firebase/firebaseAdmin"; // Your Admin SDK initialized Firestore instance

const RAZORPAY_KEY_SECRET = "YiI6F57QxpxzkDy2BlDXiFrL";

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Incoming payment verification request body:", body);
    console.log("PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
    console.log("CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
    console.log("PRIVATE_KEY length:", process.env.FIREBASE_PRIVATE_KEY?.length);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDocId } = body || {};

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderDocId) {
      console.error("Missing required fields in payment verification");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify Razorpay signature
    const generated_signature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");
    
    console.log("Generated signature:", generated_signature);
    console.log("Provided signature:", razorpay_signature);

    if (generated_signature !== razorpay_signature) {
      console.error("Signature mismatch. Cancelling order:", orderDocId);

      await db.collection("orders").doc(orderDocId).update({
        paymentStatus: "cancelled",
        orderStatus: "cancelled",
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json(
        { status: "failed", error: "Signature mismatch" },
        { status: 400 }
      );
    }

    console.log("Signature verified successfully. Proceeding with stock check & update.");

    // Fetch the order document outside transaction for validation
    const orderDocSnap = await db.collection("orders").doc(orderDocId).get();

    if (!orderDocSnap.exists) {
      console.error("Order not found:", orderDocId);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const orderData = orderDocSnap.data();
    const orderItems = orderData.items;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      console.error("Order items missing or invalid for order:", orderDocId);
      return NextResponse.json(
        { error: "Order items missing or invalid" },
        { status: 400 }
      );
    }

    // Validate orderItems format before transaction
    for (const [index, item] of orderItems.entries()) {
      if (!item || typeof item !== 'object') {
        console.error(`Invalid order item at index ${index}`);
        return NextResponse.json(
          { error: `Invalid order item at index ${index}` },
          { status: 400 }
        );
      }
      const itemId = item.id;
      const qtyToDecrement = item.quantity;
      if (!itemId || typeof itemId !== 'string' || itemId.trim() === '') {
        console.error(`Invalid itemId for orderItems[${index}]:`, itemId);
        return NextResponse.json(
          { error: `Invalid itemId for orderItems[${index}]` },
          { status: 400 }
        );
      }
      if (typeof qtyToDecrement !== 'number' || qtyToDecrement <= 0) {
        console.error(`Invalid quantity for orderItems[${index}]:`, qtyToDecrement);
        return NextResponse.json(
          { error: `Invalid quantity for orderItems[${index}]` },
          { status: 400 }
        );
      }
    }

    // Run transaction to atomically check stock & decrement + update order status
    const result = await db.runTransaction(async (transaction) => {
      const orderRef = db.collection("orders").doc(orderDocId);
      const orderSnap = await transaction.get(orderRef);

      if (!orderSnap.exists) {
        throw new Error("Order not found inside transaction");
      }

      // Read all bakeryItems docs first (all reads before writes)
      const itemDocs = [];
      for (const item of orderItems) {
        const itemId = item.id;
        const itemRef = db.collection("bakeryItems").doc(itemId);
        const itemSnap = await transaction.get(itemRef);

        if (!itemSnap.exists) {
          throw new Error(`Bakery item ${itemId} does not exist`);
        }

        itemDocs.push({ ref: itemRef, snap: itemSnap, qtyToDecrement: item.quantity });
      }

      // Check stock availability for all items before writes
      for (const { snap, qtyToDecrement } of itemDocs) {
        const currentQty = snap.data().quantity ?? 0;
        console.log(`Checking stock for item ${snap.id} - Current Qty: ${currentQty}, Qty to Decrement: ${qtyToDecrement}`);
        if (currentQty < qtyToDecrement) {
          console.error(`Insufficient stock for bakery item ${snap.id}`);
          return { success: false, insufficientItemId: snap.id };
        }
      }

      console.log("All stock sufficient. Performing stock decrement...");

      // Perform stock decrement
      for (const { ref, snap, qtyToDecrement } of itemDocs) {
        const currentQty = snap.data().quantity ?? 0;
        const newQty = currentQty - qtyToDecrement;
        console.log(`Decrementing stock for item ${ref.id}: from ${currentQty} to ${newQty}`);
        transaction.update(ref, { quantity: newQty, updatedAt: new Date().toISOString() });
      }

      // Update order status and payment status
      console.log(`Updating order ${orderDocId} status to confirmed and paymentStatus to confirmed`);
      transaction.update(orderRef, {
        paymentStatus: "confirmed",
        orderStatus: "confirmed",
        updatedAt: new Date().toISOString(),
      });

      return { success: true };
    });

    if (!result.success) {
      console.warn(`Stock insufficient for item ${result.insufficientItemId}. Order not confirmed.`);
      return NextResponse.json(
        {
          status: "failed",
          error: `Insufficient stock for bakery item ${result.insufficientItemId}`,
        },
        { status: 400 }
      );
    }

    console.log(`Order ${orderDocId} confirmed and stock decremented successfully`);

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Payment verification/stock update failed:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
