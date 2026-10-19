"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ChevronsUpDownIcon,
  MoonIcon,
  UserIcon,
  CreditCardIcon,
  BellIcon,
  LogOutIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

export function NavUser({
  user,
}: Readonly<{
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}>) {
  const { isMobile } = useSidebar();
  const { setTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const initials =
    user.name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        setIsLoggingOut(false);
        return;
      }

      window.location.assign("/login");
    } catch {
      setIsLoggingOut(false);
    }
  };
  /*
  const router = useRouter()

  const { data: session, isPending } = authClient.useSession()

  const handleLogout = async () => {
    await authClient.signOut()
    router.push("/")
  }

  if (isPending) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="animate-pulse bg-muted/50" />
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!session?.user) {
    return null
  }

  const { name, email, image } = session.user

  // displays user initials in place of profile pictures
  const initials =
    name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  */
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="aria-expanded:bg-muted aria-expanded:text-foreground"
              />
            }
          >
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <MoonIcon />
                  Display Mode
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      System
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserIcon />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                disabled={isLoggingOut}
                onClick={() => void handleLogout()}
              >
                <LogOutIcon />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
