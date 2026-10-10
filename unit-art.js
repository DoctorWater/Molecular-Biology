// Chalk sketches for the unit headers on the contents page, one per unit, drawn in the unit's colour.
// Each entry is the inside of an SVG with viewBox 0 0 600 180; keep the left ~200 px light (the unit title sits there
// on narrow screens). Classes, styled in book.html:
//   d  a stroke that draws itself in when the unit scrolls into view (--k orders the strokes)
//   t  text or a filled shape that fades in
//   a  faint chalk white instead of the unit colour;  faint  even fainter
// A sketch may add one looping motion after it is drawn: give an element a class and add a .seen .unit-art .NAME
// rule with its keyframes in book.html (see the examples there: swap-a, hop, spin, tilt, breathe, ...).
'use strict';
(() => {
  let k = 0;
  const P = (d, cls = '', extra = '') => `<path class="d ${cls}" pathLength="1" style="--k:${k++}" d="${d}" ${extra}/>`;
  const Tx = (x, y, s, size = 24, cls = '', anchor = 'start') => `<text class="t ${cls}" style="--k:${k++}" x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}">${s}</text>`;
  const C = (cx, cy, r, cls = '') => `<circle class="d ${cls}" pathLength="1" style="--k:${k++}" cx="${cx}" cy="${cy}" r="${r}"/>`;
  const reset = s => { k = 0; return s; };

  window.UNIT_ART = [
    // Открытие и строение ДНК: двойная спираль с перекладинами-парами, по одной цепи едет точка.
    (() => {
      const sine = ph => 'M' + Array.from({ length: 69 }, (_, i) => `${230 + i * 5} ${(90 + 42 * Math.sin(i * 5 / 170 * 2 * Math.PI + ph)).toFixed(1)}`).join('L');
      const rungs = Array.from({ length: 16 }, (_, i) => {
        const x = 236 + i * 21, y = 42 * Math.sin((x - 230) / 170 * 2 * Math.PI);
        return P(`M${x} ${(90 + y).toFixed(1)}V${(90 - y).toFixed(1)}`, 'a');
      }).join('');
      return reset(P(sine(0)) + P(sine(Math.PI)) + rungs +
        `<circle class="t ride" r="7" fill="currentColor" stroke="none" style="--k:${k++};offset-path:path('${sine(0)}')"/>` +
        Tx(575, 40, '5′', 22, 'a', 'end') + Tx(575, 160, '3′', 22, 'a', 'end'));
    })(),
  ];
})();
