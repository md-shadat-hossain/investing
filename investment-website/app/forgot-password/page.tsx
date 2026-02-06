'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setIsSuccess(true)
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to send reset link. Please try again.')
      }
    } catch (err) {
      setError('Network error. Please check your connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-emerald-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
          <p className="text-slate-400 mb-6">
            We've sent a password reset link to <span className="text-gold-500 font-medium">{email}</span>.
            Please check your inbox and follow the instructions.
          </p>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-slate-300 mb-2">Didn't receive the email?</p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>Check your spam/junk folder</li>
              <li>Verify the email address is correct</li>
              <li>Wait a few minutes and try again</li>
            </ul>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-400 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold">
              <span className="text-white">Wealth</span>
              <span className="text-gold-500">Flow</span>
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
          <p className="text-slate-400">No worries, we'll send you reset instructions.</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/50 rounded-lg p-4">
                <p className="text-rose-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-gold-500 to-amber-600 text-white font-bold py-3 rounded-lg hover:from-gold-600 hover:to-amber-700 transition-all shadow-lg shadow-gold-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-gold-500 transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Remember your password?{' '}
          <Link href="/login" className="text-gold-500 hover:text-gold-400 transition-colors font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
