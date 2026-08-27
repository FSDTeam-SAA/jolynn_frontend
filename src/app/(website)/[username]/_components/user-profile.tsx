"use client";

import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import BusinessViewProfileContainer from "../../services/businesses/[id]/_components/business-view-profile-container";
import {
  isValidPublicUsername,
  normalizePublicUsername,
} from "@/lib/public-username";

type PublicProfileResolverResponse = {
  success: boolean;
  message: string;
  data?: { profile?: { ownerId?: string } };
};

const resolvePublicProfile = async (
  username: string,
  serviceSlug?: string,
): Promise<PublicProfileResolverResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("The public profile service is not configured.");

  const query = new URLSearchParams();
  if (serviceSlug) query.set("serviceSlug", serviceSlug);

  const response = await fetch(
    `${apiUrl}/user/public/${encodeURIComponent(username)}${
      query.size ? `?${query}` : ""
    }`,
    { headers: { accept: "*/*" } },
  );
  const result = (await response.json()) as PublicProfileResolverResponse;

  if (!response.ok || !result.success || !result.data?.profile?.ownerId) {
    throw new Error(result.message || "Unable to load this public profile.");
  }

  return result;
};

const UserProfile = ({
  username,
  serviceSlug,
}: {
  username: string;
  serviceSlug?: string;
}) => {
  const canonicalUsername = normalizePublicUsername(username);
  const hasValidUsername = isValidPublicUsername(canonicalUsername);
  const profileQuery = useQuery({
    queryKey: ["public-profile-resolver", canonicalUsername, serviceSlug],
    queryFn: () => resolvePublicProfile(canonicalUsername, serviceSlug),
    enabled: hasValidUsername,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (!hasValidUsername) {
    return <ProfileError message="This public username is invalid." />;
  }

  if (profileQuery.isPending) {
    return (
      <div className="flex min-h-[520px] items-center justify-center bg-[#F5F8F7] text-sm font-medium text-[#667085]">
        Loading business profile...
      </div>
    );
  }

  const businessId = profileQuery.data?.data?.profile?.ownerId;
  if (profileQuery.isError || !businessId) {
    return (
      <ProfileError
        message={
          profileQuery.error instanceof Error
            ? profileQuery.error.message
            : "We couldn't find this public profile."
        }
        onRetry={() => profileQuery.refetch()}
      />
    );
  }

  const publicProfilePath = `/${encodeURIComponent(canonicalUsername)}${
    serviceSlug ? `?service=${encodeURIComponent(serviceSlug)}` : ""
  }`;

  return (
    <BusinessViewProfileContainer
      businessId={businessId}
      publicProfilePath={publicProfilePath}
    />
  );
};

const ProfileError = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) => (
  <main className="min-h-[560px] bg-[#F5F8F7] px-4 py-20">
    <div className="container flex min-h-[360px] max-w-[720px] flex-col items-center justify-center rounded-[12px] border border-red-200 bg-white px-6 text-center shadow-sm">
      <h1 className="text-2xl font-extrabold text-[#111827]">
        Profile unavailable
      </h1>
      <p className="mt-3 text-sm text-[#667085]">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-[6px] bg-[#292D73] px-6 text-sm font-bold text-white transition hover:bg-[#20255F]"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  </main>
);

export default UserProfile;
