'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Campaign } from '@/types'
import { formatDate } from '@/lib/utils'

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'في الانتظار', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'موافق عليها', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'مرفوضة', color: 'bg-red-100 text-red-700' },
  sent: { label: 'تم الإرسال', color: 'bg-blue-100 text-blue-700' },
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [merchantId, setMerchantId] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', campaign_type: 'notification', bonus_points: 0 })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('profiles').select('merchant_id').eq('id', user.id).single()
    if (!profile?.merchant_id) return
    setMerchantId(profile.merchant_id)

    const { data } = await supabase.from('campaigns').select('*').eq('merchant_id', profile.merchant_id).order('created_at', { ascending: false })
    setCampaigns(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await supabase.from('campaigns').insert({ ...form, merchant_id: merchantId, status: 'pending' })
    setForm({ title: '', message: '', campaign_type: 'notification', bonus_points: 0 })
    setShowForm(false)
    await loadData()
    setSubmitting(false)
  }

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">الحملات الترويجية</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <span>+</span> حملة جديدة
        </button>
      </div>

      {/* نموذج الحملة الجديدة */}
      {showForm && (
        <div className="card mb-6 border-2 border-primary-200">
          <h2 className="font-bold text-gray-900 mb-4">إنشاء حملة جديدة</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">عنوان الحملة</label>
              <input className="input" placeholder="مثال: عرض العيد الخاص" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="label">نوع الحملة</label>
              <select className="input" value={form.campaign_type}
                onChange={e => setForm({ ...form, campaign_type: e.target.value })}>
                <option value="notification">إشعار عام</option>
                <option value="bonus_points">نقاط مضاعفة</option>
                <option value="discount">خصم خاص</option>
              </select>
            </div>
            <div>
              <label className="label">نص الرسالة</label>
              <textarea className="input resize-none h-24" placeholder="اكتب رسالة الحملة هنا..."
                value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
            </div>
            {form.campaign_type === 'bonus_points' && (
              <div>
                <label className="label">عدد النقاط الإضافية</label>
                <input type="number" className="input" value={form.bonus_points}
                  onChange={e => setForm({ ...form, bonus_points: parseInt(e.target.value) })} />
              </div>
            )}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
              ⚠️ ستُرسل الحملة للمراجعة من السوبر أدمن قبل النشر
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">إلغاء</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'جارٍ الإرسال...' : 'إرسال للمراجعة'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* قائمة الحملات */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-3">📢</div>
            <p className="text-gray-500">لا توجد حملات بعد. أنشئ أول حملة!</p>
          </div>
        ) : campaigns.map(camp => (
          <div key={camp.id} className="card flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-gray-900">{camp.title}</h3>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusMap[camp.status]?.color}`}>
                  {statusMap[camp.status]?.label}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{camp.message}</p>
              {camp.admin_note && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  ملاحظة الأدمن: {camp.admin_note}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">{formatDate(camp.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
