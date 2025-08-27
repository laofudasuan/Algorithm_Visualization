import { AppBar, Toolbar, Typography, IconButton, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

function Header() {
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: 'primary.main',
        boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
        mb: 2,
        zIndex: 1300 // 确保标题栏在最上层
      }}
    >
      <Toolbar sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        py: 1
      }}>
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            fontWeight: 'bold',
            letterSpacing: '0.5px'
          }}
        >
          算法可视化平台
        </Typography>
        
      </Toolbar>
    </AppBar>
  );
}

export default Header;