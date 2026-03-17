import { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "abrir-restaurante-mexico",
  title: "How to Open a Restaurant in Mexico: Legal Requirements, Permits, Costs, and Financial Planning",
  excerpt:
    "A practical guide to opening a restaurant in Mexico covering every step from legal permits and COFEPRIS licensing to realistic cost breakdowns in MXN and financial planning for your first year of operation.",
  category: "guias",
  date: "2026-03-05",
  readTime: 12,
  author: {
    name: "Desktop Kitchen Team",
    role: { en: "Desktop Kitchen Team", es: "Equipo Desktop Kitchen" },
  },
  content: [
    {
      type: "paragraph",
      text: "Mexico's restaurant industry is one of the most dynamic in Latin America. According to INEGI, there are over 620,000 food and beverage establishments across the country, and the sector contributes approximately 2% of the national GDP. The industry grew 7.4% in real terms between 2022 and 2025, driven by urbanization, a booming delivery market, and a growing middle class willing to spend more on dining out. But behind that opportunity lies a complex landscape of legal requirements, permits, and financial risks that catch many first-time owners off guard. This guide walks you through everything you need to know before opening your doors.",
    },
    {
      type: "stats",
      items: [
        { value: "620,000+", label: "Food and beverage establishments in Mexico (INEGI)" },
        { value: "2%", label: "Share of national GDP from the restaurant sector" },
        { value: "60%", label: "Restaurants that close within the first 3 years" },
        { value: "$1.2M+", label: "Average initial investment for a mid-size restaurant (MXN)" },
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Understanding the Mexican Restaurant Market",
      id: "mercado-restaurantes-mexico",
    },
    {
      type: "paragraph",
      text: "Before investing a single peso, you need to understand the market you are entering. CANIRAC (the National Chamber of the Restaurant and Food Industry) reports that the average Mexican household spends roughly 11% of its income on food away from home. In cities like Mexico City, Monterrey, and Guadalajara, that percentage is even higher. The delivery segment alone has grown over 300% since 2020, with platforms like Rappi, Uber Eats, and DiDi Food creating new revenue streams that did not exist a decade ago. However, competition is fierce: the average restaurant in Mexico operates on a net margin of 7% to 12%, and roughly 60% of new restaurants fail within their first three years. The ones that survive are the ones that start with a solid plan.",
    },
    {
      type: "heading",
      level: 2,
      text: "Legal Requirements: Every Permit You Need",
      id: "requisitos-legales",
    },
    {
      type: "paragraph",
      text: "Opening a restaurant in Mexico requires navigating federal, state, and municipal regulations. Missing a single permit can result in fines, temporary closure, or permanent shutdown. Here is the complete list of what you need, in the order you should obtain them.",
    },
    {
      type: "heading",
      level: 3,
      text: "1. RFC (Federal Taxpayer Registry)",
      id: "rfc",
    },
    {
      type: "paragraph",
      text: "Your RFC is your tax identity before the SAT (Tax Administration Service). You need it before you can issue invoices (facturas), open a business bank account, or sign a commercial lease. If you are operating as an individual (persona fisica), you can register through the SAT portal or at a local SAT office. If you are forming a company (persona moral -- typically a SAPI de CV or S de RL de CV for restaurants), you first need to incorporate before a notary public and then register the company's RFC. For restaurants billing under $3.5 million MXN per year, the Simplified Trust Regime (Regimen Simplificado de Confianza) can simplify your tax obligations significantly.",
    },
    {
      type: "heading",
      level: 3,
      text: "2. Land Use License (Licencia de Uso de Suelo)",
      id: "uso-de-suelo",
    },
    {
      type: "paragraph",
      text: "This municipal permit confirms that your chosen location is legally zoned for restaurant use. Not every commercial property can be used for food preparation -- zoning regulations vary by municipality and often restrict restaurants in residential areas or near schools. The application is filed at your local urban development office (Secretaria de Desarrollo Urbano or equivalent). Expect to pay between $2,000 and $8,000 MXN depending on the municipality and the size of the premises. Processing takes 10 to 30 business days. Do not sign a lease until you have confirmed the property is zoned correctly -- this is one of the most expensive mistakes new restaurant owners make.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Critical: Verify Zoning Before Signing a Lease",
      text: "Many new restaurant owners sign a lease and begin remodeling before confirming land use compatibility. If the property is not zoned for food service, you will lose your deposit, your remodeling investment, and months of time. Always request a constancia de uso de suelo from the municipality before committing to any location.",
    },
    {
      type: "heading",
      level: 3,
      text: "3. Operating License (Licencia de Funcionamiento)",
      id: "licencia-funcionamiento",
    },
    {
      type: "paragraph",
      text: "Once you have your land use license, you can apply for the municipal operating license. This is the permit that officially authorizes your business to operate at a specific address. Requirements vary by municipality but generally include your RFC, proof of address, land use license, a government-issued ID, and proof of property ownership or a lease agreement. In most cities, this costs between $3,000 and $15,000 MXN depending on the type of establishment and whether you will serve alcohol. If you plan to sell alcoholic beverages, you will need a separate alcohol sales permit (licencia de venta de bebidas alcoholicas), which can cost anywhere from $20,000 to $150,000 MXN depending on the state and municipality.",
    },
    {
      type: "heading",
      level: 3,
      text: "4. Declaration of Opening (Aviso de Declaracion de Apertura)",
      id: "declaracion-apertura",
    },
    {
      type: "paragraph",
      text: "This is a formal notification to the municipal government that your business has begun operations. In some municipalities, it replaces the traditional operating license under the SARE (Rapid Business Opening System) for low-risk activities. SARE allows certain businesses to begin operating within 72 hours by filing a simple declaration. Whether your restaurant qualifies depends on the municipality and the size of your establishment. Generally, restaurants under 200 square meters with no alcohol sales can use SARE. Larger establishments or those serving alcohol must go through the full licensing process.",
    },
    {
      type: "heading",
      level: 3,
      text: "5. COFEPRIS Health License (Aviso de Funcionamiento)",
      id: "cofepris",
    },
    {
      type: "paragraph",
      text: "COFEPRIS (Federal Commission for the Protection against Sanitary Risks) regulates food safety in Mexico. For most restaurants, you need to file an Aviso de Funcionamiento -- a notice of operation for food-related businesses. This is free and can be submitted online through the COFEPRIS portal. However, your establishment must comply with NOM-251-SSA1-2009, the official Mexican standard for food handling, which covers everything from hand washing protocols and food storage temperatures to pest control and employee hygiene training. COFEPRIS can conduct unannounced inspections, and violations can result in fines ranging from $10,000 to $500,000 MXN or temporary closure.",
    },
    {
      type: "heading",
      level: 3,
      text: "6. Civil Protection Certificate (Dictamen de Proteccion Civil)",
      id: "proteccion-civil",
    },
    {
      type: "paragraph",
      text: "This certificate confirms that your premises comply with safety regulations: fire extinguishers, emergency exits, evacuation signage, gas installations, electrical wiring, and seismic safety. You will need to hire an authorized civil protection consultant to inspect your location and issue a report. The certificate is then filed with the municipal civil protection office. Costs range from $5,000 to $20,000 MXN depending on the size of your establishment and the complexity of the inspection. This permit is non-negotiable -- operating without it is a serious liability risk, and insurance companies will not cover you in case of an incident.",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Register your RFC with the SAT (federal) -- required for invoicing and banking.",
        "Obtain the Land Use License (municipal) -- confirms your location is zoned for food service.",
        "Apply for the Operating License (municipal) -- authorizes business operations at the address.",
        "File the Declaration of Opening (municipal/SARE) -- formal notice that you have started operations.",
        "Submit the COFEPRIS Health Notice (federal) -- registers your establishment for food safety compliance.",
        "Obtain the Civil Protection Certificate (municipal) -- confirms safety compliance for your premises.",
        "Apply for the Alcohol License (state/municipal) -- required only if you will serve alcoholic beverages.",
        "Register with IMSS (federal) -- mandatory social security enrollment for all employees.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Realistic Cost Breakdown: How Much Does It Cost to Open a Restaurant?",
      id: "costos-apertura",
    },
    {
      type: "paragraph",
      text: "One of the biggest reasons restaurants fail in their first year is undercapitalization. Owners budget for rent and equipment but forget about permits, initial inventory, working capital, and the cash burn during the first months before revenue stabilizes. Here is a realistic breakdown for a mid-size restaurant (60 to 80 seats) in a Mexican metropolitan area.",
    },
    {
      type: "stats",
      items: [
        { value: "$180K--$350K", label: "Rent deposit + 3 months advance (MXN)" },
        { value: "$300K--$800K", label: "Remodeling and kitchen build-out (MXN)" },
        { value: "$250K--$600K", label: "Equipment: stoves, refrigeration, POS, furniture (MXN)" },
        { value: "$80K--$150K", label: "Initial inventory, permits, and working capital (MXN)" },
      ],
    },
    {
      type: "list",
      ordered: false,
      items: [
        "Rent and deposit: Depending on the city and neighborhood, commercial rent for a 100-150 m2 space ranges from $30,000 to $120,000 MXN per month. Landlords typically require a security deposit plus 2-3 months in advance.",
        "Remodeling and build-out: Kitchen construction (ventilation, gas, plumbing, grease traps) is the most expensive component, often $200,000 to $500,000 MXN. Dining area remodeling adds another $100,000 to $300,000 MXN.",
        "Equipment: A commercial stove ($15,000-$80,000 MXN), refrigeration units ($20,000-$60,000 MXN each), prep tables, smallwares, furniture, and a POS system. Budget $250,000 to $600,000 MXN total.",
        "Initial inventory: Your first food and beverage purchase before opening typically costs $40,000 to $80,000 MXN depending on menu complexity.",
        "Permits and legal fees: Budget $30,000 to $80,000 MXN for all permits, incorporation costs if forming a company, and a lawyer or gestoria to help navigate the process.",
        "Working capital: You need at least 3 months of operating expenses in reserve. For a restaurant with $250,000 MXN in monthly expenses, that means $750,000 MXN in cash before you serve your first customer.",
      ],
    },
    {
      type: "callout",
      variant: "info",
      title: "The Hidden Cost: Working Capital",
      text: "Most restaurants do not reach break-even until month 4 to 6. That means you will be burning cash every single month while you build your customer base. If your monthly operating costs are $250,000 MXN and your revenue in month 1 is $100,000, you need $150,000 to cover the gap -- and that is just one month. Budget for at least $500,000 to $750,000 MXN in working capital beyond your setup costs. Running out of cash in month 3 is how most restaurants die.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to Choose the Right Location",
      id: "elegir-ubicacion",
    },
    {
      type: "paragraph",
      text: "Location is the single most important decision you will make, and it is the one most difficult to reverse. A great concept in a bad location will fail. A mediocre concept in a high-traffic location can succeed. Before committing, evaluate five critical factors: foot traffic (count pedestrians at different times of day and week), visibility from the street, parking availability, competition density within a 1 km radius, and the income profile of the surrounding neighborhood. A taqueria next to a university campus has a different reality than a fine dining restaurant in Polanco.",
    },
    {
      type: "paragraph",
      text: "Spend at least two weeks visiting the location at different hours before signing anything. Talk to neighboring businesses about their customer volume. Check Google Maps reviews for nearby restaurants to understand what the area's diners expect and what they complain about. If you are targeting delivery revenue, verify that all major platforms operate in that zone -- some neighborhoods in suburban areas have limited delivery coverage. And always, always confirm the land use zoning before signing the lease.",
    },
    {
      type: "heading",
      level: 2,
      text: "Financial Planning: Break-Even and Cash Flow",
      id: "planificacion-financiera",
    },
    {
      type: "paragraph",
      text: "Your financial plan needs to answer one question: how many months until this business pays for itself? The break-even point is the monthly revenue at which your income covers all your costs -- fixed (rent, salaries, insurance, permits) and variable (food cost, utilities, packaging, platform commissions). For a typical mid-size restaurant in Mexico with monthly fixed costs of $180,000 MXN, variable costs at 35% of revenue, and an average ticket of $250 MXN, you need to sell roughly 1,100 tickets per month -- about 37 per day -- to break even.",
    },
    {
      type: "paragraph",
      text: "Your cash flow projection for the first 6 months should be conservative. Assume month 1 revenue at 30% of capacity, month 2 at 45%, month 3 at 55%, month 4 at 65%, month 5 at 75%, and month 6 at 85%. If your break-even is at 70% capacity, you will need to fund losses for approximately 4 months. Build a month-by-month spreadsheet that tracks every inflow and outflow. Include seasonal variations -- December is typically the strongest month for Mexican restaurants, while January and September are often the weakest. A restaurant that opens in January faces a harder first quarter than one that opens in October.",
    },
    {
      type: "quote",
      text: "The restaurants that survive their first year are not the ones with the best food or the most beautiful space. They are the ones that opened with enough capital to weather 6 months of losses and had the discipline to track every peso coming in and going out. Financial planning is not glamorous, but it is the difference between a restaurant that lasts and one that becomes a statistic.",
      author: "CANIRAC regional president, Jalisco chapter",
    },
    {
      type: "heading",
      level: 2,
      text: "Common Mistakes That Close Restaurants in the First Year",
      id: "errores-comunes",
    },
    {
      type: "paragraph",
      text: "After studying hundreds of restaurant closures across Mexico, CANIRAC and INEGI data consistently point to the same set of mistakes. Avoiding them does not guarantee success, but ignoring them almost guarantees failure.",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Undercapitalization: Opening with just enough money to build out the space but not enough to survive 6 months of below-break-even revenue. This is the number one killer.",
        "No financial controls: Not tracking food cost percentage, labor cost percentage, or daily revenue. Many owners have no idea if they are profitable until they run out of money.",
        "Over-investing in aesthetics, under-investing in the kitchen: Spending $500,000 MXN on interior design while buying the cheapest possible kitchen equipment. Your customers return for the food, not the decor.",
        "Ignoring permits and compliance: Operating without full permits and hoping for the best. A single COFEPRIS violation or civil protection shutdown can cost more than the permits themselves.",
        "Menu too large: A 60-item menu increases waste, slows down the kitchen, confuses customers, and makes inventory management a nightmare. Start with 20 to 30 items and expand based on data.",
        "No delivery strategy: In 2026, delivery represents 15% to 35% of revenue for urban restaurants. Launching without a delivery presence means leaving significant revenue on the table.",
        "Hiring family instead of qualified staff: Loyalty matters, but competence matters more. A family member who cannot manage food cost or handle peak-hour volume will cost you far more than a trained professional's salary.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "How Desktop Kitchen Helps New Restaurants Launch Faster",
      id: "desktop-kitchen-nuevos-restaurantes",
    },
    {
      type: "paragraph",
      text: "Opening a restaurant involves juggling dozens of moving pieces simultaneously. Desktop Kitchen eliminates the technology decisions from that list. Instead of spending weeks evaluating POS systems, kitchen display solutions, inventory software, and delivery integrations, you get everything in a single platform that takes 15 minutes to set up. Your menu, your brand colors, your team's access -- all configured before your first customer walks in.",
    },
    {
      type: "paragraph",
      text: "For new restaurants, the most valuable features are the ones that give you financial visibility from day one. Desktop Kitchen tracks your daily revenue, food cost, and ticket averages in real time -- the exact metrics you need to know whether you are on track for break-even. The inventory module alerts you when stock is running low so you avoid both waste and stockouts. And when you are ready to expand to delivery platforms, the built-in integration lets you receive Rappi, Uber Eats, and DiDi Food orders on a single kitchen screen with automatic markup rules to protect your margins.",
    },
    {
      type: "paragraph",
      text: "Most importantly, Desktop Kitchen costs nothing to start. The free plan includes everything a new restaurant needs to operate: unlimited orders, up to 50 menu items, real-time reporting, and the kitchen display. You can launch with zero software costs and upgrade as your business grows. That is one less line item burning through your working capital during those critical first months.",
    },
    {
      type: "cta",
      title: "Launch Your Restaurant with the Right Technology",
      text: "Desktop Kitchen gives you a professional POS, kitchen display, inventory management, and delivery integration from day one -- for free. Focus your capital on what matters: great food and a solid team.",
      buttonText: "Start for free",
      buttonUrl: "https://pos.desktop.kitchen/#/onboarding",
    },
  ],
  relatedSlugs: [
    "guia-completa-desktop-kitchen",
    "pos-tradicional-vs-moderno",
    "reducir-merma-restaurante",
  ],
};
