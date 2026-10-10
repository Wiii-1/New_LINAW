# Supplier Management API Design

---

# 1. Supplier Governance

## POST /api/suppliers/search

### Description

Not required. Supplier listing and filtering use `GET /api/suppliers` with query parameters.

## GET /api/suppliers

### Description

Retrieve suppliers associated with the authenticated user's active company. Supports searching and filtering supplier relationships.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Query Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `name` | string | No | Filters suppliers by legal or display name. |
| `status` | string | No | Filters by supported supplier status. |
| `relationship_status` | string | No | Filters by relationship status for the active company. |
| `page` | integer | No | Page number for pagination. |
| `limit` | integer | No | Maximum number of records returned per page. |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Suppliers retrieved successfully.",
  "data": {
    "suppliers": [
      {
        "supplier_id": "",
        "supplier_code": "",
        "company_id": "",
        "legal_name": "",
        "display_name": "",
        "contact_email": "",
        "contact_phone": "",
        "address": "",
        "supplier_status": "",
        "relationship_status": ""
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "total_pages": 0
    }
  }
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid supplier search parameters."
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized access."
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "message": "You are not authorized to manage suppliers for this company."
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error."
}
```

---

## GET /api/suppliers/:supplierId

### Description

Retrieve the details of a supplier associated with the authenticated user's active company.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `supplierId` | string | Yes | Identifier of the supplier. |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Supplier details retrieved successfully.",
  "data": {
    "supplier_id": "",
    "supplier_code": "",
    "company_id": "",
    "legal_name": "",
    "display_name": "",
    "tax_id": "",
    "contact_email": "",
    "contact_phone": "",
    "address": "",
    "supplier_status": "",
    "relationship": {
      "relationship_id": "",
      "relationship_status": ""
    },
    "created_at": "",
    "updated_at": ""
  }
}
```

### Error Responses

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized access."
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "message": "You are not authorized to access this supplier."
}
```

#### 404 Not Found

```json
{
  "success": false,
  "message": "Supplier not found."
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error."
}
```

---

## DELETE /api/suppliers/:supplierId/relationship

### Description

Deactivate the relationship between the authenticated user's active company and the specified supplier.

This operation does not delete the supplier identity or its historical procurement records.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `supplierId` | string | Yes | Identifier of the supplier whose relationship will be deactivated. |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Supplier relationship deactivated successfully.",
  "data": {
    "supplier_id": "",
    "relationship_id": "",
    "relationship_status": "INACTIVE"
  }
}
```

### Error Responses

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized access."
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "message": "You are not authorized to remove this supplier relationship."
}
```

#### 404 Not Found

```json
{
  "success": false,
  "message": "Supplier relationship not found."
}
```

#### 409 Conflict

```json
{
  "success": false,
  "message": "Supplier relationship is already inactive."
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error."
}
```

---

# 2. Supplier Invitations

## POST /api/supplier-invitations

### Description

Create a supplier invitation for a company and send the invitation link through the configured email service.

The invitation records which purchasing company initiated the invitation. The invitation does not activate a supplier relationship or grant portal access until acceptance is completed successfully.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body

```json
{
  "email": "",
  "expires_at": ""
}
```

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Supplier invitation created successfully.",
  "data": {
    "invitation_id": "",
    "email": "",
    "invitation_status": "SENT",
    "expires_at": "",
    "created_at": ""
  }
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid supplier invitation data."
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized access."
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "message": "You are not authorized to invite suppliers for this company."
}
```

#### 409 Conflict

```json
{
  "success": false,
  "message": "A conflicting supplier invitation or relationship already exists."
}
```

#### 422 Validation Failed

```json
{
  "success": false,
  "message": "Supplier invitation validation failed."
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error."
}
```

#### 503 Service Unavailable

```json
{
  "success": false,
  "message": "The invitation email could not be delivered because the email service is unavailable."
}
```

---

## GET /api/supplier-invitations

### Description

