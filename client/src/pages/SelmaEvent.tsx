import React from 'react';
import { useLocation } from 'wouter';
import { Calendar, MapPin, Clock, Users, ArrowRight, Mic2, Earth, Shield, Leaf, Scale, Heart, Radio, Wifi, Gift, ChevronRight, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SelmaEvent() {
  const [, setLocation] = useLocation();

  const runOfShow = [
    { time: '10:00 AM – 10:05 AM', title: 'Virtual Open', speaker: 'Sherrette "Lady Freedom" Spicer', description: 'Anchoring the live broadcast via Zoom/Facebook Live, setting the energy.' },
    { time: '10:05 AM – 10:25 AM', title: 'The GRITS & Greens Briefing', speaker: 'Karen Jones', description: 'A tight 20-minute masterclass connecting the Data Center water drain, predatory SLWA pipe insurance letters, and the immediate need for Spring Garden planning and PSC Oversight.' },
    { time: '10:25 AM – 10:30 AM', title: 'Passing the Baton', speaker: 'Karen Jones', description: 'Framing our "Grit to Collective Sovereignty" vision and introducing the SQUADD as the frontline experts.' },
    { time: '10:30 AM – 11:15 AM', title: 'SQUADD "Grit Pitches"', speaker: '7 SQUADD Members', description: 'Each panelist takes the floor with a HARD 6-minute maximum pitch. 1-minute warning, hard stop at 6 minutes.' },
    { time: '11:15 AM – 11:45 AM', title: 'Interactive Community Teach-Out / Q&A', speaker: 'SQUADD Panel', description: 'SQUADD leads the discussion on solutions, fielding questions from in-person and virtual attendees.' },
    { time: '11:45 AM – 12:00 PM', title: 'Call to Action & Wrap Up', speaker: 'Karen Jones', description: 'Focus on the Digital War Chest, PSC voting, and closing the workshop.' },
  ];

  const pitchStructure = [
    { part: 1, title: 'WHO I AM', time: '1 Minute', description: 'Your name, role, organization, and advocacy focus. Who are you and why does your voice matter?' },
    { part: 2, title: 'MY INDIVIDUAL GRIT: THE TOOL', time: '2 Minutes', description: 'The specific problem you solve. Your professional skills in action. Your local/statewide impact.' },
    { part: 3, title: 'OUR COLLECTIVE GRIT: THE INTERSECTION', time: '2 Minutes', description: 'How your work intersects with the coalition. Turning individual grit into collective green.' },
    { part: 4, title: 'HOW TO REACH ME', time: '1 Minute', description: 'Connect after the workshop. Find your bio in the Digital War Chest. Scan the QR code.' },
  ];

  const intersections = [
    { icon: Leaf, label: 'Agriculture', desc: 'Food sovereignty and land rights' },
    { icon: Scale, label: 'Law Advocacy', desc: 'Legal reform and justice' },
    { icon: Heart, label: 'Elder Protection', desc: 'Confronting elder abuse' },
    { icon: Shield, label: 'Disability Rights', desc: 'Accessibility and inclusion' },
    { icon: Users, label: 'Murder Victims\' Families', desc: 'Truth and accountability' },
    { icon: Earth, label: 'Environmental Justice', desc: 'Water, soil, legacy protection' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8E0D0]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B1A1A]/30 via-[#0A0A0A] to-[#1A3A5C]/20" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8B1A1A] via-[#D4A843] to-[#8B1A1A]" />
        
        <div className="relative container mx-auto px-4 pt-20 pb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-[#8B1A1A]/30 border border-[#8B1A1A]/50 rounded-full text-xs font-bold text-[#D4A843] tracking-wider uppercase">
              Live Event — 2 Days Away
            </span>
            <span className="px-3 py-1 bg-[#D4A843]/10 border border-[#D4A843]/30 rounded-full text-xs text-[#D4A843]">
              90 Seats
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
            <span className="text-[#D4A843]">GRITS</span>
            <span className="text-[#E8E0D0]/40"> & </span>
            <span className="text-[#8B1A1A]">GREENS</span>
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-light text-[#E8E0D0]/70 mb-2">
            The SELMA JUBILEE 2026 Workshop
          </h2>
          
          <p className="text-lg text-[#D4A843]/80 italic mb-8">
            "Turning Individual Grit into Collective Green"
          </p>

          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center gap-2 text-[#E8E0D0]/70">
              <Calendar className="w-5 h-5 text-[#D4A843]" />
              <span className="font-semibold">Saturday, March 7, 2026</span>
            </div>
            <div className="flex items-center gap-2 text-[#E8E0D0]/70">
              <Clock className="w-5 h-5 text-[#D4A843]" />
              <span>10:00 AM – 12:00 PM CST</span>
            </div>
            <div className="flex items-center gap-2 text-[#E8E0D0]/70">
              <MapPin className="w-5 h-5 text-[#D4A843]" />
              <span>Wallace Community College, Room 112</span>
            </div>
          </div>

          <p className="text-lg text-[#E8E0D0]/60 max-w-3xl mb-8">
            When we take the stage, we operate as one powerful, unified force. The "Utility Hustle" thrives on making us believe our fights are separate — but we know they are interconnected. This is where agriculture, law advocacy, disability rights, families of murder victims, and elder protection converge into one unstoppable movement.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button 
              className="bg-[#D4A843] text-[#0A0A0A] hover:bg-[#E8C860] font-bold px-8 py-3 text-lg"
              onClick={() => setLocation('/squadd')}
            >
              View SQUADD Goals <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              className="border-[#D4A843]/50 text-[#D4A843] hover:bg-[#D4A843]/10 px-8 py-3 text-lg"
              onClick={() => setLocation('/live')}
            >
              <Radio className="w-5 h-5 mr-2" /> Watch Live Stream
            </Button>
            <Button 
              variant="outline" 
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 px-8 py-3 text-lg"
              onClick={() => setLocation('/flyer')}
            >
              <Share2 className="w-5 h-5 mr-2" /> Interactive Flyer
            </Button>
          </div>
        </div>
      </div>

      {/* Run of Show */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-6 h-6 text-[#D4A843]" />
          <h2 className="text-3xl font-bold text-[#D4A843]">Run of Show</h2>
        </div>
        <p className="text-[#E8E0D0]/50 mb-8">2-hour event — moving with precision for maximum impact</p>

        <div className="space-y-4">
          {runOfShow.map((item, i) => (
            <div key={i} className="flex gap-4 p-5 bg-[#1A1A2E]/50 border border-[#D4A843]/10 rounded-lg hover:border-[#D4A843]/30 transition-colors">
              <div className="flex-shrink-0 w-48">
                <span className="text-sm font-mono text-[#D4A843] font-bold">{item.time}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#E8E0D0] mb-1">{item.title}</h3>
                <p className="text-sm text-[#D4A843]/70 mb-2">{item.speaker}</p>
                <p className="text-sm text-[#E8E0D0]/50">{item.description}</p>
              </div>
              {item.title.includes('Grit Pitches') && (
                <div className="flex-shrink-0 flex items-center">
                  <span className="px-3 py-1 bg-[#8B1A1A]/30 border border-[#8B1A1A]/50 rounded-full text-xs font-bold text-[#8B1A1A]">
                    6 MIN HARD LIMIT
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* The 6-Minute Pitch Structure */}
      <div className="bg-[#1A1A2E]/30 border-y border-[#D4A843]/10">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center gap-3 mb-2">
            <Mic2 className="w-6 h-6 text-[#D4A843]" />
            <h2 className="text-3xl font-bold text-[#D4A843]">The 6-Minute Pitch</h2>
          </div>
          <p className="text-[#E8E0D0]/50 mb-8">Every SQUADD member follows this 4-part structure — no exceptions</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pitchStructure.map((item) => (
              <div key={item.part} className="relative p-6 bg-[#0A0A0A]/60 border border-[#D4A843]/20 rounded-lg">
                <div className="absolute -top-3 -left-1 w-8 h-8 bg-[#D4A843] rounded-full flex items-center justify-center text-[#0A0A0A] font-black text-sm">
                  {item.part}
                </div>
                <h3 className="text-lg font-bold text-[#E8E0D0] mt-2 mb-1">{item.title}</h3>
                <span className="inline-block px-2 py-0.5 bg-[#D4A843]/10 text-[#D4A843] text-xs font-mono rounded mb-3">
                  {item.time}
                </span>
                <p className="text-sm text-[#E8E0D0]/50">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The Intersections */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-[#D4A843] mb-2">Our Collective Grit: The Intersections</h2>
        <p className="text-[#E8E0D0]/50 mb-8">
          Black women of the Rising South are a global force. Our intersectionality is what creates our power.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {intersections.map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-[#1A1A2E]/40 border border-[#D4A843]/10 rounded-lg">
              <item.icon className="w-8 h-8 text-[#D4A843] flex-shrink-0" />
              <div>
                <h3 className="font-bold text-[#E8E0D0] text-sm">{item.label}</h3>
                <p className="text-xs text-[#E8E0D0]/40">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Ecosystem */}
      <div className="bg-gradient-to-r from-[#1A1A2E]/60 to-[#0A0A0A] border-y border-[#D4A843]/10">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-[#D4A843] mb-2">The Technology Behind the Movement</h2>
          <p className="text-[#E8E0D0]/50 mb-8">
            Sweet Miracles and Canryn Production built an entire ecosystem to ensure no voice is ever silenced again.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '🧠', name: 'Qu-Mus Engine', desc: 'AI brain making 90% of decisions autonomously. 14 policies. Full audit trail.' },
              { icon: '📻', name: 'RRB Radio', desc: '40+ channels broadcasting 24/7. Healing frequencies. Community voices.' },
              { icon: '🚨', name: 'HybridCast', desc: '100% offline emergency broadcast. Mesh networking. No internet required.' },
              { icon: '💝', name: 'Sweet Miracles', desc: 'Nonprofit tracking every donation and impact metric in real-time.' },
            ].map((sys, i) => (
              <div key={i} className="p-5 bg-[#0A0A0A]/60 border border-[#D4A843]/15 rounded-lg">
                <span className="text-3xl mb-3 block">{sys.icon}</span>
                <h3 className="font-bold text-[#E8E0D0] mb-2">{sys.name}</h3>
                <p className="text-sm text-[#E8E0D0]/50">{sys.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Connection */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <Earth className="w-12 h-12 text-[#D4A843] mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-[#D4A843] mb-4">From Selma to the United Nations</h2>
          <p className="text-lg text-[#E8E0D0]/60 mb-6">
            This workshop prepares us for our UN virtual parallel event on <strong className="text-[#D4A843]">March 17, 2026</strong>, 
            where we will show the world that Black women of the Rising South are a global force to be reckoned with. 
            What starts in Room 112 at Wallace Community College echoes through the halls of the United Nations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              className="bg-[#D4A843] text-[#0A0A0A] hover:bg-[#E8C860] font-bold"
              onClick={() => setLocation('/squadd')}
            >
              Join the Coalition <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button 
              variant="outline" 
              className="border-[#D4A843]/50 text-[#D4A843] hover:bg-[#D4A843]/10"
              onClick={() => setLocation('/live')}
            >
              <Wifi className="w-4 h-4 mr-2" /> Virtual Attendance
            </Button>
            <Button 
              variant="outline" 
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
              onClick={() => setLocation('/flyer')}
            >
              <Share2 className="w-4 h-4 mr-2" /> Share Flyer
            </Button>
          </div>
        </div>
      </div>

      {/* Organizer */}
      <div className="border-t border-[#D4A843]/10 bg-[#1A1A2E]/20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm text-[#E8E0D0]/40 mb-2">Organized by</p>
            <h3 className="text-xl font-bold text-[#D4A843] mb-1">Karen Jones</h3>
            <p className="text-sm text-[#E8E0D0]/50 mb-1">Founder/CEO — WHOM IT CONCERNS, INC.</p>
            <p className="text-xs text-[#E8E0D0]/30 italic">"Helping Others, Help Themselves"</p>
            <p className="text-xs text-[#E8E0D0]/40 mt-4">
              In Solidarity & Power
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
