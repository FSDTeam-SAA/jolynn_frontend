import React from 'react'
import ServicesContainer from './_components/services-container'
import ServicesSearchContainer from './_components/services-search-container'

type ServicesPageProps = {
  searchParams?: {
    service?: string;
    location?: string;
  };
};

const ServicesPage = ({ searchParams }: ServicesPageProps) => {
  const hasSearch = Boolean(searchParams?.service || searchParams?.location);

  return (
    <div>
      {hasSearch ? (
        <ServicesSearchContainer
          initialService={searchParams?.service}
          initialLocation={searchParams?.location}
        />
      ) : (
        <ServicesContainer />
      )}
    </div>
  )
}

export default ServicesPage
