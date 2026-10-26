export type Role = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  savedAddresses: Address[];
  dietaryPreferences: string[];
  createdAt: string;
}

export interface Address {
  id: string;
  title: string; // e.g. "Home", "Work", "College Hostel"
  street: string;
  city: string;
  landmark?: string;
  pincode: string;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  icon?: string;
  active: boolean;
}

export type SpiceLevel = 'Mild' | 'Medium' | 'Hot' | 'Extra Hot';

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  imageUrl: string;
  vegetarian: boolean;
  allergens: string[];
  ingredients: string[];
  spiceLevel: SpiceLevel;
  preparationTime: number; // in minutes
  rating: number;
  reviewsCount: number;
  available: boolean;
  isBestSeller?: boolean;
  isChefSpecial?: boolean;
  calories?: number;
  reviews?: FoodReview[];
  createdAt: string;
  updatedAt: string;
}

export interface FoodReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  specialInstructions?: string;
}

export type PaymentMethod = 'cod' | 'demo_card' | 'demo_upi';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItemSnapshot {
  foodItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  vegetarian: boolean;
  specialInstructions?: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  orderId: string;
  status: OrderStatus;
  changedBy: string; // 'customer' | 'admin' | 'system'
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: Address;
  items: OrderItemSnapshot[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  customerInstructions?: string;
  estimatedDeliveryTime: string;
  statusHistory: OrderStatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderValue: number;
  maximumDiscount?: number;
  expiryDate: string;
  active: boolean;
  usageLimit?: number;
  timesUsed: number;
}

export interface Favorite {
  id: string;
  userId: string;
  foodItemId: string;
  createdAt: string;
}

export interface AdminStats {
  totalOrders: number;
  totalSales: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  popularDishes: { name: string; count: number; revenue: number; imageUrl: string }[];
  recentOrders: Order[];
  dailySales: { date: string; sales: number; orders: number }[];
}

export interface AIRecommendationRequest {
  query: string;
  budget?: number;
  vegetarianOnly?: boolean;
  preferredSpice?: SpiceLevel;
  dietaryPreferences?: string[];
}

export interface AIRecommendationItem {
  id: string;
  name: string;
  price: number;
  reason: string;
  vegetarian: boolean;
  imageUrl: string;
  spiceLevel: SpiceLevel;
}

export interface AIRecommendationResponse {
  message: string;
  recommendations: AIRecommendationItem[];
  source: 'gemini' | 'rule-based';
  suggestedFollowUps?: string[];
}
