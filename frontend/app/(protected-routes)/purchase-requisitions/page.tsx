"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
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
import {
  ApprovalWorkflowApiError,
  getWorkflowDefinitions,
  type WorkflowDefinition,
} from "@/app/api/approval-workflow/client";
import {
  formatCurrency,
  getCurrency,
  supportedCurrencies,
} from "@/lib/currencies";

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
    item_type: "GOODS",
    description: "",
    specification: "",
    quantity: "1",
    unit_of_measure: "Each",
    estimated_unit_cost: "",
    category_id: "",
    needed_by_date: "",
  };
}

const initialHeader = {
  workflow_code: "",
  purpose: "",
  priority: "NORMAL" as const,
  currency_code: "PHP",
  needed_by_date: "",
  justification: "",
};

const numericInput = (message: string, positive = false) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine((value) => Number.isFinite(Number(value)), message)
    .transform(Number)
    .refine(
      (value) => (positive ? value > 0 : value >= 0),
      positive ? "Quantity must be greater than zero." : "Value cannot be negative.",
    );

const requisitionFormSchema = z.object({
  workflow_code: z.string().trim().min(1, "Approval workflow is required."),
  purpose: z.string().trim().max(500, "Purpose cannot exceed 500 characters."),
  justification: z
    .string()
    .trim()
    .min(10, "Justification must be at least 10 characters.")
    .max(500, "Justification cannot exceed 500 characters."),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
  currency_code: z
    .string()
    .trim()
    .length(3)
    .toUpperCase()
    .refine((value) => getCurrency(value) !== undefined, "Unsupported currency code."),
  needed_by_date: z.string().date("Invalid needed-by date format.").optional(),
  items: z
    .array(
      z.object({
        item_type: z.enum(["GOODS", "SERVICE", "ASSET"]),
        description: z.string().trim().min(1, "Item description is required.").max(255),
        specification: z.string().trim().max(1000),
        quantity: numericInput("Quantity is required.", true).refine(
          (value) => Number.isInteger(value * 10_000),
          "Quantity cannot have more than 4 decimal places.",
        ),
        unit_of_measure: z.string().trim().min(1, "Unit of measure is required.").max(50),
        estimated_unit_cost: numericInput("Estimated unit cost is required.").refine(
          (value) => Number.isInteger(value * 10_000),
          "Estimated unit cost cannot have more than 4 decimal places.",
        ),
        category_id: z.string().uuid("Invalid category ID format.").optional(),
        needed_by_date: z.string().date("Invalid needed-by date format.").optional(),
      }),
    )
    .min(1, "At least one line item is required."),
}).superRefine((value, context) => {
  const currency = getCurrency(value.currency_code);
  if (!currency) return;

  value.items.forEach((item, index) => {
    const scale = 10 ** currency.digits;
    if (!Number.isInteger(item.estimated_unit_cost * scale)) {
      context.addIssue({
        code: "custom",
        path: ["items", index, "estimated_unit_cost"],
        message: `Unit cost supports ${currency.digits} decimal places for ${currency.code}.`,
      });
    }
  });
});

type RequisitionForm = z.input<typeof requisitionFormSchema>;
type RequisitionHeader = Omit<RequisitionForm, "items">;

function createInitialItems() {
  return [createItem(1)];
}

const selectClassName =
  "h-9 w-full rounded-md border border-input px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

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
        {required && <span>*</span>}
        {required && <span>*</span>}
      </FieldLabel>
      <FieldContent>{children}</FieldContent>
    </Field>
  );
}

