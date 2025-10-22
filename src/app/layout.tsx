import type { Metadata } from "next";
import "./globals.css";
// import "github-markdown.css";
import { sfProRounded } from "./fonts";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next"


export const metadata: Metadata = {
  title: "Clark",
  description: "Learning Made Easy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sfProRounded.className} antialiased`}
      >
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
