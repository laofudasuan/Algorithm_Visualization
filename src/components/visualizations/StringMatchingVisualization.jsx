import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { matchingModel, STRING_MATCH_CASES } from './stringMatchingModel';
import './StringMatchingVisualization.css';

export default function StringMatchingVisualization({ mode = 'ordinary' }) {
  const wildcard = mode === 'wildcard', cases = STRING_MATCH_CASES[mode];
  const [caseIndex, setCaseIndex] = useState(0), [offset, setOffset] = useState(0), [step, setStep] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const reduced = useReducedMotion();
  const example = cases[caseIndex];
  const model = useMemo(() => matchingModel(example.pattern, example.text, wildcard), [example, wildcard]);
  const m = model.a.length, n = model.b.length, frame = model.windows[offset];
  const count = Math.min(step, m), complete = step > m, active = step > 0 && !complete ? frame.pairs[step - 1] : null;
  const duration = reduced ? 0 : .45;
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = event => { if (event.key === 'Escape') setExpanded(false); };
    document.addEventListener('keydown', close);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', close); };
  }, [expanded]);
  const choose = i => { setCaseIndex(i); setOffset(0); setStep(0); };
  const move = s => { setOffset(s); setStep(0); };
  const content = <section data-vis="string-matching" className={`sm-vis${expanded ? ' sm-expanded' : ''}`} aria-label={wildcard ? '通配符匹配演示' : '反转与卷积演示'}>
    <header><div><small>{wildcard ? '实验 02 / 三组卷积' : '实验 01 / 为什么反转'}</small><strong>{wildcard ? '让不匹配的位置留下正数' : '一次对齐，对应一条反对角线'}</strong></div>
      <button type="button" aria-label={expanded ? '缩小演示' : '放大演示'} title="放大 / 缩小（Esc 退出）" onClick={() => setExpanded(v => !v)}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d={expanded ? 'M3 9h6V3m12 12h-6v6M3 3l6 6m12 12-6-6' : 'M8 3H3v5m13 13h5v-5M3 3l7 7m11 11-7-7'} /></svg></button>
    </header>
    <div className="sm-body">
      <div className="sm-tabs">{cases.map((item, i) => <button type="button" key={item.name} aria-pressed={i === caseIndex} onClick={() => choose(i)}>{item.name}</button>)}</div>
      <div className="sm-toolbar"><label>窗口起点 s <select aria-label="窗口起点 s" value={offset} onChange={e => move(Number(e.target.value))}>{model.windows.map(w => <option key={w.s} value={w.s}>{w.s}（输出位置 {w.s + 1}）</option>)}</select></label><span>编码 a = 1，b = 2，…{wildcard && '，* = 0'}</span></div>
      <div className="sm-scroll"><svg className="sm-alignment" viewBox={`0 0 ${100 + 54 * n} 184`} role="img" aria-label={`模式串 ${example.pattern} 对齐文本 ${example.text} 的起点 ${offset}`}>
        <text x="8" y="48" className="sm-row-label">文本 B</text><text x="8" y="148" className="sm-row-label">模式 A</text>
        {[...example.text].map((c, t) => <g key={t}><text x={99 + t * 54} y="17" className="sm-index">{t}</text><rect x={78 + t * 54} y="27" width="42" height="42" rx="10" className={t >= offset && t < offset + m ? 'sm-text selected' : 'sm-text'} /><text x={99 + t * 54} y="54" className="sm-char">{c}</text></g>)}
        <motion.g initial={false} animate={{ x: offset * 54 }} transition={{ duration }}>
          {[...example.pattern].map((c, j) => <g key={j}><rect x={78 + j * 54} y="126" width="42" height="42" rx="10" className="sm-pattern" /><text x={99 + j * 54} y="153" className="sm-char">{c}</text><text x={99 + j * 54} y="182" className="sm-index">j = {j}</text></g>)}
        </motion.g>
        {frame.pairs.slice(0, count).map(pair => <motion.path key={`${caseIndex}-${offset}-${pair.j}`} d={`M ${99 + pair.t * 54} 123 L ${99 + pair.t * 54} 73`} stroke={pair.score === 0 ? '#10b981' : '#a855f7'} strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration }} />)}
      </svg></div>
      <div className="sm-controls"><button type="button" disabled={step === 0} onClick={() => setStep(s => s - 1)}>← 上一步</button><button type="button" className="sm-primary" disabled={complete} onClick={() => setStep(s => s + 1)}>{complete ? '已完成' : step === m ? '汇总这个窗口' : '比较下一对 →'}</button><button type="button" onClick={() => setStep(0)}>重置</button><small>{step} / {m + 1}</small></div>
      <div className="sm-callout" aria-live="polite">{complete ? `比较完成：D(${offset}) = ${frame.score}，${frame.score === 0 ? `匹配！对应题目位置 ${offset + 1}` : '不匹配'}。` : active ? `正在比较 A[${active.j}] 与 B[${active.t}]：反转后 r = ${active.r}，r + t = ${frame.k}。` : '先选窗口，再逐对比较。观察每条连接如何落在下面同一条反对角线上。'}</div>
      <div className="sm-grid-layout">
        <div><h4>反转后：R = [{model.reversed.join(', ')}]</h4><p className="sm-hint">行是 r，列是 t；黄格满足 r + t = k = {frame.k}。</p>
          <div className="sm-scroll"><div className="sm-matrix" style={{ gridTemplateColumns: `70px repeat(${n}, minmax(46px, 1fr))` }} role="table" aria-label="卷积乘积矩阵">
            <div role="row" className="sm-matrix-row"><div role="columnheader">R[r] \ B[t]</div>{model.b.map((b, t) => <div role="columnheader" key={`h${t}`}><small>t={t}</small><b>{b}</b></div>)}</div>
            {model.reversed.map((r, i) => <div role="row" className="sm-matrix-row" key={i}><div role="rowheader"><small>r={i}</small><b>{r}</b></div>{model.b.map((b, t) => {
              const pair = frame.pairs.find(p => p.r === i && p.t === t), seen = pair && pair.j < count;
              return <div role="cell" key={t} className={`sm-cell${pair ? ' sm-diagonal' : ''}${active?.r === i && active?.t === t ? ' sm-active' : ''}`}>
                {seen ? <motion.span key={`${caseIndex}-${offset}-${i}`} initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: duration / 2, delay: duration }}>{wildcard ? pair.score : r * b}</motion.span> : '·'}
              </div>;
            })}</div>)}
          </div></div><p className="sm-hint">{wildcard ? '格内显示 uv(u−v)²；它由下面三项相加减得到。' : '格内显示 R[r]B[t]；黄格之和就是卷积系数 C[k]。'}这里只展开当前窗口。</p>
        </div>
        <div className="sm-detail"><h4>{active ? `这一对：u = ${active.u}，v = ${active.v}` : complete ? '三个部分合并' : '等待第一对字符'}</h4>
          <p>{wildcard ? 'u³v + uv³ − 2u²v²' : 'u² + v² − 2uv'}</p>
          {active && <motion.div key={`${caseIndex}-${offset}-${step}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration, delay: duration }}>
            <div className="sm-terms"><span>{active.terms[0]}</span> + <span>{active.terms[1]}</span> − 2 × <span>{active.terms[2]}</span></div><strong>= {active.score}</strong><p>{wildcard && (!active.u || !active.v) ? '含 *：乘积 uv = 0，这一对不产生惩罚。' : active.u === active.v ? '字符相等：这一对不产生惩罚。' : '字符不同：产生正的惩罚，不能被别的位置抵消。'}</p>
          </motion.div>}
          {complete && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="sm-terms"><span>{frame.sums[0]}</span> + <span>{frame.sums[1]}</span> − 2 × <span>{frame.sums[2]}</span></div><strong>= {frame.score}</strong><p>{wildcard ? '三项分别来自三组卷积的第 k 项。' : `第三项 C[${frame.k}] = ${frame.sums[2]}；前两项是平方和。`}</p></motion.div>}
          {!step && <p className="sm-hint">原串按 j 比较；矩阵按 r = m − 1 − j 定位。显示的数值由当前输入实时计算。</p>}
        </div>
      </div>
      <small className="sm-hint">教学模块用短串直接求和核对卷积；FFT 的作用是批量计算所有系数，不是逐窗口运行本动画。</small>
    </div>
  </section>;
  return expanded ? createPortal(<div className="sm-overlay" role="dialog" aria-modal="true" aria-label="字符串匹配放大演示">{content}</div>, document.body) : content;
}
