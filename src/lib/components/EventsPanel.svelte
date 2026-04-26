<script lang="ts">
  import { getMenuState } from "$lib/stores/menu.svelte";
  import { fly, scale, draw } from "svelte/transition";
  import { expoOut } from "svelte/easing";
  import { events } from "$lib/content/event";
  import { EventsState, PANEL_COPY } from "$lib/logic/events.svelte";
  import EventRow from "$lib/components/events/EventRow.svelte";

  const menuState = getMenuState();

  interface Props {
    onclose: () => void;
    isResizing?: boolean;
  }

  let { onclose, isResizing = false }: Props = $props();
  
  import type { Attachment } from 'svelte/attachments';

  let firstToggle: HTMLButtonElement | undefined;
  const captureFirstToggle: Attachment<HTMLButtonElement> = (node) => {
    firstToggle = node;
    return () => { if (firstToggle === node) firstToggle = undefined; };
  };

  const panelState = new EventsState(() => onclose());
  let lastFocusedElement: HTMLElement | null = null;

  // Client-side focus management
  $effect(() => {
    if (menuState.isLeftOpen) {
      panelState.reset();
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
      if (focusables.length === 0) return;
      
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

<div 
  class={["events-backdrop", menuState.isLeftOpen && "is-open", isResizing && "no-transition"]}
  onkeydown={handleKeydown}
  role="dialog"
  aria-modal="true"
  aria-label="Events"
  aria-hidden={!menuState.isLeftOpen}
>
  <nav class={["events-nav", menuState.isLeftOpen && "is-open"]}>
    {#if menuState.isLeftOpen}
      <header class="ev-header" in:fly={{ y: 20, duration: 600, delay: 50, easing: expoOut }}>
        <span class="ev-eyebrow">{PANEL_COPY.eyebrow}</span>

        <!-- View Mode Toggle -->
        <div class="ev-view-toggle" in:fly={{ y: 10, duration: 400, delay: 150, easing: expoOut }}>
          <div class="view-toggle-track">
            <div class={["view-slider", panelState.viewMode === 'byArtist' && "by-artist"]}></div>
            <button
              class={['view-toggle-btn', { active: panelState.viewMode === 'timeline' }]}
              onclick={() => panelState.setView('timeline')}
              {@attach captureFirstToggle}
            >{PANEL_COPY.viewTimeline}</button>
            <button
              class={['view-toggle-btn', { active: panelState.viewMode === 'byArtist' }]}
              onclick={() => panelState.setView('byArtist')}
            >{PANEL_COPY.viewByArtist}</button>
          </div>
        </div>
      </header>

      <div class="ev-scroll-area">
        {#key panelState.viewMode}
          <div class="ev-view-content">
            {#if panelState.viewMode === 'timeline'}
              {#each events as event (event.title + event.date)}
                <EventRow {event} />
              {/each}
            {:else}
              {#each Array.from(panelState.groupedByArtist.entries()) as [artist, artistEvents] (artist)}
                <div class="ev-artist-group">
                  <div class="ev-group-header">{artist}</div>
                  {#each artistEvents as event (event.title + event.date)}
                    <EventRow {event} />
                  {/each}
                </div>
              {/each}
            {/if}
          </div>
        {/key}
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
      stroke="var(--color-text)"
      stroke-width="2.2"
      stroke-linecap="round"
    />
    <path
      in:draw={{ duration: 250, delay: 650 }}
      d="M21 3L3 21"
      stroke="var(--color-text)"
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
    padding-bottom: clamp(0.75rem, 1.5vh, 1.25rem);
  }

  .ev-scroll-area {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;

    padding-top: clamp(0.5rem, 1vh, 0.75rem);
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
    font-size: clamp(1.2rem, 1.8vw, 1.5rem);
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(var(--color-text-rgb), 0.9);
    display: block;
    margin-bottom: clamp(0.75rem, 1.5vh, 1rem);
  }

  .ev-footer p {
    font-family: var(--font-primary);
    font-size: 0.75rem;
    color: rgba(var(--color-text-rgb), 0.2);
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

    .ev-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .ev-eyebrow {
      margin-bottom: 0;
    }

    .ev-header .ev-view-toggle {
      margin-top: 0;
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

    .ev-eyebrow {
      margin-bottom: clamp(0.5rem, 1vh, 0.75rem);
    }

    .ev-view-toggle {
      margin-top: clamp(0.5rem, 1.5vh, 1rem);
    }

    .view-toggle-track {
      width: 100%;
      min-width: unset;
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
    background: var(--glass-bg-light);
    border: 1px solid rgba(var(--color-text-rgb), 0.08);
    border-radius: 4px;
    padding: 3px;
    gap: 0;
    backdrop-filter: var(--glass-blur-light);
    -webkit-backdrop-filter: var(--glass-blur-light);
    min-width: 14rem;
  }

  .view-toggle-track .view-slider {
    position: absolute;
    top: 3px;
    bottom: 3px;
    left: 3px;
    width: calc(50% - 3px);
    background: rgba(var(--color-text-rgb), 0.08);
    border: 1px solid rgba(var(--color-text-rgb), 0.12);
    border-radius: 3px;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 0 8px rgba(var(--color-text-rgb), 0.04);
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
    color: rgba(var(--color-text-rgb), 0.35);
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
    color: rgba(var(--color-text-rgb), 0.6);
  }

  .view-toggle-track button.active {
    color: rgba(var(--color-text-rgb), 0.9);
  }

  /* --- ARTIST GROUP --- */
  .ev-artist-group {
    margin-bottom: 0;
  }

  .ev-group-header {
    font-family: var(--font-primary);
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: rgba(var(--color-text-rgb), 0.25);
    padding: 0.35rem 0 0.25rem;
    border-bottom: 1px solid rgba(var(--color-text-rgb), 0.05);
    margin-bottom: 0.25rem;
  }

  @media (prefers-reduced-motion: reduce) {
    /* Slider: short transition instead of spring */
    .view-toggle-track .view-slider {
      transition-duration: 0.15s;
      box-shadow: none;
    }
  }

</style>
