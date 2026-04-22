<script lang="ts">
  import type { Attachment } from "svelte/attachments";
  import { getScrollState } from "$lib/stores/scroll.svelte";

  const wrapperScroll = getScrollState();

  import typo1 from "$lib/assets/home/story/images/1.jpg?enhanced";
  import typo2 from "$lib/assets/home/story/images/2.jpg?enhanced";
  import typo3 from "$lib/assets/home/story/images/3.jpg?enhanced";
  import typo4 from "$lib/assets/home/story/images/4.jpg?enhanced";
  import typo5 from "$lib/assets/home/story/images/5.jpg?enhanced";
  import typo6 from "$lib/assets/home/story/images/6.jpg?enhanced";

  const PHOTOS = [
    { src: typo1 },
    { src: typo2 },
    { src: typo3 },
    { src: typo4 },
    { src: typo5 },
    { src: typo6 },
  ];

  const STORY_WORDS = [
    "BRINGING",
    "THE",
    "BEST",
    "OF",
    "GLOBAL",
    "DRAG",
    "EXPERIENCES",
    "TO",
    "ASIA",
  ];
  const HIGHLIGHT = "POWER AS ONE";

  let metrics = $state({ top: 0, range: 0 });
  let revealed = $state(false);
  let isSectionActive = $state(false);
  let scrollProgress = $state(0);

  const measure: Attachment<HTMLElement> = (node) => {
    const update = () => {
      metrics.top = node.offsetTop;
      metrics.range = Math.max(0, node.offsetHeight - window.innerHeight);
    };

    const observer = new ResizeObserver(update);
    const activityObserver = new IntersectionObserver(([entry]) => {
      isSectionActive = entry.isIntersecting;
    });

    observer.observe(node);
    activityObserver.observe(node);
    window.addEventListener("resize", update, { passive: true });
    update();

    return () => {
      observer.disconnect();
      activityObserver.disconnect();
      window.removeEventListener("resize", update);
    };
  };

  const inView: Attachment<HTMLElement> = (node) => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          revealed = true;
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  };

  let liveScrollProgress = $derived.by(() => {
    if (metrics.range <= 0) return 0;
    return Math.min(1, Math.max(0, (wrapperScroll.y - metrics.top) / metrics.range));
  });

  // Freeze scroll-driven work while the sticky range is fully offscreen.
  $effect(() => {
    if (isSectionActive) {
      scrollProgress = liveScrollProgress;
    }
  });

  // Animation Phasing (Restored to exact original logic)
  let transitionProgress = $derived(Math.min(1, Math.max(0, (scrollProgress - 0.25) / 0.15)));
  let photoProgress = $derived(Math.min(1, Math.max(0, (scrollProgress - 0.40) / 0.60)));

  let activePhoto = $derived(
    Math.min(PHOTOS.length - 1, Math.floor(photoProgress * PHOTOS.length)),
  );
</script>

