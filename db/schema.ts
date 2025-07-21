import {
  boolean,
  pgTable,
  text,
  timestamp,
  serial,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import type { ProcuringEntity, Value } from "@/types/tender";

// Better Auth Tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});
// Tender Tables
export const tenders = pgTable("tenders", {
  ocid: text("ocid").primaryKey(), // Open Contracting ID is the natural primary key
  id: text("id"),
  title: text("title").notNull(),
  description: text("description"),
  procurementMethod: text("procurement_method"),
  procurementMethodDetails: text("procurement_method_details"),
  mainProcurementCategory: text("main_procurement_category"),
  status: text("status"), // Good to add for internal tracking

  // Dates for filtering and sorting
  publishedDate: timestamp("published_date"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),

  // Store structured data as JSONB for flexibility
  procuringEntity: jsonb("procuring_entity").$type<ProcuringEntity>(),
  value: jsonb("value").$type<Value>(),

  // Timestamps for our internal tracking
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tenderDocuments = pgTable(
  "tender_documents",
  {
    id: serial("id").primaryKey(),
    tenderOcid: text("tender_ocid")
      .notNull()
      .references(() => tenders.ocid, { onDelete: "cascade" }),
    documentId: text("document_id"),
    title: text("title"),
    description: text("description"),
    url: text("url"),
    format: text("format"),
    datePublished: timestamp("date_published"),
    dateModified: timestamp("date_modified"),
  },
  (table) => ({
    // Create unique constraint on tenderOcid + documentId to prevent duplicates
    uniqueDoc: unique().on(table.tenderOcid, table.documentId),
  })
);
