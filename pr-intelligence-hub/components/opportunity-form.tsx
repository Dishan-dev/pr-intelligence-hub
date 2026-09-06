"use client";

import { useActionState, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";

import {
  OPPORTUNITY_CATEGORIES, OPPORTUNITY_CATEGORY_LABELS, OPPORTUNITY_PRIORITY_LABELS,
  OPPORTUNITY_STATUSES, OPPORTUNITY_STATUS_LABELS, REPRESENTATION_TYPES,
  REPRESENTATION_TYPE_LABELS, type OpportunityFormValues, type OrganizationOption,
} from "@/lib/domain/opportunity";
import { INITIAL_OPPORTUNITY_FORM_STATE, type OpportunityFormState } from "@/lib/domain/opportunity-form";
import { evaluateOpportunity } from "@/lib/domain/opportunity-score";
import { Button } from "@/components/ui/button";

type OpportunityFormAction = (state: OpportunityFormState, formData: FormData) => Promise<OpportunityFormState>;

interface OpportunityFormProps {
  organizations: OrganizationOption[];
  initialValues: OpportunityFormValues;
  action: OpportunityFormAction;
  submitLabel: string;
}

const scoreFields = [
  ["relevanceScore", "AIESEC relevance", "relevance"],
  ["visibilityScore", "Visibility potential", "visibility"],
  ["networkingScore", "Networking value", "networking"],
  ["stakeholderValueScore", "Stakeholder value", "stakeholderValue"],
  ["feasibilityScore", "Feasibility", "feasibility"],
] as const;

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-red-600">{message}</p> : null;
}

