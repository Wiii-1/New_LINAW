"use client";

import { useMemo, useState } from "react";
import {
  CalendarDaysIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  PaperclipIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type RequisitionItem = {
  id: number;
  item_type: string;
  description: string;
  specification: string;
  quantity: string;
  unit_of_measure: string;
  estimated_unit_cost: string;
  category_id: string;
  needed_by_date: string;
};

function createItem(id: number): RequisitionItem {
  return {
    id,
    item_type: "Goods",
    description: "",
    specification: "",
    quantity: "1",
    unit_of_measure: "Each",
    estimated_unit_cost: "",
    category_id: "",
    needed_by_date: "",
  };
}

const initialItems: RequisitionItem[] = [createItem(1)];

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function FormField({
  label,
  children,
  required = false,
}: Readonly<{
  label: string;
  children: React.ReactNode;
  required?: boolean;
}>) {
  return (
    <Field>
      <FieldLabel>
        {label}
        {required && <span className="text-blue-500">*</span>}
      </FieldLabel>
      <FieldContent>{children}</FieldContent>
    </Field>
  );
}

export default function PurchaseRequisitionsPage() {
  const [items, setItems] = useState(initialItems);
  const [saved, setSaved] = useState(false);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          (Number.parseFloat(item.quantity) || 0) *
            (Number.parseFloat(item.estimated_unit_cost) || 0),
        0,
      ),
    [items],
  );

  function updateItem(
    id: number,
    field: keyof RequisitionItem,
    value: string,
  ) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
    setSaved(false);
  }

  function addItem() {
    setItems((currentItems) => [
      ...currentItems,
      createItem(Math.max(...currentItems.map((item) => item.id), 0) + 1),
    ]);
  }

  function removeItem(id: number) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }

  return (
    <main className="min-h-[calc(100svh-var(--header-height))] bg-slate-50/70 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <span className="size-2 rounded-sm bg-blue-500" />
              <span>Requisitions</span>
              <span aria-hidden="true">/</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                Create
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              New purchase requisition
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Capture the request details and items needed for approval.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setSaved(false)}>
              Cancel
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="More actions"
                  />
                }
              >
                <MoreHorizontalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Save as template</DropdownMenuItem>
                <DropdownMenuItem>Discard draft</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setSaved(true)}>
              <FileTextIcon />
              {saved ? "Saved" : "Save draft"}
            </Button>
          </div>
        </header>

        <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200/80 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
                <FileTextIcon className="size-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Requisition header
                </h2>
                <p className="text-xs text-slate-500">
                  General information for this purchase request.
                </p>
              </div>
            </div>
          </div>

          <FieldSet className="gap-6 p-5 sm:p-6">
            <FieldGroup className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <FormField label="Purpose" required>
                <Input placeholder="What is this purchase for?" />
              </FormField>
              <FormField label="Request type">
                <select
                  className={selectClassName}
                  defaultValue="Other"
                  aria-label="Request type"
                >
                  <option>Other</option>
                  <option>Goods</option>
                  <option>Services</option>
                  <option>Software</option>
                </select>
              </FormField>
              <FormField label="Priority">
                <select
                  className={selectClassName}
                  defaultValue="NORMAL"
                  aria-label="Priority"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </FormField>
              <FormField label="Currency">
                <select
                  className={selectClassName}
                  defaultValue="USD"
                  aria-label="Currency"
                >
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>NGN</option>
                </select>
              </FormField>
            </FieldGroup>

            <FieldGroup className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <FormField label="Needed by">
                <div className="relative">
                  <Input type="date" className="pr-10" />
                  <CalendarDaysIcon className="pointer-events-none absolute right-3 top-2.5 size-4 text-slate-400" />
                </div>
              </FormField>
              <FormField label="Department">
                <select
                  className={selectClassName}
                  defaultValue="Purchase"
                  aria-label="Department"
                >
                  <option>Purchase</option>
                  <option>Finance</option>
                  <option>Operations</option>
                  <option>Information technology</option>
                </select>
              </FormField>
              <FormField label="Branch">
                <select
                  className={selectClassName}
                  defaultValue="Main branch"
                  aria-label="Branch"
                >
                  <option>Main branch</option>
                  <option>North campus</option>
                  <option>South campus</option>
                </select>
              </FormField>
              <FormField label="Attachments">
                <Button
                  variant="outline"
                  className="w-full justify-start text-slate-500"
                >
                  <PaperclipIcon />
                  Add files
                </Button>
              </FormField>
            </FieldGroup>

            <FormField label="Justification">
              <textarea
                className="min-h-24 w-full resize-y rounded-md border border-input bg-background px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="Explain the business need for this requisition"
              />
            </FormField>
          </FieldSet>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200/80 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/70 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Requisition items
              </h2>
              <p className="text-xs text-slate-500">
                Add the goods or services needed for this request.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={addItem}>
              <PlusIcon />
              Add line
            </Button>
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-260 text-left text-sm">
              <thead className="border-b border-slate-200/80 bg-slate-50/50 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Item details</th>
                  <th className="w-28 px-3 py-3 font-medium">Qty</th>
                  <th className="w-32 px-3 py-3 font-medium">Unit</th>
                  <th className="w-40 px-3 py-3 font-medium">Unit cost</th>
                  <th className="w-40 px-3 py-3 font-medium">Needed by</th>
                  <th className="w-28 px-3 py-3 text-right font-medium">Total</th>
                  <th className="w-12 px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="min-w-80 px-5 py-4">
                      <div className="grid gap-2">
                        <Input
                          value={item.description}
                          onChange={(event) =>
                            updateItem(
                              item.id,
                              "description",
                              event.target.value,
                            )
                          }
                          placeholder="Item or service description"
                          aria-label="Item description"
                        />
                        <Input
                          value={item.specification}
                          onChange={(event) =>
                            updateItem(
                              item.id,
                              "specification",
                              event.target.value,
                            )
                          }
                          placeholder="Specification or scope (optional)"
                          aria-label="Item specification"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <Input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(item.id, "quantity", event.target.value)
                        }
                        aria-label="Quantity"
                      />
                    </td>
                    <td className="px-3 py-4">
                      <select
                        className={selectClassName}
                        value={item.unit_of_measure}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            "unit_of_measure",
                            event.target.value,
                          )
                        }
                        aria-label="Unit of measure"
                      >
                        <option>Each</option>
                        <option>Hour</option>
                        <option>Pack</option>
                        <option>Month</option>
                      </select>
                    </td>
                    <td className="px-3 py-4">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.estimated_unit_cost}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            "estimated_unit_cost",
                            event.target.value,
                          )
                        }
                        placeholder="0.00"
                        aria-label="Estimated unit cost"
                      />
                    </td>
                    <td className="px-3 py-4">
                      <Input
                        type="date"
                        value={item.needed_by_date}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            "needed_by_date",
                            event.target.value,
                          )
                        }
                        aria-label="Item needed by date"
                      />
                    </td>
                    <td className="px-3 py-6 text-right font-medium text-slate-700 dark:text-slate-200">
                      ${((Number.parseFloat(item.quantity) || 0) * (Number.parseFloat(item.estimated_unit_cost) || 0)).toFixed(2)}
                    </td>
                    <td className="px-3 py-5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove line item"
                      >
                        <Trash2Icon className="text-slate-400" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 p-4 lg:hidden">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Line {index + 1}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove line item"
                  >
                    <Trash2Icon className="text-slate-400" />
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <FormField label="Description" required>
                      <Input
                        value={item.description}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            "description",
                            event.target.value,
                          )
                        }
                        placeholder="Item or service description"
                      />
                    </FormField>
                  </div>
                  <FormField label="Specification">
                    <Input
                      value={item.specification}
                      onChange={(event) =>
                        updateItem(
                          item.id,
                          "specification",
                          event.target.value,
                        )
                      }
                      placeholder="Optional"
                    />
                  </FormField>
                  <FormField label="Unit">
                    <select
                      className={selectClassName}
                      value={item.unit_of_measure}
                      onChange={(event) =>
                        updateItem(
                          item.id,
                          "unit_of_measure",
                          event.target.value,
                        )
                      }
                    >
                      <option>Each</option>
                      <option>Hour</option>
                      <option>Pack</option>
                      <option>Month</option>
                    </select>
                  </FormField>
                  <FormField label="Quantity">
                    <Input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(item.id, "quantity", event.target.value)
                      }
                    />
                  </FormField>
                  <FormField label="Estimated unit cost">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.estimated_unit_cost}
                      onChange={(event) =>
                        updateItem(
                          item.id,
                          "estimated_unit_cost",
                          event.target.value,
                        )
                      }
                      placeholder="0.00"
                    />
                  </FormField>
                  <FormField label="Needed by">
                    <Input
                      type="date"
                      value={item.needed_by_date}
                      onChange={(event) =>
                        updateItem(
                          item.id,
                          "needed_by_date",
                          event.target.value,
                        )
                      }
                    />
                  </FormField>
                </div>
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              No line items yet. Add a line to start building the requisition.
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-slate-200/80 bg-slate-50/50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" size="sm" onClick={addItem}>
              <PlusIcon />
              Add another line
            </Button>
            <div className="flex items-center justify-between gap-8 sm:justify-end">
              <span className="text-sm text-slate-500">Estimated total</span>
              <span className="text-xl font-semibold text-slate-900 dark:text-white">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between gap-4 pb-2 text-xs text-slate-500">
          <p>Drafts are kept locally in this page for preview purposes.</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setItems(initialItems)}
          >
            <XIcon />
            Reset form
          </Button>
        </div>
      </div>
    </main>
  );
}
