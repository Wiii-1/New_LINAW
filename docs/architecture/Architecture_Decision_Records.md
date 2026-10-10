# Architecture Decision Records (ADR)

This document records the significant architectural decisions made during the design of the Procurement Approval System. Each Architecture Decision Record (ADR) documents the context, decision, rationale, and consequences of major architectural choices made throughout the system design.

---

# ADR-001: Adopt Modular Monolithic Architecture

## Status

Accepted

## Context

The Procurement Approval System is designed primarily for Micro, Small, and Medium Enterprises (MSMEs), where the expected number of concurrent users is relatively low. The project also has limited development resources and is intended to be maintainable throughout its lifecycle.

Several architectural approaches were considered, including a traditional monolith, a modular monolith, and a microservices architecture.

## Decision

The system will adopt a **Modular Monolithic Architecture**, where all modules are deployed as a single application while maintaining clear separation of responsibilities between business domains such as Authentication, Procurement, Approval Workflow, Vendor Management, and Reporting.

## Rationale

A modular monolith provides a balance between simplicity and maintainability.

Compared to microservices, it:

- Reduces infrastructure and deployment complexity.
- Avoids distributed system challenges such as service discovery, inter-service communication, and orchestration.
- Simplifies debugging and development.
- Matches the expected workload of MSMEs.
- Allows future migration to microservices if business growth requires independent scaling.

## Consequences

### Positive

- Simpler deployment and maintenance.
- Lower infrastructure cost.
- Easier debugging and development.
- Clear separation of business modules.
- Future migration path toward microservices.

### Negative

- Entire application is deployed as one unit.
- Large deployments may require scaling the whole application instead of individual modules.

---

# ADR-002: Use Blockchain as a Verification Layer

## Status

Accepted

## Context

Procurement documents and approval records require protection against unauthorized modification while remaining easily accessible within the application.

Using blockchain as the primary data store was considered but was determined to be unsuitable due to storage cost, performance limitations, and privacy concerns.

## Decision

Blockchain will be used solely as an immutable verification layer that stores cryptographic proofs of finalized procurement records.

The blockchain will not replace the relational database.

## Rationale

Using blockchain only for verification provides:

- Immutable audit trails.
- Tamper-evident procurement records.
- Lower blockchain transaction costs.
- Better application performance.
- Preservation of confidential procurement information.

This approach allows the system to benefit from blockchain technology without introducing unnecessary complexity.

## Consequences

### Positive

- Immutable audit records.
- Improved data integrity.
- Reduced blockchain storage costs.
- Better application performance.
- Sensitive business data remains private.

### Negative

- Blockchain cannot recover lost application data.
- Verification requires both blockchain and database records.

---

# ADR-003: Store Business Data in PostgreSQL

## Status

Accepted

## Context

The Procurement Approval System manages highly structured business information including procurement requests, users, approvals, suppliers, purchase orders, invoices, and audit metadata.

These entities have complex relationships that require transactional consistency.

## Decision

PostgreSQL will be used as the primary relational database for all operational business data.

## Rationale

PostgreSQL was selected because it provides:

- ACID-compliant transactions.
- Strong relational modeling.
- Mature SQL capabilities.
- High reliability.
- Excellent support for reporting and querying procurement records.

The relational model closely matches the business processes of procurement management.

## Consequences

### Positive

- Reliable transaction processing.
- Strong relational integrity.
- Mature ecosystem and tooling.
- Excellent reporting capabilities.

### Negative

- Schema changes require database migrations.
- Less suitable for highly unstructured data.

---

# ADR-004: Use JWT-Based Authentication and Role-Based Access Control

## Status

Accepted

## Context

The system supports multiple user roles including Procurement Officers, Approving Managers, Chief Procurement Officers, Vendors, Auditors, and Administrators.

Each role requires different levels of system access.

## Decision

The system will implement JWT-based authentication together with Role-Based Access Control (RBAC).

