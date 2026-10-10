import React from 'react';
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { QuotePdfDocument } from '@/components/pdf/quote-pdf-document';
import { Quote, QuoteItem } from '@/core/domain/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await getCurrentUserSession();
  if (!session?.user || !session.business) {
    return new NextResponse('No autorizado', { status: 401 });
  }

  const supabase = await createClient();

  // 1. Consultar cotización
  const { data: quote, error } = await supabase
    .from('quotes')
    .select(`
      *,
      client:clients(*),
      items:quote_items(*)
    `)
    .eq('id', id)
    .eq('business_id', session.business.id)
    .single();

  if (error || !quote) {
    return new NextResponse('Cotización no encontrada', { status: 404 });
  }

  if (quote.items && Array.isArray(quote.items)) {
    (quote.items as QuoteItem[]).sort(
      (a: QuoteItem, b: QuoteItem) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );
  }

  // 2. Registrar evento en bitácora de auditoría
  await supabase.from('quote_activities').insert({
    quote_id: id,
    user_id: session.user.id,
    action: 'pdf_downloaded',
    metadata: { quote_number: quote.quote_number },
  });

  // 3. Renderizar PDF con buffer binario
  const pdfElement = React.createElement(QuotePdfDocument, {
    quote: quote as unknown as Quote,
    business: session.business,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(pdfElement as any);

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${quote.quote_number}.pdf"`,
    },
  });
}
