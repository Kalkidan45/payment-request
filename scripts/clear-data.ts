import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : '(default)'
);

async function clearData() {
  console.log('Clearing Firestore requisitions...');
  const reqsCol = collection(db, 'requisitions');
  const reqsSnap = await getDocs(reqsCol);
  for (const d of reqsSnap.docs) {
    await deleteDoc(d.ref);
    console.log(`Deleted requisition: ${d.id}`);
  }

  console.log('Clearing Firestore depositRequests...');
  const depCol = collection(db, 'depositRequests');
  const depSnap = await getDocs(depCol);
  for (const d of depSnap.docs) {
    await deleteDoc(d.ref);
    console.log(`Deleted depositRequest: ${d.id}`);
  }

  console.log('Resetting pettyCashFund to 0...');
  const fundRef = doc(db, 'pettyCashFund', 'main');
  await setDoc(fundRef, {
    id: 'fund-main',
    totalAllocated: 0,
    currentBalance: 0,
    monthAllocated: 0,
  });

  console.log('Successfully cleared all sample and entered data.');
  process.exit(0);
}

clearData().catch((err) => {
  console.error('Error clearing data:', err);
  process.exit(1);
});
