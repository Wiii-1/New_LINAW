# LINAW API Discovery and Security Coverage Audit, Phase 2

Date: 2026-10-27  
Branch expected by task: `dev/wii/backup`

## 1. Executive Summary

This is a read-only source audit. The application is a Hono worker with a global `/api` base path, one explicit health route, and eight dynamically constructed module routers. The effective inventory below contains 80 registered method/path combinations in those routers, plus `/api/health` and the catch-all delegation behavior in `app.ts`.

The strongest verified controls are bearer-token verification against persisted session state, tenant consistency checks in authentication, router-level authentication on most business modules, permission checks through `Authorize`, rate limiting on critical routers, scoped Prisma queries in many repositories, security headers, CORS allow-listing, and transaction use in selected workflow transitions.

The main security coverage gaps are runtime authorization and object-isolation tests, complete proof that every repository mutation is scoped by both tenant and company, authenticated testing for all permission-bearing routes, and verification of external integrations and deployment configuration. No vulnerability is declared solely from missing evidence.

The `ORGANIZATION_ADMIN` bypass is intentional in code: it makes the role pass any permission check for the tenant role selected by `getUserRole`; it does not bypass the authentication middleware or rewrite tenant/company context. Its resource impact still requires controlled tests.

The running Worker's database identity remains **UNVERIFIED**. This audit did not connect to a database or inspect runtime bindings.

## 2. Repository State, Methodology, and Limitations

- The requested destination did not exist when checked and was created as the only new report.
- Existing security artifacts, including `artifacts/security/zap-baseline.html` and `artifacts/security/zap-investigation.md`, were treated as pre-existing and were not overwritten.
- The expected branch is `dev/wii/backup`. Git status was not independently re-run in this phase because the task prohibited terminal commands; prior workspace context showed an untracked `artifacts/` directory. No reset, clean, stash, checkout, or destructive operation was used.
- Inspection was source-only. No HTTP request, backend startup, ZAP launch, scan, test execution, database connection, migration, seed, or dependency installation was performed.
- Comments and API contracts were compared with route code but were not treated as proof.
- Confidence labels: `VERIFIED` means directly supported by route and nearby implementation; `PARTIALLY VERIFIED` means the control is visible but the complete downstream path or all queries were not exhaustively proved; `UNKNOWN` means runtime or unresolved implementation evidence is required.

## 3. Application Boundary and Effective Mounts

