<script lang="ts">
  import { onMount } from "svelte";
  import { expoOut } from "svelte/easing";
  import { i18n } from "$lib/i18n.svelte";

  function blurFly(node: Element, { delay = 0, duration = 800, easing = expoOut, y = 40, blur = 8 } = {}) {
    const style = getComputedStyle(node);
    const transform = style.transform === 'none' ? '' : style.transform;

    return {
      delay,
      duration,
      easing,
      css: (t: number) => `
        transform: ${transform} translate3d(0, ${(1 - t) * y}px, 0);
        opacity: ${t};
        filter: blur(${(1 - t) * blur}px);
      `
    };
  }

  let showToast = $state(false);
  let autoCollapseTimeout: ReturnType<typeof setTimeout> | undefined = undefined;
  
  let remainingTime = 15000;
  let lastStartTime = 0;
  let isPaused = false;

  function startAutoCollapse() {
    clearTimeout(autoCollapseTimeout);
    isPaused = false;
    lastStartTime = Date.now();
    autoCollapseTimeout = setTimeout(() => {
      dismissToast();
    }, remainingTime);
  }

  function pauseAutoCollapse() {
    if (isPaused) return;
    isPaused = true;
    clearTimeout(autoCollapseTimeout);
    const elapsed = Date.now() - lastStartTime;
    remainingTime = Math.max(0, remainingTime - elapsed);
  }

  function resumeAutoCollapse() {
    if (!isPaused) return;
    isPaused = false;
    if (showToast) {
      if (remainingTime > 0) {
        startAutoCollapse();
      } else {
        dismissToast();
      }
    }
  }

  function dismissToast() {
    showToast = false;
    clearTimeout(autoCollapseTimeout);
  }

  onMount(() => {
    // Best Practice: Delay rendering cleanly so hover events and 
    // the progress bar CSS animation are perfectly synchronized.
    const initDelay = setTimeout(() => {
      showToast = true;
      startAutoCollapse();
    }, 1500);

    return () => {
      clearTimeout(initDelay);
      clearTimeout(autoCollapseTimeout);
    };
  });
</script>

