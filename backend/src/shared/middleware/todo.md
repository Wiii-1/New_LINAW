# Authentication Request User Reminder

## Purpose

Authenticated endpoints need access to the ID of the currently authenticated user.

The authenticated user ID should come from the authentication middleware, **not from the request body or route parameters**.

## Current Authentication Flow

```text
JWT
 │
 ▼
authenticate middleware
 │
 ▼
jwt.verify()
 │
 ▼
req.user
 │
 ▼
AuthRequest
 │
 ▼
Controller
```

## Current Refresh Token Payload

```ts
interface RefreshTokenPayload {
    user_id: string;
    session_id: string;
}
```

This payload is specifically for the **refresh token** and should not automatically be treated as the payload for the access token.

Before changing the authentication types, verify the payload used when creating the **access token**.

## AuthRequest

The current middleware defines:

```ts
export interface AuthRequest extends Request {
    user?: any;
}
```

This allows authenticated controllers to access:

```ts
req.user
```

However, `any` should eventually be replaced with a proper authenticated-user type once the access-token payload is confirmed.

## Controller Usage

For endpoints that require both the authenticated user ID and a requisition ID:

```ts
async cancelRequisition(req: AuthRequest, res: Response) {
    const requisitionId =
        purchaseRequisitionIdParamsSchema.parse(req.params.id);

    const userId = req.user?.id;

    // Pass both values to the service.
}
```

### Data Sources

```text
requisitionId
    ↑
req.params.id
    ↓
Validate using requisition ID schema


userId
    ↑
req.user
    ↓
Provided by authentication middleware
```

## Service Input

Bundle the values into one object when passing them to the service:

```ts
await purchaseRequisitionService.cancelRequisition({
    requisitionId,
    userId
});
```

The service can then use both values for authorization and business rules.

## Important Rule

Never accept the authenticated `userId` from:

* `req.body`
* `req.params`
* `req.query`

The authenticated user's identity must come from the authentication middleware.

## TODO

* [ ] Find the access-token payload definition.
* [ ] Define an `AuthenticatedUser` type based on the actual access-token payload.
* [ ] Replace `user?: any` in `AuthRequest` with the proper type.
* [ ] Ensure `jwt.verify()` produces/validates the expected payload shape before assigning it to `req.user`.
