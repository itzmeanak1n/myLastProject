import React, { memo, useCallback, useEffect, useState, useRef, useMemo } from 'react';
import {
  Avatar,
  Box,
  Button,
  Link,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Rating,
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
  Chip,
  Tooltip,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
  Alert,
  Stack,
} from '@mui/material';

// Icons
import { useAuth } from "../context/AuthContext";
import { riderService } from "../services/api";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import StarIcon from '@mui/icons-material/Star';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DescriptionIcon from '@mui/icons-material/Description';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import axios from "axios";
const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+';

/**
 * Generates a full URL for profile images
 * @param {string} filename - The filename or path from the database
 * @param {string} [urlFromBackend=null] - Full URL if already provided by backend
 * @returns {string} Full URL to the profile image or empty string if not available
 */
const getProfileImageUrl = (filename, urlFromBackend = null) => {
  try {
    // If we have a URL from backend, use it directly
    if (urlFromBackend) {
      // If it's already a full URL, return as is
      if (urlFromBackend.startsWith('http')) {
        return urlFromBackend;
      }
      // If it's a relative path, construct full URL
      const baseUrl = process.env.REACT_APP_API_URL || window.location.origin;
      return `${baseUrl}${urlFromBackend.startsWith('/') ? '' : '/'}${urlFromBackend}`;
    }
    
    // If we have a filename
    if (filename) {
      // If filename is already a full URL, return it
      if (filename.startsWith('http')) {
        return filename;
      }
      
      // Get base URL from environment or current origin
      const baseUrl = process.env.REACT_APP_API_URL || window.location.origin;
      
      // Clean up the filename by removing any leading slashes or uploads/ prefix
      let cleanFilename = filename.replace(/^[\\/]*(uploads[\\/])*/, '');
      
      // Construct the full URL
      return `${baseUrl}/uploads/${cleanFilename}`;
    }
    
    // If no filename or URL is provided, return empty string
    return '';
  } catch (error) {
    console.error('Error generating profile image URL:', error);
    return '';
  }
};

const getVehicleImageUrl = (filename, urlFromBackend = null) => {
  try {
    console.log('Generating vehicle image URL with:', { filename, urlFromBackend });
    
    // If we have a URL from backend, use it directly
    if (urlFromBackend) {
      // If it's already a full URL, return as is
      if (urlFromBackend.startsWith('http')) {
        console.log('Using full URL from backend:', urlFromBackend);
        return urlFromBackend;
      }
      // If it's a relative path, construct full URL
      const baseUrl = process.env.REACT_APP_API_URL || window.location.origin;
      const url = `${baseUrl}${urlFromBackend.startsWith('/') ? '' : '/'}${urlFromBackend}`;
      console.log('Constructed URL from relative path:', url);
      return url;
    }
    
    // If we have a filename
    if (filename) {
      // If filename is already a full URL, return it
      if (filename.startsWith('http')) {
        console.log('Using filename as full URL:', filename);
        return filename;
      }
      
      // Get base URL from environment or current origin
      const baseUrl = process.env.REACT_APP_API_URL || window.location.origin;
      
      // Clean up the filename by removing any leading slashes or uploads/vehicles prefixes
      let cleanFilename = filename.replace(/^[\\/]*(uploads[\\/]vehicles[\\/])*/, '');
      
      // Check if the filename already includes the uploads path
      if (filename.includes('uploads/') || filename.includes('uploads\\')) {
        cleanFilename = filename.replace(/^[\\/]*/, '');
        const url = `${baseUrl}/${cleanFilename}`;
        console.log('Using existing uploads path:', url);
        return url;
      }
      
      // Construct the full URL
      const url = `${baseUrl}/uploads/vehicles/${cleanFilename}`;
      console.log('Constructed URL from filename:', url);
      return url;
    }
    
    console.log('No filename or URL provided, using default avatar');
    return defaultAvatar;
  } catch (error) {
    console.error('Error generating vehicle image URL:', error, { filename, urlFromBackend });
    return defaultAvatar;
  }
};

