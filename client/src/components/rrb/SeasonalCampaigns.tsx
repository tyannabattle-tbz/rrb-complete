import { Calendar, Zap, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Campaign {
  id: string;
  name: string;
  period: string;
  startDate: string;
  endDate: string;
  commercials: string[];
  description: string;
  theme: string;
  targetAudience: string;
  expectedOutcome: string;
  active: boolean;
}

interface SeasonalCampaignsProps {
  onSelectCampaign?: (campaign: Campaign) => void;
}

export default function SeasonalCampaigns({ onSelectCampaign }: SeasonalCampaignsProps) {
  const campaigns: Campaign[] = [
    {
      id: 'new-year-2026',
      name: 'New Year, New Books',
      period: 'January - February 2026',
      startDate: '2026-01-01',
      endDate: '2026-02-28',
      commercials: ['Drawn to Danger', 'Just Imagine', 'The Miracles Series'],
      description: 'Kick off the new year with inspiring reads that encourage personal growth and transformation.',
      theme: 'Fresh starts and new beginnings',
      targetAudience: 'New readers seeking motivation and inspiration',
      expectedOutcome: 'Increase book sales by 40% during Q1',
      active: true
    },
    {
      id: 'spring-poetry',
      name: 'Spring Poetry Season',
      period: 'March - May 2026',
      startDate: '2026-03-01',
      endDate: '2026-05-31',
      commercials: ['It Animal Poetry Time', 'A Woman\'s Instinct'],
      description: 'Celebrate the renewal of spring with poetry collections that capture nature and wisdom.',
      theme: 'Nature, renewal, and feminine wisdom',
      targetAudience: 'Poetry enthusiasts and nature lovers',
      expectedOutcome: 'Build poetry collection audience',
      active: false
    },
    {
      id: 'summer-legacy',
      name: 'Summer Legacy Tour',
      period: 'June - August 2026',
      startDate: '2026-06-01',
      endDate: '2026-08-31',
      commercials: ['The Legacy Restored', 'King Richard and I', 'All About Candy'],
      description: 'Dive deep into Candy\'s complete legacy with comprehensive autobiographical works.',
      theme: 'Musical heritage and personal legacy',
      targetAudience: 'Music historians and legacy seekers',
      expectedOutcome: 'Establish as definitive legacy resource',
      active: false
    },
    {
      id: 'fall-spiritual',
      name: 'Fall Spiritual Journey',
      period: 'September - November 2026',
      startDate: '2026-09-01',
      endDate: '2026-11-30',
      commercials: ['The Miracles Series', 'A Woman\'s Instinct', 'Just Imagine'],
      description: 'Explore spiritual growth and transformation as we move into the reflective season.',
      theme: 'Spiritual growth and inner wisdom',
      targetAudience: 'Spiritual seekers and personal development readers',
      expectedOutcome: 'Drive holiday gift book purchases',
      active: false
    },
    {
      id: 'holiday-giving',
      name: 'Holiday Gift Guide',
      period: 'November - December 2026',
      startDate: '2026-11-15',
      endDate: '2026-12-31',
      commercials: ['The Legacy Restored', 'The Miracles Series', 'All About Candy', 'King Richard and I'],
      description: 'Give the gift of inspiration this holiday season with Candy\'s complete collection.',
      theme: 'Giving, gratitude, and legacy',
      targetAudience: 'Gift buyers and holiday shoppers',
      expectedOutcome: 'Maximize Q4 sales and reach new audiences',
      active: false
    }
  ];

  const activeCampaigns = campaigns.filter(c => c.active);
  const upcomingCampaigns = campaigns.filter(c => !c.active);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Calendar className="w-8 h-8 text-accent" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Seasonal Campaigns</h2>
        </div>

        <p className="text-lg text-foreground/80 mb-12">
          Strategic promotional campaigns designed to maximize reach and engagement throughout the year. Each campaign targets specific audiences and themes to drive book sales and legacy awareness.
        </p>

        {/* Active Campaigns */}
        {activeCampaigns.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-accent" />
              <h3 className="text-2xl font-bold text-foreground">🔴 Active Now</h3>
            </div>
            <div className="space-y-4">
              {activeCampaigns.map((campaign, idx) => (
                <div key={campaign.id} className="bg-card border-2 border-accent rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-foreground mb-1">{campaign.name}</h4>
                      <p className="text-sm text-accent font-semibold">{campaign.period}</p>
                    </div>
                    <span className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold">
                      ACTIVE
                    </span>
                  </div>

                  <p className="text-foreground/80 mb-4">{campaign.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-foreground/60 mb-1">Theme</p>
                      <p className="text-sm font-semibold text-foreground">{campaign.theme}</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 mb-1">Target Audience</p>
                      <p className="text-sm font-semibold text-foreground">{campaign.targetAudience}</p>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-background rounded border border-border">
                    <p className="text-xs text-foreground/60 mb-2">Featured Commercials</p>
                    <div className="flex flex-wrap gap-2">
                      {campaign.commercials.map((commercial, idx) => (
                        <span key={`active-campaign-${campaign.id}-commercial-${idx}`} className="inline-block bg-accent/20 text-accent px-2 py-1 rounded text-xs font-semibold">
                          {commercial}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-foreground/60 mb-1">Expected Outcome</p>
                      <p className="text-sm font-semibold text-accent">{campaign.expectedOutcome}</p>
                    </div>
                    {onSelectCampaign && (
                      <Button
                        onClick={() => onSelectCampaign(campaign)}
                        size="sm"
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Campaigns */}
        {upcomingCampaigns.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-foreground/60" />
              <h3 className="text-2xl font-bold text-foreground">📅 Upcoming Campaigns</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingCampaigns.map((campaign, idx) => (
                <div key={campaign.id} className="bg-card border border-border rounded-lg p-6 hover:border-accent/50 transition-colors">
                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-foreground mb-1">{campaign.name}</h4>
                    <p className="text-sm text-foreground/70">{campaign.period}</p>
                  </div>

                  <p className="text-sm text-foreground/80 mb-4 line-clamp-2">{campaign.description}</p>

                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="text-foreground/70">{campaign.targetAudience}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="text-foreground/70">{campaign.expectedOutcome}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {campaign.commercials.slice(0, 2).map((commercial, idx) => (
                      <span key={`upcoming-campaign-${campaign.id}-commercial-${idx}`} className="inline-block bg-background text-foreground/70 px-2 py-0.5 rounded text-xs">
                        {commercial}
                      </span>
                    ))}
                    {campaign.commercials.length > 2 && (
                      <span className="inline-block bg-background text-foreground/70 px-2 py-0.5 rounded text-xs">
                        +{campaign.commercials.length - 2} more
                      </span>
                    )}
                  </div>

                  {onSelectCampaign && (
                    <Button
                      onClick={() => onSelectCampaign(campaign)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Learn More
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campaign Strategy */}
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-foreground mb-6">📊 Campaign Strategy</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-accent mb-2">5</div>
              <p className="font-semibold text-foreground mb-2">Annual Campaigns</p>
              <p className="text-sm text-foreground/80">
                Strategically planned throughout the year to maximize reach and engagement across all seasons.
              </p>
            </div>

            <div>
              <div className="text-3xl font-bold text-accent mb-2">12+</div>
              <p className="font-semibold text-foreground mb-2">Featured Commercials</p>
              <p className="text-sm text-foreground/80">
                Rotating commercials selected for each campaign to match theme and target audience.
              </p>
            </div>

            <div>
              <div className="text-3xl font-bold text-accent mb-2">365</div>
              <p className="font-semibold text-foreground mb-2">Days of Promotion</p>
              <p className="text-sm text-foreground/80">
                Year-round promotional strategy ensuring consistent visibility and engagement.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-accent/20">
            <h4 className="font-bold text-foreground mb-4">Campaign Objectives</h4>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li className="flex gap-2">
                <span className="text-accent">✓</span>
                <span>Increase awareness of Candy's complete literary catalog</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent">✓</span>
                <span>Drive targeted traffic to Books page during peak seasons</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent">✓</span>
                <span>Build engaged communities around specific book themes</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent">✓</span>
                <span>Maximize revenue during high-conversion periods</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent">✓</span>
                <span>Establish seasonal reading traditions among audience</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 p-8 bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/20 rounded-lg text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">Ready to Explore?</h3>
          <p className="text-foreground/80 mb-6 max-w-2xl mx-auto">
            Each campaign is designed to introduce you to different aspects of Seabrun Candy Hunter's literary legacy. Follow our seasonal campaigns to discover new books and themes throughout the year.
          </p>
          <a href="/rrb/books-and-miracles">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Browse All Books
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
