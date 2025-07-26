import admin from 'firebase-admin';

console.log("PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
console.log("CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
console.log("PRIVATE_KEY length:", process.env.FIREBASE_PRIVATE_KEY?.length);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace literal "\n" with actual line breaks in the private key string
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    // Optionally add databaseURL or storageBucket here if used
    // databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.firestore();

export { admin, db };
