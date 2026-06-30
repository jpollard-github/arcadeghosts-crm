"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { companies, contacts, leads } from "@/db/schema";

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
  operationalPainSignal: z.string().optional(),
  likelyWorkflowProblem: z.string().optional(),
  specificOutreachAngle: z.string().optional(),
  suggestedFirstOffer: z.string().optional(),
  nextAction: z.string().optional(),
  followUpDate: z.string().optional(),
  doNotContact: z.boolean(),
});

function cleanOptional(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function createCompany(formData: FormData) {
  const parsed = companySchema.parse({
    name: formData.get("name"),
    website: cleanOptional(formData.get("website")),
    industry: cleanOptional(formData.get("industry")),
    businessType: cleanOptional(formData.get("businessType")),
    city: cleanOptional(formData.get("city")),
    state: cleanOptional(formData.get("state")),
    notes: cleanOptional(formData.get("notes")),
  });

  await db.insert(companies).values(parsed);
  revalidatePath("/");
  revalidatePath("/companies");
  revalidatePath("/contacts");
  revalidatePath("/leads");
}

export async function createContact(formData: FormData) {
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

  await db.insert(contacts).values({
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

  revalidatePath("/");
  revalidatePath("/contacts");
  revalidatePath("/leads");
}

export async function createLead(formData: FormData) {
  const parsed = leadSchema.parse({
    companyId: formData.get("companyId"),
    contactId: cleanOptional(formData.get("contactId")) ?? "",
    source: cleanOptional(formData.get("source")),
    estimatedFit: cleanOptional(formData.get("estimatedFit")),
    status: formData.get("status"),
    operationalPainSignal: cleanOptional(formData.get("operationalPainSignal")),
    likelyWorkflowProblem: cleanOptional(formData.get("likelyWorkflowProblem")),
    specificOutreachAngle: cleanOptional(formData.get("specificOutreachAngle")),
    suggestedFirstOffer: cleanOptional(formData.get("suggestedFirstOffer")),
    nextAction: cleanOptional(formData.get("nextAction")),
    followUpDate: cleanOptional(formData.get("followUpDate")),
    doNotContact: formData.get("doNotContact") === "on",
  });

  await db.insert(leads).values({
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
    operationalPainSignal: parsed.operationalPainSignal,
    likelyWorkflowProblem: parsed.likelyWorkflowProblem,
    specificOutreachAngle: parsed.specificOutreachAngle,
    suggestedFirstOffer: parsed.suggestedFirstOffer,
    nextAction: parsed.nextAction,
    followUpDate: parsed.followUpDate ? new Date(parsed.followUpDate) : undefined,
    doNotContact: parsed.doNotContact,
  });

  revalidatePath("/");
  revalidatePath("/leads");
}