Evidence: [backend/src/app.ts](../..//backend/src/app.ts), especially the Hono base path, middleware, health route, catch-all, and `router.route` mounts.

- Global base path: `/api`.
- Public health route: `GET /api/health`.
- Global middleware order: CORS, secure headers, logger, error handler, then the explicit health route and catch-all router delegation.
- Catch-all: `app.all("*")` initializes Prisma, constructs module services/routers, strips `/api` from the forwarded URL, and dispatches to the nested router. It is delegation, not a wildcard endpoint to add to an API specification.
- Effective module prefixes:
  - `/api/auth`
  - `/api/auditTrail`
  - `/api/approval-workflows`
  - `/api/PurchaseRequisition`
  - `/api/organizationManagement`
  - `/api/purchase-orders`
  - `/api/suppliers`
  - `/api/userManagementRouter`
- No separate `backend/src/index.ts` route registration was identified in the inspected source surface.

## 4. Complete Effective API Inventory

The inventory is grouped by router. Handler names are the registered controller or handler symbol. `RO` means the handler is source-reviewed as retrieval/listing and has no visible write or external side effect in the inspected controller/service path; it does not prove authorization correctness. `AR` means authenticated read. `MS` means mutation or stateful operation. `U` means behavior needs controlled verification.

### Authentication

Source: `backend/src/modules/authentication/authRouter.ts`; controller: `authController.ts`.

| Method | Effective path | Handler | Auth / authorization | Validation, scope, side effect | Class | Confidence |
|---|---|---|---|---|---|---|
| POST | `/api/auth/signup` | `createUser` | Public; critical rate limit | Body schema; creates user/credential/session-related state | MS | VERIFIED |
| POST | `/api/auth/login` | `loginUser` | Public; critical rate limit | Credential body; creates session/token state | MS | VERIFIED |
| POST | `/api/auth/forgot-password` | `forgotPassword` | Public; critical rate limit | Password-reset flow; may send external email | MS | PARTIALLY VERIFIED |
| POST | `/api/auth/reset-password` | `resetPassword` | Public; critical rate limit | Token/password body; changes credential state | MS | VERIFIED |
| GET | `/api/auth/:id` | `getUserById` | Bearer `authenticate`; no route permission | Path `id`; user lookup, sensitive identity data possible | AR | PARTIALLY VERIFIED |
| POST | `/api/auth/logout` | `logoutUser` | No `authenticate` middleware; refresh/session cookie/controller handling | Revokes or changes session state | MS | PARTIALLY VERIFIED |
| POST | `/api/auth/refresh` | `refreshToken` | Refresh-cookie/controller handling | Refreshes token/session state | MS | VERIFIED |
| POST | `/api/auth/validate_token` | `validate_token` | Bearer `authenticate`; no route permission | Token/session validation; authentication-state operation | MS | VERIFIED |

### Organization Administration

Source: `organizationAdministrationRouter.ts`; controller: `organizationAdministratorController.ts`; service/repository in the same module. Public invitation validation precedes `router.use(authenticate)`.

| Method | Effective path | Handler | Auth / authorization | Validation, scope, side effect | Class | Confidence |
|---|---|---|---|---|---|---|
| GET | `/api/organizationManagement/members/validate/:token` | `validateInvitation` | Public | Token path; invitation validation/possible consumption not proven | U | UNKNOWN |
| POST | `/api/organizationManagement/members` | `addMember` | Bearer; `organizationManagement.inviteMember` | Body validation; company/tenant member creation and invitation side effect | MS | VERIFIED |
| POST | `/api/organizationManagement/members/accept` | `acceptInvitation` | Bearer; `organizationManagement.readMember` | Invitation acceptance changes membership state | MS | VERIFIED |
| GET | `/api/organizationManagement/members` | `getMember` | Bearer; `organizationManagement.readMember` | Company context required in controller; list/read | AR | PARTIALLY VERIFIED |
| GET | `/api/organizationManagement/members/:userId` | `getUser` | Bearer; `organizationManagement.readMember` | Path `userId`; tenant/company scope visible in controller/service | AR | PARTIALLY VERIFIED |
| PATCH | `/api/organizationManagement/members/:userId` | `updateMember` | Bearer; `organizationManagement.updateMember` | Path/body; membership/role changes | MS | VERIFIED |
| DELETE | `/api/organizationManagement/members/:userId` | `removeMember` | Bearer; `organizationManagement.removeMember` | Path; membership deletion | MS | VERIFIED |
| POST | `/api/organizationManagement/roles` | `role` | Bearer; `organizationManagement.createRole` | Body schema; role creation | MS | VERIFIED |
| POST | `/api/organizationManagement/members/:userId/roles` | `assignRoleToMember` | Bearer; `organizationManagement.updateMember` | Path/body; role assignment | MS | VERIFIED |
| POST | `/api/organizationManagement/roles/:roleId/permissions` | `assignPermissionsToRole` | Bearer; `organizationManagement.addRolePermission` | Path/body; permission assignment | MS | VERIFIED |
| GET | `/api/organizationManagement/roles` | `getRoles` | Bearer; `organizationManagement.readRole` | Company/tenant role listing | AR | PARTIALLY VERIFIED |
| GET | `/api/organizationManagement/roles/:roleId` | `getRole` | Bearer; `organizationManagement.readRole` | Path `roleId`; role read | AR | PARTIALLY VERIFIED |
| GET | `/api/organizationManagement/roles/:roleId/permissions` | `getRolePermissions` | Bearer; `organizationManagement.readRole` | Path `roleId`; permission read | AR | PARTIALLY VERIFIED |
| GET | `/api/organizationManagement/permissions` | `getPermissions` | Bearer; `organizationManagement.readRole` | Permission catalog read | AR | PARTIALLY VERIFIED |
| PATCH | `/api/organizationManagement/roles/:roleId` | `updateRole` | Bearer; `organizationManagement.updateRole` | Path/body; role update | MS | VERIFIED |
| DELETE | `/api/organizationManagement/roles/:roleId` | `deleteRole` | Bearer; `organizationManagement.deleteRole` | Path; role deletion | MS | VERIFIED |
| DELETE | `/api/organizationManagement/roles/:roleId/permissions/:permissionId` | `deletePermissionsFromRole` | Bearer; `organizationManagement.removeRolePermission` | Path identifiers; permission removal | MS | VERIFIED |
| DELETE | `/api/organizationManagement/members/:userId/roles/:roleId` | `removeRoleFromMember` | Bearer; `organizationManagement.updateMember` | Path identifiers; role removal | MS | VERIFIED |
| GET | `/api/organizationManagement/settings` | `settings` | Bearer; `organizationManagement.read` | Company context; settings read | AR | PARTIALLY VERIFIED |
| PATCH | `/api/organizationManagement/settings` | `updateSettings` | Bearer; `organizationManagement.update` | Body schema; settings mutation | MS | VERIFIED |

### Audit Trail

Source: `auditTrailRouter.ts`, `auditTrailController.ts`, `auditTrailService.ts`, `auditTrailRepository.ts`.

| Method | Effective path | Handler | Auth / authorization | Validation, scope, side effect | Class | Confidence |
|---|---|---|---|---|---|---|
| GET | `/api/auditTrail/` | `listAuditRecords` | Critical rate limit; bearer; `auditTrail.search` | Query schema; tenant/company filters passed to repository; sensitive audit data | AR | PARTIALLY VERIFIED |
| GET | `/api/auditTrail/search` | `searchAuditRecord` | Critical rate limit; bearer; `auditTrail.search` | Query schema; audit search; sensitive data | AR | PARTIALLY VERIFIED |
| GET | `/api/auditTrail/:auditId/verify` | `verifyAuditIntegrity` | Critical rate limit; bearer; `auditTrail.verify` | Path/query validation; integrity verification and blockchain adapter path require side-effect review | U | UNKNOWN |

### Supplier Management

Sources: `supplierManagementRouter.ts` and submodule controllers/services/repositories under `SupplierManagementGovernance`, `SupplierManagementInvitation`, and `supplierManagementPortal`.

| Method | Effective path | Handler | Auth / authorization | Validation, scope, side effect | Class | Confidence |
|---|---|---|---|---|---|---|
| GET | `/api/suppliers/supplier-invitations/validate/:token` | `validateInvitation` | Public | Token path; token consumption behavior unknown | U | UNKNOWN |
| GET | `/api/suppliers/suppliers-governance` | governance `getSuppliers` | Bearer; `supplierManagement.read` | Requires company context; tenant/company repository filters | AR | PARTIALLY VERIFIED |
| GET | `/api/suppliers/suppliers-governce/:supplierId` | governance `getSupplier` | Bearer; `supplierManagement.readSupplier` | Path `supplierId`; tenant/company relationship scope | AR | PARTIALLY VERIFIED |
| DELETE | `/api/suppliers/suppliers-governance/:supplierId/relationship` | governance remove relationship | Bearer; `supplierManagement.removeSupplier` | Path; relationship deletion | MS | VERIFIED |
| POST | `/api/suppliers/supplier-invitations` | invitation create | Bearer; `supplierManagement.inviteSupplier` | Body schema; creates invitation and email/external side effect | MS | VERIFIED |
| POST | `/api/suppliers/supplier-invitations/:invitationId/resend` | invitation `MailgunInvitation` | Bearer; `supplierManagement.inviteSupplier` | Path; sends email | MS | VERIFIED |
| POST | `/api/suppliers/supplier-invitations/:invitationId/accept` | invitation accept | Bearer; `supplierManagement.read` | Path/body; accepts invitation and changes relationships | MS | VERIFIED |
| GET | `/api/suppliers/supplier-invitations` | invitation list | Bearer; `supplierManagement.read` | Company/tenant scope; sensitive invitation data | AR | PARTIALLY VERIFIED |
| GET | `/api/suppliers/supplier-invitations/:invitationId` | invitation detail | Bearer; `supplierManagement.read` | Path; company/tenant scope | AR | PARTIALLY VERIFIED |
| GET | `/api/suppliers/supplier-portal/rfqs` | portal RFQ list | Bearer; `supplier.readRFQ` | Supplier/company relationship scope; procurement data | AR | PARTIALLY VERIFIED |
| GET | `/api/suppliers/supplier-portal/rfqs/:rfqId` | portal RFQ detail | Bearer; `supplier.readRFQ` | Path; supplier relationship and tenant/company scope | AR | PARTIALLY VERIFIED |
| GET | `/api/suppliers/supplier-portal/quotations` | portal quotation list | Bearer; `supplier.read` | Supplier/company scope; sensitive quotation data | AR | PARTIALLY VERIFIED |
| GET | `/api/suppliers/supplier-portal/quotations/:quotationId` | portal quotation detail | Bearer; `supplier.read` | Path; supplier relationship scope | AR | PARTIALLY VERIFIED |
| POST | `/api/suppliers/supplier-portal/rfqs/:rfqId/quotations` | portal quotation submit | Bearer; `supplier.submitQuotation` | Path/body; creates quotation and publishes internal event | MS | VERIFIED |

### User Management

Source: `userManagementRouter.ts`, `userManagementController.ts`, `userManagementService.ts`, `userManagementRepository.ts`.

| Method | Effective path | Handler | Auth / authorization | Validation, scope, side effect | Class | Confidence |
|---|---|---|---|---|---|---|
| GET | `/api/userManagementRouter/profile` | `profile` | Bearer; authenticated identity | Reads current user profile by user/tenant | AR | VERIFIED |
| PATCH | `/api/userManagementRouter/profile` | `updateProfile` | Bearer; authenticated identity | Zod body schema; updates profile | MS | VERIFIED |
| POST | `/api/userManagementRouter/companies/register` | `companyRegistration` | Bearer; onboarding/no existing membership constraint | Body schema; creates company/membership/roles and event | MS | VERIFIED |

### Purchase Order Management

Source: `purchaseOrderManagementRouter.ts`, `purchaseOrderManagementController.ts`, validators, service, repository, and event handler.

| Method | Effective path | Handler | Auth / authorization | Validation, scope, side effect | Class | Confidence |
|---|---|---|---|---|---|---|
| POST | `/api/purchase-orders/rfqs` | `createRFQS` | Bearer; `purchase_order:create_rfq` | RFQ/item schema; creates RFQ | MS | VERIFIED |
| POST | `/api/purchase-orders/:poId` | `orderPurchaseOrder` | Bearer; `purchase_order:read` | Path `poId`; creates/order transition; unusual root POST | MS | VERIFIED |
| POST | `/api/purchase-orders/:poId/complete` | `completePurchaseOrder` | Bearer; `purchase_order:read` | Path; completion transition | MS | VERIFIED |
| POST | `/api/purchase-orders/rfqs/:rfqId/publish` | `publishRfqs` | Bearer; `purchase_order:update_rfq` | Path/body; publishes RFQ and emits event | MS | VERIFIED |
| POST | `/api/purchase-orders/rfqs/:rfqId/quotations/:quotationId/select` | quotation selection | Bearer; `purchase_order:accept_quotation` | Path; selects quotation and creates PO transactionally | MS | VERIFIED |
| GET | `/api/purchase-orders/procurement-queue` | queue handler | Bearer; `purchase_order:read` | Company/tenant queue read | AR | PARTIALLY VERIFIED |
| GET | `/api/purchase-orders/` | list purchase orders | Bearer; `purchase_order:read` | Company/tenant list read | AR | PARTIALLY VERIFIED |
| GET | `/api/purchase-orders/rfqs` | list RFQs | Bearer; `purchase_order:read` | Company/tenant list read | AR | PARTIALLY VERIFIED |
| GET | `/api/purchase-orders/quotations` | list quotations | Bearer; `purchase_order:read` | Company/tenant list read | AR | PARTIALLY VERIFIED |
| GET | `/api/purchase-orders/rfqs/:rfqId/quotations` | list RFQ quotations | Bearer; `purchase_order:read` | Path; RFQ/company/tenant scope | AR | PARTIALLY VERIFIED |
| GET | `/api/purchase-orders/rfqs/:rfqId/quotations/:quotationId` | quotation detail | Bearer; `purchase_order:read` | Path identifiers; relationship scope | AR | PARTIALLY VERIFIED |
| GET | `/api/purchase-orders/:poId` | PO detail | Bearer; `purchase_order:read` | Path `poId`; company/tenant scope | AR | PARTIALLY VERIFIED |
| PATCH | `/api/purchase-orders/rfqs/:rfqId` | `updateRfq` | Bearer; `purchase_order:update_rfq` | Path/body schema; RFQ mutation | MS | VERIFIED |
| PATCH | `/api/purchase-orders/:poId` | `updatePo` | Bearer; `purchase_order:read` | Path/body schema; PO mutation; permission mismatch is implementation evidence | MS | VERIFIED |
| DELETE | `/api/purchase-orders/rfqs/:rfqId` | `deleteRfq` | Bearer; `purchase_order:delete_rfq` | Path; deletes/cancels RFQ | MS | VERIFIED |
| DELETE | `/api/purchase-orders/:poId` | `deletePurchaseOrder` | Bearer; `purchase_order:read` | Path; deletes/cancels PO; permission mismatch is implementation evidence | MS | VERIFIED |

### Purchase Requisition

Source: `purchaseRequisitionRouter.ts`, controller, service, repository, and validation.

| Method | Effective path | Handler | Auth / authorization | Validation, scope, side effect | Class | Confidence |
|---|---|---|---|---|---|---|
| POST | `/api/PurchaseRequisition/create` | `createRequisition` | Bearer; `pr:create` | Zod body/items; creates draft | MS | VERIFIED |
| POST | `/api/PurchaseRequisition/:requisitionId/submit` | `submit` | Bearer; `pr:submit`; authorship | Path/body; state transition and approval event | MS | VERIFIED |
| POST | `/api/PurchaseRequisition/:requisitionId/cancel` | `cancel` | Bearer; `pr:cancel`; authorship | Path; state transition/event | MS | VERIFIED |
| POST | `/api/PurchaseRequisition/:requisitionId/resubmit` | `resubmit` | Bearer; `pr:submit`; authorship | Path/body; creates new draft revision | MS | VERIFIED |
| GET | `/api/PurchaseRequisition/` | list requisitions | Bearer; `purchaseRequisition.read` | Critical rate limit; company/tenant list | AR | PARTIALLY VERIFIED |
| GET | `/api/PurchaseRequisition/:requisitionId` | detail requisition | Bearer; `purchaseRequisition.read` | Critical rate limit; path; company/tenant/ownership review needed | AR | PARTIALLY VERIFIED |
| PATCH | `/api/PurchaseRequisition/:requisitionId` | `update` | Bearer; `purchaseRequisition.update` | Path/body Zod schema; draft mutation | MS | VERIFIED |

### Approval Workflow

Source: `approvalWorkflowRouter.ts`, controller, service, repository, and validator.

| Method | Effective path | Handler | Auth / authorization | Validation, scope, side effect | Class | Confidence |
|---|---|---|---|---|---|---|
| POST | `/api/approval-workflows/create-levels` | `createLevels` | Bearer; critical rate limit; workflow permission | Amount/role validation; creates levels | MS | VERIFIED |
| POST | `/api/approval-workflows/workflows` | `createWorkflowDefinition` | Bearer; critical rate limit; workflow permission | Workflow validation; creates definition | MS | VERIFIED |
| POST | `/api/approval-workflows/:approval-workflow-id/approve` | `approve` | Bearer; critical rate limit; approval authority | Path; approval state/event | MS | VERIFIED |
| POST | `/api/approval-workflows/:approval-workflow-id/reject` | `reject` | Bearer; critical rate limit; rejection authority | Path/body; rejection state/event | MS | VERIFIED |
| POST | `/api/approval-workflows/:approval-workflow-id/cancel` | `cancel` | Bearer; critical rate limit; workflow authority | Path; cancellation state/event | MS | VERIFIED |
| GET | `/api/approval-workflows/` | list approval requests | Bearer; `approval_workflow:read` | Company/tenant read | AR | PARTIALLY VERIFIED |
| GET | `/api/approval-workflows/workflows` | list workflow definitions | Bearer; `approval_workflow:read` | Company/tenant read | AR | PARTIALLY VERIFIED |
| GET | `/api/approval-workflows/:approval-workflow-id` | workflow detail | Bearer; `approval_workflow:read` | Path; company/tenant read | AR | PARTIALLY VERIFIED |

### Other route behavior

- `OPTIONS` behavior may be supplied by Hono/CORS and is not explicitly registered in the inspected application source.
- No explicit `HEAD` or `PUT` route registration was identified.
- `app.all("*")` is framework catch-all delegation, not an additional business endpoint.
- No additional backend module router outside the eight mounts was identified in the inspected route surface. Unresolved dynamic registration remains `UNKNOWN` until a runtime route dump is available.

## 5. Authentication and Session Analysis

Evidence: `backend/src/shared/middleware/authenticate.ts`, `backend/src/modules/authentication/authJWT.ts`, `authController.ts`, `authServices.ts`, `authRepository.ts`, and Prisma `UserSession`, `RefreshToken`, and `PasswordResetToken` models.

- Protected access requires an `Authorization` header with `Bearer <token>`; missing or malformed headers produce unauthorized errors.
- JWT verification uses Hono `verify` with `HS256` and the environment signing secret. Secret values were not inspected or exposed.
- Required access-token claims are non-empty `user_id`, `session_id`, and `tenant_id`; `company_id` is optional at middleware level and, if present, must be a non-empty string.
- The middleware loads the persisted session by `session_id` and checks user ID, tenant ID, user tenant ID, non-revoked status, expiry, and active user status. This is a verified server-side session-state check.
- The middleware does not accept cookies as an access-token source. Logout and refresh are controller/cookie/session operations and are not protected by the shared access middleware in the router.
- Login, signup, reset, logout, and refresh are stateful. Password reset and invitation flows require controlled review for token one-time-use and external email behavior.
- Exact JWT expiry issuance and refresh rotation behavior should be corroborated through the full auth service/repository path and dedicated tests; runtime replay testing was not performed.
- Session fixation/replay is not declared as a vulnerability from source alone. Required verification: refresh-token rotation/reuse, logout invalidation, access-token lifetime, and concurrent-session behavior with disposable identities.

## 6. Authorization, Tenant, and Resource Isolation

Evidence: `backend/src/shared/Authorization/authorize.ts`, authorization seeds/repository, module controllers/services/repositories, and Prisma models `Tenant`, `Company`, `CompanyMembership`, `Role`, `UserRole`, and resource models.

- `Authorize(permission)` obtains the role using authenticated `user_id` and `tenant_id`; missing role or permission returns 403.
- `ORGANIZATION_ADMIN` returns true for every permission passed to `hasPermission`. Verified scope: it is a permission check bypass for the selected tenant role, not an authentication bypass. The helper does not itself add or remove a company scope.
- Controllers in organization administration, supplier governance/portal, purchase order, purchase requisition, and approval workflow commonly require `company_id` and pass token tenant/company context to services. Missing company context is handled by controller errors in these paths.
- The Prisma schema places `tenant_id` on nearly all major records and `company_id` on company-owned records. Membership uniqueness includes tenant/company/user. This supports isolation but does not prove every query is correctly scoped.
- Repository evidence shows explicit tenant/company filters in audit, supplier, purchase requisition, purchase order, and approval workflow paths. The complete set of all update/delete predicates was not exhaustively re-proved in this report.
- Approval workflow service evidence derives tenant/company from membership and checks requisition/workflow ownership before actions in several paths; dedicated tests exist. Separation-of-duties behavior and all role authority cases still need controlled tests.
- Supplier portal paths must be tested with supplier and buyer identities for cross-company RFQ/quotation access; source indicates relationship filtering but runtime proof is absent.
- Audit search/list paths pass tenant/company filters, but sensitive audit visibility and integrity verification need two-tenant read tests.

### Potential isolation hypotheses, not confirmed vulnerabilities

1. Any detail/update/delete repository method that accepts an ID must be verified to include tenant/company/relationship predicates in the final Prisma `where`. This is a BOLA/IDOR test hypothesis, not a finding.
2. The `ORGANIZATION_ADMIN` wildcard permission must be tested across multiple companies in the same tenant and across tenants. Current source evidence preserves token tenant identity but does not substitute for object-level tests.
3. Optional `company_id` in the JWT must be tested against each operation that should require company membership. The optional claim alone is not a vulnerability.

## 7. Input Validation and Business Logic

- Zod validators are used across authentication, organization, supplier invitations, purchase orders, purchase requisitions, audit search, and approval workflow inputs. Relevant files include module `*Validator.ts` files.
- Purchase requisition and purchase order validators enforce numeric/non-negative and currency precision rules in inspected code. Approval validators enforce non-negative amount ranges and minimum/maximum ordering.
- Path IDs are commonly read from Hono parameters; identifier format and existence checks vary by service and require endpoint-specific review.
- Unknown-property handling, pagination maximums, and all query parameter limits require a consolidated validator review; they are not assumed from the presence of Zod.
- Server-side workflow transitions are visible for requisition submit/cancel/resubmit, approval approve/reject/cancel, RFQ publish, quotation selection, and PO completion. Tests cover several lifecycle and selection paths, but no tests were executed in this phase.
- The purchase-order selection path is transactional and checks RFQ/quotation state and company/tenant relationships according to the service/contract evidence. Race/replay behavior needs a controlled concurrent test.
- Duplicate submissions, event replay, stale state, and authorization at every transition remain coverage gaps.
- No file upload or export route was identified in the eight mounted routers. Prisma schema contains report-related models, but no corresponding HTTP route was established in this route surface.

## 8. Sensitive Operations and Side Effects

The following are state-changing or externally consequential and must be excluded from a read-only security scan: signup, login/session creation, password reset, logout, refresh, invitation creation/acceptance/resend, membership and role administration, company registration, requisition create/submit/cancel/resubmit/update, workflow create/approve/reject/cancel, RFQ create/publish/update/delete, quotation submission/selection, PO create/complete/update/delete, supplier relationship deletion, and any audit integrity operation whose write behavior is not fully proven.

Supplier invitation creation/resend is explicitly associated with email/external integration code. Authentication password-reset flow may also send email. Purchase and approval operations publish internal events consumed by other modules. These effects were inspected statically and never triggered.

Sensitive reads include user identities, memberships, roles/permissions, supplier invitations, supplier data, quotations, purchase orders, requisitions, approval requests, and audit records. They require authenticated permission and tenant/company tests, not merely route discovery.

## 9. Database and Tenant Boundary Analysis

- Prisma uses PostgreSQL in `backend/prisma/schema.prisma`; generated clients target workerd and node runtimes.
- `Tenant`, `User`, `Company`, `CompanyMembership`, `UserSession`, `RefreshToken`, roles, procurement resources, suppliers, invitations, and audit models expose tenant/company relations and indexes.
- Tenant/company fields are visible on core records and are passed through many service/repository interfaces.
- Some repositories use scoped compound predicates and transactions; the audit, supplier, requisition, purchase order, and approval modules show explicit scoping in inspected methods.
- A source-only audit cannot prove database row-level security, deployment connection identity, Neon branch, or runtime binding. The running Worker's database identity remains **UNVERIFIED**.
- No database operation was executed. No database URL or environment value was printed.

## 10. Security Controls and Configuration

- CORS is registered globally in `app.ts` and compares the request origin to `c.env.ALLOWED_ORIGIN`; deployment value and behavior for absent/multiple origins are unverified.
- Hono `secureHeaders()` is registered globally before routing.
- Hono logger is enabled globally. Redaction of authorization headers, cookies, tokens, and sensitive bodies is not proven from `app.ts`; logging configuration needs review before production use.
- Critical rate limiting is attached to authentication and selected high-impact routers. Redis-backed rate limiting code exists. Limits, fail-open behavior, and deployment availability need controlled verification.
- Error handling is centralized through `errorHandler` at application and nested-router levels. Exact production redaction and stack-trace behavior require review of that implementation and runtime responses.
- Cookie attributes for refresh/session flows require verification from controller/configuration code: Secure, HttpOnly, SameSite, path, domain, and expiry were not treated as runtime-proven here.
- CSRF risk depends on whether browser authentication uses cookies for state-changing endpoints. Since access middleware uses Authorization headers but refresh/logout use cookies, cookie-specific CSRF and SameSite behavior needs explicit testing.
- Blockchain and Mailgun/external integrations are present in module code. External destinations and deployment allow-lists were not exercised.
- Cloudflare/Wrangler configuration can describe deployment bindings but cannot establish the running Worker database identity without deployment/runtime evidence.

## 11. Test and Contract Coverage

Existing tests were found for authentication services/login/registration/session/repository behavior, authorization repository behavior, organization invitation service, supplier invitation/governance, purchase order validation/repository/router/lifecycle/selection/event/audit integration, purchase requisition validation/submission, and approval workflow validation/service/repository. Tests were not executed.

Coverage gaps visible from filenames and source review:

- No complete route-level matrix for all eight routers.
- No demonstrated two-tenant/two-company BOLA test suite covering every detail/update/delete endpoint.
- No complete permission matrix for `ORGANIZATION_ADMIN` versus ordinary roles.
- No end-to-end refresh/logout/revocation/replay suite across deployed middleware.
- No authenticated API contract or OpenAPI specification. The eight `api_contract.md` files are documentation, not executable specifications.
- No repository OpenAPI, Swagger, or Postman collection was identified in the inspected surface.
- Existing ZAP HTML and investigation reports do not prove route discovery or authenticated coverage.

## 12. Frontend/Backend Mapping

Frontend integrations and module API helpers should be compared against the effective mounts above. Known source/documentation discrepancies include the live `/api/userManagementRouter` prefix versus legacy user paths, uppercase `/api/PurchaseRequisition`, `/api/suppliers/suppliers-governce/:supplierId`, and live nested quotation paths under purchase orders. The purchase-order root POST route has an unusual `/:poId` shape and should not be inferred from older documentation.

A complete frontend call-by-call reconciliation was not fully established from this read-only pass. Treat frontend-only authorization or hidden UI controls as non-security controls until backend enforcement is demonstrated.

## 13. Prioritized Findings and Coverage Gaps

### F-01 — Medium / Partially verified — Object-level isolation requires systematic proof

- Affected endpoints: all detail/update/delete routes accepting user, role, supplier, invitation, RFQ, quotation, requisition, workflow, audit, or PO identifiers.
- Evidence: route IDs in the module routers; tenant/company fields and scoped repository methods in module repositories; authentication context in `authenticate.ts`.
- Impact: an omitted tenant/company/relationship predicate could expose or modify another object.
- Existing mitigation: tenant/company context is passed through many controllers/services and appears in repository filters.
- Verification: use two disposable tenants and companies with read-only detail requests first, then separately approved state-changing tests; compare 401/403/404 and returned data.
- Remediation direction: enforce tenant/company/relationship predicates at the repository mutation/read boundary and add negative isolation tests.

### F-02 — Medium / Partially verified — `ORGANIZATION_ADMIN` permission wildcard needs a resource-scope matrix

- Affected endpoints: every route using `Authorize`, especially organization administration and procurement transitions.
- Evidence: `backend/src/shared/Authorization/authorize.ts`, `hasPermission` returns true for role code `ORGANIZATION_ADMIN`.
- Impact: the role can pass all permission gates available to its tenant role; excessive access is possible if resource scoping is incomplete.
- Existing mitigation: authentication still validates session/user/tenant, and many controllers require company context.
- Verification: test same-tenant cross-company and cross-tenant reads/mutations with an organization-admin identity.
- Remediation direction: retain the intentional role semantics if desired, but document and test the exact tenant/company resource boundary.

### F-03 — Medium / Coverage gap — Authentication and session lifecycle lacks complete deployed-route coverage

- Affected endpoints: login, logout, refresh, validate token, protected routers.
- Evidence: `authenticate.ts`, auth controller/service/repository, `UserSession`/`RefreshToken` schema, existing auth unit tests.
- Impact: replay, rotation, cookie, expiry, or revocation regressions could be missed.
- Verification: disposable identities; test missing/malformed/expired/revoked tokens, refresh reuse, logout invalidation, and concurrent sessions.
- Remediation direction: add end-to-end middleware/session lifecycle tests and explicit token policy documentation.

### F-04 — Medium / Unverified — Token-based invitation validation behavior

- Affected endpoints: `/api/organizationManagement/members/validate/:token` and `/api/suppliers/supplier-invitations/validate/:token`.
- Evidence: public route registrations and invitation controllers/services; full one-time-use behavior was not proven in this pass.
- Impact: token disclosure, replay, or unintended state transition could affect invitations.
- Verification: disposable invitation tokens only; test invalid, expired, repeated, and cross-tenant tokens without accepting or sending real invitations.
- Remediation direction: ensure validation is non-consuming unless intended, hash tokens at rest, enforce tenant/expiry/status, and test replay behavior.

### F-05 — Low / Coverage gap — Sensitive logging and deployment controls are not proven

- Affected surface: global logger, error handler, CORS, rate limiter, cookies, Worker bindings.
- Evidence: registrations in `app.ts` and shared middleware/config files.
- Impact: credentials or sensitive procurement data could be exposed in logs, or controls could differ by deployment configuration.
- Verification: inspect effective logger/error redaction and deployed headers/cookie attributes in a local controlled environment; do not use production secrets.
- Remediation direction: define redaction and deployment assertions for security headers, CORS, rate limits, and cookies.

### F-06 — Informational / Verified — No executable API specification

- Evidence: eight Markdown contracts exist; no authoritative OpenAPI/Swagger/Postman artifact was identified.
- Impact: generic ZAP crawling will not discover protected routes and cannot establish authenticated or authorization coverage.
- Verification: derive a temporary specification only from verified source routes and keep it separate from authoritative product contracts.
- Remediation direction: maintain a generated or reviewed OpenAPI document as a separate contract with CI route parity checks.

No `VERIFIED VULNERABILITY` is asserted from this source-only phase.

## 14. Recommended Future ZAP Plan

1. **Passive baseline:** local health and explicitly selected public, non-stateful routes only. Do not treat zero alerts as coverage.
2. **Safe unauthenticated assessment:** include `/api/health`; exclude invitation validation until token semantics are verified. Record 401/403 as authentication observations, not failures.
3. **Authenticated read-only assessment:** use disposable local identities and a ZAP context with bearer authentication. Include only list/detail GET routes with valid non-sensitive fixture identifiers. Do not include integrity verification until side effects are confirmed absent.
4. **Role matrix:** separate identities for ordinary roles and `ORGANIZATION_ADMIN`; test permissions and same-tenant cross-company boundaries.
5. **Tenant/company isolation:** two disposable tenants and companies; use read-only object IDs first and verify response/status isolation.
6. **Controlled state changes:** only after the Worker database identity, disposable fixture strategy, rollback/cleanup, and explicit approval are established. Exclude email, invitation, external integrations, and production.
7. **Manual business logic:** test workflow ordering, authorship, approval authority, quotation selection state, RFQ/PO transitions, replay, and races with application-specific fixtures rather than generic ZAP active scan rules.

Prerequisites for any authenticated phase: local test identities, non-production secrets, known disposable database binding, seeded fixture IDs, documented bearer injection, and a request allow-list. The unknown Worker database identity is a blocker for state-changing tests.

If no authoritative OpenAPI exists, derive a temporary read-only route specification from the verified router inventory, preserving exact prefixes/case and omitting guessed schemas and stateful routes. Validate source-route parity before importing it. Importing an OpenAPI file is endpoint discovery/input preparation, not proof that ZAP performed passive or active security testing.

## 15. Unresolved Questions and Evidence Required

- Which database/Neon binding does the running Worker actually use?
- Are all detail/update/delete repository predicates scoped by tenant, company, supplier relationship, and ownership?
- Does invitation validation consume tokens, and are tokens single-use and tenant-bound?
- Are refresh cookies Secure, HttpOnly, SameSite, correctly scoped, and rotated on reuse?
- Does the logger/error handler redact authorization headers, cookies, reset tokens, and sensitive request data?
- What are the effective rate-limit thresholds and fail-open behavior in the deployed Worker?
- Are audit integrity verification and blockchain adapter operations strictly read-only?
- What exact frontend routes still use legacy paths or methods?
- Which route-level tests exist for authorization failures and cross-tenant denial?

## 16. Final Safety Statement

No application code, frontend code, tests, migrations, Prisma schema, configuration, dependencies, or environment files were modified. No HTTP requests, scans, database operations, migrations, seeds, or test commands were executed. Existing security artifacts were not overwritten. The only newly created artifact is this report: `artifacts/security/api-discovery-phase-2.md`.
