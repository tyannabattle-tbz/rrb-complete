import React, { useState } from 'react';
import { Calendar, Building2, Users, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

export default function FamilyLegacy() {
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  const children = [
    {
      id: 'carlos',
      name: 'Carlos Kembrel',
      birthDate: 'March 24, 1970',
      company: 'Little C',
      role: 'Founder & Operator',
      description: 'Founded by Seabrun Hunter, operated by Carlos Kembrel',
    },
    {
      id: 'sean',
      name: 'Sean Hunter',
      birthDate: 'September 17, 1971',
      company: "Sean's Music",
      role: 'Founder & Operator',
      description: 'Founded by Seabrun Hunter, operated by Sean Hunter',
      link: '/rrb/seans-music',
    },
    {
      id: 'tyanna-lashanna',
      name: 'Tyanna Battle & LaShanna Russell',
      birthDate: 'March 19, 1974',
      company: "Anna's",
      role: 'Founders & Operators',
      description: "Founded by Seabrun Hunter, operated by Tyanna Battle and LaShanna Russell",
      link: '/rrb/annas',
    },
    {
      id: 'jaelon',
      name: 'Jaelon Hunter',
      birthDate: 'June 7, 1982',
      company: 'Jaelon Enterprises',
      role: 'Founder & Operator',
      description: 'Founded by Seabrun Hunter, operated by Jaelon Hunter',
      link: '/rrb/jaelon-enterprises',
    },
  ];

  const timelineEvents = [
    { year: '1970', event: 'Carlos Kembrel born', type: 'birth' },
    { year: '1971', event: 'Sean Hunter born', type: 'birth' },
    { year: '1974', event: 'Tyanna Battle & LaShanna Russell born', type: 'birth' },
    { year: '1982', event: 'Jaelon Hunter born', type: 'birth' },
    { year: '1990s–2000s', event: 'Seabrun Hunter founds family companies', type: 'company' },
    { year: 'Present', event: 'Children operate respective companies', type: 'operation' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 to-stone-900">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-amber-950/20 to-stone-950">
        <div className="container max-w-5xl">
          <h1 className="text-5xl font-bold text-amber-50 mb-4">Family Legacy</h1>
          <p className="text-xl text-amber-200/70">
            Seabrun Hunter's vision: building generational wealth through family enterprises
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16">
        <div className="container max-w-5xl">
          <div className="bg-stone-800/40 rounded-xl p-8 border border-amber-900/30 mb-12">
            <h2 className="text-3xl font-bold text-amber-50 mb-4">The Foundation</h2>
            <p className="text-amber-200/80 leading-relaxed mb-4">
              Seabrun Hunter established a family business ecosystem designed to create lasting generational wealth. 
              Each child operates their own company, built on the foundation and vision their father created.
            </p>
            <p className="text-amber-200/60 text-sm italic">
              <strong>Attribution:</strong> All companies were founded by Seabrun Hunter. 
              Children are the current operators and leaders of their respective enterprises.
            </p>
          </div>

          {/* Children Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {children.map((child, idx) => (
              <div
                key={child.id}
                className="bg-stone-800/60 rounded-xl p-6 border border-amber-900/30 hover:border-amber-500/50 transition-all cursor-pointer"
                onClick={() => setSelectedChild(child.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-amber-50">{child.name}</h3>
                    <p className="text-amber-300/70 text-sm flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      Born {child.birthDate}
                    </p>
                  </div>
                </div>

                <div className="bg-stone-900/40 rounded-lg p-4 mb-4">
                  <p className="text-amber-300 font-semibold flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    {child.company}
                  </p>
                  <p className="text-amber-200/60 text-sm mt-2">{child.description}</p>
                </div>

                {child.link && (
                  <Link href={child.link}>
                    <a className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors">
                      View Details <ArrowRight className="w-4 h-4" />
                    </a>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-amber-50 mb-8">Timeline</h2>
            <div className="space-y-6">
              {timelineEvents.map((event, idx) => (
                <div key={`item-${idx}`} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-amber-300"></div>
                    {idx < timelineEvents.length - 1 && (
                      <div className="w-1 h-12 bg-gradient-to-b from-amber-500/50 to-amber-900/20 mt-2"></div>
                    )}
                  </div>
                  <div className="pb-6">
                    <p className="text-amber-300 font-semibold">{event.year}</p>
                    <p className="text-amber-100/80">{event.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Family Stats */}
          <div className="bg-stone-800/40 rounded-xl p-8 border border-amber-900/30">
            <h2 className="text-2xl font-bold text-amber-50 mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-amber-400" />
              Family Structure
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-amber-300/60 text-sm">Children</p>
                <p className="text-3xl font-bold text-amber-50">5</p>
              </div>
              <div>
                <p className="text-amber-300/60 text-sm">Companies Founded</p>
                <p className="text-3xl font-bold text-amber-50">5</p>
              </div>
              <div>
                <p className="text-amber-300/60 text-sm">Active Operators</p>
                <p className="text-3xl font-bold text-amber-50">5</p>
              </div>
              <div>
                <p className="text-amber-300/60 text-sm">Legacy Status</p>
                <p className="text-3xl font-bold text-amber-50">Active</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 border-t border-stone-800">
        <div className="container max-w-4xl text-center">
          <p className="text-stone-500 text-xs leading-relaxed">
            This page documents the family legacy and business structure established by Seabrun Hunter.
            All companies were founded by Seabrun Hunter; children are the current operators and leaders.
            <br /><br />
            © {new Date().getFullYear()} Canryn Production. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
