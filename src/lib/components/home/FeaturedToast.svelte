<script lang="ts">
  import { expoOut } from "svelte/easing";

  /**
   * Svelte 5 Custom Transition
   * Editorial 'blurFly' with subtle scale for a premium feel.
   */
  function blurFly(node: Element, { delay = 0, duration = 800, easing = expoOut, y = 40, blur = 12 } = {}) {
    const style = getComputedStyle(node);
    const transform = style.transform === 'none' ? '' : style.transform;

    return {
      delay,
      duration,
      easing,
      css: (t: number) => `
        transform: ${transform} translate3d(0, ${(1 - t) * y}px, 0) scale(${0.98 + (t * 0.02)});
        opacity: ${t};
        filter: blur(${(1 - t) * blur}px);
      `
    };
  }

  /**
   * ToastState Manager (Svelte 5 Magic)
   * Encapsulates all logic for the toast lifecycle, timers, and progress.
   */
  class ToastManager {
    visible: boolean = $state(false);
    duration: number = 15000;
    elapsed: number = $state(0);
    paused: boolean = $state(false);
    lastTick: number = 0;
    timerId: number | null = null;

    get progress(): number {
      return Math.max(0, 100 - (this.elapsed / this.duration) * 100);
    }

    start(): void {
      if (this.visible) return;
      this.visible = true;
      this.lastTick = Date.now();
      this.tick();
    }

    tick = (): void => {
      if (!this.visible) return;
      
      if (!this.paused) {
        const now = Date.now();
        this.elapsed += now - this.lastTick;
        this.lastTick = now;

        if (this.elapsed >= this.duration) {
          this.dismiss();
          return;
        }
      } else {
        this.lastTick = Date.now(); // Keep lastTick fresh even while paused
      }

      this.timerId = requestAnimationFrame(this.tick);
    };

    pause(): void { this.paused = true; }
    resume(): void { 
      this.paused = false; 
    }

    dismiss(): void {
      this.visible = false;
      if (this.timerId) cancelAnimationFrame(this.timerId);
    }
  }

  const toast = new ToastManager();

  $effect(() => {
    // Initial delay for entrance animation
    const timer = setTimeout(() => toast.start(), 1500);
    return () => {
      clearTimeout(timer);
      toast.dismiss();
    };
  });
</script>

