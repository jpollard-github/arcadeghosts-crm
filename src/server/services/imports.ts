import { promises as fs } from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import type {
  EnrichedProspectRow,
  ImportPreviewSummary,
  LocalWorkbookImportData,
} from "@/types/imports";

const demoImportPath = path.join(process.cwd(), "examples", "triad-prospects-template.csv");
const localWorkbookPath = path.join(
  process.cwd(),
  "private",
  "triad_prospects_enriched_outreach_tracker.xlsx",
);

export const demoImportTag = "[demo-import]";
export const localWorkbookImportTag = "[local-workbook-import]";
export const canonicalWorkbookSheetName = "Master Prospects";

function parseCsv(source: string) {
  const rows: string[][] = [];
  let currentCell = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const nextChar = source[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      currentRow.push(currentCell);
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentCell = "";
      currentRow = [];
      continue;
    }

    currentCell += char;
  }

  currentRow.push(currentCell);
  if (currentRow.some((cell) => cell.length > 0)) {
    rows.push(currentRow);
  }

  return rows;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

function parseNumber(value: string | number | boolean | undefined) {
  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "boolean"
        ? Number(value)
        : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBoolean(value: string | number | boolean | undefined) {
  if (value === undefined || value === "") {
    return false;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return ["true", "yes", "y", "1"].includes(String(value).trim().toLowerCase());
}

function clean(value: string | number | boolean | undefined) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmed = String(value).trim();
  return trimmed ? trimmed : undefined;
}

function splitSourceUrls(value: string | number | boolean | undefined) {
  if (!value) {
    return [];
  }

  return String(value)
    .split("|")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeProspectRow(
  cell: (header: string) => string | number | boolean | undefined,
  defaults: { category?: string; sourceSheet?: string } = {},
): EnrichedProspectRow {
  return {
    company: clean(cell("Company")) ?? "Unnamed company",
    category: clean(cell("Category")) ?? defaults.category,
    sourceSheet: defaults.sourceSheet,
    website: clean(cell("Website")),
    contactPerson: clean(cell("Contact Person")),
    title: clean(cell("Title")),
    contactRole: clean(cell("Contact Role")),
    bestContactMethod: clean(cell("Best Contact Method")),
    publicEmailOrContact: clean(cell("Public Email/Contact")),
    phone: clean(cell("Phone")),
    linkedinProfile: clean(cell("LinkedIn Profile")),
    companyLinkedIn: clean(cell("Company LinkedIn")),
    businessType: clean(cell("Business Type")),
    operationalPainSignal: clean(cell("Operational Pain Signal")),
    likelyWorkflowProblem: clean(cell("Likely Workflow Problem")),
    specificOutreachAngle: clean(cell("Specific Outreach Angle")),
    suggestedFirstOffer: clean(cell("Suggested First Offer")),
    whyArcadeGhostsFits: clean(cell("Why ArcadeGhosts Fits")),
    estimatedFit: clean(cell("Estimated Fit")),
    confidenceScore: parseNumber(cell("Confidence Score")),
    priorityScore: parseNumber(cell("Priority Score")),
    warmIntroPossible: clean(cell("Warm Intro Possible")),
    firstMessageStatus: clean(cell("First Message Status")),
    lastContacted: clean(cell("Last Contacted")),
    followUpDate: clean(cell("Follow-up Date")),
    responseStatus: clean(cell("Response Status")),
    outcome: clean(cell("Outcome")),
    doNotContact: parseBoolean(cell("Do Not Contact")),
    verificationDate: clean(cell("Verification Date")),
    source: clean(cell("Source")),
    sourceUrls: splitSourceUrls(cell("Source URLs")),
    notes: clean(cell("Notes")),
  };
}

export function normalizeEnrichedProspectRows(csvSource: string) {
  const [headers, ...rows] = parseCsv(csvSource);
  const headerMap = headers.map(normalizeHeader);

  return rows.map((row) =>
    normalizeProspectRow((header) => {
      const index = headerMap.indexOf(normalizeHeader(header));
      return index >= 0 ? row[index] : undefined;
    }),
  );
}

function normalizeWorkbookRows(
  workbook: XLSX.WorkBook,
  sheetName = canonicalWorkbookSheetName,
) {
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`Workbook sheet "${sheetName}" was not found.`);
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, string | number | boolean>>(worksheet, {
    defval: "",
  });

  return rows.map((row) =>
    normalizeProspectRow((header) => row[header], {
      category: clean(row.Category) ?? clean(row["Business Type"]) ?? sheetName,
      sourceSheet: sheetName,
    }),
  );
}

export function summarizeImportRows(rows: EnrichedProspectRow[]): ImportPreviewSummary {
  const industries: Record<string, number> = {};

  for (const row of rows) {
    const key = row.businessType ?? row.category ?? "Unknown";
    industries[key] = (industries[key] ?? 0) + 1;
  }

  return {
    totalRows: rows.length,
    industries,
    highPriorityRows: rows.filter((row) => (row.priorityScore ?? 0) >= 80).length,
    doNotContactRows: rows.filter((row) => row.doNotContact).length,
    readyToContactRows: rows.filter((row) => row.firstMessageStatus === "Draft Ready").length,
  };
}

export function deriveLeadStatusFromImport(row: EnrichedProspectRow) {
  if (row.doNotContact) {
    return "do_not_contact" as const;
  }

  if (row.outcome?.toLowerCase() === "won") {
    return "won" as const;
  }

  if (row.outcome?.toLowerCase() === "lost") {
    return "lost" as const;
  }

  if (row.firstMessageStatus === "Draft Ready") {
    return "ready_to_contact" as const;
  }

  if (row.lastContacted) {
    return "contacted" as const;
  }

  return "researching" as const;
}

export function deriveOutreachStatusFromImport(row: EnrichedProspectRow) {
  const firstMessageStatus = row.firstMessageStatus?.trim().toLowerCase();
  const responseStatus = row.responseStatus?.trim().toLowerCase();

  if (row.doNotContact) {
    return "do_not_contact" as const;
  }

  if (responseStatus?.includes("bounce")) {
    return "bounced" as const;
  }

  if (
    responseStatus &&
    !["not contacted", "no response", "none", "not started"].includes(responseStatus)
  ) {
    return "replied" as const;
  }

  if (firstMessageStatus === "draft ready") {
    return "draft_ready" as const;
  }

  if (firstMessageStatus === "scheduled") {
    return "scheduled" as const;
  }

  if (row.lastContacted && row.followUpDate) {
    return "follow_up_due" as const;
  }

  if (row.lastContacted) {
    return "sent" as const;
  }

  if (firstMessageStatus === "draft") {
    return "draft" as const;
  }

  return "not_started" as const;
}

export function getImportPriorityLabel(row: EnrichedProspectRow) {
  const score = row.priorityScore ?? 0;

  if (row.doNotContact) {
    return "Do not contact";
  }

  if (score >= 85) {
    return "High";
  }

  if (score >= 70) {
    return "Medium";
  }

  return "Low";
}

export async function getBundledDemoImportData() {
  const csvSource = await fs.readFile(demoImportPath, "utf8");
  const rows = normalizeEnrichedProspectRows(csvSource);
  const summary = summarizeImportRows(rows);

  return {
    csvSource,
    rows,
    summary,
  };
}

export async function getLocalWorkbookImportData(): Promise<LocalWorkbookImportData | null> {
  try {
    await fs.access(localWorkbookPath);
  } catch {
    return null;
  }

  const workbook = XLSX.readFile(localWorkbookPath);
  const rows = normalizeWorkbookRows(workbook);
  const summary = summarizeImportRows(rows);

  return {
    workbookPath: localWorkbookPath,
    sheetNames: workbook.SheetNames,
    canonicalSheetName: canonicalWorkbookSheetName,
    rows,
    summary,
  };
}
