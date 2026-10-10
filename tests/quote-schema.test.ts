// ============================================================================
// Pruebas unitarias para quoteSchema
// ============================================================================

import { quoteSchema, quoteItemSchema } from '../src/lib/schemas/quote.schema';

function runQuoteSchemaTests() {
  console.log('--- Iniciando pruebas de quoteSchema ---');

  // Caso 1: Ítem válido con product_id nulo/vacío
  const itemWithEmptyProduct = {
    product_id: '',
    description: 'Servicio de diseño UX',
    quantity: 2,
    unit_price: 150.0,
    discount_rate: 5,
  };
  const resItem = quoteItemSchema.safeParse(itemWithEmptyProduct);
  if (!resItem.success || resItem.data.product_id !== null) {
    throw new Error('FAIL: product_id vacío no transformó a null');
  }
  console.log('✓ PASS: Ítem de cotización manual transformado a null correctamente');

  // Caso 2: Cotización completa válida
  const validQuote = {
    client_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    issue_date: '2026-10-10',
    valid_until: '2026-10-25',
    currency: 'USD',
    tax_rate: 18.0,
    notes: 'Entrega en 10 días laborables',
    terms: 'Pago 50% anticipo, 50% contraentrega',
    items: [
      {
        description: 'Desarrollo Frontend',
        quantity: 1,
        unit_price: 1200.0,
        discount_rate: 0,
      },
      {
        description: 'Capacitación al equipo',
        quantity: 3,
        unit_price: 100.0,
        discount_rate: 10,
      },
    ],
  };
  const resQuote = quoteSchema.safeParse(validQuote);
  if (!resQuote.success) {
    throw new Error(`FAIL: Cotización válida falló: ${resQuote.error}`);
  }
  console.log('✓ PASS: Cotización estructurada válida');

  // Caso 3: Cotización sin cliente válido (UUID inválido)
  const invalidClientQuote = {
    ...validQuote,
    client_id: 'no-uuid-id',
  };
  const resInvalid = quoteSchema.safeParse(invalidClientQuote);
  if (resInvalid.success) {
    throw new Error('FAIL: Debería fallar client_id que no sea UUID');
  }
  console.log('✓ PASS: client_id inválido rechazado correctamente');

  // Caso 4: Cotización sin ítems
  const emptyItemsQuote = {
    ...validQuote,
    items: [],
  };
  const resEmptyItems = quoteSchema.safeParse(emptyItemsQuote);
  if (resEmptyItems.success) {
    throw new Error('FAIL: Debería fallar cotización sin ítems');
  }
  console.log('✓ PASS: Cotización sin ítems rechazada correctamente');

  console.log('--- Todas las pruebas de quoteSchema superadas con éxito ---');
}

runQuoteSchemaTests();
