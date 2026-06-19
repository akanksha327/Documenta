import type { Metadata } from "next";
import {
  Alex_Brush,
  Geist,
  Geist_Mono,
  Great_Vibes,
  Herr_Von_Muellerhoff,
  Playball,
  Sacramento,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthInitializer } from "@/components/auth-initializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  weight: "400",
  variable: "--font-great-vibes",
  subsets: ["latin"],
});

const alexBrush = Alex_Brush({
  weight: "400",
  variable: "--font-alex-brush",
  subsets: ["latin"],
});

const sacramento = Sacramento({
  weight: "400",
  variable: "--font-sacramento",
  subsets: ["latin"],
});

const playball = Playball({
  weight: "400",
  variable: "--font-playball",
  subsets: ["latin"],
});

const herrVonMuellerhoff = Herr_Von_Muellerhoff({
  weight: "400",
  variable: "--font-herr-von-muellerhoff",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SignFlow - Document Signing Platform",
  description: "Professional document signing and management for HR teams, legal teams, and businesses.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${greatVibes.variable} ${alexBrush.variable} ${sacramento.variable} ${playball.variable} ${herrVonMuellerhoff.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="signflow-theme"
        >
          <AuthInitializer>
            {children}
          </AuthInitializer>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
