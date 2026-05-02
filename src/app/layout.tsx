import type { Metadata } from "next";
import {
  Montserrat,
  Source_Code_Pro,
  Source_Serif_4,
} from "next/font/google";

import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Cafe Management System",
    template: "%s | Cafe Management System",
  },
  description:
    "Multi-role platform for running a cafe chain: POS, inventory, branch operations, and global oversight.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${sourceSerif.variable} ${sourceCodePro.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
