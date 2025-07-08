import React, { useState } from 'react';

export default function GraphInput({ nodes, setNodes, setNodeFixed, edges, setEdges, directed, setDirected }) {
  // Add node
  const addNode = () => setNodes([...nodes, { id: '', fixed: false, label: '' }]);
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
    <div className="graph-input" style={{ display: 'flex', gap: 32, alignItems: 'flex-start', width: 1000, maxWidth: '100%', margin: '0 auto', position: 'relative', flexDirection: 'column' }}>
      <div style={{ width: '100%' }}>
        <h2>批量输入（每行一个点或一条边，边格式：起点 终点 [标签]，支持#注释）</h2>
        <textarea
          style={{ width: '100%', minHeight: 120, fontFamily: 'monospace', fontSize: 15 }}
          value={bulkText}
          onChange={e => setBulkText(e.target.value)}
          placeholder={`A\nB\nC\nA B\nB C label1\n# 注释`}
        />
        <div style={{ marginTop: 8 }}>
        <button onClick={parseBulkText}>解析</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 32, width: '100%' }}>
        {/* 左侧：点列表 */}
        <div style={{ flex: 1, minWidth: 300, textAlign: 'left' }}>
          <h2>点列表</h2>
          {nodes.map((node, idx) => (
            <div key={idx} style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
              <input style={{ width: 120 }} value={node.id} onChange={e => updateNode(idx, 'id', e.target.value)} placeholder={`点${idx+1}`} />
              <input style={{ width: 80, marginLeft: 8 }} value={node.label || ''} onChange={e => updateNode(idx, 'label', e.target.value)} placeholder="标签" />
              <button onClick={() => removeNode(idx)} disabled={nodes.length <= 1} style={{ marginLeft: 8, minWidth: 70 }}>删除</button>
              <label style={{ width: 80, marginLeft: 8 }}>
                <input
                  type="checkbox"
                  checked={!!node.fixed}
                  onChange={e => setNodeFixed(idx, e.target.checked)}
                />
                固定
              </label>
            </div>
          ))}
          <button onClick={addNode}>添加点</button>
        </div>
        {/* 右侧：边列表 */}
        <div style={{ flex: 1, minWidth: 400, textAlign: 'left' }}>
          <h2>边列表</h2>
          {edges.map((edge, idx) => (
            <div key={idx} style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
              <input style={{ width: 80 }} value={edge.from} onChange={e => updateEdge(idx, 'from', e.target.value)} placeholder="起点" />
              <span style={{ margin: '0 8px' }}>→</span>
              <input style={{ width: 80 }} value={edge.to} onChange={e => updateEdge(idx, 'to', e.target.value)} placeholder="终点" />
              {/* 新增 label 输入框 */}
              <input style={{ width: 80, marginLeft: 8 }} value={edge.label || ''} onChange={e => updateEdge(idx, 'label', e.target.value)} placeholder="标签" />
              <button onClick={() => removeEdge(idx)} disabled={edges.length <= 1} style={{ marginLeft: 8, minWidth: 70 }}>删除</button>
            </div>
          ))}
          <button onClick={addEdge}>添加边</button>
        </div>
      </div>
      {/* 图类型选项放在下方，左对齐 */}
      <div style={{ marginTop: 24, textAlign: 'center', width: '100%' }}>
        <label>
          <input
            type="radio"
            name="graph-type"
            checked={directed}
            onChange={() => setDirected(true)}
          />
          有向图
        </label>
        <label style={{ marginLeft: 16 }}>
          <input
            type="radio"
            name="graph-type"
            checked={!directed}
            onChange={() => setDirected(false)}
          />
          无向图
        </label>
      </div>
    </div>
  );
}
