<script lang="ts">
  import type { Attachment } from 'svelte/attachments';
  import FeaturedToast from "$lib/components/home/FeaturedToast.svelte";
  import { getScrollState } from "$lib/stores/scroll.svelte";

  const wrapperScroll = getScrollState();

  const BRANDS = $state.raw([
    { id: "cafedalida", label: "Cafe Dalida", src: "/hero/brands/brand_cafedalida.webp" },
    { id: "cumparty", label: "Cumparty", src: "/hero/brands/brand_cumparty.webp" },
    { id: "drthaifans", label: "Dr Thai Fans", src: "/hero/brands/brand_drthaifans.webp" },
    { id: "laganja", label: "Laganja", src: "/hero/brands/brand_laganja.webp" },
    { id: "prismgalaxia", label: "Prism Galaxia", src: "/hero/brands/brand_prismgalaxia.webp" },
  ]);

  let videoReady = $state(false);
  let videoEl: HTMLVideoElement | undefined = $state();

  let textScale = $derived(Math.max(0.65, 1 - wrapperScroll.y / 1300));
  let textTranslateY = $derived(Math.min(wrapperScroll.y * 0.35, 130));

  const captureVideo: Attachment<HTMLVideoElement> = (node) => {
    videoEl = node;

    return () => {
      if (videoEl === node) {
        videoEl = undefined;
      }
    };
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
    window.addEventListener("touchstart", handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  });
</script>

