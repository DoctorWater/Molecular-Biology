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
// A replication fork (BOOK.md visual model `fork`; ch05, ch07, grows in ch08–11): the duplex ahead as a side-view helix from the
// fork at x to xEnd, the two parental strands spreading behind it to the left by ±spread over back px (top: the template of the
// leading strand, 3′ at the left; bottom: the lagging template, 5′ at the left); hel: the helicase at the tip with its label
// (null: no helicase); tail: x where the parental strands end (default x − back, moving with the fork); off: gap between a
// template and its new strand, lag: gap between the fork and the leading tip; lead, fr: the starting state. State c = { x, P, lead, fr }:
//   lead — x where the new leading strand begins (null: none); it runs to lag px behind the fork, above the top template;
//   fr — lagging fragments [[r, l, pr], …] below the bottom template: r the 5′ end (right), l the growing 3′ tip (left),
//   pr the length of the RNA primer at r (COL.real; the rest is DNA, amber). Fragments are anchored in x and follow the rails.
// .go(patch, t, dur) moves any of these (numbers and fragments interpolate; a new fragment starts as [r, r, 0]); .to(x, t, dur, P)
// moves the fork and the pitch ahead (smaller P: overwound); .at(state) redraws; .cur — the state after the scheduled moves;
// .rail(s, xx, fx) — y of the template s (−1 top, +1 bottom) at xx for a fork at fx (.cur.x by default); .hooks — functions
// (state) run after each redraw (put enzymes on the strand tips); .hel — the helicase group.
function fork(p, x, y, t0, { xEnd = 1450, A = 26, P = 70, n = 6, back = 240, spread = 60, hel = 'хеликаза', col = COL.chalk, tail = null, off = 17, lag = 14, lead = null, fr = [] } = {}) {
  const g = G(p, { o: t0 == null ? 1 : 0 }), H = G(g), B = G(g), N = G(g);
  g.cur = { x, P, lead, fr };
  g.hooks = [];
  if (hel != null) {
    g.hel = enzyme(g, null, x, y, null, { w: 54, h: 2 * A + 44 });
    put(g.hel, { o: 1 });
    if (hel) T(g.hel, hel, { y: A + 56, size: 22, fill: PROT, weight: 700, anchor: 'middle' });
  }
  // the bend of a parental strand behind the fork: [distance behind, dy], from the fork outwards
  const bz = s => Array.from({ length: 31 }, (_, i) => {
    const q = i / 30, u = 1 - q;
    return [3 * u * u * q * back * .35 + 3 * u * q * q * back * .55 + q ** 3 * back, s * A * .4 * (u ** 3 + 3 * u * u * q) + s * spread * (3 * u * q * q + q ** 3)];
  });
  const tb = { '-1': bz(-1), 1: bz(1) };
  g.rail = (s, xx, fx = g.cur.x) => {
    const d = fx - xx, T2 = tb[s];
    if (d >= back) return y + s * spread;
    if (d <= 0) return y + s * A * .4;
    let i = 1;
    while (T2[i][0] < d) i++;
    const [d0, y0] = T2[i - 1], [d1, y1] = T2[i];
    return y + y0 + (y1 - y0) * (d - d0) / (d1 - d0);
  };
  const line = (c, s, xa, xb, sh) => {   // polyline of the template s shifted by sh, from xa leftwards to xb
    let d = '';
    for (let xx = xa; xx > xb; xx -= 6) d += `${d ? 'L' : 'M'}${xx} ${g.rail(s, xx, c.x) + sh}`;
    return d + `${d ? 'L' : 'M'}${xb} ${g.rail(s, xb, c.x) + sh}`;
  };
  const rungs = (c, s, xa, xb) => {
    let d = '';
    for (let xx = xa; xx > xb; xx -= 15) { const r = g.rail(s, xx, c.x); d += `M${xx} ${r}V${r - s * off}`; }
    return d;
  };
  g.at = c => {
    H.replaceChildren(); B.replaceChildren(); N.replaceChildren();
    if (xEnd - c.x > 2) helixSide(H, c.x, y, xEnd - c.x, null, { P: c.P, A, n });
    const xe = tail == null ? c.x - back : tail;
    [-1, 1].forEach(s => path(B, line(c, s, c.x, xe, 0), { stroke: col, 'stroke-width': 8, 'stroke-linejoin': 'round' }));
    if (c.lead != null && c.x - lag > c.lead) {
      path(N, line(c, -1, c.x - lag, c.lead, -off), { stroke: DNA, 'stroke-width': 8, 'stroke-linejoin': 'round' });
      path(N, rungs(c, -1, c.x - lag, c.lead), { stroke: COL.dim, 'stroke-width': 2.5 });
    }
    c.fr.forEach(([r, l, pr]) => {
      if (r - l > 1) {
        path(N, line(c, 1, r, l, off), { stroke: DNA, 'stroke-width': 8, 'stroke-linejoin': 'round' });
        path(N, rungs(c, 1, r, l), { stroke: COL.dim, 'stroke-width': 2.5 });
      }
      if (pr > 1) {
        path(N, line(c, 1, r, r - Math.min(pr, r - l), off), { stroke: RNA, 'stroke-width': 10, 'stroke-linejoin': 'round' });
      }
    });
    if (g.hel) put(g.hel, { x: c.x });
    g.hooks.forEach(h => h(c));
  };
  const lerp = (a, b, q) => a + (b - a) * q;
  g.go = (patch, t, dur = 1.5) => {
    const a = g.cur, b = { ...a, ...patch };
    g.cur = b;
    prog(q => g.at({
      x: lerp(a.x, b.x, q), P: lerp(a.P, b.P, q),
      lead: b.lead == null || a.lead == null ? b.lead : lerp(a.lead, b.lead, q),
      fr: b.fr.map((f, i) => (a.fr[i] || [f[0], f[0], 0]).map((v, k) => lerp(v, f[k], q))),
    }), t, dur);
    return g;
  };
  g.to = (x2, t, dur = 1.5, P2 = g.cur.P) => g.go({ x: x2, P: P2 }, t, dur);
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

// From ch08: a DNA polymerase as a right hand (BOOK.md visual model `polymerase`; chapters 8–11). Local frame (scale s):
// body x −300…300; the DNA channel is y −62…62 (two bead rows at y ∓24 fit), the active site is at x ≈ 20; the template runs
// at the bottom, the new strand grows to the right. Parts are separate pink blocks: .palm (below the channel, y 62…202),
// .thumb (above, left, x −300…−50), .fingers (above, right, x 40…300; its origin is the hinge (300, −62), so
// tw(g.fingers, { r: FINGERS_SHUT }, t) closes it over the active site); each has .hi (highlight, o 0) and, with names, .lab.
// Options: names (part names inside), label (title above the body), exo3 (3′→5′ exonuclease pocket inside the palm at
// (−170, 132): .exo, text exo3Lab), exo5 (5′→3′ nuclease lobe above the fingers, x 60…250, y −342…−214: .nuc5, text nuc5Lab).
// .mg — two Mg²⁺ ions on the palm edge (x ∓30), .asp — three aspartates (D) in the palm, both start hidden (o 0).
// .light(part, t, dur) flashes a part's .hi. .in is a layer above the body for DNA drawn inside the hand.
const FINGERS_SHUT = -5;
function polymerase(p, x, y, t0, { s = 1, label = null, names = false, exo3 = false, exo5 = false, exo3Lab = '3′→5′', nuc5Lab = '5′→3′' } = {}) {
  const g = G(p, { x, y, s, o: t0 == null ? 1 : 0 });
  const body = mix(COL.board, PROT, .32);
  const block = (e, X, Y, W, H, name, lx, ly) => {
    mk('rect', { x: X, y: Y, width: W, height: H, rx: 44, fill: body, stroke: PROT, 'stroke-width': 3 }, e);
    e.hi = put(mk('rect', { x: X, y: Y, width: W, height: H, rx: 44, fill: PROT }, e), { o: 0 });
    if (names) e.lab = T(e, name, { x: lx, y: ly, size: 26, fill: PROT, weight: 700, anchor: 'middle', o: 0 });
    return e;
  };
  g.palm = block(G(g), -300, 62, 600, 140, 'ладонь', 190, 150);
  g.thumb = block(G(g), -300, -202, 250, 140, 'большой палец', -175, -132);
  g.fingers = block(G(g, { x: 300, y: -62 }), -260, -140, 260, 140, 'пальцы', -130, -70);
  if (label) T(g, label, { y: exo5 ? -362 : -226, size: 30, fill: PROT, weight: 700, anchor: 'middle' });
  if (exo3) {
    g.exo = G(g);
    mk('circle', { cx: -170, cy: 132, r: 44, fill: mix(COL.board, PROT, .12), stroke: PROT, 'stroke-width': 3, 'stroke-dasharray': '9 7' }, g.exo);
    T(g.exo, exo3Lab, { x: -257, y: 146, size: 20, fill: PROT, weight: 700, anchor: 'middle' });
  }
  if (exo5) {
    g.nuc5 = block(G(g), 60, -342, 190, 128, '', 0, 0);
    T(g.nuc5, nuc5Lab, { x: 155, y: -270, size: 22, fill: PROT, weight: 700, anchor: 'middle' });
  }
  g.in = G(g);
  g.asp = [-60, 0, 60].map(ax => {
    const a = G(g.in, { x: ax, y: 122, o: 0 });
    mk('circle', { r: 17, fill: PROT }, a);
    T(a, 'D', { y: 8, size: 22, fill: COL.board, weight: 700, anchor: 'middle' });
    return a;
  });
  g.mg = [-30, 30].map(mx => {
    const a = G(g.in, { x: mx, y: 80, o: 0 });
    mk('circle', { r: 15, fill: COL.chalk }, a);
    T(a, 'Mg', { y: 6, size: 15, fill: COL.board, weight: 700, anchor: 'middle' });
    return a;
  });
  g.light = (part, t, dur = 1.6) => { tw(part.hi, { o: .55 }, t, .3); tw(part.hi, { o: 0 }, t + dur, .5); };
  if (t0 != null) show(g, t0);
  return g;
}

// From ch09 (chapters 9–11): the β sliding clamp, the clamp loader, the DnaB hexamer.
// Annular sector between angles a..b (degrees, 0 = right, clockwise on screen) and radii r1..r2.
const arcSec = (a, b, r1, r2) => {
  const P = (r, d) => `${(r * Math.cos(d * Math.PI / 180)).toFixed(1)} ${(r * Math.sin(d * Math.PI / 180)).toFixed(1)}`, big = b - a > 180 ? 1 : 0;
  return `M${P(r2, a)}A${r2} ${r2} 0 ${big} 1 ${P(r2, b)}L${P(r1, b)}A${r1} ${r1} 0 ${big} 0 ${P(r1, a)}Z`;
};
// The β clamp seen end-on (BOOK.md): two monomers (two shades of protein pink, six domains A B C), hole radius `hole` (35 Å; DNA 20 Å
// is drawn by the chapter at hole·20/35), wall px thick; interfaces at the top and bottom. Groups (o 0 until shown by the chapter):
// .labs (domain letters), .arr (head-to-tail arrows), .plus (12 charges lining the hole), .pk[i] (dashed marks of the two hydrophobic
// pockets on the rim, between domains B and C; .pkPt[i] = [x, y] local). .m1/.m2 monomers; .open(t, dur, deg) opens the top interface
// (m2 turns about the bottom one), .close(t, dur); .gap = [x, y] centre of that gap; .R1/.R2 hole and outer radius.
function betaRing(p, x, y, t0, { hole = 157, wall = 52, s = 1 } = {}) {
  const g = G(p, { x, y, s, o: t0 == null ? 1 : 0 }), r1 = hole, r2 = hole + wall, rm = (r1 + r2) / 2;
  const cols = [mix(COL.board, PROT, .42), mix(COL.board, mix(PROT, COL.chalk, .5), .42)];
  g.R1 = r1; g.R2 = r2; g.gap = [0, -rm];
  g.labs = []; g.pkPt = [];
  [0, 1].forEach(m => {
    const a0 = m ? 90 : -90, M = G(g, m ? { x: 0, y: rm } : {}), I = G(M, m ? { y: -rm } : {});
    g[m ? 'm2' : 'm1'] = M;
    for (let k = 0; k < 3; k++) {
      mk('path', { d: arcSec(a0 + 60 * k, a0 + 60 * k + 60, r1, r2), fill: cols[m], stroke: COL.board, 'stroke-width': 4, 'stroke-linejoin': 'round' }, I);
      const a = (a0 + 60 * k + 30) * Math.PI / 180;
      g.labs.push(T(I, 'ABC'[k], { x: rm * Math.cos(a), y: rm * Math.sin(a) + 9, size: 28, fill: m ? COL.chalk : PROT, weight: 700, anchor: 'middle', o: 0 }));
    }
    g.pkPt.push([r2 * Math.cos((a0 + 120) * Math.PI / 180), r2 * Math.sin((a0 + 120) * Math.PI / 180)]);
  });
  g.arr = G(g, { o: 0 });
  [0, 1].forEach(m => {
    const a0 = m ? 90 : -90, R = r2 + 24, d = a => `${(R * Math.cos(a * Math.PI / 180)).toFixed(1)} ${(R * Math.sin(a * Math.PI / 180)).toFixed(1)}`;
    path(g.arr, `M${d(a0 + 14)}A${R} ${R} 0 0 1 ${d(a0 + 160)}`, { stroke: COL.chalk, 'stroke-width': 5 });
    const e = (a0 + 166) * Math.PI / 180, ex = R * Math.cos(e), ey = R * Math.sin(e), tx = -Math.sin(e), ty = Math.cos(e);
    mk('path', { d: `M${ex + tx * 16} ${ey + ty * 16}L${ex - ty * 12} ${ey + tx * 12}L${ex + ty * 12} ${ey - tx * 12}Z`, fill: COL.chalk }, g.arr);
  });
  g.plus = G(g, { o: 0 });
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 + 15) * Math.PI / 180;
    T(g.plus, '+', { x: (r1 - 16) * Math.cos(a), y: (r1 - 16) * Math.sin(a) + 8, size: 26, fill: COL.int, weight: 700, anchor: 'middle' });
  }
  g.pk = g.pkPt.map(([px, py]) => {
    const e = mk('circle', { cx: px, cy: py, r: 26, fill: 'none', stroke: COL.int, 'stroke-width': 4, 'stroke-dasharray': '7 6' }, g);
    return put(e, { o: 0 });
  });
  g.open = (t, dur = .9, deg = 26) => tw(g.m2, { r: -deg }, t, dur, out);
  g.close = (t, dur = .5) => tw(g.m2, { r: 0 }, t, dur);
  if (t0 != null) show(g, t0);
  return g;
}
// The clamp (or any ring) seen from the side around a horizontal strand: an ellipse rx × ry whose left half (behind the strand) goes
// on layer pBack and right half (in front) on pFront; create pBack before and pFront after the strand. Returns { bk, fr, at(x, y),
// mv(x, y, t, dur), show(t), hide(t), open(t, dur, deg), close(t, dur) }; bk and fr are groups (fr's origin is the ring's bottom, the
// hinge of .open, which swings the front half away at the top).
function clampSide(pBack, pFront, x, y, t0, { rx = 14, ry = 34, col = PROT, sw = 9 } = {}) {
  const bk = G(pBack, { x, y, o: t0 == null ? 1 : 0 }), fr = G(pFront, { x, y: y + ry, o: t0 == null ? 1 : 0 }), fi = G(fr, { y: -ry });
  path(bk, `M0 ${-ry}A${rx} ${ry} 0 0 0 0 ${ry}`, { stroke: mix(COL.board, col, .55), 'stroke-width': sw });
  path(fi, `M0 ${-ry}A${rx} ${ry} 0 0 1 0 ${ry}`, { stroke: col, 'stroke-width': sw });
  const c = { bk, fr };
  c.at = (X, Y) => { put(bk, { x: X, y: Y }); put(fr, { x: X, y: Y + ry }); };
  c.mv = (X, Y, t, dur = .6) => { tw(bk, { x: X, y: Y }, t, dur); tw(fr, { x: X, y: Y + ry }, t, dur); };
  c.show = (t, dur) => { show(bk, t, dur); show(fr, t, dur); };
  c.hide = (t, dur) => { hide(bk, t, dur); hide(fr, t, dur); };
  c.open = (t, dur = .7, deg = 26) => tw(fr, { r: deg }, t, dur, out);
  c.close = (t, dur = .5) => tw(fr, { r: 0 }, t, dur);
  if (t0 != null) c.show(t0);
  return c;
}
// The clamp loader τ₃δδ′χψ as a claw (open end down, ≈ 260 × 360 at s = 1; origin between the jaws' pivots): .tau[3] motors, .chi (χψ),
// .dp (δ′) and .dd (δ) jaws that pivot at the top (tips meet at ±10 when closed), .atp[3] ATP dots above the motors (o 0, resting
// at .y0), .open(t, dur) swings δ′ away and δ out, .shut(t, dur) closes it again.
function clampLoader(p, x, y, t0, { s = 1 } = {}) {
  const g = G(p, { x, y, s, o: t0 == null ? 1 : 0 }), body = mix(COL.board, PROT, .4), dull = mix(COL.board, mix(PROT, COL.chalk, .5), .55);
  g.tau = [[-86, -64], [0, -92], [86, -64]].map(([tx, ty]) => {
    const e = G(g, { x: tx, y: ty });
    mk('circle', { r: 36, fill: body, stroke: PROT, 'stroke-width': 3 }, e);
    T(e, 'τ', { y: 11, size: 32, fill: PROT, weight: 700, anchor: 'middle' });
    return e;
  });
  g.chi = G(g, { x: 0, y: -206 });
  mk('rect', { x: -46, y: -22, width: 92, height: 44, rx: 22, fill: body, stroke: PROT, 'stroke-width': 3 }, g.chi);
  T(g.chi, 'χψ', { y: 10, size: 28, fill: PROT, weight: 700, anchor: 'middle' });
  [['dp', -58, 1, 'δ′', dull], ['dd', 58, -1, 'δ', body]].forEach(([k, px, sg, lab, fill]) => {
    const e = g[k] = G(g, { x: px, y: -20 });
    path(e, `M0 0Q${-16 * sg} 70 ${50 * sg} 132`, { stroke: PROT, 'stroke-width': 40, 'stroke-linecap': 'round' });
    path(e, `M0 0Q${-16 * sg} 70 ${50 * sg} 132`, { stroke: fill, 'stroke-width': 32, 'stroke-linecap': 'round' });
    T(e, lab, { x: 5 * sg, y: 78, size: 26, fill: PROT, weight: 700, anchor: 'middle' });
  });
  g.atp = g.tau.map(t => {
    const e = G(g, { x: t._st.x, y: t._st.y - 62, o: 0 });
    e.y0 = e._st.y;
    mk('circle', { r: 13, fill: COL.int }, e);
    return e;
  });
  g.open = (t, dur = .9) => { tw(g.dp, { r: 34 }, t, dur, out); tw(g.dd, { r: -14 }, t, dur, out); };
  g.shut = (t, dur = .6) => { tw(g.dp, { r: 0 }, t, dur); tw(g.dd, { r: 0 }, t, dur); };
  if (t0 != null) show(g, t0);
  return g;
}
// The DnaB hexamer end-on: six subunits (CTD circle r 46 at 96 px from the centre, NTD circle r 34 at 170 px, a linker between) at
// 60° steps starting at the top; the channel (radius 50) is at (0, 0). .subs[i] (whole subunit), .ctd[i], .ntd[i], .lnk[i] (the NTD
// layer is one group per subunit inside .subs[i]; fade them with tw(g.ntd[i], { o: 0 })).
function dnaBRing(p, x, y, t0, { s = 1 } = {}) {
  const g = G(p, { x, y, s, o: t0 == null ? 1 : 0 }), body = mix(COL.board, PROT, .42), lite = mix(COL.board, mix(PROT, COL.chalk, .45), .45);
  g.subs = []; g.ctd = []; g.ntd = []; g.lnk = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * 60 - 90) * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a), e = G(g);
    g.lnk.push(path(e, `M${96 * c} ${96 * sn}L${170 * c} ${170 * sn}`, { stroke: PROT, 'stroke-width': 8 }));
    g.ctd.push(G(e, { x: 96 * c, y: 96 * sn }));
    mk('circle', { r: 46, fill: body, stroke: PROT, 'stroke-width': 3 }, g.ctd[i]);
    g.ntd.push(G(e, { x: 170 * c, y: 170 * sn }));
    mk('circle', { r: 34, fill: lite, stroke: PROT, 'stroke-width': 3 }, g.ntd[i]);
    g.subs.push(e);
  }
  if (t0 != null) show(g, t0);
  return g;
}

