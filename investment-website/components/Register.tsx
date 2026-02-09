'use client'

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TrendingUp, ArrowRight, Lock, Mail, User, Users, Loader2 } from 'lucide-react';
import { useRegisterMutation } from '@/store/api/authApi';
import { Toast, ToastType } from '@/components/Toast';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState(refCode);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const [register, { isLoading }] = useRegisterMutation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        ...(referralCode ? { referralCode } : {}),
      }).unwrap();

      setToast({ message: 'Account created! Please verify your email.', type: 'success' });

      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }, 1000);
    } catch (error: any) {
      const errorMsg = error?.data?.message || 'Registration failed. Please try again.';
      setToast({ message: errorMsg, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-950 py-12">
      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors placeholder-slate-600"
                    placeholder="John"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors placeholder-slate-600"
                    placeholder="Doe"
                  />
                </div>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors placeholder-slate-600"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Referral Code <span className="text-slate-500">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Users size={18} />
                </div>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors placeholder-slate-600"
                  placeholder="Enter referral code"
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
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-bold py-3 px-4 rounded-lg shadow-lg shadow-gold-500/20 transform hover:-translate-y-0.5 transition-all flex items-center justify-center group mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
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
}

const Register = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="text-gold-500 animate-spin" size={32} />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
};

export default Register;
