import {
  Employee,
  MenuCategory,
  MenuItem,
  Order,
  OrderItem,
  InventoryItem,
  PaymentIntent,
  PaymentStatus,
  SalesReport,
  TopItemsReport,
  EmployeePerformanceReport,
  HourlyReport,
  CashCardBreakdown,
  COGSReport,
  CategoryMargins,
  ContributionMarginReport,
  LiveDashboardData,
  ModifierGroup,
  ComboDefinition,
  OrderPayment,
  Printer,
  DeliveryPlatform,
  DeliveryOrder,
  AISuggestion,
  InventoryPushData,
  AISuggestionFeedback,
  AIConfig,
  AIInsights,
  AIAnalytics,
  PricingSuggestion,
  InventoryForecast,
  CategoryRole,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// For iOS: try multiple LAN IPs when the primary fails
const IOS_FALLBACK_URLS = (import.meta.env.VITE_API_URL_FALLBACKS || '')
  .split(',')
  .filter(Boolean);

let activeBaseUrl = API_BASE_URL;
let fallbackResolved = false;

async function resolveBaseUrl(): Promise<string> {
  if (fallbackResolved || !IOS_FALLBACK_URLS.length) return activeBaseUrl;

  // Try the primary URL first
  try {
    await fetch(`${activeBaseUrl}/menu/categories`, { signal: AbortSignal.timeout(2000) });
    fallbackResolved = true;
    return activeBaseUrl;
  } catch {
    // Primary failed, try fallbacks
  }

  for (const url of IOS_FALLBACK_URLS) {
    try {
      await fetch(`${url}/menu/categories`, { signal: AbortSignal.timeout(2000) });
      activeBaseUrl = url;
      fallbackResolved = true;
      console.log(`[API] Using fallback server: ${url}`);
      return activeBaseUrl;
    } catch {
      // Try next
    }
  }

  // All failed, stick with primary (will show errors naturally)
  fallbackResolved = true;
  return activeBaseUrl;
}

/* ==================== Base API Client ==================== */

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const base = IOS_FALLBACK_URLS.length ? await resolveBaseUrl() : activeBaseUrl;
  const url = `${base}${endpoint}`;
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // Use default error message if response is not JSON
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data as T;
}

/* ==================== Menu Endpoints ==================== */

export async function getCategories(activeOnly?: boolean): Promise<MenuCategory[]> {
  const endpoint = activeOnly ? '/menu/categories?active_only=1' : '/menu/categories';
  return apiRequest<MenuCategory[]>(endpoint);
}

