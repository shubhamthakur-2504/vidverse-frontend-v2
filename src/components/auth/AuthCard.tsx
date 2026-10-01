// the one layout for every auth screen (UI guide 6.5): a 400px card on the
// plain background. The (auth) route group centres it and puts the logo above.
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
    <div className="w-full max-w-100">
      <div className="rounded-lg border border-line bg-surface p-6 sm:p-8">
        <h1 className="text-xl font-semibold tracking-tight text-fg">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-fg-secondary">{description}</p>
        )}
        <div className="mt-6">{children}</div>
      </div>
      {footer && (
        <p className="mt-6 text-center text-sm text-fg-secondary">{footer}</p>
      )}
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
