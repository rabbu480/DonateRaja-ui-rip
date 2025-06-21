import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  profileImageUrl?: string;
  points: number;
  isPremium: boolean;
  rating: number;
  totalReviews: number;
  location?: string;
  pincode?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
}

export function useAuthApi() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/users/me'],
    queryFn: async () => {
      try {
        const response = await apiClient.getCurrentUser();
        return response as User;
      } catch (error: any) {
        if (error.message.includes('401')) {
          localStorage.removeItem('authToken');
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.login(credentials);
      return response;
    },
    onSuccess: (data: any) => {
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        queryClient.invalidateQueries({ queryKey: ['/users/me'] });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const response = await apiClient.register(userData);
      return response;
    },
    onSuccess: (data: any) => {
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        queryClient.invalidateQueries({ queryKey: ['/users/me'] });
      }
    },
  });

  const logout = () => {
    localStorage.removeItem('authToken');
    queryClient.clear();
    window.location.href = '/';
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !!localStorage.getItem('authToken'),
    error,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    loginLoading: loginMutation.isPending,
    registerLoading: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}