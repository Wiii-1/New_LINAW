"use client";

import * as React from "react";
import {
  useTable,
  type RowData,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
} from "@tanstack/react-table";
import { Search, X, DownloadIcon, SearchX, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableViewOptions } from "./data-table-view-options";
import { features, type DataTableFeatures } from "@/types/data-table-features";

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  toolbarActions?: React.ReactNode;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  toolbarActions,
}: Readonly<DataTableProps<TData>>) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({});

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const [rowSelection, setRowSelection] = React.useState({});

  const table = useTable({
    features,
    data,
    columns,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      columnVisibility,
      columnFilters,
      rowSelection,
    },
  });

  const searchValue = searchKey
    ? ((table.getColumn(searchKey)?.getFilterValue() as string) ?? "")
    : "";

  return (
    <div>
      <div className="flex items-center py-4">
        {searchKey && (
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="h-8 w-full pl-8 pr-8"
            />

            {searchValue && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => table.getColumn(searchKey)?.setFilterValue("")}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm">
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Export
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem className="whitespace-nowrap">
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem className="whitespace-nowrap">
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem className="whitespace-nowrap">
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DataTableViewOptions table={table} />
          {toolbarActions}
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-[400px] text-center"
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    {searchValue ? (
                      // 1. Search Empty State
                      <>
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/50 mb-4">
                          <SearchX className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">
                          No results found
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                          We couldn't find anything matching "{searchValue}".{" "}
                          <br />
                          Try adjusting your search or filters.
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() =>
                            table.getColumn(searchKey!)?.setFilterValue("")
                          }
                        >
                          Clear search
                        </Button>
                      </>
                    ) : (
                      // 2. Database Empty State
                      <>
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/50 mb-4">
                          <Inbox className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">
                          No data available
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                          There are no records to display here yet. <br />
                          Get started by creating a new one.
                        </p>
                        {/* Optional: You can render a "Create" button here if you pass an onClick handler via props */}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