JWT will be used to authenticate users, while RBAC will determine access to protected resources.

## Rationale

This approach provides:

- Stateless authentication.
- Secure API communication.
- Flexible authorization management.
- Separation of permissions based on organizational roles.
- Compatibility with modern web applications.

## Consequences

### Positive

- Secure authentication.
- Simplified authorization management.
- Easy integration with frontend applications.
- Scalable permission management.

### Negative

- Requires secure handling of authentication tokens.
- Incorrect role configuration may result in unauthorized access.

---

# ADR-005: Exclude Payment Processing from System Scope

## Status

Accepted

## Context

The objective of the system is to improve procurement transparency, approval workflows, and auditability.

Implementing payment processing would significantly increase project complexity by introducing banking integrations, financial regulations, and payment security requirements that fall outside the intended project scope.

## Decision

The Procurement Approval System will not execute vendor payments.

The system will record vendor invoices, perform procurement verification, and prepare records for external payment processing handled by existing accounting or financial systems.

## Rationale

This decision keeps the system focused on procurement governance while avoiding unnecessary financial system complexity.

It also aligns with the needs of MSMEs that may already use existing accounting software for payment execution.

## Consequences

### Positive

- Smaller project scope.
- Reduced implementation complexity.
- Avoids financial compliance requirements.
- Focuses development on procurement management and auditability.

### Negative

- Payment tracking depends on external systems.
- End-to-end financial processing is outside the application.

---

# ADR-006: Store Only Cryptographic Hashes on the Blockchain

## Status

Accepted

## Context

Procurement records contain confidential business information that should not be publicly exposed or permanently stored on a blockchain network.

At the same time, auditors require a mechanism to verify that important procurement records have not been modified.

## Decision

Only cryptographic hashes and blockchain transaction metadata will be stored on-chain.

Complete procurement records will remain in PostgreSQL and document storage.

## Rationale

This approach provides data integrity without exposing sensitive procurement information.

It also reduces blockchain storage costs and improves application performance while maintaining verifiable audit records.

## Consequences

### Positive

- Protects confidential business information.
- Lower blockchain storage requirements.
- Faster blockchain operations.
- Maintains verifiable record integrity.

### Negative

- Verification requires access to both blockchain records and application data.
- Blockchain cannot reconstruct original documents.

---

# ADR-007: Use Docker for Application Deployment

## Status

Accepted

## Context

The application will be deployed across development, testing, and production environments.

Maintaining consistent environments is essential to reduce deployment issues and simplify system maintenance.

## Decision

The system will be containerized using Docker.

Application services and supporting infrastructure will run inside containers to ensure consistent execution across environments.

## Rationale

Docker provides:

- Consistent development and deployment environments.
- Simplified application packaging.
- Easier infrastructure management.
- Improved portability across different hosting platforms.
- Better support for future scaling and deployment automation.

## Consequences

### Positive

- Consistent deployments.
- Improved portability.
- Simplified environment management.
- Easier onboarding for developers.

### Negative

- Additional learning curve for container management.
- Slight increase in deployment complexity compared to running applications directly.

---

# ADR-008: Use of argon2, jsonwebtoken, morgan, and helmet

## Status

Accepted

## Decision

The system will use established Node.js libraries for authentication, security, and HTTP middleware:

- **argon2** will be used for secure password hashing and password verification.
- **jsonwebtoken** will be used to generate and verify JSON Web Tokens (JWTs) for stateless authentication.
- **morgan** will be used for HTTP request logging during development and system monitoring.
- **helmet** will be used to configure security-related HTTP headers and provide additional protection against common web vulnerabilities.

These libraries will be integrated into the backend application and used according to their intended security practices.

## Rationale

Using established and widely adopted libraries reduces the need to implement security-sensitive functionality manually.

Password hashing requires a secure and computationally expensive hashing algorithm to reduce the risk of password cracking. Argon2 provides a modern password-hashing algorithm designed specifically for securely storing passwords.

