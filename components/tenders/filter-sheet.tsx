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
  X,
  RotateCcw,
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
              variant="secondary"
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Filter Opportunities</SheetTitle>
          <SheetDescription>
            Refine your search with advanced filtering options
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
          <div className="space-y-6 py-4">
            {/* Keyword Search */}
            <div className="space-y-2">
              <Label htmlFor="keyword">Keyword Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="keyword"
                  placeholder="Search titles and descriptions..."
                  value={localFilters.keyword || ""}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      keyword: e.target.value || undefined,
                    }))
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <Separator />

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Tender Status</Label>
              <Select
                value={localFilters.status || "all"}
                onValueChange={(value: "active" | "closed" | "all") =>
                  setLocalFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tenders</SelectItem>
                  <SelectItem value="active">
                    Active Only
                    {filterStats && (
                      <span className="ml-2 text-muted-foreground">
                        ({filterStats.activeCount})
                      </span>
                    )}
                  </SelectItem>
                  <SelectItem value="closed">
                    Closed Only
                    {filterStats && (
                      <span className="ml-2 text-muted-foreground">
                        ({filterStats.closedCount})
                      </span>
                    )}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Procuring Entity Filter */}
            <div className="space-y-2">
              <Label>Procuring Entity</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {filterStats?.procuringEntities.map((entity) => (
                  <div
                    key={entity.value}
                    className="flex items-center space-x-2"
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
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      <div className="flex items-center justify-between">
                        <span>{entity.label}</span>
                        {entity.count && (
                          <Badge variant="outline" className="text-xs">
                            {entity.count}
                          </Badge>
                        )}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Procurement Category Filter */}
            <div className="space-y-2">
              <Label>Procurement Category</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {filterStats?.procurementCategories.map((category) => (
                  <div
                    key={category.value}
                    className="flex items-center space-x-2"
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
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.label}</span>
                        {category.count && (
                          <Badge variant="outline" className="text-xs">
                            {category.count}
                          </Badge>
                        )}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Procurement Method Filter */}
            <div className="space-y-2">
              <Label>Procurement Method</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {filterStats?.procurementMethods.map((method) => (
                  <div
                    key={method.value}
                    className="flex items-center space-x-2"
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
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      <div className="flex items-center justify-between">
                        <span>{method.label}</span>
                        {method.count && (
                          <Badge variant="outline" className="text-xs">
                            {method.count}
                          </Badge>
                        )}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tender Value Range */}
            <div className="space-y-2">
              <Label>Tender Value Range</Label>
              <div className="space-y-3">
                <Select
                  value={localFilters.valueCurrency || "ZAR"}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      valueCurrency: value,
                    }))
                  }
                >
                  <SelectTrigger>
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
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="valueMin" className="text-xs">
                      Minimum
                    </Label>
                    <Input
                      id="valueMin"
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="valueMax" className="text-xs">
                      Maximum
                    </Label>
                    <Input
                      id="valueMax"
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
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Closing Date Filter */}
            <div className="space-y-2">
              <Label>Closing Date</Label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {CLOSING_DATE_PRESETS.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outline"
                      size="sm"
                      onClick={() => handleClosingDatePreset(preset.days)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">From Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
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
                  <div>
                    <Label className="text-xs">To Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
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
            <div className="space-y-2">
              <Label>Published Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
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
                <div>
                  <Label className="text-xs">To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
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
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleResetFilters}
            disabled={isLoading}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset All
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleApplyFilters} disabled={isLoading}>
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
