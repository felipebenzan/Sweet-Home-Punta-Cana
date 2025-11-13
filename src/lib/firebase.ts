import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAhOZfzaFBe0GsXa170eJO4ILJcS5AmV7Q",
  authDomain: "punta-cana-stays.firebaseapp.com",
  projectId: "punta-cana-stays",
  storageBucket: "punta-cana-stays.appspot.com",
  messagingSenderId: "95102335388",
  appId: "1:95102335388:web:f8a7004b8a84ce2a22f059",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);