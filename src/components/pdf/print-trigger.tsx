'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';

export function PrintTrigger() {
  const router = useRouter();

  return (
    <div className="mb-6 flex items-center justify-between print:hidden bg-slate-50 border border-slate-200 p-4 rounded-xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-2 text-slate-600"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver</span>
      </Button>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 hidden sm:inline">
          Presiona imprimir o guarda como PDF desde tu navegador
        </span>
        <Button
          variant="primary"
          size="sm"
          onClick={() => window.print()}
          className="gap-2"
        >
          <Printer className="h-4 w-4" />
          <span>Imprimir / Guardar como PDF</span>
        </Button>
      </div>
    </div>
  );
}