JSON Web Tokens provide a practical mechanism for maintaining authenticated sessions in the backend without requiring the server to store session state for every authenticated user.

Morgan provides standardized HTTP request logging, which helps developers monitor requests, identify errors, and troubleshoot application behavior during development and operation.

Helmet provides security-focused HTTP headers that help protect the application against common browser-based attacks and reduce security risks caused by unsafe HTTP header configurations.

Using these libraries also promotes consistency, maintainability, and reduces the risks associated with implementing security mechanisms from scratch.

## Consequences

### Positive

- Secure password storage through Argon2 password hashing.
- Reduced risk of implementing authentication and security mechanisms incorrectly.
- Stateless authentication using JWTs.
- Improved visibility into HTTP requests through request logging.
- Additional protection through security-related HTTP headers.
- Uses established libraries instead of maintaining custom security implementations.
- Easier maintenance and development of the backend.
- Provides a consistent approach to authentication and HTTP security.

### Negative

- Introduces additional third-party dependencies into the backend.
- Libraries must be regularly updated to address security vulnerabilities and compatibility issues.
- JWT-based authentication requires careful management of token expiration, signing secrets, and token validation.
- HTTP logging may expose sensitive information if request data is logged improperly.
- Helmet's security headers may require configuration depending on the application's frontend, API, and deployment environment.
- Argon2 hashing requires more computational resources than simpler hashing algorithms, although this is intentional for password security.

---

# ADR-009: Keep RFQ Lifecycle Management Within Purchase Order Management

## Status

Accepted

## Context

The Procurement Approval System follows a procurement process in which a Purchase Requisition (PR) is submitted for approval before procurement personnel proceed with supplier sourcing.

RFQ creation and publication were initially considered part of the Approval Workflow. However, RFQs, supplier quotations, supplier selection, and Purchase Orders belong to the broader procurement chain and share related business rules and data.

Placing these operations across the Approval Workflow and Supplier Management would introduce unnecessary responsibility overlap and make procurement lifecycle management more difficult to maintain.

The system also requires a clear separation between buyer-side procurement operations and supplier-side activities.

## Decision

The system will keep RFQ lifecycle management and Purchase Order operations within the **Purchase Order Management (POM) module**.

The Approval Workflow will remain responsible for processing approval requests and determining whether a Purchase Requisition has been approved.

After approval, an authorized procurement officer may use POM to create and manage an RFQ associated with the approved Purchase Requisition.

POM will be responsible for:

- Creating and managing RFQs.
- Publishing RFQs for eligible suppliers.
- Managing supplier quotation selection and evaluation-related operations.
- Associating supplier quotations with their respective RFQs.
- Creating and managing Purchase Orders.
- Maintaining relationships between Purchase Requisitions, RFQs, quotations, selected suppliers, and Purchase Orders.

Supplier Management will provide supplier governance, onboarding, and supplier-facing portal functionality. It will not own RFQ creation, publication, quotation selection, or Purchase Order creation.

The Supplier Portal will retrieve eligible published RFQs and allow authorized supplier users to submit and view their quotations.

The resulting workflow will be:

**Purchase Requisition → Approval Workflow → Approved Purchase Requisition → POM Creates and Publishes RFQ → Supplier Submits Quotation → POM Evaluates and Selects Quotation → POM Creates Purchase Order**

## Rationale

Keeping procurement operations within POM provides a clear boundary between approval processing and procurement execution.

This approach:

- Establishes a single module responsible for RFQ and Purchase Order lifecycle operations.
- Prevents RFQ creation and publication logic from being duplicated across modules.
- Keeps the Approval Workflow focused on approval-related responsibilities.
- Keeps Supplier Management focused on supplier records, onboarding, and supplier-facing operations.
- Allows the Supplier Portal to access procurement information without owning the buyer-side procurement process.
- Makes the procurement chain easier to maintain and audit.

