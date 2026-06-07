import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "StackMart - Web3 ecommerce for creators and developers",
  description: " StackMart is a secured and open-source ecommerce platform for web3 sellers , creators and developers to create, manage and sell digital products powered by blockchain technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}