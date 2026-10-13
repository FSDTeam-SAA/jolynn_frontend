import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "react-quill/dist/quill.snow.css";
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HV6GTG0H48"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HV6GTG0H48');
          `}
        </Script>
        <AppProvider>{children}</AppProvider>
        <Toaster />
      </body>
    </html>
  );
}
