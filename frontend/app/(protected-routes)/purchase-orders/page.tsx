"use client";

import { Fragment, useMemo, useState } from "react";
import {
  ArrowDownToLineIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CirclePlusIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  SearchIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PurchaseOrderStatus = "ISSUED" | "ORDERED" | "COMPLETED" | "CANCELLED";

type PurchaseOrder = {
  id: string;
  poNumber: string;
  supplier: string;
  requisition: string;
  orderDate: string;
  deliveryDate: string;
  currency: string;
  total: number;
  status: PurchaseOrderStatus;
  items: Array<{
    line: number;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
};

const purchaseOrders: PurchaseOrder[] = [
  {
    id: "po-001",
    poNumber: "PO-20261018-001",
    supplier: "Northstar Industrial Supply",
    requisition: "PR-20261004-014",
    orderDate: "18 Oct 2026",
    deliveryDate: "28 Oct 2026",
    currency: "USD",
    total: 18450,
    status: "ISSUED",
    items: [
      {
        line: 1,
        description: "Industrial safety helmets",
        quantity: 120,
        unit: "Each",
        unitPrice: 42.5,
        total: 5100,
      },
      {
        line: 2,
        description: "High-visibility work jackets",
        quantity: 120,
        unit: "Each",
        unitPrice: 68.75,
        total: 8250,
      },
      {
        line: 3,
        description: "Protective work gloves",
        quantity: 300,
        unit: "Pair",
        unitPrice: 17,
        total: 5100,
      },
    ],
  },
  {
    id: "po-002",
    poNumber: "PO-20261016-003",
    supplier: "Atlas Office Systems",
    requisition: "PR-20260927-009",
    orderDate: "16 Oct 2026",
    deliveryDate: "04 Nov 2026",
    currency: "USD",
    total: 9280,
    status: "ORDERED",
    items: [
      {
        line: 1,
        description: "Ergonomic task chairs",
        quantity: 24,
        unit: "Each",
        unitPrice: 285,
        total: 6840,
      },
      {
        line: 2,
        description: "Height-adjustable desks",
        quantity: 8,
        unit: "Each",
        unitPrice: 305,
        total: 2440,
      },
    ],
  },
  {
    id: "po-003",
    poNumber: "PO-20261011-002",
    supplier: "Clearline Network Services",
    requisition: "PR-20260919-006",
    orderDate: "11 Oct 2026",
    deliveryDate: "20 Oct 2026",
    currency: "EUR",
    total: 3420,
    status: "COMPLETED",
    items: [
      {
        line: 1,
        description: "Managed network switches",
        quantity: 6,
        unit: "Each",
        unitPrice: 420,
        total: 2520,
      },
      {
        line: 2,
        description: "Fiber patch panels",
        quantity: 6,
        unit: "Each",
        unitPrice: 150,
        total: 900,
      },
    ],
  },
  {
    id: "po-004",
    poNumber: "PO-20261008-001",
    supplier: "Meridian Facilities Group",
    requisition: "PR-20260915-003",
    orderDate: "08 Oct 2026",
    deliveryDate: "15 Oct 2026",
    currency: "USD",
    total: 12600,
    status: "CANCELLED",
    items: [
      {
        line: 1,
        description: "HVAC replacement filters",
        quantity: 80,
        unit: "Each",
        unitPrice: 157.5,
        total: 12600,
      },
    ],
  },
];

const procurementQueue = [
  {
    number: "PR-20261017-021",
    title: "Warehouse barcode scanners",
    requestedBy: "Operations",
    items: 3,
    approved: "17 Oct 2026",
    value: "$7,840",
  },
  {
    number: "PR-20261015-018",
    title: "Quarterly generator service",
    requestedBy: "Facilities",
    items: 1,
    approved: "15 Oct 2026",
    value: "$2,250",
  },
  {
    number: "PR-20261013-011",
    title: "Customer support workstations",
    requestedBy: "People & Culture",
    items: 5,
    approved: "13 Oct 2026",
    value: "$11,600",
  },
];

const summaryCells: Array<{
  label: string;
  value: number;
  status: "ALL" | PurchaseOrderStatus;
}> = [
  { label: "All orders", value: purchaseOrders.length, status: "ALL" },
  {
    label: "Issued",
    value: purchaseOrders.filter((order) => order.status === "ISSUED").length,
    status: "ISSUED",
  },
  {
    label: "In progress",
    value: purchaseOrders.filter((order) => order.status === "ORDERED").length,
    status: "ORDERED",
  },
  {
    label: "Completed",
    value: purchaseOrders.filter((order) => order.status === "COMPLETED").length,
    status: "COMPLETED",
  },
];

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | PurchaseOrderStatus>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>("po-001");

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return purchaseOrders.filter((order) => {
      const matchesSearch = [order.poNumber, order.supplier, order.requisition]
        .join(" ")
        .toLowerCase()
        .includes(query);
      const matchesStatus = status === "ALL" || order.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  return (
    <main className="min-h-[calc(100svh-var(--header-height))]">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em]">
              <FileTextIcon className="size-3.5" />
              Procurement / Ordering
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Purchase orders
            </h1>
            <p className="mt-1 text-sm">
              Track issued orders, delivery commitments, and receiving progress.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ArrowDownToLineIcon />
              Export
            </Button>
            <Button size="sm">
              <CirclePlusIcon />
              Procurement queue
            </Button>
          </div>
        </header>

        <Tabs defaultValue="orders" className="gap-4">
          <TabsList
            variant="line"
            className="w-full justify-start rounded-none border-b border-slate-200 p-0"
          >
            <TabsTrigger
              value="orders"
              className="flex-none px-1 pb-3 text-sm"
            >
              Orders <span className="ml-1 text-xs">{purchaseOrders.length}</span>
            </TabsTrigger>
            <TabsTrigger
              value="queue"
              className="flex-none px-1 pb-3 text-sm"
            >
              Approved requisitions{" "}
              <span className="ml-1 text-xs">{procurementQueue.length}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="flex flex-col gap-4">
            <section className="grid grid-cols-2 border border-slate-200 sm:grid-cols-4">
              {summaryCells.map(
                ({ label, value, status: summaryStatus }, index) => (
                  <button
                    key={label}
                    type="button"
                    className={`border-slate-200 px-4 py-3 text-left transition-colors ${index > 0 ? "border-l" : ""}`}
                    onClick={() => setStatus(summaryStatus)}
                  >
                    <div className="text-xs font-medium uppercase tracking-[0.1em]">
                      {label}
                    </div>
                    <div className="mt-1 text-xl font-semibold">{value}</div>
                  </button>
                ),
              )}
            </section>

            <section className="overflow-hidden border border-slate-200">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                  <SearchIcon className="absolute left-2.5 top-2.5 size-4" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search PO, supplier, or requisition"
                    className="h-9 pl-8"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="status-filter" className="text-xs font-medium">
                    Status
                  </label>
                  <select
                    id="status-filter"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as "ALL" | PurchaseOrderStatus)
                    }
                    className="h-9 rounded-md border border-input px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="ALL">All statuses</option>
                    <option value="ISSUED">Issued</option>
                    <option value="ORDERED">Ordered</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <Table className="min-w-[1050px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 border-r border-slate-200" />
                    <TableHead className="w-48 border-r border-slate-200 text-[11px] uppercase tracking-wider">
                      PO number
                    </TableHead>
                    <TableHead className="border-r border-slate-200 text-[11px] uppercase tracking-wider">
                      Supplier
                    </TableHead>
                    <TableHead className="w-40 border-r border-slate-200 text-[11px] uppercase tracking-wider">
                      Requisition
                    </TableHead>
                    <TableHead className="w-32 border-r border-slate-200 text-[11px] uppercase tracking-wider">
                      Order date
                    </TableHead>
                    <TableHead className="w-36 border-r border-slate-200 text-[11px] uppercase tracking-wider">
                      Expected delivery
                    </TableHead>
                    <TableHead className="w-36 border-r border-slate-200 text-right text-[11px] uppercase tracking-wider">
                      Total
                    </TableHead>
                    <TableHead className="w-28 border-r border-slate-200 text-[11px] uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const isExpanded = expandedId === order.id;

                    return (
                      <Fragment key={order.id}>
                        <TableRow
                          data-state={isExpanded ? "selected" : undefined}
                          className="group"
                        >
                          <TableCell className="border-r border-slate-100 text-center">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label={`${isExpanded ? "Collapse" : "Expand"} ${order.poNumber}`}
                              onClick={() =>
                                setExpandedId(isExpanded ? null : order.id)
                              }
                            >
                              {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                            </Button>
                          </TableCell>
                          <TableCell className="border-r border-slate-100 font-mono text-xs font-semibold">
                            {order.poNumber}
                          </TableCell>
                          <TableCell className="border-r border-slate-100 font-medium">
                            {order.supplier}
                          </TableCell>
                          <TableCell className="border-r border-slate-100 font-mono text-xs">
                            {order.requisition}
                          </TableCell>
                          <TableCell className="border-r border-slate-100">
                            {order.orderDate}
                          </TableCell>
                          <TableCell className="border-r border-slate-100">
                            {order.deliveryDate}
                          </TableCell>
                          <TableCell className="border-r border-slate-100 text-right font-mono text-xs font-semibold">
                            {formatAmount(order.total, order.currency)}
                          </TableCell>
                          <TableCell className="border-r border-slate-100">
                            <Badge variant="outline">{order.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label={`More actions for ${order.poNumber}`}
                            >
                              <MoreHorizontalIcon />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`${order.id}-detail`}>
                            <TableCell colSpan={9} className="p-0">
                              <div className="border-y border-slate-200 px-6 py-4 sm:px-12">
                                <div className="mb-3 flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em]">
                                    Order lines
                                  </div>
                                  <span className="font-mono text-xs">{order.items.length} lines</span>
                                </div>
                                <div className="overflow-x-auto border border-slate-200">
                                  <table className="w-full min-w-[680px] text-xs">
                                    <thead className="text-left uppercase tracking-wider">
                                      <tr>
                                        <th className="w-12 px-3 py-2">#</th>
                                        <th className="px-3 py-2">Description</th>
                                        <th className="w-24 px-3 py-2 text-right">Qty</th>
                                        <th className="w-24 px-3 py-2">Unit</th>
                                        <th className="w-32 px-3 py-2 text-right">Unit price</th>
                                        <th className="w-32 px-3 py-2 text-right">Line total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {order.items.map((item) => (
                                        <tr key={item.line} className="border-t border-slate-100">
                                          <td className="px-3 py-2 font-mono">
                                            {String(item.line).padStart(2, "0")}
                                          </td>
                                          <td className="px-3 py-2 font-medium">
                                            {item.description}
                                          </td>
                                          <td className="px-3 py-2 text-right font-mono">
                                            {item.quantity}
                                          </td>
                                          <td className="px-3 py-2">{item.unit}</td>
                                          <td className="px-3 py-2 text-right font-mono">
                                            {formatAmount(item.unitPrice, order.currency)}
                                          </td>
                                          <td className="px-3 py-2 text-right font-mono font-semibold">
                                            {formatAmount(item.total, order.currency)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-xs">
                <span>
                  {filteredOrders.length} of {purchaseOrders.length} orders
                </span>
                <span className="font-mono">Updated just now</span>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="queue">
            <section className="overflow-hidden border border-slate-200">
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="text-sm font-semibold">
                  Approved requisitions awaiting sourcing
                </h2>
                <p className="mt-1 text-xs">
                  These requisitions have no RFQ yet and can move into the quotation workflow.
                </p>
              </div>
              <Table className="min-w-[850px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="border-r border-slate-200 text-[11px] uppercase tracking-wider">Requisition</TableHead>
                    <TableHead className="border-r border-slate-200 text-[11px] uppercase tracking-wider">Request</TableHead>
                    <TableHead className="border-r border-slate-200 text-[11px] uppercase tracking-wider">Requested by</TableHead>
                    <TableHead className="border-r border-slate-200 text-[11px] uppercase tracking-wider">Lines</TableHead>
                    <TableHead className="border-r border-slate-200 text-[11px] uppercase tracking-wider">Approved</TableHead>
                    <TableHead className="border-r border-slate-200 text-right text-[11px] uppercase tracking-wider">Estimated value</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {procurementQueue.map((item) => (
                    <TableRow key={item.number}>
                      <TableCell className="border-r border-slate-100 font-mono text-xs font-semibold">{item.number}</TableCell>
                      <TableCell className="border-r border-slate-100 font-medium">{item.title}</TableCell>
                      <TableCell className="border-r border-slate-100">{item.requestedBy}</TableCell>
                      <TableCell className="border-r border-slate-100 font-mono text-xs">{item.items}</TableCell>
                      <TableCell className="border-r border-slate-100">{item.approved}</TableCell>
                      <TableCell className="border-r border-slate-100 text-right font-mono text-xs font-semibold">{item.value}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Create RFQ</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
