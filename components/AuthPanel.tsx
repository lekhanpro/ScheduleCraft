"use client";

import { useMemo, useState } from "react";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  updateProfile
} from "firebase/auth";
import { ArrowRight, Lock, Mail, Sparkles, User2 } from "lucide-react";

import { getFirebaseAuth, getFirebaseConfigMissingKeys, googleProvider, hasFirebaseConfig } from "@/lib/firebase";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";

type AuthPanelProps = {
  onContinuePreview?: () => void;
};

function getAuthErrorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error && typeof (error as { code?: unknown }).code === "string") {
    return (error as { code: string }).code.toLowerCase();
  }

  if (error instanceof Error) {
    const match = error.message.toLowerCase().match(/auth\/[a-z-]+/);
    return match?.[0] ?? "";
  }

  return "";
}

function humanizeAuthError(error: unknown, host: string) {
  const code = getAuthErrorCode(error);
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found") || message.includes("invalid-credential") || message.includes("wrong-password") || message.includes("user-not-found")) {
    return "Those credentials do not match an account.";
  }

  if (code.includes("email-already-in-use") || message.includes("email-already-in-use")) {
    return "That email is already being used for another account.";
  }

  if (code.includes("weak-password") || message.includes("weak-password")) {
    return "Use a stronger password with at least 6 characters.";
  }

  if (code.includes("operation-not-allowed")) {
    return "Google sign-in is not enabled in Firebase yet. Enable the Google provider in Firebase Console > Authentication > Sign-in method.";
  }

  if (code.includes("unauthorized-domain")) {
    return `This domain is not authorized for Firebase Google sign-in. Add ${host} in Firebase Console > Authentication > Settings > Authorized domains.`;
  }

  if (code.includes("popup-closed-by-user")) {
    return "The Google popup was closed before sign-in completed.";
  }

  if (code.includes("popup-blocked")) {
    return "The Google popup was blocked by the browser. Redirect sign-in is being attempted instead.";
  }

  if (code.includes("network-request-failed")) {
    return "Firebase could not reach the authentication service. Check your network connection and try again.";
  }

  return "Authentication failed. Please try again.";
}