export function OpportunityForm({ organizations, initialValues, action, submitLabel }: OpportunityFormProps) {
  const [values, setValues] = useState(initialValues);
  const [state, formAction, isPending] = useActionState(action, INITIAL_OPPORTUNITY_FORM_STATE);
  const evaluation = useMemo(() => evaluateOpportunity({
    relevance: values.relevanceScore === "" ? undefined : Number(values.relevanceScore),
    visibility: values.visibilityScore === "" ? undefined : Number(values.visibilityScore),
    networking: values.networkingScore === "" ? undefined : Number(values.networkingScore),
    stakeholderValue: values.stakeholderValueScore === "" ? undefined : Number(values.stakeholderValueScore),
    feasibility: values.feasibilityScore === "" ? undefined : Number(values.feasibilityScore),
  }), [values]);

  const updateValue = (key: keyof OpportunityFormValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };
  const inputClass = "mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200";

  return (
    <form action={formAction} className="space-y-8">
      {state.message && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</div>}
      <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-950">Basic information</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="md:col-span-2"><span className="text-sm font-medium text-slate-700">Title <span className="text-red-600">*</span></span>
            <input className={inputClass} name="title" required value={values.title} onChange={(event) => updateValue("title", event.target.value)} />
            <FieldError message={state.fieldErrors?.title} />
          </label>
          <label><span className="text-sm font-medium text-slate-700">Organization</span>
            <select className={inputClass} name="organizationId" value={values.organizationId} onChange={(event) => updateValue("organizationId", event.target.value)}>
              <option value="">{organizations.length ? "No organization selected" : "No organizations available"}</option>
              {organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}
            </select>
            <FieldError message={state.fieldErrors?.organizationId} />
          </label>
          <label><span className="text-sm font-medium text-slate-700">Category</span>
            <select className={inputClass} name="category" value={values.category} onChange={(event) => updateValue("category", event.target.value)}>
              <option value="">Not categorized</option>{OPPORTUNITY_CATEGORIES.map((category) => <option key={category} value={category}>{OPPORTUNITY_CATEGORY_LABELS[category]}</option>)}
            </select><FieldError message={state.fieldErrors?.category} />
          </label>
          <label><span className="text-sm font-medium text-slate-700">Representation type</span>
            <select className={inputClass} name="representationType" value={values.representationType} onChange={(event) => updateValue("representationType", event.target.value)}>
              <option value="">Not specified</option>{REPRESENTATION_TYPES.map((type) => <option key={type} value={type}>{REPRESENTATION_TYPE_LABELS[type]}</option>)}
            </select><FieldError message={state.fieldErrors?.representationType} />
          </label>
          <label className="md:col-span-2"><span className="text-sm font-medium text-slate-700">Description</span>
            <textarea className={inputClass} name="description" rows={4} value={values.description} onChange={(event) => updateValue("description", event.target.value)} />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-950">Schedule and sources</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label><span className="text-sm font-medium text-slate-700">Event date</span><input className={inputClass} name="eventDate" type="date" value={values.eventDate} onChange={(event) => updateValue("eventDate", event.target.value)} /></label>
          <label><span className="text-sm font-medium text-slate-700">Application deadline</span><input className={inputClass} name="applicationDeadline" type="date" value={values.applicationDeadline} onChange={(event) => updateValue("applicationDeadline", event.target.value)} /></label>
          <label><span className="text-sm font-medium text-slate-700">Location</span><input className={inputClass} name="location" value={values.location} onChange={(event) => updateValue("location", event.target.value)} /></label>
          <label><span className="text-sm font-medium text-slate-700">Event URL</span><input className={inputClass} name="eventUrl" type="url" placeholder="https://" value={values.eventUrl} onChange={(event) => updateValue("eventUrl", event.target.value)} /><FieldError message={state.fieldErrors?.eventUrl} /></label>
          <label><span className="text-sm font-medium text-slate-700">Source</span><input className={inputClass} name="source" value={values.source} onChange={(event) => updateValue("source", event.target.value)} /></label>
          <label><span className="text-sm font-medium text-slate-700">Source URL</span><input className={inputClass} name="sourceUrl" type="url" placeholder="https://" value={values.sourceUrl} onChange={(event) => updateValue("sourceUrl", event.target.value)} /><FieldError message={state.fieldErrors?.sourceUrl} /></label>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><h2 className="text-base font-semibold text-slate-950">Evaluation</h2><p className="mt-1 text-sm text-slate-500">Use whole-number scores from 0 to 100. Complete all five dimensions to calculate priority.</p></div>
          <div className="rounded-md bg-slate-100 px-4 py-3 text-right"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Overall score</p><p className="text-xl font-semibold text-slate-950">{evaluation.overallScore === null ? "—" : evaluation.overallScore.toFixed(1)}</p><p className="text-sm font-medium text-slate-700">{evaluation.priority ? OPPORTUNITY_PRIORITY_LABELS[evaluation.priority] : "Not evaluated"}</p></div>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">{scoreFields.map(([name, label]) => <label key={name}><span className="text-sm font-medium text-slate-700">{label}</span><input className={inputClass} name={name} type="number" min="0" max="100" step="1" inputMode="numeric" value={values[name]} onChange={(event) => updateValue(name, event.target.value)} /><FieldError message={state.fieldErrors?.[name]} /></label>)}</div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6"><h2 className="text-base font-semibold text-slate-950">Operations</h2><div className="mt-5 grid gap-5 md:grid-cols-2"><label><span className="text-sm font-medium text-slate-700">Pipeline status</span><select className={inputClass} name="status" value={values.status} onChange={(event) => updateValue("status", event.target.value)}>{OPPORTUNITY_STATUSES.map((status) => <option key={status} value={status}>{OPPORTUNITY_STATUS_LABELS[status]}</option>)}</select><FieldError message={state.fieldErrors?.status} /></label><label className="md:col-span-2"><span className="text-sm font-medium text-slate-700">Notes</span><textarea className={inputClass} name="notes" rows={4} value={values.notes} onChange={(event) => updateValue("notes", event.target.value)} /></label></div></section>
      <div className="flex justify-end"><Button type="submit" disabled={isPending}>{isPending && <LoaderCircle className="animate-spin" />}{submitLabel}</Button></div>
    </form>
  );
}
