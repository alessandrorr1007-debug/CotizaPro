import React from 'react';
import { FileSpreadsheet, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Columna Izquierda: Branding & Propuesta de Valor */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
        {/* Glow de fondo decorativo */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight text-white hover:opacity-90 transition-opacity">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <span>Cotiza<span className="text-indigo-400">Pro</span></span>
          </Link>
          <p className="mt-2 text-sm text-indigo-200">
            La plataforma moderna para cotizaciones comerciales y gestión de clientes.
          </p>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-indigo-200 border border-white/10">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Gestión ágil para pequeños negocios y profesionales
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Emite cotizaciones impecables, calcula impuestos sin errores y cierra más ventas.
          </h1>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-center gap-2.5">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span>Aislamiento de datos con seguridad PostgreSQL a nivel de fila (RLS).</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span>Cálculos financieros precisos y verificados en servidor.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span>Generación instantánea de documentos PDF profesionales.</span>
            </li>
          </ul>
        </div>

        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Seguridad y cifrado de grado empresarial</span>
          </div>
          <span>&copy; 2026 CotizaPro</span>
        </div>
      </div>

      {/* Columna Derecha: Formulario de Autenticación */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Cotiza<span className="text-indigo-600">Pro</span>
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
