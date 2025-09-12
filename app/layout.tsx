import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

// import "./index.css";
import "./globals.css";
import Provider from "./provider";


export const metadata: Metadata = {
  title: "Carex Ai | Falcons",
  description:
    "AI Docter voice agent which can help you to get the best treatment for your health",
  keywords: ["keyword1", "keyword2"],
  authors: [{ name: "Your Name" }],
  creator: "Falcons",
  publisher: "Team Falcons",
  robots: "index, follow",
  openGraph: {
    title: "Carex Ai | Falcons",
    description:
      "AI Docter voice agent which can help you to get the best treatment for your health",
    siteName: "Your Site",
    images: [
      {
        url: "https://i.ibb.co/hxMMS8Cb/Screenshot-2025-07-27-011710.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  // https://i.ibb.co/bMZ6rKLN/Screenshot-2025-07-27-011740.png
  twitter: {
    card: "summary_large_image",
    title: "Carex Ai | Falcons",
    description:
      "AI Docter voice agent which can help you to get the best treatment for your health",
    images: ["https://i.ibb.co/hxMMS8Cb/Screenshot-2025-07-27-011710.png"],
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#000000",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          suppressHydrationWarning={true}
        >
          <Provider>{children}</Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}
