import type { Metadata } from "next";
import {
  Fraunces,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
} from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "ListaMercado",
  description:
    "Lista compartida y persistente para compras del supermercado, con enlace secreto y productos de texto libre.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[color:var(--background)] font-sans text-[color:var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
