import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Volunti",
  description: "Coordinación de ayuda humanitaria entre fundaciones",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // respeta safe-area en móviles
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <header className="border-b px-4 py-3">
            <span className="text-lg font-semibold">Volunti</span>
          </header>
          {/* Punto de extensión: aquí va el sidebar en desktop (checkpoint futuro) */}
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
            {children}
          </main>
          {/* Punto de extensión: aquí va la bottom nav móvil (checkpoint futuro) */}
        </div>
      </body>
    </html>
  );
}
