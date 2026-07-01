import { desc, eq, sql } from "drizzle-orm";
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
import { getLeadPriorityScore, getWeeklyStaleLeadReviewItem } from "@/server/services/lead-queue";

type TextLike = string | null | undefined;

type CompanyFilters = {
  q?: string;
};

type ContactFilters = {
  q?: string;
};

type LeadFilters = {
  q?: string;
  status?: string;
  outreachStatus?: string;
};

type InteractionFilters = {
  q?: string;
  type?: string;
  direction?: string;
};

type FollowUpFilters = {
  q?: string;
  status?: string;
};

type TaskFilters = {
  q?: string;
  status?: string;
};

type ProposalFilters = {
  q?: string;
  status?: string;
};

type ProjectFilters = {
  q?: string;
  status?: string;
};

function matchesQuery(query: string | undefined, values: TextLike[]) {
  if (!query) {
    return true;
  }

  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return values.some((value) => value?.toLowerCase().includes(normalized));
}

function matchesExact(filter: string | undefined, value: TextLike) {
  if (!filter) {
    return true;
  }

  return value === filter;
}

export async function getDashboardData() {
  if (!databaseConfigured || !db) {
    return {
      databaseReady: false,
      companyCount: 0,
      contactCount: 0,
      leadCount: 0,
      followUpCount: 0,
      proposalCount: 0,
      projectCount: 0,
      taskCount: 0,
      recentCompanies: [],
      recentLeads: [],
      upcomingFollowUps: [],
      openTasks: [],
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
  const [proposalCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(proposals);
  const [projectCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projects);
  const [taskCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tasks);

  const recentCompanies = await db.query.companies.findMany({
    orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
    limit: 5,
  });

  const recentLeads = await db.query.leads.findMany({
    orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
    limit: 5,
    with: {
      company: true,
      contact: true,
    },
  });

  const upcomingFollowUps = await db.query.followUps.findMany({
    orderBy: (table) => [table.dueDate],
    limit: 5,
    with: {
      lead: {
        with: {
          company: true,
          contact: true,
        },
      },
    },
  });

  const openTasks = await db.query.tasks.findMany({
    orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
    limit: 5,
    with: {
      lead: {
        with: {
          company: true,
          contact: true,
        },
      },
      project: {
        with: {
          company: true,
        },
      },
    },
  });

  return {
    databaseReady: true,
    companyCount: companyCountRow?.count ?? 0,
    contactCount: contactCountRow?.count ?? 0,
    leadCount: leadCountRow?.count ?? 0,
    followUpCount: followUpCountRow?.count ?? 0,
    proposalCount: proposalCountRow?.count ?? 0,
    projectCount: projectCountRow?.count ?? 0,
    taskCount: taskCountRow?.count ?? 0,
    recentCompanies,
    recentLeads,
    upcomingFollowUps,
    openTasks,
  };
}

export async function getCompaniesPageData(filters: CompanyFilters = {}) {
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

  return {
    databaseReady: true,
    companyList: companyList.filter((company) =>
      matchesQuery(filters.q, [
        company.name,
        company.industry,
        company.businessType,
        company.city,
        company.state,
        company.status,
      ]),
    ),
  };
}

export async function getContactsPageData(filters: ContactFilters = {}) {
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

  return {
    databaseReady: true,
    companyOptions,
    contactList: contactList.filter((contact) =>
      matchesQuery(filters.q, [
        contact.fullName,
        contact.firstName,
        contact.lastName,
        contact.title,
        contact.email,
        contact.phone,
        contact.company.name,
      ]),
    ),
  };
}

export async function getLeadsPageData(filters: LeadFilters = {}) {
  if (!databaseConfigured || !db) {
    return {
      databaseReady: false,
      companyOptions: [],
      contactOptions: [],
      leadList: [],
      priorityQueue: [],
      staleLeadReview: [],
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
        followUps: true,
      },
    }),
  ]);

  const filteredLeadList = leadList.filter(
    (lead) =>
      matchesExact(filters.status, lead.status) &&
      matchesExact(filters.outreachStatus, lead.outreachStatus) &&
      matchesQuery(filters.q, [
        lead.company.name,
        lead.contact?.fullName,
        lead.source,
        lead.status,
        lead.outreachStatus,
        lead.estimatedFit,
        lead.nextAction,
        lead.operationalPainSignal,
        lead.likelyWorkflowProblem,
        lead.specificOutreachAngle,
      ]),
  );

  const priorityQueue = [...filteredLeadList]
    .sort((left, right) => getLeadPriorityScore(right) - getLeadPriorityScore(left))
    .slice(0, 5);

  const staleLeadReview = filteredLeadList
    .map((lead) => {
      const reviewItem = getWeeklyStaleLeadReviewItem(lead);

      if (!reviewItem) {
        return null;
      }

      return {
        ...lead,
        ...reviewItem,
      };
    })
    .filter((lead): lead is NonNullable<typeof lead> => Boolean(lead))
    .sort((left, right) => right.staleScore - left.staleScore)
    .slice(0, 6);

  return {
    databaseReady: true,
    companyOptions,
    contactOptions,
    leadList: filteredLeadList,
    priorityQueue,
    staleLeadReview,
  };
}

