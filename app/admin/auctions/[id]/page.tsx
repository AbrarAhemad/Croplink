'use client';

import React from 'react';
import AuctionDetailPage from '@/app/auctions/[id]/page';

export default function AdminAuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <AuctionDetailPage params={params} forcedRole="ADMIN" forcedBackHref="/admin/auctions" />;
}
