import ServicesSearchContainer from "./_components/services-search-container";

type BusinessesPageProps = {
  searchParams?: {
    service?: string;
    location?: string;
  };
};

const BusinessesPage = ({ searchParams }: BusinessesPageProps) => {
  return (
    <ServicesSearchContainer
      initialService={searchParams?.service}
      initialLocation={searchParams?.location}
    />
  );
};

export default BusinessesPage;
