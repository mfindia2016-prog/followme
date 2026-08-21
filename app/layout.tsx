import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MF India CRM",
  description: "Lead and follow-up CRM for MF India"
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}