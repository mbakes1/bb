import { ReactNode } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import MobileNav from "./_components/mobile-nav";
import { Separator } from "@/components/ui/separator";
import UserProfile from "@/components/user-profile";
import DynamicBreadcrumb from "./_components/dynamic-breadcrumb";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
          <div className="flex items-center gap-2 px-4 flex-1">
            <SidebarTrigger className="-ml-1 hidden md:flex" />
            <MobileNav />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 hidden md:block"
            />
            <DynamicBreadcrumb />
          </div>
          <div className="flex items-center gap-2 px-4 md:hidden">
            <UserProfile mini={true} />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
