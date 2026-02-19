import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Share2, Star, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  stock: number;
  featured: boolean;
}

const MERCHANDISE: Product[] = [
  {
    id: '1',
    name: 'Healing Frequencies CD Collection',
    description: 'Complete set of 10 Solfeggio healing frequency CDs',
    price: 49.99,
    image: '🎵',
    category: 'Audio',
    rating: 4.8,
    reviews: 124,
    stock: 45,
    featured: true,
  },
  {
    id: '2',
    name: 'RRB Branded T-Shirt',
    description: 'Premium cotton t-shirt with Rockin\' Rockin\' Boogie logo',
    price: 24.99,
    image: '👕',
    category: 'Apparel',
    rating: 4.6,
    reviews: 89,
    stock: 120,
    featured: true,
  },
  {
    id: '3',
    name: 'Seabrun Candy Hunter Biography',
    description: 'Comprehensive biography and legacy documentation',
    price: 34.99,
    image: '📚',
    category: 'Books',
    rating: 4.9,
    reviews: 156,
    stock: 78,
    featured: true,
  },
  {
    id: '4',
    name: 'Frequency Tuner Hoodie',
    description: 'Cozy hoodie with frequency wave design',
    price: 54.99,
    image: '🧥',
    category: 'Apparel',
    rating: 4.5,
    reviews: 67,
    stock: 85,
    featured: false,
  },
  {
    id: '5',
    name: 'Vinyl Record - RRB Greatest Hits',
    description: 'Limited edition vinyl with classic recordings',
    price: 29.99,
    image: '💿',
    category: 'Audio',
    rating: 4.7,
    reviews: 112,
    stock: 30,
    featured: false,
  },
  {
    id: '6',
    name: 'Meditation Cushion',
    description: 'Premium cushion for frequency meditation sessions',
    price: 44.99,
    image: '🧘',
    category: 'Wellness',
    rating: 4.4,
    reviews: 54,
    stock: 60,
    featured: false,
  },
  {
    id: '7',
    name: 'Podcast Starter Bundle',
    description: 'Everything you need to start your own podcast',
    price: 199.99,
    image: '🎙️',
    category: 'Equipment',
    rating: 4.8,
    reviews: 203,
    stock: 25,
    featured: true,
  },
  {
    id: '8',
    name: 'Limited Edition Poster',
    description: 'Signed poster featuring Seabrun Candy Hunter',
    price: 19.99,
    image: '🖼️',
    category: 'Art',
    rating: 4.6,
    reviews: 78,
    stock: 40,
    featured: false,
  },
];

export default function MerchandiseStore() {
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [showCart, setShowCart] = useState(false);

  const categories = ['All', ...new Set(MERCHANDISE.map(p => p.category))];

  const filteredProducts = MERCHANDISE.filter(p =>
    selectedCategory === 'All' || p.category === selectedCategory
  ).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ShoppingCart className="w-8 h-8 text-purple-500" />
              <h1 className="text-4xl font-bold">RRB Merchandise Store</h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Exclusive merchandise and products from Rockin\' Rockin\' Boogie
            </p>
          </div>
          <Button
            onClick={() => setShowCart(!showCart)}
            className="gap-2 relative"
          >
            <ShoppingCart className="w-5 h-5" />
            Cart ({cartCount})
            {cartCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-600">
                {cartCount}
              </Badge>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-4">
              <h3 className="font-bold mb-4">Filter & Sort</h3>

              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        selectedCategory === category
                          ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/50'
                          : 'hover:bg-accent'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-purple-500"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {showCart ? (
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>
                {cart.length === 0 ? (
                  <p className="text-center text-foreground/60 py-12">Your cart is empty</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold">{item.product.name}</p>
                          <p className="text-sm text-foreground/60">
                            ${item.product.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="font-bold">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <Button
                          onClick={() => removeFromCart(item.product.id)}
                          variant="destructive"
                          size="sm"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}

                    <div className="border-t border-border pt-4 mt-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold">Total:</span>
                        <span className="text-2xl font-bold text-purple-600">
                          ${cartTotal.toFixed(2)}
                        </span>
                      </div>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Proceed to Checkout
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProducts.map(product => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-5xl">{product.image}</div>
                        {product.featured && (
                          <Badge className="bg-purple-600">Featured</Badge>
                        )}
                      </div>

                      <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                      <p className="text-sm text-foreground/60 mb-4">{product.description}</p>

                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-foreground/60">
                          {product.rating} ({product.reviews} reviews)
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-2xl font-bold text-purple-600">
                            ${product.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-foreground/60">
                            {product.stock} in stock
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                          className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </Button>
                        <Button
                          onClick={() => toggleWishlist(product.id)}
                          variant="outline"
                          size="icon"
                          className={wishlist.includes(product.id) ? 'text-red-500' : ''}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              wishlist.includes(product.id) ? 'fill-current' : ''
                            }`}
                          />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Promotions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <TrendingUp className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-bold mb-2">Limited Time Offer</h3>
            <p className="text-sm text-foreground/70">Get 20% off your first order with code RRB20</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <ShoppingCart className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-bold mb-2">Free Shipping</h3>
            <p className="text-sm text-foreground/70">Free shipping on orders over $50</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <Heart className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-bold mb-2">Loyalty Rewards</h3>
            <p className="text-sm text-foreground/70">Earn points on every purchase</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
