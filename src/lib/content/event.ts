import type { EventData, EventPanelCopy, PageShellContent } from "$lib/content/types";

export const eventPage: PageShellContent = {
  heading: "Events",
};

export const eventPanelCopy: EventPanelCopy = {
  eyebrow: "Schedule",
  title: "Events",
  tickets: "TICKETS",
  statusAvailable: "AVAILABLE",
  statusSoldOut: "SOLD OUT",
  statusLimited: "LIMITED",
  viewTimeline: "Timeline",
  viewByArtist: "By Artist",
  footer: "A One Heart Productions Experience",
  closeAriaLabel: "Close events",
};

export const events: EventData[] = [
  {
    date: "JUN 04",
    day: "THU",
    time: "19:15",
    title: "GAWDLAND Down Under",
    artist: "GAWDLAND",
    queen: "Melbourne",
    venue: "Chasers",
    status: "AVAILABLE",
    url: "https://events.humanitix.com/gawdland-mel/tickets",
  },
  {
    date: "JUN 06",
    day: "SAT",
    time: "18:45",
    title: "GAWDLAND Down Under",
    artist: "GAWDLAND",
    queen: "Sydney",
    venue: "Universal",
    status: "AVAILABLE",
    url: "https://events.humanitix.com/gawdland-syd/tickets",
  },
  {
    date: "JUN 07",
    day: "SUN",
    time: "21:00",
    title: "GAWDLAND Down Under",
    artist: "GAWDLAND",
    queen: "Adelaide",
    venue: "Marys Poppin",
    status: "AVAILABLE",
    url: "https://events.humanitix.com/gawdland-adl",
  },
];
