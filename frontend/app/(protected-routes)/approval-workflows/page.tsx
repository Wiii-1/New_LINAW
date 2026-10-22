import {
  columns,
  type ApprovalWorkflows,
} from "@/app/(protected-routes)/approval-workflows/column-definitions";
import { modal } from "@/app/(protected-routes)/approval-workflows/modal-definitions";
import { DataTable } from "@/components/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Workflow } from "lucide-react";

async function getApprovalWorkflows(): Promise<ApprovalWorkflows[]> {
  // TODO: Replace with actual backend API call
  // const res = await fetch('API_ENDPOINT');
  // return res.json();

  return []; // Delete this array once API is connected
}

export default async function ApprovalWorkflowsPage() {
  const data = await getApprovalWorkflows();

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
            Configure, monitor, and review multi-stage authorization paths for
            enterprise purchase requests
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:self-center">
          <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-xs">
            <Workflow className="h-3.5 w-3.5 text-primary" />
            <span>
              Total Workflows:{" "}
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

      <DataTable
        columns={columns}
        data={data}
        searchKey="request"
        searchPlaceholder="Search PR number..."
        toolbarActions={modal}
      />
    </main>
  );
}
