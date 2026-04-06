import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/app/components/Navbar";
import { AppProvider } from "@/app/context/AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Learning Style Analyzer",
  description: "AI-based platform to analyze and improve study patterns",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <AppProvider>
            <Navbar />
            <main className="min-h-screen bg-background text-foreground pt-20">
              {children}
            </main>
          </AppProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
