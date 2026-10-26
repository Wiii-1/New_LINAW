# LINAW Penetration Test Methodology

## 1. Purpose

This methodology defines how to perform an authorized penetration test of LINAW, the procurement approval system. It is tailored to the repository's current architecture:

- Next.js/Vinext frontend and same-origin API routes in `frontend/`.
- Hono API deployed through Wrangler/Cloudflare Workers in `backend/`.
- PostgreSQL data accessed through Prisma.
- Redis-backed rate limiting.
- Mailgun-based authentication notifications.
- An EVM-compatible audit-trail contract in `smart_contract/`.

The assessment is intended to establish whether an attacker can bypass authentication or authorization, cross tenant or company boundaries, alter procurement state, expose sensitive records, abuse integrations, or undermine the audit-trail integrity claim. It must be performed only against systems and accounts for which written authorization exists.

This is a test methodology, not a statement that the repository contains a confirmed vulnerability. Findings must be reproduced, evidenced, and verified against the deployed build under test.

## 2. Rules of engagement

Before testing, record:

| Item | Required decision |
| --- | --- |
| Authorized targets | Frontend origin, backend origin, worker routes, test blockchain/RPC, and test database only |
| Test window | Start/end time, timezone, and maintenance contact |
| Test accounts | At least two tenants, two companies where applicable, and users for each meaningful role |
| Data handling | Synthetic procurement, supplier, invoice, and audit data; no production secrets or personal data |
| Permitted actions | Read, create, update, cancel, approve, reject, invite, reset-password, and blockchain writes only in the test environment |
| Prohibited actions | Denial-of-service, destructive database queries, real email delivery, mainnet transactions, secret extraction, and testing unrelated tenants |
| Stop conditions | Production impact, data loss, unexplained transaction fees, rate-limit failure causing service instability, or suspected secret exposure |
| Communications | Security contact, incident escalation path, and evidence-transfer location |

Use a dedicated test deployment and rotate all test credentials and blockchain keys after the assessment.

## 3. System and trust-boundary inventory

The tester should confirm the inventory below against the deployed configuration before testing.

### 3.1 Public and edge surfaces

1. Frontend pages and server/API routes under `frontend/app/`.
2. Authentication routes:
   - `/api/auth/login`
   - `/api/auth/signup`
   - `/api/auth/logout`
   - `/api/auth/refresh`
   - `/api/auth/forgot-password`
   - `/api/auth/reset-password`
3. Frontend backend forwarding routes:
   - `/api/backend/[...path]`
   - `/api/purchase-requisition/[[...path]]`
4. CORS, security headers, cookies, cache behavior, request-size limits, and error responses.

The proxy allowlist is a security boundary. Verify that it forwards only intended paths and methods and cannot be bypassed with encoded separators, dot segments, query strings, alternate HTTP methods, or ambiguous path normalization.

### 3.2 Backend modules

Test the Hono routes mounted in `backend/src/app.ts`:

- Authentication (`/auth`)
- Audit trail (`/auditTrail`)
- Approval workflows (`/approval-workflows`)
- Purchase requisitions (`/PurchaseRequisition`)
- Organization administration (`/organizationManagement`)
- Purchase orders (`/purchase-orders`)
- Suppliers (`/suppliers`)
- User management (`/userManagementRouter`)

Enumerate the actual route definitions from each `*Router.ts` file. Do not rely solely on older API documentation; where documentation and deployed behavior differ, record the discrepancy as an observation.

### 3.3 Data and integration boundaries

- PostgreSQL entities are tenant-scoped and include users, sessions, credentials, password-reset tokens, companies, memberships, requisitions, approvals, suppliers, purchase orders, receipts, invoice verification, reports, and audit records.
- Redis is used by the critical rate-limit middleware.
- Mailgun handles authentication notifications and password-reset delivery.
- The backend blockchain adapter uses a configured RPC URL, contract address, and signing private key to anchor or verify audit hashes.
- The `AuditTrail` contract stores a `bytes32` audit identifier, hash, event type, and timestamp.

## 4. Test data and identity matrix

