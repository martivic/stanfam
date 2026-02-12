import { getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBgmCvgD5yuYj98V2D6FYGEM900bF3sbLA",
  authDomain: "stanfamco.firebaseapp.com",
  projectId: "stanfamco",
  storageBucket: "stanfamco.firebasestorage.app",
  messagingSenderId: "807877192125",
  appId: "1:807877192125:web:1ff40b4f7adfc4eb948ad4"

};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export default app;
