import {
  columns,
  type UserManagement,
} from "@/app/(protected-routes)/user-management/column-definitions";
import { editProfileModal } from "@/app/(protected-routes)/user-management/modal-definitions";
import { DataTable } from "@/components/data-table";
import { UsersRoundIcon } from "lucide-react";

export async function getUserManagement(): Promise<UserManagement[]> {
  // TODO: Replace with actual backend API call
  // const res = await fetch('API_ENDPOINT');
  // return res.json();

  // Delete this array once API is connected
  return [
    {
      user_id: "user-uuid-1",
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@example.com",
      job_title: "Finance Manager",
      status: "ACTIVE",
      company_name: "Example Company",
    },
    {
      user_id: "user-uuid-2",
      first_name: "Juan",
      last_name: "Dela Cruz",
      email: "juan.delacruz@domain.com",
      job_title: null,
      status: "ACTIVE",
      company_name: null,
    },
  ];
}

export default async function AuditTrailPage() {
  const data = await getUserManagement();

  return (
    <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 wrap">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                User Management
              </h1>
            </div>

            <p className="text-sm text-muted-foreground">
              Tracking users within the company or tenancy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:self-center">
          <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-xs">
            <UsersRoundIcon className="h-3.5 w-3.5 text-primary" />
            <span>
              Total Users:{" "}
              <strong className="font-semibold text-foreground">
                {data.length}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <DataTable
        columns={columns}
        data={data}
        searchKey="request"
        searchPlaceholder="Search request..."
        toolbarActions={editProfileModal}
        enableExport={true}
        //exportEndpoint="/api/user-management/export" // Temporarily disable the endpoint to force the client-side fallback
        // HTTP method logs:  GET /api/user-management/export?format=csv 404 in 161ms
        exportFileName="user-management"
      />
    </main>
  );
}