export async function getInteractionsPageData(filters: InteractionFilters = {}) {
  if (!databaseConfigured || !db) {
    return {
      databaseReady: false,
      companyOptions: [],
      contactOptions: [],
      leadOptions: [],
      interactionList: [],
    };
  }

  const [companyOptions, contactOptions, leadOptions, interactionList] = await Promise.all([
    db.query.companies.findMany({
      orderBy: [companies.name],
    }),
    db.query.contacts.findMany({
      orderBy: [contacts.fullName],
      with: { company: true },
    }),
    db.query.leads.findMany({
      orderBy: [desc(leads.createdAt)],
      with: { company: true, contact: true },
    }),
    db.query.interactions.findMany({
      orderBy: [desc(interactions.occurredAt)],
      with: {
        company: true,
        contact: true,
        lead: {
          with: {
            company: true,
          },
        },
      },
    }),
  ]);

  return {
    databaseReady: true,
    companyOptions,
    contactOptions,
    leadOptions,
    interactionList: interactionList.filter(
      (interaction) =>
        matchesExact(filters.type, interaction.type) &&
        matchesExact(filters.direction, interaction.direction) &&
        matchesQuery(filters.q, [
          interaction.summary,
          interaction.body,
          interaction.company.name,
          interaction.contact?.fullName,
          interaction.lead?.company.name,
        ]),
    ),
  };
}

export async function getFollowUpsPageData(filters: FollowUpFilters = {}) {
  if (!databaseConfigured || !db) {
    return {
      databaseReady: false,
      leadOptions: [],
      followUpList: [],
    };
  }

  const [leadOptions, followUpList] = await Promise.all([
    db.query.leads.findMany({
      orderBy: [desc(leads.createdAt)],
      with: {
        company: true,
        contact: true,
      },
    }),
    db.query.followUps.findMany({
      orderBy: [followUps.dueDate],
      with: {
        lead: {
          with: {
            company: true,
            contact: true,
          },
        },
      },
    }),
  ]);

  return {
    databaseReady: true,
    leadOptions,
    followUpList: followUpList.filter(
      (followUp) =>
        matchesExact(filters.status, followUp.status) &&
        matchesQuery(filters.q, [
          followUp.notes,
          followUp.status,
          followUp.lead.company.name,
          followUp.lead.contact?.fullName,
          followUp.lead.nextAction,
        ]),
    ),
  };
}

export async function getTasksPageData(filters: TaskFilters = {}) {
  if (!databaseConfigured || !db) {
    return {
      databaseReady: false,
      leadOptions: [],
      projectOptions: [],
      taskList: [],
    };
  }

  const [leadOptions, projectOptions, taskList] = await Promise.all([
    db.query.leads.findMany({
      orderBy: [desc(leads.createdAt)],
      with: {
        company: true,
        contact: true,
      },
    }),
    db.query.projects.findMany({
      orderBy: [desc(projects.createdAt)],
      with: {
        company: true,
      },
    }),
    db.query.tasks.findMany({
      orderBy: [desc(tasks.createdAt)],
      with: {
        lead: {
          with: {
            company: true,
            contact: true,
          },
        },
        project: {
          with: {
            company: true,
          },
        },
      },
    }),
  ]);

  return {
    databaseReady: true,
    leadOptions,
    projectOptions,
    taskList: taskList.filter(
      (task) =>
        matchesExact(filters.status, task.status) &&
        matchesQuery(filters.q, [
          task.title,
          task.notes,
          task.status,
          task.lead?.company.name,
          task.lead?.contact?.fullName,
          task.project?.title,
          task.project?.company.name,
        ]),
    ),
  };
}

