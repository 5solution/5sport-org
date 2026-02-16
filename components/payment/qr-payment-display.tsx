'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { Loader2, Clock } from 'lucide-react';

interface AccountInfo {
  accountNumber: string;
  accountName: string;
  bankShortName: string;
  bankFullName: string;
  transferDescription: string;
}

interface QRPaymentDisplayProps {
  qrCodeData: string;
  accountInfo: AccountInfo;
  amount: number;
  orderId: string;
  expireDate: Date;
  onPaymentComplete?: () => void;
}

export function QRPaymentDisplay({
  qrCodeData,
  accountInfo,
  amount,
  orderId,
  expireDate,
  onPaymentComplete,
}: QRPaymentDisplayProps) {
  const [qrImage, setQrImage] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Generate QR code image
    QRCode.toDataURL(qrCodeData, { width: 300 })
      .then(setQrImage)
      .catch(console.error);

    // Calculate time left
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expire = new Date(expireDate).getTime();
      return Math.max(0, Math.floor((expire - now) / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    // Update timer
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Poll payment status
    const pollInterval = setInterval(async () => {
      setChecking(true);
      try {
        const response = await fetch(`/api/payments/status/${orderId}`);
        const data = await response.json();

        if (data.status === 'success') {
          clearInterval(pollInterval);
          onPaymentComplete?.();
        }
      } catch (error) {
        console.error('Failed to check payment status', error);
      } finally {
        setChecking(false);
      }
    }, 5000); // Check every 5 seconds

    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
    };
  }, [qrCodeData, orderId, expireDate, onPaymentComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Scan QR to Pay</h2>
          <p className="text-muted-foreground">Use your banking app to scan the QR code below</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          {qrImage ? (
            <img src={qrImage} alt="Payment QR Code" className="rounded-lg shadow-lg" />
          ) : (
            <div className="w-[300px] h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
              <Loader2 className="animate-spin" />
            </div>
          )}
        </div>

        {/* Bank Info */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bank:</span>
            <span className="font-semibold">{accountInfo.bankShortName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Account Number:</span>
            <span className="font-mono font-semibold text-sm">{accountInfo.accountNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Account Name:</span>
            <span className="font-semibold text-sm">{accountInfo.accountName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-bold text-lg text-primary">{amount.toLocaleString()} VND</span>
          </div>
          <div className="flex justify-between items-start gap-2">
            <span className="text-muted-foreground">Transfer Content:</span>
            <span className="font-mono text-xs text-right">{accountInfo.transferDescription}</span>
          </div>
        </div>

        {/* Timer and Status */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time remaining:
            </span>
            <span className={`font-bold text-lg ${timeLeft < 300 ? 'text-red-500' : 'text-green-600'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          {checking && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking payment status...
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-2">
          <p className="font-semibold text-blue-900">Payment Instructions:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-800 text-xs">
            <li>Open your banking app</li>
            <li>Select "Transfer" or "Scan QR"</li>
            <li>Scan the QR code above</li>
            <li>Confirm the payment details</li>
            <li>Complete the transaction</li>
          </ol>
        </div>
      </div>
    </Card>
  );
}
