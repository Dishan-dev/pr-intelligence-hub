export const RESEARCH_PROFILE = {
  organization: "AIESEC",
  purpose: "Public Relations, External Relations, and External Representation",
  country: "Sri Lanka",
  priorityAreas: ["Colombo", "Moratuwa", "Western Province"],
  interestAreas: ["youth leadership", "sustainable development", "SDGs", "education", "career development", "entrepreneurship", "startups", "technology", "innovation", "international relations", "diplomacy", "volunteering", "social impact", "sustainability", "corporate relations", "professional development", "media", "communications", "public relations", "university engagement"],
  opportunityTypes: ["conferences", "summits", "forums", "panel discussions", "networking events", "university events", "corporate events", "NGO events", "government events", "embassy and international organization events", "workshops", "expos", "exhibitions", "competitions", "youth events", "SDG events", "media opportunities", "speaking opportunities", "partnership opportunities"],
} as const;

export const RESEARCH_THEMES = [
  "youth leadership and SDGs", "sustainability and social impact", "entrepreneurship and startups",
  "technology and innovation", "universities and education", "NGOs and volunteering",
  "corporate and professional events", "international relations and embassies", "media and communications",
] as const;

export function researchHorizon(now = new Date()) {
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setMonth(end.getMonth() + 6);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}
