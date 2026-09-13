import type { RepresentationType } from "./opportunity";

export const REPRESENTATION_PURPOSES: Record<
  RepresentationType,
  { label: string; description: string }
> = {
  partnership: {
    label: "Partner outreach",
    description:
      "Start a collaboration, sponsorship, or in-kind partnership conversation.",
  },
  stall_booth: {
    label: "Stall / booth presence",
    description: "Represent AIESEC on-site and engage a relevant audience.",
  },
  speaking: {
    label: "Thought leadership",
    description: "Put an AIESEC representative on stage as a speaker.",
  },
  panel: {
    label: "Panel representation",
    description: "Contribute AIESEC's voice in a public discussion.",
  },
  media: {
    label: "Media visibility",
    description:
      "Secure coverage, an interview, or a communications opportunity.",
  },
  networking: {
    label: "Stakeholder networking",
    description:
      "Build relationships with potential partners and decision-makers.",
  },
  competition: {
    label: "Brand representation",
    description: "Showcase AIESEC through a competition or challenge.",
  },
  non_speaking: {
    label: "Delegate representation",
    description: "Attend and represent AIESEC in a high-value external space.",
  },
};
