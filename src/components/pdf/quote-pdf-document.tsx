import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { Business, Quote } from '@/core/domain/types';

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#334155',
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  businessTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  textMuted: {
    fontSize: 8,
    color: '#64748B',
  },
  quoteMetaBox: {
    alignItems: 'flex-end',
  },
  quoteBadge: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#4F46E5',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  quoteNumber: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  recipientBox: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recipientName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 3,
    marginBottom: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: 'right' },
  colPrice: { flex: 1.5, textAlign: 'right' },
  colDescRate: { flex: 1, textAlign: 'right' },
  colSubtotal: { flex: 1.5, textAlign: 'right' },

  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  termsBox: {
    flex: 3,
    paddingRight: 20,
  },
  termsTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
    marginBottom: 4,
  },
  termsText: {
    fontSize: 8,
    color: '#64748B',
    lineHeight: 1.3,
  },
  totalsBox: {
    flex: 2,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
  },
  totalFinalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
  },
  totalFinalValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#4F46E5',
  },
  signatureSection: {
    marginTop: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: 180,
    borderTopWidth: 1,
    borderTopColor: '#94A3B8',
    paddingTop: 6,
    alignItems: 'center',
  },
  signatureText: {
    fontSize: 8,
    color: '#64748B',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    textAlign: 'center',
    fontSize: 7,
    color: '#94A3B8',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
});

interface QuotePdfDocumentProps {
  quote: Quote;
  business: Business;
}

export function QuotePdfDocument({ quote, business }: QuotePdfDocumentProps) {
  const currency = quote.currency || 'USD';

  const formatPrice = (val: number) => `${currency} ${Number(val).toFixed(2)}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <View>
            <Text style={styles.businessTitle}>{business.name}</Text>
            {business.tax_id && (
              <Text style={styles.textMuted}>RUC/RFC: {business.tax_id}</Text>
            )}
            {business.address && (
              <Text style={styles.textMuted}>{business.address}</Text>
            )}
            <Text style={styles.textMuted}>
              {[business.email, business.phone].filter(Boolean).join(' · ')}
            </Text>
          </View>

          <View style={styles.quoteMetaBox}>
            <Text style={styles.quoteBadge}>Cotización Comercial</Text>
            <Text style={styles.quoteNumber}>{quote.quote_number}</Text>
            <Text style={styles.textMuted}>Fecha: {quote.issue_date}</Text>
            <Text style={styles.textMuted}>Válida hasta: {quote.valid_until}</Text>
          </View>
        </View>

        {/* Datos del Cliente */}
        <View style={styles.recipientBox}>
          <Text style={styles.sectionTitle}>Preparado para</Text>
          <Text style={styles.recipientName}>{quote.client?.name || 'Cliente'}</Text>
          {quote.client?.tax_id && (
            <Text style={styles.textMuted}>RUC/RFC: {quote.client.tax_id}</Text>
          )}
          {quote.client?.address && (
            <Text style={styles.textMuted}>Dirección: {quote.client.address}</Text>
          )}
          {quote.client?.email && (
            <Text style={styles.textMuted}>Email: {quote.client.email}</Text>
          )}
          {quote.client?.phone && (
            <Text style={styles.textMuted}>Tel: {quote.client.phone}</Text>
          )}
        </View>

        {/* Tabla de Conceptos */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Descripción</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Cant.</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>P. Unit</Text>
            <Text style={[styles.tableHeaderCell, styles.colDescRate]}>Desc.%</Text>
            <Text style={[styles.tableHeaderCell, styles.colSubtotal]}>Subtotal</Text>
          </View>

          {quote.items?.map((item, index) => (
            <View key={item.id || index} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatPrice(item.unit_price)}</Text>
              <Text style={styles.colDescRate}>
                {item.discount_rate > 0 ? `${item.discount_rate}%` : '—'}
              </Text>
              <Text style={[styles.colSubtotal, { fontFamily: 'Helvetica-Bold' }]}>
                {formatPrice(item.subtotal)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totales y Condiciones */}
        <View style={styles.totalsContainer}>
          <View style={styles.termsBox}>
            {quote.terms && (
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.termsTitle}>Términos y Condiciones:</Text>
                <Text style={styles.termsText}>{quote.terms}</Text>
              </View>
            )}
            {quote.notes && (
              <View>
                <Text style={styles.termsTitle}>Notas:</Text>
                <Text style={styles.termsText}>{quote.notes}</Text>
              </View>
            )}
          </View>

          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.textMuted}>Subtotal:</Text>
              <Text>{formatPrice(quote.subtotal)}</Text>
            </View>
            {quote.discount_amount > 0 && (
              <View style={styles.totalRow}>
                <Text style={[styles.textMuted, { color: '#059669' }]}>Descuento:</Text>
                <Text style={{ color: '#059669' }}>
                  -{formatPrice(quote.discount_amount)}
                </Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.textMuted}>Impuesto ({quote.tax_rate}%):</Text>
              <Text>{formatPrice(quote.tax_amount)}</Text>
            </View>
            <View style={styles.totalRowFinal}>
              <Text style={styles.totalFinalLabel}>Total:</Text>
              <Text style={styles.totalFinalValue}>{formatPrice(quote.total)}</Text>
            </View>
          </View>
        </View>

        {/* Firmas */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureText}>Emitido por: {business.name}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureText}>
              Aprobado por: {quote.client?.name || 'Cliente'}
            </Text>
          </View>
        </View>

        {/* Pie de Página */}
        <Text style={styles.footer}>
          Documento generado por CotizaPro — {quote.quote_number} · Validez sujeta a los términos especificados
        </Text>
      </Page>
    </Document>
  );
}
