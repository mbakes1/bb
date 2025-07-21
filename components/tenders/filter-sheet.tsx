"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Filter,
  Search,
  Building2,
  Calendar as CalendarIcon,
  DollarSign,
  RotateCcw,
  FileText,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { TenderFilters, FilterStats } from "@/types/filters";

interface FilterSheetProps {
  filters: TenderFilters;
  onFiltersChange: (filters: TenderFilters) => void;
  filterStats?: FilterStats;
  isLoading?: boolean;
}

const CLOSING_DATE_PRESETS = [
  { label: "Closing this week", days: 7 },
  { label: "Closing this month", days: 30 },
  { label: "Closing in 3 months", days: 90 },
];

const CURRENCIES = [
  { value: "ZAR", label: "South African Rand (ZAR)" },
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
];

export function FilterSheet({
  filters,
  onFiltersChange,
  filterStats,
  isLoading = false,
}: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<TenderFilters>(filters);
  const [isOpen, setIsOpen] = useState(false);

  // Sync local filters with prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters: TenderFilters = {
      status: "active",
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const handleClosingDatePreset = (days: number) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    setLocalFilters((prev) => ({
      ...prev,
      closingDateFrom: today,
      closingDateTo: futureDate,
    }));
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.keyword) count++;
    if (localFilters.procuringEntity?.length) count++;
    if (localFilters.procurementCategory?.length) count++;
    if (localFilters.procurementMethod?.length) count++;
    if (localFilters.valueMin || localFilters.valueMax) count++;
    if (localFilters.closingDateFrom || localFilters.closingDateTo) count++;
    if (localFilters.publishedDateFrom || localFilters.publishedDateTo) count++;
    if (localFilters.status && localFilters.status !== "all") count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Advanced Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="default"
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[500px] sm:w-[650px] lg:w-[750px]">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-xl flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Opportunities
          </SheetTitle>
          <SheetDescription className="text-base">
            Use advanced filters to find the most relevant procurement
            opportunities for your business
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] pr-4">
          <div className="space-y-8 pb-6">
            {/* Keyword Search */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">
                  Keyword Search
                </Label>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search in titles and descriptions..."
                  value={localFilters.keyword || ""}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      keyword: e.target.value || undefined,
                    }))
                  }
                  className="pl-10 h-11"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Search across tender titles and descriptions for relevant
                keywords
              </p>
            </div>

            <Separator />

            {/* Status Filter */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">Tender Status</Label>
              </div>
              <Select
                value={localFilters.status || "active"}
                onValueChange={(value: "active" | "closed" | "all") =>
                  setLocalFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      All Tenders
                      {filterStats && (
                        <Badge variant="outline" className="ml-2">
                          {filterStats.totalCount}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Active Only
                      {filterStats && (
                        <Badge variant="outline" className="ml-2">
                          {filterStats.activeCount}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                  <SelectItem value="closed">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Closed Only
                      {filterStats && (
                        <Badge variant="outline" className="ml-2">
                          {filterStats.closedCount}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Procuring Entity Filter */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">
                  Procuring Entity
                </Label>
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                {filterStats?.procuringEntities.slice(0, 20).map((entity) => (
                  <div
                    key={entity.value}
                    className="flex items-center space-x-3"
                  >
                    <Checkbox
                      id={`entity-${entity.value}`}
                      checked={
                        localFilters.procuringEntity?.includes(entity.value) ||
                        false
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setLocalFilters((prev) => ({
                            ...prev,
                            procuringEntity: [
                              ...(prev.procuringEntity || []),
                              entity.value,
                            ],
                          }));
                        } else {
                          setLocalFilters((prev) => ({
                            ...prev,
                            procuringEntity: prev.procuringEntity?.filter(
                              (e) => e !== entity.value
                            ),
                          }));
                        }
                      }}
                    />
                    <Label
                      htmlFor={`entity-${entity.value}`}
                      className="text-sm font-normal cursor-pointer flex-1 flex items-center justify-between"
                    >
                      <span className="truncate">{entity.label}</span>
                      {entity.count && (
                        <Badge variant="secondary" className="text-xs ml-2">
                          {entity.count}
                        </Badge>
                      )}
                    </Label>
                  </div>
                ))}
                {!filterStats?.procuringEntities.length && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No procuring entities available
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Procurement Category Filter */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">
                  Procurement Category
                </Label>
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                {filterStats?.procurementCategories
                  .slice(0, 20)
                  .map((category) => (
                    <div
                      key={category.value}
                      className="flex items-center space-x-3"
                    >
                      <Checkbox
                        id={`category-${category.value}`}
                        checked={
                          localFilters.procurementCategory?.includes(
                            category.value
                          ) || false
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setLocalFilters((prev) => ({
                              ...prev,
                              procurementCategory: [
                                ...(prev.procurementCategory || []),
                                category.value,
                              ],
                            }));
                          } else {
                            setLocalFilters((prev) => ({
                              ...prev,
                              procurementCategory:
                                prev.procurementCategory?.filter(
                                  (c) => c !== category.value
                                ),
                            }));
                          }
                        }}
                      />
                      <Label
                        htmlFor={`category-${category.value}`}
                        className="text-sm font-normal cursor-pointer flex-1 flex items-center justify-between"
                      >
                        <span className="truncate">{category.label}</span>
                        {category.count && (
                          <Badge variant="secondary" className="text-xs ml-2">
                            {category.count}
                          </Badge>
                        )}
                      </Label>
                    </div>
                  ))}
                {!filterStats?.procurementCategories.length && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No procurement categories available
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Procurement Method Filter */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">
                  Procurement Method
                </Label>
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                {filterStats?.procurementMethods.slice(0, 20).map((method) => (
                  <div
                    key={method.value}
                    className="flex items-center space-x-3"
                  >
                    <Checkbox
                      id={`method-${method.value}`}
                      checked={
                        localFilters.procurementMethod?.includes(
                          method.value
                        ) || false
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setLocalFilters((prev) => ({
                            ...prev,
                            procurementMethod: [
                              ...(prev.procurementMethod || []),
                              method.value,
                            ],
                          }));
                        } else {
                          setLocalFilters((prev) => ({
                            ...prev,
                            procurementMethod: prev.procurementMethod?.filter(
                              (m) => m !== method.value
                            ),
                          }));
                        }
                      }}
                    />
                    <Label
                      htmlFor={`method-${method.value}`}
                      className="text-sm font-normal cursor-pointer flex-1 flex items-center justify-between"
                    >
                      <span className="truncate">{method.label}</span>
                      {method.count && (
                        <Badge variant="secondary" className="text-xs ml-2">
                          {method.count}
                        </Badge>
                      )}
                    </Label>
                  </div>
                ))}
                {!filterStats?.procurementMethods.length && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No procurement methods available
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Tender Value Range */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">
                  Tender Value Range
                </Label>
              </div>
              <div className="space-y-4">
                <Select
                  value={localFilters.valueCurrency || "ZAR"}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      valueCurrency: value,
                    }))
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Minimum Value</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={localFilters.valueMin || ""}
                      onChange={(e) =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          valueMin: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        }))
                      }
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Maximum Value</Label>
                    <Input
                      type="number"
                      placeholder="No limit"
                      value={localFilters.valueMax || ""}
                      onChange={(e) =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          valueMax: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        }))
                      }
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Closing Date Filter */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">Closing Date</Label>
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {CLOSING_DATE_PRESETS.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outline"
                      size="sm"
                      onClick={() => handleClosingDatePreset(preset.days)}
                      className="h-9"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">From Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-11",
                            !localFilters.closingDateFrom &&
                              "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {localFilters.closingDateFrom ? (
                            format(localFilters.closingDateFrom, "PPP")
                          ) : (
                            <span>Pick date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={localFilters.closingDateFrom}
                          onSelect={(date) =>
                            setLocalFilters((prev) => ({
                              ...prev,
                              closingDateFrom: date,
                            }))
                          }
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">To Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-11",
                            !localFilters.closingDateTo &&
                              "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {localFilters.closingDateTo ? (
                            format(localFilters.closingDateTo, "PPP")
                          ) : (
                            <span>Pick date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={localFilters.closingDateTo}
                          onSelect={(date) =>
                            setLocalFilters((prev) => ({
                              ...prev,
                              closingDateTo: date,
                            }))
                          }
                          disabled={(date) => {
                            if (
                              localFilters.closingDateFrom &&
                              date < localFilters.closingDateFrom
                            )
                              return true;
                            return date < new Date();
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Published Date Filter */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">
                  Published Date Range
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-11",
                          !localFilters.publishedDateFrom &&
                            "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {localFilters.publishedDateFrom ? (
                          format(localFilters.publishedDateFrom, "PPP")
                        ) : (
                          <span>Pick date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={localFilters.publishedDateFrom}
                        onSelect={(date) =>
                          setLocalFilters((prev) => ({
                            ...prev,
                            publishedDateFrom: date,
                          }))
                        }
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-11",
                          !localFilters.publishedDateTo &&
                            "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {localFilters.publishedDateTo ? (
                          format(localFilters.publishedDateTo, "PPP")
                        ) : (
                          <span>Pick date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={localFilters.publishedDateTo}
                        onSelect={(date) =>
                          setLocalFilters((prev) => ({
                            ...prev,
                            publishedDateTo: date,
                          }))
                        }
                        disabled={(date) => {
                          if (date > new Date()) return true;
                          if (
                            localFilters.publishedDateFrom &&
                            date < localFilters.publishedDateFrom
                          )
                            return true;
                          return false;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t bg-background">
          <Button
            variant="outline"
            onClick={handleResetFilters}
            disabled={isLoading}
            className="h-11"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset All
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="h-11 min-w-[120px]"
            >
              Apply Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
