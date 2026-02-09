/**
 * Merchandise Shop - Legacy Merchandise Catalog
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, Disc3, Shirt, BookOpen, Star, Heart, Package, Tag } from 'lucide-react';
import { Link } from 'wouter';

interface MerchItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  available: boolean;
  featured?: boolean;
}

const merchandise: MerchItem[] = [
  {
    id: 'vinyl-legacy',
    name: 'Legacy Collection Vinyl',
    description: 'Limited edition vinyl pressing of Seabrun Candy Hunter\'s restored recordings. Includes liner notes with the full story of each track\'s creation and the credits that were omitted.',
    category: 'music',
    price: '$49.99',
    available: false,
    featured: true,
  },
  {
    id: 'cd-greatest',
    name: 'Greatest Compositions CD',
    description: 'A curated collection of Seabrun\'s most influential compositions, remastered with proper songwriting credits restored.',
    category: 'music',
    price: '$14.99',
    available: false,
  },
  {
    id: 'tee-legacy',
    name: 'Legacy Restored T-Shirt',
    description: 'Premium cotton tee featuring the RockinRockinBoogie.com logo and "Legacy Restored" on the back. Available in black and white.',
    category: 'apparel',
    price: '$29.99',
    available: false,
    featured: true,
  },
  {
    id: 'tee-voice',
    name: '"A Voice for the Voiceless" T-Shirt',
    description: 'The Sweet Miracles motto on a premium cotton tee. Every purchase supports community outreach programs.',
    category: 'apparel',
    price: '$29.99',
    available: false,
  },
  {
    id: 'hat-rrb',
    name: 'RRB Radio Snapback',
    description: 'Embroidered snapback cap with the RRB Radio logo. One size fits most.',
    category: 'apparel',
    price: '$24.99',
    available: false,
  },
  {
    id: 'hoodie-canryn',
    name: 'Canryn Production Hoodie',
    description: 'Heavyweight hoodie with embroidered Canryn Production logo. Warm, comfortable, and built to last.',
    category: 'apparel',
    price: '$54.99',
    available: false,
  },
  {
    id: 'book-story',
    name: 'The Seabrun Candy Hunter Story',
    description: 'The definitive account of Seabrun\'s life, music, and the systematic omission of his credits. Includes family photos and verified documentation.',
    category: 'books',
    price: '$24.99',
    available: false,
    featured: true,
  },
  {
    id: 'book-miracles',
    name: 'Sweet Miracles: A Voice for the Voiceless',
    description: 'The story of how one family\'s mission to honor their father\'s legacy became a movement for community empowerment.',
    category: 'books',
    price: '$19.99',
    available: false,
  },
  {
    id: 'poster-timeline',
    name: 'Legacy Timeline Poster',
    description: 'A beautifully designed 24x36 poster mapping Seabrun Candy Hunter\'s career timeline, key compositions, and historical milestones.',
    category: 'collectibles',
    price: '$19.99',
    available: false,
  },
  {
    id: 'pin-set',
    name: 'Collector Pin Set',
    description: 'Set of 5 enamel pins featuring RRB Radio, Sweet Miracles, HybridCast, QUMUS, and the Canryn Production logos.',
    category: 'collectibles',
    price: '$14.99',
    available: false,
  },
  {
    id: 'mug-drop',
    name: 'Drop Radio Ceramic Mug',
    description: 'Start your morning with the healing frequency of 432 Hz — at least in spirit. Premium ceramic mug with the Drop Radio logo.',
    category: 'collectibles',
    price: '$16.99',
    available: false,
  },
  {
    id: 'tote-legacy',
    name: 'Legacy Tote Bag',
    description: 'Durable canvas tote bag with the RockinRockinBoogie.com design. Perfect for carrying your records, books, or groceries.',
    category: 'collectibles',
    price: '$19.99',
    available: false,
  },
];

export default function MerchandiseShop() {
  const [activeCategory, setActiveCategory] = useState('all');

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

      {/* Coming Soon Banner */}
      <section className="py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-center">
            <Package className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-foreground mb-2">Shop Opening Soon</h2>
            <p className="text-foreground/70">
              Our merchandise shop is currently being prepared. Browse the catalog below to see what 
              will be available. All items will be available for purchase when the shop officially launches.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500" /> Featured Items
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredItems.map(item => (
              <Card key={item.id} className="border-amber-500/20 hover:border-amber-500/40 transition-colors">
                <CardHeader>
                  <div className="w-full h-40 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg flex items-center justify-center mb-3">
                    {item.category === 'music' && <Disc3 className="w-16 h-16 text-amber-500/40" />}
                    {item.category === 'apparel' && <Shirt className="w-16 h-16 text-amber-500/40" />}
                    {item.category === 'books' && <BookOpen className="w-16 h-16 text-amber-500/40" />}
                  </div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/70 mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-amber-500">{item.price}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 font-medium">
                      Coming Soon
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
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
            {filtered.map(item => (
              <Card key={item.id} className="hover:border-amber-500/20 transition-colors">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
                  <p className="text-sm text-foreground/60 mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{item.price}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-foreground/50">
                      Coming Soon
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
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
            Merchandise catalog is subject to change. Prices shown are estimated retail prices. 
            Canryn Production Inc. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
