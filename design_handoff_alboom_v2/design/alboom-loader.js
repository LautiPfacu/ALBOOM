/* <alboom-loader> — el estallido de ALBOOM animado para estados de carga.
   Atributos: size (px, 72 por defecto) y, opcionales, fill (cuerpo), shadow (sombra) y hole (agujero).
   Sin colores usa var(--ink), var(--pink) y var(--paper), así que sigue al tema activo.
   Cada 260–520 ms los 15 picos eligen un largo y un ángulo nuevos al azar y llegan con un resorte
   (rebote elástico). La sombra repite la forma con 5 cuadros de retraso. Todo gira despacio.
   Con prefers-reduced-motion solo gira lento, sin cambiar de forma. */
(() => {
  if (customElements.get('alboom-loader')) return;
  const N = 15, NS = 'http://www.w3.org/2000/svg';
  const rand = (a, b) => a + Math.random() * (b - a);
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  class AlboomLoader extends HTMLElement {
    static get observedAttributes() { return ['size', 'fill', 'shadow', 'hole']; }
    connectedCallback() {
      if (this.raf) cancelAnimationFrame(this.raf);
      if (!this.hasAttribute('role')) this.setAttribute('role', 'status');
      if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Cargando');
      this.style.display = 'inline-block';
      this.style.lineHeight = '0';
      this.build();
      this.last = performance.now();
      this.next = 0;
      this.raf = requestAnimationFrame(this.tick);
    }
    disconnectedCallback() { cancelAnimationFrame(this.raf); }
    attributeChangedCallback() { if (this.svg) this.paint(); }
    build() {
      // Shadow root: React (u otro framework) nunca ve ni pisa el SVG interno.
      const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
      root.innerHTML = '';
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '-14 -14 236 236');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.overflow = 'visible';
      this.back = document.createElementNS(NS, 'polygon');
      this.back.setAttribute('transform', 'translate(8 6) rotate(9 100 100)');
      this.front = document.createElementNS(NS, 'polygon');
      this.hole = document.createElementNS(NS, 'circle');
      this.hole.setAttribute('cx', '100');
      this.hole.setAttribute('cy', '100');
      svg.append(this.back, this.front, this.hole);
      root.append(svg);
      this.svg = svg;
      this.spikes = Array.from({ length: N }, (_, i) => ({ a: (i * 360) / N, d: 0, vd: 0, td: 0, o: 74, vo: 0, to: 74, n: 38, vn: 0, tn: 38 }));
      this.rot = 0; this.scale = 1; this.vs = 0; this.history = [];
      this.paint();
      this.retarget(true);
    }
    paint() {
      const size = Number(this.getAttribute('size')) || 72;
      this.svg.setAttribute('width', size);
      this.svg.setAttribute('height', size);
      // Sin atributos toma los colores del tema activo (variables de tokens.css / themes.css).
      this.front.style.fill = this.getAttribute('fill') || 'var(--ink, #1F1E2B)';
      this.back.style.fill = this.getAttribute('shadow') || 'var(--pink, #FF5C8A)';
      this.hole.style.fill = this.getAttribute('hole') || 'var(--paper, #F5F1E6)';
    }
    retarget(all) {
      for (const p of this.spikes) {
        if (all || Math.random() < 0.7) { p.to = rand(56, 98); p.tn = rand(26, 46); p.td = rand(-11, 11); }
      }
      this.spikes[Math.floor(Math.random() * N)].to = rand(98, 110);
      this.vs += rand(0.9, 1.6);
    }
    tick = (now) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      const still = reduced();
      if (!still && now > this.next) { this.retarget(false); this.next = now + rand(260, 520); }
      const K = 260, D = 16;
      for (const p of this.spikes) {
        p.vo += ((p.to - p.o) * K - p.vo * D) * dt; p.o += p.vo * dt;
        p.vn += ((p.tn - p.n) * K - p.vn * D) * dt; p.n += p.vn * dt;
        p.vd += ((p.td - p.d) * K - p.vd * D) * dt; p.d += p.vd * dt;
      }
      this.vs += ((1 - this.scale) * K - this.vs * D) * dt;
      this.scale += this.vs * dt;
      this.rot += (still ? 14 : 30) * dt;
      const pts = [];
      const step = 360 / N;
      this.spikes.forEach((p, i) => {
        const q = this.spikes[(i + 1) % N];
        const ao = ((p.a + p.d + this.rot) * Math.PI) / 180;
        const ai = ((p.a + step / 2 + (p.d + q.d) / 2 + this.rot) * Math.PI) / 180;
        pts.push((100 + Math.cos(ao) * p.o * this.scale).toFixed(1) + ',' + (100 + Math.sin(ao) * p.o * this.scale).toFixed(1));
        pts.push((100 + Math.cos(ai) * p.n * this.scale).toFixed(1) + ',' + (100 + Math.sin(ai) * p.n * this.scale).toFixed(1));
      });
      const str = pts.join(' ');
      this.front.setAttribute('points', str);
      this.history.push(str);
      if (this.history.length > 5) this.history.shift();
      this.back.setAttribute('points', this.history[0]);
      this.hole.setAttribute('r', (8 * (1 + (this.scale - 1) * 3)).toFixed(2));
      this.raf = requestAnimationFrame(this.tick);
    };
  }
  customElements.define('alboom-loader', AlboomLoader);
})();
