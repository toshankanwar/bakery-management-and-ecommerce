import Razorpay from "razorpay";

// Hardcode your Razorpay Key ID and Key Secret here:
const razorpay = new Razorpay({
  key_id: "YOUR_RAZORPAY_KEY_ID",
  key_secret: "YOUR_RAZORPAY_KEY_SECRET",
});

export async function POST(request) {
  const body = await request.json();
  const { amount } = body;

  try {
    const paymentOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      payment_capture: 1,
    });
    return Response.json(paymentOrder);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}