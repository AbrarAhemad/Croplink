'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, FarmerProfile, IndustryProfile, AuctionLot, AnonymousBid, 
  AuctionRegistration, GroundVerification, DealAgreement, DeliveryRecord, 
  AuditLog, AppNotification, PlatformSettings 
} from '@/types';
import { 
  DEMO_PROFILES, DEMO_FARMER_PROFILE, DEMO_INDUSTRY_PROFILE, 
  DEMO_AUCTIONS, DEMO_BIDS, DEMO_REGISTRATIONS, DEMO_VERIFICATIONS, 
  DEMO_AGREEMENTS, DEMO_DELIVERIES, DEMO_AUDIT_LOGS, INITIAL_PLATFORM_SETTINGS 
} from './demo-store';

interface AppStoreContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  farmerProfile: FarmerProfile;
  industryProfile: IndustryProfile;
  auctions: AuctionLot[];
  bids: AnonymousBid[];
  registrations: AuctionRegistration[];
  verifications: GroundVerification[];
  agreements: DealAgreement[];
  deliveries: DeliveryRecord[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  settings: PlatformSettings;
  
  // Actions
  loginAs: (role: 'FARMER' | 'INDUSTRY' | 'ADMIN') => void;
  logout: () => void;
  createAuction: (auction: Omit<AuctionLot, 'id' | 'createdAt' | 'farmerAnonymousId' | 'currentHighestBid' | 'bidCount' | 'sampleStatus' | 'status'>) => AuctionLot;
  registerForAuction: (auctionId: string, paymentId: string) => void;
  placeBid: (auctionId: string, amountPerTon: number) => { success: boolean; error?: string };
  updateSampleStatus: (auctionId: string, status: AuctionLot['sampleStatus']) => void;
  updateUserStatus: (userId: string, status: UserProfile['status'], reason?: string) => void;
  respondToWinnerOffer: (auctionId: string, accept: boolean) => void;
  scheduleGroundVerification: (auctionId: string, scheduledDate: string, notes: string) => void;
  completeGroundVerification: (verificationId: string, result: 'PASSED' | 'FAILED' | 'CANCELLED', cancellationReason?: string) => void;
  signAgreement: (agreementId: string, signatureName: string) => void;
  updateDeliveryStatus: (deliveryId: string, status: DeliveryRecord['status'], note: string, location: string) => void;
  updateSettings: (newSettings: Partial<PlatformSettings>) => void;
}

