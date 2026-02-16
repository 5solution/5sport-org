'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export type PaymentMethodType = 'VNPAY_QR' | 'DOMESTIC_CARD' | 'INTERNATIONAL_CARD' | 'PAYX_QR' | 'PAYX_DOMESTIC';

interface PaymentMethodSelectorProps {
  availableMethods: PaymentMethodType[];
  onSelect: (method: PaymentMethodType) => void;
  selected?: PaymentMethodType;
}

export function PaymentMethodSelector({
  availableMethods,
  onSelect,
  selected,
}: PaymentMethodSelectorProps) {
  const paymentMethods = [
    {
      id: 'VNPAY_QR' as const,
      name: 'VNPay QR Code',
      description: 'Pay via VNPay QR Code',
      icon: '💳',
      provider: 'VNPay',
    },
    {
      id: 'DOMESTIC_CARD' as const,
      name: 'Domestic Card',
      description: 'Vietnamese bank cards',
      icon: '💳',
      provider: 'VNPay',
    },
    {
      id: 'INTERNATIONAL_CARD' as const,
      name: 'International Card',
      description: 'Visa, Mastercard, etc.',
      icon: '💳',
      provider: 'VNPay',
    },
    {
      id: 'PAYX_QR' as const,
      name: 'PAYX QR (VietQR)',
      description: 'Pay via bank transfer QR',
      icon: '📱',
      provider: 'PAYX',
    },
    {
      id: 'PAYX_DOMESTIC' as const,
      name: 'PAYX Domestic Card',
      description: 'Vietnamese cards via PAYX',
      icon: '💳',
      provider: 'PAYX',
    },
  ];

  const filteredMethods = paymentMethods.filter((m) => availableMethods.includes(m.id));

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">Select Payment Method</Label>
      <div className="grid gap-3">
        {filteredMethods.map((method) => (
          <Card
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              selected === method.id ? 'border-primary border-2 bg-primary/5' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">{method.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{method.name}</h3>
                  <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-gray-100">
                    {method.provider}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selected === method.id ? 'border-primary bg-primary' : 'border-gray-300'
                }`}
              >
                {selected === method.id && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
