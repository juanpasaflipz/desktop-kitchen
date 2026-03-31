/**
 * Rich demo menu seed — creates a realistic Mexican taqueria menu
 * for demo tenants so that reports, AI analytics, and delivery data
 * look compelling to prospects.
 *
 * All items are marked is_example=false so they appear as real menu items.
 */

/**
 * Seed a full taqueria menu for a demo tenant.
 * @param {import('postgres').Sql} sql - admin SQL connection (bypasses RLS)
 * @param {string} tenantId - tenant slug
 * @returns {{ categoryCount: number, itemCount: number, modifierGroupCount: number }}
 */
export async function seedDemoMenu(sql, tenantId) {
  // ── Categories ──────────────────────────────────────────────
  const catRows = await sql`
    INSERT INTO menu_categories (name, sort_order, active, printer_target, tenant_id) VALUES
      ('Tacos', 1, true, 'kitchen', ${tenantId}),
      ('Tortas', 2, true, 'kitchen', ${tenantId}),
      ('Quesadillas', 3, true, 'kitchen', ${tenantId}),
      ('Gringas y Volcanes', 4, true, 'kitchen', ${tenantId}),
      ('Extras', 5, true, 'kitchen', ${tenantId}),
      ('Aguas Frescas', 6, true, 'bar', ${tenantId}),
      ('Bebidas', 7, true, 'bar', ${tenantId}),
      ('Postres', 8, true, 'kitchen', ${tenantId})
    ON CONFLICT DO NOTHING
    RETURNING id, name
  `;
  const cat = {};
  for (const row of catRows) cat[row.name] = row.id;

  // ── Menu Items (MXN prices) ─────────────────────────────────
  const items = [
    // Tacos (order by popularity)
    [cat['Tacos'], 'Taco de Pastor', 35, 'Cerdo al pastor con piña, cilantro y cebolla'],
    [cat['Tacos'], 'Taco de Bistec', 40, 'Bistec de res asado a la plancha'],
    [cat['Tacos'], 'Taco de Suadero', 38, 'Suadero jugoso con salsa verde'],
    [cat['Tacos'], 'Taco de Chorizo', 35, 'Chorizo casero con cebolla'],
    [cat['Tacos'], 'Taco de Pollo', 35, 'Pollo asado desmenuzado'],
    [cat['Tacos'], 'Taco de Chicharrón', 32, 'Chicharrón prensado en salsa verde'],
    [cat['Tacos'], 'Taco de Lengua', 45, 'Lengua de res cocida y dorada'],
    [cat['Tacos'], 'Taco Campechano', 42, 'Mezcla de bistec, chorizo y longaniza'],
    // Tortas
    [cat['Tortas'], 'Torta de Milanesa', 75, 'Milanesa de res empanizada, lechuga, tomate, aguacate'],
    [cat['Tortas'], 'Torta de Pastor', 70, 'Pastor con piña, queso Oaxaca gratinado'],
    [cat['Tortas'], 'Torta de Jamón', 60, 'Jamón, queso, lechuga, tomate, mayonesa'],
    [cat['Tortas'], 'Torta Hawaiana', 80, 'Milanesa, jamón, queso, piña, salchicha'],
    // Quesadillas
    [cat['Quesadillas'], 'Quesadilla de Queso', 40, 'Queso Oaxaca fundido en tortilla de maíz'],
    [cat['Quesadillas'], 'Quesadilla de Flor de Calabaza', 45, 'Flor de calabaza con queso Oaxaca'],
    [cat['Quesadillas'], 'Quesadilla de Huitlacoche', 50, 'Huitlacoche con queso y epazote'],
    [cat['Quesadillas'], 'Quesadilla de Tinga', 48, 'Tinga de pollo con queso'],
    // Gringas y Volcanes
    [cat['Gringas y Volcanes'], 'Gringa de Pastor', 55, 'Tortilla de harina con pastor y queso fundido'],
    [cat['Gringas y Volcanes'], 'Gringa de Bistec', 60, 'Tortilla de harina con bistec y queso'],
    [cat['Gringas y Volcanes'], 'Volcán de Pastor', 50, 'Tortilla crujiente con pastor y queso gratinado'],
    // Extras
    [cat['Extras'], 'Orden de Guacamole', 35, 'Guacamole fresco con totopos'],
    [cat['Extras'], 'Elote en Vaso', 30, 'Elote desgranado con mayo, queso y chile'],
    [cat['Extras'], 'Papas Fritas', 40, 'Papas fritas con sal y limón'],
    // Aguas Frescas
    [cat['Aguas Frescas'], 'Agua de Horchata', 30, 'Horchata de arroz con canela (1L)'],
    [cat['Aguas Frescas'], 'Agua de Jamaica', 30, 'Jamaica natural (1L)'],
    [cat['Aguas Frescas'], 'Agua de Limón', 25, 'Limonada natural (1L)'],
    [cat['Aguas Frescas'], 'Agua de Tamarindo', 30, 'Tamarindo natural (1L)'],
    // Bebidas
    [cat['Bebidas'], 'Coca-Cola', 25, 'Coca-Cola (500ml)'],
    [cat['Bebidas'], 'Coca-Cola de Vidrio', 30, 'Coca-Cola en botella de vidrio (355ml)'],
    [cat['Bebidas'], 'Sprite', 25, 'Sprite (500ml)'],
    [cat['Bebidas'], 'Agua Natural', 18, 'Agua embotellada (500ml)'],
    [cat['Bebidas'], 'Cerveza Corona', 40, 'Corona Extra (355ml)'],
    [cat['Bebidas'], 'Cerveza Modelo', 40, 'Modelo Especial (355ml)'],
    // Postres
    [cat['Postres'], 'Flan Napolitano', 35, 'Flan casero con caramelo'],
    [cat['Postres'], 'Churros (3 pzas)', 30, 'Churros con azúcar y canela'],
    [cat['Postres'], 'Pastel de Tres Leches', 45, 'Rebanada de pastel de tres leches'],
  ];

  const itemRows = [];
  for (const [categoryId, name, price, description] of items) {
    const rows = await sql`
      INSERT INTO menu_items (category_id, name, price, description, active, is_example, tenant_id)
      VALUES (${categoryId}, ${name}, ${price}, ${description}, true, false, ${tenantId})
      RETURNING id, name
    `;
    itemRows.push(rows[0]);
  }
  const itemId = {};
  for (const row of itemRows) itemId[row.name] = row.id;

  // ── Modifier Groups ─────────────────────────────────────────
  const mgRows = await sql`
    INSERT INTO modifier_groups (name, selection_type, required, min_selections, max_selections, sort_order, active, tenant_id) VALUES
      ('Salsa', 'single', false, 0, 1, 1, true, ${tenantId}),
      ('Extras Taco', 'multi', false, 0, 3, 2, true, ${tenantId}),
      ('Tortilla', 'single', true, 1, 1, 3, true, ${tenantId})
    RETURNING id, name
  `;
  const mg = {};
  for (const row of mgRows) mg[row.name] = row.id;

  // Salsa options
  await sql`
    INSERT INTO modifiers (group_id, name, price_adjustment, sort_order, active, tenant_id) VALUES
      (${mg['Salsa']}, 'Salsa Verde', 0, 1, true, ${tenantId}),
      (${mg['Salsa']}, 'Salsa Roja', 0, 2, true, ${tenantId}),
      (${mg['Salsa']}, 'Salsa de Chipotle', 0, 3, true, ${tenantId}),
      (${mg['Salsa']}, 'Guacamole', 10, 4, true, ${tenantId})
  `;

  // Extras taco options
  await sql`
    INSERT INTO modifiers (group_id, name, price_adjustment, sort_order, active, tenant_id) VALUES
      (${mg['Extras Taco']}, 'Extra Queso', 10, 1, true, ${tenantId}),
      (${mg['Extras Taco']}, 'Extra Cebolla', 0, 2, true, ${tenantId}),
      (${mg['Extras Taco']}, 'Extra Cilantro', 0, 3, true, ${tenantId}),
      (${mg['Extras Taco']}, 'Piña', 5, 4, true, ${tenantId})
  `;

  // Tortilla options
  await sql`
    INSERT INTO modifiers (group_id, name, price_adjustment, sort_order, active, tenant_id) VALUES
      (${mg['Tortilla']}, 'Maíz', 0, 1, true, ${tenantId}),
      (${mg['Tortilla']}, 'Harina', 0, 2, true, ${tenantId})
  `;

  // Assign Salsa + Extras + Tortilla to all tacos
  const tacoNames = items.filter(i => i[0] === cat['Tacos']).map(i => i[1]);
  for (const name of tacoNames) {
    const mid = itemId[name];
    if (!mid) continue;
    await sql`
      INSERT INTO menu_item_modifier_groups (menu_item_id, modifier_group_id, sort_order, tenant_id) VALUES
        (${mid}, ${mg['Salsa']}, 1, ${tenantId}),
        (${mid}, ${mg['Extras Taco']}, 2, ${tenantId}),
        (${mid}, ${mg['Tortilla']}, 3, ${tenantId})
    `;
  }

  // Assign Salsa to quesadillas
  const quesaNames = items.filter(i => i[0] === cat['Quesadillas']).map(i => i[1]);
  for (const name of quesaNames) {
    const mid = itemId[name];
    if (!mid) continue;
    await sql`
      INSERT INTO menu_item_modifier_groups (menu_item_id, modifier_group_id, sort_order, tenant_id) VALUES
        (${mid}, ${mg['Salsa']}, 1, ${tenantId})
    `;
  }

  // Assign Salsa + Extras to tortas
  const tortaNames = items.filter(i => i[0] === cat['Tortas']).map(i => i[1]);
  for (const name of tortaNames) {
    const mid = itemId[name];
    if (!mid) continue;
    await sql`
      INSERT INTO menu_item_modifier_groups (menu_item_id, modifier_group_id, sort_order, tenant_id) VALUES
        (${mid}, ${mg['Salsa']}, 1, ${tenantId}),
        (${mid}, ${mg['Extras Taco']}, 2, ${tenantId})
    `;
  }

  // Assign Salsa + Tortilla to gringas y volcanes
  const gringaNames = items.filter(i => i[0] === cat['Gringas y Volcanes']).map(i => i[1]);
  for (const name of gringaNames) {
    const mid = itemId[name];
    if (!mid) continue;
    await sql`
      INSERT INTO menu_item_modifier_groups (menu_item_id, modifier_group_id, sort_order, tenant_id) VALUES
        (${mid}, ${mg['Salsa']}, 1, ${tenantId}),
        (${mid}, ${mg['Extras Taco']}, 2, ${tenantId})
    `;
  }

  // ── Inventory ───────────────────────────────────────────────
  const invItems = [
    ['Tortillas de maíz', 500, 'pzas', 100, 'Tortillería', 1.5],
    ['Tortillas de harina', 200, 'pzas', 50, 'Tortillería', 3],
    ['Carne de res (bistec)', 30, 'kg', 8, 'Carnes', 220],
    ['Carne de cerdo (pastor)', 40, 'kg', 10, 'Carnes', 180],
    ['Pollo deshebrado', 20, 'kg', 5, 'Carnes', 140],
    ['Chorizo', 15, 'kg', 4, 'Carnes', 160],
    ['Queso Oaxaca', 15, 'kg', 4, 'Lácteos', 200],
    ['Aguacate', 30, 'pzas', 10, 'Verduras', 35],
    ['Cebolla', 20, 'kg', 5, 'Verduras', 25],
    ['Cilantro', 15, 'manojos', 5, 'Verduras', 10],
    ['Limones', 50, 'pzas', 20, 'Verduras', 3],
    ['Piña', 10, 'pzas', 3, 'Verduras', 35],
    ['Aceite vegetal', 20, 'litros', 5, 'Abarrotes', 38],
    ['Coca-Cola 500ml', 100, 'pzas', 24, 'Bebidas', 12],
    ['Cerveza Corona', 48, 'pzas', 12, 'Bebidas', 22],
  ];
  for (const [name, qty, unit, threshold, category, cost] of invItems) {
    await sql`
      INSERT INTO inventory_items (name, quantity, unit, low_stock_threshold, category, cost_price, tenant_id)
      VALUES (${name}, ${qty}, ${unit}, ${threshold}, ${category}, ${cost}, ${tenantId})
    `;
  }

  return {
    categoryCount: catRows.length,
    itemCount: items.length,
    modifierGroupCount: mgRows.length,
  };
}