// From ch10 (chapter 11: the whole fork): the replisome in the frame of the fork, which stands still at (x, y) and opens to the left;
// the parental duplex runs ahead to xEnd. Parts: .fk (the fork() with DnaB; leading strand from x = lead), .hub (τ₃ loader at
// (x − 360, y)), .lead (leading Pol III above the top template with its β ring .ring), .lag (lagging Pol III at J = (x − 540, yB)
// above the bottom template, ring .lagRing there, hidden: put(.lagRing.bk, { o: 0 }) …), .spare (the third polymerase, dashed),
// links hub–DnaB/–polymerases in .links. Bottom template drawn left to railB (default the point A = (x − back, yB) where the
// strands end; a chapter that draws the lagging loop passes J). .A, .J = [x, y], .yT, .yB. Parts start visible; the group is hidden
// until t0 when t0 != null.
function replisome(p, x, y, t0, { xEnd = x + 480, back = 200, spread = 110, lead = 200, railB = null, spare = true } = {}) {
  const g = G(p, { o: t0 == null ? 1 : 0 }), yT = y - spread, yB = y + spread, hx = x - 360, J = x - 540, A = x - back;
  const rl = G(g), lk = G(g), bk = G(g);
  path(rl, `M60 ${yT}H${A}`, { stroke: COL.chalk, 'stroke-width': 8 });
  path(rl, `M60 ${yB}H${railB ?? A}`, { stroke: COL.chalk, 'stroke-width': 8 });
  g.fk = fork(g, x, y, null, { xEnd, A: 36, P: 90, n: 6, back, spread, hel: 'DnaB', lead });
  const fr = G(g), on = e => put(e, { o: 1 });
  g.ring = clampSide(bk, fr, x - 285, yT - 8, null, { rx: 14, ry: 30, sw: 9 });
  g.lagRing = clampSide(bk, fr, J, yB + 9, null, { rx: 14, ry: 30, sw: 9 });
  const link = (d, w = 6) => path(lk, d, { stroke: PROT, 'stroke-width': w });
  link(`M${hx - 30} ${y - 32}V${yT - 44}`);
  link(`M${hx - 85} ${y + 30}L${J + 75} ${yB - 62}`);
  link(`M${hx + 85} ${y - 30}H${x - 27}`);
  g.hub = on(enzyme(g, 'загрузчик τ₃', hx, y, null, { w: 170, h: 64, size: 22 }));
  g.lead = on(enzyme(g, 'Pol III', hx, yT - 72, null, { w: 150, h: 56, size: 24 }));
  g.lag = on(enzyme(g, 'Pol III', J, yB - 62, null, { w: 150, h: 56, size: 24 }));
  if (spare) {
    link(`M${hx + 85} ${y + 18}H${x - 245}`);
    g.spare = on(enzyme(g, 'Pol III', x - 170, y + 18, null, { w: 150, h: 56, size: 24 }));
    mk('rect', { x: -75, y: -28, width: 150, height: 56, rx: 28, fill: 'none', stroke: COL.dim, 'stroke-width': 3, 'stroke-dasharray': '8 6' }, g.spare);
  }
  g.links = lk; g.yT = yT; g.yB = yB; g.A = [A, yB]; g.J = [J, yB];
  if (t0 != null) show(g, t0);
  return g;
}

