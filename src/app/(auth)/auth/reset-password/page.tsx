import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Choose a new password · VidVerse" };

// opened from the emailed link: /auth/reset-password?token=...
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <AuthCard
        title="This link is incomplete"
        footer={
          <Link
            href="/auth/login"
            className="font-medium text-brand-fg hover:underline"
          >
            Back to sign in
          </Link>
        }
      >
        <p className="text-sm text-fg-secondary">
          Open the link from the email again, or{" "}
          <Link
            href="/auth/forgot-password"
            className="font-medium text-brand-fg hover:underline"
          >
            request a new one
          </Link>
          .
        </p>
      </AuthCard>
    );
  }
  return <ResetPasswordForm token={token} />;
}
