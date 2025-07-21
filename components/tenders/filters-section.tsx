"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search,
  Building2,
  Calendar as CalendarIcon,
  DollarSign,
  RotateCcw,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { TenderFilters, FilterStats } from "@/types/filters";

interface FiltersSectionProps {
  filters: TenderFilters;
  onFiltersChange: (filters: TenderFilters) => void;
  filterStats?: FilterStats;
  isLoading?: boolean;
}

const CLOSING_DATE_PRESETS = [
  { label: "This week", days: 7 },
  { label: "This month", days: 30 },
  { label: "3 months", days: 90 },
];

const CURRENCIES = [
  { value: "ZAR", label: "ZAR" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
];

export function FiltersSection({
  filters,
  onFiltersChange,
  filterStats,
  isLoading = false,
}: FiltersSectionProps) {
  const [localFilters, setLocalFilters] = useState<TenderFilters>(filters);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
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

    const newFilters = {
      ...localFilters,
      closingDateFrom: today,
      closingDateTo: futureDate,
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
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
    <div className="space-y-6">
      {/* Quick Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Opportunities
          </CardTitle>
          <CardDescription>
            Find procurement opportunities that match your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Status Row - Mobile Optimized */}
          <div className="space-y-4">
            {/* Search - Full width on mobile with better touch targets */}
            <div>
              <Label
                htmlFor="keyword"
                className="text-sm font-medium mb-2 block"
              >
                Search Keywords
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="keyword"
                  placeholder="Search titles and descriptions..."
                  value={localFilters.keyword || ""}
                  onChange={(e) => {
                    const newFilters = {
                      ...localFilters,
                      keyword: e.target.value || undefined,
                    };
                    setLocalFilters(newFilters);
                    // Auto-apply search as user types (debounced)
                    setTimeout(() => onFiltersChange(newFilters), 500);
                  }}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>

            {/* Status - Full width on mobile with better touch targets */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Status</Label>
              <Select
                value={localFilters.status || "active"}
                onValueChange={(value: "active" | "closed" | "all") => {
                  const newFilters = { ...localFilters, status: value };
                  setLocalFilters(newFilters);
                  onFiltersChange(newFilters);
                }}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="py-3">
                    <div className="flex items-center gap-3 w-full">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1">All Tenders</span>
                      {filterStats && (
                        <Badge variant="outline" className="text-xs">
                          {filterStats.totalCount}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                  <SelectItem value="active" className="py-3">
                    <div className="flex items-center gap-3 w-full">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="flex-1">Active</span>
                      {filterStats && (
                        <Badge variant="outline" className="text-xs">
                          {filterStats.activeCount}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                  <SelectItem value="closed" className="py-3">
                    <div className="flex items-center gap-3 w-full">
                      <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                      <span className="flex-1">Closed</span>
                      {filterStats && (
                        <Badge variant="outline" className="text-xs">
                          {filterStats.closedCount}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Date Filters - Mobile Optimized */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Quick Closing Date Filters
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {CLOSING_DATE_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  className="h-11 justify-start"
                  onClick={() => handleClosingDatePreset(preset.days)}
                >
                  <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Closing {preset.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Filters Toggle - Mobile Optimized */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full h-12 text-base">
                <Filter className="mr-3 h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">Advanced Filters</span>
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="mx-2 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
                {isAdvancedOpen ? (
                  <ChevronUp className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 mt-6">
              <Separator />

              {/* Advanced Filters Grid - Mobile First */}
              <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
                {/* Procuring Entity */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <Label className="font-semibold">Procuring Entity</Label>
                  </div>
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-3">
                    {filterStats?.procuringEntities
                      .slice(0, 10)
                      .map((entity) => (
                        <div
                          key={entity.value}
                          className="flex items-start space-x-3 py-1"
                        >
                          <Checkbox
                            id={`entity-${entity.value}`}
                            checked={
                              localFilters.procuringEntity?.includes(
                                entity.value
                              ) || false
                            }
                            onCheckedChange={(checked) => {
                              let newEntities =
                                localFilters.procuringEntity || [];
                              if (checked) {
                                newEntities = [...newEntities, entity.value];
                              } else {
                                newEntities = newEntities.filter(
                                  (e) => e !== entity.value
                                );
                              }
                              const newFilters = {
                                ...localFilters,
                                procuringEntity: newEntities.length
                                  ? newEntities
                                  : undefined,
                              };
                              setLocalFilters(newFilters);
                            }}
                            className="mt-0.5"
                          />
                          <Label
                            htmlFor={`entity-${entity.value}`}
                            className="text-sm cursor-pointer flex-1 flex items-start justify-between gap-2 leading-5"
                          >
                            <span className="flex-1 break-words">
                              {entity.label}
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-xs flex-shrink-0"
                            >
                              {entity.count}
                            </Badge>
                          </Label>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Procurement Category */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <Label className="font-semibold">Category</Label>
                  </div>
                  <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                    {filterStats?.procurementCategories
                      .slice(0, 10)
                      .map((category) => (
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
                              let newCategories =
                                localFilters.procurementCategory || [];
                              if (checked) {
                                newCategories = [
                                  ...newCategories,
                                  category.value,
                                ];
                              } else {
                                newCategories = newCategories.filter(
                                  (c) => c !== category.value
                                );
                              }
                              const newFilters = {
                                ...localFilters,
                                procurementCategory: newCategories.length
                                  ? newCategories
                                  : undefined,
                              };
                              setLocalFilters(newFilters);
                            }}
                          />
                          <Label
                            htmlFor={`category-${category.value}`}
                            className="text-sm cursor-pointer flex-1 flex items-center justify-between"
                          >
                            <span className="truncate">{category.label}</span>
                            <Badge variant="secondary" className="text-xs">
                              {category.count}
                            </Badge>
                          </Label>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Value Range */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <Label className="font-semibold">Value Range</Label>
                  </div>
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
                          <SelectItem
                            key={currency.value}
                            value={currency.value}
                          >
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-medium mb-1 block">
                          Min Value
                        </Label>
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
                          className="h-11 text-base"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-1 block">
                          Max Value
                        </Label>
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
                          className="h-11 text-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Ranges */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <Label className="font-semibold">Date Ranges</Label>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Closing Date Range
                      </Label>
                      <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">
                            From Date
                          </Label>
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
                                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">
                                  {localFilters.closingDateFrom
                                    ? format(
                                        localFilters.closingDateFrom,
                                        "MMM dd, yyyy"
                                      )
                                    : "Select start date"}
                                </span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
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
                          <Label className="text-xs text-muted-foreground mb-1 block">
                            To Date
                          </Label>
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
                                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">
                                  {localFilters.closingDateTo
                                    ? format(
                                        localFilters.closingDateTo,
                                        "MMM dd, yyyy"
                                      )
                                    : "Select end date"}
                                </span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
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
                </div>
              </div>

              {/* Action Buttons - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  disabled={isLoading}
                  className="h-12 sm:h-10"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset All Filters
                </Button>
                <Button
                  onClick={handleApplyFilters}
                  disabled={isLoading}
                  className="h-12 sm:h-10"
                >
                  Apply Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Active Filters Summary - Mobile Optimized */}
      {activeFilterCount > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium">
                Active Filters ({activeFilterCount}):
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {localFilters.keyword && (
                <Badge variant="secondary" className="text-xs py-1">
                  Search: &quot;
                  {localFilters.keyword.length > 20
                    ? localFilters.keyword.substring(0, 20) + "..."
                    : localFilters.keyword}
                  &quot;
                </Badge>
              )}
              {localFilters.status && localFilters.status !== "all" && (
                <Badge variant="secondary" className="text-xs py-1">
                  Status: {localFilters.status}
                </Badge>
              )}
              {localFilters.procuringEntity?.map((entity) => (
                <Badge
                  key={entity}
                  variant="secondary"
                  className="text-xs py-1"
                >
                  Entity:{" "}
                  {entity.length > 15
                    ? entity.substring(0, 15) + "..."
                    : entity}
                </Badge>
              ))}
              {localFilters.procurementCategory?.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="text-xs py-1"
                >
                  Category:{" "}
                  {category.length > 15
                    ? category.substring(0, 15) + "..."
                    : category}
                </Badge>
              ))}
              {(localFilters.valueMin !== undefined ||
                localFilters.valueMax !== undefined) && (
                <Badge variant="secondary" className="text-xs py-1">
                  Value: {localFilters.valueMin || 0} -{" "}
                  {localFilters.valueMax || "∞"}{" "}
                  {localFilters.valueCurrency || "ZAR"}
                </Badge>
              )}
              {(localFilters.closingDateFrom || localFilters.closingDateTo) && (
                <Badge variant="secondary" className="text-xs py-1">
                  Closing:{" "}
                  {localFilters.closingDateFrom?.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  -{" "}
                  {localFilters.closingDateTo?.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