Retrieve supplier invitations created by or associated with the authenticated user's active company.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Query Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `status` | string | No | Filters invitations by lifecycle status. |
| `email` | string | No | Filters invitations by recipient email. |
| `page` | integer | No | Page number for pagination. |
| `limit` | integer | No | Maximum number of records returned per page. |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Supplier invitations retrieved successfully.",
  "data": {
    "invitations": [
      {
        "invitation_id": "",
        "email": "",
        "invitation_status": "",
        "expires_at": "",
        "accepted_at": "",
        "created_at": ""
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "total_pages": 0
    }
  }
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid invitation search parameters."
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized access."
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "message": "You are not authorized to view these invitations."
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error."
}
```

---

## GET /api/supplier-invitations/:invitationId

### Description

Retrieve the details and current lifecycle status of a supplier invitation.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `invitationId` | string | Yes | Identifier of the supplier invitation. |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Supplier invitation retrieved successfully.",
  "data": {
    "invitation_id": "",
    "email": "",
    "invitation_status": "",
    "expires_at": "",
    "accepted_at": "",
    "created_at": "",
    "updated_at": ""
  }
}
```

### Error Responses

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized access."
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "message": "You are not authorized to access this invitation."
}
```

#### 404 Not Found

```json
{
  "success": false,
  "message": "Supplier invitation not found."
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error."
}
```

---

## POST /api/supplier-invitations/:invitationId/resend

### Description

Resend an eligible supplier invitation or issue a replacement invitation according to the invitation lifecycle rules.

Resending an invitation must not activate an inactive supplier relationship.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `invitationId` | string | Yes | Identifier of the invitation to resend. |

### Request Body

```json
{
  "expires_at": ""
}
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Supplier invitation resent successfully.",
  "data": {
    "invitation_id": "",
    "email": "",
    "invitation_status": "SENT",
    "expires_at": ""
  }
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid invitation resend request."
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized access."
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "message": "You are not authorized to resend this invitation."
}
```

#### 404 Not Found

```json
{
  "success": false,
  "message": "Supplier invitation not found."
}
```

#### 409 Conflict

```json
{
  "success": false,
  "message": "The invitation cannot be resent in its current state."
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error."
}
```

#### 503 Service Unavailable

```json
{
  "success": false,
  "message": "The invitation email service is unavailable."
}
```

---

## GET /api/supplier-invitations/validate/:token

### Description

Validate an invitation token and determine the permitted onboarding path.

The endpoint identifies whether the invitee should continue through existing-company acceptance or new-company registration. It does not accept the invitation or activate a supplier relationship.

### Authentication

No Bearer Token Required for initial invitation validation.

The subsequent acceptance operation must verify the invitee's identity or registration context.

### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `token` | string | Yes | Raw invitation token received through the invitation link. |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Supplier invitation is valid.",
  "data": {
    "invitation_id": "",
    "invitation_status": "PENDING",
    "expires_at": "",
    "onboarding_action": "EXISTING_COMPANY"
  }
}
```

`onboarding_action` indicates the next step, such as `EXISTING_COMPANY` or `REGISTER_COMPANY`.

The response must not expose the token hash, private company information, or sensitive invitation metadata.

### Error Responses

#### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid invitation token."
}
```

#### 404 Not Found

```json
{
  "success": false,
  "message": "Supplier invitation not found."
}
```

#### 409 Conflict

```json
{
  "success": false,
  "message": "The invitation has already been accepted or cancelled."
}
```

#### 410 Gone

```json
{
  "success": false,
  "message": "Supplier invitation link expired."
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error."
}
```

---

## POST /api/supplier-invitations/:invitationId/accept

### Description

Accept a valid supplier invitation and establish or reactivate the company-supplier relationship.

For an existing company, the operation associates the existing company with the supplier relationship. It must not create a duplicate company or user account.

For a new company, onboarding must be coordinated with the existing authentication and company management workflows.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `invitationId` | string | Yes | Identifier of the invitation being accepted. |

### Request Body

```json
{
  "invitationtoken": "",
  "company_id": ""
}
```

`company_id` identifies the invitee's existing company when the existing-company path is used. The backend must verify that the authenticated user is authorized to accept the invitation for that company.

For a new company, the registration process must use the existing onboarding workflow rather than assuming an existing `company_id`.

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Supplier invitation accepted successfully.",
  "data": {
    "invitation_id": "",
    "company_id": "",
    "supplier_id": "",
    "relationship_id": "",
    "invitation_status": "ACCEPTED",
    "relationship_status": "ACTIVE"
  }
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid supplier invitation acceptance data."
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized access."
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "message": "The authenticated user is not authorized to accept this invitation for the specified company."
}
```

