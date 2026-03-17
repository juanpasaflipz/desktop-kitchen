/**
 * Customer Order API client.
 * Public endpoints — no auth required. Used by the QR code ordering screen.
 */

const API_BASE = '/api/customer-order';

export interface CustomerOrderSettings {
  requirePayment: boolean;
}

export interface CustomerOrderItem {
  menu_item_id: number;
  quantity: number;
  notes?: string;
  modifiers?: number[];
}

export interface CustomerOrderResult {
  order_number: number;
  estimated_ready_minutes: number;
  estimated_ready_range: { low: number; high: number };
  payment_client_secret?: string;
}

export async function getCustomerOrderSettings(): Promise<CustomerOrderSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to fetch settings: ${res.status}`);
  }
  return res.json();
}

export async function placeCustomerOrder(
  items: CustomerOrderItem[]
): Promise<CustomerOrderResult> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to place order: ${res.status}`);
  }
  return res.json();
}
