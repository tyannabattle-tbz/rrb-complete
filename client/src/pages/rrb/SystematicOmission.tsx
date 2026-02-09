/**
 * Systematic Omission - Documenting the Erasure of Credits & Recognition
 * Details how Seabrun Candy Hunter's contributions were systematically omitted
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, FileText, Scale, Eye, TrendingDown, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

interface OmissionPattern {
  id: string;
  title: string;
  period: string;
  description: string;
  evidence: string[];
  impact: string;
}

const omissionPatterns: OmissionPattern[] = [
  {
    id: 'credit-removal',
    title: 'Songwriting Credit Omission',
    period: '1970s – 1990s',
    description: 'Original songwriting credits were altered, reduced, or entirely removed from published recordings and liner notes. Compositions co-written or solely written by Seabrun Candy Hunter appeared under other names or with incomplete attribution.',
    evidence: [
      'Copyright Office filings show joint authorship that does not appear on published releases',
      'Original session documentation lists credits differently than final published versions',
      'BMI registration records conflict with label-published credit sheets',
      'Multiple compositions registered under alternate names without consent or documentation of transfer',
    ],
    impact: 'Loss of songwriting royalties, public recognition, and historical credit for creative contributions spanning decades of work.',
  },
  {
    id: 'royalty-diversion',
    title: 'Royalty Stream Diversion',
    period: '1980s – Present',
    description: 'Performance royalties, mechanical royalties, and digital streaming revenue were directed away from Seabrun Candy Hunter and his estate through improper registration, incomplete documentation, and failure to update rights records.',
    evidence: [
      'SoundExchange records show estate was not receiving entitled digital performance royalties',
      'MLC registration required to capture mechanical royalties was not completed by responsible parties',
      'Performance royalties collected by PROs were distributed to incomplete or incorrect rights holders',
      'Estate verification process revealed gaps in royalty chain dating back decades',
    ],
    impact: 'Decades of uncollected royalties representing the financial value of a lifetime of creative work.',
  },
  {
    id: 'historical-erasure',
    title: 'Historical Record Erasure',
    period: '1990s – 2020s',
    description: 'As the music industry transitioned to digital, the already-incomplete physical records were further diminished. Digital databases were populated from flawed source material, perpetuating and amplifying the original omissions.',
    evidence: [
      'Digital music databases inherited incomplete credits from physical-era records',
      'Streaming platform metadata reflects omitted credits from original releases',
      'Wikipedia and music reference sites lack entries despite documented catalog',
      'Industry award and recognition databases contain no entries despite qualifying work',
    ],
    impact: 'The digital transition created a compounding effect — each new platform that copied incomplete data further cemented the erasure.',
  },
  {
    id: 'industry-practice',
    title: 'Industry-Wide Patterns',
    period: 'Systemic',
    description: 'The omission of Seabrun Candy Hunter\'s credits was not an isolated incident but part of a broader pattern affecting artists — particularly Black artists — throughout the music industry during this era.',
    evidence: [
      'Documented industry practices of credit manipulation affecting minority artists',
      'Congressional hearings and industry reports acknowledging systemic credit issues',
      'Similar patterns documented across multiple artists of the same era and demographic',
      'Music industry reform efforts specifically addressing historical credit inequities',
    ],
    impact: 'Understanding the systemic nature of these omissions is essential to understanding why restoration — not just correction — is necessary.',
  },
];

const timelineOfRestoration = [
  {
    year: '2020',
    title: 'Discovery Phase',
    description: 'Family members begin systematic review of historical records, discovering discrepancies between documented contributions and published credits.',
  },
  {
    year: '2021',
    title: 'Documentation Gathering',
    description: 'Collection of original session notes, contracts, correspondence, and witness testimony to establish the factual record.',
  },
  {
    year: '2022',
    title: 'Rights Registration',
    description: 'Filing of corrected registrations with BMI, MLC, SoundExchange, and the U.S. Copyright Office to establish proper rights chain.',
  },
  {
    year: '2023',
    title: 'Estate Verification',
    description: 'Completion of SoundExchange estate verification process, establishing the estate\'s right to collect digital performance royalties.',
  },
  {
    year: '2024',
    title: 'Public Documentation',
    description: 'Launch of comprehensive public documentation through RockinRockinBoogie.com, making the verified record accessible to all.',
  },
  {
    year: '2025',
    title: 'Legacy Restored',
    description: 'Ongoing restoration efforts including platform development, archival preservation, and community engagement to ensure the legacy endures.',
  },
];

export default function SystematicOmission() {
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-orange-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Systematic Omission</h1>
          <p className="text-xl text-foreground/70 mb-2">
            The Documented Erasure of a Legacy
          </p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            This page documents the systematic omission of Seabrun Candy Hunter's songwriting credits, 
            performance recognition, and rightful compensation — not as accusation, but as documented fact.
          </p>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-4 px-4 bg-orange-500/10 border-y border-orange-500/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-start">
            <Scale className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/70">
              <strong className="text-foreground">Important:</strong> The information presented here is based on 
              documented evidence from public records, legal filings, and verified testimony. This is not speculation 
              or opinion — it is a factual account supported by the evidence cataloged in the{' '}
              <Link href="/rrb/proof-vault">
                <span className="text-orange-500 underline cursor-pointer">Proof Vault</span>
              </Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="text-foreground/80 leading-relaxed text-lg mb-4">
                The story of Seabrun Candy Hunter is not simply one of an unrecognized artist. It is a documented 
                case of systematic omission — a pattern of credit removal, royalty diversion, and historical erasure 
                that spans decades and continues to affect the estate today.
              </p>
              <p className="text-foreground/80 leading-relaxed text-lg mb-4">
                What makes this case significant is not just the individual injustice, but the fact that it represents 
                a broader pattern that affected countless artists of the same era. The music industry's history is 
                filled with stories of creators whose contributions were diminished, redirected, or erased entirely — 
                often along racial and economic lines.
              </p>
              <p className="text-foreground/80 leading-relaxed text-lg">
                This page exists to document the specific patterns of omission, present the evidence, and provide 
                context for why the restoration of this legacy is not just a family matter — it is a matter of 
                historical accuracy and justice.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Omission Patterns */}
      <section className="py-12 px-4 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Documented Patterns of Omission</h2>
          <div className="space-y-4">
            {omissionPatterns.map((pattern) => (
              <Card
                key={pattern.id}
                className={`cursor-pointer transition-all hover:border-orange-500/30 ${
                  expandedPattern === pattern.id ? 'border-orange-500/50 ring-1 ring-orange-500/20' : ''
                }`}
                onClick={() => setExpandedPattern(expandedPattern === pattern.id ? null : pattern.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{pattern.title}</CardTitle>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-500">
                          {pattern.period}
                        </span>
                      </div>
                      <p className="text-foreground/70 text-sm">{pattern.description}</p>
                    </div>
                    <TrendingDown className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  </div>
                </CardHeader>

                {expandedPattern === pattern.id && (
                  <CardContent className="pt-0 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Supporting Evidence</h4>
                      <ul className="space-y-2">
                        {pattern.evidence.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-foreground/70">
                            <Eye className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-foreground mb-1">Impact</h4>
                      <p className="text-sm text-foreground/70">{pattern.impact}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline of Restoration */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">The Path to Restoration</h2>
          <div className="space-y-4">
            {timelineOfRestoration.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  {idx < timelineOfRestoration.length - 1 && (
                    <div className="w-0.5 flex-1 bg-green-500/20 mt-2" />
                  )}
                </div>
                <div className="pb-6">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-lg font-bold text-green-500">{item.year}</span>
                    <span className="text-lg font-bold text-foreground">{item.title}</span>
                  </div>
                  <p className="text-foreground/70">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 px-4 bg-orange-500/5 border-t border-orange-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">The Record Must Be Corrected</h2>
          <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
            Systematic omission thrives in silence. By documenting the evidence and making it publicly accessible, 
            we ensure that the historical record reflects the truth — not the version that was convenient for those 
            who benefited from the erasure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rrb/proof-vault">
              <span className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
                <FileText className="mr-2 w-4 h-4" />
                View the Proof Vault
              </span>
            </Link>
            <Link href="/rrb/the-legacy">
              <span className="inline-flex items-center px-6 py-3 border border-orange-500 text-orange-500 hover:bg-orange-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                <ArrowRight className="mr-2 w-4 h-4" />
                Read the Full Legacy
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/50">
            This page presents documented facts for historical preservation and educational purposes. 
            All claims are supported by evidence cataloged in the Proof Vault. No specific individuals 
            or entities are accused without supporting documentation. For legal inquiries, please contact 
            the estate representatives through the Contact page.
          </p>
        </div>
      </section>
    </div>
  );
}