#### 404 Not Found

```json
{
  "success": false,
  "message": "Supplier invitation or company not found."
}
```

#### 409 Conflict

```json
{
  "success": false,
  "message": "The invitation has already been accepted or is in a conflicting state."
}
```

#### 410 Gone

```json
{
  "success": false,
  "message": "Supplier invitation link expired."
}
```

#### 422 Validation Failed

```json
{
  "success": false,
  "message": "Supplier invitation acceptance validation failed."
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error."
}
```

---

# 3. Supplier Portal

## GET /api/supplier-portal/profile

### Description

Retrieve the supplier profile associated with the authenticated user's active company.

Portal access is available only when the active company satisfies supplier eligibility requirements.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Supplier profile retrieved successfully.",
  "data": {
    "supplier_id": "",
    "company_id": "",
    "supplier_code": "",
    "legal_name": "",
    "display_name": "",
    "tax_id": "",
    "contact_email": "",
    "contact_phone": "",
    "address": "",
    "supplier_status": ""
  }
}
```

### Error Responses

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized access."
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "message": "The active company is not eligible to access the supplier portal."
}
```

#### 404 Not Found

```json
{
  "success": false,
  "message": "Supplier profile not found."
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error."
}
```

---

## PUT /api/supplier-portal/profile

### Description

Update permitted supplier contact and profile information for the authenticated supplier company.

Company identity fields and supplier eligibility status must not be changed through this endpoint unless explicitly permitted by the organization's business rules.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body

```json
{
  "contact_email": "",
  "contact_phone": "",
  "address": ""
}
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Supplier profile updated successfully.",
  "data": {
    "supplier_id": "",
    "company_id": "",
    "contact_email": "",
    "contact_phone": "",
    "address": "",
    "updated_at": ""
  }
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid supplier profile update data."
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized access."
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "message": "You are not authorized to update this supplier profile."
}
```

#### 404 Not Found

```json
{
  "success": false,
  "message": "Supplier profile not found."
}
```

#### 422 Validation Failed

```json
{
  "success": false,
  "message": "Supplier profile validation failed."
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error."
}
```

---

## GET /api/supplier-portal/rfqs

### Description

Retrieve RFQs available to the authenticated supplier company.

Only RFQs that are published, open for quotation submission, and available to the supplier may be returned.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Query Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `status` | string | No | Filters RFQs by supported status. |
| `page` | integer | No | Page number for pagination. |
| `limit` | integer | No | Maximum number of records returned per page. |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Available RFQs retrieved successfully.",
  "data": {
    "rfqs": [
      {
        "rfq_id": "",
        "rfq_number": "",
        "title": "",
        "description": "",
        "status": "PUBLISHED",
        "issue_date": "",
        "closing_date": "",
        "quotation_submitted": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "total_pages": 0
    }
  }
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid RFQ search parameters."
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized access."
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "message": "The active company is not eligible to access supplier RFQs."
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error."
}
```

---

## GET /api/supplier-portal/rfqs/:rfqId

### Description

Retrieve the details and line items of an RFQ available to the authenticated supplier company.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `rfqId` | string | Yes | Identifier of the RFQ. |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "RFQ details retrieved successfully.",
  "data": {
    "rfq_id": "",
    "rfq_number": "",
    "title": "",
    "description": "",
    "status": "PUBLISHED",
    "issue_date": "",
    "closing_date": "",
    "quotation_submitted": false,
    "rfq_items": [
      {
        "rfq_item_id": "",
        "line_no": 1,
        "item_description": "",
        "quantity": 0,
        "unit_of_measure": "",
        "specification": ""
      }
    ]
  }
}
```

