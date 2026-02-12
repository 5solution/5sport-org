'use client';

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
  return (
    <div className="space-y-6">
      {/* Event Duration */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Event Duration</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="eventStartTime">
              Start Time <span className="text-destructive">*</span>
            </Label>
            <Input
              id="eventStartTime"
              type="datetime-local"
              value={formData.eventStartTime}
              onChange={(e) => onChange('eventStartTime', e.target.value)}
            />
            {errors.eventStartTime && (
              <p className="text-sm text-destructive">{errors.eventStartTime}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventEndTime">
              End Time <span className="text-destructive">*</span>
            </Label>
            <Input
              id="eventEndTime"
              type="datetime-local"
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
        <h3 className="text-sm font-semibold text-foreground mb-3">Edit Info Period</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Time window for participants to edit their registration info.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="editInfoOpenTime">
              Open Time <span className="text-destructive">*</span>
            </Label>
            <Input
              id="editInfoOpenTime"
              type="datetime-local"
              value={formData.editInfoOpenTime}
              onChange={(e) => onChange('editInfoOpenTime', e.target.value)}
            />
            {errors.editInfoOpenTime && (
              <p className="text-sm text-destructive">{errors.editInfoOpenTime}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="editInfoCloseTime">
              Close Time <span className="text-destructive">*</span>
            </Label>
            <Input
              id="editInfoCloseTime"
              type="datetime-local"
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
        <h3 className="text-sm font-semibold text-foreground mb-3">Check-in Period</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="checkinOpenTime">
              Open Time <span className="text-destructive">*</span>
            </Label>
            <Input
              id="checkinOpenTime"
              type="datetime-local"
              value={formData.checkinOpenTime}
              onChange={(e) => onChange('checkinOpenTime', e.target.value)}
            />
            {errors.checkinOpenTime && (
              <p className="text-sm text-destructive">{errors.checkinOpenTime}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkinCloseTime">
              Close Time <span className="text-destructive">*</span>
            </Label>
            <Input
              id="checkinCloseTime"
              type="datetime-local"
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
            <h3 className="text-sm font-semibold text-foreground">Ticket Transfer</h3>
            <p className="text-xs text-muted-foreground">Allow participants to transfer tickets</p>
          </div>
          <Switch
            checked={formData.allowTransfer}
            onCheckedChange={(checked) => onChange('allowTransfer', checked)}
          />
        </div>
        {formData.allowTransfer && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="transferOpenTime">Transfer Open Time</Label>
              <Input
                id="transferOpenTime"
                type="datetime-local"
                value={formData.transferOpenTime}
                onChange={(e) => onChange('transferOpenTime', e.target.value)}
              />
              {errors.transferOpenTime && (
                <p className="text-sm text-destructive">{errors.transferOpenTime}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="transferCloseTime">Transfer Close Time</Label>
              <Input
                id="transferCloseTime"
                type="datetime-local"
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

export function validateTimeline(data: EventFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.eventStartTime) errors.eventStartTime = 'Start time is required';
  if (!data.eventEndTime) errors.eventEndTime = 'End time is required';
  if (!data.editInfoOpenTime) errors.editInfoOpenTime = 'Open time is required';
  if (!data.editInfoCloseTime) errors.editInfoCloseTime = 'Close time is required';
  if (!data.checkinOpenTime) errors.checkinOpenTime = 'Open time is required';
  if (!data.checkinCloseTime) errors.checkinCloseTime = 'Close time is required';

  if (data.eventStartTime && data.eventEndTime && data.eventStartTime >= data.eventEndTime) {
    errors.eventEndTime = 'End time must be after start time';
  }
  if (data.editInfoOpenTime && data.editInfoCloseTime && data.editInfoOpenTime >= data.editInfoCloseTime) {
    errors.editInfoCloseTime = 'Close time must be after open time';
  }
  if (data.checkinOpenTime && data.checkinCloseTime && data.checkinOpenTime >= data.checkinCloseTime) {
    errors.checkinCloseTime = 'Close time must be after open time';
  }

  if (data.allowTransfer) {
    if (!data.transferOpenTime) errors.transferOpenTime = 'Transfer open time is required';
    if (!data.transferCloseTime) errors.transferCloseTime = 'Transfer close time is required';
    if (data.transferOpenTime && data.transferCloseTime && data.transferOpenTime >= data.transferCloseTime) {
      errors.transferCloseTime = 'Close time must be after open time';
    }
  }

  return errors;
}
