---
applyTo: "backend/src/modules/purchase_order_management/**,frontend/app/(protected-routes)/purchase-orders/**,frontend/app/api/purchase-orders/**,backend/src/test/unit_testing/purchase_order_management/**"
---

# Purchase Order Management

- POM is an established business module with live router, controller, service, repository, Prisma, frontend integration, and API contracts.
- Do not modify POM files for unrelated tasks merely to make another module work. If an unrelated task suggests a POM defect, investigate and report the evidence first.
- POM changes are appropriate when the user explicitly requests POM work, explicitly requests a cross-module change, or a demonstrated dependency makes the change essential.
- Before changing POM behavior, inspect `backend/src/modules/purchase_order_management/api_contract.md`, the relevant Prisma relations, and focused POM tests.
- Preserve tenant/company authorization, quotation/RFQ/PO state rules, transaction boundaries, and existing dedicated frontend API integrations.
- Preserve unrelated working-tree changes. Keep edits minimal and avoid redesigning the POM workflow.
- Add or update focused regression tests for affected selection, PO detail, and lifecycle behavior, then run the relevant checks inside `nix develop`.
