'use client';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import type { EventFormData } from './step-basic-info';

const paymentOptions = [
  { value: 'VNPAY_QR', label: 'VNPay QR', description: 'Scan QR code to pay via VNPay' },
  { value: 'DOMESTIC_CARD', label: 'Domestic Card', description: 'ATM / Debit card (Vietnam)' },
  { value: 'INTERNATIONAL_CARD', label: 'International Card', description: 'Visa / Mastercard / JCB' },
  { value: 'PAYX_QR', label: 'PayX QR', description: 'Scan QR code to pay via PayX' },
  { value: 'PAYX_DOMESTIC', label: 'PayX Domestic', description: 'Domestic card via PayX' },
];

interface StepPaymentProps {
  formData: EventFormData;
  errors: Record<string, string>;
  onChange: (field: string, value: string[]) => void;
}

export function StepPayment({ formData, errors, onChange }: StepPaymentProps) {
  const togglePayment = (value: string) => {
    const current = formData.paymentMethods;
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange('paymentMethods', updated);
  };

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <div>
        <Label className="text-sm font-semibold">
          Payment Methods <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground mb-4">
          Select at least one payment method for ticket purchases.
        </p>
        <div className="grid gap-3">
          {paymentOptions.map((option) => {
            const isSelected = formData.paymentMethods.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => togglePayment(option.value)}
                className={`flex items-center gap-4 rounded-lg border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-input hover:border-primary/50 hover:bg-accent/50'
                }`}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground'
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>
        {errors.paymentMethods && (
          <p className="mt-2 text-sm text-destructive">{errors.paymentMethods}</p>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <h3 className="text-sm font-semibold mb-3">Summary</h3>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Event Name</span>
            <span className="font-medium">{formData.name || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sport</span>
            <Badge variant="secondary">{formData.sportType || '-'}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Prefix Code</span>
            <span className="font-mono font-medium">{formData.prefixCode || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Event Period</span>
            <span className="font-medium">
              {formData.eventStartTime
                ? new Date(formData.eventStartTime).toLocaleDateString()
                : '-'}
              {' ~ '}
              {formData.eventEndTime
                ? new Date(formData.eventEndTime).toLocaleDateString()
                : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Transfer</span>
            <Badge variant={formData.allowTransfer ? 'success' : 'secondary'}>
              {formData.allowTransfer ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground">Payment</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {formData.paymentMethods.length > 0
                ? formData.paymentMethods.map((m) => (
                    <Badge key={m} variant="outline" className="text-xs">
                      {paymentOptions.find((o) => o.value === m)?.label ?? m}
                    </Badge>
                  ))
                : <span className="text-muted-foreground">None selected</span>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function validatePayment(data: EventFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (data.paymentMethods.length === 0) {
    errors.paymentMethods = 'At least one payment method is required';
  }
  return errors;
}
