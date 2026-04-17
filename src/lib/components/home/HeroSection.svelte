<script lang="ts">
  import { onMount } from "svelte";
  import FeaturedToast from "$lib/components/home/FeaturedToast.svelte";
  import { wrapperScroll } from "$lib/stores/scroll.svelte";
  import { i18n } from "$lib/i18n.svelte";

  let videoReady = $state(false);
  let videoEl: HTMLVideoElement | undefined = $state();

  let textScale = $derived(Math.max(0.65, 1 - wrapperScroll.y / 1300));
  let textTranslateY = $derived(Math.min(wrapperScroll.y * 0.35, 130));

  function captureVideo(node: HTMLVideoElement) {
    videoEl = node;

    return () => {
      if (videoEl === node) {
        videoEl = undefined;
      }
    };
  }

  onMount(() => {
    if (videoEl && videoEl.readyState >= 3 && videoEl.paused === false) {
      videoReady = true;
    }

    const handleFirstInteraction = () => {
      if (videoEl && videoEl.paused) {
        videoEl.play().catch(() => {});
      }

      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  });
</script>

<div class="home">
  <div class="video-background">
    <img
      src="/media/hero-poster.avif?v=3"
      alt=""
      class="hero-poster"
      class:hidden={videoReady}
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
      class="hero-video"
      class:ready={videoReady}
    >
      <source src="/media/hero-video.mp4?v=3" type="video/mp4" />
      {i18n.t("video_fallback")}
    </video>
  </div>

  <div class="overlay"></div>

  <div
    class="center-content"
    style:transform="translateY({textTranslateY}px) scale({textScale})"
  >
    <p class="top-label">{i18n.t("hero_eyebrow")}</p>
    <h1>{i18n.t("hero_title_line1")}<br />{i18n.t("hero_title_line2")}</h1>
  </div>

  <FeaturedToast />
</div>

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
    transition: opacity 0.5s ease;
    pointer-events: none;
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
    will-change: opacity;
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
    background:
      linear-gradient(
        180deg,
        rgba(10, 10, 11, 0.18) 0%,
        rgba(10, 10, 11, 0.1) 22%,
        rgba(10, 10, 11, 0.18) 52%,
        rgba(10, 10, 11, 0.34) 100%
      ),
      linear-gradient(
        90deg,
        rgba(10, 10, 11, 0.22) 0%,
        rgba(10, 10, 11, 0.06) 24%,
        rgba(10, 10, 11, 0.06) 76%,
        rgba(10, 10, 11, 0.22) 100%
      ),
      radial-gradient(
        circle at center,
        rgba(10, 10, 11, 0.34) 0%,
        rgba(10, 10, 11, 0.7) 64%,
        rgba(10, 10, 11, 0.95) 100%
      );
    z-index: 1;
    pointer-events: none;
  }

  .center-content {
    position: relative;
    z-index: 2;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    will-change: transform;
  }

  .top-label {
    font-family: var(--font-primary);
    font-size: clamp(1.1rem, 1.8vw, 1.5rem);
    font-weight: 500;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: rgba(var(--color-text-rgb), 0.95);
    text-shadow: 0 0 30px rgba(var(--color-text-rgb), 0.15);
    margin: 0 0 1.5rem;
    display: inline-block;
    white-space: nowrap;
    opacity: 0;
    animation: reveal-up 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
    animation: reveal-up 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: 0.3s;
    will-change: transform, opacity, filter;
  }

  @media (min-width: 901px) and (max-width: 1280px) {
    .top-label {
      font-size: clamp(1rem, 1.35vw, 1.2rem);
      letter-spacing: 0.32em;
    }
  }
</style>
