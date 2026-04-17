<script lang="ts">
  import { menuOpen } from "$lib/stores/menu";
  import { i18n } from "$lib/i18n.svelte";
  import { draw, scale } from "svelte/transition";
  import { expoOut } from "svelte/easing";

  let { lenis, isResizing = false } = $props<{ lenis: any, isResizing?: boolean }>();

  function closeMenu() {
    menuOpen.set(false);
    lenis?.start();
  }
</script>

<div class="menu-backdrop" class:is-open={$menuOpen}>
  <nav class="menu-links" class:is-open={$menuOpen}>
    <a href="/" onclick={closeMenu}><span>{i18n.t('menu_home')}</span></a>
    <a href="/about" onclick={closeMenu}><span>{i18n.t('menu_about')}</span></a>
    <a href="/projects" onclick={closeMenu}><span>{i18n.t('menu_works')}</span></a>
    <a href="/upcoming" onclick={closeMenu}><span>{i18n.t('menu_upcoming')}</span></a>
    <a href="/partnership" onclick={closeMenu}><span>{i18n.t('menu_partnership')}</span></a>
    <a href="/contact" onclick={closeMenu}><span>{i18n.t('menu_contact')}</span></a>
  </nav>
</div>

<button
  class="close-btn"
  class:is-visible={$menuOpen}
  class:no-transition={isResizing}
  onclick={closeMenu}
  aria-label="Close menu"
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
  .menu-backdrop {
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(226, 232, 240, 0.15), transparent 70%), #000000;
    display: flex;
    align-items: center;
    padding-left: calc(100vw - var(--menu-width) + var(--menu-content-offset));
    z-index: 0;
    pointer-events: none;
    visibility: hidden;
    transition: visibility 0.4s ease;
  }

  .menu-backdrop.is-open {
    pointer-events: auto;
    visibility: visible;
  }

  .menu-links {
    display: flex;
    flex-direction: column;
    gap: var(--menu-link-gap);
    transition: gap 0.4s cubic-bezier(0.32, 0, 0.15, 1);
  }

  .menu-links a {
    text-decoration: none;
    display: inline-block;
    opacity: 0;
    transform: translateY(20px);
    filter: blur(8px);
    pointer-events: none;
    transition: opacity 0.4s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease;
  }

  .menu-links.is-open a {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
    pointer-events: auto;
  }

  /* Staggered Delays for enter animation */
  .menu-links.is-open a:nth-child(1) { transition-delay: 0.10s; }
  .menu-links.is-open a:nth-child(2) { transition-delay: 0.14s; }
  .menu-links.is-open a:nth-child(3) { transition-delay: 0.18s; }
  .menu-links.is-open a:nth-child(4) { transition-delay: 0.22s; }
  .menu-links.is-open a:nth-child(5) { transition-delay: 0.26s; }
  .menu-links.is-open a:nth-child(6) { transition-delay: 0.30s; }

  /* Faster staggered delays for exit animation to prevent sticking around */
  .menu-links:not(.is-open) a:nth-child(1) { transition-delay: 0.05s; }
  .menu-links:not(.is-open) a:nth-child(2) { transition-delay: 0.04s; }
  .menu-links:not(.is-open) a:nth-child(3) { transition-delay: 0.03s; }
  .menu-links:not(.is-open) a:nth-child(4) { transition-delay: 0.02s; }
  .menu-links:not(.is-open) a:nth-child(5) { transition-delay: 0.01s; }
  .menu-links:not(.is-open) a:nth-child(6) { transition-delay: 0.00s; }

  .menu-links a span {
    font-family: var(--font-primary);
    font-size: var(--menu-link-size);
    line-height: 1.2;
    letter-spacing: 0.12em;
    font-weight: 600;
    color: #f0eee9;
    text-transform: uppercase;
    display: inline-block;
    transform-origin: left center;
    transition:
      transform 0.3s cubic-bezier(0.25, 1, 0.4, 1),
      letter-spacing 0.3s cubic-bezier(0.25, 1, 0.4, 1),
      font-size 0.4s cubic-bezier(0.32, 0, 0.15, 1),
      color 0.25s ease,
      text-shadow 0.25s ease,
      opacity 0.3s ease,
      filter 0.3s ease;
    will-change: transform, letter-spacing, color, font-size;
  }

  .menu-links.is-open:hover a:not(:hover) span {
    opacity: 0.3;
    filter: blur(2px);
  }

  .menu-links.is-open a:hover span {
    color: #ffffff;
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
    transform: translateX(12px) skewX(-6deg);
    letter-spacing: 0.16em;
  }

  .close-btn {
    position: absolute;
    top: 1.25rem; 
    right: 1.25rem;
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

  .close-btn svg.close-icon {
    width: 24px;
    height: 24px;
    transition: transform 0.4s cubic-bezier(0.32, 0, 0.15, 1);
  }

  .close-btn {
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, -50%) scale(0);
    /* Fast exit transition (No Ghosting) */
    transition: 
      transform 0.1s ease,
      opacity 0.1s ease;
    transition-delay: 0s;
  }

  .close-btn.is-visible {
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
  .close-btn:not(.is-visible) .close-icon path {
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

  .close-btn svg.close-icon path {
    transition: stroke 0.3s ease;
  }

  /* Hover scale shared across resolutions */
  .close-btn:hover svg.close-icon {
    transform: rotate(180deg) scale(1.1);
  }

  @media (min-width: 1024px) {
    .close-btn {
      top: 50%;
      left: calc(100vw - var(--menu-width));
      right: auto;
      width: 38px;
      height: 38px;
      padding: 0;
      background: #ffffff;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transform: translate(-50%, -50%);
    }

    .close-btn svg.close-icon {
      width: 20px;
      height: 20px;
    }

    .close-btn svg path {
      stroke: #111111;
    }

    .close-btn:hover {
      background: #ffffff;
      transform: translate(-50%, -50%) scale(1.1);
    }

    .close-btn:hover svg path {
      /* Keep black stroke on white background for desktop */
      stroke: #111111;
    }
  }

  /* Prevent lag during window resize */
  .close-btn.no-transition {
    transition: none !important;
    transition-delay: 0s !important;
  }

  @media (max-width: 768px) {
    .menu-backdrop {
      padding-right: 1.5rem;
    }
  }
</style>
