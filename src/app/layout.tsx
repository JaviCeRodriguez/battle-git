import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import type { Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConsoleWarningFilter } from "@/components/console-warning-filter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl),
  title: {
    default: "Battle Git | Convierte tus repos en poder",
    template: "%s | Battle Git",
  },
  description:
    "Battle Git convierte tus repositorios y contribuciones en un army RPG para competir, subir de rango y hacer crecer tu poder como desarrollador.",
  applicationName: "Battle Git",
  authors: [{ name: "Battle Git" }],
  creator: "Battle Git",
  publisher: "Battle Git",
  keywords: [
    "Battle Git",
    "GitHub RPG",
    "juego para desarrolladores",
    "repositorios",
    "contribuciones",
    "programadores",
    "arena RPG",
    "developer game",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Battle Git | Convierte tus repos en poder",
    description:
      "Tus repositorios se convierten en unidades, tus contribuciones aumentan su fuerza y cada batalla te acerca a rivales más grandes.",
    url: "/",
    siteName: "Battle Git",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Battle Git | Convierte tus repos en poder",
    description:
      "Convierte tus repositorios y contribuciones en un army RPG para competir y subir de rango.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "game",
};

export const viewport: Viewport = {
  themeColor: "#08101a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ConsoleWarningFilter />
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
