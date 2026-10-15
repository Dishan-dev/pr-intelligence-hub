export const TEAMS = ["internal", "external", "campaign"] as const;
export const CRITERIA = ["strategic_alliances", "press_releases", "external_representations", "university_relations", "pr_campaigns"] as const;
export const TASK_STATUSES = ["backlog", "assigned", "in_progress", "waiting", "completed"] as const;

export type PrTeam = (typeof TEAMS)[number];
export type PrCriterion = (typeof CRITERIA)[number];
export type PrTaskStatus = (typeof TASK_STATUSES)[number];

export const TEAM_LABELS: Record<PrTeam, string> = {
  internal: "Internal PR",
  external: "External PR",
  campaign: "Campaigns",
};
export const CRITERION_LABELS: Record<PrCriterion, string> = {
  strategic_alliances: "Strategic alliances",
  press_releases: "Press releases",
  external_representations: "External representations",
  university_relations: "University relations",
  pr_campaigns: "PR campaigns",
};
export const STATUS_LABELS: Record<PrTaskStatus, string> = {
  backlog: "Backlog",
  assigned: "Assigned",
  in_progress: "In progress",
  waiting: "Awaiting response",
  completed: "Completed",
};

export interface PrMember {
  id: string;
  name: string;
  team: PrTeam;
  is_active: boolean;
}
export interface PrPlan {
  id: string;
  name: string;
  starts_on: string;
  weeks_count: number;
}
export interface PrTask {
  id: string;
  plan_id: string;
  title: string;
  description: string;
  team: PrTeam;
  target_criterion: PrCriterion;
  member_id: string | null;
  week_number: number;
  starts_on: string;
  due_on: string;
  status: PrTaskStatus;
  evidence_url: string | null;
  outcome_notes: string;
}

// Parse date-only strings as UTC calendar dates, never as local timestamps.
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function addDays(value: string, days: number): string {
  const date = new Date(value + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function shortDate(value: string): string {
  if (!validDate(value)) return "—";
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(value + "T00:00:00Z"));
}
export function weekStart(planStart: string, week: number): string {
  return addDays(planStart, (week - 1) * 7);
}
export function weekEnd(planStart: string, week: number): string {
  return addDays(planStart, week * 7 - 1);
}

type Template = { title: string; description: string; team: PrTeam; target_criterion: PrCriterion };

const RECURRING: Template[] = [
  { team: "internal", target_criterion: "press_releases", title: "Interview an AIESEC member or EP", description: "Conduct a 10-minute interview, secure consent, and submit clear notes for a story." },
  { team: "internal", target_criterion: "press_releases", title: "Prepare a story for publication", description: "Turn an approved interview into a concise article and coordinate a suitable publication channel." },
  { team: "internal", target_criterion: "university_relations", title: "Connect with a university society", description: "Research two relevant societies and send one personalized collaboration invitation." },
  { team: "internal", target_criterion: "strategic_alliances", title: "Approach a potential resource person", description: "Shortlist two speakers or alumni and invite one to a focused knowledge-sharing session." },
  { team: "external", target_criterion: "strategic_alliances", title: "Research three partner prospects", description: "Qualify three organizations by relevance, contact details, and possible mutual value." },
  { team: "external", target_criterion: "strategic_alliances", title: "Reach out to two organizations", description: "Send two approved, personalized partnership messages and record follow-up dates." },
  { team: "external", target_criterion: "press_releases", title: "Pitch a story to one media outlet", description: "Select a suitable story, tailor one media pitch, and record any editorial response." },
  { team: "external", target_criterion: "external_representations", title: "Pursue an external speaking slot", description: "Find three relevant events and contact an organizer about a representation opportunity." },
];

const CAMPAIGN_WEEKS: Template[][] = [
  [
    { team: "campaign", target_criterion: "pr_campaigns", title: "Plan Campus Pulse", description: "Define a youth leadership topic, five survey questions, target audience, and campaign schedule." },
    { team: "campaign", target_criterion: "pr_campaigns", title: "Prepare campaign materials", description: "Draft survey form, visual direction, and approved promotion copy." },
  ],
  [
    { team: "campaign", target_criterion: "pr_campaigns", title: "Launch the Campus Pulse survey", description: "Publish the approved form and coordinate cross-team distribution." },
    { team: "campaign", target_criterion: "pr_campaigns", title: "Collect and organize responses", description: "Aim for approximately 30 voluntary responses; record anonymized totals." },
  ],
  [
    { team: "campaign", target_criterion: "pr_campaigns", title: "Analyze survey insights", description: "Summarize responses and identify three relevant, accurately framed findings." },
    { team: "campaign", target_criterion: "pr_campaigns", title: "Design the findings carousel", description: "Prepare accessible visuals, captions, and a campaign approval draft." },
  ],
  [
    { team: "campaign", target_criterion: "pr_campaigns", title: "Publish the Campus Pulse campaign", description: "Coordinate approved publishing and capture publication evidence." },
    { team: "campaign", target_criterion: "pr_campaigns", title: "Report campaign outcomes", description: "Record reach, participation, evidence links, lessons, and verification requirements." },
  ],
];

export function starterTasks(start: string) {
  return CAMPAIGN_WEEKS.flatMap((campaigns, index) => {
    const week = index + 1;
    const startsOn = weekStart(start, week);
    const dueOn = addDays(startsOn, 4);
    return [...RECURRING, ...campaigns].map((template) => ({
      ...template,
      week_number: week,
      starts_on: startsOn,
      due_on: dueOn,
      status: "backlog" as const,
      description: template.description,
    }));
  });
}
