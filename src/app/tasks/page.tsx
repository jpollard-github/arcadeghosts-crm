import Link from "next/link";
import { PageIntro } from "@/components/crm/page-intro";
import {
  EmptyState,
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
  SecondaryButton,
  StackActions,
  SubmitButton,
  Surface,
  TwoColumn,
} from "@/components/crm/record-ui";
import { getSingleSearchParam } from "@/lib/query";
import { createTask } from "@/server/actions/crm";
import { getTasksPageData } from "@/server/services/crm";

export const dynamic = "force-dynamic";

const taskStatusOptions = ["todo", "in_progress", "blocked", "done"] as const;

function formatDueDate(value: Date | string | null) {
  if (!value) {
    return "No due date";
  }

  return new Date(value).toLocaleString();
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const q = getSingleSearchParam(resolvedSearchParams.q) ?? "";
  const status = getSingleSearchParam(resolvedSearchParams.status) ?? "";

  const { leadOptions, projectOptions, taskList, databaseReady } = await getTasksPageData({
    q,
    status,
  });

  return (
    <>
      <PageIntro
        eyebrow="Tasks"
        title="Track operational work tied to leads or projects"
        description="Tasks now have a first workflow so internal follow-through can live next to lead and project context instead of drifting into separate notes or chat threads."
      />
      <div className="crm-toolbar">
        <form className="crm-filter-form">
          <div className="crm-filter-row">
            <FormField label="Search tasks">
              <FormInput
                name="q"
                defaultValue={q}
                placeholder="Title, notes, company, contact, project..."
              />
            </FormField>
            <FormField label="Status">
              <FormSelect name="status" defaultValue={status}>
                <option value="">All statuses</option>
                {taskStatusOptions.map((option) => (
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
              <Link href="/tasks" className="crm-inline-link">
                Clear filters
              </Link>
            )}
          </div>
        </form>
      </div>
      <TwoColumn>
        <Surface>
          <h3>Task list</h3>
          {!databaseReady ? (
            <EmptyState
              title="Database not configured"
              body="Set DATABASE_URL in Vercel, or connect a Vercel Postgres or Neon integration that provides POSTGRES_URL, before using tasks in the live CRM."
            />
          ) : taskList.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              body="Add the first CRM task so internal execution work stays visible next to the lead and project pipeline."
            />
          ) : (
            <div className="crm-list-stack">
              {taskList.map((task) => (
                <article key={task.id} className="crm-list-card">
                  <div className="crm-stack-actions">
                    <span className="crm-badge">{task.status}</span>
                  </div>
                  <h4>{task.title}</h4>
                  <p className="crm-subtle-text">{formatDueDate(task.dueDate)}</p>
                  <p>
                    {task.lead && (
                      <>
                        <Link href={`/leads/${task.leadId}`} className="crm-inline-link">
                          {task.lead.company.name}
                        </Link>
                        {task.lead.contact?.fullName ? ` · ${task.lead.contact.fullName}` : ""}
                      </>
                    )}
                    {task.project && (
                      <>
                        {task.lead ? " · " : ""}
                        {task.project.title} · {task.project.company.name}
                      </>
                    )}
                    {!task.lead && !task.project && "No linked lead or project"}
                  </p>
                  {task.notes && <p className="crm-subtle-text">{task.notes}</p>}
                </article>
              ))}
            </div>
          )}
        </Surface>
        <Surface>
          <h3>Add task</h3>
          {!databaseReady ? (
            <EmptyState
              title="Database setup needed"
              body="This form will unlock once the deployment has a valid DATABASE_URL or Vercel Postgres URL."
            />
          ) : (
            <form action={createTask} className="crm-form">
              <FormField label="Lead">
                <FormSelect name="leadId" defaultValue="">
                  <option value="">No lead selected</option>
                  {leadOptions.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.company.name}
                      {lead.contact?.fullName ? ` · ${lead.contact.fullName}` : ""}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Project">
                <FormSelect name="projectId" defaultValue="">
                  <option value="">No project selected</option>
                  {projectOptions.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title} · {project.company.name}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Title">
                <FormInput name="title" required placeholder="Prepare discovery recap..." />
              </FormField>
              <FormField label="Status">
                <FormSelect name="status" defaultValue="todo">
                  {taskStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Due date">
                <FormInput name="dueDate" type="datetime-local" />
              </FormField>
              <FormField label="Notes">
                <FormTextarea name="notes" />
              </FormField>
              <StackActions>
                <SubmitButton label="Create task" />
              </StackActions>
            </form>
          )}
        </Surface>
      </TwoColumn>
    </>
  );
}
