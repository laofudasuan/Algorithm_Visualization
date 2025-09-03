import { Link } from 'react-router-dom';
import { Card, CardContent, CardActions, Button, Typography, Grid, Box, Container } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BarChartIcon from '@mui/icons-material/BarChart';
import SearchIcon from '@mui/icons-material/Search';
import FunctionsIcon from '@mui/icons-material/Functions';
import LinkIcon from '@mui/icons-material/Link';
import ListIcon from '@mui/icons-material/List';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BalanceIcon from '@mui/icons-material/Balance';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import NoteIcon from '@mui/icons-material/Note';
import SortIcon from '@mui/icons-material/Sort';

function Home() {
  const modules = [
    {
      title: '图结构可视化',
      description: '动态创建和可视化图结构，支持有向图和无向图，提供遍历算法演示',
      path: '/graph',
      icon: <BarChartIcon sx={{ fontSize: 48 }} />
    },
    {
      title: '排序',
      description: '可视化排序算法，包括冒泡排序、选择排序、插入排序等',
      path: '/algorithm',
      icon: <SortIcon sx={{ fontSize: 48 }} />
    },
    {
      title: '搜索算法',
      description: '深度优先搜索、广度优先搜索、A*搜索',
      path: '/search',
      icon: <SearchIcon sx={{ fontSize: 48 }} />
    },
    {
      title: '动态规划',
      description: '展示动态规划问题的求解过程，帮助理解状态转移方程',
      path: '/dp',
      icon: <FunctionsIcon sx={{ fontSize: 48 }} />
    },
    {
      title: '链表',
      description: '可视化链表结构和操作，包括单链表、双链表等',
      path: '/linkedlist',
      icon: <LinkIcon sx={{ fontSize: 48 }} />
    },
    {
      title: '优先队列',
      description: '展示优先队列的实现和操作过程',
      path: '/priorityqueue',
      icon: <ListIcon sx={{ fontSize: 48 }} />
    },
    {
      title: '线段树',
      description: '可视化线段树的构建和操作过程',
      path: '/segmenttree',
      icon: <AccountTreeIcon sx={{ fontSize: 48 }} />
    },
    {
      title: '平衡树',
      description: '展示平衡树的结构和旋转操作',
      path: '/balancedtree',
      icon: <BalanceIcon sx={{ fontSize: 48 }} />
    },
    {
      title: '树状数组',
      description: '可视化树状数组的结构和操作',
      path: '/binarytree',
      icon: <ShowChartIcon sx={{ fontSize: 48 }} />
    },
    {
      title: '本地Jupyter Notebook',
      description: '集成本地Jupyter Notebook环境，支持完整的交互式编程体验',
      path: '/local-jupyter',
      icon: <NoteIcon sx={{ fontSize: 48 }} />
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        textAlign: 'center',
        mb: 6,
        py: 4,
        borderRadius: 4,
        backgroundColor: 'background.paper',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
      }}>
        <HomeIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          算法可视化平台
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
          一个帮助理解和学习数据结构与算法的交互式可视化平台
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          通过动画和交互式演示，让抽象的算法变得直观易懂
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {modules.map((module, index) => (
          <Grid item key={index} sx={{ 
            width: 350,
            display: 'flex'
          }}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)'
                },
                width: '100%'
              }}
            >
              <CardContent sx={{ 
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                py: 3
              }}>
                <Box sx={{ 
                  mb: 2,
                  color: 'primary.main'
                }}>
                  {module.icon}
                </Box>
                <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                  {module.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ 
                  wordWrap: 'break-word'
                }}>
                  {module.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button 
                  component={Link} 
                  to={module.path} 
                  variant="contained" 
                  color="primary"
                  size="medium"
                  sx={{ 
                    px: 3,
                    py: 1,
                    borderRadius: 2
                  }}
                >
                  立即体验
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ 
        mt: 8, 
        py: 4, 
        backgroundColor: 'background.paper',
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
      }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mb: 3 }}>
          平台介绍
        </Typography>
        <Typography variant="body1" paragraph sx={{ mb: 2, textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
          本平台是一个基于React和D3.js开发的算法可视化工具，旨在通过交互式动画帮助用户更好地理解数据结构和算法的工作原理。
          平台提供了多种数据结构的可视化演示，包括图结构、链表、树结构等，以及常见算法的执行过程演示。
          本地Jupyter Notebook模块集成了本地运行的Jupyter Notebook环境，提供完整的交互式编程体验。
        </Typography>
        <Typography variant="body1" paragraph sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
          所有可视化模块都支持实时交互，用户可以通过调整参数来观察算法行为的变化。
          平台还在持续开发中，未来将添加更多算法和数据结构的可视化演示。
        </Typography>
      </Box>
    </Container>
  );
}

export default Home;