import type { Metadata } from "next";
import { Geist, Geist_Mono, Bitter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bitter = Bitter({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Village Fresh — Home-made, straight from the village",
  description:
    "Authentic home-made podis, pickles, farm-fresh produce and snacks, delivered from the village to your door.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bitter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {children}
          <Footer />
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
