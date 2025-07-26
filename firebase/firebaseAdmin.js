import admin from 'firebase-admin';
import path from 'path';

if (!admin.apps.length) {
  const serviceAccountPath = path.resolve('./secrets/bakery-toshankanwar-website-firebase-adminsdk-fbsvc-519e7fdf2a.json'); // adjust path to your location

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    // Optional: databaseURL, storageBucket, etc.
  });
}

const db = admin.firestore();

export { admin, db };
