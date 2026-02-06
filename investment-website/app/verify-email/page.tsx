'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMessage, setErrorMessage] = useState('')
  const [resendingEmail, setResendingEmail] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('Invalid or missing verification token.')
      return
    }

    verifyEmail()
  }, [token])

  const verifyEmail = async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        setStatus('success')
        setTimeout(() => {
          router.push('/login')
        }, 5000)
      } else {
        const data = await response.json()
        setStatus('error')
        setErrorMessage(data.message || 'Verification failed. The link may have expired.')
      }
    } catch (err) {
      setStatus('error')
      setErrorMessage('Network error. Please check your connection.')
    }
  }

  const handleResendEmail = async () => {
    setResendingEmail(true)
    setResendSuccess(false)

    try {
      // TODO: Replace with actual API call
      // You'll need to get the user's email somehow or use the token
      const response = await fetch('/api/v1/auth/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // If user is logged in
        },
      })

      if (response.ok) {
        setResendSuccess(true)
      } else {
        const data = await response.json()
        alert(data.message || 'Failed to resend verification email.')
      }
    } catch (err) {
      alert('Network error. Please try again.')
    } finally {
      setResendingEmail(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-2xl p-8">

        {status === 'verifying' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Loader2 className="text-gold-500 animate-spin" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Verifying Your Email</h2>
            <p className="text-slate-400">Please wait while we verify your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-emerald-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Email Verified!</h2>
            <p className="text-slate-400 mb-6">
              Your email has been successfully verified. You can now access all features of your account.
            </p>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-300">Redirecting to login page in 5 seconds...</p>
            </div>
            <Link
              href="/login"
              className="inline-block bg-gradient-to-r from-gold-500 to-amber-600 text-white font-bold px-8 py-3 rounded-lg hover:from-gold-600 hover:to-amber-700 transition-all shadow-lg shadow-gold-500/20"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="text-rose-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Verification Failed</h2>
            <p className="text-rose-400 mb-6">{errorMessage}</p>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-slate-300 mb-2 font-medium">What can you do?</p>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-gold-500 mt-0.5">•</span>
                  <span>Request a new verification email using the button below</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-500 mt-0.5">•</span>
                  <span>Check if the link has expired (links are valid for 24 hours)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-500 mt-0.5">•</span>
                  <span>Contact support if you continue to experience issues</span>
                </li>
              </ul>
            </div>

            {resendSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4 mb-6">
                <p className="text-emerald-400 text-sm flex items-center justify-center gap-2">
                  <Mail size={16} />
                  Verification email sent! Check your inbox.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleResendEmail}
                disabled={resendingEmail}
                className="w-full bg-gradient-to-r from-gold-500 to-amber-600 text-white font-bold py-3 rounded-lg hover:from-gold-600 hover:to-amber-700 transition-all shadow-lg shadow-gold-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
              </button>
              <Link
                href="/login"
                className="w-full text-center border border-slate-700 text-slate-300 font-medium py-3 rounded-lg hover:bg-slate-800/50 transition-all"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
