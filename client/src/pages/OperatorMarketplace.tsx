import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Star,
  Download,
  Users,
  TrendingUp,
  Filter,
  ShoppingCart,
  Heart,
  Share2,
  Eye,
} from 'lucide-react';

interface MarketplaceItem {
  id: number;
  title: string;
  creator: string;
  category: 'template' | 'theme' | 'broadcaster' | 'plugin';
  price: number;
  rating: number;
  reviews: number;
  downloads: number;
  description: string;
  image: string;
  features: string[];
  revenue_share?: number;
}

const MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: 1,
    title: 'Professional Podcast Studio Template',
    creator: 'Studio Pro',
    category: 'template',
    price: 49.99,
    rating: 4.8,
    reviews: 156,
    downloads: 2341,
    description: 'Complete podcast setup with chat, guest management, and monetization',
    image: '🎙️',
    features: ['Live Chat', 'Guest Management', 'Monetization', 'Analytics'],
  },
  {
    id: 2,
    title: 'Gaming Stream Overlay Pack',
    creator: 'Overlay Masters',
    category: 'theme',
    price: 29.99,
    rating: 4.9,
    reviews: 89,
    downloads: 1203,
    description: 'Professional gaming overlays with animations and alerts',
    image: '🎮',
    features: ['Animations', 'Custom Alerts', 'Responsive Design', 'Dark Mode'],
  },
  {
    id: 3,
    title: 'Expert Broadcaster - Music',
    creator: 'DJ Luna',
    category: 'broadcaster',
    price: 0,
    rating: 4.7,
    reviews: 45,
    downloads: 892,
    description: 'Professional music broadcaster available for hire',
    image: '🎵',
    features: ['5+ Years Experience', 'Multi-Genre', 'Live Mixing', 'Audience Building'],
    revenue_share: 30,
  },
  {
    id: 4,
    title: 'Advanced Analytics Dashboard',
    creator: 'Data Insights',
    category: 'plugin',
    price: 19.99,
    rating: 4.6,
    reviews: 67,
    downloads: 1456,
    description: 'Real-time analytics with predictive insights and custom reports',
    image: '📊',
    features: ['Real-time Data', 'Predictions', 'Custom Reports', 'API Access'],
  },
  {
    id: 5,
    title: 'Minimalist Stream Template',
    creator: 'Design Studio',
    category: 'template',
    price: 39.99,
    rating: 4.9,
    reviews: 234,
    downloads: 3892,
    description: 'Clean, modern template perfect for any content type',
    image: '✨',
    features: ['Responsive', 'Customizable', 'Mobile-Friendly', 'SEO Optimized'],
  },
  {
    id: 6,
    title: 'Expert Broadcaster - Tech',
    creator: 'Tech Guru',
    category: 'broadcaster',
    price: 0,
    rating: 4.8,
    reviews: 78,
    downloads: 1567,
    description: 'Technology expert for tech talks and tutorials',
    image: '💻',
    features: ['Tech Expert', 'Tutorial Specialist', 'Audience Engagement', 'Professional'],
    revenue_share: 25,
  },
];

export function OperatorMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cart, setCart] = useState<number[]>([]);

  const filteredItems = MARKETPLACE_ITEMS.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.creator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const toggleCart = (id: number) => {
    setCart((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const categories = [
    { id: 'template', label: 'Templates', icon: '📋' },
    { id: 'theme', label: 'Themes', icon: '🎨' },
    { id: 'broadcaster', label: 'Broadcasters', icon: '👤' },
    { id: 'plugin', label: 'Plugins', icon: '🔌' },
  ];

  const cartTotal = cart.reduce((sum, id) => {
    const item = MARKETPLACE_ITEMS.find((i) => i.id === id);
    return sum + (item?.price || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black bg-opacity-50 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">Marketplace</h1>
            <Button className="bg-orange-600 hover:bg-orange-700 gap-2">
              <ShoppingCart className="w-4 h-4" />
              Cart ({cart.length})
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates, themes, broadcasters..."
              className="pl-10 bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Categories
              </h3>
              <div className="space-y-2">
                <Button
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(null)}
                  className="w-full justify-start"
                >
                  All Items
                </Button>
                {categories.map((cat, idx) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="w-full justify-start"
                  >
                    {cat.icon} {cat.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Favorites */}
            <Card className="bg-gray-800 border-gray-700 p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" /> Favorites
              </h3>
              <p className="text-gray-400 text-sm">{favorites.length} saved items</p>
            </Card>

            {/* Stats */}
            <Card className="bg-gray-800 border-gray-700 p-4 space-y-3">
              <h3 className="text-white font-semibold">Marketplace Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Items</span>
                  <span className="text-white font-semibold">{MARKETPLACE_ITEMS.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Creators</span>
                  <span className="text-white font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Downloads</span>
                  <span className="text-white font-semibold">12.5K+</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="mb-6">
              <p className="text-gray-400">
                Showing {filteredItems.length} of {MARKETPLACE_ITEMS.length} items
              </p>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map((item, idx) => (
                <Card
                  key={item.id}
                  className="bg-gray-800 border-gray-700 overflow-hidden hover:border-orange-500 transition-colors"
                >
                  {/* Image */}
                  <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-8 text-center text-5xl">
                    {item.image}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{item.title}</h3>
                      <p className="text-gray-400 text-sm">{item.creator}</p>
                    </div>

                    <p className="text-gray-300 text-sm">{item.description}</p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {item.features.slice(0, 2).map((feature, idx) => (
                        <span
                          key={`item-${idx}`}
                          className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(item.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-400 text-sm">
                        {item.rating} ({item.reviews} reviews)
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {item.downloads} downloads
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {Math.floor(item.downloads * 1.5)} views
                      </div>
                    </div>

                    {/* Revenue Share Badge */}
                    {item.revenue_share && (
                      <div className="p-2 bg-green-900 bg-opacity-30 border border-green-700 rounded text-green-400 text-xs font-semibold">
                        💰 {item.revenue_share}% revenue share available
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => toggleFavorite(item.id)}
                        variant="outline"
                        size="sm"
                        className={`flex-1 ${
                          favorites.includes(item.id)
                            ? 'bg-red-900 border-red-700'
                            : ''
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favorites.includes(item.id)
                              ? 'fill-red-500 text-red-500'
                              : ''
                          }`}
                        />
                      </Button>
                      <Button
                        onClick={() => toggleCart(item.id)}
                        className={`flex-1 ${
                          cart.includes(item.id)
                            ? 'bg-orange-600 hover:bg-orange-700'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        {item.price > 0 ? `$${item.price.toFixed(2)}` : 'Hire'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 right-0 bg-black bg-opacity-90 border-t border-l border-gray-700 p-4 w-full md:w-80 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-semibold">Shopping Cart</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCart([])}
              className="text-gray-400"
            >
              Clear
            </Button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {cart.map((id, idx) => {
              const item = MARKETPLACE_ITEMS.find((i) => i.id === id);
              return (
                <div
                  key={id}
                  className="flex justify-between items-center p-2 bg-gray-800 rounded"
                >
                  <span className="text-gray-300 text-sm">{item?.title}</span>
                  <span className="text-orange-400 font-semibold">
                    ${item?.price.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between mb-4">
              <span className="text-white font-semibold">Total</span>
              <span className="text-orange-400 font-bold text-lg">
                ${cartTotal.toFixed(2)}
              </span>
            </div>
            <Button className="w-full bg-orange-600 hover:bg-orange-700">
              Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
