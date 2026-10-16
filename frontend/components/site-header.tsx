"use client";

import { SearchForm } from "@/components/search-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { BellIcon, CircleHelpIcon, PanelLeftIcon } from "lucide-react";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b border-slate-200/80 bg-[#f8fafc]/95 dark:bg-slate-900/95 backdrop-blur">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4 lg:px-6">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <PanelLeftIcon />
        </Button>
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-slate-500">Workspace</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-slate-900 dark:text-white">Overview</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
        <div className="ml-1 hidden items-center gap-1 sm:flex">
          <Button variant="ghost" size="icon" className="size-8 text-slate-500" aria-label="Help center">
            <CircleHelpIcon className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="relative size-8 text-slate-500" aria-label="Notifications">
            <BellIcon className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#e46b4e] ring-2 ring-[#f8fafc]" />
          </Button>
        </div>
      </div>
    </header>
  );
}
