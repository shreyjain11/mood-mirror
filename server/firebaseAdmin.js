import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import fs from 'fs';

let serviceAccount;
if (process.env.NODE_ENV === 'production') {
  // In production (Render), use the secret file
  serviceAccount = JSON.parse(
    fs.readFileSync('/opt/render/project/src/serviceAccountKey.json')
  );
} else {
  // In development, use local file
  serviceAccount = JSON.parse(
    fs.readFileSync(new URL('../serviceAccountKey.json', import.meta.url))
  );
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export { getAdminAuth }; 