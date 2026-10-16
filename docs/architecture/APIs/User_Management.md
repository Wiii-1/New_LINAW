# User Management

---

## POST /api/companies/register

### Description

<<<<<<< HEAD
Register a new company during the onboarding process and automatically assign the authenticated user as the initial organization administrator.
=======
Register a company and create the organization administrator context for company-level administration.
>>>>>>> 09dd7e1 (Revert "Merge branch 'feat/hono-cloudflare-migration' of github.com:Wiii-1/New_LINAW")

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Request Body

```json
{
    "company_name": "",
    "company_email": "",
    "company_address": "",
    "company_contact_number": "",
    "company_status": ""
}
```

### Success Response (201 Created)

```json
{
    "success": true,
    "message": "Company registered successfully.",
    "data": {
        "company_id": "",
        "company_name": "",
        "company_status": "",
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
<<<<<<< HEAD
        "user_id": "",
        "first_name": "",
        "last_name": "",
=======
        "full_name": "",
>>>>>>> 09dd7e1 (Revert "Merge branch 'feat/hono-cloudflare-migration' of github.com:Wiii-1/New_LINAW")
        "email": "",
        "contact_number": ""
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

<<<<<<< HEAD
---

## PATCH /api/users/profile
=======
## PUT /api/users/profile
>>>>>>> 09dd7e1 (Revert "Merge branch 'feat/hono-cloudflare-migration' of github.com:Wiii-1/New_LINAW")

### Description

Update the authenticated user's own profile information.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Request Body

```json
{
    "full_name": "",
    "email": "",
    "contact_number": ""
}
```

<<<<<<< HEAD
All request fields are optional, but at least one field must be provided.

The `status` field is not directly modified through this endpoint.

=======
>>>>>>> 09dd7e1 (Revert "Merge branch 'feat/hono-cloudflare-migration' of github.com:Wiii-1/New_LINAW")
### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Profile updated successfully.",
    "data": {
        "full_name": "",
        "email": "",
<<<<<<< HEAD
        "job_title": "",
        "status": ""
=======
        "contact_number": ""
>>>>>>> 09dd7e1 (Revert "Merge branch 'feat/hono-cloudflare-migration' of github.com:Wiii-1/New_LINAW")
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

<<<<<<< HEAD
---

=======
>>>>>>> 09dd7e1 (Revert "Merge branch 'feat/hono-cloudflare-migration' of github.com:Wiii-1/New_LINAW")
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
        "company_name": "",
        "company_email": "",
        "company_address": "",
        "company_contact_number": "",
        "company_status": ""
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

<<<<<<< HEAD
=======
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

## PUT /api/companies/:companyId

### Description

Update a company profile record.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| companyId | string | Yes | Company identifier. |

### Request Body

```json
{
    "company_name": "",
    "company_email": "",
    "company_address": "",
    "company_contact_number": "",
    "company_status": ""
}
```

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Company updated successfully.",
    "data": {
        "company_id": "",
        "company_name": "",
        "company_status": ""
    }
}
```

### Error Responses

#### 400 Bad Request

```json
{
    "success": false,
    "message": "Invalid company update data."
}
```

#### 401 Unauthorized

```json
{
    "success": false,
    "message": "Unauthorized access."
}
```

>>>>>>> 09dd7e1 (Revert "Merge branch 'feat/hono-cloudflare-migration' of github.com:Wiii-1/New_LINAW")
#### 403 Forbidden

```json
{
    "success": false,
<<<<<<< HEAD
    "message": "Access to the requested company is not permitted."
=======
    "message": "Insufficient privileges to update the company record."
}
```

#### 404 Not Found

```json
{
    "success": false,
    "message": "Company record not found."
}
```

#### 409 Conflict

```json
{
    "success": false,
    "message": "Company record is in a conflicting state."
}
```

#### 422 Validation Failed

```json
{
    "success": false,
    "message": "Company validation failed."
}
```

#### 500 Internal Server Error

```json
{
    "success": false,
    "message": "Internal server error."
}
```

## POST /api/companies/:companyId/users

### Description

Create a company-scoped user account.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| companyId | string | Yes | Company identifier. |

