const EPS = 1e-9;
export const formatNumber = (value) => Math.abs(value) < EPS ? '0' : Number(value.toFixed(4)).toString();

export function buildGaussSteps(input) {
  const a = input.map((row) => [...row]);
  const m = a.length;
  const n = a[0].length - 1;
  const steps = [];
  const pivots = [];
  const solution = Array(n).fill(null);
  const save = (phase, description, extra = {}) => steps.push({
    matrix: a.map((row) => [...row]), solution: [...solution],
    phase, description, ...extra,
  });
  save('初始矩阵', '每一行对应一个方程；竖线右侧是常数项。');
  let r = 0;
  for (let c = 0; c < n && r < m; c += 1) {
    let p = r;
    for (let i = r + 1; i < m; i += 1) {
      if (Math.abs(a[i][c]) > Math.abs(a[p][c])) p = i;
    }
    if (Math.abs(a[p][c]) < EPS) {
      save('跳过零列', `第 ${c + 1} 列的未处理部分全为 0，不能提供新的主元，继续检查下一列。`, { column: c });
      continue;
    }
    save('选择主元', `第 ${c + 1} 列中，未处理行的最大绝对值为 ${formatNumber(Math.abs(a[p][c]))}，选中 R${p + 1}。`, { pivot: [p, c], column: c });
    if (p !== r) {
      [a[p], a[r]] = [a[r], a[p]];
      save('交换两行', `R${r + 1} ↔ R${p + 1}：把选中的主元放到当前行。`, { pivot: [r, c], target: p });
    }
    pivots.push(c);
    for (let i = r + 1; i < m; i += 1) {
      if (Math.abs(a[i][c]) < EPS) continue;
      const factor = a[i][c] / a[r][c];
      const before = [...a[i]];
      for (let j = c + 1; j <= n; j += 1) a[i][j] -= factor * a[r][j];
      a[i][c] = 0;
      save('消去下方系数', `R${i + 1} ← R${i + 1} − (${formatNumber(factor)}) × R${r + 1}。常数项也必须同步计算。`, {
        pivot: [r, c], target: i,
        calculation: `${formatNumber(before[n])} − (${formatNumber(factor)}) × (${formatNumber(a[r][n])}) = ${formatNumber(a[i][n])}`,
      });
    }
    r += 1;
  }
  save('阶梯形矩阵', `消元结束，共找到 ${r} 个主元。先检查矛盾行，再决定是否回代。`);
  const inconsistent = a.findIndex((row) => row.slice(0, n).every((v) => Math.abs(v) < EPS) && Math.abs(row[n]) >= EPS);
  if (inconsistent !== -1) {
    save('无解', `R${inconsistent + 1} 表示 0 = ${formatNumber(a[inconsistent][n])}，出现矛盾，所以方程组无解。`, { target: inconsistent, result: 'none' });
  } else if (r < n) {
    const free = Array.from({ length: n }, (_, i) => i).filter((i) => !pivots.includes(i));
    save('无穷多解', `没有矛盾，但只有 ${r} 个主元、${n} 个未知数。${free.map((i) => `x${i + 1}`).join('、')} 可作为自由变量，其余变量由它们决定。`, { result: 'infinite' });
  } else {
    for (let i = r - 1; i >= 0; i -= 1) {
      const c = pivots[i];
      let rhs = a[i][n];
      for (let j = c + 1; j < n; j += 1) rhs -= a[i][j] * solution[j];
      solution[c] = rhs / a[i][c];
      save('从下往上回代', `将已经求出的变量代入 R${i + 1}，得到 x${c + 1} = ${formatNumber(solution[c])}。`, {
        pivot: [i, c], calculation: `x${c + 1} = (${formatNumber(a[i][n])}${Array.from({ length: n - c - 1 }, (_, k) => c + k + 1).map((j) => ` − (${formatNumber(a[i][j])}) × (${formatNumber(solution[j])})`).join('')}) / (${formatNumber(a[i][c])}) = ${formatNumber(solution[c])}`,
      });
    }
    save('唯一解', '每个未知数都有对应的主元，回代完成。将结果代入最初的方程即可检验。', { result: 'unique' });
  }
  return steps;
}
