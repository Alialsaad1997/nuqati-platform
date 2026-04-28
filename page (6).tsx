'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Transaction } from '@/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function MerchantDashboard() {
  const [stats, setStats] = useState({ customers: 0, transactions: 0, revenue: 0, pendingCampaigns: 0 })
  const [recentTx, setRecentTx] = useState<Transaction[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboard() }, [])

  const loadDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('profiles').select('merchant_id').eq('id', user.id).single()
    if (!profile?.merchant_id) return
    const mid = profile.merchant_id

    const [cardsRes, txRes, campaignRes] = await Promise.all([
      supabase.from('loyalty_cards').select('id', { count: 'exact' }).eq('merchant_id', mid),
      supabase.from('transactions').select('*').eq('merchant_id', mid).order('created_at', { ascending: false }).limit(10),
      supabase.from('campaigns').select('id', { count: 'exact' }).eq('merchant_id', mid).eq('status', 'pending'),
    ])

    const totalRevenue = (txRes.data || []).reduce((sum, t) => sum + t.amount, 0)

    setStats({
      customers: cardsRes.count || 0,
      transactions: txRes.data?.length || 0,
      revenue: totalRevenue,
      pendingCampaigns: campaignRes.count || 0
    })
    setRecentTx(txRes.data || [])

    // بيانات الرسم البياني - آخر 7 أيام
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i))
      return { day: d.toLocaleDateString('ar-IQ', { weekday: 'short' }), مبيعات: 0, date: d.toDateString() }
    })
    ;(txRes.data || []).forEach(tx => {
      const txDate = new Date(tx.created_at).toDateString()
      const bucket = last7.find(b => b.date === txDate)
      if (bucket) bucket['مبيعات'] += tx.amount
    })
    setChartData(last7)
    setLoading(false)
  }

  const statCards = [
    { label: 'إجمالي الزبائن', value: stats.customers, icon: '👥', color: 'text-blue-600 bg-blue-50' },
    { label: 'عمليات اليوم', value: stats.transactions, icon: '🔄', color: 'text-green-600 bg-green-50' },
    { label: 'إجمالي المبيعات', value: formatCurrency(stats.revenue), icon: '💰', color: 'text-yellow-600 bg-yellow-50' },
    { label: 'حملات معلّقة', value: stats.pendingCampaigns, icon: '📢', color: 'text-purple-600 bg-purple-50' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">لوحة التحكم</h1>

      {/* إحصائيات */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className="card">
            <div className={`inline-flex p-3 rounded-xl mb-3 ${s.color}`}>
              <span className="text-2xl">{s.icon}</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-gray-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* الرسم البياني */}
      <div className="card mb-8">
        <h2 className="font-bold text-gray-900 mb-4">المبيعات - آخر 7 أيام</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: any) => formatCurrency(v)} />
            <Bar dataKey="مبيعات" fill="#16a34a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* آخر العمليات */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">آخر العمليات</h2>
        {recentTx.length === 0 ? (
          <p className="text-gray-400 text-center py-8">لا توجد عمليات بعد</p>
        ) : (
          <div className="space-y-3">
            {recentTx.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center text-sm">
                    {tx.transaction_type === 'stamp' ? '🎯' :
                     tx.transaction_type === 'earn' ? '⭐' : '💰'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{tx.transaction_type}</p>
                    <p className="text-xs text-gray-400">{formatDate(tx.created_at)}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900">{formatCurrency(tx.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
