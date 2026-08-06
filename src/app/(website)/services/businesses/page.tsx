import ServicesSearchContainer from "./_components/services-search-container";

type BusinessesPageProps = {
  searchParams?: {
    searchTerm?: string;
    state?: string;
    city?: string;
  };
};

const BusinessesPage = ({ searchParams }: BusinessesPageProps) => {
  return (
    <ServicesSearchContainer
      initialSearchTerm={searchParams?.searchTerm}
      initialState={searchParams?.state}
      initialCity={searchParams?.city}
    />
  );
};

export default BusinessesPage;
