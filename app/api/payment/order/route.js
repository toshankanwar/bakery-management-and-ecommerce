import Razorpay from "razorpay";

// Hardcode your Razorpay Key ID and Key Secret here:
const razorpay = new Razorpay({
  key_id: "rzp_live_7p3V38KUQoolpn",
  key_secret: "YiI6F57QxpxzkDy2BlDXiFrL",
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount } = body || {};

    // Validate amount
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return Response.json({ error: "Amount is required and must be a positive number." }, { status: 400 });
    }

    const paymentOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      payment_capture: 1,
    });

    // Always return JSON
    return Response.json(paymentOrder);
  } catch (e) {
    return Response.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}