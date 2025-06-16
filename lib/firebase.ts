
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth"; // Uncomment if you need Auth
// import { getStorage } from "firebase/storage"; // Uncomment if you need Storage
// import { getAnalytics } from "firebase/analytics"; // Uncomment if you need Analytics

// Your web app's Firebase configuration from your Firebase project "gizigo-884bc"
const firebaseConfig = {
  apiKey: "AIzaSyDvovOhcat_OH3cmh5xphJmaqDva2oRMLo",
  authDomain: "gizigo-884bc.firebaseapp.com",
  projectId: "gizigo-884bc",
  storageBucket: "gizigo-884bc.firebasestorage.app",
  messagingSenderId: "385236295689",
  appId: "1:385236295689:web:565ab9924b403d409458d8",
  measurementId: "G-THNQK2S1R0" // measurementId is optional for basic Firestore
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  console.log("[Firebase] Initializing Firebase app with 'gizigo-884bc' config...");
  try {
    app = initializeApp(firebaseConfig);
    console.log("[Firebase] Firebase app 'gizigo-884bc' initialized successfully.");
  } catch (e: any) {
    console.error("[Firebase] Error initializing Firebase app:", e);
    // This is a critical error, the app might not function correctly.
    // Consider throwing the error or handling it in a way that alerts the user/developer
  }
} else {
  app = getApps()[0];
  console.log("[Firebase] Firebase app 'gizigo-884bc' already initialized.");
}

let db;
// Ensure app is initialized before trying to get Firestore instance
if (app!) { // The non-null assertion operator (!) assumes app will be initialized.
  try {
    db = getFirestore(app);
    console.log("[Firebase] Firestore initialized successfully for 'gizigo-884bc'.");
  } catch (e: any) {
    console.error("[Firebase] Error initializing Firestore:", e);
    // Firestore might not be usable if this fails.
  }
} else {
  console.error("[Firebase] Firebase app not initialized. Firestore cannot be accessed.");
}

// const analytics = getAnalytics(app); // Uncomment if you decide to use Analytics

// export { app, db, auth, storage, analytics }; // Adjust exports based on what you use
export { app, db };
