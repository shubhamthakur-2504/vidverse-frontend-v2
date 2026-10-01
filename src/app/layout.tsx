import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VidVerse - Share Your Story",
  description: "A modern video streaming platform built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // next-themes swaps the class on <html> before the first paint, which the
    // server render cannot know about
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            {/* bottom-left on desktop keeps toasts clear of the header actions;
                they centre on phones, above the tab bar */}
            <Toaster
              richColors
              position="bottom-left"
              mobileOffset={{ bottom: "84px" }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
