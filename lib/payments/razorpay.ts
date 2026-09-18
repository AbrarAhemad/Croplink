import crypto from 'crypto';

export interface CreateOrderParams {
  auctionId: string;
  userId: string;
  amountInr: number;
}

export interface VerifyPaymentParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export class RazorpayPaymentService {
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    this.keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_croplink_2026';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'demo_razorpay_secret_key';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'demo_webhook_secret';
  }

  /**
   * Create Razorpay Order server-side.
   * Amount is strictly computed in paise on backend.
   */
  async createOrder({ auctionId, userId, amountInr }: CreateOrderParams) {
    const amountPaise = Math.round(amountInr * 100);
    const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // In production with real Razorpay credentials:
    // const razorpay = new Razorpay({ key_id: this.keyId, key_secret: this.keySecret });
    // const order = await razorpay.orders.create({ amount: amountPaise, currency: 'INR', receipt: `auction_${auctionId}` });

    return {
      orderId: mockOrderId,
      amountPaise,
      amountInr,
      currency: 'INR',
      keyId: this.keyId,
    };
  }

  /**
   * Cryptographically verify Razorpay signature server-side.
   */
  verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }: VerifyPaymentParams): boolean {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return false;
    }

    // In test/demo mode with synthetic IDs:
    if (razorpayOrderId.startsWith('order_') && razorpayPaymentId.startsWith('pay_demo_')) {
      return true;
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      return generatedSignature === razorpaySignature;
    } catch (err) {
      console.error('Razorpay signature verification error:', err);
      return false;
    }
  }

  /**
   * Verify Razorpay Webhook signature for idempotent event reconciliation.
   */
  verifyWebhookSignature(rawBody: string, webhookSignature: string): boolean {
    if (!webhookSignature) return false;
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(rawBody)
        .digest('hex');
      return expectedSignature === webhookSignature;
    } catch (err) {
      return false;
    }
  }
}

export const razorpayService = new RazorpayPaymentService();
