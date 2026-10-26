import React, { useState, useEffect } from 'react';
import {
  Clock,
  Package,
  ArrowRight,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Order } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface OrdersHistoryPageProps {
  onSelectOrder: (orderId: string) => void;
  onNavigateToMenu: () => void;
}

export const OrdersHistoryPage: React.FC<OrdersHistoryPageProps> = ({
  onSelectOrder,
  onNavigateToMenu,
}) => {
  const { user, openAuthModal } = useAuth();
  const { addItem, openCart } = useCart();
  const { success, error } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.getOrders();
      setOrders(res.orders || []);
    } catch (err: any) {
      error('Could not load orders', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-stone-900 font-['Outfit']">
          Sign In to View Orders
        </h3>
        <p className="text-xs text-stone-500">
          Please sign in to your FoodieHub account to track active deliveries and view past orders.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/30 cursor-pointer"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const handleReorder = async (order: Order) => {
    let reorderedCount = 0;
    for (const item of order.items) {
      try {
        const res = await api.getFoodById(item.foodItemId);
        if (res.food && res.food.available) {
          addItem(res.food, item.quantity);
          reorderedCount++;
        }
      } catch {
        // skip unavailable
      }
    }
    if (reorderedCount > 0) {
      success('Items Added to Cart', `Added ${reorderedCount} dishes from Order #${order.orderNumber}`);
      openCart();
    } else {
      error('Reorder Unavailable', 'The items in this order are currently unavailable');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
            Order History
          </span>
          <h1 className="text-3xl font-black text-stone-900 font-['Outfit'] mt-1">
            Your Culinary Orders
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track current progress or reorder your favorite meals in a single click.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-2 self-start cursor-pointer shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Orders List or Empty */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-36 rounded-3xl bg-stone-200/60 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-stone-200 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">No orders placed yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            You haven't ordered any meals yet. Explore our fresh chef specials and place your first order!
          </p>
          <button
            onClick={onNavigateToMenu}
            className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 cursor-pointer"
          >
            Explore FoodieHub Menu
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const isCompleted = order.orderStatus === 'delivered';
            const isCancelled = order.orderStatus === 'cancelled';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-extrabold text-base text-stone-900 font-['Outfit']">
                      #{order.orderNumber}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-xs text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCancelled
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-orange-100 text-orange-800 animate-pulse'
                      }`}
                    >
                      {order.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="flex items-center gap-2 text-xs text-stone-700">
                    <Package className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="line-clamp-1">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </span>
                  </div>

                  {/* Delivery Location snippet */}
                  <div className="text-[11px] text-stone-500 line-clamp-1">
                    Delivered to: {order.deliveryAddress.street}, {order.deliveryAddress.city}
                  </div>
                </div>

                {/* Right Info & Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                  <div className="text-left md:text-right">
                    <div className="text-[11px] text-stone-400 uppercase font-semibold">Total</div>
                    <div className="text-xl font-black text-stone-900">₹{order.total.toFixed(2)}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Reorder same items"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reorder</span>
                    </button>

                    <button
                      onClick={() => onSelectOrder(order.id)}
                      className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-600/25 cursor-pointer transition-colors"
                    >
                      <span>{isCompleted ? 'View Order' : 'Track Status'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
