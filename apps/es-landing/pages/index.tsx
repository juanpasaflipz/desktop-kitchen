import type { NextPage } from "next";
import Head from "next/head";
import { useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

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

const LEADS_API = "https://pos.desktop.kitchen/api/leads";
const WHATSAPP_PHONE = "5215512345678";
const WHATSAPP_MESSAGE = "¡Hola! Quiero saber más sobre Juanberto's 🌯";

const Home: NextPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Ingresa tu correo.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Correo no válido.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(LEADS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "es_landing" }),
      });
      if (res.status === 429) {
        setError("Demasiadas solicitudes. Intenta en unos minutos.");
        return;
      }
      if (!res.ok) {
        setError("Algo salió mal. Intenta de nuevo.");
        return;
      }
      setSubmitted(true);
      setEmail("");
    } catch {
      setError("Sin conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>JUANBERTO&apos;S — Burritos Californianos — Roma Sur, CDMX</title>
      </Head>

      {/* Top accent bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-red-600 z-50" />

      {/* Language switcher */}
      <a
        href="https://www.juanbertos.com"
        className="fixed top-4 right-6 z-50 text-[11px] uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition-colors duration-200 font-mono"
      >
        English
      </a>

      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <header
        ref={heroRef}
        className="relative flex min-h-screen items-center justify-center overflow-hidden hero-bg"
      >
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease }}
            className="mb-10"
          >
            <img
              src="/logo.png"
              alt="Juanberto's Burritos Californianos"
              className="mx-auto w-64 sm:w-80 md:w-96"
            />
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.85] tracking-tighter text-white"
          >
            ROMA SUR
            <br />
            <span className="text-red-600">NO ESTÁ LISTA.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease }}
            className="mt-8 text-base sm:text-lg md:text-xl text-white/40 font-medium"
          >
            Burritos californianos. Próxima apertura.
          </motion.p>

          {/* Location tag */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.95, ease }}
            className="mt-4 text-xs uppercase tracking-[0.3em] text-white/20 font-mono"
          >
            Coahuila 192 — Roma Sur — CDMX
          </motion.p>

          {/* Email capture */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease }}
            className="mt-14 sm:mt-16"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease }}
                className="max-w-md mx-auto"
              >
                <p className="text-2xl font-bold text-white">
                  ¡Estás dentro!
                </p>
                <p className="mt-2 text-sm text-white/40">
                  Te avisaremos antes de abrir.
                </p>
                <a
                  href="https://www.instagram.com/juanbertos.california.burritos/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors font-semibold"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Seguir @juanbertos.california.burritos
                </a>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="tu@correo.com"
                    className="flex-1 bg-white/5 border border-white/10 rounded px-5 py-4 text-white placeholder:text-white/25 outline-none transition-all duration-200 focus:border-red-600/50 focus:bg-white/[0.08] text-sm"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-red-600 text-white font-semibold px-8 py-4 rounded text-sm uppercase tracking-wider transition-all duration-200 hover:bg-red-700 active:scale-[0.98] whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Enviando..." : "Avísame"}
                  </button>
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-sm text-red-400"
                  >
                    {error}
                  </motion.p>
                )}
                <p className="mt-4 text-xs text-white/20">
                  Lista de acceso anticipado limitada. Sin spam. Nunca.
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/20 to-transparent animate-pulse" />
        </motion.div>
      </header>

      <main>
        {/* ════════════════════════════════════════
            PRODUCT
        ════════════════════════════════════════ */}
        <section id="producto" className="py-24 md:py-40 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-neutral-950 leading-[0.85]">
                UNA COSA.
                <br />
                BIEN HECHA.
              </h2>
            </FadeIn>

            <div className="mt-16 md:mt-20 grid md:grid-cols-2 gap-12 md:gap-16">
              <FadeIn delay={0.1}>
                <p className="text-lg text-neutral-500 leading-relaxed">
                  Nacido en San Diego. Forjado en la calle. El burrito
                  californiano es carne asada, papas fritas, queso y nada más.
                  Sin arroz. Sin frijoles. Sin relleno. Solo algo enorme,
                  indulgente y perfecto.
                </p>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="space-y-6">
                  {["Carne asada de verdad", "Papas frescas adentro", "Sin atajos"].map(
                    (item) => (
                      <div key={item} className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-red-600 rounded-full shrink-0" />
                        <span className="text-lg font-semibold text-neutral-950">
                          {item}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.15}>
              <div className="mt-20 pt-16 border-t border-neutral-200">
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-950 leading-snug">
                  Las papas van adentro.
                  <br />
                  <span className="text-red-600">Ese es el punto.</span>
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ════════════════════════════════════════
            BEER
        ════════════════════════════════════════ */}
        <section id="cerveza" className="py-24 md:py-40 px-6 bg-neutral-50">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-neutral-950 leading-[0.85]">
                SÍ, TENEMOS
                <br />
                <span className="text-red-600">CERVEZA FRÍA.</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="mt-10 text-lg text-neutral-500 max-w-lg mx-auto leading-relaxed">
                Cerveza de barril. Fría. Bien maridada. Porque un burrito
                californiano sin una cerveza fría es una oportunidad perdida.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* ════════════════════════════════════════
            LOCATION
        ════════════════════════════════════════ */}
        <section id="ubicacion" className="py-24 md:py-40 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
              <FadeIn>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 font-mono mb-6">
                    Ubicación
                  </p>
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-neutral-950 leading-[0.85]">
                    COAHUILA
                    <br />
                    192
                  </h2>
                  <p className="mt-4 text-xl text-neutral-500">
                    Roma Sur, CDMX
                  </p>
                  <div className="mt-8 inline-flex items-center gap-2.5 bg-red-50 text-red-600 px-5 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wider">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-600 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
                    </span>
                    Próxima Apertura
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="aspect-square md:aspect-[4/3] bg-neutral-100 border border-neutral-200 rounded flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.04]">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={`h-${i}`}
                        className="absolute left-0 right-0 h-px bg-neutral-950"
                        style={{ top: `${(i + 1) * 11.1}%` }}
                      />
                    ))}
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={`v-${i}`}
                        className="absolute top-0 bottom-0 w-px bg-neutral-950"
                        style={{ left: `${(i + 1) * 11.1}%` }}
                      />
                    ))}
                  </div>

                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="text-sm text-neutral-400 font-medium">
                      Coahuila 192, Roma Sur
                    </p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            SOCIAL / FOLLOW
        ════════════════════════════════════════ */}
        <section className="py-24 md:py-32 px-6 bg-neutral-950">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-white/30 font-mono mb-6">
                Instagram
              </p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.85]">
                SIGUE LA LEYENDA.
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <a
                href="https://www.instagram.com/juanbertos.california.burritos/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-3 text-xl sm:text-2xl text-red-500 font-bold hover:text-red-400 transition-colors duration-200 group"
              >
                <svg
                  className="w-6 h-6 transition-transform duration-200 group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                @juanbertos.california.burritos
              </a>
              <p className="mt-4 text-sm text-white/25">
                Míranos construirlo. Sin filtros.
              </p>
            </FadeIn>
          </div>
        </section>
      </main>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer className="py-12 px-6 bg-neutral-950 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl sm:text-2xl font-black tracking-tighter text-white">
            JUANBERTO&apos;S
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-white/40 hover:text-green-400 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
          <p className="mt-4 text-xs text-white/15">
            &copy; {new Date().getFullYear()} Juanberto&apos;s. Todos los
            derechos reservados.
          </p>
        </div>
      </footer>
    </>
  );
};

export default Home;
