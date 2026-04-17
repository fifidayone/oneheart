<div class="home">
  <!-- Center Screen Content -->
  <div class="center-content">
    <p class="top-label">Power As One</p>
    <h1>ONE HEART<br />PRODUCTIONS</h1>
  </div>

  <!-- Bottom Pinned Row -->
  <div class="bottom-row">
    <span class="col-left">Based In Asia • Global Standard</span>
    <span class="col-center">Specializing in International & Premium Productions</span>
    <span class="col-right">Professional • Cultural</span>
  </div>
</div>

<style>
  .home {
    min-height: 100vh;
    background: #282c30;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .center-content {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* ขยับขึ้นนิดหน่อยเพื่อ Balance กับ Bottom Row */
    transform: translateY(-2rem);
  }

  .top-label {
    font-family: var(--font-heading);
    font-size: clamp(1.25rem, 2.5vw, 2rem);
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #f0eee9;
    margin: 0 0 1rem;
  }

  h1 {
    font-family: var(--font-heading);
    font-size: clamp(3rem, 10vw, 11rem);
    font-weight: 700;
    letter-spacing: -0.04em;
    line-height: 0.85;
    color: #f0eee9;
    margin: 0;
    text-transform: uppercase;
  }

  .bottom-row {
    position: absolute;
    bottom: 3.5rem;
    left: 3.5rem;
    right: 3.5rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
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
