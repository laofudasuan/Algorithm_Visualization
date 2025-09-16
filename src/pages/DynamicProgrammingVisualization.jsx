import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

function DynamicProgrammingVisualization() {
  return (
    <div style={{ padding: '20px', minHeight: '100vh', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', margin: 0, marginLeft: 0 }}>
      <h1 style={{ textAlign: 'center', color: '#1976d2' }}>动态规划算法可视化</h1>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '30px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          width: '100%',
          maxWidth: '800px'
        }}>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f9f9f9',
            border: '1px solid #ddd',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h2>动态规划算法</h2>
            <p>动态规划（Dynamic Programming）是一种在数学、管理科学、计算机科学、经济学和生物信息学中使用的，通过把原问题分解为相对简单的子问题的方式求解复杂问题的方法。</p>
            <p>本可视化工具包含三种经典的动态规划算法实现：</p>
          </div>

          <Link to="/dp/fibonacci" style={{ 
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#e3f2fd',
              border: '1px solid #2196f3',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#bbdefb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}>
              <h3>斐波那契数列</h3>
              <p>使用动态规划计算斐波那契数列，展示自底向上的计算过程</p>
            </div>
          </Link>

          <Link to="/dp/lcs" style={{ 
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#e8f5e9',
              border: '1px solid #4caf50',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c8e6c9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e8f5e9'}>
              <h3>最长公共子序列</h3>
              <p>查找两个字符串的最长公共子序列，广泛应用于文件差异比较等场景</p>
            </div>
          </Link>

          <Link to="/dp/knapsack" style={{ 
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#fff3e0',
              border: '1px solid #ff9800',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffe0b2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff3e0'}>
              <h3>0-1背包问题</h3>
              <p>经典的背包问题，演示如何在有限容量下选择物品以获得最大价值</p>
            </div>
          </Link>
        </div>

        <div style={{ 
          maxWidth: '800px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          width: '100%'
        }}>
          <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>动态规划简介</h3>
          <p>动态规划是运筹学的一个分支，是求解决策过程最优化的数学方法。20世纪50年代初，美国数学家R.E.Bellman等人在研究多阶段决策过程的优化问题时，提出了著名的最优化原理，从而创立了动态规划。</p>
          <p>动态规划与分治法类似，都是将问题分解为若干个子问题，通过求解子问题来得到原问题的解。不同的是，动态规划适用于有重叠子问题和最优子结构性质的问题，通过保存已解决的子问题的答案来避免重复计算。</p>
        </div>
      </div>
    </div>
  );
}

export default DynamicProgrammingVisualization;
