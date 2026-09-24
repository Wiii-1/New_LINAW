# Organization Administration

---

## POST /api/org-admin/members

### Description

Add or invite a user to the administrator's organization.

The operation may either associate an existing user account with the organization or initiate an organization invitation for a user who does not yet have an account.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Request Body

```json
{
    "email": "",
    "first_name": "",
    "last_name": "",
    "role_id": ""
}
```

### Success Response (201 Created)

```json
{
    "success": true,
    "message": "Organization member added successfully.",
    "data": {
        "user_id": "",
        "organization_id": "",
        "account_status": ""
    }
}
```

### Error Responses

#### 400 Bad Request

```json
{
    "success": false,
    "message": "Invalid organization member data."
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
    "message": "Insufficient privileges to manage organization members."
}
```

#### 409 Conflict

```json
{
    "success": false,
    "message": "User is already a member of the organization."
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

## GET /api/org-admin/members

### Description

List members belonging to the administrator's organization.

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
    "message": "Organization members retrieved successfully.",
    "data": {
        "organization_members": []
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
    "message": "Insufficient privileges to view organization members."
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

## GET /api/org-admin/members/:userId

### Description

Retrieve a member belonging to the administrator's organization.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| userId | string | Yes | User identifier. |

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Organization member retrieved successfully.",
    "data": {
        "user_id": "",
        "first_name": "",
        "last_name": "",
        "email": "",
        "account_status": ""
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
    "message": "Organization member not found."
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

## PUT /api/org-admin/members/:userId

### Description

Update information associated with an organization member.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| userId | string | Yes | User identifier. |

### Request Body

```json
{
    "first_name": "",
    "last_name": "",
    "email": ""
}
```

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Organization member updated successfully.",
    "data": {
        "user_id": "",
        "organization_id": ""
    }
}
```

### Error Responses

#### 400 Bad Request

```json
{
    "success": false,
    "message": "Invalid organization member update data."
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
    "message": "Insufficient privileges to update organization members."
}
```

#### 404 Not Found

```json
{
    "success": false,
    "message": "Organization member not found."
}
```

#### 409 Conflict

```json
{
    "success": false,
    "message": "Email is already associated with another user account."
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

## PATCH /api/org-admin/members/:userId/status

### Description

Update the organization membership status of a member.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| userId | string | Yes | User identifier. |

### Request Body

```json
{
    "account_status": ""
}
```

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Organization member status updated successfully.",
    "data": {
        "user_id": "",
        "account_status": ""
    }
}
```

### Error Responses

#### 400 Bad Request

```json
{
    "success": false,
    "message": "Invalid organization member status."
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
    "message": "Insufficient privileges to update organization member status."
}
```

#### 404 Not Found

```json
{
    "success": false,
    "message": "Organization member not found."
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

## DELETE /api/org-admin/members/:userId

### Description

Remove a user's membership from the administrator's organization.

The global user account is not deleted.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| userId | string | Yes | User identifier. |

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Organization member removed successfully.",
    "data": {
        "user_id": "",
        "organization_id": ""
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
    "message": "Insufficient privileges to remove organization members."
}
```

#### 404 Not Found

