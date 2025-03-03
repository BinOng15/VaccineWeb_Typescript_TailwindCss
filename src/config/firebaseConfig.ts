// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC0S-7RJEpN1aJX_mITdrXfNlR3luJcWv4",
    authDomain: "pedivax.firebaseapp.com",
    projectId: "pedivax",
    storageBucket: "pedivax.firebasestorage.app",
    messagingSenderId: "813572069296",
    appId: "1:813572069296:web:315e828a1e356adf8b2875",
    measurementId: "G-DYWT1CV49Q"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const storage = getStorage(app);
const firestore = getFirestore(app);

export { auth, storage, analytics, firestore, ref, uploadBytes, getDownloadURL };
