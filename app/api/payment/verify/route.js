import crypto from "crypto";
import { db } from "@/firebase/config";
import { doc, updateDoc } from "firebase/firestore";

// Hardcode your Razorpay Key Secret here:
const RAZORPAY_KEY_SECRET = "YiI6F57QxpxzkDy2BlDXiFrL";

export async function POST(request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDocId } = body || {};

    // Check for missing fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderDocId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate signature
    const generated_signature = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      await updateDoc(doc(db, "orders", orderDocId), {
        paymentStatus: "confirmed",
        orderStatus: "confirmed",
      });
      return Response.json({ status: "success" });
    } else {
      await updateDoc(doc(db, "orders", orderDocId), {
        paymentStatus: "cancelled",
        orderStatus: "cancelled",
      });
      return Response.json({ status: "failed", error: "Signature mismatch" }, { status: 400 });
    }
  } catch (error) {
    // Always return JSON, even on error
    return Response.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}