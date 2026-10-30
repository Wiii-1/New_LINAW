# LINAW Backend OWASP ZAP Investigation

Date: 2026-10-26

## A. Environment

- Branch: `dev/wii/backup`.
- The worktree was already dirty before this report: one untracked `artifacts/` entry. Existing files were preserved.
- Backend target: `http://localhost:8787`.
- Backend health: verified with `GET /api/health`, HTTP 200, response `success: true`.
- ZAP: the stated version is 2.17.0, but `zap --version` was not available in the shell used for this investigation, and no ZAP binary/process was found by the local checks. No new ZAP scan was run.
- Python was not available in the shell; no Python analysis was needed.

## B. API Coverage

The application mounts the following routers from `backend/src/app.ts`. The count below is the number of literal HTTP method registrations in the implementation routers, not a count inferred from documentation.

**Verified implementation inventory: 80 method/path combinations**

- Authentication: 8 routes under `/api/auth`: `POST /signup`, `/login`, `/forgot-password`, `/reset-password`, `/logout`, `/refresh`, `/validate_token`; `GET /:id`. Signup/login/password routes are rate-limited. `GET /:id` and `POST /validate_token` use `authenticate`; logout and refresh use controller-level cookie handling.
- Organization administration: 21 routes under `/api/organizationManagement`: invitation validation `GET /members/validate/:token` is before authentication; member, role, permission, and settings routes use `authenticate` and `Authorize(...)` with module permissions.
- Audit trail: 3 `GET` routes under `/api/auditTrail`: `/`, `/search`, and `/:auditId/verify`; router-level rate limiting, authentication, and permission authorization apply.
- Supplier management: 14 routes under `/api/suppliers`: invitation validation is public; governance, invitations, and supplier portal routes use authentication and permission authorization. The live governance detail spelling is `/suppliers-governce/:supplierId`.
- User management: 3 routes under `/api/userManagementRouter`: `GET /profile`, `PATCH /profile`, and `POST /companies/register`; router-level authentication applies.
- Purchase order management: 16 routes under `/api/purchase-orders`: RFQ, quotation, procurement queue, purchase order, publish/select/complete, update, and delete routes; router-level authentication and route permissions apply.
- Purchase requisition: 7 routes under `/api/PurchaseRequisition`: create, submit, cancel, resubmit, list, detail, and update; router-level authentication and rate limiting apply.
- Approval workflow: 8 routes under `/api/approval-workflows`: level/workflow creation, approve/reject/cancel, list, workflow list, and detail; router-level authentication and rate limiting apply.

The exact declarations are in the eight `*Router.ts` files named above. The eight `api_contract.md` files were checked against those routers. They describe the live route groups, but they are not an executable API specification.

Safe runtime probes performed against the local target:

- `GET /api/health` returned `200`.
- `GET /api/auth`, `/api/auth/me`, `/api/userManagementRouter/profile`, `/api/purchase-orders/`, `/api/PurchaseRequisition/`, `/api/suppliers/supplier-portal/rfqs`, `/api/auditTrail`, and `/api/approval-workflows` returned `404`, `401`, `401`, `401`, `401`, `401`, `401`, and `401` respectively. These probes did not send credentials or mutate records.

Important routes not runtime-tested: authenticated routes, routes requiring path identifiers, all POST/PATCH/DELETE routes, and public POST authentication flows. No credentials were available or requested, so authenticated behavior and authorization outcomes remain unverified.

No authoritative OpenAPI/Swagger document or Postman collection was found in the repository. No specification was fabricated.

## C. Security Boundaries

Inspected source code shows `backend/src/shared/middleware/authenticate.ts` requires an `Authorization: Bearer` header, verifies an HS256 JWT, validates user/session/tenant claims, checks the session and active user in the repository, and stores the authenticated identity in the request context.

`backend/src/shared/Authorization/authorize.ts` loads the user role for the token tenant and checks the requested permission. `ORGANIZATION_ADMIN` is handled specially. Router declarations identify permission checks on organization administration, audit trail, supplier management, purchase order management, purchase requisition, and approval workflow routes.

Service/repository code visibly carries tenant and company context for business operations, especially approval workflow, audit trail, purchase requisition, purchase order, and supplier operations. This is source inspection only; it is not proof that every object-level or cross-tenant authorization case is correct.

Manual verification still needed:

- Authenticated least-privilege checks for each permission-bearing route.
- Cross-tenant and cross-company object access using two isolated test identities and non-mutating reads.
- Session revocation, expiry, refresh-cookie, logout, and token-validation behavior.
- Public invitation-token and password-reset flows, including rate limiting, without using real user data.
- Workflow, requisition, supplier, quotation, and purchase-order state transitions. These should only be tested in disposable seeded data after explicit approval because many are mutating operations.

## D. ZAP Findings

No ZAP scan was executed in this investigation because the available shell could not resolve the stated `zap` executable. The existing `artifacts/security/zap-baseline.html` was not overwritten.

The existing HTML report contains zero High, Medium, Low, and Informational alerts, but its metadata does not establish that the real API routes were imported or crawled. Therefore those zeros are not treated as a security result or coverage result.

Recommended bounded reconnaissance, after making ZAP 2.17.0 available in the execution shell, is:

```sh
zap -quickurl http://localhost:8787/api/health \
  -quickout artifacts/security/zap-health-baseline.html
```

That command is only a health-endpoint baseline and is not an API scan. For meaningful repeatability, derive a small temporary OpenAPI document from the 80 verified router declarations in a disposable path outside tracked application files, validate its paths against the router source, include only non-mutating GET operations initially, and import it with the installed ZAP option:

```sh
zap -openapifile /tmp/linaw-local-readonly.openapi.yaml \
  -openapitargeturl http://localhost:8787 \
  -quickout artifacts/security/zap-api-readonly.html
```

The derived document would be a test input, not an authoritative contract. It must not include guessed paths, credentials, mutation operations, or production URLs. Observe the generated report and ZAP history to record the actual URLs requested. Only after that passive/read-only run should an authenticated context or any active scan be considered, with explicit confirmation and disposable data.

Coverage distinctions:

1. Endpoint discovery: importing a validated OpenAPI input or explicitly requesting the route URLs; generic crawling of `/api/health` does not discover the mounted API.
2. Passive scanning: inspect responses and traffic generated by safe GET requests; low impact but still limited by authentication and reachable data.
3. Active scanning: sends attack payloads and must not be run broadly without confirmation, especially against stateful endpoints.
4. Authenticated testing: requires a deliberately provisioned local test identity/session; no credentials were invented or used here.
5. Manual authorization/tenant testing: requires two isolated local identities and carefully selected non-mutating object reads; ZAP alone does not establish tenant isolation.

## E. Recommended Next Step

The smallest safe next step is to expose the already-installed ZAP 2.17.0 binary to the scan shell, then run a validated, read-only OpenAPI import generated from the implementation route declarations. Save the input under `/tmp`, keep the output as a new report, and review ZAP history for requested URLs. Confirm the resulting route coverage before considering authenticated or active scanning.
