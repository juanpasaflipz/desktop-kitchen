/* Employee Types */
export interface Employee {
  id: number;
  name: string;
  pin?: string;
  role: 'cashier' | 'kitchen' | 'manager' | 'admin';
  active: boolean;
  created_at: string;
}

/* Menu Types */
export interface MenuCategory {
  id: number;
  name: string;
  sort_order: number;
  active: boolean;
}

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  active: boolean;
}

/* Order Types */
export interface OrderItem {
  id?: number;
  order_id?: number;
  menu_item_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  combo_instance_id?: string | null;
  modifiers?: OrderItemModifier[];
}

export interface CartItem extends OrderItem {
  cart_id: string;
  menuItem?: MenuItem;
  selectedModifierIds?: number[];
  selectedModifierNames?: string[];
}

export interface Order {
  id: number;
  order_number: string;
  employee_id: number;
  employee_name?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  payment_intent_id?: string;
  payment_status: 'unpaid' | 'processing' | 'paid' | 'completed' | 'failed' | 'refunded';
  payment_method?: 'card' | 'cash' | 'split' | null;
  source?: 'pos' | 'uber_eats' | 'rappi' | 'didi_food';
  created_at: string;
  completed_at?: string;
  items?: OrderItem[];
}

/* Inventory Types */
export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  low_stock_threshold: number;
  category: string;
}

/* Payment Types */
export interface PaymentIntent {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
}

export interface PaymentStatus {
  status: 'unpaid' | 'processing' | 'completed' | 'failed' | 'refunded';
  payment_intent_id?: string;
  amount?: number;
}

/* Report Types */
export interface SalesReport {
  period: string;
  total_revenue: number;
  order_count: number;
  avg_ticket: number;
  tip_total: number;
  data?: any[];
}

export interface TopItemsReport {
  item_name: string;
  quantity_sold: number;
  revenue: number;
}

export interface EmployeePerformanceReport {
  employee_id: number;
  employee_name: string;
  orders_processed: number;
  total_sales: number;
  avg_ticket: number;
  tips_received: number;
}

export interface HourlyReport {
  hour: number;
  orders: number;
  revenue: number;
  avg_ticket: number;
}

/* AI Suggestion Types */
export interface AISuggestion {
  type: string;
  priority: number;
  data: {
    rule: string;
    suggested_item_id: number;
    suggested_item_name: string;
    suggested_item_price: number;
    savings?: number;
    message: string;
  };
}

export interface InventoryPushItem {
  menu_item_id: number;
  name: string;
  price: number;
  category_id: number;
  category_name: string;
  reason: string;
  ingredient_name?: string;
}

export interface InventoryPushData {
  pushItems: InventoryPushItem[];
  avoidItems: InventoryPushItem[];
  lowIngredients?: Array<{
    id: number;
    name: string;
    quantity: number;
    unit: string;
    low_stock_threshold: number;
  }>;
}

export interface AIConfig {
  [key: string]: {
    value: string;
    description: string | null;
    updated_at: string | null;
  };
}

export interface AISuggestionFeedback {
  suggestion_type: string;
  suggestion_data?: any;
  action: 'accepted' | 'dismissed';
  employee_id?: number;
  order_id?: number;
}

export interface AIInsights {
  inventory: {
    pushItems: number;
    avoidItems: number;
    lowIngredients: number;
  };
  suggestions: {
    totalEvents: number;
    accepted: number;
    acceptanceRate: number;
  };
  topItemPairs: Array<{
    item_a_id: number;
    item_b_id: number;
    pair_count: number;
    item_a_name: string;
    item_b_name: string;
  }>;
  recentSnapshots: Array<{
    snapshot_hour: string;
    order_count: number;
    revenue: number;
    avg_ticket: number;
  }>;
  grokStats: {
    enabled: boolean;
    apiKeySet: boolean;
    callsThisHour: number;
    maxCallsPerHour: number;
    model: string;
  };
  aiStatus: {
    initialized: boolean;
    scheduler: {
      running: boolean;
      jobs: Array<{
        name: string;
        intervalMs: number;
        lastRun: string | null;
        runCount: number;
      }>;
    };
  };
}

