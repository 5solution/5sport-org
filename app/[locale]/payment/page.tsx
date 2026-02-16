'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentMethodSelector, PaymentMethodType } from '@/components/payment/payment-method-selector';
import { QRPaymentDisplay } from '@/components/payment/qr-payment-display';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function PaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>();
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    amount: 100000, // 100,000 VND default
    orderId: `ORDER_${Date.now()}`,
    orderInfo: 'Payment for event registration',
  });

  // Mock available methods - in real app, fetch from event
  const availableMethods: PaymentMethodType[] = ['VNPAY_QR', 'PAYX_QR', 'PAYX_DOMESTIC'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? parseInt(value) : value,
    });
  };

  const handleCreatePayment = async () => {
    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Get client IP
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const clientIp = ipData.ip;

      // Create payment URL
      const response = await fetch(`${API_URL}/payments/create-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: formData.amount,
          orderId: formData.orderId,
          orderInfo: formData.orderInfo,
          ipAddr: clientIp,
          returnUrl: `${window.location.origin}/payment-return`,
          callbackUrl: `${API_URL}/payments/${paymentMethod.toLowerCase()}/callback`,
          paymentMethod: paymentMethod,
          displayMode: paymentMethod.startsWith('PAYX') ? 'merchant_hosted' : 'hosted_form',
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.paymentUrl) {
        // Redirect mode (VNPay or PAYX hostedform)
        window.location.href = data.paymentUrl;
      } else if (data.qrCodeData) {
        // Embedded mode (PAYX merchanthosted)
        setPaymentResult(data);
      } else {
        setError('Failed to create payment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    router.push(`/payment-success?orderId=${formData.orderId}`);
  };

  // Show QR payment display if payment was created in embedded mode
  if (paymentResult && paymentResult.qrCodeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900 p-4">
        <QRPaymentDisplay
          qrCodeData={paymentResult.qrCodeData}
          accountInfo={paymentResult.accountInfo}
          amount={paymentResult.amount}
          orderId={formData.orderId}
          expireDate={new Date(paymentResult.expireDate)}
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Payment Checkout</h1>
        <p className="text-center text-gray-600 mb-8">Complete your payment</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
        )}

        <div className="space-y-6">
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount (VND)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              min="1000"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-gray-900"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 1,000 VND</p>
          </div>

          {/* Order Info */}
          <div>
            <label htmlFor="orderInfo" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              id="orderInfo"
              name="orderInfo"
              value={formData.orderInfo}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-gray-900"
              disabled={loading}
            />
          </div>

          {/* Payment Method Selection */}
          <PaymentMethodSelector
            availableMethods={availableMethods}
            selected={paymentMethod}
            onSelect={setPaymentMethod}
          />

          {/* Submit Button */}
          <button
            onClick={handleCreatePayment}
            disabled={loading || !paymentMethod}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 'Continue to Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