```json
{
    "success": false,
    "message": "Organization member not found."
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

# Organization Roles

## POST /api/org-admin/roles

### Description

Create an organization-scoped role.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Request Body

```json
{
    "name": "",
    "description": ""
}
```

### Success Response (201 Created)

```json
{
    "success": true,
    "message": "Organization role created successfully.",
    "data": {
        "role_id": "",
        "organization_id": "",
        "name": ""
    }
}
```

### Error Responses

#### 400 Bad Request

```json
{
    "success": false,
    "message": "Invalid organization role data."
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
    "message": "Insufficient privileges to create organization roles."
}
```

#### 409 Conflict

```json
{
    "success": false,
    "message": "An organization role with the same name already exists."
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

## GET /api/org-admin/roles

### Description

List organization-scoped roles belonging to the administrator's organization.

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
    "message": "Organization roles retrieved successfully.",
    "data": {
        "organization_roles": []
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
    "message": "Insufficient privileges to view organization roles."
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

## GET /api/org-admin/roles/:roleId

### Description

Retrieve an organization-scoped role belonging to the administrator's organization.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| roleId | string | Yes | Role identifier. |

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Organization role retrieved successfully.",
    "data": {
        "role_id": "",
        "organization_id": "",
        "name": "",
        "description": ""
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
    "message": "Organization role not found."
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

## PUT /api/org-admin/roles/:roleId

### Description

Update an organization-scoped role belonging to the administrator's organization.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| roleId | string | Yes | Role identifier. |

### Request Body

```json
{
    "name": "",
    "description": ""
}
```

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Organization role updated successfully.",
    "data": {
        "role_id": "",
        "organization_id": "",
        "name": ""
    }
}
```

### Error Responses

#### 400 Bad Request

```json
{
    "success": false,
    "message": "Invalid organization role update data."
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
    "message": "Insufficient privileges to update organization roles."
}
```

#### 404 Not Found

```json
{
    "success": false,
    "message": "Organization role not found."
}
```

#### 409 Conflict

```json
{
    "success": false,
    "message": "An organization role with the same name already exists."
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

## DELETE /api/org-admin/roles/:roleId

### Description

Delete an organization-scoped role belonging to the administrator's organization.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| roleId | string | Yes | Role identifier. |

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Organization role deleted successfully.",
    "data": {
        "role_id": "",
        "organization_id": ""
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
    "message": "Insufficient privileges to delete organization roles."
}
```

#### 404 Not Found

```json
{
    "success": false,
    "message": "Organization role not found."
}
```

#### 409 Conflict

```json
{
    "success": false,
    "message": "Organization role cannot be deleted while assigned to organization members."
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

# Role Assignment

## POST /api/org-admin/members/:userId/roles

### Description

Assign an organization-scoped role to a member.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| userId | string | Yes | User identifier. |

### Request Body

```json
{
    "role_id": ""
}
```

### Success Response (201 Created)

```json
{
    "success": true,
    "message": "Organization role assigned successfully.",
    "data": {
        "user_id": "",
        "role_id": ""
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
    "message": "Insufficient privileges to assign organization roles."
}
```

#### 404 Not Found

```json
{
    "success": false,
    "message": "Organization member or role not found."
}
```

#### 409 Conflict

```json
{
    "success": false,
    "message": "Role is already assigned to the organization member."
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

## DELETE /api/org-admin/members/:userId/roles/:roleId

### Description

Revoke an organization-scoped role from a member.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| userId | string | Yes | User identifier. |
| roleId | string | Yes | Role identifier. |

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Organization role revoked successfully.",
    "data": {
        "user_id": "",
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
    "message": "Insufficient privileges to revoke organization roles."
}
```

#### 404 Not Found

```json
{
    "success": false,
    "message": "Organization member or role assignment not found."
}
```

#### 409 Conflict

```json
{
    "success": false,
    "message": "Organization member must retain at least one active role."
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

# Role Permissions

## GET /api/org-admin/permissions

### Description

List system-defined permissions available for organization role configuration.

Organization administrators have read-only access to the permission catalog.

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
    "message": "Available permissions retrieved successfully.",
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

#### 403 Forbidden

```json
{
    "success": false,
    "message": "Insufficient privileges to view permissions."
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

## GET /api/org-admin/roles/:roleId/permissions

### Description

List permissions currently assigned to an organization-scoped role.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| roleId | string | Yes | Role identifier. |

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Role permissions retrieved successfully.",
    "data": {
        "role_id": "",
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

#### 404 Not Found

```json
{
    "success": false,
    "message": "Organization role not found."
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

## POST /api/org-admin/roles/:roleId/permissions

### Description

Map a system-defined permission to an organization-scoped role.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| roleId | string | Yes | Role identifier. |

### Request Body

```json
{
    "permission_id": ""
}
```

### Success Response (201 Created)

```json
{
    "success": true,
    "message": "Permission assigned to organization role successfully.",
    "data": {
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
    "message": "Invalid role permission data."
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
    "message": "Insufficient privileges to manage role permissions."
}
```

#### 404 Not Found

```json
{
    "success": false,
    "message": "Organization role or permission not found."
}
```

#### 409 Conflict

```json
{
    "success": false,
    "message": "Permission is already assigned to the organization role."
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

## DELETE /api/org-admin/roles/:roleId/permissions/:permissionId

### Description

Remove a permission mapping from an organization-scoped role.

The system-defined permission itself is not deleted.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| roleId | string | Yes | Role identifier. |
| permissionId | string | Yes | Permission identifier. |

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Permission removed from organization role successfully.",
    "data": {
        "role_id": "",
        "permission_id": ""
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
    "message": "Insufficient privileges to manage role permissions."
}
```

#### 404 Not Found

```json
{
    "success": false,
    "message": "Role permission mapping not found."
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

# Organization Settings

## GET /api/org-admin/settings

### Description

Retrieve configurable organization information and administrative settings.

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
    "message": "Organization settings retrieved successfully.",
    "data": {
        "organization_settings": {
            "contact_email": "",
            "contact_number": ""
        }
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
    "message": "Insufficient privileges to view organization settings."
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

## PUT /api/org-admin/settings

### Description

Update configurable organization information and administrative settings.

### Authentication

Bearer Token Required

### Headers

```text
Authorization: Bearer <access_token>
```

### Request Body

```json
{
    "contact_email": "",
    "contact_number": ""
}
```

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Organization settings updated successfully.",
    "data": {
        "organization_id": "",
        "contact_email": "",
        "contact_number": ""
    }
}
```

### Error Responses

#### 400 Bad Request

```json
{
    "success": false,
    "message": "Invalid organization settings."
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
    "message": "Insufficient privileges to update organization settings."
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

# Administrative Audit Trail

## GET /api/org-admin/audit-trail

### Description

Retrieve organization administrative audit trail records.

Only records belonging to the administrator's organization are accessible.

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
    "message": "Organization audit trail retrieved successfully.",
    "data": {
        "audit_logs": []
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
    "message": "Insufficient privileges to view organization audit trail."
}
```

#### 500 Internal Server Error

```json
{
    "success": false,
    "message": "Internal server error."
}
```