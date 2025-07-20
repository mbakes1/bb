"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import UserProfile from "@/components/user-profile";
import {
  ChevronRight,
  HelpCircle,
  HomeIcon,
  LucideIcon,
  MessageSquare,
  Settings,
  Upload,
  Users,
  BarChart3,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  subItems?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    label: "Tenders",
    href: "/dashboard/tenders",
    icon: FileText,
  },
  {
    label: "Upload",
    href: "/dashboard/upload",
    icon: Upload,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics-coming-soon",
    icon: BarChart3,
  },
  {
    label: "Team",
    href: "/dashboard/team-coming-soon",
    icon: Users,
  },
];

const settingsItems: NavItem[] = [
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

const supportItems: NavItem[] = [
  {
    label: "Support",
    href: "/dashboard/support-coming-soon",
    icon: HelpCircle,
  },
  {
    label: "Feedback",
    href: "/dashboard/feedback-coming-soon",
    icon: MessageSquare,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (href: string) => {
    setOpenItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isOpen = openItems.includes(item.href);

    if (!hasSubItems) {
      return (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton asChild isActive={isActive}>
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    return (
      <Collapsible
        key={item.href}
        open={isOpen}
        onOpenChange={() => toggleItem(item.href)}
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton isActive={isActive}>
              <item.icon />
              <span>{item.label}</span>
              <ChevronRight
                className={`ml-auto transition-transform ${
                  isOpen ? "rotate-90" : ""
                }`}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.subItems?.map((subItem) => (
                <SidebarMenuSubItem key={subItem.href}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === subItem.href}
                  >
                    <Link href={subItem.href}>
                      <subItem.icon />
                      <span>{subItem.label}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="font-bold">B</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">BidBase</span>
                  <span className="truncate text-xs">Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{navItems.map(renderNavItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {supportItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <UserProfile />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
