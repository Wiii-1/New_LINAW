"use client";

import { useMemo, useState } from "react";
import {
  CheckIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  Clock3Icon,
  FileCheck2Icon,
  FilterIcon,
  SearchIcon,
  XCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

type ApprovalRequest = {
  id: string;
  entity_id: string;
  requester: string;
  entity_type: string;
  amount: number;
  current_level: number;
  status: ApprovalStatus;
  submitted_at: string;
  approver_role: string;
  actions: { action: string; actor: string; date: string; remarks?: string }[];
};

const initialRequests: ApprovalRequest[] = [
  {
    id: "APR-2026-0142",
    entity_id: "PR-2026-0048",
    requester: "Maya Santos",
    entity_type: "Purchase requisition",
    amount: 184500,
    current_level: 1,
    status: "PENDING",
    submitted_at: "17 Oct 2026, 09:42",
    approver_role: "Department Manager",
    actions: [
      {
        action: "SUBMITTED",
        actor: "Maya Santos",
        date: "17 Oct 2026, 09:42",
      },
    ],
  },
  {
    id: "APR-2026-0139",
    entity_id: "PR-2026-0044",
    requester: "Jon Bell",
    entity_type: "Purchase requisition",
    amount: 68400,
    current_level: 1,
    status: "PENDING",
    submitted_at: "16 Oct 2026, 15:18",
    approver_role: "Department Manager",
    actions: [
      {
        action: "SUBMITTED",
        actor: "Jon Bell",
        date: "16 Oct 2026, 15:18",
      },
    ],
  },
  {
    id: "APR-2026-0131",
    entity_id: "PR-2026-0036",
    requester: "Arielle Cruz",
    entity_type: "Purchase requisition",
    amount: 412000,
    current_level: 2,
    status: "APPROVED",
    submitted_at: "14 Oct 2026, 10:05",
    approver_role: "CPO / Business Owner",
    actions: [
      {
        action: "APPROVED",
        actor: "Daniel Reyes",
        date: "15 Oct 2026, 11:24",
        remarks: "Approved for supplier sourcing.",
      },
    ],
  },
  {
    id: "APR-2026-0126",
    entity_id: "PR-2026-0031",
    requester: "Maya Santos",
    entity_type: "Purchase requisition",
    amount: 27600,
    current_level: 1,
    status: "REJECTED",
    submitted_at: "12 Oct 2026, 08:36",
    approver_role: "Department Manager",
    actions: [
      {
        action: "REJECTED",
        actor: "Daniel Reyes",
        date: "12 Oct 2026, 13:40",
        remarks: "Please attach the supplier quotations.",
      },
    ],
  },
];

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

const statusLabels: Record<ApprovalStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

function StatusPill({ status }: Readonly<{ status: ApprovalStatus }>) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
      {status === "PENDING" && <Clock3Icon className="size-3.5" />}
      {status === "APPROVED" && <CheckIcon className="size-3.5" />}
      {status === "REJECTED" && <XCircleIcon className="size-3.5" />}
      {status === "CANCELLED" && <CircleAlertIcon className="size-3.5" />}
      {statusLabels[status]}
    </span>
  );
}

function Stat({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border p-4">
      <span className="text-xs uppercase tracking-wider">{label}</span>
      <span className="text-2xl font-semibold tracking-tight">{value}</span>
    </div>
  );
}

