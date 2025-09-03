import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import { Home as HomeIcon, BarChart as BarChartIcon, Search as SearchIcon, 
         Functions as FunctionsIcon, Link as LinkIcon, List as ListIcon, 
         AccountTree as AccountTreeIcon, Balance as BalanceIcon, 
         ShowChart as ShowChartIcon, Note as NoteIcon, Sort as SortIcon } from '@mui/icons-material';

function Navigation() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);

  const handleMouseEnter = () => {
    setCollapsed(false);
  };

  const handleMouseLeave = () => {
    setCollapsed(true);
  };

  const navItems = [
    { name: '首页', path: '/', icon: <HomeIcon /> },
    { name: '图结构', path: '/graph', icon: <BarChartIcon /> },
    { name: '排序', path: '/algorithm', icon: <SortIcon /> },
    { name: '搜索', path: '/search', icon: <SearchIcon /> },
    { name: '动态规划', path: '/dp', icon: <FunctionsIcon /> },
    { name: '链表', path: '/linkedlist', icon: <LinkIcon /> },
    { name: '优先队列', path: '/priorityqueue', icon: <ListIcon /> },
    { name: '线段树', path: '/segmenttree', icon: <AccountTreeIcon /> },
    { name: '平衡树', path: '/balancedtree', icon: <BalanceIcon /> },
    { name: '树状数组', path: '/binarytree', icon: <ShowChartIcon /> },
    { name: 'Jupyter Notebook', path: '/local-jupyter', icon: <NoteIcon /> }
  ];

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
            {navItems.map((item) => (
              <ListItem
                key={item.path}
                component={Link}
                to={item.path}
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
        </Box>
      </Drawer>
    </>
  );
}

export default Navigation;