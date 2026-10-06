import React, { useEffect, useMemo, useState } from 'react';
import GraphCanvas from '../animation/GraphCanvas.jsx';
import { GIFT_GRAPH_COLORS, GIFT_GRAPH_EXAMPLES, giftGraphData, giftScore, optimalGiftColorings } from './giftGraphExamples';
import './GiftGraphExamplesVisualization.css';

const BEST_SCORES = GIFT_GRAPH_EXAMPLES.map(example => optimalGiftColorings(example).best);

function ColoredGraph({ example, mask }) {
  const [controller, setController] = useState(null);
  const data = useMemo(() => giftGraphData(example, mask), [example, mask]);
  useEffect(() => {
    if (!controller) return;
    data.nodes.forEach(n => controller.updateNode(n));
    data.edges.forEach(e => controller.updateEdge(e));
  }, [controller, data]);
  return <div className="gift-graph-scroll" role="img" aria-label={example.name + '：天蓝边为教练甲，亮紫边为教练乙；薄荷绿填充表示达到上界，明黄填充表示未达上界；各点贡献见下方表格'}>
    <GraphCanvas width={data.width} height={data.height} graphData={data} enableDrawing={false} isLoading={false} onInit={setController} backgroundImage={null} backgroundColor={0xffffff} />
  </div>;
}

export default function GiftGraphExamplesVisualization() {
  const [index, setIndex] = useState(0);
  const [mask, setMask] = useState(0);
  const [checked, setChecked] = useState(null);
  const example = GIFT_GRAPH_EXAMPLES[index];
  const { vertices, score } = useMemo(() => giftScore(example, mask), [example, mask]);
  const select = i => { setIndex(i); setMask(0); setChecked(null); };
  const toggleEdge = i => { setMask(previous => previous ^ (1 << i)); setChecked(null); };
  return <section className="gift-vis" data-vis="gift-graph-examples" aria-label="小礼品：逐点上界与连通块图例" style={{
    '--gift-coach-a': GIFT_GRAPH_COLORS.coachA,
    '--gift-coach-b': GIFT_GRAPH_COLORS.coachB,
    '--gift-reached': GIFT_GRAPH_COLORS.reached,
    '--gift-deficit': GIFT_GRAPH_COLORS.deficit,
  }}>
    <header>试着染色，再校验你的方案</header>
    <div className="gift-body">
      <div className="gift-tabs">{GIFT_GRAPH_EXAMPLES.map((item, i) => <button type="button" key={item.name} aria-pressed={index === i} onClick={() => select(i)}>{item.name}</button>)}</div>
      <div className="gift-legend"><span><i className="gift-edge-a" />教练甲</span><span><i className="gift-edge-b" />教练乙</span><span><i className="gift-node-reached" />已达上界</span><span><i className="gift-node-deficit" />未达上界</span></div>
      <ColoredGraph key={index} example={example} mask={mask} />
      <small>每条边是一支队伍；下方按钮可切换它的教练。窄屏可横向查看图。</small>
      <div className="gift-edges">{example.edges.map(([a, b], i) => <button type="button" key={i} className={(mask >> i) & 1 ? 'gift-coach-b' : 'gift-coach-a'} aria-label={'切换 e' + (i + 1) + ' 的教练'} onClick={() => toggleEdge(i)}>
        e{i + 1} · {a}—{b} · {(mask >> i) & 1 ? '乙' : '甲'}
      </button>)}</div>
      <div className="gift-actions"><button className="gift-check" type="button" onClick={() => setChecked(score === BEST_SCORES[index])}>校验</button></div>
      {checked !== null && <div className={'gift-feedback ' + (checked ? 'gift-feedback-success' : 'gift-feedback-retry')} role="status" aria-live="polite">
        {checked ? '✓ 当前染色是最优方案！' : '还不是最优方案，再试试调整边的颜色。'}
      </div>}
      <div className="gift-table-scroll"><table><thead><tr><th>赛站</th><th>参赛队伍数</th><th>当前礼品</th><th>该点上界</th></tr></thead><tbody>
        {vertices.map(v => <tr key={v.id} className={v.score < v.upper ? 'gift-deficit' : ''}><th>{v.id}</th><td>{v.teams}</td><td>{v.score}</td><td>{v.upper}</td></tr>)}
      </tbody></table></div>
    </div>
  </section>;
}