### Error Responses

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized access."
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "message": "The supplier is not authorized to access this RFQ."
}
```

#### 404 Not Found

```json
{
  "success": false,
  "message": "RFQ not found."
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error."
}
```

---

## POST /api/supplier-portal/rfqs/:rfqId/quotations

### Description

Submit a quotation for an RFQ that is available to the authenticated supplier company.

The supplier identity and company context are derived from the authenticated user's authorized context. The client cannot choose an arbitrary supplier identity.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `rfqId` | string | Yes | Identifier of the RFQ being quoted. |

### Request Body

```json
{
  "currency_code": "",
  "valid_until": "",
  "items": [
    {
      "rfq_item_id": "",
      "quoted_quantity": 0,
      "unit_price": 0,
      "lead_time_days": 0,
      "remarks": ""
    }
  ]
}
```

The submitted quotation items reference existing RFQ items. The backend calculates or validates each line total and the quotation total according to the established pricing rules.

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Quotation submitted successfully.",
  "data": {
    "quotation_id": "",
    "quotation_number": "",
    "rfq_id": "",
    "supplier_id": "",
    "company_id": "",
    "currency_code": "",
    "total_amount": 0,
    "status": "SUBMITTED",
    "submitted_at": "",
    "items": [
      {
        "quotation_item_id": "",
        "rfq_item_id": "",
        "quoted_quantity": 0,
        "unit_price": 0,
        "total_price": 0,
        "lead_time_days": 0
      }
    ]
  }
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid quotation submission data."
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized access."
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "message": "The supplier is not authorized to submit a quotation for this RFQ."
}
```

#### 404 Not Found

```json
{
  "success": false,
  "message": "RFQ or referenced RFQ item not found."
}
```

#### 409 Conflict

```json
{
  "success": false,
  "message": "A quotation already exists for this supplier and RFQ, or the RFQ is no longer accepting quotations."
}
```

#### 422 Validation Failed

```json
{
  "success": false,
  "message": "Quotation validation failed."
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error."
}
```

---

## GET /api/supplier-portal/quotations

### Description

Retrieve quotations submitted by the authenticated supplier company.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Query Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `rfqId` | string | No | Filters quotations by RFQ. |
| `status` | string | No | Filters quotations by supported quotation status. |
| `page` | integer | No | Page number for pagination. |
| `limit` | integer | No | Maximum number of records returned per page. |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Supplier quotations retrieved successfully.",
  "data": {
    "quotations": [
      {
        "quotation_id": "",
        "quotation_number": "",
        "rfq_id": "",
        "currency_code": "",
        "total_amount": 0,
        "status": "",
        "submitted_at": "",
        "valid_until": ""
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "total_pages": 0
    }
  }
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid quotation search parameters."
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized access."
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "message": "Supplier portal access is not allowed."
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error."
}
```

---

## GET /api/supplier-portal/quotations/:quotationId

### Description

Retrieve the details and line items of a quotation submitted by the authenticated supplier company.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `quotationId` | string | Yes | Identifier of the quotation. |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Supplier quotation retrieved successfully.",
  "data": {
    "quotation_id": "",
    "quotation_number": "",
    "rfq_id": "",
    "supplier_id": "",
    "company_id": "",
    "currency_code": "",
    "total_amount": 0,
    "status": "",
    "submitted_at": "",
    "valid_until": "",
    "items": [
      {
        "quotation_item_id": "",
        "rfq_item_id": "",
        "quoted_quantity": 0,
        "unit_price": 0,
        "total_price": 0,
        "lead_time_days": 0,
        "remarks": ""
      }
    ]
  }
}
```

### Error Responses

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized access."
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "message": "You are not authorized to access this quotation."
}
```

#### 404 Not Found

```json
{
  "success": false,
  "message": "Quotation not found."
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error."
}
```

---

## GET /api/supplier-portal/orders

### Description

Retrieve purchase orders issued to the authenticated supplier company.

Purchase orders remain managed by POM. This endpoint provides supplier-facing read access to the supplier's own orders.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Query Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `status` | string | No | Filters orders by supported purchase order status. |
| `page` | integer | No | Page number for pagination. |
| `limit` | integer | No | Maximum number of records returned per page. |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Supplier purchase orders retrieved successfully.",
  "data": {
    "purchase_orders": [
      {
        "purchase_order_id": "",
        "po_number": "",
        "rfq_id": "",
        "quotation_id": "",
        "status": "",
        "currency_code": "",
        "total_amount": 0,
        "issued_at": ""
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "total_pages": 0
    }
  }
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid purchase order search parameters."
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized access."
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "message": "Supplier portal access is not allowed."
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error."
}
```