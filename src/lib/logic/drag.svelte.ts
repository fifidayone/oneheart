/**
 * DragState.svelte.ts
 * High-performance, class-based rune for 2D dragging with momentum and drifting.
 * Designed for Svelte 5 Peak Modernization.
 */
export class DragState {
  currentX = $state(0);
  currentY = $state(0);
  targetX = $state(0);
  targetY = $state(0);
  
  isDragging = $state(false);
  
  private velocityX = 0;
  private velocityY = 0;
  private lastX = 0;
  private lastY = 0;
  private lastTime = 0;
  private startX = 0;
  private startY = 0;
  private rafId?: number;

  constructor(
    private options: {
      driftX: number;
      driftY: number;
      friction: number;
      lerp: number;
    } = {
      driftX: -0.4,
      driftY: -0.2,
      friction: 0.94,
      lerp: 0.12
    }
  ) {}

  start(e: PointerEvent) {
    this.isDragging = true;
    this.startX = e.clientX - this.targetX;
    this.startY = e.clientY - this.targetY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.lastTime = performance.now();
  }

  move(e: PointerEvent) {
    if (!this.isDragging) return;
    
    this.targetX = e.clientX - this.startX;
    this.targetY = e.clientY - this.startY;
    
    const now = performance.now();
    const dt = now - this.lastTime;
    
    if (dt > 1) {
      this.velocityX = (e.clientX - this.lastX) / dt;
      this.velocityY = (e.clientY - this.lastY) / dt;
    }
    
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.lastTime = now;
  }

  stop() {
    this.isDragging = false;
  }

  nudge(deltaX: number, deltaY: number) {
    this.targetX += deltaX;
    this.targetY += deltaY;
  }

  update() {
    if (!this.isDragging) {
      this.velocityX *= this.options.friction;
      this.velocityY *= this.options.friction;
      
      if (Math.abs(this.velocityX) < 0.01) this.velocityX = 0;
      if (Math.abs(this.velocityY) < 0.01) this.velocityY = 0;

      this.targetX += this.velocityX * 12 + this.options.driftX;
      this.targetY += this.velocityY * 12 + this.options.driftY;
    }

    this.currentX += (this.targetX - this.currentX) * this.options.lerp;
    this.currentY += (this.targetY - this.currentY) * this.options.lerp;
  }
}
