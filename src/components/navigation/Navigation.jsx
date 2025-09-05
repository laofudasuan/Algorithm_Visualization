import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Collapse, IconButton } from '@mui/material';
import { Home as HomeIcon, BarChart as BarChartIcon, Search as SearchIcon, 
         Functions as FunctionsIcon, Link as LinkIcon, List as ListIcon, 
         AccountTree as AccountTreeIcon, Balance as BalanceIcon, 
         ShowChart as ShowChartIcon, Note as NoteIcon, Sort as SortIcon,
         ExpandLess, ExpandMore, PlayArrow as PlayArrowIcon, TextFields as TextFieldsIcon } from '@mui/icons-material';

function Navigation() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);
  const [openMenus, setOpenMenus] = useState({});

  // Extracted common styles
  const listItemBaseStyle = {
    borderRadius: '10px',
    margin: '5px 0px',
    padding: '8px 16px',
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

  const handleMouseEnter = () => {
    setCollapsed(false);
  };

  const handleMouseLeave = () => {
    setCollapsed(true);
  };

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
      icon: <AccountTreeIcon />,
      children: [
        { name: '链表', path: '/linkedlist', icon: <LinkIcon /> },
        { name: '优先队列', path: '/priorityqueue', icon: <ListIcon /> },
        { name: '线段树', path: '/segmenttree', icon: <AccountTreeIcon /> },
        { name: '平衡树', path: '/balancedtree', icon: <BalanceIcon /> },
        { name: '树状数组', path: '/binarytree', icon: <ShowChartIcon /> }
      ]
    },
    { 
      name: '字符串', 
      icon: <TextFieldsIcon />,
      children: [
        { name: 'KMP算法', path: '/kmp', icon: <TextFieldsIcon /> },
        { name: 'AC自动机', path: '/ac-automation', icon: <TextFieldsIcon /> }
      ]
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
      return (
        <div key={index}>
          <ListItem
            sx={{
              backgroundColor: location.pathname === item.path ? 'primary.main' : 'transparent',
              color: location.pathname === item.path ? 'primary.contrastText' : 'text.primary',
              '&:hover': {
                backgroundColor: location.pathname === item.path 
                  ? 'primary.dark' 
                  : 'rgba(0, 0, 0, 0.04)'
              },
              borderRadius: '10px',
              margin: '5px 0px',
              padding: '8px 16px',
              height: '48px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: location.pathname === item.path ? 'white' : 'text.primary',
                minWidth: '40px',
                minHeight: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.name} 
              component={Link}
              to={item.path}
              sx={{ 
                opacity: collapsed ? 0 : 1,
                transition: 'opacity 0.3s ease',
                margin: 0,
                padding: 0,
                paddingLeft: '8px',
                width: collapsed ? 0 : 'auto',
                overflow: 'hidden',
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'inherit'
              }} 
            />
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleClick(item.name);
              }}
              sx={{
                color: location.pathname === item.path ? 'white' : 'text.primary',
                opacity: collapsed ? 0 : 1,
                transition: 'opacity 0.3s ease',
                padding: 0
              }}
            >
              {isOpen ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </ListItem>
          <Collapse in={!collapsed && isOpen} timeout="auto" unmountOnExit>
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
                }}
              >
                  <ListItemIcon 
                    sx={{ 
                      color: location.pathname === child.path ? 'white' : 'text.primary',
                      minWidth: '40px',
                      minHeight: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {child.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={child.name} 
                    sx={{ 
                      opacity: collapsed ? 0 : 1,
                      transition: 'opacity 0.3s ease',
                      margin: 0,
                      padding: 0,
                      paddingLeft: '8px',
                      width: collapsed ? 0 : 'auto',
                      overflow: 'hidden'
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
        }}
      >
        <ListItemIcon 
          sx={{ 
            color: location.pathname === item.path ? 'white' : 'text.primary',
            minWidth: '40px',
            minHeight: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText 
          primary={item.name} 
          sx={{ 
            opacity: collapsed ? 0 : 1,
            transition: 'opacity 0.3s ease',
            margin: 0,
            padding: 0,
            paddingLeft: '8px',
            width: collapsed ? 0 : 'auto',
            overflow: 'hidden'
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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          width: collapsed ? '80px' : '200px',
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: collapsed ? '80px' : '200px',
            boxSizing: 'border-box',
            backgroundColor: 'background.paper',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
            marginTop: '64px', // Height of the fixed header
            height: 'calc(100% - 64px)',
            // Make the drawer fixed positioned
            position: 'fixed',
            zIndex: 1100 // Ensure it's above content but below modals
          },
        }}
      >
        <Box sx={{ paddingTop: '0px' }}>
          <List>
            {navItems.map((item, index) => renderNavItem(item, index))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default Navigation;