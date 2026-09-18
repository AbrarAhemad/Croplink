import { AuctionLot, AnonymousBid, GroundVerification } from '@/types';

export function calculateAuctionTimelines(registrationDurationDays: number) {
  const now = new Date();
  
  // Registration period: 3 - 7 days
  const registrationEndsAt = new Date(now.getTime() + registrationDurationDays * 24 * 60 * 60 * 1000);
  
  // Sample & logistics processing period: 3 days after registration closes
  const sampleProcessingEndsAt = new Date(registrationEndsAt.getTime() + 3 * 24 * 60 * 60 * 1000);
  
  // Auction day: starts when sample processing completes
  const auctionStartsAt = new Date(sampleProcessingEndsAt.getTime());
  
  // Auction duration: exactly 24 hours
  const auctionEndsAt = new Date(auctionStartsAt.getTime() + 24 * 60 * 60 * 1000);

  return {
    registrationEndsAt: registrationEndsAt.toISOString(),
    sampleProcessingEndsAt: sampleProcessingEndsAt.toISOString(),
    auctionStartsAt: auctionStartsAt.toISOString(),
    auctionEndsAt: auctionEndsAt.toISOString(),
  };
}

export interface WinnerRankingResult {
  rankedBids: AnonymousBid[];
  selectedWinner?: AnonymousBid;
  activeRankIndex: number;
  winnerResponseDeadline?: string;
  isFailed: boolean;
}

export function rankAndProcessWinners(bids: AnonymousBid[], activeRankIndex: number = 0): WinnerRankingResult {
  // Sort bids descending by amount_per_ton
  const sortedBids = [...bids].sort((a, b) => b.amountPerTon - a.amountPerTon);
  
  // Take top 3 highest bidders
  const top3 = sortedBids.slice(0, 3);

  if (top3.length === 0 || activeRankIndex >= top3.length || activeRankIndex >= 3) {
    return {
      rankedBids: top3,
      activeRankIndex,
      isFailed: true,
    };
  }

  const selectedWinner = top3[activeRankIndex];
  // 3-day response window for winner ground verification
  const responseDeadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  return {
    rankedBids: top3,
    selectedWinner,
    activeRankIndex,
    winnerResponseDeadline: responseDeadline,
    isFailed: false,
  };
}
