import { MarketPriceRecord } from '@/types';

export interface AgmarknetFilterOptions {
  crop?: string;
  state?: string;
  district?: string;
  mandi?: string;
  date?: string;
}

export interface IAgmarknetProvider {
  getMarketPrices(filters?: AgmarknetFilterOptions): Promise<MarketPriceRecord[]>;
  getSuggestedAuctionPrice(crop: string, qualityGrade: string, quantityTons: number): Promise<{
    suggestedBasePrice: number;
    recommendedMinPrice: number;
    recommendedMaxPrice: number;
    modalMarketPrice: number;
    reasoning: string;
  }>;
}

// Realistic mock market dataset for Indian Mandis (Sangli, Nashik, Pune, Solapur, Kolhapur, Nagpur, Indore, etc.)
const MOCK_MARKET_PRICES: MarketPriceRecord[] = [
  {
    id: 'm1',
    crop: 'Turmeric (हल्दी)',
    variety: 'Rajapuri / Salem',
    mandi: 'Sangli APMC',
    district: 'Sangli',
    state: 'Maharashtra',
    minPrice: 135000,
    maxPrice: 168000,
    modalPrice: 152000,
    date: '2026-09-17',
    unit: 'TON',
  },
  {
    id: 'm2',
    crop: 'Onion (प्याज)',
    variety: 'Red Nashik / Garwa',
    mandi: 'Lasalgaon APMC',
    district: 'Nashik',
    state: 'Maharashtra',
    minPrice: 22000,
    maxPrice: 31000,
    modalPrice: 26500,
    date: '2026-09-17',
    unit: 'TON',
  },
  {
    id: 'm3',
    crop: 'Tomato (टमाटर)',
    variety: 'Hybrid Abhinav',
    mandi: 'Pimpri-Chinchwad APMC',
    district: 'Pune',
    state: 'Maharashtra',
    minPrice: 18000,
    maxPrice: 28000,
    modalPrice: 23000,
    date: '2026-09-17',
    unit: 'TON',
  },
  {
    id: 'm4',
    crop: 'Grapes (अंगूर)',
    variety: 'Thomson Seedless',
    mandi: 'Tasgaon APMC',
    district: 'Sangli',
    state: 'Maharashtra',
    minPrice: 65000,
    maxPrice: 92000,
    modalPrice: 78000,
    date: '2026-09-17',
    unit: 'TON',
  },
  {
    id: 'm5',
    crop: 'Sugarcane (गन्ना)',
    variety: 'Co 86032',
    mandi: 'Kolhapur APMC',
    district: 'Kolhapur',
    state: 'Maharashtra',
    minPrice: 3100,
    maxPrice: 3600,
    modalPrice: 3400,
    date: '2026-09-17',
    unit: 'TON',
  },
  {
    id: 'm6',
    crop: 'Soybean (सोयाबीन)',
    variety: 'JS 335',
    mandi: 'Latur APMC',
    district: 'Latur',
    state: 'Maharashtra',
    minPrice: 44000,
    maxPrice: 52000,
    modalPrice: 48500,
    date: '2026-09-17',
    unit: 'TON',
  },
  {
    id: 'm7',
    crop: 'Cotton (कपास)',
    variety: 'Long Staple H-4',
    mandi: 'Yavatmal APMC',
    district: 'Yavatmal',
    state: 'Maharashtra',
    minPrice: 68000,
    maxPrice: 79000,
    modalPrice: 73500,
    date: '2026-09-17',
    unit: 'TON',
  },
  {
    id: 'm8',
    crop: 'Pomegranate (अनार)',
    variety: 'Bhagwa',
    mandi: 'Solapur APMC',
    district: 'Solapur',
    state: 'Maharashtra',
    minPrice: 85000,
    maxPrice: 135000,
    modalPrice: 110000,
    date: '2026-09-17',
    unit: 'TON',
  },
];

export class MockAgmarknetProvider implements IAgmarknetProvider {
  async getMarketPrices(filters?: AgmarknetFilterOptions): Promise<MarketPriceRecord[]> {
    let result = [...MOCK_MARKET_PRICES];

    if (filters?.crop) {
      const q = filters.crop.toLowerCase();
      result = result.filter(r => r.crop.toLowerCase().includes(q));
    }

    if (filters?.state) {
      result = result.filter(r => r.state.toLowerCase() === filters.state?.toLowerCase());
    }

    if (filters?.district) {
      result = result.filter(r => r.district.toLowerCase() === filters.district?.toLowerCase());
    }

    if (filters?.mandi) {
      const mandiQuery = filters.mandi.toLowerCase();
      result = result.filter(r => r.mandi.toLowerCase().includes(mandiQuery));
    }

    return result;
  }

  async getSuggestedAuctionPrice(crop: string, qualityGrade: string, quantityTons: number) {
    const prices = await this.getMarketPrices({ crop });
    const modalPrice = prices.length > 0 ? prices[0].modalPrice : 35000;

    let multiplier = 1.0;
    if (qualityGrade.toUpperCase().includes('A') || qualityGrade.toUpperCase().includes('EXCELLENT')) {
      multiplier = 1.08;
    } else if (qualityGrade.toUpperCase().includes('B') || qualityGrade.toUpperCase().includes('GOOD')) {
      multiplier = 1.02;
    } else {
      multiplier = 0.95;
    }

    if (quantityTons >= 50) {
      multiplier += 0.02; // Bulk volume premium
    }

    const suggestedBasePrice = Math.round(modalPrice * multiplier);
    const recommendedMinPrice = Math.round(suggestedBasePrice * 0.95);
    const recommendedMaxPrice = Math.round(suggestedBasePrice * 1.15);

    return {
      suggestedBasePrice,
      recommendedMinPrice,
      recommendedMaxPrice,
      modalMarketPrice: modalPrice,
      reasoning: `Based on current AGMARKNET modal mandi price of ₹${modalPrice.toLocaleString('en-IN')}/ton with a ${((multiplier - 1) * 100).toFixed(1)}% adjustment for Grade '${qualityGrade}' quality and volume factor (${quantityTons} tons).`,
    };
  }
}

// Default export uses Mock Provider. Swap with RealAgmarknetProvider when API key is set.
export const agmarknetService: IAgmarknetProvider = new MockAgmarknetProvider();
