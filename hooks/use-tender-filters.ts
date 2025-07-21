import { useState, useEffect } from "react";
import type { TenderFilters, FilterStats } from "@/types/filters";

export function useTenderFilters(initialFilters: TenderFilters) {
  const [filters, setFilters] = useState<TenderFilters>(initialFilters);
  const [filterStats, setFilterStats] = useState<FilterStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Fetch filter statistics
  const fetchFilterStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await fetch("/api/tenders/filter-stats");
      if (response.ok) {
        const stats = await response.json();
        setFilterStats(stats);
      }
    } catch (error) {
      console.error("Failed to fetch filter stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchFilterStats();
  }, []);

  // Update filters when initial filters change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  return {
    filters,
    setFilters,
    filterStats,
    isLoadingStats,
    refetchStats: fetchFilterStats,
  };
}
