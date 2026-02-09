import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { Newspaper, Camera, Download, Mail, Users, Briefcase, Info } from 'lucide-react';

export default function MediaHub() {
  const [activeTab, setActiveTab] = useState('journalists');

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="py-12 md:py-20 bg-card border-b border-border">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <Newspaper className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="text-4xl md:text-5xl font-bold mt-4">Media Hub</h1>
          <p className="mt-2 text-lg md:text-xl text-muted-foreground">
            Resources for journalists, bloggers, and content creators.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 gap-2">
            <TabsTrigger value="journalists">
              <Users className="mr-2 h-4 w-4" /> For Journalists
            </TabsTrigger>
            <TabsTrigger value="bloggers">
              <Briefcase className="mr-2 h-4 w-4" /> For Bloggers
            </TabsTrigger>
            <TabsTrigger value="creators">
              <Camera className="mr-2 h-4 w-4" /> For Content Creators
            </TabsTrigger>
          </TabsList>

          <TabsContent value="journalists" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Press Kit & Information</CardTitle>
                <CardDescription>Essential information about Seabrun Candy Hunter and RockinRockinBoogie.com.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Our comprehensive press kit includes a detailed biography of Seabrun Candy Hunter, the history of his systematic omission from songwriting credits, and the mission of Canryn Production Inc. to restore his legacy. You'll find information on our key initiatives: <a href="https://sweetmiraclesattt.wixsite.com/sweet-miracles" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">Sweet Miracles</a>, our community outreach program; <Link href="/rrb/qumus/monitoring" className="text-red-500 hover:underline">QUMUS</Link>, the autonomous orchestration project; and <Link href="/rrb/hybridcast" className="text-red-500 hover:underline">HybridCast</Link>, our emergency broadcast system.
                </p>
                <a href="/rrb/media-hub" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600">
                  <Download className="mr-2 h-4 w-4" /> Download Press Kit
                </a>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bloggers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Story Angles & Assets</CardTitle>
                <CardDescription>Ideas and resources for your blog posts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Explore the untold stories of a music pioneer. We provide high-resolution images, brand guidelines, and suggested topics to help you craft compelling narratives. Dive into the technology behind QUMUS or the community impact of Sweet Miracles. For more, see our <Link href="/rrb/the-legacy" className="text-amber-500 hover:underline">About</Link> page.
                </p>
                <a href="/rrb/media-hub" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-500 hover:bg-amber-600">
                  <Download className="mr-2 h-4 w-4" /> Download Blogger Assets
                </a>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="creators" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Visuals & Collaboration</CardTitle>
                <CardDescription>Assets for video content and social media.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Access our library of official photos and video clips (placeholders). We welcome collaborations with content creators who share our passion for music history and justice. If you're interested in featuring Seabrun Candy Hunter's story, please reach out.
                </p>
                <a href="/rrb/media-hub" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600">
                  <Download className="mr-2 h-4 w-4" /> Download Creator Pack
                </a>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <section className="mt-12 grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Mail className="mr-2 h-5 w-5 text-red-500" />Media Contact & Interview Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p>For all media inquiries, interview requests, or to get in touch with our team, please contact:</p>
              <p className="font-semibold mt-2">press@canryn.com</p>
              <p>We aim to respond within 24-48 hours.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Info className="mr-2 h-5 w-5 text-red-500" />Brand Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Please adhere to our brand guidelines when using our name, logo, and other assets. This ensures consistency and respect for the legacy of Seabrun Candy Hunter.</p>
              <a href="/rrb/media-hub" className="inline-flex items-center mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600">
                <Download className="mr-2 h-4 w-4" /> Download Guidelines
              </a>
            </CardContent>
          </Card>
        </section>

        <section className="mt-12">
            <Card>
                <CardHeader>
                    <CardTitle>Latest Press Releases</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        <li><span className="font-semibold">Jan 15, 2026:</span> Canryn Production Inc. Launches RockinRockinBoogie.com</li>
                        <li><span className="font-semibold">Feb 01, 2026:</span> QUMUS AI Generates First Full Orchestral Piece in the Style of Seabrun Candy Hunter</li>
                    </ul>
                </CardContent>
            </Card>
        </section>

      </main>

      <footer className="bg-card border-t border-border mt-20 py-6">
        <div className="container mx-auto px-4 md:px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Canryn Production Inc. All Rights Reserved.</p>
          <p>The RockinRockinBoogie.com platform is dedicated to the memory and legacy of Seabrun Candy Hunter.</p>
          <div className="mt-4 space-x-4">
            <Link href="/rrb/faq" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/rrb/faq" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/rrb/contact" className="hover:text-foreground">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
