import React from 'react';
import { Music, User, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function SeansMusic() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 to-stone-900">
      {/* Header */}
      <section className="py-12 bg-gradient-to-b from-amber-950/20 to-stone-950">
        <div className="container max-w-5xl">
          <Link href="/rrb/family-legacy">
            <a className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Family Legacy
            </a>
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <Music className="w-12 h-12 text-amber-400" />
            <div>
              <h1 className="text-4xl font-bold text-amber-50">Sean's Music</h1>
              <p className="text-amber-300/70">Founded by Seabrun Hunter, Operated by Sean Hunter</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container max-w-5xl">
          {/* Overview */}
          <div className="bg-stone-800/40 rounded-xl p-8 border border-amber-900/30 mb-12">
            <h2 className="text-2xl font-bold text-amber-50 mb-4">Company Overview</h2>
            <p className="text-amber-200/80 leading-relaxed mb-4">
              Sean's Music is a music production and distribution company founded by Seabrun Hunter 
              and currently operated by Sean Hunter. The company focuses on music creation, production, 
              and bringing music to audiences worldwide.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-stone-900/40 rounded-lg p-4">
                <p className="text-amber-300/60 text-sm">Founder</p>
                <p className="text-amber-50 font-semibold">Seabrun Hunter</p>
              </div>
              <div className="bg-stone-900/40 rounded-lg p-4">
                <p className="text-amber-300/60 text-sm">Operator</p>
                <p className="text-amber-50 font-semibold">Sean Hunter</p>
              </div>
              <div className="bg-stone-900/40 rounded-lg p-4">
                <p className="text-amber-300/60 text-sm">Founded</p>
                <p className="text-amber-50 font-semibold">1990s–2000s</p>
              </div>
            </div>
          </div>

          {/* Operator Info */}
          <div className="bg-stone-800/60 rounded-xl p-8 border border-amber-900/30 mb-12">
            <h2 className="text-2xl font-bold text-amber-50 mb-6 flex items-center gap-3">
              <User className="w-6 h-6 text-amber-400" />
              Operator: Sean Hunter
            </h2>
            <p className="text-amber-200/80 leading-relaxed mb-4">
              Sean Hunter leads Sean's Music with a focus on music production, artist development, 
              and bringing quality music to audiences. Born September 17, 1971, Sean carries forward 
              his father Seabrun Hunter's vision of creating generational wealth through music and entertainment.
            </p>
            <div className="bg-stone-900/40 rounded-lg p-6 mt-6">
              <p className="text-amber-300 font-semibold flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" />
                Born September 17, 1971
              </p>
              <p className="text-amber-200/60 text-sm">
                Son of Seabrun Hunter, part of the family business ecosystem
              </p>
            </div>
          </div>

          {/* Services */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-amber-50 mb-6">Services & Focus Areas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Music Production', desc: 'Professional music creation and production' },
                { title: 'Artist Development', desc: 'Supporting and developing music artists' },
                { title: 'Distribution', desc: 'Getting music to audiences worldwide' },
                { title: 'Collaboration', desc: 'Working with creators and producers' },
              ].map((service, idx) => (
                <div key={idx} className="bg-stone-800/40 rounded-lg p-6 border border-amber-900/30">
                  <h3 className="text-lg font-semibold text-amber-300 mb-2">{service.title}</h3>
                  <p className="text-amber-200/60">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Legacy Connection */}
          <div className="bg-gradient-to-r from-amber-950/30 to-stone-900/30 rounded-xl p-8 border border-amber-900/30">
            <h2 className="text-2xl font-bold text-amber-50 mb-4">Part of the Family Legacy</h2>
            <p className="text-amber-200/80 leading-relaxed">
              Sean's Music is one of five companies founded by Seabrun Hunter as part of his vision 
              for generational wealth and family enterprise. Each child operates their own company, 
              building on the foundation their father established. Together, they represent the 
              "Legacy Continued" — the next generation carrying forward Seabrun Hunter's entrepreneurial spirit.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 border-t border-stone-800">
        <div className="container max-w-4xl text-center">
          <p className="text-stone-500 text-xs leading-relaxed">
            Sean's Music was founded by Seabrun Hunter and is currently operated by Sean Hunter.
            This page is part of the Canryn Production family legacy documentation.
            <br /><br />
            © {new Date().getFullYear()} Canryn Production. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
