import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ExternalLink, ShoppingCart, Star, Library, Sparkles, ChevronRight, Heart, Mail } from 'lucide-react';

interface Book {
  title: string;
  series?: string;
  seriesNumber?: number;
  price: string;
  year: string;
  description: string;
  bnUrl: string;
  category: 'happenings' | 'miracles' | 'standalone';
  coverUrl: string;
}

const books: Book[] = [
  {
    title: 'All About Candy',
    series: 'Happenings',
    seriesNumber: 1,
    price: '$16.95',
    year: '2015',
    description: 'The first book from the HAPPENINGS series — a true autobiography with real occurrences from the past of the author, Seabrun "Candy" Hunter Jr.',
    bnUrl: 'https://www.barnesandnoble.com/w/all-about-candy-seabrun-hunter/1122724263?ean=2940150866133',
    category: 'happenings',
    coverUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/oiSGBGXClDhKLqMj.png',
  },
  {
    title: "A Woman's Instinct",
    series: 'Happenings',
    seriesNumber: 3,
    price: '$16.95',
    year: '2015',
    description: 'One day after all was created, God saw man standing alone. Every animal made had a mate — except man, none of his own.',
    bnUrl: 'https://www.barnesandnoble.com/w/a-womans-instinct-seabrun-hunter/1122752699?ean=2940150781771',
    category: 'happenings',
    coverUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/OQcpLhLqJOcbEswv.png',
  },
  {
    title: 'Just Imagine',
    series: 'Happenings',
    seriesNumber: 5,
    price: '$16.95',
    year: '2015',
    description: 'A creative exploration of imagination and possibility through poetry and storytelling by Seabrun Hunter.',
    bnUrl: 'https://www.barnesandnoble.com/w/just-imagine-seabrun-hunter/1122747168?ean=2940151070393',
    category: 'happenings',
    coverUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/GTKIYwBGGkMgFegL.png',
  },
  {
    title: 'Drawn to Danger',
    series: 'Happenings',
    seriesNumber: 6,
    price: '$16.95',
    year: '2015',
    description: 'During our quests to overcome adversity, we face unknown dangers trying to perfect our dreams — situations that make man drawn to danger.',
    bnUrl: 'https://www.barnesandnoble.com/w/drawn-to-danger-seabrun-hunter/1122788278?ean=2940151071406',
    category: 'happenings',
    coverUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/QAcfPSLVlRGofCQB.png',
  },
  {
    title: 'Sports Affairs',
    series: 'Happenings',
    seriesNumber: 7,
    price: '$16.95',
    year: '2015',
    description: 'A poetic journey through the world of sports, competition, and the human spirit by Seabrun Hunter.',
    bnUrl: 'https://www.barnesandnoble.com/w/sports-affairs-seabrun-hunter/1122826575?ean=2940151072335',
    category: 'happenings',
    coverUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/ZxnUCMbvVGJiwsis.png',
  },
  {
    title: 'Miracles Book 1',
    series: 'Miracles',
    seriesNumber: 1,
    price: '$16.79',
    year: '2013',
    description: 'The first in the Miracles series. Seabrun graduated from Northwestern High School, was drafted into the army, and earned his AKA name "Candy" at a Miss San Antonio beauty pageant.',
    bnUrl: 'https://www.barnesandnoble.com/w/miracles-book-1-seabrun-hunter/1121044649?ean=2940149888696',
    category: 'miracles',
    coverUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/OLDJxeqrjOYyQNsl.png',
  },
  {
    title: 'Miracles Two',
    series: 'Miracles',
    seriesNumber: 2,
    price: '$16.95',
    year: '2015',
    description: 'Continuing the Miracles journey with stories and poems written by inspiration — the sole creation of Seabrun Hunter.',
    bnUrl: 'https://www.barnesandnoble.com/w/miracles-two-seabrun-hunter/1122731045?ean=2940150895706',
    category: 'miracles',
    coverUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/mmPLrffmDpKzlboW.png',
  },
  {
    title: 'Miracles Three',
    series: 'Miracles',
    seriesNumber: 3,
    price: '$16.95',
    year: '2015',
    description: 'The third installment of inspired stories and poems from the Miracles series by Seabrun Hunter.',
    bnUrl: 'https://www.barnesandnoble.com/w/miracles-three-seabrun-hunter/1122740287?ean=2940150953352',
    category: 'miracles',
    coverUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/NVzJDCeQftAHlPem.png',
  },
  {
    title: 'Miracles Four',
    series: 'Miracles',
    seriesNumber: 4,
    price: '$16.95',
    year: '2015',
    description: 'Stories and poems of faith, hope, and everyday miracles — the fourth volume in the beloved series.',
    bnUrl: 'https://www.barnesandnoble.com/w/miracles-four-seabrun-hunter/1122794049?ean=2940151131919',
    category: 'miracles',
    coverUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/tpHwoJyAyUadYoBw.png',
  },
  {
    title: 'Miracles Five',
    series: 'Miracles',
    seriesNumber: 5,
    price: '$16.95',
    year: '2015',
    description: 'The fifth collection of inspired writings in the Miracles series, continuing the legacy of faith and storytelling.',
    bnUrl: 'https://www.barnesandnoble.com/w/miracles-five-seabrun-hunter/1122794652?ean=2940151159333',
    category: 'miracles',
    coverUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/ozIvvyXNgBGFsKjR.png',
  },
  {
    title: 'Miracles Six',
    series: 'Miracles',
    seriesNumber: 6,
    price: '$16.95',
    year: '2015',
    description: 'These stories and poems were written by inspiration and are the sole creation of Seabrun Hunter — volume six of the Miracles series.',
    bnUrl: 'https://www.barnesandnoble.com/w/miracles-six-seabrun-hunter/1122794773?ean=2940151159395',
    category: 'miracles',
    coverUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/hFyCVLtUdvtwpeyw.png',
  },
  {
    title: 'Miracles Seven',
    series: 'Miracles',
    seriesNumber: 7,
    price: '$16.95',
    year: '2015',
    description: 'The seventh and final volume of the Miracles series — a crowning collection of inspired poetry and stories.',
    bnUrl: 'https://www.barnesandnoble.com/w/miracles-seven-seabrun-hunter/1122822696?ean=2940151015158',
    category: 'miracles',
    coverUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/mNSpOmuPraIwPubp.png',
  },
  {
    title: "It's Animal Poetry Time",
    series: undefined,
    price: '$16.95',
    year: '2015',
    description: 'A delightful collection of animal-themed poetry celebrating the creatures of the natural world through verse.',
    bnUrl: 'https://www.barnesandnoble.com/w/its-animal-poetry-time-seabrun-hunter/1122794831?ean=2940151159425',
    category: 'standalone',
    coverUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/ESzRShUPseTPjHur.png',
  },
  {
    title: 'What Children Do',
    series: undefined,
    price: '$16.95',
    year: '2015',
    description: 'A great time in our life when we only worried about getting up, eating, which games we\'d play, and with whom they\'d be shared — until time to eat and sleep!',
    bnUrl: 'https://www.barnesandnoble.com/w/what-children-do-seabrun-hunter/1122740286?ean=2940150953345',
    category: 'standalone',
    coverUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/jAiqXeFcSmfSxRLr.png',
  },
];

