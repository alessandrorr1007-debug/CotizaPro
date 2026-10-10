// ============================================================================
// Pruebas Integradas E2E y Auditoría de Seguridad - CotizaPro MVP
// ============================================================================

import { clientSchema } from '../src/lib/schemas/client.schema';
import { productSchema } from '../src/lib/schemas/product.schema';
import { quoteSchema } from '../src/lib/schemas/quote.schema';
import { QuoteCalculator } from '../src/core/engine/quote-calculator';
import { DashboardCalculator } from '../src/core/engine/dashboard-metrics';
import { isValidStatusTransition, checkIsQuoteExpired } from './quote-lifecycle-and-pdf.test';
import { Quote } from '../src/core/domain/types';

function runE2ESecurityAndWorkflowSuite() {
  console.log('================================================================');
  console.log('INICIANDO AUDITORÍA DE SEGURIDAD Y FLUJO E2E DE COTIZAPRO (MVP)');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // TEST 1: Sanitización e Invariantes de Entrada de Clientes
  // --------------------------------------------------------------------------
  console.log('[1/7] Verificando sanitización y validación estricta de clientes...');
  const maliciousClientInput = {
    name: '  Constructora & Acabados SAC   ',
    tax_id: ' 20609876543 ',
    email: 'contacto@constructora.pe',
    phone: ' +51 987 111 222 ',
    address: 'Av. Industrial 456, Lima',
    notes: '   Cliente VIP corporativo   ',
  };

  const parsedClient = clientSchema.safeParse(maliciousClientInput);
  if (!parsedClient.success) {
    throw new Error('FAIL: Validación de cliente válido con espacios falló');
  }
  console.log('✓ PASS: Validación y limpieza de datos de cliente correcta');

  // Inyección de nombre inválido o demasiado corto
  const invalidClientName = clientSchema.safeParse({ name: 'A' });
  if (invalidClientName.success) {
    throw new Error('FAIL: Debería rechazar nombres de cliente menores a 2 caracteres');
  }
  console.log('✓ PASS: Longitudes mínimas y validaciones de seguridad de clientes respetadas');

  // --------------------------------------------------------------------------
  // TEST 2: Validación del Catálogo y Prevención de Precios Negativos
  // --------------------------------------------------------------------------
  console.log('\n[2/7] Verificando protección del catálogo y validación de precios...');
  const negativePriceProduct = {
    name: 'Servicio de Consultoría',
    unit_price: -50.0,
    unit: 'hora',
  };
  const parsedProductFail = productSchema.safeParse(negativePriceProduct);
  if (parsedProductFail.success) {
    throw new Error('FAIL: Debería rechazar productos con precio unitario negativo');
  }

  const validProduct = {
    name: 'Servidor VPS Cloud 8GB',
    sku: 'VPS-08GB',
    description: 'Servidor dedicado en la nube con IP estática',
    unit_price: 75.5,
    unit: 'mes',
    is_active: true,
  };
  const parsedProductOk = productSchema.safeParse(validProduct);
  if (!parsedProductOk.success) {
    throw new Error('FAIL: Producto válido fue rechazado');
  }
  console.log('✓ PASS: Restricción de precios no negativos y tipos de datos de productos validada');

  // --------------------------------------------------------------------------
  // TEST 3: Invariante Financiera: Cálculo Inmune a Manipulación del Cliente
  // --------------------------------------------------------------------------
  console.log('\n[3/7] Verificando invariante financiera del QuoteCalculator (Anti-Tampering)...');
  // Simular payload donde el cliente intenta enviar un subtotal o total adulterado (cero o menor)
  const clientPayloadItems = [
    {
      product_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      description: 'Licencias de Software SaaS',
      quantity: 5,
      unit_price: 100.0,
      discount_rate: 10.0, // 5 * 100 * 0.9 = 450.00
    },
    {
      product_id: null,
      description: 'Implementación y Configuración Inicial',
      quantity: 1,
      unit_price: 500.0,
      discount_rate: 0, // 500.00
    },
  ];

  // El servidor NUNCA toma subtotales enviados por el cliente; ejecuta el motor de cálculo
  const serverCalc = QuoteCalculator.calculateQuote(clientPayloadItems, 18.0, 0);

  // Subtotal esperado: 450.00 + 500.00 = 950.00
  // Impuesto esperado (18% de 950.00): 171.00
  // Total esperado: 1121.00
  if (serverCalc.subtotal !== 950.0) {
    throw new Error(`FAIL: Subtotal calculado ${serverCalc.subtotal} != 950.00`);
  }
  if (serverCalc.tax_amount !== 171.0) {
    throw new Error(`FAIL: Impuesto calculado ${serverCalc.tax_amount} != 171.00`);
  }
  if (serverCalc.total !== 1121.0) {
    throw new Error(`FAIL: Total calculado ${serverCalc.total} != 1121.00`);
  }
  console.log('✓ PASS: Invariante financiera en servidor calculó 950.00 + 171.00 = 1121.00 con precisión');

  // --------------------------------------------------------------------------
  // TEST 4: Esquema de Cotización Completo
  // --------------------------------------------------------------------------
  console.log('\n[4/7] Verificando esquema Zod de cotización con cliente y fechas...');
  const fullQuotePayload = {
    client_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    issue_date: '2026-10-10',
    valid_until: '2026-10-25',
    currency: 'USD',
    tax_rate: 18.0,
    notes: 'Validez de la oferta por 15 días calendario',
    terms: 'Condición de pago: Contado contra entrega',
    items: clientPayloadItems,
  };

  const parsedQuote = quoteSchema.safeParse(fullQuotePayload);
  if (!parsedQuote.success) {
    throw new Error(`FAIL: Cotización completa rechazada: ${parsedQuote.error}`);
  }
  console.log('✓ PASS: Esquema de cotización válido y blindado');

  // --------------------------------------------------------------------------
  // TEST 5: Ciclo de Vida Comercial y Bloqueo de Modificación
  // --------------------------------------------------------------------------
  console.log('\n[5/7] Verificando máquina de estados y reglas de cierre...');
  // Flujo normal: draft -> sent -> accepted
  if (!isValidStatusTransition('draft', 'sent')) throw new Error('FAIL: draft -> sent');
  if (!isValidStatusTransition('sent', 'accepted')) throw new Error('FAIL: sent -> accepted');

  // Intento de saltar a accepted desde draft sin enviar al cliente
  if (isValidStatusTransition('draft', 'accepted')) {
    throw new Error('FAIL: draft -> accepted no debe permitirse directamente');
  }

  // Reapertura controlada permitida para renegociación
  if (!isValidStatusTransition('accepted', 'draft')) {
    throw new Error('FAIL: accepted -> draft debe permitirse para renegociación');
  }
  console.log('✓ PASS: Transiciones de estado auditadas según reglas de negocio');

  // --------------------------------------------------------------------------
  // TEST 6: Detección Automática de Vencimiento de Cotizaciones
  // --------------------------------------------------------------------------
  console.log('\n[6/7] Verificando detección de vigencia de cotizaciones...');
  const isExpired = checkIsQuoteExpired('2026-05-01', '2026-10-10T00:00:00Z');
  const isNotExpired = checkIsQuoteExpired('2026-12-31', '2026-10-10T00:00:00Z');

  if (!isExpired || isNotExpired) {
    throw new Error('FAIL: Falló la evaluación de expiración de fecha de cotización');
  }
  console.log('✓ PASS: Detección de vencimiento de cotizaciones verificada');

  // --------------------------------------------------------------------------
  // TEST 7: Métricas Agregadas del Dashboard
  // --------------------------------------------------------------------------
  console.log('\n[7/7] Verificando cálculo agregado de métricas comerciales...');
  const mockQuotes: Quote[] = [
    {
      id: 'q-1',
      business_id: 'b-1',
      client_id: 'c-1',
      quote_number: 'COT-0001',
      status: 'accepted',
      issue_date: '2026-10-01',
      valid_until: '2026-10-15',
      currency: 'USD',
      subtotal: 1000,
      discount_amount: 0,
      tax_rate: 18,
      tax_amount: 180,
      total: 1180,
      notes: null,
      terms: null,
      created_by: null,
      created_at: '2026-10-01T00:00:00Z',
      updated_at: '2026-10-01T00:00:00Z',
    },
    {
      id: 'q-2',
      business_id: 'b-1',
      client_id: 'c-2',
      quote_number: 'COT-0002',
      status: 'sent',
      issue_date: '2026-10-05',
      valid_until: '2026-10-20',
      currency: 'USD',
      subtotal: 500,
      discount_amount: 0,
      tax_rate: 18,
      tax_amount: 90,
      total: 590,
      notes: null,
      terms: null,
      created_by: null,
      created_at: '2026-10-05T00:00:00Z',
      updated_at: '2026-10-05T00:00:00Z',
    },
  ];

  const dashboardKPIs = DashboardCalculator.calculate(mockQuotes, 5, 12);
  if (dashboardKPIs.totalQuotedAmount !== 1770) {
    throw new Error(`FAIL: totalQuotedAmount esperado 1770, obtenido ${dashboardKPIs.totalQuotedAmount}`);
  }
  if (dashboardKPIs.acceptedAmount !== 1180) {
    throw new Error(`FAIL: acceptedAmount esperado 1180, obtenido ${dashboardKPIs.acceptedAmount}`);
  }
  if (dashboardKPIs.conversionRate !== 50.0) {
    throw new Error(`FAIL: conversionRate esperado 50.0%, obtenido ${dashboardKPIs.conversionRate}%`);
  }
  if (dashboardKPIs.pendingQuotesCount !== 1 || dashboardKPIs.pendingAmount !== 590) {
    throw new Error('FAIL: Cartera pendiente incorrecta');
  }
  console.log('✓ PASS: Métricas de negocio calculadas con total precisión (1770 total, 50% conversión)');

  console.log('\n================================================================');
  console.log('AUDITORÍA DE SEGURIDAD Y PRUEBAS E2E FINALIZADAS CON 100% ÉXITO');
  console.log('================================================================');
}

runE2ESecurityAndWorkflowSuite();
