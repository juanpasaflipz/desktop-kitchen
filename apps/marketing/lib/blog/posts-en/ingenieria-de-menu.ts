import { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "ingenieria-de-menu",
  title: "Menu Engineering: The Science of Designing a Profitable Restaurant Menu",
  excerpt:
    "Learn how to use the menu engineering matrix (stars, puzzles, workhorses, dogs) to categorize your dishes, apply pricing psychology, and design combos that maximize your average ticket -- with practical strategies for Mexican restaurants.",
  category: "negocio",
  date: "2026-03-10",
  readTime: 10,
  author: {
    name: "Desktop Kitchen Team",
    role: { en: "Desktop Kitchen Team", es: "Equipo Desktop Kitchen" },
  },
  content: [
    {
      type: "paragraph",
      text: "Most restaurant owners design their menu based on intuition: dishes they like, recipes they inherited, or items they saw trending on social media. But your menu is not just a list of food -- it is the single most powerful sales tool in your business. Every dish placement, every price ending, every description influences what your customers order. Menu engineering is the discipline that turns that influence into measurable profit. And in the competitive Mexican restaurant market, where food costs hover around 28--35% and margins are razor-thin, mastering it is not optional -- it is survival.",
    },
    {
      type: "stats",
      items: [
        { value: "28--35%", label: "Average food cost percentage in Mexican restaurants" },
        { value: "15--20%", label: "Potential revenue increase from a well-engineered menu" },
        { value: "2.5 min", label: "Average time a customer spends reading a menu" },
        { value: "70%", label: "Of customers order from the first section they look at" },
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "What Is Menu Engineering?",
      id: "what-is-menu-engineering",
    },
    {
      type: "paragraph",
      text: "Menu engineering is a systematic approach to analyzing the profitability and popularity of every item on your menu, then using that data to make strategic decisions about pricing, placement, descriptions, and even which dishes to keep or cut. The concept was formalized by Michael Kasavana and Donald Smith at Michigan State University in the 1980s, but the core idea is timeless: not all menu items are created equal, and you should design your menu to steer customers toward the ones that make you the most money.",
    },
    {
      type: "paragraph",
      text: "At its heart, menu engineering uses a 2x2 matrix that classifies every dish based on two dimensions: contribution margin (how much profit each sale generates) and popularity (how often customers order it). This gives you four categories, each with a clear strategic playbook.",
    },
    {
      type: "heading",
      level: 2,
      text: "The Menu Engineering Matrix: Stars, Puzzles, Workhorses, and Dogs",
      id: "menu-matrix",
    },
    {
      type: "paragraph",
      text: "To build your matrix, you need two data points for each menu item: (1) its contribution margin, which is selling price minus food cost, and (2) its sales volume over a defined period -- typically 4 to 8 weeks. Once you have these numbers, you plot every item into one of four quadrants.",
    },
    {
      type: "heading",
      level: 3,
      text: "Stars: High Profit, High Popularity",
      id: "stars",
    },
    {
      type: "paragraph",
      text: "Stars are your dream dishes. Customers love them and they generate strong margins. In a Mexican restaurant, your star might be a specialty burrito with a $42 MXN margin that sells 80 units per week, or a premium molcajete that commands $180 MXN in profit per order. The strategy for stars is simple: protect them. Give them the best position on your menu, keep the recipe consistent, train your staff to recommend them, and do not change the price unless you absolutely have to.",
    },
    {
      type: "heading",
      level: 3,
      text: "Puzzles: High Profit, Low Popularity",
      id: "puzzles",
    },
    {
      type: "paragraph",
      text: "Puzzles are the most interesting category because they represent untapped potential. These dishes have excellent margins but customers are not ordering them enough. Maybe the name is confusing, the description is bland, or they are buried on page three of the menu. The fix is almost never to lower the price -- that would destroy the very margin that makes them valuable. Instead, reposition them to a high-visibility spot, rewrite the description to make them more appealing, add a photo, or have your servers actively recommend them. A well-plated enchilada suiza with a $55 MXN margin that nobody orders is a puzzle waiting to be solved.",
    },
    {
      type: "heading",
      level: 3,
      text: "Workhorses: Low Profit, High Popularity",
      id: "workhorses",
    },
    {
      type: "paragraph",
      text: "Workhorses are crowd favorites with thin margins. Think of your basic order of tacos al pastor or a quesadilla that everyone orders but only earns you $18 MXN in contribution margin. You do not want to remove workhorses because they drive traffic and customer loyalty. Instead, look for ways to increase their profitability: pair them with high-margin sides or drinks, gently increase the price by $3--5 MXN (customers rarely notice small increments on popular items), reduce the portion by 5--10% while improving the presentation, or bundle them into combos where the add-ons carry better margins.",
    },
    {
      type: "heading",
      level: 3,
      text: "Dogs: Low Profit, Low Popularity",
      id: "dogs",
    },
    {
      type: "paragraph",
      text: "Dogs lose on both dimensions. They do not sell well and when they do sell, they barely contribute to your bottom line. The default strategy is to remove them from the menu entirely. Every dog on your menu takes up physical space that could be occupied by a star or a puzzle. It also adds complexity to your kitchen, increases the number of unique ingredients you need to stock, and raises the risk of waste. If a dog has sentimental value or is part of your brand identity, consider reworking the recipe to improve the margin, but be honest -- most dogs should be put to rest.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "How to calculate contribution margin",
      text: "Contribution margin = Selling price - Total food cost for that dish. Do not include labor or overhead -- those are fixed costs. Focus on the direct ingredient cost. For a plate of chilaquiles that sells for $95 MXN and costs $32 MXN in ingredients, the contribution margin is $63 MXN. Calculate this for every item on your menu. Desktop Kitchen does this automatically using your inventory and sales data.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to Categorize Your Menu Items: A Step-by-Step Process",
      id: "categorize-items",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Pull your sales data for the last 30--60 days. You need the total number of units sold for each menu item.",
        "Calculate the food cost for each dish using your current ingredient prices. Be precise -- include garnishes, sauces, tortillas, everything that goes on the plate.",
        "Compute the contribution margin for each item: selling price minus food cost.",
        "Calculate the average contribution margin across all items. This becomes your dividing line between high and low margin.",
        "Calculate the average popularity (units sold) across all items. Adjust for menu mix -- if you have 40 items, the expected share per item is 2.5%. Items selling above 70% of that expected share are considered popular.",
        "Plot each item on the matrix. Above-average margin + above-average popularity = Star. Above-average margin + below-average popularity = Puzzle. And so on.",
        "Assign strategic actions to each item based on its quadrant: promote stars, reposition puzzles, re-engineer workhorses, and eliminate dogs.",
        "Repeat this analysis every quarter. Your matrix is not static -- seasonal demand, ingredient price fluctuations, and new competitors will shift items between quadrants.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Menu Design Psychology: How Layout Influences Orders",
      id: "menu-psychology",
    },
    {
      type: "paragraph",
      text: "The physical or digital layout of your menu has a measurable impact on what customers order. Decades of eye-tracking research have revealed consistent patterns in how people scan menus, and understanding these patterns lets you place your most profitable items exactly where eyes land first.",
    },
    {
      type: "heading",
      level: 3,
      text: "The Golden Triangle and Eye Scanning Patterns",
      id: "golden-triangle",
    },
    {
      type: "paragraph",
      text: "On a single-page or two-page menu, the eye naturally follows a pattern: it starts at the center, moves to the upper right, then drifts to the upper left. This is called the \"golden triangle\" or \"sweet spot.\" On a single-panel menu, the top third and center command the most attention. On a two-panel menu, the upper right panel is prime real estate. Place your stars and puzzles in these zones. Dogs and workhorses can go in less prominent positions -- the bottom of lists, the second page, or sections that require scrolling on a digital menu.",
    },
    {
      type: "heading",
      level: 3,
      text: "Price Anchoring: Let Expensive Items Sell Your Profitable Ones",
      id: "price-anchoring",
    },
    {
      type: "paragraph",
      text: "Price anchoring is a cognitive bias where the first price a customer sees sets the reference point for everything that follows. If the first item in your entree section is a $380 MXN premium steak platter, suddenly the $195 MXN arrachera plate feels like a reasonable deal -- even if its margin is excellent. Place your highest-priced item (which does not need to be your biggest seller) at the top of each section to create this anchoring effect. In Mexican restaurants, this works particularly well with seafood towers, premium cuts, or specialty platters that set a high ceiling.",
    },
    {
      type: "heading",
      level: 3,
      text: "The Power of Descriptions and Naming",
      id: "descriptions-naming",
    },
    {
      type: "paragraph",
      text: "Research from Cornell University found that descriptive menu labels increase sales by up to 27% and improve customer perception of food quality. \"Grilled chicken breast\" becomes \"Slow-grilled free-range chicken breast with roasted poblano salsa and hand-pressed corn tortillas.\" Notice the specificity: cooking method, ingredient provenance, preparation technique. For Mexican restaurants, lean into regional identity -- \"Oaxacan-style mole negro,\" \"Sinaloan aguachile with Mazatlan shrimp,\" \"Abuela's recipe carnitas\" -- these descriptions trigger emotional connections and justify higher prices.",
    },
    {
      type: "callout",
      variant: "info",
      title: "Remove currency signs to reduce price sensitivity",
      text: "Studies show that removing the dollar sign (or peso sign) from your menu prices reduces the psychological pain of spending. Instead of \"$185 MXN,\" write simply \"185.\" Avoid dotted lines connecting dish names to prices -- they turn your menu into a price list and encourage customers to scan for the cheapest option instead of choosing what appeals to them.",
    },
    {
      type: "stats",
      items: [
        { value: "27%", label: "Sales increase from descriptive menu labels (Cornell study)" },
        { value: "8.15%", label: "Higher spending when currency symbols are removed from menus" },
        { value: "5--7", label: "Optimal number of items per menu category" },
        { value: "$12--18 MXN", label: "Average willingness to pay more for a named dish vs. generic" },
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Strategic Combo Design: Turning Workhorses into Profit Engines",
      id: "combo-design",
    },
    {
      type: "paragraph",
      text: "Combos are not just about convenience -- they are one of the most powerful tools in menu engineering. A well-designed combo bundles a popular workhorse (the traffic driver) with high-margin add-ons (the profit generators), creating a package where the customer perceives value while you increase your average ticket and overall margin. The key is to make the combo feel like a deal even though the total margin is higher than the workhorse alone.",
    },
    {
      type: "paragraph",
      text: "Here is how it works in practice. Say you sell tacos al pastor at $55 MXN with a $18 MXN margin (workhorse). A side of guacamole costs you $12 MXN and sells for $45 MXN ($33 MXN margin). An agua fresca costs $8 MXN and sells for $38 MXN ($30 MXN margin). Individually, these total $138 MXN. Offer the combo at $119 MXN -- the customer \"saves\" $19, but your combined margin is $62 MXN versus the $18 MXN from the tacos alone. You tripled your margin per transaction while giving the customer a discount. That is the math that makes combos indispensable.",
    },
    {
      type: "list",
      ordered: false,
      items: [
        "Always anchor combos around your top-selling workhorses -- the item that gets customers to choose the combo in the first place.",
        "Include at least one high-margin item in every combo. Beverages and sides typically carry 65--80% margins and are ideal combo components.",
        "Price the combo at 10--15% below the sum of individual items. Enough to feel like a deal, not so much that you give away the margin.",
        "Limit combo options to 3--5 choices. Too many options cause decision paralysis and slow down the ordering process.",
        "Name your combos. \"The Pastor Special\" or \"Combo Familiar Dominguero\" sells better than \"Combo #3.\"",
        "Rotate combos monthly to create urgency and test new item pairings.",
      ],
    },
    {
      type: "quote",
      text: "We increased our average ticket by 22% in two months just by redesigning our combos. The secret was not lowering prices -- it was bundling our best-sellers with high-margin sides and drinks. Customers felt they were getting a deal, and we were making more on every order.",
      author: "Owner, taqueria chain in Guadalajara (3 locations)",
    },
    {
      type: "heading",
      level: 2,
      text: "How Desktop Kitchen's AI Helps You Engineer Your Menu",
      id: "desktop-kitchen-ai",
    },
    {
      type: "paragraph",
      text: "Traditional menu engineering requires pulling sales reports, calculating food costs manually, building spreadsheets, and updating the analysis every quarter. Most restaurant owners never get around to it because the process is tedious. Desktop Kitchen automates the entire workflow. The system continuously tracks sales volume and contribution margin for every item, automatically classifies dishes into the four matrix quadrants, and surfaces actionable recommendations -- all without you opening a spreadsheet.",
    },
    {
      type: "paragraph",
      text: "The AI suggestion engine goes beyond the static matrix. It detects emerging trends in real time -- if a puzzle starts gaining popularity after a server begins recommending it, the system flags it as an emerging star so you can double down. If a former star's food cost spikes because avocado prices jumped 40% (a very real scenario in Mexico), the system alerts you that the item has shifted to workhorse territory and suggests either a price adjustment or a recipe modification to restore the margin.",
    },
    {
      type: "list",
      ordered: false,
      items: [
        "Automatic menu matrix: see your stars, puzzles, workhorses, and dogs in a live dashboard updated with every order.",
        "AI-powered upsell suggestions: the system recommends high-margin add-ons and combos to your cashiers in real time, based on what the customer is ordering.",
        "Dynamic pricing alerts: when ingredient costs change, the system recalculates margins and flags items that have crossed the profitability threshold.",
        "Combo performance tracking: see which combo configurations generate the highest average margin and adjust pairings based on data.",
        "Seasonal trend detection: the AI identifies items that perform differently by day of week, time of day, or season -- so you can plan limited-time offers around predictable demand peaks.",
      ],
    },
    {
      type: "callout",
      variant: "tip",
      title: "Start with your top 10",
      text: "You do not need to engineer your entire menu at once. Start by analyzing your 10 best-selling items. Classify them into the matrix, identify at least one puzzle to reposition and one dog to remove, and design two new combos around your workhorses. This alone can increase your gross margin by 8--12% within the first month.",
    },
    {
      type: "heading",
      level: 2,
      text: "Practical Tips for Mexican Restaurants",
      id: "tips-mexican-restaurants",
    },
    {
      type: "paragraph",
      text: "Menu engineering principles are universal, but applying them in the Mexican market has specific nuances. Ingredient prices in Mexico are volatile -- a bag of limes can swing from $15 to $80 MXN in a matter of weeks. Regional tastes vary dramatically between states. And price sensitivity is high: in a market where the average check at a casual restaurant is $120--180 MXN, every $10 increase in price is felt by the customer. Here are strategies that work specifically in this context.",
    },
    {
      type: "list",
      ordered: false,
      items: [
        "Re-engineer your menu every time a key ingredient has a price spike of 20% or more. In Mexico, this happens regularly with avocado, lime, tomato, and fresh chili peppers. Have a backup version of affected dishes that swaps the volatile ingredient or adjusts the portion.",
        "Use regional identity as a premium signal. \"Chapulines from Oaxaca\" or \"cacao from Tabasco\" justify $15--25 MXN more than generic equivalents. Mexican consumers pay premiums for authenticity and origin.",
        "Design your menu around the comida corrida format for weekday lunch. A structured format (soup + main + agua + dessert) at a fixed price lets you control margins precisely while competing in the $80--120 MXN lunch market.",
        "Keep your digital menu and your physical menu in sync. Many Mexican restaurants update delivery app menus independently, leading to price inconsistencies that confuse regulars. Desktop Kitchen manages all channels from a single source of truth.",
        "Factor in tortilla cost. It sounds trivial, but in a taqueria serving 500+ orders per day, a $2 MXN difference in per-order tortilla cost translates to $30,000+ MXN per month. Negotiate bulk pricing or consider making your own.",
        "Leverage the \"Mexican holiday calendar\" for limited-time combos: Dia de Muertos (late October), Fiestas Patrias (September), Dia de la Candelaria (February), and Semana Santa drive predictable demand spikes for specific dishes. Plan your menu matrix around these seasonal shifts.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "The Bottom Line: Your Menu Is Your Most Powerful Lever",
      id: "bottom-line",
    },
    {
      type: "paragraph",
      text: "Restaurants spend thousands on marketing, remodeling, and new equipment. But the highest-ROI investment you can make is spending a few hours engineering your menu. A well-engineered menu does not just increase revenue -- it reduces waste (fewer dogs means fewer unused ingredients), simplifies kitchen operations (fewer items, more shared ingredients), and improves the customer experience (clearer choices, better descriptions, better value perception). The data shows that restaurants that apply menu engineering principles consistently see a 15--20% improvement in gross margin within the first quarter.",
    },
    {
      type: "paragraph",
      text: "The difference between a good restaurant and a profitable restaurant is often not the food -- it is the menu strategy. Stars, puzzles, workhorses, and dogs are not just academic categories. They are the lens through which every item on your menu should be evaluated, every quarter, without exception. And with the right tools, this analysis takes minutes, not days.",
    },
    {
      type: "cta",
      title: "Engineer Your Menu with Data, Not Guesswork",
      text: "Desktop Kitchen automatically classifies your menu items, suggests high-margin combos, and alerts you when ingredient costs shift your profitability. Start for free and see your menu matrix in action.",
      buttonText: "Start for free",
      buttonUrl: "https://pos.desktop.kitchen/#/onboarding",
    },
  ],
  relatedSlugs: ["reducir-merma-restaurante", "ia-en-la-cocina", "comisiones-rappi-uber-didi"],
};
