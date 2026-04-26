<script lang="ts">
  import type { BrandGroup } from "$lib/content/brands";

  interface Props {
    group: BrandGroup;
  }

  let { group }: Props = $props();
  let isMulti = $derived(group.brands.length > 1);
  let lines = $derived(group.displayLabel.split("\n"));
  let justify = $derived(group.align === "right" ? "flex-end" : "flex-start");
</script>

{#if isMulti}
  <div class="brand-cell multi" style:justify-content={justify}>
    <span class="spin-frame">
      <span class="spin-text">
        {#each lines as line, i}{#if i > 0}<br />{/if}{line}{/each}
      </span>
      <span class="spin-logo multi-logos">
        {#each group.brands as brand, i (brand.key)}
          {#if i > 0}
            <span class="logo-divider" aria-hidden="true"></span>
          {/if}
          <a
            href={brand.href}
            target="_blank"
            rel="noopener noreferrer"
            class="logo-box brand-logo-link"
            style:--scale={brand.scale ?? 1}
            aria-label={brand.label}
          >
            <img src={brand.logo} alt={brand.label} class="brand-logo" />
          </a>
        {/each}
      </span>
    </span>
  </div>
{:else}
  <a
    href={group.brands[0].href}
    target="_blank"
    rel="noopener noreferrer"
    class="brand-cell single"
    style:justify-content={justify}
    aria-label={group.brands[0].label}
  >
    <span class="spin-frame">
      <span class="spin-text">
        {#each lines as line, i}{#if i > 0}<br />{/if}{line}{/each}
      </span>
      <span class="spin-logo">
        <span class="logo-box" style:--scale={group.brands[0].scale ?? 1}>
          <img src={group.brands[0].logo} alt={group.brands[0].label} class="brand-logo" />
        </span>
      </span>
    </span>
  </a>
{/if}

<style>
  /* ─── Cell base ─── */
  .brand-cell {
    --cell-h: clamp(2.4rem, 3.8vw, 3.2rem);

    display: flex;
    align-items: center;
    font-family: var(--font-primary);
    color: var(--color-text, #ffffff);
    font-size: clamp(0.6rem, 0.75vw, 0.78rem);
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    pointer-events: auto;
    text-decoration: none;
  }

  .brand-cell.single:hover,
  .brand-cell.single:focus-visible {
    text-decoration: none;
  }

  /* ─── Spin frame ───
     Grid stacking with consistent internal centering.
     Width is driven by whichever layer is wider (text or logos). */
  .spin-frame {
    display: grid;
    grid-template-areas: "stack";
    overflow: hidden;
    height: var(--cell-h);
    width: max-content;
    max-width: 100%;
  }

  .spin-text,
  .spin-logo {
    grid-area: stack;
    width: 100%;
    height: 100%;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform;
  }

  /* Text layer: always centered within the frame */
  .spin-text {
    display: grid;
    place-content: center;
    text-align: center;
  }

  /* Logo layer: always horizontally centered within the frame */
  .spin-logo {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    transform: translateY(-100%);
  }

  /* ─── Logo box: uniform container ───
     Every logo sits in the same footprint regardless of source aspect ratio. */
  .logo-box {
    width: calc(var(--cell-h) * 2.0);
    height: calc(var(--cell-h) * 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .brand-logo {
    max-width: 120%;
    max-height: 120%;
    width: auto;
    height: auto;
    object-fit: contain;
    display: block;
    transform: scale(var(--scale, 1));
  }

  /* ─── Multi-brand: equal columns side by side ─── */
  .multi-logos {
    gap: 0.4rem;
  }

  .logo-divider {
    display: block;
    width: 1px;
    height: 55%;
    background: rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
  }

  .brand-logo-link {
    text-decoration: none;
    transition: opacity 0.4s ease, filter 0.4s ease;
  }

  /* Multi-brand spotlight: hovering one logo dims the other(s) */
  .brand-cell:has(.brand-logo-link:hover) .brand-logo-link:not(:hover) {
    opacity: 0.3;
    filter: grayscale(0.3);
  }

  /* Single brand: subtle brightness lift after spin reveals the logo */
  .brand-cell.single:hover .brand-logo {
    filter: brightness(1.12);
    transition: filter 0.4s ease;
  }

  .brand-logo-link:focus-visible {
    outline: 1px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
    border-radius: 4px;
  }

  /* ─── Hover: uniform spin (text down, logo in) ─── */
  .brand-cell:hover .spin-text {
    transform: translateY(100%);
  }

  .brand-cell:hover .spin-logo {
    transform: translateY(0);
  }

  /* ─── Focus-visible ─── */
  .brand-cell.single:focus-visible {
    outline: 1px solid rgba(255, 255, 255, 0.5);
    outline-offset: 4px;
    border-radius: 2px;
  }

  /* ─── Tablet ─── */
  @media (max-width: 1024px) {
    .brand-cell {
      font-size: clamp(0.55rem, 1.1vw, 0.68rem);
      --cell-h: clamp(2.2rem, 3.5vw, 2.8rem);
    }
  }

  /* ─── Mobile ─── */
  @media (max-width: 768px) {
    .brand-cell {
      font-size: 0.65rem;
      width: calc(50% - 0.75rem);
      --cell-h: 2.5rem;
    }

    /* Right-alignment for the far-right brand on mobile */
    .brand-cell[style*="justify-content: flex-end"] {
      justify-content: flex-end;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .spin-text,
    .spin-logo {
      transition-duration: 0.15s;
    }
  }
</style>
