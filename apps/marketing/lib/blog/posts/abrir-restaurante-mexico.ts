import { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "abrir-restaurante-mexico",
  title: "Cómo Abrir un Restaurante en México: Requisitos Legales, Permisos, Costos y Planeación Financiera",
  excerpt:
    "Guía completa para abrir tu restaurante en México en 2026: todos los trámites legales, permisos municipales y federales, costos reales en MXN, elección de local y planeación financiera para sobrevivir el primer año.",
  category: "guias",
  date: "2026-03-05",
  readTime: 12,
  author: {
    name: "Equipo Desktop Kitchen",
    role: { en: "Desktop Kitchen Team", es: "Equipo Desktop Kitchen" },
  },
  content: [
    {
      type: "paragraph",
      text: "México es uno de los mercados gastronómicos más dinámicos de América Latina. Según datos del INEGI, la industria restaurantera genera más de 2 millones de empleos directos y representa aproximadamente el 15.3% del PIB turístico nacional. Cada año se abren decenas de miles de establecimientos de alimentos y bebidas en el país — pero la realidad es que entre el 60% y el 80% cierra antes de cumplir dos años de operación. La diferencia entre quienes sobreviven y quienes no rara vez es la calidad de la comida; casi siempre es la falta de planeación legal, financiera y operativa. Esta guía te lleva paso a paso por todo lo que necesitas saber antes de abrir las puertas de tu restaurante.",
    },
    {
      type: "stats",
      items: [
        { value: "700,000+", label: "Establecimientos de alimentos y bebidas registrados en México (INEGI 2025)" },
        { value: "15.3%", label: "Participación de restaurantes en el PIB turístico nacional" },
        { value: "60–80%", label: "Restaurantes que cierran antes de cumplir 2 años" },
        { value: "$350K–$1.5M", label: "Inversión inicial promedio para un restaurante pequeño-mediano (MXN)" },
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "El panorama del mercado restaurantero mexicano",
      id: "panorama-mercado",
    },
    {
      type: "paragraph",
      text: "La Cámara Nacional de la Industria de Restaurantes y Alimentos Condimentados (CANIRAC) reportó que el sector alcanzó una recuperación del 98% respecto a niveles prepandemia para finales de 2025, con un crecimiento sostenido del 4.2% anual en ventas reales. Los segmentos de mayor crecimiento son comida casual rápida, dark kitchens y conceptos especializados (ramen, poke, cocina regional elevada). Las ciudades con mayor apertura de nuevos establecimientos son Ciudad de México, Monterrey, Guadalajara, Puebla y Querétaro, aunque ciudades intermedias como Mérida, León y San Luis Potosí están mostrando tasas de crecimiento superiores al promedio nacional.",
    },
    {
      type: "paragraph",
      text: "El consumidor mexicano destina en promedio el 34% de su gasto en alimentos a comidas fuera del hogar, una cifra que ha crecido consistentemente en la última década. El ticket promedio en restaurantes de servicio completo ronda los $280–$450 MXN por persona, mientras que en conceptos casuales y rápidos se ubica entre $120 y $220 MXN. El delivery, impulsado por Rappi, Uber Eats y DiDi Food, ya representa entre el 15% y el 30% de las ventas de muchos restaurantes urbanos.",
    },
    {
      type: "heading",
      level: 2,
      text: "Requisitos legales y permisos obligatorios",
      id: "requisitos-legales",
    },
    {
      type: "paragraph",
      text: "Abrir un restaurante en México requiere cumplir con trámites a nivel federal, estatal y municipal. El orden exacto y los nombres de los trámites pueden variar ligeramente según el municipio, pero estos son los permisos fundamentales que necesitas en prácticamente cualquier ciudad del país. Te recomendamos empezar los trámites al menos 3 meses antes de tu fecha de apertura planeada.",
    },
    {
      type: "heading",
      level: 3,
      text: "1. Registro Federal de Contribuyentes (RFC)",
      id: "rfc",
    },
    {
      type: "paragraph",
      text: "El primer paso es darte de alta ante el SAT. Si operarás como persona física con actividad empresarial, necesitas tu RFC con obligaciones fiscales actualizadas. Si constituirás una sociedad (S.A. de C.V., S.A.S., etc.), primero debes constituir la empresa ante notario y luego obtener el RFC de la persona moral. El régimen fiscal más común para restaurantes pequeños es el Régimen Simplificado de Confianza (RESICO) si facturas menos de $3.5 millones anuales, o el Régimen General de Ley para negocios más grandes. Costo: gratuito el trámite del RFC; la constitución de una sociedad ante notario va de $8,000 a $25,000 MXN dependiendo del tipo de sociedad y la entidad federativa.",
    },
    {
      type: "heading",
      level: 3,
      text: "2. Licencia de Uso de Suelo",
      id: "uso-de-suelo",
    },
    {
      type: "paragraph",
      text: "Este permiso municipal verifica que el local que elegiste está zonificado para uso comercial de alimentos y bebidas. Es el trámite que más retrasa aperturas porque depende de la ubicación específica. No firmes contrato de arrendamiento sin antes verificar que el uso de suelo permite giro restaurantero. Costo: $1,500 a $8,000 MXN según el municipio. Tiempo: 5 a 30 días hábiles.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "No firmes renta sin verificar uso de suelo",
      text: "El error más caro que cometen los nuevos restauranteros es rentar un local, invertir en remodelación y luego descubrir que el uso de suelo no permite alimentos y bebidas, o que la zona tiene restricciones de horario o venta de alcohol. Antes de comprometerte con cualquier local, solicita una constancia de uso de suelo en la oficina de desarrollo urbano de tu municipio. Este trámite de verificación es rápido y gratuito o de bajo costo.",
    },
    {
      type: "heading",
      level: 3,
      text: "3. Licencia de Funcionamiento",
      id: "licencia-funcionamiento",
    },
    {
      type: "paragraph",
      text: "La licencia de funcionamiento (también llamada licencia de apertura en algunos municipios) es el permiso que te autoriza a operar comercialmente. Se tramita ante el ayuntamiento y requiere que ya tengas el uso de suelo aprobado. Si venderás bebidas alcohólicas, necesitarás una licencia de funcionamiento con giro de venta de alcohol, que tiene requisitos adicionales (distancia mínima a escuelas e iglesias, horarios de venta restringidos). Costo: $3,000 a $15,000 MXN para giro sin alcohol; $15,000 a $80,000 MXN con venta de alcohol, dependiendo del municipio y el tipo de licencia.",
    },
    {
      type: "heading",
      level: 3,
      text: "4. Aviso de Declaración de Apertura",
      id: "declaracion-apertura",
    },
    {
      type: "paragraph",
      text: "En muchos municipios, además de la licencia de funcionamiento necesitas presentar un aviso de declaración de apertura ante la autoridad municipal o estatal correspondiente. Es un trámite administrativo que formaliza que cumples con los requisitos para operar. En algunos estados como Jalisco y Nuevo León, este aviso se hace a través del portal SARE (Sistema de Apertura Rápida de Empresas), que simplifica y agiliza el proceso para negocios de bajo riesgo. Costo: gratuito a $2,000 MXN.",
    },
    {
      type: "heading",
      level: 3,
      text: "5. Aviso de Funcionamiento ante COFEPRIS",
      id: "cofepris",
    },
    {
      type: "paragraph",
      text: "La Comisión Federal para la Protección contra Riesgos Sanitarios (COFEPRIS) regula todos los establecimientos que manejan alimentos. Los restaurantes deben presentar un aviso de funcionamiento (no una licencia sanitaria completa, que aplica para procesadoras de alimentos). El aviso se puede tramitar en línea a través del portal de COFEPRIS y es gratuito. Sin embargo, tu establecimiento queda sujeto a verificaciones sanitarias periódicas. Debes cumplir con la NOM-251-SSA1-2009 (prácticas de higiene para el proceso de alimentos), tener un programa de control de plagas vigente y contar con análisis de agua potable si no usas agua de la red municipal.",
    },
    {
      type: "heading",
      level: 3,
      text: "6. Dictamen de Protección Civil",
      id: "proteccion-civil",
    },
    {
      type: "paragraph",
      text: "Este dictamen verifica que tu local cumple con las normas de seguridad: salidas de emergencia señalizadas, extintores vigentes, instalación de gas LP o natural certificada, detección de humo en cocina, y rutas de evacuación. Lo emite la Dirección de Protección Civil de tu municipio después de una inspección presencial. Para restaurantes que usen gas, es obligatorio contar con una póliza de seguro de responsabilidad civil. Costo: $2,000 a $6,000 MXN por el dictamen; la póliza de seguro va de $5,000 a $15,000 MXN anuales según la cobertura.",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Registro Federal de Contribuyentes (RFC) ante el SAT — persona física o moral.",
        "Licencia de Uso de Suelo municipal — verificar que el local permite giro de alimentos y bebidas.",
        "Licencia de Funcionamiento (o Licencia de Apertura) — autorización municipal para operar comercialmente.",
        "Aviso de Declaración de Apertura — trámite estatal/municipal (puede hacerse vía SARE en algunos estados).",
        "Aviso de Funcionamiento ante COFEPRIS — registro sanitario federal para establecimientos de alimentos.",
        "Dictamen de Protección Civil — inspección de seguridad del local (extintores, gas, salidas de emergencia).",
        "Registro ante el IMSS — dar de alta a tus empleados en el Seguro Social (obligatorio desde el primer empleado).",
        "Registro patronal ante INFONAVIT y FONACOT — obligaciones laborales complementarias.",
        "Alta en el padrón municipal de contribuyentes — para el pago de impuesto sobre nómina y predial comercial.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Costos reales de apertura: desglose detallado",
      id: "costos-apertura",
    },
    {
      type: "paragraph",
      text: "Uno de los errores más comunes es subestimar la inversión inicial. Muchos emprendedores calculan el costo de equipamiento y renta pero olvidan los permisos, el capital de trabajo y el colchón de efectivo para los primeros meses de operación (que casi siempre generan pérdidas). A continuación un desglose realista para un restaurante pequeño-mediano (40–60 comensales) en una ciudad como Guadalajara, Monterrey o Puebla. Los costos en CDMX pueden ser 30–50% superiores.",
    },
    {
      type: "stats",
      items: [
        { value: "$40K–$120K", label: "Renta mensual de local comercial (zona media-alta, 80–150m²)" },
        { value: "$250K–$800K", label: "Remodelación y adecuación del local" },
        { value: "$200K–$600K", label: "Equipamiento de cocina (estufa industrial, refrigeración, campana, etc.)" },
        { value: "$50K–$150K", label: "Mobiliario de salón (mesas, sillas, barra, decoración)" },
      ],
    },
    {
      type: "list",
      ordered: false,
      items: [
        "Depósito de renta (2–3 meses): $80,000 – $360,000 MXN",
        "Remodelación y obra civil (pisos, plomería, eléctrica, gas, campana de extracción, trampa de grasa): $250,000 – $800,000 MXN",
        "Equipamiento de cocina (estufa industrial, plancha, freidora, horno, refrigeradores, congelador, lavavajillas): $200,000 – $600,000 MXN",
        "Sistema de punto de venta (POS), impresoras térmicas y tablet para cocina: $5,000 – $25,000 MXN",
        "Mobiliario de salón y decoración: $50,000 – $150,000 MXN",
        "Inventario inicial de ingredientes y suministros: $30,000 – $80,000 MXN",
        "Permisos, licencias y trámites legales: $20,000 – $120,000 MXN (varía drásticamente si incluye licencia de alcohol)",
        "Diseño de marca, menú impreso, señalización: $15,000 – $50,000 MXN",
        "Capital de trabajo para los primeros 3 meses (nómina, renta, insumos, servicios): $200,000 – $500,000 MXN",
        "Fondo de contingencia (10–15% del total): $80,000 – $200,000 MXN",
      ],
    },
    {
      type: "callout",
      variant: "info",
      title: "El costo oculto más importante: capital de trabajo",
      text: "La mayoría de los restaurantes nuevos no son rentables en los primeros 3 a 6 meses mientras construyen su base de clientes. Necesitas tener suficiente efectivo para cubrir nómina, renta, proveedores y servicios durante ese periodo sin depender de las ventas. Planifica tener al menos 3 meses de gastos operativos en reserva antes de abrir. Si no tienes ese colchón, no abras — es mejor esperar que quedarte sin efectivo en el mes dos.",
    },
    {
      type: "heading",
      level: 2,
      text: "Cómo elegir la ubicación correcta",
      id: "elegir-ubicacion",
    },
    {
      type: "paragraph",
      text: "La ubicación define hasta el 70% del éxito de un restaurante. No basta con encontrar un local bonito o barato — necesitas analizar el flujo peatonal, la competencia directa, la accesibilidad vehicular y de transporte público, la visibilidad desde la calle, el estacionamiento disponible, y sobre todo, que tu mercado objetivo realmente transite o viva en esa zona. Un restaurante de cocina de autor en una zona industrial no va a funcionar, igual que una taquería gourmet en una colonia sin poder adquisitivo para ese ticket promedio.",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Define tu concepto y ticket promedio antes de buscar local — eso determina la zona que necesitas.",
        "Visita el local en diferentes horarios (mañana, comida, cena, fin de semana) para evaluar el flujo real de personas.",
        "Cuenta los restaurantes en un radio de 500 metros — competencia cercana puede ser buena (zona gastronómica) o mala (saturación del mismo concepto).",
        "Verifica estacionamiento: en ciudades como Monterrey y Guadalajara, la falta de estacionamiento mata restaurantes.",
        "Revisa el historial del local — si han cerrado 3 restaurantes antes en ese mismo espacio, investiga por qué.",
        "Negocia el contrato de arrendamiento: pide al menos 1 mes de gracia para remodelación y una cláusula de renovación a precio preferente.",
        "Confirma el uso de suelo ANTES de firmar cualquier contrato.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Planeación financiera: punto de equilibrio y flujo de caja",
      id: "planeacion-financiera",
    },
    {
      type: "paragraph",
      text: "El punto de equilibrio es el nivel de ventas mensuales donde tus ingresos cubren exactamente todos tus costos fijos y variables — es decir, no ganas ni pierdes. Para un restaurante típico con costos fijos de $180,000 MXN mensuales (renta, nómina, servicios, seguros) y un margen de contribución del 65% (después de descontar el costo de ingredientes), el punto de equilibrio se calcula así: $180,000 / 0.65 = $276,923 MXN en ventas mensuales. Eso significa que necesitas vender al menos $277,000 MXN al mes solo para no perder dinero.",
    },
    {
      type: "paragraph",
      text: "Calcula tu punto de equilibrio con datos reales de tu concepto. Si tu ticket promedio es $200 MXN y necesitas vender $277,000 mensuales, eso son 1,385 tickets al mes, o aproximadamente 46 tickets diarios. Si operas con 40 asientos y dos turnos de comida, necesitas una ocupación promedio del 58% solo para llegar al punto de equilibrio. Si esa cifra te parece difícil de alcanzar en los primeros meses, necesitas reducir costos fijos, aumentar tu ticket promedio, o tener más capital de reserva.",
    },
    {
      type: "heading",
      level: 3,
      text: "Proyección de flujo de caja: primeros 6 meses",
      id: "flujo-caja-6-meses",
    },
    {
      type: "paragraph",
      text: "Una proyección realista para un restaurante nuevo se ve así: el mes 1 alcanzas entre el 30% y el 40% de tu capacidad (la gente aún no te conoce). El mes 2 subes al 45%–55% si hiciste buena apertura y marketing. El mes 3 llegas al 55%–65%. Los meses 4 a 6 deberías estabilizarte entre el 65% y el 75% si tu producto y servicio son consistentes. Esto significa que probablemente tendrás pérdidas operativas los primeros 2–3 meses y empezarás a generar utilidad marginal entre el mes 3 y el 5. El retorno total de la inversión inicial típicamente toma entre 18 y 36 meses.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Controla tus costos desde el día uno",
      text: "No esperes a tener problemas de flujo de caja para implementar controles. Desde la primera semana de operación, registra cada compra de inventario, monitorea tu food cost diario (debe estar entre 28% y 35% de las ventas) y revisa tu estado de resultados semanal, no mensual. Los restaurantes que sobreviven son los que toman decisiones con datos, no con corazonadas. Un sistema POS con reportes en tiempo real es la herramienta más importante para esto.",
    },
    {
      type: "heading",
      level: 2,
      text: "Errores comunes que cierran restaurantes en el primer año",
      id: "errores-comunes",
    },
    {
      type: "paragraph",
      text: "Después de trabajar con cientos de restauranteros en México, hemos identificado los errores que se repiten una y otra vez en los negocios que no logran sobrevivir su primer año. La buena noticia es que todos son evitables con planeación.",
    },
    {
      type: "list",
      ordered: false,
      items: [
        "Subestimar la inversión inicial — abrir con presupuesto justo y quedarse sin capital de trabajo al mes 3.",
        "No calcular el punto de equilibrio — operar sin saber cuánto necesitan vender para dejar de perder dinero.",
        "Menú demasiado extenso — más platillos = más inventario, más merma, más complejidad en cocina y tiempos de preparación más largos.",
        "Ignorar el marketing de apertura — esperar que los clientes lleguen solos. Los primeros 90 días son críticos para generar tráfico.",
        "No registrar gastos ni ventas desde el día uno — tomar decisiones financieras a ciegas, sin datos.",
        "Contratar más personal del necesario — la nómina es el segundo costo más alto después de la renta. Empieza ligero y escala.",
        "Fijar precios sin calcular el food cost real — vender un platillo en $150 que te cuesta $65 producir te deja un margen muy delgado después de gastos operativos.",
        "No cumplir con obligaciones fiscales y laborales — las multas del SAT, IMSS y municipio pueden ser devastadoras para un negocio nuevo.",
      ],
    },
    {
      type: "quote",
      text: "El 80% de los restaurantes que cierran en México no fracasan por la comida — fracasan por la administración. Saben cocinar pero no saben costear, no llevan inventario, no controlan su nómina y no entienden su flujo de caja. La pasión por la cocina te abre el restaurante; la disciplina financiera te lo mantiene abierto.",
      author: "Consultor gastronómico, CANIRAC Jalisco",
    },
    {
      type: "heading",
      level: 2,
      text: "Cómo Desktop Kitchen ayuda a restaurantes nuevos a lanzar más rápido",
      id: "desktop-kitchen-restaurantes-nuevos",
    },
    {
      type: "paragraph",
      text: "Abrir un restaurante ya es suficientemente complejo como para además preocuparte por sistemas tecnológicos complicados y costosos. Desktop Kitchen fue diseñado específicamente para el mercado mexicano: opera en pesos, calcula el 16% de IVA automáticamente, genera reportes en español y se configura en 15 minutos. No necesitas comprar hardware especializado — funciona en cualquier tablet, computadora o celular con navegador web.",
    },
    {
      type: "list",
      ordered: false,
      items: [
        "Punto de venta completo con gestión de menú, modificadores, combos y órdenes — listo para operar desde el día uno.",
        "Pantalla de cocina (KDS) en tiempo real que elimina las comandas de papel y reduce errores en un 40%.",
        "Control de inventario con alertas de stock bajo y detección automática de merma por inteligencia artificial.",
        "Integración con Rappi, Uber Eats y DiDi Food — todos los pedidos en una sola pantalla.",
        "Reportes financieros en tiempo real: ventas por hora, food cost, ticket promedio, productos más vendidos.",
        "Programa de lealtad con estampitas digitales y SMS automáticos para fidelizar clientes desde la primera semana.",
        "100% white-label — tu marca, tus colores, tu logo. Tus clientes nunca ven Desktop Kitchen.",
        "Plan gratuito para empezar — sin tarjeta de crédito, sin contratos, sin comisiones por venta.",
      ],
    },
    {
      type: "paragraph",
      text: "Para un restaurante nuevo, cada peso cuenta y cada minuto importa. Mientras tu competencia gasta $30,000–$80,000 MXN en un sistema POS tradicional con instalación, capacitación y contratos anuales, tú puedes estar operando con Desktop Kitchen en la misma tarde que abres tu negocio. Y conforme crezcas, el sistema crece contigo: marcas virtuales, inteligencia artificial, delivery multiplataforma y analítica avanzada — todo sin cambiar de plataforma.",
    },
    {
      type: "cta",
      title: "Lanza tu restaurante con la tecnología correcta desde el día uno",
      text: "Configura tu POS en 15 minutos, empieza a vender hoy y toma decisiones con datos reales. Sin inversión inicial, sin contratos y sin complicaciones.",
      buttonText: "Crear cuenta gratis",
      buttonUrl: "https://pos.desktop.kitchen/#/onboarding",
    },
  ],
  relatedSlugs: ["guia-completa-desktop-kitchen", "pos-tradicional-vs-moderno", "reducir-merma-restaurante"],
};
