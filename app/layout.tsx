import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { ApolloAppProvider } from "@/components/providers/apollo-provider";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: {
    default: "Gombe Services — Find Trusted Local Artisans",
    template: "%s | Gombe Services",
  },
  description:
    "Connect with skilled artisans, mechanics, tailors, electricians and local businesses across Gombe State, Nigeria.",
  keywords: ["Gombe", "Nigeria", "artisans", "services", "local business"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FAFAF8] text-zinc-900 antialiased font-sans">
        <ApolloAppProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster position="bottom-right" richColors />
        </ApolloAppProvider>
      </body>
    </html>
  );
}
