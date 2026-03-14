"use client";

import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User
} from "firebase/auth";
import { create } from "zustand";

import { getFirebaseAuth, googleProvider, hasFirebaseConfig } from "@/lib/firebase";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated" | "unavailable";
type AuthMode = "signin" | "signup";

type AuthState = {
  busy: boolean;
  error: string | null;
  hasConfig: boolean;
  initialized: boolean;
  mode: AuthMode;
  status: AuthStatus;
  user: User | null;
  clearError: () => void;
  initialize: () => () => void;
  setMode: (mode: AuthMode) => void;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  signInWithGoogle: (remember: boolean) => Promise<void>;
  signOutUser: () => Promise<void>;
  signUp: (name: string, email: string, password: string, remember: boolean) => Promise<void>;
};

function humanizeAuthError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Authentication failed. Please try again.";
  }

  const message = error.message.toLowerCase();

  if (message.includes("invalid-credential") || message.includes("wrong-password") || message.includes("user-not-found")) {
    return "Those credentials do not match an account.";
  }

  if (message.includes("email-already-in-use")) {
    return "That email is already being used for another account.";
  }

  if (message.includes("weak-password")) {
    return "Use a stronger password with at least 6 characters.";
  }

  if (message.includes("popup")) {
    return "The Google sign-in popup was closed before completion.";
  }

  return "Authentication failed. Please try again.";
}

async function applyPersistence(remember: boolean) {
  const auth = getFirebaseAuth();

  if (!auth) {
    throw new Error("Firebase auth is not configured.");
  }

  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  return auth;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  busy: false,
  error: null,
  hasConfig: hasFirebaseConfig(),
  initialized: false,
  mode: "signin",
  status: hasFirebaseConfig() ? "idle" : "unavailable",
  user: null,
  clearError: () => set({ error: null }),
  setMode: (mode) => set({ mode, error: null }),
  initialize: () => {
    const auth = getFirebaseAuth();

    if (!hasFirebaseConfig() || !auth) {
      set({ initialized: true, status: "unavailable" });
      return () => undefined;
    }

    if (get().initialized) {
      return () => undefined;
    }

    set({ initialized: true, status: "loading" });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ busy: false, error: null, status: user ? "authenticated" : "unauthenticated", user });
    });

    return unsubscribe;
  },
  signIn: async (email, password, remember) => {
    set({ busy: true, error: null });

    try {
      const auth = await applyPersistence(remember);
      await signInWithEmailAndPassword(auth, email, password);
      set({ busy: false });
    } catch (error) {
      set({ busy: false, error: humanizeAuthError(error) });
    }
  },
  signUp: async (name, email, password, remember) => {
    set({ busy: true, error: null });

    try {
      const auth = await applyPersistence(remember);
      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) {
        await updateProfile(credentials.user, { displayName: name.trim() });
      }
      set({ busy: false });
    } catch (error) {
      set({ busy: false, error: humanizeAuthError(error) });
    }
  },
  signInWithGoogle: async (remember) => {
    set({ busy: true, error: null });

    try {
      const auth = await applyPersistence(remember);
      await signInWithPopup(auth, googleProvider);
      set({ busy: false });
    } catch (error) {
      set({ busy: false, error: humanizeAuthError(error) });
    }
  },
  signOutUser: async () => {
    const auth = getFirebaseAuth();

    if (!auth) {
      return;
    }

    await signOut(auth);
    set({ user: null, status: "unauthenticated" });
  }
}));
