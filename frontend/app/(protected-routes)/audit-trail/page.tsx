import {
  columns,
  type AuditTrail,
} from "@/app/(protected-routes)/audit-trail/column-definitions";
import { modal } from "@/app/(protected-routes)/audit-trail/modal-definitions";
import { DataTable } from "@/components/data-table";
import { Layers } from "lucide-react";

async function getAuditTrail(): Promise<AuditTrail[]> {
  // TODO: Replace with actual backend API call
  // const res = await fetch('API_ENDPOINT');
  // return res.json();

  return []; // Delete this array once API is connected
}

export default async function AuditTrailPage() {
  const data = await getAuditTrail();

  return (
    <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 wrap">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Blockchain Audit Trail
              </h1>
            </div>

            <p className="text-sm text-muted-foreground">
              Oversee auditing and cryptographic immutability of purchase orders
              anchored directly to the smart contract
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:self-center">
          <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-xs">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span>
              Total Records:{" "}
              <strong className="font-semibold text-foreground">
                {data.length}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Table Section */}
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
