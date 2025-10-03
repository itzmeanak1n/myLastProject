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

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+';

function RiderRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    riderId: '',
    riderNationalId: '',
    riderFirstname: '',
    riderLastname: '',
    riderEmail: '',
    riderPass: '',
    riderTel: '',
    riderAddress: '',
  });
  const [files, setFiles] = useState({
    RiderProfilePic: null,
    RiderStudentCard: null,
    QRscan: null,
    riderLicense: null,
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

  const handleFileChange = (e) => {
    setFiles({
      ...files,
      [e.target.name]: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!files.RiderProfilePic || !files.RiderStudentCard || !files.QRscan || !files.riderLicense) {
        setError('กรุณาอัพโหลดไฟล์รูปภาพให้ครบทุกรายการ');
        return;
      }

      const formDataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      Object.keys(files).forEach(key => {
        if (files[key]) {
          formDataToSend.append(key, files[key]);
          console.log(`Appending file ${key}:`, files[key].name);
        }
      });

      console.log('ข้อมูลที่จะส่ง:', {
        ...formData,
        files: Object.keys(files).reduce((acc, key) => ({
          ...acc,
          [key]: files[key]?.name
        }), {})
      });

      const response = await authService.registerRider(formDataToSend);

      if (response.data.success) {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการลงทะเบียน:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง');
      setLoading(false);
    }
  };


  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            ลงทะเบียนสำหรับไรเดอร์
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>ลงทะเบียนสำเร็จ! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="รหัสนักศึกษา"
              name="riderId"
              value={formData.riderId}
              onChange={(e) => {
                // Only allow numbers and limit to 12 characters
                const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                handleChange({ target: { name: 'riderId', value } });
              }}
              onBlur={handleBlur('riderId')}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                maxLength: 12
              }}
              margin="normal"
              required
              variant="outlined"
              error={touched.riderId && formData.riderId.length !== 12}
              helperText={touched.riderId && formData.riderId.length !== 12 ? 'รหัสนักศึกษาต้องมี 12 หลัก (ไม่มากกว่าหรือน้อยกว่า)' : ' '}
            />
            <TextField
              fullWidth
              label="เลขบัตรประชาชน"
              name="riderNationalId"
              value={formData.riderNationalId}
              onChange={(e) => {
                // Only allow numbers and limit to 13 characters
                const value = e.target.value.replace(/\D/g, '').slice(0, 13);
                handleChange({ target: { name: 'riderNationalId', value } });
              }}
              onBlur={handleBlur('riderNationalId')}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                maxLength: 13
              }}
              margin="normal"
              required
              variant="outlined"
              error={touched.riderNationalId && formData.riderNationalId.length !== 13}
              helperText={touched.riderNationalId && formData.riderNationalId.length !== 13 ? 'เลขบัตรประชาชนต้องมี 13 หลัก (ไม่มากกว่าหรือน้อยกว่า)' : ' '}
            />
            <TextField
              fullWidth
              label="ชื่อ"
              name="riderFirstname"
              value={formData.riderFirstname}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="นามสกุล"
              name="riderLastname"
              value={formData.riderLastname}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="อีเมล"
              name="riderEmail"
              type="email"
              value={formData.riderEmail}
              onChange={handleChange}
              onBlur={handleBlur('riderEmail')}
              margin="normal"
              required
              variant="outlined"
              error={touched.riderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.riderEmail)}
              helperText={touched.riderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.riderEmail) ? 'กรุณากรอกอีเมลให้ถูกต้อง' : ' '}
            />
            
            <TextField
              fullWidth
              label="รหัสผ่าน"
              name="riderPass"
              type={showPassword ? 'text' : 'password'}
              value={formData.riderPass}
              onChange={handleChange}
              onBlur={handleBlur('riderPass')}
              margin="normal"
              required
              variant="outlined"
              error={touched.riderPass && formData.riderPass.length < 8}
              helperText={touched.riderPass && formData.riderPass.length < 8 ? 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' : ' '}
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
              name="riderTel"
              value={formData.riderTel}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                handleChange({ target: { name: 'riderTel', value } });
              }}
              onBlur={handleBlur('riderTel')}
              inputProps={{
                inputMode: 'tel',
                pattern: '[0-9]*',
                maxLength: 10
              }}
              margin="normal"
              required
              variant="outlined"
              error={touched.riderTel && formData.riderTel.length !== 10}
              helperText={touched.riderTel && formData.riderTel.length !== 10 ? 'เบอร์โทรศัพท์ต้องมี 10 หลัก' : ' '}
            />
            
            <TextField
              fullWidth
              label="ที่อยู่"
              name="riderAddress"
              value={formData.riderAddress}
              onChange={handleChange}
              onBlur={handleBlur('riderAddress')}
              margin="normal"
              required
              variant="outlined"
              multiline
              rows={3}
              error={touched.riderAddress && formData.riderAddress === ''}
              helperText=" "
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                ภาพโปรไฟล์
              </Typography>
              <input
                accept="image/*"
                type="file"
                name="RiderProfilePic"
                onChange={handleFileChange}
                required
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                บัตรนักศึกษา
              </Typography>
              <input
                accept="image/*"
                type="file"
                name="RiderStudentCard"
                onChange={handleFileChange}
                required
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                QR code ในการชำระเงิน
              </Typography>
              <input
                accept="image/*"
                type="file"
                name="QRscan"
                onChange={handleFileChange}
                required
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                รูปภาพใบขับขี่
              </Typography>
              <input
                accept="image/*"
                type="file"
                name="riderLicense"
                onChange={handleFileChange}
                required
              />
            </Box>
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
          </form>
        </Paper>
        
        <Box mt={5} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} ระบบลงทะเบียนไรเดอร์
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default RiderRegister; 