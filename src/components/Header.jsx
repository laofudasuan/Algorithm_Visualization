import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import QQImage from '../assets/QQ.jpg'; // 导入QQ图片

function Header() {
  const toggleNavigation = () => {
    // 调用Navigation.jsx中定义的全局函数
    if (window.toggleNavigation) {
      window.toggleNavigation();
    }
  };

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
        <IconButton
          edge="start"
          color="inherit"
          aria-label="toggle navigation"
          onClick={toggleNavigation}
          sx={{
            mr: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }
          }}
        >
          <MenuIcon />
        </IconButton>

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
            <p>平台目前由老虎大蒜(laofudasuan)开发，处于开发的起步阶段，所以有很多错误内容待修改</p>
            <p>有任何疑问欢迎加入QQ群：251998253</p>
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