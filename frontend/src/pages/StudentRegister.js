import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Grid,
  Avatar,
  CssBaseline,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton,
  Fade,
  Zoom,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authService } from '../services/api';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function StudentRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentId: '',
    nationalId: '',
    userFirstname: '',
    userLastname: '',
    userEmail: '',
    userPass: '',
    userTel: '',
    userAddress: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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
      const formDataToSend = new FormData();
      
      // Append all form data to FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      const response = await authService.registerStudent(formDataToSend);
      
      if (response.data.success) {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 2 }}>
      <CssBaseline />
      <Box
        sx={{
          my: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>
              ลงทะเบียนสำหรับนักศึกษา
            </Typography>
          </Box>
        </Zoom>
        
        <Fade in={error !== ''}>
          <Box width="100%" mb={1}>
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </Box>
        </Fade>
        
        <Fade in={success}>
          <Box width="100%" mb={1}>
            <Alert severity="success">
              ลงทะเบียนสำเร็จ! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...
            </Alert>
          </Box>
        </Fade>
        
        <Paper elevation={3} sx={{ p: 3, width: '100%', borderRadius: 2, mt: 1 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="รหัสนักศึกษา"
                  name="studentId"
                  value={formData.studentId}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                    handleChange({ target: { name: 'studentId', value } });
                  }}
                  onBlur={handleBlur('studentId')}
                  inputProps={{
                    inputMode: 'numeric',
                    maxLength: 12
                  }}
                  margin="dense"
                  required
                  variant="outlined"
                  error={touched.studentId && formData.studentId.length !== 12}
                  helperText={touched.studentId && formData.studentId.length !== 12 ? 'รหัสนักศึกษาต้องมี 12 หลัก (ไม่มากกว่าหรือน้อยกว่า)' : ' '}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="เลขบัตรประชาชน"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 13);
                    handleChange({ target: { name: 'nationalId', value } });
                  }}
                  onBlur={handleBlur('nationalId')}
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    maxLength: 13
                  }}
                  margin="dense"
                  required
                  variant="outlined"
                  error={touched.nationalId && formData.nationalId.length !== 13}
                  helperText={touched.nationalId && formData.nationalId.length !== 13 ? 'เลขบัตรประชาชนต้องมี 13 หลัก' : ' '}
                />
              </Grid>
            </Grid>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="ชื่อ"
                  name="userFirstname"
                  value={formData.userFirstname}
                  onChange={handleChange}
                  onBlur={handleBlur('userFirstname')}
                  margin="dense"
                  required
                  variant="outlined"
                  error={touched.userFirstname && formData.userFirstname === ''}
                  helperText=" "
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="นามสกุล"
                  name="userLastname"
                  value={formData.userLastname}
                  onChange={handleChange}
                  onBlur={handleBlur('userLastname')}
                  margin="normal"
                  required
                  variant="outlined"
                  error={touched.userLastname && formData.userLastname === ''}
                  helperText=" "
                />
              </Grid>
            </Grid>
            
            <TextField
              fullWidth
              label="อีเมล"
              name="userEmail"
              type="email"
              value={formData.userEmail}
              onChange={handleChange}
              onBlur={handleBlur('userEmail')}
              margin="normal"
              required
              variant="outlined"
              error={touched.userEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)}
              helperText={touched.userEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail) ? 'กรุณากรอกอีเมลให้ถูกต้อง' : ' '}
            />
            
            <TextField
              fullWidth
              label="รหัสผ่าน"
              name="userPass"
              type={showPassword ? 'text' : 'password'}
              value={formData.userPass}
              onChange={handleChange}
              onBlur={handleBlur('userPass')}
              margin="normal"
              required
              variant="outlined"
              error={touched.userPass && formData.userPass.length < 8}
              helperText={touched.userPass && formData.userPass.length < 8 ? 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' : ' '}
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
            
            <TextField
              fullWidth
              label="เบอร์โทรศัพท์"
              name="userTel"
              value={formData.userTel}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                handleChange({ target: { name: 'userTel', value } });
              }}
              onBlur={handleBlur('userTel')}
              inputProps={{
                inputMode: 'tel',
                pattern: '[0-9]*',
                maxLength: 10
              }}
              margin="normal"
              required
              variant="outlined"
              error={touched.userTel && formData.userTel.length !== 10}
              helperText={touched.userTel && formData.userTel.length !== 10 ? 'เบอร์โทรศัพท์ต้องมี 10 หลัก' : ' '}
            />
            
            <TextField
              fullWidth
              label="ที่อยู่"
              name="userAddress"
              value={formData.userAddress}
              onChange={handleChange}
              onBlur={handleBlur('userAddress')}
              margin="normal"
              required
              variant="outlined"
              multiline
              rows={3}
              error={touched.userAddress && formData.userAddress === ''}
              helperText=" "
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
                'ลงทะเบียน'
              )}
            </Button>
            
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  sx={{
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        <Box mt={5} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} ระบบลงทะเบียนนักศึกษา
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default StudentRegister; 