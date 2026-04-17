import { createContext } from 'svelte';

export class ScrollState {
  y = $state(0);
  limit = $state(1);

  update(y: number, limit: number) {
    this.y = y;
    this.limit = limit;
  }
}

export const [getScrollState, setScrollState] = createContext<ScrollState>();
