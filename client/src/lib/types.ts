export interface SearchFilters {
  category?: string;
  type?: string;
  pincode?: string;
  search?: string;
}

export interface StatsData {
  totalUsers: number;
  totalItems: number;
  cities: number;
  transactions: number;
}

export interface CampaignData {
  id: number;
  title: string;
  description: string;
  target: number;
  collected: number;
  progress: number;
}

export const CATEGORIES = [
  'Books',
  'Furniture', 
  'Electronics',
  'Clothing',
  'Sports',
  'Other'
] as const;

export const ITEM_TYPES = ['donate', 'rent'] as const;
export const REQUEST_TYPES = ['donate', 'rent'] as const;

export type Category = typeof CATEGORIES[number];
export type ItemType = typeof ITEM_TYPES[number];
export type RequestType = typeof REQUEST_TYPES[number];
