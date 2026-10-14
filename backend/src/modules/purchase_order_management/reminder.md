# LINAW POM Implementation Reminder

> **Shared handoff for the developer and ChatGPT.** Treat the decisions below as settled unless the developer explicitly changes them. Do not reopen settled design questions during implementation.

## Scope and working rules

- Continue within LINAW's existing feature-based modular monolith.
- Inspect the actual Prisma schema and code before proposing or making changes.
- Do not redesign the architecture or invent fields, methods, or conventions.
- Keep guidance practical and concise. Preserve this reminder's decisions across handoffs.

## 1. Pending Purchase Requisitions: GET endpoint

- Add a GET endpoint that returns purchase requisitions approved and eligible for procurement.
- The frontend fetches the list when the page opens and when the Procurement Officer clicks **Refresh**.
- **Do not implement polling, SSE, or WebSockets for now.**
- Approval Workflow already publishes `approvalWorkflow.approved`.
- Inspect the existing EventBus registration and event-handler code before deciding how the event participates in this flow.
- Prefer querying existing PR and approval records if they already provide the required information. Do not duplicate PR data or add a read model without a demonstrated need.
- Scope results to the current tenant and purchasing company. Exclude PRs that are no longer eligible for procurement according to the real schema and workflow rules.
- Candidate naming discussed: `GET /api/pom/pending-prs`, service method `getPendingPurchaseRequisitions()`, repository method `findPendingPurchaseRequisitions()`. Verify existing route conventions before implementing.

## 2. Supplier selection also creates the draft PO

The selected supplier quotation is the source of the Purchase Order. The frontend should make **one request** for the complete operation.

- Keep the supplier-selection endpoint as the entry point, following existing route conventions. The route discussed was:
  `POST /api/pom/rfqs/:rfqId/quotations/:quotationId/select`
- The operation must:
  1. Validate the RFQ and quotation using persisted data and the correct tenant/company context.
  2. Confirm the quotation is eligible for selection and the workflow permits the selection.
  3. Record the selection.
  4. Create the PO as `DRAFT` using trusted database data from the selected quotation and related RFQ records.
  5. Create the PO items.
  6. Return the created PO.
- Remove the standalone `POST /purchase-orders` endpoint if it has no other required use. Its PO-creation responsibility moves into the supplier-selection operation.
- Do not trust frontend-submitted supplier IDs, prices, totals, currency, or PO item details when these should come from persisted quotation/RFQ records.
- Keep service/repository responsibilities clean. A service orchestration method can coordinate selection and PO creation; repository methods do not need to become one giant method.

## 3. Transaction and concurrency requirements

Selection and PO creation must be one atomic database operation.

- Use one Prisma transaction for all related database writes.
- Every participating repository operation must use the same transaction client (`tx`). A method using the global Prisma client is outside that transaction.
- If selection, PO creation, or PO-item creation fails, all participating writes should roll back.
- A transaction alone does not prevent every concurrency conflict or duplicate request.
- Inspect the actual schema and existing constraints before choosing the concurrency strategy.
- Use appropriate database constraints and conditional writes/locking/isolation where justified by the actual schema and business rules.
- Ensure simultaneous requests cannot produce conflicting winning selections or duplicate POs.
- Consider retry/network-failure behavior so a repeated request does not accidentally create another PO.
- Do not invent a unique constraint or idempotency field before checking the schema and deciding which business rule it should enforce.

## 4. Agreed PO lifecycle

The intended lifecycle is:

`DRAFT → ISSUED → ORDERED`

Treat this lifecycle as the agreed direction. Do not reopen the decision unless the developer explicitly asks.

- The supplier-selection operation creates the PO as `DRAFT`.
- `ISSUED` and `ORDERED` are later lifecycle states and must follow the project's agreed business meanings and transitions.
- Update the Prisma enum and all affected validation, service, and frontend handling consistently when implementing the lifecycle.
- Inspect existing status definitions and code before making changes; do not assume meanings beyond the agreed workflow.

## 5. Implementation handoff: inspect before editing

When implementation resumes, inspect or request the actual code. At minimum, review:

1. Prisma models/enums for `PurchaseOrder`, PO items, `RFQSupplierAssignment`, and relevant `SupplierQuotation`, quotation-item, and RFQ relations.
2. Current repository implementations of `selectSupplier()` and `createPurchaseOrder()`.
3. Relevant POM service/controller/router code and route conventions.
4. Prisma client/transaction setup and repository patterns.
5. The `approvalWorkflow.approved` event type, publish call, EventBus registration, and existing POM event handlers.
6. Current PR/approval schema and statuses used to determine procurement eligibility.

Then make a cohesive, code-grounded change. Run relevant typecheck/lint checks after the implementation pass and report unrelated pre-existing failures separately.

## Working rules for ChatGPT

- Preserve the decisions in this document; do not repeatedly ask the developer to decide settled questions.
- Do not drift back to recommending a separate PO-creation endpoint for this workflow.
- Do not implement polling/SSE now.
- Do not redesign the modular monolith or add duplicate PR storage without evidence it is needed.
- Do not invent schema fields or repository methods; inspect the real code first.
- If a genuine unresolved detail blocks implementation, explain that specific dependency and ask only for the missing information.

## Agreed summary

1. A GET endpoint retrieves approved PRs eligible for procurement; the frontend refreshes manually.
2. Selecting a supplier quotation also records the selection and creates the draft PO in one POST operation.
3. The standalone PO-creation endpoint is removed for this workflow.
4. Selection and PO creation run atomically in one Prisma transaction, with separate concurrency protection as required.
5. The agreed PO lifecycle is `DRAFT → ISSUED → ORDERED`.
6. Inspect actual code and schema before implementation; preserve context and do not reopen settled decisions.
