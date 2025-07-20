export interface TenderPeriod {
  startDate?: string;
  endDate?: string;
}

export interface ProcuringEntity {
  id?: string;
  name?: string;
}

export interface Buyer {
  id?: string;
  name?: string;
}

export interface Value {
  amount?: number;
  currency?: string;
}

export interface Document {
  id?: string;
  title?: string;
  description?: string;
  url?: string;
  format?: string;
  datePublished?: string;
  dateModified?: string;
}

export interface Tender {
  id?: string;
  title?: string;
  description?: string;
  procurementMethod?: string;
  procurementMethodDetails?: string;
  mainProcurementCategory?: string;
  additionalProcurementCategories?: string[];
  tenderPeriod?: TenderPeriod;
  procuringEntity?: ProcuringEntity;
  value?: Value;
  documents?: Document[];
}

export interface Release {
  ocid: string;
  id?: string;
  date?: string;
  language?: string;
  tag?: string[];
  tender?: Tender;
  buyer?: Buyer;
}

export interface TendersResponse {
  releases: Release[];
}
