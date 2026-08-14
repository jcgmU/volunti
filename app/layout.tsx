import type { Metadata, Viewport } from "next";
import { Poppins, Lato } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const lato = Lato({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Volunti",
  description: "Plataforma de coordinación de ayuda humanitaria: conecta fundaciones, voluntarios y personas en emergencias.",
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
        className={`${poppins.variable} ${lato.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
