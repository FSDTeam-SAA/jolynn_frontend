import UserProfile from "./_components/user-profile";
import { normalizePublicUsername } from "@/lib/public-username";

type UserProfilePageProps = {
  params: {
    username: string;
  };
  searchParams: {
    service?: string | string[];
  };
};

const UserProfilePage = ({ params, searchParams }: UserProfilePageProps) => {
  const serviceSlug = Array.isArray(searchParams.service)
    ? searchParams.service[0]
    : searchParams.service;

  return (
    <UserProfile
      username={normalizePublicUsername(params.username)}
      serviceSlug={serviceSlug}
    />
  );
};

export default UserProfilePage;
