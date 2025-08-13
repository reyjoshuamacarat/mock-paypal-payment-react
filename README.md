# PayPal Payment Portal

A simple React application that allows users to make payments using PayPal. Users can enter an amount and description, then complete their payment through PayPal's secure payment system.

## What it does

- **Payment Processing**: Users can enter payment amounts and descriptions
- **PayPal Integration**: Secure payment processing through PayPal
- **Payment History**: Tracks total payments made
- **Real-time Feedback**: Shows payment status and transaction details
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up PayPal credentials**
   Create a `.env.local` file and add your PayPal Client ID:
   ```env
   VITE_PAYPAL_CLIENT_ID=your_paypal_client_id_here
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

The app will be available at `http://localhost:5173`

## Usage

1. Enter the payment amount in USD
2. Add a description for the payment
3. Click the PayPal button to complete the transaction
4. View payment results and transaction details

## Built With

- React + TypeScript
- Toastify
- PayPal React SDK
- Tailwind CSS
- Vite
