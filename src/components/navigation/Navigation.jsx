import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Collapse, IconButton } from '@mui/material';
import { Home as HomeIcon, BarChart as BarChartIcon, Search as SearchIcon, 
         Functions as FunctionsIcon, Link as LinkIcon, List as ListIcon, 
         AccountTree as AccountTreeIcon, Balance as BalanceIcon, 
         ShowChart as ShowChartIcon, Note as NoteIcon, Sort as SortIcon,
         ExpandLess, ExpandMore, PlayArrow as PlayArrowIcon, TextFields as TextFieldsIcon, 
         AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';

// 全局变量跟踪导航栏可见状态
let isNavigationVisible = false;

// 全局函数用于切换导航栏可见性
window.toggleNavigation = function() {
  isNavigationVisible = !isNavigationVisible;
  // 触发自定义事件通知组件更新
  window.dispatchEvent(new CustomEvent('navigationToggle', { detail: isNavigationVisible }));
};

function Navigation() {
  const location = useLocation();
  const [visible, setVisible] = useState(isNavigationVisible);
  const [openMenus, setOpenMenus] = useState({});
  const navigationRef = useRef(null);
  
  // Extracted common styles
  const listItemBaseStyle = {
    borderRadius: '10px',
    margin: '5px 0px',
    padding: '8px 8px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
  };

  const listItemHoverStyle = (isActive) => ({
    backgroundColor: isActive ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)',
  });

  const listItemActiveStyle = (isActive) => ({
    backgroundColor: isActive ? 'primary.main' : 'transparent',
    color: isActive ? 'primary.contrastText' : 'text.primary',
    '&:hover': listItemHoverStyle(isActive),
  });

  // 为父级菜单设置不同的高亮样式
  const parentItemActiveStyle = (isActive) => ({
    backgroundColor: isActive ? 'primary.light' : 'transparent',
    color: isActive ? 'primary.contrastText' : 'text.primary',
    '&:hover': listItemHoverStyle(isActive),
  });

  // 检查当前路径是否匹配给定路径或其子路径
  const isPathActive = (path) => 
    !!path && (location.pathname === path || (path !== '/' && location.pathname.startsWith(path)));

  // 监听全局导航切换事件
  useEffect(() => {
    const handleToggle = (event) => {
      setVisible(event.detail);
    };
    
    window.addEventListener('navigationToggle', handleToggle);
    return () => {
      window.removeEventListener('navigationToggle', handleToggle);
    };
  }, []);

  // 监听点击事件，当导航栏展开时点击外部区域则隐藏导航栏
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 如果导航栏未展开，则不处理
      if (!visible) return;
      
      // 如果点击的元素不在导航栏内，则隐藏导航栏
      if (navigationRef.current && !navigationRef.current.contains(event.target)) {
        window.toggleNavigation();
      }
    };

    // 添加事件监听器
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      // 清理事件监听器
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible]);

  const handleClick = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const navItems = [
    { name: '首页', path: '/', icon: <HomeIcon /> },
    { 
      name: '图论', 
      icon: <BarChartIcon />, 
      path: '/graph' 
    },
    { 
      name: '基础算法', 
      path: '/basic', 
      icon: <PlayArrowIcon />,
      children: [
        { name: '排序', path: '/basic/sorting', icon: <SortIcon /> },
        { name: '二分查找', path: '/basic/binary-search', icon: <SearchIcon /> },
        { name: '分治算法', path: '/basic/divide-conquer', icon: <AccountTreeIcon /> },
        { name: '倍增算法', path: '/basic/doubling', icon: <ShowChartIcon /> }
      ]
    },
    { 
      name: '动态规划', 
      path: '/dp', 
      icon: <FunctionsIcon />,
      children: [
        { name: '斐波那契数列', path: '/dp/fibonacci', icon: <FunctionsIcon /> },
        { name: '最长公共子序列', path: '/dp/lcs', icon: <FunctionsIcon /> },
        { name: '0-1背包问题', path: '/dp/knapsack', icon: <FunctionsIcon /> },
        { name: '树形动态规划', path: '/dp/tree-dp', icon: <AccountTreeIcon /> }
      ]
    },
    { 
      name: '搜索', 
      path: '/search', 
      icon: <SearchIcon /> 
    },
    { 
      name: '数据结构', 
      path: '/data-structure',
      icon: <AccountTreeIcon />,
      children: [
        { name: '链表', path: '/data-structure/linkedlist', icon: <LinkIcon /> },
        { name: '优先队列', path: '/data-structure/priorityqueue', icon: <ListIcon /> },
        { name: '线段树', path: '/data-structure/segmenttree', icon: <AccountTreeIcon /> },
        { name: '平衡树', path: '/data-structure/balancedtree', icon: <BalanceIcon /> },
        { name: '树状数组', path: '/data-structure/binarytree', icon: <ShowChartIcon /> }
      ]
    },
    { 
      name: '字符串', 
      path: '/string-algorithms',
      icon: <TextFieldsIcon />,
      children: [
        { name: 'KMP算法', path: '/string-algorithms/kmp', icon: <TextFieldsIcon /> },
        { name: 'AC自动机', path: '/string-algorithms/ac-automation', icon: <TextFieldsIcon /> },
        { name: '后缀自动机', path: '/string-algorithms/suffix-automaton', icon: <TextFieldsIcon /> }
      ]
    },
    { 
      name: '测试页面', 
      path: '/animation-test', 
      icon: <AutoAwesomeIcon /> 
    },
    { 
      name: 'Jupyter', 
      path: '/local-jupyter', 
      icon: <NoteIcon /> 
    }
  ];

  const renderNavItem = (item, index) => {
    if (item.children) {
      const isOpen = openMenus[item.name];
      const isCurrentItemActive = isPathActive(item.path);
      return (
        <div key={index}>
          <ListItem
            sx={{
              ...listItemBaseStyle,
              ...parentItemActiveStyle(isCurrentItemActive),
              overflow: 'hidden',
              padding: '8px 8px'
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: isCurrentItemActive ? 'white' : 'text.primary',
                minWidth: '40px',
                minHeight: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 0,
                padding: 0
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.name} 
              component={Link}
              to={item.path}
              sx={{ 
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.3s ease',
                margin: 0,
                padding: 0,
                paddingLeft: '8px',
                width: visible ? 'auto' : 0,
                minWidth: visible ? 'auto' : 0,
                overflow: 'hidden',
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'inherit',
                flex: '1 1 auto',
                whiteSpace: 'nowrap'
              }} 
            />
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleClick(item.name);
              }}
              sx={{
                color: isCurrentItemActive ? 'white' : 'text.primary',
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.3s ease',
                padding: 0
              }}
            >
              {isOpen ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </ListItem>
          <Collapse in={visible && isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child, childIndex) => (
                <ListItem
                key={childIndex}
                component={Link}
                to={child.path}
                sx={{
                  ...listItemBaseStyle,
                  pl: 4,
                  ...listItemActiveStyle(location.pathname === child.path),
                  overflow: 'hidden',
                  padding: '8px 8px'
                }}
              >
                  <ListItemIcon 
                    sx={{ 
                      color: location.pathname === child.path ? 'white' : 'text.primary',
                      minWidth: '40px',
                      minHeight: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: 0,
                      padding: 0
                    }}
                  >
                    {child.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={child.name} 
                    sx={{ 
                      opacity: visible ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                      margin: 0,
                      padding: 0,
                      paddingLeft: '8px',
                      width: visible ? 'auto' : 0,
                      minWidth: visible ? 'auto' : 0,
                      overflow: 'hidden',
                      flex: '1 1 auto',
                      whiteSpace: 'nowrap'
                    }} 
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </div>
      );
    }

    return (
      <ListItem
        key={index}
        component={Link}
        to={item.path}
        sx={{
          ...listItemBaseStyle,
          ...listItemActiveStyle(location.pathname === item.path),
          overflow: 'hidden',
          padding: '8px 8px'
        }}
      >
        <ListItemIcon 
          sx={{ 
            color: location.pathname === item.path ? 'white' : 'text.primary',
            minWidth: '40px',
            minHeight: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0,
            padding: 0
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText 
          primary={item.name} 
          sx={{ 
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.3s ease',
            margin: 0,
            padding: 0,
            paddingLeft: '8px',
            width: visible ? 'auto' : 0,
            minWidth: visible ? 'auto' : 0,
            overflow: 'hidden',
            flex: '1 1 auto',
            whiteSpace: 'nowrap'
          }} 
        />
      </ListItem>
    );
  };

  return (
    <>
      {/* Navigation Drawer - Fixed positioned to stay in place during scroll */}
      <Drawer
        variant="permanent"
        ref={navigationRef}
        sx={{
          width: visible ? '240px' : '0px',
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: visible ? '240px' : '0px',
            boxSizing: 'border-box',
            backgroundColor: 'background.paper',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
            marginTop: '64px',
            height: 'calc(100% - 64px)',
            position: 'fixed',
            zIndex: 1100
          },
        }}
      >
        {/* 只有在显示时才渲染内容 */}
        {visible && (
          <Box sx={{ paddingTop: '0px' }}>
            <List>
              {navItems.map((item, index) => renderNavItem(item, index))}
            </List>
          </Box>
        )}
      </Drawer>
    </>
  );
}

export default Navigation;