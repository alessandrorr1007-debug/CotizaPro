'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  FileSpreadsheet,
  LayoutDashboard,
  Users,
  Package,
  Settings,
  LogOut,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOutAction } from '@/app/(auth)/actions';
import { Business, Profile } from '@/core/domain/types';

interface NavbarProps {
  business: Business | null;
  profile: Profile | null;
}

export function Navbar({ business, profile }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Cotizaciones', href: '/quotes', icon: FileSpreadsheet },
    { name: 'Clientes', href: '/clients', icon: Users },
    { name: 'Productos y Servicios', href: '/products', icon: Package },
    { name: 'Ajustes de Negocio', href: '/settings', icon: Settings },
  ];

  return (
    <header className="lg:hidden bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 h-16">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">
            Cotiza<span className="text-indigo-400">Pro</span>
          </span>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="px-4 pb-6 pt-2 border-t border-slate-800 bg-slate-900 space-y-4">
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800 flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
              {business?.name ? business.name.substring(0, 2).toUpperCase() : <Building className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {business?.name || 'Mi Negocio'}
              </p>
              <p className="text-xs text-slate-400">
                {business?.currency || 'USD'} · Imp: {business?.default_tax_rate ?? 18}%
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 truncate max-w-[180px]">
              {profile?.email}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
