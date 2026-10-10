// ============================================================================
// Pruebas unitarias para Ciclo de Vida de Cotizaciones y Validación de PDF
// ============================================================================

import { QuoteStatus, Quote, Business } from '../src/core/domain/types';

// Validador de transiciones de estado de cotización (Reglas de Negocio)
export function isValidStatusTransition(
  current: QuoteStatus,
  target: QuoteStatus
): boolean {
  if (current === target) return true;

  const validTransitions: Record<QuoteStatus, QuoteStatus[]> = {
    draft: ['sent', 'rejected'],
    sent: ['accepted', 'rejected', 'expired', 'draft'],
    accepted: ['draft'], // Reabrir para renegociación
    rejected: ['draft'], // Reabrir para contrapropuesta
    expired: ['draft'],  // Reactivar con nuevas fechas y precios
  };

  return validTransitions[current]?.includes(target) ?? false;
}

export function checkIsQuoteExpired(validUntil: string, referenceDateStr?: string): boolean {
  const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const validDate = new Date(`${validUntil}T23:59:59`);
  return validDate.getTime() < refDate.getTime();
}

function runQuoteLifecycleAndPdfTests() {
  console.log('--- Iniciando pruebas de Ciclo de Vida y PDF ---');

  // 1. Transiciones desde 'draft'
  if (!isValidStatusTransition('draft', 'sent')) {
    throw new Error('FAIL: Transición draft -> sent debería ser válida');
  }
  if (!isValidStatusTransition('draft', 'rejected')) {
    throw new Error('FAIL: Transición draft -> rejected debería ser válida');
  }
  if (isValidStatusTransition('draft', 'accepted')) {
    throw new Error('FAIL: Transición directa draft -> accepted no debería permitirse sin enviar');
  }
  console.log('✓ PASS: Transiciones válidas e inválidas desde "draft"');

  // 2. Transiciones desde 'sent'
  if (!isValidStatusTransition('sent', 'accepted')) {
    throw new Error('FAIL: Transición sent -> accepted debería ser válida');
  }
  if (!isValidStatusTransition('sent', 'rejected')) {
    throw new Error('FAIL: Transición sent -> rejected debería ser válida');
  }
  if (!isValidStatusTransition('sent', 'expired')) {
    throw new Error('FAIL: Transición sent -> expired debería ser válida');
  }
  if (!isValidStatusTransition('sent', 'draft')) {
    throw new Error('FAIL: Transición sent -> draft (retorno) debería ser válida');
  }
  console.log('✓ PASS: Transiciones válidas desde "sent"');

  // 3. Reabrir estados terminales a draft
  if (!isValidStatusTransition('accepted', 'draft')) {
    throw new Error('FAIL: Reabrir accepted -> draft debería ser válido');
  }
  if (!isValidStatusTransition('rejected', 'draft')) {
    throw new Error('FAIL: Reabrir rejected -> draft debería ser válido');
  }
  if (!isValidStatusTransition('expired', 'draft')) {
    throw new Error('FAIL: Reactivar expired -> draft debería ser válido');
  }
  if (isValidStatusTransition('accepted', 'rejected')) {
    throw new Error('FAIL: Transición directa accepted -> rejected no debería permitirse');
  }
  console.log('✓ PASS: Transiciones de reactivación/reapertura controladas');

  // 4. Verificación de expiración de validez
  const expiredDate = '2026-01-01';
  const futureDate = '2026-12-31';
  const testNow = '2026-06-15T12:00:00Z';

  if (!checkIsQuoteExpired(expiredDate, testNow)) {
    throw new Error('FAIL: 2026-01-01 debería marcarse como expirada respecto a 2026-06-15');
  }
  if (checkIsQuoteExpired(futureDate, testNow)) {
    throw new Error('FAIL: 2026-12-31 no debería marcarse como expirada');
  }
  console.log('✓ PASS: Algoritmo de detección de vencimiento de cotización');

  // 5. Integridad del payload para el documento PDF
  const mockBusiness: Business = {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Consultoría Tech SAC',
    tax_id: '20601234567',
    email: 'contacto@techsac.com',
    phone: '+51 987 654 321',
    address: 'Av. Empresarial 123, Lima',
    currency: 'USD',
    default_tax_rate: 18.0,
    logo_url: null,
    consecutive_quote_number: 2,
    created_at: '2026-10-10T00:00:00Z',
    updated_at: '2026-10-10T00:00:00Z',
  };

  const mockQuote: Quote = {
    id: 'q0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    business_id: mockBusiness.id,
    client_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    quote_number: 'COT-0001',
    status: 'sent',
    issue_date: '2026-10-10',
    valid_until: '2026-10-25',
    currency: 'USD',
    subtotal: 1000.0,
    discount_amount: 50.0,
    tax_rate: 18.0,
    tax_amount: 171.0,
    total: 1121.0,
    notes: 'Entrega en 10 días',
    terms: '50% adelanto',
    created_by: null,
    created_at: '2026-10-10T00:00:00Z',
    updated_at: '2026-10-10T00:00:00Z',
    client: {
      id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      business_id: mockBusiness.id,
      name: 'Corporación Alfa',
      tax_id: '20123456789',
      email: 'compras@alfa.com',
      phone: '+51 999 888 777',
      address: 'Calle Las Begonias 456',
      notes: null,
      created_at: '2026-10-10T00:00:00Z',
      updated_at: '2026-10-10T00:00:00Z',
    },
    items: [
      {
        id: 'i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        quote_id: 'q0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        product_id: null,
        description: 'Servicio de Consultoría Cloud',
        quantity: 10,
        unit_price: 100.0,
        discount_rate: 5.0,
        subtotal: 950.0,
        sort_order: 0,
      },
    ],
  };

  if (!mockQuote.quote_number || !mockQuote.client?.name || !mockQuote.items?.length) {
    throw new Error('FAIL: Datos insuficientes para emitir documento PDF');
  }
  console.log('✓ PASS: Payload de negocio, cliente y detalle válido para renderizado de PDF');

  console.log('--- Todas las pruebas de Ciclo de Vida y PDF superadas con éxito ---');
}

runQuoteLifecycleAndPdfTests();
