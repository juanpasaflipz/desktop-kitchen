import type { NextPage } from "next";
import Head from "next/head";
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Invest in Desktop Kitchen — The Fintech Company Disguised as a POS",
    description:
      "Desktop Kitchen is building the Square of Latin America — a free POS that captures real-time transaction data from every restaurant it touches, then monetizes through merchant cash advances underwritten by proprietary sales data. Raising $5–8M.",
    url: "https://www.desktop.kitchen/investors",
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "Desktop Kitchen",
      url: "https://www.desktop.kitchen",
    },
    about: {
      "@type": "Organization",
      name: "Desktop Kitchen",
      url: "https://www.desktop.kitchen",
      description:
        "A fintech distribution network disguised as restaurant software. Free POS → transaction data → merchant cash advances.",
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
        <title>
          Invest in Desktop Kitchen — The Fintech Company Disguised as a POS
        </title>
        <meta
          name="description"
          content="Desktop Kitchen is building the Square of Latin America — a free POS that captures real-time transaction data from every restaurant it touches, then monetizes through merchant cash advances. Raising $5–8M."
        />
        <link
          rel="canonical"
          href="https://www.desktop.kitchen/investors"
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta
          property="og:title"
          content="Invest in Desktop Kitchen — The Fintech Company Disguised as a POS"
        />
        <meta
          property="og:description"
          content="Free POS → transaction data → merchant cash advances. The Square playbook for Latin America."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://www.desktop.kitchen/investors"
        />
        <meta
          property="og:image"
          content="https://www.desktop.kitchen/api/og?locale=en"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Invest in Desktop Kitchen — The Fintech Company Disguised as a POS"
        />
        <meta
          name="twitter:description"
          content="Free POS → transaction data → merchant cash advances. The Square playbook for Latin America."
        />
        <meta
          name="twitter:image"
          content="https://www.desktop.kitchen/api/og?locale=en"
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
        aria-label="Navigation"
      >
        <a
          href="https://www.desktop.kitchen"
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
            <a href="#thesis" className="hover:text-white/60 transition-colors">
              Thesis
            </a>
            <a href="#trojan-horse" className="hover:text-white/60 transition-colors">
              The Play
            </a>
            <a href="#flywheel" className="hover:text-white/60 transition-colors">
              Flywheel
            </a>
            <a href="#market" className="hover:text-white/60 transition-colors">
              Market
            </a>
            <a href="#invest" className="hover:text-white/60 transition-colors">
              The Ask
            </a>
          </div>
          <a
            href="#invest"
            className="bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors tracking-wider uppercase"
          >
            Book a Call &rarr;
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
            Raising $5&ndash;8M &middot; Mexico City &middot; 2026
          </div>

          <p className="text-sm text-white/30 uppercase tracking-[0.2em] mb-8 font-mono">
            The investment a16z was built to make
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tighter text-white max-w-4xl mx-auto">
            A fintech company{" "}
            <span className="text-teal-500">disguised</span>
            <br />
            as restaurant{" "}
            <span className="text-teal-500">software.</span>
          </h1>

          <p className="mt-8 text-base sm:text-lg text-white/40 max-w-2xl mx-auto leading-relaxed">
            We give restaurants the best free POS on the market. They give us
            real-time transaction data. Six months later, we underwrite merchant
            cash advances with better data than any bank in Latin America.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#invest"
              className="bg-teal-600 text-white font-semibold px-8 py-4 rounded text-sm uppercase tracking-wider transition-all duration-200 hover:bg-teal-700 active:scale-[0.98]"
            >
              Book a Call &rarr;
            </a>
            <a
              href="#thesis"
              className="text-white/40 font-medium text-sm uppercase tracking-wider hover:text-white/60 transition-colors duration-200"
            >
              See the Thesis &darr;
            </a>
          </div>

          {/* Stats bar */}
          <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 border border-white/10 rounded-2xl overflow-hidden bg-white/[0.03] backdrop-blur-sm">
            {[
              { value: "$0", label: "Cost to onboard a restaurant" },
              { value: "$65", label: "Hardware cost (Android tablet)" },
              { value: "6 mo", label: "Time to underwriting-ready data" },
              { value: "∞", label: "Restaurants that need financing" },
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
        {/* ─── 01 THESIS ─── */}
        <section
          id="thesis"
          className="py-24 md:py-40 px-6 bg-neutral-900"
          aria-labelledby="thesis-heading"
        >
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <SectionLabel number="01" label="The Thesis" />
              <h2
                id="thesis-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]"
              >
                Whoever owns the{" "}
                <span className="text-teal-500">payment flow</span> owns the
                restaurant.
              </h2>
              <p className="mt-6 text-lg text-white/40 max-w-xl">
                Square proved it in the US. Toast proved it in fine dining.
                Nobody has done it in Latin America&apos;s 680,000+ restaurants
                &mdash; a market where traditional banks won&apos;t lend, and
                delivery platforms take 30% while giving operators zero data.
              </p>
            </FadeIn>

            <div className="mt-16 md:mt-20 grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                    </svg>
                  ),
                  title: "Banks won't lend",
                  desc: "Mexican restaurants can't get capital. Traditional banks require collateral, 18+ months of tax filings, and credit history most operators don't have. The ones that do get loans pay 40%+ annual rates.",
                  impact: "→ $12B+ unmet credit demand in Mexican SMB food service",
                },
                {
                  icon: (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                    </svg>
                  ),
                  title: "POS systems are blind",
                  desc: "Every POS in Mexico shows what you sold. None of them show what you actually kept after Rappi's 30%, Uber's 28%, and DiDi's 25%. Operators are flying blind on their real margins.",
                  impact: "→ Average operator misjudges profitability by 12%",
                },
                {
                  icon: (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                  ),
                  title: "The data gap is the opportunity",
                  desc: "If you process a restaurant's payments, you have real-time revenue data that's better than anything a bank can get. You can underwrite an MCA in minutes — not weeks — with fundamentally lower default risk.",
                  impact: "→ This is exactly how Square Capital built a $9B lending book",
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
                &ldquo;The biggest fintech opportunities hide inside
                non-fintech products.&rdquo; &mdash; The a16z fintech playbook
              </p>
            </FadeIn>
          </div>
        </section>

        {/* ─── 02 THE TROJAN HORSE ─── */}
        <section
          id="trojan-horse"
          className="py-24 md:py-40 px-6 bg-neutral-950"
          aria-labelledby="trojan-heading"
        >
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <SectionLabel number="02" label="The Trojan Horse" />
              <h2
                id="trojan-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]"
              >
                The POS is the bait.
                <br />
                <span className="text-teal-500">
                  The data is the business.
                </span>
              </h2>
              <p className="mt-6 text-lg text-white/40 max-w-2xl">
                We built the most feature-rich POS on the Mexican market and
                gave it away for free. Loyalty programs, menu boards, delivery
                analytics, AI-powered upselling, CFDI invoicing, kitchen
                displays &mdash; every bell and whistle a restaurant operator
                could want. Not because we need the SaaS revenue. Because every
                restaurant that adopts our POS is a future financing customer.
              </p>
            </FadeIn>

            <div className="mt-16 md:mt-20 grid lg:grid-cols-2 gap-8 items-start">
              {/* The play - visual */}
              <FadeIn delay={0.1}>
                <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
                    <span className="w-3 h-3 rounded-full bg-red-500/60" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <span className="w-3 h-3 rounded-full bg-green-500/60" />
                    <span className="text-[10px] text-white/20 ml-2 font-mono">
                      the-trojan-horse.yml
                    </span>
                  </div>
                  <div className="p-6 font-mono text-sm leading-relaxed">
                    <p className="text-white/20"># The play</p>
                    <p className="text-white/50 mt-3">
                      step_1: <span className="text-teal-400">&quot;Give away the best free POS in Mexico&quot;</span>
                    </p>
                    <p className="text-white/50">
                      step_2: <span className="text-teal-400">&quot;Restaurant processes every transaction through us&quot;</span>
                    </p>
                    <p className="text-white/50">
                      step_3: <span className="text-teal-400">&quot;We see daily revenue, ticket sizes, seasonality&quot;</span>
                    </p>
                    <p className="text-white/50">
                      step_4: <span className="text-teal-400">&quot;Month 5: offer MCA based on real data&quot;</span>
                    </p>
                    <p className="text-white/50">
                      step_5: <span className="text-teal-400">&quot;Repayment auto-deducted from daily sales&quot;</span>
                    </p>
                    <p className="text-white/20 mt-3">
                      # The restaurant owner never felt sold a financial product.
                    </p>
                    <p className="text-white/20">
                      # Their POS just offered them capital they couldn&apos;t
                    </p>
                    <p className="text-white/20">
                      # get anywhere else, at terms no bank can match.
                    </p>
                    <p className="text-white/50 mt-3">
                      default_risk: <span className="text-teal-400">fundamentally_lower</span>
                    </p>
                    <p className="text-white/50">
                      reason: <span className="text-teal-400">&quot;we collect repayment at the point of sale&quot;</span>
                    </p>
                  </div>
                </div>
              </FadeIn>

              {/* Why it works */}
              <FadeIn delay={0.2}>
                <div className="space-y-4">
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-1">
                      Why the Trojan Horse Works
                    </h3>
                    <p className="text-xs text-white/20 mb-6">
                      Every layer reinforces the next
                    </p>

                    <div className="space-y-4">
                      {[
                        {
                          label: "Acquisition cost per restaurant",
                          value: "$0",
                        },
                        {
                          label: "Hardware (any Android tablet)",
                          value: "~$65 USD",
                        },
                        {
                          label: "Bells & whistles (loyalty, AI, delivery)",
                          value: "Retention hooks",
                        },
                        {
                          label: "Optional AI tier",
                          value: "$60/mo revenue",
                        },
                        {
                          label: "Time to underwriting-ready data",
                          value: "4–6 months",
                        },
                        {
                          label: "MCA repayment method",
                          value: "Auto % of daily sales",
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
                    The restaurant sees a great POS. We see an underwriting pipeline.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ─── 03 THE FLYWHEEL ─── */}
        <section
          id="flywheel"
          className="py-24 md:py-40 px-6 bg-neutral-900"
          aria-labelledby="flywheel-heading"
        >
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <SectionLabel number="03" label="The Flywheel" />
              <h2
                id="flywheel-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]"
              >
                Three revenue layers.{" "}
                <span className="text-teal-500">Each one funds the next.</span>
              </h2>
            </FadeIn>

            <div className="mt-16 md:mt-20 grid md:grid-cols-3 gap-6">
              {[
                {
                  tag: "Layer 1 — Adoption",
                  title: "Free POS",
                  desc: "A full-featured POS with loyalty, menu boards, delivery analytics, AI suggestions, kitchen displays, CFDI invoicing, and offline mode. Free forever. The most irresistible offer in the Mexican restaurant market. Every feature is a reason to switch — and a reason to stay.",
                  metric: "Cost: $0 per restaurant",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z" />
                    </svg>
                  ),
                },
                {
                  tag: "Layer 2 — SaaS",
                  title: "$60/mo AI Tier",
                  desc: "AI-powered dynamic pricing, upsell suggestions, prep forecasting, waste detection, and delivery margin optimization. The features that pay for themselves. Recurring revenue that subsidizes growth while the real monetization engine spins up.",
                  metric: "Target: 30% conversion to paid",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                  ),
                },
                {
                  tag: "Layer 3 — Fintech",
                  title: "Merchant Cash Advances",
                  desc: "After 4–6 months of transaction data, we know a restaurant's business better than their accountant. Daily sales velocity, seasonal patterns, platform mix, growth trends. We offer MCAs with automatic repayment deducted as a percentage of daily sales. Lower risk. Higher conversion. Better terms than any bank.",
                  metric: "This is where the real margin lives",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
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
                    <p className="mt-3 text-xs text-teal-500/80 font-mono tracking-wide">
                      {cap.metric}
                    </p>
                  </article>
                </FadeIn>
              ))}
            </div>

            {/* Precedent table */}
            <FadeIn delay={0.2}>
              <div className="mt-16 md:mt-20 rounded-2xl overflow-hidden border border-white/10">
                <div className="hidden md:grid grid-cols-4 bg-white/[0.06]">
                  <div className="px-6 py-4 text-white/30 font-semibold text-xs uppercase tracking-wider">
                    Company
                  </div>
                  <div className="px-6 py-4 text-white/30 font-semibold text-xs uppercase tracking-wider text-center">
                    Trojan Horse
                  </div>
                  <div className="px-6 py-4 text-white/30 font-semibold text-xs uppercase tracking-wider text-center">
                    Real Business
                  </div>
                  <div className="px-6 py-4 text-white/30 font-semibold text-xs uppercase tracking-wider text-center">
                    Lending Book
                  </div>
                </div>

                {[
                  {
                    company: "Square",
                    horse: "Card reader",
                    real: "Square Capital",
                    book: "$9.4B cumulative",
                  },
                  {
                    company: "Toast",
                    horse: "Restaurant POS",
                    real: "Toast Capital",
                    book: "$1.6B+ originated",
                  },
                  {
                    company: "Shopify",
                    horse: "E-commerce platform",
                    real: "Shopify Capital",
                    book: "$5B+ cumulative",
                  },
                  {
                    company: "Desktop Kitchen",
                    horse: "Free POS + AI",
                    real: "MCA platform",
                    book: "Building the pipeline",
                    highlight: true,
                  },
                ].map((row, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-1 md:grid-cols-4 border-t border-white/5 ${
                      row.highlight
                        ? "bg-teal-600/10 border-l-2 border-l-teal-500"
                        : i % 2 === 0
                        ? "bg-white/[0.02]"
                        : "bg-white/[0.01]"
                    }`}
                  >
                    <div className={`px-6 py-4 text-sm flex items-center font-semibold ${row.highlight ? "text-teal-400" : "text-white/60"}`}>
                      {row.company}
                    </div>
                    <div className="px-6 py-4 text-center hidden md:flex items-center justify-center text-sm text-white/40">
                      {row.horse}
                    </div>
                    <div className="px-6 py-4 text-center hidden md:flex items-center justify-center text-sm text-white/40">
                      {row.real}
                    </div>
                    <div className={`px-6 py-4 text-center hidden md:flex items-center justify-center text-sm font-semibold ${row.highlight ? "text-teal-400" : "text-white/40"}`}>
                      {row.book}
                    </div>
                    <div className="px-6 pb-4 md:hidden">
                      <span className="text-sm text-white/40">
                        {row.horse} → {row.real} → {row.book}
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
              <SectionLabel number="04" label="The Proof" />
              <h2
                id="proof-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]"
              >
                This isn&apos;t a deck.{" "}
                <span className="text-teal-500">
                  It&apos;s running in production.
                </span>
              </h2>
            </FadeIn>

            <div className="mt-16 md:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  value: "Live",
                  label: "Production system",
                  sub: "Desktop Kitchen runs live at Juanberto's California Burritos in Roma Sur, CDMX — processing real orders, real payments, real CFDI invoices. Not a sandbox. Not a demo.",
                },
                {
                  value: "60K+",
                  label: "Lines of production code",
                  sub: "Multi-tenant architecture with row-level security, offline support, AI intelligence layer, Stripe billing, delivery reconciliation, and native mobile apps. Enterprise-grade from day one.",
                },
                {
                  value: "2",
                  label: "App stores in review",
                  sub: "Google Play Store (in testing track — 9 days to production review) and Apple App Connect. Any $65 Android tablet becomes a full POS terminal with NFC tap-to-pay.",
                },
                {
                  value: "42+",
                  label: "API routes in production",
                  sub: "Orders, payments, inventory, AI, delivery intelligence, CFDI invoicing, loyalty, settlement, financing, banking integrations. This is a complete platform, not an MVP.",
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
                  Founder-Market Fit
                </h3>
                <p className="text-sm text-white/40 leading-relaxed mb-4">
                  Juan didn&apos;t pivot into fintech from a tech job. He ran a
                  restaurant — Juanberto&apos;s California Burritos — and
                  couldn&apos;t figure out why profitable-looking months felt
                  cash-poor. The answer: delivery platform commissions were
                  invisible in every POS he tried. So he built his own.
                </p>
                <p className="text-sm text-white/40 leading-relaxed mb-4">
                  But here&apos;s what makes this different: Juan&apos;s professional
                  background is in finance. Not restaurant tech. Not software.
                  Finance. He didn&apos;t stumble into the MCA opportunity — he
                  recognized it from day one. The POS was always the distribution
                  strategy for a financing business. Every feature, every bell and
                  whistle, was designed to make the bait irresistible.
                </p>
                <p className="text-sm text-white/40 leading-relaxed mb-6">
                  A restaurant operator who understands underwriting, building
                  the data pipeline he wishes he had as a lender. That&apos;s not
                  founder-market fit. That&apos;s founder-market destiny.
                </p>
                <blockquote className="text-base text-teal-400 italic border-l-2 border-teal-500/50 pl-4 leading-relaxed">
                  &ldquo;I didn&apos;t build a POS company that might do
                  lending someday. I built a lending company that uses a POS as
                  its distribution channel.&rdquo;
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
              <SectionLabel number="05" label="The Market" />
              <h2
                id="market-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]"
              >
                680K restaurants.{" "}
                <span className="text-teal-500">$12B+ in unmet lending demand.</span>
              </h2>
              <p className="mt-6 text-lg text-white/40 max-w-xl">
                Mexico&apos;s restaurant market is massive, underserved by
                technology, and starved of capital. The delivery boom created
                180K+ operators who process significant volume through platforms
                but can&apos;t get a bank loan. We&apos;re building the rails to
                serve them.
              </p>
            </FadeIn>

            <div className="mt-16 md:mt-20 grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[
                {
                  value: "$4.2B",
                  label: "Food Delivery GMV",
                  sub: "Mexico food delivery market 2024",
                },
                {
                  value: "680K+",
                  label: "Restaurants in Mexico",
                  sub: "Every one is a potential customer",
                },
                {
                  value: "180K+",
                  label: "Delivery-enabled",
                  sub: "Operators on Rappi, Uber Eats, DiDi",
                },
                {
                  value: "$12B+",
                  label: "Unmet SMB Credit Demand",
                  sub: "Mexican food service sector",
                },
                {
                  value: "38%",
                  label: "YoY Delivery Growth",
                  sub: "Delivery segment, 2022–2024",
                },
                {
                  value: "3×",
                  label: "Ghost Kitchen Growth",
                  sub: "Virtual brands in CDMX 2021→2024",
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
                  The structural moats are deep.{" "}
                  <strong className="text-teal-400">
                    CFDI 4.0 tax compliance
                  </strong>{" "}
                  blocks international POS companies from easy entry. The{" "}
                  <strong className="text-teal-400">
                    Rappi/Uber/DiDi trifecta
                  </strong>{" "}
                  is unique to Latin America — no US-built POS handles it. And
                  traditional banks{" "}
                  <strong className="text-teal-400">
                    structurally cannot underwrite
                  </strong>{" "}
                  these operators because they don&apos;t have access to
                  real-time transaction data.{" "}
                  <strong className="text-teal-400">We will.</strong>
                </p>
                <ul className="space-y-3">
                  {[
                    "Square and Toast have minimal Mexico presence",
                    "Local competitors (Parrot, etc.) are dine-in era tools",
                    "No competitor combines POS + data + financing",
                    "CFDI compliance creates a regulatory moat",
                  ].map((item, i) => (
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

        {/* ─── 06 THE ASK ─── */}
        <section
          id="opportunity"
          className="py-24 md:py-40 px-6 bg-neutral-950"
          aria-labelledby="opportunity-heading"
        >
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <SectionLabel number="06" label="Use of Funds" />
              <h2
                id="opportunity-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]"
              >
                $5&ndash;8M to{" "}
                <span className="text-teal-500">own the category.</span>
              </h2>
              <p className="mt-6 text-lg text-white/40 max-w-2xl">
                The product is built. The architecture is validated. The app
                stores are in review. What comes next is the land grab &mdash;
                getting restaurants on the platform as fast as possible so the
                fintech flywheel has the volume to spin.
              </p>
            </FadeIn>

            {/* Use of funds */}
            <div className="mt-16 md:mt-20 grid md:grid-cols-3 gap-6">
              {[
                {
                  pct: "50%",
                  title: "Sales & Distribution",
                  desc: "Commission-based street sales teams in CDMX, then Guadalajara and Monterrey. Door-to-door with a $65 tablet and a free POS. Every signup is a future financing customer. Speed of adoption is everything.",
                },
                {
                  pct: "30%",
                  title: "Engineering & Fintech Infrastructure",
                  desc: "MCA underwriting engine, credit scoring models, payment integration for automatic daily deductions, regulatory compliance, and continued POS feature development to keep the trojan horse irresistible.",
                },
                {
                  pct: "20%",
                  title: "Operations & Capital Reserve",
                  desc: "Initial MCA lending capital to prove the model, onboarding infrastructure, customer success, and the operational backbone to support rapid restaurant acquisition.",
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
                    <span className="text-white/20">//</span> Go-to-Market
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight mb-5">
                    Land grab,{" "}
                    <span className="text-teal-500">then monetize</span>
                  </h3>
                  <p className="text-sm text-white/40 leading-relaxed">
                    Phase 1 is pure adoption. Free POS, cheap hardware,
                    boots-on-the-ground sales team. Every restaurant we onboard
                    generates transaction data from day one — whether they pay us
                    or not. The MCA revenue kicks in at month 5. By month 12, the
                    unit economics flip and every restaurant is generating
                    fintech margin that dwarfs the SaaS revenue.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      n: "01",
                      title: "CDMX Dense Penetration",
                      desc: "Roma, Condesa, Polanco, Santa Fe — ghost kitchen clusters and delivery-heavy neighborhoods. Door-to-door with tablet demos. Target: 500 restaurants in 6 months.",
                    },
                    {
                      n: "02",
                      title: "First MCAs Deployed",
                      desc: "Month 5–6: first cohort of restaurants hits underwriting-ready data threshold. Deploy initial MCAs. Prove the model. Validate default rates against projections.",
                    },
                    {
                      n: "03",
                      title: "Guadalajara, Monterrey & Scale",
                      desc: "Expand sales teams to tier-2 cities. Remote onboarding. WhatsApp referral networks. Begin conversations with institutional capital partners for lending facility.",
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

        {/* ─── WHY A16Z ─── */}
        <section
          id="why-a16z"
          className="py-24 md:py-40 px-6 bg-neutral-900"
          aria-labelledby="why-heading"
        >
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <SectionLabel number="07" label="Why a16z" />
              <h2
                id="why-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]"
              >
                You backed this playbook{" "}
                <span className="text-teal-500">before.</span>
              </h2>
              <p className="mt-6 text-lg text-white/40 max-w-2xl">
                a16z has a thesis about embedded fintech — that the biggest
                financial services companies of the next decade will be
                companies that don&apos;t look like financial services companies.
                Desktop Kitchen is that thesis made real, in the largest
                Spanish-speaking market in the world.
              </p>
            </FadeIn>

            <div className="mt-16 md:mt-20 grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "You backed Rappi",
                  desc: "You saw that Latin American delivery was a generational opportunity. Desktop Kitchen is the infrastructure layer that helps the 180K+ restaurants on those platforms actually survive the commission structures you helped build.",
                },
                {
                  title: "You backed Toast & Square",
                  desc: "You understand that POS is a trojan horse for financial services. We're running the exact same playbook in a market 10x more underserved by traditional banking — with a founder who comes from the finance side, not the tech side.",
                },
                {
                  title: "You have a fintech thesis",
                  desc: "Every dollar of lending that moves from banks to embedded platforms is margin that accrues to software companies with distribution. We have the distribution strategy, the data pipeline, and a founder who knows how to build a lending book.",
                },
                {
                  title: "Latin America is your frontier",
                  desc: "Mexico is the entry point to a $650B+ LATAM restaurant market. Colombia, Argentina, and Chile have identical delivery dynamics, identical pain points, and identical unmet credit demand. Win Mexico, then expand with the same playbook.",
                },
              ].map((card, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300">
                    <h3 className="text-lg font-bold text-white mb-3">
                      {card.title}
                    </h3>
                    <p className="text-sm text-white/40 leading-relaxed">
                      {card.desc}
                    </p>
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
                $5&ndash;8M
              </span>
              <p className="text-sm text-white/30 mb-12 tracking-wide">
                Raising Now &mdash; Open Round
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2
                id="invest-heading"
                className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight mb-5"
              >
                The Square of Latin America{" "}
                <span className="text-teal-500">starts here.</span>
              </h2>
              <p className="text-lg text-white/40 mb-6 max-w-2xl mx-auto">
                A fintech company disguised as restaurant software. A free POS
                that&apos;s really a data pipeline. A lending business with
                built-in distribution and automatic repayment. Led by a finance
                professional who built the whole thing from inside his own
                restaurant.
              </p>
              <p className="text-base text-white/50 mb-12 max-w-xl mx-auto font-medium">
                The product is live. The app stores are in review. The sales
                team is assembling. The only thing missing is the fuel.
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
                <a
                  href="mailto:juan@injupe.com"
                  className="bg-teal-600 text-white font-semibold px-8 py-4 rounded text-sm uppercase tracking-wider transition-all duration-200 hover:bg-teal-700 active:scale-[0.98]"
                >
                  Schedule a Call &rarr;
                </a>
                <a
                  href="#"
                  className="text-teal-500 font-semibold px-8 py-4 rounded text-sm uppercase tracking-wider border border-teal-500/25 hover:bg-teal-600/10 transition-all"
                >
                  Download Deck
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5">
                <a
                  href="mailto:juan@injupe.com"
                  className="text-teal-500 hover:text-teal-400 text-sm font-semibold transition-colors"
                >
                  juan@injupe.com
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
            A fintech company disguised as restaurant software
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
