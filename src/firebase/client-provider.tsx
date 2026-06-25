'use client';

import React, { useEffect, useState } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export const FirebaseClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [firebase, setFirebase] = useState<{
    firebaseApp: FirebaseApp;
    firestore: Firestore;
    auth: Auth;
  } | null>(null);

  useEffect(() => {
    const instances = initializeFirebase();
    setFirebase(instances);
  }, []);

  if (!firebase) {
    return null; // Or a loading spinner
  }

  return (
    <FirebaseProvider
      firebaseApp={firebase.firebaseApp}
      firestore={firebase.firestore}
      auth={firebase.auth}
    >
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
};
