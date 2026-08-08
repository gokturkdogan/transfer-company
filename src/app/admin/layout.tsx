import { Geist, Geist_Mono } from "next/font/google";

import { adminCopy } from "@/features/admin/copy";

import "../globals.css";
import "./admin.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: adminCopy.brand.pageTitle,
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="admin-root min-h-full bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
