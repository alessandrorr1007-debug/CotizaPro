// ============================================================================
// Pruebas unitarias para clientSchema
// ============================================================================

import { clientSchema } from '../src/lib/schemas/client.schema';

function runClientSchemaTests() {
  console.log('--- Iniciando pruebas de clientSchema ---');

  // Caso 1: Cliente válido con todos los campos
  const validClient = {
    name: 'Constructora del Sur S.A.',
    tax_id: '20501234567',
    email: 'contacto@constructora.com',
    phone: '+51 987654321',
    address: 'Av. Industrial 456, Lima',
    notes: 'Cliente preferencial con crédito a 30 días',
  };
  const res1 = clientSchema.safeParse(validClient);
  if (!res1.success) throw new Error(`FAIL: Cliente válido falló validación: ${res1.error}`);
  console.log('✓ PASS: Cliente completo válido');

  // Caso 2: Cliente mínimo solo con nombre
  const minimalClient = {
    name: 'Juan Pérez',
  };
  const res2 = clientSchema.safeParse(minimalClient);
  if (!res2.success) throw new Error(`FAIL: Cliente mínimo falló validación: ${res2.error}`);
  console.log('✓ PASS: Cliente con campos opcionales omitidos');

  // Caso 3: Nombre inválido (demasiado corto)
  const shortName = {
    name: 'A',
  };
  const res3 = clientSchema.safeParse(shortName);
  if (res3.success) throw new Error('FAIL: Debería fallar nombre de menos de 2 caracteres');
  console.log('✓ PASS: Validación de longitud mínima de nombre rechazada correctamente');

  // Caso 4: Email con formato inválido
  const invalidEmail = {
    name: 'Empresa ABC',
    email: 'correo-no-valido',
  };
  const res4 = clientSchema.safeParse(invalidEmail);
  if (res4.success) throw new Error('FAIL: Debería fallar email no válido');
  console.log('✓ PASS: Email no válido rechazado correctamente');

  // Caso 5: Email vacío string permitido
  const emptyEmail = {
    name: 'Empresa ABC',
    email: '',
  };
  const res5 = clientSchema.safeParse(emptyEmail);
  if (!res5.success) throw new Error(`FAIL: Email vacío debería ser admitido como opcional: ${res5.error}`);
  console.log('✓ PASS: Email vacío admitido como opcional');

  console.log('--- Todas las pruebas de clientSchema superadas con éxito ---');
}

runClientSchemaTests();
