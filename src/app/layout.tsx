import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "TOLS Platform — Casino Management",
  description: "Comprehensive casino management platform with Waterfall Protocol, Escrow Engine, Player Intelligence, and AI Tutor.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="en" className="dark" suppressHydrationWarning>
    <body className="antialiased bg-background text-foreground">
      {children}
      <Toaster richColors position="top-right" />
    </body>
    </html>
  );
}
