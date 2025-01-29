import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import UserMenu from "@/components/UserMenu";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lightning Tricount",
  description: "Split expenses with your friends using Bitcoin Lightning Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <main className="min-h-screen bg-gray-50">
            <nav className="bg-blue-600 text-white p-4">
              <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold hover:text-blue-100">
                  ⚡ Lightning Tricount
                </Link>
                <UserMenu />
              </div>
            </nav>
            <div className="container mx-auto p-4">
              {children}
            </div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}