import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "WhosePic — find every photo of anyone",
  description: "Upload photos, label faces once, and search every image a person appears in.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
