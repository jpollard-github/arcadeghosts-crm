import { desc, sql } from "drizzle-orm";
import { databaseConfigured, db } from "@/db";
import { companies, contacts, followUps, leads } from "@/db/schema";

export async function getDashboardData() {
  if (!databaseConfigured || !db) {
    return {
      databaseReady: false,
      companyCount: 0,
      contactCount: 0,
      leadCount: 0,
      followUpCount: 0,
      recentCompanies: [],
      recentLeads: [],
    };
  }

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
    databaseReady: true,
    companyCount: companyCountRow?.count ?? 0,
    contactCount: contactCountRow?.count ?? 0,
    leadCount: leadCountRow?.count ?? 0,
    followUpCount: followUpCountRow?.count ?? 0,
    recentCompanies,
    recentLeads,
  };
}

export async function getCompaniesPageData() {
  if (!databaseConfigured || !db) {
    return {
      databaseReady: false,
      companyList: [],
    };
  }

  const companyList = await db.query.companies.findMany({
    orderBy: [desc(companies.createdAt)],
    with: {
      contacts: true,
      leads: true,
    },
  });

  return { databaseReady: true, companyList };
}

export async function getContactsPageData() {
  if (!databaseConfigured || !db) {
    return {
      databaseReady: false,
      companyOptions: [],
      contactList: [],
    };
  }

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

  return { databaseReady: true, companyOptions, contactList };
}

export async function getLeadsPageData() {
  if (!databaseConfigured || !db) {
    return {
      databaseReady: false,
      companyOptions: [],
      contactOptions: [],
      leadList: [],
    };
  }

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

  return { databaseReady: true, companyOptions, contactOptions, leadList };
}