## Consequences

### Positive

- Clear separation of responsibilities between Approval Workflow, POM, and Supplier Management.
- Centralized RFQ and Purchase Order lifecycle management.
- Reduced duplication of procurement business logic.
- Clearer API and service boundaries.
- Better maintainability of the procurement chain.
- Supplier-facing operations remain separate from buyer-side procurement decisions.

### Negative

- POM must coordinate with Supplier Management when retrieving supplier-related information or validating supplier eligibility.
- The modules must enforce consistent authorization and company-supplier relationship rules.
- POM must ensure that RFQs are created from eligible procurement requests and that quotation selection follows valid procurement rules.

---

# ADR-010: Represent Purchase Requisition Revisions Using Self-Referencing Records

## Status

Accepted

## Context

A Purchase Requisition may be rejected and later revised and resubmitted by the
employee who originally created it.

The system must preserve the contents and history of previous submissions
without overwriting the rejected requisition.

A dedicated `PurchaseRequisitionRevision` table was considered, but introducing
a separate revision table would increase the complexity of the existing
Purchase Requisition module.

The existing `PurchaseRequisition` table already represents the Purchase
Requisition domain, so revisions can be represented as additional records
within the same table.

## Decision

Purchase Requisition revisions will be represented as separate records within
the existing `PurchaseRequisition` table.

Each revision will have:

- Its own UUID.
- Its own `pr_number`.
- Its own revision number.
- Its own requisition contents.
- Its own status.
- A `parent_requisition_id` referencing the original/root requisition.

The original requisition will have a `NULL` `parent_requisition_id`.

Subsequent revisions will reference the original requisition through
`parent_requisition_id`.

The relationship will be self-referencing within the
`PurchaseRequisition` table.

## Example

```text
PurchaseRequisition
│
├── PR-20260815-001-01
│   Revision: 1
│   Status: REJECTED
│   parent_requisition_id: NULL
│
├── PR-20260815-001-02
│   Revision: 2
│   Status: SUBMITTED
│   parent_requisition_id: UUID-A
│
└── PR-20260815-001-03
    Revision: 3
    Status: APPROVED
    parent_requisition_id: UUID-A
```

All revisions belong to the same procurement request because they share the
same root requisition through `parent_requisition_id`.

## Identifier Responsibilities

Each identifier has a separate responsibility.

```text
id
↓
Unique technical identifier for the specific Purchase Requisition record.

pr_number
↓
Human/business-facing identifier for the specific revision.

parent_requisition_id
↓
Identifies the original/root Purchase Requisition that owns the revision
history.

revision_number
↓
Identifies the chronological revision of the Purchase Requisition.
```

Example:

```text
id: UUID-A
pr_number: PR-20260815-001-01
revision_number: 1
parent_requisition_id: NULL

id: UUID-B
pr_number: PR-20260815-001-02
revision_number: 2
parent_requisition_id: UUID-A
```

## Revision Lifecycle

A rejected Purchase Requisition must not be overwritten when the employee
resubmits it.

Instead, a new Purchase Requisition record is created using the previous
revision as the source for the new revision.

```text
Revision 1
    ↓
SUBMITTED
    ↓
REJECTED
    ↓
Employee edits requisition
    ↓
Revision 2 created
    ↓
DRAFT
    ↓
Employee submits
    ↓
SUBMITTED
```

If the new revision is rejected again, another revision may be created.

```text
Revision 1 → REJECTED
Revision 2 → REJECTED
Revision 3 → SUBMITTED
```

Previous revisions remain unchanged and are retained as historical records.

## Resubmission Logic

The resubmission operation should receive the original/root Purchase
Requisition UUID.

The service layer is responsible for coordinating the revision process.

The general flow is:

