"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthCard, FormError } from "@/components/auth/AuthCard";
import authApi from "@/lib/api/client/authApi";
import { getApiErrorMessage } from "@/lib/apiErrorMessage";
import {
  buttonPrimary,
  fieldInput,
  fieldLabel,
} from "@/components/studio/styles";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim())
      return setError("Enter the email address you signed up with.");
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSentTo(email.trim());
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Couldn't send the email. Try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const backToSignIn = (
    <Link
      href="/auth/login"
      className="font-medium text-brand-fg hover:underline"
    >
      Back to sign in
    </Link>
  );

  if (sentTo) {
    return (
      <AuthCard title="Check your email" footer={backToSignIn}>
        {/* the same message whether or not the address has an account */}
        <p className="text-sm text-fg-secondary">
          If an account uses{" "}
          <span className="font-medium text-fg">{sentTo}</span>, we&apos;ve sent
          it a link to reset the password. The link works for 1 hour.
        </p>
        <button
          type="button"
          onClick={() => setSentTo(null)}
          className="mt-4 text-sm font-medium text-brand-fg hover:underline"
        >
          Use a different email
        </button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email and we'll send you a link to choose a new password."
      footer={backToSignIn}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className={fieldLabel}>
            Email
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
            className={`${fieldInput} h-10`}
          />
        </div>
        <FormError message={error} />
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${buttonPrimary} h-10 w-full`}
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </AuthCard>
  );
}
