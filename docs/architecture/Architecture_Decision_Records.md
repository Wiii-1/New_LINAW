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

# ADR-009: Integrate RFQ Creation and Posting into the Approval Workflow

## Status

Accepted

## Context

The Procurement Approval System requires Procurement Officers to create and post Requests for Quotations (RFQs) after a procurement request has been approved.

Initially, RFQ creation and posting could be implemented as a separate module or as an independent function within the Supplier or Procurement dashboard. However, this would require Procurement Officers to navigate away from the approval workflow, locate the approved request again, and manually initiate the RFQ process.

This would introduce unnecessary navigation and may result in duplicate data entry, since much of the information required for an RFQ is already available in the approved procurement request.

The procurement process naturally follows a sequence where an approved request proceeds to supplier sourcing through an RFQ before quotations are evaluated and a supplier is selected.

## Decision

RFQ creation and posting will be integrated directly into the **Approval Workflow** as the next available action for the Procurement Officer after a procurement request has been approved.

Once a request is approved, the Procurement Officer will be provided with an action to **Create RFQ**. The RFQ form will use relevant information from the approved procurement request to minimize duplicate data entry.

The resulting workflow will be:

**Procurement Request → Approval → Create RFQ → Post RFQ → Receive Quotations → Evaluate Quotations → Select Supplier → Create Purchase Order**

RFQ functionality will remain logically separated as its own business entity in the system, while its creation and posting will be initiated through the approval workflow.

## Rationale

Integrating RFQ creation into the approval workflow provides a more direct representation of the procurement process.

This approach:

- Reduces unnecessary navigation between modules or interfaces.
- Allows Procurement Officers to immediately proceed with sourcing after approval.
- Reuses information from the approved procurement request.
- Reduces duplicate data entry and potential data inconsistencies.
- Provides a clear transition from procurement approval to supplier sourcing.
- Keeps the system interface focused on the actual responsibilities of the Procurement Officer.
- Avoids introducing an additional top-level module solely for RFQ creation and posting.
- Maintains flexibility for RFQs to have their own lifecycle, status, suppliers, quotations, and audit records.

The Supplier Dashboard will remain focused on supplier-side activities, such as viewing available RFQs, submitting quotations, receiving purchase orders, and tracking orders. RFQ creation and posting will remain a Procurement Officer responsibility.

## Consequences

### Positive

- More streamlined procurement workflow.
- Reduced navigation for Procurement Officers.
- Reduced duplicate data entry.
- Better reuse of approved procurement request information.
- Clear separation between buyer-side and supplier-side responsibilities.
- Fewer top-level modules and simpler system navigation.
- Easier tracking of the relationship between procurement requests and their resulting RFQs.

### Negative

- The Approval Workflow interface will have additional functionality.
- The workflow may become more complex as additional procurement actions are introduced.
- The system must ensure that only eligible and approved requests can be used to create RFQs.
- RFQ lifecycle management must still be implemented separately from the approval process.

## Workflow

```text
Procurement Request
        |
        v
Approval Workflow
        |
        v
Procurement Officer Approves Request
        |
        v
     Create RFQ
        |
        v
   Review RFQ Details
        |
        v
     Select Suppliers
        |
        v
      Post RFQ
        |
        v
Suppliers Submit Quotations
        |
        v
Evaluate / Compare Quotations
        |
        v
   Select Supplier
        |
        v
   Create Purchase Order
```

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

---