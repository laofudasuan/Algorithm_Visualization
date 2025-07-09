import React, { useState } from 'react';

export default function GraphInput({ nodes, setNodes, setNodeFixed, edges, setEdges, directed, setDirected, getNextNodeId }) {
  // Add node
  const addNode = () => setNodes([...nodes, { id: getNextNodeId ? getNextNodeId() : '', fixed: false, label: '' }]);
  // Remove node
  const removeNode = (idx) => setNodes(nodes.filter((_, i) => i !== idx));
  // Update node 增加label
  const updateNode = (idx, key, value) => setNodes(nodes.map((n, i) => i === idx ? { ...n, [key]: value } : n));

  // Add edge
  const addEdge = () => setEdges([...edges, { from: '', to: '', label: '' }]);
  // Remove edge
  const removeEdge = (idx) => setEdges(edges.filter((_, i) => i !== idx));
  // Update edge
  const updateEdge = (idx, key, value) => setEdges(edges.map((e, i) => i === idx ? { ...e, [key]: value } : e));

  const [inputMode, setInputMode] = useState('form'); // 'form' or 'text'
  const [bulkText, setBulkText] = useState('');
  const [showList, setShowList] = useState('nodes'); // 'nodes' or 'edges'

  const parseBulkText = () => {
    const lines = bulkText.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    const nodeSet = new Set();
    const edgeList = [];
    lines.forEach(line => {
      const parts = line.split(/\s+/);
      if (parts.length === 1) {
        nodeSet.add(parts[0]);
      } else if (parts.length >= 2) {
        nodeSet.add(parts[0]);
        nodeSet.add(parts[1]);
        edgeList.push({ from: parts[0], to: parts[1], label: parts[2] ? parts.slice(2).join(' ') : '' });
      }
    });
    setNodes(Array.from(nodeSet).map(id => ({ id, fixed: false })));
    setEdges(edgeList.length > 0 ? edgeList : [{ from: '', to: '', label: '' }]);
  };

  return (
    <div className="graph-input" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', width: 500, maxWidth: '100%', margin: '0 auto', position: 'relative', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 32 }}>
        <h2>批量输入</h2>
        <div style={{ display: 'flex', flexDirection: 'column'}}>
          <div>每行一个点或一条边</div>
          <div>边格式：起点 终点 [标签]</div>
          <div>支持#注释</div>
        </div>
      </div>
      <textarea
        style={{ width: '100%', minHeight: 120, fontFamily: 'monospace', fontSize: 15 }}
        value={bulkText}
        onChange={e => setBulkText(e.target.value)}
        placeholder={`A\nB\nC\nA B\nB C label1\n# 注释`}
      />
        <div style={{ marginTop: 8 }}>
          <button onClick={parseBulkText}>解析</button>
        </div>
      <div style={{ marginBottom: 0 }}>
        <label>
          <input type="radio" name="show-list" value="nodes" checked={showList === 'nodes'} onChange={() => setShowList('nodes')} /> 点列表
        </label>
        <label style={{ marginLeft: 16 }}>
          <input type="radio" name="show-list" value="edges" checked={showList === 'edges'} onChange={() => setShowList('edges')} /> 边列表
        </label>
      </div>
      <div style={{ display: 'flex', gap: 32, width: '100%' }}>
        {/* 左侧：点列表 */}
        {showList === 'nodes' && (
        <div style={{ flex: 1, minWidth: 300, textAlign: 'left' }}>
          {nodes.map((node, idx) => (
            <div key={idx} style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
              <input style={{ width: 20 }} value={node.id} onChange={e => updateNode(idx, 'id', e.target.value)} placeholder={`点${idx+1}`} />
              <input style={{ width: 40, marginLeft: 8 }} value={node.label || ''} onChange={e => updateNode(idx, 'label', e.target.value)} placeholder="标签" />
              <label style={{ width: 80, marginLeft: 8 }}>
                <input
                  type="checkbox"
                  checked={!!node.fixed}
                  onChange={e => setNodeFixed(idx, e.target.checked)}
                />
                固定
              </label>
              <button onClick={() => removeNode(idx)} disabled={nodes.length <= 1} style={{ marginLeft: 8, minWidth: 32, width: 32, height: 32, fontSize: 22, fontWeight: 700, lineHeight: '28px', padding: 0, borderRadius: '50%', background: '#f5f5f5', border: '1px solid #ccc', color: '#d32f2f', cursor: nodes.length <= 1 ? 'not-allowed' : 'pointer' }} title="删除">×</button>
            </div>
          ))}
          <button onClick={addNode}>添加点</button>
        </div>
        )}
        {/* 右侧：边列表 */}
        {showList === 'edges' && (
        <div style={{ flex: 1, minWidth: 400, textAlign: 'left' }}>
          {edges.map((edge, idx) => (
            <div key={idx} style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
              <input style={{ width: 20 }} value={edge.from} onChange={e => updateEdge(idx, 'from', e.target.value)} placeholder="起点" />
              <span style={{ margin: '0 8px' }}>→</span>
              <input style={{ width: 20 }} value={edge.to} onChange={e => updateEdge(idx, 'to', e.target.value)} placeholder="终点" />
              {/* 新增 label 输入框 */}
              <input style={{ width: 40, marginLeft: 8 }} value={edge.label || ''} onChange={e => updateEdge(idx, 'label', e.target.value)} placeholder="标签" />
              <button onClick={() => removeEdge(idx)} disabled={edges.length <= 1} style={{ marginLeft: 8, minWidth: 32, width: 32, height: 32, fontSize: 22, fontWeight: 700, lineHeight: '28px', padding: 0, borderRadius: '50%', background: '#f5f5f5', border: '1px solid #ccc', color: '#d32f2f', cursor: edges.length <= 1 ? 'not-allowed' : 'pointer' }} title="删除">×</button>
            </div>
          ))}
          <button onClick={addEdge}>添加边</button>
        </div>
        )}
      </div>
    </div>
  );
}
