import type { TenderFilters } from "@/types/filters";

export function serializeFiltersToParams(
  filters: TenderFilters
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.keyword) {
    params.set("keyword", filters.keyword);
  }

  if (filters.procuringEntity?.length) {
    filters.procuringEntity.forEach((entity) => {
      params.append("procuringEntity", entity);
    });
  }

  if (filters.procurementCategory?.length) {
    filters.procurementCategory.forEach((category) => {
      params.append("procurementCategory", category);
    });
  }

  if (filters.procurementMethod?.length) {
    filters.procurementMethod.forEach((method) => {
      params.append("procurementMethod", method);
    });
  }

  if (filters.valueMin !== undefined) {
    params.set("valueMin", filters.valueMin.toString());
  }

  if (filters.valueMax !== undefined) {
    params.set("valueMax", filters.valueMax.toString());
  }

  if (filters.valueCurrency) {
    params.set("valueCurrency", filters.valueCurrency);
  }

  if (filters.closingDateFrom) {
    params.set(
      "closingDateFrom",
      filters.closingDateFrom.toISOString().split("T")[0]
    );
  }

  if (filters.closingDateTo) {
    params.set(
      "closingDateTo",
      filters.closingDateTo.toISOString().split("T")[0]
    );
  }

  if (filters.publishedDateFrom) {
    params.set(
      "publishedDateFrom",
      filters.publishedDateFrom.toISOString().split("T")[0]
    );
  }

  if (filters.publishedDateTo) {
    params.set(
      "publishedDateTo",
      filters.publishedDateTo.toISOString().split("T")[0]
    );
  }

  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }

  return params;
}

export function parseFiltersFromParams(
  searchParams: URLSearchParams
): TenderFilters {
  const filters: TenderFilters = {};

  const keyword = searchParams.get("keyword");
  if (keyword) filters.keyword = keyword;

  const procuringEntity = searchParams.getAll("procuringEntity");
  if (procuringEntity.length) filters.procuringEntity = procuringEntity;

  const procurementCategory = searchParams.getAll("procurementCategory");
  if (procurementCategory.length)
    filters.procurementCategory = procurementCategory;

  const procurementMethod = searchParams.getAll("procurementMethod");
  if (procurementMethod.length) filters.procurementMethod = procurementMethod;

  const valueMin = searchParams.get("valueMin");
  if (valueMin) filters.valueMin = Number(valueMin);

  const valueMax = searchParams.get("valueMax");
  if (valueMax) filters.valueMax = Number(valueMax);

  const valueCurrency = searchParams.get("valueCurrency");
  if (valueCurrency) filters.valueCurrency = valueCurrency;

  const closingDateFrom = searchParams.get("closingDateFrom");
  if (closingDateFrom) filters.closingDateFrom = new Date(closingDateFrom);

  const closingDateTo = searchParams.get("closingDateTo");
  if (closingDateTo) filters.closingDateTo = new Date(closingDateTo);

  const publishedDateFrom = searchParams.get("publishedDateFrom");
  if (publishedDateFrom)
    filters.publishedDateFrom = new Date(publishedDateFrom);

  const publishedDateTo = searchParams.get("publishedDateTo");
  if (publishedDateTo) filters.publishedDateTo = new Date(publishedDateTo);

  const status = searchParams.get("status");
  if (
    status &&
    (status === "active" || status === "closed" || status === "all")
  ) {
    filters.status = status;
  } else {
    filters.status = "active"; // Default to active
  }

  return filters;
}
