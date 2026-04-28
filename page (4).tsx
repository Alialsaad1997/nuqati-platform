'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { LoyaltyCard } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function CustomersPage() {
  const [cards, setCards] = useState<LoyaltyCard[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadCustomers() }, [])

  const loadCustomers = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('profiles').select('merchant_id').eq('id', user.id).single()
    if (!profile?.merchant_id) return

    const { data } = await supabase
      .from('loyalty_cards')
      .select('*, customer:profiles(*), merchant:merchants(*)')
      .eq('merchant_id', profile.merchant_id)
      .order('created_at', { ascending: false })

    setCards(data || [])
    setLoading(false)
  }

  const filtered = cards.filter(c =>
    (c.customer as any)?.full_name?.includes(search) ||
    (c.customer as any)?.phone?.includes(search)
  )

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">الزبائن</h1>
        <span className="bg-primary-100 text-primary-700 font-bold px-4 py-2 rounded-xl text-sm">{cards.length} زبون</span>
      </div>

      <div className="card mb-6">
        <input className="input" placeholder="🔍 البحث بالاسم أو رقم الهاتف..." value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-12">لا يوجد زبائن مطابقين</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">الزبون</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">الهاتف</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">الرصيد</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">إجمالي الإنفاق</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">تاريخ الانضمام</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(card => (
                  <tr key={card.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                          {((card.customer as any)?.full_name || '؟')[0]}
                        </div>
                        <span className="font-medium text-gray-900">{(card.customer as any)?.full_name || '—'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{(card.customer as any)?.phone || '—'}</td>
                    <td className="py-4 px-4">
                      {card.merchant?.loyalty_type === 'stamp' && (
                        <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded-lg font-bold">
                          {card.stamps_count} ختم
                        </span>
                      )}
                      {card.merchant?.loyalty_type === 'points' && (
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-bold">
                          {card.points_balance} نقطة
                        </span>
                      )}
                      {card.merchant?.loyalty_type === 'cashback' && (
                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg font-bold">
                          {formatCurrency(card.cashback_balance)}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-900">{formatCurrency(card.total_spent)}</td>
                    <td className="py-4 px-4 text-gray-400">{formatDate(card.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
