import type { Metadata } from "next";
import { Libre_Franklin, Oswald } from "next/font/google";
import "./globals.css";

const sans = Libre_Franklin({
  variable: "--font-libre",
  subsets: ["latin"],
});

const display = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UVA Games",
  description: "Upcoming Virginia Cavaliers games and recent results.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
