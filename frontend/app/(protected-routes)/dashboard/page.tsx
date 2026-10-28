"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRightIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  Clock3Icon,
  FilePlus2Icon,
  FilterIcon,
  MoreHorizontalIcon,
  PackageCheckIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  WalletCardsIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  fetchDashboardData,
  type DashboardData,
  type DashboardTransaction,
} from "@/lib/dashboard-data";
import { formatCurrency } from "@/lib/currencies";
import { useAuthState } from "@/components/auth-state-provider";

const toneClasses: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200/50 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
  amber:
    "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  violet:
    "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200/50 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/20",
  green:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  slate:
    "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200/50 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20",
};

function formatAmount(transaction: DashboardTransaction): string {
  if (transaction.amount === null || !transaction.currency)
    return "Unavailable";

  return formatCurrency(transaction.amount, transaction.currency);
}

function formatDate(value: string | null): string {
  if (!value) return "Unavailable";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getTransactionTone(
  category: DashboardTransaction["category"],
): string {
  if (category === "Purchase order") return "green";
  if (category === "RFQ") return "violet";
  return "blue";
}

export default function Page() {
  const { transitionRevision } = useAuthState();
  const [filter, setFilter] = useState("All activity");
  const [search, setSearch] = useState("");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();
    setDashboard(null);
    setLoading(true);
    setRequestError(false);
    setCurrentDate(new Date());

    fetchDashboardData(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        if (result.authFailed) {
          window.location.assign("/login");
          return;
        }

        setDashboard(result);
        setRequestError(result.errors.length > 0);
      })
      .catch(() => setRequestError(true))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [transitionRevision]);

  const transactions = useMemo(
    () =>
      [
        ...(dashboard?.requisitions ?? []),
        ...(dashboard?.rfqs ?? []),
        ...(dashboard?.purchaseOrders ?? []),
      ]
        .sort((left, right) => {
          if (!left.updatedAt) return 1;
          if (!right.updatedAt) return -1;
          return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
        })
        .filter((transaction) => {
          const matchesFilter =
            filter === "All activity" ||
            transaction.status.toUpperCase() === filter.toUpperCase();

          const query = search.trim().toLowerCase();
          const matchesSearch =
            !query ||
            [
              transaction.id,
              transaction.title,
              transaction.requester,
              transaction.status,
            ]
              .join(" ")
              .toLowerCase()
              .includes(query);
          return matchesFilter && matchesSearch;
        }),
    [dashboard, filter, search],
  );

  const userName = [dashboard?.profile?.firstName, dashboard?.profile?.lastName]
    .filter(Boolean)
    .join(" ");

  const stats = [
    {
      label: "Purchase requisitions",
      value: dashboard?.requisitionTotal ?? dashboard?.requisitions.length ?? 0,
      change: "Live",
      note: "Authorized records",
      icon: FilePlus2Icon,
      tone: "blue",
    },
    {
      label: "Pending approvals",
      value: dashboard?.approvalTotal ?? dashboard?.approvals.length ?? 0,
      change: "Live",
      note: "Assigned to you",
      icon: Clock3Icon,
      tone: "amber",
    },
    {
      label: "Active RFQs",
      value: dashboard?.rfqTotal ?? dashboard?.rfqs.length ?? 0,
      change: "Live",
      note: "Published RFQs",
      icon: SendIcon,
      tone: "violet",
    },
    {
      label: "Open commitments",
      value: "Unavailable",
      change: "N/A",
      note: "Budget data unavailable",
      icon: WalletCardsIcon,
      tone: "green",
    },
  ];

  let greeting = "Welcome";
  if (currentDate) {
    const hour = currentDate.getHours();
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";
  }

  return (
    <main className="min-h-[calc(100svh-var(--header-height))] flex-1 bg-slate-50/30 dark:bg-inherit">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-7 px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        {requestError && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/10 dark:text-amber-200">
            Some dashboard sections could not be loaded. Displayed values may be
            partial.
          </div>
        )}

        <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {currentDate?.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              }) ?? ""}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              {greeting}
              {userName ? `, ${userName}` : ""}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Here&apos;s what&apos;s happening across{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {dashboard?.companyName ?? "your procurement workspace"}
              </span>
              .
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="shadow-sm"
              disabled
              title="Date-range filtering is not supported by the procurement APIs."
            >
              <CalendarDaysIcon className="mr-2 size-4" />
              This month
            </Button>
            <Button
              className="shadow-sm"
              onClick={() => window.location.assign("/purchase-requisitions")}
            >
              <PlusIcon className="mr-2 size-4" />
              New requisition
            </Button>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex size-9 items-center justify-center rounded-lg ${toneClasses[stat.tone]}`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${toneClasses["slate"]}`}
                  >
                    {stat.change}
                  </span>
                </div>
                <p className="mt-5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                  {stat.label}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {stat.note}
                </p>
              </div>
            );
          })}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 sm:px-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Procurement pipeline
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Track activity from request to purchase order.
              </p>
            </div>
            <Link
              href="/purchase-requisitions"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 sm:mt-0"
            >
              View all activity <ArrowUpRightIcon className="size-3.5" />
            </Link>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {[
              [
                "Requisitions",
                dashboard?.requisitionTotal ??
                  dashboard?.requisitions.length ??
                  0,
              ],
              [
                "Approvals",
                dashboard?.approvalTotal ?? dashboard?.approvals.length ?? 0,
              ],
              ["RFQs", dashboard?.rfqTotal ?? dashboard?.rfqs.length ?? 0],
              ["Quotations", dashboard?.quotationTotal ?? 0],
              [
                "Purchase orders",
                dashboard?.purchaseOrderTotal ??
                  dashboard?.purchaseOrders.length ??
                  0,
              ],
            ].map(([label, value], index) => {
              const isInteractive = label === "Quotations";
              return (
                <div
                  key={label}
                  className={`relative flex items-center gap-3 rounded-lg px-3 py-3 transition-colors md:block md:px-0 md:py-0 ${
                    isInteractive
                      ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 md:hover:bg-transparent"
                      : ""
                  }`}
                  onClick={
                    isInteractive
                      ? () => window.location.assign("/quotations")
                      : undefined
                  }
                  onKeyDown={
                    isInteractive
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ")
                            window.location.assign("/quotations");
                        }
                      : undefined
                  }
                  role={isInteractive ? "link" : undefined}
                  tabIndex={isInteractive ? 0 : undefined}
                >
                  <div className="flex items-center gap-2 md:mb-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {label}
                    </span>
                  </div>
                  <p className="text-xl font-semibold text-slate-900 dark:text-slate-100 md:pl-2">
                    {value}
                  </p>
                  {index < 4 && (
                    <ChevronRightIcon className="absolute right-2 top-1/2 hidden size-4 -translate-y-1/2 text-slate-300 dark:text-slate-600 md:block" />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.45fr_0.8fr]">
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 dark:border-slate-800/60 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Recent transactions
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  The latest changes across your workspace.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative hidden sm:block">
                  <SearchIcon className="absolute left-2.5 top-2 size-3.5 text-slate-400" />
                  <input
                    aria-label="Search transactions"
                    placeholder="Search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-8 w-40 rounded-md border border-slate-200 bg-transparent pl-8 pr-3 text-xs outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700"
                  />
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <FilterIcon className="mr-2 size-3.5" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto border-b border-slate-100 px-5 pt-3 dark:border-slate-800/60 sm:px-6">
              {["All activity", "Pending", "Published", "Ordered"].map(
                (item) => {
                  const isActive = filter === item;
                  return (
                    <button
                      key={item}
                      onClick={() => setFilter(item)}
                      className={`whitespace-nowrap border-b-2 px-1 pb-3 text-xs font-medium transition-colors ${
                        isActive
                          ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                          : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                    >
                      {item}
                    </button>
                  );
                },
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-2xl text-left text-sm">
                <thead className="bg-slate-50/50 text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:bg-slate-800/20 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3 sm:px-6">Reference</th>
                    <th className="px-3 py-3">Requester</th>
                    <th className="px-3 py-3">Amount</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Updated</th>
                    <th className="px-5 py-3 sm:px-6" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-sm text-slate-500"
                      >
                        Loading transactions...
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        onClick={() =>
                          setSelectedTransaction(
                            selectedTransaction === transaction.id
                              ? null
                              : transaction.id,
                          )
                        }
                        className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-5 py-4 sm:px-6">
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {transaction.id}
                          </div>
                          <div className="mt-1 max-w-[12rem] truncate text-xs text-slate-500">
                            {transaction.title}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-xs text-slate-600 dark:text-slate-300">
                          {transaction.requester}
                        </td>
                        <td className="px-3 py-4 text-xs font-medium text-slate-900 dark:text-slate-100">
                          {formatAmount(transaction)}
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${toneClasses[getTransactionTone(transaction.category)]}`}
                          >
                            {transaction.status.toLowerCase()}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-xs text-slate-500">
                          {formatDate(transaction.updatedAt)}
                        </td>
                        <td className="px-5 py-4 text-right sm:px-6">
                          <MoreHorizontalIcon className="ml-auto size-4 text-slate-400" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {!loading && transactions.length === 0 && (
                <div className="px-6 py-12 text-center text-sm text-slate-500">
                  No transactions match this filter.
                </div>
              )}
            </div>

            {selectedTransaction && (
              <div className="flex items-center justify-between border-t border-blue-100 bg-blue-50/50 px-5 py-3 text-xs dark:border-blue-900/30 dark:bg-blue-900/10 sm:px-6">
                <span className="text-slate-600 dark:text-slate-300">
                  Selected{" "}
                  <strong className="text-slate-900 dark:text-slate-100">
                    {selectedTransaction}
                  </strong>
                  . Open the module for full details.
                </span>
                <Link
                  href={
                    transactions.find((item) => item.id === selectedTransaction)
                      ?.href ?? "/purchase-requisitions"
                  }
                  className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  View record{" "}
                  <ArrowUpRightIcon className="ml-1 inline size-3" />
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-800/60 sm:px-6">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Needs your review
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Approvals waiting in your queue.
                </p>
              </div>
              <span
                className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${toneClasses["amber"]}`}
              >
                {dashboard?.approvals.length ?? 0}
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <div className="px-5 py-10 text-center text-sm text-slate-500">
                  Loading approvals...
                </div>
              ) : (
                dashboard?.approvals.map((approval) => (
                  <div
                    key={approval.id}
                    className="px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 sm:px-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                          {approval.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {approval.reference} · {approval.requester}
                        </p>
                      </div>
                      <button aria-label={`More actions for ${approval.id}`}>
                        <MoreHorizontalIcon className="size-4 text-slate-400 hover:text-slate-600" />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {approval.amount === null
                          ? "Unavailable"
                          : `${approval.amount} ${approval.currency ?? ""}`}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {formatDate(approval.updatedAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
              {!loading && dashboard?.approvals.length === 0 && (
                <div className="px-5 py-12 text-center text-sm text-slate-500">
                  No approvals require your action.
                </div>
              )}
            </div>
            <Link
              href="/approval-workflows"
              className="flex items-center justify-center gap-1 border-t border-slate-100 px-5 py-4 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200"
            >
              Review all approvals <ChevronRightIcon className="size-3.5" />
            </Link>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Spend overview
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Budget and commitment data visualization.
                </p>
              </div>
              <div
                className={`flex size-8 items-center justify-center rounded-lg ${toneClasses["slate"]}`}
              >
                <WalletCardsIcon className="size-4" />
              </div>
            </div>
            <div className="mt-7 flex items-end gap-3">
              <span className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Unavailable
              </span>
              <span
                className={`mb-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${toneClasses["slate"]}`}
              >
                N/A
              </span>
            </div>
            <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">
              Financial reporting is not currently enabled for this workspace.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Quick actions
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Start the next step in your workflow.
                </p>
              </div>
              <div
                className={`flex size-8 items-center justify-center rounded-lg ${toneClasses["blue"]}`}
              >
                <CheckCircle2Icon className="size-4" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                href="/purchase-requisitions"
                className="group flex flex-col items-start rounded-lg border border-slate-200 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-700 dark:hover:border-blue-900/50 dark:hover:bg-blue-900/10"
              >
                <FilePlus2Icon className="size-5 text-blue-600 dark:text-blue-400" />
                <p className="mt-4 text-xs font-semibold text-slate-900 group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-400">
                  New requisition
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Request goods or services
                </p>
              </Link>
              <Link
                href="/approval-workflows"
                className="group flex flex-col items-start rounded-lg border border-slate-200 p-4 transition-all hover:border-amber-200 hover:bg-amber-50/50 dark:border-slate-700 dark:hover:border-amber-900/50 dark:hover:bg-amber-900/10"
              >
                <PackageCheckIcon className="size-5 text-amber-600 dark:text-amber-400" />
                <p className="mt-4 text-xs font-semibold text-slate-900 group-hover:text-amber-700 dark:text-slate-100 dark:group-hover:text-amber-400">
                  Review approvals
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {dashboard?.approvals.length ?? 0} items need review
                </p>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
