import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import "./globals.css";

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Retro Terminal Chat",
  description: "A retro terminal-style AI chat application with CRT effects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${firaCode.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
