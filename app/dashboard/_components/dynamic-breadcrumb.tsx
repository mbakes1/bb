"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";

const routeLabels: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/upload": "Upload",
  "/dashboard/settings": "Settings",
};

// Function to generate breadcrumb label for coming-soon routes
function getComingSoonLabel(pathname: string): string {
  if (pathname.includes("-coming-soon")) {
    const section =
      pathname.split("/").pop()?.replace("-coming-soon", "") || "feature";
    const featureName = section
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return `${featureName} - Coming Soon`;
  }
  return "Coming Soon";
}

export default function DynamicBreadcrumb() {
  const pathname = usePathname();
  const currentLabel =
    routeLabels[pathname] ||
    (pathname.includes("coming-soon")
      ? getComingSoonLabel(pathname)
      : "Overview");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
