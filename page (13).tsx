'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Merchant } from '@/types'
import { formatDate } from '@/lib/utils'

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', name_ar: '', category: 'cafe', loyalty_type: 'stamp', admin_email: '', admin_name: '' })
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data } = await supabase.from('merchants').select('*').order('created_at', { ascending: false })
    setMerchants(data || [])
    setLoading(false)
  }

  const handleAddMerchant = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMsg('')

    // 1. إنشاء التاجر
    const { data: merchant, error: mErr } = await supabase.from('merchants').insert({
      name: form.name, name_ar: form.name_ar, category: form.category,
      loyalty_type: form.loyalty_type, is_active: true
    }).select().single()

    if (mErr || !merchant) { setMsg('❌ خطأ في إنشاء المتجر'); setSubmitting(false); return }

    // 2. إنشاء حساب الأدمن عبر Supabase Auth Admin
    // ملاحظة: في الإنتاج، استخدم Supabase Admin SDK أو Edge Function
    setMsg(`✅ تم إنشاء المتجر "${form.name}" بنجاح! يرجى إنشاء حساب الأدمن يدوياً من لوحة Supabase وربطه بـ merchant_id: ${merchant.id}`)
    await load()
    setShowForm(false)
    setSubmitting(false)
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('merchants').update({ is_active: !current }).eq('id', id)
    await load()
  }

  const loyaltyLabel: Record<string, string> = { stamp: '🎯 أختام', cashback: '💰 كاش باك', points: '⭐ نقاط' }

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">إدارة التجار</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <span>+</span> إضافة تاجر
        </button>
      </div>

      {msg && <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 mb-4 text-sm">{msg}</div>}

      {showForm && (
        <div className="card mb-6 border-2 border-primary-200">
          <h2 className="font-bold text-gray-900 mb-4">تاجر جديد</h2>
          <form onSubmit={handleAddMerchant} className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">اسم المتجر (عربي)</label>
              <input className="input" value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} required />
            </div>
            <div>
              <label className="label">اسم المتجر (إنجليزي)</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">التصنيف</label>
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="cafe">كافيه</option>
                <option value="restaurant">مطعم</option>
                <option value="grocery">مواد غذائية</option>
                <option value="fashion">ملابس</option>
                <option value="other">أخرى</option>
              </select>
            </div>
            <div>
              <label className="label">نوع الولاء</label>
              <select className="input" value={form.loyalty_type} onChange={e => setForm({ ...form, loyalty_type: e.target.value })}>
                <option value="stamp">أختام</option>
                <option value="cashback">كاش باك</option>
                <option value="points">نقاط</option>
              </select>
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">إلغاء</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'جارٍ الإنشاء...' : 'إنشاء المتجر'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-right py-3 px-4 text-gray-500 font-medium">المتجر</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">التصنيف</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">الولاء</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">تاريخ الإنشاء</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map(m => (
                <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-900">{m.name_ar || m.name}</td>
                  <td className="py-4 px-4 text-gray-600">{m.category || '—'}</td>
                  <td className="py-4 px-4">{loyaltyLabel[m.loyalty_type]}</td>
                  <td className="py-4 px-4 text-gray-400">{formatDate(m.created_at)}</td>
                  <td className="py-4 px-4">
                    <button onClick={() => toggleActive(m.id, m.is_active)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        m.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}>
                      {m.is_active ? '✓ نشط' : '✗ موقوف'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