Create synthetic records with unmistakable identifiers, such as `PT-TENANT-A-001`, and retain a mapping of every record to its owning tenant and company.

At minimum create:

| Identity | Tenant | Company | Expected capabilities |
| --- | --- | --- | --- |
| User A | A | A1 | Ordinary requester |
| Approver A | A | A1 | Approval permissions |
| Admin A | A | A1 | Organization administration |
| Supplier A | A | A1 or supplier context | Supplier portal/quotation actions |
| User B | B | B1 | Same nominal role as User A |
| Unprivileged A | A | A1 | Authenticated but missing target permission |
| Disabled/expired user | A | A1 | No access |

For every identity obtain a fresh session and capture:

- access token and refresh-token lifecycle;
- cookie attributes and browser storage behavior;
- `user_id`, `session_id`, `tenant_id`, and optional `company_id` behavior;
- assigned roles, permissions, memberships, and employment status.

Never put live secrets, password-reset tokens, private keys, or full authentication tokens in the final report.

## 5. Method and phases

### Phase 0 — Preparation and baseline

1. Confirm authorization, target URLs, environment, deployment commit, and test window.
2. Build a route and role matrix from the deployed API and the router source.
3. Establish normal behavior for login, logout, refresh, profile, requisition creation, approval, supplier quotation, purchase order, and audit verification.
4. Record expected status codes, response schemas, side effects, database identifiers, emitted events, and blockchain transaction behavior.
5. Confirm that logs and monitoring can distinguish test traffic.

### Phase 1 — Reconnaissance and configuration review

Check without destructive exploitation:

- TLS certificate, redirect, HSTS, CORS origin reflection, allowed methods, and security headers.
- Exposed health endpoints, debug output, source maps, stack traces, framework banners, and deployment metadata.
- Publicly reachable worker bindings, RPC endpoints, database administration endpoints, Redis endpoints, and Mailgun configuration.
- Environment-variable leakage in frontend bundles, logs, error responses, and generated artifacts.
- Dependency lockfiles and known vulnerable package versions as a risk input; validate any claimed impact manually.
- Cloudflare/Wrangler routing, preview deployments, staging hostnames, and origin exposure.

### Phase 2 — Authentication and session management

Use separate accounts and a controlled password-test set.

1. **Registration**
   - Validate email, password, name, duplicate-account, tenant assignment, and status handling.
   - Test normalization and case handling for emails.
   - Check for user enumeration through status, timing, and error differences.
   - Confirm rate limiting on repeated signup attempts.
2. **Login**
   - Test wrong password, unknown email, disabled user, malformed JSON, oversized input, duplicate parameters, and credential stuffing thresholds.
   - Confirm generic failure responses and no token issuance on failure.
   - Confirm access and refresh tokens have the intended issuer/audience/algorithm policy and expiry.
3. **JWT validation**
   - Alter header algorithm, signature, expiry, issued-at, token type, and each identity claim.
   - Test missing, duplicated, malformed, oversized, and whitespace-variant `Authorization` headers.
   - Confirm the server validates the session in storage, tenant consistency, user status, expiry, and revocation rather than trusting claims alone.
   - Attempt access-token use as a refresh token and vice versa.
4. **Refresh and logout**
   - Test refresh-token rotation, reuse, revocation, expiry, session binding, replay after logout, and concurrent refresh.
   - Confirm logout invalidates the intended server-side session/token and clears browser cookies.
   - Test logout with missing, malformed, expired, and cross-user tokens.
5. **Password reset**
   - Test enumeration, token entropy, one-time use, expiry, tenant/user binding, replay, rate limiting, password policy, and invalidation of existing sessions after reset.
   - Confirm reset links use the configured HTTPS application URL and do not leak tokens through logs, referrers, or responses.
6. **Cookie and browser controls**
   - Verify `HttpOnly`, `Secure` in HTTPS deployments, `SameSite`, `Path`, expiration, cache-control, and no token exposure to client-side scripts.
   - Because authenticated cookies are used by frontend routes, test CSRF on every state-changing frontend/API route, including cross-site form, image, fetch, and redirect scenarios.

