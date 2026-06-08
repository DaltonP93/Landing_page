import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import siteData from "@/data/site.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const { name, slogan, description } = siteData.company;

export const metadata: Metadata = {
  title: `${name} — Software Empresarial Hecho en Paraguay`,
  description,
  keywords: [
    "software empresarial paraguay",
    "sistema de asistencia",
    "RRHH paraguay",
    "control biométrico",
    "gestión de comedores",
    "videovigilancia",
    "sistema de turnos",
    "facturación electrónica paraguay",
  ],
  openGraph: {
    title: `${name} — Software Empresarial`,
    description: slogan,
    type: "website",
    locale: "es_PY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
