<script lang="ts">
  import { menuOpen, isNavReady } from "$lib/stores/menu";
  import { i18n } from "$lib/i18n.svelte";
  import { draw, scale } from "svelte/transition";
  import { expoOut } from "svelte/easing";
  import { browser } from "$app/environment";

  let { lenis, isResizing = false } = $props<{
    lenis: any;
    isResizing?: boolean;
  }>();

  function closeMenu() {
    menuOpen.set(false);
    lenis?.start();
  }

  // Strict scroll lock to prevent bouncing on mobile
  $effect(() => {
    if (browser) {
      if ($menuOpen) {
        document.documentElement.style.overscrollBehavior = "none";
        document.body.style.overscrollBehavior = "none";
        document.body.style.overflow = "hidden";
        document.body.style.touchAction = "none"; // Disable native touch scrolling globally while menu is open
      } else {
        document.documentElement.style.overscrollBehavior = "";
        document.body.style.overscrollBehavior = "";
        document.body.style.overflow = "";
        document.body.style.touchAction = "";
      }
    }
  });

  // Stop touchmove from bubbling up to browser UI
  function blockTouch(e: TouchEvent) {
    if ($menuOpen) {
      // In Svelte 5 we can't use preventDefault modifier easily on passive events,
      // but the CSS touch-action: none on body covers most cases.
      // We stop propagation just in case.
      e.stopPropagation();
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="menu-backdrop"
  class:is-open={$menuOpen}
  class:no-transition={isResizing}
  ontouchmove={blockTouch}
>
  <div class="menu-container" class:is-open={$menuOpen}>
    <nav class="menu-links">
      <a href="/" onclick={closeMenu}><span>{i18n.t("menu_home")}</span></a>
      <a href="/about" onclick={closeMenu}
        ><span>{i18n.t("menu_about")}</span></a
      >
      <a href="/projects" onclick={closeMenu}
        ><span>{i18n.t("menu_works")}</span></a
      >
      <a href="/upcoming" onclick={closeMenu}
        ><span>{i18n.t("menu_upcoming")}</span></a
      >
      <a href="/partnership" onclick={closeMenu}
        ><span>{i18n.t("menu_partnership")}</span></a
      >
      <a href="/contact" onclick={closeMenu}
        ><span>{i18n.t("menu_contact")}</span></a
      >
    </nav>

    <!-- Language Switcher: Responsive Layout -->
    <div class="menu-lang-switcher">
      <div class="lang-switch-track">
        <div
          class="slider"
          class:en={i18n.currentLocale === "en"}
          class:th={i18n.currentLocale === "th"}
          class:tw={i18n.currentLocale === "tw"}
        ></div>
        <button
          class:active={i18n.currentLocale === "en"}
          onclick={() => i18n.setLocale("en")}>EN</button
        >
        <button
          class:active={i18n.currentLocale === "th"}
          onclick={() => i18n.setLocale("th")}>TH</button
        >
        <button
          class:active={i18n.currentLocale === "tw"}
          onclick={() => i18n.setLocale("tw")}>TW</button
        >
      </div>
    </div>
  </div>
</div>

{#if $menuOpen && $isNavReady}
  <button
    class="close-btn"
    class:no-transition={isResizing}
    in:scale={{ duration: 150, delay: 0, easing: expoOut }}
    onclick={closeMenu}
    aria-label="Close menu"
  >
    <svg class="close-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        in:draw={{ duration: 250, delay: 300 }}
        d="M3 3L21 21"
        stroke="#f0eee9"
        stroke-width="2.2"
        stroke-linecap="round"
      />
      <path
        in:draw={{ duration: 250, delay: 450 }}
        d="M21 3L3 21"
        stroke="#f0eee9"
        stroke-width="2.2"
        stroke-linecap="round"
      />
    </svg>
  </button>
{/if}

<style>
  .menu-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    height: 100svh; /* Lock height on mobile to prevent address bar bouncing */
    background: radial-gradient(
        ellipse 80% 60% at 50% 0%,
        rgba(226, 232, 240, 0.15),
        transparent 70%
      ),
      var(--color-bg);
    display: flex;
    align-items: center;
    padding-left: calc(100vw - var(--menu-width) + var(--menu-content-offset));
    z-index: 0;
    pointer-events: none;
    visibility: hidden;
    transition: visibility 0.4s ease;
    /* Lock scrolling on the backdrop completely to prevent bouncing */
    overflow: hidden;
    touch-action: none;
    overscroll-behavior: none;
  }

  /* Prevent lag and bouncing during window resize */
  .menu-backdrop.no-transition,
  .menu-backdrop.no-transition * {
    transition: none !important;
    transition-delay: 0s !important;
    animation: none !important;
  }

  .menu-backdrop.is-open {
    pointer-events: auto;
    visibility: visible;
  }

  .menu-container {
    display: flex;
    flex-direction: column;
    /* Use exactly 100% of the fixed container height. touch-action none prevents bounce */
    height: 100%;
    justify-content: center;
    position: relative;
    width: 100%;
    /* Leave space on the right for the vertical language switcher */
    padding-right: clamp(5rem, 12vw, 10rem);
    box-sizing: border-box;
    touch-action: none;
  }

  .menu-links {
    display: flex;
    flex-direction: column;
    gap: var(--menu-link-gap);
    align-items: flex-start;
  }

  .menu-links a {
    text-decoration: none;
    display: block;
    padding: 0.75rem 1.5rem;
    margin: -0.75rem -1.5rem;
    opacity: 0;
    transform: translateY(20px);
    filter: blur(8px);
    pointer-events: none;
    transition:
      opacity 0.4s ease,
      transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
      filter 0.4s ease;
  }

  .menu-container.is-open a {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
    pointer-events: auto;
  }

  /* Staggered Delays for enter animation */
  .menu-container.is-open a:nth-child(1) {
    transition-delay: 0.1s;
  }
  .menu-container.is-open a:nth-child(2) {
    transition-delay: 0.14s;
  }
  .menu-container.is-open a:nth-child(3) {
    transition-delay: 0.18s;
  }
  .menu-container.is-open a:nth-child(4) {
    transition-delay: 0.22s;
  }
  .menu-container.is-open a:nth-child(5) {
    transition-delay: 0.26s;
  }
  .menu-container.is-open a:nth-child(6) {
    transition-delay: 0.3s;
  }

  .menu-links a span {
    font-family: var(--font-primary);
    font-size: var(--menu-link-size);
    line-height: 1.2;
    letter-spacing: 0.12em;
    font-weight: 600;
    color: var(--color-text);
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
    white-space: nowrap;
    will-change: transform, letter-spacing, color, font-size;
  }

  .menu-links:hover a:not(:hover) span {
    opacity: 0.3;
    filter: blur(2px);
  }

  .menu-links a:hover span {
    color: var(--color-white);
    text-shadow: 0 0 15px rgba(var(--color-white-rgb), 0.3);
    transform: translateX(12px) skewX(-6deg);
    letter-spacing: 0.16em;
  }

  /* --- LANGUAGE SWITCHER --- */
  .menu-lang-switcher {
    position: absolute;
    right: clamp(1rem, 4vw, 3rem);
    top: 50%;
    opacity: 0;
    transform: translateY(-50%) translateX(20px);
    transition:
      opacity 0.3s ease,
      transform 0.4s ease;
    z-index: 10;
    pointer-events: none;
  }

  .menu-container.is-open .menu-lang-switcher {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
    transition:
      opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s,
      transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s;
    pointer-events: auto;
  }

  .lang-switch-track {
    position: relative;
    display: flex;
    flex-direction: column;
    background: rgba(10, 10, 10, 0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(var(--color-text-rgb), 0.1);
    box-shadow:
      inset 0 1px 1px rgba(var(--color-text-rgb), 0.05),
      0 10px 30px rgba(0, 0, 0, 0.5);
    border-radius: 4px;
    padding: 4px;
    width: 44px;
  }

  .lang-switch-track .slider {
    position: absolute;
    left: 4px;
    right: 4px;
    top: 4px;
    height: calc((100% - 8px) / 3);
    background: rgba(var(--color-text-rgb), 0.05);
    border: 1px solid rgba(var(--color-text-rgb), 0.2);
    border-radius: 2px;
    box-shadow:
      inset 0 1px 2px rgba(var(--color-text-rgb), 0.1),
      0 0 12px rgba(var(--color-text-rgb), 0.15);
    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    pointer-events: none;
    z-index: 1;
  }

  .slider.en {
    transform: translateY(0);
  }
  .slider.th {
    transform: translateY(100%);
  }
  .slider.tw {
    transform: translateY(200%);
  }

  .lang-switch-track button {
    background: none;
    border: none;
    padding: 1rem 0;
    font-family: var(--font-primary);
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.15em;
    color: rgba(var(--color-text-rgb), 0.4);
    cursor: pointer;
    transition:
      color 0.4s ease,
      text-shadow 0.4s ease;
    text-transform: uppercase;
    position: relative;
    z-index: 2;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lang-switch-track button:hover {
    color: rgba(var(--color-text-rgb), 0.8);
  }

  .lang-switch-track button.active {
    color: var(--color-text);
    font-weight: 600;
    text-shadow: 0 0 10px rgba(var(--color-white-rgb), 0.3);
  }

  .close-btn {
    position: absolute;
    top: calc(1.25rem + env(safe-area-inset-top));
    right: calc(1.25rem + env(safe-area-inset-right));
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

  .close-btn svg.close-icon {
    width: 24px;
    height: 24px;
    transition: transform 0.4s cubic-bezier(0.32, 0, 0.15, 1);
  }

  .close-btn svg.close-icon path {
    transition: stroke 0.3s ease;
  }

  .close-btn:hover svg.close-icon {
    transform: rotate(-180deg) scale(1.1);
  }

  @media (min-width: 1024px) {
    .close-btn {
      top: 50%;
      left: calc(100vw - var(--menu-width));
      right: auto;
      width: 38px;
      height: 38px;
      padding: 0;
      background: var(--color-white);
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(var(--color-bg-rgb), 0.3);
      transform: translate(-50%, -50%);
    }

    .close-btn svg.close-icon {
      width: 20px;
      height: 20px;
    }

    .close-btn svg path {
      stroke: var(--color-bg-alt);
    }

    .close-btn:hover {
      background: var(--color-white);
      transform: translate(-50%, -50%) scale(1.1);
    }

    .close-btn:hover svg path {
      stroke: var(--color-bg-alt);
    }
  }

  /* Prevent lag during window resize */
  .close-btn.no-transition {
    transition: none !important;
    transition-delay: 0s !important;
  }

  @media (max-width: 1024px) {
    .menu-backdrop {
      /* Remove content-offset so container spans full panel width for true centering */
      padding-left: calc(100vw - var(--menu-width));
      padding-right: 0;
    }

    .menu-container {
      padding-right: 0;
      /* Center the menu links block within the full panel area */
      align-items: center;
    }

    .menu-lang-switcher {
      position: absolute;
      top: auto;
      /* clamp(MIN, VAL, MAX) */
      bottom: clamp(5rem, 4vh, 4rem);
      right: auto;
      /* Center within the menu panel area */
      left: 50%;
      margin-top: 0;
      transform: translateX(-50%) translateY(20px);
      transform-origin: center center;
      transition:
        opacity 0.3s ease,
        transform 0.4s ease;
    }

    .menu-container.is-open .menu-lang-switcher {
      transform: translateX(-50%) translateY(0);
      transition:
        opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s,
        transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s;
    }

    .lang-switch-track {
      flex-direction: row;
      width: 180px; /* Made smaller */
      height: 40px; /* Made smaller */
      padding: 4px;
    }

    .lang-switch-track .slider {
      top: 4px;
      bottom: 4px;
      left: 4px;
      right: auto;
      height: auto;
      width: calc((100% - 8px) / 3);
    }

    .slider.en {
      transform: translateX(0);
    }
    .slider.th {
      transform: translateX(100%);
    }
    .slider.tw {
      transform: translateX(200%);
    }

    .lang-switch-track button {
      padding: 0;
      width: 100%;
      height: 100%;
      font-size: 0.65rem; /* Smaller font */
    }
  }
</style>
