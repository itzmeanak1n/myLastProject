import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Link,
  Box,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  Divider,
  Modal,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Skeleton,
  Tooltip,
  Zoom,
  Fade,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { riderService } from '../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigationIcon from '@mui/icons-material/Navigation';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import DirectionsIcon from '@mui/icons-material/Directions';
import PaidIcon from '@mui/icons-material/Paid';

const RiderTripDetail = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [distance, setDistance] = useState('');
  const [price, setPrice] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await riderService.getTripDetails(tripId);
        console.log('Trip details:', data);
        setTrip(data);
      } catch (err) {
        console.error('Error fetching trip details:', err);
        setError(err.message || 'ไม่สามารถดึงข้อมูลการเดินทางได้');
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      fetchTripDetails();
    }
  }, [tripId]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const calculatePrice = (distance) => {
    const km = parseFloat(distance) || 0;
    if (km <= 0) return null;
    if (km <= 3) return 15;
    if (km <= 7) return 25;
    if (km <= 12) return 40;
    if (km <= 20) return 60;
    return 60 + Math.ceil((km - 20) / 5) * 10; // 10 บาท ทุกๆ 5 กม. หลังจาก 20 กม.
  };

  const handleDistanceChange = (e) => {
    const value = e.target.value;
    setDistance(value);
    setPrice(calculatePrice(value));
  };

  const handleOpenCompleteDialog = () => {
    setShowCompleteDialog(true);
  };

  const handleCloseCompleteDialog = () => {
    setShowCompleteDialog(false);
    setDistance('');
    setPrice(null);
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  const handleCompleteTrip = async () => {
    try {
      setLoading(true);
      const response = await riderService.completeTrip(tripId);
      if (response.success) {
        // อัพเดทข้อมูลทริปในหน้าจอ
        const updatedTrip = { ...trip, status: 'success' };
        setTrip(updatedTrip);
        handleCloseCompleteDialog();
      }
    } catch (err) {
      setError(err.message || 'ไม่สามารถจบงานได้');
    } finally {
      setLoading(false);
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Skeleton variant="rectangular" width={120} height={40} sx={{ mb: 3, borderRadius: 1 }} />
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} key={item}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="80%" height={32} />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 4 }}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Box>
          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} variant="rectangular" width={160} height={40} sx={{ borderRadius: 1 }} />
            ))}
          </Box>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/rider')}
        >
          กลับไปหน้าหลัก
        </Button>
      </Container>
    );
  }

  if (!trip) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">ไม่พบข้อมูลการเดินทาง</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/rider')}
          sx={{ mt: 2 }}
        >
          กลับไปหน้าหลัก
        </Button>
      </Container>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'รอการตอบรับ';
      case 'accepted':
        return 'รับงานแล้ว';
      case 'completed':
        return 'เสร็จสิ้น';
      case 'cancelled':
        return 'ยกเลิก';
      default:
        return status;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashboard/rider')}
        sx={{ 
          mb: 2,
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateX(-4px)',
            backgroundColor: 'action.hover'
          }
        }}
        variant="outlined"
      >
        กลับไปหน้าหลัก
      </Button>

      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 30px 0 rgba(0,0,0,0.1)'
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            รายละเอียดการเดินทาง
          </Typography>
          <Box 
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 4,
              bgcolor: `${getStatusColor(trip.status)}.light`,
              color: `${getStatusColor(trip.status)}.contrastText`,
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {getStatusText(trip.status)}
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" sx={{ height: '100%', borderRadius: 2, borderLeft: '4px solid', borderLeftColor: 'primary.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTimeIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    วันที่และเวลา
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatDate(trip.date)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {trip.isRoundTrip ? 'ไป-กลับ' : 'เที่ยวเดียว'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              ต้นทาง
            </Typography>
            <Typography variant="body1">
              {trip.pickUpName || '-'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              ปลายทาง
            </Typography>
            <Typography variant="body1">
              {trip.destinationName || '-'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              ชื่อ-นามสกุล ผู้โดยสาร
            </Typography>
            <Typography variant="body1">
              {trip.studentName || '-'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              เบอร์โทรศัพท์
            </Typography>
            {trip.studentTel ? (
              <Link 
                href={`tel:${trip.studentTel}`} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
              >
                <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                {trip.studentTel}
              </Link>
            ) : (
              <Typography variant="body1">-</Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              สถานะ
            </Typography>
            <Typography variant="body1" color={
              trip.status === 'pending' ? 'warning.main' :
              trip.status === 'accepted' ? 'success.main' :
              'text.primary'
            }>
              {trip.status === 'pending' ? 'รอการตอบรับ' :
               trip.status === 'accepted' ? 'รับงานแล้ว' :
               trip.status}
            </Typography>
          </Grid>
        </Grid>

        {/* Location Photos Container */}
        <Paper 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            mt: 3, 
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ 
              width: 24, 
              height: 24, 
              bgcolor: 'primary.main', 
              borderRadius: '50%', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              mr: 1.5,
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}>
              {trip.pickUpPics?.length + trip.destinationPics?.length || 0}
            </Box>
            รูปภาพสถานที่
          </Typography>
          
          <Grid container spacing={3}>
            {[
              { 
                title: 'จุดนัดรับ', 
                name: trip.pickUpName, 
                pics: trip.pickUpPics, 
                color: 'success.main' 
              },
              { 
                title: 'จุดหมายปลายทาง', 
                name: trip.destinationName, 
                pics: trip.destinationPics, 
                color: 'error.main' 
              }
            ].map((location, locIndex) => (
              <Grid item xs={12} md={6} key={locIndex}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      bgcolor: location.color, 
                      borderRadius: '50%', 
                      mr: 1.5 
                    }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {location.title}
                    </Typography>
                    {location.name && (
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({location.name})
                      </Typography>
                    )}
                  </Box>
                  
                  {location.pics && location.pics.length > 0 ? (
                    <Box sx={{ 
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: 'repeat(2, 1fr)',
                        sm: 'repeat(3, 1fr)'
                      },
                      gap: 1.5
                    }}>
                      {location.pics.map((pic, index) => (
                        <Fade in={true} key={index} timeout={300 + (index * 100)}>
                          <Box 
                            onClick={() => handleImageClick(pic)}
                            sx={{
                              position: 'relative',
                              borderRadius: 2,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              aspectRatio: '1',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 3,
                                '&::after': {
                                  opacity: 1
                                }
                              },
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,0,0,0.2)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                borderRadius: 'inherit'
                              }
                            }}
                          >
                            <Box
                              component="img"
                              src={pic}
                              alt={`${location.title} ${index + 1}`}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                              }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 8,
                                right: 8,
                                bgcolor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                borderRadius: 1,
                                px: 1,
                                py: 0.5,
                                fontSize: '0.7rem',
                                zIndex: 1
                              }}
                            >
                              ภาพที่ {index + 1}
                            </Box>
                          </Box>
                        </Fade>
                      ))}
                    </Box>
                  ) : (
                    <Box 
                      sx={{ 
                        p: 3, 
                        textAlign: 'center', 
                        bgcolor: 'background.default', 
                        borderRadius: 2,
                        border: '1px dashed',
                        borderColor: 'divider'
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        ไม่มีรูปภาพ{location.title.toLowerCase()}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Box 
          sx={{ 
            mt: 4, 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap',
            '& > *': {
              flex: '1 1 auto',
              minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: 'auto' },
              whiteSpace: 'nowrap'
            }
          }}
        >
          {trip.pickUpLink && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<NavigationIcon />}
              onClick={() => window.open(trip.pickUpLink, '_blank')}
              size={isMobile ? 'large' : 'medium'}
              sx={{
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>นำทางไปยัง</Box> ต้นทาง
            </Button>
          )}

          {trip.destinationLink && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<NavigationIcon />}
              onClick={() => window.open(trip.destinationLink, '_blank')}
              size={isMobile ? 'large' : 'medium'}
              sx={{
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>นำทางไปยัง</Box> ปลายทาง
            </Button>
          )}

          {trip.riderQRscan && (
            <Tooltip title="แสดง QR Code สำหรับชำระเงิน" arrow TransitionComponent={Zoom}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<QrCode2Icon />}
                onClick={() => setShowQR(true)}
                size={isMobile ? 'large' : 'medium'}
                sx={{
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2
                  }
                }}
              >
                QR Code ชำระเงิน
              </Button>
            </Tooltip>
          )}

          {trip.status === 'accepted' && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleOpenCompleteDialog}
              size={isMobile ? 'large' : 'medium'}
              sx={{
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2,
                  backgroundColor: 'success.dark'
                }
              }}
            >
              จบงาน
            </Button>
          )}
        </Box>
      </Paper>

      <Dialog open={showQR} onClose={() => setShowQR(false)}>
        <DialogContent>
          {trip?.riderQRscan ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img 
                src={trip.riderQRscan}
                alt="QR Code ชำระเงิน"
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px'
                }}
                onError={(e) => {
                  console.error('Error loading QR code:', e);
                  console.log('QR code path:', trip.riderQRscan);
                  e.target.style.display = 'none';
                }}
              />
              <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                QR Code สำหรับชำระเงิน
              </Typography>
            </Box>
          ) : (
            <Typography>ไม่พบ QR Code</Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Complete Trip Dialog */}
      <Dialog 
        open={showCompleteDialog} 
        onClose={handleCloseCompleteDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'visible'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          borderTopLeftRadius: 'inherit',
          borderTopRightRadius: 'inherit',
          py: 2,
          '& .MuiTypography-root': {
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            '&:before': {
              content: '""',
              display: 'inline-block',
              width: 24,
              height: 24,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'%23fff\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z\'/%3E%3C/svg%3E")',
              backgroundSize: 'contain',
              marginRight: 1
            }
          }
        }}>
          ยืนยันการจบงาน
        </DialogTitle>
        <DialogContent sx={{ py: 3, px: 4 }}>
          <Box sx={{ maxWidth: 400, mx: 'auto' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                ระยะทางทั้งหมด (กิโลเมตร)
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                type="number"
                value={distance}
                onChange={handleDistanceChange}
                inputProps={{ 
                  min: 0, 
                  step: 0.1,
                  inputMode: 'decimal',
                  pattern: '[0-9]*[.,]?[0-9]*'
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      boxShadow: '0 0 0 2px rgba(63, 81, 181, 0.2)'
                    }
                  }
                }}
                InputProps={{
                  endAdornment: <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>กม.</Typography>,
                  sx: { pr: 1 }
                }}
              />
            </Box>
            
            {price !== null && (
              <Fade in={true} timeout={500}>
                <Box sx={{ 
                  mt: 3,
                  p: 3,
                  bgcolor: 'success.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'success.100',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: 4,
                    bgcolor: 'success.main'
                  }
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontWeight: 500 }}>
                      ราคาที่เรียกเก็บ
                    </Typography>
                    <Box sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      bgcolor: 'success.light',
                      color: 'success.dark',
                      px: 2,
                      py: 1,
                      borderRadius: 4,
                      mb: 1
                    }}>
                      <PaidIcon sx={{ fontSize: 20, mr: 0.5 }} />
                      <Typography variant="h5" component="span" sx={{ fontWeight: 700, lineHeight: 1 }}>
                        {price} บาท
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 0.5 }}>
                      {distance <= 3 ? 'ระยะทาง 1-3 กิโลเมตร' : 
                       distance <= 7 ? 'ระยะทาง 4-7 กิโลเมตร' :
                       distance <= 12 ? 'ระยะทาง 8-12 กิโลเมตร' :
                       'ระยะทาง 13 กิโลเมตรขึ้นไป'}
                    </Typography>
                    
                    <Box sx={{ 
                      mt: 2,
                      p: 1.5,
                      bgcolor: 'background.paper',
                      borderRadius: 1.5,
                      border: '1px dashed',
                      borderColor: 'divider'
                    }}>
                      <Typography variant="caption" color="error" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box component="span" sx={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          bgcolor: 'error.main',
                          color: 'white',
                          fontSize: '0.7rem',
                          mr: 1,
                          flexShrink: 0
                        }}>
                          !
                        </Box>
                        คิดคำนวณจากระยะทาง ต้นทาง-ปลายทางเท่านั้น
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                        *ไม่รวมระยะการเดินทางไปรับ
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Fade>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider', borderBottomLeftRadius: 'inherit', borderBottomRightRadius: 'inherit' }}>
          <Button 
            onClick={handleCloseCompleteDialog} 
            color="inherit"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'text.secondary'
              }
            }}
          >
            ยกเลิก
          </Button>
          <Button 
            onClick={handleCompleteTrip} 
            variant="contained" 
            color="success"
            disabled={!distance || price === null}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                bgcolor: 'success.dark'
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'text.disabled'
              }
            }}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'กำลังดำเนินการ...' : 'ยืนยันการจบงาน'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Modal */}
      <Modal
        open={imageModalOpen}
        onClose={handleCloseImageModal}
        aria-labelledby="image-modal-title"
        aria-describedby="image-modal-description"
        closeAfterTransition
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(4px)'
          }
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
          p: { xs: 1, sm: 2 },
        }}
      >
        <Fade in={imageModalOpen} timeout={300}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: '1200px',
              maxHeight: '90vh',
              bgcolor: 'background.paper',
              boxShadow: 24,
              borderRadius: 2,
              overflow: 'hidden',
              outline: 'none',
              display: 'flex',
              flexDirection: 'column',
              '&:focus-visible': {
                outline: 'none'
              }
            }}
          >
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              p: 1,
              bgcolor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'flex-end',
              zIndex: 1
            }}>
              <Tooltip title="ปิด (Esc)" arrow>
                <IconButton
                  aria-label="close"
                  onClick={handleCloseImageModal}
                  sx={{
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: { xs: 1, sm: 2 },
              overflow: 'auto',
              '& img': {
                maxWidth: '100%',
                maxHeight: 'calc(90vh - 48px)',
                objectFit: 'contain',
                borderRadius: 1,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }
            }}>
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Enlarged view"
                  loading="lazy"
                />
              )}
            </Box>
            
            <Box sx={{ 
              p: 1.5, 
              bgcolor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider',
              textAlign: 'center'
            }}>
              <Typography variant="caption" color="text.secondary">
                กดปุ่ม ESC หรือคลิกที่ปุ่ม X เพื่อปิด
              </Typography>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
};

export default RiderTripDetail;