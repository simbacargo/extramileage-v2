import type { Metadata } from "next";
import { apiGet } from "@/lib/api";
import type { Site } from "@/lib/types";
import InquiryForm from "@/components/InquiryForm";

export const metadata: Metadata = {
  title: "Contact — Extra Mileage Logistics",
};

const FALLBACK: Pick<Site, "contact_phone" | "contact_email" | "company_address"> = {
  contact_phone: "+81 (0)-80-7050-3366",
  contact_email: "info@extramileage.com",
  company_address: "1-2-3 Shibuya, Shibuya City, Tokyo 150-0002, Japan",
};

async function getSite() {
  try {
    return await apiGet<Site>("/site/", { revalidate: 300 });
  } catch {
    return FALLBACK as Site;
  }
}

export default async function ContactPage() {
  const site = await getSite();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-12 gap-10">
      <div className="lg:col-span-5">
        <p className="flex items-center gap-2 font-mono text-xs tracking-eyebrow uppercase text-muted"><span className="sun-dot" /> Get in touch</p>
        <h1 className="font-display font-bold text-4xl text-ink mt-4">Let&apos;s get your vehicle moving</h1>
        <p className="text-muted mt-3 leading-relaxed">Questions about stock, pricing or shipping to your country? Send a message and our team will respond within one business day.</p>

        <div className="mt-8 space-y-4">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-lg bg-brand-50 text-brand grid place-items-center shrink-0">✆</span>
            <div><p className="text-xs uppercase tracking-wide text-muted">Phone / WhatsApp</p><a href={`tel:${site.contact_phone}`} className="font-mono text-ink hover:text-brand">{site.contact_phone}</a></div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-lg bg-brand-50 text-brand grid place-items-center shrink-0">✉</span>
            <div><p className="text-xs uppercase tracking-wide text-muted">Email</p><a href={`mailto:${site.contact_email}`} className="font-mono text-ink hover:text-brand">{site.contact_email}</a></div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-lg bg-brand-50 text-brand grid place-items-center shrink-0">⌖</span>
            <div><p className="text-xs uppercase tracking-wide text-muted">Head office</p><p className="text-ink">{site.company_address}</p></div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 self-start">
        <InquiryForm />
      </div>
    </div>
  );
}
