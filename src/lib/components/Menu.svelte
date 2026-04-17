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
    <a href="/projects" onclick={closeMenu}>Works</a>
    <a href="/upcoming" onclick={closeMenu}>Upcoming</a>
    <a href="/partnership" onclick={closeMenu}>Partnership</a>
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
      x1="2"
      y1="2"
      x2="22"
      y2="22"
      stroke="#f0eee9"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <line
      x1="22"
      y1="2"
      x2="2"
      y2="22"
      stroke="#f0eee9"
      stroke-width="1.5"
      stroke-linecap="round"
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
    background: #000000; /* เปลี่ยนเป็นสีเขียวขี้ม้าเข้ม ตามบรีฟล่าสุด */
    display: flex;
    align-items: center;
    /* ขยับให้ห่างจากตัวเว็บมากขึ้น จากเดิม 60px เป็น 120px */
    padding-left: calc(65vw + 120px);
    z-index: 0;
  }

  .menu-links {
    display: flex;
    flex-direction: column;
    gap: 32px; /* เพิ่มระยะห่างให้ดูแกรนด์และพรีเมียมขึ้น */
  }

  .menu-links a {
    font-family: "Outfit", sans-serif;
    font-size: 32px; /* ขยายขนาดขึ้นให้ชัดเจน */
    line-height: 1.2;
    letter-spacing: 0.12em; /* ปรับช่องไฟให้พอดีกับขนาดที่ใหญ่ขึ้น */
    font-weight: 600; /* เพิ่มน้ำหนักเป็น 600 ให้ดูหนักแน่นขึ้นแบบทางการ */
    color: #f0eee9; /* เปลี่ยนเป็นสีขาวนวลเพื่อให้ลอยเด่นบนพื้นหลังเข้ม */
    text-transform: uppercase;
    text-decoration: none;
    display: inline-block;
    opacity: 0;
    transform: translateY(30px) scale(0.98);
    filter: blur(4px);
    transition:
      opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
      filter 0.6s cubic-bezier(0.16, 1, 0.3, 1),
      color 0.3s ease,
      text-shadow 0.3s ease;
    pointer-events: none;
  }

  .menu-links.is-open a {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
    pointer-events: auto;
    transition:
      opacity 0.5s ease-out,
      transform 0.6s cubic-bezier(0.25, 1, 0.35, 1),
      filter 0.5s ease-out,
      color 0.2s ease,
      text-shadow 0.2s ease;
  }

  .menu-links.is-open a:nth-child(1) {
    transition-delay: 0.35s;
  }
  .menu-links.is-open a:nth-child(2) {
    transition-delay: 0.38s;
  }
  .menu-links.is-open a:nth-child(3) {
    transition-delay: 0.41s;
  }
  .menu-links.is-open a:nth-child(4) {
    transition-delay: 0.44s;
  }
  .menu-links.is-open a:nth-child(5) {
    transition-delay: 0.47s;
  }
  .menu-links.is-open a:nth-child(6) {
    transition-delay: 0.5s;
  }

  .menu-links a:hover {
    color: #ff4500;
    text-shadow: 0 0 8px rgba(255, 69, 0, 0.2); /* ลดความฟุ้งลงให้ดูเรียบหรูที่สุด */
  }

  /* ==================
	   Close Button (Modern)
	   วางมุมขวาบนตรงกับตำแหน่ง Hamburger
	================== */
  .close-btn {
    position: absolute;
    top: 2.5rem;
    right: 3.5rem;
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
