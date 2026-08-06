import React from 'react'
import ServicesContainer from './_components/services-container'
import ServicesSearchContainer from './businesses/_components/services-search-container'

type ServicesPageProps = {
  searchParams?: {
    searchTerm?: string;
    state?: string;
    city?: string;
  };
};

const ServicesPage = ({ searchParams }: ServicesPageProps) => {
  const hasSearch = Boolean(
    searchParams?.searchTerm || searchParams?.state || searchParams?.city,
  );

  return (
    <div>
      {hasSearch ? (
        <ServicesSearchContainer
          initialSearchTerm={searchParams?.searchTerm}
          initialState={searchParams?.state}
          initialCity={searchParams?.city}
        />
      ) : (
        <ServicesContainer />
      )}
    </div>
  )
}

export default ServicesPage
