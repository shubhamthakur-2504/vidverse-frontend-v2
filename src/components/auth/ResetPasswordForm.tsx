"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthCard, FormError } from "@/components/auth/AuthCard";
import { PasswordField } from "@/components/auth/PasswordField";
import authApi from "@/lib/api/client/authApi";
import { getApiErrorMessage } from "@/lib/apiErrorMessage";
import { buttonPrimary } from "@/components/studio/styles";

export function ResetPasswordForm({ token }: { token: string }) {
  const { refreshUser } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The passwords don't match.");
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      // every device was signed out, this one included
      await refreshUser();
      setDone(true);
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(err, "Couldn't reset your password. Try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return (
      <AuthCard title="Password updated">
        <p className="text-sm text-fg-secondary">
          You&apos;ve been signed out on every device. Sign in with your new
          password.
        </p>
        <Link
          href="/auth/login"
          className={`${buttonPrimary} mt-6 h-10 w-full`}
        >
          Sign in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choose a new password"
      description="You'll be signed out on all your devices."
      footer={
        <Link
          href="/auth/forgot-password"
          className="font-medium text-brand-fg hover:underline"
        >
          Request a new link
        </Link>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <PasswordField
          id="password"
          label="New password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          showStrength
          autoFocus
        />
        <PasswordField
          id="confirm"
          label="Confirm new password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
        <FormError message={error} />
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${buttonPrimary} h-10 w-full`}
        >
          {isSubmitting ? "Saving..." : "Set new password"}
        </button>
      </form>
    </AuthCard>
  );
}
