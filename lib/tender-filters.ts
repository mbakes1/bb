import { db } from "@/db/drizzle";
import { tenders } from "@/db/schema";
import {
  and,
  or,
  gte,
  lte,
  ilike,
  sql,
  desc,
  asc,
  isNotNull,
  eq,
} from "drizzle-orm";
import type {
  TenderFilters,
  FilterStats,
  TenderSearchParams,
} from "@/types/filters";

export async function buildTenderQuery(searchParams: TenderSearchParams) {
  const {
    filters,
    page,
    limit,
    sortBy = "publishedDate",
    sortOrder = "desc",
  } = searchParams;
  const offset = (page - 1) * limit;

  // Build where conditions
  const whereConditions = [];

  // Keyword search - search in title and description
  if (filters.keyword) {
    const keywordCondition = or(
      ilike(tenders.title, `%${filters.keyword}%`),
      ilike(tenders.description, `%${filters.keyword}%`)
    );
    whereConditions.push(keywordCondition);
  }

  // Procuring Entity filter
  if (filters.procuringEntity?.length) {
    const entityConditions = filters.procuringEntity.map(
      (entity) =>
        sql`${tenders.procuringEntity}->>'name' ILIKE ${`%${entity}%`}`
    );
    whereConditions.push(or(...entityConditions));
  }

  // Procurement Category filter
  if (filters.procurementCategory?.length) {
    const categoryConditions = filters.procurementCategory.map((category) =>
      ilike(tenders.mainProcurementCategory, `%${category}%`)
    );
    whereConditions.push(or(...categoryConditions));
  }

  // Procurement Method filter
  if (filters.procurementMethod?.length) {
    const methodConditions = filters.procurementMethod.map((method) =>
      or(
        ilike(tenders.procurementMethod, `%${method}%`),
        ilike(tenders.procurementMethodDetails, `%${method}%`)
      )
    );
    whereConditions.push(or(...methodConditions));
  }

  // Tender Value Range filter
  if (filters.valueMin !== undefined || filters.valueMax !== undefined) {
    const valueConditions = [];

    if (filters.valueMin !== undefined) {
      valueConditions.push(
        sql`CAST(${tenders.value}->>'amount' AS NUMERIC) >= ${filters.valueMin}`
      );
    }

    if (filters.valueMax !== undefined) {
      valueConditions.push(
        sql`CAST(${tenders.value}->>'amount' AS NUMERIC) <= ${filters.valueMax}`
      );
    }

    // Currency filter
    if (filters.valueCurrency) {
      valueConditions.push(
        sql`${tenders.value}->>'currency' = ${filters.valueCurrency}`
      );
    }

    if (valueConditions.length > 0) {
      whereConditions.push(and(...valueConditions));
    }
  }

  // Closing Date filter
  if (filters.closingDateFrom) {
    whereConditions.push(gte(tenders.endDate, filters.closingDateFrom));
  }
  if (filters.closingDateTo) {
    whereConditions.push(lte(tenders.endDate, filters.closingDateTo));
  }

  // Published Date filter
  if (filters.publishedDateFrom) {
    whereConditions.push(gte(tenders.publishedDate, filters.publishedDateFrom));
  }
  if (filters.publishedDateTo) {
    whereConditions.push(lte(tenders.publishedDate, filters.publishedDateTo));
  }

  // Status filter
  if (filters.status === "active") {
    whereConditions.push(
      or(gte(tenders.endDate, new Date()), eq(tenders.status, "active"))
    );
  } else if (filters.status === "closed") {
    whereConditions.push(
      or(lte(tenders.endDate, new Date()), eq(tenders.status, "closed"))
    );
  }

  // Build sort condition
  let orderBy;
  switch (sortBy) {
    case "endDate":
      orderBy =
        sortOrder === "asc" ? asc(tenders.endDate) : desc(tenders.endDate);
      break;
    case "value":
      orderBy =
        sortOrder === "asc"
          ? sql`CAST(${tenders.value}->>'amount' AS NUMERIC) ASC NULLS LAST`
          : sql`CAST(${tenders.value}->>'amount' AS NUMERIC) DESC NULLS LAST`;
      break;
    default:
      orderBy =
        sortOrder === "asc"
          ? asc(tenders.publishedDate)
          : desc(tenders.publishedDate);
  }

  const whereClause =
    whereConditions.length > 0 ? and(...whereConditions) : undefined;

  // Execute queries
  const [tendersData, totalCountResult] = await Promise.all([
    db
      .select()
      .from(tenders)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(tenders)
      .where(whereClause),
  ]);

  const totalCount = totalCountResult[0]?.count || 0;

  return {
    tenders: tendersData,
    totalCount,
    currentPage: page,
  };
}

export async function getFilterStats(): Promise<FilterStats> {
  // Get procuring entities with counts
  const procuringEntitiesResult = await db
    .select({
      name: sql<string>`${tenders.procuringEntity}->>'name'`,
      count: sql<number>`count(*)`,
    })
    .from(tenders)
    .where(isNotNull(tenders.procuringEntity))
    .groupBy(sql`${tenders.procuringEntity}->>'name'`)
    .orderBy(sql`count(*) DESC`)
    .limit(50);

  // Get procurement categories with counts
  const procurementCategoriesResult = await db
    .select({
      category: tenders.mainProcurementCategory,
      count: sql<number>`count(*)`,
    })
    .from(tenders)
    .where(isNotNull(tenders.mainProcurementCategory))
    .groupBy(tenders.mainProcurementCategory)
    .orderBy(sql`count(*) DESC`)
    .limit(50);

  // Get procurement methods with counts
  const procurementMethodsResult = await db
    .select({
      method: tenders.procurementMethodDetails,
      count: sql<number>`count(*)`,
    })
    .from(tenders)
    .where(isNotNull(tenders.procurementMethodDetails))
    .groupBy(tenders.procurementMethodDetails)
    .orderBy(sql`count(*) DESC`)
    .limit(50);

  // Get status counts
  const [totalCountResult, activeCountResult, closedCountResult] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(tenders),
      db
        .select({ count: sql<number>`count(*)` })
        .from(tenders)
        .where(
          or(gte(tenders.endDate, new Date()), eq(tenders.status, "active"))
        ),
      db
        .select({ count: sql<number>`count(*)` })
        .from(tenders)
        .where(
          or(lte(tenders.endDate, new Date()), eq(tenders.status, "closed"))
        ),
    ]);

  return {
    procuringEntities: procuringEntitiesResult
      .filter((item) => item.name)
      .map((item) => ({
        value: item.name!,
        label: item.name!,
        count: item.count,
      })),
    procurementCategories: procurementCategoriesResult
      .filter((item) => item.category)
      .map((item) => ({
        value: item.category!,
        label: item.category!,
        count: item.count,
      })),
    procurementMethods: procurementMethodsResult
      .filter((item) => item.method)
      .map((item) => ({
        value: item.method!,
        label: item.method!,
        count: item.count,
      })),
    totalCount: totalCountResult[0]?.count || 0,
    activeCount: activeCountResult[0]?.count || 0,
    closedCount: closedCountResult[0]?.count || 0,
  };
}
