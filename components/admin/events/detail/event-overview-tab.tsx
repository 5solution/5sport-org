'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EventResponseDto } from '@/lib/schemas/eventResponseDto';

const paymentLabels: Record<string, string> = {
  VNPAY_QR: 'VNPay QR',
  DOMESTIC_CARD: 'Domestic Card',
  INTERNATIONAL_CARD: 'International Card',
  PAYX_QR: 'PayX QR',
  PAYX_DOMESTIC: 'PayX Domestic',
};

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
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <InfoRow label="Event Name" value={event.name} />
          <InfoRow label="Brand" value={event.brand} />
          <InfoRow
            label="Sport Type"
            value={
              <Badge variant="outline">
                {event.sportType === 'PICKLEBALL' ? 'Pickleball' : 'Badminton'}
              </Badge>
            }
          />
          <InfoRow label="Hotline" value={event.hotline} />
          <InfoRow label="Address" value={event.address} />
          <InfoRow label="Province Code" value={event.provinceCode} />
          <InfoRow label="Ward Code" value={event.wardCode} />
          <InfoRow label="Prefix Code" value={<code className="font-mono">{event.prefixCode}</code>} />
          <InfoRow label="Slug" value={<code className="font-mono text-xs">{event.slug}</code>} />
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <InfoRow label="Event Start" value={<DateValue date={event.eventStartTime} />} />
          <InfoRow label="Event End" value={<DateValue date={event.eventEndTime} />} />
          <InfoRow label="Edit Info Open" value={<DateValue date={event.editInfoOpenTime} />} />
          <InfoRow label="Edit Info Close" value={<DateValue date={event.editInfoCloseTime} />} />
          <InfoRow label="Check-in Open" value={<DateValue date={event.checkinOpenTime} />} />
          <InfoRow label="Check-in Close" value={<DateValue date={event.checkinCloseTime} />} />
          <InfoRow
            label="Transfer"
            value={
              <Badge variant={event.allowTransfer ? 'success' : 'secondary'}>
                {event.allowTransfer ? 'Enabled' : 'Disabled'}
              </Badge>
            }
          />
          {event.allowTransfer && (
            <>
              <InfoRow label="Transfer Open" value={<DateValue date={event.transferOpenTime} />} />
              <InfoRow label="Transfer Close" value={<DateValue date={event.transferCloseTime} />} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {event.paymentMethods.map((method) => (
              <Badge key={method} variant="outline" className="text-sm">
                {paymentLabels[method] ?? method}
              </Badge>
            ))}
            {event.paymentMethods.length === 0 && (
              <span className="text-sm text-muted-foreground">No payment methods configured</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
