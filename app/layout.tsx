import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
        <main className="min-h-screen bg-gray-50">
          <nav className="bg-blue-600 text-white p-4">
            <div className="container mx-auto">
              <h1 className="text-2xl font-bold">⚡ Lightning Tricount</h1>
            </div>
          </nav>
          <div className="container mx-auto p-4">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}