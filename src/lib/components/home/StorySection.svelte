<script lang="ts">
  import { onMount } from "svelte";
  import { i18n } from "$lib/i18n.svelte";
  import { wrapperScroll } from "$lib/stores/scroll.svelte";

  const PHOTOS = [
    { src: "/typo/1.avif", width: 1856, height: 2298 },
    { src: "/typo/2.avif", width: 1856, height: 2298 },
    { src: "/typo/3.avif", width: 1856, height: 2298 },
    { src: "/typo/4.avif", width: 1856, height: 2298 },
    { src: "/typo/5.avif", width: 1856, height: 2298 },
  ] as const;

  let storyEl: HTMLDivElement | undefined = $state();
  let storyPinEl: HTMLDivElement | undefined = $state();
  let metrics = $state({ top: 0, range: 0 });
  let revealed = $state(false);

  function captureStory(node: HTMLDivElement) {
    storyEl = node;

    return () => {
      if (storyEl === node) {
        storyEl = undefined;
      }
    };
  }

  function captureStoryPin(node: HTMLDivElement) {
    storyPinEl = node;

    return () => {
      if (storyPinEl === node) {
        storyPinEl = undefined;
      }
    };
  }

  let activePhoto = $derived.by(() => {
    if (metrics.range <= 0) {
      return 0;
    }

    const progress = Math.min(
      1,
      Math.max(0, (wrapperScroll.y - metrics.top) / metrics.range),
    );

    return Math.min(
      PHOTOS.length - 1,
      Math.floor(progress * PHOTOS.length),
    );
  });

  onMount(() => {
    function updateMetrics() {
      if (!storyPinEl) {
        return;
      }

      metrics.top = storyPinEl.offsetTop;
      metrics.range = Math.max(0, storyPinEl.offsetHeight - window.innerHeight);
    }

    const resizeObserver = new ResizeObserver(() => {
      updateMetrics();
    });

    if (storyPinEl) {
      resizeObserver.observe(storyPinEl);
    }

    window.addEventListener("resize", updateMetrics);
    updateMetrics();

    let observer: IntersectionObserver | undefined;

    if (storyEl) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            revealed = true;
            observer?.disconnect();
          }
        },
        {
          threshold: 0.15,
          root: null,
          rootMargin: "0px 0px -40px 0px",
        },
      );

      observer.observe(storyEl);
    }

    return () => {
      resizeObserver.disconnect();
      observer?.disconnect();
      window.removeEventListener("resize", updateMetrics);
    };
  });
</script>

