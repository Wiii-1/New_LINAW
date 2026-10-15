# User Management

---

## POST /api/companies/register

### Description

Register a new company during the onboarding process and automatically assign the authenticated user as the initial organization administrator.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Request Body

```json
{
    "legal_name": "",
    "display_name": "",
    "tax_id": "",
    "address": "",
    "contact_email": "",
    "contact_phone": ""
}
```

### Success Response (201 Created)

```json
{
    "success": true,
    "message": "Company registered successfully.",
    "data": {
        "company_id": "",
        "legal_name": "",
        "display_name": "",
        "organization_administrator_id": ""
    }
}
```

### Error Responses

#### 400 Bad Request

```json
{
    "success": false,
    "message": "Invalid company registration data."
}
```

#### 401 Unauthorized

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

#### 409 Conflict

```json
{
    "success": false,
    "message": "User is already associated with an organization."
}
```

#### 422 Validation Failed

```json
{
    "success": false,
    "message": "Company registration validation failed."
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
    "message": "User management service unavailable."
}
```

---

## GET /api/users/profile

### Description

Retrieve the authenticated user's own profile information.

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
    "message": "Profile retrieved successfully.",
    "data": {
        "user_id": "",
        "first_name": "",
        "last_name": "",
        "email": "",
        "job_title": "",
        "status": ""
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

#### 404 Not Found

```json
{
    "success": false,
    "message": "User profile not found."
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

## PATCH /api/users/profile

### Description

Partially update the authenticated user's own profile information. Only fields included in the request body shall be modified.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Request Body

```json
{
    "first_name": "",
    "last_name": "",
    "email": "",
    "job_title": ""
}
```

All request fields are optional, but at least one field must be provided.

The `status` field is not directly modified through this endpoint.

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Profile updated successfully.",
    "data": {
        "user_id": "",
        "first_name": "",
        "last_name": "",
        "email": "",
        "job_title": "",
        "status": ""
    }
}
```

### Error Responses

#### 400 Bad Request

```json
{
    "success": false,
    "message": "Invalid profile update data."
}
```

#### 401 Unauthorized

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

#### 404 Not Found

```json
{
    "success": false,
    "message": "User profile not found."
}
```

#### 409 Conflict

```json
{
    "success": false,
    "message": "User email already exists."
}
```

#### 422 Validation Failed

```json
{
    "success": false,
    "message": "User profile validation failed."
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

## GET /api/companies/:companyId

### Description

Retrieve a company record by company identifier.

The authenticated user must be associated with the requested company.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name      | Type   | Required | Description         |
| --------- | ------ | -------- | ------------------- |
| companyId | string | Yes      | Company identifier. |

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Company retrieved successfully.",
    "data": {
        "company_id": "",
        "legal_name": "",
        "display_name": "",
        "tax_id": "",
        "address": "",
        "contact_email": "",
        "contact_phone": ""
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
    "message": "Access to the requested company is not permitted."
}
```

#### 404 Not Found

```json
{
    "success": false,
    "message": "Company record not found."
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

## API Endpoint Summary

| Method | Endpoint                    | Purpose                                                 |
| ------ | --------------------------- | ------------------------------------------------------- |
| POST   | `/api/companies/register`   | Register a company and assign the initial administrator |
| GET    | `/api/users/profile`        | Retrieve the authenticated user's profile               |
| PATCH  | `/api/users/profile`        | Update the authenticated user's profile                 |
| GET    | `/api/companies/:companyId` | Retrieve an associated company                          |

### Module Boundary

User account registration and credential creation are handled by the **Authentication module**.

User Management handles the authenticated user's profile, organization onboarding, company information retrieval, company membership association, and initial organization administrator assignment.
