import { env } from "cloudflare:workers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const apiUrl = (
    env as typeof env & { LINAW_API_URL?: string }
  ).LINAW_API_URL;

  if (!apiUrl) {
    throw new Error("Authentication service is not configured.");
  }

  const baseUrl = apiUrl.replace(/\/+$/, "");

  let response: Response;

  try {
    response = await fetch(
      `${baseUrl}/api/auth/validate_token`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );
  } catch {
    throw new Error("Unable to reach the authentication service.");
  }

  if (!response.ok) {
    redirect("/login");
  }

  let data: { success?: boolean };

  try {
    data = (await response.json()) as { success?: boolean };
  } catch {
    throw new Error(
      "Invalid response from the authentication service.",
    );
  }

  if (data.success !== true) {
    redirect("/login");
  }

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}