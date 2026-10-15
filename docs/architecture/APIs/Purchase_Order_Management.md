# Purchase Order Management

**---**

## GET /api/purchase-orders/procurement-queue

**### Description**

Retrieve approved Purchase Requisitions that are available for procurement.

This endpoint allows authorized Procurement Officers to identify approved procurement requests that may be used to create RFQs.

Approval of a Purchase Requisition does not automatically create an RFQ.

**### Authentication**

Bearer Token Required

**### Headers**

```text
Authorization: Bearer <access_token>
```

**### Query Parameters**

| Name        | Type   | Required | Description                               |
| ----------- | ------ | -------- | ----------------------------------------- |
| companyId   | string | No       | Filters approved requisitions by company. |
| referenceNo | string | No       | Filters requisitions by reference number. |

**### Success Response (200 OK)**

```json
{
    "success": true,
    "message": "Procurement queue retrieved successfully.",
    "data": {
        "purchase_requisitions": []
    }
}
```

**### Error Responses**

**#### 401 Unauthorized**

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

**#### 403 Forbidden**

```json
{
    "success": false,
    "message": "Insufficient privileges to access the procurement queue."
}
```

**#### 500 Internal Server Error**

```json
{
    "success": false,
    "message": "Internal server error."
}
```

**---**

## POST /api/purchase-orders/rfqs

**### Description**

Create a Request for Quotation based on an approved Purchase Requisition or other valid procurement requirement.

The RFQ is initially created in draft status and must be published separately before supplier responses can be received.

**### Authentication**

Bearer Token Required

**### Headers**

```text
Authorization: Bearer <access_token>
```

**### Request Body**

```json
{
    "purchase_requisition_id": "",
    "company_id": "",
    "title": "",
    "description": "",
    "closing_date": "",
    "items": [
        {
            "purchase_requisition_item_id": "",
            "line_no": 1,
            "description": "",
            "quantity": 0,
            "unit_of_measure": "",
            "specification": ""
        }
    ]
}
```

**### Success Response (201 Created)**

```json
{
    "success": true,
    "message": "Request for quotation created successfully.",
    "data": {
        "rfq_id": "",
        "rfq_number": "",
        "status": "draft"
    }
}
```

**### Error Responses**

**#### 400 Bad Request**

```json
{
    "success": false,
    "message": "Invalid RFQ data."
}
```

**#### 401 Unauthorized**

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

**#### 403 Forbidden**

```json
{
    "success": false,
    "message": "Insufficient privileges to create RFQs."
}
```

**#### 404 Not Found**

```json
{
    "success": false,
    "message": "Purchase requisition or related record not found."
}
```

**#### 409 Conflict**

```json
{
    "success": false,
    "message": "RFQ already exists or the procurement request is in a conflicting state."
}
```

**#### 422 Validation Failed**

```json
{
    "success": false,
    "message": "RFQ validation failed."
}
```

**#### 500 Internal Server Error**

```json
{
    "success": false,
    "message": "Internal server error."
}
```

**---**

## GET /api/purchase-orders/rfqs

**### Description**

List RFQs with optional filtering.

**### Authentication**

Bearer Token Required

**### Headers**

```text
Authorization: Bearer <access_token>
```

**### Query Parameters**

| Name                  | Type   | Required | Description                                       |
| --------------------- | ------ | -------- | ------------------------------------------------- |
| status                | string | No       | Filters RFQs by status.                           |
| companyId             | string | No       | Filters RFQs by company.                          |
| purchaseRequisitionId | string | No       | Filters RFQs by originating Purchase Requisition. |
| referenceNo           | string | No       | Filters RFQs by RFQ number.                       |

**### Success Response (200 OK)**

```json
{
    "success": true,
    "message": "RFQs retrieved successfully.",
    "data": {
        "rfqs": []
    }
}
```

**### Error Responses**

**#### 401 Unauthorized**

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

**#### 403 Forbidden**

```json
{
    "success": false,
    "message": "Insufficient privileges to view RFQs."
}
```

**#### 500 Internal Server Error**

```json
{
    "success": false,
    "message": "Internal server error."
}
```

**---**

## GET /api/purchase-orders/rfqs/:rfqId

**### Description**

Retrieve a specific RFQ and its procurement items.

**### Authentication**

Bearer Token Required

**### Headers**

```text
Authorization: Bearer <access_token>
```

