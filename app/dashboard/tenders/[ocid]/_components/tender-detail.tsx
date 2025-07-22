"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  FileText,
  Download,
} from "lucide-react";

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

interface DocumentData {
  id: number;
  tenderOcid: string;
  documentId: string | null;
  title: string | null;
  description: string | null;
  url: string | null;
  format: string | null;
  datePublished: Date | null;
  dateModified: Date | null;
}

interface TenderDetailProps {
  tender: TenderData;
  documents: DocumentData[];
}

export function TenderDetailComponent({
  tender,
  documents,
}: TenderDetailProps) {
  const router = useRouter();

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

  const getTenderStatus = (tender: TenderData) => {
    if (tender.endDate && tender.endDate < new Date()) return "closed";
    return "active";
  };

  const status = getTenderStatus(tender);
  const isActive = status === "active";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Opportunities
        </Button>
      </div>

      {/* Main Details */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Description - Primary Focus */}
              <CardTitle className="text-lg mb-3 leading-relaxed font-normal">
                {tender.description || "No description available"}
              </CardTitle>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className={
                    isActive
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : ""
                  }
                >
                  {status.toUpperCase()}
                </Badge>
                {tender.procurementMethodDetails && (
                  <Badge variant="outline">
                    {tender.procurementMethodDetails}
                  </Badge>
                )}
              </div>
              {/* Reference ID - Secondary */}
              <p className="text-sm text-muted-foreground font-mono">
                {tender.title}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />

          {/* Essential Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Procuring Entity */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Procuring Entity
              </div>
              <p className="text-sm pl-6">
                {tender.procuringEntity?.name || "Not specified"}
              </p>
            </div>

            {/* Procurement Method */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Procurement Method
              </div>
              <p className="text-sm pl-6">
                {tender.procurementMethodDetails ||
                  tender.procurementMethod ||
                  "Not specified"}
              </p>
            </div>

            {/* Tender Period */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                Tender Period
              </div>
              <div className="text-sm pl-6 space-y-1">
                {tender.startDate && (
                  <div>
                    <span className="text-muted-foreground">Opens: </span>
                    <span>{formatDate(tender.startDate)}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Closes: </span>
                  <span
                    className={
                      tender.endDate && tender.endDate < new Date()
                        ? "text-red-600 font-medium"
                        : tender.endDate &&
                          tender.endDate <
                            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        ? "text-orange-600 font-medium"
                        : ""
                    }
                  >
                    {formatDate(tender.endDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Category */}
            {tender.mainProcurementCategory && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Category
                </div>
                <p className="text-sm pl-6">{tender.mainProcurementCategory}</p>
              </div>
            )}
          </div>

          {/* Documents */}
          {documents.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Documents ({documents.length})
                </h3>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">
                          {doc.title || "Untitled Document"}
                        </h4>
                        {doc.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {doc.description}
                          </p>
                        )}
                        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                          <span>{doc.format || "Unknown format"}</span>
                        </div>
                      </div>
                      {doc.url && (
                        <Button asChild size="sm" variant="outline">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
