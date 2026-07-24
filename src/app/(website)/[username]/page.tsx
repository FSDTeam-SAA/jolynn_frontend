import UserProfile from "./_components/user-profile";
import { normalizePublicUsername } from "@/lib/public-username";

type UserProfilePageProps = {
  params: {
    username: string;
  };
};

const UserProfilePage = ({ params }: UserProfilePageProps) => {
  return <UserProfile username={normalizePublicUsername(params.username)} />;
};

export default UserProfilePage;
