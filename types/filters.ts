export interface TenderFilters {
  // Keyword search
  keyword?: string;

  // Procuring Entity filter
  procuringEntity?: string[];

  // Procurement Category filter
  procurementCategory?: string[];

  // Procurement Method filter
  procurementMethod?: string[];

  // Tender Value Range filter
  valueMin?: number;
  valueMax?: number;
  valueCurrency?: string;

  // Closing Date filter
  closingDateFrom?: Date;
  closingDateTo?: Date;

  // Status filter
  status?: "active" | "closed" | "all";

  // Published Date filter (existing)
  publishedDateFrom?: Date;
  publishedDateTo?: Date;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterStats {
  procuringEntities: FilterOption[];
  procurementCategories: FilterOption[];
  procurementMethods: FilterOption[];
  totalCount: number;
  activeCount: number;
  closedCount: number;
}

export interface TenderSearchParams {
  filters: TenderFilters;
  page: number;
  limit: number;
  sortBy?: "publishedDate" | "endDate" | "value";
  sortOrder?: "asc" | "desc";
}
