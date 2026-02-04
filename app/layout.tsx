import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import SupabaseProvider from "@/lib/supabase/SupabaseProvider";
import "animate.css";

export const metadata: any = {
  title: "Taskify",
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
