export type RfqStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "CANCELLED";

export type ProcurementQueueItem = {
  id: string;
  pr_number: string;
  status: string;
  purpose?: string | null;
  justification?: string | null;
  currency_code?: string | null;
  total_amount?: number | string | null;
  approved_at?: string | null;
  requested_by_user?: { first_name?: string; last_name?: string } | null;
  items?: Array<{ id?: string; line_no: number; description: string; quantity: number | string; unit_of_measure: string; specification?: string | null }>;
};

export type Rfq = {
  id: string;
  rfq_number: string;
  purchase_requisition_id?: string | null;
  title: string;
  description?: string | null;
  status: RfqStatus;
  issue_date?: string | null;
  closing_date?: string | null;
  items?: Array<{ id?: string; line_no: number; description: string; quantity: number | string; unit_of_measure: string; specification?: string | null }>;
};

export type Quotation = {
  id: string;
  quotation_number: string;
  supplier_id: string;
  currency_code: string;
  total_amount: number | string;
  status: string;
  submitted_at?: string | null;
  valid_until?: string | null;
  supplier?: { id?: string; supplier_code?: string; name?: string; legal_name?: string } | null;
};

export class RfqApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) { super(message); this.name = "RfqApiError"; this.status = status; }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/purchase-orders${path}`, {
      ...init,
      headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
      cache: "no-store",
    });
  } catch { throw new RfqApiError("Unable to reach the purchase order service. Please try again.", 0); }
  const body = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
  if (!response.ok) throw new RfqApiError(body?.error ?? body?.message ?? "The RFQ request failed.", response.status);
  return body as T;
}

export async function listProcurementQueue() {
  const response = await request<{ ApprovedPR?: ProcurementQueueItem[] }>("/procurement-queue");
  return response.ApprovedPR ?? [];
}

export async function createRfq(input: { purchase_requisition_id: string; title: string; description?: string; closing_date: string; rfq_items: Array<{ line_no: number; description: string; quantity: number; unit_of_measure: string; specification: string }> }) {
  return (await request<{ createRfq: Rfq }>("/rfqs", { method: "POST", body: JSON.stringify(input) })).createRfq;
}

export async function publishRfq(id: string) {
  return request<{ published: { message: string } }>(`/rfqs/${encodeURIComponent(id)}/publish`, { method: "POST" });
}

export async function listRfqs() {
  return (await request<{ list?: Rfq[] }>("/rfqs")).list ?? [];
}

export async function listRfqQuotations(id: string) {
  return (await request<{ QuotationList?: Quotation[] }>(`/rfqs/${encodeURIComponent(id)}/quotations`)).QuotationList ?? [];
}