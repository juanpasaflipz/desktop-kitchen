import Head from "next/head";
import { useRouter } from "next/router";

export default function DataPolicy() {
  const { locale } = useRouter();
  const isSpanish = locale === "es";

  const title = isSpanish
    ? "Política de Datos — Desktop Kitchen"
    : "Data Policy — Desktop Kitchen";
  const canonical = isSpanish
    ? "https://es.desktop.kitchen/data-policy"
    : "https://www.desktop.kitchen/data-policy";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={canonical} />
      </Head>

      <div className="min-h-screen bg-neutral-950 text-white/70">
        {/* Header */}
        <header className="py-8 px-6 border-b border-white/5">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/logo.svg" alt="Desktop Kitchen" className="w-8 h-8" width={32} height={32} />
              <span className="text-xl font-black tracking-tighter text-white">Desktop Kitchen</span>
            </a>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-16">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-8">
            {isSpanish ? "Política de Datos" : "Data Policy"}
          </h1>

          <p className="text-sm text-white/30 mb-12">
            {isSpanish ? "Última actualización: abril 2026" : "Last updated: April 2026"}
          </p>

          <div className="space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-white mb-3">
                {isSpanish ? "1. Qué datos recopilamos" : "1. What data we collect"}
              </h2>
              <p>
                {isSpanish
                  ? "Desktop Kitchen recopila los datos que usted proporciona al registrarse (nombre, correo electrónico, nombre del restaurante) y los datos generados por el uso de nuestro sistema POS (órdenes, inventario, transacciones). No vendemos sus datos a terceros."
                  : "Desktop Kitchen collects data you provide when signing up (name, email, restaurant name) and data generated through your use of our POS system (orders, inventory, transactions). We do not sell your data to third parties."}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">
                {isSpanish ? "2. Cómo usamos sus datos" : "2. How we use your data"}
              </h2>
              <p>
                {isSpanish
                  ? "Usamos sus datos para operar el servicio POS, generar reportes para su restaurante, procesar pagos a través de Stripe, y mejorar nuestros servicios. Los datos de transacciones pueden usarse para evaluar elegibilidad de capital de trabajo."
                  : "We use your data to operate the POS service, generate reports for your restaurant, process payments via Stripe, and improve our services. Transaction data may be used to assess working capital eligibility."}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">
                {isSpanish ? "3. Almacenamiento y seguridad" : "3. Storage and security"}
              </h2>
              <p>
                {isSpanish
                  ? "Sus datos se almacenan en servidores seguros con cifrado en tránsito y en reposo. Utilizamos aislamiento por inquilino (Row Level Security) para garantizar que sus datos permanezcan privados."
                  : "Your data is stored on secure servers with encryption in transit and at rest. We use tenant isolation (Row Level Security) to ensure your data remains private."}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">
                {isSpanish ? "4. Procesamiento de pagos" : "4. Payment processing"}
              </h2>
              <p>
                {isSpanish
                  ? "Los pagos se procesan a través de Stripe. Desktop Kitchen no almacena números de tarjetas de crédito. Consulte la política de privacidad de Stripe para más información."
                  : "Payments are processed through Stripe. Desktop Kitchen does not store credit card numbers. Please refer to Stripe's privacy policy for details."}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">
                {isSpanish ? "5. Sus derechos" : "5. Your rights"}
              </h2>
              <p>
                {isSpanish
                  ? "Puede solicitar la exportación o eliminación de sus datos en cualquier momento contactándonos en hello@desktop.kitchen. Responderemos dentro de 30 días hábiles."
                  : "You can request export or deletion of your data at any time by contacting us at hello@desktop.kitchen. We will respond within 30 business days."}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">
                {isSpanish ? "6. Contacto" : "6. Contact"}
              </h2>
              <p>
                {isSpanish
                  ? "Para preguntas sobre esta política, escríbanos a hello@desktop.kitchen."
                  : "For questions about this policy, email us at hello@desktop.kitchen."}
              </p>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center">
            <a href="/" className="text-sm text-white/30 hover:text-teal-500 transition-colors">
              &larr; {isSpanish ? "Volver al inicio" : "Back to home"}
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
