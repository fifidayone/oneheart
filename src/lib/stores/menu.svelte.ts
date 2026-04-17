import { createContext } from 'svelte';

export class MenuState {
  isOpen = $state(false);
  isLeftOpen = $state(false);
  isNavReady = $state(false);

  open() { this.isOpen = true; }
  close() { this.isOpen = false; }
  toggle() { this.isOpen = !this.isOpen; }

  openLeft() { this.isLeftOpen = true; }
  closeLeft() { this.isLeftOpen = false; }
  toggleLeft() { this.isLeftOpen = !this.isLeftOpen; }

  setNavReady(ready: boolean) { this.isNavReady = ready; }
}

export const [getMenuState, setMenuState] = createContext<MenuState>();
