import type { Metadata } from "next";
import { GlobalToast } from "@/components/shared/GlobalToast";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoVoyage | Shared Discovery",
  description:
    "CoVoyage is an AI-powered social travel platform for shared journeys, local insight, and travel stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#fbf8f2]">
        <GlobalToast />
        {children}
      </body>
    </html>
  );
}