**### Path Parameters**

| Name  | Type   | Required | Description     |
| ----- | ------ | -------- | --------------- |
| rfqId | string | Yes      | RFQ identifier. |

**### Success Response (200 OK)**

```json
{
    "success": true,
    "message": "RFQ retrieved successfully.",
    "data": {
        "rfq_id": "",
        "rfq_number": "",
        "purchase_requisition_id": "",
        "company_id": "",
        "title": "",
        "description": "",
        "status": "draft",
        "issue_date": null,
        "closing_date": "",
        "items": []
    }
}
```

**### Error Responses**

**#### 401 Unauthorized**

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

**#### 403 Forbidden**

```json
{
    "success": false,
    "message": "Insufficient privileges to view RFQ."
}
```

**#### 404 Not Found**

```json
{
    "success": false,
    "message": "RFQ not found."
}
```

**#### 500 Internal Server Error**

```json
{
    "success": false,
    "message": "Internal server error."
}
```

**---**

## PUT /api/purchase-orders/rfqs/:rfqId

**### Description**

Update a draft RFQ.

Published or closed RFQs cannot be freely modified.

**### Authentication**

Bearer Token Required

**### Headers**

```text
Authorization: Bearer <access_token>
```

**### Path Parameters**

| Name  | Type   | Required | Description     |
| ----- | ------ | -------- | --------------- |
| rfqId | string | Yes      | RFQ identifier. |

**### Request Body**

```json
{
    "title": "",
    "description": "",
    "closing_date": "",
    "items": []
}
```

**### Success Response (200 OK)**

```json
{
    "success": true,
    "message": "RFQ updated successfully.",
    "data": {
        "rfq_id": "",
        "rfq_number": "",
        "status": "draft"
    }
}
```

**### Error Responses**

**#### 400 Bad Request**

```json
{
    "success": false,
    "message": "Invalid RFQ update data."
}
```

**#### 401 Unauthorized**

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

**#### 403 Forbidden**

```json
{
    "success": false,
    "message": "Insufficient privileges to update RFQ."
}
```

**#### 404 Not Found**

```json
{
    "success": false,
    "message": "RFQ not found."
}
```

**#### 409 Conflict**

```json
{
    "success": false,
    "message": "RFQ cannot be modified in its current state."
}
```

**#### 422 Validation Failed**

```json
{
    "success": false,
    "message": "RFQ validation failed."
}
```

**#### 500 Internal Server Error**

```json
{
    "success": false,
    "message": "Internal server error."
}
```

**---**

## POST /api/purchase-orders/rfqs/:rfqId/publish

**### Description**

Publish an RFQ to the Supplier Dashboard.

Publishing changes the RFQ from its editable state into the appropriate published state and makes the procurement request available for supplier quotation submission.

This operation does not create supplier accounts or supplier invitations.

**### Authentication**

Bearer Token Required

**### Headers**

```text
Authorization: Bearer <access_token>
```

**### Path Parameters**

| Name  | Type   | Required | Description     |
| ----- | ------ | -------- | --------------- |
| rfqId | string | Yes      | RFQ identifier. |

**### Success Response (200 OK)**

```json
{
    "success": true,
    "message": "RFQ published successfully.",
    "data": {
        "rfq_id": "",
        "rfq_number": "",
        "status": "published",
        "issue_date": ""
    }
}
```

**### Error Responses**

**#### 401 Unauthorized**

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

**#### 403 Forbidden**

```json
{
    "success": false,
    "message": "Insufficient privileges to publish RFQs."
}
```

**#### 404 Not Found**

```json
{
    "success": false,
    "message": "RFQ not found."
}
```

**#### 409 Conflict**

```json
{
    "success": false,
    "message": "RFQ cannot be published in its current state."
}
```

**#### 422 Validation Failed**

```json
{
    "success": false,
    "message": "RFQ is incomplete and cannot be published."
}
```

**#### 500 Internal Server Error**

```json
{
    "success": false,
    "message": "Internal server error."
}
```

**---**

## POST /api/purchase-orders/rfqs/:rfqId/close

**### Description**

Close an RFQ and stop accepting additional supplier quotations.

**### Authentication**

Bearer Token Required

**### Headers**

```text
Authorization: Bearer <access_token>
```

**### Path Parameters**

| Name  | Type   | Required | Description     |
| ----- | ------ | -------- | --------------- |
| rfqId | string | Yes      | RFQ identifier. |

