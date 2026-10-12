"use client";

import { useState } from "react";
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

const stats = [
  {
    label: "Purchase requisitions",
    value: "128",
    change: "+12.5%",
    note: "vs. last month",
    icon: FilePlus2Icon,
    tone: "blue",
  },
  {
    label: "Pending approvals",
    value: "24",
    change: "8 urgent",
    note: "need your attention",
    icon: Clock3Icon,
    tone: "amber",
  },
  {
    label: "Active RFQs",
    value: "18",
    change: "+4",
    note: "since last week",
    icon: SendIcon,
    tone: "violet",
  },
  {
    label: "Open commitments",
    value: "$486.2k",
    change: "82%",
    note: "of quarterly budget",
    icon: WalletCardsIcon,
    tone: "green",
  },
];

const transactions = [
  {
    id: "PR-2024-0086",
    title: "Research laboratory equipment",
    requester: "Dr. Maya Singh",
    amount: "$42,850.00",
    status: "In approval",
    date: "Today, 09:42",
    tone: "amber",
  },
  {
    id: "PO-2024-0041",
    title: "Campus network renewal",
    requester: "IT Operations",
    amount: "$18,600.00",
    status: "Ordered",
    date: "Yesterday",
    tone: "green",
  },
  {
    id: "RFQ-2024-0032",
    title: "Student accommodation supplies",
    requester: "Estates & Facilities",
    amount: "$9,240.00",
    status: "Quotations open",
    date: "14 Oct 2024",
    tone: "blue",
  },
  {
    id: "PR-2024-0082",
    title: "Library archival materials",
    requester: "Library Services",
    amount: "$6,975.00",
    status: "Draft",
    date: "13 Oct 2024",
    tone: "slate",
  },
];

const approvals = [
  {
    id: "PR-2024-0086",
    title: "Research laboratory equipment",
    owner: "Dr. Maya Singh",
    amount: "$42,850",
    age: "2h ago",
  },
  {
    id: "PR-2024-0081",
    title: "Teaching studio upgrades",
    owner: "Academic Affairs",
    amount: "$12,400",
    age: "5h ago",
  },
  {
    id: "PR-2024-0079",
    title: "Annual software licenses",
    owner: "Digital Services",
    amount: "$8,960",
    age: "Yesterday",
  },
];

const toneClasses: Record<string, string> = {
  blue: 
  "bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-900/50 dark:text-blue-300 dark:ring-blue-700/50",
  amber:
    "bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-900/50 dark:text-amber-300 dark:ring-amber-700/50",
  violet:
    "bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-900/50 dark:text-violet-300 dark:ring-violet-700/50",
  green:
    "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300 dark:ring-emerald-700/50",
  slate:
    "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700/50",
};

