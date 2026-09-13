export type TemplateChannel = "Email" | "Instagram" | "WhatsApp";

export type MessageTemplate = {
  id: string;
  title: string;
  channel: TemplateChannel;
  purpose: string;
  subject?: string;
  body: string;
};

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: "email-intro-club",
    title: "First introduction to a club or society",
    channel: "Email",
    purpose: "Open a partnership conversation with an external club or society.",
    subject: "Collaboration opportunity with AIESEC in University of Moratuwa",
    body: "Hi [Name],\n\nI am [Your name] from AIESEC in University of Moratuwa. We are reaching out to explore a possible collaboration with [Club / Society].\n\nWe would love to discuss [speaker exchange / joint event / OGX session / representation opportunity] and understand how our members could create value together.\n\nWould you be available for a short 20-minute call next week?\n\nBest regards,\n[Your name]\n[Role] | AIESEC in University of Moratuwa\n[Phone]",
  },
  {
    id: "email-media-pitch",
    title: "Media story pitch",
    channel: "Email",
    purpose: "Pitch a youth, leadership, volunteering, or SDG story to media.",
    subject: "Story idea: [Short story headline]",
    body: "Hi [Editor / Contact name],\n\nI am reaching out from AIESEC in University of Moratuwa with a story idea about [initiative / event / impact].\n\nThe story highlights [one-sentence news value], including [number of participants / community impact / notable partner]. It may be relevant to your audience because [reason].\n\nWe can provide a short press release, photographs, participant voices, and a spokesperson for an interview.\n\nWould this be of interest for your editorial calendar?\n\nRegards,\n[Your name]\n[Role]\n[Phone] | [Email]",
  },
  {
    id: "email-event-invite",
    title: "Event invitation",
    channel: "Email",
    purpose: "Invite a club, media contact, or partner to an event.",
    subject: "Invitation: [Event name] - [Date]",
    body: "Hi [Name],\n\nAIESEC in University of Moratuwa would like to invite [your organization / your team] to [Event name] on [date] at [location / link].\n\nThe event will bring together [audience] to discuss [theme]. We would be delighted to welcome you as [guest / media partner / speaker / community partner].\n\nPlease let us know by [RSVP date] if you would be able to join us.\n\nWarm regards,\n[Your name]\n[Role] | AIESEC in University of Moratuwa",
  },
  {
    id: "email-followup",
    title: "Professional follow-up",
    channel: "Email",
    purpose: "Follow up after an initial message without sounding repetitive.",
    subject: "Following up: [Collaboration / story / event]",
    body: "Hi [Name],\n\nI wanted to follow up on my message about [topic] sent on [date]. We would still value the opportunity to connect and explore [specific next step].\n\nWould [option 1] or [option 2] work for a brief conversation?\n\nThank you for your time.\n\nBest,\n[Your name]",
  },
  {
    id: "email-thank-you",
    title: "Thank you after a meeting or feature",
    channel: "Email",
    purpose: "Close the loop and maintain a positive relationship.",
    subject: "Thank you for [meeting / featuring our story]",
    body: "Hi [Name],\n\nThank you for [your time today / featuring our story / supporting our event]. We appreciated the opportunity to discuss [topic].\n\nAs agreed, I am sharing [link / press release / photos / next steps]. Please let me know if you need anything else from our side.\n\nWe look forward to staying connected.\n\nRegards,\n[Your name]",
  },
  {
    id: "email-press-release",
    title: "Press release covering email",
    channel: "Email",
    purpose: "Send a completed press release and supporting assets.",
    subject: "Press release: [Headline] | AIESEC in University of Moratuwa",
    body: "Hi [Editor / Contact name],\n\nPlease find attached a press release about [initiative / event], taking place on [date].\n\nKey details:\n- What: [description]\n- When: [date and time]\n- Where: [location / link]\n- Why it matters: [impact]\n\nPhotos, quotes, and a spokesperson are available on request. Please let me know if you would like any additional information.\n\nKind regards,\n[Your name]\n[Contact details]",
  },
  {
    id: "instagram-club-intro",
    title: "Club or society introduction DM",
    channel: "Instagram",
    purpose: "Start a warm conversation through Instagram.",
    body: "Hi! We are AIESEC in University of Moratuwa. We came across [Club / Society] and would love to explore a collaboration around [event / leadership / OGX / community project].\n\nCould you connect us with the person handling partnerships or public relations? We would be happy to share a short proposal. Thank you!",
  },
  {
    id: "instagram-media-pitch",
    title: "Media pitch DM",
    channel: "Instagram",
    purpose: "Ask a media page for the right editorial contact.",
    body: "Hi [Page name], we have a youth-focused story from AIESEC in University of Moratuwa about [short story]. It may be relevant to your audience.\n\nCould you please share the best email or contact for sending a short press pitch? Thank you.",
  },
  {
    id: "instagram-followup",
    title: "Short Instagram follow-up",
    channel: "Instagram",
    purpose: "Follow up on an unanswered Instagram message.",
    body: "Hi [Name / Page], just following up on our message about [topic]. We would appreciate being connected with the right person when convenient. Thank you!",
  },
  {
    id: "whatsapp-club-intro",
    title: "WhatsApp club introduction",
    channel: "WhatsApp",
    purpose: "Send a concise first message to a club contact.",
    body: "Hi [Name], I am [Your name] from AIESEC in University of Moratuwa. We would like to explore a collaboration with [Club / Society] around [specific idea]. Would you be open to a short call this week?",
  },
  {
    id: "whatsapp-media-pitch",
    title: "WhatsApp media pitch",
    channel: "WhatsApp",
    purpose: "Share a concise story lead with a media contact.",
    body: "Hi [Name], I have a short youth-focused story lead from AIESEC in University of Moratuwa about [initiative]. Could I send you the press release and supporting details for consideration?",
  },
  {
    id: "whatsapp-meeting-confirmation",
    title: "Meeting confirmation",
    channel: "WhatsApp",
    purpose: "Confirm a scheduled call or meeting.",
    body: "Hi [Name], confirming our meeting on [date] at [time] via [location / link] to discuss [topic]. Looking forward to speaking with you. Thank you!",
  },
  {
    id: "whatsapp-thank-you",
    title: "WhatsApp thank you",
    channel: "WhatsApp",
    purpose: "Thank a contact after support, a meeting, or coverage.",
    body: "Thank you, [Name], for your time and support with [event / story / collaboration]. We really appreciate it and look forward to staying connected.",
  },
];
