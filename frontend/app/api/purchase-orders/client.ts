export type PurchaseOrderStatus = "DRAFT" | "ISSUED" | "ORDERED" | "CANCELLED" | "COMPLETED";

export type PurchaseOrderItem = {
  id?: string;
  line_no: number;
  description: string;
  quantity: number | string;
  unit_of_measure: string;
  unit_price: number | string;
};

export type PurchaseOrder = {
  id: string;
  po_number: string;
  status: PurchaseOrderStatus;
  currency_code: string;
  total_amount: number | string;
  order_date?: string | null;
  expected_delivery_date?: string | null;
  supplier?: { id?: string; name?: string; legal_name?: string } | null;
  items?: PurchaseOrderItem[];
};

type ListResponse = { list: PurchaseOrder[]; total: number };

export class PurchaseOrderApiError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.name = "PurchaseOrderApiError"; this.status = status; }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/purchase-orders${path}`, {
    ...init,
    headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
  if (!response.ok) throw new PurchaseOrderApiError(body?.error ?? body?.message ?? "The purchase order request failed.", response.status);
  return body as T;
}

export async function listPurchaseOrders(filters: { status?: PurchaseOrderStatus; referenceNo?: string } = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.referenceNo) params.set("referenceNo", filters.referenceNo);
  const query = params.toString();
  return request<ListResponse>(query ? `/?${query}` : "/");
}

export async function getPurchaseOrder(id: string) { return (await request<{ PO: PurchaseOrder }>(`/${id}`)).PO; }

export async function cancelPurchaseOrder(id: string) {
  return (await request<{ deletedPO: PurchaseOrder }>(`/${id}`, { method: "DELETE" })).deletedPO;
}
