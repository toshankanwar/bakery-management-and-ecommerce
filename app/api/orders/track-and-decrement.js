// api/orders/track-and-decrement.js
import { db } from "@/firebase/config";
import { doc, getDoc, writeBatch } from "firebase/firestore";

export async function trackAndDecrementOrderItems(order) {
  if (!order || order.orderStatus !== "confirmed") {
    throw new Error("Order is missing or not confirmed");
  }

  const batch = writeBatch(db);

  for (const item of order.items) {
    const productId = item.productId || item.id;
    const prodRef = doc(db, "bakeryItems", productId);
    const prodSnap = await getDoc(prodRef);

    if (!prodSnap.exists()) {
      // Log and skip missing products
      console.warn(`Product ${productId} not found`);
      continue;
    }

    const prodData = prodSnap.data();
    const newQuantity = (prodData.quantity || 0) - item.quantity;

    if (newQuantity < 0) {
      throw new Error(`Insufficient stock for product ${productId}`);
    }

    batch.update(prodRef, { quantity: newQuantity });
  }

  await batch.commit();
}
