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
import { useRouter, useSearchParams } from "next/navigation";

interface TenderData {
  ocid: string;
  id: string | null;
  title: string;
  description: string | null;
  procurementMethod: string | null;
  procurementMethodDetails: string | null;
  mainProcurementCategory: string | null;
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
}

export function TendersListComponent({
  tenders,
  totalCount,
  currentPage,
}: TendersListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current dates from URL params or set defaults
  const getDefaultDates = () => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    return { from: sixMonthsAgo, to: today };
  };

  const defaultDates = getDefaultDates();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    searchParams.get("dateFrom")
      ? new Date(searchParams.get("dateFrom")!)
      : defaultDates.from
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    searchParams.get("dateTo")
      ? new Date(searchParams.get("dateTo")!)
      : defaultDates.to
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateDates = useCallback((): boolean => {
    setValidationError(null);

    if (!dateFrom || !dateTo) {
      setValidationError(
        "Please select both start and end dates to search for opportunities."
      );
      return false;
    }

    if (dateFrom > dateTo) {
      setValidationError("Start date cannot be later than end date.");
      return false;
    }

    const diffTime = Math.abs(dateTo.getTime() - dateFrom.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 730) {
      setValidationError(
        "Date range cannot exceed 2 years. Please select a shorter period."
      );
      return false;
    }

    return true;
  }, [dateFrom, dateTo]);

  const handleSearch = () => {
    if (!validateDates()) return;

    const params = new URLSearchParams();
    if (dateFrom) params.set("dateFrom", format(dateFrom, "yyyy-MM-dd"));
    if (dateTo) params.set("dateTo", format(dateTo, "yyyy-MM-dd"));
    params.set("page", "1");

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
          <Button onClick={() => router.refresh()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Opportunities</CardTitle>
            <CardDescription>
              Select a date range to find relevant procurement opportunities.
              Both dates are required.
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
                <Button onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  Find Opportunities
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
              Try expanding your date range or check back later for new
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
            <Badge variant="secondary">
              Page {currentPage} of {totalPages}
            </Badge>
          </div>

          {tenders.map((tender) => (
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
                      <CardTitle className="text-xl mb-2">
                        {tender.title}
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
                      <span>{tender.procuringEntity?.name || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Period:</span>
                      <span>
                        {formatDate(tender.startDate)} -{" "}
                        {formatDate(tender.endDate)}
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
                      OCID: {tender.ocid}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Released: {formatDate(tender.publishedDate)}
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}

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
