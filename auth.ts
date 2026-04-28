'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signUp(form.email, form.password, form.fullName, form.phone)

    if (error) {
      setError('حدث خطأ أثناء إنشاء الحساب. قد يكون البريد الإلكتروني مستخدماً مسبقاً.')
      setLoading(false)
      return
    }

    router.push('/customer')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
            <span className="text-3xl">⭐</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">إنشاء حساب جديد</h1>
          <p className="text-gray-500 mt-1">ابدأ رحلتك مع نقاطي</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">الاسم الكامل</label>
            <input className="input" placeholder="محمد أحمد" value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })} required />
          </div>
          <div>
            <label className="label">رقم الهاتف</label>
            <input className="input" placeholder="07XXXXXXXXX" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div>
            <label className="label">البريد الإلكتروني</label>
            <input type="email" className="input" placeholder="example@email.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">كلمة المرور</label>
            <input type="password" className="input" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-lg">
            {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب'}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-500 text-sm">
          لديك حساب؟{' '}
          <Link href="/auth/login" className="text-primary-600 font-semibold hover:underline">سجّل دخولك</Link>
        </div>
      </div>
    </div>
  )
}
