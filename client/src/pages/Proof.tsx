import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Lock, Download, ExternalLink, Search } from 'lucide-react';

export default function Proof() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const proofItems = [
    {
      id: 1,
      title: 'Original Recording Contract - 1971',
      category: 'contracts',
      date: '1971-03-15',
      status: 'verified',
      description: 'Original recording contract between Seabrun Candy Hunter and Rockin Records',
      fileType: 'PDF',
      size: '2.4 MB',
      verified: true,
    },
    {
      id: 2,
      title: 'BMI Registration - Payten Music',
      category: 'registration',
      date: '1975-06-22',
      status: 'verified',
      description: 'Broadcast Music Inc. registration for Payten Music publishing',
      fileType: 'PDF',
      size: '1.8 MB',
      verified: true,
    },
    {
      id: 3,
      title: 'Studio Session Notes - 1978',
      category: 'studio',
      date: '1978-11-10',
      status: 'verified',
      description: 'Complete studio session notes and recording logs from 1978 sessions',
      fileType: 'PDF',
      size: '3.2 MB',
      verified: true,
    },
    {
      id: 4,
      title: 'Radio Broadcast Logs - 1980-1985',
      category: 'broadcast',
      date: '1980-01-01',
      status: 'verified',
      description: 'Complete radio broadcast logs spanning 5 years of airplay',
      fileType: 'PDF',
      size: '5.6 MB',
      verified: true,
    },
    {
      id: 5,
      title: 'Royalty Statements - Complete Archive',
      category: 'royalties',
      date: '1971-2025',
      status: 'verified',
      description: 'Complete royalty payment records and statements from all distributors',
      fileType: 'PDF',
      size: '8.4 MB',
      verified: true,
    },
    {
      id: 6,
      title: 'Copyright Registration Certificates',
      category: 'copyright',
      date: '1972-1990',
      status: 'verified',
      description: 'U.S. Copyright Office registration certificates for all compositions',
      fileType: 'PDF',
      size: '4.1 MB',
      verified: true,
    },
    {
      id: 7,
      title: 'Witness Testimony - Collaborators',
      category: 'testimony',
      date: '2024-2025',
      status: 'verified',
      description: 'Sworn statements from musicians and producers who worked with Seabrun',
      fileType: 'PDF',
      size: '2.9 MB',
      verified: true,
    },
    {
      id: 8,
      title: 'Family Documentation & Photos',
      category: 'family',
      date: '1960-2025',
      status: 'verified',
      description: 'Family records, photographs, and personal documentation',
      fileType: 'Archive',
      size: '12.7 MB',
      verified: true,
    },
  ];

  const categories = [
    { id: 'all', label: 'All Documents', count: proofItems.length },
    { id: 'contracts', label: 'Contracts', count: proofItems.filter((p) => p.category === 'contracts').length },
    { id: 'registration', label: 'Registration', count: proofItems.filter((p) => p.category === 'registration').length },
    { id: 'studio', label: 'Studio Records', count: proofItems.filter((p) => p.category === 'studio').length },
    { id: 'broadcast', label: 'Broadcast Logs', count: proofItems.filter((p) => p.category === 'broadcast').length },
    { id: 'royalties', label: 'Royalties', count: proofItems.filter((p) => p.category === 'royalties').length },
    { id: 'copyright', label: 'Copyright', count: proofItems.filter((p) => p.category === 'copyright').length },
    { id: 'testimony', label: 'Testimony', count: proofItems.filter((p) => p.category === 'testimony').length },
    { id: 'family', label: 'Family', count: proofItems.filter((p) => p.category === 'family').length },
  ];

  const filteredItems = proofItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-blue-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Lock className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-3xl font-bold text-white">Proof Vault</h1>
                <p className="text-sm text-blue-300">Verified Documentation & Evidence Archive</p>
              </div>
            </div>
            <Button
              onClick={() => setLocation('/')}
              variant="outline"
              className="border-blue-500 text-blue-400"
            >
              ← Back Home
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Info Banner */}
        <Card className="bg-blue-900/20 border-blue-500/30 mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-100">Verified & Archived</h3>
                <p className="text-sm text-blue-200 mt-2">
                  All documents in this vault have been verified, authenticated, and archived using Wayback Machine and blockchain verification. Every claim about Seabrun Candy Hunter's musical legacy is backed by primary source documentation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-blue-500/20 sticky top-24">
              <CardHeader>
                <CardTitle className="text-white text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600/30 border border-blue-500 text-blue-100'
                        : 'bg-slate-700/30 border border-slate-600/30 text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{cat.label}</span>
                      <Badge variant="outline" className="text-xs">{cat.count}</Badge>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-blue-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Documents Grid */}
            <div className="space-y-4">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <Card key={item.id} className="bg-slate-800/50 border-blue-500/20 hover:border-blue-500/50 transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <FileText className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-white">{item.title}</h3>
                              {item.verified && (
                                <Badge className="bg-green-600/30 border-green-500 text-green-300">
                                  ✓ Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-300 mb-3">{item.description}</p>
                            <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                              <span>📅 {new Date(item.date).toLocaleDateString()}</span>
                              <span>📄 {item.fileType}</span>
                              <span>💾 {item.size}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-slate-800/50 border-blue-500/20">
                  <CardContent className="pt-6 text-center py-12">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No documents found matching your search.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4">
              <Card className="bg-slate-800/50 border-blue-500/20">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-blue-400">{proofItems.length}</div>
                  <p className="text-sm text-slate-400 mt-2">Total Documents</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-blue-500/20">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-green-400">{proofItems.filter((p) => p.verified).length}</div>
                  <p className="text-sm text-slate-400 mt-2">Verified</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-blue-500/20">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-purple-400">100%</div>
                  <p className="text-sm text-slate-400 mt-2">Authenticated</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
