import BusinessViewProfileContainer from './_components/business-view-profile-container'

const BusinessViewProfile = ({ params }: { params: { id: string } }) => {
  return (
    <div >
      <BusinessViewProfileContainer businessId={params.id} />
    </div>
  )
}

export default BusinessViewProfile