{#snippet corner(pos: "tl" | "tr" | "bl" | "br")}
  <div class={["canvas-corner", pos]}></div>
{/snippet}

<div class="story-pin-outer" {@attach measure}>
  <section class="story-section" style="--t-prog: {transitionProgress};">
    <div class="dot-pattern-bg"></div>

    <div class="story-container">
      <div class="typo-wrapper">
        <div class={["typo-narrative", revealed && "revealed"]} {@attach inView}>
          {#each STORY_WORDS as word, i (`${i}-${word}`)}
            <span class="word" style="transition-delay: {0.05 + i * 0.03}s">
              {word}
            </span>
          {/each}
          <span
            class={[
              "word",
              "highlight",
              "aurora-text",
              revealed && isSectionActive && "is-flowing",
            ]}
            style="transition-delay: {0.05 + STORY_WORDS.length * 0.03}s"
            data-text={HIGHLIGHT}
          >
            {HIGHLIGHT}
          </span>
        </div>
      </div>

      <div class="photo-canvas">

        {@render corner("tl")}
        {@render corner("tr")}
        {@render corner("bl")}
        {@render corner("br")}
        <div class="canvas-label">
          <span class="canvas-index">{String(activePhoto + 1).padStart(2, "0")}</span>
          <span class="canvas-sep">—</span>
          <span class="canvas-total">{String(PHOTOS.length).padStart(2, "0")}</span>
        </div>
        <div class="canvas-images">
          {#each PHOTOS as photo, i (photo.src)}
            <enhanced:img
              class={[
                "canvas-img",
                i === activePhoto && "active",
                i < activePhoto && "prev",
                i > activePhoto && "next",
              ]}
              src={photo.src}
              alt="Editorial Visual {i + 1}"
              loading={i === 0 ? "eager" : "lazy"}
              sizes="(max-width: 1024px) 85vw, 430px"
            />
          {/each}
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  @keyframes aurora-flow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }


  .story-pin-outer {
    height: 600vh;
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

  .dot-pattern-bg {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background-image: radial-gradient(rgba(var(--color-text-rgb), 0.18) 1px, transparent 1px);
    background-size: 24px 24px;
    background-position: center;
    opacity: 0.95;
    mask-image:
      linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.22) 0%,
        rgba(0, 0, 0, 0.78) 18%,
        rgba(0, 0, 0, 1) 50%,
        rgba(0, 0, 0, 0.76) 82%,
        rgba(0, 0, 0, 0.24) 100%
      ),
      linear-gradient(
        90deg,
        rgba(0, 0, 0, 0.3) 0%,
        rgba(0, 0, 0, 0.86) 16%,
        rgba(0, 0, 0, 1) 50%,
        rgba(0, 0, 0, 0.82) 84%,
        rgba(0, 0, 0, 0.34) 100%
      );
    mask-composite: intersect;
    -webkit-mask-image:
      linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.22) 0%,
        rgba(0, 0, 0, 0.78) 18%,
        rgba(0, 0, 0, 1) 50%,
        rgba(0, 0, 0, 0.76) 82%,
        rgba(0, 0, 0, 0.24) 100%
      ),
      linear-gradient(
        90deg,
        rgba(0, 0, 0, 0.3) 0%,
        rgba(0, 0, 0, 0.86) 16%,
        rgba(0, 0, 0, 1) 50%,
        rgba(0, 0, 0, 0.82) 84%,
        rgba(0, 0, 0, 0.34) 100%
      );
    -webkit-mask-composite: source-in;
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

  .typo-wrapper {
    --center-offset: 20vw;
    transform: translateX(calc((1 - var(--t-prog, 1)) * var(--center-offset)));
    will-change: transform, opacity;
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

  .typo-narrative .word {
    color: rgba(var(--color-text-rgb), 0.06);
    transform: translateY(40px) scale(0.9);
    opacity: 0;
    transition:
      color 1.2s cubic-bezier(0.16, 1, 0.3, 1),
      transform 1.4s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity, color;
    cursor: default;
  }

  .typo-narrative.revealed .word {
    transform: translateY(0) scale(1);
    opacity: 1;
    color: #555555;
  }

  .typo-narrative.revealed .word:not(.highlight):hover {
    color: var(--color-white);
    transform: scale(1.05);
    transition-delay: 0s !important;
    transition-duration: 0.3s;
    transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 10;
  }

  .word.highlight.aurora-text {
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
    -webkit-text-stroke: 1px rgba(255, 255, 255, 0.06);
  }

  .typo-narrative.revealed .word.highlight.aurora-text.is-flowing {
    animation: aurora-flow 8s linear infinite;
  }

  .typo-narrative.revealed .word.highlight.aurora-text.is-flowing:hover {
    animation: aurora-flow 3s linear infinite;
    transform: scale(1.02) translateY(-2px);
  }

  .photo-canvas {
    position: relative;
    width: 100%;
    opacity: var(--t-prog, 1);
    transform: scale(calc(0.88 + 0.12 * var(--t-prog, 1)));
    will-change: transform, opacity;
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

  .canvas-corner::before { width: 100%; height: 1px; top: 0; left: 0; }
  .canvas-corner::after { width: 1px; height: 100%; top: 0; left: 0; }

  .canvas-corner.tl { top: 12px; left: 12px; }
  .canvas-corner.tr { top: 12px; right: 12px; transform: scaleX(-1); }
  .canvas-corner.bl { bottom: 12px; left: 12px; transform: scaleY(-1); }
  .canvas-corner.br { bottom: 12px; right: 12px; transform: scale(-1); }

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

  .canvas-index { color: rgba(var(--color-text-rgb), 0.9); font-weight: 700; font-size: 0.75rem; }

  .canvas-sep { opacity: 0.3; }

  .canvas-images { position: absolute; inset: 0; z-index: 1; }

  .canvas-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    opacity: 0;
    transform: scale(1.08);
    transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity;
  }

  .canvas-img.active { opacity: 1; transform: scale(1); z-index: 2; }
  .canvas-img.prev { transform: scale(0.96); }
  .canvas-img.next { transform: scale(1.08); }

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

  @media (max-width: 1024px) {
    .typo-wrapper {
      transform: translateY(calc(var(--t-prog, 1) * -8vh));
      opacity: calc(1 - var(--t-prog, 1));
    }

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
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .photo-canvas {
      position: absolute;
      top: 50%;
      left: 50%;
      translate: -50% -50%;
      transform: scale(calc(0.88 + 0.12 * var(--t-prog, 1)));
      opacity: var(--t-prog, 1);
      width: clamp(280px, 85vw, 430px);
      z-index: 5;
      box-shadow: 
        0 40px 100px -20px rgba(var(--color-bg-rgb), 0.9),
        inset 0 0 60px rgba(var(--color-bg-rgb), 0.6),
        0 0 0 1px rgba(var(--color-text-rgb), 0.04);
    }

    .story-pin-outer { height: 500vh; }
    .story-section { height: 100vh; padding: 0 var(--fluid-edge); }
  }

  @media (min-width: 1025px) and (max-width: 1280px) {
    .story-container { grid-template-columns: 1fr 1fr; gap: 3rem; }
    .typo-wrapper { --center-offset: 25vw; }
  }

  @media (prefers-reduced-motion: reduce) {

    /* Aurora text: keep gradient visible, stop flow animation */
    .typo-narrative.revealed .word.highlight.aurora-text { animation: none; }
    .typo-narrative.revealed .word.highlight.aurora-text:hover { animation: none; }

    /* Word reveals: instant appearance instead of staggered fly-up */
    .typo-narrative .word {
      transition-duration: 0.2s;
      transform: none;
    }

    /* Image crossfade: shorter, no scale transform */
    .canvas-img {
      transition-duration: 0.3s;
      will-change: auto;
    }

    /* Remove layer promotion hints */
    .typo-wrapper,
    .photo-canvas,
    .typo-narrative .word {
      will-change: auto;
    }
  }
</style>
