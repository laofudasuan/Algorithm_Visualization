import test from 'node:test';
import assert from 'node:assert/strict';
import { matchingModel, STRING_MATCH_CASES } from '../stringMatchingModel.js';

// Independent oracle: compare characters, not numeric encodings or convolution.
function compatible(pattern, text, start, wildcard) {
  return [...pattern].every((c, j) => c === text[start + j] || (wildcard && (c === '*' || text[start + j] === '*')));
}
function check(pattern, text, wildcard) {
  const model = matchingModel(pattern, text, wildcard);
  assert.equal(model.windows.length, text.length - pattern.length + 1);
  for (const w of model.windows) {
    assert.equal(w.score === 0, compatible(pattern, text, w.s, wildcard), `${pattern}/${text}@${w.s}`);
    assert.equal(w.score, w.pairs.reduce((sum, p) => sum + p.score, 0));
    for (const pair of w.pairs) {
      assert.equal(pair.r + pair.t, w.k);
      assert.equal(pair.u, model.reversed[pair.r]);
      assert.equal(pair.v, model.b[pair.t]);
      assert.equal(pair.terms[0] + pair.terms[1] - 2 * pair.terms[2], pair.score);
      assert.ok(pair.score >= 0);
    }
    w.sums.forEach((sum, i) => assert.equal(sum, w.pairs.reduce((total, p) => total + p.terms[i], 0)));
    assert.equal(w.k - pattern.length + 2, w.s + 1);
  }
}
function strings(length, alphabet) {
  if (!length) return [''];
  return strings(length - 1, alphabet).flatMap(s => [...alphabet].map(c => s + c));
}

test('all teaching cases and published hand calculations', () => {
  for (const [mode, cases] of Object.entries(STRING_MATCH_CASES)) {
    for (const c of cases) check(c.pattern, c.text, mode === 'wildcard');
  }
  assert.deepEqual(matchingModel('a*c', 'abca*cc', true).windows.map(w => w.score), [0, 14, 12, 0, 0]);
  assert.deepEqual(matchingModel('ab', 'baab').windows.map(w => w.score), [2, 1, 0]);
  assert.deepEqual(matchingModel('a*c', 'abca*cc', true).windows[0].sums, [82, 82, 82]);
});

test('exhaustive a/b/* strings, all lengths through 4 and all windows', () => {
  for (const wildcard of [false, true]) {
    const alphabet = wildcard ? 'ab*' : 'ab';
    for (let n = 1; n <= 4; n++) {
      for (let m = 1; m <= n; m++) {
        for (const a of strings(m, alphabet)) for (const b of strings(n, alphabet)) check(a, b, wildcard);
      }
    }
  }
});

// Independent radix-2 FFT, used only to test the frequency-domain pseudocode.
function fft(real, imag, inverse = false) {
  const n = real.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [real[i], real[j]] = [real[j], real[i]]; [imag[i], imag[j]] = [imag[j], imag[i]]; }
  }
  for (let len = 2; len <= n; len *= 2) {
    const angle = (inverse ? -1 : 1) * 2 * Math.PI / len;
    for (let start = 0; start < n; start += len) {
      for (let j = 0; j < len / 2; j++) {
        const u = start + j, v = u + len / 2;
        const c = Math.cos(angle * j), s = Math.sin(angle * j);
        const tr = real[v] * c - imag[v] * s, ti = real[v] * s + imag[v] * c;
        real[v] = real[u] - tr; imag[v] = imag[u] - ti;
        real[u] += tr; imag[u] += ti;
      }
    }
  }
  if (inverse) for (let i = 0; i < n; i++) { real[i] /= n; imag[i] /= n; }
}
function fftScores(a, b) {
  let length = 1;
  while (length < a.length + b.length - 1) length *= 2;
  const real = Array(length).fill(0), imag = Array(length).fill(0);
  for (const [p, q, weight] of [[3, 1, 1], [1, 3, 1], [2, 2, -2]]) {
    const ar = Array.from({ length }, (_, i) => i < a.length ? a[a.length - 1 - i] ** p : 0);
    const br = Array.from({ length }, (_, i) => i < b.length ? b[i] ** q : 0);
    const ai = Array(length).fill(0), bi = Array(length).fill(0);
    fft(ar, ai); fft(br, bi);
    for (let i = 0; i < length; i++) {
      real[i] += weight * (ar[i] * br[i] - ai[i] * bi[i]);
      imag[i] += weight * (ar[i] * bi[i] + ai[i] * br[i]);
    }
  }
  fft(real, imag, true);
  return real.slice(a.length - 1, b.length);
}
test('seeded full alphabet cases; six FFT plus one IFFT agrees with exact scores', () => {
  let seed = 4173;
  const random = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  const alphabet = '*abcdefghijklmnopqrstuvwxyz';
  for (let trial = 0; trial < 300; trial++) {
    const n = 1 + random(48), m = 1 + random(n);
    const a = Array.from({ length: m }, () => alphabet[random(27)]).join('');
    const b = Array.from({ length: n }, () => alphabet[random(27)]).join('');
    check(a, b, true);
    const model = matchingModel(a, b, true), scores = fftScores(model.a, model.b);
    scores.forEach((score, i) => assert.ok(Math.abs(score - model.windows[i].score) < 1e-5));
  }
  // This checks small test sizes, not a claim of floating-point safety at the maximum constraint.
});
