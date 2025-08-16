import { useState } from 'react';

function LinkedListVisualization() {
  // 链表节点状态
  const [linkedList, setLinkedList] = useState([
    { id: 1, value: 10, next: 2 },
    { id: 2, value: 20, next: 3 },
    { id: 3, value: 30, next: 4 },
    { id: 4, value: 40, next: null }
  ]);
  
  // 动画和控制状态
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [currentNode, setCurrentNode] = useState(null);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  
  // 操作参数状态
  const [newNodeValue, setNewNodeValue] = useState('');
  const [insertPosition, setInsertPosition] = useState(0);
  const [deleteValue, setDeleteValue] = useState('');
  const [searchValue, setSearchValue] = useState('');

  // 生成新的唯一ID
  const generateNewId = () => {
    if (linkedList.length === 0) return 1;
    return Math.max(...linkedList.map(node => node.id)) + 1;
  };

  // 在指定位置插入节点
  const insertAtPosition = async (value, position) => {
    if (!value || value.trim() === '') return;
    
    setIsAnimating(true);
    const newList = [...linkedList];
    const newId = generateNewId();
    const numValue = parseInt(value);
    
    // 高亮显示插入过程
    if (position === 0) {
      // 插入到头部
      const newNode = { id: newId, value: numValue, next: newList.length > 0 ? newList[0].id : null };
      setCurrentNode(newId);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
      setLinkedList([newNode, ...newList]);
    } else if (position >= newList.length) {
      // 插入到尾部
      const newNode = { id: newId, value: numValue, next: null };
      if (newList.length > 0) {
        // 遍历到尾部
        for (let i = 0; i < newList.length; i++) {
          setCurrentNode(newList[i].id);
          await new Promise(resolve => setTimeout(resolve, animationSpeed));
        }
        newList[newList.length - 1].next = newId;
      }
      setCurrentNode(newId);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
      setLinkedList([...newList, newNode]);
    } else {
      // 插入到中间位置
      let currentIndex = 0;
      for (let i = 0; i < newList.length; i++) {
        setCurrentNode(newList[i].id);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
        
        if (currentIndex === position - 1) {
          const newNode = { id: newId, value: numValue, next: newList[i].next };
          newList[i].next = newId;
          newList.splice(i + 1, 0, newNode);
          setCurrentNode(newId);
          await new Promise(resolve => setTimeout(resolve, animationSpeed));
          break;
        }
        currentIndex++;
      }
      setLinkedList([...newList]);
    }
    
    setCurrentNode(null);
    setIsAnimating(false);
    setNewNodeValue('');
  };

  // 根据值删除节点
  const deleteByValue = async (value) => {
    if (!value || value.trim() === '') return;
    
    setIsAnimating(true);
    const newList = [...linkedList];
    const numValue = parseInt(value);
    let found = false;
    
    // 如果删除头节点
    if (newList.length > 0 && newList[0].value === numValue) {
      setCurrentNode(newList[0].id);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
      newList.shift();
      found = true;
    } else {
      // 查找要删除的节点
      for (let i = 0; i < newList.length - 1; i++) {
        setCurrentNode(newList[i].id);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
        
        if (newList[i + 1].value === numValue) {
          setCurrentNode(newList[i + 1].id);
          await new Promise(resolve => setTimeout(resolve, animationSpeed));
          
          newList[i].next = newList[i + 1].next;
          newList.splice(i + 1, 1);
          found = true;
          break;
        }
      }
    }
    
    if (found) {
      setLinkedList([...newList]);
    }
    
    setCurrentNode(null);
    setIsAnimating(false);
    setDeleteValue('');
  };

  // 搜索节点
  const searchNode = async (value) => {
    if (!value || value.trim() === '') return;
    
    setIsAnimating(true);
    const numValue = parseInt(value);
    let found = false;
    
    for (let i = 0; i < linkedList.length; i++) {
      setCurrentNode(linkedList[i].id);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
      
      if (linkedList[i].value === numValue) {
        setHighlightedNodes([linkedList[i].id]);
        found = true;
        break;
      }
    }
    
    if (!found) {
      setHighlightedNodes([]);
    }
    
    setTimeout(() => {
      setCurrentNode(null);
      setHighlightedNodes([]);
      setIsAnimating(false);
    }, animationSpeed * 2);
  };

  // 遍历链表
  const traverseList = async () => {
    setIsAnimating(true);
    
    for (let i = 0; i < linkedList.length; i++) {
      setCurrentNode(linkedList[i].id);
      setHighlightedNodes([linkedList[i].id]);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }
    
    setCurrentNode(null);
    setHighlightedNodes([]);
    setIsAnimating(false);
  };

  // 反转链表
  const reverseList = async () => {
    if (linkedList.length <= 1) return;
    
    setIsAnimating(true);
    const newList = [...linkedList];
    
    // 动画演示反转过程
    for (let i = 0; i < newList.length; i++) {
      setCurrentNode(newList[i].id);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }
    
    // 执行反转逻辑
    const reversed = [];
    for (let i = newList.length - 1; i >= 0; i--) {
      const node = { ...newList[i] };
      if (i === 0) {
        node.next = null;
      } else {
        node.next = newList[i - 1].id;
      }
      reversed.push(node);
    }
    
    setLinkedList(reversed);
    setCurrentNode(null);
    setIsAnimating(false);
  };

  // 清空链表
  const clearList = () => {
    if (!isAnimating) {
      setLinkedList([]);
      setCurrentNode(null);
      setHighlightedNodes([]);
    }
  };

  // 重置为默认链表
  const resetList = () => {
    if (!isAnimating) {
      setLinkedList([
        { id: 1, value: 10, next: 2 },
        { id: 2, value: 20, next: 3 },
        { id: 3, value: 30, next: 4 },
        { id: 4, value: 40, next: null }
      ]);
      setCurrentNode(null);
      setHighlightedNodes([]);
    }
  };

  return (
    <div style={{ height: '100vh', padding: '20px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ margin: 0, color: '#1976d2' }}>链表可视化</h1>
        
        {/* 控制面板 */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 16, 
          padding: 20, 
          border: '1px solid #ddd', 
          borderRadius: 8, 
          backgroundColor: '#f9f9f9',
          width: '100%'
        }}>
          {/* 动画速度控制 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
            <label>动画速度:</label>
            <select 
              value={animationSpeed} 
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
              disabled={isAnimating}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value={1200}>慢</option>
              <option value={800}>中等</option>
              <option value={400}>快</option>
            </select>
          </div>

          {/* 操作控件 */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: 16,
            alignItems: 'start'
          }}>
            {/* 插入节点 */}
            <div style={{ 
              padding: '16px', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              backgroundColor: 'white' 
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>插入节点</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input 
                  type="number" 
                  placeholder="节点值" 
                  value={newNodeValue} 
                  onChange={(e) => setNewNodeValue(e.target.value)}
                  disabled={isAnimating}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input 
                  type="number" 
                  placeholder="插入位置" 
                  value={insertPosition} 
                  onChange={(e) => setInsertPosition(Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={isAnimating}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button 
                  onClick={() => insertAtPosition(newNodeValue, insertPosition)}
                  disabled={isAnimating || !newNodeValue}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isAnimating || !newNodeValue ? '#ccc' : '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isAnimating || !newNodeValue ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  插入节点
                </button>
              </div>
            </div>

            {/* 删除节点 */}
            <div style={{ 
              padding: '16px', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              backgroundColor: 'white' 
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>删除节点</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input 
                  type="number" 
                  placeholder="要删除的值" 
                  value={deleteValue} 
                  onChange={(e) => setDeleteValue(e.target.value)}
                  disabled={isAnimating}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button 
                  onClick={() => deleteByValue(deleteValue)}
                  disabled={isAnimating || !deleteValue}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isAnimating || !deleteValue ? '#ccc' : '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isAnimating || !deleteValue ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  删除节点
                </button>
              </div>
            </div>

            {/* 搜索节点 */}
            <div style={{ 
              padding: '16px', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              backgroundColor: 'white' 
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>搜索节点</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input 
                  type="number" 
                  placeholder="搜索值" 
                  value={searchValue} 
                  onChange={(e) => setSearchValue(e.target.value)}
                  disabled={isAnimating}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button 
                  onClick={() => searchNode(searchValue)}
                  disabled={isAnimating || !searchValue}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isAnimating || !searchValue ? '#ccc' : '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isAnimating || !searchValue ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  搜索节点
                </button>
              </div>
            </div>

            {/* 链表操作 */}
            <div style={{ 
              padding: '16px', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              backgroundColor: 'white' 
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>链表操作</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button 
                  onClick={traverseList}
                  disabled={isAnimating}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isAnimating ? '#ccc' : '#ff9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isAnimating ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  遍历链表
                </button>
                <button 
                  onClick={reverseList}
                  disabled={isAnimating}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isAnimating ? '#ccc' : '#9c27b0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isAnimating ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  反转链表
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={resetList}
                    disabled={isAnimating}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      backgroundColor: isAnimating ? '#ccc' : '#607d8b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isAnimating ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    重置
                  </button>
                  <button 
                    onClick={clearList}
                    disabled={isAnimating}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      backgroundColor: isAnimating ? '#ccc' : '#795548',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isAnimating ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    清空
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 链表可视化区域 */}
        <div style={{ 
          width: '100%',
          padding: '30px',
          border: '2px solid #1976d2',
          borderRadius: '12px',
          backgroundColor: 'white',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflowX: 'auto'
        }}>
          {linkedList.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#666', 
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              链表为空
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 15,
              minWidth: 'fit-content'
            }}>
              {linkedList.map((node, index) => (
                <div key={node.id} style={{ display: 'flex', alignItems: 'center' }}>
                  {/* 节点 */}
                  <div style={{
                    width: 100,
                    height: 80,
                    border: `3px solid ${
                      highlightedNodes.includes(node.id) ? '#4caf50' :
                      currentNode === node.id ? '#ff9800' : '#1976d2'
                    }`,
                    borderRadius: 12,
                    backgroundColor: highlightedNodes.includes(node.id) ? '#e8f5e8' :
                                    currentNode === node.id ? '#fff3e0' : 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.4s ease',
                    boxShadow: currentNode === node.id || highlightedNodes.includes(node.id) ? 
                              '0 6px 20px rgba(0,0,0,0.3)' : '0 4px 8px rgba(0,0,0,0.1)',
                    transform: currentNode === node.id ? 'scale(1.1)' : 'scale(1)'
                  }}>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: 'bold', 
                      color: highlightedNodes.includes(node.id) ? '#4caf50' :
                              currentNode === node.id ? '#ff9800' : '#1976d2'
                    }}>
                      {node.value}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#666',
                      marginTop: '4px'
                    }}>
                      ID: {node.id}
                    </div>
                    <div style={{ 
                      fontSize: '10px', 
                      color: '#999',
                      marginTop: '2px'
                    }}>
                      位置: {index}
                    </div>
                  </div>
                  
                  {/* 箭头或NULL */}
                  {node.next ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      margin: '0 10px'
                    }}>
                      <div style={{
                        width: 50,
                        height: 3,
                        backgroundColor: currentNode === node.id ? '#ff9800' : '#1976d2',
                        position: 'relative',
                        transition: 'all 0.3s ease'
                      }}>
                        <div style={{
                          position: 'absolute',
                          right: -8,
                          top: -6,
                          width: 0,
                          height: 0,
                          borderLeft: `12px solid ${currentNode === node.id ? '#ff9800' : '#1976d2'}`,
                          borderTop: '6px solid transparent',
                          borderBottom: '6px solid transparent',
                          transition: 'all 0.3s ease'
                        }} />
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      marginLeft: 15,
                      padding: '8px 12px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      borderRadius: 6,
                      fontSize: '14px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      NULL
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 算法说明 */}
        <div style={{ 
          maxWidth: '1000px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          width: '100%'
        }}>
          <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>链表数据结构说明</h3>
          <div style={{ color: '#666' }}>
            <p><strong>链表</strong>是一种线性数据结构，其中元素不是存储在连续的内存位置。链表中的每个元素称为节点，包含数据和指向下一个节点的指针。</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div>
                <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>基本操作</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li><strong>插入:</strong> 在指定位置添加新节点 - O(n)</li>
                  <li><strong>删除:</strong> 根据值删除节点 - O(n)</li>
                  <li><strong>搜索:</strong> 查找特定值的节点 - O(n)</li>
                  <li><strong>遍历:</strong> 访问所有节点 - O(n)</li>
                  <li><strong>反转:</strong> 改变链表方向 - O(n)</li>
                </ul>
              </div>
              
              <div>
                <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>特点</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>动态大小，运行时可以增长或缩小</li>
                  <li>内存高效，只分配需要的内存</li>
                  <li>插入/删除操作灵活</li>
                  <li>不支持随机访问（不能直接访问索引）</li>
                  <li>需要额外的内存存储指针</li>
                </ul>
              </div>
              
              <div>
                <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>可视化说明</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li><span style={{color: '#ff9800'}}>🟠 橙色边框:</span> 当前操作的节点</li>
                  <li><span style={{color: '#4caf50'}}>🟢 绿色边框:</span> 搜索找到的节点</li>
                  <li><span style={{color: '#1976d2'}}>🔵 蓝色边框:</span> 普通节点</li>
                  <li><span style={{color: '#f44336'}}>🔴 红色标签:</span> NULL指针（链表结束）</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LinkedListVisualization;