### Phase 3 — Authorization, tenant isolation, and workflow abuse

Build an authorization matrix with rows for identities and columns for each route/action. For every object identifier created by Tenant A, replay the request as Tenant B, an unprivileged Tenant A user, a different company in Tenant A, and a supplier identity.

Test:

- Missing, invalid, expired, revoked, and valid authentication.
- Required permission absent/present.
- Role changes during an active session.
- Tenant, company, membership, and supplier relationship mismatches.
- Direct object references for users, roles, requisitions, RFQs, quotations, purchase orders, receipts, invoices, reports, and audit records.
- List, search, filter, sort, pagination, export, and detail endpoints for cross-tenant leakage.
- Mass assignment of server-controlled fields such as owner, tenant, company, status, approval level, actor, timestamps, and audit identifiers.
- Method confusion and route-shadowing, especially paths with identifiers and similarly named collection routes.

High-value workflow tests:

1. Create a requisition, then attempt unauthorized update, submit, cancel, and resubmit.
2. Skip or reorder approval levels; approve/reject as the requester or an unrelated approver.
3. Modify amount, supplier, company, or line items after approval or after purchase-order creation.
4. Create or alter a purchase order without an approved requisition or with another tenant's requisition.
5. Submit supplier quotations for an RFQ not assigned to the supplier; read other suppliers' quotations.
6. Invite members/suppliers with altered tenant/company/role fields and reuse invitations.
7. Assign or remove permissions from roles without the organization-administration permission.
8. Read or modify another user's profile using the `:userId` path.
9. Verify or search audit records outside the caller's tenant or permission scope.

Use concurrency tests only at low volume to identify double-submit, duplicate approval, replay, and state-transition races. Confirm final database state and audit records after every test.

### Phase 4 — Input validation and business-logic testing

For every JSON, query, path, and header input:

- Send wrong types, nulls, empty strings, boundary lengths, Unicode normalization variants, duplicate keys, deeply nested objects, arrays where scalars are expected, and unexpected fields.
- Test SQL/ORM injection patterns, template injection, command injection, server-side request forgery, path traversal, and prototype-pollution-shaped objects where the input reaches a relevant sink.
- Test numeric precision, negative values, zero values, currency codes, decimal rounding, date/time zones, and extremely large quantities.
- Test stored/reflected HTML and JavaScript in names, descriptions, supplier fields, event types, rejection reasons, and report filters.
- Test upload and attachment controls if enabled: MIME spoofing, extension mismatch, decompression bombs, size limits, authorization on download, object-key traversal, and malware scanning.
- Verify that rejected input produces a clear client error without stack traces or partial state changes.

Business invariants to assert:

- A record cannot transition to an invalid status or skip a required predecessor.
- Approval cannot be performed twice or by an unauthorized actor.
- A cancelled or finalized record cannot be mutated through alternate endpoints.
- Totals, line items, currency, tax, and quantities remain consistent across requisition, quotation, purchase order, receipt, and invoice verification.
- Audit entries identify the real actor and immutable before/after context.

### Phase 5 — API, frontend proxy, and transport testing

Test both the frontend origin and backend origin, then compare behavior:

- Confirm the proxy forwards only the intended methods and allowed prefixes.
- Attempt encoded slash, backslash, dot-segment, double-encoding, semicolon, query, and case-variant allowlist bypasses.
- Test whether the proxy forwards or strips authorization/cookie headers as intended.
- Test request body, response, and error-size limits and upstream timeout behavior.
- Check cache poisoning and token-bearing response caching, especially login, refresh, profile, and error responses.
- Test CORS with allowed origin, untrusted origin, `null`, subdomains, credentials, and preflight methods/headers.
- Check open redirects and URL construction around `APP_URL`, password reset links, and upstream API configuration.
- Verify consistent authorization when calling the backend directly versus through the frontend.

### Phase 6 — Rate limiting and abuse resistance

For login, signup, password reset, refresh, audit verification, approvals, and other critical actions:

