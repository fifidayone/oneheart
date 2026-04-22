import { eventPanelCopy, events } from "$lib/content/event";
import type { EventData } from "$lib/content/types";

export const PANEL_COPY = eventPanelCopy;

export type ViewMode = 'timeline' | 'byArtist';

export class EventsState {
  viewMode = $state<ViewMode>('timeline');
  onclose: () => void;

  constructor(onclose: () => void) {
    this.onclose = onclose;
  }
  
  groupedByArtist = $derived.by(() => {
    const map = new Map<string, EventData[]>();
    for (const ev of events) {
      const key = ev.artist;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  });

  setView(mode: ViewMode) {
    this.viewMode = mode;
  }

  reset() {
    this.viewMode = 'timeline';
  }

  close() {
    this.onclose();
  }
}