export default function PurchaseRequisitionsPage() {
  const router = useRouter();
  const [items, setItems] = useState(createInitialItems);
  const [header, setHeader] = useState<RequisitionHeader>(initialHeader);
  const [isSaving, setIsSaving] = useState(false);
  const [savedNumber, setSavedNumber] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [workflowDefinitions, setWorkflowDefinitions] = useState<WorkflowDefinition[]>([]);
  const [workflowLoading, setWorkflowLoading] = useState(true);
  const [workflowError, setWorkflowError] = useState<string | null>(null);

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

  useEffect(() => {
    let isCurrent = true;

    getWorkflowDefinitions()
      .then((definitions) => {
        if (!isCurrent) return;
        setWorkflowDefinitions(definitions.filter((definition) => definition.is_active && definition.workflow_code));
      })
      .catch((requestError: unknown) => {
        if (!isCurrent) return;
        setWorkflowError(
          requestError instanceof ApprovalWorkflowApiError && requestError.status === 401
            ? "Your session has expired. Please sign in again."
            : "Unable to load approval workflows. Please try again.",
        );
      })
      .finally(() => {
        if (isCurrent) setWorkflowLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

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
    setSavedNumber(null);
  }

  function addItem() {
    setItems((currentItems) => [
      ...currentItems,
      createItem(Math.max(...currentItems.map((item) => item.id), 0) + 1),
    ]);
  }

  function removeItem(id: number) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    setSavedNumber(null);
  }

  function updateHeader(field: keyof RequisitionHeader, value: string) {
    setHeader((currentHeader) => ({ ...currentHeader, [field]: value }));
    setSavedNumber(null);
  }

  function resetForm() {
    setHeader(initialHeader);
    setItems(createInitialItems());
    setSavedNumber(null);
    setFormError(null);
  }

  async function saveDraft() {
    setFormError(null);

    const selectedWorkflow = workflowDefinitions.find(
      (definition) => definition.workflow_code === header.workflow_code,
    );

    if (workflowLoading || workflowError || !selectedWorkflow) {
      setFormError(
        workflowLoading
          ? "Approval workflows are still loading."
          : workflowError ?? "Select an available approval workflow before saving.",
      );
      return;
    }

    const parsed = requisitionFormSchema.safeParse({
      ...header,
      needed_by_date: header.needed_by_date || undefined,
      items: items.map(({ id: _id, ...item }) => ({
        ...item,
        category_id: item.category_id || undefined,
        needed_by_date: item.needed_by_date || undefined,
      })),
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Please review the form.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/purchase-requisition/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
        data?: { requisition_number?: string };
      } | null;

      if (!response.ok || data?.success !== true) {
        setFormError(data?.message ?? "Unable to save the requisition.");
        return;
      }

      setSavedNumber(data.data?.requisition_number ?? "saved");
    } catch {
      setFormError("Unable to reach the requisition service. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-[calc(100svh-var(--header-height))]">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm">
              <span>Requisitions</span>
              <span aria-hidden="true">/</span>
              <span className="font-medium">
                Create
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              New purchase requisition
            </h1>
            <p className="mt-1 text-sm">
              Capture the request details and items needed for approval.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>
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
                <DropdownMenuItem disabled>Save as template</DropdownMenuItem>
                <DropdownMenuItem disabled>Discard draft</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={saveDraft} disabled={isSaving}>
              <FileTextIcon />
              {isSaving ? "Saving..." : savedNumber ? `Saved ${savedNumber}` : "Save draft"}
            </Button>
          </div>
        </header>

        {formError && (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:border-slate-800">
          <div className="border-b border-slate-200/80 px-5 py-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg">
                <FileTextIcon className="size-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">
                  Requisition header
                </h2>
                <p className="text-xs">
                  General information for this purchase request.
                </p>
              </div>
            </div>
          </div>

          <FieldSet className="gap-6 p-5 sm:p-6">
            <FieldGroup className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <FormField label="Purpose" required>
                <Input
                  value={header.purpose}
                  onChange={(event) => updateHeader("purpose", event.target.value)}
                  placeholder="What is this purchase for?"
                />
              </FormField>
              <FormField label="Request type">
                <select
                  className={selectClassName}
                  value={header.workflow_code}
                  disabled={workflowLoading || Boolean(workflowError) || workflowDefinitions.length === 0}
                  onChange={(event) => updateHeader("workflow_code", event.target.value)}
                  aria-label="Request type"
                >
                  <option value="">
                    {workflowLoading ? "Loading workflows..." : "Select a workflow"}
                  </option>
                  {workflowDefinitions.map((definition) => (
                    <option key={definition.workflow_code} value={definition.workflow_code}>
                      {definition.name}
                    </option>
                  ))}
                </select>
                {workflowError ? (
                  <p className="mt-1 text-xs text-destructive" role="alert">{workflowError}</p>
                ) : !workflowLoading && workflowDefinitions.length === 0 ? (
                  <p className="mt-1 text-xs">No approval workflows available. Create an approval workflow first.</p>
                ) : null}
              </FormField>
              <FormField label="Priority">
                <select
                  className={selectClassName}
                  value={header.priority}
                  onChange={(event) => updateHeader("priority", event.target.value)}
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
                  value={header.currency_code}
                  onChange={(event) => updateHeader("currency_code", event.target.value)}
                  aria-label="Currency"
                >
                  {supportedCurrencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.currency}
                    </option>
                  ))}
                </select>
              </FormField>
            </FieldGroup>

            <FieldGroup className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <FormField label="Needed by">
                <div className="relative">
                  <Input
                    type="date"
                    className="pr-10"
                    value={header.needed_by_date}
                    onChange={(event) => updateHeader("needed_by_date", event.target.value)}
                  />
                  <CalendarDaysIcon className="pointer-events-none absolute right-3 top-2.5 size-4" />
                </div>
              </FormField>
              <FormField label="Department">
                <select
                  className={selectClassName}
                  value="Not supported"
                  disabled
                  aria-label="Department"
                >
                  <option>Not supported by backend</option>
                </select>
              </FormField>
              <FormField label="Branch">
                <select
                  className={selectClassName}
                  value="Not supported"
                  disabled
                  aria-label="Branch"
                >
                  <option>Not supported by backend</option>
                </select>
              </FormField>
              <FormField label="Attachments">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <PaperclipIcon />
                  Add files
                </Button>
              </FormField>
            </FieldGroup>

            <FormField label="Justification">
              <textarea
                className="min-h-24 w-full resize-y rounded-md border border-input px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={header.justification}
                onChange={(event) => updateHeader("justification", event.target.value)}
                placeholder="Explain the business need for this requisition"
              />
            </FormField>
          </FieldSet>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:border-slate-800">
          <div className="flex flex-col gap-3 border-b border-slate-200/80 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold">
                Requisition items
              </h2>
              <p className="text-xs">
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
              <thead className="border-b border-slate-200/80 text-xs dark:border-slate-800">
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
                        <select
                          className={selectClassName}
                          value={item.item_type}
                          onChange={(event) =>
                            updateItem(item.id, "item_type", event.target.value)
                          }
                          aria-label="Item type"
                        >
                          <option value="GOODS">Goods</option>
                          <option value="SERVICE">Service</option>
                          <option value="ASSET">Asset</option>
                        </select>
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
                        <select
                          className={selectClassName}
                          value={item.item_type}
                          onChange={(event) =>
                            updateItem(item.id, "item_type", event.target.value)
                          }
                          aria-label="Item type"
                        >
                          <option value="GOODS">Goods</option>
                          <option value="SERVICE">Service</option>
                          <option value="ASSET">Asset</option>
                        </select>
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
                    <td className="px-3 py-6 text-right font-medium">
                      {formatCurrency(
                        (Number.parseFloat(item.quantity) || 0) *
                          (Number.parseFloat(item.estimated_unit_cost) || 0),
                        header.currency_code,
                      )}
                    </td>
                    <td className="px-3 py-5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove line item"
                      >
                        <Trash2Icon />
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
                  <p className="text-sm font-semibold">
                    Line {index + 1}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove line item"
                  >
                    <Trash2Icon />
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
            <div className="px-5 py-10 text-center text-sm">
              No line items yet. Add a line to start building the requisition.
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-slate-200/80 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" size="sm" onClick={addItem}>
              <PlusIcon />
              Add another line
            </Button>
            <div className="flex items-center justify-between gap-8 sm:justify-end">
              <span className="text-sm">Estimated total</span>
              <span className="text-xl font-semibold">
                {formatCurrency(total, header.currency_code)}
              </span>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between gap-4 pb-2 text-xs">
            <p>Drafts are saved to the LINAW backend after validation.</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetForm}
          >
            <XIcon />
            Reset form
          </Button>
        </div>
      </div>
    </main>
  );
}