function RiderDashboard() {
  const {
    user,
    profile,
    updateRiderPendingTrips,
    logout,
    updateProfileInContext,
    riderPendingTrips: contextPendingTrips = []
  } = useAuth();
  const navigate = useNavigate();
  
  // Handle user logout
  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  // Function to force refresh profile data
  const refreshProfile = useCallback(async () => {
    try {
      console.log('Refreshing profile data...');
      const response = await riderService.getProfile();
      if (response && response.data) {
        const freshProfile = response.data;
        console.log('Successfully refreshed profile:', freshProfile);
        
        // Update the context with the fresh profile data
        updateProfileInContext(freshProfile);
        
        // Also update local state immediately
        setProfileFormData({
          riderFirstname: freshProfile.riderFirstname || "",
          riderLastname: freshProfile.riderLastname || "",
          riderTel: freshProfile.riderTel || "",
          riderAddress: freshProfile.riderAddress || "",
          riderEmail: freshProfile.riderEmail || "",
          riderNationalId: freshProfile.riderNationalId || ""
        });
        
        // Update file previews with fresh URLs
        const profilePicUrl = freshProfile.RiderProfilePic ? 
          `${getProfileImageUrl(freshProfile.RiderProfilePic)}?t=${Date.now()}` : 
          null;
        
        const studentCardUrl = freshProfile.RiderStudentCard ? 
          `${getProfileImageUrl(freshProfile.RiderStudentCard)}?t=${Date.now()}` : 
          null;
        
        const qrUrl = freshProfile.QRscan ? 
          `${getProfileImageUrl(freshProfile.QRscan)}?t=${Date.now()}` : 
          null;
        
        const licenseUrl = freshProfile.riderLicense ? 
          `${getProfileImageUrl(freshProfile.riderLicense)}?t=${Date.now()}` : 
          null;
        
        setFilePreviews({
          RiderProfilePic: profilePicUrl,
          RiderStudentCard: studentCardUrl,
          QRscan: qrUrl,
          riderLicense: licenseUrl
        });
        
        return freshProfile;
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      throw error;
    }
  }, [updateProfileInContext]);

  // Sync local state with profile from context
  useEffect(() => {
    if (profile) {
      console.log('=== Profile Data Updated in Context ===');
      console.log('Profile object:', profile);
      
      // Update local state to match the profile from context
      setProfileFormData(prev => ({
        ...prev,
        riderFirstname: profile.riderFirstname || "",
        riderLastname: profile.riderLastname || "",
        riderTel: profile.riderTel || "",
        riderAddress: profile.riderAddress || "",
        riderEmail: profile.riderEmail || "",
        riderNationalId: profile.riderNationalId || ""
      }));
      
      // Only update file previews if the image URLs have changed
      setFilePreviews(prev => {
        const newPreviews = {
          RiderProfilePic: profile.RiderProfilePic ? 
            `${getProfileImageUrl(profile.RiderProfilePic)}?t=${Date.now()}` : 
            null,
          RiderStudentCard: profile.RiderStudentCard ? 
            `${getProfileImageUrl(profile.RiderStudentCard)}?t=${Date.now()}` : 
            null,
          QRscan: profile.QRscan ? 
            `${getProfileImageUrl(profile.QRscan)}?t=${Date.now()}` : 
            null,
          riderLicense: profile.riderLicense ? 
            `${getProfileImageUrl(profile.riderLicense)}?t=${Date.now()}` : 
            null
        };
        
        // Only update if something actually changed
        if (JSON.stringify(prev) !== JSON.stringify(newPreviews)) {
          return newPreviews;
        }
        return prev;
      });
    }
  }, [profile]);

  // Debug: Log profile data when it changes
  useEffect(() => {
    console.log('Profile data in RiderDashboard:', profile);
    if (profile) {
      console.log('riderRate in profile:', profile.riderRate);
      console.log('All profile keys:', Object.keys(profile));
      
      // Check if riderRate exists in profile
      if (profile.riderRate === undefined || profile.riderRate === null) {
        console.warn('riderRate is not defined in profile data');
      } else {
        console.log('riderRate value:', profile.riderRate, 'type:', typeof profile.riderRate);
      }
    }
  }, [profile]);
  
  const [success, setSuccess] = useState('');
  
  // State management
  const [vehicles, setVehicles] = useState([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [vehicleFormData, setVehicleFormData] = useState({
    carType: "",
    plate: "",
    brand: "",
    model: "",
  });
  const [vehicleFiles, setVehicleFiles] = useState({
    insurancePhoto: null,
    carPhoto: null,
  });
  const [vehicleError, setVehicleError] = useState("");
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    riderFirstname: "",
    riderLastname: "",
    riderTel: "",
    riderAddress: "",
    riderEmail: "",
    riderNationalId: "",
  });
  const [profileError, setProfileError] = useState("");
  const [error, setError] = useState(null);
  const [activeTrips, setActiveTrips] = useState([]);
  const [pendingTrips, setPendingTrips] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  
  // Get the rider's vehicle types
  const riderVehicleTypes = useMemo(() => {
    return vehicles.map(vehicle => vehicle.carType).filter(Boolean);
  }, [vehicles]);
  
  // Filter pending trips to only show those that match the rider's vehicle types
  const filteredPendingTrips = useMemo(() => {
    if (riderVehicleTypes.length === 0) return [];
    
    return pendingTrips.filter(trip => 
      trip.carType && riderVehicleTypes.includes(trip.carType)
    );
  }, [pendingTrips, riderVehicleTypes]);
  const [tripHistory, setTripHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileFiles, setProfileFiles] = useState({
    RiderProfilePic: null,
    RiderStudentCard: null,
    QRscan: null,
    riderLicense: null
  });
  
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle file changes for vehicle photos and insurance
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      setVehicleError('กรุณาอัปโหลดรูปภาพเท่านั้น (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setVehicleError('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

    // Clear any previous errors
    setVehicleError('');

    // Create a preview URL for the image
    const reader = new FileReader();
    reader.onloadend = () => {
      // Update the vehicle files state with both file object and preview URL
      setVehicleFiles(prev => ({
        ...prev,
        [field]: file,
        [`${field}Preview`]: reader.result
      }));

      // If this is for an existing vehicle, update the current vehicle state as well
      if (currentVehicle) {
        setCurrentVehicle(prev => ({
          ...prev,
          [field]: file,
          [`${field}Preview`]: reader.result
        }));
      }
    };
    reader.readAsDataURL(file);
  };
  
  // State for storing preview URLs
  const [filePreviews, setFilePreviews] = useState({
    RiderProfilePic: null,
    RiderStudentCard: null,
    QRscan: null,
    riderLicense: null
  });
  // Use ref for cached data that shouldn't trigger re-renders
  const cachedDataRef = useRef({
    vehicles: null,
    activeTrips: null,
    pendingTrips: null
  });
  
  // State for cached data that affects UI
  const [cachedData, setCachedData] = useState({});
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Enhanced date formatter with better error handling and timezone support
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'ไม่ระบุ';
    
    try {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Bangkok' // Ensure consistent timezone
      };
      
      // Handle both string timestamps and Date objects
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'วันที่ไม่ถูกต้อง';
      }
      
      // Format the date in Thai locale
      return new Intl.DateTimeFormat('th-TH', options).format(date);
    } catch (error) {
      console.error('Error formatting date:', error, 'Input:', dateString);
      return 'วันที่ไม่ถูกต้อง';
    }
  }, []);

  const fetchActiveTrips = useCallback(async () => {
    try {
      console.log('Fetching active trips...');
      const response = await riderService.getActiveTrips();
      console.log('Active trips raw response:', response);
      
      let tripsData = [];
      if (Array.isArray(response)) {
        tripsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        tripsData = response.data;
      }

      setActiveTrips(tripsData);
      
      if (tripsData.length > 0) {
        setActiveTab('active');
      }
      
      return tripsData;
    } catch (error) {
      console.error('Error fetching active trips:', error);
      setError('ไม่สามารถโหลดข้อมูลการเดินทางที่กำลังดำเนินการได้');
      setActiveTrips([]);
      throw error;
    }
  }, []);

  const handleAcceptTrip = useCallback(async (tripId) => {
    console.log('=== Start handleAcceptTrip ===');
    console.log('tripId:', tripId);
    console.log('user:', user);
    console.log('profile:', profile);

    if (!tripId) {
      console.error('No trip ID provided');
      setError('ไม่พบรหัสการเดินทาง');
      return;
    }

    if (!user || !profile) {
      console.error('No user or profile data');
      setError('ไม่พบข้อมูลผู้ใช้');
      return;
    }

    try {
      console.log('Sending request to acceptTrip with:', { tripId, riderId: user.id });
      const response = await riderService.acceptTrip(tripId, user.id);
      console.log('Accept trip response:', response);

      if (response.success) {
        // อัพเดทรายการงานที่รอการตอบรับ
        await updateRiderPendingTrips();
        // อัพเดทรายการงานที่กำลังดำเนินการ
        await fetchActiveTrips();
        // เปลี่ยนแท็บไปที่งานที่กำลังดำเนินการ
        setActiveTab('active');
        setError(null);
      } else {
        setError(response.message || 'ไม่สามารถรับงานได้');
      }
    } catch (error) {
      console.error('Error in handleAcceptTrip:', error);
      setError(error.message || 'ไม่สามารถรับงานได้');
    }
    console.log('=== End handleAcceptTrip ===');
  }, [user, profile, updateRiderPendingTrips, fetchActiveTrips]);

  const fetchTripHistory = useCallback(async () => {
    if (!user?.id) return;
    
    let isMounted = true;
    
    try {
      setIsLoadingHistory(true);
      console.log('Fetching trip history...');
      const response = await riderService.getTripHistory();
      console.log('Raw trip history response:', response);
      
      if (!isMounted) return;
      
      // Log the first trip to inspect its structure
      if (Array.isArray(response) && response.length > 0) {
        console.log('First trip data:', response[0]);
        console.log('All available trip fields:', Object.keys(response[0]));
        
        // Log all place-related fields
        console.log('Place-related fields:');
        console.log('pickUpName:', response[0].pickUpName);
        console.log('destinationName:', response[0].destinationName);
        console.log('pickUpPlaceName:', response[0].pickUpPlaceName);
        console.log('destinationPlaceName:', response[0].destinationPlaceName);
        console.log('placeIdPickUp:', response[0].placeIdPickUp);
        console.log('placeIdDestination:', response[0].placeIdDestination);
        
        // Log SQL query structure for debugging
        console.log('Check if place names are being joined correctly in SQL');
      }
      
      if (Array.isArray(response)) {
        console.log('Setting trip history with array of length:', response.length);
        setTripHistory(response);
        setError(null);
      } else if (response?.data && Array.isArray(response.data)) {
        console.log('Setting trip history from response.data, length:', response.data.length);
        setTripHistory(response.data);
        setError(null);
      } else {
        setTripHistory([]);
        setError('Invalid trip history data format');
      }
    } catch (error) {
      console.error('Error fetching trip history:', error);
      if (isMounted) {
        setTripHistory([]);
        setError('Failed to load trip history');
      }
    } finally {
      if (isMounted) {
        setIsLoadingHistory(false);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const fetchVehicles = useCallback(async (force = false) => {
    if (!user?.id) {
      console.log('No user ID, skipping fetchVehicles');
      return;
    }
    
    // Always fetch fresh data when force=true (like after adding/updating a vehicle)
    if (!force && cachedDataRef.current.vehicles) {
      console.log('Using cached vehicles data');
      // Even if we're using cache, we should still update the UI to reflect any changes
      setVehicles(cachedDataRef.current.vehicles);
      return;
    }

    console.log('Fetching vehicles from API...');
    setIsLoadingVehicles(true);
    setVehicleError("");
    
    try {
      const response = await riderService.getVehicles();
      console.log('Raw API response:', response);
      
      // Handle different response formats
      let vehiclesData = [];
      if (Array.isArray(response)) {
        vehiclesData = response;
      } else if (response && Array.isArray(response.data)) {
        vehiclesData = response.data;
      } else if (response && response.data && typeof response.data === 'object') {
        // Handle case where data is an object with vehicle properties
        vehiclesData = [response.data];
      }
      
      console.log('Processed vehicles data:', {
        isArray: Array.isArray(vehiclesData),
        length: vehiclesData.length,
        data: vehiclesData
      });
      
      if (vehiclesData.length > 0) {
        console.log('First vehicle data:', vehiclesData[0]);
        
        // Log image URLs for debugging
        vehiclesData.forEach((vehicle, index) => {
          if (vehicle.carPhoto) {
            console.log(`Vehicle ${index} image URL:`, getVehicleImageUrl(vehicle.carPhoto));
          }
        });
      }
      
      // Ensure all required fields have default values and handle empty strings
      const processedVehicles = vehiclesData.map(vehicle => {
        // Create a clean vehicle object with default values
        const cleanVehicle = {
          // ID fields
          carId: vehicle.carId || vehicle.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
          
          // Vehicle details with fallbacks for empty strings and null/undefined
          carType: (vehicle.carType || vehicle.type || '').trim() || 'ไม่ระบุ',
          plate: (vehicle.plate || vehicle.licensePlate || '').trim() || 'ไม่ระบุ',
          brand: (vehicle.brand || '').trim() || 'ไม่ระบุ',
          model: (vehicle.model || '').trim() || 'ไม่ระบุ',
          
          // Handle image/photo fields
          carPhoto: (vehicle.carPhoto || vehicle.image || '').trim() || null,
          insurancePhoto: (vehicle.insurancePhoto || '').trim() || null,
          
          // Include all other properties from the original vehicle object
          ...vehicle
        };
        
        console.log('Processed vehicle:', cleanVehicle);
        return cleanVehicle;
      });
      
      // Update state and ref
      setVehicles(processedVehicles);
      cachedDataRef.current.vehicles = processedVehicles;
      
    } catch (error) {
      // Only log and show error if it's not a canceled request
      if (error.code !== 'ERR_CANCELED') {
        console.error("Error fetching vehicles:", error);
        setVehicleError("ไม่สามารถโหลดข้อมูลยานพาหนะได้");
        
        // Set empty array to prevent undefined errors
        setVehicles([]);
        cachedDataRef.current.vehicles = [];
      }
    } finally {
      console.log('Finished loading vehicles');
      setIsLoadingVehicles(false);
    }
  }, [user?.id]); // Only depend on user.id

  // Track initial mount to prevent duplicate fetches
  const initialMount = useRef(true);
  
  // Main data loading effect - runs once on mount and when user changes
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        if (!user?.id) {
          if (isMounted) setIsLoading(false);
          return;
        }
        
        console.log('Loading initial data...');
        
        // Only fetch vehicles if we don't have them in cache
        if (!cachedDataRef.current.vehicles) {
          console.log('Fetching vehicles...');
          await fetchVehicles();
        } else {
          console.log('Using cached vehicles');
          setVehicles(cachedDataRef.current.vehicles);
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Only run on initial mount or when user changes
    if (initialMount.current || user?.id) {
      loadData();
      initialMount.current = false;
    }
    
    return () => {
      isMounted = false;
    };
  }, [user?.id]); // Only depend on user.id

  const handleVehicleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    setError('');
    setVehicleError('');
    setIsSubmitting(true);
    
    try {
      // Validate required fields first
      const requiredFields = ['carType', 'plate', 'brand', 'model'];
      const missingFields = requiredFields.filter(field => !vehicleFormData[field]?.trim());
      
      if (missingFields.length > 0) {
        throw new Error(`กรุณากรอกข้อมูลให้ครบถ้วน: ${missingFields.join(', ')}`);
      }
      
      // Create a new FormData instance
      const formData = new FormData();
      
      // Add form fields to FormData
      formData.append('carType', vehicleFormData.carType);
      formData.append('plate', vehicleFormData.plate);
      formData.append('brand', vehicleFormData.brand);
      formData.append('model', vehicleFormData.model);
      
      // Handle insurance photo
      if (vehicleFiles.insurancePhoto instanceof File) {
        formData.append('insurancePhoto', vehicleFiles.insurancePhoto);
      } else if (currentVehicle?.insurancePhoto && !vehicleFiles.insurancePhoto) {
        // Keep existing insurance photo if no new one was uploaded
        formData.append('insurancePhoto', currentVehicle.insurancePhoto);
      } else if (!currentVehicle?.carId) {
        // Require insurance photo for new vehicles
        throw new Error('กรุณาอัปโหลดรูปภาพประกันภัย');
      }
      
      // Handle car photo
      if (vehicleFiles.carPhoto instanceof File) {
        formData.append('carPhoto', vehicleFiles.carPhoto);
      } else if (currentVehicle?.carPhoto && !vehicleFiles.carPhoto) {
        // Keep existing car photo if no new one was uploaded
        formData.append('carPhoto', currentVehicle.carPhoto);
      } else if (!currentVehicle?.carId) {
        // Require car photo for new vehicles
        throw new Error('กรุณาอัปโหลดรูปภาพรถ');
      }
      
      // Log the form data being sent
      console.log('Submitting vehicle form data:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }
      
      // Log form data for debugging
      console.log('Submitting vehicle data:', {
        carType: vehicleFormData.carType,
        plate: vehicleFormData.plate,
        brand: vehicleFormData.brand,
        model: vehicleFormData.model,
        hasInsurancePhoto: !!vehicleFiles.insurancePhoto,
        hasCarPhoto: !!vehicleFiles.carPhoto
      });
      
      if (currentVehicle?.carId) {
        console.log("Updating vehicle with carId:", currentVehicle.carId);
        await riderService.updateVehicle(currentVehicle.carId, formData);
      } else {
        console.log("Adding new vehicle");
        await riderService.addVehicle(formData);
      }
      
      // Show success message
      setSuccess("บันทึกข้อมูลยานพาหนะเรียบร้อยแล้ว");
      
      // Close the dialog and reset the form after a short delay
      setTimeout(() => {
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
          insurancePhotoPreview: null,
          carPhotoPreview: null
        });
        setSuccess("");
        
        // Force refresh the vehicles list to get the latest data
        fetchVehicles(true); // true forces a fresh API call
      }, 1500);
      
    } catch (err) {
      console.error("Error in handleVehicleSubmit:", err);
      const errorMessage = err.response?.data?.message || err.message || "เกิดข้อผิดพลาดที่ไม่คาดคิดในการบันทึกข้อมูล";
      setVehicleError(errorMessage);
      
      // Auto-hide error after 5 seconds
      setTimeout(() => {
        setVehicleError("");
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    currentVehicle,
    fetchVehicles,
    riderService,
    vehicleFormData,
    vehicleFiles,
    setOpenVehicleDialog,
    setCurrentVehicle,
    setVehicleFormData,
    setVehicleFiles,
    setSuccess,
    setVehicleError,
    setError,
    setIsSubmitting
  ]);

  const handleDeleteVehicle = useCallback(
    async (carId) => {
      if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบยานพาหนะนี้?")) {
        setVehicleError("");
        try {
          await riderService.deleteVehicle(carId);
          fetchVehicles();
        } catch (err) {
          console.error("Error deleting vehicle:", err);
          setVehicleError(
            err.response?.data?.message || "เกิดข้อผิดพลาดในการลบข้อมูล"
          );
        }
      }
    },
    [fetchVehicles, riderService]
  );

  // โหลดประวัติการทำงานเมื่อเปลี่ยนแท็บ
  useEffect(() => {
    if (activeTab === 'history') {
      fetchTripHistory();
    }
  }, [activeTab, fetchTripHistory]);

  const handleOpenVehicleDialog = useCallback(
    (vehicle) => {
      console.log('Opening vehicle dialog with data:', vehicle);
      
      // First, set the current vehicle with all its data
      setCurrentVehicle(prev => ({
        ...prev, // Preserve any existing data
        ...(vehicle || {}) // Add/override with new vehicle data
      }));
      
      // Then set the form data with the vehicle data
      if (vehicle) {
        // Initialize form data with all available vehicle fields
        const formData = {
          carType: vehicle.carType || '',
          plate: vehicle.plate || '',
          brand: vehicle.brand || '',
          model: vehicle.model || '',
          // Include any additional fields that might be in the vehicle object
          ...Object.fromEntries(
            Object.entries(vehicle)
              .filter(([key]) => !['carType', 'plate', 'brand', 'model', 'carPhoto', 'insurancePhoto'].includes(key))
          )
        };
        
        console.log('Setting form data:', formData);
        setVehicleFormData(formData);
        
        // Set file references (not the actual files, just the references)
        setVehicleFiles({
          insurancePhoto: vehicle.insurancePhoto || null,
          carPhoto: vehicle.carPhoto || null,
        });
      } else {
        // For new vehicle, reset all fields
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
      }
      
      // Clear any previous errors and open the dialog
      setVehicleError("");
      setOpenVehicleDialog(true);
    },
    [
      setOpenVehicleDialog,
      setCurrentVehicle,
      setVehicleFormData,
      setVehicleFiles,
      setVehicleError,
    ]
  );

  const handleOpenProfileEditDialog = useCallback(() => {
    setProfileError("");
    setProfileFormData({
      riderFirstname: profile?.riderFirstname || "",
      riderLastname: profile?.riderLastname || "",
      riderTel: profile?.riderTel || "",
      riderAddress: profile?.riderAddress || "",
      riderEmail: profile?.riderEmail || "",
      riderNationalId: profile?.riderNationalId || "",
    });
    setOpenProfileDialog(true);
  }, [profile, setOpenProfileDialog, setProfileFormData]);

  const handleCloseProfileDialog = useCallback(() => {
    // Clean up preview URLs to prevent memory leaks
    Object.values(filePreviews).forEach(previewUrl => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    });
    
    // Reset previews state
    setFilePreviews({
      RiderProfilePic: null,
      RiderStudentCard: null,
      QRscan: null,
      riderLicense: null
    });
    
    setOpenProfileDialog(false);
    setProfileError("");
  }, [setOpenProfileDialog, filePreviews]);

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateProfileForm = () => {
    const requiredFields = ['riderFirstname', 'riderLastname', 'riderTel', 'riderAddress'];
    const missingFields = [];
    
    requiredFields.forEach(field => {
      if (!profileFormData[field]?.trim()) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      const fieldNames = {
        riderFirstname: 'ชื่อ',
        riderLastname: 'นามสกุล',
        riderTel: 'เบอร์โทร',
        riderAddress: 'ที่อยู่'
      };
      
      const missingFieldNames = missingFields.map(field => fieldNames[field] || field);
      setProfileError(`กรุณากรอกข้อมูลให้ครบถ้วน (${missingFieldNames.join(', ')})`);
      return false;
    }
    
    // Validate phone number format (Thai phone numbers)
    const phoneRegex = /^0[0-9]{8,9}$/;
    if (!phoneRegex.test(profileFormData.riderTel)) {
      setProfileError('รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นตัวเลข 9-10 หลัก ขึ้นต้นด้วย 0)');
      return false;
    }
    
    return true;
  };
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProfileError('');

    // Validate form before submission
    if (!validateProfileForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData object for file uploads
      const formData = new FormData();

      console.log('Profile form data:', profileFormData);

      // Add all form fields with exact field names expected by the backend
      const fieldMappings = {
        riderFirstname: profileFormData.riderFirstname,
        riderLastname: profileFormData.riderLastname,
        riderTel: profileFormData.riderTel,
        riderAddress: profileFormData.riderAddress,
        riderNationalId: profileFormData.riderNationalId,
        riderEmail: profileFormData.riderEmail
      };

      // Add all fields to formData
      for (const [key, value] of Object.entries(fieldMappings)) {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
          console.log(`Adding form field: ${key} =`, value);
        }
      }

      
      // Add files if they exist
      for (const [key, file] of Object.entries(profileFiles)) {
        if (file instanceof File) {
          formData.append(key, file);
          console.log(`Adding file: ${key} =`, file.name);
        }
      }
      
      // Log FormData content for debugging
      console.log('Final FormData being sent:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      // Make the API call
      console.log('Sending profile update request...');
      // First, update the profile on the server
      const response = await riderService.updateProfile(formData);
      console.log('Profile update successful:', response);
      
      if (response) {
        setSuccess('อัปเดตโปรไฟล์สำเร็จ');
        
        // Force a complete refresh of the profile data from the server
        try {
          console.log('Refreshing profile data after update...');
          await refreshProfile();
          console.log('Profile data refreshed successfully');
        } catch (refreshError) {
          console.error('Error refreshing profile after update:', refreshError);
          // Even if refresh fails, we can still proceed
        }
        
        // Show success message for a bit longer since we're doing a refresh
        const successTimer = setTimeout(() => {
          setSuccess('');
        }, 3000);
        
        // Reset file inputs
        setProfileFiles({
          RiderProfilePic: null,
          RiderStudentCard: null,
          QRscan: null,
          riderLicense: null
        });
        
        // Close the dialog after a short delay
        const closeTimer = setTimeout(() => {
          handleCloseProfileDialog();
        }, 1500);
        
        // Clear timers when component unmounts
        return () => {
          clearTimeout(successTimer);
          clearTimeout(closeTimer);
        };
      } else {
        throw new Error('ไม่สามารถอัปเดตโปรไฟล์ได้: ไม่ได้รับข้อมูลการตอบกลับ');
      }
    } catch (err) {
      console.error('Error updating profile:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status,
        fullResponse: err.response
      });
      
      if (err.response?.status === 401) {
        setProfileError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง');
      } else if (err.response?.status === 400) {
        // Log the full error response for debugging
        console.log('Full error response:', err.response?.data);
        
        // Try different ways to extract error message
        let errorMessage = 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
        const responseData = err.response?.data;
        
        if (responseData) {
          // Try to get error from common response formats
          if (responseData.message) {
            errorMessage = responseData.message;
          } else if (responseData.error) {
            errorMessage = responseData.error;
          } else if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else if (Array.isArray(responseData)) {
            errorMessage = responseData.join('\n');
          } else if (typeof responseData === 'object') {
            // Try to extract validation errors
            const validationErrors = [];
            for (const [field, errors] of Object.entries(responseData)) {
              if (Array.isArray(errors)) {
                validationErrors.push(`${field}: ${errors.join(', ')}`);
              } else if (typeof errors === 'string') {
                validationErrors.push(`${field}: ${errors}`);
              }
            }
            if (validationErrors.length > 0) {
              errorMessage = validationErrors.join('\n');
            } else {
              errorMessage = JSON.stringify(responseData);
            }
          }
        }
        
        setProfileError(errorMessage);
      } else {
        setProfileError(err.message || 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ฟังก์ชันสำหรับจัดการการเปลี่ยนไฟล์และแสดงตัวอย่าง
  const handleProfileFileChange = useCallback((e, field) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log(`เลือกไฟล์ ${field}:`, {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setProfileError(`ขนาดไฟล์ต้องไม่เกิน 5MB (${(maxSize / (1024 * 1024)).toFixed(2)}MB)`);
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setProfileError('รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF) หรือ PDF เท่านั้น');
        return;
      }
      
      try {
        // Create a preview URL for the selected file (for images only)
        let previewUrl = '';
        if (file.type.startsWith('image/')) {
          previewUrl = URL.createObjectURL(file);
        } else {
          // For non-image files, show the file name
          previewUrl = file.name;
        }
        
        // Update the file and preview URL
        setProfileFiles(prev => ({
          ...prev,
          [field]: file
        }));
        
        setFilePreviews(prev => ({
          ...prev,
          [field]: previewUrl
        }));
        
        // Clear any previous errors
        setProfileError('');
      } catch (error) {
        console.error('Error processing file:', error);
        setProfileError('เกิดข้อผิดพลาดในการประมวลผลไฟล์');
      }
    }
  }, []);

  // อัพเดท state เริ่มต้นของ profileFormData
  useEffect(() => {
    if (profile) {
      setProfileFormData({
        riderFirstname: profile.riderFirstname || "",
        riderLastname: profile.riderLastname || "",
        riderTel: profile.riderTel || "",
        riderAddress: profile.riderAddress || "",
        riderEmail: profile.riderEmail || "",
        riderNationalId: profile.riderNationalId || ""
      });
    }
  }, [profile]);

  const handleRejectTrip = useCallback(
    async (tripId) => {
      try {
        setError(null);
        await riderService.rejectTrip(tripId);
        await updateRiderPendingTrips();
      } catch (err) {
        setError(err.toString());
      }
    },
    [updateRiderPendingTrips]
  );

  // Extract VehicleTable to a separate memoized component
  const VehicleTable = memo(({ 
    isLoadingVehicles, 
    vehicles = [], 
    vehicleError, 
    onAddVehicle, 
    onEditVehicle, 
    onDeleteVehicle 
  }) => {
    // Ensure vehicles is always an array
    const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
    console.log('Rendering VehicleTable with vehicles:', safeVehicles.length);
    
    // Handle image loading errors
    const handleImageError = useCallback((e, photoUrl) => {
      console.error('Error loading vehicle image:', photoUrl);
      e.target.src = defaultAvatar;
    }, []);
    
    // Handle edit button click
    const handleEditClick = useCallback((vehicle) => {
      console.log('Edit vehicle:', vehicle);
      if (onEditVehicle && typeof onEditVehicle === 'function') {
        onEditVehicle(vehicle);
      } else {
        handleOpenVehicleDialog(vehicle);
      }
    }, [onEditVehicle]);
    
    // Handle delete button click
    const handleDeleteClick = useCallback((vehicleId) => {
      console.log('Delete vehicle:', vehicleId);
      if (onDeleteVehicle && typeof onDeleteVehicle === 'function') {
        onDeleteVehicle(vehicleId);
      } else if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบยานพาหนะนี้?')) {
        handleDeleteVehicle(vehicleId);
      }
    }, [onDeleteVehicle]);
    
    return (
      <Paper sx={{ p: 2, mt: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">ยานพาหนะของฉัน</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddVehicle || (() => handleOpenVehicleDialog(null))}
            disabled={isLoadingVehicles}
          >
            เพิ่มยานพาหนะ
          </Button>
        </Box>
        
        {/* Error message */}
        {vehicleError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {vehicleError}
          </Alert>
        )}
        
        {/* Loading state */}
        {isLoadingVehicles ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
            <Typography sx={{ ml: 2 }}>กำลังโหลดยานพาหนะ...</Typography>
          </Box>
        ) : safeVehicles.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="body1" color="textSecondary">
              คุณยังไม่มียานพาหนะ
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={onAddVehicle || (() => handleOpenVehicleDialog(null))}
              sx={{ mt: 2 }}
            >
              เพิ่มยานพาหนะ
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ประเภท</TableCell>
                  <TableCell>ป้ายทะเบียน</TableCell>
                  <TableCell>ยี่ห้อ</TableCell>
                  <TableCell>รุ่น</TableCell>
                  <TableCell>รูปภาพรถ</TableCell>
                  <TableCell>รูปกรมธรรม์</TableCell>
                  <TableCell align="right">การจัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {safeVehicles.map((vehicle, index) => {
                  // Generate a unique key for each row
                  const vehicleKey = vehicle.carId || `vehicle-${index}`;
                  
                  // Get image URL with fallback
                  const imageUrl = getVehicleImageUrl(
                    vehicle.carPhoto || 
                    vehicle.image || 
                    'default-vehicle.png'
                  );
                  
                  // Get display values with fallbacks
                  const displayType = vehicle.carType || vehicle.type || 'ไม่ระบุ';
                  const displayPlate = vehicle.plate || vehicle.licensePlate || 'ไม่ระบุ';
                  const displayBrand = vehicle.brand || 'ไม่ระบุ';
                  const displayModel = vehicle.model || 'ไม่ระบุ';
                  
                  return (
                    <TableRow key={vehicleKey}>
                      <TableCell>{displayType}</TableCell>
                      <TableCell>{displayPlate}</TableCell>
                      <TableCell>{displayBrand}</TableCell>
                      <TableCell>{displayModel}</TableCell>
                      <TableCell>
                        <Box 
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: 1,
                            overflow: 'hidden',
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                          }}
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={`ยานพาหนะ ${index + 1}`}
                              style={{ 
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                console.error('Error loading vehicle image:', imageUrl);
                                e.target.src = defaultAvatar;
                              }}
                            />
                          ) : (
                            <Box 
                              sx={{ 
                                width: '100%', 
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#e0e0e0'
                              }}
                            >
                              <Typography variant="caption" color="textSecondary">
                                ไม่มีรูป
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box 
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: 1,
                            overflow: 'hidden',
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                          }}
                        >
                          {vehicle.insurancePhoto ? (
                            <img
                              src={getVehicleImageUrl(vehicle.insurancePhoto)}
                              alt={`กรมธรรม์ ${index + 1}`}
                              style={{ 
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                console.error('Error loading insurance image:', vehicle.insurancePhoto);
                                e.target.src = defaultAvatar;
                              }}
                            />
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              ไม่มีรูป
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="แก้ไข">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditClick(vehicle)}
                            disabled={isLoadingVehicles}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="ลบ">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(vehicle.carId || vehicle.id)}
                            disabled={isLoadingVehicles}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    );
  });

  // Memoize the vehicle table props to prevent unnecessary re-renders
  const vehicleTableProps = useMemo(() => ({
    isLoadingVehicles,
    vehicles,
    vehicleError,
    onAddVehicle: () => handleOpenVehicleDialog(null),
    onEditVehicle: handleOpenVehicleDialog,
    onDeleteVehicle: handleDeleteVehicle
  }), [
    isLoadingVehicles, 
    vehicles, 
    vehicleError, 
    handleOpenVehicleDialog, 
    handleDeleteVehicle
  ]);
  
  // Memoize the VehicleTable component with its props
  const MemoizedVehicleTable = useMemo(() => (
    <VehicleTable {...vehicleTableProps} />
  ), [vehicleTableProps]);
  // Sync context pending trips to local state
  useEffect(() => {
    if (contextPendingTrips && contextPendingTrips.length > 0) {
      setPendingTrips(prev => {
        const newTrips = Array.isArray(contextPendingTrips) ? contextPendingTrips : [];
        return JSON.stringify(prev) === JSON.stringify(newTrips) ? prev : newTrips;
      });
    } else {
      setPendingTrips([]);
    }
  }, [JSON.stringify(contextPendingTrips)]); // Use stringified version for comparison

  // Memoize updateRiderPendingTrips to prevent unnecessary recreations
  const updateRiderPendingTripsMemoized = useCallback(updateRiderPendingTrips, [user?.id]);

  // Memoize the updateRiderPendingTrips function to prevent unnecessary recreations
  const memoizedUpdateRiderPendingTrips = useCallback(() => {
    return updateRiderPendingTrips();
  }, [user?.id]);

  // Tab-specific data loading
  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const loadTabData = async () => {
      if (!user?.id) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        console.log(`Loading data for tab: ${activeTab}`);
        
        // Clear any pending debounce
        if (timeoutId) clearTimeout(timeoutId);
        
        if (isMounted) setIsLoading(true);
        
        // Use debounce for tab changes
        timeoutId = setTimeout(async () => {
          try {
            if (activeTab === 'pending') {
              console.log('Loading pending trips...');
              await memoizedUpdateRiderPendingTrips();
            } else if (activeTab === 'active') {
              console.log('Loading active trips...');
              const activeRes = await riderService.getActiveTrips();
              const activeTripsData = Array.isArray(activeRes) ? activeRes : [];
              if (isMounted) setActiveTrips(activeTripsData);
            }
          } catch (error) {
            console.error(`Error loading ${activeTab} data:`, error);
            if (isMounted) setError(`ไม่สามารถโหลดข้อมูล${activeTab === 'pending' ? 'งานที่รอการตอบรับ' : 'งานที่กำลังดำเนินการ'}`);
          } finally {
            if (isMounted) setIsLoading(false);
          }
        }, 300);
        
        // Store the timeout ID in a ref instead of state
        const currentTimeoutId = timeoutId;
        
        return () => {
          clearTimeout(currentTimeoutId);
        };
        
      } catch (error) {
        console.error('Error in loadTabData:', error);
        if (isMounted) {
          setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
          setIsLoading(false);
        }
      }
    };
    
    loadTabData();
    
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [activeTab, user?.id, memoizedUpdateRiderPendingTrips]); // Removed debounceTimer from deps
  useEffect(() => {
    console.log('Component state updated:', {
      activeTab,
      isLoading,
      activeTripsLength: activeTrips.length,
      pendingTripsLength: pendingTrips.length,
      activeTrips,
      pendingTrips,
      error
    });
  }, [activeTab, isLoading, activeTrips, pendingTrips, error]);

  // Remove unused getPlaceName function

  const renderActiveTrips = useCallback((trip) => (
    <TableRow key={trip.tripId}>
      <TableCell>{formatDate(trip.date)}</TableCell>
      <TableCell>{trip.studentName || `${trip.studentFirstname} ${trip.studentLastname}`}</TableCell>
      <TableCell>
        {trip.studentTel && (
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
        )}
      </TableCell>
      <TableCell>{trip.pickUpName}</TableCell>
      <TableCell>{trip.destinationName}</TableCell>
      <TableCell>{trip.is_round_trip === '1' ? 'ไป-กลับ' : 'เที่ยวเดียว'}</TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="ดูรายละเอียด">
            <IconButton
              color="primary"
              onClick={() => {
                console.log('Viewing trip details:', trip);
                navigate(`/rider/trips/${trip.tripId}`);
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  ), [formatDate, navigate]);
  const handleImageError = useCallback((e, imageType) => {
    console.log(`Error loading ${imageType}:`, {
      src: e.target.src,
      error: e,
      profile: profile,
      vehicle: imageType.includes('car') || imageType.includes('insurance') ? vehicles.find(v => v.carPhoto === e.target.src.split('/').pop() || v.insurancePhoto === e.target.src.split('/').pop()) : null
    });

    if (imageType === 'profile picture') {
      e.target.src = defaultAvatar;
    } else if (imageType === 'QR code') {
      const currentSrc = e.target.src;
      setTimeout(() => {
        if (e.target) {
          const retryUrl = currentSrc.includes('/uploads/') 
            ? currentSrc 
            : `http://localhost:5000/${profile.QRscan}`;
          e.target.src = retryUrl;
        }
      }, 1000);
    } else {
      e.target.style.display = 'none';
    }
  }, [profile, vehicles]);

  // แสดงข้อมูล profile เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (profile) {
      console.log('Raw profile image data:', {
        RiderProfilePic: getProfileImageUrl(profile.RiderProfilePic),
        RiderStudentCard: profile.RiderStudentCard,
        QRscan: profile.QRscan,
        riderLicense: profile.riderLicense
      });
    }
  }, [profile]);

  // แสดงข้อมูล vehicles เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (vehicles.length > 0) {
      console.log('Raw vehicle image data:', vehicles.map(v => ({
        carId: v.carId,
        carPhoto: v.carPhoto,
        insurancePhoto: v.insurancePhoto
      })));
    }
  }, [vehicles]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar 
    sx={{ bgcolor: "secondary.main", width: 56, height: 56 }}
    src={getProfileImageUrl(profile?.RiderProfilePic)}
  >
    {!profile?.RiderProfilePic && (
      <>{profile?.riderFirstname?.[0]}{profile?.riderLastname?.[0]}</>
    )}
  </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="h4" component="div">
                  สวัสดี, {profile?.riderFirstname} {profile?.riderLastname}
                </Typography>
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  bgcolor: profile?.riderRate != null ? 'primary.light' : 'grey.300',
                  color: profile?.riderRate != null ? 'primary.contrastText' : 'text.secondary',
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                  ml: 1
                }}>
                  {profile?.riderRate != null ? (
                    <>
                      <StarIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="subtitle2" sx={{ lineHeight: 1 }}>
                        {parseFloat(profile.riderRate).toFixed(1)}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="subtitle2" sx={{ lineHeight: 1, fontSize: '0.75rem' }}>
                      ยังไม่มีคะแนน
                    </Typography>
                  )}
                </Box>
                <Tooltip title="แก้ไขโปรไฟล์">
                  <IconButton
                    onClick={handleOpenProfileEditDialog}
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
          <Tooltip title="ออกจากระบบ">
            <IconButton
              color="error"
              onClick={handleLogout}
              sx={{
                bgcolor: "error.light",
                "&:hover": { bgcolor: "error.main" },
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Memoized Vehicle Table */}
        {MemoizedVehicleTable}

        <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  {activeTab === 'pending' ? 'งานที่รอการตอบรับ' : 
                   activeTab === 'active' ? 'งานที่กำลังดำเนินการ' : 
                   'ประวัติการทำงาน'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={activeTab === 'pending' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('pending')}
                  >
                    งานที่รอการตอบรับ
                  </Button>
                  <Button
                    variant={activeTab === 'active' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('active')}
                  >
                    งานที่กำลังดำเนินการ
                  </Button>
                  <Button
                    variant={activeTab === 'history' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('history')}
                  >
                    ประวัติการทำงาน
                  </Button>
                </Box>
              </Box>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {activeTab === 'pending' && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>วันที่</TableCell>
                        <TableCell>ประเภทรถ</TableCell>
                        <TableCell>ต้นทาง</TableCell>
                        <TableCell>ปลายทาง</TableCell>
                        <TableCell>ประเภท</TableCell>
                        <TableCell>สถานะ</TableCell>
                        <TableCell>การจัดการ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                              <CircularProgress />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : riderVehicleTypes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            กรุณาเพิ่มยานพาหนะของคุณก่อน
                          </TableCell>
                        </TableRow>
                      ) : filteredPendingTrips.length > 0 ? (
                        filteredPendingTrips.map((trip) => (
                          <TableRow key={trip.tripId}>
                            <TableCell>{formatDate(trip.date)}</TableCell>
                            <TableCell>{
                              trip.carType === 'motorcycle' ? 'มอเตอร์ไซค์' : 
                              trip.carType === 'car' ? 'รถยนต์' : 
                              'ไม่ระบุ'
                            }</TableCell>
                            <TableCell>{trip.pickUpName || 'ไม่ระบุ'}</TableCell>
                            <TableCell>{trip.destinationName || 'ไม่ระบุ'}</TableCell>
                            <TableCell>{trip.is_round_trip === '1' ? 'ไป-กลับ' : 'เที่ยวเดียว'}</TableCell>
                            <TableCell>
                              <Chip 
                                label={trip.status === 'pending' ? 'รอดำเนินการ' : trip.status}
                                color={trip.status === 'pending' ? 'warning' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="รับงาน">
                                  <IconButton
                                    color="success"
                                    onClick={() => {
                                      console.log("Trip data:", trip);
                                      if (trip && trip.tripId) {
                                        handleAcceptTrip(trip.tripId);
                                      } else {
                                        console.error("Invalid trip data:", trip);
                                        setError("ไม่พบข้อมูลการเดินทาง");
                                      }
                                    }}
                                  >
                                    <CheckCircleIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            {pendingTrips.length > 0 
                              ? 'ไม่พบงานที่รองรับยานพาหนะของคุณในขณะนี้' 
                              : 'ไม่มีงานที่รอการตอบรับ'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {activeTab === 'history' && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>รหัสการเดินทาง</TableCell>
                        <TableCell>รหัสนักศึกษา</TableCell>
                        <TableCell>จุดนัดรับ</TableCell>
                        <TableCell>จุดหมายปลายทาง</TableCell>
                        <TableCell>วันที่/เวลา</TableCell>
                        <TableCell>ประเภทรถ</TableCell>
                        <TableCell>สถานะ</TableCell>
                        <TableCell>ไป-กลับ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {isLoadingHistory ? (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                              <CircularProgress />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : tripHistory.length > 0 ? (
                        tripHistory.map((trip) => (
                          <TableRow key={trip.tripId}>
                            <TableCell>{trip.tripId}</TableCell>
                            <TableCell>{trip.studentId}</TableCell>
                            <TableCell>{trip.pickUpName || trip.pickUpPlaceName || 'ไม่ระบุ'}</TableCell>
                            <TableCell>{trip.destinationName || trip.destinationPlaceName || 'ไม่ระบุ'}</TableCell>
                            <TableCell>{formatDate(trip.date)}</TableCell>
                            <TableCell>{trip.carType || 'ไม่ระบุ'}</TableCell>
                            <TableCell>
                              <Chip 
                                label={
                                  trip.status === 'completed' ? 'สำเร็จ' :
                                  trip.status === 'cancelled' ? 'ยกเลิก' : trip.status
                                } 
                                color={
                                  trip.status === 'completed' ? 'success' : 
                                  trip.status === 'cancelled' ? 'error' : 'default'
                                }
                                size="small"
                                sx={{
                                  fontWeight: 'medium',
                                  minWidth: 80,
                                  '&.MuiChip-colorSuccess': {
                                    bgcolor: 'success.light',
                                    color: 'success.contrastText',
                                    '&:hover': {
                                      bgcolor: 'success.main',
                                    }
                                  },
                                  '&.MuiChip-colorError': {
                                    bgcolor: 'error.light',
                                    color: 'error.contrastText',
                                    '&:hover': {
                                      bgcolor: 'error.main',
                                    }
                                  },
                                  '&.MuiChip-colorDefault': {
                                    bgcolor: 'grey.200',
                                    color: 'text.primary',
                                    '&:hover': {
                                      bgcolor: 'grey.300',
                                    }
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              {trip.is_round_trip ? '✓' : '✗'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            ไม่พบประวัติการทำงาน
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {activeTab === 'active' && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>วันที่</TableCell>
                        <TableCell>ชื่อ-นามสกุล</TableCell>
                        <TableCell>เบอร์โทรศัพท์</TableCell>
                        <TableCell>ต้นทาง</TableCell>
                        <TableCell>ปลายทาง</TableCell>
                        <TableCell>ประเภท</TableCell>
                        <TableCell>การจัดการ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                              <CircularProgress />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : activeTrips.length > 0 ? (
                        activeTrips.map((trip) => renderActiveTrips(trip))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            ไม่มีงานที่กำลังดำเนินการ
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              {activeTab === 'profile' && (
                <Paper sx={{ p: 3, mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    โปรไฟล์
                  </Typography>
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        alt={profile?.riderFirstname}
                        src={getProfileImageUrl(profile?.RiderProfilePic, profile?.RiderProfilePicUrl)}
                        sx={{ width: 120, height: 120, mb: 2 }}
                        imgProps={{
                          onError: (e) => {
                            // Fallback to default avatar if image fails to load
                            e.target.src = defaultAvatar;
                          }
                        }}
                      />
                      <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>
                        {profile?.riderFirstname} {profile?.riderLastname}
                      </Typography>
                      
                      {/* New Rating Display Box */}
                      <Box sx={{
                        width: '100%',
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                        borderRadius: 2,
                        p: 2,
                        mb: 2,
                        textAlign: 'center',
                        boxShadow: 2
                      }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          คะแนนการให้บริการ
                        </Typography>
                        {profile?.riderRate != null ? (
                          <>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              justifyContent: 'center',
                              mb: 1
                            }}>
                              <Rating 
                                value={parseFloat(profile.riderRate)}
                                precision={0.1}
                                readOnly
                                size="large"
                                sx={{ 
                                  color: 'warning.main',
                                  '& .MuiRating-iconFilled': {
                                    color: 'warning.main',
                                  },
                                  '& .MuiRating-iconHover': {
                                    color: 'warning.dark',
                                  },
                                }}
                              />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                              {parseFloat(profile.riderRate).toFixed(1)}
                              <Typography component="span" variant="body1" sx={{ ml: 0.5, opacity: 0.8 }}>
                                / 5.0
                              </Typography>
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="h6" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                            ยังไม่มีคะแนน
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        mb: 1
                      }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                          คะแนนการให้บริการ
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          bgcolor: 'background.paper',
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          boxShadow: 1
                        }}>
                          {(() => {
                            // Debug log the rating value
                            const ratingValue = parseFloat(profile?.riderRate);
                            console.log('Rendering Rating with value:', ratingValue, 'Type:', typeof ratingValue);
                            return (
                              <>
                                <Rating 
                                  value={isNaN(ratingValue) ? 0 : ratingValue}
                                  precision={0.5} 
                                  readOnly 
                                  size="medium"
                                  sx={{ color: 'warning.main' }}
                                />
                                <Typography 
                                  variant="h6" 
                                  color="primary"
                                  sx={{ 
                                    ml: 1,
                                    fontWeight: 'bold',
                                    lineHeight: 1
                                  }}
                                >
                                  {isNaN(ratingValue) ? 'N/A' : ratingValue.toFixed(1)}
                                </Typography>
                              </>
                            );
                          })()}
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {profile?.riderEmail}
                      </Typography>
                    </Box>
                  </Paper>
                  <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      รูปโปรไฟล์
                    </Typography>
                    {(profile?.RiderProfilePic || filePreviews.RiderProfilePic) && (
                      <Box sx={{ mb: 2 }}>
                        <img
                          src={filePreviews.RiderProfilePic || getProfileImageUrl(profile?.RiderProfilePic, profile?.RiderProfilePicUrl)}
                          alt="รูปโปรไฟล์"
                          style={{ 
                            width: '150px', 
                            height: '150px', 
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #ccc'
                          }}
                          onError={(e) => {
                            // Fallback to default avatar if image fails to load
                            e.target.src = defaultAvatar;
                          }}
                        />
                      </Box>
                    )}
                    <input
                      accept="image/*"
                      type="file"
                      onChange={(e) => handleProfileFileChange(e, 'RiderProfilePic')}
                      style={{ marginTop: '10px' }}
                    />
                  </Box>
                  <TextField
                    autoFocus
                    margin="dense"
                    name="riderFirstname"
                    label="ชื่อ"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={profileFormData.riderFirstname}
                    onChange={handleProfileFormChange}
                    required
                  />
                  <TextField
                    margin="dense"
                    name="riderLastname"
                    label="นามสกุล"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={profileFormData.riderLastname}
                    onChange={handleProfileFormChange}
                    required
                  />
                  <TextField
                    margin="dense"
                    name="riderTel"
                    label="เบอร์โทรศัพท์"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={profileFormData.riderTel}
                    onChange={handleProfileFormChange}
                    required
                  />
                  <TextField
                    margin="dense"
                    name="riderAddress"
                    label="ที่อยู่"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={profileFormData.riderAddress}
                    onChange={handleProfileFormChange}
                    required
                    multiline
                    rows={3}
                  />
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      รูปบัตรนักศึกษา
                    </Typography>
                    {(profile?.RiderStudentCard || filePreviews.RiderStudentCard) && (
                      <Box sx={{ mb: 2 }}>
                        <img
                          src={filePreviews.RiderStudentCard || getProfileImageUrl(profile?.RiderStudentCard)}
                          alt="บัตรนักศึกษา"
                          style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }}
                          onError={(e) => handleImageError(e, 'student card')}
                        />
                      </Box>
                    )}
                    <input
                      accept="image/*"
                      type="file"
                      onChange={(e) => handleProfileFileChange(e, 'RiderStudentCard')}
                    />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      QR Code
                    </Typography>
                    {(profile?.QRscan || filePreviews.QRscan) && (
                      <Box sx={{ mb: 2 }}>
                        <img
                          src={filePreviews.QRscan || getProfileImageUrl(profile.QRscan)}
                          alt="QR Code"
                          style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }}
                          onError={(e) => {
                            console.log('QR Code error, retrying with direct path:', {
                              original: e.target.src,
                              profile
                            });
                            
                            // Fallback to default if still fails
                            e.target.onerror = () => {
                              e.target.src = defaultAvatar;
                            };
                          }}
                        />
                      </Box>
                    )}
                    <input
                      accept="image/*"
                      type="file"
                      onChange={(e) => handleProfileFileChange(e, 'QRscan')}
                    />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      ใบขับขี่
                    </Typography>
                    {(profile?.riderLicense || filePreviews.riderLicense) && (
                      <Box sx={{ mb: 2 }}>
                        <img
                          src={filePreviews.riderLicense || getProfileImageUrl(profile?.riderLicense)}
                          alt="ใบขับขี่"
                          style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }}
                          onError={(e) => handleImageError(e, 'license')}
                        />
                      </Box>
                    )}
                    <input
                      accept="image/*"
                      type="file"
                      onChange={(e) => handleProfileFileChange(e, 'riderLicense')}
                    />
                  </Box>
                </Paper>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Dialog
        open={openProfileDialog}
        onClose={isSubmitting ? undefined : handleCloseProfileDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 3,
            overflow: 'hidden',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            '@media (max-width: 600px)': {
              margin: '16px',
              width: 'calc(100% - 32px)'
            }
          },
          component: 'form',
          onSubmit: handleProfileSubmit
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          py: 1.5,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          '@media (max-width: 600px)': {
            py: 1,
            px: 2
          }
        }}>
          <Box display="flex" alignItems="center">
            <EditIcon sx={{ mr: 1, fontSize: '1.5rem' }} />
            <Typography variant="h6" component="div" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              แก้ไขโปรไฟล์
            </Typography>
          </Box>
          <IconButton 
            onClick={handleCloseProfileDialog}
            size="small"
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <DialogContent sx={{ 
            py: 3, 
            px: { xs: 2, sm: 3 }, 
            flex: '1 1 auto',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px'
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '10px'
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '10px',
              '&:hover': {
                background: '#555'
              }
            }
          }}>
            {profileError && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: 1
                }}
                onClose={() => setProfileError('')}
              >
                {profileError}
              </Alert>
            )}
            
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ height: '100%' }}>
              {/* Left Column - Profile Picture */}
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Paper 
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'sticky',
                    top: 0
                  }}
                >
                  <Box 
                    sx={{
                      position: 'relative',
                      mb: 2,
                      '&:hover .profile-edit-overlay': {
                        opacity: 1,
                      },
                    }}
                  >
                    <Avatar
                      src={filePreviews.RiderProfilePic || getProfileImageUrl(profile?.RiderProfilePic, profile?.RiderProfilePicUrl) || defaultAvatar}
                      alt="รูปโปรไฟล์"
                      sx={{
                        width: 150,
                        height: 150,
                        border: '3px solid',
                        borderColor: 'primary.main',
                        boxShadow: 3,
                        '&:hover': {
                          opacity: 0.9,
                        },
                      }}
                      onError={(e) => {
                        e.target.src = defaultAvatar;
                      }}
                    />
                    <Box
                      className="profile-edit-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s',
                        cursor: 'pointer',
                      }}
                      onClick={() => document.getElementById('profile-picture-upload').click()}
                    >
                      <EditIcon sx={{ color: 'white', fontSize: 30 }} />
                    </Box>
                  </Box>
                  
                  <input
                    id="profile-picture-upload"
                    accept="image/*"
                    type="file"
                    onChange={(e) => handleProfileFileChange(e, 'RiderProfilePic')}
                    style={{ display: 'none' }}
                  />
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => document.getElementById('profile-picture-upload').click()}
                    sx={{ mt: 1 }}
                  >
                    อัปโหลดรูปโปรไฟล์
                  </Button>
                  
                  <Typography 
                    variant="caption" 
                    color="textSecondary" 
                    align="center"
                    sx={{ mt: 1, display: 'block' }}
                  >
                    ไฟล์รูปภาพ JPG, PNG ขนาดไม่เกิน 5MB
                  </Typography>
                </Paper>
              </Grid>
              
              {/* Right Column - Form Fields */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <Grid item xs={12}>
                    <TextField
                      autoFocus
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      name="riderFirstname"
                      label="ชื่อ"
                      type="text"
                      value={profileFormData.riderFirstname}
                      onChange={handleProfileFormChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      name="riderLastname"
                      label="นามสกุล"
                      type="text"
                      value={profileFormData.riderLastname}
                      onChange={handleProfileFormChange}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      name="riderTel"
                      label="เบอร์โทรศัพท์"
                      type="tel"
                      value={profileFormData.riderTel}
                      onChange={handleProfileFormChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      name="riderAddress"
                      label="ที่อยู่"
                      type="text"
                      value={profileFormData.riderAddress}
                      onChange={handleProfileFormChange}
                      required
                      multiline
                      rows={3}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ mt: -10, alignItems: 'flex-start' }}>
                            <LocationOnIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  {/* Student Card Section */}
                  <Grid item xs={12}>
                    <Paper 
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        mb: 2
                      }}
                    >
                      <Box display="flex" alignItems="center" mb={2}>
                        <SchoolIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">
                          รูปบัตรนักศึกษา
                        </Typography>
                      </Box>
                        {profile?.RiderStudentCard || filePreviews.RiderStudentCard ? (
                          <Box sx={{ position: 'relative', mb: 2 }}>
                            <img
                              src={filePreviews.RiderStudentCard || getProfileImageUrl(profile?.RiderStudentCard)}
                              alt="บัตรนักศึกษา"
                              style={{ 
                                width: '100%', 
                                maxWidth: '400px',
                                height: 'auto', 
                                borderRadius: '8px',
                                border: '1px solid #e0e0e0'
                              }}
                              onError={(e) => handleImageError(e, 'student card')}
                            />
                            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => document.getElementById('student-card-upload').click()}
                              >
                                เปลี่ยนรูป
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<DeleteIcon />}
                                onClick={() => handleRemoveFile('RiderStudentCard')}
                              >
                                ลบ
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Box 
                            sx={{
                              border: '2px dashed',
                              borderColor: 'divider',
                              borderRadius: 2,
                              p: 3,
                              textAlign: 'center',
                              cursor: 'pointer',
                              '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: 'action.hover'
                              }
                            }}
                            onClick={() => document.getElementById('student-card-upload').click()}
                          >
                            <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              คลิกเพื่ออัปโหลดรูปบัตรนักศึกษา
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              ไฟล์รูปภาพ JPG, PNG ขนาดไม่เกิน 5MB
                            </Typography>
                          </Box>
                        )}
                        <input
                          id="student-card-upload"
                          accept="image/*"
                          type="file"
                          onChange={(e) => handleProfileFileChange(e, 'RiderStudentCard')}
                          style={{ display: 'none' }}
                        />
                    </Paper>
                  </Grid>
                  
                  {/* QR Code Section */}
                  <Grid item xs={12} md={6}>
                    <Paper 
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        mb: 2,
                        height: '100%'
                      }}
                    >
                      <Box display="flex" alignItems="center" mb={2}>
                        <QrCodeIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">
                          QR Code
                        </Typography>
                      </Box>
                      
                      {profile?.QRscan || filePreviews.QRscan ? (
                        <Box sx={{ textAlign: 'center' }}>
                          <img
                            src={filePreviews.QRscan || getProfileImageUrl(profile.QRscan)}
                            alt="QR Code"
                            style={{ 
                              maxWidth: '200px',
                              height: 'auto',
                              margin: '0 auto',
                              display: 'block'
                            }}
                            onError={(e) => {
                              console.log('QR Code error, retrying with direct path:', {
                                original: e.target.src,
                                profile
                              });
                              e.target.src = defaultAvatar;
                            }}
                          />
                          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => document.getElementById('qrcode-upload').click()}
                            >
                              เปลี่ยนรูป
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleRemoveFile('QRscan')}
                            >
                              ลบ
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Box 
                          sx={{
                            border: '2px dashed',
                            borderColor: 'divider',
                            borderRadius: 2,
                            p: 3,
                            textAlign: 'center',
                            cursor: 'pointer',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '150px',
                            '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: 'action.hover'
                            }
                          }}
                          onClick={() => document.getElementById('qrcode-upload').click()}
                        >
                          <QrCodeIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            คลิกเพื่ออัปโหลด QR Code
                          </Typography>
                        </Box>
                      )}
                      <input
                        id="qrcode-upload"
                        accept="image/*"
                        type="file"
                        onChange={(e) => handleProfileFileChange(e, 'QRscan')}
                        style={{ display: 'none' }}
                      />
                    </Paper>
                  </Grid>
                  
                  {/* Driver's License Section */}
                  <Grid item xs={12} md={6}>
                    <Paper 
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        mb: 2,
                        height: '100%'
                      }}
                    >
                      <Box display="flex" alignItems="center" mb={2}>
                        <DriveEtaIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">
                          ใบอนุญาตขับขี่
                        </Typography>
                      </Box>
                      
                      {profile?.riderLicense || filePreviews.riderLicense ? (
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={filePreviews.riderLicense || getProfileImageUrl(profile?.riderLicense)}
                            alt="ใบอนุญาตขับขี่"
                            style={{ 
                              width: '100%',
                              maxWidth: '400px',
                              height: 'auto',
                              borderRadius: '8px',
                              border: '1px solid #e0e0e0'
                            }}
                            onError={(e) => handleImageError(e, 'license')}
                          />
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => document.getElementById('license-upload').click()}
                            >
                              เปลี่ยนรูป
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleRemoveFile('riderLicense')}
                            >
                              ลบ
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Box 
                          sx={{
                            border: '2px dashed',
                            borderColor: 'divider',
                            borderRadius: 2,
                            p: 3,
                            textAlign: 'center',
                            cursor: 'pointer',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '150px',
                            '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: 'action.hover'
                            }
                          }}
                          onClick={() => document.getElementById('license-upload').click()}
                        >
                          <DescriptionIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            คลิกเพื่ออัปโหลดใบอนุญาตขับขี่
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            ไฟล์รูปภาพ JPG, PNG ขนาดไม่เกิน 5MB
                          </Typography>
                        </Box>
                      )}
                      <input
                        id="license-upload"
                        accept="image/*"
                        type="file"
                        onChange={(e) => handleProfileFileChange(e, 'riderLicense')}
                        style={{ display: 'none' }}
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ 
            p: 2, 
            borderTop: '1px solid', 
            borderColor: 'divider',
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'background.paper',
            zIndex: 1,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
            '& > *': {
              m: '0 !important'
            },
            '@media (max-width: 600px)': {
              px: 2,
              py: 1.5
            }
          }}>
            <Button 
              onClick={handleCloseProfileDialog}
              variant="outlined"
              size={window.innerWidth < 600 ? 'small' : 'medium'}
              startIcon={<CloseIcon />}
              sx={{
                minWidth: { xs: 'auto', sm: '120px' },
                whiteSpace: 'nowrap',
                '& .MuiButton-startIcon': {
                  marginRight: { xs: 0.5, sm: 1 }
                }
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>ยกเลิก</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}><CloseIcon fontSize="small" /></Box>
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              size={window.innerWidth < 600 ? 'small' : 'medium'}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={isSubmitting}
              sx={{
                minWidth: { xs: 'auto', sm: '180px' },
                whiteSpace: 'nowrap',
                '& .MuiButton-startIcon': {
                  marginLeft: 0,
                  marginRight: { xs: 0.5, sm: 1 },
                  '& > *:nth-of-type(1)': {
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }
                },
                '&.Mui-disabled': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  opacity: 0.7
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>กำลังบันทึก...</Box>
                  <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                    <CircularProgress size={20} color="inherit" />
                  </Box>
                </>
              ) : (
                <>
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>บันทึกการเปลี่ยนแปลง</Box>
                  <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                    <SaveIcon />
                  </Box>
                </>
              )}
            </Button>
          </DialogActions>
        </div>
      </Dialog>

      <Dialog
        open={openVehicleDialog}
        onClose={() => setOpenVehicleDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 1.5
        }}>
          <DirectionsCarIcon />
          {currentVehicle ? "แก้ไขข้อมูลยานพาหนะ" : "เพิ่มยานพาหนะใหม่"}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
                ประเภทรถ
              </Typography>
              <ToggleButtonGroup
                color="primary"
                value={vehicleFormData.carType}
                exclusive
                onChange={(e, newType) => {
                  if (newType !== null) {
                    setVehicleFormData({
                      ...vehicleFormData,
                      carType: newType,
                    });
                  }
                }}
                fullWidth
                sx={{ mb: 2 }}
              >
                <ToggleButton value="motorcycle" sx={{ py: 1.5 }}>
                  มอเตอร์ไซค์
                </ToggleButton>
                <ToggleButton value="car" sx={{ py: 1.5 }}>
                  รถยนต์
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ทะเบียนรถ"
                value={vehicleFormData.plate}
                onChange={(e) =>
                  setVehicleFormData({ ...vehicleFormData, plate: e.target.value })
                }
                variant="outlined"
                margin="normal"
                required
                InputLabelProps={{
                  shrink: true,
                }}
                placeholder="เช่น กข 1234"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="ยี่ห้อ"
                value={vehicleFormData.brand}
                onChange={(e) =>
                  setVehicleFormData({ ...vehicleFormData, brand: e.target.value })
                }
                variant="outlined"
                margin="normal"
                required
                InputLabelProps={{
                  shrink: true,
                }}
              >
                <MenuItem value="Honda">Honda</MenuItem>
                <MenuItem value="Yamaha">Yamaha</MenuItem>
                <MenuItem value="Suzuki">Suzuki</MenuItem>
                <MenuItem value="Kawasaki">Kawasaki</MenuItem>
                <MenuItem value="Other">อื่นๆ</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="รุ่น"
                value={vehicleFormData.model}
                onChange={(e) =>
                  setVehicleFormData({ ...vehicleFormData, model: e.target.value })
                }
                variant="outlined"
                margin="normal"
                required
                InputLabelProps={{
                  shrink: true,
                }}
                placeholder="เช่น Wave 125"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, mb: 2 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium', display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon color="primary" />
                เอกสารกรมธรรม์รถ
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                กรุณาอัปโหลดรูปถ่ายกรมธรรม์รถที่สามารถอ่านได้ชัดเจน
              </Typography>
              <Box sx={{ 
                border: '2px dashed', 
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
                textAlign: 'center',
                bgcolor: 'background.paper',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                }
              }}>
                {currentVehicle?.insurancePhoto || vehicleFiles.insurancePhoto ? (
                  <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    {(() => {
                      let imgSrc = defaultAvatar;
                      
                      try {
                        if (vehicleFiles.insurancePhoto) {
                          if (vehicleFiles.insurancePhoto instanceof Blob || vehicleFiles.insurancePhoto instanceof File) {
                            imgSrc = URL.createObjectURL(vehicleFiles.insurancePhoto);
                          } else if (typeof vehicleFiles.insurancePhoto === 'string') {
                            imgSrc = getVehicleImageUrl(vehicleFiles.insurancePhoto);
                          }
                        } else if (currentVehicle?.insurancePhoto) {
                          imgSrc = getVehicleImageUrl(currentVehicle.insurancePhoto);
                        }
                        
                        console.log('Rendering insurance photo with src:', imgSrc);
                        
                        return (
                          <img 
                            src={imgSrc}
                            alt="Insurance" 
                            style={{ 
                              maxWidth: '100%',
                              maxHeight: '200px',
                              marginBottom: '10px',
                              borderRadius: '4px',
                              objectFit: 'contain'
                            }}
                            onError={(e) => {
                              console.error('Error loading insurance photo:', {
                                error: e,
                                src: e.target.src,
                                vehicleFiles,
                                currentVehicle
                              });
                              e.target.src = defaultAvatar;
                            }}
                          />
                        );
                      } catch (error) {
                        console.error('Error rendering insurance photo:', error, { vehicleFiles, currentVehicle });
                        return (
                          <div style={{
                            width: '100%',
                            height: '200px',
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            color: '#666',
                            border: '1px dashed #ccc',
                            padding: '10px'
                          }}>
                            Error loading image
                          </div>
                        );
                      }
                    })()}
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => {
                        setVehicleFiles(prev => ({
                          ...prev,
                          insurancePhoto: null
                        }));
                        if (currentVehicle) {
                          setCurrentVehicle(prev => ({
                            ...prev,
                            insurancePhoto: null
                          }));
                        }
                      }}
                      sx={{ mt: 1 }}
                    >
                      ลบรูป
                    </Button>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<CloudUploadIcon />}
                  >
                    อัปโหลดรูปกรมธรรม์
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "insurancePhoto")}
                    />
                  </Button>
                )}
              </Box>
            </Paper>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium', display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhotoCameraIcon color="primary" />
                รูปภาพยานพาหนะ
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                อัปโหลดรูปภาพรถที่ชัดเจน มุมด้านข้างเห็นตัวรถทั้งหมด
              </Typography>
              
              <Box sx={{ 
                border: '2px dashed', 
                borderColor: 'divider',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                bgcolor: 'background.paper',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                }
              }}>
                {currentVehicle?.carPhoto || vehicleFiles.carPhoto ? (
                  <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <img 
                      src={vehicleFiles.carPhoto ? 
                        (vehicleFiles.carPhoto instanceof Blob ? 
                          URL.createObjectURL(vehicleFiles.carPhoto) : 
                          getVehicleImageUrl(vehicleFiles.carPhoto)) : 
                        getVehicleImageUrl(currentVehicle.carPhoto)
                      }
                      alt="Vehicle" 
                      style={{ 
                        maxWidth: '100%',
                        maxHeight: '200px',
                        marginBottom: '16px',
                        borderRadius: '8px',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        console.error('Error loading vehicle image:', e);
                        e.target.src = defaultAvatar;
                      }}
                    />
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      startIcon={<AutorenewIcon />}
                      onClick={() => document.getElementById('car-photo-upload').click()}
                      sx={{ mb: 1 }}
                    >
                      เปลี่ยนรูปภาพ
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => {
                        setVehicleFiles(prev => ({ ...prev, carPhoto: null }));
                        if (currentVehicle) {
                          setCurrentVehicle(prev => ({ ...prev, carPhoto: null }));
                        }
                      }}
                    >
                      ลบรูปภาพ
                    </Button>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{
                      py: 3,
                      borderStyle: 'dashed',
                      '&:hover': {
                        borderStyle: 'dashed',
                        bgcolor: 'transparent'
                      }
                    }}
                  >
                    <Box sx={{ textAlign: 'center', width: '100%' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <AddPhotoAlternateIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body1">คลิกเพื่ออัปโหลดรูปภาพรถ</Typography>
                        <Typography variant="caption" color="textSecondary">
                          รองรับไฟล์รูปภาพ (JPG, PNG) ขนาดไม่เกิน 5MB
                        </Typography>
                      </Box>
                    </Box>
                    <input
                      id="car-photo-upload"
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'carPhoto')}
                    />
                  </Button>
                )}
              </Box>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, borderTop: 1, borderColor: 'divider' }}>
          <Button 
            onClick={() => setOpenVehicleDialog(false)}
            color="inherit"
            sx={{ mr: 1 }}
          >
            ยกเลิก
          </Button>
          <Button 
            onClick={handleVehicleSubmit} 
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={isLoadingVehicles}
            sx={{ minWidth: 100 }}
          >
            {isLoadingVehicles ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'บันทึก'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      
      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      {/* Loading Overlay */}
      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <CircularProgress color="primary" size={60} />
        </Box>
      )}
    </Box>
  </Container>
  );
}

export default memo(RiderDashboard);
