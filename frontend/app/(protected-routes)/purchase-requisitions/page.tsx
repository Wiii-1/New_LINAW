import {
  columns,
  type PurchaseRequisition,
} from "@/app/(protected-routes)/purchase-requisitions/column-definitions";
import { modal } from "@/app/(protected-routes)/purchase-requisitions/modal-definitions";
import { DataTable } from "@/components/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

async function getPurchaseRequisition(): Promise<PurchaseRequisition[]> {
  // TODO: Replace with actual backend API call
  // const res = await fetch('API_ENDPOINT');
  // return res.json();

  return []; // Delete this array once API is connected
}

export default async function PurchaseRequisitionsPage() {
  const data = await getPurchaseRequisition();

  const metrics = data.reduce(
    (acc, item) => {
      const status = item.requisition_status?.toUpperCase();
      if (status === "APPROVED") acc.approved++;
      else if (status === "REJECTED") acc.rejected++;
      else if (status === "CANCELLED") acc.cancelled++;
      else if (status === "SUBMITTED") acc.submitted++;
      else if (status === "DRAFT") acc.draft++;
      return acc;
    },
    { draft: 0, submitted: 0, approved: 0, rejected: 0, cancelled: 0 },
  );

  return (
    <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 wrap">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Purchase Requisitions
              </h1>
            </div>

            <p className="text-sm text-muted-foreground">
              Create, track, and manage internal requests for goods and services
              prior to purchase order generation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:self-center">
          <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-xs">
            <ClipboardList className="h-3.5 w-3.5 text-primary" />
            <span>
              Total Requests:{" "}
              <strong className="font-semibold text-foreground">
                {data.length}
              </strong>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-xs border-border/70">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Submitted
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {metrics.submitted}
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

        <Card className="shadow-xs border-border/70">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Draft
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {metrics.draft}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchKey="requisition_number"
        searchPlaceholder="Search PR request..."
        toolbarActions={modal}
      />
    </main>
  );
}
