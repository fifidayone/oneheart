<script lang="ts">
  import type { Attachment } from "svelte/attachments";

  let isDragging = $state(false);
  let worldContainer: HTMLElement | null = $state(null);

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  let camCol = $state(0);
  let camRow = $state(0);

  let startX = 0;
  let startY = 0;
  let velocityX = 0;
  let velocityY = 0;
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;
  let rafId: number;

  const DRIFT_X = -0.3;
  const DRIFT_Y = -0.15;

  // Responsive Grid Logic
  let innerWidth = $state(1024);
  const COLS = 5;
  const ROWS = 4;
  let TILE_WIDTH = $derived(innerWidth <= 768 ? 160 : 260);
  let TILE_HEIGHT = $derived(innerWidth <= 768 ? 213 : 347);
  
  /* Pure dimensions: utilizing inner borders natively consumes the 1px seam mathematically */
  let BLOCK_WIDTH = $derived(COLS * TILE_WIDTH);
  let BLOCK_HEIGHT = $derived(ROWS * TILE_HEIGHT);

  const captureWorld: Attachment<HTMLElement> = (node) => {
    worldContainer = node;

    function tick() {
      if (!isDragging) {
        velocityX *= 0.93;
        velocityY *= 0.93;
        if (Math.abs(velocityX) < 0.05) velocityX = 0;
        if (Math.abs(velocityY) < 0.05) velocityY = 0;

        targetX += velocityX * 10 + DRIFT_X;
        targetY += velocityY * 10 + DRIFT_Y;
      }

      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;

      if (worldContainer) {
        worldContainer.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      if (BLOCK_WIDTH > 0 && BLOCK_HEIGHT > 0) {
        const newCamCol = Math.floor(-currentX / BLOCK_WIDTH);
        const newCamRow = Math.floor(-currentY / BLOCK_HEIGHT);
        if (newCamCol !== camCol) camCol = newCamCol;
        if (newCamRow !== camRow) camRow = newCamRow;
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      worldContainer = null;
    };
  };

  function pointerDown(e: PointerEvent) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    isDragging = true;
    startX = e.clientX - targetX;
    startY = e.clientY - targetY;
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = performance.now();
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
  }

  function pointerMove(e: PointerEvent) {
    if (!isDragging) return;
    targetX = e.clientX - startX;
    targetY = e.clientY - startY;
    const now = performance.now();
    const dt = now - lastTime;
    if (dt > 1) {
      velocityX = (e.clientX - lastX) / dt;
      velocityY = (e.clientY - lastY) / dt;
    }
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = now;
  }

  function pointerUp(e: PointerEvent) {
    isDragging = false;
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
  }

  const IMAGES = [
    "/collab/anetra.avif",
    "/collab/aquria.avif",
    "/collab/marina.avif",
    "/collab/nicky.avif",
    "/collab/nymphia.avif",
  ];

  const GRID_ITEMS = [
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
  ];
</script>

<svelte:window bind:innerWidth />

{#snippet frameMarker(pos: "tl" | "tr" | "bl" | "br", label: string)}
  <div class={["frame-marker", pos]}><span>{label}</span></div>
{/snippet}

<section class="collaboration">
  <div class="editorial-master-frame">
    <!-- Texture Layers -->
    <div class="film-grain"></div>
    <div class="vignette-overlay"></div>

    <!-- Editorial Markers (Corners) -->
    {@render frameMarker("tl", "REF. 082 / COLLAB")}
    {@render frameMarker("tr", "ARC.GRID.01")}
    {@render frameMarker("bl", "INDEX_5ARTISTS")}
    {@render frameMarker("br", "ONE HEART PRODUCTIONS")}

    <!-- Centered Fixed Typography (Stationary Label) -->
    <div class="fixed-label-container">
      <div class="anchor-line"></div>
      <div class="brand-lockup">
        <span class="eyebrow-spaced">Professional Network</span>
        <h2 class="section-title">
          <span class="main-word">Collaboration</span>
          <span class="sub-line italic">Across the ecosystem</span>
        </h2>
      </div>
      <div class="anchor-line bottom"></div>
    </div>

    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class={["drag-viewport", isDragging && "grabbing"]}
      role="application"
      onpointerdown={pointerDown}
      onpointermove={pointerMove}
      onpointerup={pointerUp}
    >
      <div class="world-container" {@attach captureWorld}>
        {#each [camCol - 1, camCol, camCol + 1] as col (col)}
          {#each [camRow - 1, camRow, camRow + 1] as row (row)}
            <div
              class="grid-block"
              style:transform="translate3d({col * BLOCK_WIDTH}px, {row * BLOCK_HEIGHT}px, 0)"
              style:--tile-w="{TILE_WIDTH}px"
              style:--tile-h="{TILE_HEIGHT}px"
            >
              {#each GRID_ITEMS as imgSrc, i (`${imgSrc}-${i}`)}
                <div class="grid-item">
                  <div class="img-wrapper">
                    <img
                      src={imgSrc}
                      alt="Artist"
                      class="artist-thumb"
                      draggable="false"
                      loading="lazy"
                    />
                  </div>
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
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  /* ── Master Frame ── */
  .editorial-master-frame {
    position: absolute;
    inset: 4vw;
    border: 1px solid rgba(255, 255, 255, 0.05);
    background: #050505;
    overflow: hidden;
    box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.9);
  }

  /* ── Texture ── */
  .film-grain {
    position: absolute;
    inset: 0;
    z-index: 10;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity: 0.04;
    mix-blend-mode: overlay;
  }

  .vignette-overlay {
    position: absolute;
    inset: 0;
    z-index: 8;
    pointer-events: none;
    /* Removed fuzzy box-shadow, replaced with subtle precision inner border */
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  /* ── Editorial Markers ── */
  .frame-marker {
    position: absolute;
    z-index: 12;
    padding: 1.5rem;
    font-family: var(--font-primary, sans-serif);
    font-size: 0.55rem;
    font-weight: 500;
    letter-spacing: 0.3em;
    color: rgba(255, 255, 255, 0.25);
    text-transform: uppercase;
  }

  .frame-marker::before {
    content: "";
    position: absolute;
    width: 24px;
    height: 24px;
    border: 1px solid rgba(255, 255, 255, 0.15);
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

  /* ── Centered Fixed Typography ── */
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
    gap: 2rem;
  }

  .anchor-line {
    width: 1px;
    height: 80px;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.15), transparent);
  }

  .anchor-line.bottom {
    background: linear-gradient(to top, rgba(255, 255, 255, 0.15), transparent);
  }

  .brand-lockup {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: 3rem 5rem;
    /* Removed radial-gradient slop, relying on pure contrast */
  }

  .eyebrow-spaced {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.6em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.4);
    margin-right: -0.6em;
  }

  .section-title {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 0.9;
  }

  .main-word {
    font-family: var(--font-heading, "Inter", sans-serif);
    font-size: clamp(1.8rem, 6vw, 4.5rem);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #fff;
    margin-right: -0.15em;
  }

  .sub-line.italic {
    font-family: var(--font-primary, serif);
    font-size: clamp(1.2rem, 2vw, 1.8rem);
    font-weight: 300;
    font-style: italic;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 0.5rem;
    letter-spacing: 0.05em;
  }

  /* ── Viewport & Grid ── */
  .drag-viewport {
    position: absolute;
    inset: 0;
    z-index: 5;
    cursor: grab;
    touch-action: pan-y; /* Prevent getting stuck on mobile; allow vertical page scroll */
  }

  .drag-viewport.grabbing {
    cursor: grabbing;
  }

  .world-container {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    will-change: transform;
    transform-style: preserve-3d;
  }

  .grid-block {
    position: absolute;
    top: 0;
    left: 0;
    display: grid;
    grid-template-columns: repeat(5, var(--tile-w));
    grid-template-rows: repeat(4, var(--tile-h));
    background: transparent;
    /* GPU Stability */
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform: translateZ(0);
  }

  .grid-item {
    width: var(--tile-w);
    height: var(--tile-h);
    background: #000;
    overflow: hidden;
    position: relative;
    clip-path: inset(0);
    box-sizing: border-box;
    /* Architecture: Move the gap logic to internalized borders */
    border-right: 1px solid rgba(255, 255, 255, 0.04);
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }

  .img-wrapper {
    width: 100%;
    height: 100%;
    overflow: hidden;
    transform: translateZ(0);
  }

  .artist-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 25%;
    opacity: 0.5;
    filter: saturate(0.7) contrast(1.1) brightness(0.6); /* Muted cinematic colors for premium feel */
    transition:
      transform 1.2s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 0.8s ease,
      filter 0.8s ease;
    will-change: transform;
  }

  .grid-item:hover .artist-thumb {
    opacity: 1;
    transform: scale(1.03); /* Subtle scale for more luxury feel */
    filter: saturate(1) contrast(1) brightness(1); /* Reveal full color on hover */
  }

  @media (max-width: 1024px) {
    .editorial-master-frame {
      inset: 1.5rem;
      border-color: rgba(255, 255, 255, 0.08);
    }
    .fixed-label-container {
      width: 92%;
    }
    .anchor-line {
      display: none;
    }
    .brand-lockup {
      padding: 1.5rem 1rem;
    }
    /* Scale down markers but keep the editorial vibe */
    .frame-marker {
      padding: 0.75rem;
      font-size: 0.45rem;
      opacity: 0.7;
    }
    .frame-marker::before {
      width: 16px;
      height: 16px;
    }
  }
</style>
