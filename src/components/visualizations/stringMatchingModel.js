// Small exact teaching examples. These direct convolutions are not the FFT implementation.
export const STRING_MATCH_CASES = {
  ordinary: [
    { name: '相消陷阱', pattern: 'ab', text: 'baab' },
    { name: '三个字符的对齐', pattern: 'abc', text: 'cabcaba' },
    { name: '重复字符', pattern: 'aa', text: 'aaaa' },
  ],
  wildcard: [
    { name: '两侧都有通配符', pattern: 'a*c', text: 'abca*cc' },
    { name: '全是通配符', pattern: '***', text: 'ab*c' },
    { name: '单字符与文本中的 *', pattern: 'a', text: '*ab' },
    { name: '没有匹配', pattern: 'ab', text: 'ccc' },
  ],
};

export function encodeString(value) {
  return [...value].map(c => c === '*' ? 0 : c.charCodeAt(0) - 96);
}

export function directConvolution(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  a.forEach((u, i) => b.forEach((v, j) => { result[i + j] += u * v; }));
  return result;
}

export function matchingModel(pattern, text, wildcard = false) {
  const a = encodeString(pattern), b = encodeString(text), reversed = [...a].reverse();
  const power = (values, p) => values.map(v => v ** p);
  const cross = directConvolution(reversed, b);
  const terms = wildcard ? [
    directConvolution(power(reversed, 3), b),
    directConvolution(reversed, power(b, 3)),
    directConvolution(power(reversed, 2), power(b, 2)),
  ] : null;
  const windows = Array.from({ length: Math.max(0, b.length - a.length + 1) }, (_, s) => {
    const pairs = a.map((u, j) => {
      const v = b[s + j];
      return { j, r: a.length - 1 - j, t: s + j, u, v,
        score: (u - v) ** 2 * (wildcard ? u * v : 1),
        terms: wildcard ? [u ** 3 * v, u * v ** 3, u ** 2 * v ** 2] : [u ** 2, v ** 2, u * v] };
    });
    const k = s + a.length - 1;
    const sums = wildcard ? terms.map(t => t[k]) : [a.reduce((sum, u) => sum + u * u, 0), b.slice(s, s + a.length).reduce((sum, v) => sum + v * v, 0), cross[k]];
    return { s, k, pairs, sums, score: sums[0] + sums[1] - 2 * sums[2] };
  });
  return { a, b, reversed, cross, terms, windows };
}