const AppStoreContext = createContext<AppStoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'croplink_store_v1';

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(DEMO_PROFILES[0]); // Default Farmer
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile>(DEMO_FARMER_PROFILE);
  const [industryProfile, setIndustryProfile] = useState<IndustryProfile>(DEMO_INDUSTRY_PROFILE);
  const [auctions, setAuctions] = useState<AuctionLot[]>(DEMO_AUCTIONS);
  const [bids, setBids] = useState<AnonymousBid[]>(DEMO_BIDS);
  const [registrations, setRegistrations] = useState<AuctionRegistration[]>(DEMO_REGISTRATIONS);
  const [verifications, setVerifications] = useState<GroundVerification[]>(DEMO_VERIFICATIONS);
  const [agreements, setAgreements] = useState<DealAgreement[]>(DEMO_AGREEMENTS);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>(DEMO_DELIVERIES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(DEMO_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>(INITIAL_PLATFORM_SETTINGS);

  // Load from LocalStorage on mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.auctions) setAuctions(parsed.auctions);
        if (parsed.bids) setBids(parsed.bids);
        if (parsed.registrations) setRegistrations(parsed.registrations);
        if (parsed.verifications) setVerifications(parsed.verifications);
        if (parsed.agreements) setAgreements(parsed.agreements);
        if (parsed.deliveries) setDeliveries(parsed.deliveries);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.settings) setSettings(parsed.settings);
      }
    } catch (e) {
      console.warn('Could not load store from localStorage', e);
    }
  }, []);

  // Save to LocalStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ auctions, bids, registrations, verifications, agreements, deliveries, auditLogs, settings })
      );
    } catch (e) {
      console.warn('Could not save store to localStorage', e);
    }
  }, [auctions, bids, registrations, verifications, agreements, deliveries, auditLogs, settings]);

  const loginAs = (role: 'FARMER' | 'INDUSTRY' | 'ADMIN') => {
    const profile = DEMO_PROFILES.find(p => p.role === role) || DEMO_PROFILES[0];
    setCurrentUser(profile);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const logAudit = (action: string, entity: string, entityId: string, metadata?: any) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      actorName: currentUser.fullName,
      action,
      entity,
      entityId,
      metadata,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const createAuction = (data: Omit<AuctionLot, 'id' | 'createdAt' | 'farmerAnonymousId' | 'currentHighestBid' | 'bidCount' | 'sampleStatus' | 'status'>) => {
    const id = `auc_${Date.now()}`;
    const newAuction: AuctionLot = {
      ...data,
      id,
      farmerAnonymousId: `Farmer #MH-${Math.floor(10 + Math.random() * 89)} (${data.locationArea.split(',')[0]})`,
      currentHighestBid: 0,
      bidCount: 0,
      sampleStatus: 'NOT_SENT',
      status: 'REGISTRATION_OPEN',
      createdAt: new Date().toISOString(),
    };
    setAuctions(prev => [newAuction, ...prev]);
    logAudit('AUCTION_CREATED', 'AuctionLot', id, { crop: data.crop, quantityTons: data.quantityTons });
    return newAuction;
  };

  const registerForAuction = (auctionId: string, paymentId: string) => {
    if (!currentUser) return;
    const newReg: AuctionRegistration = {
      id: `reg_${Date.now()}`,
      auctionId,
      industryId: currentUser.id,
      paymentId,
      feeAmount: settings.industryRegistrationFeeInr,
      status: 'PAID',
      createdAt: new Date().toISOString(),
    };
    setRegistrations(prev => [...prev, newReg]);
    logAudit('AUCTION_REGISTERED', 'AuctionRegistration', newReg.id, { auctionId, feeAmount: settings.industryRegistrationFeeInr });
  };

  const placeBid = (auctionId: string, amountPerTon: number) => {
    if (!currentUser) {
      return { success: false, error: 'Authentication required to place bids.' };
    }
    if (currentUser.role === 'ADMIN') {
      return { success: false, error: 'Admin accounts cannot place bids on crop lots.' };
    }
    if (currentUser.role === 'FARMER') {
      return { success: false, error: 'Farmers cannot place bids on crop lots.' };
    }
    if (currentUser.role !== 'INDUSTRY') {
      return { success: false, error: 'Only verified industry buyers can place bids.' };
    }

    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) return { success: false, error: 'Auction not found.' };

    if (auction.status !== 'AUCTION_LIVE') {
      return { success: false, error: 'Auction is not currently LIVE for bidding.' };
    }

    const isRegistered = registrations.some(r => r.auctionId === auctionId && r.industryId === currentUser.id && r.status === 'PAID');
    if (!isRegistered) {
      return { success: false, error: 'You must complete the ₹1,999 auction registration fee before bidding.' };
    }

    const minAllowed = Math.max(auction.basePricePerTon, (auction.currentHighestBid || 0) + settings.minimumBidIncrementInr);
    if (amountPerTon < minAllowed) {
      return { success: false, error: `Bid must be at least ₹${minAllowed.toLocaleString('en-IN')}/ton.` };
    }

    // Determine anonymous ID for this industry buyer
    const existingBid = bids.find(b => b.auctionId === auctionId && b.industryId === currentUser.id);
    const anonymousId = existingBid ? existingBid.anonymousBidderId : `Bidder #${String.fromCharCode(65 + (bids.length % 26))}${Math.floor(10 + Math.random() * 89)}`;

    const newBid: AnonymousBid = {
      id: `bid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      auctionId,
      industryId: currentUser.id,
      anonymousBidderId: anonymousId,
      amountPerTon,
      totalAmount: Math.round(amountPerTon * auction.quantityTons),
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
    };

    // Update outbid statuses for prior bids in this auction
    setBids(prev => [
      newBid,
      ...prev.map(b => b.auctionId === auctionId && b.status === 'ACTIVE' ? { ...b, status: 'OUTBID' as const } : b)
    ]);

    // Update auction summary
    setAuctions(prev => prev.map(a => a.id === auctionId ? {
      ...a,
      currentHighestBid: amountPerTon,
      bidCount: a.bidCount + 1,
    } : a));

    logAudit('BID_PLACED', 'AnonymousBid', newBid.id, { auctionId, amountPerTon });
    return { success: true };
  };

  const updateSampleStatus = (auctionId: string, sampleStatus: AuctionLot['sampleStatus']) => {
    let nextAuctionStatus: AuctionLot['status'] | undefined;
    if (sampleStatus === 'FORWARDED_TO_INDUSTRY' || sampleStatus === 'VERIFIED') {
      nextAuctionStatus = 'AUCTION_LIVE';
    } else if (sampleStatus === 'SENT' || sampleStatus === 'RECEIVED') {
      nextAuctionStatus = 'SAMPLE_PROCESSING';
    }

    setAuctions(prev => prev.map(a => {
      if (a.id !== auctionId) return a;
      const isBecomingLive = (sampleStatus === 'FORWARDED_TO_INDUSTRY' || sampleStatus === 'VERIFIED') && a.status !== 'AUCTION_LIVE';
      const now = new Date();
      const startsAt = isBecomingLive ? now.toISOString() : (a.auctionStartsAt || now.toISOString());
      const endsAt = isBecomingLive ? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() : (a.auctionEndsAt || new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString());

      return {
        ...a,
        sampleStatus,
        status: nextAuctionStatus || a.status,
        auctionStartsAt: startsAt,
        auctionEndsAt: endsAt,
      };
    }));

    logAudit('SAMPLE_STATUS_UPDATED', 'AuctionLot', auctionId, { sampleStatus });
  };

  const updateUserStatus = (userId: string, status: UserProfile['status'], reason?: string) => {
    logAudit(`USER_${status}`, 'UserProfile', userId, { reason });
  };

  const respondToWinnerOffer = (auctionId: string, accept: boolean) => {
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) return;

    if (accept) {
      setAuctions(prev => prev.map(a => a.id === auctionId ? {
        ...a,
        status: 'GROUND_VERIFICATION',
      } : a));

      const newGv: GroundVerification = {
        id: `gv_${Date.now()}`,
        auctionId,
        industryId: currentUser?.id || 'usr_industry_1',
        assignedBidderRank: (auction.activeRankBidderIndex || 0) + 1,
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'REQUESTED',
        notes: 'Winner accepted offer. Ground inspection requested.',
        updatedAt: new Date().toISOString(),
      };
      setVerifications(prev => [...prev, newGv]);
      logAudit('WINNER_OFFER_ACCEPTED', 'AuctionLot', auctionId);
    } else {
      // Winner rejected -> Trigger fallback to next rank bidder
      const nextRankIndex = (auction.activeRankBidderIndex || 0) + 1;
      if (nextRankIndex >= 3) {
        // Maximum 3 fallback bidders reached -> Auction fails
        setAuctions(prev => prev.map(a => a.id === auctionId ? {
          ...a,
          status: 'CANCELLED',
        } : a));
        logAudit('AUCTION_FAILED_FALLBACK_EXHAUSTED', 'AuctionLot', auctionId);
      } else {
        setAuctions(prev => prev.map(a => a.id === auctionId ? {
          ...a,
          activeRankBidderIndex: nextRankIndex,
          winnerResponseDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        } : a));
        logAudit('WINNER_OFFER_REJECTED_FALLBACK', 'AuctionLot', auctionId, { nextRankIndex });
      }
    }
  };

  const scheduleGroundVerification = (auctionId: string, scheduledDate: string, notes: string) => {
    setVerifications(prev => prev.map(v => v.auctionId === auctionId ? {
      ...v,
      scheduledDate,
      notes,
      status: 'SCHEDULED',
      updatedAt: new Date().toISOString(),
    } : v));
    logAudit('GROUND_VERIFICATION_SCHEDULED', 'GroundVerification', auctionId, { scheduledDate });
  };

  const completeGroundVerification = (verificationId: string, result: 'PASSED' | 'FAILED' | 'CANCELLED', cancellationReason?: string) => {
    const gv = verifications.find(v => v.id === verificationId);
    if (!gv) return;

    setVerifications(prev => prev.map(v => v.id === verificationId ? {
      ...v,
      status: result,
      cancellationReason,
      cancellationFee: result === 'CANCELLED' ? settings.cancellationFeeInr : undefined,
      updatedAt: new Date().toISOString(),
    } : v));

    if (result === 'PASSED') {
      // Transition to Legal Agreement creation
      const auction = auctions.find(a => a.id === gv.auctionId);
      if (auction) {
        setAuctions(prev => prev.map(a => a.id === gv.auctionId ? {
          ...a,
          status: 'AGREEMENT_PENDING',
        } : a));

        const finalPrice = auction.currentHighestBid || auction.basePricePerTon;
        const newAgr: DealAgreement = {
          id: `agr_${Date.now()}`,
          auctionId: auction.id,
          farmerId: auction.farmerId,
          industryId: gv.industryId,
          crop: auction.crop,
          quantityTons: auction.quantityTons,
          finalPricePerTon: finalPrice,
          totalDealValue: Math.round(finalPrice * auction.quantityTons),
          agreedAt: new Date().toISOString(),
          terms: `1. CropLink Quality Guarantee & Ground Inspection Verification PASSED.\n2. Payment terms: Direct ESCROW deposit before transport dispatch.\n3. Transportation handled as agreed per CropLink delivery schedule.`,
          status: 'DRAFT',
        };
        setAgreements(prev => [...prev, newAgr]);
      }
      logAudit('GROUND_VERIFICATION_PASSED', 'GroundVerification', verificationId);
    } else if (result === 'CANCELLED') {
      logAudit('GROUND_VERIFICATION_CANCELLED', 'GroundVerification', verificationId, { cancellationReason, cancellationFee: settings.cancellationFeeInr });
      // Approach fallback winner
      respondToWinnerOffer(gv.auctionId, false);
    }
  };

  const signAgreement = (agreementId: string, signatureName: string) => {
    if (!currentUser) return;

    const agr = agreements.find(a => a.id === agreementId);
    if (!agr) return;

    const isFarmer = currentUser.role === 'FARMER';
    const isIndustry = currentUser.role === 'INDUSTRY';

    const updatedFarmerSig = isFarmer ? signatureName : agr.farmerSignature;
    const updatedFarmerSignedAt = isFarmer ? new Date().toISOString() : agr.farmerSignedAt;

    const updatedIndustrySig = isIndustry ? signatureName : agr.industrySignature;
    const updatedIndustrySignedAt = isIndustry ? new Date().toISOString() : agr.industrySignedAt;

    const isFullySigned = Boolean((updatedFarmerSig && updatedIndustrySig) || (isFarmer && agr.industrySignature) || (isIndustry && agr.farmerSignature));

    setAgreements(prev => prev.map(a => a.id === agreementId ? {
      ...a,
      farmerSignature: updatedFarmerSig,
      farmerSignedAt: updatedFarmerSignedAt,
      industrySignature: updatedIndustrySig,
      industrySignedAt: updatedIndustrySignedAt,
      status: isFullySigned ? 'FULLY_EXECUTED' : 'FARMER_SIGNED',
    } : a));

    if (isFullySigned) {
      setAuctions(prev => prev.map(a => a.id === agr.auctionId ? { ...a, status: 'DELIVERY' } : a));

      // Create delivery record
      const newDel: DeliveryRecord = {
        id: `del_${Date.now()}`,
        dealId: agr.id,
        auctionId: agr.auctionId,
        originArea: 'Sangli Rural, Maharashtra',
        destinationArea: 'MIDC Thane West, Mumbai',
        estimatedKm: 380,
        status: 'ORDER_CONFIRMED',
        expectedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        timeline: [
          { status: 'ORDER_CONFIRMED', timestamp: new Date().toISOString(), location: 'CropLink Hub Sangli', note: 'Agreement signed by both parties. Delivery order dispatched.' }
        ],
      };
      setDeliveries(prev => [...prev, newDel]);
    }

    logAudit('AGREEMENT_SIGNED', 'DealAgreement', agreementId, { isFullySigned });
  };

  const updateDeliveryStatus = (deliveryId: string, status: DeliveryRecord['status'], note: string, location: string) => {
    setDeliveries(prev => prev.map(d => {
      if (d.id !== deliveryId) return d;
      const updatedTimeline = [
        ...d.timeline,
        { status, timestamp: new Date().toISOString(), location, note }
      ];
      return {
        ...d,
        status,
        timeline: updatedTimeline,
      };
    }));

    logAudit('DELIVERY_STATUS_UPDATED', 'DeliveryRecord', deliveryId, { status, location });
  };

  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    logAudit('SETTINGS_UPDATED', 'PlatformSettings', 'global', newSettings);
  };

  return (
    <AppStoreContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        farmerProfile,
        industryProfile,
        auctions,
        bids,
        registrations,
        verifications,
        agreements,
        deliveries,
        auditLogs,
        notifications,
        settings,
        loginAs,
        logout,
        createAuction,
        registerForAuction,
        placeBid,
        updateSampleStatus,
        updateUserStatus,
        respondToWinnerOffer,
        scheduleGroundVerification,
        completeGroundVerification,
        signAgreement,
        updateDeliveryStatus,
        updateSettings,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppStoreProvider');
  }
  return context;
}