export async function getProposalsPageData(filters: ProposalFilters = {}) {
  if (!databaseConfigured || !db) {
    return {
      databaseReady: false,
      companyOptions: [],
      leadOptions: [],
      proposalList: [],
    };
  }

  const [companyOptions, leadOptions, proposalList] = await Promise.all([
    db.query.companies.findMany({
      orderBy: [companies.name],
    }),
    db.query.leads.findMany({
      orderBy: [desc(leads.createdAt)],
      with: {
        company: true,
        contact: true,
      },
    }),
    db.query.proposals.findMany({
      orderBy: [desc(proposals.createdAt)],
      with: {
        company: true,
        lead: {
          with: {
            contact: true,
          },
        },
      },
    }),
  ]);

  return {
    databaseReady: true,
    companyOptions,
    leadOptions,
    proposalList: proposalList.filter(
      (proposal) =>
        matchesExact(filters.status, proposal.status) &&
        matchesQuery(filters.q, [
          proposal.title,
          proposal.status,
          proposal.company.name,
          proposal.lead?.contact?.fullName,
        ]),
    ),
  };
}

export async function getProjectsPageData(filters: ProjectFilters = {}) {
  if (!databaseConfigured || !db) {
    return {
      databaseReady: false,
      companyOptions: [],
      proposalOptions: [],
      projectList: [],
    };
  }

  const [companyOptions, proposalOptions, projectList] = await Promise.all([
    db.query.companies.findMany({
      orderBy: [companies.name],
    }),
    db.query.proposals.findMany({
      orderBy: [desc(proposals.createdAt)],
      with: {
        company: true,
      },
    }),
    db.query.projects.findMany({
      orderBy: [desc(projects.createdAt)],
      with: {
        company: true,
        proposal: true,
        tasks: true,
      },
    }),
  ]);

  return {
    databaseReady: true,
    companyOptions,
    proposalOptions,
    projectList: projectList.filter(
      (project) =>
        matchesExact(filters.status, project.status) &&
        matchesQuery(filters.q, [
          project.title,
          project.status,
          project.company.name,
          project.githubRepoUrl,
          project.driveFolderUrl,
        ]),
    ),
  };
}

export async function getCompanyDetailData(companyId: string) {
  if (!databaseConfigured || !db) {
    return {
      databaseReady: false,
      company: null,
    };
  }

  const company = await db.query.companies.findFirst({
    where: eq(companies.id, companyId),
    with: {
      contacts: {
        orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
      },
      leads: {
        orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
        with: {
          contact: true,
          followUps: true,
        },
      },
      interactions: {
        orderBy: (table, helpers) => [helpers.desc(table.occurredAt)],
        with: {
          contact: true,
          lead: true,
        },
      },
      proposals: {
        orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
      },
      projects: {
        orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
      },
    },
  });

  return {
    databaseReady: true,
    company,
  };
}

export async function getContactDetailData(contactId: string) {
  if (!databaseConfigured || !db) {
    return {
      databaseReady: false,
      contact: null,
    };
  }

  const contact = await db.query.contacts.findFirst({
    where: eq(contacts.id, contactId),
    with: {
      company: true,
      leads: {
        orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
        with: {
          company: true,
          followUps: true,
        },
      },
      interactions: {
        orderBy: (table, helpers) => [helpers.desc(table.occurredAt)],
        with: {
          company: true,
          lead: true,
        },
      },
    },
  });

  return {
    databaseReady: true,
    contact,
  };
}

export async function getLeadDetailData(leadId: string) {
  if (!databaseConfigured || !db) {
    return {
      databaseReady: false,
      lead: null,
    };
  }

  const lead = await db.query.leads.findFirst({
    where: eq(leads.id, leadId),
    with: {
      company: true,
      contact: true,
      interactions: {
        orderBy: (table, helpers) => [helpers.desc(table.occurredAt)],
        with: {
          company: true,
          contact: true,
        },
      },
      followUps: {
        orderBy: (table) => [table.dueDate],
      },
      tasks: {
        orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
      },
    },
  });

  return {
    databaseReady: true,
    lead,
  };
}