**### Success Response (200 OK)**

```json
{
    "success": true,
    "message": "RFQ closed successfully.",
    "data": {
        "rfq_id": "",
        "rfq_number": "",
        "status": "closed"
    }
}
```

**### Error Responses**

**#### 401 Unauthorized**

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

**#### 403 Forbidden**

```json
{
    "success": false,
    "message": "Insufficient privileges to close RFQs."
}
```

**#### 404 Not Found**

```json
{
    "success": false,
    "message": "RFQ not found."
}
```

**#### 409 Conflict**

```json
{
    "success": false,
    "message": "RFQ cannot be closed in its current state."
}
```

**#### 500 Internal Server Error**

```json
{
    "success": false,
    "message": "Internal server error."
}
```

**---**

## DELETE /api/purchase-orders/rfqs/:rfqId

**### Description**

Delete a draft RFQ where deletion is allowed.

Published or closed RFQs shall not be deleted through this endpoint.

**### Authentication**

Bearer Token Required

**### Headers**

```text
Authorization: Bearer <access_token>
```

**### Path Parameters**

| Name  | Type   | Required | Description     |
| ----- | ------ | -------- | --------------- |
| rfqId | string | Yes      | RFQ identifier. |

**### Success Response (200 OK)**

```json
{
    "success": true,
    "message": "RFQ deleted successfully.",
    "data": {
        "rfq_id": ""
    }
}
```

**### Error Responses**

**#### 401 Unauthorized**

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

**#### 403 Forbidden**

```json
{
    "success": false,
    "message": "Insufficient privileges to delete RFQs."
}
```

**#### 404 Not Found**

```json
{
    "success": false,
    "message": "RFQ not found."
}
```

**#### 409 Conflict**

```json
{
    "success": false,
    "message": "RFQ cannot be deleted in its current state."
}
```

**#### 500 Internal Server Error**

```json
{
    "success": false,
    "message": "Internal server error."
}
```

**---**

## GET /api/purchase-orders/rfqs/:rfqId/quotations

**### Description**

Retrieve supplier quotations submitted against an RFQ.

POM only retrieves quotations submitted through the Supplier Dashboard. Supplier quotation submission is outside the responsibility of POM.

**### Authentication**

Bearer Token Required

**### Headers**

```text
Authorization: Bearer <access_token>
```

**### Path Parameters**

| Name  | Type   | Required | Description     |
| ----- | ------ | -------- | --------------- |
| rfqId | string | Yes      | RFQ identifier. |

**### Query Parameters**

| Name   | Type   | Required | Description                   |
| ------ | ------ | -------- | ----------------------------- |
| status | string | No       | Filters quotations by status. |

**### Success Response (200 OK)**

```json
{
    "success": true,
    "message": "Quotations retrieved successfully.",
    "data": {
        "quotations": []
    }
}
```

**### Error Responses**

**#### 401 Unauthorized**

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

**#### 403 Forbidden**

```json
{
    "success": false,
    "message": "Insufficient privileges to view quotations."
}
```

**#### 404 Not Found**

```json
{
    "success": false,
    "message": "RFQ not found."
}
```

**#### 500 Internal Server Error**

```json
{
    "success": false,
    "message": "Internal server error."
}
```

**---**

## GET /api/purchase-orders/rfqs/:rfqId/quotations/:quotationId

**### Description**

Retrieve a specific supplier quotation and its quotation items for evaluation.

**### Authentication**

Bearer Token Required

**### Headers**

```text
Authorization: Bearer <access_token>
```

**### Path Parameters**

| Name        | Type   | Required | Description                    |
| ----------- | ------ | -------- | ------------------------------ |
| rfqId       | string | Yes      | RFQ identifier.                |
| quotationId | string | Yes      | Supplier quotation identifier. |

**### Success Response (200 OK)**

```json
{
    "success": true,
    "message": "Quotation retrieved successfully.",
    "data": {
        "quotation_id": "",
        "quotation_number": "",
        "supplier_id": "",
        "rfq_id": "",
        "currency_code": "",
        "total_amount": 0,
        "status": "submitted",
        "submitted_at": "",
        "valid_until": "",
        "items": []
    }
}
```

**### Error Responses**

**#### 401 Unauthorized**

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

**#### 403 Forbidden**