export interface AIAnalytics {
  period: string;
  byType: Array<{ suggestion_type: string; action: string; count: number }>;
  dailyTrend: Array<{ date: string; action: string; count: number }>;
  aiRevenue: { itemsSold: number; revenue: number };
}

export interface PricingSuggestion {
  id: string;
  type: 'markup' | 'discount';
  menu_item_id: number;
  item_name: string;
  current_price: number;
  suggested_price: number;
  change_percent: number;
  reason: string;
  requires_approval: boolean;
}

export interface InventoryForecast {
  inventory_item_id: number;
  name: string;
  current_quantity: number;
  unit: string;
  category: string;
  avg_daily_usage: number;
  days_until_stockout: number | null;
  days_until_low: number | null;
  suggested_reorder_qty: number | null;
  risk_level: 'critical' | 'high' | 'medium' | 'low' | 'unknown';
  data_days: number;
  message?: string;
}

export interface CategoryRole {
  id: number;
  category_id: number;
  role: string;
  category_name: string;
}

/* Financial Report Types */
export interface CashCardBreakdown {
  period: string;
  total_orders: number;
  total_revenue: number;
  breakdown: Array<{
    payment_method: string;
    count: number;
    total: number;
    tips: number;
    percentage: number;
    revenue_percentage: number;
  }>;
}

export interface COGSReport {
  period: string;
  items: Array<{
    menu_item_id: number;
    item_name: string;
    quantity_sold: number;
    revenue: number;
    cogs: number;
    margin: number;
    margin_percent: number;
  }>;
  totals: {
    total_revenue: number;
    total_cogs: number;
    total_margin: number;
    overall_margin_percent: number;
  };
}

export interface CategoryMargins {
  period: string;
  categories: Array<{
    category_id: number;
    category_name: string;
    quantity_sold: number;
    revenue: number;
    cogs: number;
    margin: number;
    margin_percent: number;
  }>;
}

export interface ContributionMarginReport {
  period: string;
  data: Array<{
    date: string;
    revenue: number;
    cogs: number;
    contribution_margin: number;
    margin_percent: number;
    orders: number;
  }>;
}

export interface LiveDashboardData {
  date: string;
  kpis: {
    order_count: number;
    revenue: number;
    avg_ticket: number;
    tips: number;
    cash_orders: number;
    card_orders: number;
    cash_revenue: number;
    card_revenue: number;
  };
  hourly: Array<{ hour: number; orders: number; revenue: number }>;
  sources: Array<{ source: string; count: number; revenue: number }>;
  topItems: Array<{ item_name: string; qty: number }>;
}

/* Modifier Types */
export interface ModifierGroup {
  id: number;
  name: string;
  selection_type: 'single' | 'multi';
  required: boolean;
  min_selections: number;
  max_selections: number;
  sort_order: number;
  active: boolean;
  modifiers?: Modifier[];
}

export interface Modifier {
  id: number;
  group_id: number;
  name: string;
  price_adjustment: number;
  sort_order: number;
  active: boolean;
}

export interface OrderItemModifier {
  id: number;
  order_item_id: number;
  modifier_id: number;
  modifier_name: string;
  price_adjustment: number;
}

/* Combo Types */
export interface ComboDefinition {
  id: number;
  name: string;
  description: string;
  combo_price: number;
  active: boolean;
  slots?: ComboSlot[];
}

export interface ComboSlot {
  id: number;
  combo_id: number;
  slot_label: string;
  category_id: number | null;
  specific_item_id: number | null;
  sort_order: number;
}

/* Split Payment Types */
export interface OrderPayment {
  id: number;
  order_id: number;
  payment_method: 'card' | 'cash';
  amount: number;
  tip: number;
  payment_intent_id?: string;
  status: string;
}

/* Printer Types */
export interface Printer {
  id: number;
  name: string;
  printer_type: string;
  address: string;
  active: boolean;
}

/* Delivery Types */
export interface DeliveryPlatform {
  id: number;
  name: string;
  display_name: string;
  commission_percent: number;
  active: boolean;
}

export interface DeliveryOrder {
  id: number;
  order_id: number;
  platform_id: number;
  external_order_id: string;
  platform_status: string;
  delivery_fee: number;
  platform_commission: number;
  customer_name: string;
  delivery_address: string;
}

/* API Response Types */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