```text
Controller
    ↓
Original/root requisition UUID
    ↓
Service
    ├── Authenticate user
    ├── Find the latest revision
    ├── Verify the user is authorized to resubmit
    ├── Verify the current revision is REJECTED
    ├── Determine the next revision number
    ├── Generate the new pr_number
    ├── Copy the relevant requisition data
    ├── Apply the employee's changes
    └── Bundle the data
            ↓
        Repository
            ↓
        Create new Purchase Requisition record
```

The repository is responsible for persistence and should not contain the
business rules for determining whether a requisition can be resubmitted.

## Purchase Requisition Number

The proposed `pr_number` format is:

```text
PR-{YYYYMMDD}-{SEQUENCE}-{REVISION}
```

Example:

```text
PR-20260815-001-01
```

Where:

- `PR` identifies the record as a Purchase Requisition.
- `YYYYMMDD` represents the creation date of the original requisition.
- `SEQUENCE` identifies the procurement request created on that date.
- `REVISION` identifies the specific revision.

Example revision history:

```text
PR-20260815-001-01 → Revision 1 → REJECTED
PR-20260815-001-02 → Revision 2 → REJECTED
PR-20260815-001-03 → Revision 3 → SUBMITTED
```

The `pr_number` is a business-facing identifier and does not replace the UUID
primary key.

## Rationale

Using the existing `PurchaseRequisition` table avoids introducing a separate
revision table while still allowing the system to preserve revision history.

This approach keeps revisions within the existing Purchase Requisition domain
and allows the existing repository, service, and module structure to be
extended rather than introducing an entirely separate revision subsystem.

The self-referencing `parent_requisition_id` provides a stable relationship
between all revisions belonging to the same procurement request.

Each revision having its own UUID also ensures that individual revisions can
be referenced independently by other parts of the system when necessary.

## Consequences

### Positive

- No dedicated revision table is required.
- Previous revisions remain available for auditing.
- Existing Purchase Requisition infrastructure can be reused.
- Each revision has its own UUID.
- Each revision can have its own business-facing `pr_number`.
- Revision history can be queried through the parent relationship.
- Rejected requisitions are not overwritten.
- Historical requisition contents remain available.
- The approach fits the existing modular monolithic architecture.

### Negative

- The Purchase Requisition service layer becomes responsible for revision
  management logic.
- Queries must distinguish between the original requisition and its revisions.
- Related entities such as approval records, RFQs, and Purchase Orders may
  need to reference the appropriate revision.
- The `PurchaseRequisition` table contains multiple records representing
  different versions of the same business request.
- Additional validation is required to ensure revision relationships remain
  consistent.
- Generating revision-specific `pr_number` values adds additional business
  logic to the service layer.

## Implementation Notes

The following implementation details should be considered when implementing
this decision:

- Add `parent_requisition_id` as a nullable self-referencing foreign key.
- Add `revision_number` to identify the revision order.
- Keep `id` as the primary UUID of each individual record.
- Keep `pr_number` as the business-facing identifier.
- Ensure the original requisition has a `NULL` parent reference.
- Ensure all subsequent revisions reference the original/root requisition.
- Do not overwrite previous rejected revisions.
- Determine the latest revision through the revision relationship and
  `revision_number`.
- Generate the next revision number when creating a resubmission.
- Generate the corresponding `pr_number` for the new revision.
- Keep revision creation logic in the service layer.
- Keep database persistence logic in the repository layer.

## Future Considerations

The following may require additional architectural decisions later:

- Whether approval records should reference a specific revision.
- Whether RFQs should reference a specific revision.
- Whether Purchase Orders should reference a specific revision.
- How requisition items should be associated with revisions.
- How revision comparisons should be displayed to users.
- Whether the system should expose the complete revision history to employees
  and procurement officers.
- Whether revision numbers and `pr_number` generation should be configurable.

# ADR-011: Consolidate Supplier Governance, Invitations, and Portal Operations Within Supplier Management

## Status

Accepted

## Context

The system initially treated supplier management and the Supplier Dashboard as separate functional areas.

