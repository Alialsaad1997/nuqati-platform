'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await signIn(email, password)

    if (error) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      setLoading(false)
      return
    }

    // جلب الدور وتوجيه المستخدم
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user!.id)
      .single()

    switch (profile?.role) {
      case 'super_admin':
        router.push('/dashboard/admin')
        break
      case 'merchant_admin':
        router.push('/dashboard/merchant')
        break
      case 'employee':
        router.push('/dashboard/employee')
        break
      default:
        router.push('/customer')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
            <span className="text-3xl">⭐</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">تسجيل الدخول</h1>
          <p className="text-gray-500 mt-1">مرحباً بك في نقاطي</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="label">البريد الإلكتروني</label>
            <input
              type="email"
              className="input"
              placeholder="example@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">كلمة المرور</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-lg"
          >
            {loading ? 'جارٍ الدخول...' : 'دخول'}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-500 text-sm">
          ليس لديك حساب؟{' '}
          <Link href="/auth/register" className="text-primary-600 font-semibold hover:underline">
            سجّل الآن
          </Link>
        </div>
      </div>
    </div>
  )
}
