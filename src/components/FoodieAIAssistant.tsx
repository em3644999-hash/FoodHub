import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ShoppingBag,
  Plus,
  Flame,
  Clock,
  ArrowRight,
  RefreshCw,
  Info,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { AIRecommendationItem, AIRecommendationResponse, FoodItem } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendations?: AIRecommendationItem[];
  suggestedFollowUps?: string[];
  source?: 'gemini' | 'rule-based';
  timestamp: string;
}

interface FoodieAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDetails: (food: FoodItem) => void;
}

const SAMPLE_PROMPTS = [
  'Suggest a vegetarian dinner under ₹250',
  'What should I order if I want something spicy?',
  'Recommend food for two people',
  'Which dishes are best for a quick light snack?',
  'Show me signature chef specials',
];

export const FoodieAIAssistant: React.FC<FoodieAIAssistantProps> = ({
  isOpen,
  onClose,
  onOpenDetails,
}) => {
  const { addItem, getItemQuantity } = useCart();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I'm Foodie AI, your personal culinary concierge. Tell me your cravings, budget, or dietary preferences and I'll find the perfect match from our freshly prepared menu!",
      suggestedFollowUps: [
        'Suggest a vegetarian dinner under ₹250',
        'What should I order if I want something spicy?',
        'Recommend food for two people',
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  if (!isOpen) return null;

  const handleSend = async (userQuery?: string) => {
    const textToSend = (userQuery || input).trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Parse budget if mentioned
      const budgetMatch = textToSend.match(/(?:under|below|budget)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
      const budget = budgetMatch ? parseInt(budgetMatch[1], 10) : undefined;

      const res: AIRecommendationResponse = await api.getAIRecommendation({
        query: textToSend,
        budget,
        vegetarianOnly: textToSend.toLowerCase().includes('veg') && !textToSend.toLowerCase().includes('non-veg'),
        dietaryPreferences: user?.dietaryPreferences,
      });

      const aiMsg: Message = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: res.message,
        recommendations: res.recommendations,
        suggestedFollowUps: res.suggestedFollowUps,
        source: res.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: 'err-' + Date.now(),
        sender: 'ai',
        text: 'I could not process that request right now. Please try one of our suggested questions below!',
        suggestedFollowUps: SAMPLE_PROMPTS.slice(0, 3),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (rec: AIRecommendationItem) => {
    try {
      const res = await api.getFoodById(rec.id);
      if (res.food) {
        addItem(res.food, 1);
      }
    } catch {
      // Create minimal food item if fetch fails
      const fallbackFood: FoodItem = {
        id: rec.id,
        name: rec.name,
        description: rec.reason,
        categoryId: 'cat-biryani',
        price: rec.price,
        imageUrl: rec.imageUrl,
        vegetarian: rec.vegetarian,
        allergens: [],
        ingredients: [],
        spiceLevel: rec.spiceLevel,
        preparationTime: 20,
        rating: 4.8,
        reviewsCount: 100,
        available: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addItem(fallbackFood, 1);
    }
  };

  const handleCardClick = async (rec: AIRecommendationItem) => {
    try {
      const res = await api.getFoodById(rec.id);
      if (res.food) {
        onOpenDetails(res.food);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col h-[85vh] max-h-[750px] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white flex items-center justify-between border-b border-stone-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg font-['Outfit'] text-white">
                  Foodie AI Assistant
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  Gemini Grounded
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Menu-grounded meal matching, dietary filters & instant add-to-cart
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#FAF8F5]">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-orange-600 text-white rounded-tr-xs'
                    : 'bg-white border border-stone-200/80 text-stone-800 rounded-tl-xs'
                }`}
              >
                <div>{msg.text}</div>

                {/* Recommendations Cards */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="mt-3.5 space-y-2.5">
                    {msg.recommendations.map(rec => (
                      <div
                        key={rec.id}
                        onClick={() => handleCardClick(rec)}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 hover:bg-orange-50/50 border border-stone-200/80 transition-colors cursor-pointer group"
                      >
                        <img
                          src={rec.imageUrl}
                          alt={rec.name}
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {rec.vegetarian ? (
                              <span className="w-3 h-3 rounded-xs border border-emerald-600 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              </span>
                            ) : (
                              <span className="w-3 h-3 rounded-xs border border-rose-700 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-700" />
                              </span>
                            )}
                            <h5 className="font-bold text-stone-900 group-hover:text-orange-600 transition-colors truncate">
                              {rec.name}
                            </h5>
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            {rec.reason}
                          </p>
                          <div className="text-xs font-black text-stone-900 mt-1">
                            ₹{rec.price}
                          </div>
                        </div>

                        {/* Add to cart from recommendation */}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleQuickAdd(rec);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs shrink-0 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Source Badge */}
                {msg.source && (
                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-orange-500" />
                      Powered by {msg.source === 'gemini' ? 'Gemini 3.8 Flash' : 'Smart Menu Intelligence'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                )}

                {/* Suggested follow up chips */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-stone-100 flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(prompt)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-stone-100 hover:bg-orange-100 hover:text-orange-800 text-stone-700 border border-stone-200 transition-colors cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-stone-800 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-stone-500">
              <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-white border border-stone-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce delay-200" />
                <span>Cooking up intelligent recommendations...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything: 'Suggest lunch for 2 under ₹500', 'Spicy chicken'..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50/70"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 transition-colors shadow-md shadow-orange-600/30 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
