import singleEdge from '../../data/graphs/GiftGraph-SingleEdge.json' with { type: 'json' };
import path from '../../data/graphs/GiftGraph-Path.json' with { type: 'json' };
import evenCycle from '../../data/graphs/GiftGraph-EvenCycle.json' with { type: 'json' };
import triangle from '../../data/graphs/GiftGraph-Triangle.json' with { type: 'json' };
import oddCycle from '../../data/graphs/GiftGraph-OddCycle.json' with { type: 'json' };
import triangleBranch from '../../data/graphs/GiftGraph-TriangleBranch.json' with { type: 'json' };
import selfLoop from '../../data/graphs/GiftGraph-SelfLoop.json' with { type: 'json' };
import parallelEdges from '../../data/graphs/GiftGraph-ParallelEdges.json' with { type: 'json' };

export const GIFT_GRAPH_COLORS = {
  coachA: '#0ea5e9',
  coachB: '#8b5cf6',
  reached: '#86efac',
  deficit: '#fde047',
};

export const GIFT_GRAPH_EXAMPLES = [
  { name: '单边', graph: singleEdge,
    question: '两端都只有一支队伍，能各领两份吗？',
    explanation: '不能。两点的逐点上界都是 1，所以 U=2，最优值也为 2。若误用 2|V|=4，就会得到“少了 2”的反例。', expected: 2 },
  { name: '四点路径', graph: path,
    question: '让三条边交替染色，哪些点只能贡献 1？',
    explanation: '两个端点各贡献 1，两个中间点各贡献 2。U=1+2+2+1=6，全部达到各自上界。', expected: 6 },
  { name: '四点偶环', graph: evenCycle,
    question: '沿环交替染色，回到起点时会冲突吗？',
    explanation: '偶数条边可以首尾交替，每个点都看到两位教练。U=8，最优值为 8。', expected: 8 },
  { name: '三点奇环', graph: triangle,
    question: '想让三个点都看到两种颜色，三条边需要满足什么？',
    explanation: '每对相邻边都必须异色，但三条边无法首尾交替。至少一个点只能贡献 1；另两点可贡献 2，所以最优值为 5=U−1。', expected: 5 },
  { name: '五点奇环', graph: oddCycle,
    question: '把三角形换成五边形，“差 1”还会出现吗？',
    explanation: '仍然无法让奇数条边首尾交替，但只需留下一处同色相接。四个点贡献 2、一个点贡献 1，最优值为 9=U−1。', expected: 9 },
  { name: '奇环加一条边', graph: triangleBranch,
    question: '含有奇环，就一定要减 1 吗？试试让分支补上缺少的颜色。',
    explanation: '让环在 A 处同色相接，再把 AD 染成另一色，A 就也有两种颜色。U=2+2+2+1=7，最优值为 7；“含奇环”本身不是减 1 的条件。', expected: 7 },
  { name: '一支单站队伍', graph: selfLoop,
    question: '一个自环代表一支队伍，能提供两种教练颜色吗？',
    explanation: '不能。虽然自环在通常的图论度数中计两次，但这里只是一支参赛队伍，逐点上界为 1。U=1，最优值为 1。', expected: 1 },
  { name: '两条平行边', graph: parallelEdges,
    question: '两支队伍参加同样两站，把它们分给不同教练会怎样？',
    explanation: '两条边染成不同颜色，两个赛站都能领两份。U=4，最优值为 4；平行边不能合并成一条。', expected: 4 },
].map(example => ({
  ...example,
  nodes: example.graph.nodes,
  edges: example.graph.edges.map(({ source, target }) => [source, target]),
}));

// Incidence counts teams, not graph-theoretic degree: a loop contributes once.
export function giftScore(example, mask) {
  const vertices = example.nodes.map(({ id }) => {
    const incident = example.edges.flatMap(([a, b], i) => a === id || b === id ? [i] : []);
    const colors = new Set(incident.map(i => (mask >> i) & 1));
    return { id, teams: incident.length, upper: Math.min(2, incident.length), score: colors.size };
  });
  return { vertices, upper: vertices.reduce((s, v) => s + v.upper, 0), score: vertices.reduce((s, v) => s + v.score, 0) };
}

// Layout and base styles live in graphs/*.json; interaction changes colors only.
export function giftGraphData(example, mask) {
  const { graph } = example;
  const { vertices } = giftScore(example, mask);
  return {
    ...graph,
    nodes: graph.nodes.map((node, i) => ({
      ...node,
      style: {
        ...graph.nodesStyle,
        ...node.style,
        fill: vertices[i].score < vertices[i].upper
          ? GIFT_GRAPH_COLORS.deficit : GIFT_GRAPH_COLORS.reached,
      },
    })),
    edges: graph.edges.map((edge, i) => ({
      ...edge,
      style: {
        ...graph.edgesStyle,
        ...edge.style,
        stroke: (mask >> i) & 1 ? GIFT_GRAPH_COLORS.coachB : GIFT_GRAPH_COLORS.coachA,
      },
    })),
  };
}

export function optimalGiftColorings(example) {
  let best = -1, masks = [];
  for (let mask = 0; mask < 2 ** example.edges.length; mask++) {
    const { score } = giftScore(example, mask);
    if (score > best) { best = score; masks = [mask]; }
    else if (score === best) masks.push(mask);
  }
  return { best, masks };
}
