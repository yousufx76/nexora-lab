import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyA_S9jaXIEVGEQm3jGJfZxPjtbZHkQ1K_w",
  authDomain: "nexora-lab.firebaseapp.com",
  projectId: "nexora-lab",
  storageBucket: "nexora-lab.firebasestorage.app",
  messagingSenderId: "1071006517381",
  appId: "1:1071006517381:web:0b7b633312411cbefe81ec",
  measurementId: "G-TDD7P120MH"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)