export default function ApprovalWorkflowsPage() {
  const [requests, setRequests] = useState(initialRequests);
  const [activeFilter, setActiveFilter] = useState<"ALL" | ApprovalStatus>(
    "ALL",
  );
  const [search, setSearch] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [remarks, setRemarks] = useState("");

  const selectedRequest = requests.find(
    (request) => request.id === selectedRequestId,
  );

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesFilter =
        activeFilter === "ALL" || request.status === activeFilter;
      const matchesSearch =
        !query ||
        [request.id, request.entity_id, request.requester, request.approver_role]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, requests, search]);

  const counts = useMemo(
    () => ({
      pending: requests.filter((request) => request.status === "PENDING")
        .length,
      approved: requests.filter((request) => request.status === "APPROVED")
        .length,
      resolved: requests.filter((request) =>
        ["REJECTED", "CANCELLED"].includes(request.status),
      ).length,
    }),
    [requests],
  );

  function updateRequest(status: ApprovalStatus, action: string) {
    if (!selectedRequest) return;

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === selectedRequest.id
          ? {
              ...request,
              status,
              actions: [
                ...request.actions,
                {
                  action,
                  actor: "You",
                  date: "17 Oct 2026, now",
                  ...(remarks.trim() ? { remarks: remarks.trim() } : {}),
                },
              ],
            }
          : request,
      ),
    );
    setRemarks("");
  }

  return (
    <main className="min-h-[calc(100svh-var(--header-height))]">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span>Procurement</span>
              <ChevronRightIcon className="size-4" />
              <span>Approval workflows</span>
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Approval workflows
              </h1>
              <p className="mt-1 max-w-2xl text-sm">
                Review purchase requisitions routed to your approval level.
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setActiveFilter("PENDING")}>
            <FileCheck2Icon />
            View pending requests
          </Button>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <Stat label="Pending review" value={counts.pending} />
          <Stat label="Approved" value={counts.approved} />
          <Stat label="Resolved" value={counts.resolved} />
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {(["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"] as const).map(
                (filter) => (
                  <Button
                    key={filter}
                    variant={activeFilter === filter ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter === "ALL" ? "All requests" : statusLabels[filter]}
                  </Button>
                ),
              )}
            </div>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1 sm:w-72">
                <SearchIcon className="pointer-events-none absolute top-2.5 left-3 size-4" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search requests"
                  className="pl-9"
                  aria-label="Search approval requests"
                />
              </div>
              <Button variant="outline" size="icon" aria-label="Filter requests">
                <FilterIcon />
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <div className="hidden grid-cols-[1.15fr_1fr_0.8fr_0.8fr_0.7fr_auto] gap-4 border-b px-5 py-3 text-xs font-medium uppercase tracking-wider md:grid">
              <span>Request</span>
              <span>Requester</span>
              <span>Amount</span>
              <span>Approval level</span>
              <span>Status</span>
              <span />
            </div>
            {filteredRequests.length ? (
              filteredRequests.map((request) => (
                <button
                  key={request.id}
                  type="button"
                  className="grid w-full gap-3 border-b p-4 text-left transition-colors last:border-b-0 md:grid-cols-[1.15fr_1fr_0.8fr_0.8fr_0.7fr_auto] md:items-center md:gap-4 md:px-5"
                  onClick={() => setSelectedRequestId(request.id)}
                >
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="truncate font-medium">{request.id}</span>
                    <span className="text-xs">{request.entity_id}</span>
                  </span>
                  <span className="flex flex-col gap-1">
                    <span>{request.requester}</span>
                    <span className="text-xs">{request.submitted_at}</span>
                  </span>
                  <span className="font-medium">{currency.format(request.amount)}</span>
                  <span className="flex flex-col gap-1">
                    <span>Level {request.current_level}</span>
                    <span className="text-xs">{request.approver_role}</span>
                  </span>
                  <span>
                    <StatusPill status={request.status} />
                  </span>
                  <ChevronRightIcon className="hidden size-4 md:block" />
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                <FileCheck2Icon className="size-8" />
                <h2 className="font-medium">No approval requests found</h2>
                <p className="text-sm">Try another status or search term.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <Sheet
        open={Boolean(selectedRequest)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequestId(null);
            setRemarks("");
          }
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selectedRequest && (
            <>
              <SheetHeader className="border-b pb-5">
                <div className="flex items-start justify-between gap-4 pr-8">
                  <div className="space-y-1">
                    <SheetTitle>{selectedRequest.id}</SheetTitle>
                    <SheetDescription>
                      {selectedRequest.entity_type} {selectedRequest.entity_id}
                    </SheetDescription>
                  </div>
                  <StatusPill status={selectedRequest.status} />
                </div>
              </SheetHeader>

              <div className="flex flex-col gap-6 px-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider">Requester</span>
                    <p className="font-medium">{selectedRequest.requester}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider">Amount</span>
                    <p className="font-medium">{currency.format(selectedRequest.amount)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider">Current level</span>
                    <p className="font-medium">
                      Level {selectedRequest.current_level} · {selectedRequest.approver_role}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider">Submitted</span>
                    <p className="font-medium">{selectedRequest.submitted_at}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-medium">Approval history</h2>
                    <span className="text-xs">{selectedRequest.actions.length} action(s)</span>
                  </div>
                  <div className="flex flex-col gap-4 border-l pl-4">
                    {selectedRequest.actions.map((action, index) => (
                      <div key={`${action.action}-${index}`} className="relative space-y-1">
                        <span className="absolute left-[-1.35rem] top-1 size-2 rounded-full border-2" />
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{action.action}</span>
                          <span className="text-xs">{action.date}</span>
                        </div>
                        <p className="text-sm">by {action.actor}</p>
                        {action.remarks && <p className="text-sm">{action.remarks}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedRequest.status === "PENDING" && (
                  <div className="space-y-3 border-t pt-5">
                    <label htmlFor="remarks" className="text-sm font-medium">
                      Remarks
                    </label>
                    <Input
                      id="remarks"
                      value={remarks}
                      onChange={(event) => setRemarks(event.target.value)}
                      placeholder="Add a note for this decision"
                    />
                  </div>
                )}
              </div>

              <SheetFooter className="border-t">
                {selectedRequest.status === "PENDING" ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                      variant="destructive"
                      onClick={() => updateRequest("REJECTED", "REJECTED")}
                    >
                      <XCircleIcon />
                      Reject
                    </Button>
                    <Button variant="outline" onClick={() => updateRequest("CANCELLED", "CANCELLED")}>
                      Cancel request
                    </Button>
                    <Button onClick={() => updateRequest("APPROVED", "APPROVED")}>
                      <CheckIcon />
                      Approve
                    </Button>
                  </div>
                ) : (
                  <SheetClose render={<Button variant="outline" />}>Close</SheetClose>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
}
