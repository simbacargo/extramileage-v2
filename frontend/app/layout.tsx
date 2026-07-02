import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import type { Site } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ForSaleModal from "@/components/ForSaleModal";

const FALLBACK_SITE: Site = {
  site_name: "Extra Mileage Logistics",
  tagline: "Premium Japanese Used Cars Export",
  site_description: "Quality vehicles direct from Japan, shipped worldwide.",
  contact_email: "info@extramileage.com",
  contact_phone: "+81 (0)-80-7050-3366",
  whatsapp_number: "+81-80-7050-3366",
  company_address: "1-2-3 Shibuya, Shibuya City, Tokyo 150-0002, Japan",
  social_links: {},
};

export const metadata: Metadata = {
  title: "Extra Mileage Logistics — Premium Japanese Used Cars Export",
  description: "Quality Japanese vehicles, inspected and shipped worldwide.",
};

async function getSite(): Promise<Site> {
  try {
    return await apiGet<Site>("/site/", { revalidate: 300 });
  } catch {
    return FALLBACK_SITE;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <AuthProvider>
          <Header site={site} />
          <main className="flex-1">{children}</main>
          <Footer site={site} />
          <ForSaleModal />
        </AuthProvider>
      </body>
    </html>
  );
}
