<script lang="ts">
  import { onMount } from "svelte";

  let player: any;
  let isFading = $state(false);

  onMount(() => {
    // Load YouTube API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // This function must be on window for the API to call it
    (window as any).onYouTubeIframeAPIReady = () => {
      player = new (window as any).YT.Player("youtube-player", {
        videoId: "5iHF-RBn0Lk",
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          playsinline: 1,
          start: 172,
          vq: "hd1080",
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.ENDED = 0
            if (event.data === 0) {
              isFading = true;
              setTimeout(() => {
                player.seekTo(172);
                player.playVideo();
                setTimeout(() => {
                  isFading = false;
                }, 500);
              }, 300);
            }
          },
        },
      });
    };

    return () => {
      if (player) {
        player.destroy();
      }
    };
  });
</script>

<div class="home">
  <!-- Video Background -->
  <div class="video-background" class:fading={isFading}>
    <div id="youtube-player"></div>
  </div>

  <!-- Dark & Grain Overlay -->
  <div class="overlay"></div>

  <!-- Center Screen Content -->
  <div class="center-content">
    <p class="top-label">Power As One</p>
    <h1>ONE HEART<br />PRODUCTIONS</h1>
  </div>

  <!-- Bottom Pinned Row -->
  <div class="bottom-row">
    <span class="col-left">Based In Asia • Global Standard</span>
    <span class="col-center"
      >Specializing in International & Premium Productions</span
    >
    <span class="col-right">Professional • Cultural</span>
  </div>
</div>

<style>
  @keyframes revealUp {
    0% {
      transform: translateY(50px);
      opacity: 0;
      filter: blur(10px);
    }
    100% {
      transform: translateY(0);
      opacity: 1;
      filter: blur(0);
    }
  }

  @keyframes pulseNeon {
    0%,
    100% {
      opacity: 0.8;
    }
    50% {
      opacity: 1;
      text-shadow: 0 0 20px rgba(240, 238, 233, 0.2);
    }
  }

  .home {
    min-height: 100vh;
    background: #282c30;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  /* Video Background Setup */
  .video-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;
    transition: opacity 0.5s ease;
  }

  .video-background.fading {
    opacity: 0;
  }

  .video-background :global(iframe),
  #youtube-player {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100vw;
    height: 56.25vw; /* 16:9 aspect ratio */
    min-height: 100vh;
    min-width: 177.77vh; /* 16:9 aspect ratio */
    /* ซูม 1.15 เท่า เพื่อซ่อนโลโก้และขอบ UI ของ YouTube ทั้งหมด */
    transform: translate(-50%, -50%) scale(1.15);
    pointer-events: none; /* ห้าม interact ใดๆ */
  }

  /* Overlay: ฟิลเตอร์จางดำ + Grain Effect */
  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(14, 14, 15, 0.7); /* ฉากดำโปร่งแสง ทำให้ตัวหนังสือเด่น */
    z-index: 1;
    pointer-events: none;
  }

  .overlay::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.12; /* ปรับระดับความชัดของเม็ดเกรน */
    mix-blend-mode: overlay;
    pointer-events: none;
  }

  .center-content {
    position: relative;
    z-index: 2; /* ให้อยู่เหนือวีดีโอและฟิลเตอร์ */
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* ขยับขึ้นนิดหน่อยเพื่อ Balance กับ Bottom Row */
    transform: translateY(-2rem);
  }

  .top-label {
    font-family: "Outfit", sans-serif;
    font-size: clamp(1.1rem, 1.8vw, 1.5rem); /* ใหญ่ขึ้นนิดนึงดูมีน้ำหนัก */
    font-weight: 500; /* เปลี่ยนจาก 300 เป็น 500 เพื่อความชัดเจน */
    letter-spacing: 0.4em; /* ช่องไฟกว้างขึ้นอีกนิดเพื่อให้ดูแกรนด์ */
    text-transform: uppercase;
    color: rgba(240, 238, 233, 0.9); /* ชัดขึ้นกว่าเดิมนิดหน่อย */
    margin: 0 0 1.5rem;
    opacity: 0;
    animation: revealUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: 0.2s;
  }

  h1 {
    font-family: "Outfit", sans-serif;
    font-size: clamp(2.5rem, 7.5vw, 8rem);
    font-weight: 700;
    letter-spacing: 0.02em; /* ช่องไฟกว้างขึ้นนิดนึงดูมีระดับ */
    line-height: 0.95;
    color: #f0eee9;
    margin: 0;
    text-transform: uppercase;
    opacity: 0;
    animation: revealUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: 0.4s;
  }

  .bottom-row {
    position: absolute;
    z-index: 2; /* ให้อยู่เหนือวีดีโอและฟิลเตอร์ */
    bottom: 3.5rem;
    left: 3.5rem;
    right: 3.5rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    opacity: 0;
    animation: revealUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: 0.6s;
  }

  .bottom-row span {
    font-size: clamp(0.6rem, 1vw, 0.75rem);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(240, 238, 233, 0.5);
    flex: 1;
  }

  .col-left {
    text-align: left;
  }
  .col-center {
    text-align: center;
  }
  .col-right {
    text-align: right;
  }

  /* Responsive fixes */
  @media (max-width: 1024px) {
    .bottom-row {
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      bottom: 2rem;
      left: 1.5rem;
      right: 1.5rem;
    }
    .bottom-row span {
      text-align: center;
    }
  }
</style>
