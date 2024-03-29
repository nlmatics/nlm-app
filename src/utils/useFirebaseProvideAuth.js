import { useState, useEffect } from 'react';
import * as firebase from 'firebase/app';
import 'firebase/auth';

// Add your Firebase credentials
firebase.initializeApp({
  apiKey: 'AIzaSyB0rStxnkSYkrC_kdQ7Fd2UPSm0krlmgCk',
  authDomain: 'nlmatics.firebaseapp.com',
  databaseURL: 'https://nlmatics.firebaseio.com',
  projectId: 'nlmatics',
  storageBucket: 'nlmatics.appspot.com',
  messagingSenderId: '770270549819',
  appId: '1:770270549819:web:874061ed09c06797b6891e',
  measurementId: 'G-LFW4H6D5LC',
});

// Provider Hook that creates auth object and handles state
export function useFirebaseProvideAuth() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(!user);
  const signUp = (email, password) => {
    return firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(response => {
        setUser(response.user);
        return response.user;
      });
  };

  const signIn = (email, password) => {
    return firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(response => {
        setUser(response.user);
        return response.user;
      });
  };

  const signOut = () => {
    return firebase
      .auth()
      .signOut()
      .then(() => {
        setUser(false);
      });
  };

  const sendPasswordResetEmail = email => {
    return firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        return true;
      });
  };

  const confirmPasswordReset = (code, password) => {
    return firebase
      .auth()
      .confirmPasswordReset(code, password)
      .then(() => {
        return true;
      });
  };

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (user) {
        setUser(user);
      } else {
        setUser(false);
      }
      setInitializing(false);
    });
    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  return {
    user,
    initializing,
    signIn,
    signUp,
    signOut,
    sendPasswordResetEmail,
    confirmPasswordReset,
  };
}
