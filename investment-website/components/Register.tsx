'use client'

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp, ArrowRight, Lock, Mail, User } from 'lucide-react';

const Register = () => {
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-950 py-12">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://picsum.photos/seed/building/1920/1080?grayscale&blur=4"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/90 to-slate-900/50"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4 group">
             <div className="bg-gradient-to-br from-gold-400 to-gold-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-slate-950" />
            </div>
            <span className="text-2xl font-serif font-bold text-white tracking-wide">
              Wealth<span className="text-gold-500">Flow</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Join the Elite</h2>
          <p className="text-slate-400 text-sm mt-2">Start your journey to financial freedom today.</p>
        </div>

        {/* Register Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors placeholder-slate-600"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors placeholder-slate-600"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors placeholder-slate-600"
                  placeholder="Create a strong password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors placeholder-slate-600"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div className="flex items-start mt-2">
              <div className="flex items-center h-5">
                <input id="terms" type="checkbox" required className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-gold-500 focus:ring-gold-500/50" />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-slate-400">I agree to the <a href="#" className="text-gold-500 hover:underline">Terms of Service</a> and <a href="#" className="text-gold-500 hover:underline">Privacy Policy</a></label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-bold py-3 px-4 rounded-lg shadow-lg shadow-gold-500/20 transform hover:-translate-y-0.5 transition-all flex items-center justify-center group mt-4"
            >
              Create Account
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-gold-500 font-semibold hover:text-gold-400 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
