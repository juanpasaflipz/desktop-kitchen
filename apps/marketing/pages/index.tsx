import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "../components/FadeIn";
import { WhatsAppCTA } from "../components/WhatsAppCTA";

import en from "../messages/en.json";
import es from "../messages/es.json";

const messages: Record<string, typeof en> = { en, es };

const ease = [0.25, 0.4, 0.25, 1];

/* ── Inline SVG Icons for Features ── */

function IconFinancing() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  );
}

function IconPOS() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
    </svg>
  );
}

function IconKitchen() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function IconDelivery() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H6.375c-.621 0-1.125-.504-1.125-1.125V14.25m17.25 0V6.75a2.25 2.25 0 00-2.25-2.25H6.375a2.25 2.25 0 00-2.25 2.25v7.5" />
    </svg>
  );
}

function IconInventory() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function IconLoyalty() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

function IconAI() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

const featureIcons = [IconFinancing, IconPOS, IconKitchen, IconDelivery, IconInventory, IconLoyalty, IconAI];

/* ── Demo Modal ── */

function DemoModal({
  open,
  onClose,
  t,
}: {
  open: boolean;
  onClose: () => void;
  t: typeof en;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [restaurant, setRestaurant] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !restaurant.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          restaurant_name: restaurant.trim(),
          financing_consent: consent,
        }),
      });
      const data = await res.json();

      if (res.status === 409 && data.existing) {
        setError("existing");
        setLoading(false);
        return;
      }
      if (res.status === 429) {
        setError("rate_limit");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("generic");
        setLoading(false);
        return;
      }

      window.location.href = `https://${data.subdomain}.desktop.kitchen/?demo_token=${data.demo_token}`;
    } catch {
      setError("generic");
      setLoading(false);
    }
  };

  const tAny = t as any;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease }}
            className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-2xl font-black tracking-tight text-white mb-2">
              {tAny.demoModalTitle}
            </h3>
            <p className="text-sm text-white/40 mb-6">
              {tAny.demoModalSub}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tAny.demoModalName}
                required
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-teal-500 text-sm"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder={tAny.demoModalEmail}
                required
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-teal-500 text-sm"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={tAny.demoModalPhone}
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-teal-500 text-sm"
              />
              <input
                type="text"
                value={restaurant}
                onChange={(e) => setRestaurant(e.target.value)}
                placeholder={tAny.demoModalRestaurant}
                required
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-teal-500 text-sm"
              />

              {/* Financing consent checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 accent-amber-500"
                />
                <span className="text-xs text-white/40 leading-relaxed">
                  {tAny.demoModalConsent}
                </span>
              </label>

              {error === "existing" && (
                <p className="text-sm text-amber-400">
                  {tAny.demoModalExisting}{" "}
                  <a href="https://pos.desktop.kitchen/#/" className="underline hover:text-amber-300">
                    {tAny.demoModalExistingLink}
                  </a>
                </p>
              )}
              {error === "rate_limit" && (
                <p className="text-sm text-red-400">{tAny.demoModalRateLimit}</p>
              )}
              {error === "generic" && (
                <p className="text-sm text-red-400">{tAny.demoModalError}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-teal-600 text-white font-semibold rounded-xl text-sm uppercase tracking-wider transition-all hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {tAny.demoModalLoading}
                  </>
                ) : (
                  tAny.demoModalSubmit
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Pricing Card (simplified) ── */

function PricingCard({
  name,
  tagline,
  price,
  limits,
  features,
  missing,
  cta,
  onCtaClick,
  badge,
  highlighted,
  financingNote,
  priceSubtext,
  t,
}: {
  name: string;
  tagline: string;
  price: string;
  limits: string;
  features: string[];
  missing: string[];
  cta: string;
  onCtaClick: () => void;
  badge?: string;
  highlighted?: boolean;
  financingNote?: string;
  priceSubtext?: string;
  t: any;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-6 flex flex-col ${
        highlighted
          ? "bg-teal-600/10 border-teal-500 ring-1 ring-teal-500/40"
          : "bg-white/[0.03] border-white/10"
      }`}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            {badge}
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-white font-bold text-lg">{name}</h3>
        <p className="text-white/40 text-sm mt-1">{tagline}</p>
      </div>

      <div className="mb-2">
        <span className="text-4xl font-extrabold text-white">{price}</span>
        {price !== "Free" && <span className="text-lg text-white/40 font-normal">/mo</span>}
        {priceSubtext && (
          <p className="text-sm text-white/30 mt-1">{priceSubtext}</p>
        )}
      </div>

      <div className="mb-6">
        <span className="text-xs text-teal-400 bg-teal-400/10 border border-teal-400/20 px-3 py-1 rounded-full">
          {limits}
        </span>
      </div>

      <button
        onClick={onCtaClick}
        className={`block w-full text-center font-semibold py-3 rounded-xl transition-colors cursor-pointer ${
          highlighted
            ? "bg-teal-600 hover:bg-teal-700 text-white"
            : "bg-white/5 hover:bg-white/10 text-white"
        }`}
      >
        {cta}
      </button>
      <div className="mb-6" />

      <ul className="space-y-3 flex-1">
        {features.map((f, i) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <svg className={`w-4 h-4 mt-0.5 shrink-0 ${i === 0 && highlighted ? "text-amber-400" : "text-teal-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span className={`${i === 0 && highlighted ? "text-amber-300/80 font-medium" : "text-white/60"}`}>{f}</span>
          </li>
        ))}
        {missing.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <span className="text-white/10 mt-0.5 shrink-0">&#10007;</span>
            <span className="text-white/20">{f}</span>
          </li>
        ))}
      </ul>

      {financingNote && (
        <div className="mt-6 pt-4 border-t border-amber-500/20">
          <p className="text-xs text-amber-400/70 leading-relaxed">{financingNote}</p>
        </div>
      )}
    </div>
  );
}

