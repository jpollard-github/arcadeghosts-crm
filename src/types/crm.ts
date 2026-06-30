export type LeadStatus =
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
  | "do_not_contact";

export type ProjectStatus =
  | "draft"
  | "planned"
  | "active"
  | "paused"
  | "completed"
  | "cancelled";
