---
name: map-backend-api-endpoints
description: 'Map a backend API into a verified endpoint inventory. Use for API route discovery, Hono or Express router analysis, endpoint documentation, authentication and authorization tracing, route-to-controller mapping, and comparing implemented routes with API design documents.'
argument-hint: '[backend path or module scope]'
user-invocable: true
disable-model-invocation: false
---

# Map Backend API Endpoints

Build a source-grounded map of the backend HTTP API. Prefer routes implemented in code over planned routes in documentation, and label any documentation-only or inferred endpoint explicitly.

## Default Scope

- Use the user-provided path; when the request says `/backend`, use the repository's `backend/` directory.
- Identify the actual repository root before resolving relative paths.
- If no output path is given, write the inventory to `docs/architecture/API_Endpoint_Map.md` and preserve existing documentation.
- Keep the map focused on HTTP endpoints. Do not include internal services, event handlers, or blockchain operations unless they are reached by an endpoint.

## Procedure

1. **Establish the application boundary.** Locate package manifests, runtime entrypoints, framework configuration, and the app/server bootstrap. Record the framework, base path, deployment entrypoint, and error-handling or catch-all behavior.
2. **Find route declarations.** Search the target backend for HTTP method registrations and router mounts, including framework-specific forms such as Hono `router.get`, `router.post`, `router.route`, Express `app.use`, `router.METHOD`, and equivalent declarations. Search dynamically named or factory-created routers as well as direct registrations.
3. **Resolve the route tree.** Start at each server entrypoint and recursively follow imported router factories. Combine the application base path, mount prefix, and child route path into one concrete path. Preserve path parameters and query parameters separately. Flag routes whose prefix or path cannot be resolved confidently.
4. **Capture request controls.** For every endpoint, inspect route-level, router-level, and application-level middleware. Record authentication, rate limiting, authorization or permission checks, validation, file upload handling, and relevant public or protected status. State inherited middleware rather than repeating it as if it were route-local.
5. **Trace the handler.** Follow the route handler to its controller or function and record the source file, exported symbol, service boundary, and repository or external integration when this is clear from nearby code. Do not infer behavior from a filename alone.
6. **Separate evidence levels.** Mark each row as `implemented` when a live route declaration is found, `documented-only` when it appears only in API/design docs, or `inferred` when a path depends on an unresolved factory, dynamic registration, or incomplete evidence. Never present documented-only routes as live.
7. **Compare against documentation.** Search `docs/`, README files, OpenAPI files, and frontend API calls for endpoint claims. Report missing implementation, undocumented implementation, method/path mismatches, naming inconsistencies, and stale examples in a separate discrepancies section.
8. **Write the inventory.** Use a Markdown table with these columns: `Method`, `Path`, `Status`, `Auth`, `Authorization`, `Validation`, `Handler`, `Source`, and `Evidence`. Group rows by module or router, and include the application base path and mount prefixes above the table. Keep one row per method and path combination.
9. **Add a route summary.** Include counts by HTTP method, router/module, and evidence status. List public endpoints, protected endpoints, unresolved routes, and catch-all behavior separately. Include the discovery date only when the repository convention requires it.
10. **Validate the map.** Re-scan route declarations and compare the count and paths with the generated inventory. Confirm every mounted router is represented, every row has a source reference, and every uncertainty is labeled. If a focused backend check is available, run it without modifying application code; otherwise report that the map was validated statically.

## Evidence Rules

- A route declaration is stronger evidence than a design document or frontend call.
- A router mount is not itself an endpoint; resolve its child declarations before listing routes.
- Application-level middleware applies only when the framework execution path proves that it reaches the mounted router.
- Do not claim response schemas, status codes, request fields, or business behavior unless the handler, validator, schema, test, or documentation provides evidence.
- Treat duplicate-looking paths with different methods as separate endpoints.
- Preserve unusual but implemented spellings such as `validate_token` or nonstandard mount names, and note a normalized suggestion only in discrepancies.
- If a catch-all delegates requests to another router, document the delegation and avoid inventing a wildcard endpoint row in the concrete inventory.

## Completion Checklist

- [ ] The actual backend entrypoint and base path are identified.
- [ ] Every reachable router mount has been inspected.
- [ ] Each concrete method/path row has source evidence.
- [ ] Effective authentication, authorization, validation, and rate limits are recorded.
- [ ] Implemented, documented-only, and inferred routes are clearly separated.
- [ ] Documentation discrepancies and unresolved dynamic routes are listed.
- [ ] Route counts and a second static scan support the final inventory.
