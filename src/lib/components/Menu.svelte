<script lang="ts">
  import { getMenuState } from "$lib/stores/menu.svelte";

  const menuState = getMenuState();
  import { browser } from "$app/environment";
  import { draw, scale } from "svelte/transition";
  import { expoOut } from "svelte/easing";

  interface Props {
    onclose: () => void;
    isResizing?: boolean;
  }

  let { onclose, isResizing = false }: Props = $props();

  let firstLink: HTMLAnchorElement | undefined = $state();
  let lastFocusedElement: HTMLElement | null = null;

  const MENU_LABELS = {
    home: "Home",
    about: "About",
    works: "Works",
    upcoming: "Upcoming",
    partnership: "Partnership",
    contact: "Contact",
    closeAriaLabel: "Close menu",
  } as const;


  function closeMenu() {
    onclose();
  }

  // Scroll Lock Management
  $effect(() => {
    if (!browser) return;
    
    if (menuState.isOpen) {
      lastFocusedElement = document.activeElement as HTMLElement;
      document.documentElement.style.overscrollBehavior = "none";
      document.body.style.overscrollBehavior = "none";
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.documentElement.style.overscrollBehavior = "";
      document.body.style.overscrollBehavior = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      
      if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
      }
    }
  });

  // Focus Management - Wait for transition readiness
  $effect(() => {
    if (menuState.isOpen && menuState.isNavReady) {
      firstLink?.focus();
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (!menuState.isOpen) return;
    
    if (e.key === "Tab") {
      const focusables = Array.from(document.querySelectorAll('.menu-backdrop.is-open a, .close-btn')) as HTMLElement[];
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
      closeMenu();
    }
  }


  // Stop touchmove from bubbling up to browser UI
  function blockTouch(e: TouchEvent) {
    if (menuState.isOpen) {
      // In Svelte 5 we can't use preventDefault modifier easily on passive events,
      // but the CSS touch-action: none on body covers most cases.
      // We stop propagation just in case.
      e.stopPropagation();
    }
  }
</script>

<div
  class={[
    "menu-backdrop",
    menuState.isOpen && "is-open",
    isResizing && "no-transition"
  ]}
  ontouchmove={blockTouch}
  onkeydown={handleKeydown}
  role="dialog"
  aria-modal="true"
  aria-label="Main Navigation"
  aria-hidden={!menuState.isOpen}
>
  <div class={["menu-container", menuState.isOpen && "is-open"]}>
    <nav class="menu-links">
      <a href="/" onclick={closeMenu} bind:this={firstLink}><span>{MENU_LABELS.home}</span></a>
      <a href="/about" onclick={closeMenu}
        ><span>{MENU_LABELS.about}</span></a
      >
      <a href="/projects" onclick={closeMenu}
        ><span>{MENU_LABELS.works}</span></a
      >
      <a href="/upcoming" onclick={closeMenu}
        ><span>{MENU_LABELS.upcoming}</span></a
      >
      <a href="/partnership" onclick={closeMenu}
        ><span>{MENU_LABELS.partnership}</span></a
      >
      <a href="/contact" onclick={closeMenu}
        ><span>{MENU_LABELS.contact}</span></a
      >
    </nav>
  </div>
</div>

{#if menuState.isOpen}
  <button
    class={["close-btn", isResizing && "no-transition"]}
    in:scale={{ duration: 300, delay: 300, easing: expoOut }}
    onclick={closeMenu}
    aria-label={MENU_LABELS.closeAriaLabel}
  >
    <svg class="close-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
  .menu-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    height: 100svh; /* Lock height on mobile to prevent address bar bouncing */
    background: radial-gradient(
        ellipse 80% 60% at 50% 0%,
        var(--color-pearl-mist),
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
    pointer-events: none;
    transition:
      opacity 0.4s ease,
      transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    border-radius: 4px;
  }

  /* Focus-visible styles for nav links - on-brand white glow */
  .menu-links a:focus-visible {
    outline: 2px solid var(--color-white);
    outline-offset: 4px;
    box-shadow: 0 0 20px rgba(var(--color-white-rgb), 0.4);
    opacity: 1;
    transform: translateY(0);
  }

  .menu-container.is-open a {
    opacity: 1;
    transform: translateY(0);
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
      transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
      letter-spacing 0.3s cubic-bezier(0.16, 1, 0.3, 1),
      font-size 0.4s cubic-bezier(0.22, 1, 0.36, 1),
      color 0.25s ease,
      opacity 0.3s ease;
    white-space: nowrap;
    will-change: transform, letter-spacing, color, font-size;
  }

  .menu-links:hover a:not(:hover) span {
    opacity: 0.3;
  }

  .menu-links a:hover span {
    color: var(--color-white);
    transform: translateX(12px) skewX(-6deg);
    letter-spacing: 0.16em;
  }

  .close-btn {
    position: fixed;
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
    border-radius: 4px;
    transition: box-shadow 0.2s ease;
  }

  /* Focus-visible styles for close button - on-brand white glow */
  .close-btn:focus-visible {
    outline: 2px solid var(--color-white);
    outline-offset: 4px;
    box-shadow: 0 0 20px rgba(var(--color-white-rgb), 0.5);
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
      /* Center the menu links block within the full panel area */
      align-items: center;
    }
  }
</style>
