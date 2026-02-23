import React, { useMemo } from 'react';

const DEFAULT_ALLOWED_IDENTIFIERS = new Set([
  'x',
  'pi',
  'e',
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'sinh',
  'cosh',
  'tanh',
  'log',
  'ln',
  'exp',
  'sqrt',
  'abs',
  'min',
  'max',
  'floor',
  'ceil',
  'round',
  'pow',
]);

function normalizeExpression(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  const noSpace = s.replace(/\s+/g, '');
  return noSpace.startsWith('y=') || noSpace.startsWith('Y=') ? noSpace.slice(2) : noSpace;
}

function extractIdentifiers(expr) {
  const tokens = expr.match(/\b[A-Za-z_]\w*\b/g);
  return tokens ? Array.from(new Set(tokens)) : [];
}

function toJsExpression(expr) {
  let out = expr;
  out = out.replace(/\^/g, '**');
  out = out.replace(/\bpi\b/gi, 'Math.PI');
  out = out.replace(/\be\b/g, 'Math.E');
  out = out.replace(/\bln\b/gi, 'Math.log');
  const fnNames = [
    'sin',
    'cos',
    'tan',
    'asin',
    'acos',
    'atan',
    'sinh',
    'cosh',
    'tanh',
    'log',
    'exp',
    'sqrt',
    'abs',
    'min',
    'max',
    'floor',
    'ceil',
    'round',
    'pow',
  ];
  for (const name of fnNames) {
    const re = new RegExp(`\\b${name}\\b`, 'gi');
    out = out.replace(re, `Math.${name}`);
  }
  return out;
}

function compileExpression(rawExpression) {
  const normalized = normalizeExpression(rawExpression);
  if (!normalized) return { normalized: '', fn: null, error: 'empty' };

  const allowedChars = /^[0-9A-Za-z_+\-*/%^().,]+$/;
  if (!allowedChars.test(normalized)) {
    return { normalized, fn: null, error: 'invalid_chars' };
  }

  const ids = extractIdentifiers(normalized);
  for (const id of ids) {
    if (!DEFAULT_ALLOWED_IDENTIFIERS.has(id.toLowerCase())) {
      return { normalized, fn: null, error: 'invalid_identifier' };
    }
  }

  const jsExpr = toJsExpression(normalized);
  try {
    const fn = new Function('x', `"use strict"; return (${jsExpr});`);
    return { normalized, fn, error: null };
  } catch {
    return { normalized, fn: null, error: 'compile_error' };
  }
}

