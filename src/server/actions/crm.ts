"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { databaseConfigured, db } from "@/db";
import {
  companies,
  contacts,
  followUps,
  interactions,
  leads,
  proposals,
  projects,
  tasks,
} from "@/db/schema";
import {
  demoImportTag,
  deriveLeadStatusFromImport,
  deriveOutreachStatusFromImport,
  getBundledDemoImportData,
  getLocalWorkbookImportData,
  localWorkbookImportTag,
} from "@/server/services/imports";
import type { EnrichedProspectRow } from "@/types/imports";

const companySchema = z.object({
  name: z.string().min(1, "Company name is required."),
  website: z.string().optional(),
  industry: z.string().optional(),
  businessType: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  notes: z.string().optional(),
});

const contactSchema = z.object({
  companyId: z.string().uuid("Choose a company for this contact."),
  fullName: z.string().min(1, "Contact name is required."),
  title: z.string().optional(),
  email: z.string().email("Enter a valid email address.").optional().or(z.literal("")),
  phone: z.string().optional(),
  preferredContactMethod: z.string().optional(),
  linkedinUrl: z.string().url("Enter a valid LinkedIn URL.").optional().or(z.literal("")),
  isPrimary: z.boolean(),
  notes: z.string().optional(),
});

const leadSchema = z.object({
  companyId: z.string().uuid("Choose a company for this lead."),
  contactId: z.string().uuid().optional().or(z.literal("")),
  source: z.string().optional(),
  estimatedFit: z.string().optional(),
  status: z.string().min(1, "Lead status is required."),
  outreachStatus: z.enum([
    "not_started",
    "draft_ready",
    "draft",
    "scheduled",
    "sent",
    "follow_up_due",
    "delivered",
    "replied",
    "bounced",
    "cancelled",
    "do_not_contact",
  ]),
  operationalPainSignal: z.string().optional(),
  likelyWorkflowProblem: z.string().optional(),
  specificOutreachAngle: z.string().optional(),
  suggestedFirstOffer: z.string().optional(),
  nextAction: z.string().optional(),
  followUpDate: z.string().optional(),
  doNotContact: z.boolean(),
});

const interactionSchema = z.object({
  companyId: z.string().uuid("Choose a company."),
  contactId: z.string().uuid().optional().or(z.literal("")),
  leadId: z.string().uuid().optional().or(z.literal("")),
  type: z.enum(["email", "call", "meeting", "linkedin", "website_form", "note"]),
  direction: z.enum(["outbound", "inbound", "internal"]),
  summary: z.string().min(1, "Summary is required."),
  body: z.string().optional(),
  occurredAt: z.string().min(1, "Occurred at is required."),
});

const followUpSchema = z.object({
  leadId: z.string().uuid("Choose a lead."),
  dueDate: z.string().min(1, "Due date is required."),
  status: z.enum(["pending", "scheduled", "completed", "skipped"]),
  notes: z.string().optional(),
});

