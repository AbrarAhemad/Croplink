'use client';

import React from 'react';
import AuctionDetailPage from '@/app/auctions/[id]/page';

export default function FarmerAuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <AuctionDetailPage params={params} forcedRole="FARMER" forcedBackHref="/farmer/auctions" />;
}
