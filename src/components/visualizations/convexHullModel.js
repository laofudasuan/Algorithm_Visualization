// Integer-coordinate teaching cases; all displayed predicates are exact in Number.
export const cross = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
const distance2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
export const lexCompare = (a, b) => a.x - b.x || a.y - b.y;
export function uniquePoints(points) {
  const seen = new Set();
  return points.filter(point => {
    const key = `${point.x},${point.y}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const namedPoints = coordinates => coordinates.map(([x, y], i) => ({ id: String.fromCharCode(65 + i), x, y }));

// The definition uses a natural-looking scatter, independently of the scan examples.
export const HULL_DEFINITION = {
  points: namedPoints([[0, 1], [2, 2], [3, 1], [1, 3], [2, -1], [4, 0], [6, 4], [1, 0], [3, 5], [-1, 4]]),
  outlines: {
    loose: [[-2, 2], [-1, -2], [4, -2], [8, 2], [6, 7], [0, 7]],
    concave: [[-2, 2], [-1, -2], [4, -2], [8, 2], [6, 7], [4, 7], [3, 6], [2, 7], [0, 7]],
  },
  witnesses: [{ id: 'U', x: 2, y: 6.8 }, { id: 'V', x: 4, y: 6.8 }],
};

export const HULL_CASES = [
  { name: '普通点集 · 多次弹栈', points: namedPoints([[0, 0], [1, 2], [2, 1], [3, 3], [4, 0], [4, 4], [0, 4], [2, 0]]) },
  { name: '边界共线 · 含重复点', points: namedPoints([[0, 0], [2, 0], [4, 0], [4, 2], [4, 4], [2, 4], [0, 4], [0, 2], [2, 2], [2, 0]]) },
  { name: '退化情况 · 所有点共线', points: namedPoints([[0, 0], [1, 1], [2, 2], [3, 3], [2, 2]]) },
];

export function monotoneHull(points) {
  const sorted = uniquePoints(points).slice().sort(lexCompare);
  if (sorted.length <= 1) return sorted;
  const chain = order => {
    const stack = [];
    order.forEach(p => {
      while (stack.length >= 2 && cross(stack.at(-2), stack.at(-1), p) <= 0) stack.pop();
      stack.push(p);
    });
    return stack;
  };
  return [...chain(sorted).slice(0, -1), ...chain([...sorted].reverse()).slice(0, -1)];
}

export function polygonArea(points) {
  return Math.abs(points.reduce((sum, p, i) => {
    const q = points[(i + 1) % points.length];
    return sum + p.x * q.y - p.y * q.x;
  }, 0)) / 2;
}

export function pointLocation(point, hull) {
  if (hull.some(p => p.x === point.x && p.y === point.y)) return '凸包顶点';
  if (hull.length < 2) return '外部';
  const onSegment = (a, b) => cross(a, b, point) === 0 &&
    Math.min(a.x, b.x) <= point.x && point.x <= Math.max(a.x, b.x) &&
    Math.min(a.y, b.y) <= point.y && point.y <= Math.max(a.y, b.y);
  if (hull.some((p, i) => onSegment(p, hull[(i + 1) % hull.length]))) return '边界上的非顶点';
  if (hull.length < 3) return '外部';
  return hull.every((p, i) => cross(p, hull[(i + 1) % hull.length], point) > 0) ? '内部' : '外部';
}

export function hullTrace(points, method = 'andrew') {
  const unique = uniquePoints(points);
  let order = [...unique].sort(lexCompare);
  let pivot = null;
  if (method === 'graham' && order.length) {
    pivot = [...order].sort((a, b) => a.y - b.y || a.x - b.x)[0];
    order = [pivot, ...order.filter(p => p !== pivot).sort((a, b) =>
      -cross(pivot, a, b) || distance2(pivot, a) - distance2(pivot, b))];
  }
  const events = [];
  let stack = [];
  let fixed = [];
  const emit = (kind, message, extra = {}) => events.push({ kind, message,
    stack: [...stack], fixed: [...fixed], order: [...order], chain: '扫描', ...extra });
  emit('sort', method === 'graham'
    ? `去重后选基点 ${pivot?.id || '（无点）'}，按极角递增，同射线由近到远排序。`
    : '先去重，再按 x 递增、x 相同按 y 递增排序。');
  function scan(chain) {
    for (let i = 0; i < order.length; i++) {
      const current = order[i];
      const common = { current, index: i, chain };
      emit('candidate', `轮到 ${current.id}(${current.x}, ${current.y})，先检查栈顶能否接上它。`, common);
      while (stack.length >= 2) {
        const a = stack.at(-2);
        const b = stack.at(-1);
        const value = cross(a, b, current);
        const triple = [a, b, current];
        emit('check', `检查 ${a.id} → ${b.id} → ${current.id}：叉积 ${value}，${value > 0 ? '左转，保留栈顶。' : value < 0 ? '右转，下一步弹出栈顶。' : '共线，只留端点，下一步弹出栈顶。'}`, { ...common, triple, value });
        if (value > 0) break;
        stack.pop();
        emit('pop', `弹出 ${b.id}，但 ${current.id} 还未入栈；继续用新的栈顶检查。`, { ...common, triple, value, removed: b });
      }
      stack.push(current);
      emit('push', `${current.id} 入栈。栈从底到顶就是当前${chain}的候选边界。`, common);
    }
  }
  scan(method === 'graham' ? '极角扫描链' : '下凸壳');
  if (method === 'andrew' && unique.length > 1) {
    fixed = [...stack];
    stack = [];
    order = [...order].reverse();
    emit('switch', '下凸壳已完成（蓝色）。现在反向扫描，用相同的左转规则构造上凸壳（绿色）。', { chain: '上凸壳' });
    scan('上凸壳');
    const hull = [...fixed.slice(0, -1), ...stack.slice(0, -1)];
    emit('done', '上下两条链各去掉末尾的重复端点，再拼接；输出不重复首点。', { hull, chain: '完成' });
  } else {
    emit('done', stack.length < 3 ? '没有形成多边形，凸包退化为空集、一个点或一条线段。' : '扫描完成。最后一个顶点与基点相连，得到凸包边界。', { hull: [...stack], chain: '完成' });
  }
  return { events, pivot, unique, hull: events.at(-1).hull };
}
