import React from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Grid, 
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import { styled, alpha } from '@mui/material/styles';

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(8, 2),
  margin: theme.spacing(4, 0),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='20' viewBox='0 0 100 20'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-.24.09c-.66.246-1.34.5-2.04.764z' fill='%23${theme.palette.primary.main.replace('#', '')}22' fill-rule='evenodd'/%3E%3C/svg%3E")`,
    opacity: 0.5,
  },
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4, 3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'all 0.3s ease',
  margin: theme.spacing(1),
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3, 2),
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.shape.borderRadius * 2,
  fontWeight: 'bold',
  textTransform: 'none',
  letterSpacing: '0.5px',
  transition: 'all 0.3s',
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(1),
  },
}));

function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    {
      icon: <DirectionsBikeIcon color="primary" sx={{ 
        fontSize: { xs: 40, sm: 50 },
        mb: { xs: 1.5, sm: 2 },
        color: theme.palette.primary.main
      }} />,
      title: 'ไรเดอร์มืออาชีพ',
      description: 'พบกับไรเดอร์มืออาชีพที่มีความเชี่ยวชาญในการให้บริการ',
    },
    {
      icon: <SchoolIcon color="primary" sx={{ 
        fontSize: { xs: 40, sm: 50 },
        mb: { xs: 1.5, sm: 2 },
        color: theme.palette.primary.main
      }} />,
      title: 'สำหรับนักศึกษา',
      description: 'บริการที่ออกแบบมาเพื่อตอบโจทย์การเดินทางของนักศึกษาโดยเฉพาะ',
    },
    {
      icon: <PersonIcon color="primary" sx={{ 
        fontSize: { xs: 40, sm: 50 },
        mb: { xs: 1.5, sm: 2 },
        color: theme.palette.primary.main
      }} />,
      title: 'ใช้งานง่าย',
      description: 'เพียงไม่กี่ขั้นตอนก็สามารถใช้บริการได้ทันที',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <HeroSection>
          <Typography 
            variant={isMobile ? 'h3' : 'h2'} 
            component="h1" 
            color="primary" 
            fontWeight="bold"
            gutterBottom
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              position: 'relative',
              zIndex: 1,
            }}
          >
            ยินดีต้อนรับสู่ระบบขนส่งไปไหน ไปไหน
          </Typography>
          <Typography 
            variant={isMobile ? 'h6' : 'h5'} 
            color="text.secondary" 
            paragraph 
            maxWidth="800px" 
            mx="auto"
            sx={{ position: 'relative', zIndex: 1 }}
          >
            ระบบขนส่งสำหรับนักศึกษาที่ต้องการความสะดวกสบายและปลอดภัยในการเดินทาง
          </Typography>
          
          <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <StyledButton
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SchoolIcon />}
              onClick={() => navigate('/register/student')}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
              }}
            >
              สมัครสมาชิกนักศึกษา
            </StyledButton>
            <StyledButton
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<DirectionsBikeIcon />}
              onClick={() => navigate('/register/rider')}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: `0 8px 16px ${alpha(theme.palette.secondary.main, 0.3)}`,
                },
              }}
            >
              สมัครเป็นไรเดอร์
            </StyledButton>
            <StyledButton
              variant="outlined"
              color="primary"
              size="large"
              startIcon={<PersonIcon />}
              onClick={() => navigate('/login')}
              sx={{
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-3px)',
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
                },
              }}
            >
              เข้าสู่ระบบ
            </StyledButton>
          </Box>
        </HeroSection>

        <Box sx={{ my: { xs: 6, md: 8 }, px: { xs: 2, sm: 0 } }}>
          <Typography 
            variant="h4" 
            component="h2" 
            align="center" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              mb: { xs: 4, md: 6 },
              fontSize: { xs: '1.75rem', sm: '2.125rem' }
            }}
          >
            ทำไมต้องเลือกเรา?
          </Typography>
          <Grid 
            container 
            spacing={{ xs: 3, md: 4 }} 
            sx={{ 
              maxWidth: '1200px',
              mx: 'auto',
              px: { xs: 2, sm: 3 },
              justifyContent: 'center'
            }}
          >
            {features.map((feature, index) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                lg={4} 
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  '& > *': {
                    width: '100%',
                    maxWidth: '350px'
                  }
                }}
              >
                <FeatureCard elevation={2}>
                  <Box sx={{ minHeight: '80px', display: 'flex', alignItems: 'center' }}>
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 'bold',
                      mb: 2,
                      fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.6,
                      fontSize: { xs: '0.95rem', sm: '1rem' }
                    }}
                  >
                    {feature.description}
                  </Typography>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;