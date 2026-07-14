import HeroSection from "@/components/common/hero-section";
import React from "react";
import OurMission from "./_components/our-mission";
import AdvertiseWithUs from "./_components/advertise-with-us";
import Faq from "../_components/faq";

const AboutUsPage = () => {
  return (
    <div className="pb-4 md:pb-6">
      <HeroSection
        title="About Us"
        desc="We make it easy to find trusted professionals for every home service need. Whether you need plumbing, electrical work, painting, roofing, HVAC, flooring, fencing, or kitchen services, we connect you with skilled, verified experts committed to quality workmanship and reliable service.

Our goal is to simplify home maintenance by providing a seamless experience from booking to project completion. With transparent pricing, dependable professionals, and a customer-first approach, we're here to help homeowners complete every job with confidence."
        image="/assets/images/about_hero.jpg"
      />
      <OurMission />
      <AdvertiseWithUs />
      <Faq/>
    </div>
  );
};

export default AboutUsPage;
