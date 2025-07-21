import { TendersListComponent } from "./_components/tenders-list";
import { buildTenderQuery, getFilterStats } from "@/lib/tender-filters";
import type { TenderFilters } from "@/types/filters";

function parseSearchParams(searchParams: {
  [key: string]: string | string[] | undefined;
}): TenderFilters {
  const filters: TenderFilters = {};

  // Parse keyword
  if (searchParams.keyword && typeof searchParams.keyword === "string") {
    filters.keyword = searchParams.keyword;
  }

  // Parse arrays (procuring entities, categories, methods)
  if (searchParams.procuringEntity) {
    filters.procuringEntity = Array.isArray(searchParams.procuringEntity)
      ? searchParams.procuringEntity
      : [searchParams.procuringEntity];
  }

  if (searchParams.procurementCategory) {
    filters.procurementCategory = Array.isArray(
      searchParams.procurementCategory
    )
      ? searchParams.procurementCategory
      : [searchParams.procurementCategory];
  }

  if (searchParams.procurementMethod) {
    filters.procurementMethod = Array.isArray(searchParams.procurementMethod)
      ? searchParams.procurementMethod
      : [searchParams.procurementMethod];
  }

  // Parse value range
  if (searchParams.valueMin && typeof searchParams.valueMin === "string") {
    filters.valueMin = Number(searchParams.valueMin);
  }
  if (searchParams.valueMax && typeof searchParams.valueMax === "string") {
    filters.valueMax = Number(searchParams.valueMax);
  }
  if (
    searchParams.valueCurrency &&
    typeof searchParams.valueCurrency === "string"
  ) {
    filters.valueCurrency = searchParams.valueCurrency;
  }

  // Parse dates
  if (
    searchParams.closingDateFrom &&
    typeof searchParams.closingDateFrom === "string"
  ) {
    filters.closingDateFrom = new Date(searchParams.closingDateFrom);
  }
  if (
    searchParams.closingDateTo &&
    typeof searchParams.closingDateTo === "string"
  ) {
    filters.closingDateTo = new Date(searchParams.closingDateTo);
  }
  if (
    searchParams.publishedDateFrom &&
    typeof searchParams.publishedDateFrom === "string"
  ) {
    filters.publishedDateFrom = new Date(searchParams.publishedDateFrom);
  }
  if (
    searchParams.publishedDateTo &&
    typeof searchParams.publishedDateTo === "string"
  ) {
    filters.publishedDateTo = new Date(searchParams.publishedDateTo);
  }

  // Parse status
  if (searchParams.status && typeof searchParams.status === "string") {
    filters.status = searchParams.status as "active" | "closed" | "all";
  } else {
    // Default to active tenders
    filters.status = "active";
  }

  return filters;
}

export default async function TendersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = 20;
  const sortBy =
    (searchParams.sortBy as "publishedDate" | "endDate" | "value") ||
    "publishedDate";
  const sortOrder = (searchParams.sortOrder as "asc" | "desc") || "desc";

  const filters = parseSearchParams(searchParams);

  // Fetch data and filter stats in parallel
  const [queryResult, filterStats] = await Promise.all([
    buildTenderQuery({
      filters,
      page,
      limit,
      sortBy,
      sortOrder,
    }),
    getFilterStats(),
  ]);

  return (
    <TendersListComponent
      tenders={queryResult.tenders}
      totalCount={queryResult.totalCount}
      currentPage={queryResult.currentPage}
      filters={filters}
      filterStats={filterStats}
      sortBy={sortBy}
      sortOrder={sortOrder}
    />
  );
}