<div class="story-pin-outer" {@attach captureStoryPin}>
  <section class="story-section">
    <div class="ambient-glow"></div>
    <div class="dot-pattern-bg"></div>

    <div class="story-container">
      <div
        class="typo-narrative"
        class:revealed
        {@attach captureStory}
        data-lang={i18n.currentLocale}
      >
        {#each i18n.t("story_words") as word, i (`${i}-${word}`)}
          <span class="word" style="transition-delay: {0.05 + i * 0.04}s">
            {word}
          </span>
        {/each}
        <span
          class="word highlight aurora-text"
          style="transition-delay: {0.05 + i18n.t('story_words').length * 0.04}s"
          data-text={i18n.t("story_highlight")}
        >
          {i18n.t("story_highlight")}
        </span>
      </div>

      <div class="photo-canvas">
        <div class="canvas-grain"></div>
        <div class="canvas-corner tl"></div>
        <div class="canvas-corner tr"></div>
        <div class="canvas-corner bl"></div>
        <div class="canvas-corner br"></div>
        <div class="canvas-label">
          <span class="canvas-index">{String(activePhoto + 1).padStart(2, "0")}</span>
          <span class="canvas-sep">—</span>
          <span class="canvas-total">{String(PHOTOS.length).padStart(2, "0")}</span>
        </div>
        <div class="canvas-images">
          {#each PHOTOS as photo, i (photo.src)}
            <img
              class="canvas-img"
              class:active={i === activePhoto}
              class:prev={i < activePhoto}
              class:next={i > activePhoto}
              src={photo.src}
              alt="One Heart Productions – visual {i + 1}"
              loading={i === 0 ? "eager" : "lazy"}
              width={photo.width}
              height={photo.height}
            />
          {/each}
        </div>
      </div>
    </div>
  </section>
</div>

<style>
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

  .story-pin-outer {
    height: 400vh;
    position: relative;
  }

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

  .dot-pattern-bg {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background-image:
      radial-gradient(ellipse at center, transparent 20%, var(--color-bg-dark) 80%),
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
    font-size: clamp(2.5rem, 5vw, 6.5rem);
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
    color: rgba(var(--color-text-rgb), 0.06);
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

  .typo-narrative.revealed .word {
    transform: translateY(0) scale(1);
    opacity: 1;
    filter: blur(0);
    color: rgba(var(--color-text-rgb), 0.4);
  }

  .typo-narrative.revealed .word:hover {
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
    background: linear-gradient(
      -45deg,
      var(--color-text) 0%,
      #c49b66 20%,
      #ff2a70 40%,
      #00d4ff 60%,
      #c49b66 80%,
      var(--color-text) 100%
    );
    background-size: 300% 300%;
    color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
    display: inline-block;
    white-space: nowrap;
    -webkit-text-stroke: 1px rgba(255, 255, 255, 0.1);
  }

  .typo-narrative .word.highlight.aurora-text::after {
    content: attr(data-text);
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

  .typo-narrative.revealed .word.highlight.aurora-text {
    animation: aurora-flow 8s linear infinite;
  }

  .typo-narrative.revealed .word.highlight.aurora-text::after {
    opacity: 0.6;
    animation: aurora-flow 8s linear infinite;
  }

  .typo-narrative.revealed .word.highlight.aurora-text:hover {
    animation: aurora-flow 3s linear infinite;
    transform: scale(1.02) translateY(-2px);
    text-shadow: 0 0 30px rgba(255, 42, 112, 0.4);
  }

  .typo-narrative.revealed .word.highlight.aurora-text:hover::after {
    opacity: 0.9;
    filter: blur(32px);
    animation: aurora-flow 3s linear infinite;
  }

  .photo-canvas {
    position: relative;
    width: 100%;
    max-width: 430px;
    justify-self: end;
    aspect-ratio: 4 / 5;
    border: 1px solid rgba(var(--color-text-rgb), 0.12);
    background: var(--color-bg-panel);
    overflow: hidden;
    box-shadow:
      inset 0 0 60px rgba(var(--color-bg-rgb), 0.6),
      0 0 0 1px rgba(var(--color-text-rgb), 0.04),
      0 24px 80px rgba(var(--color-bg-rgb), 0.5);
  }

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

  .canvas-images {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .canvas-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    opacity: 0;
    transform: scale(1.08);
    transition:
      opacity 0.7s ease,
      transform 0.7s cubic-bezier(0.25, 1, 0.3, 1);
    will-change: transform, opacity;
  }

  .canvas-img.active {
    opacity: 1;
    transform: scale(1);
    z-index: 2;
  }

  .canvas-img.prev {
    transform: scale(0.96);
  }

  .canvas-img.next {
    transform: scale(1.08);
  }

  .canvas-images::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 2;
    background:
      linear-gradient(
        to bottom,
        rgba(var(--color-bg-rgb), 0.3) 0%,
        transparent 30%,
        transparent 70%,
        rgba(var(--color-bg-rgb), 0.5) 100%
      ),
      linear-gradient(to right, transparent 80%, rgba(var(--color-bg-rgb), 0.2) 100%);
    pointer-events: none;
  }

  @media (max-width: 900px) {
    .typo-narrative {
      font-size: clamp(2rem, 8vw, 3.5rem);
      justify-content: center;
      text-align: center;
      max-width: 100%;
      padding: 0 1rem;
    }

    .story-container {
      grid-template-columns: 1fr;
      padding: 0;
    }

    .photo-canvas {
      display: none;
    }

    .story-pin-outer {
      height: auto;
    }

    .story-section {
      position: relative;
      min-height: 100vh;
      height: 100vh;
      padding: 0 var(--fluid-edge);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  @media (min-width: 901px) and (max-width: 1280px) {
    .story-container {
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
    }

    .typo-narrative {
      font-size: clamp(2.2rem, 4vw, 3.5rem);
    }
  }
</style>
