import React from 'react';
import { ShieldCheck, Globe } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Content */}
          <div>
            <div className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5 mb-6">
              <span className="text-gold-500 text-sm font-bold uppercase tracking-wider">Our Mission</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
              Redefining Wealth Management for the <span className="text-gold-500">Digital Age</span>
            </h2>

            <p className="text-slate-400 text-lg mb-6 leading-relaxed">
              Founded in 2023, WealthFlow Premier was built on a simple premise: institutional-grade investment strategies shouldn&apos;t be reserved for the ultra-wealthy. We combine advanced AI algorithms with seasoned financial expertise to deliver consistent, superior returns.
            </p>

            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Our platform processes millions of data points daily to identify high-yield opportunities across global markets, ensuring your capital is always working its hardest for you.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-gold-500">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">Bank-Grade Security</h4>
                  <p className="text-sm text-slate-500">256-bit encryption and segregated accounts.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-gold-500">
                  <Globe size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">Global Access</h4>
                  <p className="text-sm text-slate-500">Invest from anywhere, anytime, instantly.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visuals & Stats */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-gold-500/20 to-transparent rounded-3xl transform rotate-3"></div>
            <img
              src="https://picsum.photos/seed/office/800/1000?grayscale"
              alt="WealthFlow Office"
              className="relative rounded-3xl shadow-2xl border border-slate-800 z-10 w-full object-cover h-[600px]"
            />

            {/* Floating Stats Card */}
            <div className="absolute -bottom-10 -left-10 md:left-10 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-8 rounded-2xl shadow-xl max-w-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-slate-400 text-sm">Total Assets Managed</p>
                  <p className="text-3xl font-bold text-white">$150M+</p>
                </div>
                <div className="bg-green-500/10 p-2 rounded-lg">
                  <TrendingUpIcon />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Active Investors</span>
                  <span className="text-white font-bold">12,500+</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full">
                  <div className="bg-gold-500 h-1.5 rounded-full w-[85%]"></div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Avg. Annual Return</span>
                  <span className="text-green-400 font-bold">18.4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper icon
const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);

export default About;
