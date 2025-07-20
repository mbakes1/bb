"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import UserProfile from "@/components/user-profile";
import {
  BarChart3,
  HelpCircle,
  HomeIcon,
  LucideIcon,
  MessageCircleIcon,
  MessageSquare,
  Settings,
  Upload,
  Users,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    label: "Chat",
    href: "/dashboard/chat",
    icon: MessageCircleIcon,
  },
  {
    label: "Upload",
    href: "/dashboard/upload",
    icon: Upload,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    label: "Team",
    href: "/dashboard/team",
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
    href: "/dashboard/support",
    icon: HelpCircle,
  },
  {
    label: "Feedback",
    href: "/dashboard/feedback",
    icon: MessageSquare,
  },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <Link href="/" onClick={() => setOpen(false)}>
            <SheetTitle className="flex items-center gap-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="font-bold">B</span>
              </div>
              BidBase
            </SheetTitle>
          </Link>
        </SheetHeader>

        <div className="flex flex-col space-y-3 mt-6">
          <div className="px-2 py-2">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
              Navigation
            </h2>
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <Separator />

          <div className="px-2 py-2">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
              Configuration
            </h2>
            <div className="space-y-1">
              {settingsItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <Separator />

          <div className="px-2 py-2">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
              Support
            </h2>
            <div className="space-y-1">
              {supportItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <Separator />

          <div className="mt-auto px-2">
            <UserProfile />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
