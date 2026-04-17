<script lang="ts">
  import { menuOpen } from "$lib/stores/menu";

  let { lenis } = $props<{ lenis: any }>();

  function closeMenu() {
    menuOpen.set(false);
    lenis?.start();
  }
</script>

<div class="menu-backdrop">
  <nav class="menu-links" class:is-open={$menuOpen}>
    <a href="/" onclick={closeMenu}>Home</a>
    <a href="/about" onclick={closeMenu}>About</a>
    <a href="/team" onclick={closeMenu}>Team / Founders</a>
    <a href="/projects" onclick={closeMenu}>Projects / Tours</a>
    <a href="/upcoming" onclick={closeMenu}>Upcoming</a>
    <a href="/partnership" onclick={closeMenu}>Partnership / Booking</a>
    <a href="/press" onclick={closeMenu}>Press / Media Kit</a>
    <a href="/contact" onclick={closeMenu}>Contact</a>
  </nav>
</div>

<!-- X โมเดิร์นไม่มีวงกลม วางมุมขวาบน -->
<button
  class="close-btn"
  class:is-open={$menuOpen}
  onclick={closeMenu}
  aria-label="Close menu"
>
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <line
      x1="2" y1="2" x2="22" y2="22"
      stroke="#282c30" stroke-width="1.5" stroke-linecap="round"
    />
    <line
      x1="22" y1="2" x2="2" y2="22"
      stroke="#282c30" stroke-width="1.5" stroke-linecap="round"
    />
  </svg>
</button>

<style>
  /* ==================
	   Backdrop & Menu
	================== */
  .menu-backdrop {
    position: fixed;
    inset: 0;
    background: #f0eee9;
    display: flex;
    align-items: center;
    /* ขยับให้ห่างจากตัวเว็บมากขึ้น จากเดิม 60px เป็น 120px */
    padding-left: calc(65vw + 120px);
    z-index: 0;
  }

  .menu-links {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .menu-links a {
    font-family: var(--font-heading);
    font-size: 34.72px;
    line-height: 38.192px;
    letter-spacing: -1.0416px;
    font-weight: 700;
    color: #282c30;
    text-decoration: none;
    display: inline-block;
    opacity: 0;
    transform: translateY(14px);
    transition:
      opacity 0.45s ease,
      transform 0.45s ease,
      color 0.2s ease;
    pointer-events: none;
  }

  .menu-links.is-open a {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .menu-links a:hover {
    color: #ff4500;
  }

  .menu-links.is-open a:nth-child(1) {
    transition-delay: 0.06s;
  }
  .menu-links.is-open a:nth-child(2) {
    transition-delay: 0.11s;
  }
  .menu-links.is-open a:nth-child(3) {
    transition-delay: 0.16s;
  }
  .menu-links.is-open a:nth-child(4) {
    transition-delay: 0.21s;
  }
  .menu-links.is-open a:nth-child(5) {
    transition-delay: 0.26s;
  }
  .menu-links.is-open a:nth-child(6) {
    transition-delay: 0.31s;
  }
  .menu-links.is-open a:nth-child(7) {
    transition-delay: 0.36s;
  }

  /* ==================
	   Close Button (Modern)
	   วางมุมขวาบนตรงกับตำแหน่ง Hamburger
	================== */
  .close-btn {
    position: absolute;
    top: 1.25rem;
    right: 1.5rem;
    width: 44px;
    height: 44px;
    border: none;
    background: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-10px);
    transition:
      opacity 0.4s ease,
      transform 0.4s ease;
    z-index: 3;
  }

  .close-btn.is-open {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
    transition-delay: 0.15s;
  }

  /* Smooth rotation effect on hover */
  .close-btn svg {
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .close-btn:hover svg {
    transform: rotate(90deg);
  }
</style>
