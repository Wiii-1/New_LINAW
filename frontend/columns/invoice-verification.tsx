"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { type DataTableFeatures } from "../components/data-table-features";

export type InvoiceVerification = {
  id: string;
  tenant_id: string;
  company_id: string;
  supplier_id: string;
  purchase_order_id: string;
  invoice_number: string;
  currency_code: string;
  total_amount: number | string;
  match_status: string;
  verification_status: string;
  invoice_date: string | Date;
};

const columnHelper = createColumnHelper<
  DataTableFeatures,
  InvoiceVerification
>();

export const invoiceVerificationColumns = columnHelper.columns([
  columnHelper.accessor("id", { header: "ID" }),
  columnHelper.accessor("tenant_id", { header: "Tenant ID" }),
  columnHelper.accessor("company_id", { header: "Company ID" }),
  columnHelper.accessor("supplier_id", { header: "Supplier ID" }),
  columnHelper.accessor("purchase_order_id", { header: "PO ID" }),

  columnHelper.accessor("invoice_number", {
    header: "Invoice Number",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("invoice_number")}</div>
    ),
  }),
  columnHelper.accessor("match_status", { header: "Match Status" }),
  columnHelper.accessor("verification_status", {
    header: "Verification Status",
  }),
  columnHelper.accessor("total_amount", {
    header: () => <div className="text-right">Total Amount</div>,
    cell: ({ row }) => {
      const amount = Number(row.getValue("total_amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: row.original.currency_code || "USD",
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  }),
  columnHelper.accessor("invoice_date", {
    header: "Invoice Date",
    cell: ({ row }) =>
      new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(row.getValue("invoice_date"))),
  }),
]);
