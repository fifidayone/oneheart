<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { expoOut } from "svelte/easing";
  import { i18n } from "$lib/i18n.svelte";

  let videoReady = $state(false);
  let videoEl: HTMLVideoElement | undefined = $state();

  // Hero Toast Premium State
  let showToast = $state(true);
  let autoCollapseTimeout: ReturnType<typeof setTimeout>;

  function startAutoCollapse() {
    clearTimeout(autoCollapseTimeout);
    autoCollapseTimeout = setTimeout(() => {
      showToast = false;
    }, 15000); // 15 seconds ephemeral line
  }

  function pauseAutoCollapse() {
    clearTimeout(autoCollapseTimeout);
  }

  function resumeAutoCollapse() {
    if (showToast) {
      // Re-start from 15 seconds minus however long they looked at it?
      // For simplicity and better UX, just reset the 15s timer when they leave
      startAutoCollapse();
    }
  }

  // ควบคุมการย่อข้อความ Hero text ตามการ Scroll หน้าจอ
  let scrollY = $state(0);
  let textScale = $derived(Math.max(0.65, 1 - scrollY / 1300));
  // ให้ text ตามลงมา 35% ของระยะดึง เพื่อหน่วงดูมีมิติลูกเล่น แต่จำกัดห้ามเกิน 130px เด็ดขาดเพื่อไม่ให้ตกไปขอบล่าง
  let textTranslateY = $derived(Math.min(scrollY * 0.35, 130));

  let storyEl: HTMLElement | undefined = $state();
  let storyPinEl: HTMLElement | undefined = $state();

  // Slideshow state
  const PHOTOS = [
    "/typo/1.avif",
    "/typo/2.avif",
    "/typo/3.avif",
    "/typo/4.avif",
    "/typo/5.avif",
  ];
  let activePhoto = $state(0);

  onMount(() => {
    const cleanup: Array<() => void> = [];

    // 🛠️ FIX: SvelteKit layout uses Lenis custom wrapper, not window.scrollY
    const wrapper = document.querySelector(".page-wrapper");
    if (wrapper) {
      let ticking = false;
      scrollY = wrapper.scrollTop;

      // Cache layout metrics to prevent layout thrashing inside scroll loop!
      let pinTop = 0;
      let pinScrollRange = 0;

      function calculateMetrics() {
        if (!storyPinEl) return;
        pinTop = storyPinEl.offsetTop;
        pinScrollRange = storyPinEl.offsetHeight - window.innerHeight;
      }

      // Calculate once then watch for resize
      calculateMetrics();
      window.addEventListener("resize", calculateMetrics);
      cleanup.push(() => window.removeEventListener("resize", calculateMetrics));

      function updateSlide(currentScrollTop: number) {
        if (!storyPinEl || pinScrollRange <= 0) return;

        const scrollIntoPin = currentScrollTop - pinTop;
        const progress = Math.min(
          1,
          Math.max(0, scrollIntoPin / pinScrollRange),
        );
        const newIndex = Math.min(
          PHOTOS.length - 1,
          Math.floor(progress * PHOTOS.length),
        );

        if (newIndex !== activePhoto) {
          activePhoto = newIndex;
        }
      }

      // Single, hyper-optimized scroll listener
      const handleWrapperScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const currentScrollTop = wrapper.scrollTop;
            scrollY = currentScrollTop; // Update global hero scale
            updateSlide(currentScrollTop); // Update local slideshow
            ticking = false;
          });
          ticking = true;
        }
      };

      wrapper.addEventListener("scroll", handleWrapperScroll, { passive: true });
      cleanup.push(() => wrapper.removeEventListener("scroll", handleWrapperScroll));
    }

    // Scroll Reveal Observer for Typography Section
    if (storyEl) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            storyEl!.classList.add("revealed");
            observer.disconnect();
          }
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
      );
      observer.observe(storyEl);
      cleanup.push(() => observer.disconnect());
    }

    // 🛠️ FIX: Check if video is already loaded (race condition fix)
    if (videoEl && (videoEl.readyState >= 3 && videoEl.paused === false)) {
      videoReady = true;
    }

    // 🚀 IMPROVED iOS HANDLING: Attempt to play again on first interaction if blocked
    const handleFirstInteraction = () => {
      if (videoEl && videoEl.paused) {
        videoEl.play().catch(() => {});
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);
    cleanup.push(() => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    });

    // Start ephemeral progress line for the Hero Toast
    startAutoCollapse();

    return () => {
      clearTimeout(autoCollapseTimeout);
      for (const dispose of cleanup) {
        dispose();
      }
    };
  });
</script>

