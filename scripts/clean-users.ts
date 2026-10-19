import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : '(default)'
);

async function cleanDuplicateUsers() {
  console.log('Checking users collection in Firestore...');
  const usersCol = collection(db, 'users');
  const snap = await getDocs(usersCol);

  const seenUsernames = new Map<string, string>(); // username -> docId to keep

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const username = (data.username || '').toLowerCase().trim();
    if (!username) continue;

    // Keep default core users (usr-1, usr-2, usr-3) or first encountered
    if (username === 'almaz' || username === 'bethelhem' || username === 'solomon') {
      console.log(`Core user preserved: ${username} (${docSnap.id})`);
      continue;
    }

    if (seenUsernames.has(username)) {
      // Duplicate found! Delete it.
      await deleteDoc(docSnap.ref);
      console.log(`Deleted duplicate user: ${username} (ID: ${docSnap.id})`);
    } else {
      seenUsernames.set(username, docSnap.id);
      console.log(`Kept unique user: ${username} (ID: ${docSnap.id})`);
    }
  }

  console.log('User duplicate cleanup completed successfully.');
  process.exit(0);
}

cleanDuplicateUsers().catch((err) => {
  console.error('Error cleaning duplicate users:', err);
  process.exit(1);
});
