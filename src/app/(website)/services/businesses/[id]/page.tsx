import Image from 'next/image'
import BusinessViewProfileContainer from './_components/business-view-profile-container'

const BusinessViewProfile = ({ params }: { params: { id: string } }) => {
  return (
    <div >
    <Image
  src="/assets/images/business_overview.jpg"
  alt="business overview"
  width={2000}
  height={240}
  className="w-full h-[320px] md:h-[395px] object-cover"
   style={{ filter: "blur(2px)" }}
/>
      <BusinessViewProfileContainer businessId={params.id} />
    </div>
  )
}

export default BusinessViewProfile
