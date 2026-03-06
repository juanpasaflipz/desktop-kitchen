import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const ease = [0.25, 0.4, 0.25, 1];

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ number, label }: { number: string; label: string }) {
  return (
    <p className="text-xs uppercase tracking-[0.3em] text-teal-500/60 font-mono mb-6">
      {number} &mdash; {label}
    </p>
  );
}

const Investors: NextPage = () => {
  const { locale } = useRouter();
  const isSpanish = locale === "es";

  const t = {
    title: isSpanish
      ? "Invierte en Desktop Kitchen — El Primer POS para Delivery en México"
      : "Invest in Desktop Kitchen — Mexico\u2019s First Delivery-Native POS",
    description: isSpanish
      ? "Construido en una cocina real, probado en el mundo real. Desktop Kitchen es el único POS delivery-first en México con reconciliación bancaria automática, facturación CFDI 4.0 y gestión multi-marca para ghost kitchens. Serie A — $2M."
      : "Built in a real kitchen, proven in the real world. Desktop Kitchen is the only delivery-first POS in Mexico with automated bank reconciliation, CFDI 4.0 compliance, and multi-brand ghost kitchen management. Series A — $2M.",
    eyebrow: isSpanish
      ? "Serie A \u00b7 Ciudad de México \u00b7 2026"
      : "Series A \u00b7 Mexico City \u00b7 2026",
    heroSub: isSpanish
      ? "La historia que ningún competidor puede contar"
      : "The story no competitor can tell",
    heroH1a: isSpanish ? "Construido en una" : "Built in a",
    heroH1b: isSpanish ? "cocina real." : "real kitchen.",
    heroH1c: isSpanish ? "Probado en el" : "Proven in the",
    heroH1d: isSpanish ? "mundo real." : "real world.",
    heroBody: isSpanish
      ? "No investigamos el problema. Lo vivimos — y luego construimos el único POS delivery-first en México con la arquitectura, el cumplimiento fiscal y las cicatrices de batalla para demostrarlo."
      : "We didn\u2019t research the problem. We lived it \u2014 and then we built the only delivery-first POS in Mexico with the architecture, the compliance, and the battle scars to prove it.",
    bookCall: isSpanish ? "Agendar Llamada" : "Book a Call",
    seeStory: isSpanish ? "Ver Nuestra Historia" : "See Our Story",
    stat1v: "12+",
    stat1l: isSpanish ? "Meses en producción" : "Months in production",
    stat2v: "60K+",
    stat2l: isSpanish ? "Líneas de código" : "Lines of codebase",
    stat3v: "3",
    stat3l: isSpanish ? "Plataformas reconciliadas" : "Platforms reconciled",
    stat4v: "0",
    stat4l: isSpanish
      ? "Competidores con todo esto"
      : "Competitors with all of this",
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t.title,
    description: t.description,
    url: isSpanish
      ? "https://es.desktop.kitchen/investors"
      : "https://www.desktop.kitchen/investors",
    inLanguage: isSpanish ? "es-MX" : "en",
    isPartOf: {
      "@type": "WebSite",
      name: "Desktop Kitchen",
      url: "https://www.desktop.kitchen",
    },
    about: {
      "@type": "Organization",
      name: "Desktop Kitchen",
      url: "https://www.desktop.kitchen",
      description: isSpanish
        ? "El primer POS nativo para delivery en México. Reconciliación bancaria automatizada, facturación CFDI 4.0, gestión multi-marca para ghost kitchens."
        : "Mexico\u2019s first delivery-native POS. Automated bank reconciliation, CFDI 4.0 invoicing, multi-brand ghost kitchen management.",
      foundingDate: "2024",
      foundingLocation: {
        "@type": "Place",
        name: "Mexico City, Mexico",
      },
      areaServed: {
        "@type": "Country",
        name: "Mexico",
      },
      sameAs: ["https://www.desktop.kitchen"],
    },
  };

  return (
    <>
      <Head>
        <title>{t.title}</title>
        <meta name="description" content={t.description} />
        <link
          rel="canonical"
          href={
            isSpanish
              ? "https://es.desktop.kitchen/investors"
              : "https://www.desktop.kitchen/investors"
          }
        />
        <link
          rel="alternate"
          hrefLang="en"
          href="https://www.desktop.kitchen/investors"
        />
        <link
          rel="alternate"
          hrefLang="es"
          href="https://es.desktop.kitchen/investors"
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://www.desktop.kitchen/investors"
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta property="og:title" content={t.title} />
        <meta property="og:description" content={t.description} />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={
            isSpanish
              ? "https://es.desktop.kitchen/investors"
              : "https://www.desktop.kitchen/investors"
          }
        />
        <meta
          property="og:image"
          content={`https://www.desktop.kitchen/api/og?locale=${locale || "en"}`}
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.title} />
        <meta name="twitter:description" content={t.description} />
        <meta
          name="twitter:image"
          content={`https://www.desktop.kitchen/api/og?locale=${locale || "en"}`}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      {/* Top accent bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-teal-600 z-50"
        aria-hidden="true"
      />

      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between bg-neutral-950/85 backdrop-blur-md border-b border-white/5"
        aria-label={isSpanish ? "Navegación" : "Navigation"}
      >
        <a
          href={
            isSpanish
              ? "https://es.desktop.kitchen"
              : "https://www.desktop.kitchen"
          }
          className="flex items-center gap-2"
          aria-label="Desktop Kitchen"
        >
          <img
            src="/logo.svg"
            alt="Desktop Kitchen"
            className="w-8 h-8"
            width={32}
            height={32}
          />
          <span className="text-white font-bold text-sm tracking-tight hidden sm:inline">
            Desktop Kitchen
          </span>
        </a>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-5 text-[11px] uppercase tracking-[0.15em] text-white/30">
            <a
              href="#problem"
              className="hover:text-white/60 transition-colors"
            >
              {isSpanish ? "Problema" : "Problem"}
            </a>
            <a href="#lab" className="hover:text-white/60 transition-colors">
              {isSpanish ? "Laboratorio" : "Lab"}
            </a>
            <a
              href="#technology"
              className="hover:text-white/60 transition-colors"
            >
              {isSpanish ? "Tecnología" : "Technology"}
            </a>
            <a href="#market" className="hover:text-white/60 transition-colors">
              {isSpanish ? "Mercado" : "Market"}
            </a>
            <a
              href="#opportunity"
              className="hover:text-white/60 transition-colors"
            >
              {isSpanish ? "Oportunidad" : "Opportunity"}
            </a>
          </div>
          <a
            href="#invest"
            className="bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors tracking-wider uppercase"
          >
            {t.bookCall} &rarr;
          </a>
        </div>
      </nav>

      {/* Grain overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* ─── HERO ─── */}
      <header className="relative flex min-h-screen items-center justify-center overflow-hidden hero-bg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease }}
          className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-teal-500 border border-teal-500/30 px-4 py-1.5 rounded-full mb-4 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            {t.eyebrow}
          </div>

          <p className="text-sm text-white/30 uppercase tracking-[0.2em] mb-8 font-mono">
            {t.heroSub}
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tighter text-white max-w-4xl mx-auto">
            {t.heroH1a}{" "}
            <span className="text-teal-500">{t.heroH1b}</span>
            <br />
            {t.heroH1c}{" "}
            <span className="text-teal-500">{t.heroH1d}</span>
          </h1>

          <p className="mt-8 text-base sm:text-lg text-white/40 max-w-2xl mx-auto leading-relaxed">
            {t.heroBody}
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#invest"
              className="bg-teal-600 text-white font-semibold px-8 py-4 rounded text-sm uppercase tracking-wider transition-all duration-200 hover:bg-teal-700 active:scale-[0.98]"
            >
              {t.bookCall} &rarr;
            </a>
            <a
              href="#problem"
              className="text-white/40 font-medium text-sm uppercase tracking-wider hover:text-white/60 transition-colors duration-200"
            >
              {t.seeStory} &darr;
            </a>
          </div>

          {/* Stats bar */}
          <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 border border-white/10 rounded-2xl overflow-hidden bg-white/[0.03] backdrop-blur-sm">
            {[
              { value: t.stat1v, label: t.stat1l },
              { value: t.stat2v, label: t.stat2l },
              { value: t.stat3v, label: t.stat3l },
              { value: t.stat4v, label: t.stat4l },
            ].map((stat, i) => (
              <div
                key={i}
                className={`py-6 px-4 text-center ${i < 3 ? "border-r border-white/10 max-md:last-of-type:border-r-0 max-md:[&:nth-child(2)]:border-r-0" : ""} max-md:[&:nth-child(-n+2)]:border-b max-md:border-white/10`}
              >
                <span className="text-2xl sm:text-3xl font-black text-teal-400 block">
                  {stat.value}
                </span>
                <span className="text-[11px] text-white/30 mt-1 block tracking-wide">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

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
        {/* ─── 01 PROBLEM ─── */}
        <section
          id="problem"
          className="py-24 md:py-40 px-6 bg-neutral-900"
          aria-labelledby="problem-heading"
        >
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <SectionLabel
                number="01"
                label={isSpanish ? "El Problema" : "The Problem"}
              />
              <h2
                id="problem-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]"
              >
                {isSpanish ? (
                  <>
                    Los restaurantes mexicanos están{" "}
                    <span className="text-teal-500">volando a ciegas</span> con
                    delivery.
                  </>
                ) : (
                  <>
                    Mexican restaurants are{" "}
                    <span className="text-teal-500">flying blind</span> on
                    delivery.
                  </>
                )}
              </h2>
              <p className="mt-6 text-lg text-white/40 max-w-xl">
                {isSpanish
                  ? "Rappi cobra 30%. Uber Eats cobra 28%. DiDi Food cobra 25%. Pero pregúntale a cualquier dueño de restaurante en CDMX cuánto ganó el martes pasado después de comisiones, impuestos y contracargos — y te quedará viendo."
                  : "Rappi takes 30%. Uber Eats takes 28%. DiDi Food takes 25%. But try asking any restaurant owner in Mexico City exactly how much they made last Tuesday after platform fees, tax obligations, and chargebacks \u2014 and you\u2019ll get a blank stare."}
              </p>
            </FadeIn>

            <div className="mt-16 md:mt-20 grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: (
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                      />
                    </svg>
                  ),
                  title: isSpanish
                    ? "Sin reconciliación"
                    : "No reconciliation",
                  desc: isSpanish
                    ? "Los pagos de las plataformas llegan días después, en lotes, sin coincidencia automática con los pedidos reales — así que los dueños cruzan hojas de cálculo manualmente durante horas cada semana."
                    : "Platform payouts arrive days late, in batches, with no automatic matching to actual orders \u2014 so owners manually cross-reference spreadsheets for hours every week.",
                  impact: isSpanish
                    ? "\u2192 El operador promedio pierde o sobreestima un 12% de ingresos"
                    : "\u2192 Average operator loses or overpays by 12% of revenue",
                },
                {
                  icon: (
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                  ),
                  title: isSpanish
                    ? "Pesadilla de CFDI"
                    : "CFDI compliance nightmare",
                  desc: isSpanish
                    ? "El SAT requiere facturación electrónica para cada transacción. Los POS tradicionales agregan la facturación como un parche — o la ignoran por completo."
                    : "The SAT requires electronic invoicing for every transaction. Legacy POS systems bolt on invoicing as an afterthought \u2014 or ignore it entirely.",
                  impact: isSpanish
                    ? "\u2192 Multas del SAT y horas de trabajo manual por mes"
                    : "\u2192 SAT fines and hours of manual work per month",
                },
                {
                  icon: (
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                      />
                    </svg>
                  ),
                  title: isSpanish
                    ? "Ghost kitchens sin herramientas"
                    : "Ghost kitchens have no tools",
                  desc: isSpanish
                    ? "¿Operando tres marcas virtuales desde una cocina? Todos los POS existentes asumen una marca, un comedor, un mundo simple."
                    : "Operating three virtual brands from one kitchen? Every existing POS assumes one brand, one dining room, one simple world.",
                  impact: isSpanish
                    ? "\u2192 2\u20134 horas/semana en reportes manuales por operador"
                    : "\u2192 2\u20134 hours/week in manual reporting per operator",
                },
              ].map((card, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <article className="group bg-white/[0.03] border border-white/5 rounded-xl p-6 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 h-full flex flex-col">
                    <div className="w-12 h-12 rounded-lg bg-teal-600/10 flex items-center justify-center text-teal-500 mb-5">
                      {card.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-white/40 leading-relaxed flex-1">
                      {card.desc}
                    </p>
                    <p className="mt-5 pt-4 border-t border-white/5 text-xs text-teal-500/80 font-mono tracking-wide">
                      {card.impact}
                    </p>
                  </article>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={0.2}>
              <p className="mt-10 text-sm text-white/30 text-center italic max-w-xl mx-auto">
                {isSpanish
                  ? "Los fundadores no estudiaron este mercado. Cocinaron en él — todos los días — y construyeron software para resolver el dolor que sentían personalmente."
                  : "The founders didn\u2019t study this market. They cooked in it \u2014 every single day \u2014 and built software to solve the pain they felt personally."}
              </p>
            </FadeIn>
          </div>
        </section>

        {/* ─── 02 THE LAB ─── */}
        <section
          id="lab"
          className="py-24 md:py-40 px-6 bg-neutral-950"
          aria-labelledby="lab-heading"
        >
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <SectionLabel
                number="02"
                label={isSpanish ? "El Laboratorio" : "The Lab"}
              />
              <h2
                id="lab-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]"
              >
                {isSpanish ? (
                  <>
                    Juanberto&apos;s no es un demo.
                    <br />
                    <span className="text-teal-500">
                      Es nuestro proof of concept.
                    </span>
                  </>
                ) : (
                  <>
                    Juanberto&apos;s isn&apos;t a demo.
                    <br />
                    <span className="text-teal-500">
                      It&apos;s our proof of concept.
                    </span>
                  </>
                )}
              </h2>
              <p className="mt-6 text-lg text-white/40 max-w-2xl">
                {isSpanish
                  ? "La mayoría de las empresas de software construyen y luego prueban. Nosotros lo hicimos al revés. Por más de un año, Desktop Kitchen corrió en vivo — procesando pedidos reales, reconciliando pagos reales de plataformas, y generando facturas CFDI reales — dentro de nuestro propio restaurante antes de que un solo cliente externo lo tocara."
                  : "Most software companies build, then test. We reversed that. For over a year, Desktop Kitchen ran live \u2014 processing real orders, reconciling real platform payouts, and generating real CFDI invoices \u2014 inside our own restaurant before a single external customer touched it."}
              </p>
            </FadeIn>

            <div className="mt-16 md:mt-20 grid lg:grid-cols-2 gap-8 items-start">
              {/* Code-like visual */}
              <FadeIn delay={0.1}>
                <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
                    <span className="w-3 h-3 rounded-full bg-red-500/60" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <span className="w-3 h-3 rounded-full bg-green-500/60" />
                    <span className="text-[10px] text-white/20 ml-2 font-mono">
                      production-data.yml
                    </span>
                  </div>
                  <div className="p-6 font-mono text-sm leading-relaxed">
                    <p className="text-white/20">
                      # 12+ {isSpanish ? "meses de datos de producción" : "months of production data"}{" "}
                      {isSpanish ? "de" : "from"} Juanberto&apos;s
                    </p>
                    <p className="text-white/50 mt-3">
                      orders_processed:{" "}
                      <span className="text-teal-400">real</span>
                    </p>
                    <p className="text-white/50">
                      platform_payouts_reconciled:{" "}
                      <span className="text-teal-400">
                        Rappi + UberEats + DiDi
                      </span>
                    </p>
                    <p className="text-white/50">
                      cfdi_invoices_generated:{" "}
                      <span className="text-teal-400">SAT-compliant</span>
                    </p>
                    <p className="text-white/50">
                      data_source:{" "}
                      <span className="text-teal-400">
                        &quot;{isSpanish ? "nuestro propio restaurante" : "our own restaurant"}&quot;
                      </span>
                    </p>
                    <p className="text-white/20 mt-3">
                      //{" "}
                      {isSpanish
                        ? "Esto no es un sandbox. Esto es producción."
                        : "This is not a sandbox. This is production."}
                    </p>
                  </div>
                </div>
              </FadeIn>

              {/* Stats sidebar */}
              <FadeIn delay={0.2}>
                <div className="space-y-4">
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-1">
                      Juanberto&apos;s California Burritos
                    </h3>
                    <p className="text-xs text-white/20 mb-6">
                      Roma Sur &middot;{" "}
                      {isSpanish ? "Ciudad de México" : "Mexico City"} &middot;{" "}
                      {isSpanish ? "Ambiente de Producción" : "Production Environment"}
                    </p>

                    <div className="space-y-4">
                      {[
                        {
                          label: isSpanish
                            ? "% de ingresos por delivery"
                            : "Delivery % of revenue",
                          value: ">50%",
                        },
                        {
                          label: isSpanish
                            ? "Plataformas activas"
                            : "Active platforms",
                          value: "Rappi \u00b7 UberEats \u00b7 DiDi",
                        },
                        {
                          label: isSpanish ? "En producción desde" : "Live since",
                          value: isSpanish ? "12+ meses" : "12+ months",
                        },
                        {
                          label: isSpanish
                            ? "Marcas virtuales planeadas"
                            : "Planned virtual brands",
                          value: isSpanish
                            ? "3\u20134 en 6 meses"
                            : "3\u20134 within 6 mo.",
                        },
                        {
                          label: isSpanish
                            ? "Cumplimiento fiscal"
                            : "Tax compliance",
                          value: "CFDI 4.0 \u2713",
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0"
                        >
                          <span className="text-sm text-white/40">
                            {item.label}
                          </span>
                          <span className="text-sm font-bold text-teal-400">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-white/20 text-center italic">
                    {isSpanish
                      ? "Eso no es un programa beta. Eso es skin in the game."
                      : "That\u2019s not a beta program. That\u2019s skin in the game."}
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ─── 03 TECHNOLOGY ─── */}
        <section
          id="technology"
          className="py-24 md:py-40 px-6 bg-neutral-900"
          aria-labelledby="tech-heading"
        >
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <SectionLabel
                number="03"
                label={isSpanish ? "La Tecnología" : "The Technology"}
              />
              <h2
                id="tech-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]"
              >
                {isSpanish ? (
                  <>
                    Tres capacidades.{" "}
                    <span className="text-teal-500">Cero competidores</span>{" "}
                    tienen las tres.
                  </>
                ) : (
                  <>
                    Three capabilities.{" "}
                    <span className="text-teal-500">Zero competitors</span>{" "}
                    have all three.
                  </>
                )}
              </h2>
            </FadeIn>

            <div className="mt-16 md:mt-20 grid md:grid-cols-3 gap-6">
              {[
                {
                  tag: isSpanish ? "Primero en México" : "First in Mexico",
                  title: isSpanish
                    ? "Reconciliación Bancaria Automatizada"
                    : "Automated Bank Reconciliation",
                  desc: isSpanish
                    ? "Algoritmos de fuzzy-matching emparejan automáticamente los pagos de plataformas de delivery con los depósitos bancarios — a través de Rappi, Uber Eats y DiDi Food simultáneamente. Lo que antes tomaba horas cada semana ahora toma cero minutos."
                    : "Fuzzy-matching algorithms automatically pair delivery platform payouts with bank deposits \u2014 across Rappi, Uber Eats, and DiDi Food simultaneously. What used to take owners hours every week now takes zero minutes.",
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                      />
                    </svg>
                  ),
                },
                {
                  tag: isSpanish ? "Nativo del SAT" : "SAT-native",
                  title: isSpanish
                    ? "Cumplimiento CFDI 4.0 Nativo"
                    : "Native CFDI 4.0 Compliance",
                  desc: isSpanish
                    ? "La facturación CFDI no es un add-on. Está integrada en el flujo de pedidos desde el día uno vía FacturAPI, generando facturas electrónicas cumpliendo con el SAT automáticamente. Sin plugins, sin exportaciones manuales, sin ansiedad de cumplimiento."
                    : "CFDI invoicing is not an add-on. It\u2019s woven into the order flow from day one via FacturAPI, generating SAT-compliant electronic invoices automatically. No third-party plugins, no manual exports, no compliance anxiety.",
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                  ),
                },
                {
                  tag: isSpanish ? "Grado empresarial" : "Enterprise-grade",
                  title: isSpanish
                    ? "Arquitectura Multi-Marca Ghost Kitchen"
                    : "Multi-Brand Ghost Kitchen Architecture",
                  desc: isSpanish
                    ? "POS verdaderamente multi-tenant y multi-marca con seguridad a nivel de fila en PostgreSQL. Una cocina, múltiples marcas virtuales, cada una con su propio menú, analítica y presencia en delivery. Construido para cómo operan los restaurantes de delivery hoy."
                    : "True multi-tenant, multi-brand POS with row-level security in PostgreSQL. One kitchen, multiple virtual brands, each with its own menu, analytics, and delivery presence. Built for the way delivery restaurants actually operate today.",
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z"
                      />
                    </svg>
                  ),
                },
              ].map((cap, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <article className="bg-white/[0.03] border border-white/5 rounded-xl p-6 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 h-full flex flex-col">
                    <div className="w-14 h-14 rounded-lg bg-teal-600/10 border border-teal-500/20 flex items-center justify-center text-teal-500 mb-5">
                      {cap.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">
                      {cap.title}
                    </h3>
                    <p className="text-sm text-white/40 leading-relaxed flex-1">
                      {cap.desc}
                    </p>
                    <span className="inline-block mt-4 text-[10px] font-mono tracking-wider text-teal-500/70 border border-teal-500/20 px-2.5 py-0.5 rounded-full self-start">
                      {cap.tag}
                    </span>
                  </article>
                </FadeIn>
              ))}
            </div>

            {/* Competitive table */}
            <FadeIn delay={0.2}>
              <div className="mt-16 md:mt-20 rounded-2xl overflow-hidden border border-white/10">
                <div className="hidden md:grid grid-cols-4 bg-white/[0.06]">
                  <div className="px-6 py-4 text-white/30 font-semibold text-xs uppercase tracking-wider">
                    {isSpanish ? "Capacidad" : "Capability"}
                  </div>
                  <div className="px-6 py-4 text-teal-500 font-semibold text-xs uppercase tracking-wider text-center">
                    Desktop Kitchen
                  </div>
                  <div className="px-6 py-4 text-white/30 font-semibold text-xs uppercase tracking-wider text-center">
                    Square / Toast
                  </div>
                  <div className="px-6 py-4 text-white/30 font-semibold text-xs uppercase tracking-wider text-center">
                    Local POS (Parrot)
                  </div>
                </div>

                {[
                  {
                    feat: isSpanish
                      ? "Margen real después de comisiones"
                      : "Real margin after delivery fees",
                    dk: true,
                    sq: false,
                    lp: false,
                  },
                  {
                    feat: isSpanish
                      ? "Gestión multi-marca ghost kitchen"
                      : "Multi-brand ghost kitchen management",
                    dk: true,
                    sq: false,
                    lp: "partial",
                  },
                  {
                    feat: isSpanish
                      ? "Integración plataformas delivery México"
                      : "Mexico delivery platform integration",
                    dk: true,
                    sq: false,
                    lp: false,
                  },
                  {
                    feat: isSpanish
                      ? "IA para pricing y márgenes"
                      : "AI pricing & margin intelligence",
                    dk: true,
                    sq: false,
                    lp: false,
                  },
                  {
                    feat: isSpanish
                      ? "Recaptura de clientes por WhatsApp"
                      : "WhatsApp customer recapture",
                    dk: true,
                    sq: false,
                    lp: false,
                  },
                  {
                    feat: isSpanish
                      ? "Facturación CFDI (cumplimiento fiscal México)"
                      : "CFDI invoicing (Mexico tax compliance)",
                    dk: true,
                    sq: false,
                    lp: "partial",
                  },
                  {
                    feat: isSpanish
                      ? "App nativa con modo offline"
                      : "Native offline app",
                    dk: true,
                    sq: "partial",
                    lp: false,
                  },
                  {
                    feat: isSpanish
                      ? "Reconciliación bancaria (fuzzy matching)"
                      : "Bank reconciliation (fuzzy matching)",
                    dk: true,
                    sq: false,
                    lp: false,
                  },
                ].map((row, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-1 md:grid-cols-4 border-t border-white/5 ${
                      i % 2 === 0 ? "bg-white/[0.02]" : "bg-white/[0.01]"
                    }`}
                  >
                    <div className="px-6 py-4 text-sm text-white/60 flex items-center">
                      {row.feat}
                    </div>
                    {(
                      [
                        { val: row.dk, highlight: true },
                        { val: row.sq, highlight: false },
                        { val: row.lp, highlight: false },
                      ] as const
                    ).map((cell, ci) => (
                      <div
                        key={ci}
                        className="px-6 py-4 text-center hidden md:flex items-center justify-center"
                      >
                        {cell.val === true ? (
                          <span className="text-teal-400 text-lg">
                            &#10003;
                          </span>
                        ) : cell.val === false ? (
                          <span className="text-white/10 text-lg">
                            &#10007;
                          </span>
                        ) : (
                          <span className="text-white/30 text-xs">
                            {isSpanish ? "Parcial" : "Partial"}
                          </span>
                        )}
                      </div>
                    ))}
                    <div className="px-6 pb-4 md:hidden">
                      <span className="text-teal-400 text-sm font-mono">
                        &#10003; Desktop Kitchen
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─── 04 THE PROOF ─── */}
        <section
          id="proof"
          className="py-24 md:py-40 px-6 bg-neutral-950"
          aria-labelledby="proof-heading"
        >
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <SectionLabel
                number="04"
                label={isSpanish ? "La Prueba" : "The Proof"}
              />
              <h2
                id="proof-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]"
              >
                {isSpanish ? (
                  <>
                    Tenemos un test suite que{" "}
                    <span className="text-teal-500">
                      prueba que la arquitectura funciona.
                    </span>
                  </>
                ) : (
                  <>
                    We have a test suite that{" "}
                    <span className="text-teal-500">
                      proves the architecture is sound.
                    </span>
                  </>
                )}
              </h2>
            </FadeIn>

            <div className="mt-16 md:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  value: "60K+",
                  label: isSpanish
                    ? "Líneas de código en producción"
                    : "Lines of production code",
                  sub: isSpanish
                    ? "Codebase grado empresarial con aislamiento multi-tenant, políticas RLS, y soporte offline — no es un prototipo."
                    : "Enterprise-grade codebase with multi-tenant isolation, RLS policies, and offline support \u2014 not a prototype.",
                },
                {
                  value: "12+",
                  label: isSpanish
                    ? "Meses en producción real"
                    : "Months in real production",
                  sub: isSpanish
                    ? "Corriendo en vivo en Juanberto's — no en staging, no en un sandbox — contra pedidos y dinero real."
                    : "Running live at Juanberto\u2019s \u2014 not in staging, not in a sandbox \u2014 against real orders and real money.",
                },
                {
                  value: "3",
                  label: isSpanish
                    ? "Plataformas de delivery reconciliadas"
                    : "Delivery platforms reconciled",
                  sub: isSpanish
                    ? "Rappi, Uber Eats y DiDi Food completamente integrados con matching automático pago-banco en producción."
                    : "Rappi, Uber Eats, and DiDi Food fully integrated with automated payout-to-bank matching in production.",
                },
                {
                  value: "\u221e",
                  label: isSpanish
                    ? "Skin in the game del fundador"
                    : "Founder skin in the game",
                  sub: isSpanish
                    ? "Cada bug golpea nuestro propio P&L primero. Ningún fundador tiene más incentivo para hacer bien la reconciliación."
                    : "Every bug hits our own P&L first. No founder has more incentive to get reconciliation right than one who eats what they cook.",
                },
              ].map((stat, i) => (
                <FadeIn key={i} delay={i * 0.08}>
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6 h-full">
                    <span className="text-3xl sm:text-4xl font-black text-teal-400 block mb-3">
                      {stat.value}
                    </span>
                    <span className="text-sm font-bold text-white block mb-2">
                      {stat.label}
                    </span>
                    <span className="text-xs text-white/30 leading-relaxed block">
                      {stat.sub}
                    </span>
                  </div>
                </FadeIn>
              ))}
            </div>

            {/* Founder story */}
            <FadeIn delay={0.2}>
              <div className="mt-12 bg-white/[0.03] border border-white/10 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-4">
                  {isSpanish
                    ? "La Historia de Founder-Market Fit"
                    : "The Founder-Market Fit Story"}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed mb-4">
                  {isSpanish
                    ? "Juan construyó Desktop Kitchen por frustración personal. Operando Juanberto's California Burritos, no podía entender por qué meses que parecían rentables se sentían pobres en efectivo. La respuesta: las comisiones de las plataformas eran invisibles en todos los POS que probó."
                    : "Juan built Desktop Kitchen out of personal frustration. Running Juanberto\u2019s California Burritos, he couldn\u2019t figure out why profitable-looking months felt cash-poor. The answer: platform commissions were invisible in every POS he tried."}
                </p>
                <p className="text-sm text-white/40 leading-relaxed mb-6">
                  {isSpanish
                    ? "Primero construyó el motor de reconciliación — para él mismo. Luego la gestión multi-marca. Luego la facturación CFDI. Todo lo que ves en el producto hoy fue validado con pedidos reales en un restaurante real antes de que un solo cliente externo lo viera."
                    : "He built the reconciliation engine first \u2014 for himself. Then the multi-brand management. Then the CFDI invoicing. Everything you see in the product today was validated on real orders at a real restaurant before a single external customer saw it."}
                </p>
                <blockquote className="text-base text-teal-400 italic border-l-2 border-teal-500/50 pl-4 leading-relaxed">
                  {isSpanish
                    ? "\u201cLa mayoría de los POS te muestran lo que vendiste. No te muestran lo que realmente te quedó después de que la plataforma tomó su 30%. Nosotros sí.\u201d"
                    : "\u201cMost POS systems show you what you sold. They don\u2019t show you what you actually kept after the platform took their 30%. We do.\u201d"}
                </blockquote>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─── 05 MARKET ─── */}
        <section
          id="market"
          className="py-24 md:py-40 px-6 bg-neutral-900"
          aria-labelledby="market-heading"
        >
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <SectionLabel
                number="05"
                label={isSpanish ? "El Mercado" : "The Market"}
              />
              <h2
                id="market-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]"
              >
                {isSpanish ? (
                  <>
                    Un SAM de $420M en un panorama competitivo de{" "}
                    <span className="text-teal-500">era pre-IA</span>
                  </>
                ) : (
                  <>
                    A $420M SAM in a{" "}
                    <span className="text-teal-500">pre-AI era</span>{" "}
                    competitive landscape
                  </>
                )}
              </h2>
              <p className="mt-6 text-lg text-white/40 max-w-xl">
                {isSpanish
                  ? "Cada competidor importante fue construido para comer en el local, antes de que el delivery se convirtiera en el canal dominante. La categoría está abierta."
                  : "Every major competitor was built for dine-in, before delivery became the dominant channel. The category is wide open."}
              </p>
            </FadeIn>

            <div className="mt-16 md:mt-20 grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[
                {
                  value: "$4.2B",
                  label: isSpanish ? "GMV Total Delivery" : "Total Delivery GMV",
                  sub: isSpanish
                    ? "Mercado de delivery en México 2024"
                    : "Mexico food delivery market 2024",
                },
                {
                  value: "180K+",
                  label: isSpanish
                    ? "Restaurantes"
                    : "Restaurant Outlets",
                  sub: isSpanish
                    ? "Habilitados para delivery en México"
                    : "Delivery-enabled in Mexico",
                },
                {
                  value: "38%",
                  label: isSpanish ? "Crecimiento YoY" : "YoY Growth",
                  sub: isSpanish
                    ? "Segmento delivery, 2022\u20132024"
                    : "Delivery segment, 2022\u20132024",
                },
                {
                  value: "$420M",
                  label: isSpanish ? "SAM Accesible" : "Serviceable SAM",
                  sub: isSpanish
                    ? "Operadores con 5%+ de ingresos por delivery"
                    : "5+ delivery-revenue operators",
                },
                {
                  value: "94%",
                  label: isSpanish
                    ? "Penetración WhatsApp"
                    : "WhatsApp Penetration",
                  sub: isSpanish
                    ? "Usuarios de smartphones mexicanos"
                    : "Mexican smartphone users",
                },
                {
                  value: "3\u00d7",
                  label: isSpanish
                    ? "Crecimiento Ghost Kitchens"
                    : "Ghost Kitchen Growth",
                  sub: isSpanish
                    ? "Marcas virtuales en CDMX 2021\u21922024"
                    : "Virtual brands in CDMX 2021\u21922024",
                },
              ].map((card, i) => (
                <FadeIn key={i} delay={i * 0.06}>
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6 text-center hover:border-white/10 transition-colors">
                    <span className="text-3xl sm:text-4xl font-black text-teal-400 block">
                      {card.value}
                    </span>
                    <span className="text-sm font-semibold text-white mt-2 block">
                      {card.label}
                    </span>
                    <span className="text-xs text-white/30 mt-1 block">
                      {card.sub}
                    </span>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={0.2}>
              <div className="mt-12 bg-teal-600/5 border border-teal-500/15 rounded-2xl p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center">
                <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                  {isSpanish ? (
                    <>
                      El mercado mexicano de delivery es estructuralmente
                      diferente.{" "}
                      <strong className="text-teal-400">
                        Rappi, Uber Eats y DiDi Food
                      </strong>{" "}
                      dominan con estructuras de comisiones agresivas que ningún
                      proveedor de POS existente fue diseñado para rastrear o
                      combatir. Los requisitos de facturación CFDI crean fosos
                      naturales contra jugadores internacionales.{" "}
                      <strong className="text-teal-400">
                        Este mercado necesita una solución nativa.
                      </strong>
                    </>
                  ) : (
                    <>
                      The Mexican delivery market is structurally different.{" "}
                      <strong className="text-teal-400">
                        Rappi, Uber Eats, and DiDi Food
                      </strong>{" "}
                      dominate with aggressive commission structures that no
                      existing POS vendor was designed to track or fight. CFDI
                      tax invoicing requirements create natural moats against
                      international players.{" "}
                      <strong className="text-teal-400">
                        This market needs a native solution.
                      </strong>
                    </>
                  )}
                </p>
                <ul className="space-y-3">
                  {(isSpanish
                    ? [
                        "Ningún POS importante tiene tracking de márgenes nativo para delivery",
                        "Square y Toast tienen presencia mínima en México",
                        "Competidores locales carecen de capacidades de IA y soporte móvil nativo",
                        "WhatsApp Business crea un canal de recaptura de clientes no disponible en otro lado",
                      ]
                    : [
                        "No major POS player has delivery-native margin tracking",
                        "Square and Toast have minimal Mexico presence",
                        "Local competitors lack AI capabilities and native mobile support",
                        "WhatsApp Business creates a customer recapture channel unavailable elsewhere",
                      ]
                  ).map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-white/40"
                    >
                      <span className="text-teal-500 font-semibold flex-shrink-0 mt-0.5">
                        &rarr;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─── 06 THE OPPORTUNITY ─── */}
        <section
          id="opportunity"
          className="py-24 md:py-40 px-6 bg-neutral-950"
          aria-labelledby="opportunity-heading"
        >
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <SectionLabel
                number="06"
                label={isSpanish ? "La Oportunidad" : "The Opportunity"}
              />
              <h2
                id="opportunity-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]"
              >
                {isSpanish ? (
                  <>
                    Ahora escalamos lo que{" "}
                    <span className="text-teal-500">ya está probado.</span>
                  </>
                ) : (
                  <>
                    Now we scale what&apos;s{" "}
                    <span className="text-teal-500">already proven.</span>
                  </>
                )}
              </h2>
              <p className="mt-6 text-lg text-white/40 max-w-2xl">
                {isSpanish
                  ? "El trabajo difícil está hecho. La arquitectura está validada. El cumplimiento es real. La reconciliación funciona. Lo que sigue es distribución — poner un producto probado frente a los 50,000+ restaurantes delivery-first de México."
                  : "The hard work is done. The architecture is validated. The compliance is real. The reconciliation works. What comes next is distribution \u2014 putting a proven product in front of Mexico\u2019s 50,000+ delivery-first restaurants."}
              </p>
            </FadeIn>

            {/* Use of funds */}
            <div className="mt-16 md:mt-20 grid md:grid-cols-3 gap-6">
              {[
                {
                  pct: "40%",
                  title: isSpanish ? "Ventas y Marketing" : "Sales & Marketing",
                  desc: isSpanish
                    ? "Equipo de ventas puerta a puerta por comisión en CDMX, targeting restaurantes donde más del 50% de ingresos viene de plataformas de delivery."
                    : "Commission-only door-to-door sales team in Mexico City, targeting restaurants where >50% of revenue comes from delivery platforms.",
                },
                {
                  pct: "35%",
                  title: isSpanish
                    ? "Ingeniería y Producto"
                    : "Engineering & Product",
                  desc: isSpanish
                    ? "QR self-ordering, apps de mesero, inteligencia de márgenes con IA, y recaptura de clientes por WhatsApp para extender nuestro moat más allá de la reconciliación."
                    : "QR self-ordering, waiter apps, AI-powered margin intelligence, and WhatsApp customer recapture to extend our moat beyond reconciliation.",
                },
                {
                  pct: "25%",
                  title: isSpanish
                    ? "Ops y Customer Success"
                    : "Operations & Customer Success",
                  desc: isSpanish
                    ? "Onboarding sin fricción (cero-a-primer-pedido en menos de 5 minutos), documentación Docusaurus, y soporte hands-on para impulsar retención en el año uno."
                    : "Frictionless onboarding (zero-to-first-order under 5 minutes), Docusaurus docs, and hands-on support to drive retention in year one.",
                },
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 h-full">
                    <span className="text-3xl font-black text-teal-400 block mb-3">
                      {item.pct}
                    </span>
                    <h3 className="text-base font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/40 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>

            {/* GTM roadmap */}
            <FadeIn delay={0.2}>
              <div className="mt-12 bg-teal-600/5 border border-teal-500/15 rounded-2xl p-8 md:p-12 grid lg:grid-cols-2 gap-10 items-start">
                <div>
                  <p className="text-[11px] font-mono text-teal-500/60 tracking-wider mb-4 flex items-center gap-2">
                    <span className="text-white/20">//</span>{" "}
                    {isSpanish ? "Go-to-Market" : "Go-to-Market"}
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight mb-5">
                    {isSpanish ? (
                      <>
                        Construido por un operador,{" "}
                        <span className="text-teal-500">para operadores</span>
                      </>
                    ) : (
                      <>
                        Built by an operator,{" "}
                        <span className="text-teal-500">for operators</span>
                      </>
                    )}
                  </h3>
                  <p className="text-sm text-white/40 leading-relaxed">
                    {isSpanish
                      ? "El equipo de ventas puerta a puerta lanzándose en CDMX se enfoca en operadores que generan 50%+ de ingresos a través de plataformas de delivery — exactamente las personas que sienten el dolor más agudamente. Reps por comisión. Geografía concentrada. Venta basada en historia."
                      : "The door-to-door sales team launching in Mexico City targets operators doing 50%+ of revenue through delivery platforms \u2014 the exact people who feel the pain most acutely. Commission-only reps. Tight geography. Story-led selling."}
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      n: "01",
                      title: isSpanish
                        ? "Penetración Densa CDMX"
                        : "CDMX Dense Penetration",
                      desc: isSpanish
                        ? "Roma, Condesa, Polanco, Santa Fe — clusters de ghost kitchens. Puerta a puerta con campaña MEXICO50."
                        : "Roma, Condesa, Polanco, Santa Fe \u2014 ghost kitchen clusters. Door-to-door with MEXICO50 campaign.",
                    },
                    {
                      n: "02",
                      title: isSpanish
                        ? "Guadalajara y Monterrey"
                        : "Guadalajara & Monterrey",
                      desc: isSpanish
                        ? "Expansión de segundo nivel con onboarding remoto. Programa de referidos a través de redes de WhatsApp."
                        : "Second-tier expansion with remote onboarding. Referral program through WhatsApp networks.",
                    },
                    {
                      n: "03",
                      title: isSpanish
                        ? "Expansión LATAM"
                        : "LATAM Expansion",
                      desc: isSpanish
                        ? "Colombia, Argentina, Chile — mismas dinámicas de plataformas de delivery, mismos pain points, mismo producto."
                        : "Colombia, Argentina, Chile \u2014 same delivery platform dynamics, same pain points, same product.",
                    },
                  ].map((step, i) => (
                    <div
                      key={i}
                      className="flex gap-4 p-5 bg-neutral-900/60 border border-white/5 rounded-xl"
                    >
                      <span className="text-[11px] font-mono text-teal-500/60 w-6 flex-shrink-0 pt-0.5">
                        {step.n}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1">
                          {step.title}
                        </h4>
                        <p className="text-xs text-white/40 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─── PRICING ─── */}
        <section
          id="pricing"
          className="py-24 md:py-40 px-6 bg-neutral-900"
          aria-labelledby="pricing-heading"
        >
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <SectionLabel
                number="07"
                label={isSpanish ? "Modelo de Negocio" : "Business Model"}
              />
              <h2
                id="pricing-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]"
              >
                {isSpanish ? (
                  <>
                    Precios SaaS diseñados para{" "}
                    <span className="text-teal-500">operadores mexicanos</span>
                  </>
                ) : (
                  <>
                    SaaS pricing designed for{" "}
                    <span className="text-teal-500">Mexican operators</span>
                  </>
                )}
              </h2>
              <p className="mt-6 text-lg text-white/40 max-w-xl">
                {isSpanish
                  ? "Dos planes simples. Sin complejidad. El código promotor MEXICO50 da 50% de descuento el primer año."
                  : "Two simple plans. No complexity. Promoter code MEXICO50 gives 50% off year one."}
              </p>
            </FadeIn>

            <div className="mt-16 md:mt-20 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {[
                {
                  name: isSpanish ? "Gratis para Siempre" : "Free for Life",
                  price: "$0",
                  period: isSpanish
                    ? "50 transacciones/día · 1 marca"
                    : "50 transactions/day · 1 brand",
                  featured: false,
                  features: [
                    {
                      text: isSpanish ? "1 marca virtual" : "1 virtual brand",
                      active: true,
                    },
                    {
                      text: isSpanish
                        ? "POS esencial (pedidos, pagos, recibos)"
                        : "Core POS (orders, payments, receipts)",
                      active: true,
                    },
                    {
                      text: isSpanish
                        ? "Gestión básica de menú"
                        : "Basic menu management",
                      active: true,
                    },
                    {
                      text: isSpanish
                        ? "Soporte por email"
                        : "Email support",
                      active: true,
                    },
                    {
                      text: isSpanish
                        ? "Integración con delivery"
                        : "Delivery integration",
                      active: false,
                    },
                    {
                      text: isSpanish
                        ? "IA y precios dinámicos"
                        : "AI & dynamic pricing",
                      active: false,
                    },
                  ],
                  cta: isSpanish ? "Empezar Gratis" : "Start Free",
                },
                {
                  name: "Pro",
                  price: "$80",
                  period: isSpanish
                    ? "por mes · todo ilimitado"
                    : "per month · unlimited everything",
                  featured: true,
                  badge: isSpanish ? "Todo Incluido" : "Everything Included",
                  features: [
                    {
                      text: isSpanish
                        ? "Marcas y sucursales ilimitadas"
                        : "Unlimited brands & locations",
                      active: true,
                    },
                    {
                      text: isSpanish
                        ? "Integración Rappi, Uber Eats y DiDi"
                        : "Rappi, Uber Eats & DiDi integration",
                      active: true,
                    },
                    {
                      text: isSpanish
                        ? "Asistente IA — copiloto 24/7"
                        : "AI Assistant — 24/7 copilot",
                      active: true,
                    },
                    {
                      text: isSpanish
                        ? "Upselling y precios dinámicos con IA"
                        : "AI-powered upselling & dynamic pricing",
                      active: true,
                    },
                    {
                      text: isSpanish
                        ? "Acceso a financiamiento"
                        : "Access to financing",
                      active: true,
                    },
                    {
                      text: isSpanish
                        ? "P&L completo multi-marca por plataforma"
                        : "Full multi-brand P&L by platform",
                      active: true,
                    },
                    {
                      text: isSpanish
                        ? "Recaptura de clientes por SMS"
                        : "SMS customer recapture",
                      active: true,
                    },
                    {
                      text: isSpanish
                        ? "Onboarding dedicado y soporte prioritario"
                        : "Dedicated onboarding & priority support",
                      active: true,
                    },
                  ],
                  cta: isSpanish ? "Comenzar Pro" : "Start Pro",
                },
              ].map((plan, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div
                    className={`relative rounded-2xl border p-6 flex flex-col h-full ${
                      plan.featured
                        ? "bg-teal-600/10 border-teal-500/40 ring-1 ring-teal-500/20"
                        : "bg-white/[0.03] border-white/10"
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-teal-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          {plan.badge}
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">
                        {plan.name}
                      </p>
                      <p className="text-4xl font-black text-white">
                        {plan.price}{" "}
                        <span className="text-base font-normal text-white/30">
                          USD
                        </span>
                      </p>
                      <p className="text-xs text-white/30 mt-1">
                        {plan.period}
                      </p>
                    </div>
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {plan.features.map((feat, fi) => (
                        <li
                          key={fi}
                          className={`flex items-center gap-2.5 text-sm ${
                            feat.active ? "text-white/50" : "text-white/20"
                          }`}
                        >
                          <span
                            className={`flex-shrink-0 font-bold ${
                              feat.active ? "text-teal-500" : "text-white/15"
                            }`}
                          >
                            {feat.active ? "\u2713" : "\u2013"}
                          </span>
                          {feat.text}
                        </li>
                      ))}
                    </ul>
                    <a
                      href="#invest"
                      className={`block text-center py-3 rounded-lg font-bold text-sm transition-all ${
                        plan.featured
                          ? "bg-teal-600 text-white hover:bg-teal-700"
                          : "border border-teal-500/25 text-teal-500 hover:bg-teal-600/10"
                      }`}
                    >
                      {plan.cta}
                    </a>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA / INVEST ─── */}
        <section
          id="invest"
          className="py-24 md:py-40 px-6 bg-neutral-950"
          aria-labelledby="invest-heading"
        >
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <span className="text-5xl sm:text-6xl md:text-7xl font-mono font-medium text-teal-400 block mb-3">
                $2,000,000
              </span>
              <p className="text-sm text-white/30 mb-12 tracking-wide">
                {isSpanish
                  ? "Serie A — Abierta"
                  : "Series A Raise \u2014 Open Now"}
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2
                id="invest-heading"
                className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight mb-5"
              >
                {isSpanish ? (
                  <>
                    Estamos levantando $2M para{" "}
                    <span className="text-teal-500">dominar</span> la categoría
                    de POS delivery-first en México
                  </>
                ) : (
                  <>
                    We&apos;re raising $2M to{" "}
                    <span className="text-teal-500">own</span> the delivery-first
                    POS category in Mexico
                  </>
                )}
              </h2>
              <p className="text-lg text-white/40 mb-12 max-w-2xl mx-auto">
                {isSpanish
                  ? "El mercado está probado. El producto está en vivo. El dolor es diario. Únete antes de que esta categoría tenga un líder."
                  : "The market is proven. The product is live. The pain is daily. Join us before this category has a leader."}
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
                <a
                  href="mailto:hello@desktop.kitchen"
                  className="bg-teal-600 text-white font-semibold px-8 py-4 rounded text-sm uppercase tracking-wider transition-all duration-200 hover:bg-teal-700 active:scale-[0.98]"
                >
                  {isSpanish ? "Agendar Llamada" : "Schedule a Call"} &rarr;
                </a>
                <a
                  href="#"
                  className="text-teal-500 font-semibold px-8 py-4 rounded text-sm uppercase tracking-wider border border-teal-500/25 hover:bg-teal-600/10 transition-all"
                >
                  {isSpanish ? "Descargar Deck" : "Download Deck"}
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5">
                <a
                  href="mailto:hello@desktop.kitchen"
                  className="text-teal-500 hover:text-teal-400 text-sm font-semibold transition-colors"
                >
                  hello@desktop.kitchen
                </a>
                <span className="hidden sm:block w-px h-5 bg-white/10" />
                <a
                  href="https://www.desktop.kitchen"
                  className="text-teal-500 hover:text-teal-400 text-sm font-semibold transition-colors"
                >
                  www.desktop.kitchen
                </a>
                <span className="hidden sm:block w-px h-5 bg-white/10" />
                <a
                  href="#"
                  className="text-teal-500 hover:text-teal-400 text-sm font-semibold transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer
        className="py-12 px-6 bg-neutral-950 border-t border-white/5"
        role="contentinfo"
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/logo.svg"
              alt="Desktop Kitchen"
              className="w-6 h-6"
              width={24}
              height={24}
            />
            <span className="text-sm font-bold text-teal-500">
              Desktop Kitchen
            </span>
          </div>
          <p className="text-xs text-white/20">
            {isSpanish
              ? "El POS delivery-first \u00b7 Hecho en México \u00b7 Para México"
              : "The delivery-first POS \u00b7 Built in Mexico \u00b7 For Mexico"}
          </p>
          <p
            className="text-xs text-white/15 font-mono"
            suppressHydrationWarning
          >
            &copy; {new Date().getFullYear()} Desktop Kitchen
          </p>
        </div>
      </footer>
    </>
  );
};

export default Investors;
