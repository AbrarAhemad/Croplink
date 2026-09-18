'use client';

import React from 'react';
import AuctionDetailPage from '@/app/auctions/[id]/page';

export default function IndustryAuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <AuctionDetailPage params={params} forcedRole="INDUSTRY" forcedBackHref="/industry/auctions" />;
}
