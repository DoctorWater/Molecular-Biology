// Shared drawing helpers and colours of this book (BOOK.md). Load after engine.js, before a chapter's script.
'use strict';
// Molecule classes: DNA amber, RNA lilac, protein pink; right/wrong.
const DNA = COL.task, RNA = COL.real, PROT = COL.rat, OK = COL.good, NO = COL.bad;
// Bases (BOOK.md): A salmon, T blue, G yellow, C green, U lilac.
const BASE = { A: COL.nat, T: COL.whole, G: COL.int, C: COL.irr, U: COL.real };
const WIDE = { x: 96, y: 56, w: 1408, cls: 'side', maxH: 830 };
const CARD = '#22322d';   // fill of drawn cards and vessels

const say = (p, str, x, y, t0, { size = 30, fill = COL.chalk, anchor = 'middle', weight = 500 } = {}) => {
  const e = T(p, str, { x, y, size, fill, anchor, weight, o: 0 });
  show(e, t0);
  return e;
};
function yesNo(p, good, x, y, t0, s = 1) {
  const g = G(p, { x, y, o: 0, s });
  path(g, good ? 'M-14 0L-4 11L16 -12' : 'M-12 -12L12 12M12 -12L-12 12', { stroke: good ? OK : NO, 'stroke-width': 6 });
  show(g, t0);
  return g;
}
const arrowTo = (p, x1, y1, x2, y2, color, t0, dash) => {
  const a = Math.atan2(y2 - y1, x2 - x1), hx = x2 - 22 * Math.cos(a), hy = y2 - 22 * Math.sin(a);
  const g = G(p, { o: 0 });
  path(g, `M${x1} ${y1}L${hx} ${hy}`, { stroke: color, 'stroke-width': 5, ...(dash ? { 'stroke-dasharray': '14 10' } : {}) });
  mk('path', { d: `M${x2} ${y2}L${hx - 12 * Math.sin(a)} ${hy + 12 * Math.cos(a)}L${hx + 12 * Math.sin(a)} ${hy - 12 * Math.cos(a)}Z`, fill: color }, g);
  show(g, t0);
  return g;
};
// A card of short lines: title in colour, then text lines ([text, colour] for a coloured line).
function infoCard(p, x, y, w, title, lines, color, t0, step = .5) {
  const box = mk('rect', { x, y, width: w, height: 86 + lines.length * 46, rx: 18, fill: CARD, stroke: color, 'stroke-width': 2.5 }, p);
  put(box, { o: 0 }); show(box, t0);
  say(p, title, x + 28, y + 50, t0, { size: 30, fill: color, anchor: 'start', weight: 700 });
  return lines.map((ln, i) => {
    const [str, fill = COL.chalk] = [].concat(ln);
    return say(p, str, x + 28, y + 100 + i * 46, t0 + .3 + i * step, { size: 25, fill, anchor: 'start' });
  });
}
// A word in a rounded frame (UI font, unlike the engine's math chip), centred on (x, y); hidden until t0.
function pill(p, str, color, x, y, t0, size = 30) {
  const g = G(p, { x, y, o: 0 }), w = uiW(str, size) + 44, h = size + 26;
  mk('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2, fill: CARD, stroke: color, 'stroke-width': 2.5 }, g);
  T(g, str, { y: size * .36, size, fill: color, weight: 600, anchor: 'middle' });
  if (t0 != null) { put(g, { s: .6 }); pop(g, t0); }
  return g;
}
// A line of coloured pieces [[text, colour], …] in one text element; hidden until t0.
function colorLine(p, parts, x, y, t0, { size = 30, anchor = 'middle', weight = 600 } = {}) {
  const e = T(p, '', { x, y, size, anchor, weight, o: 0 });
  parts.forEach(([s, c = COL.chalk]) => { mk('tspan', { fill: c }, e).textContent = s; });
  if (t0 != null) show(e, t0);
  return e;
}
// Numbered takeaways for a wrap beat: items [[text, mark], …] slide in on their marks.
function numbered(p, items, m, y0 = 230, dy = 130, size = 32) {
  items.forEach(([str, mark], i) => {
    const g = G(p, { x: -16, y: y0 + i * dy, o: 0 });
    mk('circle', { cx: 110, cy: -12, r: 26, fill: DNA }, g);
    T(g, String(i + 1), { x: 110, y: -1, size: 30, fill: COL.board, weight: 700, anchor: 'middle' });
    T(g, str, { x: 166, size, weight: 600 });
    tw(g, { o: 1, x: 0 }, m(mark), .6);
  });
}
// A test tube centred on x with its rim at y (h tall, w wide); returns the group with .fill(y1, y2, colour, t0) for
// a liquid layer between depths y1..y2 (0 = rim) and .band(depth, colour, t0) for a thin band (density gradient, ch06).
function tube(p, x, y, t0, { w = 90, h = 300, label } = {}) {
  const g = G(p, { x, y, o: 0 }), r = w / 2;
  const inner = G(g);
  const clip = `M${-r} 0V${h - r}A${r} ${r} 0 0 0 ${r} ${h - r}V0`;
  path(g, clip, { stroke: COL.chalk, 'stroke-width': 4, fill: 'none' });
  path(g, `M${-r - 10} 0H${r + 10}`, { stroke: COL.chalk, 'stroke-width': 4 });
  if (label) T(g, label, { y: h + 44, size: 24, fill: COL.dim, weight: 600, anchor: 'middle' });
  show(g, t0);
  // The rounded bottom: a layer reaching below h − r is clipped to the tube outline by drawing it as the outline's lower part.
  g.fill = (y1, y2, color, at, o = .45) => {
    const lo = Math.min(y2, h - r);
    const d = y2 > h - r ? `M${-r + 3} ${y1}V${lo}A${r - 3} ${r - 3} 0 0 0 ${r - 3} ${lo}V${y1}Z` : `M${-r + 3} ${y1}H${r - 3}V${y2}H${-r + 3}Z`;
    const e = mk('path', { d, fill: color, 'fill-opacity': o }, inner);
    put(e, { o: 0 }); show(e, at);
    return e;
  };
  g.band = (depth, color, at, th = 12) => {
    const e = mk('rect', { x: -r + 4, y: depth - th / 2, width: w - 8, height: th, rx: th / 2, fill: color }, inner);
    put(e, { o: 0 }); show(e, at);
    return e;
  };
  return g;
}
