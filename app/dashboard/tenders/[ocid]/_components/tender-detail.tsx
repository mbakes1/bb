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
  Globe,
  DollarSign,
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

  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount && amount !== 0) return "N/A";
    const currencyCode = currency || "ZAR";
    try {
      return new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: currencyCode,
      }).format(amount);
    } catch {
      return `${currencyCode} ${amount.toLocaleString()}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tenders
        </Button>
      </div>

      {/* Main Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{tender.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">OCID: {tender.ocid}</Badge>
                {tender.id && <Badge variant="outline">ID: {tender.id}</Badge>}
                {tender.procurementMethodDetails && (
                  <Badge>{tender.procurementMethodDetails}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {tender.description || "No description available"}
              </p>
            </div>

            <Separator />

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Procuring Entity */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Procuring Entity
                </h3>
                <div className="space-y-2">
                  <p className="font-medium">
                    {tender.procuringEntity?.name || "N/A"}
                  </p>
                  {tender.procuringEntity?.id && (
                    <p className="text-sm text-muted-foreground">
                      ID: {tender.procuringEntity.id}
                    </p>
                  )}
                </div>
              </div>

              {/* Procurement Details */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Procurement Details
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Method: </span>
                    <span>
                      {tender.procurementMethodDetails ||
                        tender.procurementMethod ||
                        "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Category: </span>
                    <span>{tender.mainProcurementCategory || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Tender Period */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Tender Period
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Start: </span>
                    <span>{formatDate(tender.startDate)}</span>
                  </div>
                  <div>
                    <span className="font-medium">End: </span>
                    <span>{formatDate(tender.endDate)}</span>
                  </div>
                </div>
              </div>

              {/* Value */}
              {tender.value?.amount && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Value
                  </h3>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(
                        tender.value.amount,
                        tender.value.currency
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Release Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Release Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Published: </span>
                  <span>{formatDate(tender.publishedDate)}</span>
                </div>
                <div>
                  <span className="font-medium">Last Updated: </span>
                  <span>{formatDate(tender.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Documents */}
            {documents.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents ({documents.length})
                  </h3>
                  <div className="grid gap-4">
                    {documents.map((doc) => (
                      <Card
                        key={doc.id}
                        className="border-l-4 border-l-blue-500"
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-2">
                                {doc.title || "Untitled Document"}
                              </h4>
                              {doc.description && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  {doc.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                <span>Format: {doc.format || "N/A"}</span>
                                <span>
                                  Published: {formatDate(doc.datePublished)}
                                </span>
                                {doc.dateModified && (
                                  <span>
                                    Modified: {formatDate(doc.dateModified)}
                                  </span>
                                )}
                              </div>
                            </div>
                            {doc.url && (
                              <Button asChild size="sm">
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
