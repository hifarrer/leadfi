# Stripe Webhook Setup Guide

This guide explains how to configure Stripe webhooks for your LeadFind application.

## Webhook Endpoint URL

Your webhook endpoint URL should be:
```
https://yourdomain.com/api/webhooks/stripe
```

For local development (using Stripe CLI):
```
http://localhost:3000/api/webhooks/stripe
```

## Required Webhook Events

Configure your Stripe webhook to listen for the following events:

1. **checkout.session.completed** - Triggered when a customer successfully completes a checkout session
2. **customer.subscription.created** - Triggered when a subscription is created (handles cases where checkout.session.completed metadata might be missing)
3. **customer.subscription.updated** - Triggered when a subscription is updated (plan change, etc.)
4. **customer.subscription.deleted** - Triggered when a subscription is canceled
5. **invoice.payment_succeeded** - Triggered when a subscription payment succeeds
6. **invoice.payment_failed** - Triggered when a subscription payment fails

## Setting Up Webhooks in Stripe Dashboard

### For Production:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select the events listed above (or select "Select events" and choose them individually)
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Go to your admin panel → **Stripe Settings** → Paste the webhook secret and save

### For Local Development (using Stripe CLI):

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret that appears (starts with `whsec_`)
5. Go to your admin panel → **Stripe Settings** → Paste the webhook secret and save

## Testing Webhooks Locally

1. Start your development server:
   ```bash
   npm run dev
   ```
2. In another terminal, run Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. Trigger test events:
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger customer.subscription.updated
   stripe trigger customer.subscription.deleted
   ```

## Webhook Security

The webhook handler verifies the webhook signature using the webhook secret stored in your database. This ensures that:

- The webhook request is actually from Stripe
- The payload hasn't been tampered with
- The request is legitimate

**Important**: Never expose your webhook secret. It's stored securely in your database and only used server-side.

## What Happens When Webhooks Are Received

### checkout.session.completed
- Updates the user's plan in the database based on the subscription metadata

### customer.subscription.updated
- Updates the user's plan if they changed plans

### customer.subscription.deleted
- Removes the user's plan (sets planId to null)

### invoice.payment_succeeded
- Ensures the user's plan is up to date after successful payment

### invoice.payment_failed
- Logs the payment failure (you can extend this to send email notifications)

## Troubleshooting

### Webhook Not Receiving Events

1. Check that your webhook endpoint URL is correct
2. Verify the webhook secret is correctly saved in admin settings
3. Check your server logs for errors
4. Use Stripe Dashboard → Webhooks → Select your endpoint → View logs

### Signature Verification Failed

1. Ensure the webhook secret in your database matches the one from Stripe Dashboard
2. Make sure you're using the correct secret (test vs live mode)
3. Check that the request body is being read correctly (not parsed as JSON before verification)

### Events Not Processing

1. Check server logs for errors
2. Verify the event types are selected in Stripe Dashboard
3. Ensure your database connection is working
4. Check that user IDs and plan IDs in metadata are valid

## Production Checklist

- [ ] Webhook endpoint URL is set to your production domain
- [ ] All required events are selected
- [ ] Webhook secret is saved in admin settings
- [ ] Test webhook events are working
- [ ] Error logging is configured
- [ ] Monitor webhook delivery in Stripe Dashboard

## Additional Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Webhook Security Best Practices](https://stripe.com/docs/webhooks/signatures)

