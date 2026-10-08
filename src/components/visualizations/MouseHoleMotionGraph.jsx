import React, { useEffect, useMemo, useRef, useState } from 'react';
import GraphCanvas from '../animation/GraphCanvas.jsx';
import useMouseHoleTween from './useMouseHoleTween.js';
import { graphVisual, mouseHoleTravelRoute, travelGeometry } from './mouseHoleMotion.js';

// Canvas owns the graph; the overlay follows its exact edge geometry.
// Both style interpolation and moving cues honor the player's pause and speed.
export default function MouseHoleMotionGraph({ graph, cue, progress, example, view, paused, speed }) {
  const [controller, setController] = useState(null), [scale, setScale] = useState(1);
  const previous = useRef(graph), host = useRef(null);
  const target = useMemo(() => ({ ...graphVisual(graph), nodes: graph.nodes.map(n => ({ ...n, focus: cue?.focus?.includes(n.id) ? 1 : 0 })) }), [graph, cue]);
  const { display } = useMouseHoleTween(target, { paused, speed });
  useEffect(() => {
    const resize = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / graph.width)));
    resize.observe(host.current);
    return () => resize.disconnect();
  }, [graph.width]);
  useEffect(() => {
    if (!controller) return;
    const ids = new Set(display.edges.map(e => e.id)), old = new Set(previous.current.edges.map(e => e.id));
    previous.current.edges.filter(e => !ids.has(e.id)).forEach(e => controller.deleteEdge(e.id));
    display.nodes.forEach((n, i) => { if (JSON.stringify(n) !== JSON.stringify(previous.current.nodes[i])) controller.updateNode(n); });
    display.edges.forEach((e, i) => { if (!old.has(e.id)) controller.addEdge(e); else if (JSON.stringify(e) !== JSON.stringify(previous.current.edges[i])) controller.updateEdge(e); });
    previous.current = display;
  }, [controller, display]);
  const route = useMemo(() => mouseHoleTravelRoute(example, graph, cue, view), [example, graph, cue, view]);
  const travel = cue?.kind === 'travel' && route.length > 0;
  const sweep = travel ? travelGeometry(graph, route, progress) : null;
  const color = cue?.edge?.remove ? '#f43f7c' : '#8b5cf6';
  const opacity = Math.max(0, Math.min(1, progress * 10, (1 - progress) * 10));
  return <div ref={host} className="mh-motion-host" style={{ height: graph.height * scale }}>
    <div className="mh-motion-surface" style={{ width: graph.width, height: graph.height, transform: `scale(${scale})` }}>
      <GraphCanvas width={graph.width} height={graph.height} graphData={graph} onInit={setController} enableDrawing={false} backgroundColor={0xffffff} />
      <svg className="mh-motion-overlay" width={graph.width} height={graph.height} viewBox={`0 0 ${graph.width} ${graph.height}`} aria-hidden="true">
        {display.nodes.filter(n => n.focus > 0).map(n => <g key={n.id} opacity={n.focus}>
          <circle cx={n.x} cy={n.y} r={30 + Math.sin(progress * Math.PI) * 8} fill="none" stroke="#fbbf24" strokeWidth="4" opacity={.9} />
          <circle cx={n.x} cy={n.y} r="38" fill="none" stroke="#fde68a" strokeWidth="2" />
        </g>)}
        {travel && <g opacity={opacity} data-motion="edge-sweep">
          {sweep.paths.map(p => <g key={p.id} data-arc={p.id}>
            <path d={p.d} fill="none" stroke={color} strokeWidth="3" opacity=".15" />
            <path d={p.d} pathLength="1" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray="1" strokeDashoffset={1 - p.fraction} />
          </g>)}
          <circle cx={sweep.point.x} cy={sweep.point.y} r="16" fill={color} stroke="white" strokeWidth="4" />
          <text x={sweep.point.x} y={sweep.point.y + 5} textAnchor="middle" fill="white" fontSize="17" fontWeight="700">{cue.edge.remove ? '−' : '→'}</text>
        </g>}
      </svg>
    </div>
  </div>;
}
