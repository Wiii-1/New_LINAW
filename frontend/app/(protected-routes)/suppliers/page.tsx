"use client";

import { useMemo, useState } from "react";
import {
  Building2Icon,
  MailPlusIcon,
  MoreHorizontalIcon,
  SearchIcon,
  ShieldAlertIcon,
  UserRoundIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SupplierStatus = "ACTIVE" | "INACTIVE";
type RelationshipStatus = "ACTIVE" | "INACTIVE";

type Supplier = {
  supplier_id: string;
  supplier_code: string;
  legal_name: string;
  display_name: string;
  tax_id: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  supplier_status: SupplierStatus;
  relationship_status: RelationshipStatus;
  created_at: string;
  updated_at: string;
};

type Invitation = {
  invitation_id: string;
  email: string;
  invitation_status: "PENDING" | "EXPIRED" | "ACCEPTED";
  expires_at: string;
  created_at: string;
};

const initialSuppliers: Supplier[] = [
  {
    supplier_id: "supplier-001",
    supplier_code: "SUP-00428",
    legal_name: "Northstar Industrial Supply Ltd.",
    display_name: "Northstar Industrial Supply",
    tax_id: "GB 481 2291 84",
    contact_email: "accounts@northstar.example",
    contact_phone: "+44 20 7946 0182",
    address: "18 Meridian Way, London",
    supplier_status: "ACTIVE",
    relationship_status: "ACTIVE",
    created_at: "2026-08-14",
    updated_at: "2026-10-11",
  },
  {
    supplier_id: "supplier-002",
    supplier_code: "SUP-00317",
    legal_name: "Atlas Office Systems Inc.",
    display_name: "Atlas Office Systems",
    tax_id: "US 84-2195077",
    contact_email: "hello@atlas.example",
    contact_phone: "+1 212 555 0148",
    address: "240 Madison Avenue, New York",
    supplier_status: "ACTIVE",
    relationship_status: "ACTIVE",
    created_at: "2026-07-23",
    updated_at: "2026-10-08",
  },
  {
    supplier_id: "supplier-003",
    supplier_code: "SUP-00294",
    legal_name: "Clearline Network Services GmbH",
    display_name: "Clearline Network Services",
    tax_id: "DE 291 840 556",
    contact_email: "service@clearline.example",
    contact_phone: "+49 30 555 0110",
    address: "Kronenstrasse 22, Berlin",
    supplier_status: "ACTIVE",
    relationship_status: "ACTIVE",
    created_at: "2026-05-19",
    updated_at: "2026-09-29",
  },
  {
    supplier_id: "supplier-004",
    supplier_code: "SUP-00186",
    legal_name: "Meridian Facilities Group",
    display_name: "Meridian Facilities",
    tax_id: "GB 902 1174 31",
    contact_email: "operations@meridian.example",
    contact_phone: "+44 161 555 0197",
    address: "7 Harbour Exchange, Manchester",
    supplier_status: "ACTIVE",
    relationship_status: "INACTIVE",
    created_at: "2026-02-04",
    updated_at: "2026-09-18",
  },
];

const initialInvitations: Invitation[] = [
  {
    invitation_id: "invitation-001",
    email: "partnerships@evergreen.example",
    invitation_status: "PENDING",
    expires_at: "2026-10-21",
    created_at: "2026-10-17",
  },
  {
    invitation_id: "invitation-002",
    email: "vendor@harbor.example",
    invitation_status: "ACCEPTED",
    expires_at: "2026-10-08",
    created_at: "2026-10-05",
  },
  {
    invitation_id: "invitation-003",
    email: "sales@pioneer.example",
    invitation_status: "EXPIRED",
    expires_at: "2026-09-28",
    created_at: "2026-09-25",
  },
];

function StatusBadge({ status }: Readonly<{ status: string }>) {
  const isActive = status === "ACTIVE" || status === "ACCEPTED";
  const variant = isActive
    ? "secondary"
    : status === "EXPIRED"
      ? "destructive"
      : "outline";

  return <Badge variant={variant}>{status.toLowerCase()}</Badge>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | RelationshipStatus>("ALL");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  const filteredSuppliers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const matchesQuery = [
        supplier.display_name,
        supplier.legal_name,
        supplier.supplier_code,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

      return (
        matchesQuery &&
        (filter === "ALL" || supplier.relationship_status === filter)
      );
    });
  }, [filter, query, suppliers]);

  function deactivateSupplier() {
    if (!selectedSupplier) return;

    setSuppliers((current) =>
      current.map((supplier) =>
        supplier.supplier_id === selectedSupplier.supplier_id
          ? {
              ...supplier,
              relationship_status: "INACTIVE",
              updated_at: "2026-10-18",
            }
          : supplier,
      ),
    );
    setSelectedSupplier((current) =>
      current
        ? {
            ...current,
            relationship_status: "INACTIVE",
            updated_at: "2026-10-18",
          }
        : current,
    );
  }

  function createInvitation() {
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;

    setInvitations((current) => [
      {
        invitation_id: `invitation-${current.length + 1}`,
        email,
        invitation_status: "PENDING",
        expires_at: "2026-10-21",
        created_at: "2026-10-18",
      },
      ...current,
    ]);
    setInviteEmail("");
    setInviteOpen(false);
  }

  const activeCount = suppliers.filter(
    (supplier) => supplier.relationship_status === "ACTIVE",
  ).length;
  const pendingCount = invitations.filter(
    (invitation) => invitation.invitation_status === "PENDING",
  ).length;

  return (
    <main className="min-h-[calc(100svh-var(--header-height))]">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em]">
              <Building2Icon className="size-3.5" />
              Procurement / Supplier network
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Suppliers</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage supplier relationships, contacts, and invitations.
            </p>
          </div>
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <MailPlusIcon />
            Invite supplier
          </Button>
        </header>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card size="sm">
            <CardContent className="gap-1">
              <CardDescription>Active relationships</CardDescription>
              <CardTitle className="text-2xl">{activeCount}</CardTitle>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="gap-1">
              <CardDescription>Directory total</CardDescription>
              <CardTitle className="text-2xl">{suppliers.length}</CardTitle>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="gap-1">
              <CardDescription>Pending invitations</CardDescription>
              <CardTitle className="text-2xl">{pendingCount}</CardTitle>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="suppliers" className="gap-4">
          <TabsList
            variant="line"
            className="w-full justify-start rounded-none border-b p-0"
          >
            <TabsTrigger value="suppliers" className="flex-none px-1 pb-3">
              Suppliers <span className="ml-1 text-xs">{suppliers.length}</span>
            </TabsTrigger>
            <TabsTrigger value="invitations" className="flex-none px-1 pb-3">
              Invitations <span className="ml-1 text-xs">{invitations.length}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suppliers" className="flex flex-col gap-4">
            <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search suppliers"
                  className="h-9 pl-8"
                />
              </div>
              <div className="flex items-center gap-1">
                {(["ALL", "ACTIVE", "INACTIVE"] as const).map((value) => (
                  <Button
                    key={value}
                    variant={filter === value ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(value)}
                  >
                    {value === "ALL" ? "All" : value.toLowerCase()}
                  </Button>
                ))}
              </div>
            </section>

            <Card className="rounded-md shadow-none">
              <CardHeader className="border-b py-4">
                <CardTitle>Supplier directory</CardTitle>
                <CardDescription>
                  {filteredSuppliers.length} of {suppliers.length} suppliers shown
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="min-w-[900px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Relationship</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="w-12" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSuppliers.map((supplier) => (
                        <TableRow key={supplier.supplier_id} className="group">
                          <TableCell>
                            <button
                              type="button"
                              className="text-left font-medium hover:underline"
                              onClick={() => setSelectedSupplier(supplier)}
                            >
                              {supplier.display_name}
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                {supplier.legal_name}
                              </span>
                            </button>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {supplier.supplier_code}
                          </TableCell>
                          <TableCell>
                            <span>{supplier.contact_email}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {supplier.contact_phone}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={supplier.relationship_status} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(supplier.updated_at)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label={`Open ${supplier.display_name}`}
                              onClick={() => setSelectedSupplier(supplier)}
                            >
                              <MoreHorizontalIcon />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!filteredSuppliers.length && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No suppliers match this view.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitations">
            <Card className="rounded-md shadow-none">
              <CardHeader className="flex-row items-center justify-between border-b py-4">
                <div>
                  <CardTitle>Supplier invitations</CardTitle>
                  <CardDescription>
                    Invitations sent to prospective supplier contacts.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInviteOpen(true)}
                >
                  <MailPlusIcon />
                  Invite supplier
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((invitation) => (
                      <TableRow key={invitation.invitation_id}>
                        <TableCell className="font-medium">
                          {invitation.email}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={invitation.invitation_status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(invitation.created_at)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(invitation.expires_at)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label={`More actions for ${invitation.email}`}
                          >
                            <MoreHorizontalIcon />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Sheet
        open={Boolean(selectedSupplier)}
        onOpenChange={(open) => !open && setSelectedSupplier(null)}
      >
        <SheetContent>
          {selectedSupplier && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedSupplier.display_name}</SheetTitle>
                <SheetDescription>
                  {selectedSupplier.legal_name} · {selectedSupplier.supplier_code}
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-5 px-4">
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedSupplier.relationship_status} />
                  <StatusBadge status={selectedSupplier.supplier_status} />
                </div>
                <div className="grid gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Contact</p>
                    <p className="mt-1">{selectedSupplier.contact_email}</p>
                    <p className="text-muted-foreground">
                      {selectedSupplier.contact_phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="mt-1">{selectedSupplier.address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tax ID</p>
                    <p className="mt-1 font-mono text-xs">
                      {selectedSupplier.tax_id}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4 text-xs text-muted-foreground">
                  Added {formatDate(selectedSupplier.created_at)} · Updated {formatDate(selectedSupplier.updated_at)}
                </div>
              </div>

              <SheetFooter>
                <Button
                  variant="destructive"
                  disabled={selectedSupplier.relationship_status === "INACTIVE"}
                  onClick={deactivateSupplier}
                >
                  <ShieldAlertIcon />
                  Deactivate relationship
                </Button>
                <SheetClose render={<Button variant="outline" />}>Close</SheetClose>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={inviteOpen} onOpenChange={setInviteOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Invite a supplier</SheetTitle>
            <SheetDescription>
              Send an invitation to a supplier contact. This mock form does not send email.
            </SheetDescription>
          </SheetHeader>

          <div className="px-4">
            <label htmlFor="supplier-email" className="text-sm font-medium">
              Email address
            </label>
            <Input
              id="supplier-email"
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="supplier@example.com"
              className="mt-2"
            />
          </div>

          <SheetFooter>
            <Button onClick={createInvitation} disabled={!inviteEmail.trim()}>
              <UserRoundIcon />
              Create invitation
            </Button>
            <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </main>
  );
}
