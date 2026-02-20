
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { Users, Building, Music, Code, Handshake, Rss, ShieldCheck } from 'lucide-react';

const EmployeeDirectory = () => {
  const departments = [
    {
      id: 'executive',
      name: 'Executive Leadership',
      icon: Building,
      overview: 'Guiding the strategic vision of Canryn Production Inc., the executive team honors the legacy of Seabrun Candy Hunter by steering the company towards innovative and impactful endeavors in music, technology, and community outreach.',
      roles: [
        { title: 'Chief Executive Officer', description: 'Oversees all operations, ensuring alignment with our core mission to restore and celebrate Seabrun Candy Hunter\'s legacy.' },
        { title: 'Head of Legacy Preservation', description: 'Leads initiatives focused on the historical accuracy and ethical representation of Seabrun Candy Hunter\'s work and life.' },
      ],
    },
    {
      id: 'music-production',
      name: 'Music Production',
      icon: Music,
      overview: 'The heart of our creative output, this department manages all aspects of music creation, from composition to final production, heavily augmented by our QUMUS autonomous orchestration system.',
      roles: [
        { title: 'Lead Music Archivist', description: 'Manages the restoration and cataloging of Seabrun Candy Hunter\'s original compositions.' },
        { title: 'QUMUS Operations Supervisor', description: 'Interfaces with the QUMUS system, guiding its creative parameters and overseeing autonomous music generation.' },
      ],
    },
    {
      id: 'technology',
      name: 'Technology',
      icon: Code,
      overview: 'The innovation engine of Canryn Production. This team develops and maintains our proprietary technologies, including the QUMUS orchestration platform and the HybridCast emergency broadcast network.',
      roles: [
        { title: 'Lead Systems Architect (QUMUS)', description: 'Designs and refines the core architecture of the QUMUS autonomous orchestration platform.' },
        { title: 'HybridCast Network Engineer', description: 'Ensures the reliability and readiness of the HybridCast emergency broadcast infrastructure.' },
      ],
    },
    {
      id: 'community-outreach',
      name: 'Community Outreach',
      icon: Handshake,
      overview: 'Our connection to the community, Sweet Miracles, is managed by this team. They lead programs that use the power of music and art to inspire and support underserved communities.',
      roles: [
        { title: 'Director of Sweet Miracles', description: 'Leads the planning and execution of all community-focused programs and initiatives.' },
        { title: 'Community Program Coordinator', description: 'Organizes events, workshops, and partnerships to extend our outreach efforts.' },
      ],
    },
    {
      id: 'broadcasting',
      name: 'Broadcasting',
      icon: Rss,
      overview: 'This department manages the HybridCast system, a vital public service for emergency broadcasting, ensuring critical information is delivered when it matters most.',
      roles: [
        { title: 'Broadcast Operations Manager', description: 'Oversees the operational readiness of the HybridCast network for public and emergency use.' },
      ],
    },
    {
      id: 'administration',
      name: 'Administration',
      icon: ShieldCheck,
      overview: 'The backbone of our organization, providing essential support in finance, legal, and human resources to ensure smooth and compliant operations.',
      roles: [
        { title: 'Legal Counsel', description: 'Manages intellectual property, contracts, and ensures all operations adhere to legal standards.' },
        { title: 'Financial Controller', description: 'Oversees the financial health and sustainability of Canryn Production Inc.' },
      ],
    },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="py-12 md:py-20 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <Users className="mx-auto h-12 w-12 text-amber-500" />
          <h1 className="text-4xl md:text-5xl font-bold mt-4">Employee Directory</h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-2 max-w-3xl mx-auto">
            Meet the dedicated team at Canryn Production Inc. working to honor a legacy and build the future.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-16">
        <Card className="mb-12 bg-card border-border">
          <CardHeader>
            <CardTitle>A Note on Our Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              At Canryn Production Inc., we leverage cutting-edge technology to achieve our mission. Our proprietary QUMUS system, an autonomous orchestration platform, handles approximately 90% of our operational tasks, particularly in music production and data management. This allows our human team to focus on strategic oversight, creative direction, and meaningful community engagement.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="executive" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 bg-card border-border">
            {departments.map((dept) => (
              <TabsTrigger key={dept.id} value={dept.id}>{dept.name}</TabsTrigger>
            ))}
          </TabsList>

          {departments.map((dept) => (
            <TabsContent key={dept.id} value={dept.id} className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <dept.icon className="h-8 w-8 text-amber-500" />
                    <div>
                      <CardTitle className="text-2xl">{dept.name}</CardTitle>
                      <CardDescription className="mt-1">{dept.overview}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {dept.roles.map((role, index) => (
                      <div key={`employee-${index}`} className="border-t border-border pt-4">
                        <h4 className="font-semibold text-lg">{role.title}</h4>
                        <p className="text-muted-foreground mt-1">{role.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <section className="mt-16 text-center">
          <h2 className="text-2xl font-bold">Explore Our Work</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Link href="/rrb/qumus/monitoring" className="text-amber-500 hover:underline">QUMUS Platform</Link>
            <a href="https://sweetmiraclesattt.wixsite.com/sweet-miracles" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">Sweet Miracles Outreach</a>
            <Link href="/rrb/hybridcast" className="text-amber-500 hover:underline">HybridCast Network</Link>
          </div>
        </section>
      </main>

      <footer className="py-6 border-t border-border mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Canryn Production Inc. All Rights Reserved.</p>
          <p className="text-sm mt-1">Dedicated to the enduring legacy of Seabrun Candy Hunter.</p>
        </div>
      </footer>
    </div>
  );
};

export default EmployeeDirectory;
