import { PageIntro } from "@/components/crm/page-intro";
import {
  EmptyState,
  SecondaryButton,
  StackActions,
  SubmitButton,
  Surface,
  TwoColumn,
} from "@/components/crm/record-ui";
import {
  clearBundledDemoLeads,
  clearLocalWorkbookLeads,
  importBundledDemoLeads,
  importLocalWorkbookLeads,
} from "@/server/actions/crm";
import {
  canonicalWorkbookSheetName,
  demoImportTag,
  deriveLeadStatusFromImport,
  getBundledDemoImportData,
  getImportPriorityLabel,
  getLocalWorkbookImportData,
  localWorkbookImportTag,
} from "@/server/services/imports";

export const dynamic = "force-dynamic";

export default async function ImportsPage() {
  const { rows, summary } = await getBundledDemoImportData();
  const localWorkbook = await getLocalWorkbookImportData();

  return (
    <>
      <PageIntro
        eyebrow="Imports"
        title="Stage enriched lead imports safely"
        description="This import area now supports both a demo-safe preview flow and an explicit local-only workbook import path. The real workbook is only available when it exists in private/ on your local machine."
      />
      <TwoColumn>
        <Surface>
          <h3 style={{ marginTop: 0 }}>Bundled demo import</h3>
          <p className="crm-subtle-text">
            The private reference workbook currently contains these sheet names:
            {" "}
            <strong>Master Prospects</strong>, <strong>manufacturers_operations</strong>,
            {" "}
            <strong>medical_wellness</strong>, <strong>professional_services</strong>,
            {" "}
            <strong>property_trades</strong>, and <strong>nonprofits</strong>.
          </p>
          <p className="crm-subtle-text">
            The canonical import sheet is <strong>{canonicalWorkbookSheetName}</strong>. The
            category tabs stay useful as source references, but the main workbook sheet is the
            explicit local import source to avoid duplicate row imports.
          </p>
          {localWorkbook ? (
            <>
              <div className="crm-metric-grid">
                <div className="crm-meta-block">
                  <span className="crm-meta-label">Local workbook rows</span>
                  <span className="crm-meta-value">{localWorkbook.summary.totalRows}</span>
                </div>
                <div className="crm-meta-block">
                  <span className="crm-meta-label">Canonical sheet</span>
                  <span className="crm-meta-value">{localWorkbook.canonicalSheetName}</span>
                </div>
                <div className="crm-meta-block">
                  <span className="crm-meta-label">Workbook tabs</span>
                  <span className="crm-meta-value">{localWorkbook.sheetNames.length}</span>
                </div>
                <div className="crm-meta-block">
                  <span className="crm-meta-label">Ready to contact</span>
                  <span className="crm-meta-value">{localWorkbook.summary.readyToContactRows}</span>
                </div>
              </div>
              <h3>Local-only workbook import</h3>
              <p className="crm-subtle-text">
                This action reads <code>{localWorkbook.workbookPath}</code> directly from disk,
                normalizes only the <code>{localWorkbook.canonicalSheetName}</code> sheet, and tags
                imported company or contact notes with <code>{localWorkbookImportTag}</code>.
              </p>
              <div className="crm-record-list">
                {localWorkbook.sheetNames.map((sheetName) => (
                  <article key={sheetName} className="crm-record-item">
                    <strong>{sheetName}</strong>
                    <p className="crm-subtle-text" style={{ margin: "0.35rem 0 0" }}>
                      {sheetName === localWorkbook.canonicalSheetName
                        ? "Used for canonical row import."
                        : "Reference tab only; do not import separately."}
                    </p>
                  </article>
                ))}
              </div>
              <StackActions>
                <form action={importLocalWorkbookLeads}>
                  <SubmitButton label="Import local workbook rows" />
                </form>
                <form action={clearLocalWorkbookLeads}>
                  <SecondaryButton label="Clear local workbook rows" />
                </form>
              </StackActions>
            </>
          ) : (
            <EmptyState
              title="Local workbook not available here"
              body="Keep the real workbook in private/ on your local machine to unlock the explicit XLSX import workflow. This stays unavailable in environments where the file is absent."
            />
          )}
          <h3>Bundled demo import</h3>
          <div className="crm-metric-grid">
            <div className="crm-meta-block">
              <span className="crm-meta-label">Rows</span>
              <span className="crm-meta-value">{summary.totalRows}</span>
            </div>
            <div className="crm-meta-block">
              <span className="crm-meta-label">High priority</span>
              <span className="crm-meta-value">{summary.highPriorityRows}</span>
            </div>
            <div className="crm-meta-block">
              <span className="crm-meta-label">Ready to contact</span>
              <span className="crm-meta-value">{summary.readyToContactRows}</span>
            </div>
            <div className="crm-meta-block">
              <span className="crm-meta-label">Do not contact</span>
              <span className="crm-meta-value">{summary.doNotContactRows}</span>
            </div>
          </div>
          <h3>Industry mix</h3>
          <div className="crm-record-list">
            {Object.entries(summary.industries).map(([industry, count]) => (
              <article key={industry} className="crm-record-item">
                <strong>{industry}</strong>
                <p className="crm-subtle-text" style={{ margin: "0.35rem 0 0" }}>
                  {count} rows
                </p>
              </article>
            ))}
          </div>
          <StackActions>
            <form action={importBundledDemoLeads}>
              <SubmitButton label="Import bundled demo rows" />
            </form>
            <form action={clearBundledDemoLeads}>
              <SecondaryButton label="Clear bundled demo rows" />
            </form>
          </StackActions>
          <p className="crm-subtle-text">
            Imported demo companies and contacts are tagged with <code>{demoImportTag}</code> in
            notes so they can be cleaned up. This is for local or preview use only, not a substitute
            for a dedicated non-production database.
          </p>
        </Surface>
        <Surface>
          <h3 style={{ marginTop: 0 }}>Normalized preview</h3>
          {localWorkbook && (
            <>
              <p className="crm-subtle-text">
                Local workbook preview from <code>{localWorkbook.canonicalSheetName}</code>.
              </p>
              <div className="crm-list-stack" style={{ marginBottom: "1rem" }}>
                {localWorkbook.rows.slice(0, 6).map((row) => (
                  <article key={`local-${row.company}-${row.contactPerson}`} className="crm-list-card">
                    <div className="crm-stack-actions">
                      <span className="crm-badge">{getImportPriorityLabel(row)}</span>
                      <span className="crm-badge crm-badge--muted">
                        {deriveLeadStatusFromImport(row)}
                      </span>
                    </div>
                    <h4>{row.company}</h4>
                    <p>
                      {row.contactRole ?? "No contact role"}
                      {row.category ? ` · ${row.category}` : ""}
                    </p>
                    <p className="crm-subtle-text">
                      {row.contactPerson ?? "No contact person"}
                      {row.website ? ` · ${row.website}` : ""}
                    </p>
                    <p className="crm-subtle-text">
                      {row.operationalPainSignal ?? row.likelyWorkflowProblem ?? "No pain signal yet"}
                    </p>
                  </article>
                ))}
              </div>
            </>
          )}
          {rows.length === 0 ? (
            <EmptyState
              title="No demo rows available"
              body="The bundled demo CSV is missing or empty."
            />
          ) : (
            <div className="crm-list-stack">
              {rows.map((row) => (
                <article key={`${row.company}-${row.contactPerson}`} className="crm-list-card">
                  <div className="crm-stack-actions">
                    <span className="crm-badge">{getImportPriorityLabel(row)}</span>
                    <span className="crm-badge crm-badge--muted">
                      {deriveLeadStatusFromImport(row)}
                    </span>
                  </div>
                  <h4>{row.company}</h4>
                  <p>
                    {row.contactPerson ?? "No contact person"}{row.title ? ` · ${row.title}` : ""}
                  </p>
                  <p className="crm-subtle-text">
                    {row.businessType ?? "Unknown business type"}
                    {row.estimatedFit ? ` · ${row.estimatedFit} fit` : ""}
                    {row.priorityScore ? ` · priority ${row.priorityScore}` : ""}
                  </p>
                  <p className="crm-subtle-text">
                    {row.operationalPainSignal ?? row.likelyWorkflowProblem ?? "No pain signal yet"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </Surface>
      </TwoColumn>
    </>
  );
}
