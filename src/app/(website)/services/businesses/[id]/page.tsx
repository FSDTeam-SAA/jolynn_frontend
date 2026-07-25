import Image from "next/image";
import BusinessViewProfileContainer from "./_components/business-view-profile-container";

const BusinessViewProfile = ({ params }: { params: { id: string } }) => {
  return (
    <div>
      <Image
        src="/assets/images/business-profile-hero.png"
        alt="Professional local service providers"
        width={1983}
        height={793}
        priority
        className="h-[320px] w-full object-cover object-top md:h-[395px]"
      />
      <BusinessViewProfileContainer businessId={params.id} />
    </div>
  );
};

export default BusinessViewProfile;
