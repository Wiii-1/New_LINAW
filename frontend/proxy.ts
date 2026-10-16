import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/approval-workflows",
  "/dashboard",
  "/deliveries",
  "/invoices",
  "/organizations",
  "/purchase-orders",
  "/purchase-requisitions",
  "/suppliers",
  "/users",
];

const authRoutes = [
  "/forgot-password",
  "/login",
  "/reset-password",
  "/signup",
];

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

async function hasValidSession(accessToken: string): Promise<boolean> {
  const apiUrl = (
    env as typeof env & { LINAW_API_URL?: string }
  ).LINAW_API_URL;

  if (!apiUrl) {
    return false;
  }

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

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    matchesRoute(pathname, route),
  );
  const isAuthRoute = authRoutes.some((route) =>
    matchesRoute(pathname, route),
  );

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  const hasSession = accessToken
    ? await hasValidSession(accessToken)
    : false;

  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

export const config = {
  matcher: "/about/:path*",
};

/*

import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { authClient } from "./lib/auth-client"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const protectedRoutes = [
    "/approval-workflows",
    "/dashboard",
    "/deliveries",
    "/invoices",
    "/organizations",
    "/profile",
    "/purchase-orders",
    "/purchase-requisitions",
    "/settings",
    "/suppliers",
    "/users",
  ]

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const { data: session } = await authClient.getSession({
      fetchOptions: {
        headers: await headers(),
      },
    })

    if (!session) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/approval-workflows/:path*",
    "/dashboard/:path*",
    "/deliveries/:path*",
    "/invoices/:path*",
    "/organizations/:path*",
    "/profile/:path*",
    "/purchase-orders/:path*",
    "/purchase-requisitions/:path*",
    "/settings/:path*",
    "/suppliers/:path*",
    "/users/:path*",
  ],
}


*/