// From ch07 (chapter 11): ring geometry and the replication bubble.
const rad = a => a * Math.PI / 180;
// A point on a circle: angles in degrees, clockwise from the top.
const ringPt = (cx, cy, r, a) => [cx + r * Math.sin(rad(a)), cy - r * Math.cos(rad(a))];
// Polyline along a ring from angle a0 to a1; the radius may depend on the angle (rf).
function arcPoly(cx, cy, a0, a1, rf) {
  const k = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 3));
  let d = '';
  for (let i = 0; i <= k; i++) {
    const a = a0 + (a1 - a0) * i / k, [x, y] = ringPt(cx, cy, rf(a), a);
    d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}
const clamp01 = v => Math.max(0, Math.min(1, v));
// A circular chromosome with a replication bubble. phi (degrees, from the origin at the top) is how far each fork has gone;
// two: both ways (θ) or one (the eye of a single fork). .set(phi) redraws. Parental strands chalk, new strands amber,
// forks yellow dots.
function bubble(p, cx, cy, R, t0, { two = true, sep = 22, gap = 5 } = {}) {
  const g = G(p, { o: t0 == null ? 1 : 0 }), L = G(g), F = G(g);
  const seg = (a0, a1, rf, c) => path(L, arcPoly(cx, cy, a0, a1, rf), { stroke: c, 'stroke-width': 7, 'stroke-linejoin': 'round' });
  g.set = phi => {
    L.replaceChildren(); F.replaceChildren();
    // θ: the origin sits mid-bubble, so the strands narrow only towards the forks; one fork: also at the origin.
    const ramp = Math.max(1, Math.min(22, phi / 2)), env = a => clamp01(Math.min(two ? 1 : a / ramp, (phi - a) / ramp));
    const u1 = two ? 360 - phi : 360;
    if (u1 - phi > 1) [-gap, gap].forEach(s => seg(phi, u1, () => R + s, COL.chalk));
    if (phi >= 1) [1, -1].slice(0, two ? 2 : 1).forEach(sd => {
      const rf = k => a => R + k * sep * env(Math.abs(a));
      seg(0, sd * phi, a => rf(1)(a) + gap, COL.chalk); seg(0, sd * phi, a => rf(1)(a) - gap, DNA);
      seg(0, sd * phi, a => rf(-1)(a) + gap, DNA); seg(0, sd * phi, a => rf(-1)(a) - gap, COL.chalk);
      const [x, y] = ringPt(cx, cy, R, sd * phi);
      mk('circle', { cx: x, cy: y, r: 11, fill: COL.int, stroke: COL.board, 'stroke-width': 3 }, F);
    });
  };
  g.set(0);
  if (t0 != null) show(g, t0);
  return g;
}
// The origin mark above a ring.
function oriMark(p, cx, cy, R, t0, str) {
  const [x, y] = ringPt(cx, cy, R, 0);
  const d = G(p, { o: 0 });
  mk('circle', { cx: x, cy: y, r: 9, fill: COL.int }, d);
  T(d, str, { x, y: y - 36, size: 28, fill: COL.int, weight: 700, anchor: 'middle' });
  show(d, t0);
  return d;
}
