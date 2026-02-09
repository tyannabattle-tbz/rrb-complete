import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { Users, DollarSign, BarChart, Gift, ArrowRight, HelpCircle } from 'lucide-react';

export default function AffiliateProgram() {
  const faqs = [
    {
      question: "Who is eligible to join the affiliate program?",
      answer: "Our affiliate program is open to passionate music lovers, historians, content creators, and anyone dedicated to preserving the legacy of underrepresented artists. We welcome applications from bloggers, social media influencers, and website owners whose content aligns with the mission of RockinRockinBoogie.com."
    },
    {
      question: "What are the commission rates?",
      answer: "Affiliates earn a competitive commission on all merchandise sales generated through their unique referral links. The standard commission rate is 15%, with opportunities for increased rates based on performance and promotional-tier events. Commissions are paid out monthly via PayPal."
    },
    {
      question: "Are there any costs to become an affiliate?",
      answer: "No, joining the RockinRockinBoogie.com affiliate program is completely free. We provide all the necessary marketing materials, including banners, links, and promotional content, to help you succeed. There are no hidden fees or minimum sales requirements."
    },
    {
      question: "How do I track my earnings?",
      answer: "You will have access to a personalized affiliate dashboard where you can monitor your clicks, referrals, and commissions in real-time. The dashboard provides detailed reports to help you optimize your promotional strategies and maximize your earnings."
    },
    {
      question: "What can I promote?",
      answer: "You can promote our exclusive line of Seabrun Candy Hunter merchandise, including apparel, limited edition vinyl, and digital content. Additionally, you can share content from our platform, such as articles and documentaries, to engage your audience and drive traffic."
    }
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <Users className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Join Our Affiliate Program</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Partner with RockinRockinBoogie.com to celebrate the legacy of Seabrun Candy Hunter and earn rewards by sharing his story with the world.
          </p>
        </section>

        {/* Program Overview */}
        <section className="mb-16">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">How It Works</CardTitle>
              <CardDescription>A simple and rewarding partnership.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="bg-red-500/10 p-4 rounded-full mb-4">
                    <Users className="h-8 w-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold">1. Join for Free</h3>
                  <p className="text-muted-foreground mt-2">Sign up in minutes and get your unique referral link to start promoting.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-amber-500/10 p-4 rounded-full mb-4">
                    <ArrowRight className="h-8 w-8 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-semibold">2. Promote</h3>
                  <p className="text-muted-foreground mt-2">Share our content and merchandise with your audience using our marketing assets.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-orange-500/10 p-4 rounded-full mb-4">
                    <DollarSign className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold">3. Earn Commissions</h3>
                  <p className="text-muted-foreground mt-2">Receive a commission for every sale made through your referral link.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Details Tabs */}
        <section className="mb-16">
          <Tabs defaultValue="commission" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="commission">Commission</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="promote">How to Promote</TabsTrigger>
              <TabsTrigger value="apply">Application</TabsTrigger>
            </TabsList>
            <TabsContent value="commission" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center"><DollarSign className="mr-2 h-6 w-6 text-amber-500" />Commission Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Our commission structure is designed to be both competitive and rewarding. Affiliates earn a baseline of <strong>15% commission</strong> on all qualifying merchandise sales. We also offer performance-based tiers that allow dedicated partners to increase their earning potential.</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Tier 1 (Standard):</strong> 15% on all sales.</li>
                    <li><strong>Tier 2 (Pro):</strong> 20% for affiliates generating over $1,000 in sales per month.</li>
                    <li><strong>Tier 3 (Elite):</strong> 25% for top-performing partners with exceptional promotional reach.</li>
                  </ul>
                  <p>Payments are made on the 15th of each month for the previous month's earnings via PayPal.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="benefits" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center"><Gift className="mr-2 h-6 w-6 text-red-500" />Affiliate Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Becoming a RockinRockinBoogie.com affiliate means more than just earning commissions. You become a partner in our mission to restore Seabrun Candy Hunter's rightful place in music history.</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Exclusive Access:</strong> Get early access to new merchandise drops and unreleased content.</li>
                    <li><strong>Marketing Support:</strong> A rich library of creative assets, from banners to pre-written social media posts.</li>
                    <li><strong>Community:</strong> Join a network of like-minded individuals passionate about musical justice.</li>
                    <li><strong>Performance Bonuses:</strong> Opportunity to earn bonuses during special campaigns and promotions.</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="promote" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center"><BarChart className="mr-2 h-6 w-6 text-orange-500" />How to Promote</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>We encourage creative and authentic promotions. Here are a few ideas to get you started:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Write a blog post about Seabrun Candy Hunter's story and link to our <Link href="/rrb/about" className="text-red-500 hover:underline">About page</Link>.</li>
                    <li>Create a video review of our exclusive merchandise.</li>
                    <li>Share our documentary clips on your social media channels.</li>
                    <li>Include our banners on your website or in your newsletter.</li>
                    <li>Host a listening party featuring Seabrun's music and our <Link href="/rrb/qumus" className="text-red-500 hover:underline">QUMUS orchestrations</Link>.</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="apply" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center"><ArrowRight className="mr-2 h-6 w-6" />Application Process</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Ready to join? The application process is straightforward:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li><strong>Submit Your Application:</strong> Fill out our online form with your details and links to your website or social media profiles.</li>
                    <li><strong>Review:</strong> Our team will review your application to ensure it aligns with our brand values (typically within 3-5 business days).</li>
                    <li><strong>Approval & Onboarding:</strong> Once approved, you'll receive a welcome email with your login details for the affiliate dashboard and a guide to get you started.</li>
                  </ol>
                  <div className="text-center pt-4">
                    <Link href="/rrb/affiliate-application" className="inline-block bg-red-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-600 transition-colors">
                      Apply Now
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center"><HelpCircle className="mr-2 h-8 w-8 text-amber-500" />Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-card border-border overflow-hidden">
                <CardHeader className="cursor-pointer p-6 flex justify-between items-center" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                  <CardTitle className="text-lg font-semibold">{faq.question}</CardTitle>
                  <span className={`transform transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>▼</span>
                </CardHeader>
                {openFaq === index && (
                  <CardContent className="p-6 pt-0">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Related Links */}
        <section className="text-center mb-16">
            <h3 className="text-2xl font-bold mb-4">Explore More</h3>
            <div className="flex justify-center space-x-4 md:space-x-8">
                <Link href="/rrb/sweet-miracles" className="text-red-500 hover:underline">Sweet Miracles</Link>
                <Link href="/rrb/qumus" className="text-red-500 hover:underline">QUMUS</Link>
                <Link href="/rrb/hybrid-cast" className="text-red-500 hover:underline">HybridCast</Link>
            </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pt-8 border-t border-border">
          <p>&copy; {new Date().getFullYear()} Canryn Production Inc. All Rights Reserved.</p>
          <p>RockinRockinBoogie.com is dedicated to the enduring legacy of Seabrun Candy Hunter.</p>
        </footer>
      </main>
    </div>
  );
}
