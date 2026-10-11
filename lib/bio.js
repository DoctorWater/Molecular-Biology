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
// A nucleic-acid strand (BOOK.md visual model `strand`): sugar (pentagon) – phosphate (circle) backbone in COL.dim and base
// beads in BASE colours. seq is read 5'→3' and runs left to right, or right to left with rev; up: beads above the backbone
// (false: below, the lower strand of a duplex). Unit i appears at t0 + i·step; t0 null leaves the units hidden. Returns the
// group with .units[i] (.pho, .sug, .bead, .link — the bond to the previous sugar, null for unit 0), .end5/.end3 labels, .xAt(i).
function strand(p, seq, x, y, t0, { dx = 100, up = true, rev = false, step = 0, ends = true, r = 24 } = {}) {
  const g = G(p), n = seq.length, dir = rev ? -1 : 1, by = (up ? -1 : 1) * (r + 46), hp = -dir * dx / 2, bb = { stroke: COL.dim, 'stroke-width': 4 };
  g.xAt = i => x + dir * i * dx;
  const pent = [0, 1, 2, 3, 4].map(k => `${(15 * Math.sin(k * 1.2566)).toFixed(1)} ${(-15 * Math.cos(k * 1.2566)).toFixed(1)}`).join('L');
  g.units = [...seq].map((b, i) => {
    const u = G(g, { x: g.xAt(i), y, o: 0 });
    u.link = i ? path(u, `M${-dir * dx} 0H${hp}`, bb) : null;
    path(u, `M${hp} 0H0V${by}`, bb);
    u.pho = G(u, { x: hp });
    mk('circle', { r: 11, fill: COL.dim }, u.pho);
    u.sug = mk('path', { d: `M${pent}Z`, fill: CARD, stroke: COL.dim, 'stroke-width': 3.5 }, u);
    u.bead = G(u, { y: by });
    mk('circle', { r, fill: BASE[b] }, u.bead);
    T(u.bead, b, { y: r * .4, size: r * 1.05, fill: COL.board, weight: 700, anchor: 'middle' });
    if (t0 != null) show(u, t0 + i * step, .4);
    return u;
  });
  if (ends) {
    const lab = (s, lx) => T(g, s, { x: lx, y: y + 11, size: 30, weight: 700, anchor: 'middle', o: 0 });
    g.end5 = lab('5′', g.xAt(0) + hp * 2 - dir * 10);
    g.end3 = lab('3′', g.xAt(n - 1) + dir * 40);
    if (t0 != null) { show(g.end5, t0); show(g.end3, t0 + (n - 1) * step); }
  }
  return g;
}

// Bases as ring skeletons (ch02, ch03).
const PURINE = { A: true, G: true };
const BNAME = { A: 'аденин', G: 'гуанин', C: 'цитозин', T: 'тимин', U: 'урацил' };
// Ring outlines in units of the ring radius R: six-membered ring with vertical sides; the purine five-ring shares its left side.
const R6 = [[0, -1], [.866, -.5], [.866, .5], [0, 1], [-.866, .5], [-.866, -.5]];
const R5 = [[-.866, -.5], [-1.817, -.809], [-2.405, 0], [-1.817, .809], [-.866, .5]];
const poly = (pts, R) => 'M' + pts.map(([a, b]) => `${(a * R).toFixed(1)} ${(b * R).toFixed(1)}`).join('L') + 'Z';
const ringStyle = c => ({ fill: mix(COL.board, c, .2), stroke: c, 'stroke-width': 4, 'stroke-linejoin': 'round' });
// A base as its ring skeleton centred on the six-membered ring (.ring6); purines get the five-ring on the left (.ring5;
// flip: on the right), thymine its methyl group (.me). Visible at once when t0 is null.
function baseRings(p, b, x, y, t0, { R = 40, s = 1, flip = false } = {}) {
  const g = G(p, { x, y, s, o: t0 == null ? 1 : 0 }), c = BASE[b];
  if (PURINE[b]) g.ring5 = mk('path', { d: poly(flip ? R5.map(([u, v]) => [-u, v]) : R5, R), ...ringStyle(c) }, g);
  g.ring6 = mk('path', { d: poly(R6, R), ...ringStyle(c) }, g);
  if (b === 'T') {
    g.me = G(g);
    path(g.me, `M0 ${-R}V${-R - 16}`, { stroke: c, 'stroke-width': 4 });
    T(g.me, 'CH₃', { y: -R - 24, size: Math.max(20, R * .5), fill: c, weight: 700, anchor: 'middle' });
  }
  T(g, b, { y: R * .3, size: R * .8, fill: c, weight: 700, anchor: 'middle' });
  if (t0 != null) show(g, t0);
  return g;
}
// Where a base's bond to the sugar starts, relative to its ring centre: N9, the five-ring corner next to C4 (purines); N1, a lower ring corner (pyrimidines).
const anchorOf = (b, R = 40) => PURINE[b] ? [-1.817 * R, .809 * R] : [-.866 * R, .5 * R];
// An atom letter on a board-coloured disc that hides the bond line under it.
function atom(p, str, x, y, { fill = COL.chalk, size = 28, o = 1 } = {}) {
  const g = G(p, { x, y, o });
  mk('circle', { r: size * .62, fill: COL.board }, g);
  T(g, str, { y: size * .36, size, fill, weight: 700, anchor: 'middle' });
  return g;
}

// A duplex (BOOK.md visual model `duplex`): the top strand seq 5′→3′ left to right with its beads below the backbone, the
// complementary strand under it running 3′→5′, and hydrogen-bond dashes between partners (2 for A–T, 3 for G–C). The top
// strand appears at t0 (+ i·step), the lower one and the bonds at t1 (+ i·step; null leaves them hidden). Returns
// {top, bot, at(i) — the lower unit paired with top unit i, bonds[i], comp — the lower strand read 5′→3′}.
const COMP = { A: 'T', T: 'A', G: 'C', C: 'G' };
function duplex(p, seq, x, y, t0, { dx = 100, gap = 240, t1 = t0, step = 0, r = 24, ends = true } = {}) {
  const n = seq.length, comp = [...seq].reverse().map(b => COMP[b]).join('');
  const top = strand(p, seq, x, y, t0, { dx, up: false, step, ends, r });
  const bot = strand(p, comp, x + (n - 1) * dx, y + gap, null, { dx, rev: true, ends, r });
  const at = i => bot.units[n - 1 - i], y1 = y + 2 * r + 46 + 6, y2 = y + gap - 2 * r - 46 - 6;
  const bonds = [...seq].map((b, i) => {
    const g = G(p, { o: 0 }), k = b === 'G' || b === 'C' ? 3 : 2;
    for (let j = 0; j < k; j++) path(g, `M${top.xAt(i) + (j - (k - 1) / 2) * 13} ${y1}V${y2}`, { stroke: COL.chalk, 'stroke-width': 3, 'stroke-dasharray': '5 6' });
    return g;
  });
  if (t1 != null) {
    [...seq].forEach((b, i) => { show(at(i), t1 + i * step, .4); show(bonds[i], t1 + i * step + .2, .3); });
    if (ends) { show(bot.end3, t1); show(bot.end5, t1 + (n - 1) * step); }
  }
  return { top, bot, at, bonds, comp };
}
