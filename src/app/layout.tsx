import type { Metadata } from "next";
import "./globals.css";
import AppProvider from "@/providers/app-provider";
import { Toaster } from "sonner";

import { Poppins } from "next/font/google";

const propinse = Poppins({
  variable: "--font-poppins",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SideQuote",
  description: "Connect with verified electricians, plumbers, HVAC technicians, roofers, and more in your area.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${propinse.className} antialiased`}>
        <AppProvider>{children}</AppProvider>
        <Toaster />
      </body>
    </html>
  );
}
