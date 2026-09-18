import { NextResponse } from 'next/server';
import { DEMO_AUCTIONS, DEMO_BIDS } from '@/lib/store/demo-store';
import { getFarmerIdentityView, getIndustryIdentityView } from '@/lib/identity-helpers';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const role = (searchParams.get('role') as 'ADMIN' | 'FARMER' | 'INDUSTRY') || 'INDUSTRY';

  // Apply server-side role filtering according to rules 9, 10, 11
  const sanitizedAuctions = DEMO_AUCTIONS.map(auc => {
    const farmerIdentity = getFarmerIdentityView(auc, role);
    const auctionBids = DEMO_BIDS.filter(b => b.auctionId === auc.id).map(bid => {
      const industryIdentity = getIndustryIdentityView(bid, role);
      return {
        id: bid.id,
        auctionId: bid.auctionId,
        amountPerTon: bid.amountPerTon,
        totalAmount: bid.totalAmount,
        createdAt: bid.createdAt,
        status: bid.status,
        bidder: industryIdentity,
      };
    });

    return {
      id: auc.id,
      crop: auc.crop,
      variety: auc.variety,
      quantityTons: auc.quantityTons,
      qualityGrade: auc.qualityGrade,
      locationArea: auc.locationArea,
      basePricePerTon: auc.basePricePerTon,
      currentHighestBid: auc.currentHighestBid,
      bidCount: auc.bidCount,
      sampleStatus: auc.sampleStatus,
      status: auc.status,
      farmer: farmerIdentity,
      bids: auctionBids,
    };
  });

  return NextResponse.json({ auctions: sanitizedAuctions, viewerRole: role });
}
