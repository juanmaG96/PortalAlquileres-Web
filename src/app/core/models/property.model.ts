export enum PropertyType {
  House = 1,
  Apartment = 2,
  Commercial = 3,
  Land = 4,
  Room = 5,
  Residence = 6
}

export enum OfferType {
  Rent = 1,  // Oferta
  Demand = 2 // Demanda
}

export enum PropertyStatus {
  Inactive = 0,
  Active = 1,
  Pending = 2,
  Archived = 3
}

export interface PropertySummary {
  id: string;
  title: string;
  price: number;
  currency: string;
  coverImageUrl?: string;
  rooms: number;
  propertyType: PropertyType;
  offerType: OfferType;
  status: PropertyStatus;
  isPremium: boolean;
  city: string;
  address: string;
  contactPhone?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface PropertyDetail extends PropertySummary {
  description: string;
  contactPhone: string;
  imageUrls: string[];
}

export interface PropertySearchFilter {
  city?: string;
  propertyType?: PropertyType | null;
  offerType?: OfferType | null;
  keyword?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  rooms?: number | null;
  onlyPremium?: boolean;
  page: number;
  pageSize: number;
  includeInactive?: boolean;
  showDeleted?: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
