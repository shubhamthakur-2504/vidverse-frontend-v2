import Link from "next/link";
import { Play } from "lucide-react";

// A bare, centred page. The shell's navigation would only distract from the
// one thing these screens ask for (UI guide section 6.5).
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-sm text-fg"
        aria-label="VidVerse home"
      >
        <span className="flex size-8 items-center justify-center rounded-md bg-brand">
          <Play className="size-4 fill-white text-white" aria-hidden />
        </span>
        <span className="text-xl leading-7 font-semibold tracking-tight">
          VidVerse
        </span>
      </Link>
      {children}
    </div>
  );
}
