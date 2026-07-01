import Link from "next/link";
import { PageIntro } from "@/components/crm/page-intro";
import {
  EmptyState,
  FormField,
  FormInput,
  FormSelect,
  SecondaryButton,
  StackActions,
  SubmitButton,
  Surface,
  TwoColumn,
} from "@/components/crm/record-ui";
import { getSingleSearchParam } from "@/lib/query";
import { createProject } from "@/server/actions/crm";
import { getProjectsPageData } from "@/server/services/crm";

export const dynamic = "force-dynamic";

const projectStatusOptions = ["draft", "planned", "active", "paused", "completed", "cancelled"] as const;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const q = getSingleSearchParam(resolvedSearchParams.q) ?? "";
  const status = getSingleSearchParam(resolvedSearchParams.status) ?? "";

  const { companyOptions, proposalOptions, projectList, databaseReady } = await getProjectsPageData({
    q,
    status,
  });

  return (
    <>
      <PageIntro
        eyebrow="Projects"
        title="Manage active client work after the sale"
        description="Projects now have a first workflow. Capture the post-sale handoff with company context, optional proposal links, repo references, drive links, and status."
      />
      <div className="crm-toolbar">
        <form className="crm-filter-form">
          <div className="crm-filter-row">
            <FormField label="Search projects">
              <FormInput name="q" defaultValue={q} placeholder="Title, company, repo, drive..." />
            </FormField>
            <FormField label="Status">
              <FormSelect name="status" defaultValue={status}>
                <option value="">All statuses</option>
                {projectStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </FormSelect>
            </FormField>
          </div>
          <div className="crm-filter-actions">
            <SecondaryButton label="Apply filters" />
            {(q || status) && (
              <Link href="/projects" className="crm-inline-link">
                Clear filters
              </Link>
            )}
          </div>
        </form>
      </div>
      <TwoColumn>
        <Surface>
          <h3>Project list</h3>
          {!databaseReady ? (
            <EmptyState
              title="Database not configured"
              body="Set DATABASE_URL in Vercel, or connect a Vercel Postgres or Neon integration that provides POSTGRES_URL, before using projects in the live CRM."
            />
          ) : projectList.length === 0 ? (
            <EmptyState
              title="No projects yet"
              body="Once a proposal is accepted, create a project so delivery work, repos, folders, and task handoff live in the CRM."
            />
          ) : (
            <div className="crm-list-stack">
              {projectList.map((project) => (
                <article key={project.id} className="crm-list-card">
                  <div className="crm-stack-actions">
                    <span className="crm-badge">{project.status}</span>
                  </div>
                  <h4>{project.title}</h4>
                  <p>
                    {project.company.name}
                    {project.proposal ? ` · from ${project.proposal.title}` : ""}
                  </p>
                  <p className="crm-subtle-text">{project.tasks.length} linked tasks</p>
                  {project.githubRepoUrl && (
                    <p>
                      <a href={project.githubRepoUrl} className="crm-inline-link" target="_blank" rel="noreferrer">
                        GitHub repo
                      </a>
                    </p>
                  )}
                  {project.driveFolderUrl && (
                    <p>
                      <a href={project.driveFolderUrl} className="crm-inline-link" target="_blank" rel="noreferrer">
                        Drive folder
                      </a>
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </Surface>
        <Surface>
          <h3>Add project</h3>
          {!databaseReady ? (
            <EmptyState
              title="Database setup needed"
              body="This form will unlock once the deployment has a valid DATABASE_URL or Vercel Postgres URL."
            />
          ) : companyOptions.length === 0 ? (
            <EmptyState
              title="Add a company first"
              body="Projects still need a company anchor even when they come from a proposal handoff."
            />
          ) : (
            <form action={createProject} className="crm-form">
              <FormField label="Company">
                <FormSelect name="companyId" required defaultValue="">
                  <option value="" disabled>
                    Select a company
                  </option>
                  {companyOptions.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Proposal">
                <FormSelect name="proposalId" defaultValue="">
                  <option value="">No proposal selected</option>
                  {proposalOptions.map((proposal) => (
                    <option key={proposal.id} value={proposal.id}>
                      {proposal.title} · {proposal.company.name}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Title">
                <FormInput name="title" required placeholder="Client operations dashboard build..." />
              </FormField>
              <FormField label="Status">
                <FormSelect name="status" defaultValue="draft">
                  {projectStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="GitHub repo URL">
                <FormInput name="githubRepoUrl" type="url" placeholder="https://github.com/..." />
              </FormField>
              <FormField label="Drive folder URL">
                <FormInput name="driveFolderUrl" type="url" placeholder="https://drive.google.com/..." />
              </FormField>
              <FormField label="Stripe customer ID">
                <FormInput name="stripeCustomerId" placeholder="cus_..." />
              </FormField>
              <StackActions>
                <SubmitButton label="Create project" />
              </StackActions>
            </form>
          )}
        </Surface>
      </TwoColumn>
    </>
  );
}
