'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const navItems = [
  { href: '/dashboard/admin', label: 'الرئيسية', icon: '📊' },
  { href: '/dashboard/admin/merchants', label: 'التجار', icon: '🏪' },
  { href: '/dashboard/admin/campaigns', label: 'الحملات', icon: '📢' },
  { href: '/dashboard/admin/users', label: 'المستخدمين', icon: '👥' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-xl">⭐</div>
            <div>
              <p className="font-bold text-sm">نقاطي</p>
              <p className="text-xs text-gray-400">سوبر أدمن</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === item.href ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}>
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={() => { supabase.auth.signOut(); window.location.href = '/' }}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 px-4 py-2 w-full rounded-xl hover:bg-gray-800 transition-colors">
            <span>🚪</span> خروج
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
