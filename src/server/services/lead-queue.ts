const terminalLeadStatuses = new Set([
  "won",
  "lost",
  "do_not_contact",
]);

const activeLeadStatuses = new Set([
  "new",
  "researching",
  "ready_to_contact",
  "contacted",
  "follow_up_1",
  "follow_up_2",
  "discovery_scheduled",
  "proposal_sent",
  "nurture",
]);

type LeadQueueCompany = {
  fitScore: number | null;
  priorityScore: number | null;
};

export type LeadQueueItem = {
  id: string;
  status: string;
  doNotContact: boolean;
  warmIntroPossible: boolean;
  followUpDate: Date | null;
  verificationDate: Date | null;
  nextAction: string | null;
  operationalPainSignal: string | null;
  likelyWorkflowProblem: string | null;
  specificOutreachAngle: string | null;
  sourceUrls: string[];
  createdAt: Date;
  updatedAt: Date;
  company: LeadQueueCompany;
};

export type StaleLeadReviewItem = {
  leadId: string;
  staleScore: number;
  reasons: string[];
};

function daysSince(date: Date, now: Date) {
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function daysUntil(date: Date, now: Date) {
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function hasText(value: string | null) {
  return Boolean(value?.trim());
}

export function getLeadPriorityScore(lead: LeadQueueItem, now = new Date()) {
  if (lead.doNotContact || terminalLeadStatuses.has(lead.status)) {
    return -100;
  }

  let score = lead.company.priorityScore ?? 0;
  score += Math.round((lead.company.fitScore ?? 0) * 0.25);

  if (lead.warmIntroPossible) {
    score += 8;
  }

  if (lead.status === "ready_to_contact") {
    score += 14;
  } else if (lead.status === "researching") {
    score += 8;
  } else if (lead.status === "contacted" || lead.status.startsWith("follow_up_")) {
    score += 6;
  }

  if (hasText(lead.nextAction)) {
    score += 5;
  }

  if (hasText(lead.operationalPainSignal) || hasText(lead.likelyWorkflowProblem)) {
    score += 6;
  }

  if (hasText(lead.specificOutreachAngle)) {
    score += 5;
  }

  if (lead.sourceUrls.length > 0) {
    score += 4;
  }

  if (lead.verificationDate) {
    const verificationAge = daysSince(lead.verificationDate, now);

    if (verificationAge <= 14) {
      score += 8;
    } else if (verificationAge >= 30) {
      score -= 10;
    }
  } else if (daysSince(lead.createdAt, now) >= 14) {
    score -= 6;
  }

  if (lead.followUpDate) {
    const followUpDelta = daysUntil(lead.followUpDate, now);

    if (followUpDelta < 0) {
      score += 14;
    } else if (followUpDelta <= 1) {
      score += 10;
    } else if (followUpDelta <= 3) {
      score += 6;
    }
  }

  if (daysSince(lead.updatedAt, now) >= 21) {
    score -= 8;
  }

  return score;
}

export function getWeeklyStaleLeadReviewItem(
  lead: LeadQueueItem,
  now = new Date(),
): StaleLeadReviewItem | null {
  if (lead.doNotContact || !activeLeadStatuses.has(lead.status)) {
    return null;
  }

  const reasons: string[] = [];
  let staleScore = 0;

  if (lead.followUpDate) {
    const followUpDelta = daysUntil(lead.followUpDate, now);

    if (followUpDelta < 0) {
      reasons.push(`Follow-up overdue by ${Math.abs(followUpDelta)} day${Math.abs(followUpDelta) === 1 ? "" : "s"}`);
      staleScore += 14 + Math.min(Math.abs(followUpDelta), 10);
    }
  }

  if (lead.verificationDate) {
    const verificationAge = daysSince(lead.verificationDate, now);

    if (verificationAge >= 30) {
      reasons.push(`Public info unverified for ${verificationAge} days`);
      staleScore += 12 + Math.min(Math.floor(verificationAge / 7), 6);
    }
  } else {
    const age = daysSince(lead.createdAt, now);
    if (age >= 14) {
      reasons.push(`No verification date after ${age} days in CRM`);
      staleScore += 10 + Math.min(Math.floor(age / 7), 5);
    }
  }

  const idleDays = daysSince(lead.updatedAt, now);
  if (idleDays >= 14) {
    reasons.push(`No lead updates for ${idleDays} days`);
    staleScore += 8 + Math.min(Math.floor(idleDays / 7), 6);
  }

  if (!hasText(lead.nextAction) && idleDays >= 7) {
    reasons.push("Missing next action");
    staleScore += 6;
  }

  if (
    (lead.status === "contacted" || lead.status.startsWith("follow_up_")) &&
    !lead.followUpDate &&
    idleDays >= 7
  ) {
    reasons.push("Outreach is in flight without a follow-up date");
    staleScore += 8;
  }

  if (reasons.length === 0) {
    return null;
  }

  return {
    leadId: lead.id,
    staleScore,
    reasons,
  };
}