{#snippet brandItem(brand: (typeof BRANDS)[number], index: number)}
  <a
    href="#{brand.id}"
    class="brand-item"
    aria-label={brand.label}
  >
    <picture>
      <source src={brand.src.replace('.webp', '.avif')} type="image/avif" />
      <img
        src={brand.src}
        alt={brand.label}
        width="32"
        height="32"
        loading="eager"
        decoding="async"
      />
    </picture>
  </a>
{/snippet}

<div class="home">
  <div class="video-background">
    <img
      src="/media/hero-poster.avif?v=3"
      alt=""
      class={["hero-poster", videoReady && "hidden"]}
      width="1920"
      height="1080"
    />

    <video
      {@attach captureVideo}
      poster="/media/hero-poster.avif?v=3"
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
      <source src="/media/hero-video.mp4?v=3" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>

  <div class="film-grain"></div>
  <div class="overlay"></div>

  <div class="brands-bar-container">
    <div class="brands-bar-glass">
      <span class="power-as-one">POWER AS ONE</span>
      <div class="brands-divider"></div>
      <div class="brands-list">
        {#each BRANDS as brand, i (brand.id)}
          {@render brandItem(brand, i)}
        {/each}
      </div>
    </div>
  </div>

  <div
    class="center-content"
    style:transform="translateY({textTranslateY}px) scale({textScale})"
  >
    <img
      src="/hero/brands/main_oneheart.webp"
      alt="One Heart Main Logo"
      class="main-oneheart-logo"
      width="160"
      height="160"
      decoding="async"
      loading="eager"
    />
    <h1>ONE HEART<br />PRODUCTIONS</h1>
  </div>

  <FeaturedToast />
</div>

<style>
  @keyframes reveal-up {
    0% {
      transform: translateY(40px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
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
    /* Lightened cinematic suppression for better visibility */
    filter: brightness(0.45) saturate(0.75);
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
    /* Lightened deep shadow for better video visibility */
    background: linear-gradient(
      to bottom,
      rgba(10, 10, 11, 0.25) 0%,
      rgba(10, 10, 11, 0.6) 72%,
      rgba(10, 10, 11, 0.9) 100%
    );
    z-index: 1;
    pointer-events: none;
  }

  .film-grain {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity: 0.04;
    mix-blend-mode: overlay;
  }

  .center-content {
    position: relative;
    z-index: 10; /* Maximize typographic dominance on shadow */
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    will-change: transform;
  }

  .main-oneheart-logo {
    width: 160px;
    height: auto;
    margin-bottom: 2rem;
    opacity: 0;
    animation: reveal-up 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: 0.1s;
    filter: none;
    -webkit-filter: none;
  }

  h1 {
    font-family: var(--font-primary);
    font-size: clamp(2rem, 5.5vw, 5.5rem);
    font-weight: 700;
    letter-spacing: 0.03em;
    line-height: 0.95;
    color: var(--color-text);
    text-shadow: none;
    margin: 0;
    text-transform: uppercase;
    opacity: 0;
    animation: reveal-up 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: 0.3s;
    will-change: transform, opacity;
  }

  .brands-bar-container {
    position: absolute;
    top: clamp(1.5rem, 4vh, 2.5rem);
    right: var(--nav-edge, 2rem);
    z-index: 10;
    opacity: 0;
    animation: reveal-up 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: 0.4s;
    pointer-events: none;
  }

  .brands-bar-glass {
    display: flex;
    align-items: center;
    gap: 20px;
    border: 1px solid rgba(var(--color-text-rgb), 0.15);
    border-radius: 4px;
    padding: 10px 20px;
    /* Zero Shadow */
    box-shadow: none;
    pointer-events: auto;
    position: relative;
    overflow: hidden;
    isolation: isolate;
    transition:
      border-color 0.4s ease,
      box-shadow 0.4s ease;
  }

  /* Glass background layer — isolated from content compositing. */
  .brands-bar-glass::after {
    content: "";
    position: absolute;
    inset: 0;
    /* Solid background for absolute sharpness */
    background: rgb(12, 12, 12);
    z-index: -1;
    pointer-events: none;
  }

  /* Removed sweeping light to eliminate fuzziness */
  .brands-bar-glass::before {
    display: none;
  }

  /* Zero Shadow - Only Border Contrast */
  .brands-bar-glass:hover {
    border-color: rgba(var(--color-text-rgb), 0.3);
    box-shadow: none;
    background: rgba(15, 15, 15, 1);
  }

  .power-as-one {
    font-family: var(--font-primary);
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.35em;
    color: rgba(var(--color-text-rgb), 0.45);
    text-transform: uppercase;
    white-space: nowrap;
    transition: color 0.4s ease;
  }

  .brands-bar-glass:hover .power-as-one {
    color: rgba(var(--color-text-rgb), 0.9);
  }

  .brands-divider {
    width: 1px;
    height: 20px;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(var(--color-text-rgb), 0.12),
      transparent
    );
  }

  .brands-list {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .brand-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
  }

  /* Pure CSS brightness transitions. backdrop-filter is on a separate
     ::after layer. We use filter: brightness() + blur(0px) to force
     a permanent high-quality GPU rendering path for the icons. */
  .brand-item img {
    width: 32px;
    height: 32px;
    object-fit: contain;
    /* Force GPU rendering and prevent 'mode switching' blur */
    filter: brightness(0.75) blur(0px);
    -webkit-filter: brightness(0.75) blur(0px);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    image-rendering: -webkit-optimize-contrast;
    transition: filter 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* When any logo is hovered, dim others slightly more via brightness */
  .brands-list:hover .brand-item img {
    filter: brightness(0.35) blur(0px);
    -webkit-filter: brightness(0.35) blur(0px);
  }

  /* The actually hovered logo goes full brightness */
  .brands-list .brand-item:hover img,
  .brands-list .brand-item:focus-visible img {
    filter: brightness(1) blur(0px);
    -webkit-filter: brightness(1) blur(0px);
  }

  /* Underline sweep — appears on hover, slides in from left */
  .brand-item::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 4px;
    right: 4px;
    height: 1px;
    background: rgba(var(--color-text-rgb), 0.6);
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .brand-item:hover::after,
  .brand-item:focus-visible::after {
    transform: scaleX(1);
  }

  @media (max-width: 900px) {
    .brands-bar-container {
      top: 1.5rem;
      right: 0;
      left: 0;
      display: flex;
      justify-content: center;
    }

    .brands-bar-glass {
      padding: 6px 16px;
      gap: 12px;
    }

    .power-as-one {
      font-size: 0.55rem;
      letter-spacing: 0.25em;
    }

    .brand-item img {
      width: 24px;
      height: 24px;
    }

    .brands-list {
      gap: 10px;
    }

    .brands-divider {
      height: 16px;
    }
  }
</style>
