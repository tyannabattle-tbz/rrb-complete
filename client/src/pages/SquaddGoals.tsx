import React, { useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import {
  Globe, Shield, Radio, Wifi, Heart, Users, ArrowRight,
  Zap, MapPin, Calendar, Mail, ExternalLink, ChevronRight
} from 'lucide-react';

export default function SquaddGoals() {
  const [, setLocation] = useLocation();

  const ecosystemSystems = [
    {
      icon: <Zap className="w-8 h-8" />,
      name: 'QUMUS Engine',
      tagline: '90% Autonomous AI Orchestration',
      description: 'The brain of the ecosystem. 12 autonomous policies making real-time decisions with full audit logging and human oversight.',
      color: 'from-purple-600 to-blue-600',
      borderColor: 'border-purple-500/30',
      glowColor: 'shadow-purple-500/20',
    },
    {
      icon: <Radio className="w-8 h-8" />,
      name: 'RRB Radio',
      tagline: '24/7 Broadcasting • Registered BMI',
      description: '40+ channels of live broadcasting through Payten Music. Music, talk, healing frequencies, and community programming.',
      color: 'from-pink-600 to-orange-500',
      borderColor: 'border-pink-500/30',
      glowColor: 'shadow-pink-500/20',
    },
    {
      icon: <Wifi className="w-8 h-8" />,
      name: 'HybridCast',
      tagline: '100% Offline Emergency Communication',
      description: 'Mesh networking ensures communication even without internet. When disaster strikes, our voice does not go silent.',
      color: 'from-red-600 to-yellow-500',
      borderColor: 'border-red-500/30',
      glowColor: 'shadow-red-500/20',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      name: 'Sweet Miracles',
      tagline: '501(c)(3) & 508 Nonprofit Advocacy',
      description: 'Turning technology into community impact. Donations become direct action. Every dollar tracked, every impact measured.',
      color: 'from-green-600 to-emerald-500',
      borderColor: 'border-green-500/30',
      glowColor: 'shadow-green-500/20',
    },
  ];

  const squaddPillars = [
    { letter: 'S', word: 'Sisters', description: 'United in purpose across borders' },
    { letter: 'Q', word: 'Questing', description: 'Actively seeking justice and truth' },
    { letter: 'U', word: 'Unapologetically', description: 'Bold, uncompromising, fearless' },
    { letter: 'A', word: 'After', description: 'Pursuing with relentless determination' },
    { letter: 'D', word: 'Divine', description: 'Guided by higher purpose and calling' },
    { letter: 'D', word: 'Destiny', description: 'Building the future we were meant to create' },
  ];

  const partnerships = [
    {
      name: 'Ghana Partnership',
      event: 'UN NGO CSW70 Parallel Event',
      date: 'March 17, 2026',
      description: 'Connecting the African diaspora through technology and advocacy. Building a global blueprint for elder protection and justice.',
      icon: <Globe className="w-6 h-6" />,
      status: 'Active',
    },
    {
      name: 'Selma Jubilee',
      event: 'Wallace Community College, Room 112',
      date: 'March 7, 2026',
      description: 'From the soil where marchers crossed the Edmund Pettus Bridge. Presenting the ecosystem to the community that started the movement.',
      icon: <MapPin className="w-6 h-6" />,
      status: 'Active',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient beams */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4A843]/5 via-transparent to-[#1A3A5C]/10" />
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#D4A843]/20 to-transparent" />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-[#D4A843]/10 to-transparent" />

        <div className="relative container mx-auto px-4 pt-16 pb-20">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-[#8B1A1A]/20 text-[#D4A843] border-[#D4A843]/30 text-sm px-4 py-1">
              A Voice for the Voiceless
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-[#D4A843] via-[#E8C860] to-[#D4A843] bg-clip-text text-transparent">
                SQUADD GOALS
              </span>
            </h1>

            <p className="text-lg md:text-xl text-[#E8E0D0]/80 mb-2 font-light tracking-wide">
              Sisters Questing Unapologetically After Divine Destiny
            </p>
            <p className="text-base text-[#D4A843] mb-8 font-semibold tracking-widest uppercase">
              To Protect Human Rights
            </p>

            <p className="text-[#E8E0D0]/60 text-base max-w-2xl mx-auto mb-10 leading-relaxed">
              In honor of <span className="text-[#D4A843] font-semibold">Seabrun Candy Hunter</span>, whose legacy was stolen through industry exploitation.
              We built an entire technology ecosystem to ensure no voice is ever silenced again.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={() => setLocation('/donate')}
                className="bg-gradient-to-r from-[#D4A843] to-[#E8C860] text-[#0A0A0A] hover:opacity-90 font-bold px-8 py-3 text-lg"
                size="lg"
              >
                Support the Mission
              </Button>
              <Button
                onClick={() => setLocation('/ecosystem-dashboard')}
                variant="outline"
                className="border-[#D4A843]/50 text-[#D4A843] hover:bg-[#D4A843]/10 px-8 py-3 text-lg"
                size="lg"
              >
                View Live Ecosystem <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SQUADD Acronym Section */}
      <section className="border-t border-[#D4A843]/10 bg-[#0D0D0D]">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {squaddPillars.map((pillar, idx) => (
              <div key={idx} className="text-center p-4">
                <div className="text-4xl md:text-5xl font-bold text-[#D4A843] mb-2">{pillar.letter}</div>
                <div className="text-lg font-semibold text-[#E8E0D0] mb-1">{pillar.word}</div>
                <div className="text-xs text-[#E8E0D0]/50">{pillar.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Mission */}
      <section className="border-t border-[#D4A843]/10">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#D4A843] mb-6">The Mission</h2>
            <p className="text-lg text-[#E8E0D0]/80 leading-relaxed mb-6">
              Sweet Miracles was founded as a 501(c)(3) and 508 organization to bring awareness to
              <span className="text-[#8B1A1A] font-semibold"> elderly abuse, neglect, and exploitation</span>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              <div className="bg-[#8B1A1A]/10 border border-[#8B1A1A]/30 rounded-lg p-6">
                <div className="text-4xl font-bold text-[#8B1A1A] mb-2">1 in 10</div>
                <div className="text-[#E8E0D0]/70">Older Americans are victims of elder abuse</div>
              </div>
              <div className="bg-[#8B1A1A]/10 border border-[#8B1A1A]/30 rounded-lg p-6">
                <div className="text-4xl font-bold text-[#8B1A1A] mb-2">$2B+</div>
                <div className="text-[#E8E0D0]/70">Stolen from the elderly annually</div>
              </div>
            </div>
            <p className="text-[#E8E0D0]/60 mt-8 text-base leading-relaxed">
              The same patterns of silence that robbed Black artists of their work — their music, their publishing,
              their royalties — continue to exploit our elders today. We exist to break that silence.
            </p>
          </div>
        </div>
      </section>

      {/* The Ecosystem */}
      <section className="border-t border-[#D4A843]/10 bg-[#0D0D0D]">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#D4A843] mb-4">The One-of-a-Kind Ecosystem</h2>
            <p className="text-[#E8E0D0]/60 max-w-2xl mx-auto">
              Four systems working as one. Technology built to ensure no voice can ever be silenced again.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {ecosystemSystems.map((system, idx) => (
              <Card
                key={idx}
                className={`bg-[#111111] ${system.borderColor} border hover:${system.glowColor} hover:shadow-lg transition-all`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${system.color} text-white flex-shrink-0`}>
                      {system.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#E8E0D0] mb-1">{system.name}</h3>
                      <p className="text-sm text-[#D4A843] mb-2">{system.tagline}</p>
                      <p className="text-sm text-[#E8E0D0]/60">{system.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-[#D4A843] text-lg font-semibold">
              Canryn Production and Its Subsidiaries
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              {['Little C', "Sean's Music", "Anna's", 'Jaelon Enterprises', 'Payten Music (BMI)'].map((sub) => (
                <Badge key={sub} className="bg-[#1A3A5C]/30 text-[#E8E0D0]/70 border-[#1A3A5C]/50">
                  {sub}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events / Partnerships */}
      <section className="border-t border-[#D4A843]/10">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#D4A843] mb-4">Partnerships & Events</h2>
            <p className="text-[#E8E0D0]/60 max-w-2xl mx-auto">
              From Selma to Ghana to the United Nations — building a global coalition for justice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {partnerships.map((event, idx) => (
              <Card key={idx} className="bg-[#111111] border-[#D4A843]/20 overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${idx === 0 ? 'from-[#D4A843] to-[#1A3A5C]' : 'from-[#8B1A1A] to-[#D4A843]'}`} />
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-[#D4A843]/10 text-[#D4A843]">
                      {event.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#E8E0D0]">{event.name}</h3>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs">
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-[#E8E0D0]/70">
                      <Calendar className="w-4 h-4 text-[#D4A843]" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#E8E0D0]/70">
                      <MapPin className="w-4 h-4 text-[#D4A843]" />
                      {event.event}
                    </div>
                  </div>
                  <p className="text-sm text-[#E8E0D0]/60">{event.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How to Partner */}
      <section className="border-t border-[#D4A843]/10 bg-[#0D0D0D]">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#D4A843] mb-4">Join the Coalition</h2>
            <p className="text-[#E8E0D0]/60 max-w-2xl mx-auto">
              Whether you are an organization, an advocate, or an individual — there is a place for you in this movement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: 'Partner With Us',
                description: 'Organizations and institutions can join the SQUADD Goals coalition to expand the reach of elder protection globally.',
                action: 'Become a Partner',
                icon: <Users className="w-6 h-6" />,
              },
              {
                title: 'Donate',
                description: 'Every dollar goes directly to community impact — elder protection, emergency broadcasting, and advocacy.',
                action: 'Support Now',
                icon: <Heart className="w-6 h-6" />,
                link: '/donate',
              },
              {
                title: 'Spread the Word',
                description: 'Share our mission. Amplify the voices of the voiceless. Use your platform to demand justice.',
                action: 'Share the Mission',
                icon: <Globe className="w-6 h-6" />,
              },
            ].map((item, idx) => (
              <Card key={idx} className="bg-[#111111] border-[#D4A843]/20 hover:border-[#D4A843]/40 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-3 rounded-full bg-[#D4A843]/10 text-[#D4A843] mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#E8E0D0] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#E8E0D0]/60 mb-4">{item.description}</p>
                  <Button
                    onClick={() => item.link ? setLocation(item.link) : window.location.href = 'mailto:sweetmiraclesattt@gmail.com'}
                    className="w-full bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/30 hover:bg-[#D4A843]/20"
                  >
                    {item.action} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Digital War Chest - QR Codes */}
      <section className="border-t border-[#D4A843]/10 bg-gradient-to-b from-[#0A0A0A] to-[#0D0D0D]">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <Badge className="bg-[#D4A843]/10 text-[#D4A843] border-[#D4A843]/30 mb-4">DIGITAL WAR CHEST</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-[#D4A843] mb-4">Scan. Connect. Act.</h2>
            <p className="text-[#E8E0D0]/60 max-w-2xl mx-auto">
              Every SQUADD member is in the Digital Directory. Scan a QR code to access bios, contact info, and coalition resources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Tyanna RaaShawn Battle',
                role: 'Founder, Sweet Miracles',
                focus: 'Elder Protection & Technology',
                email: 'sweetmiraclesattt@gmail.com',
                qrUrl: 'https://manuweb.sbs/squadd',
              },
              {
                name: 'Karen Jones',
                role: 'CEO/Founder, WHOM IT CONCERNS, INC.',
                focus: 'Agriculture & Environmental Justice',
                email: 'whomitconcerns@outlook.com',
                qrUrl: 'mailto:whomitconcerns@outlook.com',
              },
              {
                name: 'Furlesia "Freedom" Bell',
                role: 'REALTOR, Our Town Realty',
                focus: 'Community Development',
                email: 'furlesiabell@icloud.com',
                qrUrl: 'mailto:furlesiabell@icloud.com',
              },
              {
                name: 'Sherrette "Lady Freedom" Spicer',
                role: 'Virtual Broadcast Anchor',
                focus: 'Media & Communications',
                email: '',
                qrUrl: 'https://manuweb.sbs/live',
              },
              {
                name: 'LaShanna',
                role: 'Coalition Member',
                focus: 'Community Advocacy',
                email: '',
                qrUrl: 'https://manuweb.sbs/squadd',
              },
              {
                name: 'Full Digital Directory',
                role: 'All SQUADD Members',
                focus: 'Complete Coalition Roster',
                email: 'sweetmiraclesattt@gmail.com',
                qrUrl: 'https://manuweb.sbs/squadd',
              },
            ].map((member, idx) => (
              <Card key={idx} className="bg-[#111111] border-[#D4A843]/20 hover:border-[#D4A843]/40 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-20 h-20 bg-white border border-[#D4A843]/30 rounded-lg flex items-center justify-center p-1">
                      <QRCodeSVG
                        value={member.qrUrl}
                        size={72}
                        bgColor="#ffffff"
                        fgColor="#0A0A0A"
                        level="M"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-[#E8E0D0] mb-1">{member.name}</h3>
                      <p className="text-xs text-[#D4A843] mb-1">{member.role}</p>
                      <p className="text-xs text-[#E8E0D0]/50 mb-2">{member.focus}</p>
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="text-xs text-[#D4A843]/70 hover:text-[#D4A843] transition-colors flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {member.email}
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8 space-y-4">
            <p className="text-sm text-[#E8E0D0]/40">
              QR codes link to the Digital Directory. Print these for the workshop handout.
            </p>
            <button
              onClick={() => {
                const printSection = document.getElementById('print-qr-section');
                if (printSection) {
                  printSection.style.display = 'block';
                  window.print();
                  setTimeout(() => { printSection.style.display = 'none'; }, 500);
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A843] text-[#0A0A0A] font-bold rounded-lg hover:bg-[#E8C860] transition-colors text-sm"
            >
              🖨️ Print QR Codes for Workshop
            </button>
          </div>

          {/* Print-optimized QR section (hidden on screen, shown when printing) */}
          <div id="print-qr-section" className="hidden print:block">
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                body * { visibility: hidden !important; }
                #print-qr-section, #print-qr-section * { visibility: visible !important; }
                #print-qr-section {
                  position: fixed !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  display: block !important;
                  background: white !important;
                  padding: 20px !important;
                }
                .print-qr-card {
                  page-break-inside: avoid !important;
                  border: 2px solid #333 !important;
                  padding: 16px !important;
                  margin: 8px !important;
                  background: white !important;
                }
              }
            `}} />
            <div style={{ background: 'white', padding: '24px', color: '#000' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px', color: '#000' }}>
                SQUADD Goals — Digital War Chest
              </h1>
              <p style={{ textAlign: 'center', fontSize: '14px', marginBottom: '24px', color: '#555' }}>
                GRITS & GREENS — Selma Jubilee 2026 | Saturday, March 7 | Wallace Community College
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                  { name: 'Tyanna RaaShawn Battle', role: 'Founder, Sweet Miracles', focus: 'Elder Protection & Technology', email: 'sweetmiraclesattt@gmail.com', qrUrl: 'https://manuweb.sbs/squadd' },
                  { name: 'Karen Jones', role: 'CEO, WHOM IT CONCERNS, INC.', focus: 'Agriculture & Environmental Justice', email: 'whomitconcerns@outlook.com', qrUrl: 'mailto:whomitconcerns@outlook.com' },
                  { name: 'Furlesia "Freedom" Bell', role: 'REALTOR, Our Town Realty', focus: 'Community Development', email: 'furlesiabell@icloud.com', qrUrl: 'mailto:furlesiabell@icloud.com' },
                  { name: 'Sherrette "Lady Freedom" Spicer', role: 'Virtual Broadcast Anchor', focus: 'Media & Communications', email: '', qrUrl: 'https://manuweb.sbs/live' },
                  { name: 'LaShanna', role: 'Coalition Member', focus: 'Community Advocacy', email: '', qrUrl: 'https://manuweb.sbs/squadd' },
                  { name: 'Full Digital Directory', role: 'All SQUADD Members', focus: 'Complete Coalition Roster', email: 'sweetmiraclesattt@gmail.com', qrUrl: 'https://manuweb.sbs/squadd' },
                ].map((m, i) => (
                  <div key={i} className="print-qr-card" style={{ textAlign: 'center', background: 'white', border: '2px solid #333', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                      <QRCodeSVG value={m.qrUrl} size={120} bgColor="#ffffff" fgColor="#000000" level="H" />
                    </div>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '2px' }}>{m.name}</h3>
                    <p style={{ fontSize: '11px', color: '#555', marginBottom: '2px' }}>{m.role}</p>
                    <p style={{ fontSize: '10px', color: '#888' }}>{m.focus}</p>
                    {m.email && <p style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>{m.email}</p>}
                  </div>
                ))}
              </div>
              <p style={{ textAlign: 'center', fontSize: '11px', color: '#888', marginTop: '16px' }}>
                Sweet Miracles 501(c)(3) & 508 | Canryn Production | In Honor of Seabrun Candy Hunter | manuweb.sbs/squadd
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact / Footer */}
      <section className="border-t border-[#D4A843]/10">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-5xl mb-6 text-[#D4A843]">
              <Shield className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#D4A843] mb-4">
              "A Voice for the Voiceless"
            </h2>
            <p className="text-[#E8E0D0]/60 mb-6">
              In Honor of Seabrun Candy Hunter
            </p>
            <div className="flex items-center justify-center gap-2 text-[#E8E0D0]/70 mb-8">
              <Mail className="w-4 h-4 text-[#D4A843]" />
              <a href="mailto:sweetmiraclesattt@gmail.com" className="hover:text-[#D4A843] transition-colors">
                sweetmiraclesattt@gmail.com
              </a>
            </div>
            <p className="text-sm text-[#E8E0D0]/40">
              Sweet Miracles 501(c)(3) & 508 | Canryn Production and Its Subsidiaries
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
