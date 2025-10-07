// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3Z9cN0mj1GNjVTQYzc6Pymdn1VV_BPTY",
  authDomain: "properview-73521.firebaseapp.com",
  projectId: "properview-73521",
  storageBucket: "properview-73521.firebasestorage.app",
  messagingSenderId: "367395901525",
  appId: "1:367395901525:web:3b53ceafec772ca46604dc",
  measurementId: "G-533V819MXS"
};

// Initialize Firebase
const app = !getApps.length? initializeApp(firebaseConfig): getApp();//checks made
// const analytics = getAnalytics(app);

//exporting the auth as well as db. so our client side sdk is done now
export const auth = getAuth(app)
export const db = getFirestore(app)
// so we've initialized both the admin as well as client side functionalities
//admin functionalities allow us to perform some mutations on the server side as it is considered to be much more secure as we're making calls from the server.
//and then in client we still have some permissions but they're much more limited than admin

//anyways we're initializing both and we're giving acces to both auth and db functionalities so we can use them later on.
//read more about these in the docs...
//now the next thing we'll do is hook these functionalities with the auth ui's that we've created to make them actually functional