### Request Body

```json
{
    "full_name": "",
    "email": "",
    "password": "",
    "user_status": ""
}
```

### Success Response (201 Created)

```json
{
    "success": true,
    "message": "Company user created successfully.",
    "data": {
        "user_id": "",
        "company_id": "",
        "full_name": "",
        "email": "",
        "user_status": ""
    }
}
```

### Error Responses

#### 400 Bad Request

```json
{
    "success": false,
    "message": "Invalid company user data."
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
    "message": "Insufficient privileges to manage company users."
}
```

#### 409 Conflict

```json
{
    "success": false,
    "message": "User account already exists or is in a conflicting state."
}
```

#### 422 Validation Failed

```json
{
    "success": false,
    "message": "Company user validation failed."
}
```

#### 500 Internal Server Error

```json
{
    "success": false,
    "message": "Internal server error."
}
```

## GET /api/companies/:companyId/users

### Description

List users within a company, with optional status or role filtering.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| companyId | string | Yes | Company identifier. |

### Query Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| status | string | No | Filters users by account status. |
| role | string | No | Filters users by role name. |

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Company users retrieved successfully.",
    "data": {
        "users": []
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
    "message": "Insufficient privileges to view company users."
>>>>>>> 09dd7e1 (Revert "Merge branch 'feat/hono-cloudflare-migration' of github.com:Wiii-1/New_LINAW")
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

<<<<<<< HEAD
---

## API Endpoint Summary
=======
## GET /api/companies/:companyId/users/:userId
>>>>>>> 09dd7e1 (Revert "Merge branch 'feat/hono-cloudflare-migration' of github.com:Wiii-1/New_LINAW")

| Method | Endpoint                    | Purpose                                                 |
| ------ | --------------------------- | ------------------------------------------------------- |
| POST   | `/api/companies/register`   | Register a company and assign the initial administrator |
| GET    | `/api/users/profile`        | Retrieve the authenticated user's profile               |
| PATCH  | `/api/users/profile`        | Update the authenticated user's profile                 |
| GET    | `/api/companies/:companyId` | Retrieve an associated company                          |

<<<<<<< HEAD
### Module Boundary
=======
Retrieve a specific company user account.
>>>>>>> 09dd7e1 (Revert "Merge branch 'feat/hono-cloudflare-migration' of github.com:Wiii-1/New_LINAW")

User account registration and credential creation are handled by the **Authentication module**.

<<<<<<< HEAD
User Management handles the authenticated user's profile, organization onboarding, company information retrieval, company membership association, and initial organization administrator assignment.
=======
Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| companyId | string | Yes | Company identifier. |
| userId | string | Yes | User identifier. |

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Company user retrieved successfully.",
    "data": {
        "user_id": "",
        "company_id": "",
        "full_name": "",
        "email": "",
        "user_status": ""
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
    "message": "Insufficient privileges to view the company user."
}
```

#### 404 Not Found

```json
{
    "success": false,
    "message": "Company user record not found."
}
```

#### 500 Internal Server Error

```json
{
    "success": false,
    "message": "Internal server error."
}
```

## PUT /api/companies/:companyId/users/:userId

### Description

Update a company user account.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| companyId | string | Yes | Company identifier. |
| userId | string | Yes | User identifier. |

### Request Body

```json
{
    "full_name": "",
    "email": "",
    "password": "",
    "user_status": ""
}
```

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Company user updated successfully.",
    "data": {
        "user_id": "",
        "company_id": "",
        "full_name": "",
        "email": "",
        "user_status": ""
    }
}
```

### Error Responses

#### 400 Bad Request

```json
{
    "success": false,
    "message": "Invalid company user update data."
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
    "message": "Insufficient privileges to update the company user."
}
```

#### 404 Not Found

```json
{
    "success": false,
    "message": "Company user record not found."
}
```

#### 409 Conflict

```json
{
    "success": false,
    "message": "User account is in a conflicting state."
}
```

#### 422 Validation Failed

```json
{
    "success": false,
    "message": "Company user validation failed."
}
```

#### 500 Internal Server Error

```json
{
    "success": false,
    "message": "Internal server error."
}
```

## PUT /api/companies/:companyId/users/:userId/status

### Description

Update the status of a company user account.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| companyId | string | Yes | Company identifier. |
| userId | string | Yes | User identifier. |

### Request Body

```json
{
    "user_status": ""
}
```

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Company user status updated successfully.",
    "data": {
        "user_id": "",
        "company_id": "",
        "user_status": ""
    }
}
```

### Error Responses

#### 400 Bad Request

```json
{
    "success": false,
    "message": "Invalid status update data."
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
    "message": "Insufficient privileges to update user status."
}
```

#### 404 Not Found

```json
{
    "success": false,
    "message": "Company user record not found."
}
```

#### 422 Validation Failed

```json
{
    "success": false,
    "message": "User status validation failed."
}
```

#### 500 Internal Server Error

```json
{
    "success": false,
    "message": "Internal server error."
}
```

## DELETE /api/companies/:companyId/users/:userId

### Description

Remove a company user account.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| companyId | string | Yes | Company identifier. |
| userId | string | Yes | User identifier. |

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Company user removed successfully.",
    "data": {
        "user_id": "",
        "company_id": ""
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
    "message": "Insufficient privileges to remove the company user."
}
```

