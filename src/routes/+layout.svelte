<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import { onMount, onDestroy } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/stores";
  import { fade } from "svelte/transition";
  import type Lenis from "lenis";
  import Menu from "$lib/components/Menu.svelte";
  import EventsPanel from "$lib/components/EventsPanel.svelte";
  import { menuOpen, leftMenuOpen } from "$lib/stores/menu";
  import { i18n } from "$lib/i18n.svelte";

  let { children } = $props();
  let lenis: Lenis | undefined = $state();

  function openMenu() {
    menuOpen.set(true);
    lenis?.stop();
  }

  function openLeftMenu() {
    leftMenuOpen.set(true);
    lenis?.stop();
  }

  let showScrollbar = $state(false);
  let scrollTimeout: ReturnType<typeof setTimeout>;

  let isResizing = $state(false);
  let resizeTimeout: ReturnType<typeof setTimeout>;

  function handleResize() {
    if (!$menuOpen && !$leftMenuOpen) return;
    isResizing = true;
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      isResizing = false;
    }, 150);
  }

  onMount(async () => {
    // Lock Pinch-to-Zoom อย่างเด็ดขาดตามการตัดสินใจ
    document.addEventListener(
      "wheel",
      (e) => {
        if (e.ctrlKey) {
          e.preventDefault();
        }
      },
      { passive: false },
    );

    window.addEventListener("resize", handleResize);

    const LenisLib = (await import("lenis")).default;
    lenis = new LenisLib({
      wrapper: document.querySelector(".page-wrapper") as HTMLElement,
      content: document.querySelector(".page-wrapper") as HTMLElement,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis?.raf(time);
      requestAnimationFrame(raf);
    }

    lenis.on("scroll", (e: any) => {
      const progressBar = document.querySelector(
        ".scroll-progress-bar",
      ) as HTMLElement | null;
      if (progressBar && e.limit > 0) {
        // Use Math.min/max to clamp perfectly from 0.0 to 1.0 (eliminates 99.6 hack)
        const progress = Math.min(1, Math.max(0, e.scroll / e.limit));
        // Use GPU-accelerated standard scaleX instead of layout-breaking width%
        progressBar.style.transform = `scaleX(${progress})`;
      }

      showScrollbar = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        showScrollbar = false;
      }, 3000);
    });

    requestAnimationFrame(raf);
  });

  afterNavigate(() => {
    lenis?.scrollTo(0, { immediate: true });
    menuOpen.set(false);
    leftMenuOpen.set(false);
    lenis?.start();
  });

  onDestroy(() => {
    lenis?.destroy();
    clearTimeout(scrollTimeout);
    clearTimeout(resizeTimeout);
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handleResize);
    }
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<Menu {lenis} />

<EventsPanel {lenis} />

<!-- Scroll Progress Bar -->
<div class="scroll-progress-container" class:visible={showScrollbar}>
  <div class="scroll-progress-bar"></div>
</div>

<div
  class="page-wrapper"
  class:is-open={$menuOpen}
  class:is-left-open={$leftMenuOpen}
  class:no-transition={isResizing}
