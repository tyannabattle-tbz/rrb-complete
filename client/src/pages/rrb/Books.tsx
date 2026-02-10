import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ExternalLink, ShoppingCart, Star, Library, Sparkles } from 'lucide-react';

interface Book {
  title: string;
  series?: string;
  seriesNumber?: number;
  price: string;
  year: string;
  description: string;
  bnUrl: string;
  category: 'happenings' | 'miracles' | 'standalone';
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
  },
  {
    title: "It's Animal Poetry Time",
    series: undefined,
    price: '$16.95',
    year: '2015',
    description: 'A delightful collection of animal-themed poetry celebrating the creatures of the natural world through verse.',
    bnUrl: 'https://www.barnesandnoble.com/w/its-animal-poetry-time-seabrun-hunter/1122794831?ean=2940151159425',
    category: 'standalone',
  },
  {
    title: 'What Children Do',
    series: undefined,
    price: '$16.95',
    year: '2015',
    description: 'A great time in our life when we only worried about getting up, eating, which games we\'d play, and with whom they\'d be shared — until time to eat and sleep!',
    bnUrl: 'https://www.barnesandnoble.com/w/what-children-do-seabrun-hunter/1122740286?ean=2940150953345',
    category: 'standalone',
  },
];

type FilterCategory = 'all' | 'happenings' | 'miracles' | 'standalone';

export default function BooksPage() {
  const [filter, setFilter] = useState<FilterCategory>('all');

  const filteredBooks = filter === 'all' ? books : books.filter(b => b.category === filter);

  const happeningsCount = books.filter(b => b.category === 'happenings').length;
  const miraclesCount = books.filter(b => b.category === 'miracles').length;
  const standaloneCount = books.filter(b => b.category === 'standalone').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/30 to-transparent" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Library className="w-10 h-10 text-amber-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                The Library of Seabrun Hunter
              </h1>
            </div>
            <p className="text-xl text-amber-200/80">
              14 Published Works Available on Barnes & Noble
            </p>
            <p className="text-stone-300 leading-relaxed">
              Seabrun "Candy" Hunter Jr. — founder of Canryn Production Inc. — authored 14 books spanning
              autobiography, poetry, faith, sports, and children's stories. His two major series,
              <strong className="text-amber-300"> Happenings</strong> and <strong className="text-amber-300">Miracles</strong>,
              alongside standalone works, preserve a legacy of creativity and inspiration.
            </p>
            <a
              href="https://www.barnesandnoble.com/s/%22Seabrun%20Hunter%22"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-amber-600 hover:bg-amber-500 text-white gap-2 mt-4 text-lg px-8 py-3">
                <ShoppingCart className="w-5 h-5" />
                Browse All on Barnes & Noble
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="container mx-auto px-4 -mt-4 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-amber-900/40 border-amber-700/50 text-center">
            <CardContent className="py-4">
              <p className="text-3xl font-bold text-amber-300">14</p>
              <p className="text-sm text-amber-200/70">Published Books</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-900/40 border-amber-700/50 text-center">
            <CardContent className="py-4">
              <p className="text-3xl font-bold text-amber-300">2</p>
              <p className="text-sm text-amber-200/70">Book Series</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-900/40 border-amber-700/50 text-center">
            <CardContent className="py-4">
              <p className="text-3xl font-bold text-amber-300">2013</p>
              <p className="text-sm text-amber-200/70">First Published</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-900/40 border-amber-700/50 text-center">
            <CardContent className="py-4">
              <div className="flex items-center justify-center gap-1">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <p className="text-lg font-bold text-amber-300">eBook</p>
              </div>
              <p className="text-sm text-amber-200/70">Available on NOOK</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-amber-600 hover:bg-amber-500' : 'border-amber-700 text-amber-300 hover:bg-amber-900/50'}
          >
            All Books ({books.length})
          </Button>
          <Button
            variant={filter === 'happenings' ? 'default' : 'outline'}
            onClick={() => setFilter('happenings')}
            className={filter === 'happenings' ? 'bg-orange-600 hover:bg-orange-500' : 'border-orange-700 text-orange-300 hover:bg-orange-900/50'}
          >
            Happenings Series ({happeningsCount})
          </Button>
          <Button
            variant={filter === 'miracles' ? 'default' : 'outline'}
            onClick={() => setFilter('miracles')}
            className={filter === 'miracles' ? 'bg-blue-600 hover:bg-blue-500' : 'border-blue-700 text-blue-300 hover:bg-blue-900/50'}
          >
            Miracles Series ({miraclesCount})
          </Button>
          <Button
            variant={filter === 'standalone' ? 'default' : 'outline'}
            onClick={() => setFilter('standalone')}
            className={filter === 'standalone' ? 'bg-emerald-600 hover:bg-emerald-500' : 'border-emerald-700 text-emerald-300 hover:bg-emerald-900/50'}
          >
            Standalone ({standaloneCount})
          </Button>
        </div>
      </div>

      {/* Books Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book, index) => (
            <Card
              key={index}
              className={`border transition-all hover:scale-[1.02] hover:shadow-xl ${
                book.category === 'happenings'
                  ? 'bg-gradient-to-br from-orange-950/80 to-stone-900 border-orange-800/50'
                  : book.category === 'miracles'
                  ? 'bg-gradient-to-br from-blue-950/80 to-stone-900 border-blue-800/50'
                  : 'bg-gradient-to-br from-emerald-950/80 to-stone-900 border-emerald-800/50'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className={`w-5 h-5 shrink-0 ${
                      book.category === 'happenings' ? 'text-orange-400' :
                      book.category === 'miracles' ? 'text-blue-400' : 'text-emerald-400'
                    }`} />
                    <CardTitle className="text-lg text-white leading-tight">{book.title}</CardTitle>
                  </div>
                  <Badge className={`shrink-0 ${
                    book.category === 'happenings' ? 'bg-orange-800 text-orange-200' :
                    book.category === 'miracles' ? 'bg-blue-800 text-blue-200' : 'bg-emerald-800 text-emerald-200'
                  }`}>
                    {book.price}
                  </Badge>
                </div>
                {book.series && (
                  <p className="text-sm text-stone-400 mt-1">
                    {book.series} Series {book.seriesNumber ? `• #${book.seriesNumber}` : ''}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-stone-300 leading-relaxed">{book.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <span>by Seabrun Hunter</span>
                    <span>•</span>
                    <span>{book.year}</span>
                    <span>•</span>
                    <span>eBook</span>
                  </div>
                </div>
                <a
                  href={book.bnUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-amber-700 text-amber-300 hover:bg-amber-900/50 hover:text-amber-200"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    View on Barnes & Noble
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-amber-900/50 bg-stone-900/50">
        <div className="container mx-auto px-4 py-12 text-center space-y-4">
          <h2 className="text-2xl font-bold text-amber-300">Support the Legacy</h2>
          <p className="text-stone-400 max-w-xl mx-auto">
            Every purchase helps preserve the literary legacy of Seabrun "Candy" Hunter Jr. and supports
            the Canryn Production Inc. family of companies.
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
            <Button className="bg-amber-600 hover:bg-amber-500 text-white gap-2 mt-2">
              <ShoppingCart className="w-4 h-4" />
              Shop All 14 Books on Barnes & Noble
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