function niceStep(roughStep) {
  if (!Number.isFinite(roughStep) || roughStep <= 0) return 1;
  const power = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const n = roughStep / power;
  const snapped = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return snapped * power;
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

function formatTick(v) {
  const abs = Math.abs(v);
  if (abs >= 1e6 || (abs > 0 && abs < 1e-4)) return v.toExponential(2);
  const rounded = Math.round(v * 1e6) / 1e6;
  return String(rounded);
}

function catmullRomPath(points) {
  if (points.length < 2) return '';
  const p = points;
  const p0 = p[0];
  let d = `M ${p0[0]} ${p0[1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p1 = p[i];
    const p2 = p[i + 1];
    const pPrev = i === 0 ? p1 : p[i - 1];
    const pNext = i + 2 < p.length ? p[i + 2] : p2;
    const c1x = p1[0] + (p2[0] - pPrev[0]) / 6;
    const c1y = p1[1] + (p2[1] - pPrev[1]) / 6;
    const c2x = p2[0] - (pNext[0] - p1[0]) / 6;
    const c2y = p2[1] - (pNext[1] - p1[1]) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

export default function FunctionPlot({
  series,
  expression,
  points,
  connect = 'line',
  xDomain = [-10, 10],
  yDomain = [-10, 10],
  xStep = 1,
  yStep = 1,
  width = 720,
  height = 420,
  padding = 36,
  samples = 500,
  showGrid = true,
  showAxes = true,
  showPoints = true,
  showFrame = false,
  stroke = '#ef4444',
  pointColor = '#2563eb',
  className = '',
  caption,
}) {
  const { xMin, xMax, yMin, yMax } = useMemo(() => {
    const [x0, x1] = xDomain;
    const [y0, y1] = yDomain;
    const xm = Math.min(x0, x1);
    const xM = Math.max(x0, x1);
    const ym = Math.min(y0, y1);
    const yM = Math.max(y0, y1);
    return { xMin: xm, xMax: xM, yMin: ym, yMax: yM };
  }, [xDomain, yDomain]);

  const innerW = Math.max(1, width - padding * 2);
  const innerH = Math.max(1, height - padding * 2);

  const toPx = (x, y) => {
    const nx = (x - xMin) / (xMax - xMin);
    const ny = (y - yMin) / (yMax - yMin);
    const px = padding + nx * innerW;
    const py = padding + (1 - ny) * innerH;
    return [px, py];
  };

  const grid = useMemo(() => {
    const xAuto = niceStep((xMax - xMin) / 10);
    const yAuto = niceStep((yMax - yMin) / 10);
    let xStepFinal = Number.isFinite(xStep) && xStep > 0 ? xStep : xAuto;
    let yStepFinal = Number.isFinite(yStep) && yStep > 0 ? yStep : yAuto;
    if ((xMax - xMin) / xStepFinal > 2000) xStepFinal = xAuto;
    if ((yMax - yMin) / yStepFinal > 2000) yStepFinal = yAuto;
    const xs = [];
    const ys = [];
    const xStart = Math.ceil(xMin / xStepFinal) * xStepFinal;
    const yStart = Math.ceil(yMin / yStepFinal) * yStepFinal;
    for (let v = xStart; v <= xMax + 1e-12; v += xStepFinal) xs.push(Math.round(v * 1e12) / 1e12);
    for (let v = yStart; v <= yMax + 1e-12; v += yStepFinal) ys.push(Math.round(v * 1e12) / 1e12);
    return { xs, ys };
  }, [xMin, xMax, yMin, yMax, xStep, yStep]);

  const normalizedSeries = useMemo(() => {
    if (Array.isArray(series) && series.length) return series.filter(Boolean);
    const out = [];
    if (expression) out.push({ type: 'function', expression, stroke, samples });
    if (points) out.push({ type: 'points', points, connect, pointColor, showPoints });
    return out;
  }, [series, expression, stroke, samples, points, connect, pointColor, showPoints]);

  const normalizePointsInput = (input) => {
    const arr = Array.isArray(input) ? input : [];
    const out = [];
    for (const p of arr) {
      if (Array.isArray(p) && p.length >= 2) out.push([Number(p[0]), Number(p[1])]);
      else if (p && typeof p === 'object' && 'x' in p && 'y' in p) out.push([Number(p.x), Number(p.y)]);
    }
    return out.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  };

  const errorToText = (code) => {
    if (code === 'empty') return '表达式为空';
    if (code === 'invalid_chars') return '表达式包含不支持的字符';
    if (code === 'invalid_identifier') return '表达式包含不支持的标识符';
    return '表达式解析失败';
  };

  const functionDrawables = useMemo(() => {
    const out = [];
    const errors = [];
    for (const item of normalizedSeries) {
      if (!item || item.type !== 'function') continue;
      const compiled = compileExpression(item.expression);
      if (!compiled?.fn) {
        if (compiled?.error) errors.push(errorToText(compiled.error));
        else errors.push('表达式解析失败');
        continue;
      }
      const segs = [];
      let cur = [];
      const sampleCount = Number.isFinite(item.samples) && item.samples > 0 ? item.samples : samples;
      for (let i = 0; i <= sampleCount; i++) {
        const t = i / sampleCount;
        const x = xMin + (xMax - xMin) * t;
        let y;
        try {
          y = compiled.fn(x);
        } catch {
          y = NaN;
        }
        const finite = Number.isFinite(y) && Math.abs(y) < 1e9;
        const inRange = finite && y >= yMin && y <= yMax;
        if (!finite || !inRange) {
          if (cur.length >= 2) segs.push(cur);
          cur = [];
          continue;
        }
        cur.push([x, y]);
      }
      if (cur.length >= 2) segs.push(cur);
      const color = item.stroke || item.color || stroke;
      out.push({ segments: segs, stroke: color });
    }
    return { drawables: out, errors };
  }, [normalizedSeries, samples, xMin, xMax, yMin, yMax, stroke]);

  const pointsDrawables = useMemo(() => {
    const out = [];
    for (const item of normalizedSeries) {
      if (!item || item.type !== 'points') continue;
      const pts = normalizePointsInput(item.points);
      const ptsPx = pts
        .map(([x, y]) => [x, y, ...toPx(x, y)])
        .filter((p) => {
          const x = p[0];
          const y = p[1];
          return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
        });
      const connectMode = item.connect || connect;
      const color = item.pointColor || item.color || pointColor;
      const showPts = typeof item.showPoints === 'boolean' ? item.showPoints : showPoints;
      const path = connectMode === 'smooth' && ptsPx.length ? catmullRomPath(ptsPx.map((p) => [p[2], p[3]])) : '';
      out.push({ pointsPx: ptsPx, connect: connectMode, pointColor: color, showPoints: showPts, path });
    }
    return out;
  }, [normalizedSeries, connect, pointColor, showPoints, xMin, xMax, yMin, yMax]);

  const axes = useMemo(() => {
    const x0 = clamp(0, xMin, xMax);
    const y0 = clamp(0, yMin, yMax);
    const [xAxisX0, xAxisY] = toPx(xMin, y0);
    const [xAxisX1] = toPx(xMax, y0);
    const [yAxisX, yAxisY0] = toPx(x0, yMin);
    const [, yAxisY1] = toPx(x0, yMax);
    const showX = 0 >= yMin && 0 <= yMax;
    const showY = 0 >= xMin && 0 <= xMax;
    return {
      showX,
      showY,
      xAxis: { x1: xAxisX0, y1: xAxisY, x2: xAxisX1, y2: xAxisY },
      yAxis: { x1: yAxisX, y1: yAxisY0, x2: yAxisX, y2: yAxisY1 },
    };
  }, [xMin, xMax, yMin, yMax]);

  const errorText = useMemo(() => {
    if (!functionDrawables.errors.length) return null;
    if (functionDrawables.errors.length === 1) return functionDrawables.errors[0];
    return '部分表达式解析失败';
  }, [functionDrawables.errors]);

  return (
    <div className={`my-4 w-full ${className}`} data-vis="function-plot">
      <div className="w-full overflow-x-auto bg-white">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} role="img">
          <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
          {showFrame ? <rect x={padding} y={padding} width={innerW} height={innerH} fill="#ffffff" stroke="#e5e7eb" /> : null}

          {showGrid &&
            grid.xs.map((v) => {
              const [x] = toPx(v, yMin);
              return <line key={`gx-${v}`} x1={x} y1={padding} x2={x} y2={padding + innerH} stroke="#f3f4f6" />;
            })}
          {showGrid &&
            grid.ys.map((v) => {
              const [, y] = toPx(xMin, v);
              return <line key={`gy-${v}`} x1={padding} y1={y} x2={padding + innerW} y2={y} stroke="#f3f4f6" />;
            })}

          {showAxes && axes.showX && <line {...axes.xAxis} stroke="#6b7280" strokeWidth="1.5" />}
          {showAxes && axes.showY && <line {...axes.yAxis} stroke="#6b7280" strokeWidth="1.5" />}

          {showGrid &&
            grid.xs.map((v) => {
              const [x] = toPx(v, yMin);
              return (
                <text key={`tx-${v}`} x={x} y={padding + innerH + 18} textAnchor="middle" fontSize="11" fill="#6b7280">
                  {formatTick(v)}
                </text>
              );
            })}
          {showGrid &&
            grid.ys.map((v) => {
              const [, y] = toPx(xMin, v);
              return (
                <text
                  key={`ty-${v}`}
                  x={padding - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#6b7280"
                >
                  {formatTick(v)}
                </text>
              );
            })}

          {functionDrawables.drawables.flatMap((item, seriesIdx) =>
            item.segments.map((seg, segIdx) => {
              const poly = seg
                .map(([x, y]) => {
                  const [px, py] = toPx(x, y);
                  return `${px},${py}`;
                })
                .join(' ');
              return (
                <polyline
                  key={`f-${seriesIdx}-${segIdx}`}
                  points={poly}
                  fill="none"
                  stroke={item.stroke}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              );
            }),
          )}

          {pointsDrawables.map((item, seriesIdx) => (
            <React.Fragment key={`p-series-${seriesIdx}`}>
              {item.pointsPx.length > 1 && item.connect === 'line' && (
                <polyline
                  points={item.pointsPx.map((p) => `${p[2]},${p[3]}`).join(' ')}
                  fill="none"
                  stroke={item.pointColor}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}
              {item.pointsPx.length > 1 && item.connect === 'smooth' && (
                <path
                  d={item.path}
                  fill="none"
                  stroke={item.pointColor}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}
              {item.showPoints &&
                item.pointsPx.map((p, i) => (
                  <circle
                    key={`p-${seriesIdx}-${i}`}
                    cx={p[2]}
                    cy={p[3]}
                    r="3"
                    fill={item.pointColor}
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                ))}
            </React.Fragment>
          ))}

          {errorText && (
            <text x={padding + 8} y={padding + 18} fontSize="12" fill="#b91c1c">
              {errorText}
            </text>
          )}
        </svg>
      </div>
      {caption ? <div className="mt-2 text-sm text-gray-600">{caption}</div> : null}
    </div>
  );
}
