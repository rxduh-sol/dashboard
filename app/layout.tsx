import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Preppy Dashboard",
  description: "Aesthetic Coding Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* !!! ADDED !bg-white HERE !!! */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased !bg-white`}
      >
        {children}
      </body>
    </html>
  );
}