import React from "react";
import ReportContainer from "./_components/report-container";
import HeroSection from "@/components/common/hero-section";

type ReportPageProps = {
  searchParams?: { serviceId?: string };
};

const ReportPage = ({ searchParams }: ReportPageProps) => {
  return (
    <div>
      <HeroSection
        title="Report to Us"
        desc="Raise your concerns and report to us"
        image="/assets/images/report-hero.jpg"
      />
      <ReportContainer serviceId={searchParams?.serviceId ?? ""} />
    </div>
  )
};

export default ReportPage;
