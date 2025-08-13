import { useState, type ComponentProps } from 'react';
import { 
  PayPalScriptProvider, 
  PayPalButtons,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePayments } from '../hooks/usePayments';
import { usePaypalPayment, type PaymentResponse } from '../hooks/usePaypalPayment';

type PayPalButtonProps = ComponentProps<typeof PayPalButtons>;

const getStatusConfig = (status: string) => {
  const configs = {
    completed: {
      bg: 'bg-green-100 text-green-800 border-green-200',
      icon: <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    },
    pending: {
      bg: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: <svg className="w-3 h-3 mr-1 animate-spin" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
      </svg>
    },
    failed: {
      bg: 'bg-red-100 text-red-800 border-red-200',
      icon: <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    }
  };
  
  return configs[status as keyof typeof configs] || {
    bg: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  };
};

const PaymentForm = ({ onSuccess }: {onSuccess: (data: PaymentResponse) => void}) => {
  const [{isPending}] = usePayPalScriptReducer();
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [description, setDescription] = useState('');
  const { submitPayment } = usePaypalPayment();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Clean up leading zeros
    const cleanValue = value.replace(/^0+(?=\d)/, '');
    
    if (cleanValue === '') {
      setAmount('');
      setAmountError('');
      return;
    }
    
    if (cleanValue.startsWith('-')) {
      setAmountError('Amount cannot be negative');
      return;
    }
    
    const numValue = parseFloat(cleanValue);
    if (isNaN(numValue) || numValue <= 0) {
      setAmountError('Please enter a valid amount greater than 0');
      return;
    }
    
    setAmount(cleanValue);
    setAmountError('');
  };

  const handleCreateOrder: PayPalButtonProps['createOrder'] = (_, actions) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Invalid amount');
    }
    
    return actions.order.create({
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          value: amount,
          currency_code: 'USD'
        },
        description
      }],
    });
  };

  const handleApprove: PayPalButtonProps['onApprove'] = async (_, actions) => {
    try {
      if (!actions.order) {
        throw new Error('PayPal order actions not available');
      }
      
      await actions.order.capture();
      
      const response = await submitPayment({
        amount: parseFloat(amount),
        currency: 'USD',
        description
      });
      onSuccess(response);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount (USD)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              className={`block w-full pl-7 pr-12 py-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                amountError ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {amountError && (
              <p className="mt-1 text-sm text-red-600">{amountError}</p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter payment purpose"
          />
        </div>
      </div>
      
      {isPending ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading PayPal...</span>
        </div>
      ) : (
        <div className="pt-4">
          {amountError || !amount || parseFloat(amount) <= 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">Please enter a valid amount to proceed with payment</p>
            </div>
          ) : (
            <PayPalButtons
              style={{ 
                layout: "vertical",
                color: "blue",
                shape: "rect",
                label: "pay"
              }}
              createOrder={handleCreateOrder}
              onApprove={handleApprove}
            />
          )}
        </div>
      )}
    </div>
  );
};

const PayPalPayment = () => {
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null);
  const { totalAmount, addPayment } = usePayments();

  const onSuccess = (response: PaymentResponse) => {
    setPaymentResult(response);
    addPayment({
      amount: response.amount,
      date: new Date().toISOString(),
      result: response.success ? 'success' : 'failure',
    });
    
    if (response.success) {
      toast.success(`Payment successful! Amount: $${response.amount} ${response.currency}`);
    } else {
      toast.error(`Payment failed: ${response.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="py-8 w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">PayPal Payment Portal</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Secure and fast payments powered by PayPal. Complete your transaction with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Make a payment</h2>
                <p className="text-sm text-gray-600 mt-1">Enter payment details below</p>
              </div>
              <div className="p-6">
                <PayPalScriptProvider options={{ 
                  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
                  currency: "USD"
                }}>
                  <PaymentForm onSuccess={onSuccess} />
                </PayPalScriptProvider>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Account Summary</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Payments</span>
                  <span className="text-lg font-semibold text-gray-900">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Secure Payment</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Your payment information is encrypted and secure. PayPal protects your financial data with industry-leading security measures.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {paymentResult && (
          <div className="mt-8">
            <div className={`bg-white rounded-lg shadow-sm border ${
              paymentResult.success 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            } p-6`}>
              <div className="flex items-center mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  paymentResult.success 
                    ? 'bg-green-100' 
                    : 'bg-red-100'
                }`}>
                  {paymentResult.success ? (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <h3 className={`text-lg font-semibold ${
                  paymentResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  Payment {paymentResult.success ? 'Successful' : 'Failed'}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <div className="mt-1">
                    {(() => {
                      const config = getStatusConfig(paymentResult.status);
                      return (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.bg}`}>
                          {config.icon}
                          {paymentResult.status.charAt(0).toUpperCase() + paymentResult.status.slice(1)}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Transaction ID:</span>
                  <p className="text-sm text-gray-900 font-mono">{paymentResult.transactionId}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Amount:</span>
                  <p className="text-sm text-gray-900">${paymentResult.amount} {paymentResult.currency}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Timestamp:</span>
                  <p className="text-sm text-gray-900">{new Date(paymentResult.timestamp).toLocaleString()}</p>
                </div>
                {paymentResult.message && (
                  <div className="md:col-span-2">
                    <span className="text-sm font-medium text-gray-600">Message:</span>
                    <p className="text-sm text-gray-900">{paymentResult.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default PayPalPayment; 