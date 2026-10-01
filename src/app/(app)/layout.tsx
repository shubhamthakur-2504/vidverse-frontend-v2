import { AppShell } from "@/components/layout/AppShell";

// Everything except the auth screens renders inside the shell, so no page
// needs its own top padding or container.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
