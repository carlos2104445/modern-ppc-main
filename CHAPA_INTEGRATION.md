# Chapa Payment Gateway Integration

This document provides comprehensive information about the Chapa payment gateway integration in the modern-ppc application.

## Overview

Chapa is a payment gateway that allows businesses in Ethiopia to accept payments online. This integration supports:

- Payment initialization
- Payment verification
- Webhook notifications
- Transaction tracking
- Multiple payment methods (Mobile Money, Bank Transfer, Credit/Debit Cards)

## Features

### Backend Features

1. **Chapa Service** (`server/chapa.ts`)
   - Initialize payment requests
   - Verify payment transactions
   - Manage webhooks
   - Generate unique transaction references

2. **API Endpoints** (`server/routes.ts`)
   - `POST /api/chapa/initialize` - Initialize a new payment
   - `GET /api/chapa/verify/:txRef` - Verify a payment transaction
   - `POST /api/chapa/webhook` - Handle webhook notifications
   - `GET /api/chapa/payments` - Get all payments (with optional userId filter)
   - `GET /api/chapa/payments/:id` - Get payment by ID
   - `GET /api/chapa/payments/tx/:txRef` - Get payment by transaction reference
   - `POST /api/chapa/payments` - Create a payment record
   - `PATCH /api/chapa/payments/:id` - Update a payment record

3. **Database Schema**
   - `chapaPayments` table to store payment transactions
   - Tracks payment status, amount, currency, and payment method
   - Stores Chapa reference and checkout URL

4. **Storage Layer**
   - In-memory storage (`server/storage.ts`)
   - PostgreSQL storage (`server/pg-storage.ts`)
   - Full CRUD operations for Chapa payments

### Frontend Features

1. **Payment Dialog Component** (`client/src/components/chapa-payment-dialog.tsx`)
   - User-friendly payment form
   - Amount validation
   - Redirects to Chapa checkout page

2. **Payment Success Page** (`client/src/pages/payment-success.tsx`)
   - Automatic payment verification
   - Display transaction details
   - Success/failure feedback

3. **Payment Management Page** (`client/src/pages/chapa-payments.tsx`)
   - List all payment transactions
   - Filter by user
   - Refresh payments
   - Initiate new payments

## Setup Instructions

### Environment Variables

Add the following environment variables to your `.env` file:

```env
# Chapa Payment Gateway Configuration
CHAPA_SECRET_KEY=your-chapa-secret-key
CHAPA_WEBHOOK_SECRET=your-chapa-webhook-secret
APP_URL=http://localhost:5000
```

### Getting Chapa Credentials

