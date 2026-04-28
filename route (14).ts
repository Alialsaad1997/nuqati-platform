'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ merchants: 0, customers: 0, transactions: 0, pendingCampaigns: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStats() }, [])

  const loadStats = async () => {
    const [m, c, t, cp] = await Promise.all([
      supabase.from('merchants').select('id', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'customer'),
      supabase.from('transactions').select('id', { count: 'exact' }),
      supabase.from('campaigns').select('id', { count: 'exact' }).eq('status', 'pending'),
    ])
    setStats({ merchants: m.count || 0, customers: c.count || 0, transactions: t.count || 0, pendingCampaigns: cp.count || 0 })
    setLoading(false)
  }

  const statCards = [
    { label: 'إجمالي التجار', value: stats.merchants, icon: '🏪', color: 'bg-blue-500' },
    { label: 'إجمالي الزبائن', value: stats.customers, icon: '👥', color: 'bg-green-500' },
    { label: 'إجمالي العمليات', value: stats.transactions, icon: '🔄', color: 'bg-yellow-500' },
    { label: 'حملات تنتظر الموافقة', value: stats.pendingCampaigns, icon: '⚠️', color: 'bg-red-500' },
  ]

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">لوحة السوبر أدمن</h1>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className="card">
            <div className={`inline-flex p-3 rounded-xl mb-3 ${s.color}`}>
              <span className="text-2xl">{s.icon}</span>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-gray-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      {stats.pendingCampaigns > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="font-bold text-yellow-900">⚠️ توجد {stats.pendingCampaigns} حملة تنتظر مراجعتك</p>
            <p className="text-yellow-700 text-sm mt-1">يرجى مراجعة الحملات والموافقة عليها أو رفضها</p>
          </div>
          <a href="/dashboard/admin/campaigns" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-5 py-2 rounded-xl transition-colors">
            مراجعة الحملات
          </a>
        </div>
      )}
    </div>
  )
}
