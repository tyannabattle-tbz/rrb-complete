import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, ExternalLink, CheckCircle2, Clock } from 'lucide-react';

interface ProofDocument {
  id: string;
  title: string;
  category: 'discogs' | 'usco' | 'bmi_mlc' | 'soundexchange';
  date: string;
  verified: boolean;
  url?: string;
  description: string;
}

const MOCK_DOCUMENTS: ProofDocument[] = [
  {
    id: '1',
    title: 'Rockin\' Rockin\' Boogie - Discogs Entry',
    category: 'discogs',
    date: '2024-01-15',
    verified: true,
    url: 'https://www.discogs.com/release/123456',
    description: 'Official Discogs database entry with complete release information',
  },
  {
    id: '2',
    title: 'Copyright Registration - USCO',
    category: 'usco',
    date: '2024-01-20',
    verified: true,
    description: 'U.S. Copyright Office registration certificate',
  },
  {
    id: '3',
    title: 'BMI/MLC Licensing Agreement',
    category: 'bmi_mlc',
    date: '2024-02-01',
    verified: true,
    description: 'Broadcast Music Inc. and Mechanical Licensing Collective documentation',
  },
  {
    id: '4',
    title: 'SoundExchange Royalty Report',
    category: 'soundexchange',
    date: '2024-02-10',
    verified: false,
    description: 'Digital performance royalty documentation',
  },
];

const CATEGORY_INFO = {
  discogs: {
    label: 'Discogs',
    color: 'bg-blue-500',
    description: 'Music database and marketplace records',
  },
  usco: {
    label: 'USCO',
    color: 'bg-purple-500',
    description: 'U.S. Copyright Office registrations',
  },
  bmi_mlc: {
    label: 'BMI/MLC',
    color: 'bg-green-500',
    description: 'Licensing and mechanical rights',
  },
  soundexchange: {
    label: 'SoundExchange',
    color: 'bg-orange-500',
    description: 'Digital performance royalties',
  },
};

export function ProofVaultSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filteredDocuments = useMemo(() => {
    return MOCK_DOCUMENTS.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || doc.category === selectedCategory;
      const matchesVerified = !verifiedOnly || doc.verified;

      return matchesSearch && matchesCategory && matchesVerified;
    });
  }, [searchQuery, selectedCategory, verifiedOnly]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Proof Vault</h1>
          <p className="text-xl text-slate-300">
            Searchable archive of verified documentation and licensing information
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-slate-800 p-6 mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>

            {/* Category Filters */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Filter by Category
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setSelectedCategory(null)}
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  className={selectedCategory === null ? 'bg-amber-500 text-black' : ''}
                >
                  All Categories
                </Button>
                {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                  <Button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    variant={selectedCategory === key ? 'default' : 'outline'}
                    className={selectedCategory === key ? `${info.color} text-white` : ''}
                  >
                    {info.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Verification Filter */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="verified-only"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="verified-only" className="text-sm text-slate-300">
                Show verified documents only
              </label>
            </div>
          </div>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-400">
            Found <span className="font-semibold text-white">{filteredDocuments.length}</span> document
            {filteredDocuments.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Documents Grid */}
        <div className="grid gap-6">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc) => {
              const categoryInfo = CATEGORY_INFO[doc.category as keyof typeof CATEGORY_INFO];
              return (
                <Card key={doc.id} className="bg-slate-800 p-6 hover:bg-slate-700 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{doc.title}</h3>
                        {doc.verified && (
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        )}
                        {!doc.verified && (
                          <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-slate-400 mb-3">{doc.description}</p>

                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={`${categoryInfo.color} text-white`}>
                          {categoryInfo.label}
                        </Badge>
                        <span className="text-sm text-slate-500">
                          {new Date(doc.date).toLocaleDateString()}
                        </span>
                        {doc.verified && (
                          <Badge variant="outline" className="border-green-500 text-green-400">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      {doc.url && (
                        <Button
                          onClick={() => window.open(doc.url, '_blank')}
                          size="sm"
                          className="bg-amber-500 hover:bg-amber-600 text-black"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="border-slate-600">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="bg-slate-800 p-12 text-center">
              <p className="text-slate-400 text-lg">No documents found matching your criteria</p>
            </Card>
          )}
        </div>

        {/* Info Section */}
        <Card className="bg-slate-800 p-8 mt-12">
          <h3 className="text-2xl font-bold text-white mb-4">About Our Proof Vault</h3>
          <div className="grid md:grid-cols-2 gap-8 text-slate-300">
            <div>
              <h4 className="font-semibold text-white mb-2">Comprehensive Documentation</h4>
              <p>
                Our vault contains verified records from major music databases and licensing organizations,
                ensuring authenticity and legal compliance.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Verification Process</h4>
              <p>
                All documents are verified by our team and cross-referenced with official sources to
                maintain the highest standards of accuracy.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
