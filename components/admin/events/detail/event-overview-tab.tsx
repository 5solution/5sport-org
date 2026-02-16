'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EventResponseDto } from '@/lib/schemas/eventResponseDto';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground sm:w-40 shrink-0">{label}</span>
      <span className="text-sm font-medium">{value || '-'}</span>
    </div>
  );
}

function DateValue({ date }: { date?: string }) {
  if (!date) return <span className="text-muted-foreground">-</span>;
  return (
    <span>
      {new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}
    </span>
  );
}

export function EventOverviewTab({ event }: { event: EventResponseDto }) {
  const t = useTranslations('admin.events');
  const tFields = useTranslations('admin.events.fields');
  const tPayment = useTranslations('admin.events.payment.methods');
  const tSports = useTranslations('common.sports');
  const tTransfer = useTranslations('common.transfer');

  const paymentLabels: Record<string, string> = {
    VNPAY_QR: tPayment('vnpayQr'),
    DOMESTIC_CARD: tPayment('domesticCard'),
    INTERNATIONAL_CARD: tPayment('internationalCard'),
    PAYX_QR: tPayment('payxQr'),
    PAYX_DOMESTIC: tPayment('payxDomestic'),
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t('detail.basicInformation')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <InfoRow label={tFields('eventName')} value={event.name} />
          <InfoRow label={tFields('brand')} value={event.brand} />
          <InfoRow
            label={tFields('sportType')}
            value={
              <Badge variant="outline">
                {event.sportType === 'PICKLEBALL' ? tSports('pickleball') : tSports('badminton')}
              </Badge>
            }
          />
          <InfoRow label={tFields('hotline')} value={event.hotline} />
          <InfoRow label={tFields('address')} value={event.address} />
          <InfoRow label={t('detail.provinceCode')} value={event.provinceCode} />
          <InfoRow label={t('detail.wardCode')} value={event.wardCode} />
          <InfoRow label={tFields('prefixCode')} value={<code className="font-mono">{event.prefixCode}</code>} />
          <InfoRow label={t('detail.slug')} value={<code className="font-mono text-xs">{event.slug}</code>} />
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t('detail.timeline')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <InfoRow label={t('detail.eventStart')} value={<DateValue date={event.eventStartTime} />} />
          <InfoRow label={t('detail.eventEnd')} value={<DateValue date={event.eventEndTime} />} />
          <InfoRow label={t('detail.editInfoOpen')} value={<DateValue date={event.editInfoOpenTime} />} />
          <InfoRow label={t('detail.editInfoClose')} value={<DateValue date={event.editInfoCloseTime} />} />
          <InfoRow label={t('detail.checkinOpen')} value={<DateValue date={event.checkinOpenTime} />} />
          <InfoRow label={t('detail.checkinClose')} value={<DateValue date={event.checkinCloseTime} />} />
          <InfoRow
            label={t('detail.transfer')}
            value={
              <Badge variant={event.allowTransfer ? 'success' : 'secondary'}>
                {event.allowTransfer ? tTransfer('enabled') : tTransfer('disabled')}
              </Badge>
            }
          />
          {event.allowTransfer && (
            <>
              <InfoRow label={t('detail.transferOpen')} value={<DateValue date={event.transferOpenTime} />} />
              <InfoRow label={t('detail.transferClose')} value={<DateValue date={event.transferCloseTime} />} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t('detail.paymentMethods')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {event.paymentMethods.map((method) => (
              <Badge key={method} variant="outline" className="text-sm">
                {paymentLabels[method] ?? method}
              </Badge>
            ))}
            {event.paymentMethods.length === 0 && (
              <span className="text-sm text-muted-foreground">{t('detail.noPaymentMethods')}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
