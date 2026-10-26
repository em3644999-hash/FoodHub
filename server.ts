import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { db, hashPassword, StoredUser } from './server/db.ts';
import {
  FoodItem,
  Order,
  OrderItemSnapshot,
  OrderStatus,
  Role,
  AIRecommendationResponse,
} from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'foodiehub_super_secret_jwt_key_2026';
const PORT = Number(process.env.PORT) || 3000;

// Token generation and verification
function createToken(userId: string, role: Role): string {
  const payload = `${userId}:${role}:${Date.now()}`;
  const hmac = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${hmac}`).toString('base64');
}

function verifyToken(token: string): { userId: string; role: Role } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length < 4) return null;
    const userId = parts[0];
    const role = parts[1] as Role;
    const timestamp = parts[2];
    const signature = parts[3];
    const expectedHmac = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${userId}:${role}:${timestamp}`)
      .digest('hex');
    if (signature !== expectedHmac) return null;
    return { userId, role };
  } catch {
    return null;
  }
}

// Express app setup
async function startServer() {
  const app = express();
  app.use(express.json());

  // Auth Middleware
  const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }
    const user = db.findUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }
    (req as any).user = user;
    next();
  };

  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    authenticate(req, res, () => {
      const user = (req as any).user as StoredUser;
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Admin privileges required' });
      }
      next();
    });
  };

  // -------------------------------------------------------------
  // AUTH ROUTES
  // -------------------------------------------------------------
  app.post('/api/auth/register', (req: Request, res: Response) => {
    try {
      const { name, email, phone, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      const existing = db.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }

      // Security: Registration strictly creates 'customer' role
      const newUser: StoredUser = {
        id: 'user-' + Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : '',
        role: 'customer',
        passwordHash: hashPassword(password),
        savedAddresses: [],
        dietaryPreferences: [],
        createdAt: new Date().toISOString(),
      };

      db.createUser(newUser);
      const token = createToken(newUser.id, newUser.role);
      const { passwordHash, ...userSafe } = newUser;
      return res.status(201).json({ user: userSafe, token });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      const user = db.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const hash = hashPassword(password);
      if (user.passwordHash !== hash) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const token = createToken(user.id, user.role);
      const { passwordHash, ...userSafe } = user;
      return res.json({ user: userSafe, token });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Login failed' });
    }
  });

  app.get('/api/auth/me', authenticate, (req: Request, res: Response) => {
    const user = (req as any).user as StoredUser;
    const { passwordHash, ...userSafe } = user;
    return res.json({ user: userSafe });
  });

  app.put('/api/auth/profile', authenticate, (req: Request, res: Response) => {
    try {
      const user = (req as any).user as StoredUser;
      const { name, phone, savedAddresses, dietaryPreferences } = req.body;

      const updates: Partial<StoredUser> = {};
      if (name) updates.name = name.trim();
      if (phone !== undefined) updates.phone = phone.trim();
      if (Array.isArray(savedAddresses)) updates.savedAddresses = savedAddresses;
      if (Array.isArray(dietaryPreferences)) updates.dietaryPreferences = dietaryPreferences;

      const updated = db.updateUser(user.id, updates);
      if (!updated) return res.status(404).json({ error: 'User not found' });
      const { passwordHash, ...userSafe } = updated;
      return res.json({ user: userSafe });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/customers', requireAdmin, (req: Request, res: Response) => {
    const users = db.getAllUsers();
    const orders = db.getOrders();
    const customersWithStats = users.map(u => {
      const userOrders = orders.filter(o => o.userId === u.id);
      const totalSpent = userOrders
        .filter(o => o.orderStatus !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0);
      return {
        ...u,
        totalOrders: userOrders.length,
        totalSpent,
      };
    });
    return res.json({ customers: customersWithStats });
  });

  // -------------------------------------------------------------
  // CATEGORIES
  // -------------------------------------------------------------
  app.get('/api/categories', (req: Request, res: Response) => {
    const categories = db.getCategories();
    return res.json({ categories });
  });

  app.post('/api/categories', requireAdmin, (req: Request, res: Response) => {
    try {
      const { name, description, imageUrl, icon } = req.body;
      if (!name) return res.status(400).json({ error: 'Category name is required' });
      const newCategory = db.createCategory({
        id: 'cat-' + Date.now(),
        name: name.trim(),
        description: description ? description.trim() : '',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        icon: icon || 'Utensils',
        active: true,
      });
      return res.status(201).json({ category: newCategory });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/categories/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = db.updateCategory(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    return res.json({ category: updated });
  });

  app.delete('/api/categories/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = db.deleteCategory(id);
    if (!deleted) return res.status(404).json({ error: 'Category not found' });
    return res.json({ success: true });
  });

  // -------------------------------------------------------------
  // FOOD ITEMS
  // -------------------------------------------------------------
  app.get('/api/foods', (req: Request, res: Response) => {
    let foods = db.getFoodItems();
    const { category, vegetarian, search, sort, availableOnly } = req.query;

    if (category && category !== 'all') {
      foods = foods.filter(f => f.categoryId === category);
    }
    if (vegetarian === 'true') {
      foods = foods.filter(f => f.vegetarian);
    }
    if (vegetarian === 'false') {
      foods = foods.filter(f => !f.vegetarian);
    }
    if (availableOnly === 'true') {
      foods = foods.filter(f => f.available);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      foods = foods.filter(
        f =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.ingredients.some(ing => ing.toLowerCase().includes(q))
      );
    }
    if (sort) {
      if (sort === 'price_asc') {
        foods.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        foods.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating') {
        foods.sort((a, b) => b.rating - a.rating);
      } else if (sort === 'popularity') {
        foods.sort((a, b) => b.reviewsCount - a.reviewsCount);
      }
    }
    return res.json({ foods });
  });

  app.get('/api/foods/:id', (req: Request, res: Response) => {
    const food = db.getFoodItemById(req.params.id);
    if (!food) return res.status(404).json({ error: 'Dish not found' });
    return res.json({ food });
  });

  app.post('/api/foods', requireAdmin, (req: Request, res: Response) => {
    try {
      const {
        name,
        description,
        categoryId,
        price,
        imageUrl,
        vegetarian,
        allergens,
        ingredients,
        spiceLevel,
        preparationTime,
        calories,
        isChefSpecial,
        isBestSeller,
      } = req.body;

      if (!name || !price || !categoryId) {
        return res.status(400).json({ error: 'Name, price, and category are required' });
      }

      const newFood: FoodItem = {
        id: 'food-' + Date.now(),
        name: name.trim(),
        description: description ? description.trim() : '',
        categoryId,
        price: Number(price),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        vegetarian: Boolean(vegetarian),
        allergens: Array.isArray(allergens) ? allergens : [],
        ingredients: Array.isArray(ingredients) ? ingredients : [],
        spiceLevel: spiceLevel || 'Medium',
        preparationTime: Number(preparationTime) || 20,
        rating: 4.5,
        reviewsCount: 1,
        available: true,
        isChefSpecial: Boolean(isChefSpecial),
        isBestSeller: Boolean(isBestSeller),
        calories: Number(calories) || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const saved = db.createFoodItem(newFood);
      return res.status(201).json({ food: saved });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/foods/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = db.updateFoodItem(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Dish not found' });
    return res.json({ food: updated });
  });

  app.patch('/api/foods/:id/availability', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { available } = req.body;
    const updated = db.updateFoodItem(id, { available: Boolean(available) });
    if (!updated) return res.status(404).json({ error: 'Dish not found' });
    return res.json({ food: updated });
  });

  app.delete('/api/foods/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = db.deleteFoodItem(id);
    if (!deleted) return res.status(404).json({ error: 'Dish not found' });
    return res.json({ success: true });
  });

  // -------------------------------------------------------------
  // COUPONS
  // -------------------------------------------------------------
  app.get('/api/coupons', (req: Request, res: Response) => {
    const coupons = db.getCoupons();
    return res.json({ coupons });
  });

  app.post('/api/coupons/validate', (req: Request, res: Response) => {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ valid: false, message: 'Coupon code required' });

    const coupon = db.getCouponByCode(code);
    if (!coupon) {
      return res.status(400).json({ valid: false, message: 'Invalid or expired coupon code' });
    }

    if (new Date(coupon.expiryDate).getTime() < Date.now()) {
      return res.status(400).json({ valid: false, message: 'Coupon has expired' });
    }

    if (coupon.minimumOrderValue && subtotal < coupon.minimumOrderValue) {
      return res.status(400).json({
        valid: false,
        message: `Minimum order value of ₹${coupon.minimumOrderValue} required for this coupon`,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, subtotal);
    return res.json({
      valid: true,
      coupon,
      discount: Math.round(discount * 100) / 100,
      message: `Coupon ${coupon.code} applied! You saved ₹${discount}`,
    });
  });

  app.post('/api/coupons', requireAdmin, (req: Request, res: Response) => {
    try {
      const {
        code,
        description,
        discountType,
        discountValue,
        minimumOrderValue,
        maximumDiscount,
        expiryDate,
      } = req.body;

      if (!code || !discountValue) {
        return res.status(400).json({ error: 'Code and discount value are required' });
      }

      const newCoupon = db.createCoupon({
        id: 'coup-' + Date.now(),
        code: code.trim().toUpperCase(),
        description: description || '',
        discountType: discountType || 'percentage',
        discountValue: Number(discountValue),
        minimumOrderValue: Number(minimumOrderValue) || 0,
        maximumDiscount: maximumDiscount ? Number(maximumDiscount) : undefined,
        expiryDate: expiryDate || '2027-12-31T23:59:59Z',
        active: true,
        timesUsed: 0,
      });

      return res.status(201).json({ coupon: newCoupon });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/coupons/:id/toggle', requireAdmin, (req: Request, res: Response) => {
    const coupon = db.getCoupons().find(c => c.id === req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    const updated = db.updateCoupon(req.params.id, { active: !coupon.active });
    return res.json({ coupon: updated });
  });

  app.delete('/api/coupons/:id', requireAdmin, (req: Request, res: Response) => {
    const deleted = db.deleteCoupon(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Coupon not found' });
    return res.json({ success: true });
  });

  // -------------------------------------------------------------
  // ORDERS (CRITICAL ENDPOINTS WITH SERVER RECALCULATION)
  // -------------------------------------------------------------
  app.post('/api/orders', authenticate, (req: Request, res: Response) => {
    try {
      const user = (req as any).user as StoredUser;
      const {
        items,
        deliveryAddress,
        couponCode,
        paymentMethod,
        customerInstructions,
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one item' });
      }

      if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city) {
        return res.status(400).json({ error: 'Complete delivery address is required' });
      }

      // Security & Data Integrity: ALWAYS recalculate prices from DB, never trust client totals!
      const itemSnapshots: OrderItemSnapshot[] = [];
      let calculatedSubtotal = 0;

      for (const item of items) {
        const food = db.getFoodItemById(item.foodItemId || item.id);
        if (!food) {
          return res.status(400).json({ error: `Dish "${item.name || 'item'}" is not found in menu` });
        }
        if (!food.available) {
          return res.status(400).json({ error: `"${food.name}" is currently sold out or unavailable` });
        }
        const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
        const itemTotal = food.price * quantity;
        calculatedSubtotal += itemTotal;

        itemSnapshots.push({
          foodItemId: food.id,
          name: food.name,
          price: food.price,
          quantity,
          imageUrl: food.imageUrl,
          vegetarian: food.vegetarian,
          specialInstructions: item.specialInstructions || '',
        });
      }

      // Validate Coupon server-side
      let calculatedDiscount = 0;
      let validCouponCode: string | undefined = undefined;

      if (couponCode) {
        const coupon = db.getCouponByCode(couponCode);
        if (coupon && new Date(coupon.expiryDate).getTime() > Date.now()) {
          if (!coupon.minimumOrderValue || calculatedSubtotal >= coupon.minimumOrderValue) {
            validCouponCode = coupon.code;
            if (coupon.discountType === 'percentage') {
              calculatedDiscount = (calculatedSubtotal * coupon.discountValue) / 100;
              if (coupon.maximumDiscount && calculatedDiscount > coupon.maximumDiscount) {
                calculatedDiscount = coupon.maximumDiscount;
              }
            } else {
              calculatedDiscount = coupon.discountValue;
            }
            calculatedDiscount = Math.min(calculatedDiscount, calculatedSubtotal);
            db.incrementCouponUsage(coupon.code);
          }
        }
      }

      // Delivery Fee: Free for orders >= ₹400, else ₹40
      const deliveryFee = calculatedSubtotal >= 400 ? 0 : 40;

      // GST Tax: 5% on subtotal after discount
      const taxableAmount = Math.max(0, calculatedSubtotal - calculatedDiscount);
      const tax = Math.round(taxableAmount * 0.05 * 100) / 100;

      // Final Total
      const calculatedTotal = Math.round((taxableAmount + deliveryFee + tax) * 100) / 100;

      const orderNumber = `FH-${Math.floor(10000 + Math.random() * 90000)}`;
      const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const newOrder: Order = {
        id: orderId,
        orderNumber,
        userId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone || req.body.customerPhone || '',
        deliveryAddress: {
          id: deliveryAddress.id || 'addr-' + Date.now(),
          title: deliveryAddress.title || 'Delivery Address',
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          landmark: deliveryAddress.landmark || '',
          pincode: deliveryAddress.pincode || '',
        },
        items: itemSnapshots,
        subtotal: calculatedSubtotal,
        deliveryFee,
        tax,
        discount: calculatedDiscount,
        total: calculatedTotal,
        couponCode: validCouponCode,
        paymentMethod: paymentMethod || 'cod',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        orderStatus: 'placed',
        customerInstructions: customerInstructions || '',
        estimatedDeliveryTime: '30-40 mins',
        statusHistory: [
          {
            id: 'hist-' + Date.now(),
            orderId,
            status: 'placed',
            changedBy: 'customer',
            timestamp: new Date().toISOString(),
            note: 'Order successfully placed by customer',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const savedOrder = db.createOrder(newOrder);
      return res.status(201).json({ order: savedOrder });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to place order' });
    }
  });

  app.get('/api/orders', authenticate, (req: Request, res: Response) => {
    const user = (req as any).user as StoredUser;
    if (user.role === 'admin') {
      const orders = db.getOrders();
      return res.json({ orders });
    } else {
      const orders = db.getOrdersByUserId(user.id);
      return res.json({ orders });
    }
  });

  app.get('/api/orders/:id', authenticate, (req: Request, res: Response) => {
    const user = (req as any).user as StoredUser;
    const order = db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Authorization: only the owner or an admin can view order details
    if (user.role !== 'admin' && order.userId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized to view this order' });
    }

    return res.json({ order });
  });

  app.post('/api/orders/:id/cancel', authenticate, (req: Request, res: Response) => {
    const user = (req as any).user as StoredUser;
    const order = db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Only owner or admin can cancel
    if (user.role !== 'admin' && order.userId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized to cancel this order' });
    }

    // Cancellation policy: Allowed only when 'placed' or 'confirmed'
    if (order.orderStatus !== 'placed' && order.orderStatus !== 'confirmed') {
      return res.status(400).json({
        error: `Cannot cancel order at stage "${order.orderStatus}". Kitchen has already prepared or dispatched your meal.`,
      });
    }

    const updated = db.updateOrderStatus(
      order.id,
      'cancelled',
      user.role === 'admin' ? 'admin' : 'customer',
      req.body.reason || 'Cancelled by customer'
    );

    return res.json({ order: updated, message: 'Order has been cancelled successfully' });
  });

  app.patch('/api/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, note, paymentStatus } = req.body;
    const validStatuses: OrderStatus[] = [
      'placed',
      'confirmed',
      'preparing',
      'out_for_delivery',
      'delivered',
      'cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const order = db.updateOrderStatus(id, status, 'admin', note);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (paymentStatus && (paymentStatus === 'paid' || paymentStatus === 'pending' || paymentStatus === 'failed')) {
      order.paymentStatus = paymentStatus;
    }

    return res.json({ order });
  });

  // -------------------------------------------------------------
  // ADMIN DASHBOARD ANALYTICS
  // -------------------------------------------------------------
  app.get('/api/admin/stats', requireAdmin, (req: Request, res: Response) => {
    const orders = db.getOrders();
    const users = db.getAllUsers();
    const totalCustomers = users.filter(u => u.role === 'customer').length;

    const completedOrders = orders.filter(o => o.orderStatus === 'delivered');
    const cancelledOrders = orders.filter(o => o.orderStatus === 'cancelled');
    const pendingOrders = orders.filter(
      o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled'
    );

    const totalSales = orders
      .filter(o => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    // Calculate item sales count & revenue
    const itemMap = new Map<string, { count: number; revenue: number; name: string; imageUrl: string }>();
    for (const order of orders) {
      if (order.orderStatus !== 'cancelled') {
        for (const item of order.items) {
          const current = itemMap.get(item.foodItemId) || {
            count: 0,
            revenue: 0,
            name: item.name,
            imageUrl: item.imageUrl,
          };
          current.count += item.quantity;
          current.revenue += item.price * item.quantity;
          itemMap.set(item.foodItemId, current);
        }
      }
    }

    const popularDishes = Array.from(itemMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Daily sales trend (last 7 days)
    const dailyMap = new Map<string, { sales: number; orders: number }>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap.set(dateStr, { sales: 0, orders: 0 });
    }

    for (const order of orders) {
      if (order.orderStatus !== 'cancelled') {
        const orderDate = order.createdAt.split('T')[0];
        if (dailyMap.has(orderDate)) {
          const day = dailyMap.get(orderDate)!;
          day.sales += Math.round(order.total);
          day.orders += 1;
        }
      }
    }

    const dailySales = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      sales: data.sales,
      orders: data.orders,
    }));

    return res.json({
      stats: {
        totalOrders: orders.length,
        totalSales: Math.round(totalSales * 100) / 100,
        pendingOrders: pendingOrders.length,
        completedOrders: completedOrders.length,
        cancelledOrders: cancelledOrders.length,
        totalCustomers,
        popularDishes,
        recentOrders: orders.slice(0, 8),
        dailySales,
      },
    });
  });

  // -------------------------------------------------------------
  // FAVORITES
  // -------------------------------------------------------------
  app.get('/api/favorites', authenticate, (req: Request, res: Response) => {
    const user = (req as any).user as StoredUser;
    const favorites = db.getUserFavorites(user.id);
    return res.json({ favorites });
  });

  app.post('/api/favorites/toggle', authenticate, (req: Request, res: Response) => {
    const user = (req as any).user as StoredUser;
    const { foodItemId } = req.body;
    if (!foodItemId) return res.status(400).json({ error: 'foodItemId is required' });
    const isFavorite = db.toggleFavorite(user.id, foodItemId);
    return res.json({ isFavorite });
  });

  // -------------------------------------------------------------
  // GEMINI AI FOOD ASSISTANT ("FOODIE AI")
  // -------------------------------------------------------------
  app.post('/api/ai/recommend', async (req: Request, res: Response) => {
    const { query, budget, vegetarianOnly, preferredSpice, dietaryPreferences } = req.body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({ error: 'Please ask a food recommendation question' });
    }

    const allFoods = db.getFoodItems().filter(f => f.available);

    // Rule-based smart fallback generator
    const generateRuleBasedRecommendations = (): AIRecommendationResponse => {
      const q = query.toLowerCase();
      let candidates = [...allFoods];

      if (vegetarianOnly || q.includes('veg') || q.includes('vegetarian')) {
        candidates = candidates.filter(f => f.vegetarian);
      }
      if (q.includes('chicken') || q.includes('non-veg') || q.includes('meat')) {
        candidates = candidates.filter(f => !f.vegetarian);
      }
      if (budget && budget > 0) {
        candidates = candidates.filter(f => f.price <= budget);
      }
      if (preferredSpice) {
        candidates = candidates.filter(f => f.spiceLevel === preferredSpice);
      } else if (q.includes('spicy') || q.includes('hot')) {
        candidates = candidates.filter(f => f.spiceLevel === 'Hot' || f.spiceLevel === 'Extra Hot');
      } else if (q.includes('sweet') || q.includes('dessert')) {
        candidates = candidates.filter(f => f.categoryId === 'cat-desserts');
      } else if (q.includes('biryani')) {
        candidates = candidates.filter(f => f.categoryId === 'cat-biryani');
      } else if (q.includes('pizza')) {
        candidates = candidates.filter(f => f.categoryId === 'cat-pizza');
      } else if (q.includes('burger')) {
        candidates = candidates.filter(f => f.categoryId === 'cat-burgers');
      }

      // If filtered candidates too few, relax constraints
      if (candidates.length === 0) {
        candidates = allFoods.slice(0, 4);
      }

      // Sort by rating & popularity
      candidates.sort((a, b) => b.rating - a.rating);
      const topPick = candidates.slice(0, 3);

      return {
        message: `Here are my top culinary recommendations from our fresh menu for: "${query}"!`,
        source: 'rule-based',
        recommendations: topPick.map(f => ({
          id: f.id,
          name: f.name,
          price: f.price,
          reason: f.isBestSeller
            ? `Top-rated bestseller with ${f.rating}★ rating and prepared fresh in ${f.preparationTime} mins.`
            : `Delightful ${f.vegetarian ? 'vegetarian' : 'chef specialty'} choice with authentic flavor profiles.`,
          vegetarian: f.vegetarian,
          imageUrl: f.imageUrl,
          spiceLevel: f.spiceLevel,
        })),
        suggestedFollowUps: [
          'Suggest a vegetarian dinner under ₹250',
          'What is spicy and best selling?',
          'Recommend desserts to satisfy my sweet tooth',
        ],
      };
    };

    // If no GEMINI_API_KEY, use the instant rule-based fallback
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      return res.json(generateRuleBasedRecommendations());
    }

    try {
      const ai = new GoogleGenAI();
      const menuSummary = allFoods.map(f => ({
        id: f.id,
        name: f.name,
        category: f.categoryId,
        price: f.price,
        vegetarian: f.vegetarian,
        spiceLevel: f.spiceLevel,
        allergens: f.allergens,
        ingredients: f.ingredients.slice(0, 5),
        rating: f.rating,
        prepTime: f.preparationTime,
        calories: f.calories,
        isBestSeller: f.isBestSeller,
        isChefSpecial: f.isChefSpecial,
      }));

      const systemPrompt = `You are "Foodie AI", an expert culinary recommendation assistant for FoodieHub online restaurant.
CRITICAL INSTRUCTIONS:
1. Ground all recommendations STRICTLY within the provided Current Menu. Never invent food items, prices, or false ingredients.
2. If the user asks for vegetarian, filter ONLY vegetarian items (vegetarian: true).
3. If the user specifies a budget, ensure selected dishes fit within that budget.
4. If allergens are mentioned (e.g. dairy, nuts, gluten), check allergen tags and warn cautiously. Never guarantee 100% allergen-free kitchen without cross-contamination disclaimer.
5. Provide a warm, appetizing tone.
6. Return your answer as VALID JSON matching this schema:
{
  "message": "Friendly response explaining the recommendation logic",
  "recommendations": [
    {
      "id": "exact food item id from menu",
      "name": "exact food item name",
      "price": 299,
      "reason": "Clear appetizing reason why this matches user query",
      "vegetarian": true,
      "spiceLevel": "Medium"
    }
  ],
  "suggestedFollowUps": ["query 1", "query 2"]
}
Current Menu: ${JSON.stringify(menuSummary)}`;

      const userPrompt = `User question: "${query}".
Additional Context:
Budget: ${budget ? '₹' + budget : 'Not specified'}
Vegetarian Only: ${vegetarianOnly ? 'Yes' : 'No'}
Preferred Spice Level: ${preferredSpice || 'Any'}
Dietary Preferences: ${dietaryPreferences ? dietaryPreferences.join(', ') : 'None'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        return res.json(generateRuleBasedRecommendations());
      }

      const parsed = JSON.parse(responseText);

      // Hydrate image URLs from real items
      const hydratedRecommendations = (parsed.recommendations || []).map((rec: any) => {
        const original = allFoods.find(f => f.id === rec.id || f.name.toLowerCase() === rec.name?.toLowerCase());
        return {
          id: original ? original.id : rec.id,
          name: original ? original.name : rec.name,
          price: original ? original.price : rec.price,
          reason: rec.reason || 'Specially recommended for your taste and budget.',
          vegetarian: original ? original.vegetarian : Boolean(rec.vegetarian),
          imageUrl: original ? original.imageUrl : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
          spiceLevel: original ? original.spiceLevel : (rec.spiceLevel || 'Medium'),
        };
      });

      const aiResponse: AIRecommendationResponse = {
        message: parsed.message || 'Here are curated dishes from our kitchen for you:',
        recommendations: hydratedRecommendations,
        source: 'gemini',
        suggestedFollowUps: parsed.suggestedFollowUps || [
          'Show me sweet desserts',
          'What are the chef specials today?',
          'Suggest lunch for two under ₹500',
        ],
      };

      return res.json(aiResponse);
    } catch (err: any) {
      console.warn('Gemini API call failed or timed out, falling back to rule-based engine:', err?.message);
      return res.json(generateRuleBasedRecommendations());
    }
  });

  // Seed Reset helper
  app.post('/api/seed/reset', requireAdmin, (req: Request, res: Response) => {
    db.resetToDefaults();
    return res.json({ success: true, message: 'Database reset to default seed data' });
  });

  // -------------------------------------------------------------
  // VITE / STATIC SERVING
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FoodieHub server running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start FoodieHub server:', err);
  process.exit(1);
});
