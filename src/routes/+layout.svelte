<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import { onMount, onDestroy } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import type Lenis from "lenis";
  import Menu from "$lib/components/Menu.svelte";
  import { menuOpen } from "$lib/stores/menu";

  let { children } = $props();
  let lenis: Lenis | undefined = $state();

  function openMenu() {
    menuOpen.set(true);
    lenis?.stop();
  }

  let isResizing = $state(false);
  let resizeTimer: ReturnType<typeof setTimeout>;

  function handleResize() {
    isResizing = true;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      isResizing = false;
    }, 400); // หยุด transition ชั่วคราวระหว่างโดนจับย่อขยาย
  }

  onMount(async () => {
    const LenisLib = (await import("lenis")).default;
    lenis = new LenisLib({
      wrapper: document.querySelector(".page-wrapper") as HTMLElement,
      content: document.querySelector(".page-wrapper") as HTMLElement,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis?.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  });

  afterNavigate(() => {
    lenis?.scrollTo(0, { immediate: true });
    menuOpen.set(false);
    lenis?.start();
  });

  onDestroy(() => {
    lenis?.destroy();
    clearTimeout(resizeTimer);
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<svelte:window onresize={handleResize} />

<Menu {lenis} />

<div
  class="page-wrapper"
  class:is-open={$menuOpen}
  class:no-transition={isResizing}
>
  <!-- Header ล็อกอยู่กับ page-wrapper จะ scale ตามไปพร้อมกันเหมือนต้นฉบับ -->
  <header class="site-header">
    <a href="/contact" class="contact-btn">Connect With One Heart</a>
    <button class="menu-btn" onclick={openMenu} aria-label="Open menu">
      <span></span>
      <span></span>
      <span></span>
    </button>
  </header>

  {@render children()}
</div>

<style>
  :global(body) {
    margin: 0;
    background: #111111;
    overflow: hidden;
  }

  .page-wrapper {
    position: fixed;
    inset: 0;
    z-index: 1;
    overflow-y: auto;
    overflow-x: hidden;
    /* ไม่ต้องใส่ background ที่นี่
		   ให้แต่ละหน้าจัดการ background เอง */
    transform-origin: right center;
    transition:
      transform 0.7s cubic-bezier(0.76, 0, 0.24, 1),
      border-radius 0.7s ease;
  }

  /*
	  ใช้สูตรคณิตศาสตร์แบบ Standard ของ Premium Navigation Drawer:
	  transform-origin: right center (ล็อกขอบขวาไว้)
	  transform: translateX(-35vw) scale(0.8) (ดันขอบขวาให้มาหยุดที่ 65vw พอดี)
	  - จะได้พื้นที่เมนูด้านขวา 35vw หรือประมาณ 1/3 ของจอแบบสมมาตร
	  - ขอบซ้ายจะเลยขอบจอไป 15vw เสมอ (ในหน้าจอทุกขนาด)
	*/
  .page-wrapper.is-open {
    transform: translateX(-35vw) scale(0.8);
    border-radius: 18px;
    pointer-events: none;
    overflow: hidden;
  }

  .page-wrapper.no-transition {
    transition: none !important;
  }

  /* ==================
     Header (อยู่ใน page-wrapper จะ scale ตามเว็บ)
  ================== */
  .site-header {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 2.5rem 3.5rem;
  }

  .contact-btn {
    font-size: 1.05rem; /* ล็อคขนาดตัวอักษรไว้ ไม่กระทบ padding */
    font-weight: 400;
    letter-spacing: 0; /* ปิด letter-spacing เพื่อให้ Mixed Case อ่านได้ธรรมชาติ */
    padding: 0.35rem 1.25rem; /* ลดซ้ายขวา ~10%, บนล่าง ~5% */
    border-radius: 999px;
    border: 1.5px solid rgba(240, 238, 233, 0.4);
    background: transparent;
    color: rgba(240, 238, 233, 0.95);
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .contact-btn:hover {
    background: #f0eee9;
    color: #282c30;
    border-color: #f0eee9;
  }

  .menu-btn {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    padding: 0;
  }

  .menu-btn span {
    display: block;
    height: 2px;
    background: #f0eee9;
    border-radius: 0;
  }

  .menu-btn span:nth-child(1) {
    width: 40px;
  }
  .menu-btn span:nth-child(2) {
    width: 22px;
  }
  .menu-btn span:nth-child(3) {
    width: 40px;
  }
</style>
