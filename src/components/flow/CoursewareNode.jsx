import React from 'react';
import { Handle, Position } from 'reactflow';
import { CATEGORY_COLORS } from '../../constants/categories.js';

function CoursewareNode({ data }) {
  const color = CATEGORY_COLORS && data?.category ? CATEGORY_COLORS[data.category] : null;
  return (
    <>
      <Handle id="top" type="source" position={Position.Top} isConnectable={false} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="right" type="source" position={Position.Right} isConnectable={false} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="bottom" type="source" position={Position.Bottom} isConnectable={false} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="left" type="source" position={Position.Left} isConnectable={false} style={{ opacity: 0, pointerEvents: 'none' }} />

      <Handle id="top" type="target" position={Position.Top} isConnectable={false} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="right" type="target" position={Position.Right} isConnectable={false} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="bottom" type="target" position={Position.Bottom} isConnectable={false} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="left" type="target" position={Position.Left} isConnectable={false} style={{ opacity: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', textAlign: 'center', overflow: 'visible' }}>
        {color && (
          <div
            style={{
              position: 'absolute',
              top: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: color,
              pointerEvents: 'none',
            }}
          />
        )}
        {data?.clickable && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#3b82f6"
            style={{
              position: 'absolute',
              top: -10,
              right: -10,
              width: 14,
              height: 14,
              opacity: 0.85,
              pointerEvents: 'none',
            }}
          >
            <path d="M2 12l20-10-8 10 8 10L2 12z" transform="rotate(135 12 12)" />
          </svg>
        )}
        <div>{data?.label}</div>
      </div>
    </>
  );
}

export default CoursewareNode;
