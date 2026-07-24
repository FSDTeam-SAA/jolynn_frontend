import ServicesSearchContainer from "./_components/services-search-container";

type BusinessesPageProps = {
  searchParams?: {
    service?: string;
    state?: string;
    city?: string;
  };
};

const BusinessesPage = ({ searchParams }: BusinessesPageProps) => {
  return (
    <ServicesSearchContainer
      initialService={searchParams?.service}
      initialState={searchParams?.state}
      initialCity={searchParams?.city}
    />
  );
};

export default BusinessesPage;
