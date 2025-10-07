import React, { useState, useEffect, useCallback } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import LockResetIcon from '@mui/icons-material/LockReset';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  Link as MuiLink,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VpnKey as VpnKeyIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  PersonOff as PersonOffIcon,
} from '@mui/icons-material';
import { Chip, Pagination } from '@mui/material';
import axios from 'axios';

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+';

function AdminDashboard() {
  const { user, profile, logout, auth } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState(3);
  const [reports, setReports] = useState({
    totalStudents: 0,
    totalRiders: 0,
    totalPlaces: 0,
    activeTrips: 0,
    completedTrips: 0,
    cancelledTrips: 0,
    recentTrips: []
  });
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [students, setStudents] = useState(() => {
    try {
      // If there's any initialization needed, do it here
      return [];
    } catch (error) {
      console.error('Error initializing students state:', error);
      return [];
    }
  });
  const [riders, setRiders] = useState([]);
  // Riders state
  const [isLoadingRiders, setIsLoadingRiders] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [openRiderDialog, setOpenRiderDialog] = useState(false);
  const [openRiderFormDialog, setOpenRiderFormDialog] = useState(false);
  const [currentRiderFormData, setCurrentRiderFormData] = useState(null);
  const [riderFormError, setRiderFormError] = useState('');
  const [riderSortOrder, setRiderSortOrder] = useState('none'); // 'none', 'asc', 'desc'
  const [initialRiderFormState, setInitialRiderFormState] = useState({
    riderNationalId: '',
    riderFirstname: '',
    riderLastname: '',
    riderEmail: '',
    riderAddress: '',
    riderLicense: '',
    status: 'pending',
  });
  
  // State for vehicle management
  const [vehicles, setVehicles] = useState([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [vehiclesError, setVehiclesError] = useState('');

  // Function to fetch vehicles
  const fetchVehicles = useCallback(async (force = false) => {
    if (!selectedRider?.riderId) return;
    
    setIsLoadingVehicles(true);
    setVehiclesError('');
    try {
      const response = await adminService.getRiderVehicles(selectedRider.riderId);
      if (response.data) {
        setVehicles(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      enqueueSnackbar('เกิดข้อผิดพลาดในการโหลดข้อมูลยานพาหนะ', { variant: 'error' });
      setVehiclesError('ไม่สามารถโหลดข้อมูลยานพาหนะได้');
    } finally {
      setIsLoadingVehicles(false);
    }
  }, [selectedRider?.riderId, enqueueSnackbar]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [places, setPlaces] = useState([]);
  const [placesError, setPlacesError] = useState('');
  const [openPlaceDialog, setOpenPlaceDialog] = useState(false);
  const [currentPlace, setCurrentPlace] = useState(null);
  const [placeFormData, setPlaceFormData] = useState({
    placeName: '',
    link: ''
  });
  const [placeFile, setPlaceFile] = useState(null);
  
  // Vehicle state
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [vehicleFormData, setVehicleFormData] = useState({
    carType: '',
    plate: '',
    brand: '',
    model: '',
    insurancePhoto: null,
    carPhoto: null
  });
  
  const [vehicleFiles, setVehicleFiles] = useState({
    carPhoto: null,
    insurancePhoto: null
  });
  
  // Reset password state
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [riderToReset, setRiderToReset] = useState(null);
  const navigate = useNavigate();

  const getImageUrl = useCallback((filename) => {
    if (!filename) return defaultAvatar;

    // ถ้าเป็น URL เต็มให้ใช้เลย
    if (filename.startsWith('http')) {
      return filename;
    }

    // แปลง \ เป็น /
    const normalizedPath = filename.replace(/\\/g, '/');

    // ถ้าไม่มี uploads/ นำหน้า ให้เพิ่มเข้าไป
    if (!normalizedPath.startsWith('uploads/')) {
      return `http://localhost:5000/uploads/${normalizedPath}`;
    }
    return `http://localhost:5000/${normalizedPath}`;
  }, []);

  const getVehicleImageUrl = useCallback((filename) => {
    if (!filename) return defaultAvatar;

    // ถ้าเป็น URL เต็มให้ใช้เลย
    if (filename.startsWith('http')) {
      return filename;
    }

    // แปลง \ เป็น /
    const normalizedPath = filename.replace(/\\/g, '/');

    // ถ้าไม่มี uploads/vehicles/ นำหน้า ให้เพิ่มเข้าไป
    if (!normalizedPath.startsWith('uploads/vehicles/')) {
      return `http://localhost:5000/uploads/vehicles/${normalizedPath}`;
    }
    return `http://localhost:5000/${normalizedPath}`;
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        console.log('Fetching students...');
        setIsLoadingStudents(true);

        // Make the API call
        const response = await adminService.getStudents();

        // Log the raw response for debugging
        console.log('Raw API Response:', response);

        // The backend directly returns the array of students
        if (Array.isArray(response.data)) {
          console.log('Students data received:', response.data);
          setStudents(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          // In case the data is nested under a data property
          console.log('Nested students data received:', response.data.data);
          setStudents(response.data.data);
        } else {
          console.error('Unexpected response format:', response);
          enqueueSnackbar('รูปแบบข้อมูลนักศึกษาไม่ถูกต้อง', { variant: 'error' });
          setStudents([]);
        }
      } catch (error) {
        console.error('Error fetching students:', error);

        // More detailed error logging
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response data:', error.response.data);
          console.error('Error status:', error.response.status);
          console.error('Error headers:', error.response.headers);

          if (error.response.status === 401) {
            enqueueSnackbar('กรุณาลงชื่อเข้าใช้ใหม่', { variant: 'error' });
            // Optionally redirect to login
            // navigate('/login');
          } else if (error.response.status === 403) {
            enqueueSnackbar('คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้', { variant: 'error' });
          } else {
            enqueueSnackbar(`เกิดข้อผิดพลาด: ${error.response.data?.message || 'ไม่สามารถโหลดข้อมูลนักศึกษาได้'}`, {
              variant: 'error',
              autoHideDuration: 5000
            });
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          enqueueSnackbar('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', {
            variant: 'error',
            autoHideDuration: 5000
          });
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Request setup error:', error.message);
          enqueueSnackbar(`เกิดข้อผิดพลาด: ${error.message}`, {
            variant: 'error',
            autoHideDuration: 5000
          });
        }

        setStudents([]);
      } finally {
        console.log('Finished loading students');
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    if (tab === 0) {
      fetchStudents();
    } else if (tab === 1) {
      fetchRiders();
    } else if (tab === 2) {
      fetchPlaces();
    } else if (tab === 3) {
      fetchReports();
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const studentsRes = await adminService.getStudents();
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      enqueueSnackbar('เกิดข้อผิดพลาดในการโหลดข้อมูลนักศึกษา', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const sortRiders = (ridersList, sortOrder) => {
    if (sortOrder === 'none') return [...ridersList];
    
    return [...ridersList].sort((a, b) => {
      const rateA = parseFloat(a.riderRate) || 0;
      const rateB = parseFloat(b.riderRate) || 0;
      return sortOrder === 'asc' ? rateA - rateB : rateB - rateA;
    });
  };

  const fetchRiders = async () => {
    setIsLoadingRiders(true);
    try {
      const ridersRes = await adminService.getRiders();
      const sortedRiders = sortRiders(ridersRes.data, riderSortOrder);
      setRiders(sortedRiders);
    } catch (error) {
      console.error('Error fetching riders:', error);
      enqueueSnackbar('เกิดข้อผิดพลาดในการโหลดข้อมูลไรเดอร์', { variant: 'error' });
    } finally {
      setIsLoadingRiders(false);
    }
  };

  const fetchPlaces = async () => {
    setIsLoadingPlaces(true);
    setPlacesError('');
    try {
      const response = await adminService.getPlaces();
      setPlaces(response.data);
    } catch (error) {
      console.error('Error fetching places:', error);
      setPlacesError('ไม่สามารถโหลดข้อมูลสถานที่ได้');
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  const fetchReports = useCallback(async () => {
    setIsLoadingReports(true);
    try {
      // Fetch reports data
      const reportsResponse = await adminService.getReports();
      const { data: reportsData } = reportsResponse.data;

      // Fetch places count
      let totalPlaces = 0;
      try {
        const placesResponse = await adminService.getPlacesCount();
        totalPlaces = placesResponse.data?.total || 0;
      } catch (placesError) {
        console.error('Error fetching places count:', placesError);
        // Continue with default value of 0 if there's an error
      }

      setReports({
        totalStudents: reportsData?.totalStudents || 0,
        totalRiders: reportsData?.totalRiders || 0,
        totalPlaces: totalPlaces,
        activeTrips: reportsData?.activeTrips || 0,
        completedTrips: reportsData?.completedTrips || 0,
        cancelledTrips: reportsData?.cancelledTrips || 0,
        recentTrips: reportsData?.recentTrips || []
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      enqueueSnackbar('เกิดข้อผิดพลาดในการโหลดรายงาน', { variant: 'error' });
    } finally {
      setIsLoadingReports(false);
    }
  }, [enqueueSnackbar]);

  const handleApproveRider = async (riderId) => {
    try {
      await adminService.approveRider(riderId);
      fetchData();
    } catch (error) {
      console.error('Error approving rider:', error);
    }
  };

  const handleViewRider = (rider) => {
    setSelectedRider(rider);
    setOpenRiderDialog(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenRiderFormDialog = (rider = null) => {
    setRiderFormError('');
    if (rider) {
      setCurrentRiderFormData({
        riderId: rider.riderId,
        riderNationalId: rider.riderNationalId || '',
        riderFirstname: rider.riderFirstname || '',
        riderLastname: rider.riderLastname || '',
        riderEmail: rider.riderEmail || '',
        riderPass: '',
        riderTel: rider.riderTel || '',
        riderAddress: rider.riderAddress || '',
        riderLicense: rider.riderLicense || '',
        status: rider.status || 'pending',
      });
    } else {
      setCurrentRiderFormData(initialRiderFormState);
    }
    setOpenRiderFormDialog(true);
  };

  const handleCloseRiderFormDialog = () => {
    setOpenRiderFormDialog(false);
    setCurrentRiderFormData(null);
    setRiderFormError('');
  };

  const handleRiderFormChange = (e) => {
    setCurrentRiderFormData({
      ...currentRiderFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRiderFormSubmit = async (e) => {
    e.preventDefault();
    setRiderFormError('');
    const riderData = { ...currentRiderFormData };

    const { riderId, ...dataToSend } = riderData;

    if (currentRiderFormData.riderId && !dataToSend.riderPass) {
      delete dataToSend.riderPass;
    }

    try {
      if (currentRiderFormData.riderId) {
        await adminService.updateRider(currentRiderFormData.riderId, dataToSend);
      } else {
        if (!dataToSend.riderPass) {
          setRiderFormError('กรุณากำหนดรหัสผ่านสำหรับไรเดอร์ใหม่');
          return;
        }
        await adminService.createRider(dataToSend);
      }
      handleCloseRiderFormDialog();
      fetchData();
    } catch (err) {
      console.error('Error submitting rider form:', err);
      setRiderFormError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDeleteRider = async (riderId) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบไรเดอร์นี้? (ข้อมูลที่เกี่ยวข้องอาจได้รับผลกระทบ)')) {
      try {
        // แปลง riderId เป็น string ก่อนส่ง
        const response = await adminService.deleteRider(riderId.toString());
        console.log('Delete response:', response);

        // สำเร็จ
        console.log('Rider deleted successfully');
        fetchData(); // รีเฟรชข้อมูล
      } catch (err) {
        console.error('Error deleting rider:', err);
        const errorMessage = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการลบไรเดอร์';
        alert(errorMessage);
      }
    }
  };

  // State สำหรับจัดการฟอร์มนักศึกษา
  const [openStudentFormDialog, setOpenStudentFormDialog] = useState(false);
  const [currentStudentFormData, setCurrentStudentFormData] = useState(null);
  const [studentFormError, setStudentFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const initialStudentFormState = {
    studentId: '',
    userFirstname: '',
    userLastname: '',
    userEmail: '',
    userPass: '',
    userTel: '',
  };

  // State to store original email when editing
  const [originalEmail, setOriginalEmail] = useState('');

  // ฟังก์ชันสำหรับจัดการฟอร์มนักศึกษา
  const handleOpenStudentFormDialog = (student = null) => {
    setStudentFormError('');
    if (student) {
      // Store the original email separately
      setOriginalEmail(student.userEmail || '');
      setCurrentStudentFormData({
        studentId: student.studentId,
        userFirstname: student.userFirstname || '',
        userLastname: student.userLastname || '',
        userEmail: student.userEmail || '', // Keep email in form data for display
        userTel: student.userTel || '',
        userAddress: student.userAddress || '',
      });
    } else {
      setCurrentStudentFormData(initialStudentFormState);
    }
    setOpenStudentFormDialog(true);
  };

  const handleCloseStudentFormDialog = () => {
    setOpenStudentFormDialog(false);
    setCurrentStudentFormData(null);
    setOriginalEmail('');
    setStudentFormError('');
  };

  const handleStudentFormChange = (e) => {
    setCurrentStudentFormData({
      ...currentStudentFormData,
      [e.target.name]: e.target.value,
    });
  };

  // Open reset password dialog for rider or student
  const handleOpenResetPassword = (id, isStudent = false) => {
    if (!id) {
      enqueueSnackbar('ไม่พบรหัสผู้ใช้', { variant: 'error' });
      return;
    }

    if (isStudent) {
      const student = students.find(s => s.studentId === id);
      if (!student) {
        enqueueSnackbar('ไม่พบข้อมูลนักศึกษา', { variant: 'error' });
        return;
      }
      // Convert student to rider format for the dialog
      setRiderToReset({
        studentId: student.studentId,
        riderFirstname: student.userFirstname,
        riderLastname: student.userLastname,
        isStudent: true // Add isStudent flag
      });
    } else {
      const rider = riders.find(r => r.riderId === id);
      if (!rider) {
        enqueueSnackbar('ไม่พบข้อมูลไรเดอร์', { variant: 'error' });
        return;
      }
      setRiderToReset({
        ...rider,
        isStudent: false // Explicitly set isStudent to false for riders
      });
    }

    setResetPasswordOpen(true);
  };

  // Close reset password dialog
  const handleCloseResetPassword = () => {
    setResetPasswordOpen(false);
    setRiderToReset(null);
  };


  const handleStudentFormSubmit = async (e) => {
    e.preventDefault();
    setStudentFormError('');
    
    // Create a copy of the form data
    const studentData = { ...currentStudentFormData };
    const currentEmail = studentData.userEmail; // Save the current email

    try {
      if (studentData.studentId) {
        // For existing students, create update data without email
        const updateData = {
          userFirstname: studentData.userFirstname,
          userLastname: studentData.userLastname,
          userTel: studentData.userTel,
          userAddress: studentData.userAddress,
          // Include email in the request but backend will ignore it
          userEmail: currentEmail 
        };
        
        // Remove password if empty
        if (!studentData.userPass) {
          delete updateData.userPass;
        }
        
        // Update the student and get the response
        const response = await adminService.updateStudent(studentData.studentId, updateData);
        
        if (response && response.data && response.data.student) {
          // Update the students list with the updated student data from the server
          setStudents(prevStudents => 
            prevStudents.map(s => 
              s.studentId === studentData.studentId ? response.data.student : s
            )
          );
        } else {
          // Fallback to local state if server response is unexpected
          const updatedStudent = {
            ...studentData,
            userEmail: currentEmail
          };
          setStudents(prevStudents => 
            prevStudents.map(s => 
              s.studentId === studentData.studentId ? updatedStudent : s
            )
          );
        }
      } else {
        // For new students, ensure password is provided
        if (!studentData.userPass) {
          setStudentFormError('กรุณากำหนดรหัสผ่านสำหรับนักศึกษาใหม่');
          return;
        }
        await adminService.createStudent(studentData);
      }
      
      // Show success message
      enqueueSnackbar('บันทึกข้อมูลสำเร็จ', { variant: 'success' });
      
      // Close the dialog
      handleCloseStudentFormDialog();
      
      // Refresh the data
      await fetchStudents();
    } catch (err) {
      console.error('Error submitting student form:', err);
      setStudentFormError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!studentId) {
      console.error('No student ID provided for deletion');
      enqueueSnackbar('ไม่พบรหัสนักศึกษา', { variant: 'error' });
      return;
    }
    
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบนักศึกษาคนนี้?')) {
      try {
        console.log('Deleting student with ID:', studentId);
        await adminService.deleteStudent(studentId.toString());
        enqueueSnackbar('ลบนักศึกษาสำเร็จ', { variant: 'success' });
        fetchData();
      } catch (err) {
        console.error('Error deleting student:', err);
        enqueueSnackbar(
          err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบนักศึกษา', 
          { variant: 'error' }
        );
        alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบนักศึกษา');
      }
    }
  };

  const renderStudentsTable = () => {
    console.log('Students data:', students);
    return (
      <Box>
      {/* Header Section */}


      {/* Statistics Cards */}


      {/* Students Grid */}
      {isLoadingStudents ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={40} />
          <Typography sx={{ ml: 2 }}>Loading students...</Typography>
        </Box>
      ) : !Array.isArray(students) || students.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            📚 No Students Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            There are no students registered in the system yet.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenStudentFormDialog()}
          >
            Add First Student
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {students.map((student) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={student.studentId}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Student Avatar */}
                  {/* Add this right before the Avatar component */}
                  {console.log('Student Object:', JSON.stringify(student, null, 2))}

                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
  <Avatar
    src={student?.userprofilepic ? `${process.env.REACT_APP_API_URL}${student.userprofilepic}` : undefined}
    alt={`${student.userFirstname || ''} ${student.userLastname || ''}`}
    sx={{ 
      width: 80, 
      height: 80,
      border: '2px solid',
      borderColor: 'primary.main',
      fontSize: '2rem',
      bgcolor: student?.userprofilepic ? 'transparent' : 'primary.main',
      color: 'white',
      '& .MuiAvatar-img': {
        objectFit: 'cover',
        width: '100%',
        height: '100%'
      }
    }}
  >
    {!student?.userprofilepic && (
      <Box component="span" sx={{ fontSize: '2rem' }}>
        {`${student?.userFirstname?.[0]?.toUpperCase() || ''}${student?.userLastname?.[0]?.toUpperCase() || ''}`}
      </Box>
    )}
  </Avatar>
</Box>
                  {/* Student Info */}
                  <Typography variant="h6" sx={{ textAlign: 'center', mb: 1, fontWeight: 'bold' }}>
                    {student.userFirstname || ''} {student.userLastname || ''}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
                    {student.studentId || 'No ID'}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
                        📧
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {student.userEmail || 'No email'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
                        📱
                      </Typography>
                      <Typography variant="body2">
                        {student.userTel || 'No phone'}
                      </Typography>
                    </Box>


                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="Edit Student">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenStudentFormDialog(student)}
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.main' }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset Password">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => handleOpenResetPassword(student.studentId, true)}
                        sx={{
                          bgcolor: 'warning.light',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'warning.dark',
                          },
                          mr: 1,
                        }}
                      >
                        <LockResetIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete Student">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteStudent(student.studentId)}
                        sx={{
                          bgcolor: 'error.light',
                          color: 'white',
                          '&:hover': { bgcolor: 'error.main' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Student Dialog */}
      <Dialog open={openStudentFormDialog} onClose={handleCloseStudentFormDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {currentStudentFormData?.studentId ? '✏️ Edit Student' : '➕ Add New Student'}
          </Typography>
        </DialogTitle>
        <form onSubmit={handleStudentFormSubmit}>
          <DialogContent sx={{ p: 3 }}>
            {studentFormError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {studentFormError}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="studentId"
                  label="Student ID"
                  fullWidth
                  value={currentStudentFormData?.studentId || ''}
                  onChange={handleStudentFormChange}
                  margin="normal"
                  required
                  variant="outlined"
                  InputProps={{
                    readOnly: !!currentStudentFormData?.studentId,
                    sx: currentStudentFormData?.studentId ? {
                      '& .MuiOutlinedInput-input': {
                        color: 'text.secondary',
                        fontWeight: 500
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.12)'
                      }
                    } : {}
                  }}
                  helperText={currentStudentFormData?.studentId ? "Student ID cannot be changed" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="userFirstname"
                  label="First Name"
                  fullWidth
                  value={currentStudentFormData?.userFirstname || ''}
                  onChange={handleStudentFormChange}
                  margin="normal"
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="userLastname"
                  label="Last Name"
                  fullWidth
                  value={currentStudentFormData?.userLastname || ''}
                  onChange={handleStudentFormChange}
                  margin="normal"
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="userEmail"
                  label="Email"
                  type="email"
                  fullWidth
                  value={currentStudentFormData?.userEmail || ''}
                  onChange={handleStudentFormChange}
                  margin="normal"
                  required
                  variant="outlined"
                  InputProps={{
                    readOnly: !!currentStudentFormData?.studentId,
                    sx: currentStudentFormData?.studentId ? {
                      '& .MuiOutlinedInput-input': {
                        color: 'text.secondary',
                        fontWeight: 500
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.12)'
                      }
                    } : {}
                  }}
                  helperText={currentStudentFormData?.studentId ? "Email cannot be changed" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                {!currentStudentFormData?.studentId && (
                  <TextField
                    name="userPass"
                    label="Password"
                    type="password"
                    fullWidth
                    value={currentStudentFormData?.userPass || ''}
                    onChange={handleStudentFormChange}
                    margin="normal"
                    required
                    variant="outlined"
                  />
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="userTel"
                  label="Phone Number"
                  fullWidth
                  value={currentStudentFormData?.userTel || ''}
                  onChange={handleStudentFormChange}
                  margin="normal"
                  required
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={handleCloseStudentFormDialog}
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ minWidth: 100 }}
            >
              {currentStudentFormData?.studentId ? 'Save' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
  };

  const handleSortRiders = (order) => {
    setRiderSortOrder(order);
    const sortedRiders = sortRiders(riders, order);
    setRiders(sortedRiders);
  };

  const renderRidersTable = () => {
    console.log('Riders data:', riders);
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">จัดการไรเดอร์</Typography>
          <Box>
            <Button
              variant={riderSortOrder === 'desc' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleSortRiders('desc')}
              sx={{ mr: 1, minWidth: 100 }}
              startIcon={<span>⬇️</span>}
            >
              เรตสูงสุด
            </Button>
            <Button
              variant={riderSortOrder === 'asc' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleSortRiders('asc')}
              sx={{ mr: 1, minWidth: 100 }}
              startIcon={<span>⬆️</span>}
            >
              เรตต่ำสุด
            </Button>
  
          </Box>
        </Box>
        {isLoadingRiders ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={40} />
            <Typography sx={{ ml: 2 }}>Loading riders...</Typography>
          </Box>
        ) : !Array.isArray(riders) || riders.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              🛵 No Riders Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              There are no riders registered in the system yet.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenRiderFormDialog()}
            >
              Add First Rider
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {riders.map((rider) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={rider.riderId}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Rider Avatar */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <Avatar
                        src={rider?.userprofilePic ? `${process.env.REACT_APP_API_URL}${rider.userprofilePic}` : undefined}
                        alt={`${rider.riderFirstname || ''} ${rider.riderLastname || ''}`}
                        sx={{ 
                          width: 80, 
                          height: 80,
                          border: '2px solid',
                          borderColor: 'primary.main',
                          fontSize: '2rem',
                          bgcolor: rider?.userprofilePic ? 'transparent' : 'primary.main',
                          color: 'white',
                          '& .MuiAvatar-img': {
                            objectFit: 'cover',
                            width: '100%',
                            height: '100%'
                          }
                        }}
                      >
                        {!rider?.userprofilePic && (
                          <Box component="span" sx={{ fontSize: '2rem' }}>
                            {`${rider?.riderFirstname?.[0]?.toUpperCase() || ''}${rider?.riderLastname?.[0]?.toUpperCase() || ''}`}
                          </Box>
                        )}
                      </Avatar>
                    </Box>
  
                    {/* Rider Info */}
                    <Typography variant="h6" sx={{ textAlign: 'center', mb: 1, fontWeight: 'bold' }}>
                      {rider.riderFirstname || ''} {rider.riderLastname || ''}
                    </Typography>
  
                    <Box sx={{ textAlign: 'center', mb: 1 }}>
                      <Chip 
                        label={rider.status || 'inactive'}
                        size="small"
                        color={
                          rider.status === 'active' ? 'success' : 
                          rider.status === 'inactive' ? 'error' : 'default'
                        }
                        sx={{ 
                          textTransform: 'capitalize',
                          fontWeight: 500
                        }}
                      />
                    </Box>

                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Typography variant="body2" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        <span style={{ color: '#ffc107' }}>★</span>
                        {rider.riderRate ? `${parseFloat(rider.riderRate).toFixed(1)}/5.0` : 'ยังไม่มีคะแนน'}
                      </Typography>
                    </Box>
  
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1, minWidth: 24 }}>
                          📧
                        </Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                          {rider.riderEmail || 'No email'}
                        </Typography>
                      </Box>
  
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1, minWidth: 24 }}>
                          📱
                        </Typography>
                        <Typography variant="body2">
                          {rider.riderTel || 'No phone'}
                        </Typography>
                      </Box>
                    </Box>
  
                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewRider(rider);
                          }}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenRiderFormDialog(rider);
                          }}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reset Password">
                        <IconButton 
                          size="small" 
                          color="warning"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenResetPassword(rider.riderId);
                          }}
                        >
                          <VpnKeyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRider(rider.riderId);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  const renderPlacesTable = () => (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">จัดการสถานที่</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenPlaceDialog()}
        >
          เพิ่มสถานที่
        </Button>
      </Box>
      {placesError && <Alert severity="error" sx={{ mb: 2 }}>{placesError}</Alert>}
      {isLoadingPlaces ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      ) : places.length === 0 ? (
        <Typography>ยังไม่มีข้อมูลสถานที่</Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '10%' }}>รูปภาพ</TableCell>
                <TableCell sx={{ width: '30%' }}>ชื่อสถานที่</TableCell>
                <TableCell sx={{ width: '40%' }}>ลิงก์ Google Maps</TableCell>
                <TableCell sx={{ width: '20%' }} align="right">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {places.map((place) => (
                <TableRow key={place.placeId}>
                  <TableCell>
                    {place.pics ? (
                      <img
                        src={getImageUrl(place.pics)}
                        alt={place.placeName}
                        style={{ height: 40, width: 'auto', objectFit: 'contain' }}
                      />
                    ) : (
                      <Box sx={{ height: 40, width: 40, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" color="text.secondary">ไม่มีรูป</Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>{place.placeName}</TableCell>
                  <TableCell>
                    {place.link ? (
                      <MuiLink href={place.link} target="_blank" rel="noopener noreferrer">
                        {place.link}
                      </MuiLink>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="แก้ไข">
                      <IconButton size="small" onClick={() => handleOpenPlaceDialog(place)} sx={{ mr: 1 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="ลบ">
                      <IconButton size="small" color="error" onClick={() => handleDeletePlace(place.placeId)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );

  const handleOpenPlaceDialog = (place = null) => {
    setPlacesError('');
    setCurrentPlace(place);
    if (place) {
      setPlaceFormData({
        placeName: place.placeName || '',
        link: place.link || '',
      });
    } else {
      setPlaceFormData({ placeName: '', link: '' });
    }
    setPlaceFile(null);
    setOpenPlaceDialog(true);
  };

  const handleClosePlaceDialog = () => {
    setOpenPlaceDialog(false);
    setCurrentPlace(null);
    setPlaceFormData({ placeName: '', link: '' });
    setPlaceFile(null);
    setPlacesError('');
  };

  const handlePlaceFormChange = (e) => {
    setPlaceFormData({ ...placeFormData, [e.target.name]: e.target.value });
  };

  const handlePlaceFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPlaceFile(e.target.files[0]);
    }
  };

  const handlePlaceSubmit = async (e) => {
    e.preventDefault();
    setPlacesError('');

    // ตรวจสอบข้อมูล
    if (!placeFormData.placeName.trim()) {
      setPlacesError('กรุณากรอกชื่อสถานที่');
      return;
    }

    const formData = new FormData();
    formData.append('placeName', placeFormData.placeName.trim());
    formData.append('link', placeFormData.link.trim() || '');

    // ตรวจสอบและเพิ่มรูปภาพ
    if (placeFile) {
      // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
      if (placeFile.size > 5 * 1024 * 1024) {
        setPlacesError('ขนาดไฟล์รูปภาพต้องไม่เกิน 5MB');
        return;
      }
      // ตรวจสอบประเภทไฟล์
      if (!placeFile.type.startsWith('image/')) {
        setPlacesError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }
      formData.append('pics', placeFile);
    }

    try {
      if (currentPlace) {
        await adminService.updatePlace(currentPlace.placeId, formData);
      } else {
        await adminService.addPlace(formData);
      }
      handleClosePlaceDialog();
      fetchPlaces();
    } catch (error) {
      console.error('Error submitting place:', error);
      setPlacesError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลสถานที่');
    }
  };

  const renderReportsSection = () => {
    if (isLoadingReports) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          ภาพรวมระบบ
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
              <Typography variant="h6">นักศึกษาทั้งหมด</Typography>
              <Typography variant="h4">{reports.totalStudents}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'secondary.light', color: 'white' }}>
              <Typography variant="h6">ไรเดอร์ทั้งหมด</Typography>
              <Typography variant="h4">{reports.totalRiders}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'info.main', color: 'white' }}>
              <Typography variant="h6" color="inherit">จำนวนสถานที่</Typography>
              <Typography variant="h4" color="inherit">{reports.totalPlaces || 0}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'info.main', color: 'white' }}>
              <Typography variant="h6" color="inherit">การเดินทางที่กำลังดำเนินการ</Typography>
              <Typography variant="h4" color="inherit">{reports.activeTrips}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'white' }}>
              <Typography variant="h6">การเดินทางที่เสร็จสมบูรณ์</Typography>
              <Typography variant="h4">{reports.completedTrips}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'white' }}>
              <Typography variant="h6">การเดินทางที่ถูกยกเลิก</Typography>
              <Typography variant="h4">{reports.cancelledTrips}</Typography>
            </Paper>
          </Grid>
        </Grid>


        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>การเดินทางล่าสุด</Typography>
            <List dense>
              {reports.recentTrips?.length > 0 ? (
                reports.recentTrips.map((trip, index) => (
                  <ListItem key={trip.tripId || index} divider>
                    <ListItemText
                      primary={
                        <>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon fontSize="small" />
                            <span>{`${trip.userFirstname || ''} ${trip.userLastname || ''}`}</span>
                          </Box>
                          {trip.riderFirstname && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <TwoWheelerIcon fontSize="small" color="primary" />
                              <Typography variant="body2" color="text.secondary">
                                ให้บริการโดย: {`${trip.riderFirstname} ${trip.riderLastname || ''}`}
                              </Typography>
                            </Box>
                          )}
                        </>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {trip.pickupLocation || 'ไม่ระบุจุดรับ'}
                          </Typography>
                          <br />
                          {trip.destination || 'ไม่ระบุจุดหมาย'}
                        </>
                      }
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', ml: 1 }}>
                      {trip.createdAt ? new Date(trip.createdAt).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '--:--'}
                    </Typography>
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  ไม่พบประวัติการเดินทางล่าสุด
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

      </Box>
    );
  };

  const handleDeletePlace = async (placeId) => {
    if (window.confirm('คุณต้องการลบสถานที่นี้ใช่หรือไม่? การลบจะไม่สามารถกู้คืนได้')) {
      setPlacesError('');
      try {
        await adminService.deletePlace(placeId);
        fetchPlaces();
      } catch (error) {
        console.error('Error deleting place:', error);
        setPlacesError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูลสถานที่');
      }
    }
  };

  const handleEditVehicle = (vehicle) => {
    setCurrentVehicle(vehicle);
    setVehicleFormData({
      carType: vehicle.carType,
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model
    });
    setOpenVehicleDialog(true);
  };

  const handleAddVehicle = () => {
    setCurrentVehicle(null);
    setVehicleFormData({
      carType: '',
      plate: '',
      brand: '',
      model: '',
      insurancePhoto: null,
      carPhoto: null
    });
    setOpenVehicleDialog(true);
  };

  const handleFileChange = (e, field) => {
    setVehicleFormData({
      ...vehicleFormData,
      [field]: e.target.files[0]
    });
  };

  const fetchRiderDetails = async (riderId) => {
    try {
      const response = await adminService.getRiderById(riderId);
      setSelectedRider(response.data);
    } catch (error) {
      console.error('Error fetching rider details:', error);
    }
  };

  const handleVehicleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    try {
      setError('');
      setVehicleError('');
      
      // Validate required fields
      const requiredFields = ['carType', 'plate', 'brand', 'model'];
      const missingFields = requiredFields.filter(field => !vehicleFormData[field]?.trim());
      
      if (missingFields.length > 0) {
        setError(`กรุณากรอกข้อมูลให้ครบถ้วน: ${missingFields.join(', ')}`);
        return;
      }
      
      // Create a new FormData instance
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.entries(vehicleFormData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      // Handle car photo
      if (vehicleFiles.carPhoto instanceof File) {
        formData.append('carPhoto', vehicleFiles.carPhoto);
      } else if (currentVehicle?.carPhoto && !vehicleFiles.carPhoto) {
        // If editing and no new photo was uploaded, keep the existing one
        formData.append('carPhoto', currentVehicle.carPhoto);
      } else if (!currentVehicle?.carId && !vehicleFiles.carPhoto) {
        // If no photo is provided for a new vehicle
        setError('กรุณาอัปโหลดรูปภาพรถ');
        return;
      }
      
      // Handle insurance photo
      if (vehicleFiles.insurancePhoto instanceof File) {
        formData.append('insurancePhoto', vehicleFiles.insurancePhoto);
      } else if (currentVehicle?.insurancePhoto && !vehicleFiles.insurancePhoto) {
        // Keep existing insurance photo if no new one was uploaded
        formData.append('insurancePhoto', currentVehicle.insurancePhoto);
      }
      
      // Log the form data being sent
      console.log('Submitting vehicle form data:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }
  
      if (currentVehicle?.carId) {
        console.log("Updating vehicle with carId:", currentVehicle.carId);
        await riderService.updateVehicle(currentVehicle.carId, formData);
      } else {
        console.log("Adding new vehicle");
        await riderService.addVehicle(formData);
      }
      
      // Close the dialog and reset the form
      setOpenVehicleDialog(false);
      setCurrentVehicle(null);
      setVehicleFormData({
        carType: "",
        plate: "",
        brand: "",
        model: "",
      });
      setVehicleFiles({
        insurancePhoto: null,
        carPhoto: null,
      });
      
      // Force refresh the vehicles list
      await fetchVehicles(true);
      
    } catch (err) {
      console.error("Error in handleVehicleSubmit:", err);
      setVehicleError(
        err.response?.data?.message || "เกิดข้อผิดพลาดที่ไม่คาดคิดในการบันทึกข้อมูล"
      );
    }
  }, [currentVehicle, fetchVehicles, vehicleFormData, vehicleFiles]);

  const handleDeleteVehicle = async (carId) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบยานพาหนะนี้?')) {
      try {
        await axios.delete(`http://localhost:5000/api/riders/vehicles/${carId}`, {
          headers: {
            'Authorization': `Bearer ${auth.token}`
          }
        });
        // รีเฟรชข้อมูล
        fetchRiderDetails(selectedRider.riderId);
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        // จัดการ error ตามความเหมาะสม
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              {profile?.firstName?.[0]}{profile?.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom>
                สวัสดี! ผู้ดูแลระบบ{profile?.firstName} {profile?.lastName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">

              </Typography>
            </Box>
          </Box>
          <Tooltip title="ออกจากระบบ">
            <IconButton
              color="error"
              onClick={handleLogout}
              sx={{
                bgcolor: 'error.light',
                '&:hover': { bgcolor: 'error.main' }
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ my: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  ระบบจัดการ
                </Typography>
                <Typography color="text.secondary">
                  ผู้ดูแลระบบ: {user?.email}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ width: '100%' }}>
                <Tabs
                  value={tab}
                  onChange={(e, newValue) => setTab(newValue)}
                  variant="fullWidth"
                  indicatorColor="primary"
                  textColor="primary"
                >
                  <Tab label="นักศึกษา" />
                  <Tab label="ไรเดอร์" />
                  <Tab label="สถานที่" />
                  <Tab label="รายงานผล" />
                </Tabs>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              {tab === 0 && renderStudentsTable()}
              {tab === 1 && renderRidersTable()}
              {tab === 2 && renderPlacesTable()}
              {tab === 3 && renderReportsSection()}
            </Grid>
          </Grid>
        </Box>

        <Dialog
          open={openRiderDialog}
          onClose={() => setOpenRiderDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>ข้อมูลไรเดอร์</DialogTitle>
          <DialogContent>
            {selectedRider && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    ข้อมูลส่วนตัว
                  </Typography>
                  <Typography>
                    ชื่อ-นามสกุล: {selectedRider.riderFirstname}{' '}
                    {selectedRider.riderLastname}
                  </Typography>
                  <Typography>อีเมล: {selectedRider.riderEmail}</Typography>
                  <Typography>เบอร์โทร: {selectedRider.riderTel}</Typography>
                  <Typography>ที่อยู่: {selectedRider.riderAddress}</Typography>

                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    เอกสารและรูปภาพ
                  </Typography>
                  {selectedRider.RiderStudentCard && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        บัตรนักศึกษา
                      </Typography>
                      <img
                        src={getImageUrl(selectedRider.RiderStudentCard)}
                        alt="บัตรนักศึกษา"
                        style={{ maxWidth: '100%' }}
                      />
                    </Box>
                  )}
                  {selectedRider.QRscan && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        QR Code พร้อมเพย์
                      </Typography>
                      <img
                        src={getImageUrl(selectedRider.QRscan)}
                        alt="QR Code"
                        style={{ maxWidth: '100%' }}
                      />
                    </Box>
                  )}
                  {selectedRider.riderLicense && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        ใบขับขี่
                      </Typography>
                      <img
                        src={getImageUrl(selectedRider.riderLicense)}
                        alt="ใบขับขี่"
                        style={{ maxWidth: '100%' }}
                      />
                    </Box>
                  )}
                  {selectedRider.riderProfilePic && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        รูปโปรไฟล์
                      </Typography>
                      <img
                        src={getImageUrl(selectedRider.riderProfilePic)}
                        alt="รูปโปรไฟล์"
                        style={{ maxWidth: '100%' }}
                      />
                    </Box>
                  )}
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRiderDialog(false)}>ปิด</Button>
            {selectedRider?.status === 'pending' && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  handleApproveRider(selectedRider.riderId);
                  setOpenRiderDialog(false);
                }}
              >
                อนุมัติ
              </Button>
            )}
          </DialogActions>
        </Dialog>

        <Dialog open={openRiderFormDialog} onClose={handleCloseRiderFormDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{currentRiderFormData?.riderId ? 'แก้ไขข้อมูล Rider' : 'สร้าง Rider ใหม่'}</DialogTitle>
          <form onSubmit={handleRiderFormSubmit}>
            <DialogContent>
              {riderFormError && <Alert severity="error" sx={{ mb: 2 }}>{riderFormError}</Alert>}
              <TextField
                margin="dense"
                name="riderNationalId"
                label="เลขบัตรประชาชน"
                type="text"
                fullWidth
                variant="outlined"
                value={currentRiderFormData?.riderNationalId || ''}
                onChange={handleRiderFormChange}
                required
              />
              <TextField
                margin="dense"
                name="riderFirstname"
                label="ชื่อ"
                type="text"
                fullWidth
                variant="outlined"
                value={currentRiderFormData?.riderFirstname || ''}
                onChange={handleRiderFormChange}
                required
              />
              <TextField
                margin="dense"
                name="riderLastname"
                label="นามสกุล"
                type="text"
                fullWidth
                variant="outlined"
                value={currentRiderFormData?.riderLastname || ''}
                onChange={handleRiderFormChange}
                required
              />
              <TextField
                margin="dense"
                name="riderEmail"
                label="อีเมล"
                type="email"
                fullWidth
                variant="outlined"
                value={currentRiderFormData?.riderEmail || ''}
                onChange={handleRiderFormChange}
                required
              />

              <TextField
                margin="dense"
                name="riderTel"
                label="เบอร์โทรศัพท์"
                type="text"
                fullWidth
                variant="outlined"
                value={currentRiderFormData?.riderTel || ''}
                onChange={handleRiderFormChange}
              />
              <TextField
                margin="dense"
                name="riderAddress"
                label="ที่อยู่"
                type="text"
                fullWidth
                variant="outlined"
                value={currentRiderFormData?.riderAddress || ''}
                onChange={handleRiderFormChange}
                multiline
                rows={2}
              />

              <FormControl fullWidth margin="dense">
                <InputLabel id="rider-status-select-label">สถานะ</InputLabel>
                <Select
                  labelId="rider-status-select-label"
                  name="status"
                  value={currentRiderFormData?.status || 'pending'}
                  label="สถานะ"
                  onChange={handleRiderFormChange}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseRiderFormDialog}>ยกเลิก</Button>
              <Button type="submit" variant="contained">บันทึก</Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog open={openPlaceDialog} onClose={handleClosePlaceDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{currentPlace ? 'แก้ไข' : 'เพิ่ม'}สถานที่</DialogTitle>
          <form onSubmit={handlePlaceSubmit}>
            <DialogContent>
              {placesError && <Alert severity="error" sx={{ mb: 2 }}>{placesError}</Alert>}
              <TextField
                autoFocus
                margin="dense"
                name="placeName"
                label="ชื่อสถานที่"
                type="text"
                fullWidth
                variant="outlined"
                value={placeFormData.placeName}
                onChange={handlePlaceFormChange}
                required
                error={!!placesError && !placeFormData.placeName.trim()}
                helperText={!!placesError && !placeFormData.placeName.trim() ? 'กรุณากรอกชื่อสถานที่' : ''}
              />
              <TextField
                margin="dense"
                name="link"
                label="ลิงก์ Google Maps"
                type="url"
                fullWidth
                variant="outlined"
                value={placeFormData.link}
                onChange={handlePlaceFormChange}
                helperText="ตัวอย่าง: https://www.google.com/maps/place/..."
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  รูปภาพสถานที่
                </Typography>
                <input
                  accept="image/*"
                  type="file"
                  onChange={handlePlaceFileChange}
                  id="place-picture-upload"
                />
                {placeFile && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">ไฟล์ที่เลือก: {placeFile.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ขนาดไฟล์: {(placeFile.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                )}
                {!placeFile && currentPlace?.pics && (
                  <Box sx={{ mt: 1 }}>
                    <img
                      src={getImageUrl(currentPlace.pics)}
                      alt={currentPlace.placeName}
                      style={{ height: 100, width: 'auto', objectFit: 'contain' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      รูปภาพปัจจุบัน
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClosePlaceDialog}>ยกเลิก</Button>
              <Button type="submit" variant="contained">บันทึก</Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog open={openVehicleDialog} onClose={() => setOpenVehicleDialog(false)}>
          <DialogTitle>
            {currentVehicle ? "แก้ไข" : "เพิ่ม"}ข้อมูลยานพาหนะ
          </DialogTitle>
          <DialogContent>
            <TextField
              select
              fullWidth
              label="ประเภทรถ"
              value={vehicleFormData.carType}
              onChange={(e) => setVehicleFormData({ ...vehicleFormData, carType: e.target.value })}
              margin="normal"
            >
              <MenuItem value="motorcycle">มอเตอร์ไซค์</MenuItem>
              <MenuItem value="car">รถยนต์</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="ทะเบียนรถ"
              value={vehicleFormData.plate}
              onChange={(e) => setVehicleFormData({ ...vehicleFormData, plate: e.target.value })}
              margin="normal"
            />
            <TextField
              select
              fullWidth
              label="ยี่ห้อ"
              value={vehicleFormData.brand}
              onChange={(e) => setVehicleFormData({ ...vehicleFormData, brand: e.target.value })}
              margin="normal"
            >
              <MenuItem value="Honda">Honda</MenuItem>
              <MenuItem value="Yamaha">Yamaha</MenuItem>
              <MenuItem value="Suzuki">Suzuki</MenuItem>
              <MenuItem value="Kawasaki">Kawasaki</MenuItem>
              <MenuItem value="Other">อื่นๆ</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="รุ่น"
              value={vehicleFormData.model}
              onChange={(e) => setVehicleFormData({ ...vehicleFormData, model: e.target.value })}
              margin="normal"
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                รูปกรมธรรม์
              </Typography>
              <input
                accept="image/*"
                type="file"
                onChange={(e) => handleFileChange(e, "insurancePhoto")}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                รูปยานพาหนะ
              </Typography>
              <input
                accept="image/*"
                type="file"
                onChange={(e) => handleFileChange(e, "carPhoto")}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenVehicleDialog(false)}>ยกเลิก</Button>
            <Button onClick={handleVehicleSubmit} variant="contained">
              บันทึก
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reset Password Dialog */}
        <ResetPasswordDialog 
          open={resetPasswordOpen}
          onClose={() => setResetPasswordOpen(false)}
          rider={riderToReset}
          isStudent={riderToReset?.isStudent || false}
          onResetSuccess={(user) => {
            // Refresh the appropriate list based on user type
            if (user.isStudent) {
              fetchStudents();
            } else {
              fetchRiders();
            }
          }}
        />
      </Box>
    </Container>
  );

}

// Reset Password Dialog Component
const ResetPasswordDialog = ({ 
  open, 
  onClose, 
  rider, 
  onResetSuccess,
  isStudent = false
}) => {
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isResetting, setIsResetting] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleReset = async () => {
    if (!rider || !newPassword) return;

    // Validate passwords
    if (!newPassword || !confirmPassword) {
      enqueueSnackbar('กรุณากรอกรหัสผ่านทั้งสองช่อง', { variant: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      enqueueSnackbar('รหัสผ่านไม่ตรงกัน', { variant: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      enqueueSnackbar('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร', { variant: 'error' });
      return;
    }

    try {
      setIsResetting(true);
      
      if (isStudent) {
        // Use student reset password endpoint
        const studentId = rider.studentId || rider.id; // Try both possible ID properties
        if (!studentId) {
          throw new Error('ไม่พบรหัสนักศึกษา');
        }
        await adminService.resetStudentPassword(studentId, { newPassword });
      } else {
        // Use rider reset password endpoint
        const riderId = rider.riderId || rider.id; // Try both possible ID properties
        if (!riderId) {
          throw new Error('ไม่พบรหัสไรเดอร์');
        }
        await adminService.resetRiderPassword(riderId, { newPassword });
      }
      
      enqueueSnackbar('รีเซ็ตรหัสผ่านเรียบร้อยแล้ว', { 
        variant: 'success',
        autoHideDuration: 5000
      });
      handleClose();
      if (onResetSuccess) onResetSuccess(rider);
    } catch (error) {
      console.error('Error resetting password:', error);
      const errorMessage = error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>รีเซ็ตรหัสผ่าน{isStudent ? 'นักศึกษา' : 'ไรเดอร์'}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          กำลังรีเซ็ตรหัสผ่านสำหรับ: <strong>{rider?.riderFirstname} {rider?.riderLastname}</strong>
          {isStudent && <div>ประเภท: นักศึกษา</div>}
        </DialogContentText>
        
        <TextField
          fullWidth
          margin="normal"
          label="รหัสผ่านใหม่"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          helperText="ต้องมีความยาวอย่างน้อย 6 ตัวอักษร"
        />
        
        <TextField
          fullWidth
          margin="normal"
          label="ยืนยันรหัสผ่านใหม่"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        
        {newPassword && confirmPassword && newPassword !== confirmPassword && (
          <Alert severity="error" sx={{ mt: 2 }}>
            รหัสผ่านไม่ตรงกัน
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isResetting}>
          ยกเลิก
        </Button>
        <Button 
          onClick={handleReset}
          variant="contained" 
          color="primary"
          disabled={isResetting || !newPassword || !confirmPassword || newPassword !== confirmPassword}
          startIcon={isResetting ? <CircularProgress size={20} /> : null}
        >
          {isResetting ? 'กำลังรีเซต...' : 'ยืนยันการรีเซต'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminDashboard;