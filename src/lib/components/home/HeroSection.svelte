<script lang="ts">
  import type { Attachment } from "svelte/attachments";
  import FeaturedToast from "$lib/components/home/FeaturedToast.svelte";
  import heroPoster from "$lib/assets/home/hero/hero-poster.avif";
  import imgMainLogo from "$lib/assets/home/brands/main_oneheart.png?enhanced";

  let videoReady = $state(false);
  let videoEl: HTMLVideoElement | undefined;
  let heroInView = $state(true);
  let isDocumentHidden = $state(false);
  let shouldPlayVideo = $derived(heroInView && !isDocumentHidden);
  // Slab text lockup state for mathematically perfect font scaling
  let lockupRatio = $state(1);

  const measureLockup: Attachment<HTMLElement> = (node) => {
    const update = () => {
      const top = node.querySelector(".measure-top") as HTMLElement;
      const bottom = node.querySelector(".measure-bottom") as HTMLElement;
      if (top && bottom) {
        // Use sub-pixel precision, clientWidth rounds integers and breaks alignment
        const wTop = top.getBoundingClientRect().width;
        const wBottom = bottom.getBoundingClientRect().width;
        if (wTop > 0 && wBottom > 0) {
          lockupRatio = wBottom / wTop;
        }
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.body);
    if (document.fonts) document.fonts.ready.then(update);

    return () => ro.disconnect();
  };

  function updateVideoReadyState(node: HTMLVideoElement) {
    videoReady = node.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
  }

  const captureVideo: Attachment<HTMLVideoElement> = (node) => {
    videoEl = node;
    updateVideoReadyState(node);

    const handleVideoReady = () => updateVideoReadyState(node);

    node.addEventListener("loadeddata", handleVideoReady);
    node.addEventListener("canplay", handleVideoReady);
    node.addEventListener("playing", handleVideoReady);

    return () => {
      node.removeEventListener("loadeddata", handleVideoReady);
      node.removeEventListener("canplay", handleVideoReady);
      node.removeEventListener("playing", handleVideoReady);

      if (videoEl === node) {
        videoEl = undefined;
      }
    };
  };

  const trackHeroVisibility: Attachment<HTMLElement> = (node) => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        heroInView = entry.isIntersecting;
      },
      { threshold: 0.05 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  };

  $effect(() => {
    const handleFirstInteraction = () => {
      if (videoEl && videoEl.paused) {
        videoEl.play().catch(() => {});
      }

      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstInteraction, {
      once: true,
    });

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  });

  $effect(() => {
    const updateDocumentVisibility = () => {
      isDocumentHidden = document.hidden;
    };

    updateDocumentVisibility();
    document.addEventListener("visibilitychange", updateDocumentVisibility);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        updateDocumentVisibility,
      );
    };
  });

  $effect(() => {
    if (!videoEl) return;

    if (shouldPlayVideo) {
      if (videoEl.paused) {
        videoEl.play().catch(() => {});
      }

      return;
    }

    if (!videoEl.paused) {
      videoEl.pause();
    }
  });
</script>

<svelte:head>
  <link rel="preload" as="image" href={heroPoster} fetchpriority="high" />
</svelte:head>

<div class="home" {@attach trackHeroVisibility}>
  <div class="video-background">
    <img
      src={heroPoster}
      fetchpriority="high"
      loading="eager"
      alt=""
      class={["hero-poster", videoReady && "hidden"]}
      width="1920"
      height="1080"
    />

    <video
      {@attach captureVideo}
      poster={heroPoster}
      autoplay
      muted
      loop
      playsinline
      preload="auto"
      disablepictureinpicture
      disableremoteplayback
      onplaying={() => (videoReady = true)}
      class={["hero-video", videoReady && "ready"]}
    >
      <source src="/media/hero-video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>

  <div class="overlay"></div>

  <div class="hero-content">
    <div class="hero-top-nav">
      <div class="nav-col">
        LAGANJA<br />ESTRANJA
      </div>
      <div class="nav-col">
        CAFÉ DALIDA &<br />C.U.M. PARTY
      </div>
      <div class="nav-col center">
        <div class="brand-lockup">
          <div class="brand-text" {@attach measureLockup}>
            <span class="brand-line" style="font-size: {lockupRatio}em;"
              >ONE HEART</span
            >
            <span class="brand-line measure-bottom">PRODUCTIONS</span>
            <!-- Hidden measurement clone to get natural width of ONE HEART at 1em -->
            <span class="brand-line measurement measure-top" aria-hidden="true"
              >ONE HEART</span
            >
          </div>
          <enhanced:img
            src={imgMainLogo}
            alt="One Heart Logo"
            class="lockup-logo"
            width="36"
            height="36"
            sizes="36px"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
      <div class="nav-col">
        PRISM<br />GALAXIA
      </div>
      <div class="nav-col right">
        DRAG RACE<br />THAI FANS
      </div>
    </div>

    <div class="hero-bottom-text">
      <h2 class="staggered-headline">
        <span class="hl-line">BRINGING THE BEST OF</span>
        <span class="hl-line offset">DRAG TO ALL OF ASIA</span>
      </h2>
    </div>
  </div>

  <FeaturedToast />
</div>

