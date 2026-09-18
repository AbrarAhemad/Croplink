export type UserRole = 'FARMER' | 'INDUSTRY' | 'ADMIN';

export type UserStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type SampleStatus = 
  | 'NOT_SENT' 
  | 'SENT' 
  | 'RECEIVED' 
  | 'VERIFIED' 
  | 'FORWARDED_TO_INDUSTRY';

export type AuctionStatus = 
  | 'DRAFT'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'SAMPLE_PROCESSING'
  | 'AUCTION_LIVE'
  | 'AUCTION_ENDED'
  | 'WINNER_PENDING_VERIFICATION'
  | 'GROUND_VERIFICATION'
  | 'DEAL_CONFIRMED'
  | 'AGREEMENT_PENDING'
  | 'AGREEMENT_SIGNED'
  | 'DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'CREATED' | 'PAID' | 'FAILED' | 'REFUNDED';

export type VerificationResultStatus = 
  | 'REQUESTED' 
  | 'SCHEDULED' 
  | 'IN_PROGRESS' 
  | 'PASSED' 
  | 'FAILED' 
  | 'CANCELLED';

export type DeliveryStatus = 
  | 'ORDER_CONFIRMED' 
  | 'PICKUP_PENDING' 
  | 'PICKED_UP' 
  | 'IN_TRANSIT' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED';

export type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  fullName: string;
  mobile: string;
  createdAt: string;
  updatedAt: string;
}

export interface FarmerProfile {
  id: string;
  userId: string;
  fullAddress: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
  farmName: string;
  farmLocation: string;
  landAreaAcres: number;
  cropsGrown: string[];
  farmerDocUrl?: string;
  identityDocUrl?: string;
  coordinates?: { lat: number; lng: number };
}

export interface IndustryProfile {
  id: string;
  userId: string;
  companyName: string;
  gstNumber: string;
  contactPerson: string;
  fullAddress: string;
  city: string;
  state: string;
  pincode: string;
  industryType: string;
  requiredCrops: string[];
  requiredQuantityTons: number;
  preferredQualityGrade: string;
  procurementLocation: string;
  registrationDocUrl?: string;
  gstDocUrl?: string;
  coordinates?: { lat: number; lng: number };
}

export interface MarketPriceRecord {
  id: string;
  crop: string;
  variety: string;
  mandi: string;
  district: string;
  state: string;
  minPrice: number; // per ton
  maxPrice: number; // per ton
  modalPrice: number; // per ton
  date: string;
  unit: string;
}

export interface AuctionLot {
  id: string;
  farmerId: string;
  farmerAnonymousId: string; // e.g., "Farmer #MH-42"
  crop: string;
  variety: string;
  quantityTons: number;
  qualityGrade: string;
  harvestDate: string;
  locationArea: string; // Village / District without full private address
  description: string;
  basePricePerTon: number;
  transportPricePer100Km: number;
  registrationDurationDays: number; // 3 to 7 days
  sampleStatus: SampleStatus;
  status: AuctionStatus;
  createdAt: string;
  registrationEndsAt: string;
  sampleProcessingEndsAt: string;
  auctionStartsAt: string;
  auctionEndsAt: string;
  currentHighestBid?: number;
  bidCount: number;
  winningBidId?: string;
  winnerIndustryId?: string;
  activeRankBidderIndex?: number; // 0 for 1st, 1 for 2nd, 2 for 3rd rank bidder
  winnerResponseDeadline?: string; // 3 days after auction end
}

export interface AnonymousBid {
  id: string;
  auctionId: string;
  industryId: string;
  anonymousBidderId: string; // e.g. "Bidder #A17"
  amountPerTon: number;
  totalAmount: number;
  createdAt: string;
  status: 'ACTIVE' | 'OUTBID' | 'WINNER_SELECTED' | 'REJECTED';
}

export interface AuctionRegistration {
  id: string;
  auctionId: string;
  industryId: string;
  paymentId: string;
  feeAmount: number;
  status: PaymentStatus;
  createdAt: string;
}

export interface RazorpayPayment {
  id: string;
  userId: string;
  auctionId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amountPaise: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface GroundVerification {
  id: string;
  auctionId: string;
  industryId: string;
  assignedBidderRank: number; // 1, 2, or 3
  scheduledDate: string;
  status: VerificationResultStatus;
  notes?: string;
  cancellationReason?: string;
  cancellationFee?: number;
  updatedAt: string;
}

export interface DealAgreement {
  id: string;
  auctionId: string;
  farmerId: string;
  industryId: string;
  crop: string;
  quantityTons: number;
  finalPricePerTon: number;
  totalDealValue: number;
  agreedAt: string;
  farmerSignature?: string;
  farmerSignedAt?: string;
  industrySignature?: string;
  industrySignedAt?: string;
  terms: string;
  status: 'DRAFT' | 'FARMER_SIGNED' | 'FULLY_EXECUTED';
}

export interface DeliveryRecord {
  id: string;
  dealId: string;
  auctionId: string;
  originArea: string;
  destinationArea: string;
  estimatedKm: number;
  status: DeliveryStatus;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  expectedDeliveryDate: string;
  timeline: {
    status: DeliveryStatus;
    timestamp: string;
    location: string;
    note: string;
  }[];
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: 'AUCTION' | 'PAYMENT' | 'VERIFICATION' | 'SYSTEM' | 'DELIVERY';
  read: boolean;
  createdAt: string;
  linkUrl?: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorRole: UserRole;
  actorName: string;
  action: string; // e.g. "USER_APPROVED", "BID_PLACED"
  entity: string; // e.g. "FarmerProfile", "AuctionLot"
  entityId: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface PlatformSettings {
  industryRegistrationFeeInr: number;
  cancellationFeeInr: number;
  minimumBidIncrementInr: number;
  sampleMinimumWeightKg: number;
  auctionDurationHours: number;
  winnerResponseWindowDays: number;
  maxFallbackBidders: number;
  sangliHubAddress: string;
}
