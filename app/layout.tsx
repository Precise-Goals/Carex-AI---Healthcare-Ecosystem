import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";

import "./index.css";
import "./globals.css";
import Provider from "./provider";
export const viewport = {
  themeColor: "#ED2939",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};
export const metadata: Metadata = {
  title: "Carex AI | Falcons – AI Doctor Voice Agent for Better Health",
  description:
    "Carex AI is your smart AI doctor voice assistant – helping you find the best treatments, book appointments, and improve your health 24/7. Trusted telemedicine & AI-powered healthcare solution by Team Falcons.",
  keywords: [
    "Carex AI",
    "AI doctor",
    "AI health assistant",
    "AI voice agent",
    "healthcare chatbot",
    "virtual doctor",
    "telemedicine",
    "online doctor consultation",
    "medical AI",
    "symptom checker",
    "health assistant app",
    "AI healthcare platform",
    "digital health",
    "doctor AI bot",
    "Falcons Carex AI",
    "AI-powered diagnosis",
    "AI for health",
    "AI wellness coach",
    "medical assistant AI",
    "remote healthcare",
    "health consultation online",
    "virtual clinic",
    "voice AI for medicine",
    "patient care automation",
    "AI treatment suggestions",
    "mental health AI assistant",
    "doctor appointment booking AI",
    "AI telehealth",
    "AI health monitoring",
    "AI health prediction",
    "AI-driven health analytics",
    "personal health assistant",
    "chatGPT healthcare",
    "voice-based health support",
    "online health checkup",
    "digital healthcare platform",
    "AI medical recommendations",
    "24/7 online doctor",
    "AI-powered patient support",
    "AI diagnosis engine",
  ],
  authors: [{ name: "Team Falcons", url: "https://carexai.vercel.app/about" }],
  creator: "Team Falcons",
  publisher: "Team Falcons",
  robots:
    "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  referrer: "origin-when-cross-origin",
  applicationName: "Carex AI",
  generator: "Next.js",
  category: "Health, AI, Technology",
  classification: "AI Healthcare Voice Assistant",

  manifest: "/site.webmanifest",

  alternates: {
    canonical: "https://carexai.vercel.app",
    languages: {
      "en-US": "https://carexai.vercel.app/en",
      "hi-IN": "https://carexai.vercel.app/hi",
    },
  },
  openGraph: {
    title: "Carex AI | Falcons – AI Doctor Voice Agent for Better Health",
    description:
      "AI-powered healthcare assistant to help you diagnose symptoms, book doctors, and improve your health. Available 24/7 for voice-based medical help.",
    url: "https://carexai.vercel.app",
    siteName: "Carex AI",
    images: [
      {
        url: "https://i.ibb.co/hxMMS8Cb/Screenshot-2025-07-27-011710.png",
        width: 1200,
        height: 630,
        alt: "Carex AI Healthcare Voice Agent",
      },
      {
        url: "https://i.ibb.co/bMZ6rKLN/Screenshot-2025-07-27-011740.png",
        width: 800,
        height: 800,
        alt: "AI Health Assistant Features",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Carex AI | Falcons – Your AI Doctor Voice Assistant",
    description:
      "Get instant health advice, book appointments, and access AI-driven treatment suggestions with Carex AI. Voice-first healthcare platform by Team Falcons.",
    creator: "@FalconsOfficial",
    images: ["https://i.ibb.co/hxMMS8Cb/Screenshot-2025-07-27-011710.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  other: {
    "msapplication-TileColor": "#000000",
    "msapplication-config": "/browserconfig.xml",
  },
};

export function SEOJsonLd() {
  return (
    <Script
      id="ld-json"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Carex AI",
          url: "https://carexai.vercel.app",
          logo: "https://i.ibb.co/hxMMS8Cb/Screenshot-2025-07-27-011710.png",
          sameAs: [
            "https://twitter.com/FalconsOfficial",
            "https://www.linkedin.com/company/falcons",
            "https://www.instagram.com/falcons.ai",
          ],
          description:
            "Carex AI is an AI-powered doctor voice agent that provides real-time health guidance, symptom analysis, and appointment booking.",
          foundingDate: "2025-01-01",
          founders: [{ "@type": "Person", name: "Team Falcons" }],
          contactPoint: [
            {
              "@type": "ContactPoint",
              telephone: "+91-9999999999",
              contactType: "customer support",
              areaServed: "Worldwide",
              availableLanguage: ["English", "Hindi"],
            },
          ],
        }),
      }}
    />
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" dir="ltr">
        <head>
          <SEOJsonLd />
          <meta name="language" content="en" />
          <meta httpEquiv="content-language" content="en" />
          <link rel="canonical" href="https://carexai.vercel.app" />
          <meta name="format-detection" content="telephone=no" />
        </head>
        <body suppressHydrationWarning={true}>
          <Provider>{children}</Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}
