<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import type Lenis from "lenis";
  import Menu from "$lib/components/Menu.svelte";
  import EventsPanel from "$lib/components/EventsPanel.svelte";
  import { setMenuState, MenuState } from "$lib/stores/menu.svelte";
  import { setScrollState, ScrollState } from "$lib/stores/scroll.svelte";
  import type { Attachment } from "svelte/attachments";

  import type { LayoutProps } from "./$types";

  let { children }: LayoutProps = $props();

  // Initialize Isolated Contexts (Svelte 5.40+)
  const menuState = setMenuState(new MenuState());
  const wrapperScroll = setScrollState(new ScrollState());

  let lenis: Lenis | undefined = $state();
  let rafId: number | undefined;

  let showScrollbar = $state(false);
  let scrollTimeout: ReturnType<typeof setTimeout>;
  let isResizing = $state(false);
  let resizeTimeout: ReturnType<typeof setTimeout>;
  let scrollProgress = $derived(
    Math.min(1, Math.max(0, wrapperScroll.y / wrapperScroll.limit)),
  );

  /**
   * Svelte 5 Attachment for Lenis Smooth Scroll
   */
  const smoothScroll: Attachment<HTMLElement> = (node) => {
    let lenisInstance: Lenis;

    const init = async () => {
      const LenisLib = (await import("lenis")).default;
      lenisInstance = new LenisLib({
        wrapper: node,
        content: node,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenis = lenisInstance;

      function raf(time: number) {
        lenisInstance?.raf(time);
        rafId = requestAnimationFrame(raf);
      }

      lenisInstance.on(
        "scroll",
        ({ scroll, limit }: { scroll: number; limit: number }) => {
          wrapperScroll.update(scroll, limit);

          showScrollbar = true;
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            showScrollbar = false;
          }, 3000);
        },
      );

      rafId = requestAnimationFrame(raf);
    };

    init();

    return () => {
      lenisInstance?.destroy();
      clearTimeout(scrollTimeout);
      clearTimeout(resizeTimeout);
      if (rafId) cancelAnimationFrame(rafId);
      lenis = undefined;
    };
  };

  function openMenu() {
    menuState.isNavReady = false;
    menuState.isLeftOpen = false;
    menuState.isOpen = true;
    lenis?.stop();
  }

  function openLeftMenu() {
    menuState.isNavReady = false;
    menuState.isOpen = false;
    menuState.isLeftOpen = true;
    lenis?.stop();
  }

  // CSS transition duration for layout panels (must match --anim-layout-duration in layout.css)
  const LAYOUT_TRANSITION_MS = 600;

  function handleResize() {
    if (!menuState.isOpen && !menuState.isLeftOpen) return;
    isResizing = true;
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      isResizing = false;
    }, 150);
  }

  // Bulletproof Deterministic Navigation Readiness
  // Uses $effect cleanup (Svelte 5 best practice) to auto-clear timers on re-run or destroy.
  $effect(() => {
    if (menuState.isOpen || menuState.isLeftOpen) {
      const timeout = setTimeout(() => {
        menuState.setNavReady(true);
      }, LAYOUT_TRANSITION_MS + 20);

      // Svelte 5: cleanup runs on re-trigger or component destroy
      return () => clearTimeout(timeout);
    } else {
      menuState.setNavReady(false);
    }
  });

  afterNavigate(() => {
    lenis?.scrollTo(0, { immediate: true });
    wrapperScroll.y = 0;
    menuState.close();
    menuState.closeLeft();
    lenis?.start();
  });
</script>

<svelte:window onresize={handleResize} />

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<Menu
  onclose={() => {
    menuState.close();
    lenis?.start();
  }}
  {isResizing}
/>

<EventsPanel
  onclose={() => {
    menuState.closeLeft();
    lenis?.start();
  }}
  {isResizing}
/>

<!-- Scroll Progress Bar -->
<div class={["scroll-progress-container", showScrollbar && "visible"]}>
  <div
    class="scroll-progress-bar"
    style:transform="scaleX({scrollProgress})"
  ></div>
</div>

