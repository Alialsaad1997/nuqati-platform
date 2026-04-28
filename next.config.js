'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Campaign } from '@/types'
import { formatDate } from '@/lib/utils'

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [actionNote, setActionNote] = useState<Record<string, string>>({})

  useEffect(() => { loadCampaigns() }, [filter])

  const loadCampaigns = async () => {
    setLoading(true)
    let query = supabase.from('campaigns').select('*, merchant:merchants(name)').order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('status', filter)
    const { data } = await query
    setCampaigns(data || [])
    setLoading(false)
  }

  const handleAction = async (campaignId: string, action: 'approved' | 'rejected') => {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('campaigns').update({
      status: action,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
      admin_note: actionNote[campaignId] || null
    }).eq('id', campaignId)
    await loadCampaigns()
  }

  const filterBtns = [
    { key: 'pending', label: 'في الانتظار', color: 'yellow' },
    { key: 'approved', label: 'موافق عليها', color: 'green' },
    { key: 'rejected', label: 'مرفوضة', color: 'red' },
    { key: 'all', label: 'الكل', color: 'gray' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">مراجعة الحملات الترويجية</h1>

      {/* فلاتر */}
      <div className="flex gap-3 mb-6">
        {filterBtns.map(btn => (
          <button key={btn.key} onClick={() => setFilter(btn.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === btn.key ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}>
            {btn.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : campaigns.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-gray-500">لا توجد حملات في هذا القسم</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map(camp => (
            <div key={camp.id} className="card border-2 border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900 text-lg">{camp.title}</h3>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      camp.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      camp.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {camp.status === 'pending' ? 'في الانتظار' : camp.status === 'approved' ? 'موافق عليها' : 'مرفوضة'}
                    </span>
                  </div>
                  <p className="text-sm text-primary-600 font-semibold mt-1">🏪 {(camp.merchant as any)?.name}</p>
                </div>
                <p className="text-xs text-gray-400">{formatDate(camp.created_at)}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-gray-700 text-sm leading-relaxed">{camp.message}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  <span>النوع: {camp.campaign_type}</span>
                  {camp.bonus_points > 0 && <span>النقاط الإضافية: {camp.bonus_points}</span>}
                </div>
              </div>

              {camp.status === 'pending' && (
                <div className="space-y-3">
                  <input className="input text-sm" placeholder="ملاحظة (اختياري — ستظهر للتاجر عند الرفض)"
                    value={actionNote[camp.id] || ''}
                    onChange={e => setActionNote({ ...actionNote, [camp.id]: e.target.value })} />
                  <div className="flex gap-3">
                    <button onClick={() => handleAction(camp.id, 'rejected')}
                      className="btn-danger flex-1 py-2 text-sm rounded-xl">
                      ✗ رفض
                    </button>
                    <button onClick={() => handleAction(camp.id, 'approved')}
                      className="btn-primary flex-1 py-2 text-sm rounded-xl">
                      ✓ موافقة
                    </button>
                  </div>
                </div>
              )}

              {camp.admin_note && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mt-3">
                  الملاحظة: {camp.admin_note}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
