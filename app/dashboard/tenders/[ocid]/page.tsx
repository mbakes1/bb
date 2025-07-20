"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  FileText,
  Download,
  Globe,
  Tag,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { Release } from "@/types/tender";

export default function TenderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ocid = params.ocid as string;

  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ocid) return;

    const loadTenderDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/tenders/${encodeURIComponent(ocid)}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(
              "This tender could not be found. It may have been removed or the ID is incorrect."
            );
          } else if (response.status >= 500) {
            throw new Error(
              "Server error occurred while loading tender details. Please try again later."
            );
          } else {
            throw new Error(
              `Unable to load tender details (Error ${response.status}). Please check your connection and try again.`
            );
          }
        }

        const data: Release = await response.json();

        if (!data || !data.ocid) {
          console.error("Invalid tender data structure:", data);
          throw new Error(
            "Invalid tender data received. Please try refreshing the page."
          );
        }

        setRelease(data);
      } catch (err) {
        console.error("Error loading tender detail:", err);
        console.error("OCID being requested:", ocid);

        if (err instanceof TypeError && err.message.includes("fetch")) {
          setError(
            "Network error: Unable to connect to the tender service. Please check your internet connection and try again."
          );
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "An unexpected error occurred while loading tender details. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadTenderDetail();
  }, [ocid]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateString;
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tender not found</h3>
            <p className="text-muted-foreground text-center">
              The requested tender could not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tender = release.tender || {};
  const tenderPeriod = tender.tenderPeriod || {};
  const procuringEntity = tender.procuringEntity || {};
  const buyer = release.buyer || {};
  const value = tender.value || {};
  const documents = tender.documents || [];

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
              <CardTitle className="text-2xl mb-2">
                {tender.title || "Untitled Tender"}
              </CardTitle>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">OCID: {release.ocid}</Badge>
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
                    {procuringEntity.name || buyer.name || "N/A"}
                  </p>
                  {procuringEntity.id && (
                    <p className="text-sm text-muted-foreground">
                      ID: {procuringEntity.id}
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
                  {tender.additionalProcurementCategories &&
                    tender.additionalProcurementCategories.length > 0 && (
                      <div>
                        <span className="font-medium">
                          Additional Categories:{" "}
                        </span>
                        <span>
                          {tender.additionalProcurementCategories.join(", ")}
                        </span>
                      </div>
                    )}
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
                    <span>{formatDate(tenderPeriod.startDate)}</span>
                  </div>
                  <div>
                    <span className="font-medium">End: </span>
                    <span>{formatDate(tenderPeriod.endDate)}</span>
                  </div>
                </div>
              </div>

              {/* Value */}
              {value.amount && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Value
                  </h3>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(value.amount, value.currency)}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="font-medium">Date: </span>
                  <span>{formatDate(release.date)}</span>
                </div>
                <div>
                  <span className="font-medium">Language: </span>
                  <span>{release.language || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span className="font-medium">Tags: </span>
                  <span>{release.tag ? release.tag.join(", ") : "N/A"}</span>
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
                    {documents.map((doc, index) => (
                      <Card
                        key={doc.id || index}
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