<style>
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

  .video-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;
    pointer-events: none;
  }

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
    will-change: opacity;
    /* REMOVED: filter: brightness(0.45) saturate(0.75);
       Reason: Kills CPU during software decoding. Dimming is now handled by .overlay */
  }

  .hero-poster {
    z-index: 1;
    opacity: 1;
    transition: opacity 2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .hero-poster.hidden {
    opacity: 0;
  }

  .hero-video {
    z-index: 2;
    opacity: 0;
    transition: opacity 2.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .hero-video.ready {
    opacity: 1;
  }

  .overlay {
    position: absolute;
    inset: 0;
    /* Uniform dim to replace video filter: brightness(0.45) ≈ 55% black */
    background: rgba(10, 10, 11, 0.55);
    z-index: 1;
    pointer-events: none;
  }

  .hero-content {
    position: absolute;
    inset: 0;
    z-index: 10;
    pointer-events: none;
  }

  /* ─── Top Nav: Flexbox space-between ───
     Five items spread evenly across the full width.
     The center lockup is visually dominant via larger type.
     space-between guarantees equal breathing room between each item. */
  .hero-top-nav {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: clamp(0.75rem, 1.5vw, 1rem) clamp(2rem, 5vw, 3.5rem);
    opacity: 0;
    animation: fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: 0.1s;
  }

  /* Brand names — small, quiet, secondary hierarchy */
  .nav-col {
    font-family: var(--font-primary);
    color: var(--color-text, #ffffff);
    font-size: clamp(0.6rem, 0.75vw, 0.78rem);
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    pointer-events: auto;
    text-align: left;
  }

  /* Far right column aligns text right for visual symmetry */
  .nav-col.right {
    text-align: right;
  }

  /* Center lockup: ONE HEART + logo + PRODUCTIONS
     The logo is absolutely positioned so it never affects
     text flow, line-height, or alignment. */
  .nav-col.center {
    font-size: clamp(1.05rem, 1.5vw, 1.35rem);
    font-weight: 700;
    letter-spacing: 0.08em;
    line-height: 1.15;
  }

  /* brand-lockup: flex row — text block on left, logo on right */
  .brand-lockup {
    display: flex;
    align-items: center;
    gap: 0; /* Removing gap for tighter control with margins */
  }

  /* brand-text: column of two lines, width driven by the longer line (PRODUCTIONS) */
  .brand-text {
    display: flex;
    flex-direction: column;
    white-space: nowrap;
  }

  .brand-line {
    display: block;
    /* Resetting letter-spacing to 0 is the "Best Practice" for slab-text scaling.
       If letter-spacing is non-zero, the number of gaps (which differs between lines)
       prevents a simple font-size ratio from resulting in identical widths. */
    letter-spacing: 0;
    margin-right: 0;
    line-height: 1; /* Tighter line height for the lockup */
  }

  /* Optical alignment: Curved 'O' needs to overshoot slightly to the left
     to visually align with the straight stem of the 'P' below it. */
  .brand-line:first-child {
    margin-left: -0.03em;
  }

  .brand-line.measurement {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
    font-size: 1em; /* Base size to measure ratio against */
  }

  /* Logo sits as a flex sibling, right of the text block */
  .lockup-logo {
    display: block;
    flex-shrink: 0;
    width: 3.8em;
    height: 3.8em;
    object-fit: contain;
    margin-left: -0.1em; /* Pushing the logo closer to the text */
  }

  /* ─── Bottom Headline ─── 
     Positioned to match Toast: bottom: clamp(2rem, 5vh, 4rem)
     so both sit on the same baseline. */
  .hero-bottom-text {
    position: absolute;
    bottom: clamp(2rem, 5vh, 4rem);
    left: clamp(2rem, 5vw, 3.5rem);
    pointer-events: auto;
  }

  .staggered-headline {
    display: flex;
    flex-direction: column;
    font-family: var(--font-primary);
    font-size: clamp(2rem, 4.5vw, 3.8rem);
    font-weight: 500;
    line-height: 0.95; /* Tighter leading for premium editorial feel */
    color: var(--color-text, #ffffff);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -0.01em; /* Tighter tracking for density */
  }

  .hl-line {
    display: block;
    opacity: 0;
    animation: fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .hl-line:nth-child(1) {
    animation-delay: 0.3s;
  }

  .hl-line.offset {
    margin-left: 1.5em; /* Awwwards-style staggered indent */
    color: rgba(255, 255, 255, 0.85); /* Subtle depth without size change */
    display: flex;
    align-items: center;
    gap: 0.4em;
    animation-delay: 0.45s; /* Staggered entrance animation */
  }

  /* Minimalist accent dash */
  .hl-line.offset::before {
    content: '';
    display: block;
    width: 1.2em;
    height: 0.08em;
    background: currentColor;
    margin-top: 0.05em;
  }

  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ─── Tablet ─── */
  @media (max-width: 1024px) {
    .nav-col {
      font-size: clamp(0.55rem, 1.1vw, 0.68rem);
    }
    .nav-col.center {
      font-size: clamp(0.85rem, 2vw, 1.1rem);
    }
  }

  /* ─── Mobile ─── */
  @media (max-width: 768px) {
    .hero-top-nav {
      flex-wrap: wrap;
      gap: 1.5rem;
      justify-content: space-between;
    }
    /* Center lockup takes full width, first row */
    .nav-col.center {
      width: 100%;
      order: -1;
      text-align: center;
      font-size: 0.95rem;
    }
    .nav-col {
      font-size: 0.65rem;
      width: calc(50% - 0.75rem);
    }
    .nav-col:nth-child(2),
    .nav-col:nth-child(5) {
      text-align: right;
    }
    .staggered-headline {
      font-size: clamp(1.75rem, 7vw, 2.25rem);
    }
    .hl-line.offset {
      margin-left: 1em; /* Less indent on mobile */
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-top-nav,
    .hero-bottom-text {
      animation: none;
      opacity: 1;
    }

    /* Remove layer promotion hints — counterproductive without GPU */
    .hero-video,
    .hero-poster {
      will-change: auto;
    }

    /* Shorten video crossfade */
    .hero-video {
      transition-duration: 0.5s;
    }
    .hero-poster {
      transition-duration: 0.5s;
    }
  }
</style>
