'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
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

interface SidebarProps {
  business: Business | null;
  profile: Profile | null;
}

export function Sidebar({ business, profile }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Cotizaciones', href: '/quotes', icon: FileSpreadsheet },
    { name: 'Clientes', href: '/clients', icon: Users },
    { name: 'Productos y Servicios', href: '/products', icon: Package },
    { name: 'Ajustes de Negocio', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2.5">
        <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-500/30">
          <FileSpreadsheet className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">
          Cotiza<span className="text-indigo-400">Pro</span>
        </span>
      </div>

      {/* Negocio Activo Badge */}
      <div className="p-4 mx-3 my-3 rounded-lg bg-slate-800/60 border border-slate-800 flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-800/40 font-semibold text-sm">
          {business?.name ? business.name.substring(0, 2).toUpperCase() : <Building className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-white truncate">
            {business?.name || 'Mi Negocio'}
          </p>
          <p className="text-[11px] text-slate-400 truncate">
            Moneda: {business?.currency || 'USD'} · Imp: {business?.default_tax_rate ?? 18}%
          </p>
        </div>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              )}
            >
              <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer del usuario & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center gap-3 px-1">
          <div className="h-8 w-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-semibold text-xs shrink-0">
            {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate">
              {profile?.full_name || 'Usuario'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {profile?.email || ''}
            </p>
          </div>
        </div>

        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