{#if showToast}
  <div
    class="featured-toast"
    role="region"
    aria-label="Featured Event"
    in:blurFly={{ duration: 1000, y: 30, blur: 12 }}
    out:blurFly={{ duration: 450, y: 20, blur: 6 }}
    onmouseenter={pauseAutoCollapse}
    onmouseleave={resumeAutoCollapse}
  >
    <div class="toast-glass">
      <button
        class="toast-quiet-close"
        onclick={dismissToast}
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
        <img
          src="/hero/gawdland.avif"
          alt="Featured Event"
          class="toast-img"
          width="500"
          height="500"
        />
      </div>
      <div class="toast-info">
        <span class="toast-eyebrow">{i18n.t("toast_eyebrow")}</span>
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
        {i18n.t("toast_cta")}
      </a>
      <div class="toast-progress-bar">
        <div class="toast-progress-fill"></div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes shrink-line {
    0% {
      transform: scaleX(1);
    }
    100% {
      transform: scaleX(0);
    }
  }

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
    background: linear-gradient(
      135deg,
      rgba(15, 15, 15, 0.85) 0%,
      rgba(5, 5, 5, 0.95) 100%
    );
    backdrop-filter: blur(32px);
    -webkit-backdrop-filter: blur(32px);
    border: 1px solid rgba(var(--color-text-rgb), 0.05);
    border-radius: 2px;
    padding: 12px;
    box-shadow:
      inset 0 1px 0 rgba(var(--color-text-rgb), 0.1),
      0 20px 40px rgba(0, 0, 0, 0.6);
    width: 380px;
    position: relative;
    pointer-events: auto;
    transition:
      background 0.4s ease,
      border-color 0.4s ease,
      box-shadow 0.4s ease;
  }

  .toast-glass:hover {
    background: linear-gradient(
      135deg,
      rgba(25, 25, 25, 0.9) 0%,
      rgba(10, 10, 10, 1) 100%
    );
    border-color: rgba(var(--color-text-rgb), 0.15);
    box-shadow:
      inset 0 1px 0 rgba(var(--color-text-rgb), 0.2),
      0 25px 50px rgba(0, 0, 0, 0.8),
      0 0 30px rgba(var(--color-text-rgb), 0.03);
  }

  .toast-quiet-close {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--color-bg-rgb), 0.95);
    border: 1px solid rgba(var(--color-text-rgb), 0.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    color: rgba(var(--color-text-rgb), 0.5);
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 20;
    opacity: 0;
    transform: scale(0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  /* Expand hit target invisibly for better touch interface (28px + 8px + 8px = 44px) */
  .toast-quiet-close::after {
    content: '';
    position: absolute;
    top: -8px;
    left: -8px;
    right: -8px;
    bottom: -8px;
    border-radius: 50%;
  }

  .toast-glass:hover .toast-quiet-close {
    opacity: 1;
    transform: scale(1);
  }

  .toast-quiet-close:focus-visible {
    opacity: 1;
    transform: scale(1);
    outline: 2px solid rgba(var(--color-text-rgb), 0.6);
    outline-offset: 2px;
  }

  .toast-quiet-close:hover {
    color: var(--color-text);
    background: rgba(var(--color-bg-alt-rgb), 0.95);
    border-color: rgba(var(--color-text-rgb), 0.2);
    transform: scale(1.05);
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
    transition:
      filter 0.6s ease,
      transform 0.6s ease;
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
    color: rgba(var(--color-text-rgb), 0.4);
    text-transform: uppercase;
  }

  .toast-title-wrapper {
    position: relative;
    display: block;
    max-width: 100%;
    cursor: default;
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

  .toast-title-wrapper::after {
    content: attr(data-full-title);
    position: absolute;
    bottom: calc(100% + 14px);
    left: -4px;
    width: max-content;
    max-width: 280px;
    white-space: normal;
    background: rgba(var(--color-bg-rgb), 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(var(--color-text-rgb), 0.12);
    border-radius: 4px;
    padding: 10px 14px;
    font-family: var(--font-primary);
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--color-text);
    line-height: 1.4;
    letter-spacing: 0.02em;
    text-transform: none;
    opacity: 0;
    transform: translateY(6px) scale(0.96);
    pointer-events: none;
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 20;
    box-shadow:
      inset 0 1px 1px rgba(var(--color-text-rgb), 0.05),
      0 12px 24px rgba(0, 0, 0, 0.8),
      0 0 12px rgba(var(--color-text-rgb), 0.03);
  }

  .toast-title-wrapper::before {
    content: "";
    position: absolute;
    bottom: calc(100% + 10px);
    left: 12px;
    width: 8px;
    height: 8px;
    background: rgba(var(--color-bg-rgb), 0.95);
    border-right: 1px solid rgba(var(--color-text-rgb), 0.12);
    border-bottom: 1px solid rgba(var(--color-text-rgb), 0.12);
    transform: rotate(45deg) translateY(4px) scale(0.96);
    opacity: 0;
    pointer-events: none;
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 21;
  }

  .toast-title-wrapper:hover::after {
    opacity: 1;
    transform: translateY(0) scale(1);
    transition-delay: 0.25s;
  }

  .toast-title-wrapper:hover::before {
    opacity: 1;
    transform: rotate(45deg) translateY(0) scale(1);
    transition-delay: 0.25s;
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
    border: 1px solid rgba(var(--color-text-rgb), 0.15);
    background: transparent;
    color: var(--color-text);
    flex-shrink: 0;
    transition: all 0.3s ease;
    white-space: nowrap;
    cursor: pointer;
  }

  .toast-btn:hover {
    background: var(--color-text);
    color: var(--color-bg);
    border-color: var(--color-text);
  }

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
    background: rgba(var(--color-text-rgb), 0.3);
    transform-origin: left;
    animation: shrink-line 15s linear forwards;
  }

  .featured-toast:hover .toast-progress-fill {
    animation-play-state: paused;
  }

  @media (max-width: 1024px) {
    .featured-toast {
      right: 0;
      left: 0;
      margin: 0 auto;
      width: max-content;
      bottom: calc(2rem + env(safe-area-inset-bottom));
    }

    .toast-glass {
      width: clamp(300px, 90vw, 360px);
    }
  }

  @media (hover: none), (pointer: coarse) {
    .toast-quiet-close {
      opacity: 1;
      transform: scale(1);
    }

    .toast-title-wrapper::after,
    .toast-title-wrapper::before {
      display: none;
    }
  }
</style>
