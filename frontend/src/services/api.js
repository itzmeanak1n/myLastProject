import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Create a map to store cancel tokens
const cancelTokens = new Map();

// Create a base axios instance with interceptors
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token and handle refresh
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip auth checks for authentication-related endpoints
    const authEndpoints = ['/auth/'];
    const isAuthEndpoint = authEndpoints.some(endpoint => config.url.includes(endpoint));
    
    if (isAuthEndpoint) {
      return config;
    }

    // Get the current token
    const token = localStorage.getItem('token');
    
    // Only add auth header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Skip cancellation for critical endpoints to prevent UI issues
    const excludedEndpoints = [
      '/students/trips',
      '/students/profile',
      '/riders/profile',
      '/auth/profile',
      '/riders/vehicles' // Don't cancel vehicle requests
    ];
    
    // Check if this URL should be excluded from cancellation
    const shouldExclude = config.url && excludedEndpoints.some(endpoint => 
      config.url.includes(endpoint)
    );
    
    if (shouldExclude) {
      return config;
    }
    
    // Only add cancel token for GET requests that aren't excluded
    if (config.method?.toLowerCase() === 'get' && config.cancelToken === undefined) {
      const source = axios.CancelToken.source();
      config.cancelToken = source.token;
      
      // Generate a request ID that includes the full URL and params
      const requestId = `${config.method}-${config.url}${config.params ? `?${new URLSearchParams(config.params).toString()}` : ''}`;
      
      // If there's a pending request to the exact same endpoint with same params, cancel it
      if (cancelTokens.has(requestId)) {
        const pendingSource = cancelTokens.get(requestId);
        if (pendingSource) {
          pendingSource.cancel('Request canceled: duplicate request detected');
        }
      }
      
      // Store the cancel token source
      cancelTokens.set(requestId, source);
      
      // Clean up the token when the request completes
      config.transformResponse = [
        ...(Array.isArray(config.transformResponse) ? config.transformResponse : []),
        (data, headers) => {
          cancelTokens.delete(requestId);
          return data;
        }
      ];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and cleanup
axiosInstance.interceptors.response.use(
  (response) => {
    // Skip cleanup for excluded endpoints
    const excludedEndpoints = [
      '/students/trips',
      '/students/profile',
      '/riders/profile',
      '/auth/profile',
      '/riders/vehicles'
    ];
    
    if (response.config.url && excludedEndpoints.some(ep => response.config.url.includes(ep))) {
      return response;
    }
    
    // Clean up the cancel token for successful responses
    if (response.config) {
      const requestId = `${response.config.method}-${response.config.url}${response.config.params ? `?${new URLSearchParams(response.config.params).toString()}` : ''}`;
      if (cancelTokens.has(requestId)) {
        cancelTokens.delete(requestId);
      }
    }
    return response;
  },
  (error) => {
    // Don't log or handle canceled requests as errors
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Clean up on error for non-canceled requests
    if (error.config) {
      const requestId = `${error.config.method}-${error.config.url}${error.config.params ? `?${new URLSearchParams(error.config.params).toString()}` : ''}`;
      if (cancelTokens.has(requestId)) {
        cancelTokens.delete(requestId);
      }
    }

    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Don't process if this is a canceled request
      if (axios.isCancel(error)) {
        return Promise.reject(error);
      }
      
      // Don't redirect if we're already on the login page or if this is a profile update request
      const isLoginPage = window.location.pathname.includes('/login');
      const isProfileRequest = error.config && error.config.url && (
        error.config.url.includes('/profile') || 
        error.config.url.includes('/riders/profile') ||
        error.config.url.includes('/students/profile')
      );
      
      // Check if this is a request that was made after logout
      const token = localStorage.getItem('token');
      if (!token) {
        // If there's no token, this is expected after logout - don't show error
        return Promise.reject(new Error('Session expired'));
      }
      
      if (!isLoginPage && !isProfileRequest) {
        // Only clear auth and redirect for non-profile related 401s
        console.log('Unauthorized access - redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        
        // Only redirect if not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } else if (isProfileRequest) {
        console.log('Profile request failed with 401 - not logging out');
      }
      
      // Return a resolved promise to prevent error from propagating
      return Promise.reject(new Error('Session expired'));
    }

    // Clean up the cancel token for failed requests
    if (error.config) {
      const requestId = `${error.config.method}-${error.config.url}`;
      cancelTokens.delete(requestId);
    }
    
    return Promise.reject(error);
  }
);

// Function to cancel all pending requests
export const cancelAllRequests = (reason = 'Operation canceled') => {
  const requestsToCancel = Array.from(cancelTokens.entries());
  cancelTokens.clear(); // Clear the map first to prevent race conditions
  
  requestsToCancel.forEach(([requestId, source]) => {
    try {
      if (source && typeof source.cancel === 'function') {
        source.cancel(reason);
      }
    } catch (error) {
      console.warn(`Error canceling request ${requestId}:`, error);
    }
  });
};

// Create API client with the configured axios instance
const createApiClient = () => {
  return axiosInstance;
};

// Rider services
export const riderService = {
  // Profile
  getProfile: async () => {
    const apiClient = createApiClient();
    try {
      const response = await apiClient.get('/api/riders/profile');
      return response; // Return the full response object
    } catch (error) {
      console.error('Error getting rider profile:', error);
      throw error;
    }
  },

  updateProfile: async (formData) => {
    const apiClient = createApiClient();
    try {
      // Log the FormData content before sending
      console.log('Sending FormData with the following fields:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await apiClient.put('/api/riders/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Profile update successful. Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating rider profile:', {
        error: error,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error;
    }
  },

  changePassword: async (data) => {
    const apiClient = createApiClient();
    try {
      const response = await apiClient.put('/riders/change-password', data);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

    // Trip management
  getPendingTrips: async () => {
    const apiClient = createApiClient();
    try {
      const response = await apiClient.get('/api/riders/pending-trips');
      return response.data;
    } catch (error) {
      console.error('Error getting pending trips:', error);
      throw error.response?.data || error.message;
    }
  },

  // Trip management
  acceptTrip: async (tripId, riderId) => {
    try {
      console.log('Accepting trip:', { tripId, riderId });
      const apiClient = createApiClient();

      const response = await apiClient.put(`/api/riders/trips/${tripId}/accept`, {
        riderId: riderId.toString()
      });
      console.log('Accept trip response:', response.data);

      if (response.data.success) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const pendingTrips = await apiClient.get('/api/riders/pending-trips');
          console.log('Updated pending trips:', pendingTrips.data);
          const activeTrips = await apiClient.get('/api/riders/active-trips');
          console.log('Updated active trips:', activeTrips.data);
        } catch (updateError) {
          console.error('Error updating trip lists:', updateError);
        }
      }

      return response.data;
    } catch (error) {
      console.error('Error in acceptTrip:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'ไม่สามารถรับงานได้');
    }
  },

  getTripDetails: async (tripId) => {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get(`/api/riders/trips/${tripId}`);
      return response.data;
    } catch (error) {
      console.error('Error in getTripDetails:', error);
      return null;
    }
  },
  
  rejectTrip: async (tripId) => {
    try {
      const response = await createApiClient().put(`/api/riders/trips/${tripId}/reject`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  getActiveTrips: async () => {
    try {
      const response = await createApiClient().get('/api/riders/active-trips');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  completeTrip: async (tripId) => {
    try {
      const response = await createApiClient().put(`/api/riders/trips/${tripId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing trip:', error);
      throw error.response?.data || error.message;
    }
  },
  
  getTripHistory: async () => {
    try {
      const response = await createApiClient().get('/api/riders/trips/history');
      return response.data;
    } catch (error) {
      console.error('Error getting trip history:', error);
      throw error.response?.data || error.message;
    }
  },

  // Vehicle management
  getVehicles: async () => {
    const apiClient = createApiClient();
    try {
      const response = await apiClient.get('/api/riders/vehicles');
      
      // Ensure we always return an array, even if the response is empty or malformed
      if (!response.data) {
        console.warn('Empty response from /api/riders/vehicles');
        return [];
      }
      
      // If the response is already an array, return it directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // If the response is an object with a data property that's an array, return that
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // If we get here, the response format is unexpected
      console.warn('Unexpected response format from /api/riders/vehicles:', response.data);
      return [];
    } catch (error) {
      // Don't log canceled requests as errors
      if (axios.isCancel(error)) {
        throw error;
      }
      
      console.error('Error getting vehicles:', error);
      
      // Return an empty array instead of throwing to prevent UI crashes
      return [];
    }
  },
  
  addVehicle: async (formData) => {
    const apiClient = createApiClient();
    try {
      console.log('Adding new vehicle with data:', formData);
      
      // Create a new FormData instance
      const formDataToSend = new FormData();
      
      // If formData is already a FormData instance, use it directly
      if (formData instanceof FormData) {
        // Log the form data being sent
        console.log('FormData contents (direct):');
        for (let [key, value] of formData.entries()) {
          console.log(key, value instanceof File ? `File: ${value.name}` : value);
          formDataToSend.append(key, value);
        }
      } else {
        // Handle if formData is a regular object (for backward compatibility)
        for (const key in formData) {
          if (formData[key] !== null && formData[key] !== undefined) {
            // Skip preview fields
            if (key.endsWith('Preview')) continue;
            
            // Handle file objects
            if (formData[key] instanceof File) {
              formDataToSend.append(key, formData[key]);
            } 
            // Handle string values (including stringified objects)
            else if (typeof formData[key] === 'string' || typeof formData[key] === 'number' || typeof formData[key] === 'boolean') {
              formDataToSend.append(key, formData[key]);
            }
            // Handle objects (stringify them)
            else if (typeof formData[key] === 'object' && formData[key] !== null) {
              formDataToSend.append(key, JSON.stringify(formData[key]));
            }
          }
        }
      }
      
      // Log the form data being sent
      console.log('FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value instanceof File ? `File: ${value.name}` : value);
      }
      
      const response = await apiClient.post('/api/riders/vehicles', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      throw error;
    }
  },
  
  updateVehicle: async (vehicleId, formData) => {
    const apiClient = createApiClient();
    try {
      console.log('Updating vehicle with ID:', vehicleId);
      
      // Create a new FormData instance
      const formDataToSend = new FormData();
      
      // If formData is already a FormData instance, use it directly
      if (formData instanceof FormData) {
        // Log the form data being sent
        console.log('FormData contents (direct):');
        for (let [key, value] of formData.entries()) {
          console.log(key, value instanceof File ? `File: ${value.name}` : value);
          formDataToSend.append(key, value);
        }
      } else {
        // Handle if formData is a regular object (for backward compatibility)
        for (const key in formData) {
          if (formData[key] !== null && formData[key] !== undefined) {
            // Skip preview fields
            if (key.endsWith('Preview')) continue;
            
            // Handle file objects
            if (formData[key] instanceof File) {
              formDataToSend.append(key, formData[key]);
            } 
            // Handle string values (including stringified objects)
            else if (typeof formData[key] === 'string' || typeof formData[key] === 'number' || typeof formData[key] === 'boolean') {
              formDataToSend.append(key, formData[key]);
            }
            // Handle objects (stringify them)
            else if (typeof formData[key] === 'object' && formData[key] !== null) {
              formDataToSend.append(key, JSON.stringify(formData[key]));
            }
          }
        }
      }
      
      // Log the form data being sent
      console.log('FormData contents for update:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value instanceof File ? `File: ${value.name}` : value);
      }
      
      const response = await apiClient.put(`/api/riders/vehicles/${vehicleId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  },
  
  deleteVehicle: async (vehicleId) => {
    const apiClient = createApiClient();
    try {
      const response = await apiClient.delete(`/api/riders/vehicles/${vehicleId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  },

  // Status
  updateStatus: async (status) => {
    const apiClient = createApiClient();
    try {
      const response = await apiClient.put('/api/riders/status', { status });
      return response.data;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  },

  // Location
  updateLocation: async (location) => {
    const apiClient = createApiClient();
    try {
      const response = await apiClient.post('/api/riders/location', location);
      return response.data;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  },

  // Earnings
  getEarnings: async (period = 'monthly') => {
    const apiClient = createApiClient();
    try {
      const response = await apiClient.get(`/api/riders/earnings?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error getting earnings:', error);
      throw error;
    }
  },

  // Ratings
  getRatings: async () => {
    const apiClient = createApiClient();
    try {
      const response = await apiClient.get('/api/riders/ratings');
      return response.data;
    } catch (error) {
      console.error('Error getting ratings:', error);
      throw error;
    }
  },

  // Documents
  uploadDocument: async (documentData) => {
    const apiClient = createApiClient();
    try {
      const response = await apiClient.post('/riders/documents', documentData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  getDocuments: async () => {
    const apiClient = createApiClient();
    try {
      const response = await apiClient.get('/riders/documents');
      return response.data;
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  },

  deleteDocument: async (documentId) => {
    const apiClient = createApiClient();
    try {
      const response = await apiClient.delete(`/riders/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },
  
  // Trip management
  getPendingTrips: async () => {
    try {
      const response = await createApiClient().get('/api/riders/pending-trips');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  acceptTrip: async (tripId, riderId) => {
    try {
      console.log('Accepting trip:', { tripId, riderId });
      const apiClient = createApiClient();

      const response = await apiClient.put(`/api/riders/trips/${tripId}/accept`, {
        riderId: riderId.toString()
      });
      console.log('Accept trip response:', response.data);

      if (response.data.success) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const pendingTrips = await apiClient.get('/api/riders/pending-trips');
          console.log('Updated pending trips:', pendingTrips.data);
          const activeTrips = await apiClient.get('/api/riders/active-trips');
          console.log('Updated active trips:', activeTrips.data);
        } catch (updateError) {
          console.error('Error updating trip lists:', updateError);
        }
      }

      return response.data;
    } catch (error) {
      console.error('Error in acceptTrip:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'ไม่สามารถรับงานได้');
    }
  },
  
  getTripDetails: async (tripId) => {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get(`/api/riders/trips/${tripId}`);
      return response.data;
    } catch (error) {
      console.error('Error in getTripDetails:', error);
      return null;
    }
  },
  
  rejectTrip: async (tripId) => {
    try {
      const response = await createApiClient().put(`/api/riders/trips/${tripId}/reject`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  getActiveTrips: async () => {
    try {
      const response = await createApiClient().get('/api/riders/active-trips');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  completeTrip: async (tripId) => {
    try {
      const response = await createApiClient().put(`/api/riders/trips/${tripId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing trip:', error);
      throw error.response?.data || error.message;
    }
  },
  
  getTripHistory: async () => {
    try {
      const response = await createApiClient().get('/api/riders/trips/history');
      return response.data;
    } catch (error) {
      console.error('Error getting trip history:', error);
      throw error.response?.data || error.message;
    }
  }
};

// Authentication services
export const authService = {
  login: (data) => createApiClient().post('/api/login', data, {
    headers: {
      'Content-Type': 'application/json'
    }
  }),
  registerStudent: (data) => createApiClient().post('/api/register/student', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  }),
  registerRider: (formData) => {
    return createApiClient().post('/api/register/rider', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  registerAdmin: (data) => createApiClient().post('/api/register/admin', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  }),
  getProfile: (userType) => createApiClient().get(`/api/${userType}/profile`),
};

// Student services
export const studentService = {
  getProfile: async () => {
    const apiClient = createApiClient();
    return await apiClient.get('/api/students/profile');
  },
  updateProfile: (formData) => {
    // Create a new axios instance for file upload with the correct content type
    const uploadClient = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    // Add request interceptor to handle errors
    uploadClient.interceptors.response.use(
      response => response,
      error => {
        console.error('Upload error:', error);
        return Promise.reject(error);
      }
    );
    
    return uploadClient.put('/api/students/profile', formData);
  },
  getPlaces: async () => {
    const apiClient = createApiClient();
    return await apiClient.get('/api/students/places');
  },
  createTrip: async (tripData) => {
    const apiClient = createApiClient();
    return await apiClient.post('/api/students/trips', tripData);
  },
  getTrips: async () => {
    const apiClient = createApiClient();
    return await apiClient.get('/api/students/trips');
  },
  getRiderDetails: async (riderId) => {
    const apiClient = createApiClient();
    // The correct endpoint is /api/students/rider/:riderId
    const response = await apiClient.get(`/api/students/rider/${riderId}`);
    console.log('Rider details response:', response);
    return response;
  },
  rateRider: async (tripId, rating) => {
    const apiClient = createApiClient();
    
    try {
      console.log(`Rating trip ${tripId} with rating ${rating}`);
      
      const response = await apiClient({
        method: 'put',
        url: `/api/students/trips/${tripId}/rate`,
        data: { rating }
      });
      
      console.log('Rate rider response:', response);
      return response;
    } catch (error) {
      console.error('Error rating rider:', error);
      throw error;
    }
  },
  cancelTrip: async (tripId) => {
    const apiClient = createApiClient();
    try {
      console.log(`Canceling trip ${tripId}`);
      const response = await apiClient({
        method: 'put',
        url: `/api/students/trips/${tripId}/cancel`
      });
      console.log('Cancel trip response:', response);
      return response;
    } catch (error) {
      console.error('Error canceling trip:', error);
      throw error;
    }
  },
  changePassword: async (data) => {
    const apiClient = createApiClient();
    try {
      const response = await apiClient.put('/api/students/change-password', data);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },
  updateProfile: (formData) => {
    // Create a new axios instance for file upload with the correct content type
    const uploadClient = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    // Add request interceptor to handle errors
    uploadClient.interceptors.response.use(
      response => response,
      error => {
        console.error('Upload error:', error);
        return Promise.reject(error);
      }
    );
    
    return uploadClient.put('/api/students/profile', formData);
  },

  // Vehicle Management
  getVehicles: () => createApiClient().get('/api/riders/vehicles'),

  addVehicle: (vehicleData) => {
    console.log('Calling POST /api/riders/vehicles');
    return createApiClient().post('/api/riders/vehicles', vehicleData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateVehicle: (carId, vehicleData) => {
    const url = `/api/riders/vehicles/${carId}`;
    console.log('Calling PUT:', url);
    return createApiClient().put(url, vehicleData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteVehicle: (carId) => {
    const url = `/api/riders/vehicles/${carId}`;
    console.log(`Calling DELETE ${url}`);
    return createApiClient().delete(url);
  },

  // getTrips: () => createApiClient().get('/riders/trips'),

  // Admin services
  getStatus: () => createApiClient().get('/api/riders/status'),
  updateStatus: (status) => createApiClient().put('/api/riders/status', { status })
};

// Admin services
export const adminService = {
  // Student management
  getStudents: async () => {
    const apiClient = createApiClient();
    return await apiClient.get('/api/admin/students');
  },
  getStudent: (id) => createApiClient().get(`/api/admin/students/${id}`),
  createStudent: (data) => createApiClient().post('/api/admin/students', data),
  updateStudent: (id, data) => createApiClient().put(`/api/admin/students/${id}`, data),
  deleteStudent: (id) => createApiClient().delete(`/api/admin/students/${id}`),
  resetStudentPassword: async (studentId, { newPassword }) => {
    const apiClient = createApiClient();
    return await apiClient.post(`/api/admin/students/${studentId}/reset-password`, { newPassword });
  },

  // Rider management
  getRiders: async () => {
    const apiClient = createApiClient();
    return await apiClient.get('/api/admin/riders');
  },
  getRiderById: (riderId) => createApiClient().get(`/api/admin/riders/${riderId}`),
  createRider: async (riderData) => {
    const apiClient = createApiClient();
    return await apiClient.post('/api/admin/riders', riderData);
  },
  updateRider: async (riderId, data) => {
    const apiClient = createApiClient();
    return await apiClient.put(`/api/admin/riders/${riderId}`, data);
  },
  deleteRider: async (riderId) => {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.delete(`/api/admin/riders/${riderId}`);
      return response;
    } catch (error) {
      console.error('Delete rider error:', error.response?.data);
      throw error;
    }
  },
  approveRider: (riderId) => {
    return createApiClient().patch(`/api/admin/riders/${riderId}/approve`);
  },
  resetRiderPassword: async (riderId, { newPassword }) => {
    const apiClient = createApiClient();
    return await apiClient.post(`/api/admin/riders/${riderId}/reset-password`, { newPassword });
  },
  deleteRiderVehicle: (carId) => createApiClient().delete(`/api/admin/vehicles/${carId}`),

  // Reports
  getReports: () => createApiClient().get('/api/admin/reports'),

  // Place management
  getPlaces: async () => {
    const apiClient = createApiClient();
    return await apiClient.get('/api/admin/places');
  },
  
  getPlacesCount: async () => {
    const apiClient = createApiClient();
    return await apiClient.get('/api/admin/places/count');
  },
  addPlace: async (formData) => {
    const apiClient = createApiClient();
    return await apiClient.post('/api/admin/places', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updatePlace: async (placeId, formData) => {
    const apiClient = createApiClient();
    return await apiClient.put(`/api/admin/places/${placeId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deletePlace: async (placeId) => {
    const apiClient = createApiClient();
    return await apiClient.delete(`/api/admin/places/${placeId}`);
  },
};

// Export default instance if needed, otherwise remove
// export default createApiClient();