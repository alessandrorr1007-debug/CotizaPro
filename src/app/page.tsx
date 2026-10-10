import Link from 'next/link';
import { FileSpreadsheet, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Cotiza<span className="text-indigo-400">Pro</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm" className="shadow-sm shadow-indigo-500/25">
                Empezar Gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-20 lg:py-28 max-w-5xl mx-auto relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-medium mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          SaaS para Pequeños Negocios y Profesionales
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
          Cotizaciones comerciales rápidas, precisas y en{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
            PDF profesional
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          Administra clientes, productos e impuestos configurables. Genera propuestas comerciales impecables con aislamiento de datos seguro.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto gap-2 px-8 py-3.5 text-base">
              <span>Crear cuenta de negocio</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800">
              Acceder a mi panel
            </Button>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 pt-10 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-left text-sm text-slate-400">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-medium">Cálculos Verificados</strong>
              Subtotales, tasas de impuesto y descuentos calculados con redondeo matemático estricto.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-medium">Seguridad RLS PostgreSQL</strong>
              Aislamiento total de información entre diferentes empresas o usuarios.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-medium">Documentos en PDF</strong>
              Emisión de cotizaciones elegantes listas para enviar a tus prospectos.
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        CotizaPro &copy; 2026 — Plataforma SaaS de Gestión Comercial
      </footer>
    </div>
  );
}
