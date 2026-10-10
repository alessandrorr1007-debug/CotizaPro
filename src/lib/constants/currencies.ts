export interface CurrencyConfig {
  code: string;
  name: string;
  country: string;
  symbol: string;
  defaultTaxRate: number;
  taxName: string;
  taxIdLabel: string;
  taxIdPlaceholder: string;
}

export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  PEN: {
    code: 'PEN',
    name: 'Sol Peruano',
    country: 'Perú',
    symbol: 'S/',
    defaultTaxRate: 18.0,
    taxName: 'IGV (18%)',
    taxIdLabel: 'RUC (Perú)',
    taxIdPlaceholder: 'Ej: 20123456789',
  },
  USD: {
    code: 'USD',
    name: 'Dólar Estadounidense',
    country: 'Internacional / EE.UU.',
    symbol: '$',
    defaultTaxRate: 0.0,
    taxName: 'Tax / Sin Impuesto (0%)',
    taxIdLabel: 'Tax ID / EIN',
    taxIdPlaceholder: 'Ej: 12-3456789',
  },
  MXN: {
    code: 'MXN',
    name: 'Peso Mexicano',
    country: 'México',
    symbol: '$',
    defaultTaxRate: 16.0,
    taxName: 'IVA (16%)',
    taxIdLabel: 'RFC (México)',
    taxIdPlaceholder: 'Ej: ABC120315XYZ',
  },
  COP: {
    code: 'COP',
    name: 'Peso Colombiano',
    country: 'Colombia',
    symbol: '$',
    defaultTaxRate: 19.0,
    taxName: 'IVA (19%)',
    taxIdLabel: 'NIT (Colombia)',
    taxIdPlaceholder: 'Ej: 900.123.456-7',
  },
  CLP: {
    code: 'CLP',
    name: 'Peso Chileno',
    country: 'Chile',
    symbol: '$',
    defaultTaxRate: 19.0,
    taxName: 'IVA (19%)',
    taxIdLabel: 'RUT (Chile)',
    taxIdPlaceholder: 'Ej: 12.345.678-9',
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    country: 'España / Europa',
    symbol: '€',
    defaultTaxRate: 21.0,
    taxName: 'IVA (21%)',
    taxIdLabel: 'NIF / CIF (España)',
    taxIdPlaceholder: 'Ej: B12345678',
  },
};

export function getCurrencyConfig(currencyCode: string): CurrencyConfig {
  return (
    CURRENCY_CONFIGS[currencyCode] || {
      code: currencyCode,
      name: currencyCode,
      country: 'Internacional',
      symbol: '$',
      defaultTaxRate: 18.0,
      taxName: 'Impuesto / Tax',
      taxIdLabel: 'Identificación Fiscal',
      taxIdPlaceholder: 'Número de registro fiscal',
    }
  );
}
