CREATE INDEX "companies_name_idx" ON "companies" USING btree ("name");--> statement-breakpoint
CREATE INDEX "contacts_company_id_idx" ON "contacts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "contacts_full_name_idx" ON "contacts" USING btree ("full_name");--> statement-breakpoint
CREATE INDEX "contacts_email_idx" ON "contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "follow_ups_due_date_idx" ON "follow_ups" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "follow_ups_status_idx" ON "follow_ups" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leads_follow_up_date_idx" ON "leads" USING btree ("follow_up_date");--> statement-breakpoint
CREATE INDEX "leads_do_not_contact_idx" ON "leads" USING btree ("do_not_contact");--> statement-breakpoint
CREATE INDEX "leads_company_id_idx" ON "leads" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "leads_contact_id_idx" ON "leads" USING btree ("contact_id");