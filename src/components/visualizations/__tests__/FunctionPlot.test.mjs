import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { transformSync } from 'esbuild';

const source = fs.readFileSync(new URL('../FunctionPlot.jsx', import.meta.url), 'utf8');
const { code } = transformSync(source, { loader: 'jsx', format: 'esm' });
const resolvedCode = code.replace(/from ["']react["']/g, `from '${import.meta.resolve('react')}'`);
const { default: FunctionPlot } = await import(`data:text/javascript;base64,${Buffer.from(resolvedCode).toString('base64')}`);
const render = props => renderToStaticMarkup(React.createElement(FunctionPlot, props));

test('legacy point arrays, default dimensions and smooth lines still render', () => {
  const line = render({ points: [[0, 0], [1, 1]], xDomain: [0, 2], yDomain: [0, 2] });
  assert.match(line, /height="420"/);
  assert.equal((line.match(/<circle /g) || []).length, 2);
  assert.match(line, /M 36 384 L 360 210/);
  const smooth = render({ points: [[0, 0], [1, 1], [2, 0]], connect: 'smooth' });
  assert.match(smooth, / C /);
});
test('functions, mixed series and invalid expressions still work', () => {
  assert.match(render({ expression: 'x^2' }), /<polyline /);
  const mixed = render({ series: [{ type: 'function', expression: 'y=x+1' }, { type: 'points', points: [[0, 0], [1, 0]] }] });
  assert.match(mixed, /<polyline /);
  assert.equal((mixed.match(/<circle /g) || []).length, 2);
  assert.match(render({ expression: 'unknown(x)' }), /表达式包含不支持的标识符/);
});
test('geometry additions: labels, polygons, fill, arrows, equal scales and responsive height', () => {
  const markup = render({ width: 300, height: 180, padding: 20, xDomain: [0, 4], yDomain: [0, 2], equalAspect: true, responsiveHeight: true,
    series: [{ type: 'points', points: [{ x: 0, y: 0, label: '<A>' }, [1, 0], [0, 1]], closed: true,
      fill: '#dbeafe', fillOpacity: 0.3, arrowEnd: true, pointRadius: 5, strokeDasharray: '5 4' }] });
  assert.match(markup, /M 20 155 L 85 155 L 20 90 Z/);
  assert.match(markup, /&lt;A&gt;/);
  assert.match(markup, /fill-opacity="0.3"/);
  assert.match(markup, /marker-end="url/);
  assert.match(markup, /stroke-dasharray="5 4"/);
  assert.match(markup, /height:auto/);
});
test('clipping retains complete crossing segments and IDs are unique for multiple plots', () => {
  const props = { points: [[-2, 0], [2, 0]], xDomain: [-1, 1], yDomain: [-1, 1] };
  const markup = render(props);
  assert.match(markup, /clip-path="url/);
  assert.match(markup, /M -288 210 L 1008 210/);
  assert.equal((markup.match(/<circle /g) || []).length, 0);
  const two = renderToStaticMarkup(React.createElement('div', null, React.createElement(FunctionPlot, props), React.createElement(FunctionPlot, props)));
  const ids = [...two.matchAll(/<clipPath id="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, 2);
  assert.doesNotMatch(render({ xDomain: [0, 0], yDomain: [1, 1], points: [[0, 1]] }), /NaN|Infinity/);
});
