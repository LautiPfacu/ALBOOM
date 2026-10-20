/* alboom-motion.js — animaciones de marca de ALBOOM. Web components sin dependencias.

   <alboom-burst size="46"></alboom-burst>
     El isotipo de la barra. Se carga despacio (crece y tiembla), explota con un rebote y se acomoda.
     Ciclo de 2,6 s en loop. Al pasar el mouse explota en el momento.
     Colores: var(--ink), var(--pink) y var(--paper) → sigue al tema activo.

   <alboom-explosion viewbox="0 0 760 800"></alboom-explosion>
     La ilustración de la entrada. Llena su contenedor (width/height 100%, recorte tipo cover).
     viewbox opcional para encuadrar (celular: "68 140 624 400").
     Colores: var(--yellow), var(--pink), var(--blue), var(--ink), var(--card), var(--paper).

   Los dos aceptan speed="1" (multiplicador, sirve para revisar en cámara lenta).
   Con prefers-reduced-motion quedan quietos. Se pausan fuera de pantalla y con la pestaña oculta.
   Dibujan dentro de un shadow root: React nunca toca su contenido. */
(() => {
  if (customElements.get('alboom-burst')) return;
  const NS = 'http://www.w3.org/2000/svg';
  const rand = (a, b) => a + Math.random() * (b - a);
  const fmt = (n) => n.toFixed(1);
  const rad = (d) => (d * Math.PI) / 180;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const node = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const paint = (n, fill, stroke) => { if (fill) n.style.fill = fill; if (stroke) n.style.stroke = stroke; return n; };
  const v = (name, fallback) => 'var(--' + name + ', ' + fallback + ')';
  const INK = v('ink', '#1F1E2B'), PINK = v('pink', '#FF5C8A'), BLUE = v('blue', '#2F5FD0');
  const YELLOW = v('yellow', '#F3E35A'), CARD = v('card', '#FFFDF7'), PAPER = v('paper', '#F5F1E6');
  // Resorte: acerca s.x a target con rebote. k = rigidez, d = amortiguación.
  const spring = (s, target, dt, k, d) => { s.v += ((target - s.x) * k - s.v * d) * dt; s.x += s.v * dt; return s.x; };

  // Forma original del estallido del logo (viewBox 0 0 200 200, centro 100,100)
  const BURST = '85.4,24.0 111.3,49.0 131.7,23.1 132.8,66.2 174.4,52.6 147.0,80.9 176.9,91.3 165.3,96.1 181.4,99.4 143.3,108.7 167.4,156.3 130.2,132.3 149.5,181.4 116.3,141.5 120.8,171.1 109.7,148.8 90.4,181.1 87.7,142.5 44.3,175.0 67.6,135.4 20.1,139.6 29.1,130.6 12.6,132.4 47.5,113.6 7.1,108.2 53.3,90.8 47.5,67.0 59.5,61.9 46.7,21.4 85.3,48.7';
  const POLAR = BURST.split(' ').map((p) => {
    const [x, y] = p.split(',').map(Number);
    const dx = x - 100, dy = y - 100;
    return { r: Math.hypot(dx, dy), a: Math.atan2(dy, dx) };
  });

  class Animated extends HTMLElement {
    connectedCallback() {
      if (!this.shadowRoot) { this.attachShadow({ mode: 'open' }); this.setup(); }
      this.t = this.t || 0;
      this.visible = true;
      this.onWake = () => this.start();
      document.addEventListener('visibilitychange', this.onWake);
      motionQuery.addEventListener('change', this.onWake);
      this.io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; if (this.visible) this.start(); });
      this.io.observe(this);
      this.frame(0, this.t, true); // dibuja un primer cuadro ya, sin esperar a requestAnimationFrame
      this.start();
    }
    disconnectedCallback() {
      cancelAnimationFrame(this.raf); this.raf = 0;
      document.removeEventListener('visibilitychange', this.onWake);
      motionQuery.removeEventListener('change', this.onWake);
      if (this.io) this.io.disconnect();
    }
    get speed() { const s = parseFloat(this.getAttribute('speed')); return s > 0 ? s : 1; }
    start() {
      if (this.raf) return;
      this.last = performance.now();
      const step = (now) => {
        this.raf = 0;
        const still = motionQuery.matches;
        const dt = still ? 0 : Math.min(0.05, (now - this.last) / 1000) * this.speed;
        this.last = now;
        this.t += dt;
        this.frame(dt, this.t, still);
        if (!still && this.visible && !document.hidden) this.raf = requestAnimationFrame(step);
      };
      this.raf = requestAnimationFrame(step);
    }
  }

  class AlboomBurst extends Animated {
    static get observedAttributes() { return ['size']; }
    attributeChangedCallback() { if (this.svg) this.resize(); }
    setup() {
      this.style.display = 'inline-block';
      this.style.lineHeight = '0';
      this.style.verticalAlign = 'middle';
      const svg = node('svg', { viewBox: '0 0 200 200', 'aria-hidden': 'true' }, this.shadowRoot);
      svg.style.overflow = 'visible';
      svg.style.display = 'block';
      this.svg = svg;
      this.back = paint(node('polygon', {}, svg), PINK);
      this.front = paint(node('polygon', {}, svg), INK);
      this.hole = paint(node('circle', { cx: 100, cy: 100, r: 8 }, svg), PAPER);
      this.sc = { x: 1, v: 0 }; this.ext = { x: 0, v: 0 }; this.off = { x: 0, v: 0 };
      this.cycle = 2.6; this.popAt = 0.72; this.lastPop = -1;
      this.resize();
      this.addEventListener('pointerenter', () => this.pop());
    }
    resize() {
      const s = Number(this.getAttribute('size')) || 46;
      this.svg.setAttribute('width', s);
      this.svg.setAttribute('height', s);
    }
    pop() { this.sc.v += 2.2; this.ext.v += 2.4; this.off.v += 9; }
    frame(dt, t) {
      const p = (t % this.cycle) / this.cycle;
      const cyc = Math.floor(t / this.cycle);
      const charge = p < this.popAt ? p / this.popAt : 0;
      if (p >= this.popAt && this.lastPop !== cyc) { this.lastPop = cyc; this.pop(); }
      spring(this.sc, 1 + 0.08 * charge * charge, dt, 260, 13);
      spring(this.ext, 0, dt, 200, 10);
      spring(this.off, 0, dt, 160, 12);
      const amp = 0.045 * charge * charge;
      const pts = POLAR.map(({ r, a }, i) => {
        const outer = r > 55;
        const rr = r * this.sc.x * (1 + (outer ? this.ext.x * 0.8 : 0)) * (1 + amp * 0.6 * Math.sin(t * 61 + i * 2.3));
        const aa = a + amp * Math.sin(t * 47 + i * 1.7);
        return fmt(100 + Math.cos(aa) * rr) + ',' + fmt(100 + Math.sin(aa) * rr);
      }).join(' ');
      this.front.setAttribute('points', pts);
      this.back.setAttribute('points', pts);
      const o = 1 + Math.max(-0.5, this.off.x);
      this.back.setAttribute('transform', 'translate(' + fmt(8 * o) + ' ' + fmt(6 * o) + ') rotate(9 100 100)');
      this.hole.setAttribute('r', fmt(8 * (0.85 + 0.15 * this.sc.x + this.ext.x * 0.4)));
    }
  }

  class AlboomExplosion extends Animated {
    static get observedAttributes() { return ['viewbox']; }
    attributeChangedCallback() { if (this.svg) this.svg.setAttribute('viewBox', this.getAttribute('viewbox') || '0 0 760 800'); }
    setup() {
      this.style.display = 'block';
      this.style.overflow = 'hidden';
      if (!this.style.width) this.style.width = '100%';
      if (!this.style.height) this.style.height = '100%';
      const svg = node('svg', { viewBox: this.getAttribute('viewbox') || '0 0 760 800', preserveAspectRatio: 'xMidYMid slice', width: '100%', height: '100%', 'aria-hidden': 'true' }, this.shadowRoot);
      svg.style.display = 'block';
      this.svg = svg;
      const C = (this.C = { x: 380, y: 360 });
      const P = (r, deg) => fmt(C.x + r * Math.cos(rad(deg))) + ',' + fmt(C.y + r * Math.sin(rad(deg)));
      this.P = P;
      paint(node('rect', { x: -400, y: -400, width: 1560, height: 1600 }, svg), YELLOW);
      const scene = (this.scene = node('g', {}, svg));
      this.rays = node('g', {}, scene); this.rayRot = 0;
      for (let i = 0; i < 22; i++) {
        const a = (i * 360) / 22 + rand(-3, 3), w = rand(5, 10);
        paint(node('polygon', { points: C.x + ',' + C.y + ' ' + P(1400, a - w) + ' ' + P(1400, a + w) }, this.rays), PINK);
      }
      this.waves = [0, 1, 2, 3, 4, 5].map(() => ({ start: -10, n: paint(node('circle', { cx: C.x, cy: C.y, r: 0, fill: 'none', 'stroke-width': 11, 'stroke-linecap': 'round', 'stroke-dasharray': '0 26', opacity: 0 }, scene), null, INK) }));
      this.waveIdx = 0;
      const layer = (n, oMin, oMax, iMin, iMax, color, shadow, rotSpeed, beat, kick) => {
        const L = { n, oMin, oMax, iMin, iMax, rot: rand(0, 360), rotSpeed, beat, kick, next: rand(0, beat[1]), sc: { x: 1, v: 0 }, sp: [] };
        for (let i = 0; i < n; i++) L.sp.push({ a: (i * 360) / n, o: { x: (oMin + oMax) / 2, v: 0 }, to: 0, ni: { x: (iMin + iMax) / 2, v: 0 }, ti: 0, d: { x: 0, v: 0 }, td: 0 });
        if (shadow) L.shadow = paint(node('polygon', { transform: 'translate(12 10)' }, scene), INK);
        L.poly = paint(node('polygon', { 'stroke-width': 4, 'stroke-linejoin': 'round' }, scene), color, INK);
        this.retarget(L);
        L.sp.forEach((s) => { s.o.x = s.to; s.ni.x = s.ti; s.d.x = s.td; });
        return L;
      };
      this.layers = [];
      this.layers.push(layer(16, 320, 480, 205, 265, BLUE, true, 3, [0.5, 0.9], 2.6));
      this.layers.push(layer(15, 240, 365, 150, 205, PINK, true, -5, [0.45, 0.8], 3.2));
      this.lines = [];
      for (let i = 0; i < 34; i++) this.lines.push({ n: paint(node('polygon', {}, scene), INK), a: (i * 360) / 34 + rand(-4, 4), r1: rand(270, 340), len: rand(90, 290), w: rand(2, 5.5), ph: rand(0, 6.28), sp: rand(1.5, 3) });
      this.lineKick = 0; this.lineRot = 0;
      this.layers.push(layer(14, 180, 275, 112, 152, YELLOW, true, 6, [0.4, 0.7], 3.8));
      this.layers.push(layer(13, 122, 192, 80, 106, CARD, false, -7, [0.35, 0.65], 4.4));
      this.inner = node('g', {}, scene); this.innerRot = 0;
      for (let r = 70; r <= 156; r += 14) paint(node('circle', { cx: C.x, cy: C.y, r, fill: 'none', 'stroke-width': (6 - (r - 70) / 30).toFixed(1), 'stroke-linecap': 'round', 'stroke-dasharray': '0 ' + (13 + (r - 70) / 20).toFixed(1), opacity: 0.55 }, this.inner), null, INK);
      this.flash = paint(node('circle', { cx: C.x, cy: C.y, r: 0, opacity: 0 }, scene), CARD);
      this.flashA = 0;
      this.core = { back: paint(node('polygon', { points: BURST }, scene), PINK), front: paint(node('polygon', { points: BURST }, scene), INK), hole: paint(node('circle', { cx: C.x, cy: C.y, r: 11 }, scene), PAPER), sc: { x: 1, v: 0 } };
      const colors = [INK, BLUE, PINK, CARD, INK, YELLOW];
      this.debris = [];
      for (let i = 0; i < 16; i++) {
        const sz = rand(10, 32);
        const pts = [0, 1, 2].map((k) => { const aa = k * 120 + rand(-30, 30), rr = sz * rand(0.6, 1.2); return fmt(Math.cos(rad(aa)) * rr) + ',' + fmt(Math.sin(rad(aa)) * rr); }).join(' ');
        this.debris.push({ n: paint(node('polygon', { points: pts, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, scene), colors[i % colors.length], INK), a: rand(0, 360), r: rand(220, 560), vel: rand(40, 110), rot: rand(0, 360), spin: rand(-120, 120) });
      }
      this.sparks = [];
      for (let i = 0; i < 7; i++) {
        const R = rand(12, 26), q = R * 0.26;
        const pts = [[0, -R], [q, -q], [R, 0], [q, q], [0, R], [-q, q], [-R, 0], [-q, -q]].map(([x, y]) => fmt(x) + ',' + fmt(y)).join(' ');
        this.sparks.push({ n: paint(node('polygon', { points: pts, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, scene), CARD, INK), a: rand(0, 360), r: rand(190, 500), ph: rand(0, 6.28), sp: rand(1.6, 3.2) });
      }
      this.boost = 0; this.nextBoom = 0.8; this.prevBoom = 0; this.shake = 0; this.rayVel = 0;
    }
    retarget(L) {
      const step = 360 / L.n;
      L.sp.forEach((s) => { s.to = rand(L.oMin, L.oMax); s.ti = rand(L.iMin, L.iMax); s.td = rand(-step * 0.35, step * 0.35); });
      for (let k = 0; k < 2; k++) L.sp[Math.floor(Math.random() * L.n)].to = L.oMax * rand(1.12, 1.3);
      L.sp[Math.floor(Math.random() * L.n)].to = L.oMin * 0.8;
    }
    boom(t) {
      this.layers.forEach((L) => { L.sc.v += L.kick; this.retarget(L); });
      this.core.sc.v += 6.5;
      this.shake = 1;
      this.flashA = 1;
      this.rayVel += 70;
      this.lineKick = 1;
      this.boost = 1;
      for (let k = 0; k < 3; k++) { const w = this.waves[this.waveIdx++ % this.waves.length]; w.start = t + k * 0.16; }
      this.prevBoom = t;
      this.nextBoom = t + rand(1.8, 2.6);
    }
    frame(dt, t) {
      const C = this.C, P = this.P;
      if (dt > 0 && t >= this.nextBoom) this.boom(t);
      this.rayVel *= Math.exp(-2.5 * dt);
      this.rayRot += (8 + this.rayVel) * dt;
      this.shake *= Math.exp(-6 * dt);
      const sh = this.shake * 16;
      this.scene.setAttribute('transform', sh > 0.3 ? 'translate(' + fmt(rand(-sh, sh)) + ' ' + fmt(rand(-sh, sh)) + ')' : 'translate(0 0)');
      this.flashA *= Math.exp(-7 * dt);
      this.flash.setAttribute('r', fmt(60 + (1 - this.flashA) * 260));
      this.flash.setAttribute('opacity', (0.85 * this.flashA).toFixed(2));
      this.rays.setAttribute('transform', 'rotate(' + fmt(this.rayRot) + ' ' + C.x + ' ' + C.y + ')');
      this.innerRot -= 10 * dt;
      this.inner.setAttribute('transform', 'rotate(' + fmt(this.innerRot) + ' ' + C.x + ' ' + C.y + ')');
      this.waves.forEach((w) => {
        const age = t - w.start;
        if (age < 0 || age > 1.4) { w.n.setAttribute('opacity', 0); return; }
        w.n.setAttribute('r', fmt(80 + age * 440));
        w.n.setAttribute('opacity', (0.85 * (1 - age / 1.4)).toFixed(2));
      });
      this.layers.forEach((L) => {
        L.sp.forEach((s) => { spring(s.o, s.to, dt, 120, 11); spring(s.ni, s.ti, dt, 120, 11); spring(s.d, s.td, dt, 120, 11); });
        spring(L.sc, 1, dt, 180, 10);
        L.rot += L.rotSpeed * dt;
        if (dt > 0 && t >= L.next) { this.retarget(L); L.next = t + rand(L.beat[0], L.beat[1]); }
        const step = 360 / L.n, pts = [];
        L.sp.forEach((s, i) => {
          const q = L.sp[(i + 1) % L.n];
          pts.push(P(s.o.x * L.sc.x, s.a + s.d.x + L.rot));
          pts.push(P(s.ni.x * L.sc.x, s.a + step / 2 + (s.d.x + q.d.x) / 2 + L.rot));
        });
        const str = pts.join(' ');
        L.poly.setAttribute('points', str);
        if (L.shadow) L.shadow.setAttribute('points', str);
      });
      this.lineKick *= Math.exp(-3 * dt);
      this.lineRot += 2 * dt;
      this.lines.forEach((l) => {
        const pulse = 1 + 0.1 * Math.sin(t * l.sp + l.ph);
        const r1 = l.r1 * pulse + this.lineKick * 170;
        const r2 = r1 + l.len * (0.85 + 0.25 * Math.sin(t * l.sp * 0.7 + l.ph) + this.lineKick * 0.8);
        const da = ((l.w / r2) * 180) / Math.PI;
        const a = l.a + this.lineRot;
        l.n.setAttribute('points', P(r1, a) + ' ' + P(r2, a - da) + ' ' + P(r2, a + da));
      });
      const sinceBoom = this.nextBoom - t;
      const charge = sinceBoom < 1.2 ? 1 - sinceBoom / 1.2 : 0;
      spring(this.core.sc, 1 + 0.28 * charge * charge, dt, 220, 10);
      const s = 1.3 * this.core.sc.x, wob = charge * charge * 10 * Math.sin(t * 55);
      this.core.front.setAttribute('transform', 'translate(' + C.x + ' ' + C.y + ') rotate(' + fmt(12 + wob) + ') scale(' + s.toFixed(3) + ') translate(-100 -100)');
      this.core.back.setAttribute('transform', 'translate(' + (C.x + 14) + ' ' + (C.y + 11) + ') rotate(' + fmt(21 + wob) + ') scale(' + s.toFixed(3) + ') translate(-100 -100)');
      this.core.hole.setAttribute('r', fmt(11 * this.core.sc.x));
      this.boost *= Math.exp(-2.2 * dt);
      this.debris.forEach((d) => {
        d.r += d.vel * (1 + this.boost * 10) * dt;
        d.rot += d.spin * (1 + this.boost * 5) * dt;
        if (d.r > 600) { d.r = rand(170, 240); d.a = rand(0, 360); }
        const [x, y] = P(d.r, d.a).split(',');
        d.n.setAttribute('transform', 'translate(' + x + ' ' + y + ') rotate(' + fmt(d.rot) + ')');
      });
      this.sparks.forEach((k) => {
        const sc = (0.35 + 0.75 * Math.abs(Math.sin(t * k.sp + k.ph))) * (1 + this.boost * 0.9);
        const [x, y] = P(k.r, k.a).split(',');
        k.n.setAttribute('transform', 'translate(' + x + ' ' + y + ') rotate(' + fmt(t * 40 + k.ph * 30) + ') scale(' + sc.toFixed(2) + ')');
      });
    }
  }

  customElements.define('alboom-burst', AlboomBurst);
  customElements.define('alboom-explosion', AlboomExplosion);
})();
