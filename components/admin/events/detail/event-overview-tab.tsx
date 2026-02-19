'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { Pencil, X, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { EventResponseDto } from '@/lib/schemas/eventResponseDto';
import {
  useEventControllerUpdate,
  getEventControllerFindOneQueryKey,
} from '@/lib/services/events/events';

const PAYMENT_METHOD_OPTIONS = [
  'VNPAY_QR',
  'DOMESTIC_CARD',
  'INTERNATIONAL_CARD',
  'PAYX_QR',
  'PAYX_DOMESTIC',
] as const;

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground sm:w-40 shrink-0">{label}</span>
      <span className="text-sm font-medium">{value || '-'}</span>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-2 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground sm:w-40 shrink-0">{label}</span>
      <div className="flex-1">{children}</div>
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

const toDatetimeLocal = (iso?: string) => (iso ? iso.slice(0, 16) : '');

function buildFormFromEvent(event: EventResponseDto) {
  return {
    name: event.name,
    brand: event.brand ?? '',
    sportType: event.sportType as string,
    hotline: event.hotline,
    address: event.address,
    provinceCode: event.provinceCode,
    wardCode: event.wardCode,
    prefixCode: event.prefixCode,
    slug: event.slug,
    allowTransfer: event.allowTransfer,
    eventStartTime: toDatetimeLocal(event.eventStartTime),
    eventEndTime: toDatetimeLocal(event.eventEndTime),
    editInfoOpenTime: toDatetimeLocal(event.editInfoOpenTime),
    editInfoCloseTime: toDatetimeLocal(event.editInfoCloseTime),
    checkinOpenTime: toDatetimeLocal(event.checkinOpenTime),
    checkinCloseTime: toDatetimeLocal(event.checkinCloseTime),
    transferOpenTime: toDatetimeLocal(event.transferOpenTime),
    transferCloseTime: toDatetimeLocal(event.transferCloseTime),
    paymentMethods: event.paymentMethods as string[],
  };
}

