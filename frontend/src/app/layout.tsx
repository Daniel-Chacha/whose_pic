import "./globals.css";
import type { ReactNode } from "react";
import { DM_Sans, Lora } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata = {
  title: "WhosePic — find every photo of anyone",
  description:
    "Upload photos, label faces once, and find every picture a person appears in — entirely in your browser. Nothing is uploaded or stored.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${lora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
