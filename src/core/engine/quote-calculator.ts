// ============================================================================
// CotizaPro — Motor Determinista de Cálculos Financieros
// ============================================================================

export interface RawQuoteItemInput {
  product_id?: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  discount_rate?: number; // 0 a 100
  sort_order?: number;
}

export interface CalculatedQuoteItem {
  product_id?: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  discount_rate: number;
  subtotal: number;
  sort_order: number;
}

export interface QuoteCalculationResult {
  items: CalculatedQuoteItem[];
  subtotal: number;
  discount_amount: number;
  taxable_amount: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
}

export class QuoteCalculator {
  /**
   * Redondeo bancario / aritmético estándar a N decimales
   */
  public static round(value: number, decimals: number = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  /**
   * Calcula el subtotal neto de una línea de cotización
   */
  public static calculateItemSubtotal(
    quantity: number,
    unitPrice: number,
    discountRate: number = 0
  ): number {
    const safeQty = Math.max(0, quantity);
    const safePrice = Math.max(0, unitPrice);
    const safeDiscountRate = Math.min(100, Math.max(0, discountRate));

    const gross = safeQty * safePrice;
    const discount = gross * (safeDiscountRate / 100);
    const net = gross - discount;

    return this.round(net, 2);
  }

  /**
   * Ejecuta el cálculo completo de la cotización garantizando consistencia
   * en el servidor sin confiar en cálculos del cliente.
   */
  public static calculateQuote(
    rawItems: RawQuoteItemInput[],
    taxRate: number = 18.0,
    globalDiscountAmount: number = 0
  ): QuoteCalculationResult {
    const safeTaxRate = Math.min(100, Math.max(0, taxRate));
    const safeGlobalDiscount = Math.max(0, globalDiscountAmount);

    let accumulatedSubtotal = 0;
    let accumulatedItemDiscounts = 0;

    const calculatedItems: CalculatedQuoteItem[] = rawItems.map((item, index) => {
      const qty = Math.max(0, Number(item.quantity) || 0);
      const price = Math.max(0, Number(item.unit_price) || 0);
      const discountRate = Math.min(100, Math.max(0, Number(item.discount_rate) || 0));

      const gross = qty * price;
      const discount = gross * (discountRate / 100);
      const subtotal = this.calculateItemSubtotal(qty, price, discountRate);

      accumulatedSubtotal += subtotal;
      accumulatedItemDiscounts += discount;

      return {
        product_id: item.product_id || null,
        description: (item.description || '').trim(),
        quantity: this.round(qty, 2),
        unit_price: this.round(price, 2),
        discount_rate: this.round(discountRate, 2),
        subtotal,
        sort_order: item.sort_order ?? index,
      };
    });

    const subtotal = this.round(accumulatedSubtotal, 2);
    const totalDiscount = this.round(accumulatedItemDiscounts + safeGlobalDiscount, 2);

    // Base imponible: el subtotal de ítems menos descuentos globales aplicados
    const taxableAmount = Math.max(0, this.round(subtotal - safeGlobalDiscount, 2));

    // Impuesto (IVA/IGV)
    const taxAmount = this.round(taxableAmount * (safeTaxRate / 100), 2);

    // Total final
    const total = this.round(taxableAmount + taxAmount, 2);

    return {
      items: calculatedItems,
      subtotal,
      discount_amount: totalDiscount,
      taxable_amount: taxableAmount,
      tax_rate: this.round(safeTaxRate, 2),
      tax_amount: taxAmount,
      total,
    };
  }
}
