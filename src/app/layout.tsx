import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "PDF Merger | Merge PDFs in your browser",
  description: "Privacy-focused PDF merger. All processing happens in your browser.",
  manifest: "/manifest.webmanifest",
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="w-full border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
              <span className="text-sm font-semibold text-foreground">
                PDF / Word Merger
              </span>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 flex flex-col items-center justify-center">
            {children}
          </main>
        </div>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
