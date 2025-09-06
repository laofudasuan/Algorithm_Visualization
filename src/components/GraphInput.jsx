import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../styles/modal.css';

// 颜色选择器组件
const ColorSelector = ({ value, onChange, basicColors }) => {
  const [mode, setMode] = useState('basic'); // 'basic' 或 'palette'
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [tempColor, setTempColor] = useState(value); // 临时颜色，用于色盘模式
  const colorSelectorRef = useRef(null);

  const handleColorSelect = (color) => {
    onChange(color);
    setShowDropdown(false);
  };

  const handlePaletteConfirm = () => {
    onChange(tempColor);
    setShowDropdown(false);
  };

  const handlePaletteCancel = () => {
    setTempColor(value); // 恢复原始颜色
    setShowDropdown(false);
  };

  const handleToggleDropdown = (event) => {
    if (!showDropdown) {
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left
      });
      setTempColor(value); // 初始化临时颜色
    }
    setShowDropdown(!showDropdown);
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorSelectorRef.current && !colorSelectorRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div ref={colorSelectorRef} style={{ marginLeft: 8, position: 'relative' }}>
      {/* 颜色预览方块 */}
      <div 
        style={{ 
          width: 20, 
          height: 20, 
          backgroundColor: value, 
          border: '2px solid #ccc', 
          borderRadius: '4px', 
          cursor: 'pointer',
          display: 'inline-block'
        }}
        title={`当前颜色: ${value}`}
        onClick={handleToggleDropdown}
      ></div>
      
      {/* 下拉颜色选择面板 */}
      {showDropdown && (
        <div style={{
          position: 'fixed',
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '6px',
          padding: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          zIndex: 10001,
          minWidth: 200
        }}>
          {/* 模式切换 */}
          <div style={{ marginBottom: 8, display: 'flex', gap: 4 }}>
            <button
              style={{
                flex: 1,
                padding: '4px 8px',
                fontSize: '12px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                background: mode === 'basic' ? '#e3f2fd' : 'white',
                color: mode === 'basic' ? '#1976d2' : '#666',
                cursor: 'pointer'
              }}
              onClick={() => setMode('basic')}
            >
              基础颜色
            </button>
            <button
              style={{
                flex: 1,
                padding: '4px 8px',
                fontSize: '12px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                background: mode === 'palette' ? '#e3f2fd' : 'white',
                color: mode === 'palette' ? '#1976d2' : '#666',
                cursor: 'pointer'
              }}
              onClick={() => setMode('palette')}
            >
              色盘
            </button>
          </div>
          
          {/* 基础颜色模式 */}
          {mode === 'basic' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginBottom: 8 }}>
                {basicColors.map(color => (
                  <div
                    key={color}
                    style={{
                      width: 32,
                      height: 32,
                      backgroundColor: color,
                      border: value === color ? '3px solid #1976d2' : '2px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                    title={color}
                    onClick={() => handleColorSelect(color)}
                  />
                ))}
              </div>
              {/* 关闭按钮 */}
              <div style={{ textAlign: 'right' }}>
                <button
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowDropdown(false)}
                >
                  关闭
                </button>
              </div>
            </div>
          )}
          
          {/* 色盘模式 */}
          {mode === 'palette' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <input
                type="color"
                value={tempColor}
                onChange={(e) => setTempColor(e.target.value)}
                style={{
                  width: 120,
                  height: 40,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              />
              <div style={{ fontSize: '12px', color: '#666', marginTop: 4, marginBottom: 8 }}>
                当前颜色: {tempColor}
              </div>
              {/* 确定/取消按钮 */}
              <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                <button
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    fontSize: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    background: '#f5f5f5',
                    cursor: 'pointer'
                  }}
                  onClick={handlePaletteCancel}
                >
                  取消
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    fontSize: '12px',
                    border: '1px solid #1976d2',
                    borderRadius: '3px',
                    background: '#1976d2',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                  onClick={handlePaletteConfirm}
                >
                  确定
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function GraphInput({
  nodes,
  setNodes,
  setNodeFixed,
  edges,
  setEdges,
  directed,
  setDirected,
  getNextNodeId,
  nodeColorOptions = ["#69b3a2", "#1976d2", "#ff9800", "#e91e63", "#FFB6C1", "#ffff00"],
  edgeColorOptions = ["#000000", "#1976d2", "#ff9800", "#e91e63", "#69b3a2", "#ffff00"],
  onRandomGenerate,
  clearGraph
}) {
  // Add node
  const addNode = () => setNodes([...nodes, { id: getNextNodeId ? getNextNodeId() : '', fixed: false, label: '', color: '#69b3a2' }]);
  // Remove node
  const removeNode = (idx) => setNodes(nodes.filter((_, i) => i !== idx));
  // Update node 增加label
  const updateNode = (idx, key, value) => setNodes(nodes.map((n, i) => i === idx ? { ...n, [key]: value } : n));

  // 固定/取消固定所有点
  const toggleAllNodesFixed = () => {
    const allFixed = nodes.every(node => node.fixed);
    nodes.forEach((_, idx) => {
      setNodeFixed(idx, !allFixed);
    });
  };

  // Add edge
  const addEdge = () => setEdges([...edges, { from: '', to: '', label: '' }]);
  // Remove edge
  const removeEdge = (idx) => setEdges(edges.filter((_, i) => i !== idx));
  // Update edge
  const updateEdge = (idx, key, value) => setEdges(edges.map((e, i) => i === idx ? { ...e, [key]: value } : e));

  const [inputMode, setInputMode] = useState('form'); // 'form' or 'text'
  const [bulkText, setBulkText] = useState('');
  const [showList, setShowList] = useState('nodes'); // 'nodes' or 'edges'
  const [showBulkModal, setShowBulkModal] = useState(false); // 控制批量输入弹窗

  const parseBulkText = () => {
    // 先清空现有图
    clearGraph();
    
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
    setNodes(Array.from(nodeSet).map(id => ({ id, fixed: false, label: '', color: '#69b3a2' })));
    setEdges(edgeList.length > 0 ? edgeList : [{ from: '', to: '', label: '' }]);
    setShowBulkModal(false); // 解析完成后关闭弹窗
  };

  return (
    <div className="graph-input" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', width: 500, maxWidth: '100%', margin: '0 auto', position: 'relative', flexDirection: 'column' }}>
      {/* 批量输入和随机生成按钮 */}
      <div className="button-group" style={{ marginBottom: 16 }}>
        <button 
          onClick={() => setShowBulkModal(true)}
          className="action-button action-button-warning"
        >
          批量输入
        </button>
        <button 
          onClick={onRandomGenerate}
          className="action-button action-button-warning"
        >
          随机生成
        </button>
      </div>

      {/* 批量输入弹窗 */}
      {showBulkModal && createPortal(
        <div 
          className="modal-overlay"
        >
          <div className="modal-container">
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ margin: 0, textAlign: 'center', color: '#333', fontSize: 18 }}>批量输入</h2>
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', color: '#666', marginTop: 6, textAlign: 'center', padding: '0 10px' }}>
                <div>每行一个点或一条边</div>
                <div>边格式：起点 终点 [标签]</div>
                <div>支持#注释</div>
              </div>
            </div>
            
            <textarea
              className="bulk-input-textarea"
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder={`A\nB\nC\nA B\nB C label1\n# 注释`}
              style={{ marginBottom: 16 }}
            />
            
            <div className="modal-buttons">
              <button 
                onClick={() => setShowBulkModal(false)}
                className="modal-button modal-button-cancel"
              >
                取消
              </button>
              <button 
                onClick={parseBulkText}
                className="modal-button modal-button-success"
              >
                解析并应用
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

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
              <input style={{ width: 40 }} value={node.id} onChange={e => updateNode(idx, 'id', e.target.value)} placeholder={`点${idx+1}`} />
              <input style={{ width: 60, marginLeft: 8 }} value={node.label || ''} onChange={e => updateNode(idx, 'label', e.target.value)} placeholder="标签" />
              {/* 颜色选择器 - 基础颜色和色盘选项 */}
              <ColorSelector
                value={node.color}
                onChange={(color) => updateNode(idx, 'color', color)}
                basicColors={nodeColorOptions}
              />
              <span 
                onClick={() => setNodeFixed(idx, !node.fixed)}
                style={{ 
                  width: 20, 
                  marginLeft: 8, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  fontSize: '20px',
                  userSelect: 'none'
                }}
                title={node.fixed ? '点击解锁' : '点击锁定'}
              >
                {node.fixed ? '🔒' : '🔓'}
              </span>
              <button onClick={() => removeNode(idx)} disabled={nodes.length <= 1} style={{ marginLeft: 12, background: 'none', border: 'none', color: '#d32f2f', fontSize: 24, fontWeight: 700, cursor: nodes.length <= 1 ? 'not-allowed' : 'pointer', padding: 0, minWidth: 'auto' }} title="删除">×</button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button onClick={addNode}>添加点</button>
            <button 
              onClick={toggleAllNodesFixed}
              style={{
                background: nodes.every(node => node.fixed) ? '#ff9800' : '#4caf50',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              title={nodes.every(node => node.fixed) ? '取消固定所有点' : '固定所有点'}
            >
              {nodes.every(node => node.fixed) ? '取消固定所有点' : '固定所有点'}
            </button>
          </div>
        </div>
        )}
        {/* 右侧：边列表 */}
        {showList === 'edges' && (
        <div style={{ flex: 1, minWidth: 400, textAlign: 'left' }}>
          {edges.map((edge, idx) => (
            <div key={idx} style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
              <input style={{ width: 40 }} value={edge.from} onChange={e => updateEdge(idx, 'from', e.target.value)} placeholder="起点" />
              <span style={{ marginLeft:-6,width:20 }}>→</span>
              <input style={{ marginLeft:-2,width: 40 }} value={edge.to} onChange={e => updateEdge(idx, 'to', e.target.value)} placeholder="终点" />
              {/* 新增 label 输入框 */}
              <input style={{ width: 50, marginLeft: 8 }} value={edge.label || ''} onChange={e => updateEdge(idx, 'label', e.target.value)} placeholder="标签" />
              {/* 颜色选择器 - 基础颜色和色盘选项 */}
              <ColorSelector
                value={edge.color}
                onChange={(color) => updateEdge(idx, 'color', color)}
                basicColors={edgeColorOptions}
              />
              <button onClick={() => removeEdge(idx)} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#d32f2f', fontSize: 22, fontWeight: 700, cursor: 'pointer', padding: 0, minWidth: 'auto' }} title="删除">×</button>
            </div>
          ))}
          <button onClick={addEdge}>添加边</button>
        </div>
        )}
      </div>
    </div>
  );
}
