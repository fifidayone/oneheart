<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { expoOut } from "svelte/easing";

  let showToast = $state(true);
  let autoCollapseTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

  function startAutoCollapse() {
    clearTimeout(autoCollapseTimeout);
    autoCollapseTimeout = setTimeout(() => {
      showToast = false;
    }, 15000);
  }

  function pauseAutoCollapse() {
    clearTimeout(autoCollapseTimeout);
  }

  function resumeAutoCollapse() {
    if (showToast) {
      startAutoCollapse();
    }
  }

  function dismissToast() {
    showToast = false;
    clearTimeout(autoCollapseTimeout);
  }

  onMount(() => {
    startAutoCollapse();

    return () => {
      clearTimeout(autoCollapseTimeout);
    };
  });
</script>

{#if showToast}
  <div
    class="featured-toast"
    role="region"
    aria-label="Featured Event"
    in:fly={{ y: 20, duration: 800, easing: expoOut, delay: 1500 }}
    out:fly={{ y: 20, duration: 400, opacity: 0, easing: expoOut }}
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
        <div class="toast-progress-fill"></div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes reveal-up {
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
    opacity: 0;
    transform: translateY(20px);
    animation: reveal-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.5s forwards;
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
    border: 1px solid rgba(240, 238, 233, 0.05);
    border-radius: 2px;
    padding: 12px;
    box-shadow:
      inset 0 1px 0 rgba(240, 238, 233, 0.1),
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
    border-color: rgba(240, 238, 233, 0.15);
    box-shadow:
      inset 0 1px 0 rgba(240, 238, 233, 0.2),
      0 25px 50px rgba(0, 0, 0, 0.8),
      0 0 30px rgba(240, 238, 233, 0.03);
  }

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
    font-family: "Clash Display", var(--font-primary);
    font-size: 1.1rem;
    font-weight: 500;
    margin: 0;
    line-height: 1.2;
    color: #f0eee9;
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
    background: rgba(12, 12, 12, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(240, 238, 233, 0.12);
    border-radius: 4px;
    padding: 10px 14px;
    font-family: var(--font-primary);
    font-size: 0.8rem;
    font-weight: 500;
    color: #f0eee9;
    line-height: 1.4;
    letter-spacing: 0.02em;
    text-transform: none;
    opacity: 0;
    transform: translateY(6px) scale(0.96);
    pointer-events: none;
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 20;
    box-shadow:
      inset 0 1px 1px rgba(240, 238, 233, 0.05),
      0 12px 24px rgba(0, 0, 0, 0.8),
      0 0 12px rgba(240, 238, 233, 0.03);
  }

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
      background: rgba(240, 238, 233, 0.08);
    }

    .toast-title-wrapper::after,
    .toast-title-wrapper::before {
      display: none;
    }
  }
</style>
