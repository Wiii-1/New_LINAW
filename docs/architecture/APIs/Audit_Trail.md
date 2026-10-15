# Audit Trail API Design (V1)

## Overview

The Audit Trail module records finalized procurement lifecycle events, generates cryptographic hashes from immutable snapshots, anchors the hash into the blockchain network, and allows authorized users to verify transaction integrity.

The V1 implementation focuses on completed purchase orders as the primary audited record.

---

# Endpoints

---

# GET /api/audit-trails

## Description

Retrieve audit trail records with optional filtering.

## Authentication

Bearer Token Required

```text
Authorization: Bearer <access_token>
```

## Query Parameters

| Name        | Type   | Required | Description                                            |
| ----------- | ------ | -------- | ------------------------------------------------------ |
| entity_type | string | No       | Filter by audited entity type. Example: PURCHASE_ORDER |
| action      | string | No       | Filter by audit action. Example: COMPLETED             |
| result      | string | No       | Filter by audit result. Example: SUCCESS               |

## Success Response

### 200 OK

```json
{
    "success": true,
    "message": "Audit trails retrieved successfully.",
    "data": {
        "audit_trails": []
    }
}
```

## Error Responses

### 401 Unauthorized

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

### 403 Forbidden

```json
{
    "success": false,
    "message": "Insufficient privileges to view audit trails."
}
```

### 500 Internal Server Error

```json
{
    "success": false,
    "message": "Internal server error."
}
```

---

# GET /api/audit-trails/:auditId

## Description

Retrieve a specific audit trail record.

## Authentication

Bearer Token Required

```text
Authorization: Bearer <access_token>
```

## Path Parameters

| Name    | Type   | Required | Description            |
| ------- | ------ | -------- | ---------------------- |
| auditId | string | Yes      | Audit trail identifier |

## Success Response

### 200 OK

```json
{
    "success": true,
    "message": "Audit trail retrieved successfully.",
    "data": {
        "audit_id": "",
        "entity_type": "PURCHASE_ORDER",
        "entity_id": "",
        "action": "COMPLETED",
        "result": "SUCCESS",
        "snapshot": {},
        "hash": {
            "algorithm": "SHA256",
            "value": ""
        },
        "blockchain_reference": {
            "transaction_hash": "",
            "block_number": "",
            "anchored_at": ""
        },
        "created_at": ""
    }
}
```

## Error Responses

### 401 Unauthorized

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

### 404 Not Found

```json
{
    "success": false,
    "message": "Audit trail record not found."
}
```

### 500 Internal Server Error

```json
{
    "success": false,
    "message": "Internal server error."
}
```

---

# GET /api/audit-trails/:auditId/verify

## Description

Verify whether the current audit record matches the blockchain anchored hash.

The system will:

1. Retrieve stored audit snapshot.
2. Generate a new hash from the current audit data.
3. Retrieve the blockchain anchored hash through the blockchain adapter.
4. Compare both hashes.
5. Return the integrity result.

## Authentication

Bearer Token Required

```text
Authorization: Bearer <access_token>
```

## Path Parameters

| Name    | Type   | Required | Description            |
| ------- | ------ | -------- | ---------------------- |
| auditId | string | Yes      | Audit trail identifier |

## Success Response

### 200 OK

```json
{
    "success": true,
    "message": "Audit verification completed.",
    "data": {
        "audit_id": "",
        "database_hash": "",
        "blockchain_hash": "",
        "integrity_status": "VALID"
    }
}
```

## Error Responses

### 404 Not Found

```json
{
    "success": false,
    "message": "Audit trail record not found."
}
```

### 422 Validation Failed

```json
{
    "success": false,
    "message": "Audit integrity verification failed."
}
```

### 503 Service Unavailable

```json
{
    "success": false,
    "message": "Blockchain service unavailable."
}
```

---

# POST /api/audit-trails

## Description

Create an audit trail record from a completed procurement transaction.

This endpoint is intended for internal module communication.

Example trigger:

* Purchase Order status changed to COMPLETED.

The Audit Trail module will:

1. Receive completed transaction information.
2. Query required transaction details.
3. Create a transaction snapshot.
4. Generate SHA-256 hash.
5. Store audit trail and hash.
6. Submit hash to blockchain adapter.
7. Store blockchain reference.

## Authentication

Internal Service Authentication Required

## Request Body

```json
{
    "tenant_id": "",
    "actor_user_id": "",
    "entity_type": "PURCHASE_ORDER",
    "entity_id": "",
    "action": "COMPLETED",
    "result": "SUCCESS",
    "request_id": ""
}
```

## Success Response

### 201 Created

```json
{
    "success": true,
    "message": "Audit trail created successfully.",
    "data": {
        "audit_id": "",
        "hash_value": "",
        "blockchain_transaction_hash": "",
        "block_number": "",
        "anchored_at": ""
    }
}
```

---

# Blockchain Adapter Contract

The Audit Trail service does not directly communicate with Besu.

Flow:

```
Audit Trail Service
        |
        v
Blockchain Adapter
        |
        v
Hyperledger Besu
```

The adapter receives:

```json
{
    "audit_id": "",
    "hash_value": "",
    "event_type": "PURCHASE_ORDER_COMPLETED"
}
```

The blockchain adapter submits the transaction to Besu.

The adapter returns:

```json
{
    "transaction_hash": "",
    "block_number": "",
    "anchored_at": ""
}
```

The returned blockchain reference is stored in:

```
audit_trail_blockchain_refs
```

---

# Validation Rules

## entity_type

Must match supported audited records.

Current supported:

```
PURCHASE_ORDER
```

---

## action

Must represent a valid procurement lifecycle event.

Examples:

```
COMPLETED
APPROVED
DELIVERED
PAID
```

---

## snapshot

Must contain finalized transaction data used for hashing.

Example:

```json
{
    "purchase_order_id": "",
    "po_number": "",
    "supplier": {},
    "items": [],
    "total_amount": "",
    "completed_at": ""
}
```

---

## hash_value

Generated internally.

Clients cannot provide or modify the hash.

---

## blockchain_reference

Created only after successful blockchain anchoring.

Fields:

```
transaction_hash
block_number
anchored_at
```

are system-managed.

---

# Database Tables

## audit_trails

Stores the main audit record.

Contains:

* audit identifier
* affected entity type
* affected entity ID
* performed action
* result
* user responsible
* transaction snapshot
* creation timestamp

---

## audit_trail_hashes

Stores generated cryptographic hashes.

Contains:

* audit identifier
* hashing algorithm
* generated hash value
* creation timestamp

---

## audit_trail_blockchain_refs

Stores blockchain anchoring information.

Contains:

* audit identifier
* blockchain transaction hash
* block number
* anchoring timestamp

---

# Error Codes

| Code | Description                                 |
| ---- | ------------------------------------------- |
| 400  | Invalid audit request                       |
| 401  | Unauthorized access                         |
| 403  | Insufficient privileges                     |
| 404  | Audit record not found                      |
| 409  | Audit already anchored or conflicting state |
| 422  | Integrity verification failed               |
| 500  | Internal server error                       |
| 503  | Blockchain service unavailable              |

```
```
