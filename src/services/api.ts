import {
  User,
  Category,
  FoodItem,
  Order,
  Coupon,
  AdminStats,
  AIRecommendationRequest,
  AIRecommendationResponse,
  Address,
} from '../types/index.ts';

const TOKEN_KEY = 'foodiehub_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async register(name: string, email: string, phone: string, password: string): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async updateProfile(updates: {
    name?: string;
    phone?: string;
    savedAddresses?: Address[];
    dietaryPreferences?: string[];
  }): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Categories
  async getCategories(): Promise<{ categories: Category[] }> {
    return request<{ categories: Category[] }>('/api/categories');
  },

  async createCategory(data: Partial<Category>): Promise<{ category: Category }> {
    return request<{ category: Category }>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<{ category: Category }> {
    return request<{ category: Category }>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Foods
  async getFoods(params?: {
    category?: string;
    vegetarian?: boolean;
    search?: string;
    sort?: string;
    availableOnly?: boolean;
  }): Promise<{ foods: FoodItem[] }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.vegetarian !== undefined) query.append('vegetarian', String(params.vegetarian));
    if (params?.search) query.append('search', params.search);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.availableOnly !== undefined) query.append('availableOnly', String(params.availableOnly));

    const qs = query.toString();
    return request<{ foods: FoodItem[] }>(`/api/foods${qs ? '?' + qs : ''}`);
  },

  async getFoodById(id: string): Promise<{ food: FoodItem }> {
    return request<{ food: FoodItem }>(`/api/foods/${id}`);
  },

  async createFood(data: Partial<FoodItem>): Promise<{ food: FoodItem }> {
    return request<{ food: FoodItem }>('/api/foods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateFood(id: string, data: Partial<FoodItem>): Promise<{ food: FoodItem }> {
    return request<{ food: FoodItem }>(`/api/foods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async setFoodAvailability(id: string, available: boolean): Promise<{ food: FoodItem }> {
    return request<{ food: FoodItem }>(`/api/foods/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ available }),
    });
  },

  async deleteFood(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/foods/${id}`, {
      method: 'DELETE',
    });
  },

  // Coupons
  async getCoupons(): Promise<{ coupons: Coupon[] }> {
    return request<{ coupons: Coupon[] }>('/api/coupons');
  },

  async validateCoupon(code: string, subtotal: number): Promise<{
    valid: boolean;
    discount: number;
    coupon: Coupon;
    message: string;
  }> {
    return request<{
      valid: boolean;
      discount: number;
      coupon: Coupon;
      message: string;
    }>('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
  },

  // Orders
  async createOrder(orderData: {
    items: { foodItemId: string; quantity: number; specialInstructions?: string }[];
    deliveryAddress: Address;
    customerPhone: string;
    couponCode?: string;
    paymentMethod: string;
    customerInstructions?: string;
  }): Promise<{ order: Order }> {
    return request<{ order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async getOrders(): Promise<{ orders: Order[] }> {
    return request<{ orders: Order[] }>('/api/orders');
  },

  async getOrderById(id: string): Promise<{ order: Order }> {
    return request<{ order: Order }>(`/api/orders/${id}`);
  },

  async cancelOrder(id: string, reason?: string): Promise<{ order: Order; message: string }> {
    return request<{ order: Order; message: string }>(`/api/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async updateOrderStatus(
    id: string,
    status: string,
    note?: string,
    paymentStatus?: string
  ): Promise<{ order: Order }> {
    return request<{ order: Order }>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note, paymentStatus }),
    });
  },

  // Admin
  async getAdminStats(): Promise<{ stats: AdminStats }> {
    return request<{ stats: AdminStats }>('/api/admin/stats');
  },

  async getCustomers(): Promise<{ customers: any[] }> {
    return request<{ customers: any[] }>('/api/admin/customers');
  },

  async resetSeedData(): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/api/seed/reset', {
      method: 'POST',
    });
  },

  // Favorites
  async getFavorites(): Promise<{ favorites: string[] }> {
    return request<{ favorites: string[] }>('/api/favorites');
  },

  async toggleFavorite(foodItemId: string): Promise<{ isFavorite: boolean }> {
    return request<{ isFavorite: boolean }>('/api/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ foodItemId }),
    });
  },

  // AI Assistant
  async getAIRecommendation(req: AIRecommendationRequest): Promise<AIRecommendationResponse> {
    return request<AIRecommendationResponse>('/api/ai/recommend', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },
};