>
  <div class="sticky-header-wrapper">
    <header class="site-header">
      <!-- TOP LEFT (Grid column preserved) -->
      <div class="header-left">
        <button class="nav-btn left-trigger mobile-only" onclick={openLeftMenu} aria-label="Open events">
          <div class="nav-lines events-icon">
            <span class="line top-line"></span>
            <span class="line bot-line"></span>
          </div>
          <span class="nav-text-persistent">{i18n.t('nav_events')}</span>
        </button>
      </div>

      <!-- CENTER SIDE (All screens) -->
      <div class="header-center">
          <div class="lang-text-switcher">
            <button 
              class:active={i18n.currentLocale === 'en'} 
              onclick={() => i18n.setLocale('en')}
            >ENG</button>
            <button 
              class:active={i18n.currentLocale === 'th'} 
              onclick={() => i18n.setLocale('th')}
            >THA</button>
            <button 
              class:active={i18n.currentLocale === 'tw'} 
              onclick={() => i18n.setLocale('tw')}
            >TWN</button>
          </div>
      </div>

      <!-- TOP RIGHT (Grid column preserved) -->
      <div class="header-right">
          <button class="nav-btn right-trigger mobile-only" onclick={openMenu} aria-label="Open menu">
            <span class="nav-text-persistent">{i18n.t('nav_menu')}</span>
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
    <button class="v-label" onclick={openLeftMenu}>
      <span>{i18n.t('nav_events')}</span>
    </button>
  </div>

  <div class="vertical-label-container right desktop-only">
    <button class="v-label" onclick={openMenu}>
      <span>{i18n.t('nav_menu')}</span>
    </button>
  </div>

  {#key $page.url.pathname}
    <div
      in:fade={{ duration: 400, delay: 400 }}
      out:fade={{ duration: 400 }}
      style="display: contents"
    >
      {@render children()}
    </div>
  {/key}
</div>

<style>
  :global(:root) {
    /* เพิ่มหน้ากว้างเมนูเพื่อให้ตัวเว็บถูกดันไปทางซ้ายมากขึ้น */
    --menu-width: 40%;
    /* ฝั่ง events แยก token อิสระจากเมนูขวา */
    --events-panel-width: clamp(34rem, 48vw, 42rem);
    /* ระดับการย่อของตัวเว็บ (Scale) */
    --menu-scale: 0.8;
    --events-panel-scale: 0.8;
    /* Content offset inside the menu panel follows viewport size smoothly. */
    --menu-content-offset: clamp(2rem, 8%, 8rem);
    --events-content-offset: clamp(2.5rem, 5vw, 4rem);
    --menu-link-size: 32px;
    --menu-link-gap: 2rem;
    
    /* Global Fluid Edge for consistent horizontal alignment across all screens */
    --fluid-edge: clamp(3rem, 8vw, 8rem);
    /* Corner push for nav items */
    --nav-edge: clamp(1.5rem, 3vw, 2.5rem);
  }

  @media (max-width: 1200px) {
    :global(:root) {
      /* ปรับระยะให้ขยับไปซ้ายเพิ่มขึ้นในจอขนาดกลาง */
      --menu-width: 460px;
      --events-panel-width: clamp(30rem, 52vw, 38rem);
      --events-content-offset: clamp(2rem, 5vw, 3.25rem);
    }
  }

  @media (max-width: 900px) {
    :global(:root) {
      /* ปรับให้ค่าที่ 640px จบที่ 340px พอดีกับ Stage ถัดไป */
      --menu-width: clamp(340px, 52%, 460px);
      --events-panel-width: clamp(26rem, 64vw, 32rem);
      /* ดันเนื้อหาออกไปให้กว้างขึ้นอีก และจบที่ ~4rem ที่ขอบ 640px */
      --menu-content-offset: clamp(4rem, 12%, 6rem);
      --events-content-offset: clamp(1.75rem, 4vw, 2.75rem);
      /* ปรับให้ค่าที่ 640px จบที่ 26px พอดี */
      --menu-link-size: clamp(26px, 3.35%, 30px);
      /* ปรับให้ค่าที่ 640px จบที่ 1.8rem พอดี */
      --menu-link-gap: clamp(1.8rem, 3.2%, 1.95rem);
    }
  }

  @media (max-width: 640px) {
    :global(:root) {
      /* ปล่อยให้มันยืดหยุ่นได้มากขึ้น ไม่ไป Lock ขั้นต่ำไว้สูงเกินไป (จาก 285px เหลือ 70%) */
      --menu-width: clamp(240px, 75%, 340px);
      --events-panel-width: clamp(20rem, 90vw, 24rem);
      /* บนมือถือย่อให้น้อยลงนิดนึงเพื่อให้ยังเห็นเนื้อหาข้างใน */
      --menu-scale: 0.85;
      --events-panel-scale: 0.88;
      /* ขยาย Gap ให้กว้างขึ้นตามคำขอครับ */
      --menu-content-offset: clamp(2.5rem, 15vw, 4rem);
      --events-content-offset: clamp(1.25rem, 5vw, 1.75rem);
      --menu-link-size: 26px;
      --menu-link-gap: 1.8rem;
    }
  }

  :global(html),
  :global(body) {
    margin: 0;
    padding: 0;
    background: #111111;
    overflow: hidden;
    overscroll-behavior: none; /* สกัดบั๊กหน้าต่างกระเด้ง(Bounce) และ Trackpad Jitter บน Mac/Windows */
    touch-action: pan-y; /* สกัดการทำงานของ Pinch-to-zoom ระดับ CSS */
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
    background: #ffffff;
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
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
    background: #111111; /* เติมสีพื้นหลังเพื่อกลบเส้นขอบที่อาจเกิดจากการย่อส่วน */
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
    transform-origin: right center; /* Default for Right Menu */
    transition:
      transform 0.6s cubic-bezier(0.22, 1, 0.36, 1),
      border-radius 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .page-wrapper.is-open {
    transform-origin: right center !important;
    transform: translateX(calc(-1 * var(--menu-width))) scale(var(--menu-scale));
    border-radius: clamp(12px, 2vw, 24px);
    pointer-events: none;
    overflow: hidden;
  }

  .page-wrapper.is-left-open {
    transform-origin: left center !important;
    transform: translateX(var(--events-panel-width)) scale(var(--events-panel-scale));
    border-radius: clamp(12px, 2vw, 24px);
    pointer-events: none;
    overflow: hidden;
  }

  .page-wrapper.is-open *, 
  .page-wrapper.is-left-open * {
    pointer-events: none !important;
  }

  .page-wrapper.no-transition {
    transition: none !important;
  }

  .sticky-header-wrapper {
    position: sticky;
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
    padding: 1.5rem var(--nav-edge);
    transition: opacity 0.4s ease;
  }
  .header-left {
    display: flex;
    justify-content: flex-start;
  }
  .header-center {
    display: flex;
    justify-content: center;
  }
  .header-right {
    display: flex;
    justify-content: flex-end;
  }

  /* --- LANGUAGE SWITCHER RE-DESIGN (Quiet Luxury) --- */
  .lang-text-switcher {
    display: flex;
    align-items: center;
    gap: clamp(1rem, 3vw, 2rem);
  }

  .lang-text-switcher button {
    font-family: var(--font-primary);
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(240, 238, 233, 0.3);
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: color 0.4s ease, opacity 0.4s ease;
    position: relative;
  }

  .lang-text-switcher button:hover {
    color: rgba(240, 238, 233, 0.8);
  }

  .lang-text-switcher button.active {
    color: #f0eee9;
  }

  /* Microscopic indicator dot */
  .lang-text-switcher button::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%) scale(0);
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: #f0eee9;
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.4, 1);
  }

  .lang-text-switcher button.active::after {
    transform: translateX(-50%) scale(1);
  }

  /* --- NAV BUTTONS --- */
  .nav-btn {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0;
    height: 32px; /* Desktop height */
    position: relative;
    z-index: 5;
  }

  @media (max-width: 1023px) {
    .nav-btn {
      height: 44px; /* Mobile height */
      gap: 10px;
    }
  }

  .nav-lines {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 40px;
  }

  .left-trigger .nav-lines {
    align-items: flex-start;
  }

  .right-trigger .nav-lines {
    align-items: flex-end;
  }

  .nav-lines .line {
    display: block;
    height: 2px;
    background: rgba(240, 238, 233, 0.8);
    border-radius: 2px;
    transition: 
      width 0.4s cubic-bezier(0.25, 1, 0.3, 1), 
      transform 0.4s cubic-bezier(0.25, 1, 0.3, 1), 
      background 0.3s ease,
      box-shadow 0.3s ease;
  }

  .nav-lines .top-line { width: 32px; }
  .nav-lines .bot-line { width: 18px; }

  /* --- VERTICAL LABELS (Desktop) --- */
  .vertical-label-container {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    z-index: 5;
    pointer-events: none;
    transition: opacity 0.4s ease;
  }

  .vertical-label-container.left {
    left: 0;
  }

  .vertical-label-container.right {
    right: 0;
  }

  .v-label {
    background: #f0eee9;
    border: none;
    width: 40px;
    height: 130px;
    padding: 0;
    cursor: pointer;
    pointer-events: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.3, 1), background 0.4s ease;
  }

  .v-label span {
    font-family: "Clash Display", var(--font-primary);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #111111;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    display: block;
    text-align: center;
  }


  /* Persistent Labels (Option A) */
  .nav-text-persistent {
    font-family: var(--font-primary);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.18em;
    color: rgba(240, 238, 233, 1);
    text-transform: uppercase;
    white-space: nowrap;
    opacity: 0.45;
    transition: opacity 0.3s ease, letter-spacing 0.3s ease;
  }
  
  .nav-btn:hover .nav-text-persistent {
    opacity: 1;
  }

  /* Hide labels/sidebars when panels are open */
  :global(.is-open) .vertical-label-container,
  :global(.is-left-open) .vertical-label-container,
  :global(.is-open) .site-header,
  :global(.is-left-open) .site-header {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  /* ===== MOBILE BREAKPOINTS ===== */
  @media (max-width: 768px) {
    .site-header {
      padding: 1.25rem 1.5rem;
    }
    
    .nav-btn {
      gap: 10px;
    }

    .nav-text-persistent {
      font-size: 9px;
      letter-spacing: 0.1em;
    }
  }

  /* --- HYBRID NAVIGATION RESPONSIVENESS (Forced overriders) --- */
  .desktop-only {
    display: block !important;
  }
  .mobile-only {
    display: none !important;
  }

  @media (max-width: 1023px) {
    .desktop-only { display: none !important; }
    .mobile-only { display: flex !important; }
  }
</style>

