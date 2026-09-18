import { NextResponse } from 'next/server';
import { razorpayService } from '@/lib/payments/razorpay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, auctionId, userId } = body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: 'Missing payment parameters' }, { status: 400 });
    }

    const isValid = razorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid Razorpay payment signature verification failed' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      status: 'PAID',
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error verifying Razorpay payment:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