export function EventOverviewTab({ event }: { event: EventResponseDto }) {
  const t = useTranslations('admin.events');
  const tFields = useTranslations('admin.events.fields');
  const tPayment = useTranslations('admin.events.payment.methods');
  const tSports = useTranslations('common.sports');
  const tTransfer = useTranslations('common.transfer');

  const queryClient = useQueryClient();
  const updateMutation = useEventControllerUpdate();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => buildFormFromEvent(event));

  const paymentLabels: Record<string, string> = {
    VNPAY_QR: tPayment('vnpayQr'),
    DOMESTIC_CARD: tPayment('domesticCard'),
    INTERNATIONAL_CARD: tPayment('internationalCard'),
    PAYX_QR: tPayment('payxQr'),
    PAYX_DOMESTIC: tPayment('payxDomestic'),
  };

  const handleEdit = () => {
    setForm(buildFormFromEvent(event));
    setIsEditing(true);
  };

  const handleCancel = () => setIsEditing(false);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: event.id,
        data: {
          name: form.name,
          brand: form.brand || undefined,
          sportType: form.sportType as any,
          hotline: form.hotline,
          address: form.address,
          provinceCode: form.provinceCode,
          wardCode: form.wardCode,
          prefixCode: form.prefixCode,
          slug: form.slug,
          allowTransfer: form.allowTransfer,
          eventStartTime: form.eventStartTime ? new Date(form.eventStartTime).toISOString() : undefined,
          eventEndTime: form.eventEndTime ? new Date(form.eventEndTime).toISOString() : undefined,
          editInfoOpenTime: form.editInfoOpenTime ? new Date(form.editInfoOpenTime).toISOString() : undefined,
          editInfoCloseTime: form.editInfoCloseTime ? new Date(form.editInfoCloseTime).toISOString() : undefined,
          checkinOpenTime: form.checkinOpenTime ? new Date(form.checkinOpenTime).toISOString() : undefined,
          checkinCloseTime: form.checkinCloseTime ? new Date(form.checkinCloseTime).toISOString() : undefined,
          transferOpenTime: form.transferOpenTime ? new Date(form.transferOpenTime).toISOString() : undefined,
          transferCloseTime: form.transferCloseTime ? new Date(form.transferCloseTime).toISOString() : undefined,
          paymentMethods: form.paymentMethods as any[],
        },
      });
      queryClient.invalidateQueries({ queryKey: getEventControllerFindOneQueryKey(event.id) });
      toast.success('Event updated successfully!');
      setIsEditing(false);
    } catch { }
  };

  const setStr = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t('detail.basicInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {isEditing ? (
              <>
                <FieldRow label={tFields('eventName')}>
                  <Input value={form.name} onChange={setStr('name')} className="h-8 text-sm" />
                </FieldRow>
                <FieldRow label={tFields('brand')}>
                  <Input
                    value={form.brand}
                    onChange={setStr('brand')}
                    placeholder="Optional"
                    className="h-8 text-sm"
                  />
                </FieldRow>
                <FieldRow label={tFields('sportType')}>
                  <Select
                    value={form.sportType}
                    onValueChange={(v) => setForm((f) => ({ ...f, sportType: v }))}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PICKLEBALL">{tSports('pickleball')}</SelectItem>
                      <SelectItem value="BADMINTON">{tSports('badminton')}</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldRow>
                <FieldRow label={tFields('hotline')}>
                  <Input value={form.hotline} onChange={setStr('hotline')} className="h-8 text-sm" />
                </FieldRow>
                <FieldRow label={tFields('address')}>
                  <Input value={form.address} onChange={setStr('address')} className="h-8 text-sm" />
                </FieldRow>
                <FieldRow label={tFields('province')}>
                  <Input
                    value={form.provinceCode}
                    onChange={setStr('provinceCode')}
                    placeholder="Province code"
                    className="h-8 text-sm"
                  />
                </FieldRow>
                <FieldRow label={tFields('ward')}>
                  <Input
                    value={form.wardCode}
                    onChange={setStr('wardCode')}
                    placeholder="Ward code"
                    className="h-8 text-sm"
                  />
                </FieldRow>
                <FieldRow label={tFields('prefixCode')}>
                  <Input
                    value={form.prefixCode}
                    onChange={setStr('prefixCode')}
                    className="h-8 text-sm font-mono"
                  />
                </FieldRow>
                <FieldRow label={t('detail.slug')}>
                  <Input
                    value={form.slug}
                    onChange={setStr('slug')}
                    className="h-8 text-sm font-mono"
                  />
                </FieldRow>
              </>
            ) : (
              <>
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
                <InfoRow label={tFields('province')} value={event.provinceName || event.provinceCode} />
                <InfoRow label={tFields('ward')} value={event.wardName || event.wardCode} />
                <InfoRow
                  label={tFields('prefixCode')}
                  value={<code className="font-mono">{event.prefixCode}</code>}
                />
                <InfoRow
                  label={t('detail.slug')}
                  value={<code className="font-mono text-xs">{event.slug}</code>}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t('detail.timeline')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {isEditing ? (
              <>
                <FieldRow label={t('detail.eventStart')}>
                  <Input
                    type="datetime-local"
                    value={form.eventStartTime}
                    onChange={setStr('eventStartTime')}
                    className="h-8 text-sm"
                  />
                </FieldRow>
                <FieldRow label={t('detail.eventEnd')}>
                  <Input
                    type="datetime-local"
                    value={form.eventEndTime}
                    onChange={setStr('eventEndTime')}
                    className="h-8 text-sm"
                  />
                </FieldRow>
                <FieldRow label={t('detail.editInfoOpen')}>
                  <Input
                    type="datetime-local"
                    value={form.editInfoOpenTime}
                    onChange={setStr('editInfoOpenTime')}
                    className="h-8 text-sm"
                  />
                </FieldRow>
                <FieldRow label={t('detail.editInfoClose')}>
                  <Input
                    type="datetime-local"
                    value={form.editInfoCloseTime}
                    onChange={setStr('editInfoCloseTime')}
                    className="h-8 text-sm"
                  />
                </FieldRow>
                <FieldRow label={t('detail.checkinOpen')}>
                  <Input
                    type="datetime-local"
                    value={form.checkinOpenTime}
                    onChange={setStr('checkinOpenTime')}
                    className="h-8 text-sm"
                  />
                </FieldRow>
                <FieldRow label={t('detail.checkinClose')}>
                  <Input
                    type="datetime-local"
                    value={form.checkinCloseTime}
                    onChange={setStr('checkinCloseTime')}
                    className="h-8 text-sm"
                  />
                </FieldRow>
                <FieldRow label={t('detail.transfer')}>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.allowTransfer}
                      onCheckedChange={(v) => setForm((f) => ({ ...f, allowTransfer: v }))}
                    />
                    <span className="text-sm text-muted-foreground">
                      {form.allowTransfer ? tTransfer('enabled') : tTransfer('disabled')}
                    </span>
                  </div>
                </FieldRow>
                {form.allowTransfer && (
                  <>
                    <FieldRow label={t('detail.transferOpen')}>
                      <Input
                        type="datetime-local"
                        value={form.transferOpenTime}
                        onChange={setStr('transferOpenTime')}
                        className="h-8 text-sm"
                      />
                    </FieldRow>
                    <FieldRow label={t('detail.transferClose')}>
                      <Input
                        type="datetime-local"
                        value={form.transferCloseTime}
                        onChange={setStr('transferCloseTime')}
                        className="h-8 text-sm"
                      />
                    </FieldRow>
                  </>
                )}
              </>
            ) : (
              <>
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
            {isEditing ? (
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {PAYMENT_METHOD_OPTIONS.map((method) => (
                  <label key={method} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={form.paymentMethods.includes(method)}
                      onCheckedChange={(checked) =>
                        setForm((f) => ({
                          ...f,
                          paymentMethods: checked
                            ? [...f.paymentMethods, method]
                            : f.paymentMethods.filter((m) => m !== method),
                        }))
                      }
                    />
                    <span className="text-sm">{paymentLabels[method] ?? method}</span>
                  </label>
                ))}
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
