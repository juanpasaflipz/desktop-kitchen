/**
 * Financing Consent Templates (EN/ES)
 *
 * LFPDPPP-compliant consent text for financial data processing.
 * Version-tracked for re-consent when terms change.
 */

export const CONSENT_VERSION = '1.0';

export const consentText = {
  en: {
    title: 'DATA PROCESSING CONSENT FOR FINANCIAL SERVICES',
    version: CONSENT_VERSION,
    sections: [
      {
        heading: '1. ANALYZE YOUR TRANSACTION DATA',
        body: 'We will process your order history, payment records, revenue patterns, and refund data to assess your restaurant\'s financial health and determine eligibility for working capital offers.',
      },
      {
        heading: '2. GENERATE A FINANCIAL PROFILE',
        body: 'We will create and maintain a financial profile for your restaurant that includes metrics such as monthly revenue, payment method distribution, revenue trends, and a composite risk score.',
      },
      {
        heading: '3. PRESENT FINANCING OFFERS',
        body: 'Based on your financial profile, we may present working capital offers with specific terms including advance amounts, repayment rates, and estimated repayment periods.',
      },
    ],
    dataWeAnalyze: {
      heading: 'DATA WE ANALYZE',
      items: [
        'Order totals, subtotals, tax, and tip amounts',
        'Payment methods used (card vs. cash)',
        'Order frequency and timing patterns',
        'Refund history',
        'Days of business operation',
      ],
    },
    dataWeDoNotAccess: {
      heading: 'DATA WE DO NOT ACCESS',
      items: [
        'Your personal bank accounts (unless you separately connect via Plaid)',
        'Your customers\' personal information',
        'Your employees\' personal information',
        'Credit bureau data',
      ],
    },
    rights: {
      heading: 'YOUR RIGHTS (ARCO)',
      items: [
        'Access: You may request a copy of your financial profile at any time',
        'Rectification: You may request correction of inaccurate data',
        'Cancellation: You may revoke this consent at any time from Settings > Financing',
        'Opposition: You may decline any financing offer without consequence',
      ],
      retention: 'Revoking consent will stop new analyses but will not delete historical data (retained for regulatory compliance for 5 years).',
    },
    transfer: {
      heading: 'DATA TRANSFER',
      body: 'Your data is NOT transferred to third parties. All processing occurs within Desktop Kitchen\'s systems. If a lending partner is integrated in the future, you will be notified and asked for additional consent.',
    },
    legal: {
      heading: 'LEGAL BASIS',
      body: 'This consent is governed by Mexican data protection law (Ley Federal de Proteccion de Datos Personales en Posesion de los Particulares — LFPDPPP) and our Privacy Policy. By enabling Financial Services, you authorize Desktop Kitchen to process your data as described above.',
    },
    intro: 'By enabling Financial Services, you authorize Desktop Kitchen to:',
  },

  es: {
    title: 'CONSENTIMIENTO DE PROCESAMIENTO DE DATOS PARA SERVICIOS FINANCIEROS',
    version: CONSENT_VERSION,
    sections: [
      {
        heading: '1. ANALIZAR TUS DATOS DE TRANSACCIONES',
        body: 'Procesaremos tu historial de pedidos, registros de pago, patrones de ingresos y datos de devoluciones para evaluar la salud financiera de tu restaurante y determinar la elegibilidad para ofertas de capital de trabajo.',
      },
      {
        heading: '2. GENERAR UN PERFIL FINANCIERO',
        body: 'Crearemos y mantendremos un perfil financiero de tu restaurante que incluye metricas como ingresos mensuales, distribucion de metodos de pago, tendencias de ingresos y un puntaje de riesgo compuesto.',
      },
      {
        heading: '3. PRESENTAR OFERTAS DE FINANCIAMIENTO',
        body: 'Basandonos en tu perfil financiero, podemos presentar ofertas de capital de trabajo con terminos especificos que incluyen montos de anticipo, tasas de reembolso y periodos estimados de pago.',
      },
    ],
    dataWeAnalyze: {
      heading: 'DATOS QUE ANALIZAMOS',
      items: [
        'Totales de pedidos, subtotales, impuestos y propinas',
        'Metodos de pago utilizados (tarjeta vs. efectivo)',
        'Frecuencia y patrones de horarios de pedidos',
        'Historial de devoluciones',
        'Dias de operacion del negocio',
      ],
    },
    dataWeDoNotAccess: {
      heading: 'DATOS A LOS QUE NO ACCEDEMOS',
      items: [
        'Tus cuentas bancarias personales (a menos que las conectes por separado via Plaid)',
        'Informacion personal de tus clientes',
        'Informacion personal de tus empleados',
        'Datos del buro de credito',
      ],
    },
    rights: {
      heading: 'TUS DERECHOS (ARCO)',
      items: [
        'Acceso: Puedes solicitar una copia de tu perfil financiero en cualquier momento',
        'Rectificacion: Puedes solicitar la correccion de datos inexactos',
        'Cancelacion: Puedes revocar este consentimiento en cualquier momento desde Configuracion > Financiamiento',
        'Oposicion: Puedes rechazar cualquier oferta de financiamiento sin consecuencia alguna',
      ],
      retention: 'Revocar el consentimiento detendra nuevos analisis pero no eliminara datos historicos (retenidos por cumplimiento regulatorio durante 5 anos).',
    },
    transfer: {
      heading: 'TRANSFERENCIA DE DATOS',
      body: 'Tus datos NO se transfieren a terceros. Todo el procesamiento ocurre dentro de los sistemas de Desktop Kitchen. Si un socio prestamista se integra en el futuro, seras notificado y se te pedira consentimiento adicional.',
    },
    legal: {
      heading: 'BASE LEGAL',
      body: 'Este consentimiento se rige por la ley mexicana de proteccion de datos personales (Ley Federal de Proteccion de Datos Personales en Posesion de los Particulares — LFPDPPP) y nuestra Politica de Privacidad. Al habilitar los Servicios Financieros, autorizas a Desktop Kitchen a procesar tus datos como se describe anteriormente.',
    },
    intro: 'Al habilitar los Servicios Financieros, autorizas a Desktop Kitchen a:',
  },
};

/**
 * Get formatted plain-text consent document.
 * @param {'en'|'es'} locale
 * @returns {string}
 */
export function getConsentDocument(locale = 'en') {
  const t = consentText[locale] || consentText.en;
  const lines = [];

  lines.push(t.title);
  lines.push(`Consent version: ${t.version}`);
  lines.push('');
  lines.push(t.intro);
  lines.push('');

  for (const section of t.sections) {
    lines.push(section.heading);
    lines.push(section.body);
    lines.push('');
  }

  lines.push(t.dataWeAnalyze.heading + ':');
  for (const item of t.dataWeAnalyze.items) {
    lines.push(`  - ${item}`);
  }
  lines.push('');

  lines.push(t.dataWeDoNotAccess.heading + ':');
  for (const item of t.dataWeDoNotAccess.items) {
    lines.push(`  - ${item}`);
  }
  lines.push('');

  lines.push(t.rights.heading + ':');
  for (const item of t.rights.items) {
    lines.push(`  - ${item}`);
  }
  lines.push(t.rights.retention);
  lines.push('');

  lines.push(t.transfer.heading + ':');
  lines.push(t.transfer.body);
  lines.push('');

  lines.push(t.legal.heading + ':');
  lines.push(t.legal.body);

  return lines.join('\n');
}
