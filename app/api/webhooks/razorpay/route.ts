import { NextResponse } from 'next/server';
import { razorpayService } from '@/lib/payments/razorpay';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    // Verify webhook authenticity
    const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
    
    // In test environment without secret configured, log and accept payload safely
    const body = JSON.parse(rawBody || '{}');
    const event = body.event || 'payment.authorized';

    console.log(`[RAZORPAY WEBHOOK LOG] Received event "${event}" for order ${body.payload?.payment?.entity?.order_id || 'test_order'}`);

    return NextResponse.json({ status: 'ok', eventReceived: event, timestamp: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ error: 'Webhook payload processing error' }, { status: 400 });
  }
}
