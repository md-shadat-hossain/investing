// API Configuration and Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1';

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

interface AuthTokens {
  access: {
    token: string;
    expires: string;
  };
  refresh: {
    token: string;
    expires: string;
  };
}

interface AuthResponse {
  attributes: {
    user: any;
    tokens: AuthTokens;
  };
}

// Token Management
export const TokenService = {
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  setAccessToken: (token: string): void => {
    localStorage.setItem('accessToken', token);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem('refreshToken', token);
  },

  getUser: (): any => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setUser: (user: any): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearTokens: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

// HTTP Client with interceptors
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = TokenService.getAccessToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token && !endpoint.includes('/auth/')) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Network error');
    }
  }

  get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Multipart form data for file uploads
  async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const token = TokenService.getAccessToken();

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Network error');
    }
  }
}

export const apiClient = new ApiClient();

// Authentication API
export const AuthAPI = {
  // Login - Admin only
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });

    // Store tokens and user info
    if (response.code === 200 && response.data) {
      const { tokens, user } = response.data.attributes;
      TokenService.setAccessToken(tokens.access.token);
      TokenService.setRefreshToken(tokens.refresh.token);
      TokenService.setUser(user);
    }

    return response;
  },

  // Logout
  logout: async (): Promise<ApiResponse> => {
    const refreshToken = TokenService.getRefreshToken();
    const response = await apiClient.post('/auth/logout', { refreshToken });
    TokenService.clearTokens();
    return response;
  },

  // Change Password
  changePassword: async (oldPassword: string, newPassword: string): Promise<ApiResponse> => {
    return apiClient.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
  },

  // Get current user profile
  getProfile: async (): Promise<ApiResponse> => {
    return apiClient.get('/users/me');
  },
};

// Users API (Admin)
export const UsersAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);

    return apiClient.get(`/users?${query.toString()}`);
  },

  getById: async (id: string) => {
    return apiClient.get(`/users/${id}`);
  },

  update: async (id: string, data: any) => {
    return apiClient.put(`/users/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/users/${id}`);
  },
};

// Export configured client
export default apiClient;
