ALTER TYPE "public"."outreach_status" ADD VALUE 'not_started' BEFORE 'draft';--> statement-breakpoint
ALTER TYPE "public"."outreach_status" ADD VALUE 'draft_ready' BEFORE 'draft';--> statement-breakpoint
ALTER TYPE "public"."outreach_status" ADD VALUE 'follow_up_due' BEFORE 'delivered';--> statement-breakpoint
ALTER TYPE "public"."outreach_status" ADD VALUE 'do_not_contact';--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "outreach_status" "outreach_status" DEFAULT 'not_started' NOT NULL;--> statement-breakpoint
CREATE INDEX "leads_outreach_status_idx" ON "leads" USING btree ("outreach_status");