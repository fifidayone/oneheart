<script lang="ts">
  import type { Attachment } from "svelte/attachments";
  import { innerWidth as windowWidth } from "svelte/reactivity/window";
  import { DragState } from "$lib/logic/drag.svelte";

  // Asset Imports
  import imgAnetra from "$lib/assets/home/collab/anetra.jpg?enhanced";
  import imgAquria from "$lib/assets/home/collab/aquria.jpg?enhanced";
  import imgMarina from "$lib/assets/home/collab/marina.jpg?enhanced";
  import imgNicky from "$lib/assets/home/collab/nicky.jpg?enhanced";
  import imgNymphia from "$lib/assets/home/collab/nymphia.jpg?enhanced";

  // Static Data (Using pure JS outside script for Zero-Reactivity overhead)
  const IMAGES = [imgAnetra, imgAquria, imgMarina, imgNicky, imgNymphia];
  const GRID_ITEMS = $state.raw([
    IMAGES[0],
    IMAGES[2],
    IMAGES[4],
    IMAGES[1],
    IMAGES[3],
    IMAGES[3],
    IMAGES[0],
    IMAGES[1],
    IMAGES[4],
    IMAGES[2],
    IMAGES[1],
    IMAGES[4],
    IMAGES[2],
    IMAGES[3],
    IMAGES[0],
    IMAGES[4],
    IMAGES[3],
    IMAGES[0],
    IMAGES[2],
    IMAGES[1],
  ]);

  // Reactive State
  const drag = new DragState();
  let innerWidth = $derived(windowWidth.current ?? 1024);
  let worldContainer: HTMLElement | null = null;
  let rafId: number | undefined;
  let isSectionVisible = $state(false);
  let isDocumentHidden = $state(false);
  let shouldAnimate = $derived(isSectionVisible && !isDocumentHidden);

  // Derived Grid Metrics
  const COLS = 5;
  const ROWS = 4;
  let TILE_WIDTH = $derived(innerWidth <= 768 ? 160 : 260);
  let TILE_HEIGHT = $derived(innerWidth <= 768 ? 213 : 347);
  let BLOCK_WIDTH = $derived(COLS * TILE_WIDTH);
  let BLOCK_HEIGHT = $derived(ROWS * TILE_HEIGHT);
  let KEYBOARD_STEP_X = $derived(innerWidth <= 768 ? 120 : 180);
  let KEYBOARD_STEP_Y = $derived(innerWidth <= 768 ? 150 : 220);

  // Viewport Paging
  let camCol = $derived(Math.floor(-drag.currentX / BLOCK_WIDTH));
  let camRow = $derived(Math.floor(-drag.currentY / BLOCK_HEIGHT));

  function syncWorldPosition() {
    if (!worldContainer) return;

    worldContainer.style.setProperty("--world-x", `${drag.currentX}px`);
    worldContainer.style.setProperty("--world-y", `${drag.currentY}px`);
  }

  function stopWorldLoop() {
    if (rafId === undefined) return;

    cancelAnimationFrame(rafId);
    rafId = undefined;
  }

  function startWorldLoop() {
    if (rafId !== undefined || !worldContainer) return;

    function tick() {
      drag.update();
      syncWorldPosition();
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
  }

  const trackSectionVisibility: Attachment<HTMLElement> = (node) => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isSectionVisible = entry.isIntersecting;
      },
      { threshold: 0.05 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  };

  const captureWorld: Attachment<HTMLElement> = (node) => {
    worldContainer = node;
    syncWorldPosition();

    if (shouldAnimate) {
      startWorldLoop();
    }

    return () => {
      stopWorldLoop();
      worldContainer = null;
    };
  };

  $effect(() => {
    const updateDocumentVisibility = () => {
      isDocumentHidden = document.hidden;
    };

    updateDocumentVisibility();
    document.addEventListener("visibilitychange", updateDocumentVisibility);

    return () => {
      document.removeEventListener("visibilitychange", updateDocumentVisibility);
    };
  });

  $effect(() => {
    if (shouldAnimate) {
      startWorldLoop();
    } else {
      stopWorldLoop();
      syncWorldPosition();
    }
  });

  function handlePointerDown(e: PointerEvent) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    drag.start(e);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    drag.move(e);
  }

  function handlePointerUp(e: PointerEvent) {
    drag.stop();
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      drag.nudge(KEYBOARD_STEP_X, 0);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      drag.nudge(-KEYBOARD_STEP_X, 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      drag.nudge(0, KEYBOARD_STEP_Y);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      drag.nudge(0, -KEYBOARD_STEP_Y);
    }
  }
