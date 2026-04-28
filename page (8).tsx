'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Merchant } from '@/types'

const loyaltyTypes = [
  { value: 'stamp', label: '🎯 نظام الأختام', desc: 'اكسب ختماً مع كل شراء واحصل على مكافأة' },
  { value: 'points', label: '⭐ نظام النقاط', desc: 'جمّع نقاط واستبدلها بمكافآت' },
  { value: 'cashback', label: '💰 الكاش باك', desc: 'استرجع نسبة من قيمة مشترياتك' },
]

export default function SettingsPage() {
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [form, setForm] = useState<Partial<Merchant>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { loadMerchant() }, [])

  const loadMerchant = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('profiles').select('merchant_id').eq('id', user.id).single()
    if (!profile?.merchant_id) return
    const { data: m } = await supabase.from('merchants').select('*').eq('id', profile.merchant_id).single()
    setMerchant(m)
    setForm(m || {})
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!merchant) return
    setSaving(true)
    await supabase.from('merchants').update({ ...form, updated_at: new Date().toISOString() }).eq('id', merchant.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">إعدادات المتجر</h1>
      <form onSubmit={handleSave} className="space-y-6">

        {/* معلومات أساسية */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">المعلومات الأساسية</h2>
          <div className="space-y-4">
            <div>
              <label className="label">اسم المتجر (عربي)</label>
              <input className="input" value={form.name_ar || ''} onChange={e => setForm({ ...form, name_ar: e.target.value })} />
            </div>
            <div>
              <label className="label">اسم المتجر (إنجليزي)</label>
              <input className="input" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">تصنيف المتجر</label>
              <select className="input" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">اختر التصنيف</option>
                <option value="cafe">كافيه</option>
                <option value="restaurant">مطعم</option>
                <option value="grocery">مواد غذائية</option>
                <option value="fashion">ملابس</option>
                <option value="electronics">إلكترونيات</option>
                <option value="pharmacy">صيدلية</option>
                <option value="other">أخرى</option>
              </select>
            </div>
          </div>
        </div>

        {/* نوع الولاء */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">نوع برنامج الولاء</h2>
          <div className="space-y-3">
            {loyaltyTypes.map(lt => (
              <label key={lt.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                form.loyalty_type === lt.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input type="radio" name="loyalty_type" value={lt.value} checked={form.loyalty_type === lt.value}
                  onChange={() => setForm({ ...form, loyalty_type: lt.value as any })} className="hidden" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{lt.label}</p>
                  <p className="text-sm text-gray-500">{lt.desc}</p>
                </div>
                {form.loyalty_type === lt.value && <span className="text-primary-600">✓</span>}
              </label>
            ))}
          </div>
        </div>

        {/* إعدادات حسب النوع */}
        {form.loyalty_type === 'stamp' && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">إعدادات الأختام</h2>
            <div className="space-y-4">
              <div>
                <label className="label">عدد الأختام المطلوبة للمكافأة</label>
                <input type="number" className="input" value={form.stamp_target || 10}
                  onChange={e => setForm({ ...form, stamp_target: parseInt(e.target.value) })} min="2" max="50" />
              </div>
              <div>
                <label className="label">وصف المكافأة</label>
                <input className="input" placeholder="مثال: كوب قهوة مجاني" value={form.stamp_reward || ''}
                  onChange={e => setForm({ ...form, stamp_reward: e.target.value })} />
              </div>
              <div>
                <label className="label">أيقونة الختم</label>
                <select className="input" value={form.card_icon || 'star'} onChange={e => setForm({ ...form, card_icon: e.target.value })}>
                  <option value="star">⭐ نجمة</option>
                  <option value="coffee">☕ قهوة</option>
                  <option value="target">🎯 هدف</option>
                  <option value="heart">❤️ قلب</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {form.loyalty_type === 'points' && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">إعدادات النقاط</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">عدد النقاط لكل ألف دينار</label>
                <input type="number" className="input" value={form.points_per_amount || 1}
                  onChange={e => setForm({ ...form, points_per_amount: parseInt(e.target.value) })} min="1" />
              </div>
              <div>
                <label className="label">المبلغ لكل نقطة (دينار)</label>
                <input type="number" className="input" value={form.amount_per_point || 1000}
                  onChange={e => setForm({ ...form, amount_per_point: parseInt(e.target.value) })} min="100" step="100" />
              </div>
            </div>
          </div>
        )}

        {form.loyalty_type === 'cashback' && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">إعدادات الكاش باك</h2>
            <div>
              <label className="label">نسبة الكاش باك (%)</label>
              <input type="number" className="input" value={form.cashback_percentage || 5}
                onChange={e => setForm({ ...form, cashback_percentage: parseFloat(e.target.value) })} min="0.5" max="50" step="0.5" />
            </div>
          </div>
        )}

        {/* لون البطاقة */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">مظهر البطاقة</h2>
          <div>
            <label className="label">لون البطاقة</label>
            <div className="flex items-center gap-3">
              <input type="color" className="w-12 h-12 rounded-xl cursor-pointer border border-gray-300"
                value={form.card_bg_color || '#16a34a'}
                onChange={e => setForm({ ...form, card_bg_color: e.target.value })} />
              <span className="text-gray-600 text-sm">{form.card_bg_color || '#16a34a'}</span>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full py-4 text-lg">
          {saving ? 'جارٍ الحفظ...' : saved ? '✓ تم الحفظ!' : 'حفظ الإعدادات'}
        </button>
      </form>
    </div>
  )
}
