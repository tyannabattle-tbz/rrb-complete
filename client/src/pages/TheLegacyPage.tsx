import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/SearchBar';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function TheLegacyPage() {
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: biography } = trpc.proofVault.getBiography.useQuery();
  const { data: timeline } = trpc.proofVault.getTimeline.useQuery();

  // Filter timeline based on search
  const filteredTimeline = timeline?.filter((event) => {
    const matchesSearch =
      !searchQuery ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.details?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">The Legacy</h1>
          <p className="text-xl text-slate-300">
            Seabrun Candy Hunter: A Life in Music (1971–2025)
          </p>
        </div>

        {/* Biography Section */}
        {biography && (
          <Card className="bg-slate-800 border-slate-700 p-8 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Biography</h2>
            <div className="prose prose-invert max-w-none space-y-4">
              <p className="text-slate-300 leading-relaxed">
                {biography.introduction}
              </p>

              {biography.earlyYears && (
                <>
                  <h3 className="text-2xl font-bold text-white mt-8">
                    Early Years
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {biography.earlyYears}
                  </p>
                </>
              )}

              {biography.musicalCareer && (
                <>
                  <h3 className="text-2xl font-bold text-white mt-8">
                    Musical Career
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {biography.musicalCareer}
                  </p>
                </>
              )}

              {biography.legacy && (
                <>
                  <h3 className="text-2xl font-bold text-white mt-8">
                    Legacy & Impact
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {biography.legacy}
                  </p>
                </>
              )}
            </div>
          </Card>
        )}

        {/* Search */}
        <div className="mb-8">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search timeline events..."
          />
        </div>

        {/* Timeline Section */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-8">
            Timeline (1971–2025) - {filteredTimeline.length} events
          </h2>
          {filteredTimeline.length > 0 ? (
            <div className="space-y-4">
              {filteredTimeline.map((event, index) => (
                <Card
                  key={index}
                  className="bg-slate-800 border-slate-700 overflow-hidden hover:border-amber-500 transition-all"
                >
                  <button
                    onClick={() =>
                      setExpandedYear(
                        expandedYear === event.year ? null : event.year
                      )
                    }
                    className="w-full p-6 flex items-center justify-between hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-6">
                      <div className="text-3xl font-bold text-amber-500 w-20">
                        {event.year}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {event.title}
                        </h3>
                        <p className="text-slate-400 mt-1">{event.summary}</p>
                      </div>
                    </div>
                    {expandedYear === event.year ? (
                      <ChevronUp className="w-6 h-6 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {expandedYear === event.year && (
                    <div className="px-6 pb-6 bg-slate-700/30 border-t border-slate-700">
                      <p className="text-slate-300 leading-relaxed mb-4">
                        {event.details}
                      </p>
                      {event.evidence && event.evidence.length > 0 && (
                        <div className="mt-4 p-4 bg-slate-800 rounded border border-slate-600">
                          <p className="text-sm text-slate-400 mb-2">
                            Evidence:
                          </p>
                          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                            {event.evidence.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800 border-slate-700 p-8 text-center">
              <p className="text-slate-400">
                No timeline events found matching your search.
              </p>
            </Card>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-300 mb-6">
            Want to verify these claims? Explore our comprehensive archive.
          </p>
          <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 text-lg">
            Enter the Proof Vault
          </Button>
        </div>
      </div>
    </div>
  );
}