/* ── FAQ Section ── */

function FAQSection({ t }: { t: any }) {
  const faqItems = t.faqItems;
  if (!faqItems || !Array.isArray(faqItems)) return null;

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="preguntas-frecuentes" className="py-24 md:py-40 px-6 bg-neutral-900" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-teal-500/60 font-mono mb-6">
              {t.faqLabel}
            </p>
            <h2 id="faq-heading" className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]">
              {t.faqHeadline}
            </h2>
          </div>
        </FadeIn>

        <div className="space-y-4">
          {faqItems.map((item: { q: string; a: string }, i: number) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div className="border border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors"
                  aria-expanded={openIndex === i}
                >
                  <h3 className="text-white font-semibold text-base sm:text-lg pr-4">{item.q}</h3>
                  <svg
                    className={`w-5 h-5 text-teal-500 shrink-0 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openIndex === i && (
                  <div className="px-6 pb-5">
                    <p className="text-white/50 text-sm sm:text-base leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Structured Data (JSON-LD) ── */

function StructuredData({ locale, t }: { locale: string; t: typeof en }) {
  const isSpanish = locale === "es";
  const domain = isSpanish ? "es.desktop.kitchen" : "www.desktop.kitchen";
  const url = `https://${domain}`;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Desktop Kitchen",
    url: "https://www.desktop.kitchen",
    logo: `${url}/logo.svg`,
    description: isSpanish
      ? "POS gratuito para restaurantes con acceso a capital de trabajo en México"
      : "Free POS for restaurants with path to working capital",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      availableLanguage: ["Spanish", "English"],
    },
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Desktop Kitchen POS",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    url: url,
    description: t.description,
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        name: isSpanish ? "Gratis para Siempre" : "Free for Life",
        description: isSpanish ? "50 transacciones/día, 1 marca virtual" : "50 transactions/day, 1 virtual brand",
      },
      {
        "@type": "Offer",
        price: "20",
        priceCurrency: "USD",
        name: "Pro",
        priceValidUntil: "2027-12-31",
        description: isSpanish
          ? "Todo ilimitado + elegibilidad para capital de trabajo"
          : "Unlimited everything + working capital eligibility",
      },
    ],
    featureList: isSpanish
      ? "Capital de Trabajo, Punto de Venta, Pantalla de Cocina, Inteligencia de Delivery, Gestión de Inventario, Lealtad y CRM, Inteligencia Artificial"
      : "Working Capital, Point of Sale, Kitchen Display, Delivery Intelligence, Inventory Management, Loyalty & CRM, AI Intelligence",
    screenshot: `${url}/logo.svg`,
    aggregateRating: undefined,
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t.title,
    description: t.description,
    url: url,
    inLanguage: isSpanish ? "es-MX" : "en",
    isPartOf: {
      "@type": "WebSite",
      name: "Desktop Kitchen",
      url: "https://www.desktop.kitchen",
    },
  };

  const tAny = t as any;
  const faqSchema = tAny.faqItems
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: tAny.faqItems.map((item: { q: string; a: string }) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      }
    : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Desktop Kitchen",
        item: "https://www.desktop.kitchen",
      },
      ...(isSpanish
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: "Capital de Trabajo para Restaurantes en México",
              item: "https://es.desktop.kitchen",
            },
          ]
        : []),
    ],
  };

  const schemas: Record<string, any>[] = [organizationSchema, softwareSchema, webPageSchema, breadcrumbSchema];
  if (faqSchema) schemas.push(faqSchema);

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