type FilterCategory = 'all' | 'happenings' | 'miracles' | 'standalone';

export default function BooksPage() {
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [hoveredBook, setHoveredBook] = useState<number | null>(null);

  const filteredBooks = filter === 'all' ? books : books.filter(b => b.category === filter);

  const happeningsCount = books.filter(b => b.category === 'happenings').length;
  const miraclesCount = books.filter(b => b.category === 'miracles').length;
  const standaloneCount = books.filter(b => b.category === 'standalone').length;

  // Featured book is the first one — All About Candy
  const featuredBook = books[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-slate-900 text-white">
      {/* Hero Section with Featured Book */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/40 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* Left: Featured Book Cover */}
            <div className="shrink-0 relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <a href={featuredBook.bnUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={featuredBook.coverUrl}
                  alt={`${featuredBook.title} by Seabrun Hunter`}
                  className="relative w-48 md:w-56 rounded-xl shadow-2xl transition-transform group-hover:scale-105 object-contain"
                />
              </a>
              <Badge className="absolute -top-2 -right-2 bg-amber-500 text-white shadow-lg">
                Featured
              </Badge>
            </div>

            {/* Right: Title & Info */}
            <div className="flex-1 text-center lg:text-left space-y-5">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <Library className="w-8 h-8 text-amber-400" />
                <span className="text-amber-400/80 uppercase tracking-widest text-sm font-semibold">The Published Works of</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-orange-300 bg-clip-text text-transparent">
                  Seabrun "Candy" Hunter Jr.
                </span>
              </h1>
              <p className="text-lg text-stone-300 leading-relaxed max-w-2xl">
                Founder of Canryn Production Inc. and author of <strong className="text-amber-300">14 published works</strong> spanning
                autobiography, poetry, faith, sports, and children's stories. Two major series —
                <strong className="text-orange-300"> Happenings</strong> and <strong className="text-blue-300">Miracles</strong> —
                alongside standalone works, preserve a literary legacy of creativity and inspiration.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <a
                  href="https://www.barnesandnoble.com/s/%22Seabrun%20Hunter%22"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-amber-600 hover:bg-amber-500 text-white gap-2 text-lg px-8 py-3 shadow-lg shadow-amber-900/50">
                    <ShoppingCart className="w-5 h-5" />
                    Browse All on Barnes & Noble
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-amber-900/30 border-amber-800/40 text-center backdrop-blur-sm">
            <CardContent className="py-5">
              <p className="text-4xl font-bold text-amber-300">15</p>
              <p className="text-sm text-amber-200/70 mt-1">Published Books</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-900/30 border-amber-800/40 text-center backdrop-blur-sm">
            <CardContent className="py-5">
              <p className="text-4xl font-bold text-amber-300">2</p>
              <p className="text-sm text-amber-200/70 mt-1">Book Series</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-900/30 border-amber-800/40 text-center backdrop-blur-sm">
            <CardContent className="py-5">
              <p className="text-4xl font-bold text-amber-300">2013</p>
              <p className="text-sm text-amber-200/70 mt-1">First Published</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-900/30 border-amber-800/40 text-center backdrop-blur-sm">
            <CardContent className="py-5">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <p className="text-lg font-bold text-amber-300">eBook</p>
              </div>
              <p className="text-sm text-amber-200/70 mt-1">Available on NOOK</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {[
            { key: 'all' as FilterCategory, label: `All Books (${books.length})`, color: 'amber' },
            { key: 'happenings' as FilterCategory, label: `Happenings Series (${happeningsCount})`, color: 'orange' },
            { key: 'miracles' as FilterCategory, label: `Miracles Series (${miraclesCount})`, color: 'blue' },
            { key: 'standalone' as FilterCategory, label: `Standalone (${standaloneCount})`, color: 'emerald' },
          ].map(tab => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? 'default' : 'outline'}
              onClick={() => setFilter(tab.key)}
              className={
                filter === tab.key
                  ? `bg-${tab.color}-600 hover:bg-${tab.color}-500 text-white shadow-lg`
                  : `border-${tab.color}-700/50 text-${tab.color}-300 hover:bg-${tab.color}-900/30`
              }
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book, index) => (
            <Card
              key={`book-${index}`}
              className={`group border overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                hoveredBook === index ? 'scale-[1.03]' : ''
              } ${
                book.category === 'happenings'
                  ? 'bg-gradient-to-b from-orange-950/60 to-stone-900/90 border-orange-800/40 hover:border-orange-600/60'
                  : book.category === 'miracles'
                  ? 'bg-gradient-to-b from-blue-950/60 to-stone-900/90 border-blue-800/40 hover:border-blue-600/60'
                  : 'bg-gradient-to-b from-emerald-950/60 to-stone-900/90 border-emerald-800/40 hover:border-emerald-600/60'
              }`}
              onMouseEnter={() => setHoveredBook(index)}
              onMouseLeave={() => setHoveredBook(null)}
            >
              {/* Book Cover Image */}
              <div className="relative overflow-hidden bg-black/20">
                <a href={book.bnUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={book.coverUrl}
                    alt={`${book.title} by Seabrun Hunter`}
                    className="w-full h-64 object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                  />
                </a>
                <div className="absolute top-3 right-3">
                  <Badge className={`shadow-lg ${
                    book.category === 'happenings' ? 'bg-orange-600 text-white' :
                    book.category === 'miracles' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {book.price}
                  </Badge>
                </div>
                {book.series && (
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="outline" className="bg-black/60 backdrop-blur-sm border-white/20 text-white text-xs">
                      {book.series} #{book.seriesNumber}
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight group-hover:text-amber-300 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    by Seabrun Hunter • {book.year} • eBook
                  </p>
                </div>
                <p className="text-sm text-stone-300/80 leading-relaxed line-clamp-3">{book.description}</p>
                <a
                  href={book.bnUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block pt-1"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 border-amber-700/50 text-amber-300 hover:bg-amber-900/40 hover:text-amber-200 hover:border-amber-600 transition-all"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    View on Barnes & Noble
                    <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Special Order — To Her ~ From Him */}
      <div className="container mx-auto px-4 pb-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/80 via-pink-950/60 to-amber-950/80 border border-rose-800/40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-900/20 via-transparent to-transparent" />
          <div className="relative p-8 md:p-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
              <Badge className="bg-rose-700 text-white text-sm px-4 py-1">Special Edition — Not Available in Stores</Badge>
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Book Cover */}
              <div className="shrink-0 relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-2xl blur-xl" />
                <img
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/rUXUAVgMAEaCUOgA.jpeg"
                  alt="To Her ~ From Him: A Collection of 50 Love Poems by Seabrun Candy Hunter"
                  className="relative w-52 md:w-64 rounded-xl shadow-2xl object-contain"
                />
              </div>
              {/* Details */}
              <div className="flex-1 text-center lg:text-left space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-rose-200">To Her ~ From Him</h2>
                <p className="text-lg text-rose-300/80">A Collection of 50 Love Poems</p>
                <p className="text-stone-300 leading-relaxed max-w-xl">
                  A deeply personal spiral-bound collection of 50 love poems written by Seabrun "Candy" Hunter.
                  Cover design by Sharyn Hunter. This special edition is not available in stores — it was produced
                  exclusively by Canryn Production Co.
                </p>
                {/* Dedication */}
                <div className="bg-black/30 rounded-xl p-6 border border-rose-900/40 max-w-xl">
                  <p className="text-sm uppercase tracking-widest text-rose-400/70 mb-3">Dedication</p>
                  <blockquote className="text-stone-300 italic leading-relaxed text-sm space-y-2">
                    <p>"This book is dedicated to all of the women<br/>Who have been in any way involved with my life:<br/>Wives, daughters, girlfriends, sisters.<br/>Mother, you're at the top of the list.<br/>Thanks to everyone for being my inspiration.<br/>I love you all so much!"</p>
                    <p className="text-rose-300 not-italic text-right">— Seabrun "Candy" Hunter, Author</p>
                  </blockquote>
                  <div className="mt-4 pt-3 border-t border-rose-900/40 text-center">
                    <p className="text-rose-300/80 italic text-sm">Especially Dedicated to the Memory of</p>
                    <p className="text-rose-200 font-semibold text-lg mt-1">Valerie E. Caldwell</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-2">
                  <a href="/rrb/contact">
                    <Button className="bg-rose-700 hover:bg-rose-600 text-white gap-2 shadow-lg shadow-rose-900/50">
                      <Mail className="w-4 h-4" />
                      Inquire About Special Order
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-amber-900/40 bg-gradient-to-b from-stone-900/80 to-amber-950/40">
        <div className="container mx-auto px-4 py-14 text-center space-y-5">
          <h2 className="text-3xl font-bold text-amber-200">Support the Legacy</h2>
          <p className="text-stone-400 max-w-xl mx-auto leading-relaxed">
            Every purchase helps preserve the literary legacy of Seabrun "Candy" Hunter Jr. and supports
            the Canryn Production Inc. family of companies. These books are a testament to a life of
            creativity, faith, and perseverance.
          </p>
          <div className="flex items-center justify-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400" />
            ))}
          </div>
          <a
            href="https://www.barnesandnoble.com/s/%22Seabrun%20Hunter%22"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-amber-600 hover:bg-amber-500 text-white gap-2 mt-2 text-lg px-8 py-3 shadow-lg shadow-amber-900/50">
              <ShoppingCart className="w-5 h-5" />
              Shop All 14 Books on Barnes & Noble
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
          <p className="text-xs text-stone-500 mt-6">
            Barnes & Noble book covers are artistic representations. Actual cover art may vary.
            "To Her ~ From Him" is a special edition available exclusively through Canryn Production Co.
          </p>
        </div>
      </div>
    </div>
  );
}
