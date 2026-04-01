import { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "ingenieria-de-menu",
  title: "Ingenieria de Menu: La Ciencia de Disenar un Menu Rentable para tu Restaurante",
  excerpt:
    "La ingenieria de menu combina datos de rentabilidad, popularidad y psicologia del consumidor para maximizar las ganancias de cada platillo. Aprende a clasificar tu menu con la matriz de estrellas, puzzles, caballos de batalla y perros, y descubre como el diseno estrategico puede aumentar tu ticket promedio hasta un 15%.",
  category: "negocio",
  date: "2026-03-10",
  readTime: 10,
  author: {
    name: "Equipo Desktop Kitchen",
    role: { en: "Desktop Kitchen Team", es: "Equipo Desktop Kitchen" },
  },
  content: [
    {
      type: "paragraph",
      text: "Cada platillo en tu menu cuenta una historia financiera. Algunos son los heroes silenciosos que mantienen tu negocio a flote; otros drenan recursos sin que te des cuenta. La ingenieria de menu es la disciplina que transforma tu carta de un simple listado de platillos a una herramienta estrategica de rentabilidad. Desarrollada originalmente por los profesores Michael Kasavana y Donald Smith en la Universidad Estatal de Michigan, esta metodologia ha sido adoptada por cadenas globales y restaurantes independientes por igual. En Mexico, donde los margenes de ganancia en la industria restaurantera oscilan entre el 5% y el 15%, dominar la ingenieria de menu no es un lujo: es una necesidad de supervivencia.",
    },
    {
      type: "stats",
      items: [
        { value: "15–25%", label: "Aumento potencial en rentabilidad al aplicar ingenieria de menu" },
        { value: "8 seg", label: "Tiempo promedio que un comensal dedica a revisar un menu" },
        { value: "30%", label: "Platillos que generan el 70% de las ventas en un restaurante tipico" },
        { value: "$45–$85", label: "Aumento en ticket promedio (MXN) con diseno estrategico de menu" },
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Que es la ingenieria de menu y por que importa",
      id: "que-es-ingenieria-menu",
    },
    {
      type: "paragraph",
      text: "La ingenieria de menu es el analisis sistematico de la rentabilidad y popularidad de cada platillo para tomar decisiones informadas sobre precios, posicionamiento, diseno y composicion de tu carta. No se trata de intuicion ni de copiar lo que hace la competencia. Se trata de datos. Cada platillo se evalua en dos ejes: cuanto margen de ganancia genera (contribucion marginal) y con que frecuencia lo piden los clientes (mix de ventas). Al cruzar estos dos datos, obtienes un mapa claro de donde esta tu dinero y donde lo estas perdiendo.",
    },
    {
      type: "paragraph",
      text: "Para un restaurante mexicano, esto es particularmente relevante. Un orden de tacos al pastor con un costo de produccion de $18 MXN y un precio de venta de $65 MXN tiene un margen completamente distinto al de un corte de arrachera que cuesta $95 MXN producir y se vende en $220 MXN. Ambos pueden ser populares, pero su contribucion a tu bolsillo es radicalmente diferente. La ingenieria de menu te ayuda a ver estas diferencias con claridad y actuar en consecuencia.",
    },
    {
      type: "heading",
      level: 2,
      text: "La matriz de ingenieria de menu: estrellas, puzzles, caballos y perros",
      id: "matriz-ingenieria-menu",
    },
    {
      type: "paragraph",
      text: "El corazon de la ingenieria de menu es una matriz de 2x2 que clasifica cada platillo segun su rentabilidad (alta o baja) y su popularidad (alta o baja). Estas cuatro categorias tienen nombres que facilitan recordarlas y comunicarlas a tu equipo:",
    },
    {
      type: "heading",
      level: 3,
      text: "Estrellas: alta rentabilidad + alta popularidad",
      id: "estrellas",
    },
    {
      type: "paragraph",
      text: "Son tus campeonas. Platillos que los clientes adoran y que ademas te dejan buen margen. En una taqueria, podrian ser los tacos de suadero con un costo de produccion bajo y ventas consistentes. En un restaurante de comida mexicana contemporanea, quiza sea una enchilada de mole con ingredientes accesibles pero percepcion de alto valor. La estrategia con las estrellas es simple: protegelas. No cambies la receta, no escondas estos platillos en el menu, no subas su precio de forma agresiva. Dales la mejor posicion visual en tu carta y asegurate de que los meseros las recomienden.",
    },
    {
      type: "heading",
      level: 3,
      text: "Caballos de batalla: baja rentabilidad + alta popularidad",
      id: "caballos-de-batalla",
    },
    {
      type: "paragraph",
      text: "Estos platillos jalan gente a tu restaurante pero no te dejan mucho dinero. El ejemplo clasico en Mexico es la orden de quesadillas o los tacos basicos: todos los piden, pero el margen es delgado. No los elimines, son esenciales para el trafico. En su lugar, busca formas de aumentar su margen sin alienar al cliente. Puedes reducir ligeramente la porcion (de forma imperceptible), negociar mejor precio con tu proveedor de queso o tortilla, o crear versiones premium con extras de mayor margen. Tambien puedes usarlos como ancla para combos que incluyan bebidas o complementos mas rentables.",
    },
    {
      type: "heading",
      level: 3,
      text: "Puzzles (rompecabezas): alta rentabilidad + baja popularidad",
      id: "puzzles",
    },
    {
      type: "paragraph",
      text: "Aqui esta el potencial sin explotar. Son platillos con excelente margen que por alguna razon los clientes no piden con frecuencia. Tal vez el nombre no es atractivo, la descripcion en el menu no le hace justicia, o simplemente esta enterrado en una pagina que nadie lee. La estrategia con los puzzles es darles visibilidad: muevelos a una mejor posicion en el menu, mejora su descripcion, pidele a tus meseros que los recomienden como especiales, o agregalos como opcion en combos. Un ceviche de jicama con camaron puede tener margenes increibles, pero si nadie sabe que existe, es dinero que dejas en la mesa.",
    },
    {
      type: "heading",
      level: 3,
      text: "Perros: baja rentabilidad + baja popularidad",
      id: "perros",
    },
    {
      type: "paragraph",
      text: "Nadie los pide y cuando los piden, no te dejan dinero. Son candidatos firmes para eliminacion. Sin embargo, antes de tacharlos del menu, preguntate: ¿este platillo cumple una funcion estrategica? ¿Es la opcion infantil que convence a familias de venir? ¿Es el platillo de dieta que permite que un grupo con restricciones alimenticias elija tu restaurante? Si no cumple ninguna funcion adicional, eliminalo. Cada platillo en tu menu ocupa espacio mental y visual que podrias usar para algo que si genere dinero.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Regla del 70/30 para menus mexicanos",
      text: "En restaurantes mexicanos, el 70% de tus ventas tipicamente viene del 30% de tus platillos. Antes de agregar nuevos platillos, asegurate de que tus estrellas actuales estan recibiendo la atencion que merecen. Un menu con 25 platillos bien posicionados casi siempre supera en rentabilidad a uno con 60 opciones donde nadie sabe que elegir.",
    },
    {
      type: "heading",
      level: 2,
      text: "Como categorizar tus platillos paso a paso",
      id: "como-categorizar",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Calcula el costo de cada platillo: suma el costo de todos los ingredientes por porcion, incluyendo guarniciones, salsas y tortillas. Se brutalmente honesto con las cantidades reales, no las teoricas.",
        "Determina la contribucion marginal: resta el costo del ingrediente al precio de venta. Un platillo que vendes en $180 MXN y cuesta $55 MXN de ingredientes tiene una contribucion marginal de $125 MXN.",
        "Calcula la contribucion marginal promedio del menu: suma la contribucion de todos los platillos y dividela entre el numero total. Este es tu punto de corte para 'alta' vs 'baja' rentabilidad.",
        "Analiza el mix de ventas: revisa cuantas veces se vendio cada platillo en las ultimas 4 semanas. Divide las ventas de cada platillo entre el total de ventas para obtener su porcentaje de popularidad.",
        "Calcula el umbral de popularidad: si tienes 30 platillos, el promedio esperado seria 3.3% (100%/30). Platillos por encima del 70% de ese promedio (2.3% en este caso) se consideran 'populares'.",
        "Ubica cada platillo en la matriz: con la rentabilidad (arriba o abajo del promedio) y la popularidad (arriba o abajo del umbral), cada platillo cae automaticamente en una de las cuatro categorias.",
        "Repite el analisis cada mes: los datos cambian con las temporadas, los precios de insumos y las tendencias del mercado. La ingenieria de menu no es un ejercicio de una sola vez.",
      ],
    },
    {
      type: "callout",
      variant: "info",
      title: "Desktop Kitchen lo calcula automaticamente",
      text: "Si usas Desktop Kitchen, el sistema ya tiene los datos de ventas y costos de cada platillo. El modulo de reportes genera la matriz de ingenieria de menu con un clic, actualizandose en tiempo real conforme registras ventas e inventario. No necesitas hojas de calculo.",
    },
    {
      type: "heading",
      level: 2,
      text: "Psicologia del diseno de menu",
      id: "psicologia-diseno",
    },
    {
      type: "paragraph",
      text: "Saber cuales son tus estrellas y puzzles es solo la mitad de la batalla. La otra mitad es como presentas la informacion para influir en la decision del comensal. Estudios de neuromarketing en restaurantes han demostrado que el diseno del menu tiene un impacto medible en lo que la gente ordena. Aqui entran principios de psicologia del consumidor que puedes aplicar hoy mismo.",
    },
    {
      type: "heading",
      level: 3,
      text: "Patrones de escaneo visual",
      id: "patrones-escaneo",
    },
    {
      type: "paragraph",
      text: "Cuando un comensal abre un menu de una sola pagina, sus ojos siguen un patron predecible: primero van al centro, luego a la esquina superior derecha, y despues a la esquina superior izquierda. En un menu de dos paginas tipo libro, los ojos van primero al centro de la pagina derecha. Estos son tus 'puntos calientes' — las zonas donde el platillo que coloques tendra mayor probabilidad de ser elegido. Pon tus estrellas y puzzles en estas posiciones. Los caballos de batalla y perros pueden ir en las zonas de menor atencion visual.",
    },
    {
      type: "heading",
      level: 3,
      text: "Anclaje de precios",
      id: "anclaje-precios",
    },
    {
      type: "paragraph",
      text: "El anclaje de precios es un fenomeno cognitivo donde el primer precio que una persona ve influye en como percibe todos los precios subsecuentes. Si lo primero que tu comensal ve en la seccion de platillos fuertes es un corte premium de $450 MXN, los demas platillos de $180-$220 MXN parecen razonables por comparacion. No necesitas que nadie compre el ancla — su funcion es hacer que todo lo demas parezca accesible. Coloca uno o dos platillos de precio alto al inicio de cada seccion estrategicamente.",
    },
    {
      type: "heading",
      level: 3,
      text: "Descripciones que venden",
      id: "descripciones-que-venden",
    },
    {
      type: "paragraph",
      text: "Un estudio de la Universidad de Cornell encontro que las descripciones detalladas y evocadoras aumentan las ventas de un platillo en un 27% y mejoran la percepcion de calidad del cliente. No es lo mismo 'Tacos de camarones' que 'Tacos de camaron del Pacifico al ajillo, en tortilla de maiz azul artesanal, con salsa de habanero rostizado y aguacate crema'. La segunda version justifica un precio mas alto y genera anticipacion sensorial. Para restaurantes mexicanos, menciona el origen de los ingredientes (queso Oaxaca, chocolate de Tabasco, chiles de Yahualica), tecnicas de preparacion (asado al carbon, molido en metate) y notas sensoriales (ahumado, crujiente, cremoso).",
    },
    {
      type: "quote",
      text: "El menu no es una lista de productos con precios. Es tu vendedor mas consistente — trabaja 12 horas al dia, nunca falta, nunca se cansa y le habla a cada cliente. Si tu mejor vendedor estuviera mal capacitado, lo entrenarias. Tu menu merece la misma atencion.",
      author: "Gregg Rapp, consultor de ingenieria de menu",
    },
    {
      type: "stats",
      items: [
        { value: "27%", label: "Aumento en ventas con descripciones detalladas vs. nombres simples" },
        { value: "5.5%", label: "Porcentaje de clientes que eligen el platillo mas barato de una seccion" },
        { value: "$22 MXN", label: "Incremento promedio en ticket al eliminar signos de pesos del menu" },
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Diseno estrategico de combos",
      id: "diseno-combos",
    },
    {
      type: "paragraph",
      text: "Los combos son una de las herramientas mas poderosas de la ingenieria de menu, pero la mayoria de los restaurantes los disenan mal. Un combo no deberia ser simplemente 'platillo + bebida + postre con 10% de descuento'. Un combo bien disenado tiene un proposito estrategico especifico: convertir un caballo de batalla en una venta rentable, dar visibilidad a un puzzle, o aumentar el ticket promedio sin que el cliente sienta que esta gastando de mas.",
    },
    {
      type: "paragraph",
      text: "La formula ganadora para combos en restaurantes mexicanos es: un caballo de batalla (el gancho que atrae) + un puzzle (el margen oculto) + una bebida de alto margen. Por ejemplo: 'Combo Taquero' con 4 tacos al pastor (caballo de batalla, bajo margen pero todos lo quieren) + orden de esquites con elote gratinado (puzzle, alto margen, bajo costo de ingredientes) + agua de horchata (margen de 80%+). El precio del combo se calcula para que el cliente perciba un ahorro del 12-15% sobre los precios individuales, pero tu margen neto es mayor que si hubiera comprado solo los tacos.",
    },
    {
      type: "list",
      ordered: false,
      items: [
        "Limita las opciones del combo a 3-4 articulos. Demasiadas opciones paralizan la decision y aumentan el tiempo de preparacion.",
        "Nombra tus combos con identidad: 'El Tradicional', 'La Fiesta', 'El Jefe'. Los nombres con personalidad se venden mejor que 'Combo 1, Combo 2'.",
        "Incluye siempre una bebida: las bebidas (especialmente aguas frescas, limonadas y refrescos) tienen margenes del 75-85% y elevan la rentabilidad de cualquier combo.",
        "Rota los combos mensualmente para crear urgencia ('Combo de temporada') y para probar diferentes combinaciones de puzzles.",
        "Coloca los combos en la primera pagina o seccion del menu, antes de los platillos individuales. Cuando el comensal ya eligio un combo, deja de buscar alternativas.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "No canibalices tus estrellas",
      text: "Nunca incluyas una estrella como componente principal de un combo con descuento. Si un platillo ya se vende solo con buen margen y alta frecuencia, meterlo en un combo con descuento solo reduce tu ganancia sin generar ventas adicionales. Los combos deben impulsar caballos de batalla y puzzles, no descontar lo que ya funciona.",
    },
    {
      type: "heading",
      level: 2,
      text: "Como la IA de Desktop Kitchen optimiza tu menu",
      id: "ia-desktop-kitchen",
    },
    {
      type: "paragraph",
      text: "La ingenieria de menu tradicional requiere un analisis manual mensual con hojas de calculo, calculos de costos actualizados y revision de datos de venta. Es necesario, pero laborioso. Desktop Kitchen automatiza este proceso completo con inteligencia artificial que analiza tus datos en tiempo real y genera sugerencias accionables sin que tengas que hacer calculos.",
    },
    {
      type: "paragraph",
      text: "El sistema de IA monitorea continuamente la velocidad de venta, el margen de contribucion y las tendencias de cada platillo. Cuando detecta que un platillo esta cayendo en la categoria de 'perro' (baja rentabilidad + baja popularidad), te alerta para que tomes accion antes de que acumule perdidas. Cuando identifica un puzzle con potencial — un platillo rentable que pocos piden — sugiere automaticamente incluirlo en combos, recomendaciones de mesero (venta sugerida en pantalla del POS) o promociones de empuje de inventario.",
    },
    {
      type: "list",
      ordered: false,
      items: [
        "Sugerencias de upsell: la IA identifica en tiempo real que platillos complementarios recomendar al tomar cada orden, priorizando puzzles de alto margen.",
        "Empuje de inventario: cuando un ingrediente perecedero se acerca a su fecha limite, el sistema sugiere promover platillos que lo utilicen para evitar merma.",
        "Precios dinamicos: analiza la demanda por horario y dia de la semana para sugerir ajustes de precio o promociones en horas de menor trafico.",
        "Analisis de pares: detecta que platillos se piden juntos frecuentemente para disenar combos basados en datos reales de comportamiento del cliente.",
        "Alertas de margenes: te notifica inmediatamente cuando el costo de un ingrediente sube y el margen de un platillo cae por debajo de tu umbral objetivo.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Consejos practicos para restaurantes mexicanos",
      id: "consejos-practicos-mexico",
    },
    {
      type: "paragraph",
      text: "La ingenieria de menu tiene principios universales, pero su aplicacion en Mexico tiene particularidades importantes que debes considerar. El mercado mexicano tiene sus propias dinamicas de precio, expectativa del cliente y estructura de costos.",
    },
    {
      type: "list",
      ordered: false,
      items: [
        "Las tortillas son tu ventaja: a diferencia de otros mercados, la tortilla de maiz es un insumo de bajo costo que el cliente percibe como esencial. Cualquier platillo basado en tortilla (tacos, quesadillas, tostadas, sopes, tlacoyos) tiene un piso de costo estructuralmente bajo.",
        "Las salsas diferencian, no los ingredientes base: en una taqueria, la proteina y la tortilla son similares en todos los platillos. Lo que crea percepcion de variedad y valor son las salsas. Invierte en salsas unicas de bajo costo que den personalidad a cada platillo.",
        "Cuidado con las porciones generosas como estrategia: la cultura mexicana valora la generosidad en la comida, pero sobre-porcionar es la forma mas comun de destruir margenes. Mejor ofrece tortillas extra ilimitadas (bajo costo) que porciones enormes de proteina (alto costo).",
        "Aprovecha la temporalidad: ingredientes como el romeritos (Navidad), chiles en nogada (agosto-septiembre) y pan de muerto (octubre) crean oportunidades naturales para platillos de temporada con percepcion de alto valor y margenes elevados.",
        "El agua fresca es tu mejor amiga: el costo de produccion de un litro de agua de jamaica o horchata es inferior a $8 MXN. Vendido por vaso a $35-$45 MXN, el margen supera el 80%. Tus combos siempre deben incluir agua fresca.",
        "Ajusta para delivery vs. presencial: los platillos que funcionan como estrellas en tu restaurante pueden ser caballos de batalla en delivery por la comision de las plataformas. Considera tener precios diferenciados o un menu reducido para apps de delivery.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Errores frecuentes al aplicar ingenieria de menu",
      id: "errores-frecuentes",
    },
    {
      type: "paragraph",
      text: "Aplicar ingenieria de menu mal es casi peor que no aplicarla. Estos son los errores que vemos con mas frecuencia en restaurantes mexicanos que intentan optimizar su carta sin una metodologia solida:",
    },
    {
      type: "list",
      ordered: false,
      items: [
        "Usar datos de una sola semana: una semana no es representativa. Necesitas minimo 4 semanas de datos para que el analisis sea confiable, y debes excluir semanas atipicas (Semana Santa, puentes, eventos especiales).",
        "Ignorar el costo de la mano de obra: dos platillos pueden tener el mismo costo de ingredientes, pero si uno toma 3 minutos de preparacion y el otro 15, su costo real es muy diferente. Incorpora tiempo de preparacion en tu analisis.",
        "Eliminar todos los perros de golpe: si eliminas 8 platillos de tu menu al mismo tiempo, algunos clientes habituales dejaran de venir. Hazlo gradualmente — retira 2-3 por mes y monitorea el impacto.",
        "Subir precios sin mejorar la percepcion de valor: si un platillo necesita ser mas rentable, no solo subas el precio. Mejora la presentacion, la descripcion o el acompanamiento para que el aumento se sienta justificado.",
        "No capacitar a tus meseros: de nada sirve tener un menu perfecto si tu equipo de sala no sabe que recomendar. Entrenalo semanalmente sobre cuales son las estrellas y los puzzles que debe empujar.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "El impacto real en tus numeros",
      id: "impacto-numeros",
    },
    {
      type: "paragraph",
      text: "Un restaurante mexicano con ventas mensuales de $500,000 MXN y un margen neto del 8% genera $40,000 MXN de utilidad. Al aplicar ingenieria de menu de forma sistematica — reposicionando estrellas, convirtiendo puzzles en ventas reales, disenando combos estrategicos y eliminando perros — es realista aumentar el margen neto entre 3 y 5 puntos porcentuales. Eso significa pasar de $40,000 a $55,000-$65,000 MXN mensuales de utilidad. En un ano, son entre $180,000 y $300,000 MXN adicionales. Y lo mejor: no necesitas un solo cliente nuevo para lograrlo. Estas ganando mas con los mismos comensales.",
    },
    {
      type: "cta",
      title: "Optimiza tu menu con datos en tiempo real",
      text: "Desktop Kitchen analiza automaticamente la rentabilidad y popularidad de cada platillo, sugiere combos inteligentes y te alerta cuando un producto necesita atencion. Deja que los datos diseinen tu menu mas rentable.",
      buttonText: "Empieza tu prueba gratis",
      buttonUrl: "https://pos.desktop.kitchen/#/register",
    },
  ],
  relatedSlugs: ["reducir-merma-restaurante", "ia-en-la-cocina", "comisiones-rappi-uber-didi"],
};
