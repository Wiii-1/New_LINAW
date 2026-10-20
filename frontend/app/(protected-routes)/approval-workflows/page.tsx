"use client";

import { useEffect, useState } from "react";
import {
  columns,
  type ApprovalWorkflow,
} from "@/app/(protected-routes)/approval-workflows/column-definitions";
import {
  getApprovalRequests,
  type ApprovalRequest,
} from "@/app/api/approval-workflow/client";
import { modal } from "@/app/(protected-routes)/approval-workflows/modal-definitions";
import { DataTable } from "@/components/data-table";

function toApprovalWorkflow(request: ApprovalRequest): ApprovalWorkflow {
  const status = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
  } as const;

  return {
    id: request.id,
    request: request.request,
    requester: request.requester,
    approvalLevel: request.currentLevel,
    price: request.amount,
    date: request.submittedAt,
    status: status[request.status],
  };
}

export default function ApprovalWorkflowsPage() {
  const [data, setData] = useState<ApprovalWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    getApprovalRequests()
      .then((requests) => {
        if (isCurrent) setData(requests.map(toApprovalWorkflow));
      })
      .catch((requestError: unknown) => {
        if (!isCurrent) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load approval workflows.",
        );
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

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
      {isLoading ? (
        <p className="py-10 text-sm">Loading approval workflows...</p>
      ) : error ? (
        <p className="py-10 text-sm text-destructive">{error}</p>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          searchKey="request"
          searchPlaceholder="Filter request..."
          toolbarActions={modal}
        />
      )}
    </main>
  );
}