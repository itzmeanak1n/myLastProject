import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, riderService, studentService, cancelAllRequests } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentTrips, setStudentTrips] = useState([]);
  const [riderPendingTrips, setRiderPendingTrips] = useState([]);
  const navigate = useNavigate();

  // Function to restore user session from localStorage
  const restoreSession = useCallback(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedProfile = localStorage.getItem('profile');
    const storedUserType = localStorage.getItem('userType');

    if (token && storedUser && storedProfile && storedUserType) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const parsedProfile = JSON.parse(storedProfile);
        
        // Set user and profile state
        setUser(parsedUser);
        setProfile(parsedProfile);
        
        // Return the restored user data
        return { user: parsedUser, profile: parsedProfile, userType: storedUserType };
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        return null;
      }
    }
    return null;
  }, []);

  // Memoize fetchUserProfile to prevent unnecessary re-renders
  const fetchUserProfileMemoized = useCallback(async (userType) => {
    setLoading(true);
    setError(null);
    
    try {
      // Skip if we don't have a valid user type
      if (!userType) {
        console.log('No user type provided, skipping profile fetch');
        return;
      }

      console.log(`Fetching profile for user type: ${userType}`);
      
      let profileResponse;
      try {
        if (userType === 'rider') {
          profileResponse = await riderService.getProfile();
        } else if (userType === 'student') {
          profileResponse = await studentService.getProfile();
        } else if (userType === 'admin') {
          profileResponse = await authService.getProfile('admin');
        } else {
          throw new Error('Invalid user type for fetching profile');
        }
      } catch (error) {
        // If the error is a cancellation, just return and let the new request handle it
        if (error.name === 'CanceledError' || error.message.includes('canceled')) {
          console.log('Profile fetch was canceled, likely due to a new request');
          return;
        }
        throw error; // Re-throw other errors
      }

      if (profileResponse?.data) {
        const responseData = profileResponse.data;
        const profileData = responseData.profile || responseData; // Handle both nested and flat structures
        
        console.log('=== Profile Data from API ===');
        console.log('Full response:', profileResponse);
        console.log('Profile data object:', profileData);
        console.log('Profile keys:', Object.keys(profileData));
        
        // Update profile with the actual profile data
        console.log('=== Setting profile state ===');
        setProfile(profileData);
        
        // Update user with the correct fields from the profile
        console.log('=== Updating user state ===');
        setUser(prevUser => {
          const updatedUser = {
            ...prevUser,
            id: profileData.id || profileData.studentId || profileData.riderId,
            userType,
            email: profileData.email || profileData.userEmail || profileData.riderEmail || profileData.studentEmail,
            firstname: profileData.firstname || profileData.userFirstname || profileData.riderFirstname,
            lastname: profileData.lastname || profileData.userLastname || profileData.riderLastname
          };
          console.log('Updated user object:', updatedUser);
          return updatedUser;
        });

        // Fetch additional data based on user type
        if (userType === 'student') {
          const tripsResponse = await studentService.getTrips();
          setStudentTrips(tripsResponse.data || []);
        } else if (userType === 'rider') {
          const pendingTripsResponse = await riderService.getPendingTrips();
          setRiderPendingTrips(pendingTripsResponse || []);
        }
      } else {
        console.error('No profile data received:', profileResponse);
        throw new Error('No profile data received');
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setError(error.message || 'Failed to fetch user profile');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize authentication state
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        // First try to restore from localStorage
        const restoredSession = restoreSession();
        const token = localStorage.getItem('token');
        const storedUserType = localStorage.getItem('userType');
        
        if (token && storedUserType) {
          // We have a token, try to refresh the session in the background
          // but don't wait for it to complete before rendering
          const refreshSession = async () => {
            try {
              await fetchUserProfileMemoized(storedUserType);
            } catch (error) {
              console.error('Error refreshing session:', error);
              // Even if refresh fails, keep the user logged in if we have valid local data
              if (!restoredSession && isMounted) {
                const isPublicPage = ['/login', '/register', '/register/student', '/register/rider', '/', '/home'].includes(window.location.pathname);
                if (!isPublicPage) {
                  navigate('/login');
                }
              }
            }
          };
          
          // Don't await this - let it run in the background
          refreshSession();
        } else {
          // No token or user type in localStorage
          if (isMounted) {
            const isPublicPage = ['/login', '/register', '/register/student', '/register/rider', '/', '/home'].includes(window.location.pathname);
            if (!isPublicPage) {
              navigate('/login');
            }
          }
        }
      } catch (error) {
        console.error('Error in auth initialization:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    
    // Listen for storage events to handle logout from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        // Token was removed from another tab
        window.location.href = '/login';
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const fetchUserProfile = async (userType) => {
    setLoading(true);
    setError(null);
    
    try {
      // Skip if we don't have a valid user type
      if (!userType) {
        console.log('No user type provided, skipping profile fetch');
        return;
      }

      console.log(`Fetching profile for user type: ${userType}`);
      
      let profileResponse;
      try {
        if (userType === 'rider') {
          profileResponse = await riderService.getProfile();
        } else if (userType === 'student') {
          profileResponse = await studentService.getProfile();
        } else if (userType === 'admin') {
          profileResponse = await authService.getProfile('admin');
        } else {
          throw new Error('Invalid user type for fetching profile');
        }
      } catch (error) {
        // If the error is a cancellation, just return and let the new request handle it
        if (error.name === 'CanceledError' || error.message.includes('canceled')) {
          console.log('Profile fetch was canceled, likely due to a new request');
          return;
        }
        throw error; // Re-throw other errors
      }

      if (profileResponse?.data) {
        const profileData = profileResponse.data;
        console.log('Profile data received:', profileData);
        
        // Update profile
        setProfile(profileData);
        
        // Update user
        setUser(prevUser => ({
          ...prevUser,
          id: profileData.riderId || profileData.studentId || profileData.id,
          userType,
          email: profileData.riderEmail || profileData.studentEmail || profileData.email,
          firstname: profileData.riderFirstname || profileData.studentFirstname || profileData.firstname || '',
          lastname: profileData.riderLastname || profileData.studentLastname || profileData.lastname || ''
        }));

        // Fetch additional data based on user type
        if (userType === 'student') {
          const tripsResponse = await studentService.getTrips();
          setStudentTrips(tripsResponse.data || []);
        } else if (userType === 'rider') {
          const pendingTripsResponse = await riderService.getPendingTrips();
          setRiderPendingTrips(pendingTripsResponse || []);
        }
      } else {
        console.error('No profile data received:', profileResponse);
        throw new Error('ไม่พบข้อมูลโปรไฟล์');
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfileInContext = (newProfileData) => {
    console.log('Updating profile with new data:', newProfileData);
    
    setProfile(prevProfile => {
      if (!prevProfile) return newProfileData;
      
      // Create a new profile object with all fields properly merged
      const updatedProfile = {
        ...prevProfile, // Keep existing profile data
        ...newProfileData, // Apply new data
        // Handle image fields specifically to ensure they're not lost
        RiderProfilePic: newProfileData.RiderProfilePic !== undefined ? newProfileData.RiderProfilePic : prevProfile.RiderProfilePic,
        RiderStudentCard: newProfileData.RiderStudentCard !== undefined ? newProfileData.RiderStudentCard : prevProfile.RiderStudentCard,
        QRscan: newProfileData.QRscan !== undefined ? newProfileData.QRscan : prevProfile.QRscan,
        riderLicense: newProfileData.riderLicense !== undefined ? newProfileData.riderLicense : prevProfile.riderLicense,
        // Keep other existing fields if not being updated
        riderFirstname: newProfileData.riderFirstname !== undefined ? newProfileData.riderFirstname : (prevProfile.riderFirstname || ''),
        riderLastname: newProfileData.riderLastname !== undefined ? newProfileData.riderLastname : (prevProfile.riderLastname || ''),
        riderTel: newProfileData.riderTel !== undefined ? newProfileData.riderTel : (prevProfile.riderTel || ''),
        riderAddress: newProfileData.riderAddress !== undefined ? newProfileData.riderAddress : (prevProfile.riderAddress || ''),
        riderEmail: newProfileData.riderEmail !== undefined ? newProfileData.riderEmail : (prevProfile.riderEmail || ''),
        riderNationalId: newProfileData.riderNationalId !== undefined ? newProfileData.riderNationalId : (prevProfile.riderNationalId || '')
      };
      
      console.log('Updated profile in context:', updatedProfile);
      
      // Update localStorage
      localStorage.setItem('profile', JSON.stringify(updatedProfile));
      
      return updatedProfile;
    });
    
    // Also update user data if email or name changed
    if (newProfileData.riderEmail || newProfileData.riderFirstname || newProfileData.riderLastname) {
      setUser(prevUser => {
        if (!prevUser) return prevUser;
        
        const updatedUser = {
          ...prevUser,
          email: newProfileData.riderEmail !== undefined ? newProfileData.riderEmail : prevUser.email,
          firstname: newProfileData.riderFirstname !== undefined ? newProfileData.riderFirstname : prevUser.firstname,
          lastname: newProfileData.riderLastname !== undefined ? newProfileData.riderLastname : prevUser.lastname
        };
        
        console.log('Updated user in context:', updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return updatedUser;
      });
    }
  };

  const logout = useCallback(async () => {
    try {
      // Clear sensitive data first
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      
      // Reset all states
      setUser(null);
      setProfile(null);
      setStudentTrips([]);
      setRiderPendingTrips([]);
      
      // Cancel all pending requests after state is cleared
      cancelAllRequests('User logged out');
      
      // Add a small delay to ensure state updates before navigation
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Use window.location.href instead of navigate to ensure a full page reload
      // This prevents any remaining React components from making requests
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
      // Force redirect to login even if there was an error
      window.location.href = '/login';
    }
  }, [navigate]);

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isStudent = () => {
    return user?.role === 'student';
  };

  const isRider = () => {
    return user?.role === 'rider';
  };

  const updateStudentTrips = useCallback(async () => {
    try {
      const tripsResponse = await studentService.getTrips();
      setStudentTrips(tripsResponse.data);
      return tripsResponse.data; // Return the data so we can use it in the component
    } catch (err) {
      console.error('Failed to update student trips:', err);
      throw err;
    }
  }, []); // No dependencies since we're using the latest state

  // Login function to handle user authentication
  const login = useCallback(async (email, password, userType = 'student') => {
    setLoading(true);
    setError(null);

    try {
      // Call the authentication service with userType
      const response = await authService.login({ 
        email, 
        password, 
        userType // Add userType to the request
      });
      
      console.log('Login response:', response);
      
      if (response && response.data) {
        const { token, user: userData, role } = response.data;
        
        if (!token || !userData) {
          throw new Error('Invalid login response: Missing token or user data');
        }
        
        // Store the token and user data in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Use the provided userType or the one from the response
        const finalUserType = (role || userData.role || userType).toLowerCase();
        
        if (['student', 'rider', 'admin'].includes(finalUserType)) {
          localStorage.setItem('userType', finalUserType);
          
          // Set user data in context
          setUser({
            id: userData.id || userData._id || userData.studentId || userData.riderId,
            email: userData.email || userData.userEmail || userData.riderEmail,
            firstname: userData.firstname || userData.userFirstname || userData.riderFirstname || '',
            lastname: userData.lastname || userData.userLastname || userData.riderLastname || '',
            role: finalUserType
          });
          
          // Fetch the full profile data
          try {
            await fetchUserProfileMemoized(finalUserType);
          } catch (profileError) {
            console.error('Error fetching profile:', profileError);
            // Continue even if profile fetch fails
          }
          
          return { 
            success: true, 
            userType: finalUserType,
            user: userData
          };
        } else {
          throw new Error('Unauthorized: Invalid user role');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.response) {
        // Handle different HTTP error statuses
        if (error.response.status === 400) {
          errorMessage = 'Invalid request. Please check your input.';
        } else if (error.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (error.response.status === 403) {
          errorMessage = 'Access denied. Please contact support.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfileMemoized]);

  const updateRiderPendingTrips = useCallback(async () => {
    try {
      const pendingTripsResponse = await riderService.getPendingTrips();
      setRiderPendingTrips(pendingTripsResponse);
      return pendingTripsResponse; // Make sure to return the response
    } catch (err) {
      console.error('Failed to update rider pending trips:', err);
      throw err; // Re-throw to handle in the component
    }
  }, []); // No dependencies since we're using the latest state

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      error,
      login,
      logout,
      isAdmin,
      isStudent,
      isRider,
      updateProfileInContext,
      studentTrips,
      riderPendingTrips,
      updateStudentTrips,
      updateRiderPendingTrips
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 