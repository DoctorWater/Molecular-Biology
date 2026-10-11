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
// (false: below, the lower strand of a duplex). Unit i appears at t0 + i·step; t0 null leaves the units hidden. col: backbone
// colour (COL.chalk parental, DNA new strand, ch06). Returns the
// group with .units[i] (.pho, .sug, .bead, .link — the bond to the previous sugar, null for unit 0), .end5/.end3 labels, .xAt(i).
function strand(p, seq, x, y, t0, { dx = 100, up = true, rev = false, step = 0, ends = true, r = 24, col = COL.dim } = {}) {
  const g = G(p), n = seq.length, dir = rev ? -1 : 1, by = (up ? -1 : 1) * (r + 46), hp = -dir * dx / 2, bb = { stroke: col, 'stroke-width': 4 };
  g.xAt = i => x + dir * i * dx;
  const pent = [0, 1, 2, 3, 4].map(k => `${(15 * Math.sin(k * 1.2566)).toFixed(1)} ${(-15 * Math.cos(k * 1.2566)).toFixed(1)}`).join('L');
  g.units = [...seq].map((b, i) => {
    const u = G(g, { x: g.xAt(i), y, o: 0 });
    u.link = i ? path(u, `M${-dir * dx} 0H${hp}`, bb) : null;
    path(u, `M${hp} 0H0V${by}`, bb);
    u.pho = G(u, { x: hp });
    mk('circle', { r: 11, fill: col }, u.pho);
    u.sug = mk('path', { d: `M${pent}Z`, fill: CARD, stroke: col, 'stroke-width': 3.5 }, u);
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
// {top, bot, at(i) — the lower unit paired with top unit i, bonds[i], comp — the lower strand read 5′→3′}. col: the two backbone colours.
const COMP = { A: 'T', T: 'A', G: 'C', C: 'G' };
function duplex(p, seq, x, y, t0, { dx = 100, gap = 240, t1 = t0, step = 0, r = 24, ends = true, col = [COL.dim, COL.dim] } = {}) {
  const n = seq.length, comp = [...seq].reverse().map(b => COMP[b]).join('');
  const top = strand(p, seq, x, y, t0, { dx, up: false, step, ends, r, col: col[0] });
  const bot = strand(p, comp, x + (n - 1) * dx, y + gap, null, { dx, rev: true, ends, r, col: col[1] });
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

// From ch03: year tag, brackets, the side view of the helix, a flat base pair, letter rows.
// The year in large amber at the top left, names beside it (as in ch01).
function yearTag(p, year, names, t0) {
  say(p, year, 90, 118, t0, { size: 58, fill: DNA, weight: 700, anchor: 'start' });
  say(p, names, 90 + uiW(year, 58) * 1.12 + 30, 112, t0 + .3, { size: 30, fill: COL.dim, weight: 600, anchor: 'start' });
}
// A bracket from x1 to x2 at height y with its label above (up) or below.
function hBracket(p, x1, x2, y, str, color, t0, { up = true, size = 26 } = {}) {
  const g = G(p, { o: 0 }), h = up ? 12 : -12;
  path(g, `M${x1} ${y + h}V${y}H${x2}V${y + h}`, { stroke: color, 'stroke-width': 3 });
  T(g, str, { x: (x1 + x2) / 2, y: up ? y - 14 : y + 36, size, fill: color, weight: 700, anchor: 'middle' });
  show(g, t0);
  return g;
}
// A vertical bracket from y1 to y2 at x with its label to the right (or left).
function vBracket(p, x, y1, y2, str, color, t0, { right = true, size = 26 } = {}) {
  const g = G(p, { o: 0 }), w = right ? -12 : 12;
  path(g, `M${x + w} ${y1}H${x}V${y2}H${x + w}`, { stroke: color, 'stroke-width': 3 });
  T(g, str, { x: x + (right ? 14 : -14), y: (y1 + y2) / 2 + 9, size, fill: color, weight: 700, anchor: right ? 'start' : 'end' });
  show(g, t0);
  return g;
}
// Side view of a double helix along a horizontal axis, 10 px per ångström by default (B-DNA: pitch P = 34 Å, radius A = 10 Å,
// n = 10 pairs per turn): two backbones as sine curves, strand 1 behind strand 0 by the minor-groove width; base-pair rungs
// every P/n; back halves dimmed. Front segments run from upper left to lower right (right-handed); left: mirrored (Z-DNA).
// zig: backbones as zigzags through the nucleotide positions (Z-DNA); tilt: rungs tilted by this many degrees (A-DNA);
// col: colours of the two front backbones (RNA, hybrids). Returns the group with .rungs, .back, .front, .yAt(x, s),
// .crest(j, s) — x of the j-th top crest of strand s, and .curve(shift, front) — the path of a backbone shifted by shift px.
const RUNG_SEQ = 'ATGCGATCCGTAAGCTTGCAGTCAGGATCC';
function helixSide(p, x0, y0, len, t0, { P = 340, A = 100, minor = 12 / 34, n = 10, left = false, zig = false, tilt = 0, col = [COL.chalk, COL.chalk] } = {}) {
  const g = G(p, { o: t0 == null ? 1 : 0 }), k = 2 * Math.PI / P, d = minor * P, step = zig ? P / n : 3;
  const yAt = (x, s) => y0 - A * Math.sin(k * (x - x0 - s * d));
  g.curve = (sh, fr) => {
    const y = (x, i) => y0 - A * Math.sin(k * (x - x0 - sh)) + (zig ? (i % 2 ? .2 : -.2) * A : 0);
    let str = '', pen = false;
    for (let i = 0, x = x0; x < x0 + len - .01; i++, x += step) {
      const x2 = Math.min(x + step, x0 + len);
      if (((Math.cos(k * ((x + x2) / 2 - x0 - sh)) < 0) !== left) === fr) {
        if (!pen) str += `M${x.toFixed(1)} ${y(x, i).toFixed(1)}`;
        str += `L${x2.toFixed(1)} ${y(x2, i + 1).toFixed(1)}`;
        pen = true;
      } else pen = false;
    }
    return str;
  };
  const back = G(g), mid = G(g), front = G(g), tn = Math.tan(tilt * Math.PI / 180);
  [0, 1].forEach(s => path(back, g.curve(s * d, false), { stroke: COL.dim, 'stroke-width': 7, opacity: .5 }));
  g.rungs = [];
  for (let x = x0 + P / (2 * n), i = 0; x < x0 + len; x += P / n, i++) {
    const b = RUNG_SEQ[i % RUNG_SEQ.length], h = (yAt(x, 1) - yAt(x, 0)) / 2 * tn;
    const xa = x - h, xb = x + h, ya = yAt(xa, 0), yb = yAt(xb, 1), r = G(mid);
    path(r, `M${xa} ${ya}L${x} ${(ya + yb) / 2}`, { stroke: BASE[b], 'stroke-width': 7 });
    path(r, `M${x} ${(ya + yb) / 2}L${xb} ${yb}`, { stroke: BASE[COMP[b]], 'stroke-width': 7 });
    g.rungs.push(r);
  }
  [0, 1].forEach(s => path(front, g.curve(s * d, true), { stroke: col[s], 'stroke-width': 8 }));
  g.back = back; g.front = front; g.yAt = yAt;
  g.crest = (j, s) => x0 + P / 4 + s * d + j * P;
  if (t0 != null) show(g, t0);
  return g;
}
// A base pair drawn flat: b1 on the left (purine five-ring outward), b2 on the right (flipped), k hydrogen-bond dashes between
// the facing ring edges. Returns {g, bonds, x1, x2 — the outer edges}.
function flatPair(p, b1, b2, x, y, t0, { R = 46, L = 100, k } = {}) {
  const g = G(p, { o: t0 == null ? 1 : 0 }), xr = x + 2 * .866 * R + L;
  baseRings(g, b1, x, y, null, { R });
  baseRings(g, b2, xr, y, null, { R, flip: true });
  k = k ?? (b1 === 'G' || b1 === 'C' ? 3 : 2);
  const bonds = G(g);
  for (let j = 0; j < k; j++) {
    const yy = y + (j - (k - 1) / 2) * 26;
    path(bonds, `M${x + .866 * R + 10} ${yy}H${xr - .866 * R - 10}`, { stroke: COL.chalk, 'stroke-width': 3.5, 'stroke-dasharray': '7 6' });
  }
  const ext = b => PURINE[b] ? 2.405 * R : .866 * R;
  if (t0 != null) show(g, t0);
  return { g, bonds, x1: x - ext(b1), x2: xr + ext(b2) };
}
// A row of base letters in their colours with end labels, e.g. 5′- G A A T T C -3′. .chips[i], .xAt(i).
function seqRow(p, seq, x, y, t0, { ends = ['5′', '3′'], dx = 44, size = 44, step = 0 } = {}) {
  const g = G(p);
  g.xAt = i => x + i * dx;
  g.l = T(g, ends[0] + '–', { x: x - dx * .55, y, size: size * .7, fill: COL.dim, weight: 700, anchor: 'end', o: 0 });
  g.r = T(g, '–' + ends[1], { x: g.xAt(seq.length - 1) + dx * .55, y, size: size * .7, fill: COL.dim, weight: 700, o: 0 });
  g.chips = [...seq].map((b, i) => T(g, b, { x: g.xAt(i), y, size, fill: BASE[b], weight: 700, anchor: 'middle', o: 0 }));
  if (t0 != null) { show(g.l, t0); g.chips.forEach((c, i) => show(c, t0 + i * step, .3)); show(g.r, t0 + (seq.length - 1) * step); }
  return g;
}
// The lower row read right to left: copies of its letters fly into a new row in reverse order, with fresh end labels.
function readBack(p, row, seq, x, y, t0, { dx = 44, size = 44 } = {}) {
  const n = seq.length, out = seqRow(p, [...seq].reverse().join(''), x, y, null, { dx, size });
  show(out.l, t0 + .9); show(out.r, t0 + .9);
  out.chips.forEach((c, j) => {
    const i = n - 1 - j, x0 = row.xAt(i), y0 = st(row.chips[i]).y;
    put(c, { x: x0, y: y0 }); show(c, t0, .2); tw(c, { x: out.xAt(j), y }, t0 + .1 + j * .08, .8, io);
  });
  return out;
}
// An enzyme or other protein (BOOK.md visual model `enzyme`): a pink rounded body with its name, centred on (x, y).
function enzyme(p, label, x, y, t0, { w = 180, h = 84, size = 24 } = {}) {
  const g = G(p, { x, y, o: 0 });
  mk('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2, fill: mix(COL.board, PROT, .35), stroke: PROT, 'stroke-width': 3 }, g);
  if (label) T(g, label, { y: size * .36, size, fill: PROT, weight: 700, anchor: 'middle' });
  if (t0 != null) show(g, t0);
  return g;
}

// From ch05: closed DNA as a ribbon, catenanes, a replication fork.
// Axis and strands of twistRing (state below); returns {P — axis points [x, y, z], N — normals, S — two strands of
// [x, y, depth, shade], phi, s — arc fractions, b — bubble weights}.
function ringGeom(c) {
  const K = c.K, P = [], N = [], L = [0];
  for (let i = 0; i <= K; i++) {
    // gq spaces the self-crossings evenly along x: cos(nu·gq) = 0 where cos θ = 1 − (2k + 1)/nu
    const th = -Math.PI + 2 * Math.PI * i / K, rr = 1 + c.wob * Math.cos(3 * th + 1), gq = Math.sign(th) * Math.PI / 2 * (1 - Math.cos(th));
    P.push([c.A * Math.cos(th) * rr, c.B * Math.sin(th) * Math.cos(c.nu * gq) * rr, Math.sin(c.nu * gq) * Math.min(1, c.nu)]);
    if (i) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  }
  const tot = L[K] || 1, s = L.map(v => v / tot), e = .02;
  const b = s.map(v => {
    if (!c.bub) return 0;
    let d = Math.abs(v - c.bs); d = Math.min(d, 1 - d);
    const h = c.bub / 2, k = Math.min(h, e);
    return d >= h ? 0 : d <= h - k ? 1 : .5 + .5 * Math.cos(Math.PI * (d - h + k) / k);
  });
  const u = [0];
  for (let i = 1; i <= K; i++) u.push(u[i - 1] + (1 - (b[i] + b[i - 1]) / 2) * (L[i] - L[i - 1]));
  const U = u[K] || 1, phi = u.map(v => 2 * Math.PI * c.twist * v / U + c.ph);
  for (let i = 0; i <= K; i++) {
    const a = P[i === 0 || i === K ? K - 1 : i - 1], z = P[i === K ? 1 : i + 1], tx = z[0] - a[0], ty = z[1] - a[1], l = Math.hypot(tx, ty) || 1;
    N.push([-ty / l, tx / l]);
  }
  const S = [0, 1].map(j => P.map((q, i) => {
    const ang = phi[i] + j * Math.PI, sg = j ? -1 : 1, k = (1 - b[i]) * Math.cos(ang) + b[i] * sg, off = c.w * k + sg * c.hb * b[i];
    return [q[0] + N[i][0] * off, q[1] + N[i][1] * off, 3 * q[2] + .9 * (1 - b[i]) * Math.sin(ang), (1 - b[i]) * Math.sin(ang)];
  }));
  return { P, N, S, phi, s, b };
}
// Closed DNA as a ribbon (BOOK.md visual model `twistRing`): two strands wound around a closed axis, seen from above. State
// {A, B, nu, twist, wob, w, hb, bub, bs, ph}: the axis x = A·cosθ, y = B·sinθ·cos(nu·g(θ)), θ from −π to π, is a circle or ellipse
// for nu = 0, a figure eight for nu = 1 and an interwound loop with nu self-crossings (supercoils) for larger nu; wob dents it.
// twist: turns of the strands around the axis (the drawn number is conventional); w: half the strand spacing. A bubble — a
// fraction bub of the length centred at bs (0..1 along the axis) — holds the strands hb further apart without turns, and the
// turns crowd into the rest. Pieces are painted back to front over board-coloured halos, so each crossing shows which strand
// is on top; back halves are dimmed. Options: sw stroke width, col the two strand colours, axis a dashed axis line, K samples.
// .set(to, t, dur, ease) morphs the state (numbers lerped), .at(state) redraws, .cur — the state after the scheduled changes;
// .xings(state) — the points where strand 0 passes over strand 1 (one per turn) with outward normals {x, y, nx, ny};
// .loops(state) — the axis self-crossings [x, y]; .pt(state, s) — the axis point at fraction s, [x, y, nx, ny].
function twistRing(p, x, y, t0, o = {}) {
  const { sw = 7, col = [COL.chalk, mix(COL.chalk, COL.board, .35)], axis = false, K = 600, ...st0 } = o;
  const g = G(p, { x, y, o: t0 == null ? 1 : 0 }), L = G(g), m = 3;
  g.cur = { A: 200, B: 200, nu: 0, twist: 6, wob: 0, w: 22, hb: 0, bub: 0, bs: .25, ph: 0, K, ...st0 };
  g.at = c => {
    const geo = ringGeom(c), pcs = [];
    L.replaceChildren();
    if (axis) path(L, 'M' + geo.P.map(q => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('L'), { stroke: COL.dim, 'stroke-width': 2.5, 'stroke-dasharray': '7 9', opacity: .8 });
    geo.S.forEach((pts, j) => {
      for (let i = 0; i < c.K; i += m) {
        const seg = pts.slice(i, i + m + 1);
        pcs.push({ j, d: 'M' + seg.map(q => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('L'), z: seg.reduce((a, q) => a + q[2], 0) / seg.length, sh: seg.reduce((a, q) => a + q[3], 0) / seg.length });
      }
    });
    pcs.sort((a, b) => a.z - b.z);
    for (const q of pcs) {
      path(L, q.d, { stroke: COL.board, 'stroke-width': sw + 9, 'stroke-linecap': 'butt' });
      path(L, q.d, { stroke: mix(col[q.j], COL.board, .3 * (1 - q.sh)), 'stroke-width': sw });
    }
  };
  g.set = (to, t, dur = 1.5, ease = io) => {
    const a = g.cur, b = { ...a, ...to };
    g.cur = b;
    prog(q => { const c = {}; for (const k in b) c[k] = a[k] + (b[k] - a[k]) * q; c.K = b.K; g.at(c); }, t, dur, ease);
    return g;
  };
  g.xings = (c = g.cur) => {
    const geo = ringGeom(c), out = [], f = v => Math.floor((v - Math.PI / 2) / (2 * Math.PI));
    for (let i = 0; i < c.K; i++) if (f(geo.phi[i]) !== f(geo.phi[i + 1]) && geo.b[i] < .5) {
      const [px, py] = geo.P[i], [nx, ny] = geo.N[i], sg = nx * px + ny * py < 0 ? -1 : 1;
      out.push({ x: px, y: py, nx: nx * sg, ny: ny * sg });
    }
    return out;
  };
  g.loops = (c = g.cur) => {
    const out = [];
    if (c.nu < .99) return out;
    for (let k = 0; (2 * k + 1) / c.nu < 2; k++) {
      const th = Math.acos(1 - (2 * k + 1) / c.nu);
      out.push([c.A * Math.cos(th) * (1 + c.wob * Math.cos(3 * th + 1)), 0]);
    }
    return out;
  };
  g.pt = (c, s) => {
    const geo = ringGeom(c), i = Math.max(0, geo.s.findIndex(v => v >= s));
    return [geo.P[i][0], geo.P[i][1], geo.N[i][0], geo.N[i][1]];
  };
  g.at(g.cur);
  if (t0 != null) show(g, t0);
  return g;
}
// Two linked rings (a catenane) centred on (x, y): ring .a on the left, ring .b on the right passing over .a at the top crossing
// and under it at the bottom. .unlink(t, dx) cuts .a at the bottom crossing, slides .b out by dx and closes the cut.
function catenane(p, x, y, t0, { r = 60, d = 72, w = 7, col = [DNA, COL.chalk] } = {}) {
  const g = G(p, { x, y, o: t0 == null ? 1 : 0 }), halo = { stroke: COL.board, 'stroke-width': w + 10, 'stroke-linecap': 'butt' };
  const ring = (cx, c) => {
    const e = G(g);
    mk('circle', { cx, cy: 0, r, fill: 'none', stroke: COL.board, 'stroke-width': w + 10 }, e);
    mk('circle', { cx, cy: 0, r, fill: 'none', stroke: c, 'stroke-width': w }, e);
    return e;
  };
  g.b = ring(d / 2, col[1]);
  g.a = ring(-d / 2, col[0]);
  const h = Math.sqrt(r * r - d * d / 4), arcAt = (cx, a, da) =>
    `M${(cx + r * Math.cos(a - da)).toFixed(1)} ${(r * Math.sin(a - da)).toFixed(1)}A${r} ${r} 0 0 1 ${(cx + r * Math.cos(a + da)).toFixed(1)} ${(r * Math.sin(a + da)).toFixed(1)}`;
  g.patch = G(g);
  const pd = arcAt(d / 2, Math.atan2(-h, -d / 2), .45);
  path(g.patch, pd, halo); path(g.patch, pd, { stroke: col[1], 'stroke-width': w });
  g.cut = path(g, arcAt(-d / 2, Math.atan2(h, d / 2), .16), { stroke: COL.board, 'stroke-width': w + 4, 'stroke-linecap': 'butt' });
  put(g.cut, { o: 0 });
  g.unlink = (t, dx = 2.4 * r) => {
    show(g.cut, t, .2);
    tw(g.b, { x: dx }, t + .4, 1.2); tw(g.patch, { x: dx }, t + .4, 1.2);
    hide(g.cut, t + 1.8, .3);
  };
  if (t0 != null) show(g, t0);
  return g;
}
// A replication fork (BOOK.md visual model `fork`; grows in ch07–11): the duplex ahead as a side-view helix from the fork at x
// to xEnd, the two parental strands spreading behind it to the left by ±spread over back px; hel: the helicase at the tip with
// its label (null: no helicase). .to(x, t, dur, P) moves the fork, optionally changing the pitch ahead (smaller P: overwound);
// .at({x, P}) redraws; .cur — the state after the scheduled moves; .hel — the helicase group.
function fork(p, x, y, t0, { xEnd = 1450, A = 26, P = 70, n = 6, back = 240, spread = 60, hel = 'хеликаза', col = COL.chalk } = {}) {
  const g = G(p, { o: t0 == null ? 1 : 0 }), H = G(g), B = G(g);
  g.cur = { x, P };
  if (hel != null) {
    g.hel = enzyme(g, null, x, y, null, { w: 54, h: 2 * A + 44 });
    put(g.hel, { o: 1 });
    if (hel) T(g.hel, hel, { y: A + 56, size: 22, fill: PROT, weight: 700, anchor: 'middle' });
  }
  g.at = c => {
    H.replaceChildren(); B.replaceChildren();
    if (xEnd - c.x > 2) helixSide(H, c.x, y, xEnd - c.x, null, { P: c.P, A, n });
    [-1, 1].forEach(s => path(B, `M${c.x} ${y + s * A * .4}C${c.x - back * .35} ${y + s * A * .4} ${c.x - back * .55} ${y + s * spread} ${c.x - back} ${y + s * spread}`, { stroke: col, 'stroke-width': 8 }));
    if (g.hel) put(g.hel, { x: c.x });
  };
  g.to = (x2, t, dur = 1.5, P2 = g.cur.P) => {
    const a = g.cur, b = { x: x2, P: P2 };
    g.cur = b;
    prog(q => g.at({ x: a.x + (b.x - a.x) * q, P: a.P + (b.P - a.P) * q }), t, dur);
    return g;
  };
  g.at(g.cur);
  if (t0 != null) show(g, t0);
  return g;
}

// From ch06: a short molecule for replication trees.
// A two-strand molecule icon (BOOK.md visual model `dsIcon`): two horizontal lines w wide and gap apart, centred on (x, y), with
// faint rungs. top/bot: 'old' | 'new', or a list of equal pieces (a mosaic, e.g. ['old', 'new', 'old', 'new']); old (parental,
// ¹⁵N) strands COL.chalk, new (¹⁴N) DNA amber. t0 null: visible at once. Returns the group with .top/.bot (line groups at
// y = ∓gap/2), .rungs, .pieces[line][k] (groups at x = piece start, .kind), .px/.py (the centre).
const STRAND_COL = { old: COL.chalk, new: DNA };
function dsIcon(p, x, y, top, bot, t0, { w = 140, gap = 22, sw = 8 } = {}) {
  const g = G(p, { x, y, o: t0 == null ? 1 : 0 });
  g.px = x; g.py = y;
  g.rungs = G(g);
  for (let k = 1; k * 14 < w; k++) path(g.rungs, `M${-w / 2 + k * 14} ${-gap / 2}V${gap / 2}`, { stroke: COL.dim, 'stroke-width': 2.5 });
  g.pieces = [top, bot].map((kinds, li) => {
    const L = G(g, { y: (li ? 1 : -1) * gap / 2 }), ks = [].concat(kinds), pw = w / ks.length;
    g[li ? 'bot' : 'top'] = L;
    return ks.map((k, i) => {
      const e = G(L, { x: -w / 2 + i * pw });
      e.kind = k;
      path(e, `M0 0H${pw}`, { stroke: STRAND_COL[k], 'stroke-width': sw, 'stroke-linecap': 'butt' });
      return e;
    });
  });
  if (t0 != null) show(g, t0);
  return g;
}
