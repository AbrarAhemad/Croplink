import { AuctionLot, AnonymousBid, FarmerProfile, IndustryProfile, UserProfile } from '@/types';
import { DEMO_FARMER_PROFILE, DEMO_INDUSTRY_PROFILE } from '@/lib/store/demo-store';

export interface FarmerIdentityView {
  farmerId: string;
  displayName: string;
  fullName?: string;
  farmName?: string;
  village?: string;
  district: string;
  locationDisplay: string;
  mobile?: string;
  email?: string;
  isAnonymous: boolean;
}

export interface IndustryIdentityView {
  industryId: string;
  displayName: string;
  companyName?: string;
  contactPerson?: string;
  gstNumber?: string;
  mobile?: string;
  email?: string;
  isAnonymous: boolean;
}

export interface AuctionParticipantView {
  farmer: FarmerIdentityView;
  highestBidder: IndustryIdentityView | null;
}

// Known profiles dictionary for fallback lookup
const DEMO_FARMERS_MAP: Record<string, { fullName: string; farmName: string; village: string; district: string; mobile?: string; email?: string }> = {
  usr_farmer_1: {
    fullName: 'Rameshwar Patil',
    farmName: 'Patil Bio-Organic Farms',
    village: 'Kupwad',
    district: 'Sangli',
    mobile: '+91 98230 12345',
    email: 'farmer@croplink.demo',
  },
  usr_farmer_2: {
    fullName: 'Abrar Ahemad',
    farmName: 'Patil Farm',
    village: 'Kupwad',
    district: 'Sangli',
    mobile: '+91 98765 43210',
    email: 'abrar.farm@croplink.demo',
  },
};

const DEMO_INDUSTRIES_MAP: Record<string, { companyName: string; contactPerson: string; gstNumber: string; mobile?: string; email?: string }> = {
  usr_industry_1: {
    companyName: 'AgriFoods Spices & Processing India Ltd',
    contactPerson: 'Sunil Deshmukh',
    gstNumber: '27AAAAA0000A1Z5',
    mobile: '+91 98190 98765',
    email: 'industry@croplink.demo',
  },
  usr_industry_2: {
    companyName: 'XYZ Foods Pvt Ltd',
    contactPerson: 'Vikram Mehta',
    gstNumber: '27BBBBB1111B2Z6',
    mobile: '+91 98222 33344',
    email: 'procurement@xyzfoods.com',
  },
  usr_industry_3: {
    companyName: 'Apex Spice Extracts Ltd',
    contactPerson: 'Anand Kulkarni',
    gstNumber: '27CCCCC2222C3Z7',
    mobile: '+91 98333 44455',
    email: 'purchase@apexspices.in',
  },
  usr_industry_4: {
    companyName: 'Global Spices India Pvt Ltd',
    contactPerson: 'Rajesh Verma',
    gstNumber: '27DDDDD3333D4Z8',
    mobile: '+91 98444 55566',
    email: 'bids@globalspices.com',
  },
  usr_industry_5: {
    companyName: 'Sahyadri Agro Products Ltd',
    contactPerson: 'Deepa Patil',
    gstNumber: '27EEEEE4444E5Z9',
    mobile: '+91 98555 66677',
    email: 'sahyadri@agroproducts.co.in',
  },
};

/**
 * Resolves Farmer Identity based on viewer role and lot ownership.
 * - ADMIN: Unmasks real Full Name, Farm Name, Village, District.
 * - FARMER (OWNER): Shows their own farm name and details.
 * - FARMER (NON-OWNER) / INDUSTRY: Retains Anonymous Farmer Identifier (e.g. Farmer #MH-42 (Sangli)).
 */
