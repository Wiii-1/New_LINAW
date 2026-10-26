import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/approval-workflows",
  "/dashboard",
  "/deliveries",
  "/invoices",
  "/organizations",
  "/organization-settings",
  "/purchase-orders",
  "/audit-trail",
  "/purchase-requisitions",
  "/suppliers",
  "/supplier-management",
  "/supplier-portal",
  "/users",
  "/profile",
];

const authRoutes = ["/forgot-password", "/login", "/reset-password", "/signup"];

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

async function hasValidSession(accessToken: string): Promise<boolean> {
  const apiUrl = (env as typeof env & { LINAW_API_URL?: string }).LINAW_API_URL;
  if (!apiUrl) return false;

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/api/auth/validate_token`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) return false;
    const data = (await response.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    matchesRoute(pathname, route),
  );
  const isAuthRoute = authRoutes.some((route) => matchesRoute(pathname, route));

  if (!isProtectedRoute && !isAuthRoute)
    return addSecurityHeaders(NextResponse.next());

  const accessToken = request.cookies.get("accessToken")?.value;
  const hasSession = accessToken ? await hasValidSession(accessToken) : false;

  if (isProtectedRoute && !hasSession) {
    return addSecurityHeaders(
      NextResponse.redirect(new URL("/login", request.url)),
    );
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
