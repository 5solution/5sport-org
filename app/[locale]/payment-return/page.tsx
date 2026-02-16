'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function PaymentReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Handle null searchParams
        if (!searchParams) {
          setStatus('failed');
          return;
        }

        // Convert query params to object
        const params = Object.fromEntries(searchParams);

        // Verify with backend
        const response = await fetch(`${API_URL}/payments/return?${searchParams.toString()}`);
        const data = await response.json();

        if (data.isSuccess) {
          setStatus('success');
          setPaymentInfo({
            orderId: data.vnp_TxnRef,
            amount: data.vnp_Amount ? data.vnp_Amount / 100 : 'N/A',
            transactionCode: data.vnp_TransactionNo,
            message: data.message,
          });
        } else {
          setStatus('failed');
          setPaymentInfo({
            message: data.message || 'Payment verification failed',
          });
        }
      } catch (error) {
        setStatus('failed');
        setPaymentInfo({
          message: 'An error occurred during verification',
        });
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Verifying Payment</h1>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {status === 'success' ? (
          <>
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-4">
                  <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
              <p className="text-gray-600">{paymentInfo?.message}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg mb-6 space-y-3">
              {paymentInfo?.orderId && (
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold text-gray-900">{paymentInfo.orderId}</p>
                </div>
              )}
              {paymentInfo?.amount && (
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-semibold text-gray-900">{paymentInfo.amount.toLocaleString()} VND</p>
                </div>
              )}
              {paymentInfo?.transactionCode && (
                <div>
                  <p className="text-sm text-gray-600">Transaction Code</p>
                  <p className="font-semibold text-gray-900 text-sm break-all">{paymentInfo.transactionCode}</p>
                </div>
              )}
            </div>

            <Link href="/">
              <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Return Home
              </button>
            </Link>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100 p-4">
                  <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-red-600 mb-2">Payment Failed</h1>
              <p className="text-gray-600">{paymentInfo?.message}</p>
            </div>

            <div className="space-y-3">
              <Link href="/payment">
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Try Again
                </button>
              </Link>
              <Link href="/">
                <button className="w-full bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors">
                  Return Home
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
