import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Copy, Search, Loader, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Transcript {
  episodeId: string;
  episodeTitle: string;
  content: string;
  timestamp: string;
  duration: string;
  language: string;
  searchable: boolean;
}

const SAMPLE_TRANSCRIPTS: Transcript[] = [
  {
    episodeId: '1',
    episodeTitle: "Episode 1: The Beginning - Seabrun's Journey",
    content: `[00:00] Welcome to Rockin' Rockin' Boogie, the podcast dedicated to preserving the legacy of Seabrun Candy Hunter.

[00:15] In this inaugural episode, we explore the early life of Seabrun Candy Hunter and how he became involved with Little Richard.

[00:45] Seabrun's journey began in the 1950s when he first encountered Little Richard performing at a local venue in New Orleans.

[02:30] The connection was immediate. Seabrun recognized the revolutionary nature of Little Richard's music and wanted to be part of this movement.

[04:15] Over the next decade, Seabrun worked closely with Little Richard, contributing to several recordings and performances.

[06:00] This episode sets the stage for understanding Seabrun's pivotal role in music history.

[07:30] Thank you for listening to Rockin' Rockin' Boogie. Subscribe for more episodes exploring this incredible legacy.`,
    timestamp: '2024-01-15',
    duration: '5:30',
    language: 'English',
    searchable: true,
  },
  {
    episodeId: 'sean-1',
    episodeTitle: "Sean's Session 1: Musical Foundations",
    content: `[00:00] Welcome to Sean's Music Sessions, where we explore the fundamentals of music production.

[00:20] Today, we're diving into musical foundations - the building blocks of all great music.

[01:00] First, let's discuss scales. A scale is a sequence of notes in ascending or descending order.

[02:30] The most common scale in Western music is the major scale, which has a bright, happy quality.

[04:00] Then we have the minor scale, which often sounds sad or melancholic.

[05:15] Understanding these scales is essential for any musician or producer.

[06:00] Thank you for joining Sean's Music Sessions. See you next time!`,
    timestamp: '2024-01-20',
    duration: '6:00',
    language: 'English',
    searchable: true,
  },
];

export default function EpisodeTranscripts() {
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredTranscripts = SAMPLE_TRANSCRIPTS.filter(t =>
    t.episodeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const highlightSearchResults = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? `[HIGHLIGHT]${part}[/HIGHLIGHT]` : part
    ).join('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true);
      toast.success('Transcript copied to clipboard!');
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  const downloadTranscript = (transcript: Transcript) => {
    const element = document.createElement('a');
    const file = new Blob([transcript.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${transcript.episodeTitle.replace(/\s+/g, '-')}-transcript.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Transcript downloaded!');
  };

  const generateTranscript = async () => {
    if (!selectedTranscript) return;
    
    setIsGenerating(true);
    try {
      // Simulate transcript generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Transcript generated successfully!');
    } catch (error) {
      toast.error('Failed to generate transcript');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl font-bold">Episode Transcripts</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Search, read, and download transcripts from all episodes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transcript List */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-4">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-foreground/50" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search transcripts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTranscripts.length === 0 ? (
                  <p className="text-sm text-foreground/60 text-center py-8">No transcripts found</p>
                ) : (
                  filteredTranscripts.map(transcript => (
                    <button
                      key={transcript.episodeId}
                      onClick={() => setSelectedTranscript(transcript)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedTranscript?.episodeId === transcript.episodeId
                          ? 'bg-blue-500/20 border border-blue-500/50'
                          : 'hover:bg-accent border border-border'
                      }`}
                    >
                      <p className="font-semibold text-sm line-clamp-2">{transcript.episodeTitle}</p>
                      <p className="text-xs text-foreground/60 mt-1">{transcript.timestamp}</p>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Transcript Display */}
          <div className="lg:col-span-2">
            {selectedTranscript ? (
              <Card className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">{selectedTranscript.episodeTitle}</h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{selectedTranscript.timestamp}</Badge>
                    <Badge variant="secondary">Duration: {selectedTranscript.duration}</Badge>
                    <Badge variant="secondary">Language: {selectedTranscript.language}</Badge>
                    {selectedTranscript.searchable && (
                      <Badge className="bg-green-600">Searchable</Badge>
                    )}
                  </div>
                </div>

                {/* Transcript Content */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono text-foreground/80">
                    {selectedTranscript.content.split('\n').map((line, i) => {
                      const highlighted = highlightSearchResults(line, searchQuery);
                      return (
                        <span key={i}>
                          {highlighted.split('[HIGHLIGHT]').map((part, j) => {
                            if (j === 0) return part;
                            const [text, rest] = part.split('[/HIGHLIGHT]');
                            return (
                              <span key={j}>
                                <mark className="bg-yellow-300 dark:bg-yellow-600 text-foreground">{text}</mark>
                                {rest}
                              </span>
                            );
                          })}
                          {'\n'}
                        </span>
                      );
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => copyToClipboard(selectedTranscript.content)}
                    className="flex-1 gap-2"
                    variant={copiedText ? 'default' : 'outline'}
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Transcript
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => downloadTranscript(selectedTranscript)}
                    className="flex-1 gap-2"
                    variant="outline"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>

                {/* Generate Transcript Button */}
                <Button
                  onClick={generateTranscript}
                  disabled={isGenerating}
                  className="w-full mt-4 gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Generate New Transcript
                    </>
                  )}
                </Button>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <FileText className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
                <p className="text-foreground/60">Select a transcript to view</p>
              </Card>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="font-bold mb-2">Searchable Content</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All transcripts are fully searchable, making it easy to find specific topics or quotes
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold mb-2">Download & Share</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Download transcripts as text files or copy to clipboard for easy sharing
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold mb-2">Accessibility</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Transcripts improve accessibility for all listeners, including those who are deaf or hard of hearing
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