- Establish the configured threshold and `Retry-After` behavior.
- Test per-IP, per-user, per-session, and endpoint-key separation.
- Test spoofed `CF-Connecting-IP` and multi-value `X-Forwarded-For` handling only in an isolated environment.
- Test distributed low-rate attempts across sessions and IPs.
- Confirm rate-limit failures do not reveal internal Redis errors or allow the protected action to continue.
- Confirm logging does not emit tokens, passwords, reset values, or excessive personal data.

Do not conduct volumetric denial-of-service testing. Use a small, pre-approved request budget.

### Phase 7 — PostgreSQL and data protection

Without direct production access, verify through application behavior and authorized read-only inspection:

- Every tenant-owned query filters by the authenticated tenant and, where applicable, company/membership.
- Unique constraints and foreign keys prevent cross-tenant references and orphaned security records.
- Passwords use an appropriate password hash and are never returned or logged.
- Refresh sessions, reset tokens, and audit hashes are stored with safe expiry/revocation semantics.
- Sensitive fields are excluded from list, error, report, and audit responses.
- Transactions preserve state transitions and audit creation together.
- Report/export endpoints cannot be used to enumerate or exfiltrate another tenant's data.

If database access is explicitly authorized, use a read-only account and test backups, migration permissions, extension exposure, row-level controls, and log redaction separately.

### Phase 8 — Mailgun and outbound integration testing

Use a Mailgun sandbox or sink mailbox:

- Verify reset and invitation recipients cannot be attacker-controlled through headers or template parameters.
- Test email/header injection, template injection, link host manipulation, and token leakage.
- Confirm provider failures do not create a false successful password reset or invitation.
- Check retry behavior, duplicate messages, and sensitive data in provider logs.

### Phase 9 — Smart-contract and blockchain integration testing

Use a local Hardhat/Besu test network or approved testnet only. Do not send transactions to mainnet.

#### Contract-level tests

- Confirm only the intended backend signer or authorized caller can anchor records. If unrestricted anchoring is intentional, document the trust model and test its consequences.
- Test duplicate `auditId` anchoring and verify that failed duplicates do not alter the original record.
- Test zero/empty identifiers, arbitrary event types, malformed values, and maximum-length strings for gas, storage, and denial-of-service impact.
- Verify `verifyAudit` returns false for an unknown identifier and for a mismatched hash.
- Verify `getAudit` behavior for unknown identifiers and confirm callers cannot alter stored records through view functions.
- Check event fields, indexed topics, timestamps, and emitted values against persisted application records.
- Test reorg, failed transaction, reverted transaction, RPC timeout, nonce contention, and confirmation handling.

#### Adapter and trust-boundary tests

- Confirm audit IDs are deterministically mapped to the intended `bytes32` value and that hash validation rejects malformed or ambiguous encodings.
- Confirm the configured contract address, RPC URL, chain identity, and signer are validated and cannot be replaced by request input.
- Confirm the private key is never returned, logged, bundled into frontend code, or exposed in error messages.
- Test replay, duplicate event registration, transaction replacement, and a successful chain transaction followed by a database failure.
- Compare database audit records, transaction receipt, emitted event, and on-chain `getAudit` result.
- Establish the policy for chain reorganizations and unavailable RPCs; a verification result must not be reported as successful when the chain state is unknown.

### Phase 10 — Detection, recovery, and retest

1. Confirm security logs identify authentication failures, authorization denials, password-reset events, role changes, workflow transitions, rate limiting, and blockchain failures.
2. Confirm logs do not contain credentials, bearer tokens, reset tokens, private keys, or unnecessary sensitive fields.
3. Trigger controlled failures and verify alerts, dashboards, and operator runbooks.
4. Test session revocation, key rotation, Mailgun credential rotation, Redis failure, database failure, and RPC failure in a non-production environment.
5. Restore test data and rotate all test secrets after testing.

## 6. Tooling and execution guidance

Use approved, low-impact tools and keep raw traffic in a protected evidence store:

