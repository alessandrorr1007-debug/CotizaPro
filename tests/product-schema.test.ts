// ============================================================================
// Pruebas unitarias para productSchema
// ============================================================================

import { productSchema } from '../src/lib/schemas/product.schema';

function runProductSchemaTests() {
  console.log('--- Iniciando pruebas de productSchema ---');

  // Caso 1: Producto estándar con todos los campos
  const validProduct = {
    name: 'Consultoría en Arquitectura Cloud',
    sku: 'SRV-CLOUD-01',
    description: 'Diseño e implementación de infraestructura AWS/Azure',
    unit_price: 150.0,
    unit: 'hora',
    is_active: true,
  };
  const res1 = productSchema.safeParse(validProduct);
  if (!res1.success) throw new Error(`FAIL: Producto completo falló: ${res1.error}`);
  console.log('✓ PASS: Producto completo válido');

  // Caso 2: Manejo de checkbox HTML (string "on" o "true")
  const formProduct = {
    name: 'Mantenimiento Mensual',
    unit_price: '250.50',
    unit: 'servicio',
    is_active: 'on',
  };
  const res2 = productSchema.safeParse(formProduct);
  if (!res2.success || res2.data.unit_price !== 250.5 || res2.data.is_active !== true) {
    throw new Error('FAIL: Coerción de FormData falló');
  }
  console.log('✓ PASS: Coerción de números y booleano desde FormData correcta');

  // Caso 3: Precio negativo no permitido
  const negativePriceProduct = {
    name: 'Producto Inválido',
    unit_price: -10,
  };
  const res3 = productSchema.safeParse(negativePriceProduct);
  if (res3.success) throw new Error('FAIL: Debería fallar precio negativo');
  console.log('✓ PASS: Precio negativo rechazado correctamente');

  // Caso 4: Nombre demasiado corto
  const shortNameProduct = {
    name: 'X',
    unit_price: 10,
  };
  const res4 = productSchema.safeParse(shortNameProduct);
  if (res4.success) throw new Error('FAIL: Debería fallar nombre de menos de 2 caracteres');
  console.log('✓ PASS: Nombre corto rechazado correctamente');

  console.log('--- Todas las pruebas de productSchema superadas con éxito ---');
}

runProductSchemaTests();
