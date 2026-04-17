import { writable } from 'svelte/store';
export const menuOpen = writable(false);
export const leftMenuOpen = writable(false);
export const isNavReady = writable(false);