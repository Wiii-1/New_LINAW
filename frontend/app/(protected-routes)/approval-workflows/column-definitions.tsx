"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { type DataTableFeatures } from "@/types/data-table-features";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ApprovalWorkflow = {
  id: string;
  request: string;
  requester: string;
  approvalLevel: number;
  price: number;
  date: string | number | Date;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
};

const columnHelper = createColumnHelper<DataTableFeatures, ApprovalWorkflow>();

export const columns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "ID",
  }),

  columnHelper.accessor("request", {
    meta: {
      isSearchable: true,
      searchPlaceholder: "Filter requests...",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Request" />
    ),
  }),

  columnHelper.accessor("requester", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Requester" />
    ),
  }),

  columnHelper.accessor("approvalLevel", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Level" />
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        L{row.getValue("approvalLevel")}
      </div>
    ),
  }),

  columnHelper.accessor("price", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const price = Number.parseFloat(row.getValue("price"));
      return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(price);
    },
  }),

  columnHelper.accessor("date", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const rawDate = row.original.date;

      return new Date(rawDate).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  }),

  columnHelper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as ApprovalWorkflow["status"];
      return <span className="font-medium">{status}</span>;
    },
  }),

  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      const workflow = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="h-8 w-8 p-0" />}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(workflow.id)}
              >
                Copy ID
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>Update</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }),
]);