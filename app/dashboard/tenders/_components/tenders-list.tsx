"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterSheet } from "@/components/tenders/filter-sheet";
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
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
            <p className="text-muted-foreground">
              Discover and track procurement opportunities that match your
              business
            </p>
          </div>
          <div className="flex gap-2">
            <FilterSheet
              filters={filters}
              onFiltersChange={handleFiltersChange}
              filterStats={filterStats}
            />
            <Button onClick={() => router.refresh()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(filters.keyword ||
          filters.procuringEntity?.length ||
          filters.procurementCategory?.length ||
          filters.procurementMethod?.length ||
          filters.valueMin !== undefined ||
          filters.valueMax !== undefined ||
          filters.closingDateFrom ||
          filters.closingDateTo ||
          filters.publishedDateFrom ||
          filters.publishedDateTo ||
          (filters.status && filters.status !== "all")) && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {filters.keyword && (
                  <Badge variant="secondary">
                    Keyword: "{filters.keyword}"
                  </Badge>
                )}
                {filters.procuringEntity?.map((entity) => (
                  <Badge key={entity} variant="secondary">
                    Entity: {entity}
                  </Badge>
                ))}
                {filters.procurementCategory?.map((category) => (
                  <Badge key={category} variant="secondary">
                    Category: {category}
                  </Badge>
                ))}
                {filters.procurementMethod?.map((method) => (
                  <Badge key={method} variant="secondary">
                    Method: {method}
                  </Badge>
                ))}
                {(filters.valueMin !== undefined ||
                  filters.valueMax !== undefined) && (
                  <Badge variant="secondary">
                    Value: {filters.valueMin || 0} - {filters.valueMax || "∞"}{" "}
                    {filters.valueCurrency || "ZAR"}
                  </Badge>
                )}
                {(filters.closingDateFrom || filters.closingDateTo) && (
                  <Badge variant="secondary">
                    Closing: {filters.closingDateFrom?.toLocaleDateString()} -{" "}
                    {filters.closingDateTo?.toLocaleDateString()}
                  </Badge>
                )}
                {(filters.publishedDateFrom || filters.publishedDateTo) && (
                  <Badge variant="secondary">
                    Published: {filters.publishedDateFrom?.toLocaleDateString()}{" "}
                    - {filters.publishedDateTo?.toLocaleDateString()}
                  </Badge>
                )}
                {filters.status && filters.status !== "all" && (
                  <Badge variant="secondary">Status: {filters.status}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found {totalCount} opportunit{totalCount !== 1 ? "ies" : "y"}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[140px]">
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
              <Badge variant="secondary">
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
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">
                            {tender.title}
                          </CardTitle>
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
                        </div>
                        <CardDescription className="line-clamp-2">
                          {tender.description || "No description available"}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        {tender.procurementMethodDetails ||
                          tender.procurementMethod ||
                          "N/A"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Procuring Entity:</span>
                        <span className="truncate">
                          {tender.procuringEntity?.name || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Closing:</span>
                        <span
                          className={cn(
                            "truncate",
                            tender.endDate && tender.endDate < new Date()
                              ? "text-red-600"
                              : tender.endDate &&
                                tender.endDate <
                                  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                              ? "text-orange-600"
                              : ""
                          )}
                        >
                          {formatDate(tender.endDate)}
                        </span>
                      </div>
                      {tender.value?.amount && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Value:</span>
                          <span className="truncate">
                            {formatCurrency(
                              tender.value.amount,
                              tender.value.currency
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    {tender.mainProcurementCategory && (
                      <div className="mt-3">
                        <Badge variant="outline" className="text-xs">
                          {tender.mainProcurementCategory}
                        </Badge>
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
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

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} • {totalCount} total results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
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
