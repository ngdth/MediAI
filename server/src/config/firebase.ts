import admin from "firebase-admin";
import * as serviceAccount from "../../firebase-service-account.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: "amma-ea88c.firebasestorage.app", // Thay thế bằng đúng tên bucket của bạn
});

const bucket = admin.storage().bucket();
export default bucket;