```json
{
    "success": false,
    "message": "Insufficient privileges to view quotation."
}
```

**#### 404 Not Found**

```json
{
    "success": false,
    "message": "Quotation or RFQ not found."
}
```

**#### 409 Conflict**

```json
{
    "success": false,
    "message": "Quotation does not belong to the specified RFQ."
}
```

**#### 500 Internal Server Error**

```json
{
    "success": false,
    "message": "Internal server error."
}
```

**---**

## POST /api/purchase-orders/rfqs/:rfqId/quotations/:quotationId/select

**### Description**

Select a submitted supplier quotation for the procurement transaction.

The selected quotation becomes the basis for creating the Purchase Order.

POM records the Procurement Officer's selection but does not automatically select a quotation based solely on price.

**### Authentication**

Bearer Token Required

**### Headers**

```text
Authorization: Bearer <access_token>
```

**### Path Parameters**

| Name        | Type   | Required | Description                    |
| ----------- | ------ | -------- | ------------------------------ |
| rfqId       | string | Yes      | RFQ identifier.                |
| quotationId | string | Yes      | Supplier quotation identifier. |

**### Request Body**

```json
{
    "remarks": ""
}
```

**### Success Response (200 OK)**

```json
{
    "success": true,
    "message": "Quotation selected successfully.",
    "data": {
        "rfq_id": "",
        "quotation_id": "",
        "status": "selected"
    }
}
```

**### Error Responses**

**#### 401 Unauthorized**

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

**#### 403 Forbidden**

```json
{
    "success": false,
    "message": "Insufficient privileges to select quotations."
}
```

**#### 404 Not Found**

```json
{
    "success": false,
    "message": "RFQ or quotation not found."
}
```

**#### 409 Conflict**

```json
{
    "success": false,
    "message": "Quotation cannot be selected in its current state."
}
```

**#### 422 Validation Failed**

```json
{
    "success": false,
    "message": "Quotation selection validation failed."
}
```

**#### 500 Internal Server Error**

```json
{
    "success": false,
    "message": "Internal server error."
}
```

**---**

## POST /api/purchase-orders

**### Description**

Create a Purchase Order based on a selected supplier quotation.

The Purchase Order must maintain its relationship to the selected quotation and originating RFQ.

**### Authentication**

Bearer Token Required

**### Headers**

```text
Authorization: Bearer <access_token>
```

**### Request Body**

```json
{
    "rfq_id": "",
    "quotation_id": "",
    "company_id": "",
    "order_date": "",
    "line_items": []
}
```

**### Success Response (201 Created)**

```json
{
    "success": true,
    "message": "Purchase order created successfully.",
    "data": {
        "po_id": "",
        "po_number": "",
        "rfq_id": "",
        "quotation_id": "",
        "supplier_id": "",
        "status": "draft",
        "total_amount": 0
    }
}
```

**### Error Responses**

**#### 400 Bad Request**

```json
{
    "success": false,
    "message": "Invalid purchase order data."
}
```

**#### 401 Unauthorized**

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

**#### 403 Forbidden**

```json
{
    "success": false,
    "message": "Insufficient privileges to create purchase orders."
}
```

**#### 404 Not Found**

```json
{
    "success": false,
    "message": "RFQ or selected quotation not found."
}
```

**#### 409 Conflict**

```json
{
    "success": false,
    "message": "Purchase order already exists or the selected quotation is in a conflicting state."
}
```

**#### 422 Validation Failed**

```json
{
    "success": false,
    "message": "Purchase order validation failed."
}
```

**#### 500 Internal Server Error**

```json
{
    "success": false,
    "message": "Internal server error."
}
```

**---**

## GET /api/purchase-orders

**### Description**

List Purchase Orders with optional filtering.

**### Authentication**

Bearer Token Required

**### Headers**

```text
Authorization: Bearer <access_token>
```

**### Query Parameters**

| Name        | Type   | Required | Description                                  |
| ----------- | ------ | -------- | -------------------------------------------- |
| status      | string | No       | Filters Purchase Orders by status.           |
| supplierId  | string | No       | Filters Purchase Orders by supplier.         |
| companyId   | string | No       | Filters Purchase Orders by company.          |
| rfqId       | string | No       | Filters Purchase Orders by RFQ.              |
| referenceNo | string | No       | Filters Purchase Orders by reference number. |

**### Success Response (200 OK)**

