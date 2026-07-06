import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

export class MercadoPagoService {
  private client: MercadoPagoConfig;

  constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      // Allow initializing but operations will fail. Or throw error. 
      // It's usually better to warn and let it fail on usage, or throw.
      console.warn('MERCADOPAGO_ACCESS_TOKEN is not defined in environment variables');
    }

    this.client = new MercadoPagoConfig({
      accessToken: accessToken || '',
      options: { timeout: 5000 },
    });
  }

  /**
   * Creates a MercadoPago preference for a booking
   */
  async createPreference(
    bookingId: number, 
    amount: number, 
    title: string,
    payerEmail?: string
  ): Promise<string> {
    const preference = new Preference(this.client);
    
    const response = await preference.create({
      body: {
        items: [
          {
            id: `BOOKING_${bookingId}`,
            title: title,
            quantity: 1,
            unit_price: amount,
          },
        ],
        external_reference: bookingId.toString(),
        payer: payerEmail ? { email: payerEmail } : undefined,
        back_urls: {
          success: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/payments/success` : 'http://localhost:3000/payments/success',
          failure: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/payments/failure` : 'http://localhost:3000/payments/failure',
          pending: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/payments/pending` : 'http://localhost:3000/payments/pending',
        },
        auto_return: 'approved',
        notification_url: process.env.MERCADOPAGO_WEBHOOK_URL,
      },
    });

    if (!response.id) {
      throw new Error('Failed to create MercadoPago preference: No ID returned');
    }

    return response.id;
  }

  /**
   * Gets a payment by ID to verify its actual status
   */
  async getPayment(paymentId: number) {
    const payment = new Payment(this.client);
    return await payment.get({ id: paymentId });
  }
}
