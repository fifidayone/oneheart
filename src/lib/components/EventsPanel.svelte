<script lang="ts">
  import { getMenuState } from "$lib/stores/menu.svelte";

  const menuState = getMenuState();
  import { fly, draw, scale } from "svelte/transition";
  import { expoOut } from "svelte/easing";
  import { SvelteMap } from "svelte/reactivity";

  interface Props {
    onclose: () => void;
    isResizing?: boolean;
  }

  let { onclose, isResizing = false }: Props = $props();
  
  let firstToggle: HTMLButtonElement | undefined = $state();

  const PANEL_COPY = {
    eyebrow: "Ticketing & Shows",
    title: "Upcoming Events",
    tickets: "TICKETS",
    statusAvailable: "AVAILABLE",
    statusSoldOut: "SOLD OUT",
    statusLimited: "LIMITED",
    viewTimeline: "Timeline",
    viewByArtist: "By Artist",
    footer: "A One Heart Productions Experience",
    closeAriaLabel: "Close events",
  } as const;

  const events = [
    { date: "JUN 04", day: "THU", time: "19:15", title: "GAWDLAND Down Under", artist: "GAWDLAND", queen: "Melbourne", venue: "Chasers", status: "AVAILABLE", url: "https://events.humanitix.com/gawdland-mel/tickets" },
    { date: "JUN 06", day: "SAT", time: "18:45", title: "GAWDLAND Down Under", artist: "GAWDLAND", queen: "Sydney", venue: "Universal", status: "AVAILABLE", url: "https://events.humanitix.com/gawdland-syd/tickets" },
    { date: "JUN 07", day: "SUN", time: "21:00", title: "GAWDLAND Down Under", artist: "GAWDLAND", queen: "Adelaide", venue: "Marys Poppin", status: "AVAILABLE", url: "https://events.humanitix.com/gawdland-adl" },
  ];

  type ViewMode = 'timeline' | 'byArtist';

  class EventsState {
    viewMode = $state<ViewMode>('timeline');
    private lastFocusedElement: HTMLElement | null = null;
    
    groupedByArtist = $derived.by(() => {
      const map = new SvelteMap<string, typeof events>();
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

    close() {
      onclose();
    }
  }

  const panelState = new EventsState();
  let lastFocusedElement: HTMLElement | null = null;

  // Client-side focus management
  $effect(() => {
    if (menuState.isLeftOpen) {
      panelState.viewMode = 'timeline';
      lastFocusedElement = document.activeElement as HTMLElement;
    } else if (lastFocusedElement) {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }
  });

  $effect(() => {
    if (menuState.isLeftOpen && menuState.isNavReady) {
      firstToggle?.focus();
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (!menuState.isLeftOpen) return;
    
    if (e.key === "Tab") {
      const focusables = Array.from(document.querySelectorAll('.events-backdrop.is-open button, .events-backdrop.is-open a, .close-btn-left')) as HTMLElement[];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    } else if (e.key === "Escape") {
      panelState.close();
    }
  }
</script>

{#snippet eventCard(event: typeof events[0], delay: number)}
  <div
    class="ev-row pc-row"
    in:fly={{ y: 20, duration: 600, delay, easing: expoOut }}
  >
    <div class="pc-date-box">
      <div class="pc-month">{event.date.split(' ')[0]}</div>
      <div class="pc-day">{event.date.split(' ')[1]}</div>
    </div>
    <div class="ev-body">
      <span class="ev-queen">{event.queen}</span>
      <span class="ev-show">{event.title}</span>
      <div class="ev-venue-status">
        <span class="ev-venue">@ {event.venue}</span>
        <span class={["ev-status", { 'sold-out': event.status === 'SOLD OUT', 'limited': event.status === 'LIMITED' }]}>
          {event.status === 'SOLD OUT' ? PANEL_COPY.statusSoldOut :
           event.status === 'LIMITED' ? PANEL_COPY.statusLimited :
           PANEL_COPY.statusAvailable}
        </span>
      </div>
    </div>
    <div class="ev-actions">
      <a class="ev-link" href={event.url} target="_blank" rel="noreferrer">
        <span>{PANEL_COPY.tickets}</span>
        <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
          <path d="M1 11L11 1M11 1H3M11 1V9" stroke="currentColor" stroke-width="1.5" />
        </svg>
      </a>
    </div>
  </div>
{/snippet}

<div 
  class={["events-backdrop", menuState.isLeftOpen && "is-open", isResizing && "no-transition"]}
  onkeydown={handleKeydown}
  role="dialog"
  aria-modal="true"
  aria-label="Upcoming Events"
  aria-hidden={!menuState.isLeftOpen}
>
  <nav class={["events-nav", menuState.isLeftOpen && "is-open"]}>
    {#if menuState.isLeftOpen}
      <header class="ev-header" in:fly={{ y: 20, duration: 600, delay: 50, easing: expoOut }}>
        <span class="ev-eyebrow">{PANEL_COPY.eyebrow}</span>
        <h2 class="ev-title">{PANEL_COPY.title}</h2>

        <!-- View Mode Toggle -->
        <div class="ev-view-toggle" in:fly={{ y: 10, duration: 400, delay: 150, easing: expoOut }}>
          <div class="view-toggle-track">
            <div class={["view-slider", panelState.viewMode === 'byArtist' && "by-artist"]}></div>
            <button
              class={{ active: panelState.viewMode === 'timeline' }}
              onclick={() => panelState.setView('timeline')}
              bind:this={firstToggle}
            >{PANEL_COPY.viewTimeline}</button>
            <button
              class={{ active: panelState.viewMode === 'byArtist' }}
              onclick={() => panelState.setView('byArtist')}
            >{PANEL_COPY.viewByArtist}</button>
          </div>
        </div>
      </header>

      <div class="ev-scroll-area">
        {#if panelState.viewMode === 'timeline'}
          {#each events as event, i (event.title + event.date)}
            {@render eventCard(event, 120 + i * 60)}
          {/each}
        {:else}
          {#each Array.from(panelState.groupedByArtist.entries()) as [artist, artistEvents], gi (artist)}
            <div class="ev-artist-group" in:fly={{ y: 20, duration: 600, delay: 100 + gi * 80, easing: expoOut }}>
              <div class="ev-group-header">{artist}</div>
              {#each artistEvents as event, ei (event.title + event.date)}
                {@render eventCard(event, 140 + gi * 80 + ei * 60)}
              {/each}
            </div>
          {/each}
        {/if}
      </div>

      <footer class="ev-footer" in:fly={{ y: 10, duration: 600, delay: 400, easing: expoOut }}>
        <p>{PANEL_COPY.footer}</p>
      </footer>
    {/if}
  </nav>
</div>

{#if menuState.isLeftOpen}
<button
  class={["close-btn-left", isResizing && "no-transition"]}
  in:scale={{ duration: 300, delay: 300, easing: expoOut }}
  onclick={() => panelState.close()}
  aria-label={PANEL_COPY.closeAriaLabel}
>
  <svg class="close-icon" viewBox="0 0 24 24" fill="none">
    <path
      in:draw={{ duration: 250, delay: 550 }}
      d="M3 3L21 21"
      stroke="#f0eee9"
      stroke-width="2.2"
      stroke-linecap="round"
    />
    <path
      in:draw={{ duration: 250, delay: 650 }}
      d="M21 3L3 21"
      stroke="#f0eee9"
      stroke-width="2.2"
      stroke-linecap="round"
    />
  </svg>
</button>
{/if}

<style>
  .events-backdrop {
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, var(--color-pearl-mist), transparent 70%), #000000;
    display: flex;
    align-items: flex-start; /* Changed from center to allow safe scrolling */
    justify-content: center;
    /* Mathematical centering inside the pushed panel */
    padding-right: calc(100vw - var(--events-panel-width) + var(--events-content-offset));
    padding-left: var(--events-content-offset);
    /* Safe zones for desktop optical centering */
    padding-top: clamp(3rem, 6vh, 5rem);
    padding-bottom: clamp(3rem, 6vh, 5rem);
    z-index: 0;
    pointer-events: none;
    visibility: hidden;
    overflow: hidden;
  }

  .events-backdrop.is-open {
    pointer-events: auto;
    visibility: visible;
  }

  /* Prevent lag and bouncing during window resize */
  .events-backdrop.no-transition,
  .events-backdrop.no-transition * {
    transition: none !important;
    transition-delay: 0s !important;
    animation: none !important;
  }

  .events-nav {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: min(100%, 36rem);
    height: 100%;
    gap: 0;
  }

  .ev-header {
    flex-shrink: 0;
    margin-bottom: 0;
    position: relative;
    z-index: 10;
  }

  .ev-scroll-area {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
    
    /* Increased top padding to give the header more breathing room from the list */
    padding-top: clamp(2.5rem, 4.5vh, 3.5rem);
    padding-bottom: clamp(2rem, 4vh, 3rem);
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    margin-left: -1.5rem;
    margin-right: -1.5rem;
  }
  .ev-scroll-area::-webkit-scrollbar {
    display: none;
  }

  .ev-eyebrow {
    font-family: var(--font-primary);
    font-size: 0.7rem;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: rgba(240, 238, 233, 0.35);
    display: block;
    /* Pushed title slightly further down to create a distinct overline reading rhythm */
    margin-bottom: clamp(0.75rem, 1.5vh, 1rem);
  }

  .ev-title {
    font-family: var(--font-primary);
    font-size: clamp(1.6rem, 2.5vw, 2.2rem);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    color: #f0eee9;
    margin: 0;
    line-height: 1.1;
  }

  .ev-row {
    background: linear-gradient(135deg, rgba(30, 30, 30, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(240, 238, 233, 0.08);
    border-radius: 4px;
    padding: clamp(0.75rem, 1.5vw, 1.25rem);
    margin-bottom: clamp(0.75rem, 1.5vw, 1rem);
    display: flex;
    gap: clamp(0.75rem, 1.5vw, 1.5rem);
    align-items: center;
    transition: background 0.4s ease, border-color 0.4s ease;
    box-shadow: inset 0 1px 1px rgba(240, 238, 233, 0.08), 0 10px 30px rgba(0, 0, 0, 0.6);
    cursor: default;
    position: relative;
  }

  .ev-row:hover {
    background: linear-gradient(135deg, rgba(45, 45, 45, 0.7) 0%, rgba(20, 20, 20, 0.8) 100%);
    border-color: rgba(240, 238, 233, 0.15);
  }

  .pc-date-box {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(240, 238, 233, 0.03);
    border-radius: 4px;
    text-align: center;
    padding: clamp(0.5rem, 1vw, 0.75rem) clamp(0.5rem, 1.5vw, 1rem);
    min-width: clamp(3.5rem, 5vw, 4.5rem);
    flex-shrink: 0;
    transition: all 0.4s ease;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
  }

  .ev-row:hover .pc-date-box {
    border-color: rgba(240, 238, 233, 0.08);
    background: rgba(0, 0, 0, 0.6);
  }

  .pc-month {
    font-family: var(--font-primary);
    font-size: clamp(0.55rem, 0.8vw, 0.65rem);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: rgba(240, 238, 233, 0.6);
    margin-bottom: 2px;
  }

  .pc-day {
    font-family: var(--font-primary);
    font-size: clamp(1.2rem, 2vw, 1.5rem);
    font-weight: 600;
    line-height: 1;
    color: #f0eee9;
  }

  .ev-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex-grow: 1;
    min-width: 0;
  }

  .ev-queen {
    font-family: var(--font-primary);
    font-size: clamp(0.85rem, 1.2vw, 1rem);
    font-weight: 700;
    color: rgba(240, 238, 233, 0.85);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    transition: color 0.4s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ev-show {
    font-family: var(--font-primary);
    font-size: clamp(0.7rem, 1vw, 0.8rem);
    color: rgba(240, 238, 233, 0.5);
    letter-spacing: 0.03em;
    overflow-wrap: anywhere;
  }

  .ev-venue-status {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.75rem;
    margin-top: 2px;
  }

  .ev-venue {
    font-family: var(--font-primary);
    font-size: clamp(0.65rem, 0.9vw, 0.7rem);
    color: rgba(240, 238, 233, 0.3);
    font-style: italic;
  }

  .ev-actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    z-index: 1; /* Keep above sweep glow */
  }

  .ev-status {
    font-family: var(--font-primary);
    font-size: 0.55rem;
    font-weight: 500;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(180, 240, 190, 0.9);
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }

  .ev-status::before {
    content: "";
    width: 4px;
    height: 4px;
    background: currentColor;
    border-radius: 50%;
    animation: proBlink 2.5s ease-in-out infinite;
  }

  @keyframes proBlink {
    0%, 100% { opacity: 0.2; transform: scale(0.85); }
    50% { opacity: 1; transform: scale(1.15); box-shadow: 0 0 5px currentColor; }
  }

  .ev-status.sold-out {
    color: rgba(240, 238, 233, 0.25);
  }

  .ev-status.limited {
    color: rgba(240, 238, 233, 0.7);
  }

  .ev-link {
    font-family: var(--font-primary);
    font-size: clamp(0.6rem, 0.8vw, 0.7rem);
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(240, 238, 233, 0.8);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: clamp(0.4rem, 0.8vw, 0.5rem) clamp(0.7rem, 1.2vw, 1rem);
    border: 1px solid rgba(240, 238, 233, 0.15);
    background: rgba(240, 238, 233, 0.03);
    border-radius: 4px; /* Editorial Sharp Corners */
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    white-space: nowrap;
    position: relative;
    overflow: hidden;
  }

  .ev-link::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(240, 238, 233, 1);
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: -1;
  }

  .ev-link:hover {
    color: #000000;
    border-color: rgba(240, 238, 233, 1);
  }

  .ev-link:hover::before {
    transform: scaleX(1);
    transform-origin: left;
  }

  .ev-row:hover .ev-queen {
    color: #ffffff;
  }

  .ev-footer {
    flex-shrink: 0;
    margin-top: 0;
    position: relative;
    z-index: 10;
  }

  .ev-footer p {
    font-family: var(--font-primary);
    font-size: 0.75rem;
    color: rgba(240, 238, 233, 0.2);
    letter-spacing: 0.08em;
    margin: 0;
  }

  .close-btn-left {
    position: fixed;
    top: calc(1.25rem + env(safe-area-inset-top));
    left: calc(1.25rem + env(safe-area-inset-left));
    width: 44px;
    height: 44px;
    border: none;
    background: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 100;
  }

  .close-btn-left svg.close-icon {
    width: 24px;
    height: 24px;
    transition: transform 0.4s cubic-bezier(0.32, 0, 0.15, 1);
  }

  .close-btn-left svg.close-icon path {
    transition: stroke 0.3s ease;
  }

  .close-btn-left:hover svg.close-icon {
    transform: rotate(180deg) scale(1.1);
  }

  /* Prevent lag during window resize */
  .close-btn-left.no-transition {
    transition: none !important;
    transition-delay: 0s !important;
  }

  @media (min-width: 1024px) {
    .close-btn-left {
      top: 50%;
      left: var(--events-panel-width);
      width: 38px;
      height: 38px;
      padding: 0;
      background: var(--color-white);
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(var(--color-bg-rgb), 0.3);
      transform: translate(-50%, -50%);
    }

    .close-btn-left svg.close-icon {
      width: 20px;
      height: 20px;
    }

    .close-btn-left svg path {
      stroke: var(--color-bg-alt);
    }

    .close-btn-left:hover {
      background: var(--color-white);
      transform: translate(-50%, -50%) scale(1.1);
    }
    
    .close-btn-left:hover svg path {
      stroke: var(--color-bg-alt);
    }
  }

  @media (max-width: 1024px) {
    .events-backdrop {
      /* Mobile safe zones: Clear the top-left X button + Mobile Notches */
      padding-top: calc(clamp(5.5rem, 10vh, 7rem) + env(safe-area-inset-top));
      padding-bottom: calc(clamp(2rem, 4vh, 4rem) + env(safe-area-inset-bottom));
    }

    .events-nav {
      width: 100%;
      max-width: 32rem;
    }
  }

  @media (max-width: 640px) {
    .ev-link span {
      display: none;
    }

    .ev-link {
      padding: 0.5rem;
      border-radius: 50%;
      justify-content: center;
    }

    .ev-row {
      gap: 0.5rem;
      padding: 0.75rem;
    }

    .pc-date-box {
      min-width: 3.5rem;
      padding: 0.5rem;
    }
  }

  /* --- VIEW MODE TOGGLE --- */
  .ev-view-toggle {
    /* Significantly increased margin-top to separate the toggle from the main title */
    margin-top: clamp(1.75rem, 3.5vh, 2.5rem);
  }

  .view-toggle-track {
    position: relative;
    display: inline-flex;
    background: rgba(240, 238, 233, 0.04);
    border: 1px solid rgba(240, 238, 233, 0.08);
    border-radius: 4px;
    padding: 3px;
    gap: 0;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    min-width: 14rem;
  }

  .view-toggle-track .view-slider {
    position: absolute;
    top: 3px;
    bottom: 3px;
    left: 3px;
    width: calc(50% - 3px);
    background: rgba(240, 238, 233, 0.08);
    border: 1px solid rgba(240, 238, 233, 0.12);
    border-radius: 3px;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 0 8px rgba(240, 238, 233, 0.04);
  }

  .view-toggle-track .view-slider.by-artist {
    transform: translateX(100%);
  }

  .view-toggle-track button {
    background: none;
    border: none;
    font-family: var(--font-primary);
    font-size: 0.6rem;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(240, 238, 233, 0.35);
    padding: 0.45rem 0.85rem;
    cursor: pointer;
    position: relative;
    z-index: 2;
    transition: color 0.3s ease;
    white-space: nowrap;

    display: inline-flex;
    flex: 1;
    align-items: center;
    justify-content: center;
  }

  .view-toggle-track button:hover {
    color: rgba(240, 238, 233, 0.6);
  }

  .view-toggle-track button.active {
    color: rgba(240, 238, 233, 0.9);
  }

  /* --- ARTIST GROUP --- */
  .ev-artist-group {
    margin-bottom: 0.25rem;
  }

  .ev-group-header {
    font-family: var(--font-primary);
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: rgba(240, 238, 233, 0.25);
    padding: 0.75rem 0 0.5rem;
    border-bottom: 1px solid rgba(240, 238, 233, 0.05);
    margin-bottom: clamp(0.5rem, 1vw, 0.75rem);
  }


</style>
