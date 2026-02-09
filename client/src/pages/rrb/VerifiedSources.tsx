/**
 * Verified Sources - Complete Source Directory
 * All verified sources supporting the Seabrun Candy Hunter legacy
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, ExternalLink, Shield, FileText, Music, Scale, Globe, Users, Database } from 'lucide-react';
import { Link } from 'wouter';

interface VerifiedSource {
  category: string;
  categoryIcon: typeof Shield;
  categoryColor: string;
  sources: {
    name: string;
    type: string;
    description: string;
    whatItProves: string;
    accessMethod: string;
    verified: boolean;
  }[];
}

const verifiedSources: VerifiedSource[] = [
  {
    category: 'Legal & Government Records',
    categoryIcon: Scale,
    categoryColor: 'blue',
    sources: [
      {
        name: 'U.S. Copyright Office',
        type: 'Federal Government Record',
        description: 'Joint authorship registration records filed with the United States Copyright Office, documenting Seabrun Candy Hunter\'s songwriting credits and intellectual property rights.',
        whatItProves: 'Establishes legal authorship and copyright ownership of specific compositions, providing the foundational legal basis for all credit claims.',
        accessMethod: 'Public records searchable at copyright.gov',
        verified: true,
      },
      {
        name: 'BMI (Broadcast Music, Inc.)',
        type: 'Performance Rights Organization',
        description: 'Songwriter registration with BMI confirming Seabrun Candy Hunter\'s status as a registered songwriter with a unique IPI (Interested Parties Information) number.',
        whatItProves: 'Independent third-party verification of songwriting credits, separate from any record label or publisher claims.',
        accessMethod: 'BMI Repertoire search at bmi.com',
        verified: true,
      },
      {
        name: 'The Mechanical Licensing Collective (MLC)',
        type: 'Licensing Authority',
        description: 'Registration with the MLC for mechanical licensing rights, ensuring proper royalty collection for reproductions of musical compositions.',
        whatItProves: 'Confirms active catalog of compositions eligible for mechanical royalty collection in the digital streaming era.',
        accessMethod: 'MLC portal at themlc.com',
        verified: true,
      },
      {
        name: 'SoundExchange',
        type: 'Digital Performance Rights Organization',
        description: 'Estate verification and digital performance royalty documentation confirming rights to collect royalties from digital radio, streaming, and satellite broadcasts.',
        whatItProves: 'Confirms that recordings are actively generating digital performance royalties and that the estate has been verified as the rightful recipient.',
        accessMethod: 'SoundExchange member portal',
        verified: true,
      },
    ],
  },
  {
    category: 'Music Industry Databases',
    categoryIcon: Music,
    categoryColor: 'green',
    sources: [
      {
        name: 'Discogs',
        type: 'Community Music Database',
        description: 'The world\'s largest music database and marketplace, containing community-verified discography entries with release dates, catalog numbers, and credit listings.',
        whatItProves: 'Provides crowd-sourced, independently verified documentation of the complete recorded output, including credits and release history.',
        accessMethod: 'Public search at discogs.com',
        verified: true,
      },
      {
        name: 'Streaming Platform Presence',
        type: 'Digital Distribution',
        description: 'Presence on major streaming platforms including Spotify, Apple Music, Amazon Music, and others, confirming ongoing availability and commercial value of recordings.',
        whatItProves: 'Demonstrates that the music exists in the commercial marketplace and continues to generate streams and engagement.',
        accessMethod: 'Search on respective streaming platforms',
        verified: true,
      },
      {
        name: 'AllMusic / MusicBrainz',
        type: 'Music Reference Databases',
        description: 'Entries in professional music reference databases that catalog artist information, discographies, and credit details.',
        whatItProves: 'Additional independent sources confirming the existence and attribution of recorded works.',
        accessMethod: 'Public search at allmusic.com and musicbrainz.org',
        verified: true,
      },
    ],
  },
  {
    category: 'Witness Testimony & Documentation',
    categoryIcon: Users,
    categoryColor: 'amber',
    sources: [
      {
        name: 'Collaborator Statements',
        type: 'First-Hand Testimony',
        description: 'Written and recorded statements from musical collaborators who worked directly with Seabrun Candy Hunter in the studio and on stage.',
        whatItProves: 'Provides human context and independent corroboration of creative contributions that official records alone cannot capture.',
        accessMethod: 'Available through estate representatives',
        verified: true,
      },
      {
        name: 'Family Documentation',
        type: 'Family Records',
        description: 'Personal records, correspondence, photographs, and documentation maintained by family members throughout Seabrun Candy Hunter\'s career.',
        whatItProves: 'Provides contemporaneous evidence of creative activity, career milestones, and personal history that supports the documented timeline.',
        accessMethod: 'Curated selections presented on this website',
        verified: true,
      },
      {
        name: 'Session Documentation',
        type: 'Studio Records',
        description: 'Original session notes, track sheets, and studio documentation from recording sessions where Seabrun Candy Hunter participated.',
        whatItProves: 'Provides direct evidence of participation in specific recording sessions, often showing credits that differ from published releases.',
        accessMethod: 'Available through estate representatives for verified inquiries',
        verified: true,
      },
    ],
  },
  {
    category: 'Digital & Public Records',
    categoryIcon: Globe,
    categoryColor: 'purple',
    sources: [
      {
        name: 'Google Search Results',
        type: 'Public Digital Footprint',
        description: 'Search engine results confirming public recognition and digital presence of Seabrun Candy Hunter\'s name and works across the internet.',
        whatItProves: 'Demonstrates that the artist and their work exist in the public sphere and are recognized by independent sources.',
        accessMethod: 'Google search for "Seabrun Candy Hunter"',
        verified: true,
      },
      {
        name: 'Internet Archive / Wayback Machine',
        type: 'Digital Archive',
        description: 'Historical web snapshots and archived content related to Seabrun Candy Hunter\'s music and career.',
        whatItProves: 'Provides time-stamped evidence of historical web presence and digital documentation.',
        accessMethod: 'Public search at archive.org',
        verified: true,
      },
    ],
  },
];

export default function VerifiedSources() {
  const totalSources = verifiedSources.reduce((acc, cat) => acc + cat.sources.length, 0);
  const verifiedCount = verifiedSources.reduce(
    (acc, cat) => acc + cat.sources.filter(s => s.verified).length, 0
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-green-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Verified Sources</h1>
          <p className="text-xl text-foreground/70 mb-2">
            Complete Source Directory
          </p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Every claim in this legacy is backed by verifiable sources. This directory catalogs all sources 
            used to document and verify Seabrun Candy Hunter's contributions, rights, and legacy.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-6 px-4 border-b border-border bg-card/50">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">{totalSources}</div>
            <div className="text-sm text-foreground/60">Total Sources</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">{verifiedCount}</div>
            <div className="text-sm text-foreground/60">Verified</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{verifiedSources.length}</div>
            <div className="text-sm text-foreground/60">Categories</div>
          </div>
        </div>
      </section>

      {/* Source Categories */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          {verifiedSources.map((category, catIdx) => {
            const colorMap: Record<string, string> = {
              blue: 'text-blue-500 bg-blue-500/20',
              green: 'text-green-500 bg-green-500/20',
              amber: 'text-amber-500 bg-amber-500/20',
              purple: 'text-purple-500 bg-purple-500/20',
            };
            const iconColors = colorMap[category.categoryColor] || 'text-green-500 bg-green-500/20';

            return (
              <div key={catIdx}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconColors}`}>
                    <category.categoryIcon className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{category.category}</h2>
                </div>

                <div className="space-y-4">
                  {category.sources.map((source, srcIdx) => (
                    <Card key={srcIdx} className="hover:border-green-500/30 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg">{source.name}</CardTitle>
                              {source.verified && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <CardDescription>{source.type}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-foreground/70 text-sm">{source.description}</p>

                        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                          <h4 className="text-xs font-semibold text-foreground mb-1">What This Proves</h4>
                          <p className="text-xs text-foreground/60">{source.whatItProves}</p>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-3">
                          <h4 className="text-xs font-semibold text-foreground mb-1">How to Access</h4>
                          <p className="text-xs text-foreground/60">{source.accessMethod}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 px-4 bg-green-500/5 border-t border-green-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Transparency Is the Foundation</h2>
          <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
            We believe that a legacy built on verifiable facts is stronger than one built on claims alone. 
            Every source listed here is accessible, verifiable, and documented.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rrb/proof-vault">
              <span className="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
                <Database className="mr-2 w-4 h-4" />
                View the Proof Vault
              </span>
            </Link>
            <Link href="/rrb/the-legacy">
              <span className="inline-flex items-center px-6 py-3 border border-green-500 text-green-500 hover:bg-green-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                <FileText className="mr-2 w-4 h-4" />
                Read the Full Legacy
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/50">
            All sources listed are presented for historical preservation and educational purposes. 
            Access methods are provided for verification. Some sources may require registration or 
            legitimate inquiry to access. For legal inquiries, please contact the estate representatives.
          </p>
        </div>
      </section>
    </div>
  );
}
