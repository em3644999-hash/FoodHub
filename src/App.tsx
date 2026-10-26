import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { FoodDetailModal } from './components/FoodDetailModal.tsx';
import { FoodieAIAssistant } from './components/FoodieAIAssistant.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { MenuPage } from './pages/MenuPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { OrdersHistoryPage } from './pages/OrdersHistoryPage.tsx';
import { OrderTrackingPage } from './pages/OrderTrackingPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { FoodItem } from './types/index.ts';
import { Sparkles } from 'lucide-react';

function FoodieHubApp() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedFoodForDetails, setSelectedFoodForDetails] = useState<FoodItem | null>(null);
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);

  const handleNavigateToMenu = (categoryId?: string) => {
    if (categoryId) {
      setSelectedCategoryId(categoryId);
    } else {
      setSelectedCategoryId('all');
    }
    setCurrentTab('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenFoodDetails = (food: FoodItem) => {
    setSelectedFoodForDetails(food);
  };

  const handleCloseFoodDetails = () => {
    setSelectedFoodForDetails(null);
  };

  const handleOrderSuccess = (orderId: string) => {
    setActiveTrackingOrderId(orderId);
    setCurrentTab('order-tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOrderForTracking = (orderId: string) => {
    setActiveTrackingOrderId(orderId);
    setCurrentTab('order-tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-orange-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={tab => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        openAIModal={() => setIsAIOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            onNavigateToMenu={handleNavigateToMenu}
            onOpenDetails={handleOpenFoodDetails}
            onOpenAI={() => setIsAIOpen(true)}
          />
        )}

        {currentTab === 'menu' && (
          <MenuPage
            initialCategoryId={selectedCategoryId}
            onOpenDetails={handleOpenFoodDetails}
          />
        )}

        {currentTab === 'checkout' && (
          <CheckoutPage
            onOrderSuccess={handleOrderSuccess}
            onNavigateToMenu={() => handleNavigateToMenu()}
          />
        )}

        {currentTab === 'orders' && (
          <OrdersHistoryPage
            onSelectOrder={handleSelectOrderForTracking}
            onNavigateToMenu={() => handleNavigateToMenu()}
          />
        )}

        {currentTab === 'order-tracking' && activeTrackingOrderId && (
          <OrderTrackingPage
            orderId={activeTrackingOrderId}
            onBackToOrders={() => {
              setCurrentTab('orders');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToMenu={() => handleNavigateToMenu()}
          />
        )}

        {currentTab === 'profile' && (
          <ProfilePage onNavigateToMenu={() => handleNavigateToMenu()} />
        )}

        {currentTab === 'admin' && <AdminDashboardPage />}
      </main>

      {/* Floating Foodie AI Summon Button */}
      <div className="fixed bottom-6 left-6 z-30">
        <button
          onClick={() => setIsAIOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-stone-900 hover:bg-orange-600 text-white font-bold text-xs shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border border-stone-700/80 hover:border-orange-500 hover:shadow-orange-600/30"
          title="Ask Foodie AI for instant food recommendations"
        >
          <div className="w-6 h-6 rounded-full bg-orange-500 group-hover:bg-white text-white group-hover:text-orange-600 flex items-center justify-center transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span>Ask Foodie AI</span>
        </button>
      </div>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        onNavigateToCheckout={() => {
          setCurrentTab('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateToMenu={() => handleNavigateToMenu()}
      />

      {/* Food Details Modal */}
      <FoodDetailModal
        food={selectedFoodForDetails}
        onClose={handleCloseFoodDetails}
      />

      {/* Foodie AI Assistant Dialog */}
      <FoodieAIAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onOpenDetails={food => {
          setIsAIOpen(false);
          handleOpenFoodDetails(food);
        }}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal />

      {/* Global Brand Footer */}
      <Footer setCurrentTab={tab => {
        setCurrentTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <FoodieHubApp />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
