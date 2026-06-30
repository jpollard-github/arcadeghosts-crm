import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { companies, contacts, followUps, leads } from "@/db/schema";

export async function getDashboardData() {
  const [companyCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(companies);
  const [contactCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contacts);
  const [leadCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(leads);
  const [followUpCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(followUps);

  const recentCompanies = await db.query.companies.findMany({
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    limit: 5,
  });

  const recentLeads = await db.query.leads.findMany({
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    limit: 5,
    with: {
      company: true,
      contact: true,
    },
  });

  return {
    companyCount: companyCountRow?.count ?? 0,
    contactCount: contactCountRow?.count ?? 0,
    leadCount: leadCountRow?.count ?? 0,
    followUpCount: followUpCountRow?.count ?? 0,
    recentCompanies,
    recentLeads,
  };
}

export async function getCompaniesPageData() {
  const companyList = await db.query.companies.findMany({
    orderBy: [desc(companies.createdAt)],
    with: {
      contacts: true,
      leads: true,
    },
  });

  return { companyList };
}

export async function getContactsPageData() {
  const [companyOptions, contactList] = await Promise.all([
    db.query.companies.findMany({
      orderBy: [companies.name],
    }),
    db.query.contacts.findMany({
      orderBy: [desc(contacts.createdAt)],
      with: {
        company: true,
      },
    }),
  ]);

  return { companyOptions, contactList };
}

export async function getLeadsPageData() {
  const [companyOptions, contactOptions, leadList] = await Promise.all([
    db.query.companies.findMany({
      orderBy: [companies.name],
    }),
    db.query.contacts.findMany({
      orderBy: [contacts.fullName],
      with: {
        company: true,
      },
    }),
    db.query.leads.findMany({
      orderBy: [desc(leads.createdAt)],
      with: {
        company: true,
        contact: true,
      },
    }),
  ]);

  return { companyOptions, contactOptions, leadList };
}
