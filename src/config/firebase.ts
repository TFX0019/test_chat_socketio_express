import * as admin from 'firebase-admin';
import serviceAccount from "../../anterra-c5faf-firebase-adminsdk-fbsvc-f36b254639.json";

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
    // projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export const messaging = admin.messaging();
// export const firestore = admin.firestore();
export default admin;