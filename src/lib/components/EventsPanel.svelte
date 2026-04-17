<script lang="ts">
  import { leftMenuOpen } from "$lib/stores/menu";
  import { i18n } from "$lib/i18n.svelte";
  import { fade, fly, draw, scale } from "svelte/transition";
  import { expoOut } from "svelte/easing";

  let { lenis, isResizing = false } = $props<{ lenis: any, isResizing?: boolean }>();
  const events = [
    { date: "JUN 04", day: "THU", time: "19:15", title: "GAWDLAND Down Under", queen: "Melbourne", venue: "Chasers", status: "AVAILABLE", url: "https://events.humanitix.com/gawdland-mel/tickets" },
    { date: "JUN 06", day: "SAT", time: "18:45", title: "GAWDLAND Down Under", queen: "Sydney", venue: "Universal", status: "AVAILABLE", url: "https://events.humanitix.com/gawdland-syd/tickets" },
    { date: "JUN 07", day: "SUN", time: "21:00", title: "GAWDLAND Down Under", queen: "Adelaide", venue: "Marys Poppin", status: "AVAILABLE", url: "https://events.humanitix.com/gawdland-adl" },
  ];

  function closePanel() {
    leftMenuOpen.set(false);
    lenis?.start();
  }
</script>

<div class="events-backdrop" class:is-open={$leftMenuOpen}>
  <nav class="events-nav" class:is-open={$leftMenuOpen}>
    {#if $leftMenuOpen}
      <header class="ev-header" in:fly={{ y: 20, duration: 600, delay: 50, easing: expoOut }}>
        <span class="ev-eyebrow">{i18n.t('ev_eyebrow')}</span>
        <h2 class="ev-title">{i18n.t('ev_title')}</h2>
      </header>

      {#each events as event, i}
        <div
          class="ev-row"
          in:fly={{ y: 20, duration: 600, delay: 120 + i * 60, easing: expoOut }}
        >
          <div class="ev-date">
            <span>{event.date}</span>
            <span class="ev-day">{event.day} / {event.time}</span>
          </div>
          <div class="ev-body">
            <span class="ev-queen">{event.queen}</span>
            <span class="ev-show">{event.title}</span>
            <span class="ev-venue">@ {event.venue}</span>
          </div>
          <div class="ev-actions">
            <span class="ev-status" class:sold-out={event.status === 'SOLD OUT'} class:limited={event.status === 'LIMITED'}>
              {event.status === 'SOLD OUT' ? i18n.t('ev_status_sold_out') : 
               event.status === 'LIMITED' ? i18n.t('ev_status_limited') : 
               i18n.t('ev_status_available')}
            </span>
            <a class="ev-link" href={event.url} target="_blank" rel="noreferrer">
              <span>{i18n.t('ev_tickets')}</span>
              <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                <path d="M1 11L11 1M11 1H3M11 1V9" stroke="currentColor" stroke-width="1.5" />
              </svg>
            </a>
          </div>
        </div>
      {/each}

      <footer class="ev-footer" in:fly={{ y: 10, duration: 600, delay: 400, easing: expoOut }}>
        <p>{i18n.t('ev_footer')}</p>
      </footer>
    {/if}
  </nav>
</div>

<button
  class="close-btn-left"
  class:is-visible={$leftMenuOpen}
  class:no-transition={isResizing}
  onclick={closePanel}
  aria-label="Close events"
>
  <svg class="close-icon" viewBox="0 0 24 24" fill="none">
    <path
      class="line-1"
      d="M3 3L21 21"
      stroke="#f0eee9"
      stroke-width="2.2"
      stroke-linecap="round"
    />
    <path
      class="line-2"
      d="M21 3L3 21"
      stroke="#f0eee9"
      stroke-width="2.2"
      stroke-linecap="round"
    />
  </svg>
</button>

<style>
  .events-backdrop {
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(226, 232, 240, 0.15), transparent 70%), #000000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-right: calc(100vw - var(--events-panel-width) + var(--events-content-offset));
    padding-left: var(--events-content-offset);
    z-index: 0;
    pointer-events: none;
    visibility: hidden;
  }

  .events-backdrop.is-open {
    pointer-events: auto;
    visibility: visible;
  }

  .events-nav {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: min(100%, 26.25rem);
    gap: 0;
  }

  .ev-header {
    margin-bottom: clamp(2rem, 4vh, 3.5rem);
  }

  .ev-eyebrow {
    font-family: var(--font-primary);
    font-size: 0.7rem;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: rgba(240, 238, 233, 0.35);
    display: block;
    margin-bottom: 0.5rem;
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
    display: grid;
    grid-template-columns: minmax(4.5rem, 5.5rem) minmax(0, 1fr) auto;
    gap: clamp(0.75rem, 1vw, 1rem);
    align-items: start;
    padding: clamp(1rem, 2vh, 1.5rem) 0;
    border-bottom: 1px solid rgba(240, 238, 233, 0.08);
    cursor: pointer;
  }

  .ev-row:first-of-type {
    border-top: 1px solid rgba(240, 238, 233, 0.08);
  }

  .ev-date {
    font-family: var(--font-primary);
    font-size: clamp(0.7rem, 1vw, 0.8rem);
    font-weight: 600;
    letter-spacing: 0.1em;
    color: rgba(240, 238, 233, 0.5);
    padding-top: 2px;
    white-space: nowrap;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .ev-day {
    font-size: 0.58rem;
    letter-spacing: 0.14em;
    color: rgba(240, 238, 233, 0.28);
  }

  .ev-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .ev-queen {
    font-family: var(--font-primary);
    font-size: clamp(0.95rem, 1.5vw, 1.15rem);
    font-weight: 700;
    color: #f0eee9;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    transition: color 0.35s ease;
  }

  .ev-show {
    font-family: var(--font-primary);
    font-size: clamp(0.75rem, 1vw, 0.85rem);
    color: rgba(240, 238, 233, 0.5);
    letter-spacing: 0.03em;
    overflow-wrap: anywhere;
  }

  .ev-venue {
    font-family: var(--font-primary);
    font-size: 0.7rem;
    color: rgba(240, 238, 233, 0.25);
    font-style: italic;
    overflow-wrap: anywhere;
  }

  .ev-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.75rem;
    padding-top: 2px;
  }

  .ev-status {
    font-family: var(--font-primary);
    font-size: 0.55rem;
    font-weight: 500;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(180, 240, 190, 0.9);
    display: flex;
    align-items: center;
    gap: 0.4rem;
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
    color: rgba(240, 238, 233, 0.15);
  }

  .ev-status.limited {
    color: rgba(240, 238, 233, 0.6);
  }

  .ev-link {
    font-family: var(--font-primary);
    font-size: 0.6rem;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #f0eee9;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.45rem 0.95rem;
    border: 1px solid rgba(240, 238, 233, 0.15);
    border-radius: 999px;
    background: transparent;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .ev-link:hover {
    color: #111111;
    background: #f0eee9;
    border-color: #f0eee9;
  }

  .ev-row:hover .ev-queen {
    transform: translateX(6px);
    color: #ffffff;
  }

  .ev-footer {
    margin-top: clamp(2rem, 4vh, 3rem);
  }

  .ev-footer p {
    font-family: var(--font-primary);
    font-size: 0.6rem;
    color: rgba(240, 238, 233, 0.2);
    letter-spacing: 0.08em;
    margin: 0;
  }

  .close-btn-left {
    position: absolute;
    top: 1.25rem;
    left: 1.25rem;
    width: 44px;
    height: 44px;
    border: none;
    background: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 3;
  }

  .close-btn-left svg.close-icon {
    width: 24px;
    height: 24px;
    transition: transform 0.4s cubic-bezier(0.32, 0, 0.15, 1);
  }

  .close-btn-left {
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, -50%) scale(0);
    /* Fast exit transition (No Ghosting) */
    transition: 
      transform 0.1s ease,
      opacity 0.1s ease;
    transition-delay: 0s;
  }

  .close-btn-left.is-visible {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
    pointer-events: auto;
    /* Snappier entrance: overlaps with layout end */
    transition: 
      transform 0.4s var(--anim-layout-easing),
      opacity 0.3s ease;
    transition-delay: calc(var(--anim-layout-duration) - 0.2s);
  }

  .close-icon path {
    stroke-dasharray: 30;
    stroke-dashoffset: 30;
    /* Drawing animation only on entrance */
    transition: stroke-dashoffset 0.4s ease;
  }

  /* Reset paths instantly on exit to prevent ghosting */
  .close-btn-left:not(.is-visible) .close-icon path {
    transition: none;
    stroke-dashoffset: 30;
  }

  .is-visible .line-1 {
    transition-delay: calc(var(--anim-layout-duration) - 0.05s);
    stroke-dashoffset: 0;
  }

  .is-visible .line-2 {
    transition-delay: calc(var(--anim-layout-duration) + 0.1s);
    stroke-dashoffset: 0;
  }

  .close-btn-left:hover svg.close-icon {
    transform: rotate(180deg) scale(1.1);
  }

  @media (min-width: 1024px) {
    .close-btn-left {
      top: 50%;
      left: var(--events-panel-width);
      width: 38px;
      height: 38px;
      padding: 0;
      background: #ffffff;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transform: translate(-50%, -50%);
    }

    .close-btn-left svg.close-icon {
      width: 20px;
      height: 20px;
    }

    .close-btn-left svg path {
      stroke: #111111;
    }

    .close-btn-left:hover {
      background: #ffffff;
      transform: translate(-50%, -50%) scale(1.1);
    }
    
    .close-btn-left:hover svg path {
      stroke: #111111;
    }
  }

  /* Prevent lag during window resize */
  .close-btn-left.no-transition {
    transition: none !important;
    transition-delay: 0s !important;
  }

  @media (max-width: 768px) {
    .events-backdrop {
      align-items: flex-start;
      justify-content: flex-start;
      padding-top: 6.5rem;
      padding-left: var(--events-content-offset);
      padding-right: max(1rem, calc(100vw - var(--events-panel-width) + 1rem));
    }

    .events-nav {
      max-width: 100%;
    }

    .ev-header {
      margin-bottom: 1.75rem;
    }

    .ev-row {
      grid-template-columns: minmax(3.5rem, 4rem) minmax(0, 1fr);
      grid-template-areas:
        "date body"
        "actions actions";
      gap: 0.35rem 0.75rem;
      padding: 1.15rem 0;
    }

    .ev-date { grid-area: date; }
    .ev-body { grid-area: body; gap: 0.15rem; }
    .ev-queen { font-size: 1.05rem; }

    .ev-actions {
      grid-area: actions;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      margin-top: 0.25rem;
      padding-top: 0.85rem;
      border-top: 1px dashed rgba(240, 238, 233, 0.1);
    }
    .ev-status { margin-top: 0; }
  }
</style>