- Interception/replay proxy: Burp Suite or OWASP ZAP.
- HTTP and protocol checks: `curl`/PowerShell, browser developer tools, and a small scripted test client.
- Dependency/configuration review: repository lockfiles, package-manager audit capability, and deployment configuration review.
- API tests: existing backend unit tests plus authenticated integration tests against a seeded environment.
- Contract tests: Hardhat test suite in `smart_contract/`, with a local EVM node where needed.
- Database checks: Prisma migration/schema review and read-only PostgreSQL inspection when authorized.

Repository validation commands that establish a clean baseline are:

```text
cd backend
pnpm typecheck

cd ..\frontend
pnpm lint
pnpm typecheck
pnpm build

cd ..\smart_contract
pnpm compile
pnpm test
```

These commands are build and test checks, not substitutes for the dynamic penetration tests above. Run them before and after remediation to separate security regressions from unrelated build failures.

## 7. Test case record format

Record one row per test case:

| Field | Description |
| --- | --- |
| ID | Stable identifier, for example `AUTH-07` or `AUTHZ-TENANT-03` |
| Objective | Security property being tested |
| Preconditions | Account, role, tenant, record, and environment |
| Request/action | Sanitized method, path, headers, and body |
| Expected result | Status, response shape, and state change |
| Actual result | Observed behavior and timestamps |
| Evidence | Request/response IDs, screenshots, logs, database diff, event, or transaction hash |
| Impact | Confidentiality, integrity, availability, and business effect |
| Reproducibility | Always, intermittent, or one-time |
| Disposition | Open, accepted risk, fixed, or not reproducible |

## 8. Severity and reporting

Rate findings using impact and exploitability, with business context:

| Severity | Use when |
| --- | --- |
| Critical | Remote compromise, arbitrary code execution, signing-key compromise, or cross-tenant exposure at material scale |
| High | Authentication bypass, cross-tenant write/read, unauthorized approval/order manipulation, reset-token compromise, or audit-integrity compromise |
| Medium | Permission bypass limited to a role/action, significant data leakage, CSRF on a meaningful state change, or practical abuse of a critical endpoint |
| Low | Defense-in-depth weakness with limited direct impact, verbose error, missing hardening control, or low-impact metadata disclosure |

Each finding must include:

1. Title and severity.
2. Affected deployment, route, contract, or source location.
3. Preconditions and exact reproduction steps.
4. Sanitized request/response and evidence.
5. Security and business impact.
6. Root cause and a minimal remediation recommendation.
7. Whether exploitation crossed tenant, company, role, or trust boundaries.
8. Retest result and residual risk.

Do not report scanner output alone as a vulnerability. Confirm exploitability and affected behavior manually.

## 9. Exit criteria

The assessment is complete when:

- All in-scope routes and trust boundaries have an owner and test result.
- Authentication, session, authorization, tenant isolation, workflow, proxy, rate-limit, data, integration, and blockchain test groups are executed or explicitly marked not applicable.
- High and Critical findings have a reproducible proof of concept and an agreed remediation owner.
- Test data and credentials are removed or rotated.
- A clean retest confirms fixes and checks for regressions in adjacent workflows.
- The final report includes limitations, untested paths, environment/version identifiers, evidence references, and a risk-ranked remediation backlog.

## 10. Repository references

- [Application composition](../../backend/src/app.ts)
- [Authentication middleware](../../backend/src/shared/middleware/authenticate.ts)
- [Authorization helper](../../backend/src/shared/Authorization/authorize.ts)
- [JWT implementation](../../backend/src/modules/authentication/authJWT.ts)
- [Critical rate limiter](../../backend/src/shared/middleware/rateLimit/critical-rate-limit.ts)
- [Frontend backend proxy](../../frontend/app/api/backend/[...path]/route.ts)
- [Frontend login route](../../frontend/app/api/auth/login/route.ts)
- [Prisma data model](../../backend/prisma/schema.prisma)
- [Blockchain adapter](../../backend/src/shared/blockchain/blockchainAdapter.ts)
- [Audit-trail contract](../../smart_contract/contracts/AuditTrail.sol)
- [Deployment notes](../development/Deployment.md)
- [Testing strategy](../development/Testing_Strategy.md)
