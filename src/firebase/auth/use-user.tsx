'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../provider';
import { firebaseConfig } from '../config';

// A mock User class structure to mirror the Firebase User type
class MockUser implements Partial<User> {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;

  constructor(email: string, displayName?: string) {
    this.uid = `mock-user-${email.replace(/[@.]/g, '-')}`;
    this.email = email;
    this.displayName = displayName || email.split('@')[0];
    this.photoURL = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`;
    this.emailVerified = true;
    this.isAnonymous = false;
  }
}

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isPlaceholder = firebaseConfig.apiKey === 'placeholder-api-key' || !firebaseConfig.apiKey;

    if (isPlaceholder) {
      const checkMockUser = () => {
        const stored = localStorage.getItem('mock_user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setUser(new MockUser(parsed.email, parsed.displayName) as User);
          } catch (e) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      };

      checkMockUser();

      // Listen for updates from other tabs/windows
      window.addEventListener('storage', checkMockUser);
      // Listen for custom event within the same tab
      window.addEventListener('mock-auth-change', checkMockUser);

      return () => {
        window.removeEventListener('storage', checkMockUser);
        window.removeEventListener('mock-auth-change', checkMockUser);
      };
    }

    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}

