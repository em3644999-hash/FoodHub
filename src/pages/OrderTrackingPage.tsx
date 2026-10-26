import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Package,
  Bike,
  Home,
  Check,
  AlertCircle,
  XCircle,
  RotateCcw,
  Printer,
  ChevronLeft,
  UtensilsCrossed,
} from 'lucide-react';
import { Order, OrderStatus } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

interface OrderTrackingPageProps {
  orderId: string;
  onBackToOrders: () => void;
  onBackToMenu: () => void;
}

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'placed', label: 'Order Placed', desc: 'Received & sent to restaurant' },
  { key: 'confirmed', label: 'Confirmed', desc: 'Kitchen acknowledged order' },
  { key: 'preparing', label: 'Preparing Fresh', desc: 'Chef cooking with fresh ingredients' },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Valet on the way to your door' },
  { key: 'delivered', label: 'Delivered', desc: 'Enjoy your delicious meal!' },
];

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  orderId,
  onBackToOrders,
  onBackToMenu,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { success, error, info } = useToast();

  const fetchOrder = async () => {
    try {
      const res = await api.getOrderById(orderId);
      setOrder(res.order);
    } catch (err: any) {
      error('Could not load order', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Periodic refresh every 8 seconds for live progress
    const interval = setInterval(fetchOrder, 8000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-stone-500 font-medium">Fetching live order status...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
        <h3 className="text-xl font-bold text-stone-900">Order Not Found</h3>
        <p className="text-xs text-stone-500">
          The requested order ID does not exist or you do not have permission to view it.
        </p>
        <button
          onClick={onBackToOrders}
          className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const isCancelled = order.orderStatus === 'cancelled';
  const canCancel = order.orderStatus === 'placed' || order.orderStatus === 'confirmed';

  // Find step index (0 to 4)
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === order.orderStatus);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const res = await api.cancelOrder(order.id, cancelReason || 'Cancelled by customer');
      setOrder(res.order);
      setShowCancelModal(false);
      success('Order Cancelled', 'Your order was successfully cancelled.');
    } catch (err: any) {
      error('Cancellation Failed', err.message);
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const [simulating, setSimulating] = useState(false);

  const handleSimulateProgression = async () => {
    if (!order || isCancelled || order.orderStatus === 'delivered') return;
    setSimulating(true);

    const stepsRemaining: { status: OrderStatus; note: string }[] = [];
    const sequence: { status: OrderStatus; note: string }[] = [
      { status: 'confirmed', note: 'Kitchen accepted order & sent ticket to chefs' },
      { status: 'preparing', note: 'Chef fired up stove and began fresh preparation' },
      { status: 'out_for_delivery', note: 'Packed in thermal container, assigned to valet Suresh (KA-04-E-8812)' },
      { status: 'delivered', note: 'Handed over warm to customer at door' },
    ];

    const currentIdx = sequence.findIndex(s => s.status === order.orderStatus);
    const pending = sequence.slice(currentIdx + 1);

    info('Demo Simulation Started', 'Advancing order steps automatically every 3.5s...');

    for (const nextStep of pending) {
      await new Promise(res => setTimeout(res, 3500));
      try {
        const res = await api.updateOrderStatus(order.id, nextStep.status, nextStep.note);
        setOrder(res.order);
        success(`Step: ${nextStep.status.replace(/_/g, ' ')}`, nextStep.note);
        if (nextStep.status === 'delivered') {
          try {
            const confetti = (await import('canvas-confetti')).default;
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          } catch {}
        }
      } catch (err: any) {
        error('Simulation interrupted', err.message);
        break;
      }
    }
    setSimulating(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <button
          onClick={onBackToOrders}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {!isCancelled && order.orderStatus !== 'delivered' && (
            <button
              onClick={handleSimulateProgression}
              disabled={simulating}
              className="px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
              title="Automatically simulate live order delivery steps for demonstration"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-orange-600 ${simulating ? 'animate-spin' : ''}`} />
              <span>{simulating ? 'Simulating Kitchen...' : '▶ Auto-Simulate Progress'}</span>
            </button>
          )}
          <button
            onClick={fetchOrder}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider text-orange-400 font-bold">
                Live Order Tracking
              </span>
              <span className="text-stone-500">•</span>
              <span className="text-xs text-stone-300">
                {new Date(order.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-['Outfit']">
              Order #{order.orderNumber}
            </h2>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                order.orderStatus === 'delivered'
                  ? 'bg-emerald-500 text-white'
                  : order.orderStatus === 'cancelled'
                  ? 'bg-rose-600 text-white'
                  : 'bg-orange-500 text-white animate-pulse'
              }`}
            >
              {order.orderStatus.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Live Progress Timeline */}
        <div className="p-6 sm:p-8 border-b border-stone-200 bg-[#FAF8F5]">
          {isCancelled ? (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-rose-900">Order Was Cancelled</h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  This order was cancelled. Any pre-authorized demo payments will not be charged.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs text-stone-500 font-medium">Estimated Delivery</div>
                  <div className="text-lg font-black text-stone-900 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>
                      {order.orderStatus === 'delivered' ? 'Delivered' : order.estimatedDeliveryTime}
                    </span>
                  </div>
                </div>
                {canCancel && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                  >
                    Cancel Order
                  </button>
                )}
              </div>

              {/* Progress Stepper Bar */}
              <div className="relative">
                {/* Connecting background line */}
                <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-stone-200 -z-0">
                  <div
                    className="h-full bg-orange-600 transition-all duration-500"
                    style={{
                      width: `${Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100)}%`,
                    }}
                  />
                </div>

                {/* Steps List */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                  {STATUS_STEPS.map((step, idx) => {
                    const isDone = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;

                    return (
                      <div key={step.key} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shrink-0 ${
                            isDone
                              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                              : 'bg-white border-2 border-stone-200 text-stone-400'
                          } ${isCurrent ? 'ring-4 ring-orange-200 scale-105' : ''}`}
                        >
                          {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div>
                          <div
                            className={`text-xs font-bold ${
                              isDone ? 'text-stone-900' : 'text-stone-400'
                            }`}
                          >
                            {step.label}
                          </div>
                          <div className="text-[10px] text-stone-500 hidden sm:block mt-0.5">
                            {step.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Details & Summary Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Items Snapshot */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-orange-600" />
              <span>Items in this Order ({order.items.length})</span>
            </h4>

            <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl p-3 bg-stone-50/50">
              {order.items.map((item, i) => (
                <div key={i} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0 pr-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        {item.vegetarian ? (
                          <span className="w-2.5 h-2.5 rounded-xs border border-emerald-600 flex items-center justify-center">
                            <span className="w-1 h-1 rounded-full bg-emerald-600" />
                          </span>
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-xs border border-rose-700 flex items-center justify-center">
                            <span className="w-1 h-1 rounded-full bg-rose-700" />
                          </span>
                        )}
                        <h5 className="font-bold text-stone-900 truncate">{item.name}</h5>
                      </div>
                      <span className="text-[11px] text-stone-500">
                        {item.quantity} x ₹{item.price}
                      </span>
                    </div>
                  </div>
                  <div className="font-black text-stone-900">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({order.couponCode})</span>
                  <span>-₹{order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes (5% GST)</span>
                <span>₹{order.tax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-sm text-stone-900">
                <span>Total Paid / Payable</span>
                <span className="text-base text-orange-600 font-black">₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Right: Delivery & Payment Details */}
          <div className="space-y-6">
            {/* Delivery Destination */}
            <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>Delivery Address</span>
              </h4>
              <div className="text-xs text-stone-700 leading-relaxed">
                <div className="font-bold text-stone-900">{order.customerName}</div>
                <div>{order.deliveryAddress.street}</div>
                <div>
                  {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
                </div>
                {order.deliveryAddress.landmark && (
                  <div className="text-stone-500 mt-1">Landmark: {order.deliveryAddress.landmark}</div>
                )}
                <div className="flex items-center gap-1 text-stone-600 font-medium mt-2">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>{order.customerPhone}</span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Payment Details
              </h4>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500">Method</span>
                <span className="font-bold text-stone-800 uppercase">
                  {order.paymentMethod === 'cod'
                    ? 'Cash on Delivery'
                    : order.paymentMethod === 'demo_upi'
                    ? 'Demo Instant UPI'
                    : 'Demo Card'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500">Payment Status</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    order.paymentStatus === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Audit History Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Live Kitchen Activity Log
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {order.statusHistory.map(hist => (
                    <div key={hist.id} className="text-[11px] p-2.5 rounded-xl bg-stone-100/70 border border-stone-200 flex items-start justify-between">
                      <div>
                        <span className="font-bold text-stone-800 capitalize">
                          {hist.status.replace(/_/g, ' ')}
                        </span>
                        {hist.note && <div className="text-stone-500 mt-0.5">{hist.note}</div>}
                      </div>
                      <span className="text-stone-400 shrink-0 ml-2">
                        {new Date(hist.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-lg font-bold text-stone-900">Cancel Your Order?</h3>
            <p className="text-xs text-stone-500">
              Orders can only be cancelled before kitchen preparations advance. Please let us know the reason:
            </p>
            <input
              type="text"
              placeholder="E.g., Placed by mistake, changed mind"
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