</script>

{#snippet frameMarker(pos: "tl" | "tr" | "bl" | "br", label: string)}
  <div class={["frame-marker", pos]}><span>{label}</span></div>
{/snippet}

<section class="collaboration" {@attach trackSectionVisibility}>
  <div class="editorial-master-frame">

    <div class="vignette-overlay"></div>

    {@render frameMarker("tl", "REF. 88 / GRID")}
    {@render frameMarker("tr", "COLLAB.ARCH.01")}
    {@render frameMarker("bl", "DRAG_ECOSYSTEM")}
    {@render frameMarker("br", "ONE HEART PRODUCTIONS")}

    <div class="fixed-label-container">
      <div class="anchor-line"></div>
      <div class="brand-lockup">
        <span class="eyebrow-spaced">Editorial Network</span>
        <h2 class="section-title">
          <span class="main-word">Collaboration</span>
          <span class="sub-line italic">Across the high-energy spectrum</span>
        </h2>
      </div>
      <div class="anchor-line bottom"></div>
    </div>

    <p class="sr-only" id="collaboration-canvas-help">
      Drag to explore the collaboration canvas. You can also use the arrow keys
      to pan the grid.
    </p>

    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class={["drag-viewport", drag.isDragging && "grabbing"]}
      role="application"
      aria-roledescription="draggable collaboration canvas"
      tabindex="0"
      aria-label="Collaboration canvas"
      aria-describedby="collaboration-canvas-help"
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onpointerup={handlePointerUp}
      onpointercancel={handlePointerUp}
      onkeydown={handleKeydown}
    >
      <div class="world-container" {@attach captureWorld}>
        {#each [camCol - 1, camCol, camCol + 1] as col (col)}
          {#each [camRow - 1, camRow, camRow + 1] as row (row)}
            <div
              class="grid-block"
              style:transform="translate3d({col * BLOCK_WIDTH}px, {row *
                BLOCK_HEIGHT}px, 0)"
              style:--tile-w="{TILE_WIDTH}px"
              style:--tile-h="{TILE_HEIGHT}px"
            >
              {#each GRID_ITEMS as imgSrc, i (`${imgSrc}-${i}`)}
                <div class="grid-item">
                  <div class="img-wrapper">
                    <enhanced:img
                      src={imgSrc}
                      alt="Artist Focus"
                      class="artist-thumb"
                      draggable="false"
                      loading="lazy"
                      sizes="(max-width: 768px) 160px, 260px"
                    />
                  </div>
                  <div class="scanning-frame"></div>
                </div>
              {/each}
            </div>
          {/each}
        {/each}
      </div>
    </div>
  </div>
</section>

<style>
  .collaboration {
    position: relative;
    height: 100vh;
    width: 100%;
    background: #000;
    overflow: hidden;
    z-index: 1;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
  }

  .editorial-master-frame {
    position: absolute;
    inset: 5vw;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: #030303;
    overflow: hidden;
    box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.9);
  }


  .vignette-overlay {
    position: absolute;
    inset: 0;
    z-index: 8;
    pointer-events: none;
    border: 1px solid rgba(255, 255, 255, 0.04);
    background: radial-gradient(
      circle at center,
      transparent 40%,
      rgba(0, 0, 0, 0.4) 100%
    );
  }

  .frame-marker {
    position: absolute;
    z-index: 12;
    padding: 1.25rem;
    font-family: var(--font-primary);
    font-size: 0.55rem;
    font-weight: 600;
    letter-spacing: 0.35em;
    color: rgba(255, 255, 255, 0.3);
    text-transform: uppercase;
  }

  .frame-marker::before {
    content: "";
    position: absolute;
    width: 20px;
    height: 20px;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .tl {
    top: 0;
    left: 0;
  }
  .tl::before {
    top: 0;
    left: 0;
    border-right: 0;
    border-bottom: 0;
  }
  .tr {
    top: 0;
    right: 0;
    text-align: right;
  }
  .tr::before {
    top: 0;
    right: 0;
    border-left: 0;
    border-bottom: 0;
  }
  .bl {
    bottom: 0;
    left: 0;
  }
  .bl::before {
    bottom: 0;
    left: 0;
    border-right: 0;
    border-top: 0;
  }
  .br {
    bottom: 0;
    right: 0;
    text-align: right;
  }
  .br::before {
    bottom: 0;
    right: 0;
    border-left: 0;
    border-top: 0;
  }

  .fixed-label-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 20;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .anchor-line {
    width: 1px;
    height: 100px;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.2),
      transparent
    );
  }

  .anchor-line.bottom {
    background: linear-gradient(to top, rgba(255, 255, 255, 0.2), transparent);
  }

  .brand-lockup {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    padding: 2.5rem 4rem;
  }

  .eyebrow-spaced {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
    margin-right: -0.5em;
  }

  .main-word {
    font-family: var(--font-heading);
    font-size: clamp(2rem, 7vw, 5rem);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #fff;
    margin-right: -0.12em;
  }

  .sub-line.italic {
    font-family: var(--font-primary);
    font-size: clamp(1.1rem, 1.8vw, 1.6rem);
    font-weight: 300;
    font-style: italic;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 0.04em;
  }

  .drag-viewport {
    position: absolute;
    inset: 0;
    z-index: 5;
    cursor: grab;
    touch-action: pan-y;
  }

  .drag-viewport.grabbing {
    cursor: grabbing;
  }

  .drag-viewport:focus-visible {
    outline: 2px solid rgba(var(--color-text-rgb), 0.92);
    outline-offset: -2px;
  }

  .world-container {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    will-change: transform;
    transform: translate3d(var(--world-x, 0), var(--world-y, 0), 0);
  }

  .grid-block {
    position: absolute;
    top: 0;
    left: 0;
    display: grid;
    grid-template-columns: repeat(5, var(--tile-w));
    grid-template-rows: repeat(4, var(--tile-h));
    backface-visibility: hidden;
  }

  .grid-item {
    width: var(--tile-w);
    height: var(--tile-h);
    background: #000;
    overflow: hidden;
    position: relative;
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .img-wrapper {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .artist-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 25%;
    opacity: 0.45;
    filter: saturate(0.6) brightness(0.7);
    transition:
      transform 1.2s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 0.8s ease,
      filter 0.8s ease;
  }

  .scanning-frame {
    position: absolute;
    inset: 0;
    border: 1px solid rgba(255, 255, 255, 0);
    pointer-events: none;
    z-index: 5;
    transition: border-color 0.4s ease;
  }

  .grid-item:hover .artist-thumb {
    opacity: 1;
    transform: scale(1.04);
    filter: saturate(1.1) brightness(1.1);
  }

  .grid-item:hover .scanning-frame {
    border-color: rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 1024px) {
    .editorial-master-frame {
      inset: 1.25rem;
    }
    .brand-lockup {
      padding: 2rem 1rem;
    }
    .frame-marker {
      padding: 0.75rem;
      font-size: 0.45rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {

    /* Remove GPU layer promotion hints — counterproductive on CPU */
    .world-container {
      will-change: auto;
    }
    .grid-block {
      backface-visibility: visible;
    }

    /* Hover transitions: keep effect, shorten duration */
    .artist-thumb {
      transition-duration: 0.15s;
    }
    .scanning-frame {
      transition-duration: 0.15s;
    }
  }
</style>
