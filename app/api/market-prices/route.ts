import { NextResponse } from 'next/server';
import { agmarknetService } from '@/lib/market/agmarknet';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const crop = searchParams.get('crop') || undefined;
    const state = searchParams.get('state') || undefined;
    const district = searchParams.get('district') || undefined;
    const mandi = searchParams.get('mandi') || undefined;

    const prices = await agmarknetService.getMarketPrices({ crop, state, district, mandi });

    return NextResponse.json({
      success: true,
      count: prices.length,
      data: prices,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch AGMARKNET market prices' }, { status: 500 });
  }
}
