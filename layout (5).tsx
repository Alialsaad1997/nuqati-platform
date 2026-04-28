'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Merchant, Profile } from '@/types'

const navItems = [
  { href: '/dashboard/merchant', label: 'الرئيسية', icon: '📊' },
  { href: '/dashboard/merchant/customers', label: 'الزبائن', icon: '👥' },
  { href: '/dashboard/merchant/campaigns', label: 'الحملات', icon: '📢' },
  { href: '/dashboard/merchant/settings', label: 'الإعدادات', icon: '⚙️' },
]

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      if (p?.merchant_id) {
        const { data: m } = await supabase.from('merchants').select('*').eq('id', p.merchant_id).single()
        setMerchant(m)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-xl">⭐</div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{merchant?.name || 'نقاطي'}</p>
              <p className="text-xs text-gray-500">{profile?.full_name}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={() => { supabase.auth.signOut(); window.location.href = '/' }}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 px-4 py-2 w-full rounded-xl hover:bg-red-50 transition-colors">
            <span>🚪</span> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
