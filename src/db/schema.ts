import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const companyStatusEnum = pgEnum("company_status", [
  "prospect",
  "active",
  "inactive",
  "won",
  "lost",
  "archived",
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "researching",
  "ready_to_contact",
  "contacted",
  "follow_up_1",
  "follow_up_2",
  "discovery_scheduled",
  "discovery_complete",
  "proposal_sent",
  "won",
  "lost",
  "nurture",
  "do_not_contact",
]);

export const interactionTypeEnum = pgEnum("interaction_type", [
  "email",
  "call",
  "meeting",
  "linkedin",
  "website_form",
  "note",
]);

export const interactionDirectionEnum = pgEnum("interaction_direction", [
  "outbound",
  "inbound",
  "internal",
]);

export const followUpStatusEnum = pgEnum("follow_up_status", [
  "pending",
  "scheduled",
  "completed",
  "skipped",
]);

export const proposalStatusEnum = pgEnum("proposal_status", [
  "draft",
  "sent",
  "viewed",
  "negotiating",
  "won",
  "lost",
  "expired",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "planned",
  "active",
  "paused",
  "completed",
  "cancelled",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "blocked",
  "done",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "proposal",
  "discovery_notes",
  "contract",
  "brief",
  "project_doc",
  "reference",
]);

export const outreachChannelEnum = pgEnum("outreach_channel", [
  "email",
  "linkedin",
  "phone",
  "contact_form",
]);

export const outreachStatusEnum = pgEnum("outreach_status", [
  "draft",
  "scheduled",
  "sent",
  "delivered",
  "replied",
  "bounced",
  "cancelled",
]);

export const integrationProviderEnum = pgEnum("integration_provider", [
  "openai",
  "resend",
  "google_drive",
  "google_calendar",
  "google_contacts",
  "github",
  "stripe",
  "mcp",
]);

export const leadSources = pgTable("lead_sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
});

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  website: text("website"),
  industry: varchar("industry", { length: 120 }),
  businessType: varchar("business_type", { length: 120 }),
  city: varchar("city", { length: 120 }),
  state: varchar("state", { length: 120 }),
  status: companyStatusEnum("status").default("prospect").notNull(),
  fitScore: integer("fit_score"),
  priorityScore: integer("priority_score"),
  notes: text("notes"),
  ...timestamps,
});

export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 120 }),
  lastName: varchar("last_name", { length: 120 }),
  fullName: varchar("full_name", { length: 255 }),
  title: varchar("title", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  linkedinUrl: text("linkedin_url"),
  preferredContactMethod: varchar("preferred_contact_method", { length: 80 }),
  isPrimary: boolean("is_primary").default(false).notNull(),
  notes: text("notes"),
  ...timestamps,
});

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "set null" }),
  leadSourceId: uuid("lead_source_id").references(() => leadSources.id, { onDelete: "set null" }),
  source: varchar("source", { length: 255 }),
  operationalPainSignal: text("operational_pain_signal"),
  likelyWorkflowProblem: text("likely_workflow_problem"),
  specificOutreachAngle: text("specific_outreach_angle"),
  suggestedFirstOffer: text("suggested_first_offer"),
  estimatedFit: varchar("estimated_fit", { length: 80 }),
  warmIntroPossible: boolean("warm_intro_possible").default(false).notNull(),
  status: leadStatusEnum("status").default("new").notNull(),
  nextAction: text("next_action"),
  followUpDate: timestamp("follow_up_date", { withTimezone: true }),
  doNotContact: boolean("do_not_contact").default(false).notNull(),
  verificationDate: timestamp("verification_date", { withTimezone: true }),
  sourceUrls: jsonb("source_urls").$type<string[]>().default([]).notNull(),
  ...timestamps,
});

export const interactions = pgTable("interactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "set null" }),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  type: interactionTypeEnum("type").notNull(),
  direction: interactionDirectionEnum("direction").notNull(),
  summary: text("summary").notNull(),
  body: text("body"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const followUps = pgTable("follow_ups", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  status: followUpStatusEnum("status").default("pending").notNull(),
  notes: text("notes"),
  ...timestamps,
});

export const discoveryCalls = pgTable("discovery_calls", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  attendees: jsonb("attendees").$type<string[]>().default([]).notNull(),
  currentWorkflow: text("current_workflow"),
  painPoints: text("pain_points"),
  desiredOutcome: text("desired_outcome"),
  usersInvolved: text("users_involved"),
  deadline: varchar("deadline", { length: 120 }),
  budgetRange: varchar("budget_range", { length: 120 }),
  constraints: text("constraints"),
  nextStep: text("next_step"),
  notes: text("notes"),
  ...timestamps,
});

export const proposals = pgTable("proposals", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  status: proposalStatusEnum("status").default("draft").notNull(),
  estimatedValueCents: integer("estimated_value_cents"),
  proposalUrl: text("proposal_url"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  ...timestamps,
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  status: projectStatusEnum("status").default("draft").notNull(),
  githubRepoUrl: text("github_repo_url"),
  driveFolderUrl: text("drive_folder_url"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  ...timestamps,
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  status: taskStatusEnum("status").default("todo").notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  notes: text("notes"),
  ...timestamps,
});

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "set null" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  type: documentTypeEnum("type").notNull(),
  driveFileUrl: text("drive_file_url"),
  localPath: text("local_path"),
  notes: text("notes"),
  ...timestamps,
});

export const integrations = pgTable("integrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: integrationProviderEnum("provider").notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  status: varchar("status", { length: 80 }).default("planned").notNull(),
  configJson: jsonb("config_json").$type<Record<string, unknown>>().default({}).notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  notes: text("notes"),
  ...timestamps,
});

export const aiResearchNotes = pgTable("ai_research_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "set null" }),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  prompt: text("prompt").notNull(),
  summary: text("summary").notNull(),
  sourcesJson: jsonb("sources_json").$type<Record<string, unknown>[]>().default([]).notNull(),
  confidence: integer("confidence"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const outreachMessages = pgTable("outreach_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  channel: outreachChannelEnum("channel").notNull(),
  subject: varchar("subject", { length: 255 }),
  body: text("body").notNull(),
  status: outreachStatusEnum("status").default("draft").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  ...timestamps,
});
