'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, Users, Megaphone, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface AppNavProps {
  userName: string
  orgName?: string
}

export function AppNav({ userName, orgName }: AppNavProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/app', icon: Home, label: 'Inicio' },
    { href: '/app/inventario', icon: Package, label: 'Inventario' },
    { href: '/app/voluntarios', icon: Users, label: 'Voluntarios' },
    { href: '/app/necesidades', icon: Megaphone, label: 'Necesidades' }
  ]

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r bg-background hidden md:flex flex-col z-40">
        <div className="border-b px-6 py-4 h-[53px] flex items-center">
          <span className="text-lg font-semibold">Volunti Panel</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t mt-auto space-y-3">
          <div className="px-3">
            <p className="text-sm font-semibold truncate text-foreground">{userName}</p>
            {orgName && <p className="text-xs text-muted-foreground truncate mt-0.5">{orgName}</p>}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] border-t bg-background/95 backdrop-blur z-40 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'fill-primary/20' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