const taskSchema = z.object({
  projectId: z.string().uuid().optional().or(z.literal("")),
  leadId: z.string().uuid().optional().or(z.literal("")),
  title: z.string().min(1, "Task title is required."),
  status: z.enum(["todo", "in_progress", "blocked", "done"]),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

const proposalSchema = z.object({
  companyId: z.string().uuid("Choose a company."),
  leadId: z.string().uuid().optional().or(z.literal("")),
  title: z.string().min(1, "Proposal title is required."),
  status: z.enum(["draft", "sent", "viewed", "negotiating", "won", "lost", "expired"]),
  estimatedValueCents: z.string().optional(),
  proposalUrl: z.string().url("Enter a valid proposal URL.").optional().or(z.literal("")),
  sentAt: z.string().optional(),
});

const projectSchema = z.object({
  companyId: z.string().uuid("Choose a company."),
  proposalId: z.string().uuid().optional().or(z.literal("")),
  title: z.string().min(1, "Project title is required."),
  status: z.enum(["draft", "planned", "active", "paused", "completed", "cancelled"]),
  githubRepoUrl: z.string().url("Enter a valid GitHub URL.").optional().or(z.literal("")),
  driveFolderUrl: z.string().url("Enter a valid Drive URL.").optional().or(z.literal("")),
  stripeCustomerId: z.string().optional(),
});

function cleanOptional(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function requireDb() {
  if (!databaseConfigured || !db) {
    throw new Error(
      "DATABASE_URL is not configured. Set DATABASE_URL in Vercel, or use a Vercel Postgres/Neon integration that provides POSTGRES_URL.",
    );
  }

  return db;
}

function revalidateCrmPaths() {
  revalidatePath("/");
  revalidatePath("/companies");
  revalidatePath("/contacts");
  revalidatePath("/leads");
  revalidatePath("/interactions");
  revalidatePath("/follow-ups");
  revalidatePath("/tasks");
  revalidatePath("/proposals");
  revalidatePath("/projects");
}

async function importLeadRows(
  rows: EnrichedProspectRow[],
  importTag: string,
  defaultNote: string,
) {
  const dbClient = requireDb();

  for (const row of rows) {
    const existingCompany = await dbClient.query.companies.findFirst({
      where: and(
        eq(companies.name, row.company),
        row.website ? eq(companies.website, row.website) : undefined,
      ),
    });

    const importNote = [importTag, row.category, row.notes ?? defaultNote].filter(Boolean).join(" · ");

    const companyId =
      existingCompany?.id ??
      (
        await dbClient
          .insert(companies)
          .values({
            name: row.company,
            website: row.website,
            industry: row.businessType ?? row.category,
            businessType: row.businessType ?? row.category,
            status: "prospect",
            fitScore: row.confidenceScore ? Math.round(row.confidenceScore * 100) : undefined,
            priorityScore: row.priorityScore ? Math.round(row.priorityScore) : undefined,
            notes: importNote,
          })
          .returning({ id: companies.id })
      )[0].id;

    let contactId: string | undefined;
    if (row.contactPerson) {
      const existingContact = await dbClient.query.contacts.findFirst({
        where: and(eq(contacts.companyId, companyId), eq(contacts.fullName, row.contactPerson)),
      });

      contactId =
        existingContact?.id ??
        (
          await dbClient
            .insert(contacts)
            .values({
              companyId,
              firstName: row.contactPerson.split(/\s+/)[0],
              lastName: row.contactPerson.split(/\s+/).slice(1).join(" ") || undefined,
              fullName: row.contactPerson,
              title: row.title ?? row.contactRole,
              email: row.publicEmailOrContact,
              phone: row.phone,
              preferredContactMethod: row.bestContactMethod,
              linkedinUrl: row.linkedinProfile,
              notes: importNote,
            })
            .returning({ id: contacts.id })
        )[0].id;
    }

    const existingLead = await dbClient.query.leads.findFirst({
      where: and(
        eq(leads.companyId, companyId),
        contactId ? eq(leads.contactId, contactId) : undefined,
        row.specificOutreachAngle ? eq(leads.specificOutreachAngle, row.specificOutreachAngle) : undefined,
      ),
    });

    if (!existingLead) {
      await dbClient.insert(leads).values({
        companyId,
        contactId,
        source: row.source,
        operationalPainSignal: row.operationalPainSignal,
        likelyWorkflowProblem: row.likelyWorkflowProblem,
        specificOutreachAngle: row.specificOutreachAngle,
        suggestedFirstOffer: row.suggestedFirstOffer,
        estimatedFit: row.estimatedFit,
        warmIntroPossible: row.warmIntroPossible === "Yes" || row.warmIntroPossible === "Maybe",
        status: deriveLeadStatusFromImport(row),
        outreachStatus: deriveOutreachStatusFromImport(row),
        nextAction:
          row.firstMessageStatus === "Draft Ready"
            ? "Review outreach draft and send first message"
            : row.followUpDate
              ? "Review imported follow-up timing"
              : "Verify public info and prepare first message",
        followUpDate: row.followUpDate ? new Date(row.followUpDate) : undefined,
        doNotContact: row.doNotContact,
        verificationDate: row.verificationDate ? new Date(row.verificationDate) : undefined,
        sourceUrls: row.sourceUrls,
      });
    }
  }
}

export async function createCompany(formData: FormData) {
  const dbClient = requireDb();
  const parsed = companySchema.parse({
    name: formData.get("name"),
    website: cleanOptional(formData.get("website")),
    industry: cleanOptional(formData.get("industry")),
    businessType: cleanOptional(formData.get("businessType")),
    city: cleanOptional(formData.get("city")),
    state: cleanOptional(formData.get("state")),
    notes: cleanOptional(formData.get("notes")),
  });

  await dbClient.insert(companies).values(parsed);
  revalidateCrmPaths();
}

export async function createContact(formData: FormData) {
  const dbClient = requireDb();
  const parsed = contactSchema.parse({
    companyId: formData.get("companyId"),
    fullName: formData.get("fullName"),
    title: cleanOptional(formData.get("title")),
    email: cleanOptional(formData.get("email")) ?? "",
    phone: cleanOptional(formData.get("phone")),
    preferredContactMethod: cleanOptional(formData.get("preferredContactMethod")),
    linkedinUrl: cleanOptional(formData.get("linkedinUrl")) ?? "",
    isPrimary: formData.get("isPrimary") === "on",
    notes: cleanOptional(formData.get("notes")),
  });

  const [firstName, ...rest] = parsed.fullName.trim().split(/\s+/);
  const lastName = rest.length > 0 ? rest.join(" ") : undefined;

  await dbClient.insert(contacts).values({
    companyId: parsed.companyId,
    firstName,
    lastName,
    fullName: parsed.fullName,
    title: parsed.title,
    email: parsed.email || undefined,
    phone: parsed.phone,
    preferredContactMethod: parsed.preferredContactMethod,
    linkedinUrl: parsed.linkedinUrl || undefined,
    isPrimary: parsed.isPrimary,
    notes: parsed.notes,
  });

  revalidateCrmPaths();
}

export async function createLead(formData: FormData) {
  const dbClient = requireDb();
  const parsed = leadSchema.parse({
    companyId: formData.get("companyId"),
    contactId: cleanOptional(formData.get("contactId")) ?? "",
    source: cleanOptional(formData.get("source")),
    estimatedFit: cleanOptional(formData.get("estimatedFit")),
    status: formData.get("status"),
    outreachStatus: formData.get("outreachStatus"),
    operationalPainSignal: cleanOptional(formData.get("operationalPainSignal")),
    likelyWorkflowProblem: cleanOptional(formData.get("likelyWorkflowProblem")),
    specificOutreachAngle: cleanOptional(formData.get("specificOutreachAngle")),
    suggestedFirstOffer: cleanOptional(formData.get("suggestedFirstOffer")),
    nextAction: cleanOptional(formData.get("nextAction")),
    followUpDate: cleanOptional(formData.get("followUpDate")),
    doNotContact: formData.get("doNotContact") === "on",
  });

  await dbClient.insert(leads).values({
    companyId: parsed.companyId,
    contactId: parsed.contactId || undefined,
    source: parsed.source,
    estimatedFit: parsed.estimatedFit,
    status: parsed.status as
      | "new"
      | "researching"
      | "ready_to_contact"
      | "contacted"
      | "follow_up_1"
      | "follow_up_2"
      | "discovery_scheduled"
      | "discovery_complete"
      | "proposal_sent"
      | "won"
      | "lost"
      | "nurture"
      | "do_not_contact",
    outreachStatus: parsed.outreachStatus,
    operationalPainSignal: parsed.operationalPainSignal,
    likelyWorkflowProblem: parsed.likelyWorkflowProblem,
    specificOutreachAngle: parsed.specificOutreachAngle,
    suggestedFirstOffer: parsed.suggestedFirstOffer,
    nextAction: parsed.nextAction,
    followUpDate: parsed.followUpDate ? new Date(parsed.followUpDate) : undefined,
    doNotContact: parsed.doNotContact,
  });

  revalidateCrmPaths();
}

export async function createInteraction(formData: FormData) {
  const dbClient = requireDb();
  const parsed = interactionSchema.parse({
    companyId: formData.get("companyId"),
    contactId: cleanOptional(formData.get("contactId")) ?? "",
    leadId: cleanOptional(formData.get("leadId")) ?? "",
    type: formData.get("type"),
    direction: formData.get("direction"),
    summary: formData.get("summary"),
    body: cleanOptional(formData.get("body")),
    occurredAt: formData.get("occurredAt"),
  });

  await dbClient.insert(interactions).values({
    companyId: parsed.companyId,
    contactId: parsed.contactId || undefined,
    leadId: parsed.leadId || undefined,
    type: parsed.type,
    direction: parsed.direction,
    summary: parsed.summary,
    body: parsed.body,
    occurredAt: new Date(parsed.occurredAt),
  });

  revalidateCrmPaths();
}

export async function createFollowUp(formData: FormData) {
  const dbClient = requireDb();
  const parsed = followUpSchema.parse({
    leadId: formData.get("leadId"),
    dueDate: formData.get("dueDate"),
    status: formData.get("status"),
    notes: cleanOptional(formData.get("notes")),
  });

  await dbClient.insert(followUps).values({
    leadId: parsed.leadId,
    dueDate: new Date(parsed.dueDate),
    status: parsed.status,
    notes: parsed.notes,
  });

  revalidateCrmPaths();
}

export async function createTask(formData: FormData) {
  const dbClient = requireDb();
  const parsed = taskSchema.parse({
    projectId: cleanOptional(formData.get("projectId")) ?? "",
    leadId: cleanOptional(formData.get("leadId")) ?? "",
    title: formData.get("title"),
    status: formData.get("status"),
    dueDate: cleanOptional(formData.get("dueDate")),
    notes: cleanOptional(formData.get("notes")),
  });

  await dbClient.insert(tasks).values({
    projectId: parsed.projectId || undefined,
    leadId: parsed.leadId || undefined,
    title: parsed.title,
    status: parsed.status,
    dueDate: parsed.dueDate ? new Date(parsed.dueDate) : undefined,
    notes: parsed.notes,
  });

  revalidateCrmPaths();
}

export async function createProposal(formData: FormData) {
  const dbClient = requireDb();
  const parsed = proposalSchema.parse({
    companyId: formData.get("companyId"),
    leadId: cleanOptional(formData.get("leadId")) ?? "",
    title: formData.get("title"),
    status: formData.get("status"),
    estimatedValueCents: cleanOptional(formData.get("estimatedValueCents")),
    proposalUrl: cleanOptional(formData.get("proposalUrl")) ?? "",
    sentAt: cleanOptional(formData.get("sentAt")),
  });

  await dbClient.insert(proposals).values({
    companyId: parsed.companyId,
    leadId: parsed.leadId || undefined,
    title: parsed.title,
    status: parsed.status,
    estimatedValueCents: parsed.estimatedValueCents
      ? Number.parseInt(parsed.estimatedValueCents, 10)
      : undefined,
    proposalUrl: parsed.proposalUrl || undefined,
    sentAt: parsed.sentAt ? new Date(parsed.sentAt) : undefined,
  });

  revalidateCrmPaths();
}

export async function createProject(formData: FormData) {
  const dbClient = requireDb();
  const parsed = projectSchema.parse({
    companyId: formData.get("companyId"),
    proposalId: cleanOptional(formData.get("proposalId")) ?? "",
    title: formData.get("title"),
    status: formData.get("status"),
    githubRepoUrl: cleanOptional(formData.get("githubRepoUrl")) ?? "",
    driveFolderUrl: cleanOptional(formData.get("driveFolderUrl")) ?? "",
    stripeCustomerId: cleanOptional(formData.get("stripeCustomerId")),
  });

  await dbClient.insert(projects).values({
    companyId: parsed.companyId,
    proposalId: parsed.proposalId || undefined,
    title: parsed.title,
    status: parsed.status,
    githubRepoUrl: parsed.githubRepoUrl || undefined,
    driveFolderUrl: parsed.driveFolderUrl || undefined,
    stripeCustomerId: parsed.stripeCustomerId,
  });

  revalidateCrmPaths();
}

export async function importBundledDemoLeads() {
  const { rows } = await getBundledDemoImportData();
  await importLeadRows(rows, demoImportTag, "Bundled demo import row");

  revalidateCrmPaths();
  revalidatePath("/imports");
}

export async function importLocalWorkbookLeads() {
  const workbookData = await getLocalWorkbookImportData();

  if (!workbookData) {
    throw new Error(
      "The local workbook was not found in private/. Keep the file local and try again from your development environment.",
    );
  }

  await importLeadRows(
    workbookData.rows,
    localWorkbookImportTag,
    `Imported from ${workbookData.canonicalSheetName}`,
  );

  revalidateCrmPaths();
  revalidatePath("/imports");
}

export async function clearBundledDemoLeads() {
  const dbClient = requireDb();

  const demoCompanies = await dbClient.query.companies.findMany({
    where: ilike(companies.notes, `%${demoImportTag}%`),
    columns: { id: true },
  });

  const demoCompanyIds = demoCompanies.map((company) => company.id);

  if (demoCompanyIds.length > 0) {
    await dbClient.delete(companies).where(
      or(...demoCompanyIds.map((companyId) => eq(companies.id, companyId))),
    );
  }

  revalidateCrmPaths();
  revalidatePath("/imports");
}

export async function clearLocalWorkbookLeads() {
  const dbClient = requireDb();

  const importedCompanies = await dbClient.query.companies.findMany({
    where: ilike(companies.notes, `%${localWorkbookImportTag}%`),
    columns: { id: true },
  });

  const importedCompanyIds = importedCompanies.map((company) => company.id);

  if (importedCompanyIds.length > 0) {
    await dbClient.delete(companies).where(
      or(...importedCompanyIds.map((companyId) => eq(companies.id, companyId))),
    );
  }

  revalidateCrmPaths();
  revalidatePath("/imports");
}
