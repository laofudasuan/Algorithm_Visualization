import React, { useRef, useState } from 'react';
import LinkedListVisualization from '../../components/visualizations/LinkedListVisualization.jsx';

const LinkedListVisualizationPage = () => {
  const linkedListVizRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [inputIndex, setInputIndex] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [listStatus, setListStatus] = useState({
    size: 0,
    head: null,
    isEmpty: true
  });

  // 更新链表状态显示
  const updateListStatus = () => {
    if (linkedListVizRef.current) {
      setListStatus({
        size: linkedListVizRef.current.size(),
        head: linkedListVizRef.current.peek(),
        isEmpty: linkedListVizRef.current.isEmpty()
      });
    }
  };

  // 处理头部添加
  const handleAddToHead = () => {
    if (inputValue.trim() !== '' && linkedListVizRef.current) {
      const success = linkedListVizRef.current.addToHead(inputValue.trim());
      if (success) {
        setInputValue('');
        updateListStatus();
      } else {
        alert('链表已满，无法添加更多元素！');
      }
    }
  };

  // 处理尾部添加
  const handleAddToTail = () => {
    if (inputValue.trim() !== '' && linkedListVizRef.current) {
      const success = linkedListVizRef.current.addToTail(inputValue.trim());
      if (success) {
        setInputValue('');
        updateListStatus();
      } else {
        alert('链表已满，无法添加更多元素！');
      }
    }
  };

  // 处理指定位置插入
  const handleInsertAt = () => {
    if (inputValue.trim() !== '' && inputIndex !== '' && linkedListVizRef.current) {
      const index = parseInt(inputIndex, 10);
      if (isNaN(index)) {
        alert('请输入有效的索引值！');
        return;
      }
      
      const success = linkedListVizRef.current.insertAt(index, inputValue.trim());
      if (success) {
        setInputValue('');
        setInputIndex('');
        updateListStatus();
      } else {
        alert('插入失败，请检查索引是否有效！');
      }
    }
  };

  // 处理头部删除
  const handleRemoveFromHead = () => {
    if (linkedListVizRef.current && !linkedListVizRef.current.isEmpty()) {
      linkedListVizRef.current.removeFromHead();
      updateListStatus();
    } else {
      alert('链表为空，无法删除！');
    }
  };

  // 处理尾部删除
  const handleRemoveFromTail = () => {
    if (linkedListVizRef.current && !linkedListVizRef.current.isEmpty()) {
      linkedListVizRef.current.removeFromTail();
      updateListStatus();
    } else {
      alert('链表为空，无法删除！');
    }
  };

  // 处理指定位置删除
  const handleRemoveAt = () => {
    if (inputIndex !== '' && linkedListVizRef.current) {
      const index = parseInt(inputIndex, 10);
      if (isNaN(index)) {
        alert('请输入有效的索引值！');
        return;
      }
      
      const result = linkedListVizRef.current.removeAt(index);
      if (result !== null) {
        setInputIndex('');
        updateListStatus();
      } else {
        alert('删除失败，请检查索引是否有效！');
      }
    }
  };

  // 处理搜索
  const handleSearch = () => {
    if (searchValue.trim() !== '' && linkedListVizRef.current) {
      const index = linkedListVizRef.current.search(searchValue.trim());
      setSearchResult(index);
    }
  };

  // 处理清空链表
  const handleClear = () => {
    if (linkedListVizRef.current) {
      linkedListVizRef.current.clear();
      updateListStatus();
      setSearchResult(null);
    }
  };

  // 处理键盘事件
  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  // 预设链表示例
  const handlePresetExample = (type) => {
    if (linkedListVizRef.current) {
      let exampleList = [];
      
      switch(type) {
        case 'numbers':
          exampleList = [1, 2, 3, 4, 5];
          break;
        case 'letters':
          exampleList = ['A', 'B', 'C', 'D', 'E'];
          break;
        case 'mixed':
          exampleList = [10, 'X', 20, 'Y', 30];
          break;
        default:
          exampleList = [];
      }
      
      linkedListVizRef.current.setList(exampleList);
      updateListStatus();
      setSearchResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">链表(Linked List)可视化</h1>
        
        {/* 链表状态和操作区域 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">链表操作</h2>
          
          {/* 输入区域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-1">元素值：</label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleAddToTail)}
                placeholder="输入节点值"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">索引（用于插入/删除）：</label>
              <input
                type="text"
                value={inputIndex}
                onChange={(e) => setInputIndex(e.target.value)}
                placeholder="输入索引值"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 添加操作按钮 */}
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={handleAddToHead}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              disabled={inputValue.trim() === ''}
            >
              添加到头 (Add to Head)
            </button>
            <button
              onClick={handleAddToTail}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={inputValue.trim() === ''}
            >
              添加到尾 (Add to Tail)
            </button>
            <button
              onClick={handleInsertAt}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              disabled={inputValue.trim() === '' || inputIndex === ''}
            >
              插入到位置 (Insert At)
            </button>
          </div>

          {/* 删除操作按钮 */}
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={handleRemoveFromHead}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              disabled={listStatus.isEmpty}
            >
              删除头部 (Remove from Head)
            </button>
            <button
              onClick={handleRemoveFromTail}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              disabled={listStatus.isEmpty}
            >
              删除尾部 (Remove from Tail)
            </button>
            <button
              onClick={handleRemoveAt}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
              disabled={listStatus.isEmpty || inputIndex === ''}
            >
              删除指定位置 (Remove At)
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              清空 (Clear)
            </button>
          </div>

          {/* 搜索功能 */}
          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleSearch)}
              placeholder="搜索元素"
              className="flex-grow max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              disabled={searchValue.trim() === ''}
            >
              搜索 (Search)
            </button>
          </div>
          
          {/* 搜索结果显示 */}
          {searchResult !== null && (
            <div className={`p-3 rounded-md mb-4 ${searchResult >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {searchResult >= 0 ? 
                `找到元素 "${searchValue}"，位于索引 ${searchResult}` : 
                `未找到元素 "${searchValue}"`
              }
            </div>
          )}
          
          {/* 预设示例 */}
          <div className="mb-4">
            <p className="text-gray-700 mb-2">预设示例：</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handlePresetExample('numbers')}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                数字序列
              </button>
              <button
                onClick={() => handlePresetExample('letters')}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                字母序列
              </button>
              <button
                onClick={() => handlePresetExample('mixed')}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                混合序列
              </button>
            </div>
          </div>
          
          {/* 链表状态信息 */}
          <div className="text-gray-700">
            <p>链表长度: {listStatus.size}</p>
            <p>头节点值: {listStatus.head !== null ? listStatus.head : '链表为空'}</p>
            <p>链表状态: {listStatus.isEmpty ? '空' : '非空'}</p>
          </div>
        </div>
        
        {/* 链表可视化组件 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">链表可视化</h2>
          <LinkedListVisualization 
            ref={linkedListVizRef}
            radius={100}
            maxSize={5}
          />
        </div>
        
        {/* 链表说明 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">链表说明</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>链表是一种线性数据结构，每个元素（节点）包含数据和指向下一个节点的引用</li>
            <li>绿色标记表示头节点(Head)，琥珀色标记表示尾节点(Tail)</li>
            <li>添加操作：可以在头部、尾部或指定位置添加新节点</li>
            <li>删除操作：可以删除头部、尾部或指定位置的节点</li>
            <li>搜索操作：查找指定值的节点位置</li>
            <li>链表满时无法继续添加节点，链表为空时无法删除节点</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// 添加静态属性供列表页面读取
LinkedListVisualizationPage.title = '链表可视化';
LinkedListVisualizationPage.description = '可视化展示链表的基本操作和特性';

export default LinkedListVisualizationPage;