import React from 'react';
import { Badge } from '@/components/ui/badge';
import { QuoteStatus } from '@/core/domain/types';

interface QuoteStatusBadgeProps {
  status: QuoteStatus;
}

export function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
  const labels: Record<QuoteStatus, string> = {
    draft: 'Borrador',
    sent: 'Enviada',
    accepted: 'Aceptada',
    rejected: 'Rechazada',
    expired: 'Vencida',
  };

  return <Badge status={status}>{labels[status] || status}</Badge>;
}
