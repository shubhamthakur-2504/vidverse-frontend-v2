import Link from "next/link";
import { Clapperboard } from "lucide-react";

// the one layout for every auth screen (UI guide 6.5): a centred 400px card on the plain background
export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 pb-10 pt-24">
      <div className="w-full max-w-[400px]">
        <div className="rounded-lg border border-line bg-surface p-6 sm:p-8">
          <Link
            href="/"
            className="mb-6 flex items-center gap-2 text-fg"
            aria-label="VidVerse home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white">
              <Clapperboard
                className="h-4 w-4"
                strokeWidth={1.75}
                aria-hidden
              />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              VidVerse
            </span>
          </Link>
          <h2 className="text-xl font-semibold tracking-tight text-fg">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-fg-secondary">{description}</p>
          )}
          <div className="mt-6">{children}</div>
        </div>
        {footer && (
          <p className="mt-6 text-center text-sm text-fg-secondary">{footer}</p>
        )}
      </div>
    </div>
  );
}

// a server or validation error shown above the submit button (not as a toast)
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
    >
      {message}
    </p>
  );
}