1. Sign up for a Chapa account at [https://chapa.co/](https://chapa.co/)
2. Navigate to your dashboard
3. Go to API Settings
4. Copy your Secret Key
5. Generate a Webhook Secret for secure webhook verification

### Database Migration

If using PostgreSQL, run the following to create the `chapa_payments` table:

```bash
npm run db:push
```

This will create the table based on the schema defined in `shared/schema.ts`.

## Usage Examples

### Initialize a Payment (Backend)

```typescript
import { chapaService } from "./server/chapa";

const paymentRequest = {
  amount: "100.00",
  currency: "ETB",
  email: "customer@example.com",
  first_name: "John",
  last_name: "Doe",
  phone_number: "+251911000000",
  tx_ref: chapaService.generateTxRef(),
  callback_url: "https://yourdomain.com/api/chapa/callback",
  return_url: "https://yourdomain.com/payment/success",
  customization: {
    title: "Payment for Services",
    description: "Payment description",
  },
};

const response = await chapaService.initializePayment(paymentRequest);
console.log("Checkout URL:", response.data.checkout_url);
```

### Initialize a Payment (Frontend API Call)

```typescript
const response = await fetch("/api/chapa/initialize", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    userId: "user-123",
    amount: 100,
    currency: "ETB",
    email: "customer@example.com",
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "+251911000000",
  }),
});

const data = await response.json();
window.location.href = data.checkoutUrl; // Redirect to Chapa
```

### Verify a Payment

```typescript
const txRef = "tx-1234567890";
const verification = await chapaService.verifyPayment(txRef);

if (verification.status === "success") {
  console.log("Payment successful!");
  console.log("Amount:", verification.data.amount);
  console.log("Payment method:", verification.data.method);
}
```

### Handle Webhook Notifications

Chapa sends webhook notifications for successful payments. The webhook handler automatically:

1. Verifies the webhook signature
2. Updates the payment status in the database
3. Records payment method and charges

Configure your webhook URL in the Chapa dashboard:

```
https://yourdomain.com/api/chapa/webhook
```

## Frontend Integration

### Using the Payment Dialog

```tsx
import { ChapaPaymentDialog } from "@/components/chapa-payment-dialog";

function MyComponent() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button onClick={() => setShowDialog(true)}>Pay with Chapa</Button>

      <ChapaPaymentDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        userId="user-123"
        userEmail="user@example.com"
        userFirstName="John"
        userLastName="Doe"
        userPhoneNumber="+251911000000"
      />
    </>
  );
}
```

### Accessing Payment Management Page

Navigate to `/chapa-payments` to view all transactions and manage payments.

## Testing Locally

1. **Start the Development Server**

   ```bash
   npm run dev
   ```

2. **Access the Application**
   - Open http://localhost:5000 in your browser
   - Navigate to `/chapa-payments` to test the payment interface

3. **Test Payment Flow**
   - Click "New Payment" button
   - Enter an amount (minimum ETB 10.00)
   - Click "Pay" to be redirected to Chapa checkout
   - Complete the payment on Chapa's platform
   - You'll be redirected back to the success page

4. **Test API Endpoints**

   ```bash
   # Get all payments
   curl http://localhost:5000/api/chapa/payments

   # Initialize a payment
   curl -X POST http://localhost:5000/api/chapa/initialize \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "user-001",
       "amount": 100,
       "email": "test@example.com",
       "firstName": "John",
       "lastName": "Doe"
     }'

   # Verify a payment
   curl http://localhost:5000/api/chapa/verify/tx-reference-here
   ```

## Security Considerations

1. **API Keys**: Never commit your Chapa secret keys to version control
2. **Webhook Verification**: Always verify webhook signatures before processing
3. **HTTPS**: Use HTTPS in production for all API calls
4. **Input Validation**: All payment amounts and user data are validated before processing

## Payment Statuses

The integration tracks the following payment statuses:

- `pending` - Payment initiated but not yet completed
- `success` - Payment successfully completed
- `failed` - Payment failed or was cancelled

## Troubleshooting

### Common Issues

1. **"CHAPA_SECRET_KEY is not set"**
   - Ensure your `.env` file contains `CHAPA_SECRET_KEY`
   - Restart the development server after adding environment variables

2. **"Invalid webhook signature"**
   - Verify `CHAPA_WEBHOOK_SECRET` matches your Chapa dashboard settings
   - Ensure webhook URL is configured correctly in Chapa dashboard

3. **Payment verification fails**
   - Check that the transaction reference is correct
   - Ensure payment was completed on Chapa's platform
   - Check Chapa API status

## API Documentation Reference

For detailed Chapa API documentation, visit:

- [Chapa Developer Documentation](https://developer.chapa.co/)

## Support

For issues related to:

- **Chapa API**: Contact Chapa support at [https://chapa.co/](https://chapa.co/)
- **Integration**: Open an issue in the repository

## Future Enhancements

Potential improvements for the integration:

1. Support for payment splits and subaccounts
2. Recurring payment subscriptions
3. Payment analytics and reporting
4. Mobile money direct integration
5. Refund processing
6. Multi-currency support beyond ETB

## License

This integration is part of the modern-ppc project and follows the same license.
