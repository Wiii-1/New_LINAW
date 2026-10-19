"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { type DataTableFeatures } from "../types/data-table-features";

export type Supplier = {
  id: string;
  tenant_id: string;
  company_id: string;
  supplier_code: string;
  status: string;
};

const columnHelper = createColumnHelper<DataTableFeatures, Supplier>();

export const supplierColumns = columnHelper.columns([
  columnHelper.accessor("id", { header: "ID" }),
  columnHelper.accessor("tenant_id", { header: "Tenant ID" }),
  columnHelper.accessor("company_id", { header: "Company ID" }),

  columnHelper.accessor("supplier_code", {
    header: "Supplier Code",
    cell: ({ row }) => <div>{row.getValue("supplier_code")}</div>,
  }),
  columnHelper.accessor("status", { header: "Status" }),
]);
