export type NavKey = "home" | "events" | "press" | "about";

export interface NavigationItem {
  key: NavKey;
  label: string;
  href: string;
}

export interface PageMeta {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
}

export interface PageShellContent {
  heading: string;
}

export interface EventPanelCopy {
  eyebrow: string;
  title: string;
  tickets: string;
  statusAvailable: string;
  statusSoldOut: string;
  statusLimited: string;
  viewTimeline: string;
  viewByArtist: string;
  footer: string;
  closeAriaLabel: string;
}

export interface EventData {
  date: string;
  day: string;
  time: string;
  title: string;
  artist: string;
  queen: string;
  venue: string;
  status: string;
  url: string;
}
