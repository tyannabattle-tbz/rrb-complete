/**
 * Proof Vault - Verified Documentation & Evidence Archive
 * Comprehensive collection of verified records supporting the Seabrun Candy Hunter legacy
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, FileText, Music, Scale, Globe, Users, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';

interface ProofItem {
  id: string;
  title: string;
  category: string;
  description: string;
  verificationStatus: 'verified' | 'pending' | 'documented';
  source: string;
  details: string[];
  significance: string;
}

const proofItems: ProofItem[] = [
  {
    id: 'copyright-registration',
    title: 'U.S. Copyright Office Registration',
    category: 'legal',
    description: 'Joint authorship record filed with the United States Copyright Office documenting Seabrun Candy Hunter\'s songwriting credits and intellectual property rights.',
    verificationStatus: 'verified',
    source: 'U.S. Copyright Office Public Records',
    details: [
      'Registration confirms joint authorship on multiple compositions',
      'Documents filed under legal name with proper chain of title',
      'Records accessible through Copyright Office public search system',
      'Establishes legal precedent for estate claims and royalty distribution',
    ],
    significance: 'This is the foundational legal document establishing Seabrun Candy Hunter\'s rights as a songwriter and co-creator of published musical works.',
  },
  {
    id: 'bmi-registration',
    title: 'BMI & MLC Rights Registration',
    category: 'legal',
    description: 'Performance rights organization registration confirming Seabrun Candy Hunter\'s status as a registered songwriter and rights holder.',
    verificationStatus: 'verified',
    source: 'BMI (Broadcast Music, Inc.) & The Mechanical Licensing Collective',
    details: [
      'BMI songwriter registration with unique IPI number',
      'MLC registration for mechanical licensing rights',
      'Performance royalty tracking and distribution records',
      'Confirms active catalog of registered compositions',
    ],
    significance: 'BMI and MLC registration provides independent third-party verification of songwriting credits separate from any record label or publisher claims.',
  },
  {
    id: 'soundexchange',
    title: 'SoundExchange Estate Verification',
    category: 'legal',
    description: 'SoundExchange estate documentation confirming digital performance royalty rights and estate succession for Seabrun Candy Hunter\'s recorded works.',
    verificationStatus: 'verified',
    source: 'SoundExchange Digital Performance Rights',
    details: [
      'Estate verification completed through SoundExchange process',
      'Digital performance royalties tracked and documented',
      'Confirms recordings eligible for digital royalty collection',
      'Estate succession properly documented for ongoing royalty distribution',
    ],
    significance: 'SoundExchange verification confirms that Seabrun Candy Hunter\'s recordings are actively generating digital performance royalties, proving ongoing commercial value.',
  },
  {
    id: 'discogs',
    title: 'Discogs Public Discography',
    category: 'music',
    description: 'Complete public discography documented on Discogs, the world\'s largest music database, confirming release history, credits, and catalog.',
    verificationStatus: 'verified',
    source: 'Discogs.com Public Database',
    details: [
      'Full discography with release dates and catalog numbers',
      'Credit listings confirming songwriter and performer roles',
      'Label and distribution information documented',
      'Community-verified entries with supporting documentation',
    ],
    significance: 'Discogs provides crowd-sourced, community-verified documentation of the complete recorded output, independent of any single party\'s claims.',
  },
  {
    id: 'witness-testimony',
    title: 'Witness Testimony & Collaborator Statements',
    category: 'testimony',
    description: 'Corroborating statements from musical collaborators, family members, and industry professionals who worked directly with Seabrun Candy Hunter.',
    verificationStatus: 'documented',
    source: 'Direct Witness Accounts',
    details: [
      'Statements from co-writers and session musicians',
      'Family member accounts of creative process and career milestones',
      'Industry professional testimony regarding contributions',
      'Contemporaneous accounts matching documented timeline',
    ],
    significance: 'First-hand witness testimony provides human context and corroboration for the documented record, filling gaps that official records alone cannot address.',
  },
  {
    id: 'public-footprint',
    title: 'Public Digital Footprint',
    category: 'digital',
    description: 'Verified presence across streaming platforms, search engines, and digital music services confirming the ongoing availability and recognition of Seabrun Candy Hunter\'s work.',
    verificationStatus: 'verified',
    source: 'Google Search, Streaming Platforms, Digital Archives',
    details: [
      'Presence on major streaming platforms (Spotify, Apple Music, etc.)',
      'Google search results confirming public recognition',
      'Digital archive entries in music databases',
      'Social media and web references from independent sources',
    ],
    significance: 'The digital footprint demonstrates that Seabrun Candy Hunter\'s work exists in the public sphere and is recognized by independent platforms and services.',
  },
  {
    id: 'systematic-documentation',
    title: 'Systematic Omission Documentation',
    category: 'investigation',
    description: 'Documented evidence of systematic omission of credits, recognition, and compensation owed to Seabrun Candy Hunter throughout his career.',
    verificationStatus: 'documented',
    source: 'Comparative Analysis & Historical Records',
    details: [
      'Credit discrepancies between original documentation and published records',
      'Timeline of omissions correlated with industry practices',
      'Comparative analysis with contemporaneous artists\' treatment',
      'Pattern documentation showing systematic rather than incidental omission',
    ],
    significance: 'This documentation establishes that the lack of public recognition was not due to lack of contribution, but rather systematic omission — a critical distinction for legacy restoration.',
  },
];

const categories = [
  { id: 'all', label: 'All Evidence', icon: Shield },
  { id: 'legal', label: 'Legal Records', icon: Scale },
  { id: 'music', label: 'Music Records', icon: Music },
  { id: 'testimony', label: 'Testimony', icon: Users },
  { id: 'digital', label: 'Digital Presence', icon: Globe },
  { id: 'investigation', label: 'Investigation', icon: FileText },
];

function StatusBadge({ status }: { status: string }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
        <CheckCircle className="w-3.5 h-3.5" />
        Verified
      </span>
    );
  }
  if (status === 'documented') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-500">
        <FileText className="w-3.5 h-3.5" />
        Documented
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500">
      <AlertTriangle className="w-3.5 h-3.5" />
      Pending
    </span>
  );
}

export default function ProofVault() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const filteredItems = activeCategory === 'all'
    ? proofItems
    : proofItems.filter(item => item.category === activeCategory);

  const verifiedCount = proofItems.filter(i => i.verificationStatus === 'verified').length;
  const documentedCount = proofItems.filter(i => i.verificationStatus === 'documented').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-red-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Proof Vault</h1>
          <p className="text-xl text-foreground/70 mb-2">
            Verified Documentation & Evidence Archive
          </p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Every claim in this legacy is backed by verifiable evidence. This vault contains the documented proof 
            supporting Seabrun Candy Hunter's contributions, rights, and the systematic omission of his recognition.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-6 px-4 border-b border-border bg-card/50">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">{verifiedCount}</div>
            <div className="text-sm text-foreground/60">Verified Sources</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500">{documentedCount}</div>
            <div className="text-sm text-foreground/60">Documented Records</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{proofItems.length}</div>
            <div className="text-sm text-foreground/60">Total Evidence Items</div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-4 px-4 bg-amber-500/10 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/70">
              <strong className="text-foreground">Documentation Notice:</strong> All evidence presented in this vault 
              is sourced from public records, legal filings, and verified testimony. This archive exists for historical 
              preservation and educational purposes. Specific document images and copies are available upon legitimate 
              legal or academic request.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-red-500 text-white'
                    : 'bg-card hover:bg-card/80 text-foreground/70 border border-border'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Evidence Items */}
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className={`cursor-pointer transition-all hover:border-red-500/30 ${
                  expandedItem === item.id ? 'border-red-500/50 ring-1 ring-red-500/20' : ''
                }`}
                onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <StatusBadge status={item.verificationStatus} />
                      </div>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                {expandedItem === item.id && (
                  <CardContent className="pt-0 space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-foreground mb-1">Source</h4>
                      <p className="text-sm text-foreground/70">{item.source}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Key Evidence Points</h4>
                      <ul className="space-y-2">
                        {item.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-foreground/70">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-foreground mb-1">Why This Matters</h4>
                      <p className="text-sm text-foreground/70">{item.significance}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 px-4 bg-red-500/5 border-t border-red-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">The Evidence Speaks</h2>
          <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
            This is not speculation. This is not opinion. Every piece of evidence in this vault is sourced, 
            verified, and documented. The legacy of Seabrun Candy Hunter is built on facts — and the facts 
            are here for anyone willing to look.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rrb/systematic-omission">
              <span className="inline-flex items-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
                <FileText className="mr-2 w-4 h-4" />
                Read: Systematic Omission
              </span>
            </Link>
            <Link href="/rrb/verified-sources">
              <span className="inline-flex items-center px-6 py-3 border border-red-500 text-red-500 hover:bg-red-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                <ExternalLink className="mr-2 w-4 h-4" />
                View All Verified Sources
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Legal Footer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/50">
            All documentation in this Proof Vault is presented for historical preservation and educational purposes. 
            Copyright and intellectual property rights remain with their respective holders. For legal inquiries 
            regarding specific documents, please contact the estate representatives through the Contact page.
          </p>
        </div>
      </section>
    </div>
  );
}
