"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { type ApprovalRequest, type ApprovalStatus } from "@/app/api/approval-workflow/client";
import {
  DEFAULT_CURRENCY_CODE,
  formatCurrency,
} from "@/lib/currencies";
import { type DataTableFeatures } from "@/types/data-table-features";

const statusLabels: Record<ApprovalStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

function StatusPill({ status }: Readonly<{ status: ApprovalStatus }>) {
  return (
    <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium">
      {statusLabels[status]}
    </span>
  );
}

const columnHelper = createColumnHelper<DataTableFeatures, ApprovalRequest>();

export function createApprovalColumns(
  onSelect: (request: ApprovalRequest) => void,
) {
  return columnHelper.columns([
    columnHelper.accessor("id", {
      header: "Request",
      cell: ({ row }) => (
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate font-medium">{row.original.id}</span>
          <span className="text-xs">{row.original.entityId}</span>
        </div>
      ),
    }),
    columnHelper.accessor("requester", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Requester" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span>{row.original.requester}</span>
          <span className="text-xs">{row.original.submittedAt}</span>
        </div>
      ),
    }),
    columnHelper.accessor("amount", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) =>
        formatCurrency(
          row.original.amount,
          row.original.currencyCode ?? DEFAULT_CURRENCY_CODE,
        ),
    }),
    columnHelper.accessor("currentLevel", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Level" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span>Level {row.original.currentLevel}</span>
          {row.original.approverRole && (
            <span className="text-xs">{row.original.approverRole}</span>
          )}
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => <StatusPill status={row.original.status} />,
    }),
    columnHelper.display({
      id: "open",
      enableHiding: false,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Open ${row.original.id}`}
          onClick={() => onSelect(row.original)}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      ),
    }),
  ]);
}