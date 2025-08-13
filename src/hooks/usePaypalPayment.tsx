import { useState } from "react";
import { toast } from "react-toastify";

export interface PaymentRequest {
    amount: number;
    currency: string;
    description: string;
}

export interface PaymentResponse {
    success: boolean;
    transactionId: string;
    amount: number;
    currency: string;
    timestamp: string;
    status: 'completed' | 'failed';
    message?: string;
}

export const usePaypalPayment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const submitPayment = async ({amount, currency}: PaymentRequest): Promise<PaymentResponse> => {
        setIsLoading(true);
        // Show pending toast when payment processing starts
        const pendingToastId = toast.info('Processing payment...', {
            autoClose: false,
            closeButton: false,
            draggable: false,
            closeOnClick: false,
            pauseOnHover: false,
        });
        
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsLoading(false);
        
        // Dismiss the pending toast
        toast.dismiss(pendingToastId);

        const isSuccessful = Math.random() < 0.9;
        
        if (isSuccessful) {
            return {
                success: true,
                transactionId: `txn_${Math.random().toString(36).substring(2, 10)}`,
                amount,
                currency,
                timestamp: new Date().toISOString(),
                status: 'completed'
            };
        } else {
            setIsError(true);
            return {
                success: false,
                transactionId: `${Math.random().toString(36).substring(2, 9)}`,
                amount,
                currency,
                timestamp: new Date().toISOString(),
                status: 'failed',
                message: 'Payment processing failed. Please try again.'
            };
        }
    };

    return { submitPayment, isLoading, isError };
}