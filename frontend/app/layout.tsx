import type { Metadata } from "next";
import { Fraunces, Source_Serif_4, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", weight: ["400", "700", "900"] });
const body = Source_Serif_4({ subsets: ["latin"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500", "600"] });
const ui = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-ui", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: "blog_tech — expériences Claude Code",
  description: "Tests, problèmes, solutions — parfois en 3D.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable} ${mono.variable} ${ui.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('bt-theme');if(t==='light')document.documentElement.dataset.theme='light';}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
