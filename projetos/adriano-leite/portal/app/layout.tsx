import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { Abas, NavTopo } from "@/componentes/Navegacao";

export const metadata: Metadata = {
  title: "Gabinete",
  description: "Mensagens, pendências e agenda do Adriano Leite em um só lugar.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icone.svg" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0f11" },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&family=IBM+Plex+Sans:wght@400;500;600&family=Newsreader:opsz,wght@6..72,500&display=swap"
        />
      </head>
      <body>
        <div className="casca">
          <header className="topo">
            <div className="topo-inner">
              <Link href="/" className="marca">Gabinete<small>Adriano Leite</small></Link>
              <NavTopo />
            </div>
          </header>
          <main className="conteudo">{children}</main>
          <Abas />
        </div>
      </body>
    </html>
  );
}