/* ── Page ── */

const Home: NextPage = () => {
  const { locale } = useRouter();
  const t = messages[locale || "en"];
  const isSpanish = locale === "es";
  const otherLocale = locale === "es" ? "en" : "es";

  const [demoOpen, setDemoOpen] = useState(false);
  const openDemo = () => setDemoOpen(true);
  const startPro = () => {
    if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
      window.location.href = "https://pos.desktop.kitchen/#/register?plan=pro";
    } else {
      setDemoOpen(true);
    }
  };

  const featureKeys = [1, 2, 3, 4, 5, 6, 7] as const;

  const tAny = t as any;

  return (
    <>
      <Head>
        <title>{t.title}</title>
        <meta name="description" content={t.description} />
        <link rel="canonical" href={isSpanish ? "https://es.desktop.kitchen" : "https://www.desktop.kitchen"} />
        <link rel="alternate" hrefLang="en" href="https://www.desktop.kitchen" />
        <link rel="alternate" hrefLang="es" href="https://es.desktop.kitchen" />
        <link rel="alternate" hrefLang="x-default" href="https://www.desktop.kitchen" />
        <meta property="og:site_name" content="Desktop Kitchen" />
        <meta property="og:description" content={t.ogDescription} />
        <meta property="og:title" content={t.ogTitle} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={isSpanish ? "https://es.desktop.kitchen" : "https://www.desktop.kitchen"} />
        <meta property="og:locale" content={isSpanish ? "es_MX" : "en_US"} />
        <meta property="og:locale:alternate" content={isSpanish ? "en_US" : "es_MX"} />
        <meta property="og:image" content={`https://${isSpanish ? "es" : "www"}.desktop.kitchen/api/og?locale=${locale}`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.ogTitle} />
        <meta name="twitter:description" content={t.twitterDescription} />
        <meta name="twitter:image" content={`https://${isSpanish ? "es" : "www"}.desktop.kitchen/api/og?locale=${locale}`} />

        {isSpanish && (
          <>
            <meta name="keywords" content="capital de trabajo restaurante, financiamiento restaurante México, POS gratis restaurante, sistema punto de venta, ghost kitchen, cocina fantasma, punto de venta para restaurantes, POS delivery, Rappi Uber Eats DiDi, software restaurante México, préstamo restaurante" />
          </>
        )}
      </Head>

      <StructuredData locale={locale || "en"} t={t} />

      {/* Top accent bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-teal-600 z-50" aria-hidden="true" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between" aria-label={isSpanish ? "Navegación principal" : "Main navigation"}>
        <a href={isSpanish ? "https://es.desktop.kitchen" : "https://www.desktop.kitchen"} className="flex items-center gap-2" aria-label="Desktop Kitchen - Inicio">
          <img src="/logo.svg" alt="Desktop Kitchen" className="w-8 h-8" width={32} height={32} />
          <span className="text-white font-bold text-sm tracking-tight hidden sm:inline">Desktop Kitchen</span>
        </a>
        <div className="flex items-center gap-4">
          {isSpanish && (
            <div className="hidden sm:flex items-center gap-4 text-[11px] uppercase tracking-[0.15em] text-white/30">
              <a href="#funciones" className="hover:text-white/60 transition-colors">Funciones</a>
              <a href="#precios" className="hover:text-white/60 transition-colors">Precios</a>
              <a href="/blog" className="hover:text-white/60 transition-colors">Blog</a>
            </div>
          )}
          <a
            href={`https://${tAny.langSwitchDomain}`}
            className="text-[11px] uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition-colors duration-200 font-mono"
            hrefLang={otherLocale}
          >
            {t.langSwitch}
          </a>
        </div>
      </nav>

      {/* Grain overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* ─── HERO (split layout) ─── */}
      <header className="relative min-h-screen flex items-center overflow-hidden hero-bg">
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: text */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.85] tracking-tighter text-white"
            >
              {t.heroHeadline1}
              <br />
              <span className="text-teal-500">{t.heroHeadline2}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease }}
              className="mt-8 text-base sm:text-lg md:text-xl text-white/40 font-medium max-w-lg"
            >
              {t.heroSub}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75, ease }}
              className="mt-3 text-xs sm:text-sm text-amber-400/50 font-mono tracking-wide"
            >
              {tAny.heroSubPowered}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9, ease }}
              className="mt-10"
            >
              <button
                onClick={openDemo}
                className="bg-teal-600 text-white font-semibold px-8 py-4 rounded text-sm uppercase tracking-wider transition-all duration-200 hover:bg-teal-700 active:scale-[0.98]"
              >
                {t.heroCta}
              </button>
            </motion.div>
          </div>

          {/* Right: food image collage */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5, ease }}
            className="relative hidden lg:block"
          >
            {/* Teal glow behind images */}
            <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full scale-75" aria-hidden="true" />

            <div className="relative grid grid-cols-2 gap-4">
              {/* Large image top-left */}
              <div className="col-span-2 rounded-2xl overflow-hidden bg-teal-900/30 border border-white/10 aspect-[16/9]">
                <img
                  src="/images/hero-1.jpg"
                  alt="California burrito on cutting board"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              {/* Bottom-left */}
              <div className="rounded-2xl overflow-hidden bg-teal-900/30 border border-white/10 aspect-square">
                <img
                  src="/images/hero-2.png"
                  alt="Desktop Kitchen kiosk menu"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              {/* Bottom-right */}
              <div className="rounded-2xl overflow-hidden bg-teal-900/30 border border-white/10 aspect-square">
                <img
                  src="/images/hero-3.png"
                  alt="Desktop Kitchen item detail with modifiers"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          aria-hidden="true"
        >
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/20 to-transparent animate-pulse" />
        </motion.div>
      </header>

      <main>
        {/* ─── FEATURES (7 cards: financing hero + 6 ops) ─── */}
        <section id={isSpanish ? "funciones" : "features"} className="py-24 md:py-40 px-6 bg-neutral-950" aria-labelledby="features-heading">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-teal-500/60 font-mono mb-6">
                {t.featuresLabel}
              </p>
              <h2 id="features-heading" className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]">
                {t.featuresHeadline}
              </h2>
              <p className="mt-6 text-lg text-white/40 max-w-xl">
                {t.featuresSub}
              </p>
            </FadeIn>

            <div className="mt-16 md:mt-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featureKeys.map((n, i) => {
                const Icon = featureIcons[i];
                const title = t[`feature${n}Title` as keyof typeof t] as string;
                const desc = t[`feature${n}Desc` as keyof typeof t] as string;
                const isFinancing = n === 1;
                return (
                  <FadeIn key={n} delay={i * 0.08}>
                    <article
                      className={`group rounded-lg p-6 transition-all duration-300 ${
                        isFinancing
                          ? "bg-amber-500/[0.06] border-2 border-amber-500/20 hover:bg-amber-500/[0.1] hover:border-amber-500/30 sm:col-span-2 lg:col-span-1 financing-glow"
                          : "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors duration-300 ${
                          isFinancing
                            ? "bg-amber-500/15 text-amber-400 group-hover:bg-amber-500/25"
                            : "bg-teal-600/10 text-teal-500 group-hover:bg-teal-600/20"
                        }`}
                        aria-hidden="true"
                      >
                        <Icon />
                      </div>
                      <h3 className={`text-lg font-bold mb-2 ${isFinancing ? "text-amber-300" : "text-white"}`}>{title}</h3>
                      <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
                    </article>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── SOCIAL PROOF / METRICS ─── */}
        <section className="py-16 px-6 bg-neutral-950 border-y border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {([1, 2, 3, 4] as const).map((n, i) => (
                <FadeIn key={n} delay={i * 0.08}>
                  <div className="text-center">
                    <p className="text-3xl md:text-4xl font-black text-teal-400 tracking-tight">
                      {(tAny as any)[`proofStat${n}`]}
                    </p>
                    <p className="text-sm text-white/40 mt-2">
                      {(tAny as any)[`proofLabel${n}`]}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ─── HOW FINANCING WORKS ─── */}
        <section id={isSpanish ? "como-funciona" : "how-it-works"} className="py-24 md:py-40 px-6 bg-neutral-900" aria-labelledby="how-heading">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-teal-500/60 font-mono mb-6">
                  {t.howLabel}
                </p>
                <h2 id="how-heading" className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]">
                  {t.howHeadline}
                </h2>
                <p className="mt-6 text-lg text-white/40 max-w-xl mx-auto">
                  {t.howSub}
                </p>
              </div>
            </FadeIn>

            <div className="mt-16 md:mt-20 grid md:grid-cols-3 gap-12">
              {([1, 2, 3] as const).map((n, i) => {
                const title = t[`howStep${n}Title` as keyof typeof t] as string;
                const desc = t[`howStep${n}Desc` as keyof typeof t] as string;
                return (
                  <FadeIn key={n} delay={i * 0.12}>
                    <article className="text-center">
                      <div className="w-16 h-16 rounded-full border-2 border-teal-500/30 flex items-center justify-center text-teal-500 font-black text-2xl mb-6 mx-auto" aria-hidden="true">
                        {n}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                      <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
                    </article>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── PRICING ─── */}
        <section id="precios" className="py-24 md:py-40 px-6 bg-neutral-950" aria-labelledby="pricing-heading">
          <div className="max-w-7xl mx-auto">
            <FadeIn>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-teal-500/60 font-mono mb-6">
                  {t.pricingLabel}
                </p>
                <h2 id="pricing-heading" className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]">
                  {t.pricingHeadline}
                </h2>
                <p className="mt-6 text-lg text-white/40 max-w-2xl mx-auto">
                  {t.pricingSub}
                </p>
              </div>
            </FadeIn>

            <div className="mt-16 md:mt-20 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <FadeIn>
                <PricingCard
                  name={tAny.pricing_free_name}
                  tagline={tAny.pricing_free_tagline}
                  price="Free"
                  limits={tAny.pricing_free_limits}
                  features={tAny.pricing_free_features}
                  missing={tAny.pricing_free_missing}
                  cta={tAny.pricing_free_cta}
                  onCtaClick={openDemo}
                  t={tAny}
                />
              </FadeIn>
              <FadeIn delay={0.1}>
                <PricingCard
                  name={tAny.pricing_pro_name}
                  tagline={tAny.pricing_pro_tagline}
                  price={tAny.pricingProPrice}
                  priceSubtext={isSpanish ? "~$350 MXN/mes" : "~$350 MXN/mo"}
                  limits={tAny.pricing_pro_limits}
                  features={tAny.pricing_pro_features}
                  missing={tAny.pricing_pro_missing}
                  cta={tAny.pricing_pro_cta}
                  onCtaClick={startPro}
                  badge={tAny.pricing_pro_badge}
                  highlighted
                  financingNote={tAny.pricingFinancingNote}
                  t={tAny}
                />
              </FadeIn>
            </div>

            <div className="mt-12 text-center text-white/30 text-sm">
              <p>{t.pricingFooter1}</p>
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <FAQSection t={t} />

        {/* ─── FINAL CTA ─── */}
        <section className="py-24 md:py-32 px-6 bg-teal-600" aria-labelledby="cta-heading">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <h2 id="cta-heading" className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight">
                {t.ctaHeadline}
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="mt-6 text-lg text-white/70 max-w-xl mx-auto">
                {t.ctaSub}
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <button
                onClick={openDemo}
                className="mt-10 inline-block bg-white text-teal-700 font-semibold px-10 py-4 rounded text-sm uppercase tracking-wider transition-all duration-200 hover:bg-white/90 active:scale-[0.98]"
              >
                {t.ctaButton}
              </button>
            </FadeIn>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="py-12 px-6 bg-neutral-950 border-t border-white/5" role="contentinfo">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo.svg" alt="Desktop Kitchen" className="w-8 h-8" width={32} height={32} />
            <p className="text-xl font-black tracking-tighter text-white">
              {t.footerBrand}
            </p>
          </div>
          {tAny.footerTagline && (
            <p className="text-xs text-white/20 mb-4">{tAny.footerTagline}</p>
          )}
          <nav className="flex items-center justify-center gap-6 text-sm text-white/40" aria-label={isSpanish ? "Enlaces del pie de página" : "Footer links"}>
            <a
              href="https://docs.desktop.kitchen"
              className="hover:text-teal-500 transition-colors duration-200"
            >
              {t.footerDocs}
            </a>
            <span className="text-white/10" aria-hidden="true">|</span>
            <a
              href="/blog"
              className="hover:text-teal-500 transition-colors duration-200"
            >
              {tAny.footerBlog || "Blog"}
            </a>
            <span className="text-white/10" aria-hidden="true">|</span>
            <button
              onClick={openDemo}
              className="hover:text-teal-500 transition-colors duration-200"
            >
              {t.footerDemo}
            </button>
            <span className="text-white/10" aria-hidden="true">|</span>
            <a
              href="/data-policy"
              className="hover:text-teal-500 transition-colors duration-200"
            >
              {tAny.footerDataPolicy || "Data Policy"}
            </a>
          </nav>
          <p className="mt-6 text-xs text-white/15" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} Desktop Kitchen. {t.footerRights}
          </p>
        </div>
      </footer>

      {/* Demo Lead Capture Modal */}
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} t={t} />

      {/* Floating WhatsApp CTA */}
      <WhatsAppCTA locale={locale} />
    </>
  );
};

export default Home;
