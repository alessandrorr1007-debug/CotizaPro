// ============================================================================
// Pruebas unitarias para DashboardCalculator (Métricas y KPIs)
// ============================================================================

import { DashboardCalculator } from '../src/core/engine/dashboard-metrics';
import { Quote } from '../src/core/domain/types';

function createMockQuote(id: string, status: Quote['status'], total: number): Quote {
  return {
    id,
    business_id: 'b-1',
    client_id: 'c-1',
    quote_number: `COT-000${id}`,
    status,
    issue_date: '2026-10-10',
    valid_until: '2026-10-25',
    currency: 'USD',
    subtotal: total / 1.18,
    discount_amount: 0,
    tax_rate: 18,
    tax_amount: total - total / 1.18,
    total,
    notes: null,
    terms: null,
    created_by: null,
    created_at: '2026-10-10T00:00:00Z',
    updated_at: '2026-10-10T00:00:00Z',
  };
}

function runDashboardMetricsTests() {
  console.log('--- Iniciando pruebas de DashboardCalculator ---');

  // Caso 1: Sin cotizaciones (Valores iniciales en cero y sin división por cero)
  const emptyMetrics = DashboardCalculator.calculate([], 0, 0);
  if (
    emptyMetrics.totalQuotedAmount !== 0 ||
    emptyMetrics.totalQuotesCount !== 0 ||
    emptyMetrics.conversionRate !== 0 ||
    emptyMetrics.acceptedQuotesCount !== 0 ||
    emptyMetrics.pendingQuotesCount !== 0
  ) {
    throw new Error('FAIL: Métricas iniciales deberían ser todas 0 sin cotizaciones');
  }
  console.log('✓ PASS: Manejo seguro y determinista de métricas vacías');

  // Caso 2: Cotizaciones con diversos estados
  const quotes: Quote[] = [
    createMockQuote('1', 'draft', 100),
    createMockQuote('2', 'sent', 200),
    createMockQuote('3', 'accepted', 500),
    createMockQuote('4', 'accepted', 300),
    createMockQuote('5', 'rejected', 150),
    createMockQuote('6', 'expired', 250),
  ];

  const metrics = DashboardCalculator.calculate(quotes, 10, 25);

  // Total Quoted: 100 + 200 + 500 + 300 + 150 + 250 = 1500
  if (metrics.totalQuotedAmount !== 1500) {
    throw new Error(`FAIL: totalQuotedAmount esperado 1500, obtenido ${metrics.totalQuotedAmount}`);
  }
  if (metrics.totalQuotesCount !== 6) {
    throw new Error(`FAIL: totalQuotesCount esperado 6, obtenido ${metrics.totalQuotesCount}`);
  }
  console.log('✓ PASS: Cálculo de volumen total cotizado correcto (1500 USD en 6 cotizaciones)');

  // Aceptadas: 2 cotizaciones, monto = 500 + 300 = 800
  if (metrics.acceptedQuotesCount !== 2 || metrics.acceptedAmount !== 800) {
    throw new Error(
      `FAIL: Aceptadas esperadas (2, 800), obtenido (${metrics.acceptedQuotesCount}, ${metrics.acceptedAmount})`
    );
  }
  console.log('✓ PASS: Cálculo de cotizaciones aceptadas y facturables correcto');

  // Tasa de conversión: 2 de 6 = 33.3%
  if (metrics.conversionRate !== 33.3) {
    throw new Error(`FAIL: Tasa de conversión esperada 33.3%, obtenida ${metrics.conversionRate}%`);
  }
  console.log('✓ PASS: Tasa de conversión calculada correctamente (33.3%)');

  // Pendientes: draft(100) + sent(200) = 300 en 2 cotizaciones
  if (metrics.pendingQuotesCount !== 2 || metrics.pendingAmount !== 300) {
    throw new Error(
      `FAIL: Pendientes esperadas (2, 300), obtenido (${metrics.pendingQuotesCount}, ${metrics.pendingAmount})`
    );
  }
  console.log('✓ PASS: Cálculo de cartera pendiente (borradores y enviadas) correcto');

  // Desglose por estados
  if (metrics.statusBreakdown.accepted.count !== 2 || metrics.statusBreakdown.accepted.percentage !== 33.3) {
    throw new Error('FAIL: Desglose de estado aceptada incorrecto');
  }
  if (metrics.statusBreakdown.rejected.count !== 1 || metrics.statusBreakdown.rejected.amount !== 150) {
    throw new Error('FAIL: Desglose de estado rechazada incorrecto');
  }
  console.log('✓ PASS: Desglose de estados y porcentajes verificado');

  // Clientes y productos
  if (metrics.clientsCount !== 10 || metrics.productsCount !== 25) {
    throw new Error('FAIL: Conteo de clientes o productos incorrecto');
  }
  console.log('✓ PASS: Conteos de clientes y catálogo validados');

  console.log('--- Todas las pruebas de DashboardCalculator superadas con éxito ---');
}

runDashboardMetricsTests();
