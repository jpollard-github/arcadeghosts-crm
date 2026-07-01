import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/crm/page-intro";
import { EmptyState, Surface } from "@/components/crm/record-ui";
import { getLeadDetailData } from "@/server/services/crm";

type LeadDetailPageProps = {
  params: Promise<{
    leadId: string;
  }>;
};

export const dynamic = "force-dynamic";

function formatDateTime(value: Date | string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Date(value).toLocaleString();
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { leadId } = await params;
  const { lead, databaseReady } = await getLeadDetailData(leadId);

  if (!databaseReady) {
    return (
      <>
        <PageIntro
          eyebrow="Lead detail"
          title="Lead detail needs database setup"
          description="Set DATABASE_URL in Vercel, or connect a Vercel Postgres or Neon integration that provides POSTGRES_URL, before using lead detail pages in the live CRM."
        />
        <Surface>
          <EmptyState
            title="Database not configured"
            body="This detail page will unlock once the deployment has a valid database connection."
          />
        </Surface>
      </>
    );
  }

  if (!lead) {
    notFound();
  }

  return (
    <>
      <PageIntro
        eyebrow="Lead detail"
        title={`${lead.company.name} · ${lead.status}`}
        description={
          lead.nextAction ??
          lead.suggestedFirstOffer ??
          "This detail page gathers qualification context, next actions, interactions, follow-ups, and tasks for one lead record."
        }
      />
      <div className="crm-detail-grid">
        <Surface>
          <h3>Qualification</h3>
          <div className="crm-metric-grid">
            <div className="crm-meta-block">
              <span className="crm-meta-label">Company</span>
              <span className="crm-meta-value">
                <Link href={`/companies/${lead.companyId}`} className="crm-inline-link">
                  {lead.company.name}
                </Link>
              </span>
            </div>
            <div className="crm-meta-block">
              <span className="crm-meta-label">Contact</span>
              <span className="crm-meta-value">
                {lead.contact ? (
                  <Link href={`/contacts/${lead.contactId}`} className="crm-inline-link">
                    {lead.contact.fullName ?? "Contact"}
                  </Link>
                ) : (
                  "Not linked"
                )}
              </span>
            </div>
            <div className="crm-meta-block">
              <span className="crm-meta-label">Estimated fit</span>
              <span className="crm-meta-value">{lead.estimatedFit ?? "Not set"}</span>
            </div>
            <div className="crm-meta-block">
              <span className="crm-meta-label">Next action</span>
              <span className="crm-meta-value">{lead.nextAction ?? "Not set"}</span>
            </div>
          </div>
          {lead.operationalPainSignal && (
            <p className="crm-subtle-text">Pain signal: {lead.operationalPainSignal}</p>
          )}
          {lead.likelyWorkflowProblem && (
            <p className="crm-subtle-text">Workflow problem: {lead.likelyWorkflowProblem}</p>
          )}
        </Surface>
        <Surface>
          <h3>Workflow status</h3>
          <div className="crm-metric-grid">
            <div className="crm-meta-block">
              <span className="crm-meta-label">Follow-up date</span>
              <span className="crm-meta-value">{formatDateTime(lead.followUpDate)}</span>
            </div>
            <div className="crm-meta-block">
              <span className="crm-meta-label">Outreach status</span>
              <span className="crm-meta-value">{lead.outreachStatus}</span>
            </div>
            <div className="crm-meta-block">
              <span className="crm-meta-label">Do not contact</span>
              <span className="crm-meta-value">{lead.doNotContact ? "Yes" : "No"}</span>
            </div>
            <div className="crm-meta-block">
              <span className="crm-meta-label">Interactions</span>
              <span className="crm-meta-value">{lead.interactions.length}</span>
            </div>
            <div className="crm-meta-block">
              <span className="crm-meta-label">Tasks</span>
              <span className="crm-meta-value">{lead.tasks.length}</span>
            </div>
          </div>
        </Surface>
      </div>
      <div className="crm-detail-grid">
        <Surface>
          <h3>Interactions</h3>
          {lead.interactions.length === 0 ? (
            <EmptyState
              title="No interactions yet"
              body="Log the first touch on the Interactions page so this lead has a real outreach history."
            />
          ) : (
            <div className="crm-record-list">
              {lead.interactions.map((interaction) => (
                <article key={interaction.id} className="crm-record-item">
                  <strong>{interaction.summary}</strong>
                  <p className="crm-subtle-text">
                    {interaction.type} · {interaction.direction}
                    {interaction.contact?.fullName ? ` · ${interaction.contact.fullName}` : ""}
                  </p>
                </article>
              ))}
            </div>
          )}
        </Surface>
        <Surface>
          <h3>Follow-ups</h3>
          {lead.followUps.length === 0 ? (
            <EmptyState
              title="No follow-ups yet"
              body="Use the Follow-ups page to add the next-touch queue for this lead."
            />
          ) : (
            <div className="crm-record-list">
              {lead.followUps.map((followUp) => (
                <article key={followUp.id} className="crm-record-item">
                  <strong>{followUp.status}</strong>
                  <p className="crm-subtle-text">{formatDateTime(followUp.dueDate)}</p>
                  {followUp.notes && <p className="crm-subtle-text">{followUp.notes}</p>}
                </article>
              ))}
            </div>
          )}
        </Surface>
      </div>
      <Surface>
        <h3>Tasks</h3>
        {lead.tasks.length === 0 ? (
          <EmptyState
            title="No tasks yet"
            body="Use the Tasks page to add internal execution work tied to this lead."
          />
        ) : (
          <div className="crm-record-list">
            {lead.tasks.map((task) => (
              <article key={task.id} className="crm-record-item">
                <strong>{task.title}</strong>
                <p className="crm-subtle-text">
                  {task.status}
                  {task.dueDate ? ` · ${formatDateTime(task.dueDate)}` : ""}
                </p>
              </article>
            ))}
          </div>
        )}
      </Surface>
    </>
  );
}
