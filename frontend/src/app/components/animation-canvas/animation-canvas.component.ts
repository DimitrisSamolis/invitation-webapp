import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AnimationType = 'confetti' | 'hearts' | 'balloons' | 'sparkles' | 'stars' | 'fireworks' | 'none';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  opacity: number;
  type?: number;
  life?: number;
  maxLife?: number;
}

@Component({
  selector: 'app-animation-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <canvas #animationCanvas class="animation-canvas"></canvas>
  `,
  styles: [`
    .animation-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
    }
  `]
})
export class AnimationCanvasComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('animationCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() animation: AnimationType = 'none';
  @Input() primaryColor: string = '#667eea';
  @Input() accentColor: string = '#764ba2';

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId: number = 0;
  private isRunning = false;
  private initialized = false;
  private dpr = 1; // Device pixel ratio for crisp rendering

  // Colors for confetti
  private confettiColors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bb5', '#a855f7', '#06b6d4'];

  ngOnInit() { }

  ngAfterViewInit() {
    // Use setTimeout to ensure parent has rendered
    setTimeout(() => {
      this.initCanvas();
      this.initialized = true;
      if (this.animation && this.animation !== 'none') {
        this.startAnimation();
      }
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['animation'] && this.initialized) {
      this.stopAnimation();
      this.particles = [];
      if (this.animation && this.animation !== 'none') {
        this.initCanvas();
        this.startAnimation();
      }
    }
  }

  ngOnDestroy() {
    this.stopAnimation();
    window.removeEventListener('resize', this.resizeHandler);
  }

  private resizeHandler = () => this.resizeCanvas();

  private initCanvas() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    // Get device pixel ratio for crisp rendering on high-DPI displays
    this.dpr = window.devicePixelRatio || 1;

    const parent = canvas.parentElement;
    let width = 400;
    let height = 600;

    if (parent) {
      const rect = parent.getBoundingClientRect();
      width = rect.width || parent.clientWidth || 400;
      height = rect.height || parent.clientHeight || 600;
    }

    // Set canvas internal resolution (high-res for crisp graphics)
    canvas.width = width * this.dpr;
    canvas.height = height * this.dpr;

    // Don't set fixed CSS dimensions - let CSS handle it with 100%
    // The canvas will stretch to fill, but we draw at high resolution

    this.ctx = canvas.getContext('2d')!;
    // No need to scale context - we'll use the actual canvas dimensions

    // Handle resize
    window.removeEventListener('resize', this.resizeHandler);
    window.addEventListener('resize', this.resizeHandler);
  }

  private resizeCanvas() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    this.dpr = window.devicePixelRatio || 1;

    const parent = canvas.parentElement;
    let width = 400;
    let height = 600;

    if (parent) {
      const rect = parent.getBoundingClientRect();
      width = rect.width || parent.clientWidth || 400;
      height = rect.height || parent.clientHeight || 600;
    }

    canvas.width = width * this.dpr;
    canvas.height = height * this.dpr;

    this.ctx = canvas.getContext('2d')!;
    // Reinitialize particles for new size
    if (this.isRunning) {
      this.initParticles();
    }
  }

  private startAnimation() {
    this.isRunning = true;
    this.initParticles();
    this.animate();
  }

  private stopAnimation() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  // Get logical canvas dimensions (CSS pixels, not device pixels)
  private getLogicalSize(): { width: number; height: number } {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return { width: 400, height: 600 };
    return {
      width: canvas.width / this.dpr,
      height: canvas.height / this.dpr
    };
  }

  private initParticles() {
    this.particles = [];
    const size = this.getLogicalSize();

    switch (this.animation) {
      case 'confetti':
        for (let i = 0; i < 50; i++) {
          this.particles.push(this.createConfetti(size));
        }
        break;
      case 'hearts':
        for (let i = 0; i < 15; i++) {
          this.particles.push(this.createHeart(size));
        }
        break;
      case 'balloons':
        for (let i = 0; i < 10; i++) {
          this.particles.push(this.createBalloon(size));
        }
        break;
      case 'sparkles':
        for (let i = 0; i < 30; i++) {
          this.particles.push(this.createSparkle(size));
        }
        break;
      case 'stars':
        for (let i = 0; i < 25; i++) {
          this.particles.push(this.createStar(size));
        }
        break;
      case 'fireworks':
        // Fireworks spawn dynamically
        break;
    }
  }

  private createConfetti(size: { width: number; height: number }): Particle {
    return {
      x: Math.random() * size.width,
      y: -20 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 2,
      vy: 2 + Math.random() * 3,
      size: 8 + Math.random() * 8,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: this.confettiColors[Math.floor(Math.random() * this.confettiColors.length)],
      opacity: 1,
      type: Math.floor(Math.random() * 3) // 0: rect, 1: circle, 2: triangle
    };
  }

  private createHeart(size: { width: number; height: number }): Particle {
    return {
      x: Math.random() * size.width,
      y: size.height + 20 + Math.random() * 50,
      vx: (Math.random() - 0.5) * 1,
      vy: -1.5 - Math.random() * 2,
      size: 15 + Math.random() * 20,
      rotation: 0,
      rotationSpeed: 0,
      color: this.getRandomPinkRed(),
      opacity: 0.8 + Math.random() * 0.2
    };
  }

  private createBalloon(size: { width: number; height: number }): Particle {
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bb5', '#a855f7'];
    return {
      x: Math.random() * size.width,
      y: size.height + 50 + Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -1 - Math.random() * 1.5,
      size: 30 + Math.random() * 20,
      rotation: (Math.random() - 0.5) * 20,
      rotationSpeed: (Math.random() - 0.5) * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0.9
    };
  }

  private createSparkle(size: { width: number; height: number }): Particle {
    return {
      x: Math.random() * size.width,
      y: Math.random() * size.height,
      vx: 0,
      vy: 0,
      size: 10 + Math.random() * 15,
      rotation: Math.random() * 360,
      rotationSpeed: 2,
      color: '#ffd700',
      opacity: 0,
      life: Math.random() * 100,
      maxLife: 100
    };
  }

  private createStar(size: { width: number; height: number }): Particle {
    return {
      x: Math.random() * size.width,
      y: Math.random() * size.height,
      vx: 0,
      vy: 0,
      size: 8 + Math.random() * 12,
      rotation: Math.random() * 360,
      rotationSpeed: 1,
      color: '#ffd700',
      opacity: 0.3 + Math.random() * 0.7,
      life: Math.random() * 150,
      maxLife: 150
    };
  }

  private createFirework(size: { width: number; height: number }, x: number, y: number): Particle[] {
    const particles: Particle[] = [];
    const color = this.confettiColors[Math.floor(Math.random() * this.confettiColors.length)];
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        rotation: 0,
        rotationSpeed: 0,
        color,
        opacity: 1,
        life: 0,
        maxLife: 60 + Math.random() * 40
      });
    }
    return particles;
  }

  private getRandomPinkRed(): string {
    const colors = ['#ff6b6b', '#e91e63', '#ff1744', '#f50057', '#ff4081', '#ec407a'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private animate() {
    if (!this.isRunning) return;

    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.ctx) return;

    const size = this.getLogicalSize();

    // Clear the entire canvas at full resolution
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale context to draw in logical pixels but at high resolution
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    switch (this.animation) {
      case 'confetti':
        this.animateConfetti(size);
        break;
      case 'hearts':
        this.animateHearts(size);
        break;
      case 'balloons':
        this.animateBalloons(size);
        break;
      case 'sparkles':
        this.animateSparkles(size);
        break;
      case 'stars':
        this.animateStars(size);
        break;
      case 'fireworks':
        this.animateFireworks(size);
        break;
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private animateConfetti(size: { width: number; height: number }) {
    this.particles.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.vx += (Math.random() - 0.5) * 0.1;

      if (p.y > size.height + 20) {
        this.particles[index] = this.createConfetti(size);
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;

      if (p.type === 0) {
        // Rectangle
        this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.type === 1) {
        // Circle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Triangle
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size / 2);
        this.ctx.lineTo(p.size / 2, p.size / 2);
        this.ctx.lineTo(-p.size / 2, p.size / 2);
        this.ctx.closePath();
        this.ctx.fill();
      }

      this.ctx.restore();
    });
  }

  private animateHearts(size: { width: number; height: number }) {
    this.particles.forEach((p, index) => {
      p.x += p.vx + Math.sin(p.y * 0.02) * 0.5;
      p.y += p.vy;

      if (p.y < -50) {
        this.particles[index] = this.createHeart(size);
      }

      this.drawHeart(p.x, p.y, p.size, p.color, p.opacity);
    });
  }

  private drawHeart(x: number, y: number, size: number, color: string, opacity: number) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.globalAlpha = opacity;

    this.ctx.beginPath();
    this.ctx.moveTo(0, size * 0.3);
    this.ctx.bezierCurveTo(-size / 2, -size * 0.3, -size, size * 0.1, 0, size);
    this.ctx.bezierCurveTo(size, size * 0.1, size / 2, -size * 0.3, 0, size * 0.3);
    this.ctx.fillStyle = color;
    this.ctx.fill();

    // Add gradient/shine
    const gradient = this.ctx.createRadialGradient(-size * 0.2, -size * 0.1, 0, 0, 0, size);
    gradient.addColorStop(0, 'rgba(255,255,255,0.3)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    this.ctx.restore();
  }

  private animateBalloons(size: { width: number; height: number }) {
    this.particles.forEach((p, index) => {
      p.x += p.vx + Math.sin(Date.now() * 0.001 + index) * 0.3;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      if (p.y < -100) {
        this.particles[index] = this.createBalloon(size);
      }

      this.drawBalloon(p.x, p.y, p.size, p.color, p.opacity, p.rotation);
    });
  }

  private drawBalloon(x: number, y: number, size: number, color: string, opacity: number, rotation: number) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate((rotation * Math.PI) / 180);
    this.ctx.globalAlpha = opacity;

    // Balloon body
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, size * 0.4, size * 0.5, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();

    // Balloon knot
    this.ctx.beginPath();
    this.ctx.moveTo(-size * 0.08, size * 0.5);
    this.ctx.lineTo(size * 0.08, size * 0.5);
    this.ctx.lineTo(0, size * 0.6);
    this.ctx.closePath();
    this.ctx.fill();

    // String
    this.ctx.beginPath();
    this.ctx.moveTo(0, size * 0.6);
    this.ctx.quadraticCurveTo(size * 0.1, size * 0.8, 0, size);
    this.ctx.strokeStyle = '#666';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Shine
    this.ctx.beginPath();
    this.ctx.ellipse(-size * 0.15, -size * 0.15, size * 0.1, size * 0.15, -0.5, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
    this.ctx.fill();

    this.ctx.restore();
  }

  private animateSparkles(size: { width: number; height: number }) {
    this.particles.forEach((p, index) => {
      p.life = (p.life || 0) + 1;
      p.rotation += p.rotationSpeed;

      if (p.life! >= p.maxLife!) {
        this.particles[index] = this.createSparkle(size);
        return;
      }

      // Fade in and out
      const progress = p.life! / p.maxLife!;
      p.opacity = progress < 0.5 ? progress * 2 : (1 - progress) * 2;

      this.drawSparkle(p.x, p.y, p.size * (0.5 + p.opacity * 0.5), p.rotation, p.opacity);
    });
  }

  private drawSparkle(x: number, y: number, size: number, rotation: number, opacity: number) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate((rotation * Math.PI) / 180);
    this.ctx.globalAlpha = opacity;

    // Four-pointed star
    this.ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const outerX = Math.cos(angle) * size;
      const outerY = Math.sin(angle) * size;
      const innerAngle = angle + Math.PI / 4;
      const innerX = Math.cos(innerAngle) * size * 0.3;
      const innerY = Math.sin(innerAngle) * size * 0.3;

      if (i === 0) {
        this.ctx.moveTo(outerX, outerY);
      } else {
        this.ctx.lineTo(outerX, outerY);
      }
      this.ctx.lineTo(innerX, innerY);
    }
    this.ctx.closePath();

    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.5, '#ffd700');
    gradient.addColorStop(1, '#ffaa00');
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    this.ctx.restore();
  }

  private animateStars(size: { width: number; height: number }) {
    this.particles.forEach((p, index) => {
      p.life = (p.life || 0) + 1;
      p.rotation += p.rotationSpeed;

      if (p.life! >= p.maxLife!) {
        this.particles[index] = this.createStar(size);
        return;
      }

      const progress = p.life! / p.maxLife!;
      const pulse = Math.sin(progress * Math.PI);
      p.opacity = 0.3 + pulse * 0.7;

      this.drawStar(p.x, p.y, p.size * (0.7 + pulse * 0.3), p.rotation, p.opacity);
    });
  }

  private drawStar(x: number, y: number, size: number, rotation: number, opacity: number) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate((rotation * Math.PI) / 180);
    this.ctx.globalAlpha = opacity;

    // Five-pointed star
    this.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const innerAngle = outerAngle + (2 * Math.PI) / 10;

      const outerX = Math.cos(outerAngle) * size;
      const outerY = Math.sin(outerAngle) * size;
      const innerX = Math.cos(innerAngle) * size * 0.4;
      const innerY = Math.sin(innerAngle) * size * 0.4;

      if (i === 0) {
        this.ctx.moveTo(outerX, outerY);
      } else {
        this.ctx.lineTo(outerX, outerY);
      }
      this.ctx.lineTo(innerX, innerY);
    }
    this.ctx.closePath();

    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, '#ffd700');
    gradient.addColorStop(1, '#ff8c00');
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    this.ctx.restore();
  }

  private fireworkTimer = 0;
  private animateFireworks(size: { width: number; height: number }) {
    this.fireworkTimer++;

    // Spawn new firework every ~90 frames
    if (this.fireworkTimer % 90 === 0) {
      const x = size.width * 0.2 + Math.random() * size.width * 0.6;
      const y = size.height * 0.2 + Math.random() * size.height * 0.3;
      this.particles.push(...this.createFirework(size, x, y));
    }

    // Animate particles
    this.particles = this.particles.filter(p => {
      p.life = (p.life || 0) + 1;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // gravity
      p.vx *= 0.98; // friction
      p.vy *= 0.98;
      p.opacity = 1 - (p.life! / p.maxLife!);

      if (p.life! >= p.maxLife!) return false;

      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();

      // Glow effect
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 10;
      this.ctx.fill();

      this.ctx.restore();

      return true;
    });
  }
}