<div
  class={[
    "layout-shell",
    menuState.isOpen && "is-open",
    menuState.isLeftOpen && "is-left-open",
  ]}
>
  <div class="sticky-header-wrapper">
    <header class="site-header">
      <!-- TOP LEFT (Grid column preserved) -->
      <div class="header-left">
        <button
          class="nav-btn left-trigger mobile-only"
          onclick={openLeftMenu}
          aria-label="Open tickets panel"
        >
          <div class="nav-lines events-icon">
            <span class="line top-line"></span>
            <span class="line bot-line"></span>
          </div>
          <span class="nav-text-persistent">TICKETS</span>
        </button>
      </div>

      <!-- CENTER SIDE (All screens) -->
      <div class="header-center"></div>

      <!-- TOP RIGHT (Grid column preserved) -->
      <div class="header-right">
        <button
          class="nav-btn right-trigger mobile-only"
          onclick={openMenu}
          aria-label="Open menu"
        >
          <span class="nav-text-persistent">MENU</span>
          <div class="nav-lines">
            <span class="line top-line"></span>
            <span class="line bot-line"></span>
          </div>
        </button>
      </div>
    </header>
  </div>

  <!-- Vertical Nav Labels (Desktop only) -->
  <div class="vertical-label-container left desktop-only">
    <button
      class="v-label"
      onclick={openLeftMenu}
      aria-label="Open tickets panel"
    >
      <span>TICKETS</span>
    </button>
  </div>

  <div class="vertical-label-container right desktop-only">
    <button
      class="v-label"
      onclick={openMenu}
      aria-label="Open navigation menu"
    >
      <span>MENU</span>
    </button>
  </div>

  <div
    class={[
      "page-wrapper",
      menuState.isOpen && "is-open",
      menuState.isLeftOpen && "is-left-open",
      isResizing && "no-transition",
    ]}
    {@attach smoothScroll}
  >
    {#key page.url.pathname}
      <div
        in:fade={{ duration: 400, delay: 400 }}
        out:fade={{ duration: 400 }}
        style="display: contents"
      >
        {@render children()}
      </div>
    {/key}
  </div>
</div>

<style>
  :global(:root) {
    /* Balanced menu width: 33% (approx 1/3) provides a good middle ground between 40% and 28% */
    --menu-width: 33%;
    /* ฝั่ง events แยก token อิสระจากเมนูขวา */
    --events-panel-width: clamp(34rem, 48vw, 42rem);
    /* ระดับการย่อของตัวเว็บ (Scale) */
    --menu-scale: 0.8;
    --events-panel-scale: 0.8;
    /* Content offset inside the menu panel follows viewport size smoothly. */
    --menu-content-offset: clamp(2rem, 8vw, 8rem);
    --events-content-offset: clamp(2.5rem, 5vw, 4rem);
    --menu-link-size: clamp(28px, 2.8vw, 36px);
    --menu-link-gap: clamp(3.5rem, 5vw, 4.5rem);

    /* Global Fluid Edge for consistent horizontal alignment across all screens */
    --fluid-edge: clamp(3rem, 8vw, 8rem);
    /* Corner push for nav items */
    --nav-edge: clamp(1.5rem, 3vw, 2.5rem);
  }

  @media (max-width: 1200px) {
    :global(:root) {
      /* Balanced width for mid-size screens */
      --menu-width: 400px;
      --events-panel-width: clamp(30rem, 52vw, 38rem);
      --events-content-offset: clamp(2rem, 5vw, 3.25rem);
      --menu-link-size: clamp(27px, 2.8vw, 34px);
      --menu-link-gap: clamp(3.5rem, 4.5vw, 4rem);
    }
  }

  @media (max-width: 900px) {
    :global(:root) {
      /* Balanced width and percentage for tablet screens */
      --menu-width: clamp(320px, 48%, 400px);
      --events-panel-width: clamp(26rem, 64vw, 32rem);
      /* ให้ Gap หดตัวสัมพันธ์กับหน้าจอ Tablet */
      --menu-content-offset: clamp(3.5rem, 10vw, 6rem);
      --events-content-offset: clamp(1.75rem, 4vw, 2.75rem);
      /* Font ค่อยๆ หดตัวลง */
      --menu-link-size: clamp(26px, 3.5vw, 31px);
      --menu-link-gap: clamp(3rem, 4.5vw, 3.5rem);
    }
  }

  @media (max-width: 640px) {
    :global(:root) {
      /* Balanced width and percentage for mobile screens */
      --menu-width: clamp(250px, 78%, 320px);
      --events-panel-width: clamp(20rem, 90vw, 24rem);
      /* บนมือถือย่อให้น้อยลงนิดนึงเพื่อให้ยังเห็นเนื้อหาข้างใน */
      --menu-scale: 0.85;
      --events-panel-scale: 0.88;
      /* จูน Gap บนมือถือให้ชิดขึ้นแต่ไม่ทับขอบ */
      --menu-content-offset: clamp(2rem, 10vw, 3.5rem);
      --events-content-offset: clamp(1.25rem, 5vw, 1.75rem);
      --menu-link-size: 26px;
      --menu-link-gap: 3rem;
    }
  }

  :global(html),
  :global(body) {
    margin: 0;
    padding: 0;
    background: var(--color-bg);
  }

  .page-wrapper::-webkit-scrollbar {
    display: none;
  }

  .scroll-progress-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    z-index: 100;
    background: transparent;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .scroll-progress-container.visible {
    opacity: 1;
  }

  .scroll-progress-bar {
    width: 100%;
    height: 100%;
    background: var(--color-white);
    box-shadow: 0 0 12px rgba(var(--color-white-rgb), 0.4);
    border-radius: 0 2px 2px 0;
    transform-origin: 0% 50%; /* Scale from left edge */
    transform: scaleX(0); /* GPU Accelerated default state */
    will-change: transform;
  }

  .page-wrapper {
    position: fixed;
    inset: 0;
    z-index: 1;
    overflow-y: auto;
    overflow-x: hidden;
    background: var(--color-bg); /* Deeper background for better contrast */
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
    transform-origin: right center; /* Default for Right Menu */
    transition:
      transform var(--anim-layout-duration) var(--anim-layout-easing),
      border-radius var(--anim-layout-duration) var(--anim-layout-easing);
  }

  .page-wrapper.is-open {
    transform: translateX(calc(-1 * var(--menu-width))) scale(var(--menu-scale));
    border-radius: 0;
    border: none; /* Remove simple border for best practice lighting */
    pointer-events: none;
    overflow: hidden;
    /* Pearl Mist Lighting: Dynamic Top Light (Point 2) increased to 0.35 for better 'lift' */
    box-shadow:
      0 0 0 1px rgba(var(--color-text-rgb), 0.1),
      inset 0 2px 1.2px var(--color-pearl-glow),
      inset 0 -0.8px 0 rgba(var(--color-text-rgb), 0.05);
  }

  .page-wrapper.is-left-open {
    transform-origin: left center !important;
    transform: translateX(var(--events-panel-width))
      scale(var(--events-panel-scale));
    border-radius: 0;
    border: none;
    pointer-events: none;
    overflow: hidden;
    /* Pearl Mist Lighting: Dynamic Top Light (Point 2) increased to 0.35 for better 'lift' */
    box-shadow:
      0 0 0 1px rgba(var(--color-text-rgb), 0.1),
      inset 0 2px 1.2px var(--color-pearl-glow),
      inset 0 -0.8px 0 rgba(var(--color-text-rgb), 0.05);
  }

  .page-wrapper.is-open *,
  .page-wrapper.is-left-open * {
    pointer-events: none !important;
  }

  .page-wrapper.no-transition {
    transition: none !important;
  }

  .sticky-header-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 0;
    z-index: 10;
    pointer-events: none;
  }
  .site-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    pointer-events: auto;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    /* Pushed UP into the corner based on trends */
    padding: calc(1.5rem + env(safe-area-inset-top))
      calc(var(--nav-edge) + env(safe-area-inset-right)) 1.5rem
      calc(var(--nav-edge) + env(safe-area-inset-left));
    transition: opacity 0.4s ease;
  }
  .header-left {
    display: flex;
    justify-content: flex-start;
    /* Snappy Premium Recovery: Shorter duration (0.5s) + Overlap delay so it starts slightly before layout finishes */
    transition:
      transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)
        calc(var(--anim-layout-duration) - 0.15s),
      opacity 0.4s ease calc(var(--anim-layout-duration) - 0.15s);
  }
  .header-center {
    display: flex;
    justify-content: center;
  }
  .header-right {
    display: flex;
    justify-content: flex-end;
    /* Snappy Premium Recovery: Shorter duration (0.5s) + Overlap delay so it starts slightly before layout finishes */
    transition:
      transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)
        calc(var(--anim-layout-duration) - 0.15s),
      opacity 0.4s ease calc(var(--anim-layout-duration) - 0.15s);
  }

  /* --- NAV BUTTONS --- */
  .nav-btn {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 0.5rem;
    height: 44px;
    position: relative;
    z-index: 5;
    transition: opacity 0.3s ease;
  }

  .nav-btn:hover {
    opacity: 0.8;
  }

  .nav-lines {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 24px;
    position: relative;
  }

  .left-trigger .nav-lines {
    align-items: flex-start;
  }
  .right-trigger .nav-lines {
    align-items: flex-end;
  }

  .nav-lines .line {
    display: block;
    height: 1.5px;
    width: 100%;
    background: var(--color-text);
    border-radius: 1px;
    transition: box-shadow 0.3s ease;
    box-shadow: 0 0 8px rgba(var(--color-text-rgb), 0.2);
  }

  .nav-btn:hover .line {
    box-shadow: 0 0 12px rgba(var(--color-text-rgb), 0.5);
  }

  /* --- VERTICAL LABELS (Desktop Re-imagined) --- */
  .vertical-label-container {
    position: fixed;
    top: 50%;
    transform: translateY(-50%) translateZ(0);
    z-index: 20;
    pointer-events: none;
    /* Snappy Premium Recovery: Shorter duration (0.5s) + Overlap delay so it starts slightly before layout finishes */
    transition:
      opacity 0.4s ease calc(var(--anim-layout-duration) - 0.15s),
      transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)
        calc(var(--anim-layout-duration) - 0.15s);
    will-change: transform, opacity;
  }

  .vertical-label-container.left {
    left: 0.5rem;
  }
  .vertical-label-container.right {
    right: 0.5rem;
  }

  .v-label {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid rgba(var(--color-text-rgb), 0.1);
    /* Razor-thin rim highlight on the leading edge */
    box-shadow:
      inset 0 1px 1px rgba(var(--color-text-rgb), 0.05),
      0 10px 30px rgba(0, 0, 0, 0.5);
    width: 44px;
    height: 130px;
    padding: 0;
    cursor: pointer;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition:
      background 0.3s ease,
      border-color 0.3s ease;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }

  .v-label::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      180deg,
      transparent,
      rgba(var(--color-text-rgb), 0.06),
      transparent
    );
    transform: translateY(-100%);
    transition: transform 0.6s ease;
  }

  .v-label:hover::before {
    transform: translateY(100%);
  }

  .v-label:hover {
    background: rgba(var(--color-text-rgb), 0.08);
    border-color: rgba(var(--color-text-rgb), 0.3);
  }

  .v-label span {
    font-family: var(--font-primary);
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text);
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    display: block;
    text-align: center;
    opacity: 0.7;
    transition: opacity 0.3s ease;
  }

  .v-label:hover span {
    opacity: 1;
  }

  /* Persistent Labels (Option A) */
  .nav-text-persistent {
    font-family: var(--font-primary);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    color: var(--color-text);
    text-transform: uppercase;
    white-space: nowrap;
    opacity: 0.6;
    transition: opacity 0.3s ease;
  }

  .nav-btn:hover .nav-text-persistent {
    opacity: 1;
    text-shadow: 0 0 12px rgba(var(--color-text-rgb), 0.3);
  }

  /* Slide labels/sidebars out of screen when panels are open */
  .layout-shell.is-open .vertical-label-container.left,
  .layout-shell.is-left-open .vertical-label-container.left {
    transform: translateY(-50%) translateX(-80px) scale(0.9);
    opacity: 0;
    pointer-events: none;
    /* Awwwards Whiplash Exit: Fast Quart-In-Out */
    transition:
      opacity 0.3s ease 0s,
      transform 0.45s cubic-bezier(0.85, 0, 0.15, 1) 0s;
  }

  .layout-shell.is-open .vertical-label-container.right,
  .layout-shell.is-left-open .vertical-label-container.right {
    transform: translateY(-50%) translateX(80px) scale(0.9);
    opacity: 0;
    pointer-events: none;
    /* Awwwards Whiplash Exit: Fast Quart-In-Out */
    transition:
      opacity 0.3s ease 0s,
      transform 0.45s cubic-bezier(0.85, 0, 0.15, 1) 0s;
  }

  /* Slide mobile header triggers out */
  .layout-shell.is-open .site-header .header-left,
  .layout-shell.is-left-open .site-header .header-left {
    transform: translateX(-40px) scale(0.95);
    opacity: 0;
    pointer-events: none;
    /* Awwwards Whiplash Exit: Fast Quart-In-Out */
    transition:
      opacity 0.3s ease 0s,
      transform 0.4s cubic-bezier(0.85, 0, 0.15, 1) 0s;
  }

  .layout-shell.is-open .site-header .header-right,
  .layout-shell.is-left-open .site-header .header-right {
    transform: translateX(40px) scale(0.95);
    opacity: 0;
    pointer-events: none;
    /* Awwwards Whiplash Exit: Fast Quart-In-Out */
    transition:
      opacity 0.3s ease 0s,
      transform 0.4s cubic-bezier(0.85, 0, 0.15, 1) 0s;
  }

  /* Still ensure the container wrapper stops pointer events to be safe */
  .layout-shell.is-open .site-header,
  .layout-shell.is-left-open .site-header {
    pointer-events: none;
  }

  /* ===== MOBILE BREAKPOINTS ===== */
  @media (max-width: 1024px) {
    .site-header {
      padding: calc(1.25rem + env(safe-area-inset-top))
        calc(1.5rem + env(safe-area-inset-right)) 1.25rem
        calc(1.5rem + env(safe-area-inset-left));
    }

    .nav-btn {
      gap: 10px;
    }

    .nav-text-persistent {
      font-size: 0.65rem;
      letter-spacing: 0.1em;
    }
  }

  /* --- HYBRID NAVIGATION RESPONSIVENESS --- */
  .layout-shell .desktop-only {
    display: block;
  }
  .layout-shell .mobile-only {
    display: none;
  }

  @media (max-width: 1024px) {
    .layout-shell .desktop-only {
      display: none;
    }
    .layout-shell .mobile-only {
      display: flex;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    /* Return: gentle fade-in — no transform, just opacity */
    .header-left,
    .header-right {
      transition: opacity 0.35s ease;
    }

    /* Exit: fast decisive fade-out when panel opens */
    .layout-shell.is-open .site-header .header-left,
    .layout-shell.is-left-open .site-header .header-left,
    .layout-shell.is-open .site-header .header-right,
    .layout-shell.is-left-open .site-header .header-right {
      transition: opacity 0.2s ease;
      transform: none;
    }

    /* Vertical labels: remove GPU hints and backdrop-filter */
    .vertical-label-container {
      will-change: auto;
      transition: opacity 0.35s ease;
    }

    /* Exit for vertical labels */
    .layout-shell.is-open .vertical-label-container,
    .layout-shell.is-left-open .vertical-label-container {
      transition: opacity 0.2s ease;
      transform: translateY(-50%);
    }

    .v-label {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      background: rgba(0, 0, 0, 0.85);
    }

    /* Page wrapper: shorter transition */
    .page-wrapper {
      transition-duration: 0.2s;
    }

    /* Scroll progress bar */
    .scroll-progress-bar {
      will-change: auto;
    }
  }
</style>