#### 404 Not Found

```json
{
    "success": false,
    "message": "Company user record not found."
}
```

#### 409 Conflict

```json
{
    "success": false,
    "message": "Company user record is in a conflicting state."
}
```

#### 500 Internal Server Error

```json
{
    "success": false,
    "message": "Internal server error."
}
```

## POST /api/companies/:companyId/users/:userId/assign-role

### Description

Assign a company-scoped role to a company user.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| companyId | string | Yes | Company identifier. |
| userId | string | Yes | User identifier. |

### Request Body

```json
{
    "role_id": "",
    "permission_id": ""
}
```

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Role assigned successfully.",
    "data": {
        "user_id": "",
        "company_id": "",
        "role_id": "",
        "permission_id": ""
    }
}
```

### Error Responses

#### 400 Bad Request

```json
{
    "success": false,
    "message": "Invalid role assignment data."
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
    "message": "Insufficient privileges to assign roles."
}
```

#### 404 Not Found

```json
{
    "success": false,
    "message": "Role or company user record not found."
}
```

#### 409 Conflict

```json
{
    "success": false,
    "message": "Role assignment already exists or is in a conflicting state."
}
```

#### 422 Validation Failed

```json
{
    "success": false,
    "message": "Role assignment validation failed."
}
```

#### 500 Internal Server Error

```json
{
    "success": false,
    "message": "Internal server error."
}
```

## POST /api/companies/:companyId/users/:userId/remove-role

### Description

Remove a company-scoped role from a company user.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| companyId | string | Yes | Company identifier. |
| userId | string | Yes | User identifier. |

### Request Body

```json
{
    "role_id": ""
}
```

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Role removed successfully.",
    "data": {
        "user_id": "",
        "company_id": "",
        "role_id": ""
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
    "message": "Insufficient privileges to remove roles."
}
```

#### 404 Not Found

```json
{
    "success": false,
    "message": "Role or company user record not found."
}
```

#### 409 Conflict

```json
{
    "success": false,
    "message": "Role assignment is in a conflicting state."
}
```

#### 500 Internal Server Error

```json
{
    "success": false,
    "message": "Internal server error."
}
```

## GET /api/roles

### Description

Retrieve the available company-scoped roles.

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
    "message": "Roles retrieved successfully.",
    "data": {
        "roles": []
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

#### 500 Internal Server Error

```json
{
    "success": false,
    "message": "Internal server error."
}
```

## GET /api/permissions

### Description

Retrieve the available permission definitions.

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
    "message": "Permissions retrieved successfully.",
    "data": {
        "permissions": []
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

#### 500 Internal Server Error

```json
{
    "success": false,
    "message": "Internal server error."
}
```

---

>>>>>>> 09dd7e1 (Revert "Merge branch 'feat/hono-cloudflare-migration' of github.com:Wiii-1/New_LINAW")
