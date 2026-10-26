import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Users,
  FolderTree,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Search,
  Eye,
  RefreshCw,
  X,
  Filter,
  Check,
  RotateCcw,
  ShieldCheck,
  Tag,
  Download,
} from 'lucide-react';
import {
  AdminStats,
  FoodItem,
  Category,
  Order,
  OrderStatus,
  SpiceLevel,
  Coupon,
} from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

type Tab = 'overview' | 'orders' | 'foods' | 'categories' | 'coupons' | 'customers';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin, loginAsDemoAdmin } = useAuth();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for orders tab
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Selected order details modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdateNote, setStatusUpdateNote] = useState('');

  // Food Create/Edit Modal State
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [foodName, setFoodName] = useState('');
  const [foodDesc, setFoodDesc] = useState('');
  const [foodPrice, setFoodPrice] = useState(199);
  const [foodCatId, setFoodCatId] = useState('');
  const [foodImage, setFoodImage] = useState('');
  const [foodVeg, setFoodVeg] = useState(true);
  const [foodSpice, setFoodSpice] = useState<SpiceLevel>('Medium');
  const [foodPrepTime, setFoodPrepTime] = useState(20);
  const [foodCalories, setFoodCalories] = useState(400);
  const [foodChefSpecial, setFoodChefSpecial] = useState(false);
  const [foodBestSeller, setFoodBestSeller] = useState(false);
  const [foodIngredients, setFoodIngredients] = useState('Flour, Herbs, Oil');
  const [foodAllergens, setFoodAllergens] = useState('');

  // Category Create Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');

  // Coupon Create Modal State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [cCode, setCCode] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cType, setCType] = useState<'percentage' | 'fixed'>('percentage');
  const [cVal, setCVal] = useState(20);
  const [cMinOrder, setCMinOrder] = useState(200);
  const [cMaxDisc, setCMaxDisc] = useState(100);

  const loadAllAdminData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [statsRes, ordersRes, foodsRes, catsRes, custsRes, coupsRes] = await Promise.all([
        api.getAdminStats(),
        api.getOrders(),
        api.getFoods(),
        api.getCategories(),
        api.getCustomers(),
        api.getCoupons(),
      ]);
      setStats(statsRes.stats);
      setOrders(ordersRes.orders || []);
      setFoods(foodsRes.foods || []);
      setCategories(catsRes.categories || []);
      setCustomers(custsRes.customers || []);
      setCoupons(coupsRes.coupons || []);
    } catch (err: any) {
      error('Failed to load admin data', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-16 h-16 text-amber-500 mx-auto" />
        <h3 className="text-xl font-bold text-stone-900 font-['Outfit']">
          Administrator Access Required
        </h3>
        <p className="text-xs text-stone-500 leading-relaxed">
          The Kitchen & Store Administration Dashboard is protected. Please sign in with an administrator account to continue.
        </p>
        <button
          onClick={loginAsDemoAdmin}
          className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/30 cursor-pointer"
        >
          Sign In as Demo Admin (admin@foodiehub.com)
        </button>
      </div>
    );
  }

  // --- Order Actions ---
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus, statusUpdateNote);
      setOrders(prev => prev.map(o => (o.id === res.order.id ? res.order : o)));
      if (selectedOrder && selectedOrder.id === res.order.id) {
        setSelectedOrder(res.order);
      }
      setStatusUpdateNote('');
      success('Order Updated', `Order status changed to ${newStatus}`);
      // Refresh stats
      const statsRes = await api.getAdminStats();
      setStats(statsRes.stats);
    } catch (err: any) {
      error('Update Failed', err.message);
    }
  };

  // --- Food Actions ---
  const handleOpenAddFood = () => {
    setEditingFood(null);
    setFoodName('');
    setFoodDesc('');
    setFoodPrice(199);
    setFoodCatId(categories[0]?.id || 'cat-biryani');
    setFoodImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80');
    setFoodVeg(true);
    setFoodSpice('Medium');
    setFoodPrepTime(20);
    setFoodCalories(450);
    setFoodChefSpecial(false);
    setFoodBestSeller(false);
    setFoodIngredients('Fresh Ingredients, Herbs, Spices');
    setFoodAllergens('');
    setShowFoodModal(true);
  };

  const handleOpenEditFood = (food: FoodItem) => {
    setEditingFood(food);
    setFoodName(food.name);
    setFoodDesc(food.description);
    setFoodPrice(food.price);
    setFoodCatId(food.categoryId);
    setFoodImage(food.imageUrl);
    setFoodVeg(food.vegetarian);
    setFoodSpice(food.spiceLevel);
    setFoodPrepTime(food.preparationTime);
    setFoodCalories(food.calories || 400);
    setFoodChefSpecial(Boolean(food.isChefSpecial));
    setFoodBestSeller(Boolean(food.isBestSeller));
    setFoodIngredients(food.ingredients.join(', '));
    setFoodAllergens(food.allergens.join(', '));
    setShowFoodModal(true);
  };

  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: foodName.trim(),
        description: foodDesc.trim(),
        price: Number(foodPrice),
        categoryId: foodCatId,
        imageUrl: foodImage.trim(),
        vegetarian: foodVeg,
        spiceLevel: foodSpice,
        preparationTime: Number(foodPrepTime),
        calories: Number(foodCalories),
        isChefSpecial: foodChefSpecial,
        isBestSeller: foodBestSeller,
        ingredients: foodIngredients.split(',').map(s => s.trim()).filter(Boolean),
        allergens: foodAllergens.split(',').map(s => s.trim()).filter(Boolean),
      };

      if (editingFood) {
        const res = await api.updateFood(editingFood.id, payload);
        setFoods(prev => prev.map(f => (f.id === res.food.id ? res.food : f)));
        success('Dish Updated', `${res.food.name} updated successfully`);
      } else {
        const res = await api.createFood(payload);
        setFoods(prev => [res.food, ...prev]);
        success('Dish Created', `${res.food.name} added to menu`);
      }
      setShowFoodModal(false);
    } catch (err: any) {
      error('Could not save dish', err.message);
    }
  };

  const handleToggleAvailability = async (food: FoodItem) => {
    try {
      const res = await api.setFoodAvailability(food.id, !food.available);
      setFoods(prev => prev.map(f => (f.id === res.food.id ? res.food : f)));
      info(
        'Availability Changed',
        `${food.name} marked as ${!food.available ? 'Available' : 'Unavailable'}`
      );
    } catch (err: any) {
      error('Toggle Failed', err.message);
    }
  };

  const handleDeleteFood = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the menu?`)) return;
    try {
      await api.deleteFood(id);
      setFoods(prev => prev.filter(f => f.id !== id));
      success('Dish Deleted', `"${name}" removed from menu`);
    } catch (err: any) {
      error('Delete Failed', err.message);
    }
  };

  // --- Category Actions ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      const res = await api.createCategory({
        name: catName.trim(),
        description: catDesc.trim(),
        imageUrl: catImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      });
      setCategories(prev => [...prev, res.category]);
      setShowCategoryModal(false);
      setCatName('');
      setCatDesc('');
      setCatImage('');
      success('Category Created', `${res.category.name} created`);
    } catch (err: any) {
      error('Failed to create category', err.message);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"? Dishes in this category may need re-assigning.`)) return;
    try {
      await api.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      success('Category Deleted', `Category removed`);
    } catch (err: any) {
      error('Failed to delete category', err.message);
    }
  };

  // --- Coupon Actions ---
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cCode.trim()) return;
    try {
      const res = await api.createCoupon({
        code: cCode.trim().toUpperCase(),
        description: cDesc.trim(),
        discountType: cType,
        discountValue: Number(cVal),
        minimumOrderValue: Number(cMinOrder),
        maximumDiscount: cType === 'percentage' ? Number(cMaxDisc) : undefined,
      });
      setCoupons(prev => [res.coupon, ...prev]);
      setShowCouponModal(false);
      setCCode('');
      setCDesc('');
      success('Coupon Created', `Code ${res.coupon.code} is now live!`);
    } catch (err: any) {
      error('Failed to create coupon', err.message);
    }
  };

  const handleToggleCoupon = async (coupon: Coupon) => {
    try {
      const res = await api.toggleCoupon(coupon.id);
      setCoupons(prev => prev.map(c => (c.id === res.coupon.id ? res.coupon : c)));
      info('Coupon Updated', `${coupon.code} is now ${res.coupon.active ? 'Active' : 'Inactive'}`);
    } catch (err: any) {
      error('Toggle failed', err.message);
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      success('Coupon Deleted', `${code} removed`);
    } catch (err: any) {
      error('Delete failed', err.message);
    }
  };

  // --- Reset Seed Data ---
  const handleResetSeed = async () => {
    if (!window.confirm('Reset database to default sample dishes and orders?')) return;
    try {
      await api.resetSeedData();
      await loadAllAdminData();
      success('Database Reset', 'Sample data restored successfully');
    } catch (err: any) {
      error('Reset failed', err.message);
    }
  };

  // Filter orders for table
  const filteredOrders = orders.filter(o => {
    const matchesStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    const matchesSearch =
      orderSearch === '' ||
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-stone-900 text-amber-400">
              Admin Portal
            </span>
            <span className="text-xs text-stone-400">FoodieHub Central Kitchen Management</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 font-['Outfit']">
            Operations & Analytics
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllAdminData}
            className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
          <button
            onClick={handleResetSeed}
            className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            title="Reset to default seed data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>Reset Demo DB</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-stone-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-stone-900 text-amber-400 shadow-md'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-stone-900 text-amber-400 shadow-md'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders Management ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('foods')}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'foods'
              ? 'bg-stone-900 text-amber-400 shadow-md'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Food Menu ({foods.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-stone-900 text-amber-400 shadow-md'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Categories ({categories.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'coupons'
              ? 'bg-stone-900 text-amber-400 shadow-md'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Coupons & Deals ({coupons.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'customers'
              ? 'bg-stone-900 text-amber-400 shadow-md'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customer Directory ({customers.length})</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. OVERVIEW TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
                <span>Total Net Sales</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-stone-900">
                ₹{stats.totalSales.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold">
                From valid paid orders
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
                <span>Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-black text-stone-900">{stats.totalOrders}</div>
              <div className="text-[11px] text-stone-400">All registered orders</div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
                <span>Active / Pending</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-600">{stats.pendingOrders}</div>
              <div className="text-[11px] text-stone-400">In kitchen or delivery</div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
                <span>Delivered Orders</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600">
                {stats.completedOrders}
              </div>
              <div className="text-[11px] text-stone-400">Completed safely</div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
                <span>Customers</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-600">{stats.totalCustomers}</div>
              <div className="text-[11px] text-stone-400">Registered users</div>
            </div>
          </div>

          {/* Daily Sales Chart & Popular Dishes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sales Chart (7 cols) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-stone-900 font-['Outfit']">
                    Weekly Sales Trend (₹)
                  </h3>
                  <span className="text-xs text-stone-400">Revenue per day across valid orders</span>
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>

              {/* Bar visualization */}
              <div className="pt-6 h-56 flex items-end justify-between gap-2 border-b border-stone-200 pb-2">
                {stats.dailySales.map(day => {
                  const maxVal = Math.max(...stats.dailySales.map(d => d.sales), 1000);
                  const heightPercent = Math.max(12, Math.round((day.sales / maxVal) * 100));

                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[10px] font-bold text-stone-700">₹{day.sales}</span>
                      <div
                        className="w-full bg-gradient-to-t from-orange-600 to-amber-500 rounded-t-xl transition-all duration-500 hover:opacity-90"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[10px] text-stone-400 whitespace-nowrap">
                        {day.date.substring(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Popular Dishes (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-stone-900 font-['Outfit']">
                Top Selling Dishes
              </h3>

              <div className="divide-y divide-stone-100">
                {stats.popularDishes.map((dish, i) => (
                  <div key={i} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {i + 1}
                      </span>
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-stone-900 truncate">{dish.name}</div>
                        <div className="text-[11px] text-stone-400">{dish.count} ordered</div>
                      </div>
                    </div>
                    <div className="font-black text-stone-800 shrink-0">
                      ₹{dish.revenue.toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. ORDERS MANAGEMENT TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden space-y-4 p-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search by order #, customer, phone..."
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-stone-500 font-semibold whitespace-nowrap">Status:</span>
              <select
                value={orderStatusFilter}
                onChange={e => setOrderStatusFilter(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="all">All Statuses ({orders.length})</option>
                <option value="placed">Placed</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  if (orders.length === 0) {
                    info('No Orders', 'There are no orders to export');
                    return;
                  }
                  const headers = [
                    'Order ID',
                    'Order Number',
                    'Date',
                    'Customer Name',
                    'Customer Phone',
                    'Items Count',
                    'Subtotal',
                    'Discount',
                    'Delivery Fee',
                    'Tax',
                    'Total',
                    'Payment Method',
                    'Payment Status',
                    'Order Status',
                    'Delivery Street',
                    'City',
                  ];
                  const rows = orders.map(o => [
                    `"${o.id}"`,
                    `"${o.orderNumber}"`,
                    `"${new Date(o.createdAt).toLocaleString()}"`,
                    `"${o.customerName.replace(/"/g, '""')}"`,
                    `"${o.customerPhone}"`,
                    o.items.reduce((s, i) => s + i.quantity, 0),
                    o.subtotal,
                    o.discount,
                    o.deliveryFee,
                    o.tax,
                    o.total,
                    `"${o.paymentMethod}"`,
                    `"${o.paymentStatus}"`,
                    `"${o.orderStatus}"`,
                    `"${o.deliveryAddress.street.replace(/"/g, '""')}"`,
                    `"${o.deliveryAddress.city.replace(/"/g, '""')}"`,
                  ]);
                  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `FoodieHub_Orders_Report_${new Date().toISOString().slice(0, 10)}.csv`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  success('Report Exported', 'Orders CSV downloaded successfully');
                }}
                className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                title="Download complete orders report in CSV"
              >
                <Download className="w-3.5 h-3.5 text-stone-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto border border-stone-200 rounded-2xl">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Order</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Total</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-400">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-3.5 font-bold text-stone-900">
                        #{order.orderNumber}
                        <div className="text-[10px] text-stone-400 font-normal">
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-stone-800">{order.customerName}</div>
                        <div className="text-[11px] text-stone-400">{order.customerPhone}</div>
                      </td>
                      <td className="p-3.5 max-w-xs truncate">
                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </td>
                      <td className="p-3.5 font-black text-stone-900">
                        ₹{order.total.toFixed(2)}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={order.orderStatus}
                          onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg border border-stone-200 text-xs font-bold uppercase bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. FOOD MENU MANAGEMENT TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'foods' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-stone-900 font-['Outfit']">
                Menu Dishes Management
              </h3>
              <p className="text-xs text-stone-500">
                Create new dishes, adjust pricing, toggle live kitchen availability, or edit preparation times.
              </p>
            </div>
            <button
              onClick={handleOpenAddFood}
              className="px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-orange-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {foods.map(food => (
              <div
                key={food.id}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-white transition-colors flex items-start gap-3.5"
              >
                <img
                  src={food.imageUrl}
                  alt={food.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-stone-900 truncate">{food.name}</span>
                    <span className="font-black text-sm text-stone-900">₹{food.price}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                    {food.description}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {/* Live Availability Toggle Switch */}
                    <button
                      onClick={() => handleToggleAvailability(food)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                        food.available
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {food.available ? '● Available' : '○ Sold Out'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditFood(food)}
                        className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200 cursor-pointer"
                        title="Edit dish"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFood(food.id, food.name)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 cursor-pointer"
                        title="Delete dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. CATEGORIES TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-stone-900 font-['Outfit']">
                Categories Management
              </h3>
              <p className="text-xs text-stone-500">
                Organize dishes into browsable food categories.
              </p>
            </div>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-orange-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map(cat => {
              const dishCount = foods.filter(f => f.categoryId === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3"
                >
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-28 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">{cat.name}</h4>
                    <p className="text-[11px] text-stone-500 line-clamp-1">{cat.description}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      {dishCount} dishes
                    </span>
                  </div>
                  <div className="pt-2 border-t border-stone-200 flex justify-end">
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. COUPONS & PROMOTIONS TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'coupons' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-stone-900 font-['Outfit']">
                Coupons & Promotional Deals
              </h3>
              <p className="text-xs text-stone-500">
                Create promotional discount vouchers, set minimum cart values, and monitor usage limits.
              </p>
            </div>
            <button
              onClick={() => setShowCouponModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-orange-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map(coupon => (
              <div
                key={coupon.id}
                className={`p-5 rounded-3xl border transition-all ${
                  coupon.active
                    ? 'border-stone-200 bg-white shadow-xs'
                    : 'border-stone-200 bg-stone-50/70 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono font-black text-sm px-3 py-1 rounded-xl bg-orange-100 text-orange-800 tracking-wider">
                    {coupon.code}
                  </span>
                  <button
                    onClick={() => handleToggleCoupon(coupon)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                      coupon.active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                    }`}
                  >
                    {coupon.active ? '● Active' : '○ Paused'}
                  </button>
                </div>

                <p className="text-xs text-stone-600 font-medium mb-3">
                  {coupon.description || 'Promotional coupon code'}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-stone-100 text-[11px] text-stone-500">
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <strong className="text-stone-800 font-bold">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}% OFF`
                        : `₹${coupon.discountValue} FLAT`}
                      {coupon.maximumDiscount ? ` (Max ₹${coupon.maximumDiscount})` : ''}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Min Order:</span>
                    <strong className="text-stone-800 font-bold">
                      ₹{coupon.minimumOrderValue || 0}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Times Used:</span>
                    <strong className="text-stone-800 font-bold">{coupon.timesUsed || 0}</strong>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-stone-100 flex justify-end">
                  <button
                    onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                    className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                  >
                    Delete Coupon
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. CUSTOMER DIRECTORY TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-lg text-stone-900 font-['Outfit']">
            Registered Customers
          </h3>

          <div className="overflow-x-auto border border-stone-200 rounded-2xl">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Orders Placed</th>
                  <th className="p-3.5">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-stone-50/60">
                    <td className="p-3.5 font-bold text-stone-900">{c.name}</td>
                    <td className="p-3.5">{c.email}</td>
                    <td className="p-3.5">{c.phone || '—'}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-800">
                        {c.role}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-stone-900">{c.totalOrders || 0}</td>
                    <td className="p-3.5 font-black text-stone-900">
                      ₹{(c.totalSpent || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-bold text-stone-900 font-['Outfit']">
                  Order Details #{selectedOrder.orderNumber}
                </h3>
                <span className="text-xs text-stone-400">
                  Customer: {selectedOrder.customerName} ({selectedOrder.customerPhone})
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status updater in modal */}
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-2">
              <label className="block text-xs font-bold text-orange-900 uppercase tracking-wider">
                Change Status
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedOrder.orderStatus}
                  onChange={e => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-orange-300 bg-white text-xs font-bold uppercase"
                >
                  <option value="placed">Placed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Optional kitchen note (e.g., Assigned to valet Ramesh)"
                value={statusUpdateNote}
                onChange={e => setStatusUpdateNote(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-orange-300 bg-white text-xs"
              />
            </div>

            {/* Ordered Dishes List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Items ({selectedOrder.items.length})
              </h4>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl p-3 bg-stone-50/50">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-stone-900">{item.name}</span>
                      <span className="text-stone-500 ml-2">x {item.quantity}</span>
                      {item.specialInstructions && (
                        <div className="text-[11px] text-orange-600 italic">
                          "{item.specialInstructions}"
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-stone-900">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="p-3.5 rounded-2xl border border-stone-200 text-xs text-stone-700">
              <div className="font-bold text-stone-900 mb-0.5">Delivery Address</div>
              <div>{selectedOrder.deliveryAddress.street}</div>
              <div>{selectedOrder.deliveryAddress.city} - {selectedOrder.deliveryAddress.pincode}</div>
              {selectedOrder.deliveryAddress.landmark && (
                <div className="text-stone-500">Landmark: {selectedOrder.deliveryAddress.landmark}</div>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({selectedOrder.couponCode}):</span>
                  <span>-₹{selectedOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>{selectedOrder.deliveryFee === 0 ? 'FREE' : `₹${selectedOrder.deliveryFee}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>₹{selectedOrder.tax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between font-black text-sm text-stone-900">
                <span>Total Amount:</span>
                <span>₹{selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Dish Modal */}
      {showFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleSaveFood}
            className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 font-['Outfit']">
                {editingFood ? `Edit Dish: ${editingFood.name}` : 'Add New Menu Dish'}
              </h3>
              <button
                type="button"
                onClick={() => setShowFoodModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Dish Name
              </label>
              <input
                type="text"
                required
                value={foodName}
                onChange={e => setFoodName(e.target.value)}
                placeholder="E.g., Tandoori Paneer Tikka"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  max="5000"
                  value={foodPrice}
                  onChange={e => setFoodPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={foodCatId}
                  onChange={e => setFoodCatId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={foodImage}
                onChange={e => setFoodImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={foodDesc}
                onChange={e => setFoodDesc(e.target.value)}
                placeholder="Appetizing description of ingredients and flavors"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Type
                </label>
                <select
                  value={foodVeg ? 'true' : 'false'}
                  onChange={e => setFoodVeg(e.target.value === 'true')}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                >
                  <option value="true">Pure Veg</option>
                  <option value="false">Non-Veg</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Spice Level
                </label>
                <select
                  value={foodSpice}
                  onChange={e => setFoodSpice(e.target.value as SpiceLevel)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                >
                  <option value="Mild">Mild</option>
                  <option value="Medium">Medium</option>
                  <option value="Hot">Hot</option>
                  <option value="Extra Hot">Extra Hot</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Prep Time (mins)
                </label>
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={foodPrepTime}
                  onChange={e => setFoodPrepTime(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Key Ingredients (comma separated)
              </label>
              <input
                type="text"
                value={foodIngredients}
                onChange={e => setFoodIngredients(e.target.value)}
                placeholder="Paneer, Butter, Tomatoes, Cream"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Allergens (comma separated)
              </label>
              <input
                type="text"
                value={foodAllergens}
                onChange={e => setFoodAllergens(e.target.value)}
                placeholder="Dairy, Tree Nuts, Gluten"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={foodChefSpecial}
                  onChange={e => setFoodChefSpecial(e.target.checked)}
                  className="rounded text-orange-600"
                />
                <span>Chef's Special Tag</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={foodBestSeller}
                  onChange={e => setFoodBestSeller(e.target.checked)}
                  className="rounded text-orange-600"
                />
                <span>Bestseller Tag</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowFoodModal(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                {editingFood ? 'Save Changes' : 'Create Dish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleSaveCategory}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 font-['Outfit']">
                Add New Food Category
              </h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Category Name
              </label>
              <input
                type="text"
                required
                value={catName}
                onChange={e => setCatName(e.target.value)}
                placeholder="E.g., Beverages & Coffee"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Description
              </label>
              <input
                type="text"
                value={catDesc}
                onChange={e => setCatDesc(e.target.value)}
                placeholder="Aromatic freshly brewed beverages"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={catImage}
                onChange={e => setCatImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Add Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleCreateCoupon}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 font-['Outfit']">
                Create New Promotional Coupon
              </h3>
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Coupon Code
              </label>
              <input
                type="text"
                required
                value={cCode}
                onChange={e => setCCode(e.target.value.toUpperCase())}
                placeholder="E.g., FESTIVAL30"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Description
              </label>
              <input
                type="text"
                required
                value={cDesc}
                onChange={e => setCDesc(e.target.value)}
                placeholder="30% off on all meals"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Discount Type
                </label>
                <select
                  value={cType}
                  onChange={e => setCType(e.target.value as 'percentage' | 'fixed')}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Discount Value
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="1000"
                  value={cVal}
                  onChange={e => setCVal(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Min Cart Value (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={cMinOrder}
                  onChange={e => setCMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Max Cap (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={cMaxDisc}
                  onChange={e => setCMaxDisc(Number(e.target.value))}
                  disabled={cType === 'fixed'}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-stone-100 disabled:text-stone-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Create Promo Code
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
