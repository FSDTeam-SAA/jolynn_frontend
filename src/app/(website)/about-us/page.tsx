import HeroSection from "@/components/common/hero-section";
import React from "react";
import OurMission from "./_components/our-mission";
import AdvertiseWithUs from "./_components/advertise-with-us";
import ValueAndCapabilities from "./_components/value-and-capabilities";
import Faq from "../_components/faq";

const AboutUsPage = () => {
  return (
    <div className="pb-4 md:pb-6">
      <HeroSection
        title="About Us"
        desc="SideQuote is a B2C platform designed to bridge the gap between skilled independent service providers and consumer needs. The platform serves as a comprehensive commercial ecosystem. It empowers micro-entrepreneurs while providing consumers with streamlined access to specialized local talent. "
        image="/assets/images/about_hero.jpg"
        compact
        imagePosition="center 30%"
      />
      <OurMission />
      <ValueAndCapabilities />
      <AdvertiseWithUs />
      <Faq/>
    </div>
  );
};

export default AboutUsPage;
