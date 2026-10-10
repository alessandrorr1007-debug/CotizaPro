import { Quote, QuoteStatus } from '@/core/domain/types';

export interface DashboardMetrics {
  totalQuotedAmount: number;
  totalQuotesCount: number;
  acceptedAmount: number;
  acceptedQuotesCount: number;
  conversionRate: number; // Porcentaje de 0 a 100 con 1 decimal
  pendingAmount: number;
  pendingQuotesCount: number;
  statusBreakdown: Record<QuoteStatus, { count: number; amount: number; percentage: number }>;
  clientsCount: number;
  productsCount: number;
}

export class DashboardCalculator {
  /**
   * Calcula las métricas e indicadores de rendimiento comercial de forma determinista
   */
  public static calculate(
    quotes: Quote[],
    clientsCount: number = 0,
    productsCount: number = 0
  ): DashboardMetrics {
    const totalQuotesCount = quotes.length;

    let totalQuotedAmount = 0;
    let acceptedAmount = 0;
    let acceptedQuotesCount = 0;
    let pendingAmount = 0;
    let pendingQuotesCount = 0;

    const statusCounts: Record<QuoteStatus, number> = {
      draft: 0,
      sent: 0,
      accepted: 0,
      rejected: 0,
      expired: 0,
    };

    const statusAmounts: Record<QuoteStatus, number> = {
      draft: 0,
      sent: 0,
      accepted: 0,
      rejected: 0,
      expired: 0,
    };

    for (const quote of quotes) {
      const total = Number(quote.total) || 0;
      totalQuotedAmount += total;

      const status = quote.status || 'draft';
      if (status in statusCounts) {
        statusCounts[status] += 1;
        statusAmounts[status] += total;
      }

      if (status === 'accepted') {
        acceptedQuotesCount += 1;
        acceptedAmount += total;
      } else if (status === 'draft' || status === 'sent') {
        pendingQuotesCount += 1;
        pendingAmount += total;
      }
    }

    // Tasa de conversión: Cotizaciones aceptadas respecto al total (o 0 si no hay cotizaciones)
    const conversionRate =
      totalQuotesCount > 0
        ? Math.round((acceptedQuotesCount / totalQuotesCount) * 1000) / 10
        : 0;

    // Desglose porcentual por estado
    const statusBreakdown = (
      ['draft', 'sent', 'accepted', 'rejected', 'expired'] as QuoteStatus[]
    ).reduce(
      (acc, st) => {
        const count = statusCounts[st];
        const amount = Math.round(statusAmounts[st] * 100) / 100;
        const percentage =
          totalQuotesCount > 0
            ? Math.round((count / totalQuotesCount) * 1000) / 10
            : 0;
        acc[st] = { count, amount, percentage };
        return acc;
      },
      {} as Record<QuoteStatus, { count: number; amount: number; percentage: number }>
    );

    return {
      totalQuotedAmount: Math.round(totalQuotedAmount * 100) / 100,
      totalQuotesCount,
      acceptedAmount: Math.round(acceptedAmount * 100) / 100,
      acceptedQuotesCount,
      conversionRate,
      pendingAmount: Math.round(pendingAmount * 100) / 100,
      pendingQuotesCount,
      statusBreakdown,
      clientsCount,
      productsCount,
    };
  }
}
