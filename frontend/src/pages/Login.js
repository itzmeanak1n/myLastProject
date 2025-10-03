import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  CssBaseline,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton,
  Fade,
  Zoom,
  Divider,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'student', // student, rider, admin
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});

  const handleBlur = (field) => (e) => {
    setTouched({ ...touched, [field]: true });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Pass email, password, and userType as separate parameters
      await login(formData.email, formData.password, formData.userType);
      // Navigate based on user type after successful login
      const redirectPath = {
        'student': '/dashboard/student',
        'rider': '/dashboard/rider',
        'admin': '/dashboard/admin'
      }[formData.userType] || '/';
      
      navigate(redirectPath);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Box
        sx={{
          my: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
        </Zoom>
        
        <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          เข้าสู่ระบบ
        </Typography>
        
        <Fade in={error !== ''}>
          <Box width="100%" mb={2}>
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </Box>
        </Fade>
        
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel>ประเภทผู้ใช้</InputLabel>
              <Select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                label="ประเภทผู้ใช้"
              >
                <MenuItem value="student">นักศึกษา</MenuItem>
                <MenuItem value="rider">ไรเดอร์</MenuItem>
                <MenuItem value="admin">ผู้ดูแลระบบ</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="อีเมล"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur('email')}
              margin="normal"
              required
              variant="outlined"
              error={touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)}
              helperText={touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'กรุณากรอกอีเมลให้ถูกต้อง' : ' '}
            />
            
            <TextField
              fullWidth
              label="รหัสผ่าน"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur('password')}
              margin="normal"
              required
              variant="outlined"
              error={touched.password && formData.password === ''}
              helperText={touched.password && formData.password === '' ? 'กรุณากรอกรหัสผ่าน' : ' '}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                fontSize: '1.1rem',
                textTransform: 'none',
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'เข้าสู่ระบบ'
              )}
            </Button>
            
            <Divider sx={{ my: 2 }}>หรือ</Divider>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/register/student')}
                sx={{
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'medium',
                }}
              >
                ลงทะเบียนสำหรับนักศึกษา
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/register/rider')}
                sx={{
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'medium',
                }}
              >
                ลงทะเบียนสำหรับไรเดอร์
              </Button>
            </Box>
          </Box>
        </Paper>
        
        <Box mt={5} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            {new Date().getFullYear()} ระบบจัดการขนส่ง
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;