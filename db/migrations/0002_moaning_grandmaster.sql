CREATE TABLE "tender_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"tender_ocid" text NOT NULL,
	"document_id" text,
	"title" text,
	"description" text,
	"url" text,
	"format" text,
	"date_published" timestamp,
	"date_modified" timestamp
);
--> statement-breakpoint
CREATE TABLE "tenders" (
	"ocid" text PRIMARY KEY NOT NULL,
	"id" text,
	"title" text NOT NULL,
	"description" text,
	"procurement_method" text,
	"procurement_method_details" text,
	"main_procurement_category" text,
	"status" text,
	"published_date" timestamp,
	"start_date" timestamp,
	"end_date" timestamp,
	"procuring_entity" jsonb,
	"value" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tender_documents" ADD CONSTRAINT "tender_documents_tender_ocid_tenders_ocid_fk" FOREIGN KEY ("tender_ocid") REFERENCES "public"."tenders"("ocid") ON DELETE cascade ON UPDATE no action;