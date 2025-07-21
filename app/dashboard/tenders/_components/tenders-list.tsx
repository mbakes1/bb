"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  Building2,
  FileText,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiltersSection } from "@/components/tenders/filters-section";
import { serializeFiltersToParams } from "@/lib/url-params";
import type { TenderFilters, FilterStats } from "@/types/filters";

interface TenderData {
  ocid: string;
  id: string | null;
  title: string;
  description: string | null;
  procurementMethod: string | null;
  procurementMethodDetails: string | null;
  mainProcurementCategory: string | null;
  status: string | null;
  publishedDate: Date | null;
  startDate: Date | null;
  endDate: Date | null;
  procuringEntity: { id?: string; name?: string } | null;
  value: { amount?: number; currency?: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TendersListProps {
  tenders: TenderData[];
  totalCount: number;
  currentPage: number;
  filters: TenderFilters;
  filterStats: FilterStats;
  sortBy: "publishedDate" | "endDate" | "value";
  sortOrder: "asc" | "desc";
}

export function TendersListComponent({
  tenders,
  totalCount,
  currentPage,
  filters,
  filterStats,
  sortBy,
  sortOrder,
}: TendersListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFiltersChange = (newFilters: TenderFilters) => {
    const params = serializeFiltersToParams(newFilters);

    // Reset to first page
    params.set("page", "1");

    // Preserve sort parameters
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);

    router.push(`/dashboard/tenders?${params.toString()}`);
  };

  const handleSortChange = (newSortBy: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // If same sort field, toggle order; otherwise use desc as default
    const newSortOrder =
      newSortBy === sortBy && sortOrder === "desc" ? "asc" : "desc";

    params.set("sortBy", newSortBy);
    params.set("sortOrder", newSortOrder);
    params.set("page", "1"); // Reset to first page

    router.push(`/dashboard/tenders?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/dashboard/tenders?${params.toString()}`);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    try {
      return date.toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount && amount !== 0) return "N/A";
    const currencyCode = currency || "ZAR";
    try {
      return new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: currencyCode,
      }).format(amount);
    } catch {
      return `${currencyCode} ${amount.toLocaleString()}`;
    }
  };

  const getTenderStatus = (tender: TenderData) => {
    if (tender.status) return tender.status;
    if (tender.endDate && tender.endDate < new Date()) return "closed";
    return "active";
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Page Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Opportunities
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover and track procurement opportunities that match your
            business
          </p>
        </div>
        <Button
          onClick={() => router.refresh()}
          className="self-start sm:self-auto"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters Section */}
      <FiltersSection
        filters={filters}
        onFiltersChange={handleFiltersChange}
        filterStats={filterStats}
      />

      {/* Results */}
      {tenders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No opportunities found
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              No opportunities were found for the selected criteria.
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Try adjusting your filters or check back later for new
              opportunities.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Results Header - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Found {totalCount} opportunit{totalCount !== 1 ? "ies" : "y"}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full sm:w-[140px] h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publishedDate">
                      <div className="flex items-center">
                        Published Date
                        {getSortIcon("publishedDate")}
                      </div>
                    </SelectItem>
                    <SelectItem value="endDate">
                      <div className="flex items-center">
                        Closing Date
                        {getSortIcon("endDate")}
                      </div>
                    </SelectItem>
                    <SelectItem value="value">
                      <div className="flex items-center">
                        Value
                        {getSortIcon("value")}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="secondary" className="self-start sm:self-center">
                Page {currentPage} of {totalPages}
              </Badge>
            </div>
          </div>

          {tenders.map((tender) => {
            const status = getTenderStatus(tender);
            const isActive = status === "active";

            return (
              <Card
                key={tender.ocid}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <Link
                  href={`/dashboard/tenders/${encodeURIComponent(tender.ocid)}`}
                >
                  <CardHeader className="pb-4">
                    <div className="space-y-3">
                      {/* Title and Status Row - Mobile Optimized */}
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg sm:text-xl leading-tight break-words">
                            {tender.title}
                          </CardTitle>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <Badge
                            variant={isActive ? "default" : "secondary"}
                            className={cn(
                              "text-xs",
                              isActive
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : ""
                            )}
                          >
                            {status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {tender.procurementMethodDetails ||
                              tender.procurementMethod ||
                              "N/A"}
                          </Badge>
                        </div>
                      </div>

                      {/* Description */}
                      <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                        {tender.description || "No description available"}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Info Grid - Mobile Optimized */}
                    <div className="space-y-3 text-sm">
                      {/* Procuring Entity */}
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-muted-foreground">
                            Procuring Entity:
                          </span>
                          <div className="break-words">
                            {tender.procuringEntity?.name || "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Closing Date */}
                      <div className="flex items-start gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-muted-foreground">
                            Closing Date:
                          </span>
                          <div
                            className={cn(
                              "break-words",
                              tender.endDate && tender.endDate < new Date()
                                ? "text-red-600 font-medium"
                                : tender.endDate &&
                                  tender.endDate <
                                    new Date(
                                      Date.now() + 7 * 24 * 60 * 60 * 1000
                                    )
                                ? "text-orange-600 font-medium"
                                : ""
                            )}
                          >
                            {formatDate(tender.endDate)}
                          </div>
                        </div>
                      </div>

                      {/* Value */}
                      {tender.value?.amount && (
                        <div className="flex items-start gap-2">
                          <span className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0">
                            💰
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-muted-foreground">
                              Value:
                            </span>
                            <div className="break-words font-medium">
                              {formatCurrency(
                                tender.value.amount,
                                tender.value.currency
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Category Badge */}
                    {tender.mainProcurementCategory && (
                      <div className="mt-4">
                        <Badge variant="outline" className="text-xs">
                          {tender.mainProcurementCategory}
                        </Badge>
                      </div>
                    )}

                    {/* Footer Info - Mobile Stacked */}
                    <div className="mt-4 pt-3 border-t space-y-1 sm:flex sm:items-center sm:justify-between sm:space-y-0">
                      <div className="text-xs text-muted-foreground break-all">
                        OCID: {tender.ocid}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Published: {formatDate(tender.publishedDate)}
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}

          {/* Pagination - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-muted-foreground text-center sm:text-left">
              Page {currentPage} of {totalPages} • {totalCount} total results
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="h-10 px-4"
              >
                Previous
              </Button>
              <div className="flex items-center px-3 py-2 text-sm font-medium bg-muted rounded-md">
                {currentPage}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="h-10 px-4"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