```json
{
    "success": true,
    "message": "Purchase orders retrieved successfully.",
    "data": {
        "purchase_orders": []
    }
}
```

**### Error Responses**

**#### 401 Unauthorized**

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

**#### 403 Forbidden**

```json
{
    "success": false,
    "message": "Insufficient privileges to view purchase orders."
}
```

**#### 500 Internal Server Error**

```json
{
    "success": false,
    "message": "Internal server error."
}
```

**---**

## GET /api/purchase-orders/:poId

**### Description**

Retrieve a Purchase Order and its procurement references.

**### Authentication**

Bearer Token Required

**### Headers**

```text
Authorization: Bearer <access_token>
```

**### Path Parameters**

| Name | Type   | Required | Description                |
| ---- | ------ | -------- | -------------------------- |
| poId | string | Yes      | Purchase Order identifier. |

**### Success Response (200 OK)**

```json
{
    "success": true,
    "message": "Purchase order retrieved successfully.",
    "data": {
        "po_id": "",
        "po_number": "",
        "supplier_id": "",
        "company_id": "",
        "rfq_id": "",
        "quotation_id": "",
        "order_date": "",
        "status": "",
        "total_amount": 0,
        "line_items": []
    }
}
```

**### Error Responses**

**#### 401 Unauthorized**

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

**#### 403 Forbidden**

```json
{
    "success": false,
    "message": "Insufficient privileges to view purchase order."
}
```

**#### 404 Not Found**

```json
{
    "success": false,
    "message": "Purchase order not found."
}
```

**#### 500 Internal Server Error**

```json
{
    "success": false,
    "message": "Internal server error."
}
```

**---**

## PUT /api/purchase-orders/:poId

**### Description**

Update an editable Purchase Order.

Purchase Orders that have entered a non-editable lifecycle state shall not be freely modified.

**### Authentication**

Bearer Token Required

**### Headers**

```text
Authorization: Bearer <access_token>
```

**### Path Parameters**

| Name | Type   | Required | Description                |
| ---- | ------ | -------- | -------------------------- |
| poId | string | Yes      | Purchase Order identifier. |

**### Request Body**

```json
{
    "order_date": "",
    "line_items": []
}
```

**### Success Response (200 OK)**

```json
{
    "success": true,
    "message": "Purchase order updated successfully.",
    "data": {
        "po_id": "",
        "po_number": "",
        "status": "",
        "total_amount": 0
    }
}
```

**### Error Responses**

**#### 400 Bad Request**

```json
{
    "success": false,
    "message": "Invalid purchase order update data."
}
```

**#### 401 Unauthorized**

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

**#### 403 Forbidden**

```json
{
    "success": false,
    "message": "Insufficient privileges to update purchase orders."
}
```

**#### 404 Not Found**

```json
{
    "success": false,
    "message": "Purchase order not found."
}
```

**#### 409 Conflict**

```json
{
    "success": false,
    "message": "Purchase order cannot be modified in its current state."
}
```

**#### 422 Validation Failed**

```json
{
    "success": false,
    "message": "Purchase order validation failed."
}
```

**#### 500 Internal Server Error**

```json
{
    "success": false,
    "message": "Internal server error."
}
```

**---**

## DELETE /api/purchase-orders/:poId

**### Description**

Delete a Purchase Order where deletion is allowed.

Only editable or draft Purchase Orders may be deleted according to the module's business rules.

**### Authentication**

Bearer Token Required

**### Headers**

```text
Authorization: Bearer <access_token>
```

**### Path Parameters**

| Name | Type   | Required | Description                |
| ---- | ------ | -------- | -------------------------- |
| poId | string | Yes      | Purchase Order identifier. |

**### Success Response (200 OK)**

```json
{
    "success": true,
    "message": "Purchase order deleted successfully.",
    "data": {
        "po_id": ""
    }
}
```

**### Error Responses**

**#### 401 Unauthorized**

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

**#### 403 Forbidden**

```json
{
    "success": false,
    "message": "Insufficient privileges to delete purchase orders."
}
```

**#### 404 Not Found**

```json
{
    "success": false,
    "message": "Purchase order not found."
}
```

**#### 409 Conflict**

```json
{
    "success": false,
    "message": "Purchase order cannot be deleted in its current state."
}
```

**#### 500 Internal Server Error**

```json
{
    "success": false,
    "message": "Internal server error."
}
```

**---**
