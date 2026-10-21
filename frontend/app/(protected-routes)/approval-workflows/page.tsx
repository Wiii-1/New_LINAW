import {
  columns,
  type ApprovalWorkflows,
} from "@/app/(protected-routes)/approval-workflows/column-definitions";
import { modal } from "@/app/(protected-routes)/approval-workflows/modal-definitions";
import { DataTable } from "@/components/data-table";

async function getApprovalWorkflows(): Promise<ApprovalWorkflows[]> {
  // TODO: Replace with actual backend API call
  // const res = await fetch('API_ENDPOINT');
  // return res.json();

  return [
    {
      id: "approval-uuid-001",
      tenant_id: "tenant-uuid",
      company_id: "company-uuid",
      entity_type: "purchase_requisition",
      entity_id: "requisition-uuid-001",
      requester_user_id: "requester-uuid",
      current_level: 1,
      status: "PENDING",
      submitted_at: "2026-10-21T10:00:00.000Z",
      resolved_at: null,
      created_at: "2026-10-21T10:00:00.000Z",
      updated_at: "2026-10-21T10:00:00.000Z",
      requester_user: {
        first_name: "Ada",
        last_name: "Lovelace",
      },
      purchase_requisition: {
        pr_number: "PR-0001",
        purpose: "Office equipment",
        currency_code: "USD",
        total_amount: "1000",
      },
    },
    {
      id: "approval-uuid-002",
      tenant_id: "tenant-uuid",
      company_id: "company-uuid",
      entity_type: "purchase_requisition",
      entity_id: "requisition-uuid-002",
      requester_user_id: "requester-uuid",
      current_level: 2,
      status: "APPROVED",
      submitted_at: "2026-10-18T09:00:00.000Z",
      resolved_at: "2026-10-19T14:30:00.000Z",
      created_at: "2026-10-18T09:00:00.000Z",
      updated_at: "2026-10-19T14:30:00.000Z",
      requester_user: {
        first_name: "Grace",
        last_name: "Hopper",
      },
      purchase_requisition: {
        pr_number: "PR-0002",
        purpose: "Server rack renewal",
        currency_code: "PHP",
        total_amount: "150000",
      },
    },
  ];
}

export default async function ApprovalWorkflowsPage() {
  const data = await getApprovalWorkflows();

  return (
    <main className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Approval Workflows
        </h1>
        <p className="mt-1 max-w-2xl text-sm">
          Review purchase requisitions routed to your approval level
        </p>
      </div>
      <DataTable
        columns={columns}
        data={data}
        searchKey="request"
        searchPlaceholder="Search request..."
        toolbarActions={modal}
      />
    </main>
  );
}
