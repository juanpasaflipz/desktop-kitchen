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

/* ── Section Label ── */

function SectionLabel({ number, label }: { number: string; label: string }) {
  return (
    <p className="text-xs uppercase tracking-[0.3em] text-teal-500/60 font-mono mb-6">
      {number} &mdash; {label}
    </p>
  );
}

/* ── Page ── */

const Investors: NextPage = () => {
  const { locale } = useRouter();
  const isSpanish = locale === "es";

  return (
    <>
      <Head>
        <title>
          {isSpanish
            ? "Inversionistas — Desktop Kitchen"
            : "Investors — Desktop Kitchen"}
        </title>
        <meta
          name="description"
          content={
            isSpanish
              ? "Desktop Kitchen: el primer POS nativo para delivery en México. Serie A — $2M. Conozca la oportunidad de inversión."
              : "Desktop Kitchen: Mexico's first delivery-native POS. Series A — $2M raise. Learn about the investment opportunity."
          }
        />
        <meta property="og:title" content="Investors — Desktop Kitchen" />
        <meta
          property="og:description"
          content="Mexico's first delivery-native POS. Series A — $2M raise."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={
            isSpanish
              ? "https://es.desktop.kitchen/investors"
              : "https://www.desktop.kitchen/investors"
          }
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {/* Top accent bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-teal-600 z-50"
        aria-hidden="true"
      />

      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between bg-neutral-950/85 backdrop-blur-md border-b border-white/5"
        aria-label="Investor navigation"
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
              Problem
            </a>
            <a href="#market" className="hover:text-white/60 transition-colors">
              Market
            </a>
            <a
              href="#solution"
              className="hover:text-white/60 transition-colors"
            >
              Solution
            </a>
            <a
              href="#traction"
              className="hover:text-white/60 transition-colors"
            >
              Traction
            </a>
            <a
              href="#pricing"
              className="hover:text-white/60 transition-colors"
            >
              Pricing
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
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-teal-500 border border-teal-500/30 px-4 py-1.5 rounded-full mb-10 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            Series A &mdash; $2M Raise
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tighter text-white max-w-4xl mx-auto">
            The POS that knows your{" "}
            <span className="text-teal-500">real</span> numbers after delivery
            fees
          </h1>

          <p className="mt-8 text-base sm:text-lg text-white/40 max-w-2xl mx-auto">
            Mexico&apos;s first delivery-native POS. Built for ghost kitchens
            and delivery-first operators who are done flying blind on Rappi, Uber
            Eats, and DiDi.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#invest"
              className="bg-teal-600 text-white font-semibold px-8 py-4 rounded text-sm uppercase tracking-wider transition-all duration-200 hover:bg-teal-700 active:scale-[0.98]"
            >
              Request a Demo
            </a>
            <a
              href="#solution"
              className="text-white/40 font-medium text-sm uppercase tracking-wider hover:text-white/60 transition-colors duration-200"
            >
              See the Product &darr;
            </a>
          </div>

          {/* Stats bar */}
          <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 border border-white/10 rounded-2xl overflow-hidden bg-white/[0.03] backdrop-blur-sm">
            {[
              { value: "$4.2B", label: "Mexico Delivery GMV" },
              { value: "180K+", label: "Restaurant Outlets" },
              { value: "38%", label: "YoY Market Growth" },
              { value: "30%", label: "Avg Platform Commission" },
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
        {/* ─── PROBLEM ─── */}
        <section
          id="problem"
          className="py-24 md:py-40 px-6 bg-neutral-900"
          aria-labelledby="problem-heading"
        >
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <SectionLabel number="01" label="The Problem" />
              <h2
                id="problem-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]"
              >
                Mexican restaurant operators are{" "}
                <span className="text-teal-500">flying blind</span>
              </h2>
              <p className="mt-6 text-lg text-white/40 max-w-xl">
                They know their gross sales. They have no idea what they
                actually kept after platform fees, refunds, and adjustments.
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
                  title: "The Commission Black Hole",
                  desc: "Rappi takes 25\u201332%. Uber Eats 28\u201335%. DiDi 20\u201328%. Operators watch sales roll in without knowing what actually hits their bank \u2014 sometimes days later, never reconciled automatically.",
                  impact:
                    "\u2192 Average operator overpays or undercharges by 12% of revenue",
                },
                {
                  icon: (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                  ),
                  title: "Multi-Brand Chaos",
                  desc: "A single kitchen running 3\u20135 virtual brands across 3 delivery platforms means managing 15 separate dashboards. No unified view of which brand, which platform, which item is actually profitable.",
                  impact:
                    "\u2192 2\u20134 hours/week in manual reporting per operator",
                },
                {
                  icon: (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  ),
                  title: "Locked Customer Data",
                  desc: "Rappi owns the customer. Uber Eats owns the customer. The restaurant operator never gets a name, phone number, or email. Every repeat order is commission forever \u2014 there\u2019s no way out of the platform trap.",
                  impact:
                    "\u2192 0% direct customer retention for 90% of operators",
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
          </div>
        </section>

        {/* ─── MARKET ─── */}
        <section
          id="market"
          className="py-24 md:py-40 px-6 bg-neutral-950"
          aria-labelledby="market-heading"
        >
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <SectionLabel number="02" label="The Market" />
              <h2
                id="market-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]"
              >
                A $420M SAM in a{" "}
                <span className="text-teal-500">pre-AI era</span> competitive
                landscape
              </h2>
              <p className="mt-6 text-lg text-white/40 max-w-xl">
                Every major competitor was built for dine-in, before delivery
                became the dominant channel. The category is wide open.
              </p>
            </FadeIn>

            <div className="mt-16 md:mt-20 grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[
                {
                  value: "$4.2B",
                  label: "Total Delivery GMV",
                  sub: "Mexico food delivery market 2024",
                },
                {
                  value: "180K+",
                  label: "Restaurant Outlets",
                  sub: "Delivery-enabled in Mexico",
                },
                {
                  value: "38%",
                  label: "YoY Growth",
                  sub: "Delivery segment, 2022\u20132024",
                },
                {
                  value: "$420M",
                  label: "Serviceable SAM",
                  sub: "5+ delivery-revenue operators",
                },
                {
                  value: "94%",
                  label: "WhatsApp Penetration",
                  sub: "Mexican smartphone users",
                },
                {
                  value: "3\u00d7",
                  label: "Ghost Kitchen Growth",
                  sub: "Virtual brands in CDMX 2021\u21922024",
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

            {/* Market insight */}
            <FadeIn delay={0.2}>
              <div className="mt-12 bg-teal-600/5 border border-teal-500/15 rounded-2xl p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center">
                <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                  The Mexican delivery market is structurally different.{" "}
                  <strong className="text-teal-400">
                    Rappi, Uber Eats, and DiDi Food
                  </strong>{" "}
                  dominate with aggressive commission structures that no existing
                  POS vendor was designed to track or fight. CFDI tax invoicing
                  requirements create natural moats against international
                  players.{" "}
                  <strong className="text-teal-400">
                    This market needs a native solution.
                  </strong>
                </p>
                <ul className="space-y-3">
                  {[
                    "No major POS player has delivery-native margin tracking",
                    "Square and Toast have minimal Mexico presence",
                    "Local competitors lack AI capabilities and iOS support",
                    "WhatsApp Business creates a customer recapture channel unavailable elsewhere",
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

        {/* ─── SOLUTION ─── */}
        <section
          id="solution"
          className="py-24 md:py-40 px-6 bg-neutral-900"
          aria-labelledby="solution-heading"
        >
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <SectionLabel number="03" label="The Solution" />
              <h2
                id="solution-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]"
              >
                Desktop Kitchen:{" "}
                <span className="text-teal-500">delivery-first</span> POS with
                AI margin intelligence
              </h2>
              <p className="mt-6 text-lg text-white/40 max-w-xl">
                Four product pillars that no competitor combines in a single
                platform.
              </p>
            </FadeIn>

            <div className="mt-16 md:mt-20 grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  ),
                  title: "Real Margin Intelligence",
                  desc: "See actual profit after Rappi, Uber Eats, and DiDi fees \u2014 per item, per brand, per platform. Automatic bank reconciliation matches platform deposits to expected payouts with fuzzy-matching AI. Know your real P&L without a spreadsheet.",
                  tag: "Live at Juanberto\u2019s \u2713",
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z" />
                    </svg>
                  ),
                  title: "Multi-Brand Ghost Kitchen Management",
                  desc: "Run 5 virtual brands from one kitchen with one POS. Separate menus, separate analytics, one unified order queue. Maximize revenue from fixed costs without operational chaos.",
                  tag: "Up to 10 brands per location",
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                  ),
                  title: "iOS-Native Front of House",
                  desc: "Native iOS app submitted to the App Store. Offline-first architecture \u2014 orders work even when the internet drops. The only delivery-focused POS with a true native mobile experience in Mexico.",
                  tag: "App Store Submitted",
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                    </svg>
                  ),
                  title: "WhatsApp Customer Recapture",
                  desc: "Break free from the platform trap. Capture customer intent signals and re-engage through WhatsApp Business \u2014 building a direct channel that costs zero commission. Turn platform customers into loyal direct ones.",
                  tag: "CFDI Invoicing Integrated",
                },
              ].map((pillar, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 flex gap-5 items-start h-full">
                    <div className="w-12 h-12 rounded-lg bg-teal-600/10 border border-teal-500/20 flex items-center justify-center text-teal-500 flex-shrink-0">
                      {pillar.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white mb-2">
                        {pillar.title}
                      </h3>
                      <p className="text-sm text-white/40 leading-relaxed">
                        {pillar.desc}
                      </p>
                      <span className="inline-block mt-3 text-[10px] font-mono tracking-wider text-teal-500/70 border border-teal-500/20 px-2.5 py-0.5 rounded-full">
                        {pillar.tag}
                      </span>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TRACTION ─── */}
        <section
          id="traction"
          className="py-24 md:py-40 px-6 bg-neutral-950"
          aria-labelledby="traction-heading"
        >
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <SectionLabel number="04" label="Traction" />
              <h2
                id="traction-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]"
              >
                Built in a real kitchen.{" "}
                <span className="text-teal-500">Tested in production</span>{" "}
                every day.
              </h2>
              <p className="mt-6 text-lg text-white/40 max-w-xl">
                Juanberto&apos;s California Burritos in Roma Sur, Mexico City,
                is both the proof-of-concept and the product laboratory.
              </p>
            </FadeIn>

            <div className="mt-16 md:mt-20 grid lg:grid-cols-2 gap-8 items-start">
              {/* Stats column */}
              <div className="space-y-4">
                {[
                  {
                    value: "60K+",
                    label:
                      "Lines of production-grade code with enterprise security",
                  },
                  {
                    value: "100%",
                    label:
                      "Multi-tenant isolation with row-level PostgreSQL security",
                  },
                  {
                    value: "3",
                    label:
                      "Delivery platforms integrated \u2014 Rappi \u00b7 Uber Eats \u00b7 DiDi Food",
                  },
                  {
                    value: "<5min",
                    label:
                      "Zero-to-first-order onboarding target for new customers",
                  },
                ].map((stat, i) => (
                  <FadeIn key={i} delay={i * 0.08}>
                    <div className="flex items-center gap-5 p-5 bg-white/[0.03] border border-white/5 rounded-xl border-l-2 border-l-teal-500">
                      <span className="text-2xl font-black text-teal-400 min-w-[80px]">
                        {stat.value}
                      </span>
                      <span className="text-sm text-white/40 leading-snug">
                        {stat.label}
                      </span>
                    </div>
                  </FadeIn>
                ))}
              </div>

              {/* Story column */}
              <FadeIn delay={0.15}>
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-white mb-4">
                    The Founder-Market Fit Story
                  </h3>
                  <p className="text-sm text-white/40 leading-relaxed mb-4">
                    Juan built Desktop Kitchen out of personal frustration.
                    Running Juanberto&apos;s California Burritos, he
                    couldn&apos;t figure out why profitable-looking months felt
                    cash-poor. The answer: platform commissions were invisible in
                    every POS he tried.
                  </p>
                  <p className="text-sm text-white/40 leading-relaxed mb-6">
                    He built the reconciliation engine first &mdash; for himself.
                    Then the multi-brand management. Then the CFDI invoicing.
                    Everything you see in the product today was validated on real
                    orders at a real restaurant before a single external customer
                    saw it.
                  </p>
                  <blockquote className="text-base text-teal-400 italic border-l-2 border-teal-500/50 pl-4 leading-relaxed">
                    &ldquo;Most POS systems show you what you sold. They
                    don&apos;t show you what you actually kept after the platform
                    took their 30%. We do.&rdquo;
                  </blockquote>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ─── COMPETITIVE ─── */}
        <section
          id="competitive"
          className="py-24 md:py-40 px-6 bg-neutral-900"
          aria-labelledby="competitive-heading"
        >
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <SectionLabel number="05" label="Competitive Landscape" />
              <h2
                id="competitive-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]"
              >
                No one else is solving{" "}
                <span className="text-teal-500">delivery-first</span> ops in
                Mexico
              </h2>
              <p className="mt-6 text-lg text-white/40 max-w-xl">
                The category is pre-AI and built for a world that no longer
                exists. We&apos;re positioned to own it.
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="mt-16 md:mt-20 rounded-2xl overflow-hidden border border-white/10">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-4 bg-white/[0.06]">
                  <div className="px-6 py-4 text-white/30 font-semibold text-xs uppercase tracking-wider">
                    Feature
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

                {/* Rows */}
                {[
                  {
                    feat: "Real margin after delivery fees",
                    dk: true,
                    sq: false,
                    lp: false,
                  },
                  {
                    feat: "Multi-brand ghost kitchen management",
                    dk: true,
                    sq: false,
                    lp: "partial",
                  },
                  {
                    feat: "Mexico delivery platform integration",
                    dk: true,
                    sq: false,
                    lp: false,
                  },
                  {
                    feat: "AI pricing & margin intelligence",
                    dk: true,
                    sq: false,
                    lp: false,
                  },
                  {
                    feat: "WhatsApp customer recapture",
                    dk: true,
                    sq: false,
                    lp: false,
                  },
                  {
                    feat: "CFDI invoicing (Mexico tax compliance)",
                    dk: true,
                    sq: false,
                    lp: "partial",
                  },
                  {
                    feat: "iOS-native offline app",
                    dk: true,
                    sq: "partial",
                    lp: false,
                  },
                  {
                    feat: "Bank reconciliation (fuzzy matching)",
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
                        className={`px-6 py-4 text-center hidden md:flex items-center justify-center ${
                          cell.highlight ? "" : ""
                        }`}
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
                            Partial
                          </span>
                        )}
                      </div>
                    ))}
                    {/* Mobile: show only DK status */}
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

        {/* ─── PRICING ─── */}
        <section
          id="pricing"
          className="py-24 md:py-40 px-6 bg-neutral-950"
          aria-labelledby="pricing-heading"
        >
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <SectionLabel number="06" label="Business Model" />
              <h2
                id="pricing-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]"
              >
                SaaS pricing designed for{" "}
                <span className="text-teal-500">Mexican operators</span>
              </h2>
              <p className="mt-6 text-lg text-white/40 max-w-xl">
                Significantly below established competitors while offering
                superior AI capabilities. Promoter code MEXICO50 gives 50% off
                year one.
              </p>
            </FadeIn>

            <div className="mt-16 md:mt-20 grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Starter",
                  price: "$29",
                  period: "per month \u00b7 1 brand",
                  featured: false,
                  features: [
                    { text: "1 virtual brand", active: true },
                    { text: "Rappi, Uber Eats & DiDi integration", active: true },
                    { text: "Commission tracking per platform", active: true },
                    { text: "Basic delivery P&L reports", active: true },
                    { text: "Multiple virtual brands", active: false },
                    { text: "AI upselling & dynamic pricing", active: false },
                    { text: "SMS customer recapture", active: false },
                  ],
                  cta: "Get Started",
                },
                {
                  name: "Pro",
                  price: "$79",
                  period: "per month \u00b7 up to 3 brands",
                  featured: true,
                  badge: "Most Popular",
                  features: [
                    { text: "Up to 3 virtual brands", active: true },
                    { text: "All 3 delivery platforms", active: true },
                    { text: "Full margin intelligence", active: true },
                    { text: "AI-powered upselling engine", active: true },
                    { text: "SMS customer recapture", active: true },
                    { text: "Full multi-brand P&L by platform", active: true },
                    { text: "Unlimited brands", active: false },
                  ],
                  cta: "Get Started",
                },
                {
                  name: "Ghost Kitchen",
                  price: "$129",
                  period: "per month \u00b7 unlimited brands",
                  featured: false,
                  features: [
                    { text: "Unlimited virtual brands", active: true },
                    { text: "Unlimited locations", active: true },
                    { text: "Multi-location dashboard", active: true },
                    { text: "Cross-brand inventory pooling", active: true },
                    { text: "Dedicated onboarding & setup", active: true },
                    { text: "WhatsApp Business integration", active: true },
                    { text: "Priority phone & WhatsApp support", active: true },
                  ],
                  cta: "Contact Sales",
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
                              feat.active
                                ? "text-teal-500"
                                : "text-white/15"
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

        {/* ─── GO-TO-MARKET ─── */}
        <section
          id="gtm"
          className="py-24 md:py-40 px-6 bg-neutral-900"
          aria-labelledby="gtm-heading"
        >
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <SectionLabel number="07" label="Go-to-Market" />
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="bg-teal-600/5 border border-teal-500/15 rounded-2xl p-8 md:p-12 grid lg:grid-cols-2 gap-10 items-start">
                <div>
                  <p className="text-[11px] font-mono text-teal-500/60 tracking-wider mb-4 flex items-center gap-2">
                    <span className="text-white/20">//</span> Founder-Market Fit
                  </p>
                  <h2
                    id="gtm-heading"
                    className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight mb-5"
                  >
                    Built by an operator,{" "}
                    <span className="text-teal-500">for operators</span>
                  </h2>
                  <p className="text-sm text-white/40 leading-relaxed mb-4">
                    Desktop Kitchen isn&apos;t a tech company that decided to
                    enter restaurants. It&apos;s a restaurant operator who built
                    the tools he needed and is now offering them to 180,000
                    operators facing the same problems.
                  </p>
                  <p className="text-sm text-white/40 leading-relaxed">
                    The door-to-door sales team launching in Mexico City targets
                    operators doing 50%+ of revenue through delivery platforms
                    &mdash; the exact people who feel the pain most acutely.
                    Commission-only reps. Tight geography. Story-led selling.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      n: "01",
                      title: "CDMX Dense Penetration",
                      desc: "Roma, Condesa, Polanco, Santa Fe \u2014 ghost kitchen clusters. Door-to-door with MEXICO50 campaign.",
                    },
                    {
                      n: "02",
                      title: "Guadalajara & Monterrey",
                      desc: "Second-tier expansion with remote onboarding. Referral program through WhatsApp networks.",
                    },
                    {
                      n: "03",
                      title: "LATAM Expansion",
                      desc: "Colombia, Argentina, Chile \u2014 same delivery platform dynamics, same pain points, same product.",
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
                Series A Raise &mdash; Open Now
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2
                id="invest-heading"
                className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight mb-5"
              >
                We&apos;re raising $2M to{" "}
                <span className="text-teal-500">own</span> the delivery-first
                POS category in Mexico
              </h2>
              <p className="text-lg text-white/40 mb-12 max-w-2xl mx-auto">
                The market is proven. The product is live. The pain is daily.
                Join us before this category has a leader.
              </p>
            </FadeIn>

            {/* Fund breakdown */}
            <FadeIn delay={0.2}>
              <div className="flex flex-wrap gap-4 justify-center mb-14">
                {[
                  { pct: "40%", use: "Sales & Marketing" },
                  { pct: "35%", use: "Engineering & Product" },
                  { pct: "25%", use: "Ops & Customer Success" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-center min-w-[160px]"
                  >
                    <span className="text-xl font-black text-teal-400 block">
                      {item.pct}
                    </span>
                    <span className="text-xs text-white/30 mt-1 block">
                      {item.use}
                    </span>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* CTAs */}
            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
                <a
                  href="mailto:hello@desktop.kitchen"
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

            {/* Contact block */}
            <FadeIn delay={0.35}>
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
          <p
            className="text-xs text-white/15 font-mono"
            suppressHydrationWarning
          >
            &copy; {new Date().getFullYear()} Desktop Kitchen &middot;
            www.desktop.kitchen &middot; Series A
          </p>
        </div>
      </footer>
    </>
  );
};

export default Investors;