<div class="home">
  <!-- Video Background -->
  <div class="video-background">
    <!-- Poster Image Layer (High-end immediate visual) -->
    <img 
      src="/hero/hero-poster.avif" 
      alt="" 
      class="hero-poster" 
      class:hidden={videoReady}
    />
    
    <video
      bind:this={videoEl}
      poster="/hero/hero-poster.avif?v=3"
      autoplay
      muted
      loop
      playsinline
      preload="auto"
      disablepictureinpicture
      disableremoteplayback
      onplaying={() => (videoReady = true)}
      class="hero-video"
      class:ready={videoReady}
    >
      <!-- Standard H.264 (AVC) Source - Universal compatibility -->
      <source src="/hero/hero-video.mp4?v=3" type="video/mp4">
      
      Your browser does not support the video tag.
    </video>
  </div>

  <!-- Dark & Grain Overlay -->
  <div class="overlay"></div>
  <!-- Center Screen Content -->
  <div
    class="center-content"
    style:transform="translateY({textTranslateY}px) scale({textScale})"
  >
    <p class="top-label">Power As One</p>
    <h1>ONE HEART<br />PRODUCTIONS</h1>
  </div>

  <!-- Featured Event Toast -->
  {#if showToast}
  <div class="featured-toast"
       role="region"
       aria-label="Featured Event"
       in:fly={{ y: 20, duration: 800, easing: expoOut, delay: 1500 }}
       out:fly={{ y: 20, duration: 400, opacity: 0, easing: expoOut }}
       onmouseenter={pauseAutoCollapse}
       onmouseleave={resumeAutoCollapse}>
    <div class="toast-glass">
      <button class="toast-quiet-close" onclick={() => { showToast = false; clearTimeout(autoCollapseTimeout); }} aria-label="Dismiss featured event: GAWDLAND Down Under">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="toast-img-wrapper">
        <img src="/hero/gawdland.avif" alt="Featured Event" class="toast-img" />
      </div>
      <div class="toast-info">
        <span class="toast-eyebrow">UPCOMING SHOW</span>
        <div class="toast-title-wrapper" data-full-title="GAWDLAND Down Under">
          <h3 class="toast-title">GAWDLAND Down Under</h3>
        </div>
        <span class="toast-meta">Thu, Jun 04 &bull; Melbourne</span>
      </div>
      <a href="/upcoming" class="toast-btn" aria-label="View details for GAWDLAND Down Under">
        DISCOVER
      </a>
      <!-- Ephemeral Progress Line -->
      <div class="toast-progress-bar">
        <div class="toast-progress-fill"></div>
      </div>
    </div>
  </div>
  {/if}
</div>

<!-- Sponsor/Client Marquee Section -->
<section class="clients-section">
  <div class="clients-grid">
    <!-- Left Column: Title -->
    <div class="clients-header-col">
      <div class="glow-dot"></div>
      <span class="clients-label">{i18n.t("home_marquee")}</span>
    </div>

    <!-- Right Column: Marquee -->
    <div class="marquee-col">
      <div class="marquee-container">
        <div class="marquee-content">
          {#each [1, 2] as _}
            <div class="logo-group">
              <!-- Text-based placeholders representing logos -->
              <div class="brand">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  ><path
                    d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
                  /></svg
                >
                <span>DISCORD</span>
              </div>
              <div class="brand">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  ><path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  /></svg
                >
                <span>GOOGLE</span>
              </div>
              <div class="brand">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  ><path
                    d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.36-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.239.54-.959.72-1.56.3z"
                  /></svg
                >
                <span>SPOTIFY</span>
              </div>
              <div class="brand">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  ><path
                    d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.484-4.665 2.597-4.735-1.44-2.067-3.666-2.316-4.475-2.388-1.922-.169-3.765 1.28-4.525 1.28zm2.443-3.61c.642-.779 1.054-1.84 1.013-2.915-1.012.046-2.107.561-2.736 1.332-.572.636-1.054 1.697-.948 2.768 1.11.084 2.04-.545 2.671-1.185z"
                  /></svg
                >
                <span>APPLE</span>
              </div>
              <div class="brand">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  ><path
                    d="M11.965 2v19.467c0 .292-.258.533-.554.533H2.034C.913 22 0 21.1 0 19.99V4.01C0 2.9.913 2 2.034 2h9.931zm10.001 0v19.467c0 .292-.257.533-.554.533h-9.378c-1.121 0-2.034-.9-2.034-2.01V4.01c0-1.11.913-2.01 2.034-2.01h9.378c.297 0 .554.241.554.533zM18.89 15.688l-3.33-4.596 3.195-4.408h-2.146l-2.01 3.01c-.131.21-.242.42-.333.64h-.05c-.08-.22-.19-.43-.322-.64l-1.97-3.01h-2.04l3.125 4.308-3.235 4.696h2.156l2.193-3.3c.121-.19.222-.4.302-.59h.04c.08.19.182.4.312.59l2.253 3.3h2.062z"
                  /></svg
                >
                <span>NETFLIX</span>
              </div>
              <div class="brand">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  ><path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.32 14.5l-4.14-2.45V8h1.5v5.2l3.41 2.06-.77 1.24z"
                  /></svg
                >
                <span>TIKTOK</span>
              </div>
              <div class="brand">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  ><path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 12c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4zm8 0c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4zm8 0c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z"
                  /></svg
                >
                <span>META</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ===== STORY / TYPOGRAPHY NARRATIVE SECTION ===== -->
<!-- Outer scroll-pin wrapper: tall enough for all 5 images -->
<div class="story-pin-outer" bind:this={storyPinEl}>
  <section class="story-section">
    <!-- Animated Background Elements -->
    <div class="ambient-glow"></div>
    <div class="dot-pattern-bg"></div>

    <div class="story-container">
      <!-- LEFT: Typography -->
      <div
        class="typo-narrative"
        bind:this={storyEl}
        data-lang={i18n.currentLocale}
      >
        {#each i18n.t("story_words") as word, i}
          <span class="word" style="transition-delay: {0.05 + i * 0.04}s"
            >{word}</span
          >
        {/each}
        <span
          class="word highlight aurora-text"
          style="transition-delay: {0.05 +
            i18n.t('story_words').length * 0.04}s"
        >
          {i18n.t("story_highlight")}
        </span>
      </div>

      <!-- RIGHT: Premium Scroll-locked Photo Canvas -->
      <div class="photo-canvas">
        <!-- Grain overlay for premium dark-luxe texture -->
        <div class="canvas-grain"></div>
        <!-- Corner accents -->
        <div class="canvas-corner tl"></div>
        <div class="canvas-corner tr"></div>
        <div class="canvas-corner bl"></div>
        <div class="canvas-corner br"></div>
        <!-- Frame label -->
        <div class="canvas-label">
          <span class="canvas-index"
            >{String(activePhoto + 1).padStart(2, "0")}</span
          >
          <span class="canvas-sep">—</span>
          <span class="canvas-total"
            >{String(PHOTOS.length).padStart(2, "0")}</span
          >
        </div>
        <!-- Images -->
        <div class="canvas-images">
          {#each PHOTOS as src, i}
            <img
              class="canvas-img"
              class:active={i === activePhoto}
              class:prev={i < activePhoto}
              class:next={i > activePhoto}
              {src}
              alt="One Heart Productions – visual {i + 1}"
              loading={i === 0 ? "eager" : "lazy"}
            />
          {/each}
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  @keyframes revealUp {
    0% {
      transform: translateY(40px);
      opacity: 0;
      filter: blur(8px);
    }
    100% {
      transform: translateY(0);
      opacity: 1;
      filter: blur(0);
    }
  }

  @keyframes dotPulse {
    0%,
    100% {
      opacity: 0.3;
      transform: scale(0.8);
      box-shadow: 0 0 0 rgba(var(--color-text-rgb), 0);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
      box-shadow: 0 0 8px rgba(var(--color-text-rgb), 0.8); /* เงามนๆ หรูๆ */
    }
  }

  @keyframes pulseNeon {
    0%,
    100% {
      opacity: 0.8;
    }
    50% {
      opacity: 1;
      text-shadow: 0 0 20px rgba(var(--color-text-rgb), 0.2);
    }
  }

  .home {
    min-height: 100vh;
    width: 100%;
    background: var(--color-bg-alt);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  /* Video Background Setup */
  .video-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;
    transition: opacity 0.5s ease;
    pointer-events: none; /* บล็อกคำสั่งจาก Trackpad ทุกชนิดไม่ให้ทะลุไปรบกวน Video Player */
  }

  .video-background video,
  .hero-video,
  .hero-poster {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    transform: translate(-50%, -50%);
    pointer-events: none;
    will-change: opacity, filter;
  }

  .hero-poster {
    z-index: 1;
    opacity: 1;
    filter: brightness(0.6) contrast(1.1); /* Match the video's dark luxe feel */
    transition: opacity 2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .hero-poster.hidden {
    opacity: 0;
  }

  .hero-video {
    z-index: 2;
    opacity: 0;
    filter: brightness(0.8) contrast(1.1);
    transition:
      opacity 2.5s cubic-bezier(0.16, 1, 0.3, 1),
      filter 2.5s ease;
  }

  .hero-video.ready {
    opacity: 1;
    filter: brightness(0.7) contrast(1.15); /* Significantly darker for luxury feel */
  }

  /* Overlay: ฟิลเตอร์จางดำ + Grain Effect */
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle at center,
      rgba(10, 10, 11, 0.4) 0%,
      rgba(10, 10, 11, 0.92) 100%
    );
    z-index: 1;
    pointer-events: none;
  }

  .center-content {
    position: relative;
    z-index: 2; /* ให้อยู่เหนือวีดีโอและฟิลเตอร์ */
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    will-change: transform;
  }

  .top-label {
    font-family: var(--font-primary);
    font-size: clamp(1.1rem, 1.8vw, 1.5rem); /* ใหญ่ขึ้นนิดนึงดูมีน้ำหนัก */
    font-weight: 500; /* เปลี่ยนจาก 300 เป็น 500 เพื่อความชัดเจน */
    letter-spacing: 0.4em; /* ช่องไฟกว้างขึ้นอีกนิดเพื่อให้ดูแกรนด์ */
    text-transform: uppercase;
    color: rgba(var(--color-text-rgb), 0.95);
    text-shadow: 0 0 30px rgba(var(--color-text-rgb), 0.15);
    margin: 0 0 1.5rem;
    display: inline-block;
    white-space: nowrap;
    opacity: 0;
    animation: revealUp 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: 0.1s;
    will-change: transform, opacity, filter;
  }

  h1 {
    font-family: var(--font-primary);
    font-size: clamp(2.5rem, 7.5vw, 8rem);
    font-weight: 700;
    letter-spacing: 0.03em;
    line-height: 0.95;
    color: var(--color-text);
    text-shadow: 0 0 40px rgba(var(--color-text-rgb), 0.2);
    margin: 0;
    text-transform: uppercase;
    opacity: 0;
    animation: revealUp 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: 0.3s;
    will-change: transform, opacity, filter;
  }

  /* ===== CLIENTS MARQUEE SECTION (EDITORIAL SPLIT) ===== */
  .clients-section {
    position: relative;
    z-index: 2;
    background: var(--color-bg-panel); /* Premium Deep Dark Luxe */
    border-top: 1px solid rgba(var(--color-text-rgb), 0.06); /* เส้นขอบบางเฉียบ หรูหรา */
    border-bottom: 1px solid rgba(var(--color-text-rgb), 0.06);
  }

  .clients-grid {
    display: grid;
    /* Use max-content instead of strict px clamp so long text like Thai won't cluster/wrap */
    grid-template-columns: max-content 1fr;
    width: 100%;
    min-height: 60px; /* แคบลง ดูเป็น Ticker Tape ทรงเพรียว */
  }

  .clients-header-col {
    display: flex;
    align-items: center;
    /* Adjust padding closer to left edge and right border */
    padding: 0.6rem 1.5rem 0.6rem clamp(1.25rem, 3vw, var(--fluid-edge)); 
    border-right: 1px solid rgba(var(--color-text-rgb), 0.06);
    gap: 0.75rem;
  }

  .marquee-col {
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
  }

  .glow-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--color-text); /* คืนความหรูหราด้วยสีขาวแพงๆ */
    animation: dotPulse 1.2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
    flex-shrink: 0;
  }

  .clients-label {
    font-family: var(--font-primary);
    font-size: clamp(0.65rem, 0.8vw, 0.75rem); /* เล็กลง คมขึ้น */
    letter-spacing: 0.25em; /* ลด letter-spacing ลงนิดนึงไม่ให้กระจุกเกินไป */
    text-transform: uppercase;
    font-weight: 500;
    color: rgba(var(--color-text-rgb), 0.6); /* กลับมาใช้สีเทาแพงๆ ตัดกับพื้นดำ */
    line-height: 1.4;
    white-space: nowrap; /* ห้ามตกบรรทัดเด็ดขาด */
  }

  .marquee-container {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    /* Apply fade strictly inside the right column */
    mask-image: linear-gradient(
      to right,
      transparent,
      rgba(var(--color-bg-rgb), 1) 15%,
      rgba(var(--color-bg-rgb), 1) 85%,
      transparent
    );
    -webkit-mask-image: linear-gradient(
      to right,
      transparent,
      rgba(var(--color-bg-rgb), 1) 15%,
      rgba(var(--color-bg-rgb), 1) 85%,
      transparent
    );
  }

  .marquee-content {
    display: flex;
    width: max-content;
    animation: marquee 16s linear infinite; /* Adjusted for oversized elements */
    will-change: transform;
  }

  .logo-group {
    display: flex;
    align-items: center;
    gap: 5vw;
    padding-right: 5vw; /* Equal to gap to maintain identical distance seamlessly */
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.6rem; /* กระชับขึ้น */
    color: rgba(var(--color-text-rgb), 0.25); /* สีเทาเงิน เรียบหรูตอนยังไม่ Hover */
    transition:
      color 0.4s cubic-bezier(0.32, 0, 0.15, 1),
      transform 0.4s cubic-bezier(0.32, 0, 0.15, 1),
      filter 0.4s ease;
    cursor: default;
    filter: grayscale(100%);
    will-change: transform, color, filter;
  }

  /* Hover state: คืนค่าสีเดิมของแบรนด์และเด้งขึ้นเบาๆ */
  .brand:hover {
    color: var(--color-white); /* ขาวสว่างจ้า High Energy */
    filter: grayscale(0%) drop-shadow(0 0 12px rgba(var(--color-white-rgb), 0.3));
    transform: scale(1.05) translateY(-2px); /* เด้งคมๆ พอดีงาม */
  }

  .brand svg {
    width: clamp(16px, 1.6vw, 22px); /* เล็กลง เพรียวบาง หรูหรา */
    height: clamp(16px, 1.6vw, 22px);
    transition: filter 0.5s ease;
  }

  .brand span {
    font-family: var(--font-primary);
    font-size: clamp(0.85rem, 1vw, 1.1rem); /* เล็กลงเฉียบๆ */
    font-weight: 600;
    letter-spacing: 0.2em; /* ถ่างช่องกว้างนิดๆ ให้ดูมีคลาส */
    text-transform: uppercase;
  }

  .brand:hover span {
    /* เอา Hollow Text ออก */
    color: var(--color-white);
    -webkit-text-stroke: 0;
    text-shadow: none;
  }

  @keyframes marquee {
    to {
      /* Since there are two identical .logo-group children, scrolling by 50% shifts exactly one full set */
      transform: translateX(-50%);
    }
  }

  /* ===== STORY SCROLL-PIN OUTER ===== */
  .story-pin-outer {
    /* 400vh = 100vh sticky viewport + 300vh of scroll. 
       This gives exactly 60vh per photo—the 'Golden Ratio' for cinematic editorial feel. */
    height: 400vh;
    position: relative;
  }

  /* ===== STORY / TYPOGRAPHY NARRATIVE SECTION ===== */
  .story-section {
    position: sticky;
    top: 0;
    height: 100vh;
    z-index: 2;
    background: var(--color-bg-dark);
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid rgba(var(--color-text-rgb), 0.05);
    overflow: hidden;
  }

  .ambient-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 70vw;
    height: 70vh;
    z-index: 0;
    pointer-events: none;
    background: radial-gradient(
      circle,
      rgba(166, 140, 105, 0.08) 0%,
      rgba(56, 189, 248, 0.03) 40%,
      transparent 65%
    );
    filter: blur(80px);
    animation: ambient-pulse 8s ease-in-out infinite alternate;
  }

  @keyframes ambient-pulse {
    0% {
      transform: translate(-50%, -50%) scale(0.9) rotate(0deg);
      opacity: 0.6;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.1) rotate(5deg);
      opacity: 1;
    }
  }

  .dot-pattern-bg {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background-image: radial-gradient(
        ellipse at center,
        transparent 20%,
        var(--color-bg-dark) 80%
      ),
      radial-gradient(rgba(var(--color-text-rgb), 0.1) 1px, transparent 1px);
    background-size:
      100% 100%,
      28px 28px;
    background-position: center;
  }

  .story-container {
    max-width: none;
    width: 100%;
    padding: 0 var(--fluid-edge);
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    align-items: center;
    gap: 0;
  }

  .typo-narrative {
    font-family: var(--font-primary);
    font-size: clamp(2.5rem, 5vw, 6.5rem); /* Increased size for shorter text */
    font-weight: 500;
    line-height: 1.05;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    display: flex;
    flex-wrap: wrap;
    gap: 0.05em 0.3em;
    max-width: 100%;
  }

  .typo-narrative[data-lang="th"] {
    line-height: 1.25;
    gap: 0.15em 0.3em;
    padding-top: 0.15em;
    padding-bottom: 0.15em;
  }

  .typo-narrative[data-lang="th"] .word {
    line-height: 1.25;
    padding-bottom: 0.05em;
  }

  /* อักษรจีน (ไต้หวัน) ทรงกล่อง ไม่ต้องเว้นบรรทัดเยอะเท่าไทย */
  .typo-narrative[data-lang="tw"] {
    line-height: 1.15;
    gap: 0.08em 0.25em;
    padding-top: 0.05em;
    padding-bottom: 0.05em;
  }

  .typo-narrative[data-lang="tw"] .word {
    line-height: 1.15;
  }

  .typo-narrative .word {
    color: rgba(var(--color-text-rgb), 0.06); /* Dark silver base, hidden */
    transform: translateY(40px) scale(0.9);
    opacity: 0;
    filter: blur(12px);
    transition:
      color 1.2s cubic-bezier(0.16, 1, 0.3, 1),
      transform 1.4s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1),
      filter 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity, color, filter;
    cursor: default;
  }

  @keyframes aurora-flow {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  :global(.typo-narrative.revealed) .word {
    transform: translateY(0) scale(1);
    opacity: 1;
    filter: blur(0);
    color: rgba(var(--color-text-rgb), 0.4); /* สว่างขึ้นแบบมีคลาส พรีเมียม */
  }

  :global(.typo-narrative.revealed) .word:hover {
    color: var(--color-white);
    transform: scale(1.05) translateY(-5px);
    transition-delay: 0s !important;
    transition-duration: 0.3s;
    text-shadow: 0 0 25px rgba(var(--color-white-rgb), 0.5);
    z-index: 10;
  }

  .typo-narrative .word.highlight.aurora-text {
    font-weight: 700;
    position: relative;
    /* High-energy but sophisticated palette: Gold, Magenta, Cyan, Pearl */
    background: linear-gradient(
      -45deg,
      var(--color-text) 0%,
      #c49b66 20%, /* Richer gold */
      #ff2a70 40%, /* Vibrant production magenta */
      #00d4ff 60%, /* Electric cyan */
      #c49b66 80%,
      var(--color-text) 100%
    );
    background-size: 300% 300%;
    color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
    display: inline-block;
    white-space: nowrap;
    -webkit-text-stroke: 1px rgba(255, 255, 255, 0.1); /* Subtle definition */
  }

  /* The actual cinematic glow behind the text */
  .typo-narrative .word.highlight.aurora-text::after {
    content: attr(data-text); /* Fallback or we can just use a pseudo element for glow */
    position: absolute;
    inset: 0;
    z-index: -1;
    background: inherit;
    background-size: inherit;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: blur(24px);
    opacity: 0;
    transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  :global(.typo-narrative.revealed) .word.highlight.aurora-text {
    animation: aurora-flow 8s linear infinite;
  }

  :global(.typo-narrative.revealed) .word.highlight.aurora-text::after {
    opacity: 0.6; /* Smooth cinematic backlight */
    animation: aurora-flow 8s linear infinite;
  }

  :global(.typo-narrative.revealed) .word.highlight.aurora-text:hover {
    animation: aurora-flow 3s linear infinite;
    transform: scale(1.02) translateY(-2px);
    text-shadow: 0 0 30px rgba(255, 42, 112, 0.4); /* Magenta glow pop */
  }

  :global(.typo-narrative.revealed) .word.highlight.aurora-text:hover::after {
    opacity: 0.9;
    filter: blur(32px);
    animation: aurora-flow 3s linear infinite;
  }

  @media (max-width: 900px) {
    .typo-narrative {
      font-size: clamp(2rem, 8vw, 3.5rem); /* ลดขนาดลงอีกนิดบนมือถือเพื่อไม่ให้ตัดคำน่าเกลียด */
      justify-content: center;
      text-align: center;
      max-width: 100%;
      padding: 0 1rem; /* เพิ่มขอบซ้ายขวากันติดจอเกินไป */
    }
  }

  @media (min-width: 901px) and (max-width: 1280px) {
    .story-container {
      grid-template-columns: 1fr 1fr; /* ให้แบ่งครึ่งเท่าๆ กันบนจอไซส์กลาง */
      gap: 3rem; /* เพิ่มช่องไฟตรงกลางเพื่อไม่ให้ตัวหนังสือชนกรอบรูป */
    }
    .typo-narrative {
      font-size: clamp(2.2rem, 4vw, 3.5rem); /* ลดขนาดฟอนต์บนจอไซส์กลาง */
    }
    .top-label {
      font-size: clamp(1rem, 1.35vw, 1.2rem);
      letter-spacing: 0.32em;
    }
  }

  /* Mobile Adjustments for Marquee */
  @media (max-width: 900px) {
    .clients-grid {
      grid-template-columns: 1fr;
      min-height: auto;
    }
    .clients-header-col {
      border-right: none;
      border-bottom: 1px solid rgba(var(--color-text-rgb), 0.06);
      padding: 0.8rem 1.5rem;
      justify-content: center;
    }
    .marquee-col {
      padding: 0.8rem 0;
    }
    .logo-group {
      gap: 15vw;
      padding-right: 15vw;
    }
  }

  /* ===== PHOTO CANVAS ===== */
  .photo-canvas {
    position: relative;
    width: 100%;
    max-width: 430px; /* Adjusted to 430px for the perfect balance */
    justify-self: end; /* Push strictly to the right side of its column */
    aspect-ratio: 4 / 5; /* Standard vertical portrait ratio */
    /* Removed max-height so the frame NEVER squishes and crops the image on short screens */
    /* Dark luxe border frame */
    border: 1px solid rgba(var(--color-text-rgb), 0.12);
    background: var(--color-bg-panel);
    overflow: hidden;
    /* Slight inner shadow depth */
    box-shadow:
      inset 0 0 60px rgba(var(--color-bg-rgb), 0.6),
      0 0 0 1px rgba(var(--color-text-rgb), 0.04),
      0 24px 80px rgba(var(--color-bg-rgb), 0.5);
  }

  /* Film-grain texture overlay */
  .canvas-grain {
    position: absolute;
    inset: 0;
    z-index: 4;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity: 0.06;
    mix-blend-mode: overlay;
    animation: filmGrain 0.8s steps(3) infinite;
  }

  /* L-shaped corner accents */
  .canvas-corner {
    position: absolute;
    width: 20px;
    height: 20px;
    z-index: 5;
    pointer-events: none;
  }
  .canvas-corner::before,
  .canvas-corner::after {
    content: "";
    position: absolute;
    background: rgba(var(--color-text-rgb), 0.5);
  }
  .canvas-corner::before {
    width: 100%;
    height: 1px;
    top: 0;
    left: 0;
  }
  .canvas-corner::after {
    width: 1px;
    height: 100%;
    top: 0;
    left: 0;
  }
  .canvas-corner.tl {
    top: 12px;
    left: 12px;
  }
  .canvas-corner.tr {
    top: 12px;
    right: 12px;
    transform: scaleX(-1);
  }
  .canvas-corner.bl {
    bottom: 12px;
    left: 12px;
    transform: scaleY(-1);
  }
  .canvas-corner.br {
    bottom: 12px;
    right: 12px;
    transform: scale(-1);
  }

  /* Frame counter label */
  .canvas-label {
    position: absolute;
    bottom: 20px;
    left: 20px;
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--font-primary);
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(var(--color-text-rgb), 0.45);
  }
  .canvas-index {
    color: rgba(var(--color-text-rgb), 0.9);
    font-weight: 700;
    font-size: 0.75rem;
  }
  .canvas-sep {
    opacity: 0.3;
  }

  /* Images container */
  .canvas-images {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  /* Base image styles: Smooth Crossfade + Gentle Scale */
  .canvas-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    opacity: 0;
    /* Softly zoomed in when inactive */
    transform: scale(1.08);
    /* Long, buttery transition that handles rapid scroll gracefully */
    transition:
      opacity 0.7s ease,
      transform 0.7s cubic-bezier(0.25, 1, 0.3, 1);
    will-change: transform, opacity;
  }

  /* When active, it fades in and scales down to normal size */
  .canvas-img.active {
    opacity: 1;
    transform: scale(1);
    z-index: 2;
  }

  /* Optional: differentiate scale direction for prev/next to give depth */
  .canvas-img.prev {
    /* Images we've passed sink backward slightly */
    transform: scale(0.96);
  }

  .canvas-img.next {
    /* Images coming up are waiting zoomed in */
    transform: scale(1.08);
  }

  /* Dark vignette edge on the canvas image */
  .canvas-images::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 2;
    background: linear-gradient(
        to bottom,
        rgba(var(--color-bg-rgb), 0.3) 0%,
        transparent 30%,
        transparent 70%,
        rgba(var(--color-bg-rgb), 0.5) 100%
      ),
      linear-gradient(to right, transparent 80%, rgba(var(--color-bg-rgb), 0.2) 100%);
    pointer-events: none;
  }

  /* Mobile: hide canvas, let typography go full width */
  @media (max-width: 900px) {
    .story-container {
      grid-template-columns: 1fr;
      padding: 0; /* Remove double padding */
    }
    .photo-canvas {
      display: none;
    }
    .story-pin-outer {
      height: auto;
    }
    .story-section {
      position: relative;
      min-height: 100vh; /* Make it take full viewport height */
      height: 100vh;
      padding: 0 var(--fluid-edge);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  /* ===== FEATURED TOAST (HERO HIGHLIGHT) ===== */
  .featured-toast {
    position: absolute;
    bottom: clamp(2rem, 5vh, 4rem);
    right: var(--nav-edge, 2rem);
    z-index: 10;
    color: var(--color-text);
    opacity: 0;
    transform: translateY(20px);
    animation: revealUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.5s forwards;
    pointer-events: none;
  }

  .toast-glass {
    display: flex;
    align-items: center;
    gap: 16px;
    /* Darker, more solid glass material for better readability */
    background: linear-gradient(135deg, rgba(15, 15, 15, 0.85) 0%, rgba(5, 5, 5, 0.95) 100%);
    backdrop-filter: blur(32px);
    -webkit-backdrop-filter: blur(32px);
    border: 1px solid rgba(240, 238, 233, 0.05);
    border-radius: 2px;
    padding: 12px;
    box-shadow:
      inset 0 1px 0 rgba(240, 238, 233, 0.1),
      0 20px 40px rgba(0, 0, 0, 0.6);
    width: 380px;
    position: relative;
    pointer-events: auto;
    transition: background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
  }

  /* Ultra-Elevation subtle light on hover, NO bouncing */
  .toast-glass:hover {
    background: linear-gradient(135deg, rgba(25, 25, 25, 0.9) 0%, rgba(10, 10, 10, 1) 100%);
    border-color: rgba(240, 238, 233, 0.15);
    box-shadow:
      inset 0 1px 0 rgba(240, 238, 233, 0.2),
      0 25px 50px rgba(0, 0, 0, 0.8),
      0 0 30px rgba(240, 238, 233, 0.03);
  }

  /* Quiet Luxury Close Button */
  .toast-quiet-close {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: rgba(240, 238, 233, 0.4);
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.4s ease;
    z-index: 20;
    opacity: 0;
  }

  .toast-glass:hover .toast-quiet-close {
    opacity: 1;
  }

  .toast-quiet-close:hover {
    color: rgba(240, 238, 233, 1);
    background: rgba(240, 238, 233, 0.1);
  }

  .toast-img-wrapper {
    width: 72px;
    height: 72px;
    flex-shrink: 0;
    border-radius: 2px;
    overflow: hidden;
  }

  .toast-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.85) contrast(1.1);
    transition: filter 0.6s ease, transform 0.6s ease;
  }

  .toast-glass:hover .toast-img {
    filter: brightness(1) contrast(1.1);
    transform: scale(1.03);
  }

  .toast-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex-grow: 1;
    min-width: 0;
  }

  .toast-eyebrow {
    font-family: var(--font-primary);
    font-size: 0.6rem;
    letter-spacing: 0.25em;
    color: rgba(240, 238, 233, 0.4);
    text-transform: uppercase;
  }

  .toast-title-wrapper {
    position: relative;
    display: block;
    max-width: 100%;
    cursor: default;
  }

  .toast-title {
    font-family: 'Clash Display', var(--font-primary);
    font-size: 1.1rem;
    font-weight: 500;
    margin: 0;
    line-height: 1.2;
    color: #f0eee9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* --- Premium Tooltip Glow --- */
  .toast-title-wrapper::after {
    content: attr(data-full-title);
    position: absolute;
    bottom: calc(100% + 14px); /* Float comfortably above the text */
    left: -4px; /* Slight alignment bump to visually align with the edge */
    width: max-content;
    max-width: 280px;
    white-space: normal; /* Allow long titles to wrap in the tooltip */

    /* Premium Glass Style for Tooltip */
    background: rgba(12, 12, 12, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(240, 238, 233, 0.12);
    border-radius: 4px;
    padding: 10px 14px;

    /* Typography inside the tooltip */
    font-family: var(--font-primary);
    font-size: 0.8rem;
    font-weight: 500;
    color: #f0eee9;
    line-height: 1.4;
    letter-spacing: 0.02em;
    text-transform: none;

    /* Animation defaults */
    opacity: 0;
    transform: translateY(6px) scale(0.96);
    pointer-events: none;
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 20;

    /* Dark Luxe deep shadow */
    box-shadow:
      inset 0 1px 1px rgba(240, 238, 233, 0.05),
      0 12px 24px rgba(0, 0, 0, 0.8),
      0 0 12px rgba(240, 238, 233, 0.03);
  }

  /* --- Tooltip Arrow --- */
  .toast-title-wrapper::before {
    content: "";
    position: absolute;
    bottom: calc(100% + 10px);
    left: 12px;
    width: 8px;
    height: 8px;
    background: rgba(12, 12, 12, 0.95);
    border-right: 1px solid rgba(240, 238, 233, 0.12);
    border-bottom: 1px solid rgba(240, 238, 233, 0.12);
    transform: rotate(45deg) translateY(4px) scale(0.96);
    opacity: 0;
    pointer-events: none;
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 21;
  }

  /* Trigger the animations when mouse hovers over the title wrapper */
  .toast-title-wrapper:hover::after {
    opacity: 1;
    transform: translateY(0) scale(1);
    transition-delay: 0.25s; /* Small delay prevents flashing during rapid mouse movement */
  }

  .toast-title-wrapper:hover::before {
    opacity: 1;
    transform: rotate(45deg) translateY(0) scale(1);
    transition-delay: 0.25s;
  }

  .toast-meta {
    font-family: var(--font-primary);
    font-size: 0.65rem;
    color: rgba(240, 238, 233, 0.5);
    letter-spacing: 0.05em;
  }

  .toast-btn {
    font-family: var(--font-primary);
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 2px;
    border: 1px solid rgba(240, 238, 233, 0.15);
    background: transparent;
    color: #f0eee9;
    flex-shrink: 0;
    transition: all 0.3s ease;
    white-space: nowrap;
    cursor: pointer;
  }

  .toast-btn:hover {
    background: #f0eee9;
    color: #000;
    border-color: #f0eee9;
  }

  /* Ephemeral Progress Line */
  .toast-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: transparent;
    pointer-events: none;
  }

  .toast-progress-fill {
    width: 100%;
    height: 100%;
    background: rgba(240, 238, 233, 0.3);
    transform-origin: left;
    animation: shrinkLine 15s linear forwards;
  }

  .featured-toast:hover .toast-progress-fill {
    animation-play-state: paused;
  }

  @keyframes shrinkLine {
    0% { transform: scaleX(1); }
    100% { transform: scaleX(0); }
  }

  /* Responsive Centering on Tablet/Mobile */
  @media (max-width: 1024px) {
    .featured-toast {
      right: 0;
      left: 0;
      margin: 0 auto; /* Centers the absolute element perfectly */
      width: max-content; /* Hugs the 340px width of toast-glass */
      bottom: calc(2rem + env(safe-area-inset-bottom));
    }

    .toast-glass {
      width: clamp(300px, 90vw, 360px);
    }
  }

  @media (hover: none), (pointer: coarse) {
    .toast-quiet-close {
      opacity: 1;
      background: rgba(240, 238, 233, 0.08);
    }

    .toast-title-wrapper::after,
    .toast-title-wrapper::before {
      display: none;
    }
  }
</style>
