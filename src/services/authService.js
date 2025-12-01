// authService.js - Fixed to match your backend

const API_BASE_URL = import.meta.env.VITE_API_URL ||'http://localhost:5000';

const API_URL = `${API_BASE_URL}/api/auth`;


export const authService = {
  // CLIENT LOGIN - Uses /api/auth/login
  async clientLogin(email, password) {
    try {
      console.log('🔐 Attempting client login to:', `${API_URL}/login`);
      
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('✅ Login response status:', response.status);

      const data = await response.json();
      console.log('📋 Login response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Client login failed');
      }

      // Store token and user data for CLIENT
      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('💾 Token stored successfully');
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('💾 User data stored successfully');
        console.log('🎭 User role:', data.user.role);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Client login error:', error);
      throw new Error(error.message || 'Client login failed');
    }
  },

  // ADMIN LOGIN - Also uses /api/auth/login but stores in admin storage
  async adminLogin(email, password) {
    try {
      console.log('🛡️ Attempting admin login to:', `${API_URL}/login`);
      
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('✅ Admin login response status:', response.status);

      const data = await response.json();
      console.log('📋 Admin login response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Admin login failed');
      }

      // Check if user is actually an admin
      if (data.user && data.user.role !== 'admin') {
        throw new Error('Access denied. This account is not an admin account.');
      }

      // Store token and user data for ADMIN
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        console.log('💾 Admin token stored successfully');
      }
      if (data.user) {
        localStorage.setItem('admin', JSON.stringify(data.user));
        console.log('💾 Admin data stored successfully');
        console.log('🎭 Admin role:', data.user.role);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Admin login error:', error);
      throw new Error(error.message || 'Admin login failed');
    }
  },

  // CLIENT SIGNUP - Uses /api/auth/signup
  async clientSignup(name, email, password, contact) {
    try {
      console.log('📝 Attempting client signup to:', `${API_URL}/signup`);
      
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, contact }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Auto-login after signup
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('✅ Client signup successful, auto-logged in');
      }

      return data;
    } catch (error) {
      console.error('❌ Signup error:', error);
      throw new Error(error.message || 'Signup failed');
    }
  },

  // ADMIN SIGNUP - Uses /api/auth/admin/signup
  async adminSignup(name, email, password, adminSecret, contact) {
    try {
      console.log('🛡️ Attempting admin signup to:', `${API_URL}/admin/signup`);
      
      const response = await fetch(`${API_URL}/admin/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, adminSecret, contact }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Admin signup failed');
      }

      // Auto-login after signup
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('admin', JSON.stringify(data.user));
        console.log('✅ Admin signup successful, auto-logged in');
      }

      return data;
    } catch (error) {
      console.error('❌ Admin signup error:', error);
      throw new Error(error.message || 'Admin signup failed');
    }
  },

  // Verify token method (for clients)
  async verifyToken() {
    try {
      const token = this.getToken();
      
      if (!token) {
        console.log('⚠️ No valid token found');
        return false;
      }

      const response = await fetch(`${API_URL}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Token verified:', data);
        return data.valid === true;
      } else {
        console.log('❌ Token verification failed');
        this.logout();
        return false;
      }
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      this.logout();
      return false;
    }
  },

  // Verify admin token
  async verifyAdminToken() {
    try {
      const token = this.getAdminToken();
      
      if (!token) {
        console.log('⚠️ No valid admin token found');
        return false;
      }

      const response = await fetch(`${API_URL}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Admin token verified:', data);
        
        // Check if the role is admin
        if (data.role === 'admin' && data.valid === true) {
          return true;
        } else {
          console.log('❌ User is not an admin');
          this.adminLogout();
          return false;
        }
      } else {
        console.log('❌ Admin token verification failed');
        this.adminLogout();
        return false;
      }
    } catch (error) {
      console.error('❌ Admin token verification failed:', error);
      this.adminLogout();
      return false;
    }
  },

  // Get current user (client)
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      if (!user || user === 'undefined' || user === 'null') {
        return null;
      }
      return JSON.parse(user);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Get current admin
  getCurrentAdmin() {
    try {
      const admin = localStorage.getItem('admin');
      if (!admin || admin === 'undefined' || admin === 'null') {
        return null;
      }
      return JSON.parse(admin);
    } catch (error) {
      console.error('Error parsing admin data:', error);
      return null;
    }
  },

  // Get token (client)
  getToken() {
    const token = localStorage.getItem('token');
    return token && token !== 'undefined' && token !== 'null' ? token : null;
  },

  // Get admin token
  getAdminToken() {
    const token = localStorage.getItem('adminToken');
    return token && token !== 'undefined' && token !== 'null' ? token : null;
  },

  // Logout method (client)
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('👋 Client logged out');
  },

  // Admin logout
  adminLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    console.log('👋 Admin logged out');
  },

  // Check if user is authenticated (synchronous)
  isAuthenticated() {
    return !!this.getToken();
  },

  // Check if admin is authenticated
  isAdminAuthenticated() {
    return !!this.getAdminToken();
  },

  // Get user role from current session
  getUserRole() {
    const user = this.getCurrentUser();
    const admin = this.getCurrentAdmin();
    
    if (admin && admin.role === 'admin') return 'admin';
    if (user && user.role === 'client') return 'client';
    if (user) return 'client'; // Default to client for backward compatibility
    
    return null;
  }
};