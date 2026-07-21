import UserProfile from "./_components/user-profile";

type UserProfilePageProps = {
  params: {
    username: string;
  };
};

const UserProfilePage = ({ params }: UserProfilePageProps) => {
  return (
    <UserProfile username={params.username} />
  );
};

export default UserProfilePage;
