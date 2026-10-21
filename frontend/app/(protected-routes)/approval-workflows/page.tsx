import {
  columns,
  type ApprovalWorkflows,
} from "@/app/(protected-routes)/approval-workflows/column-definitions";
import { modal } from "@/app/(protected-routes)/approval-workflows/modal-definitions";
import { DataTable } from "@/components/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { FilePenIcon } from "lucide-react";

async function getApprovalWorkflows(): Promise<ApprovalWorkflows[]> {
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

  // Aggregate status counts dynamically
  const metrics = data.reduce(
    (acc, item) => {
      const status = item.status?.toUpperCase();
      if (status === "APPROVED") acc.approved++;
      else if (status === "REJECTED") acc.rejected++;
      else if (status === "CANCELLED") acc.cancelled++;
      else if (status === "PENDING") acc.pending++;
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0, cancelled: 0 },
  );

  return (
    <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col gap-2 border-b border-border/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Approval Workflows
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and manage purchase requisitions assigned to your approval
            queue
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:self-center">
          <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-xs">
            <FilePenIcon className="h-3.5 w-3.5 text-primary" />
            <span>
              Total Requests:{" "}
              <strong className="font-semibold text-foreground">
                {data.length}
              </strong>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs border-border/70">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pending
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {metrics.pending}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/70">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Approved
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {metrics.approved}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Rejected Card */}
        <Card className="shadow-xs border-border/70">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rejected
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {metrics.rejected}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Cancelled Card */}
        <Card className="shadow-xs border-border/70">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cancelled
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {metrics.cancelled}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
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