{#if toast.visible}
  <div
    class="featured-toast"
    role="region"
    aria-label="Featured Event"
    in:blurFly={{ duration: 1000, y: 30 }}
    out:blurFly={{ duration: 450, y: 20, blur: 6 }}
    onmouseenter={() => toast.pause()}
    onmouseleave={() => toast.resume()}
  >
    <div class={["toast-glass", { "is-paused": toast.paused }]}>
      <button
        class="toast-quiet-close"
        onclick={() => toast.dismiss()}
        aria-label="Dismiss featured event: GAWDLAND Down Under"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <div class="toast-img-wrapper">
        <picture>
           <source src="/hero/gawdland.avif" type="image/avif" />
           <img
            src="/hero/gawdland.avif"
            alt="Featured Event"
            class="toast-img"
            width="80"
            height="80"
            loading="eager"
          />
        </picture>
      </div>
      <div class="toast-info">
        <span class="toast-eyebrow">UPCOMING SHOW</span>
        <div class="toast-title-wrapper" data-full-title="GAWDLAND Down Under">
          <h3 class="toast-title">GAWDLAND Down Under</h3>
        </div>
        <span class="toast-meta">Thu, Jun 04 &bull; Melbourne</span>
      </div>
      <a
        href="/upcoming"
        class="toast-btn"
        aria-label="View details for GAWDLAND Down Under"
      >
        DISCOVER
      </a>
      <div class="toast-progress-bar">
        <div 
          class="toast-progress-fill" 
          style:transform="scaleX({toast.progress / 100})"
        ></div>
      </div>
    </div>
  </div>
{/if}

<style>
  .featured-toast {
    position: absolute;
    bottom: clamp(2rem, 5vh, 4rem);
    right: var(--nav-edge, 2rem);
    z-index: 10;
    color: var(--color-text);
    pointer-events: none;
  }

  .toast-glass {
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgb(12, 12, 12);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border: 1px solid rgba(var(--color-text-rgb), 0.15);
    border-radius: 4px;
    padding: 12px;
    /* Zero Shadow for maximum sharpness */
    box-shadow: none;
    width: 380px;
    position: relative;
    pointer-events: auto;
    transition:
      background 0.4s ease,
      border-color 0.4s ease,
      box-shadow 0.4s ease;
    isolation: isolate;
  }

  .toast-glass:hover {
    border-color: rgba(var(--color-text-rgb), 0.35);
    box-shadow: none;
    background: rgba(15, 15, 15, 1);
  }

  .toast-quiet-close {
    position: absolute;
    top: -12px;
    right: -12px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--color-bg-rgb), 0.9);
    border: 1px solid rgba(var(--color-text-rgb), 0.1);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
    color: rgba(var(--color-text-rgb), 0.4);
    cursor: pointer;
    border-radius: 50%;
    /* Forced GPU promotion */
    transform: translateZ(0) scale(0.8);
    opacity: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transition: 
      opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
      background 0.3s ease,
      color 0.3s ease;
    z-index: 20;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  /* Absolute Centering for the icon inside the ring */
  .toast-quiet-close svg {
    position: absolute;
    top: 50%;
    left: 50%;
    /* translate(-50%, -50%) is the most stable centering method for SVGs */
    transform: translate(-50%, -50%) translateZ(0);
    display: block;
    flex-shrink: 0;
  }

  /* Standard 44px hit target for touch safety */
  .toast-quiet-close::after {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 50%;
  }

  .toast-glass:hover .toast-quiet-close,
  .toast-quiet-close:focus-visible {
    opacity: 1;
    transform: translateZ(0) scale(1);
  }

  .toast-quiet-close:hover {
    color: var(--color-text);
    background: var(--color-bg-alt);
    border-color: rgba(var(--color-text-rgb), 0.3);
    transform: translateZ(0) scale(1.1);
  }

  .toast-img-wrapper {
    width: 72px;
    height: 72px;
    flex-shrink: 0;
    border-radius: 2px;
    overflow: hidden;
    background: rgba(var(--color-text-rgb), 0.05);
  }

  .toast-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.9) contrast(1.1);
    transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .toast-glass:hover .toast-img {
    transform: scale(1.1);
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
    font-weight: 600;
    letter-spacing: 0.25em;
    color: rgba(var(--color-text-rgb), 0.45);
    text-transform: uppercase;
  }

  .toast-title {
    font-family: "Clash Display", var(--font-primary);
    font-size: 1.1rem;
    font-weight: 500;
    margin: 0;
    line-height: 1.2;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .toast-title-wrapper {
    position: relative;
    display: block;
    max-width: 100%;
    cursor: default;
  }

  /* The 'Pop Up' Tooltip Content */
  .toast-title-wrapper::after {
    content: attr(data-full-title);
    position: absolute;
    bottom: calc(100% + 14px);
    left: -8px;
    width: max-content;
    max-width: 280px;
    white-space: normal;
    background: rgb(15, 15, 16);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border: 1px solid rgba(var(--color-text-rgb), 0.12);
    border-radius: 4px;
    padding: 10px 14px;
    font-family: var(--font-primary);
    font-size: 0.82rem;
    font-weight: 500;
    line-height: 1.4;
    color: var(--color-text);
    /* High-end Precision Popups */
    box-shadow: 
      inset 0 1px 0 rgba(var(--color-text-rgb), 0.15),
      0 10px 20px rgba(0, 0, 0, 0.8);
    opacity: 0;
    transform: translateY(8px) scale(0.98);
    pointer-events: none;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 30;
  }

  /* The 'Pointer' Arrow */
  .toast-title-wrapper::before {
    content: "";
    position: absolute;
    bottom: calc(100% + 10px);
    left: 14px;
    width: 8px;
    height: 8px;
    background: rgba(10, 10, 11, 0.94);
    border-right: 1px solid rgba(var(--color-text-rgb), 0.12);
    border-bottom: 1px solid rgba(var(--color-text-rgb), 0.12);
    transform: rotate(45deg) translateY(4px);
    opacity: 0;
    pointer-events: none;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 31;
  }

  .toast-title-wrapper:hover::after,
  .toast-title-wrapper:hover::before {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0deg);
  }

  .toast-title-wrapper:hover::before {
    transform: rotate(45deg);
  }

  .toast-meta {
    font-family: var(--font-primary);
    font-size: 0.65rem;
    color: rgba(var(--color-text-rgb), 0.5);
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
    border: 1px solid rgba(var(--color-text-rgb), 0.2);
    background: transparent;
    color: var(--color-text);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    white-space: nowrap;
  }

  .toast-btn:hover {
    background: var(--color-text);
    color: var(--color-bg);
    border-color: var(--color-text);
    transform: translateY(-1px);
  }

  .toast-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: rgba(var(--color-text-rgb), 0.05);
    overflow: hidden;
  }

  .toast-progress-fill {
    width: 100%;
    height: 100%;
    background: rgba(var(--color-text-rgb), 0.4);
    transform-origin: left;
    /* Transformation handled via style:transform for performance */
    transition: transform 0.1s linear;
  }

  @media (max-width: 1024px) {
    .featured-toast {
      right: 0;
      left: 0;
      margin: 0 auto;
      width: max-content;
      bottom: calc(2.5rem + env(safe-area-inset-bottom));
    }

    .toast-glass {
      width: clamp(320px, 92vw, 360px);
      gap: 12px;
    }
    
    .toast-img-wrapper {
      width: 60px;
      height: 60px;
    }
  }

  @media (hover: none), (pointer: coarse) {
    .toast-quiet-close {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
