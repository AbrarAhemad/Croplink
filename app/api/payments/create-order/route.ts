import { NextResponse } from 'next/server';
import { razorpayService } from '@/lib/payments/razorpay';
import { UserRole } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { auctionId, userId, userRole } = body;

    if (!auctionId || !userId) {
      return NextResponse.json({ error: 'Missing required parameters (auctionId, userId)' }, { status: 400 });
    }

    // Server-Side Role Authorization Check
    const role: UserRole = userRole || 'INDUSTRY';

    if (role === 'FARMER') {
      return NextResponse.json(
        { error: '403 Forbidden: Only approved industry users can register and pay for auctions.' },
        { status: 403 }
      );
    }

    if (role === 'ADMIN') {
      return NextResponse.json(
        { error: '403 Forbidden: Admin accounts cannot pay or register as auction bidders.' },
        { status: 403 }
      );
    }

    if (role !== 'INDUSTRY') {
      return NextResponse.json(
        { error: '403 Forbidden: Only approved industry accounts can create payment orders.' },
        { status: 403 }
      );
    }

    // Amount is strictly locked to ₹1,999 on the server (199900 paise)
    const order = await razorpayService.createOrder({
      auctionId,
      userId,
      amountInr: 1999,
    });

    return NextResponse.json(order);
  } catch (err: any) {
    console.error('Error creating Razorpay order:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
