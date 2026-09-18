import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { auctionId, userId, userRole, amountPerTon, isPaidRegistration, auctionStatus } = body;

    if (!auctionId || !userId) {
      return NextResponse.json({ error: 'Missing bid parameters' }, { status: 400 });
    }

    if (userRole === 'FARMER') {
      return NextResponse.json({ error: '403 Forbidden: Farmers cannot place bids on crop lots.' }, { status: 403 });
    }

    if (userRole === 'ADMIN') {
      return NextResponse.json({ error: '403 Forbidden: Admin operations accounts cannot place bids.' }, { status: 403 });
    }

    if (userRole !== 'INDUSTRY') {
      return NextResponse.json({ error: '403 Forbidden: Only verified industry buyers can place bids.' }, { status: 403 });
    }

    if (!isPaidRegistration) {
      return NextResponse.json({ error: '400 Bad Request: Paid auction registration (₹1,999) is required before placing bids.' }, { status: 400 });
    }

    if (auctionStatus !== 'AUCTION_LIVE') {
      return NextResponse.json({ error: '400 Bad Request: Auction is not currently live for bidding.' }, { status: 400 });
    }

    if (body.auctionEndsAt && new Date(body.auctionEndsAt).getTime() <= Date.now()) {
      return NextResponse.json({ error: '400 Bad Request: Auction duration has expired. Bidding is closed.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      bidId: `bid_${Date.now()}`,
      amountPerTon,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error processing bid' }, { status: 500 });
  }
}