However, both areas depend on the same supplier identities, company information, supplier-company relationships, invitations, and supplier quotations.

Maintaining separate top-level modules for supplier governance and supplier-facing operations would introduce unnecessary module boundaries and could duplicate supplier-related business logic.

At the same time, combining every supplier operation into a single service would create a large service responsible for unrelated workflows, including supplier administration, invitation processing, and supplier-facing procurement operations.

The system therefore requires one Supplier Management module with clearly separated internal responsibilities.

The existing data model includes the following relevant entities:

- `Supplier`
- `SupplierInvitation`
- `SupplierCompanyRelationship`
- `SupplierQuotation`
- `SupplierQuotationItem`

The `Supplier` record represents the supplier identity, while `SupplierCompanyRelationship` represents the relationship between a purchasing company and a supplier.

A company may participate in LINAW as a buyer and as a supplier. These roles must not require duplicating the company's identity.

## Decision

The system will consolidate supplier governance, invitation processing, and Supplier Portal functionality into one **Supplier Management module**.

The module will contain three dedicated services:

1. `supplierManagementGovernanceService.ts`
2. `supplierManagementInvitationService.ts`
3. `supplierManagementPortalService.ts`

Each service will have a distinct responsibility.

### 1. Supplier Governance Service

The Governance Service will manage supplier records and supplier-company relationships from the perspective of an authorized purchasing company.

Its responsibilities will include:

- Retrieving and viewing supplier records.
- Retrieving supplier details and related information.
- Searching and filtering suppliers available to the active company.
- Removing a supplier from the active company's supplier list.
- Preserving supplier identities and historical procurement records.

Removing a supplier from a purchasing company's list will deactivate the relevant `SupplierCompanyRelationship` rather than physically deleting the `Supplier` record.

This operation will not automatically deactivate the supplier's relationships with other companies.

The Governance Service will not own invitation delivery, invitation acceptance, supplier registration, or supplier quotation submission.

### 2. Supplier Invitation Service

The Invitation Service will manage supplier onboarding invitations and their lifecycle.

Its responsibilities will include:

- Creating supplier invitations.
- Generating time-limited invitation links.
- Sending initial invitation emails and resending invitations.
- Validating invitation tokens.
- Rejecting invalid, expired, cancelled, or previously accepted invitations.
- Coordinating invitation acceptance with existing authentication and organization management functionality.
- Establishing or reactivating the appropriate supplier-company relationship after successful acceptance.

When an invitation is accepted, the service will determine whether the invited company already exists in LINAW.

If the company already exists, the system will associate the existing company with the appropriate supplier identity and establish the relevant supplier-company relationship without creating a duplicate company or user account.

If the company does not exist, the invitation flow will coordinate with the existing authentication and organization registration processes to complete onboarding.

Supplier Management will not independently duplicate the system's authentication, user registration, or company creation workflows.

Creating or resending an invitation will not automatically reactivate a previously deactivated supplier-company relationship. Reactivation will occur only after successful invitation acceptance and the required eligibility checks.

An invitation must be associated with the purchasing company that initiated it so that the system can establish the correct relationship when the invitation is accepted.

Invitation tokens will be unpredictable, time-limited, and validated on the backend. The system will store a cryptographic hash of the token rather than the raw token and will prevent successful acceptance from being replayed.

### 3. Supplier Portal Service

The Portal Service will support supplier-facing procurement operations.

Its responsibilities will include:

- Retrieving the authenticated supplier company's profile.
- Retrieving published RFQs available to that supplier.
- Retrieving RFQ details and associated line items.
- Submitting supplier quotations for eligible RFQs.
- Retrieving quotations submitted by the supplier.
- Retrieving individual quotation details.

The service will derive supplier identity and company context from authenticated and authorized server-side information rather than trusting a supplier identifier supplied by the client.

The service must verify that the supplier is eligible to access the portal, the authenticated user has the required permissions, and the requested RFQ is available to that supplier.

