"use client";

import { AuthPanel } from "@/components/AuthPanel";

type AuthGateProps = {
  children: React.ReactNode;
  status: "idle" | "loading" | "authenticated" | "unauthenticated" | "unavailable";
  onContinuePreview?: () => void;
};

export function AuthGate({ children, status, onContinuePreview }: AuthGateProps) {
  if (status === "authenticated") {
    return <>{children}</>;
  }

  return <AuthPanel onContinuePreview={onContinuePreview} />;
}
