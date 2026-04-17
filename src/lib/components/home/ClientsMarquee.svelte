<script lang="ts">
  import { i18n } from "$lib/i18n.svelte";

  const BRANDS = [
    {
      label: "DISCORD",
      path: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z",
    },
    {
      label: "GOOGLE",
      path: "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z",
    },
    {
      label: "SPOTIFY",
      path: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.36-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.239.54-.959.72-1.56.3z",
    },
    {
      label: "APPLE",
      path: "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.484-4.665 2.597-4.735-1.44-2.067-3.666-2.316-4.475-2.388-1.922-.169-3.765 1.28-4.525 1.28zm2.443-3.61c.642-.779 1.054-1.84 1.013-2.915-1.012.046-2.107.561-2.736 1.332-.572.636-1.054 1.697-.948 2.768 1.11.084 2.04-.545 2.671-1.185z",
    },
    {
      label: "NETFLIX",
      path: "M11.965 2v19.467c0 .292-.258.533-.554.533H2.034C.913 22 0 21.1 0 19.99V4.01C0 2.9.913 2 2.034 2h9.931zm10.001 0v19.467c0 .292-.257.533-.554.533h-9.378c-1.121 0-2.034-.9-2.034-2.01V4.01c0-1.11.913-2.01 2.034-2.01h9.378c.297 0 .554.241.554.533zM18.89 15.688l-3.33-4.596 3.195-4.408h-2.146l-2.01 3.01c-.131.21-.242.42-.333.64h-.05c-.08-.22-.19-.43-.322-.64l-1.97-3.01h-2.04l3.125 4.308-3.235 4.696h2.156l2.193-3.3c.121-.19.222-.4.302-.59h.04c.08.19.182.4.312.59l2.253 3.3h2.062z",
    },
    {
      label: "TIKTOK",
      path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.32 14.5l-4.14-2.45V8h1.5v5.2l3.41 2.06-.77 1.24z",
    },
    {
      label: "META",
      path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 12c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4zm8 0c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4zm8 0c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4z",
    },
  ];
</script>

<section class="clients-section">
  <div class="clients-grid">
    <div class="clients-header-col">
      <div class="glow-dot"></div>
      <span class="clients-label">{i18n.t("home_marquee")}</span>
    </div>

    <div class="marquee-col">
      <div class="marquee-container">
        <div class="marquee-content">
          {#each [1, 2] as duplicate (duplicate)}
            <div class="logo-group">
              {#each BRANDS as brand (brand.label)}
                <div class="brand">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d={brand.path}></path>
                  </svg>
                  <span>{brand.label}</span>
                </div>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  @keyframes dot-pulse {
    0%,
    100% {
      opacity: 0.3;
      transform: scale(0.8);
      box-shadow: 0 0 0 rgba(var(--color-text-rgb), 0);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
      box-shadow: 0 0 8px rgba(var(--color-text-rgb), 0.8);
    }
  }

  @keyframes marquee {
    to {
      transform: translateX(-50%);
    }
  }

  .clients-section {
    position: relative;
    z-index: 2;
    background: var(--color-bg-panel);
    border-top: 1px solid rgba(var(--color-text-rgb), 0.06);
    border-bottom: 1px solid rgba(var(--color-text-rgb), 0.06);
  }

  .clients-grid {
    display: grid;
    grid-template-columns: max-content 1fr;
    width: 100%;
    min-height: 60px;
  }

  .clients-header-col {
    display: flex;
    align-items: center;
    padding: 0.6rem 1.5rem 0.6rem clamp(1.25rem, 3vw, var(--fluid-edge));
    border-right: 1px solid rgba(var(--color-text-rgb), 0.06);
    gap: 0.75rem;
  }

  .marquee-col {
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
  }

  .glow-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--color-text);
    animation: dot-pulse 1.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
    flex-shrink: 0;
  }

  .clients-label {
    font-family: var(--font-primary);
    font-size: clamp(0.65rem, 0.8vw, 0.75rem);
    letter-spacing: 0.25em;
    text-transform: uppercase;
    font-weight: 500;
    color: rgba(var(--color-text-rgb), 0.75);
    line-height: 1.4;
    white-space: nowrap;
  }

  .marquee-container {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    mask-image: linear-gradient(
      to right,
      transparent,
      rgba(var(--color-bg-rgb), 1) 15%,
      rgba(var(--color-bg-rgb), 1) 85%,
      transparent
    );
    -webkit-mask-image: linear-gradient(
      to right,
      transparent,
      rgba(var(--color-bg-rgb), 1) 15%,
      rgba(var(--color-bg-rgb), 1) 85%,
      transparent
    );
  }

  .marquee-content {
    display: flex;
    width: max-content;
    animation: marquee 16s linear infinite;
    will-change: transform;
  }

  .logo-group {
    display: flex;
    align-items: center;
    gap: 5vw;
    padding-right: 5vw;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: rgba(var(--color-text-rgb), 0.35);
    transition:
      color 0.4s cubic-bezier(0.32, 0, 0.15, 1),
      transform 0.4s cubic-bezier(0.32, 0, 0.15, 1),
      filter 0.4s ease;
    cursor: default;
    filter: grayscale(100%);
    will-change: transform, color, filter;
  }

  .brand:hover {
    color: var(--color-white);
    filter: grayscale(0%) drop-shadow(0 0 12px rgba(var(--color-white-rgb), 0.3));
    transform: scale(1.05) translateY(-2px);
  }

  .brand svg {
    width: clamp(16px, 1.6vw, 22px);
    height: clamp(16px, 1.6vw, 22px);
    transition: filter 0.5s ease;
  }

  .brand span {
    font-family: var(--font-primary);
    font-size: clamp(0.85rem, 1vw, 1.1rem);
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .brand:hover span {
    color: var(--color-white);
    -webkit-text-stroke: 0;
    text-shadow: none;
  }

  @media (max-width: 900px) {
    .clients-grid {
      grid-template-columns: 1fr;
      min-height: auto;
    }

    .clients-header-col {
      border-right: none;
      border-bottom: 1px solid rgba(var(--color-text-rgb), 0.06);
      padding: 0.8rem 1.5rem;
      justify-content: center;
    }

    .marquee-col {
      padding: 0.8rem 0;
    }

    .logo-group {
      gap: 15vw;
      padding-right: 15vw;
    }
  }
</style>
