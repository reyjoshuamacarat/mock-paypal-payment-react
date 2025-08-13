import { useEffect, useState } from "react";

interface Payment {
    amount: number;
    date: string;
    result: 'success' | 'failure';
}

export const usePayments = () => {
    const [payments, setPayments] = useState<Payment[]>([]);

    useEffect(() => {
        const storedPayments = localStorage.getItem('payments');
        if (storedPayments) {
            setPayments(JSON.parse(storedPayments));
        } else {
            localStorage.setItem('payments', JSON.stringify([]));
        }
    }, []);

    const addPayment = (payment: Payment) => {
        const updatedPayments = [...payments, payment];
        setPayments(updatedPayments);
        localStorage.setItem('payments', JSON.stringify(updatedPayments));
    }

    const totalAmount = payments.reduce((sum, payment) => 
        payment.result === 'success' ? sum + payment.amount : sum, 0
    );

    return { addPayment, totalAmount };
}
