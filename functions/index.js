const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.reduceBakeryStockOnOrder = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const orderData = snap.data();
    const items = orderData.items || [];

    for (const item of items) {
      const itemId = item.productId || item.id;
      const itemRef = admin.firestore().collection('bakeryItems').doc(itemId);

      await admin.firestore().runTransaction(async (transaction) => {
        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists) return;
        const currentQty = itemDoc.data().quantity || 0;
        const toReduce = item.quantity || 1;
        const newQty = Math.max(0, currentQty - toReduce);
        transaction.update(itemRef, { quantity: newQty });
      });
    }
    return null;
  });