export function AuthPanel({ onContinuePreview }: AuthPanelProps) {
  const host = typeof window !== "undefined" ? window.location.host : "your deployed domain";
  const hasConfig = hasFirebaseConfig();
  const missingKeys = useMemo(() => getFirebaseConfigMissingKeys(), []);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  async function applyPersistence() {
    const auth = getFirebaseAuth();

    if (!auth) {
      throw new Error("Firebase auth is not configured.");
    }

    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    return auth;
  }

  async function handleSubmit() {
    if (!hasConfig) {
      setError("Add the Firebase public environment variables to enable authentication.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const auth = await applyPersistence();

      if (mode === "signup") {
        const credentials = await createUserWithEmailAndPassword(auth, email.trim(), password);

        if (name.trim()) {
          await updateProfile(credentials.user, { displayName: name.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (nextError) {
      setError(humanizeAuthError(nextError, host));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    if (!hasConfig) {
      setError("Add the Firebase public environment variables to enable Google sign-in.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const auth = await applyPersistence();
      await signInWithPopup(auth, googleProvider);
    } catch (nextError) {
      const auth = getFirebaseAuth();
      const code = getAuthErrorCode(nextError);

      if (auth && (code.includes("popup-blocked") || code.includes("cancelled-popup-request") || code.includes("operation-not-supported-in-this-environment"))) {
        try {
          setError("The Google popup was blocked. Redirecting to Google sign-in instead...");
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectError) {
          setError(humanizeAuthError(redirectError, host));
          return;
        }
      }

      setError(humanizeAuthError(nextError, host));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 md:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="glass-panel relative overflow-hidden rounded-[36px] p-8 md:p-10 lg:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_30%)]" />
          <div className="relative">
            <p className="section-kicker">Secure Planner</p>
            <h1 className="headline-gradient mt-5 max-w-2xl text-5xl font-bold leading-[0.92] md:text-6xl">A schedule cockpit that feels modern in both dark and light mode.</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-soft md:text-base">
              Sign in to keep schedules separate per account on this browser, or use preview mode when you are styling or testing without Firebase credentials.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="panel-muted rounded-[24px] p-4">
                <p className="text-sm font-semibold text-main">Private local workspace</p>
                <p className="mt-2 text-sm leading-6 text-soft">Each signed-in user gets an isolated local planner namespace.</p>
              </div>
              <div className="panel-muted rounded-[24px] p-4">
                <p className="text-sm font-semibold text-main">Conflict-first analysis</p>
                <p className="mt-2 text-sm leading-6 text-soft">Real-time overlap detection, study windows, and workload scoring stay live.</p>
              </div>
              <div className="panel-muted rounded-[24px] p-4">
                <p className="text-sm font-semibold text-main">Preview-safe setup</p>
                <p className="mt-2 text-sm leading-6 text-soft">No backend is required to explore the UI while you wire Firebase.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <span className="metric-chip">Firebase Auth</span>
              <span className="metric-chip">Google Sign-In</span>
              <span className="metric-chip">Email + Password</span>
            </div>
          </div>
        </section>

        <section className="glass-panel-strong rounded-[36px] p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-kicker">Firebase Auth</p>
              <h2 className="mt-2 text-3xl font-bold text-main">{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
              <p className="mt-2 text-sm leading-6 text-soft">Use email/password or Google sign-in to unlock your personal planning workspace.</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/15 text-accent shadow-[0_14px_40px_rgba(79,70,229,0.22)]">
              <Sparkles className="h-5 w-5" />
            </span>
          </div>

          <div className="mt-5 inline-flex rounded-full border surface-outline bg-foreground/[0.04] p-1">
            {(["signin", "signup"] as const).map((entry) => (
              <button
                key={entry}
                type="button"
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150",
                  mode === entry ? "bg-foreground text-background" : "text-muted hover:text-foreground"
                )}
                onClick={() => {
                  setMode(entry);
                  setError(null);
                }}
              >
                {entry === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {!hasConfig ? (
            <div className="mt-6 rounded-[24px] border border-amber/20 bg-amber/10 p-4 text-sm text-amber">
              <p className="font-semibold">Firebase config is missing.</p>
              <p className="mt-2 leading-6">Add these public env keys before using authentication:</p>
              <ul className="mt-3 space-y-1 font-mono text-[12px] leading-5 text-amber/90">
                {missingKeys.map((key) => (
                  <li key={key}>{key}</li>
                ))}
              </ul>
              {onContinuePreview ? (
                <button type="button" className="button-secondary mt-4" onClick={onContinuePreview}>
                  Continue in Preview Mode
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            {mode === "signup" ? (
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-soft">Name</span>
                <div className="relative">
                  <User2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-tone" />
                  <input className="field-shell pl-11" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
                </div>
              </label>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-soft">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-tone" />
                <input className="field-shell pl-11" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-soft">Password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-tone" />
                <input className="field-shell pl-11" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
              </div>
            </label>

            <label className="inline-flex items-center gap-3 text-sm text-soft">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 rounded border border-border/30 bg-transparent" />
              Keep me signed in on this device
            </label>

            {error ? <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div> : null}

            <button type="button" className="button-primary w-full" onClick={handleSubmit} disabled={busy}>
              {busy ? "Working..." : mode === "signin" ? "Sign In" : "Create Account"}
              <ArrowRight className="h-4 w-4" />
            </button>

            <button type="button" className="button-secondary w-full" onClick={handleGoogle} disabled={busy || !hasConfig}>
              Continue with Google
            </button>

            <p className="text-xs leading-6 text-muted-tone">
              If Google sign-in fails on a Vercel domain, enable the Google provider and add <span className="font-mono text-main">{host}</span> to Firebase Auth authorized domains.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
