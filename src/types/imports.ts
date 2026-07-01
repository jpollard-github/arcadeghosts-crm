export type EnrichedProspectRow = {
  company: string;
  category?: string;
  sourceSheet?: string;
  website?: string;
  contactPerson?: string;
  title?: string;
  contactRole?: string;
  bestContactMethod?: string;
  publicEmailOrContact?: string;
  phone?: string;
  linkedinProfile?: string;
  companyLinkedIn?: string;
  businessType?: string;
  operationalPainSignal?: string;
  likelyWorkflowProblem?: string;
  specificOutreachAngle?: string;
  suggestedFirstOffer?: string;
  whyArcadeGhostsFits?: string;
  estimatedFit?: string;
  confidenceScore?: number;
  priorityScore?: number;
  warmIntroPossible?: string;
  firstMessageStatus?: string;
  lastContacted?: string;
  followUpDate?: string;
  responseStatus?: string;
  outreachStatus?: string;
  outcome?: string;
  doNotContact?: boolean;
  verificationDate?: string;
  source?: string;
  sourceUrls: string[];
  notes?: string;
};

export type ImportPreviewSummary = {
  totalRows: number;
  industries: Record<string, number>;
  highPriorityRows: number;
  doNotContactRows: number;
  readyToContactRows: number;
};

export type LocalWorkbookImportData = {
  workbookPath: string;
  sheetNames: string[];
  canonicalSheetName: string;
  rows: EnrichedProspectRow[];
  summary: ImportPreviewSummary;
};
