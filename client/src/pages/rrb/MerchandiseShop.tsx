/**
 * Merchandise Shop - Legacy Merchandise with Stripe Checkout
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Disc3, Shirt, BookOpen, Star, Heart, Package, Tag, ShoppingCart, Plus, Minus, X, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useSearch } from 'wouter';

interface MerchItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number; // cents
  displayPrice: string;
  available: boolean;
  featured?: boolean;
  icon: 'music' | 'apparel' | 'books' | 'collectibles';
}

const merchandise: MerchItem[] = [
  {
    id: 'vinyl-legacy',
    name: 'Legacy Collection Vinyl',
    description: 'Limited edition vinyl pressing of Seabrun Candy Hunter\'s restored recordings. Includes liner notes with the full story of each track\'s creation and the credits that were omitted.',
    category: 'music',
    price: 4999,
    displayPrice: '$49.99',
    available: true,
    featured: true,
    icon: 'music',
  },
  {
    id: 'cd-greatest',
    name: 'Greatest Compositions CD',
    description: 'A curated collection of Seabrun\'s most influential compositions, remastered with proper songwriting credits restored.',
    category: 'music',
    price: 1499,
    displayPrice: '$14.99',
    available: true,
    icon: 'music',
  },
  {
    id: 'tee-legacy',
    name: 'Legacy Restored T-Shirt',
    description: 'Premium cotton tee featuring the RockinRockinBoogie.com logo and "Legacy Restored" on the back. Available in black and white.',
    category: 'apparel',
    price: 2999,
    displayPrice: '$29.99',
    available: true,
    featured: true,
    icon: 'apparel',
  },
  {
    id: 'tee-voice',
    name: '"A Voice for the Voiceless" T-Shirt',
    description: 'The Sweet Miracles motto on a premium cotton tee. Every purchase supports community outreach programs.',
    category: 'apparel',
    price: 2999,
    displayPrice: '$29.99',
    available: true,
    icon: 'apparel',
  },
  {
    id: 'hat-rrb',
    name: 'RRB Radio Snapback',
    description: 'Embroidered snapback cap with the RRB Radio logo. One size fits most.',
    category: 'apparel',
    price: 2499,
    displayPrice: '$24.99',
    available: true,
    icon: 'apparel',
  },
  {
    id: 'hoodie-canryn',
    name: 'Canryn Production Hoodie',
    description: 'Heavyweight hoodie with embroidered Canryn Production logo. Warm, comfortable, and built to last.',
    category: 'apparel',
    price: 5499,
    displayPrice: '$54.99',
    available: true,
    icon: 'apparel',
  },
  {
    id: 'book-story',
    name: 'The Seabrun Candy Hunter Story',
    description: 'The definitive account of Seabrun\'s life, music, and the systematic omission of his credits. Includes family photos and verified documentation.',
    category: 'books',
    price: 2499,
    displayPrice: '$24.99',
    available: true,
    featured: true,
    icon: 'books',
  },
  {
    id: 'book-miracles',
    name: 'Sweet Miracles: A Voice for the Voiceless',
    description: 'The story of how one family\'s mission to honor their father\'s legacy became a movement for community empowerment.',
    category: 'books',
    price: 1999,
    displayPrice: '$19.99',
    available: true,
    icon: 'books',
  },
  {
    id: 'poster-timeline',
    name: 'Legacy Timeline Poster',
    description: 'A beautifully designed 24x36 poster mapping Seabrun Candy Hunter\'s career timeline, key compositions, and historical milestones.',
    category: 'collectibles',
    price: 1999,
    displayPrice: '$19.99',
    available: true,
    icon: 'collectibles',
  },
  {
    id: 'pin-set',
    name: 'Collector Pin Set',
    description: 'Set of 5 enamel pins featuring RRB Radio, Sweet Miracles, HybridCast, QUMUS, and the Canryn Production logos.',
    category: 'collectibles',
    price: 1499,
    displayPrice: '$14.99',
    available: true,
    icon: 'collectibles',
  },
  {
    id: 'mug-drop',
    name: 'Drop Radio Ceramic Mug',
    description: 'Start your morning with the healing frequency of 432 Hz — at least in spirit. Premium ceramic mug with the Drop Radio logo.',
    category: 'collectibles',
    price: 1699,
    displayPrice: '$16.99',
    available: true,
    icon: 'collectibles',
  },
  {
    id: 'tote-legacy',
    name: 'Legacy Tote Bag',
    description: 'Durable canvas tote bag with the RockinRockinBoogie.com design. Perfect for carrying your records, books, or groceries.',
    category: 'collectibles',
    price: 1999,
    displayPrice: '$19.99',
    available: true,
    icon: 'collectibles',
  },
];

interface CartItem {
  item: MerchItem;
  quantity: number;
}

const iconMap = {
  music: Disc3,
  apparel: Shirt,
  books: BookOpen,
  collectibles: Star,
};

export default function MerchandiseShop() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const { user } = useAuth();

  const search = useSearch();

  const createCheckout = trpc.rrbPayments.createMerchCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success('Redirecting to checkout...');
        window.open(data.url, '_blank');
      }
      setCheckingOut(false);
    },
    onError: (error) => {
      toast.error(`Checkout failed: ${error.message}`);
      setCheckingOut(false);
    },
  });

  // Check for success/cancel from Stripe redirect
  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.get('success') === 'true') {
      toast.success('Purchase Successful! Thank you for supporting the legacy.');
      setCart([]);
    }
    if (params.get('canceled') === 'true') {
      toast.info('Checkout Canceled. Your cart items are still saved.');
    }
  }, []);

  const addToCart = (item: MerchItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, quantity: Math.min(c.quantity + 1, 10) } : c);
      }
      return [...prev, { item, quantity: 1 }];
    });
    toast.success(`${item.name} added to your cart.`);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.item.id === itemId) {
        const newQty = Math.max(1, Math.min(10, c.quantity + delta));
        return { ...c, quantity: newQty };
      }
      return c;
    }));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const handleCheckout = () => {
    if (!user) {
      toast.info('Please sign in to complete your purchase.');
      window.location.href = getLoginUrl();
      return;
    }
    if (cart.length === 0) return;
    setCheckingOut(true);
    createCheckout.mutate({
      items: cart.map(c => ({
        id: c.item.id,
        name: c.item.name,
        price: c.item.price,
        quantity: c.quantity,
      })),
    });
  };

  const filtered = activeCategory === 'all'
    ? merchandise
    : merchandise.filter(item => item.category === activeCategory);

  const featuredItems = merchandise.filter(item => item.featured);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-amber-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <ShoppingBag className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Merchandise Shop</h1>
          <p className="text-xl text-foreground/70 mb-2">Support the Legacy</p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Every purchase supports the preservation of Seabrun Candy Hunter's legacy and funds 
            Sweet Miracles community outreach programs.
          </p>
        </div>
      </section>

      {/* Cart Button (floating) */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setShowCart(!showCart)}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-full h-14 w-14 shadow-lg relative"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          </Button>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-w-md bg-background border-l border-border shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" /> Your Cart ({cartCount})
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCart(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {cart.length === 0 ? (
                <p className="text-foreground/60 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(({ item, quantity }) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                        <div className="w-12 h-12 rounded bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                          {(() => { const Icon = iconMap[item.icon]; return <Icon className="w-6 h-6 text-amber-500" />; })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground text-sm truncate">{item.name}</h3>
                          <p className="text-amber-500 font-bold text-sm">{item.displayPrice}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => updateQuantity(item.id, -1)}>
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium w-6 text-center">{quantity}</span>
                            <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => updateQuantity(item.id, 1)}>
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto text-red-500" onClick={() => removeFromCart(item.id)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-foreground">Total</span>
                      <span className="text-lg font-bold text-amber-500">${(cartTotal / 100).toFixed(2)}</span>
                    </div>
                    <Button
                      onClick={handleCheckout}
                      disabled={checkingOut}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      {checkingOut ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                      ) : (
                        <><ShoppingCart className="w-4 h-4 mr-2" /> Checkout — ${(cartTotal / 100).toFixed(2)}</>
                      )}
                    </Button>
                    {!user && (
                      <p className="text-xs text-foreground/50 text-center mt-2">
                        You'll need to sign in to complete your purchase
                      </p>
                    )}
                    <p className="text-xs text-foreground/40 text-center mt-2">
                      Test card: 4242 4242 4242 4242
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Featured Items */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500" /> Featured Items
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredItems.map(item => {
              const Icon = iconMap[item.icon];
              const inCart = cart.find(c => c.item.id === item.id);
              return (
                <Card key={item.id} className="border-amber-500/20 hover:border-amber-500/40 transition-colors">
                  <CardHeader>
                    <div className="w-full h-40 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg flex items-center justify-center mb-3">
                      <Icon className="w-16 h-16 text-amber-500/40" />
                    </div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/70 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-amber-500">{item.displayPrice}</span>
                      <Button
                        size="sm"
                        onClick={() => addToCart(item)}
                        className={inCart ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'}
                      >
                        {inCart ? (
                          <><CheckCircle className="w-4 h-4 mr-1" /> In Cart ({inCart.quantity})</>
                        ) : (
                          <><Plus className="w-4 h-4 mr-1" /> Add to Cart</>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">Full Catalog</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'all', label: 'All Items', icon: Tag },
              { id: 'music', label: 'Music', icon: Disc3 },
              { id: 'apparel', label: 'Apparel', icon: Shirt },
              { id: 'books', label: 'Books', icon: BookOpen },
              { id: 'collectibles', label: 'Collectibles', icon: Star },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-white'
                    : 'bg-card hover:bg-card/80 text-foreground/70 border border-border'
                }`}
              >
                <cat.icon className="w-4 h-4" /> {cat.label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(item => {
              const Icon = iconMap[item.icon];
              const inCart = cart.find(c => c.item.id === item.id);
              return (
                <Card key={item.id} className="hover:border-amber-500/20 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-amber-500/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
                        <p className="text-sm text-foreground/60 mb-3 line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">{item.displayPrice}</span>
                          <Button
                            size="sm"
                            variant={inCart ? 'default' : 'outline'}
                            onClick={() => addToCart(item)}
                            className={inCart ? 'bg-green-600 hover:bg-green-700 text-white h-8' : 'h-8'}
                          >
                            {inCart ? (
                              <><CheckCircle className="w-3 h-3 mr-1" /> {inCart.quantity}</>
                            ) : (
                              <><Plus className="w-3 h-3 mr-1" /> Add</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Support Message */}
      <section className="py-12 px-4 bg-amber-500/5 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <Heart className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Every Purchase Makes a Difference</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Proceeds from merchandise sales support the ongoing preservation of Seabrun Candy Hunter's 
            legacy and fund Sweet Miracles community programs including emergency communication, 
            creative arts education, and crisis support services.
          </p>
        </div>
      </section>

      {/* Footer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/50">
            Merchandise catalog is subject to change. Prices shown are in USD. 
            Canryn Production Inc. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
