import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import SupabaseProvider from "@/lib/supabase/SupabaseProvider";

export const metadata: any = {
  title: "Taskfiy App",
  description: "Create and manage tasks with Taskify",
  icon: "/icon.png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <SupabaseProvider>{children}</SupabaseProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