export default function Page() {
  const [filter, setFilter] = useState("All activity");
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null,
  );
  const visibleTransactions =
    filter === "All activity"
      ? transactions
      : transactions.filter((transaction) => transaction.status === filter);

  return (
    <main className="min-h-[calc(100svh-var(--header-height))] flex-1 bg-white dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-7 px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">
              Monday, 21 October 2024
            </p>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-800 dark:text-slate-200 sm:text-4xl">
              Good morning, Amina
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Here&apos;s what&apos;s happening across Northstar
              University&apos;s procurement workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <CalendarDaysIcon className="size-4" />
              This month
            </Button>
            <Button className="bg-blue-500 text-white shadow-[0_6px_16px_rgba(28,99,242,0.2)] hover:bg-blue-600">
              <PlusIcon className="size-4" />
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
                className="rounded-xl border border-slate-200/80 bg-white dark:bg-slate-800 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex size-9 items-center justify-center rounded-lg ring-1 ${toneClasses[stat.tone]}`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold ${stat.tone === "amber"}`}
                  >
                    {stat.change}
                  </span>
                </div>
                <p className="mt-5 text-2xl font-semibold tracking-tight text-slate-800 dark:text-slate-200">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-3 text-[11px] text-slate-400">{stat.note}</p>
              </div>
            );
          })}
        </section>

        <section className="rounded-xl border border-slate-200/80 bg-white dark:bg-slate-800 px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Procurement pipeline
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Track activity from request to purchase order.
              </p>
            </div>
            <Link
              href="/purchase-requisitions"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-600 sm:mt-0"
            >
              View all activity <ArrowUpRightIcon className="size-3.5" />
            </Link>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {[
              ["Requisitions", "128", "bg-blue-500"],
              ["Approvals", "24", "bg-indigo-500"],
              ["RFQs", "18", "bg-violet-500"],
              ["Quotations", "31", "bg-fuchsia-500"],
              ["Purchase orders", "46", "bg-emerald-500"],
            ].map(([label, value, color], index) => (
              <div
                key={label}
                className="relative flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-3 md:block md:bg-transparent md:px-0 md:py-0"
              >
                <div className="flex items-center gap-2 md:mb-3">
                  <span className={`size-2 rounded-full ${color}`} />
                  <span className="text-xs font-medium text-slate-600">
                    {label}
                  </span>
                </div>
                <p className="text-xl font-semibold text-[#132238] md:pl-4">
                  {value}
                </p>
                {index < 4 && (
                  <ChevronRightIcon className="absolute right-2 top-1/2 hidden size-4 -translate-y-1/2 text-slate-300 md:block" />
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.45fr_0.8fr]">
          <div className="min-w-0 rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="text-sm font-semibold text-[#132238]">
                  Recent transactions
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  The latest changes across your workspace.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative hidden sm:block">
                  <SearchIcon className="absolute left-2.5 top-2 size-3.5 text-slate-400" />
                  <input
                    aria-label="Search transactions"
                    placeholder="Search"
                    className="h-8 w-32 rounded-md border border-slate-200 bg-slate-50 pl-8 pr-2 text-xs outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-slate-200 text-xs text-slate-600"
                >
                  <FilterIcon className="size-3.5" />
                  Filter
                </Button>
              </div>
            </div>
            <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-5 pt-3 sm:px-6">
              {[
                "All activity",
                "In approval",
                "Quotations open",
                "Ordered",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`whitespace-nowrap border-b-2 px-1 pb-3 text-xs font-medium transition-colors ${filter === item ? "border-[#1c63f2] text-[#1c63f2]" : "border-transparent text-slate-400 hover:text-slate-700"}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-170 text-left text-sm">
                <thead className="bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-3 font-semibold sm:px-6">
                      Reference
                    </th>
                    <th className="px-3 py-3 font-semibold">Requester</th>
                    <th className="px-3 py-3 font-semibold">Amount</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 font-semibold">Updated</th>
                    <th className="px-5 py-3 sm:px-6" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      onClick={() =>
                        setSelectedTransaction(
                          selectedTransaction === transaction.id
                            ? null
                            : transaction.id,
                        )
                      }
                      className="cursor-pointer transition-colors hover:bg-blue-50/40"
                    >
                      <td className="px-5 py-4 sm:px-6">
                        <div className="font-semibold text-[#132238]">
                          {transaction.id}
                        </div>
                        <div className="mt-1 max-w-47.5 truncate text-xs text-slate-500">
                          {transaction.title}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-xs text-slate-600">
                        {transaction.requester}
                      </td>
                      <td className="px-3 py-4 text-xs font-semibold text-slate-700">
                        {transaction.amount}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${toneClasses[transaction.tone]}`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-xs text-slate-400">
                        {transaction.date}
                      </td>
                      <td className="px-5 py-4 text-right sm:px-6">
                        <MoreHorizontalIcon className="ml-auto size-4 text-slate-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visibleTransactions.length === 0 && (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  No transactions match this filter.
                </div>
              )}
            </div>
            {selectedTransaction && (
              <div className="flex items-center justify-between border-t border-blue-100 bg-blue-50/50 px-5 py-3 text-xs sm:px-6">
                <span className="text-blue-800">
                  Selected <strong>{selectedTransaction}</strong>. Open the
                  module for full details.
                </span>
                <Link
                  href="/purchase-requisitions"
                  className="font-semibold text-blue-700"
                >
                  View record{" "}
                  <ArrowUpRightIcon className="ml-1 inline size-3" />
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <p className="text-sm font-semibold text-[#132238]">
                  Needs your review
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Approvals waiting in your queue.
                </p>
              </div>
              <span className="flex size-7 items-center justify-center rounded-full bg-amber-50 text-xs font-semibold text-amber-700">
                3
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {approvals.map((approval) => (
                <div key={approval.id} className="px-5 py-4 sm:px-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#132238]">
                        {approval.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {approval.id} · {approval.owner}
                      </p>
                    </div>
                    <button
                      aria-label={`More actions for ${approval.id}`}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <MoreHorizontalIcon className="size-4" />
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
                      {approval.amount}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {approval.age}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/approval-workflows"
              className="flex items-center justify-center gap-1 border-t border-slate-100 px-5 py-4 text-xs font-semibold text-[#1c63f2] hover:bg-slate-50"
            >
              Review all approvals <ChevronRightIcon className="size-3.5" />
            </Link>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-xl border border-slate-200/80 bg-white dark:bg-slate-800 p-6 text-white shadow-[0_10px_28px_rgba(19,34,56,0.12)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">Monthly spend overview</p>
                <p className="mt-1 text-xs text-slate-300">
                  Committed spend against your quarterly budget.
                </p>
              </div>
              <WalletCardsIcon className="size-5 text-blue-300" />
            </div>
            <div className="mt-7 flex items-end gap-3">
              <span className="text-3xl font-semibold tracking-tight">
                $486,240
              </span>
              <span className="mb-1 rounded-full bg-emerald-400/15 px-2 py-1 text-[11px] font-semibold text-emerald-300">
                +8.2%
              </span>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[68%] rounded-full bg-[#5e9bff]" />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-slate-400">
              <span>$486k committed</span>
              <span>$710k quarterly budget</span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-[#132238]">
                  Quick actions
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Start the next step in your workflow.
                </p>
              </div>
              <CheckCircle2Icon className="size-5 text-emerald-500" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <Link
                href="/purchase-requisitions"
                className="group rounded-lg border border-slate-200 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50"
              >
                <FilePlus2Icon className="size-4 text-[#1c63f2]" />
                <p className="mt-3 text-xs font-semibold text-slate-700 group-hover:text-blue-700">
                  New requisition
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Request goods or services
                </p>
              </Link>
              <Link
                href="/approval-workflows"
                className="group rounded-lg border border-slate-200 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50"
              >
                <PackageCheckIcon className="size-4 text-[#1c63f2]" />
                <p className="mt-3 text-xs font-semibold text-slate-700 group-hover:text-blue-700">
                  Review approvals
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  3 items need review
                </p>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
