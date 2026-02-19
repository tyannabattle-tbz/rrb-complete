import React from 'react';
import { Zap, User, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function JaelonEnterprises() {
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
            <Zap className="w-12 h-12 text-amber-400" />
            <div>
              <h1 className="text-4xl font-bold text-amber-50">Jaelon Enterprises</h1>
              <p className="text-amber-300/70">Founded by Seabrun Hunter, Operated by Jaelon Hunter</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container max-w-5xl">
          {/* Brand Identity */}
          <div className="bg-stone-800/60 rounded-xl p-8 border border-amber-900/30 mb-12">
            <h2 className="text-2xl font-bold text-amber-50 mb-6">Brand Identity</h2>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0">
                <img 
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/pGLKqPjLKzLwxLvQ.jpeg"
                  alt="Jaelon Enterprises Logo"
                  className="w-48 h-48 object-contain rounded-lg shadow-lg"
                />
              </div>
              <div className="flex-1">
                <p className="text-amber-200/80 leading-relaxed mb-4">
                  Jaelon Enterprises represents the innovation and forward-thinking vision of Seabrun Hunter, operated by Jaelon Hunter. 
                  The brand embodies market expansion, strategic partnerships, and business excellence.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-amber-300/60 text-sm">Connect With Us</p>
                    <div className="flex gap-2 mt-2">
                      <a href="#" className="text-amber-400 hover:text-amber-300">Website</a>
                      <span className="text-amber-900/40">•</span>
                      <a href="#" className="text-amber-400 hover:text-amber-300">LinkedIn</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="bg-stone-800/40 rounded-xl p-8 border border-amber-900/30 mb-12">
            <h2 className="text-2xl font-bold text-amber-50 mb-4">Company Overview</h2>
            <p className="text-amber-200/80 leading-relaxed mb-4">
              Jaelon Enterprises is an innovation-driven company founded by Seabrun Hunter and currently 
              operated by Jaelon Hunter. The company focuses on market expansion, strategic partnerships, 
              and forward-thinking business solutions.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-stone-900/40 rounded-lg p-4">
                <p className="text-amber-300/60 text-sm">Founder</p>
                <p className="text-amber-50 font-semibold">Seabrun Hunter</p>
              </div>
              <div className="bg-stone-900/40 rounded-lg p-4">
                <p className="text-amber-300/60 text-sm">Operator</p>
                <p className="text-amber-50 font-semibold">Jaelon Hunter</p>
              </div>
              <div className="bg-stone-900/40 rounded-lg p-4">
                <p className="text-amber-300/60 text-sm">Founded</p>
                <p className="text-amber-50 font-semibold">1982</p>
              </div>
            </div>
          </div>

          {/* Operator Info */}
          <div className="bg-stone-800/60 rounded-xl p-8 border border-amber-900/30 mb-12">
            <h2 className="text-2xl font-bold text-amber-50 mb-6 flex items-center gap-3">
              <User className="w-6 h-6 text-amber-400" />
              Operator: Jaelon Hunter
            </h2>
            <p className="text-amber-200/80 leading-relaxed mb-4">
              Jaelon Hunter leads Jaelon Enterprises with a focus on innovation, market expansion, 
              and strategic growth. Born June 7, 1982, Jaelon carries forward his father Seabrun Hunter's 
              vision of creating generational wealth through strategic business development.
            </p>
            <div className="bg-stone-900/40 rounded-lg p-6 mt-6">
              <p className="text-amber-300 font-semibold flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" />
                Born June 7, 1982
              </p>
              <p className="text-amber-200/60 text-sm">
                Son of Seabrun Hunter, part of the family business ecosystem
              </p>
            </div>
          </div>

          {/* Brand Identity */}
          <div className="bg-stone-800/40 rounded-xl p-8 border border-amber-900/30 mb-12">
            <h2 className="text-2xl font-bold text-amber-50 mb-6">Brand Identity</h2>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-48 h-48 rounded-lg bg-stone-900/40 border-2 border-dashed border-amber-500/30">
                <div className="text-center">
                  <p className="text-4xl">⚡</p>
                  <p className="text-amber-300/60 text-sm mt-2">Logo Placeholder</p>
                </div>
              </div>
            </div>
            <p className="text-amber-200/80 mb-4">
              Upload Jaelon Enterprises company logo here. Guidelines below.
            </p>
            <div className="bg-stone-900/40 rounded-lg p-6">
              <h3 className="text-amber-300 font-semibold mb-3">Logo Guidelines</h3>
              <ul className="text-amber-200/60 text-sm space-y-2">
                <li>• Format: PNG or SVG</li>
                <li>• Minimum dimensions: 400x400px</li>
                <li>• Recommended: Square or circular format</li>
                <li>• Use cases: Website header, social media, print materials</li>
              </ul>
            </div>
          </div>

          {/* Connect With */}
          <div className="bg-stone-800/40 rounded-xl p-8 border border-amber-900/30 mb-12">
            <h2 className="text-2xl font-bold text-amber-50 mb-6">Connect With Jaelon Enterprises</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Official Website', placeholder: 'www.jaelon-enterprises.com' },
                { label: 'Email Contact', placeholder: 'contact@jaelon-enterprises.com' },
                { label: 'Facebook', placeholder: '@JaelonEnterprises' },
                { label: 'Instagram', placeholder: '@JaelonEnterprises' },
                { label: 'YouTube', placeholder: '@JaelonEnterprises' },
                { label: 'LinkedIn', placeholder: 'jaelon-enterprises' },
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
                { title: 'Innovation Leadership', desc: 'Pioneering new approaches and technologies' },
                { title: 'Market Expansion', desc: 'Strategic growth into new markets and sectors' },
                { title: 'Strategic Partnerships', desc: 'Building strong alliances and collaborations' },
                { title: 'Future Vision', desc: 'Positioning for sustained long-term growth' },
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
              Jaelon Enterprises is one of five companies founded by Seabrun Hunter as part of his vision 
              for generational wealth and family enterprise. Operated by Jaelon Hunter, Jaelon Enterprises 
              represents the "Legacy Continued" — the next generation carrying forward Seabrun Hunter's 
              entrepreneurial spirit and commitment to innovation.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 border-t border-stone-800">
        <div className="container max-w-4xl text-center">
          <p className="text-stone-500 text-xs leading-relaxed">
            Jaelon Enterprises was founded by Seabrun Hunter and is currently operated by Jaelon Hunter.
            This page is part of the Canryn Production family legacy documentation.
            <br /><br />
            © {new Date().getFullYear()} Canryn Production. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
