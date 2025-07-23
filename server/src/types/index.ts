export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Enums for Promotions
export enum Currency {
  MXN = 0,
  USD = 1,
  EUR = 2,
  GBP = 3,
  JPY = 4,
  CAD = 5,
  AUD = 6,
  CHF = 7,
  CNY = 8,
}

export enum PromotionStatus {
  PENDING = 'pending',
  REJECTED = 'rejected',
  APPROVED = 'approved',
  COMPLETED = 'completed'
}