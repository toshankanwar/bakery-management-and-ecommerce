import crypto from "crypto";
import { db } from "@/firebase/config";
import { doc, updateDoc, getDoc } from "firebase/firestore";

const RAZORPAY_KEY_SECRET = "YiI6F57QxpxzkDy2BlDXiFrL";

// Your atomic decrement server API URL
const DECREMENT_API_URL = "http://localhost:5000/api/confirm-order";

// Razorpay API credentials for refund (replace with your actual keys)
const RAZORPAY_KEY_ID = "rzp_live_7p3V38KUQoolpn";
const RAZORPAY_KEY_SECRET_FOR_REFUND = "YiI6F57QxpxzkDy2BlDXiFrL";

async function refundPayment(paymentId, amount, currency = "INR") {
  const refundUrl = `https://api.razorpay.com/v1/payments/${paymentId}/refund`;
  const body = {
    amount, // in paise
    speed: "normal",
  };
  const authString = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET_FOR_REFUND}`).toString('base64');

  const resp = await fetch(refundUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authString}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(`Refund failed: ${resp.status} ${resp.statusText} - ${JSON.stringify(errorData)}`);
  }
  return await resp.json();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDocId } = body || {};

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderDocId) {
      return Response.json({ 
        status: "error", 
        error: "Missing required fields",
      }, { status: 400 });
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      // BOTH payment and order cancelled due to invalid signature
      await updateDoc(doc(db, "orders", orderDocId), {
        paymentStatus: "cancelled",
        orderStatus: "cancelled",
      });

      return Response.json({
        status: "cancelled",
        message: "Payment and order both cancelled due to signature mismatch",
      }, { status: 400 });
    }

    // Signature verified: payment succeeded - get order details
    const orderDocRef = doc(db, "orders", orderDocId);
    const orderSnap = await getDoc(orderDocRef);

    if (!orderSnap.exists()) {
      return Response.json({
        status: "error",
        error: "Order document not found",
      }, { status: 404 });
    }

    const orderData = orderSnap.data();

    // Prepare orderItems for decrement API (adjust according to your schema)
    const orderItems = (orderData.items || []).map(item => ({
      id: item.productId || item.id,
      quantity: item.quantity,
    }));

    // Call your decrement API to check stock & decrement atomically
    const decrementResp = await fetch(DECREMENT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderDocId,
        paymentStatus: "confirmed", // tentative; your API uses this
        orderItems,
      }),
    });

    const decrementResult = await decrementResp.json();

    if (!decrementResp.ok || decrementResult.success === false) {
      // Payment confirmed but order cancelled due to insufficient stock
      await updateDoc(doc(db, "orders", orderDocId), {
        paymentStatus: "confirmed",
        orderStatus: "cancelled",
        cancellationReason: "Insufficient stock",
      });

      // Attempt refund (async)
      const paymentAmount = orderData.totalAmount || 0;

      try {
        // Razorpay refund amount in paise
        await refundPayment(razorpay_payment_id, paymentAmount * 100, orderData.currency || "INR");
        console.log(`Refund successful for paymentId: ${razorpay_payment_id}`);
      } catch (refundError) {
        console.error("Refund failed:", refundError);
        // Consider logging for manual action if needed
      }

      return Response.json({
        status: "payment_confirmed_order_cancelled",
        message: "Payment confirmed but order cancelled due to insufficient stock. Refund initiated.",
        insufficientItemId: decrementResult.insufficientItemId || null,
      }, { status: 200 });
    }

    // Both payment and order confirmed successfully
    await updateDoc(doc(db, "orders", orderDocId), {
      paymentStatus: "confirmed",
      orderStatus: "confirmed",
    });

    return Response.json({
      status: "success",
      message: "Payment and order confirmed successfully",
    }, { status: 200 });

  } catch (error) {
    console.error("Payment verification API error:", error);
    return Response.json({
      status: "error",
      error: error.message || "Internal server error",
    }, { status: 500 });
  }
}
