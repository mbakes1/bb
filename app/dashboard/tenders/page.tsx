"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarDays,
  Building2,
  FileText,
  Search,
  RefreshCw,
  Calendar as CalendarIcon,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Release, TendersResponse } from "@/types/tender";

export default function TendersPage() {
  // Set default dates: 6 months ago to today
  const getDefaultDates = () => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    return {
      from: sixMonthsAgo,
      to: today,
    };
  };

  const defaultDates = getDefaultDates();

  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(3000); // Fixed page size
  const [dateFrom, setDateFrom] = useState<Date | undefined>(defaultDates.from);
  const [dateTo, setDateTo] = useState<Date | undefined>(defaultDates.to);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateDates = (): boolean => {
    setValidationError(null);

    if (!dateFrom || !dateTo) {
      setValidationError(
        "Please select both start and end dates to search for tenders."
      );
      return false;
    }

    if (dateFrom > dateTo) {
      setValidationError("Start date cannot be later than end date.");
      return false;
    }

    // Check if date range is too large (more than 2 years)
    const diffTime = Math.abs(dateTo.getTime() - dateFrom.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 730) {
      setValidationError(
        "Date range cannot exceed 2 years. Please select a shorter period."
      );
      return false;
    }

    return true;
  };

  const loadTenders = async () => {
    if (!validateDates()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        PageNumber: currentPage.toString(),
        PageSize: pageSize.toString(),
        dateFrom: format(dateFrom!, "yyyy-MM-dd"),
        dateTo: format(dateTo!, "yyyy-MM-dd"),
      });

      const response = await fetch(`/api/tenders?${params}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("No tenders found for the selected date range.");
        } else if (response.status >= 500) {
          throw new Error("Server error occurred. Please try again later.");
        } else {
          throw new Error(
            `Request failed with status ${response.status}. Please check your connection and try again.`
          );
        }
      }

      const data: TendersResponse = await response.json();

      if (!data.releases || data.releases.length === 0) {
        setReleases([]);
        setError(
          "No tenders found for the selected date range. Try expanding your search period."
        );
      } else {
        setReleases(data.releases);
        setError(null);
      }
    } catch (err) {
      console.error("Error loading tenders:", err);
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError(
          "Network error: Unable to connect to the tender service. Please check your internet connection and try again."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while loading tenders. Please try again."
        );
      }
      setReleases([]);
    } finally {
      setLoading(false);
    }
  };

  // Load tenders on component mount and when page changes
  useEffect(() => {
    if (dateFrom && dateTo) {
      loadTenders();
    }
  }, [currentPage]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateString;
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

  const handleSearch = () => {
    if (!validateDates()) {
      return;
    }
    setCurrentPage(1);
    loadTenders();
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handleRefresh = () => {
    if (!validateDates()) {
      return;
    }
    loadTenders();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tenders</h1>
            <p className="text-muted-foreground">
              Browse and explore government tenders from the OCDS API
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Date Range Filter</CardTitle>
            <CardDescription>
              Select a date range to search for tenders. Both dates are
              required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  From Date *
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? (
                        format(dateFrom, "PPP")
                      ) : (
                        <span>Pick start date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  To Date *
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? (
                        format(dateTo, "PPP")
                      ) : (
                        <span>Pick end date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      disabled={(date) => {
                        if (date > new Date()) return true;
                        if (dateFrom && date < dateFrom) return true;
                        return false;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="mr-2 h-4 w-4" />
                  Search Tenders
                </Button>
              </div>
            </div>
            {validationError && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          <div className="text-center text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading tenders for{" "}
            {dateFrom &&
              dateTo &&
              `${format(dateFrom, "MMM dd")} - ${format(
                dateTo,
                "MMM dd, yyyy"
              )}`}
            ...
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results State */}
      {!loading && releases.length === 0 && !error && dateFrom && dateTo && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tenders found</h3>
            <p className="text-muted-foreground text-center mb-4">
              No tenders were found for the period {format(dateFrom, "MMM dd")}{" "}
              - {format(dateTo, "MMM dd, yyyy")}.
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Try expanding your date range or check back later for new tenders.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tenders List */}
      {!loading && releases.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found {releases.length} tender{releases.length !== 1 ? "s" : ""}{" "}
              for {format(dateFrom!, "MMM dd")} -{" "}
              {format(dateTo!, "MMM dd, yyyy")}
            </p>
            {releases.length === pageSize && (
              <Badge variant="secondary">
                Showing maximum {pageSize} results
              </Badge>
            )}
          </div>

          {releases.map((release) => {
            const tender = release.tender || {};
            const tenderPeriod = tender.tenderPeriod || {};
            const procuringEntity = tender.procuringEntity || {};
            const buyer = release.buyer || {};

            return (
              <Card
                key={release.ocid}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <Link
                  href={`/dashboard/tenders/${encodeURIComponent(
                    release.ocid
                  )}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {tender.title ||
                            tender.description ||
                            "Untitled Tender"}
                        </CardTitle>
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
                        <span>
                          {procuringEntity.name || buyer.name || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Period:</span>
                        <span>
                          {formatDate(tenderPeriod.startDate)} -{" "}
                          {formatDate(tenderPeriod.endDate)}
                        </span>
                      </div>
                      {tender.value?.amount && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Value:</span>
                          <span>
                            {formatCurrency(
                              tender.value.amount,
                              tender.value.currency
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        OCID: {release.ocid}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Released: {formatDate(release.date)}
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && releases.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} • {releases.length} results
            {releases.length === pageSize && " (maximum per page)"}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={releases.length < pageSize}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
