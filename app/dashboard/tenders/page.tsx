// REMOVED "use client" - This is now a Server Component!
import { db } from "@/db/drizzle";
import { tenders } from "@/db/schema";
import { TendersListComponent } from "./_components/tenders-list";
import { desc, sql, and, gte, lte } from "drizzle-orm";

export default async function TendersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Get search parameters
  const page = Number(searchParams.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  // Get date filters from search params or set defaults
  const getDefaultDates = () => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    return { from: sixMonthsAgo, to: today };
  };

  const defaultDates = getDefaultDates();
  const dateFrom = searchParams.dateFrom
    ? new Date(searchParams.dateFrom as string)
    : defaultDates.from;
  const dateTo = searchParams.dateTo
    ? new Date(searchParams.dateTo as string)
    : defaultDates.to;

  // Build where conditions
  const whereConditions = [];
  if (dateFrom) {
    whereConditions.push(gte(tenders.publishedDate, dateFrom));
  }
  if (dateTo) {
    whereConditions.push(lte(tenders.publishedDate, dateTo));
  }

  // Fetch data directly from Neon on the server
  const [tendersData, totalCountResult] = await Promise.all([
    db
      .select()
      .from(tenders)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(tenders.publishedDate)) // Sort by newest
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(tenders)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined),
  ]);

  const totalCount = totalCountResult[0]?.count || 0;

  // Pass the server-fetched data to a client component for interactivity
  return (
    <TendersListComponent
      tenders={tendersData}
      totalCount={totalCount}
      currentPage={page}
    />
  );
}
