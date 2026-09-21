/**
 * High-fidelity real-time simulated camera scene generator.
 * Used when camera is initializing, permission is denied, or for testing.
 */

export interface TestScene {
  id: string;
  name: string;
  render: (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => void;
}

export const TEST_SCENES: TestScene[] = [
  {
    id: 'orientation-check',
    name: 'Camera Orientation & Color Target Scene',
    render: (ctx, width, height, time) => {
      // Background studio gradient: darker at bottom, lighter at top
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, '#1e293b');
      bg.addColorStop(0.5, '#0f172a');
      bg.addColorStop(1, '#020617');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Subtle grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const centerX = width / 2;
      const sway = Math.sin(time * 0.001) * 8;

      // 1. TOP HEADER (Clear orientation banner)
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(centerX - 180, 50, 360, 48, 12);
      ctx.fill();
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('▲ TOP • UPRIGHT ORIENTATION ▲', centerX, 74);

      // Top Object: Vivid Crimson Red Circle
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(centerX + sway, 160, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('TOP: Vivid Red', centerX + sway, 160);

      // 2. MIDDLE OBJECTS (Center band)
      // Left Middle: Golden Sunflower Yellow Box
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.roundRect(centerX - 150 - sway * 0.5, height * 0.42, 100, 100, 16);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Yellow Box', centerX - 100 - sway * 0.5, height * 0.42 + 50);

      // Center Middle: Cobalt Blue Sphere
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(centerX, height * 0.46, 56, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('CENTER: Blue', centerX, height * 0.46);

      // Right Middle: Violet Purple Diamond
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.roundRect(centerX + 50 + sway * 0.5, height * 0.42, 100, 100, 16);
      ctx.fill();
      ctx.strokeStyle = '#c4b5fd';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Violet Box', centerX + 100 + sway * 0.5, height * 0.42 + 50);

      // 3. BOTTOM OBJECTS & BANNER
      // Bottom Object: Emerald Green Box / Object
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(centerX - 110 - sway, height - 210, 220, 80, 16);
      ctx.fill();
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('BOTTOM: Emerald Green', centerX - sway, height - 170);

      // Bottom Orientation Indicator
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(centerX - 180, height - 90, 360, 48, 12);
      ctx.fill();
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('▼ BOTTOM • BASE OF SCENE ▼', centerX, height - 66);
    },
  },
  {
    id: 'fruit-market',
    name: 'Vibrant Fruit Scene',
    render: (ctx, width, height, time) => {
      // Wood table background
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#543d2b');
      grad.addColorStop(0.5, '#78553a');
      grad.addColorStop(1, '#3b2616');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle table grain lines
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 3;
      for (let y = 40; y < height; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const centerX = width / 2;
      const centerY = height / 2;

      // Shadow underneath bowl
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 180, 220, 45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ceramic bowl
      ctx.fillStyle = '#f1ece1';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 80, 200, 110, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d4c7b5';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Ambient swaying motion
      const sway = Math.sin(time * 0.001) * 8;

      // 1. Red Crisp Apples
      ctx.fillStyle = '#d92534';
      ctx.beginPath();
      ctx.arc(centerX - 80 + sway, centerY + 20, 52, 0, Math.PI * 2);
      ctx.fill();
      // Apple highlight
      ctx.fillStyle = 'rgba(255, 180, 190, 0.4)';
      ctx.beginPath();
      ctx.ellipse(centerX - 95 + sway, centerY + 5, 18, 10, -0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#c01825';
      ctx.beginPath();
      ctx.arc(centerX + 60 - sway, centerY + 65, 48, 0, Math.PI * 2);
      ctx.fill();

      // 2. Vivid Sun Oranges
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(centerX + 85 + sway, centerY + 10, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 230, 180, 0.45)';
      ctx.beginPath();
      ctx.ellipse(centerX + 70 + sway, centerY - 8, 14, 8, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // 3. Bright Yellow Lemons / Bananas
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(centerX - 10 - sway, centerY + 10, 46, 0, Math.PI * 2);
      ctx.fill();

      // 4. Lime Green Fruits
      ctx.fillStyle = '#65a30d';
      ctx.beginPath();
      ctx.arc(centerX - 40 + sway, centerY + 70, 40, 0, Math.PI * 2);
      ctx.fill();

      // 5. Deep Blueberries / Plums
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(centerX + 15 + sway, centerY + 80, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.arc(centerX - 110 - sway, centerY + 70, 35, 0, Math.PI * 2);
      ctx.fill();

      // Moving light flare
      const lightX = centerX + Math.cos(time * 0.0008) * 120;
      const lightY = centerY - 150 + Math.sin(time * 0.0008) * 40;
      const flare = ctx.createRadialGradient(lightX, lightY, 10, lightX, lightY, 260);
      flare.addColorStop(0, 'rgba(255,255,255,0.22)');
      flare.addColorStop(1, 'rgba(255,255,255,0.0)');
      ctx.fillStyle = flare;
      ctx.fillRect(0, 0, width, height);
    },
  },
  {
    id: 'flower-garden',
    name: 'Botanical Garden',
    render: (ctx, width, height, time) => {
      // Grass background
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#15803d');
      grad.addColorStop(0.6, '#166534');
      grad.addColorStop(1, '#14532d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Colorful flowers array
      const flowers = [
        { x: width * 0.25, y: height * 0.35, color: '#ec4899', r: 42, petals: 6 },
        { x: width * 0.75, y: height * 0.38, color: '#3b82f6', r: 45, petals: 7 },
        { x: width * 0.50, y: height * 0.52, color: '#f59e0b', r: 50, petals: 8 },
        { x: width * 0.28, y: height * 0.70, color: '#a855f7', r: 44, petals: 6 },
        { x: width * 0.72, y: height * 0.72, color: '#ef4444', r: 46, petals: 5 },
        { x: width * 0.48, y: height * 0.25, color: '#06b6d4', r: 38, petals: 6 },
      ];

      flowers.forEach((f, idx) => {
        const sway = Math.sin(time * 0.0015 + idx) * 6;
        const fx = f.x + sway;
        const fy = f.y;

        // Draw petals
        ctx.fillStyle = f.color;
        for (let i = 0; i < f.petals; i++) {
          const angle = (i * Math.PI * 2) / f.petals + time * 0.0003;
          const px = fx + Math.cos(angle) * (f.r * 0.85);
          const py = fy + Math.sin(angle) * (f.r * 0.85);
          ctx.beginPath();
          ctx.arc(px, py, f.r * 0.55, 0, Math.PI * 2);
          ctx.fill();
        }

        // Flower center
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(fx, fy, f.r * 0.42, 0, Math.PI * 2);
        ctx.fill();
      });
    },
  },
  {
    id: 'studio-palette',
    name: 'Color Spectrum Swatches',
    render: (ctx, width, height) => {
      // Dark neutral studio backboard
      ctx.fillStyle = '#1e2022';
      ctx.fillRect(0, 0, width, height);

      const rows = 4;
      const cols = 3;
      const cardW = (width - 60) / cols;
      const cardH = (height - 180) / rows;
      const startX = 30;
      const startY = 80;

      const colors = [
        ['#ef4444', 'Ruby Red'],
        ['#f97316', 'Amber Orange'],
        ['#eab308', 'Cadmium Yellow'],
        ['#22c55e', 'Emerald Green'],
        ['#06b6d4', 'Cyan Turquoise'],
        ['#3b82f6', 'Cobalt Blue'],
        ['#8b5cf6', 'Royal Violet'],
        ['#ec4899', 'Hot Pink'],
        ['#14b8a6', 'Deep Jade'],
        ['#f43f5e', 'Crimson Rose'],
        ['#6366f1', 'Iris Indigo'],
        ['#84cc16', 'Lime Citrus'],
      ];

      colors.forEach(([hex], i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const x = startX + c * cardW;
        const y = startY + r * cardH;

        // Swatch card
        ctx.fillStyle = hex;
        ctx.beginPath();
        ctx.roundRect(x + 5, y + 5, cardW - 10, cardH - 10, 12);
        ctx.fill();

        // White border
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    },
  },
];
