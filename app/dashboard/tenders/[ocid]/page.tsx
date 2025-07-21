// REMOVED "use client" - This is now a Server Component!
import { db } from "@/db/drizzle";
import { tenders, tenderDocuments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { TenderDetailComponent } from "./_components/tender-detail";

export default async function TenderDetailPage({
  params,
}: {
  params: { ocid: string };
}) {
  const { ocid } = params;

  if (!ocid) {
    notFound();
  }

  // Fetch the tender and its documents in parallel from Neon
  const [tenderData, documentsData] = await Promise.all([
    db.select().from(tenders).where(eq(tenders.ocid, ocid)).limit(1),
    db
      .select()
      .from(tenderDocuments)
      .where(eq(tenderDocuments.tenderOcid, ocid)),
  ]);

  const tender = tenderData[0];

  if (!tender) {
    notFound();
  }

  return <TenderDetailComponent tender={tender} documents={documentsData} />;
}
