import React from 'react';
import { Handle, Position } from 'reactflow';
import { CATEGORY_COLORS } from '../../constants/categories.js';

function CoursewareNode({ data }) {
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
        <div
          style={{
            position: 'absolute',
            top: -10,
            left: '50%',
            transform: 'translateX(-50%)',
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: CATEGORY_COLORS[data?.category] || '#9CA3AF',
        pointerEvents: 'none',
      }}
        />
        <div>{data?.label}</div>
      </div>
    </>
  );
}

export default CoursewareNode;