export function getFarmerIdentityView(
  auction: Pick<AuctionLot, 'farmerId' | 'farmerAnonymousId' | 'locationArea'>,
  viewerRole: 'ADMIN' | 'FARMER' | 'INDUSTRY' | undefined,
  farmerProfile?: FarmerProfile,
  currentUserId?: string
): FarmerIdentityView {
  const isOwner = Boolean(currentUserId && auction.farmerId === currentUserId);

  if (viewerRole === 'ADMIN' || isOwner) {
    const known = DEMO_FARMERS_MAP[auction.farmerId] || {
      fullName: farmerProfile?.fullAddress ? 'Rameshwar Patil' : 'Rameshwar Patil',
      farmName: farmerProfile?.farmName || 'Patil Bio-Organic Farms',
      village: farmerProfile?.village || 'Kupwad',
      district: farmerProfile?.district || 'Sangli',
      mobile: '+91 98230 12345',
      email: 'farmer@croplink.demo',
    };

    return {
      farmerId: auction.farmerId,
      displayName: isOwner ? `Your Lot (${known.farmName})` : known.fullName,
      fullName: known.fullName,
      farmName: known.farmName,
      village: known.village,
      district: known.district,
      locationDisplay: `${known.village}, ${known.district}`,
      isAnonymous: false,
    };
  }

  // Farmer (non-owner) / Industry viewer -> Return presentation-layer anonymous identity only
  const districtMatch = auction.locationArea.match(/([A-Za-z\s]+)\s+District/) || auction.farmerAnonymousId.match(/\((.*?)\)/);
  const district = districtMatch ? districtMatch[1] : 'Sangli';

  return {
    farmerId: auction.farmerId,
    displayName: auction.farmerAnonymousId,
    district: district,
    locationDisplay: district,
    isAnonymous: true,
  };
}

/**
 * Resolves Industry / Buyer Identity based on viewer role.
 * - ADMIN: Unmasks real Company Name, Contact Person, GSTIN, Mobile, Email.
 * - FARMER / INDUSTRY: Retains Anonymous Bidder Identifier (e.g. Bidder #A17).
 */
export function getIndustryIdentityView(
  bidOrReg: { industryId: string; anonymousBidderId?: string },
  viewerRole: 'ADMIN' | 'FARMER' | 'INDUSTRY' | undefined,
  industryProfile?: IndustryProfile
): IndustryIdentityView {
  if (viewerRole === 'ADMIN') {
    const known = DEMO_INDUSTRIES_MAP[bidOrReg.industryId] || {
      companyName: industryProfile?.companyName || 'AgriFoods Spices & Processing India Ltd',
      contactPerson: industryProfile?.contactPerson || 'Sunil Deshmukh',
      gstNumber: industryProfile?.gstNumber || '27AAAAA0000A1Z5',
      mobile: '+91 98190 98765',
      email: 'industry@croplink.demo',
    };

    return {
      industryId: bidOrReg.industryId,
      displayName: known.companyName,
      companyName: known.companyName,
      contactPerson: known.contactPerson,
      gstNumber: known.gstNumber,
      mobile: known.mobile,
      email: known.email,
      isAnonymous: false,
    };
  }

  // Farmer / Industry viewer -> Return presentation-layer anonymous bidder ID only
  return {
    industryId: bidOrReg.industryId,
    displayName: bidOrReg.anonymousBidderId || 'Bidder #A17',
    isAnonymous: true,
  };
}

/**
 * Helper to get composite participant view for an auction lot.
 */
export function getAuctionParticipantView(
  auction: AuctionLot,
  viewerRole: 'ADMIN' | 'FARMER' | 'INDUSTRY' | undefined,
  highestBid?: AnonymousBid,
  farmerProfile?: FarmerProfile,
  industryProfile?: IndustryProfile,
  currentUserId?: string
): AuctionParticipantView {
  const farmer = getFarmerIdentityView(auction, viewerRole, farmerProfile, currentUserId);
  const highestBidder = highestBid ? getIndustryIdentityView(highestBid, viewerRole, industryProfile) : null;

  return { farmer, highestBidder };
}