The Portal Service will not own RFQ creation, RFQ publication, quotation selection, or Purchase Order creation. These responsibilities remain within POM.

### Module Structure

The module will follow the existing backend architecture:

**Router → Controller → Service → Repository → Prisma**

Each service will have its own controller, repository, and validation layer where appropriate.

The implementation will follow these responsibilities:

- **Router:** Defines the module's API endpoints.
- **Controller:** Handles HTTP requests, extracts request information, invokes the appropriate service, and formats responses.
- **Service:** Implements business rules and coordinates operations.
- **Repository:** Performs database queries and persistence.
- **Validator:** Validates request parameters, query parameters, and request bodies.

Repository methods should accept structured input objects rather than unnecessarily long lists of positional parameters.

The three services will remain within the existing modular monolith. They will not be deployed as separate services.

## Supplier Identity and Relationship Lifecycle

The system will distinguish between supplier identity, supplier-company relationships, and invitation lifecycle.

### Supplier

The `Supplier` record represents the supplier identity and its overall status within LINAW.

It will be retained when a purchasing company removes the supplier from its supplier list.

### SupplierCompanyRelationship

The `SupplierCompanyRelationship` record represents the relationship between a purchasing company and a supplier.

Deactivating this relationship removes the supplier from that purchasing company's active supplier list and prevents new procurement activity through that relationship, subject to the applicable business rules.

Other companies' relationships with the same supplier remain unaffected.

### SupplierInvitation

The `SupplierInvitation` record represents a specific onboarding invitation and its lifecycle.

Invitation status will not be used as a substitute for supplier status or supplier-company relationship status.

### Reactivation

If a previously deactivated relationship is re-established through an invitation, the system will reactivate the existing relationship when appropriate rather than creating a duplicate relationship.

A globally suspended supplier must not become active merely because an invitation has been accepted.

## Rationale

Consolidating supplier functionality into one module maintains a consistent supplier domain while allowing individual services to remain focused.

This approach:

- Avoids creating separate top-level modules for Supplier Management and the Supplier Portal.
- Reduces duplication of supplier identity and relationship logic.
- Keeps governance, invitations, and portal operations independently maintainable.
- Preserves existing company identities when a company participates in multiple procurement relationships.
- Preserves historical procurement records.
- Prevents one company's supplier removal from affecting unrelated companies.
- Establishes clear ownership of invitation acceptance and relationship reactivation.
- Maintains the existing modular monolithic architecture.

## Consequences

### Positive

- One clear ownership boundary for supplier-related functionality.
- Three focused services with smaller, more maintainable responsibilities.
- Reduced duplication of supplier-related business rules.
- Supplier identities and historical procurement records remain intact.
- Supplier relationships can be managed independently for different companies.
- Existing companies can be onboarded without creating duplicate company records.
- Supplier Portal access can be enforced using authentication, RBAC, supplier eligibility, and relationship status.
- POM retains ownership of procurement execution.

### Negative

- The module requires coordination between governance, invitation, and portal services.
- Invitation acceptance must correctly handle existing and new companies.
- Supplier-company relationship status must be enforced consistently across the application.
- The backend must distinguish supplier eligibility from individual user permissions.
- Additional transactional safeguards are required to prevent duplicate relationships and invitation replay.

## Implementation Notes

- Retain `Supplier.company_id` as the association between a supplier identity and its represented company.
- Retain `SupplierCompanyRelationship.company_id` as the purchasing company in a particular supplier relationship.
- Ensure the invitation model can identify the purchasing company that initiated each invitation.
- Preserve historical quotations, Purchase Orders, goods receipts, invoices, and related procurement records when a relationship is deactivated.
- Use the existing email abstraction for invitation delivery.
- Keep invitation creation, email delivery, token validation, and acceptance within the Invitation Service's responsibilities.
- Validate RFQ eligibility and supplier access on the backend.
- Do not trust client-supplied supplier identifiers as proof of supplier authorization.
- Ensure database operations involving invitation acceptance and relationship creation or reactivation are protected against duplicate or concurrent processing.
- Preserve the established authentication, company membership, RBAC, and repository conventions.

