// API Configuration for connecting to Spring Boot backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${errorText}`);
    }

    return response.json();
  }

  // Auth methods
  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/users/me');
  }

  async updateProfile(data: any) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Items methods
  async getItems(params?: {
    category?: string;
    type?: string;
    location?: string;
    page?: number;
    size?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request(`/items${query ? `?${query}` : ''}`);
  }

  async createItem(itemData: any) {
    return this.request('/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async getItem(itemId: number) {
    return this.request(`/items/${itemId}`);
  }

  async updateItem(itemId: number, itemData: any) {
    return this.request(`/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  // Item requests methods
  async createItemRequest(requestData: any) {
    return this.request('/item-requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async getItemRequests(params?: { status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.status) {
      searchParams.append('status', params.status);
    }
    
    const query = searchParams.toString();
    return this.request(`/item-requests${query ? `?${query}` : ''}`);
  }

  // Wallet methods
  async getWalletTransactions() {
    return this.request('/wallet/transactions');
  }

  async createWalletTransaction(transactionData: any) {
    return this.request('/wallet/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // Messages methods
  async getConversations() {
    return this.request('/messages/conversations');
  }

  async getMessages(conversationId: number) {
    return this.request(`/messages/conversations/${conversationId}/messages`);
  }

  async sendMessage(conversationId: number, messageData: any) {
    return this.request(`/messages/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  // Notifications methods
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationAsRead(notificationId: number) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  // Favorites methods
  async getFavorites() {
    return this.request('/favorites');
  }

  async addToFavorites(itemId: number) {
    return this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    });
  }

  async removeFromFavorites(favoriteId: number) {
    return this.request(`/favorites/${favoriteId}`, {
      method: 'DELETE',
    });
  }

  // Banners methods
  async getBanners() {
    return this.request('/banners');
  }

  // Plans methods
  async getPlans() {
    return this.request('/plans');
  }

  async upgradePlan(planType: string) {
    return this.request(`/subscription/upgrade/${planType}`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();