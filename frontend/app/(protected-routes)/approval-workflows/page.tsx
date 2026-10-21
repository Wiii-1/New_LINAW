import {
  columns,
  type ApprovalWorkflow,
} from "@/app/(protected-routes)/approval-workflows/column-definitions";
import { modal } from "@/app/(protected-routes)/approval-workflows/modal-definitions";
import { DataTable } from "@/components/data-table";

async function getApprovalWorkflows(): Promise<ApprovalWorkflow[]> {
  // TODO: Replace with actual backend API call
  // const res = await fetch('API_ENDPOINT');
  // return res.json();

  return []; // Delete this array once API is connected
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