---

# ADR-012: Use Mailgun for Transactional Email Delivery

## Status

Accepted

## Context

LINAW requires transactional email delivery for system-generated messages, including supplier onboarding invitations.

Resend was initially evaluated as the email delivery provider. However, the configured subdomain's DNS record was not successfully detected or verified by Resend, preventing the required email-sending setup from working as intended.

Mailgun was subsequently tested using direct HTTP API requests from the LINAW backend environment. The integration successfully accepted an email for processing and returned a queued response.

Mailgun is therefore a working option for the current email delivery requirements.

The backend also needs to avoid coupling business services directly to a particular email provider so that email delivery can be maintained without rewriting invitation business logic.

## Decision

**Mailgun will be used as LINAW's transactional email delivery provider.**

The backend will send transactional emails through Mailgun's HTTP API.

The existing email service/provider abstraction will be retained so that business services can request email delivery without directly implementing provider-specific HTTP requests.

The Supplier Invitation Service will use the email abstraction to:

- Send newly created supplier invitations.
- Resend eligible supplier invitations.
- Deliver invitation links to their intended recipients.

Email delivery will remain separate from invitation lifecycle management.

The Invitation Service will manage invitation creation, token generation, expiry, validation, and acceptance. The email provider integration will handle communication with Mailgun.

Mailgun API credentials, sending-domain configuration, and other provider-specific settings will be supplied through environment configuration or the appropriate runtime secrets mechanism. Credentials must not be committed to source control or exposed to frontend clients.

A successful provider response indicating that a message has been queued will be treated as successful submission to Mailgun, not as proof that the recipient received or opened the email.

## Rationale

Mailgun has been tested successfully in the current backend environment, while the configured subdomain's DNS record could not be successfully detected or verified by Resend.

Selecting Mailgun provides a working path for implementing supplier invitations without delaying the remaining Supplier Management functionality.

Retaining an email abstraction also avoids coupling invitation business rules to the provider.

This approach:

- Uses a provider that has already been tested successfully.
- Allows supplier invitations to be sent through an HTTP API.
- Keeps provider-specific integration details outside the core invitation lifecycle logic.
- Supports future changes to email delivery without redesigning Supplier Management.
- Keeps provider credentials in server-side configuration.

## Consequences

### Positive

- A working transactional email delivery integration is available for supplier invitations.
- Supplier onboarding can proceed without relying on the unresolved Resend DNS verification.
- Email delivery remains separated from invitation business logic.
- Provider credentials can be managed through runtime secrets.
- Other modules can reuse the existing email abstraction for transactional messages.

### Negative

- LINAW becomes dependent on Mailgun's availability and delivery policies.
- Email delivery requires valid Mailgun configuration and an authorized sending domain.
- Provider errors and delivery failures must be handled by the backend.
- A successful API response does not guarantee delivery to the recipient's inbox.
- Future provider changes may require updates to the email adapter or provider-specific configuration.

## Implementation Notes

- Use Mailgun's HTTP API for transactional email delivery.
- Keep the provider integration behind the existing email service/provider abstraction.
- Use the configured sender identity and domain supported by Mailgun.
- Store Mailgun credentials securely in environment configuration or runtime secrets.
- Do not log API credentials, invitation tokens, or other sensitive information.
- Handle unsuccessful provider responses and network failures explicitly.
- Avoid marking an invitation as successfully delivered merely because the invitation record was created.
- Distinguish invitation creation, email submission, and invitation acceptance in the system's records and business logic.
- Keep invitation expiry and token validation independent of the email provider.
- Treat delivery tracking and retry policies as implementation concerns that can be refined without changing the module architecture.

---