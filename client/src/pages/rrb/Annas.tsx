import React from 'react';
import { Heart, Users, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function Annas() {
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
            <Heart className="w-12 h-12 text-amber-400" />
            <div>
              <h1 className="text-4xl font-bold text-amber-50">Anna's</h1>
              <p className="text-amber-300/70">Founded by Seabrun Hunter, Operated by Tyanna Battle & LaShanna Russell</p>
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
              Anna's is a community-focused enterprise founded by Seabrun Hunter and currently operated 
              by co-founders Tyanna Battle and LaShanna Russell. The company emphasizes community programs, 
              business growth, family values, and social impact.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-stone-900/40 rounded-lg p-4">
                <p className="text-amber-300/60 text-sm">Founder</p>
                <p className="text-amber-50 font-semibold">Seabrun Hunter</p>
              </div>
              <div className="bg-stone-900/40 rounded-lg p-4">
                <p className="text-amber-300/60 text-sm">Co-Operators</p>
                <p className="text-amber-50 font-semibold text-sm">Tyanna Battle<br/>LaShanna Russell</p>
              </div>
              <div className="bg-stone-900/40 rounded-lg p-4">
                <p className="text-amber-300/60 text-sm">Founded</p>
                <p className="text-amber-50 font-semibold">1974</p>
              </div>
            </div>
          </div>

          {/* Operators Info */}
          <div className="bg-stone-800/60 rounded-xl p-8 border border-amber-900/30 mb-12">
            <h2 className="text-2xl font-bold text-amber-50 mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-amber-400" />
              Co-Operators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-stone-900/40 rounded-lg p-6">
                <p className="text-amber-300 font-semibold mb-2">Tyanna Battle</p>
                <p className="text-amber-200/60 text-sm flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4" />
                  Born March 19, 1974
                </p>
                <p className="text-amber-200/60 text-sm">
                  Co-operator of Anna's, dedicated to community programs and family values
                </p>
              </div>
              <div className="bg-stone-900/40 rounded-lg p-6">
                <p className="text-amber-300 font-semibold mb-2">LaShanna Russell</p>
                <p className="text-amber-200/60 text-sm flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4" />
                  Born March 19, 1974
                </p>
                <p className="text-amber-200/60 text-sm">
                  Co-operator of Anna's, focused on business growth and social impact
                </p>
              </div>
            </div>
          </div>

          {/* Brand Identity */}
          <div className="bg-stone-800/60 rounded-xl p-8 border border-amber-900/30 mb-12">
            <h2 className="text-2xl font-bold text-amber-50 mb-6">Brand Identity</h2>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0">
                <img 
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/jFASyCvWHTSWwwiV.jpeg"
                  alt="Anna's Logo"
                  className="w-48 h-48 object-contain rounded-lg shadow-lg"
                />
              </div>
              <div className="flex-1">
                <p className="text-amber-200/80 leading-relaxed mb-4">
                  Anna's represents the entrepreneurial vision of Seabrun Hunter, operated by Tyanna Battle and LaShanna Russell. 
                  The brand embodies promotion, talent development, and community engagement.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-amber-300/60 text-sm">Connect With Us</p>
                    <div className="flex gap-2 mt-2">
                      <a href="#" className="text-amber-400 hover:text-amber-300">Website</a>
                      <span className="text-amber-900/40">•</span>
                      <a href="#" className="text-amber-400 hover:text-amber-300">Facebook</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connect With */}
          <div className="bg-stone-800/40 rounded-xl p-8 border border-amber-900/30 mb-12">
            <h2 className="text-2xl font-bold text-amber-50 mb-6">Connect With Anna's</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Official Website', placeholder: 'www.annas-company.com' },
                { label: 'Email Contact', placeholder: 'contact@annas-company.com' },
                { label: 'Facebook', placeholder: '@AnnasCompany' },
                { label: 'Instagram', placeholder: '@AnnasCompany' },
                { label: 'YouTube', placeholder: '@AnnasCompany' },
                { label: 'LinkedIn', placeholder: 'annas-company' },
              ].map((social, idx) => (
                <div key={idx} className="bg-stone-900/40 rounded-lg p-4">
                  <p className="text-amber-300 font-semibold text-sm">{social.label}</p>
                  <p className="text-amber-200/40 text-xs mt-1">{social.placeholder}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-amber-50 mb-6">Company Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Community Programs', desc: 'Established and maintained community initiatives' },
                { title: 'Business Growth', desc: 'Sustained expansion and operational excellence' },
                { title: 'Family Values', desc: 'Embodying Seabrun Hunter\'s vision of family enterprise' },
                { title: 'Social Impact', desc: 'Creating positive change in communities served' },
              ].map((achievement, idx) => (
                <div key={idx} className="bg-stone-800/40 rounded-lg p-6 border border-amber-900/30">
                  <h3 className="text-lg font-semibold text-amber-300 mb-2">{achievement.title}</h3>
                  <p className="text-amber-200/60">{achievement.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Legacy Connection */}
          <div className="bg-gradient-to-r from-amber-950/30 to-stone-900/30 rounded-xl p-8 border border-amber-900/30">
            <h2 className="text-2xl font-bold text-amber-50 mb-4">Part of the Family Legacy</h2>
            <p className="text-amber-200/80 leading-relaxed">
              Anna's is one of five companies founded by Seabrun Hunter as part of his vision for 
              generational wealth and family enterprise. Operated by Tyanna Battle and LaShanna Russell, 
              Anna's represents the "Legacy Continued" — the next generation carrying forward Seabrun Hunter's 
              entrepreneurial spirit and commitment to community.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 border-t border-stone-800">
        <div className="container max-w-4xl text-center">
          <p className="text-stone-500 text-xs leading-relaxed">
            Anna's was founded by Seabrun Hunter and is currently operated by Tyanna Battle and LaShanna Russell.
            This page is part of the Canryn Production family legacy documentation.
            <br /><br />
            © {new Date().getFullYear()} Canryn Production. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
