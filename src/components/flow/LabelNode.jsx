import React from 'react';

function LabelNode({ data }) {
  const kind = data?.kind || 'title';
  const base = {
    position: 'relative',
    textAlign: 'center',
    overflow: 'visible',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    pointerEvents: 'none'
  };
  if (kind === 'title') {
    const titleStyle = {
      fontSize: 42,
      fontWeight: 900,
      letterSpacing: 1.5,
      backgroundImage: 'linear-gradient(45deg, #f857a6, #ff5858, #ffa751, #ffcd3c, #35e2c2, #43c6ac)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      backgroundSize: '400% 400%',
      animation: 'flow 7s ease infinite',
      WebkitTextStroke: '1.2px rgba(255,255,255,.55)',
      textShadow: '0 4px 20px rgba(0,0,0,.12)'
    };
    return <div style={{ ...base, ...titleStyle }}>{data?.label}</div>;
  }
  const descStyle = { fontSize: 18, fontWeight: 500, color: '#374151', textShadow: '0 1px 2px rgba(0,0,0,0.04)', maxWidth: 520, textAlign: 'left' };
  return <div style={{ ...base, ...descStyle }}>{data?.label}</div>;
}

export default LabelNode;
