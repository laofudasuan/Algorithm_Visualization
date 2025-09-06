import { AppBar, Toolbar, Typography, IconButton, Tooltip, Box } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import QQImage from '../assets/QQ.jpg'; // 导入QQ图片

function Header() {
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        borderRadius: '0px',
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
        
        <Box sx={{ 
          position: 'absolute', 
          left: '50%', 
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <Typography 
            variant="body1" 
            component="div" 
            sx={{ 
              color: 'white',
              mr: 1
            }}
          >
            <p>本平台目前由老虎大蒜(laofudasuan)开发中，还在开发的起步阶段，所以有很多错误内容待修改</p>
            <p> 有任何疑问欢迎加入QQ群：251998253</p>
          </Typography>
          <img 
            src={QQImage} 
            alt="QQ群" 
            style={{ 
              height: '60px',
            }} 
          />
        </Box>
        
      </Toolbar>
    </AppBar>
  );
}

export default Header;