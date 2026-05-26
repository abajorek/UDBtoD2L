import type { Metadata } from "next";
import { Press_Start_2P, IM_Fell_DW_Pica } from "next/font/google";
import "./globals.css";

const pixel = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
  display: "swap",
});

const body = IM_Fell_DW_Pica({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Oregon Trail Trip Planner — Grand Junction to Titusville",
  description:
    "An Oregon Trail-themed road trip planner for one specific trip: 2011 Tahoe + 2019 Odyssey from Grand Junction, CO to Titusville, PA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${pixel.variable} ${body.variable}`}>
      <body className="min-h-screen font-body">{children}</body>
    </html>
  );
}
