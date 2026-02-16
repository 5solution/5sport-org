'use client';

import { useTranslations } from 'next-intl';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { EventFormData } from './step-basic-info';

interface StepTimelineProps {
  formData: EventFormData;
  errors: Record<string, string>;
  onChange: (field: string, value: string | boolean) => void;
}

export function StepTimeline({ formData, errors, onChange }: StepTimelineProps) {
  const t = useTranslations('admin.events.timeline');

  return (
    <div className="space-y-6">
      {/* Event Duration */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">{t('eventDuration')}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="eventStartTime">
              {t('startDate')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="eventStartTime"
              type="date"
              value={formData.eventStartTime}
              onChange={(e) => onChange('eventStartTime', e.target.value)}
            />
            {errors.eventStartTime && (
              <p className="text-sm text-destructive">{errors.eventStartTime}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventEndTime">
              {t('endDate')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="eventEndTime"
              type="date"
              value={formData.eventEndTime}
              onChange={(e) => onChange('eventEndTime', e.target.value)}
            />
            {errors.eventEndTime && (
              <p className="text-sm text-destructive">{errors.eventEndTime}</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Info Period */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">{t('editInfoPeriod')}</h3>
        <p className="text-xs text-muted-foreground mb-3">
          {t('editInfoDescription')}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="editInfoOpenTime">
              {t('openDate')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="editInfoOpenTime"
              type="date"
              value={formData.editInfoOpenTime}
              onChange={(e) => onChange('editInfoOpenTime', e.target.value)}
            />
            {errors.editInfoOpenTime && (
              <p className="text-sm text-destructive">{errors.editInfoOpenTime}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="editInfoCloseTime">
              {t('closeDate')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="editInfoCloseTime"
              type="date"
              value={formData.editInfoCloseTime}
              onChange={(e) => onChange('editInfoCloseTime', e.target.value)}
            />
            {errors.editInfoCloseTime && (
              <p className="text-sm text-destructive">{errors.editInfoCloseTime}</p>
            )}
          </div>
        </div>
      </div>

      {/* Check-in Period */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">{t('checkinPeriod')}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="checkinOpenTime">
              {t('openDate')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="checkinOpenTime"
              type="date"
              value={formData.checkinOpenTime}
              onChange={(e) => onChange('checkinOpenTime', e.target.value)}
            />
            {errors.checkinOpenTime && (
              <p className="text-sm text-destructive">{errors.checkinOpenTime}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkinCloseTime">
              {t('closeDate')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="checkinCloseTime"
              type="date"
              value={formData.checkinCloseTime}
              onChange={(e) => onChange('checkinCloseTime', e.target.value)}
            />
            {errors.checkinCloseTime && (
              <p className="text-sm text-destructive">{errors.checkinCloseTime}</p>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Period */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{t('ticketTransfer')}</h3>
            <p className="text-xs text-muted-foreground">{t('ticketTransferDescription')}</p>
          </div>
          <Switch
            checked={formData.allowTransfer}
            onCheckedChange={(checked) => onChange('allowTransfer', checked)}
          />
        </div>
        {formData.allowTransfer && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="transferOpenTime">{t('transferOpenDate')}</Label>
              <Input
                id="transferOpenTime"
                type="date"
                value={formData.transferOpenTime}
                onChange={(e) => onChange('transferOpenTime', e.target.value)}
              />
              {errors.transferOpenTime && (
                <p className="text-sm text-destructive">{errors.transferOpenTime}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="transferCloseTime">{t('transferCloseDate')}</Label>
              <Input
                id="transferCloseTime"
                type="date"
                value={formData.transferCloseTime}
                onChange={(e) => onChange('transferCloseTime', e.target.value)}
              />
              {errors.transferCloseTime && (
                <p className="text-sm text-destructive">{errors.transferCloseTime}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function validateTimeline(data: EventFormData, t: (key: string) => string): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.eventStartTime) errors.eventStartTime = t('startDateRequired');
  if (!data.eventEndTime) errors.eventEndTime = t('endDateRequired');
  if (!data.editInfoOpenTime) errors.editInfoOpenTime = t('openDateRequired');
  if (!data.editInfoCloseTime) errors.editInfoCloseTime = t('closeDateRequired');
  if (!data.checkinOpenTime) errors.checkinOpenTime = t('openDateRequired');
  if (!data.checkinCloseTime) errors.checkinCloseTime = t('closeDateRequired');

  if (data.eventStartTime && data.eventEndTime && data.eventStartTime > data.eventEndTime) {
    errors.eventEndTime = t('endDateAfterStart');
  }
  if (data.editInfoOpenTime && data.editInfoCloseTime && data.editInfoOpenTime > data.editInfoCloseTime) {
    errors.editInfoCloseTime = t('closeDateAfterOpen');
  }
  if (data.checkinOpenTime && data.checkinCloseTime && data.checkinOpenTime > data.checkinCloseTime) {
    errors.checkinCloseTime = t('closeDateAfterOpen');
  }

  if (data.allowTransfer) {
    if (!data.transferOpenTime) errors.transferOpenTime = t('transferOpenRequired');
    if (!data.transferCloseTime) errors.transferCloseTime = t('transferCloseRequired');
    if (data.transferOpenTime && data.transferCloseTime && data.transferOpenTime > data.transferCloseTime) {
      errors.transferCloseTime = t('closeDateAfterOpen');
    }
  }

  return errors;
}
