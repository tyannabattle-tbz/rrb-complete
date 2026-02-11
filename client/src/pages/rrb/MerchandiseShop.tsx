/**
 * Legacy Merchandise Catalog
 * Contact Canryn Production for pricing, availability, and orders.
 * All donations go through Sweet Miracles Foundation 501(c)(3) / 508(c).
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Disc3, Shirt, BookOpen, Star, Heart, Tag, Mail, Phone, MessageSquare, Music } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'wouter';

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

const iconMap = {
  music: Disc3,
  apparel: Shirt,
  books: BookOpen,
  collectibles: Star,
};

export default function MerchandiseShop() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = activeCategory === 'all'
    ? merchandise
    : merchandise.filter(item => item.category === activeCategory);

  const featuredItems = merchandise.filter(item => item.featured);

  const handleInquiry = (itemName: string) => {
    toast.success(`Interest noted for "${itemName}". Contact Canryn Production for pricing and availability.`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-amber-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <ShoppingBag className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Legacy Merchandise</h1>
          <p className="text-xl text-foreground/70 mb-2">Support the Legacy</p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Browse our catalog of legacy merchandise. For pricing, availability, and orders,
            please contact Canryn Production directly.
          </p>
        </div>
      </section>

      {/* Contact for Pricing Banner */}
      <section className="px-4 -mt-6 mb-6">
        <div className="max-w-5xl mx-auto">
          <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/20">
                  <Mail className="w-8 h-8 text-amber-400" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-bold text-foreground mb-1">Contact Canryn Production for Pricing</h3>
                  <p className="text-sm text-foreground/70">
                    All merchandise orders are handled directly by Canryn Production. 
                    Contact us for pricing packages, bulk orders, custom merchandise, and availability.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/rrb/contact">
                    <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                      <MessageSquare className="w-4 h-4 mr-2" /> Contact Us
                    </Button>
                  </Link>
                  <Link href="/donate">
                    <Button variant="outline" className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10">
                      <Heart className="w-4 h-4 mr-2" /> Donate Instead
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>



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
                        onClick={() => handleInquiry(item.name)}
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        <Mail className="w-4 h-4 mr-1" /> Inquire
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
                            variant="outline"
                            onClick={() => handleInquiry(item.name)}
                            className="h-8"
                          >
                            <Mail className="w-3 h-3 mr-1" /> Inquire
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

      {/* Support Message & Donation CTA */}
      <section className="py-12 px-4 bg-amber-500/5 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <Heart className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Support Legacy Recovery Efforts</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto mb-6">
            While merchandise is available through direct contact with Canryn Production,
            you can make an immediate impact by donating to Sweet Miracles Foundation.
            All donations support the preservation of Seabrun Candy Hunter's legacy and fund
            community programs including emergency communication, creative arts education, and crisis support.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/donate">
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                <Heart className="w-4 h-4 mr-2" /> Donate to Legacy Recovery
              </Button>
            </Link>
            <Link href="/rrb/contact">
              <Button variant="outline" className="border-amber-500/50 text-amber-500">
                <Phone className="w-4 h-4 mr-2" /> Contact Canryn Production
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/50">
            Merchandise catalog is subject to change. For pricing, availability, and custom orders,
            contact Canryn Production directly. Sweet Miracles Foundation is a registered 501(c)(3) / 508(c) nonprofit.
          </p>
        </div>
      </section>
    </div>
  );
}
