import {
  columns,
  type ApprovalWorkflow,
} from "@/app/(protected-routes)/approval-workflows/column-definitions";
import { modal } from "@/app/(protected-routes)/approval-workflows/modal-definitions";
import { DataTable } from "@/components/data-table";

async function getApprovalWorkflows(): Promise<ApprovalWorkflow[]> {
  // Fetch data from your API here
  return [
    {
      id: "WF-1001",
      request: "Dell XPS 15 Laptops (x5)",
      requester: "Maria Santos",
      approvalLevel: 2,
      price: 475000,
      date: "2026-10-12",
      status: "Pending",
    },
    {
      id: "WF-1002",
      request: "AWS Cloud Infrastructure Credits",
      requester: "Juan Dela Cruz",
      approvalLevel: 3,
      price: 120000,
      date: "2026-10-10",
      status: "Approved",
    },
    {
      id: "WF-1003",
      request: "Ergonomic Mesh Chairs (x10)",
      requester: "Ana Reyes",
      approvalLevel: 1,
      price: 85000,
      date: "2026-10-08",
      status: "Approved",
    },
    {
      id: "WF-1004",
      request: "Enterprise Figma Organization License",
      requester: "Mark Tan",
      approvalLevel: 2,
      price: 150000,
      date: "2026-10-05",
      status: "Rejected",
    },
    {
      id: "WF-1005",
      request: "Cisco Industrial Switch Hardware",
      requester: "Paolo Ramos",
      approvalLevel: 3,
      price: 310000,
      date: "2026-10-01",
      status: "Pending",
    },
    {
      id: "WF-1006",
      request: "Annual Cybersecurity Audit",
      requester: "Elena Torralba",
      approvalLevel: 4,
      price: 650000,
      date: "2026-09-28",
      status: "Approved",
    },
    {
      id: "WF-1007",
      request: "4K Meeting Room Soundbar",
      requester: "Gabriel Mendoza",
      approvalLevel: 1,
      price: 68000,
      date: "2026-09-25",
      status: "Cancelled",
    },
    {
      id: "WF-1008",
      request: "JetBrains Team Subscriptions",
      requester: "Christian Yap",
      approvalLevel: 1,
      price: 45000,
      date: "2026-09-20",
      status: "Approved",
    },
    {
      id: "WF-1009",
      request: "Server Room UPS Battery Renewal",
      requester: "David Garcia",
      approvalLevel: 2,
      price: 180000,
      date: "2026-09-18",
      status: "Pending",
    },
    {
      id: "WF-1010",
      request: "Q4 Marketing Collateral Printing",
      requester: "Sofia Cruz",
      approvalLevel: 1,
      price: 35000,
      date: "2026-09-15",
      status: "Rejected",
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