export async function createCategory(data: { name: string; sort_order?: number }): Promise<MenuCategory> {
  return apiRequest<MenuCategory>('/menu/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: number, data: { name?: string; sort_order?: number }): Promise<any> {
  return apiRequest(`/menu/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function toggleCategory(id: number): Promise<any> {
  return apiRequest(`/menu/categories/${id}/toggle`, { method: 'PUT' });
}

export async function getMenuItems(categoryId?: string): Promise<MenuItem[]> {
  const endpoint = categoryId
    ? `/menu/items?category_id=${categoryId}`
    : '/menu/items';
  return apiRequest<MenuItem[]>(endpoint);
}

export async function createMenuItem(data: {
  category_id: number;
  name: string;
  price: number;
  description?: string;
}): Promise<MenuItem> {
  return apiRequest<MenuItem>('/menu/items', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMenuItem(id: number, data: {
  category_id?: number;
  name?: string;
  price?: number;
  description?: string;
}): Promise<any> {
  return apiRequest(`/menu/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function toggleMenuItem(id: number): Promise<any> {
  return apiRequest(`/menu/items/${id}/toggle`, { method: 'PUT' });
}

/* ==================== Order Endpoints ==================== */

interface OrderFilters {
  status?: string;
  date?: string;
}

export async function getOrders(filters?: OrderFilters): Promise<Order[]> {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.date) queryParams.append('date', filters.date);

  const endpoint = `/orders${queryParams.toString() ? `?${queryParams}` : ''}`;
  return apiRequest<Order[]>(endpoint);
}

export async function getOrder(id: number): Promise<Order> {
  return apiRequest<Order>(`/orders/${id}`);
}

interface CreateOrderData {
  employee_id: number;
  items: {
    menu_item_id: number;
    quantity: number;
    notes?: string;
    modifiers?: number[];
    combo_instance_id?: string | null;
  }[];
}

export async function createOrder(data: CreateOrderData): Promise<Order> {
  return apiRequest<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateOrderStatus(
  id: number,
  status: string
): Promise<any> {
  return apiRequest(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function getKitchenOrders(): Promise<Order[]> {
  return apiRequest<Order[]>('/orders/kitchen/active');
}

/* ==================== Payment Endpoints ==================== */

interface CreatePaymentIntentData {
  order_id: number;
  tip?: number;
}

export async function createPaymentIntent(
  data: CreatePaymentIntentData
): Promise<any> {
  return apiRequest('/payments/create-intent', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

interface ConfirmPaymentData {
  order_id: number;
  payment_intent_id: string;
}

export async function confirmPayment(data: ConfirmPaymentData): Promise<any> {
  return apiRequest('/payments/confirm', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

interface RefundPaymentData {
  order_id: number;
  amount?: number;
}

export async function refundPayment(data: RefundPaymentData): Promise<any> {
  return apiRequest('/payments/refund', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function cashPayment(data: {
  order_id: number;
  tip?: number;
  amount_received?: number;
}): Promise<any> {
  return apiRequest('/payments/cash', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPaymentStatus(orderId: number): Promise<any> {
  return apiRequest(`/payments/${orderId}`);
}

/* ==================== Inventory Endpoints ==================== */

export async function getInventory(): Promise<InventoryItem[]> {
  return apiRequest<InventoryItem[]>('/inventory');
}

export async function getLowStock(): Promise<InventoryItem[]> {
  return apiRequest<InventoryItem[]>('/inventory/low-stock');
}

export async function updateInventory(
  id: number,
  data: { quantity?: number; low_stock_threshold?: number }
): Promise<any> {
  return apiRequest(`/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function restockItem(id: number, quantity: number): Promise<any> {
  return apiRequest(`/inventory/${id}/restock`, {
    method: 'POST',
    body: JSON.stringify({ quantity }),
  });
}

export async function deductInventory(orderId: number): Promise<any> {
  return apiRequest('/inventory/deduct', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId }),
  });
}

/* ==================== Employee Endpoints ==================== */

export async function getEmployees(): Promise<Employee[]> {
  return apiRequest<Employee[]>('/employees');
}

interface CreateEmployeeData {
  name: string;
  pin: string;
  role: string;
}

export async function createEmployee(data: CreateEmployeeData): Promise<Employee> {
  return apiRequest<Employee>('/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEmployee(
  id: number,
  data: { name?: string; pin?: string; role?: string }
): Promise<any> {
  return apiRequest(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function loginEmployee(pin: string): Promise<Employee> {
  return apiRequest<Employee>('/employees/login', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  });
}

export async function toggleEmployee(id: number): Promise<any> {
  return apiRequest(`/employees/${id}/toggle`, { method: 'PUT' });
}

/* ==================== Reports Endpoints ==================== */

export async function getSalesReport(period: string): Promise<SalesReport> {
  return apiRequest<SalesReport>(`/reports/sales?period=${period}`);
}

export async function getTopItems(
  period: string,
  limit: number = 10
): Promise<TopItemsReport[]> {
  return apiRequest<TopItemsReport[]>(
    `/reports/top-items?period=${period}&limit=${limit}`
  );
}

export async function getEmployeePerformance(
  period: string
): Promise<EmployeePerformanceReport[]> {
  return apiRequest<EmployeePerformanceReport[]>(
    `/reports/employee-performance?period=${period}`
  );
}

export async function getHourlyReport(): Promise<HourlyReport[]> {
  return apiRequest<HourlyReport[]>('/reports/hourly');
}

export async function getCashCardBreakdown(period: string): Promise<CashCardBreakdown> {
  return apiRequest<CashCardBreakdown>(`/reports/cash-card-breakdown?period=${period}`);
}

export async function getCOGSReport(period: string): Promise<COGSReport> {
  return apiRequest<COGSReport>(`/reports/cogs?period=${period}`);
}

export async function getCategoryMargins(period: string): Promise<CategoryMargins> {
  return apiRequest<CategoryMargins>(`/reports/category-margins?period=${period}`);
}

export async function getContributionMargin(period: string): Promise<ContributionMarginReport> {
  return apiRequest<ContributionMarginReport>(`/reports/contribution-margin?period=${period}`);
}

export async function getLiveDashboard(): Promise<LiveDashboardData> {
  return apiRequest<LiveDashboardData>('/reports/live');
}

export async function getDeliveryMargins(period: string): Promise<any> {
  return apiRequest(`/reports/delivery-margins?period=${period}`);
}

export async function getChannelComparison(period: string): Promise<any> {
  return apiRequest(`/reports/channel-comparison?period=${period}`);
}

/* ==================== Modifier Endpoints ==================== */

export async function getModifierGroups(): Promise<ModifierGroup[]> {
  return apiRequest<ModifierGroup[]>('/modifiers/groups');
}

export async function getModifierGroupsForItem(menuItemId: number): Promise<ModifierGroup[]> {
  return apiRequest<ModifierGroup[]>(`/modifiers/groups/item/${menuItemId}`);
}

export async function createModifierGroup(data: Partial<ModifierGroup>): Promise<ModifierGroup> {
  return apiRequest<ModifierGroup>('/modifiers/groups', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateModifierGroup(id: number, data: Partial<ModifierGroup>): Promise<any> {
  return apiRequest(`/modifiers/groups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function createModifier(data: { group_id: number; name: string; price_adjustment: number }): Promise<any> {
  return apiRequest('/modifiers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateModifier(id: number, data: Partial<{ name: string; price_adjustment: number; active: boolean }>): Promise<any> {
  return apiRequest(`/modifiers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function assignModifierGroupToItem(menuItemId: number, groupId: number): Promise<any> {
  return apiRequest('/modifiers/assign', {
    method: 'POST',
    body: JSON.stringify({ menu_item_id: menuItemId, modifier_group_id: groupId }),
  });
}

export async function removeModifierGroupFromItem(menuItemId: number, groupId: number): Promise<any> {
  return apiRequest('/modifiers/unassign', {
    method: 'POST',
    body: JSON.stringify({ menu_item_id: menuItemId, modifier_group_id: groupId }),
  });
}

/* ==================== Combo Endpoints ==================== */

export async function getCombos(): Promise<ComboDefinition[]> {
  return apiRequest<ComboDefinition[]>('/combos');
}

export async function createCombo(data: Partial<ComboDefinition>): Promise<ComboDefinition> {
  return apiRequest<ComboDefinition>('/combos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCombo(id: number, data: Partial<ComboDefinition>): Promise<any> {
  return apiRequest(`/combos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/* ==================== Split Payment Endpoints ==================== */

export async function splitPayment(data: {
  order_id: number;
  split_type: 'even' | 'by_item' | 'by_amount';
  splits: Array<{ payment_method: 'card' | 'cash'; amount: number; tip?: number; item_ids?: number[] }>;
}): Promise<any> {
  return apiRequest('/payments/split', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getOrderSplits(orderId: number): Promise<OrderPayment[]> {
  return apiRequest<OrderPayment[]>(`/payments/split/${orderId}`);
}

/* ==================== Printer Endpoints ==================== */

export async function getPrinters(): Promise<Printer[]> {
  return apiRequest<Printer[]>('/printers');
}

export async function createPrinter(data: Partial<Printer>): Promise<Printer> {
  return apiRequest<Printer>('/printers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePrinter(id: number, data: Partial<Printer>): Promise<any> {
  return apiRequest(`/printers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getCategoryPrinterRoutes(): Promise<any[]> {
  return apiRequest<any[]>('/printers/routes');
}

export async function updateCategoryPrinterRoute(categoryId: number, printerId: number | null): Promise<any> {
  return apiRequest('/printers/routes', {
    method: 'PUT',
    body: JSON.stringify({ category_id: categoryId, printer_id: printerId }),
  });
}

/* ==================== Delivery Endpoints ==================== */

export async function getDeliveryPlatforms(): Promise<DeliveryPlatform[]> {
  return apiRequest<DeliveryPlatform[]>('/delivery/platforms');
}

export async function updateDeliveryPlatform(id: number, data: Partial<DeliveryPlatform>): Promise<any> {
  return apiRequest(`/delivery/platforms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getDeliveryOrders(status?: string): Promise<DeliveryOrder[]> {
  const endpoint = status ? `/delivery/orders?status=${status}` : '/delivery/orders';
  return apiRequest<DeliveryOrder[]>(endpoint);
}

export async function updateDeliveryOrderStatus(id: number, status: string): Promise<any> {
  return apiRequest(`/delivery/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

/* ==================== AI Endpoints ==================== */

export async function getCartSuggestions(
  itemIds: number[],
  hour?: number
): Promise<AISuggestion[]> {
  const params = new URLSearchParams();
  params.append('items', itemIds.join(','));
  if (hour !== undefined) params.append('hour', String(hour));
  return apiRequest<AISuggestion[]>(`/ai/suggestions/cart?${params}`);
}

export async function getInventoryPushItems(): Promise<InventoryPushData> {
  return apiRequest<InventoryPushData>('/ai/suggestions/inventory-push');
}

export async function submitSuggestionFeedback(
  feedback: AISuggestionFeedback
): Promise<any> {
  return apiRequest('/ai/suggestions/feedback', {
    method: 'POST',
    body: JSON.stringify(feedback),
  });
}

export async function getAIConfig(): Promise<AIConfig> {
  return apiRequest<AIConfig>('/ai/config');
}

export async function updateAIConfig(
  data: { key: string; value: string; description?: string } | { entries: Array<{ key: string; value: string; description?: string }> }
): Promise<any> {
  return apiRequest('/ai/config', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getAIInsights(): Promise<AIInsights> {
  return apiRequest<AIInsights>('/ai/insights');
}

export async function getAIAnalytics(period?: string): Promise<AIAnalytics> {
  const endpoint = period ? `/ai/analytics?period=${period}` : '/ai/analytics';
  return apiRequest<AIAnalytics>(endpoint);
}

export async function getPricingSuggestions(): Promise<PricingSuggestion[]> {
  return apiRequest<PricingSuggestion[]>('/ai/pricing-suggestions');
}

export async function applyPricingSuggestion(
  id: string,
  menuItemId: number,
  newPrice: number
): Promise<any> {
  return apiRequest(`/ai/pricing-suggestions/${id}/apply`, {
    method: 'POST',
    body: JSON.stringify({ menu_item_id: menuItemId, new_price: newPrice }),
  });
}

export async function getInventoryForecast(): Promise<InventoryForecast[]> {
  return apiRequest<InventoryForecast[]>('/ai/inventory-forecast');
}

export async function getCategoryRoles(): Promise<CategoryRole[]> {
  return apiRequest<CategoryRole[]>('/ai/category-roles');
}

export async function updateCategoryRole(
  categoryId: number,
  role: string
): Promise<any> {
  return apiRequest(`/ai/category-roles/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export async function exportAIConfig(): Promise<any> {
  return apiRequest('/ai/config/export');
}

export async function importAIConfig(data: any): Promise<any> {
  return apiRequest('/ai/config/import', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function runGrokAnalysis(type?: string): Promise<any> {
  return apiRequest('/ai/analyze', {
    method: 'POST',
    body: JSON.stringify({ type: type || 'all' }),
  });
}
