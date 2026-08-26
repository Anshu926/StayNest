export interface StayListing {
  _id: string;
  providerId?: string;
  name: string;
  slug: string;
  description: string;
  propertyType: "pg" | "flat" | "hostel" | "single-room" | "shared-room";
  area: string;
  areaSlug: string;
  address: string;
  monthlyRent: number;
  depositAmount: number;
  roomType: "single" | "double" | "triple" | "dormitory";
  genderPreference: "male" | "female" | "any";
  targetAudience: "student" | "professional" | "any";
  amenities: string[];
  rules: string[];
  isFoodIncluded: boolean;
  isAC: boolean;
  isFurnished: boolean;
  hasParking: boolean;
  hasLaundry: boolean;
  hasAttachedBathroom: boolean;
  hasWifi: boolean;
  images: string[];
  isAvailable: boolean;
  isVerified: boolean;
  verificationStatus: "pending" | "approved" | "rejected";
  isDemo: boolean;
  avgRating: number;
  totalReviews: number;
  totalViews: number;
  status: "active" | "paused" | "deleted";
  provider?: ProviderInfo;
  createdAt: string;
  updatedAt: string;
}

export interface TiffinListing {
  _id: string;
  providerId?: string;
  name: string;
  slug: string;
  description: string;
  area: string;
  areaSlug: string;
  address?: string;
  deliveryAreas: string[];
  foodType: "veg" | "non-veg" | "jain" | "veg-nonveg";
  mealsPerDay: number;
  hasBreakfast: boolean;
  hasLunch: boolean;
  hasDinner: boolean;
  monthlyPrice: number;
  dailyPrice?: number;
  hasDelivery: boolean;
  deliveryCharge?: number;
  menuDescription?: string;
  images: string[];
  isVerified: boolean;
  verificationStatus: "pending" | "approved" | "rejected";
  isDemo: boolean;
  avgRating: number;
  totalReviews: number;
  status: "active" | "paused" | "deleted";
  provider?: ProviderInfo;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderInfo {
  businessName: string;
  phone: string;
  whatsapp?: string;
  isVerified: boolean;
}

export interface Area {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  popularFor: string[];
  zones: string[];
}

export interface Review {
  _id: string;
  userId: { name: string; avatar?: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface SearchFilters {
  area?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  targetAudience?: string;
  genderPreference?: string;
  isFurnished?: boolean;
  isAC?: boolean;
  isFoodIncluded?: boolean;
  hasWifi?: boolean;
  hasParking?: boolean;
  hasLaundry?: boolean;
  hasAttachedBathroom?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface TiffinFilters {
  area?: string;
  foodType?: string;
  minPrice?: number;
  maxPrice?: number;
  hasDelivery?: boolean;
  mealsPerDay?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}
