// ============================================================================
// Pruebas unitarias para QuoteCalculator
// ============================================================================

import { QuoteCalculator, RawQuoteItemInput } from '../src/core/engine/quote-calculator';

function assertEqual(actual: number, expected: number, message: string) {
  if (Math.abs(actual - expected) > 0.0001) {
    throw new Error(`FAIL: ${message} -> Esperado: ${expected}, Obtenido: ${actual}`);
  }
  console.log(`✓ PASS: ${message} = ${actual}`);
}

function runTests() {
  console.log('--- Iniciando pruebas de QuoteCalculator ---');

  // Caso 1: Ítem simple sin descuento
  const item1 = QuoteCalculator.calculateItemSubtotal(2, 50);
  assertEqual(item1, 100.0, 'Subtotal 2 x 50.00');

  // Caso 2: Ítem con descuento del 10%
  const item2 = QuoteCalculator.calculateItemSubtotal(3, 100, 10);
  assertEqual(item2, 270.0, 'Subtotal 3 x 100.00 con 10% descuento (300 - 30)');

  // Caso 3: Manejo de precisión flotante y redondeo (1.5 unidades a 10.33 con 5% desc)
  // 1.5 * 10.33 = 15.495; desc = 0.77475; neto = 14.72025 -> redondeado = 14.72
  const item3 = QuoteCalculator.calculateItemSubtotal(1.5, 10.33, 5);
  assertEqual(item3, 14.72, 'Subtotal con decimales fraccionados y redondeo HALF_UP');

  // Caso 4: Cotización completa con impuesto 18%
  const items: RawQuoteItemInput[] = [
    { description: 'Consultoría Técnica', quantity: 10, unit_price: 150.0, discount_rate: 0 },
    { description: 'Licencia de Software', quantity: 1, unit_price: 500.0, discount_rate: 10 }, // 450.00
  ];

  // Subtotal = 1500 + 450 = 1950.00
  // Impuesto 18% = 1950 * 0.18 = 351.00
  // Total = 1950 + 351 = 2301.00
  const result = QuoteCalculator.calculateQuote(items, 18.0);

  assertEqual(result.subtotal, 1950.0, 'Subtotal de cotización acumulado');
  assertEqual(result.tax_amount, 351.0, 'Monto de impuesto (18% de 1950.00)');
  assertEqual(result.total, 2301.0, 'Total final de cotización');

  // Caso 5: Descuento global adicional
  // Subtotal ítems = 1950.00; Descuento global = 100.00 -> Base imponible = 1850.00
  // Impuesto 18% de 1850.00 = 333.00
  // Total = 1850 + 333 = 2183.00
  const resultWithDiscount = QuoteCalculator.calculateQuote(items, 18.0, 100.0);
  assertEqual(resultWithDiscount.taxable_amount, 1850.0, 'Base imponible tras descuento global');
  assertEqual(resultWithDiscount.tax_amount, 333.0, 'Monto de impuesto con base imponible reducida');
  assertEqual(resultWithDiscount.total, 2183.0, 'Total final con descuento global');

  console.log('--- Todas las pruebas de QuoteCalculator superadas con éxito ---');
}

runTests();
