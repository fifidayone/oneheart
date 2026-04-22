<script lang="ts">
  import { fly } from "svelte/transition";
  import { expoOut } from "svelte/easing";
  import { PANEL_COPY } from "$lib/logic/events.svelte";
  import type { EventData } from "$lib/content/types";

  interface Props {
    event: EventData;
    delay?: number;
  }

  let { event, delay = 0 }: Props = $props();

  const rowTransition = $derived(
    delay > 0 ? { y: 20, duration: 600, delay, easing: expoOut } : undefined
  );
</script>

<div
  class="ev-row pc-row"
  in:fly={rowTransition}
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

<style>
  .ev-row {
    background: linear-gradient(135deg, rgba(30, 30, 30, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid rgba(var(--color-text-rgb), 0.08);
    border-radius: 4px;
    padding: clamp(0.75rem, 1.5vw, 1.25rem);
    margin-bottom: clamp(0.75rem, 1.5vw, 1rem);
    display: flex;
    gap: clamp(0.75rem, 1.5vw, 1.5rem);
    align-items: center;
    transition: background 0.4s ease, border-color 0.4s ease;
    box-shadow: inset 0 1px 1px rgba(var(--color-text-rgb), 0.08), 0 10px 30px rgba(0, 0, 0, 0.6);
    cursor: default;
    position: relative;
  }

  .ev-row:hover {
    background: linear-gradient(135deg, rgba(45, 45, 45, 0.7) 0%, rgba(20, 20, 20, 0.8) 100%);
    border-color: rgba(var(--color-text-rgb), 0.15);
  }

  .pc-date-box {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(var(--color-text-rgb), 0.03);
    border-radius: 4px;
    text-align: center;
    padding: clamp(0.5rem, 1vw, 0.75rem) clamp(0.5rem, 1.5vw, 1rem);
    min-width: clamp(3.5rem, 5vw, 4.5rem);
    flex-shrink: 0;
    transition: all 0.4s ease;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
  }

  .ev-row:hover .pc-date-box {
    border-color: rgba(var(--color-text-rgb), 0.08);
    background: rgba(0, 0, 0, 0.6);
  }

  .pc-month {
    font-family: var(--font-primary);
    font-size: clamp(0.55rem, 0.8vw, 0.65rem);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: rgba(var(--color-text-rgb), 0.6);
    margin-bottom: 2px;
  }

  .pc-day {
    font-family: var(--font-primary);
    font-size: clamp(1.2rem, 2vw, 1.5rem);
    font-weight: 600;
    line-height: 1;
    color: var(--color-text);
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
    color: rgba(var(--color-text-rgb), 0.85);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    transition: color 0.4s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ev-row:hover .ev-queen {
    color: #ffffff;
  }

  .ev-show {
    font-family: var(--font-primary);
    font-size: clamp(0.7rem, 1vw, 0.8rem);
    color: rgba(var(--color-text-rgb), 0.5);
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
    color: rgba(var(--color-text-rgb), 0.3);
    font-style: italic;
  }

  .ev-actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    z-index: 1;
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
    color: rgba(var(--color-text-rgb), 0.25);
  }

  .ev-status.limited {
    color: rgba(var(--color-text-rgb), 0.7);
  }

  .ev-link {
    font-family: var(--font-primary);
    font-size: clamp(0.6rem, 0.8vw, 0.7rem);
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(var(--color-text-rgb), 0.8);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: clamp(0.4rem, 0.8vw, 0.5rem) clamp(0.7rem, 1.2vw, 1rem);
    border: 1px solid rgba(var(--color-text-rgb), 0.15);
    background: rgba(var(--color-text-rgb), 0.03);
    border-radius: 4px;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    white-space: nowrap;
    position: relative;
    overflow: hidden;
  }

  .ev-link::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(var(--color-text-rgb), 1);
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: -1;
  }

  .ev-link:hover {
    color: #000000;
    border-color: rgba(var(--color-text-rgb), 1);
  }

  .ev-link:hover::before {
    transform: scaleX(1);
    transform-origin: left;
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

  @media (prefers-reduced-motion: reduce) {
    .ev-row {
      transition-duration: 0.15s;
    }

    /* Status indicator: stop blink, keep dot visible */
    .ev-status::before {
      animation: none;
      opacity: 1;
      transform: scale(1);
    }

    /* Shorten hover transitions */
    .ev-link { transition-duration: 0.15s; }
    .ev-link::before { transition-duration: 0.15s; }
    .ev-queen { transition-duration: 0.15s; }
    .pc-date-box { transition-duration: 0.15s; }
  }
</style>
