import firebase from 'firebase'
require('@firebase/firestore')
// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBtpSt80SBVnrMnmc1JbRFX6juGXGDtlCo",
    authDomain: "wily-68c26.firebaseapp.com",
    databaseURL: "https://wily-68c26.firebaseio.com",
    projectId: "wily-68c26",
    storageBucket: "wily-68c26.appspot.com",
    messagingSenderId: "429975083859",
    appId: "1:429975083859:web:b552c1efd636437a9e5fa6"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore()