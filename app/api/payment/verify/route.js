import crypto from "crypto";
import { db } from "@/firebase/config";
import { doc, updateDoc } from "firebase/firestore";

// Hardcode your Razorpay Key Secret here:
const RAZORPAY_KEY_SECRET = "YOUR_RAZORPAY_KEY_SECRET";

export async function POST(request) {
  const body = await request.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDocId } = body;

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
    return Response.json({ status: "failed" }, { status: 400 });
  }
}