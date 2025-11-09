import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "cesium-navigation-es6/dist/styles/cesium-navigation.css";
import { Providers } from './providers';
import { AppThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital Twin Geotechnical",
  description: "Geotechnical monitoring and analytics dashboard",
  // 1. Remove the simple 'icon' property
  // 2. Use the 'icons' object to define an array of icons
  icons: {
    icon: [
      {
        // Favicon for Light Mode (The default, dark logo)
        url: "/logo/DTG/logo.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        // Favicon for Dark Mode (The light/white logo)
        url: "/logo/DTG/logo_white.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* FIX: Removed 'bg-black' and 'text-white'. 
        The 'antialiased' class is fine.
        The font variables are perfect.
      */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AppThemeProvider>
            <Providers>
              {children}
            </Providers>
          </AppThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}