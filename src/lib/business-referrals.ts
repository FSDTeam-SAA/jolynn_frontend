export type ApiErrorPayload = {
  statusCode?: number;
  success?: false;
  message?: string | string[];
  errorSources?: Array<{ path: string | number; message: string }>;
};

export class ReferralApiError extends Error {
  status: number;
  errorSources: Array<{ path: string | number; message: string }>;

  constructor(status: number, payload?: ApiErrorPayload | null) {
    const rawMessage = payload?.message;
    super(
      Array.isArray(rawMessage)
        ? rawMessage.join(" ")
        : rawMessage || "Something went wrong. Please try again.",
    );
    this.name = "ReferralApiError";
    this.status = status;
    this.errorSources = payload?.errorSources ?? [];
  }
}

export type ReferredBy = {
  id?: string;
  name: string;
  avatar?: string;
  username?: string;
  profileUrl?: string;
};

export type BusinessCard = {
  listingId: string;
  listingType: "registered" | "referred";
  businessOwnerId?: string;
  username?: string;
  businessName: string;
  profileUrl: string;
  referralProfileUrl?: string;
  image?: string;
  profilePicture?: string;
  category?: string;
  serviceCategoryId?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  serviceArea?: string;
  bio?: string;
  review?: string;
  businessWebsiteUrl?: string;
  email?: string;
  businessEmail?: string;
  phoneNumber?: string;
  rating: number;
  totalReviews: number;
  claimStatus: "unclaimed" | "claimed";
  isClaimable: boolean;
  referredBy?: ReferredBy;
  createdAt?: string;
  service?: {
    id: string;
    title: string;
    description?: string | null;
    logo?: { url: string; publicId: string } | null;
  } | null;
};

export type ReferralProfile = BusinessCard & {
  id: string;
  slug: string;
  businessEmail: string;
  businessPhone?: string;
  review: string;
  listingStatus: "published" | "hidden" | "archived";
  isVerified: boolean;
  claimedAt?: string;
  updatedAt?: string;
  canonicalProfileUrl?: string;
  ownerManagedProfile?: {
    id: string;
    username?: string;
    profileUrl: string;
    businessName?: string;
    ownerName?: string;
    businessEmail?: string;
    businessPhone?: string;
    profilePicture?: string;
    backgroundImage?: string;
    category?: string;
    serviceCategoryId?: string;
    serviceArea?: string;
    businessWebsiteUrl?: string;
    bio?: string;
    country?: string;
    state?: string;
    city?: string;
    address?: string;
    postcode?: string;
  };
};

export type MyReferral = ReferralProfile & {
  emailDeliveryStatus: "pending" | "sent" | "failed";
  emailDeliveryAttempts: number;
  emailLastAttemptAt?: string;
};

export type PaginatedResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: { page: number; limit: number; total: number };
  data: T[];
};

export type ApiSuccess<T> = {
  statusCode: number;
  success: true;
  message: string;
  data: T;
};

export const getReferralApiUrl = () => {
  const apiUrl = (
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_BACKEND_API_URL
  )?.replace(/\/$/, "");
  if (!apiUrl) throw new Error("The referral service is not configured.");
  return apiUrl;
};

export const parseReferralResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json().catch(() => null)) as
    | (T & ApiErrorPayload)
    | null;
  if (!response.ok || !payload || payload.success === false) {
    throw new ReferralApiError(response.status, payload);
  }
  return payload;
};

export const authHeaders = (token?: string) => ({
  Accept: "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});
